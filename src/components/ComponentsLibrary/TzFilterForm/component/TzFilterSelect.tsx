import { LoadingOutlined } from '@ant-design/icons';
import { useUpdateEffect } from 'ahooks';
import { Empty } from 'antd';
import { DefaultOptionType } from 'antd/lib/select';
import classNames from 'classnames';
import { debounce, isArray, isFunction, last, upperCase } from 'lodash';
import React, { forwardRef, useCallback, useEffect, useRef, ReactNode, useMemo, useState } from 'react';
import { Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import NoData from '../../../noData/noData';
import { TzInput } from '../../../tz-input';
import { TzTooltip } from '../../../tz-tooltip';
import { TWids } from '../RederValueTxt';
import SelectTooltip from './SelectTooltip';
import TzSelect, { TzSelectProps } from '../../tzSelect';

export type TzFilterSelectProps = TzSelectProps & {
  wids?: TWids;
  name: string;
  enumLabels?: any;
  isFilter?: boolean;
  nodeRender?: (item: unknown) => unknown;
  tooltipOver?: HTMLDivElement | undefined;
  updateEnumLabels?: (arg: any) => void;
};
const TzFilterSelect = forwardRef((props: TzFilterSelectProps, ref?: any) => {
  const {
    nodeRender,
    filterSort,
    showSearch,
    onSearch,
    searchValue,
    filterOption,
    label,
    value,
    isFilter,
    wids,
    name,
    enumLabels,
    tooltipOver,
    updateEnumLabels,
    ...restProps
  } = props;
  const [searchTxt, setSearchTxt] = useState<string | undefined>(searchValue);
  const openRef = useRef<number>(0);

  const tooltipTit = useMemo(() => {
    let tit = '';
    const _val = isArray(value) ? value : [value];
    if (_val?.length > 1 || (wids?.[name] && wids?.[name] > 190)) {
      tit = enumLabels?.[name];
    }
    return tit;
  }, [value, name, wids, enumLabels]);

  const handleSearchChange = useCallback((e) => {
    const val = e.target.value;
    setSearchTxt(val);
    onSearch?.(val);
  }, []);

  useEffect(() => {
    $('.tz-filter-form-item-value .ant-select-selection-item').attr('title', '');
  }, [props.value]);

  const mergeProps = useMemo(
    () => ({
      showSearch: false,
      ...restProps,
      value,
      searchValue: searchTxt,
      title: '',
      isSelection: false,
      onChange: (v: any, arg: DefaultOptionType | DefaultOptionType[]) => {
        const _valStr = isArray(arg) ? arg : [arg];
        const _val = isArray(v) ? v : [v];
        arg &&
          updateEnumLabels?.({
            [name]: _valStr?.map((i: any, idx) => i[restProps?.optionLabelProp ?? 'label'] || _val[idx]).join(' , '),
          });

        restProps?.onChange?.(v, arg);
      },
      tagRender: (selectProps: any) => {
        const { mode, maxTagCount = 0 } = restProps;
        let isLast = false;
        if (mode && ['tag', 'multiple'].includes(mode)) {
          const _value = value || [];
          const _maxTagCount: number = maxTagCount || _value.length;
          isLast = _value.length > _maxTagCount ? false : last(_value) === selectProps.value;
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
      },
      onDropdownVisibleChange: (open: boolean) => {
        openRef.current = +new Date();
        if (!open) {
          setSearchTxt(undefined);
        }
        restProps.onDropdownVisibleChange?.(open);
      },
      dropdownRender: (n: ReactNode) => (
        <div key={openRef.current} className="tz-filter-select-panel">
          <TzInput
            className="tz-filter-search-title"
            value={searchTxt}
            onInput={handleSearchChange}
            placeholder={label}
            onKeyDown={(e) => {
              e.stopPropagation();
            }}
          />
          {n}
        </div>
      ),
    }),
    [restProps, searchTxt, handleSearchChange],
  );

  return (
    <SelectTooltip title={tooltipTit}>
      <TzSelect {...mergeProps} />
    </SelectTooltip>
  );
});

export default TzFilterSelect;
