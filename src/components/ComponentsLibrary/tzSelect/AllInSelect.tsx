import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './index.less';
import { DefaultOptionType } from 'antd/lib/select';
import { get, toUpper } from 'lodash';
import { TzCheckbox } from '../../tz-checkbox';
import TzSelectCommon, { TzSelectCommonProps } from './TzSelectCommon';
import classNames from 'classnames';
import usePropsAttr from './usePropsAttr';
import { translations } from '../../../translations/translations';

export type AllInSelectProps = TzSelectCommonProps & {};

/**
 * 全选： 下拉列表用checkbox展示，不可手动更改
 */
const AllInSelect = forwardRef((props: AllInSelectProps, ref?: any) => {
  const {
    filterOption: propsFilterOption,
    fieldNames,
    options: optionsProps,
    onChange,
    onSearch,
    onBlur,
    popupClassName,
    value: valueProps,
    defaultValue,
    onDropdownVisibleChange,
    dropdownRender,
  } = props;
  const [searchValue, setSearchValue] = usePropsAttr<string | undefined>(props, 'searchValue');
  const [status, setStatus] = useState<number>();
  const [value, setValue] = usePropsAttr<string | string[]>(
    props,
    'value',
    valueProps || defaultValue,
  );
  const openRef = useRef<boolean>(false);

  const filterOption = useMemo(() => {
    if (typeof propsFilterOption === 'function') {
      return searchValue
        ? optionsProps?.filter((v) => propsFilterOption(searchValue, v))
        : optionsProps;
    } else {
      return optionsProps?.filter((v) =>
        toUpper(v[fieldNames?.label ?? 'label']).includes(toUpper(searchValue)),
      );
    }
  }, [searchValue, propsFilterOption, JSON.stringify(optionsProps)]);

  const handleAll = useCallback(
    (status) => {
      const val = optionsProps
        ?.filter((v) => !v.disabled)
        .filter((v) => {
          const _val = get(v, fieldNames?.value ?? 'value');
          const resInFilter = filterOption?.some(
            (x) => get(x, fieldNames?.value ?? 'value') === _val,
          );
          const resInValue = value?.includes(_val);
          if (status) {
            return resInFilter || resInValue;
          }
          return !resInFilter && resInValue;
        })
        .map((v) => get(v, fieldNames?.value ?? 'value'));

      const opts = optionsProps
        ?.map((v) => (val?.includes(v.value) ? v : undefined))
        .filter((v) => !!v) as DefaultOptionType | DefaultOptionType[];

      onChange?.(val, opts);
      setValue(val);
    },
    [optionsProps, value, filterOption, fieldNames, setValue],
  );

  useEffect(() => {
    if (!value?.length) {
      setStatus(0);
      return;
    }
    const validateOpt = filterOption?.filter((v) => !v.disabled);
    const inValueLen = validateOpt?.filter((v) =>
      value.includes(get(v, fieldNames?.value ?? 'value')),
    )?.length;
    if (!inValueLen) {
      setStatus(0);
      return;
    }
    if (inValueLen === validateOpt?.length) {
      setStatus(1);
      return;
    }
    setStatus(-1);
  }, [value, filterOption]);

  const realProps = useMemo(
    (): TzSelectCommonProps => ({
      showSearch: true,
      isSelection: false,
      ...props,
      onDropdownVisibleChange: (open) => {
        openRef.current = open;
        !open && setSearchValue(undefined);
        onDropdownVisibleChange?.(open);
      },
      itemRenderWithCheckbox: true,
      value,
      popupClassName: classNames('tz-has-all-select-dropdown', popupClassName),
      autoClearSearchValue: false,
      onSearch: (val: string) => {
        setSearchValue(val);
        onSearch?.(val);
      },
      searchValue,
      onChange: (val, opt) => {
        onChange?.(val, opt);
        setValue(val);
      },
      dropdownRender: (originNode) => {
        const newNode = (
          <div key={+openRef.current}>
            {filterOption?.length ? (
              <div
                className="tz-has-all-select"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={(e) => handleAll(status === 1 ? 0 : 1)}
              >
                <TzCheckbox
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  indeterminate={status === -1}
                  onChange={(e) => handleAll(status === 1 ? 0 : 1)}
                  checked={status === 1}
                />
                <span>{translations.scanner_images_all}</span>
              </div>
            ) : null}
            {originNode}
          </div>
        );
        return dropdownRender ? dropdownRender(newNode) : newNode;
      },
    }),
    [props, status, searchValue, value, handleAll, JSON.stringify(filterOption)],
  );

  return <TzSelectCommon {...(realProps as TzSelectCommonProps)} ref={ref} />;
});
export default AllInSelect;
