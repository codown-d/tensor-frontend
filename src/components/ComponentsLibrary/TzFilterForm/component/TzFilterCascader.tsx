import { useCreation, useMemoizedFn } from 'ahooks';
import { DefaultOptionType } from 'antd/lib/cascader';
import classNames from 'classnames';
import { first, isArray, isBoolean } from 'lodash';
import React, { forwardRef, useCallback, useEffect, useRef , ReactNode, useMemo, useState } from 'react';
import { TzInput } from '../../../tz-input';
import { TzTooltip } from '../../../tz-tooltip';
import TzCascader from '../../TzCascader';
import { SingleValueType, TreeNode, TzCascaderProps } from '../../TzCascader/interface';
import { TWids } from '../RederValueTxt';
import SelectTooltip from './SelectTooltip';

export type TzFilterCascaderProps = TzCascaderProps & {
  label?: string;
  wids?: TWids;
  name: string;
  enumLabels?: any;
  tooltipOver?: HTMLDivElement | undefined;
  isFilter?: boolean;
  updateEnumLabels?: (arg: any) => void;
};

const TzFilterCascader = forwardRef((props: TzFilterCascaderProps, ref) => {
  const {
    onSearch,
    searchValue,
    options,
    label,
    query,
    showSearch,
    value,
    wids,
    name,
    enumLabels,
    tooltipOver,
    isFilter,
    updateEnumLabels,
    ...restProps
  } = props;
  const [searchTxt, setSearchTxt] = useState<string | undefined>(searchValue);
  const [open, setOpen] = useState<boolean>();
  const itemIsFocused = useRef<boolean>();
  const [tooltipShow, setTooltipShow] = useState<boolean>();

  const handleSearchChange = useCallback((e) => {
    const val = e.target.value;
    setSearchTxt(val);
    onSearch?.(val);
  }, []);
  const tagRender = useMemoizedFn((selectProps: any) => {
    const { multiple, maxTagCount = 0 } = restProps;
    let isLast = false;
    if (multiple) {
      const _value = value || [];
      const firstVal = first(_value as SingleValueType[]);

      isLast =
        _value.length > maxTagCount
          ? false
          : firstVal?.length
          ? firstVal.join('__RC_CASCADER_SPLIT__') === selectProps.value
          : true;
    } else {
      isLast = true;
    }
    return (
      <span className={'ant-select-selection-item tz-select-selection-item'}>
        <span
          className={classNames('w100p tz-select-selection-txt', {
            'tz-select-selection-txt-has-split': !isLast,
          })}
        >
          {selectProps.label}
          {!isLast && <i className="tz-select-multi-split">,</i>}
        </span>
      </span>
    );
  });

  const showSearchC = useCreation(
    () =>
      isBoolean(showSearch)
        ? showSearch
        : {
            limit: 10000,
            filter: (inputValue: string, path: DefaultOptionType[]) =>
              path.some(
                (option) =>
                  (option.label as string).toLowerCase().indexOf(inputValue.toLowerCase()) > -1,
              ),
            ...(showSearch || {}),
          },
    [showSearch],
  );

  const dropdownRender = useMemoizedFn((n: ReactNode) => (
    <div>
      <TzInput
        readOnly={!!query}
        className="tz-filter-search-title"
        value={searchTxt}
        onChange={handleSearchChange}
        placeholder={label}
      />
      {n}
    </div>
  ));
  useEffect(() => {
    return () => {
      !open && setSearchTxt(undefined);
    };
  }, [open]);

  const onDropdownVisibleChange = useMemoizedFn((e: boolean) => {
    setOpen(e);
    itemIsFocused.current = e;
    e && setTooltipShow(false);
    restProps.onDropdownVisibleChange?.(e);
  });

  const tooltipTit = useMemo(() => {
    let tit = '';
    const _val = isArray(value) ? value : [value];
    if (_val?.length > 1 || (wids?.[name] && wids?.[name] > 190)) {
      tit = enumLabels?.[name];
    }
    return tit;
  }, [value, name, wids, enumLabels]);

  const mergeProps = useMemo(
    () => ({
      ...restProps,
      displayRender: (label: any) => label.join(' / '),
      value,
      ref,
      searchValue: searchTxt,
      options,
      tagRender,
      showSearch: showSearchC,
      onDropdownVisibleChange,
      dropdownRender,
      onChange: (v: any, arg: any) => {
        let opts: [][] | undefined;
        if (!restProps.multiple) {
          opts = arg?.length ? [arg] : undefined;
        } else {
          opts = arg;
        }
        opts?.length &&
          updateEnumLabels?.({
            [name]: opts
              ?.map((opt: any) => opt?.map((v: TreeNode) => v?.label)?.join(' / '))
              .join(' , '),
          });
        restProps?.onChange?.(v, arg);
      },
    }),
    [restProps, searchTxt, options, handleSearchChange, showSearch, value],
  );

  return (
    <SelectTooltip
      title={tooltipTit}
      style={{
        display: 'initial',
      }}
    >
      <TzCascader {...mergeProps} />
    </SelectTooltip>
  );
});

export default TzFilterCascader;
