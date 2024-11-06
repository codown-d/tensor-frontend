import React, { forwardRef, useMemo, useState, useCallback, ReactNode } from 'react';
import './index.less';
import { BaseOptionType, DefaultOptionType, SelectProps } from 'antd/lib/select';
import { curry, get, hasIn, isArray, isFunction, toUpper, uniq } from 'lodash';
import classNames from 'classnames';
import { useMemoizedFn, useUpdateEffect } from 'ahooks';
import Highlighter from 'react-highlight-words';
import { TzCheckbox } from '../../tz-checkbox';
import useOptionsSortByValue from './useOptionsSortByValue';
import TzSelectBase, { TzSelectBaseProps } from './TzSelectBase';
import usePropsAttr from './usePropsAttr';

export type TzSelectCommonProps = TzSelectBaseProps & {
  options: TzSelectBaseProps['options'];
  label?: string;
  groupClass?: string;
  // 下拉列表通过选中值排序，默认为true
  isNeedSort?: boolean;
  // 下拉列表用checkbox展示，mode为multiple|tag时生效
  itemRenderWithCheckbox?: boolean;
  labelFormat?: (node: ReactNode, row: any) => void;
};

const fieldName2Val = (
  data: TzSelectCommonProps['options'],
  fieldNames: SelectProps['fieldNames'],
  field: string,
) => get(data, get(fieldNames, field) ?? field);
const curryFieldName2Val = curry(fieldName2Val) as any;
/**
 * 扩展功能： 按值排序、下拉列表用checkbox展示
 */
const TzSelectCommon = forwardRef((props: TzSelectCommonProps, ref?: any) => {
  const { label, groupClass, isNeedSort = true, itemRenderWithCheckbox, ...rest } = props;
  const {
    getPopupContainer,
    placeholder,
    popupClassName,
    suffixIcon,
    className,
    onDropdownVisibleChange,
    fieldNames,
    open: openProps,
    mode,
    onChange,
    searchValue: propsSearchValue,
    onSearch,
    value: valueProps,
    defaultValue,
    filterOption,
    labelFormat,
  } = rest;

  const [open, setOpen] = useState(openProps);
  const [searchValue, setSearchValue] = useState<string | undefined>(propsSearchValue);
  const [value, setValue] = usePropsAttr<string[] | string>(
    props,
    'value',
    valueProps || defaultValue,
  );

  useUpdateEffect(() => {
    setSearchValue(propsSearchValue);
  }, [propsSearchValue]);

  useUpdateEffect(() => {
    setOpen(openProps);
  }, [openProps]);

  const options = useOptionsSortByValue({ ...props, open, value, isNeedSort });

  const triggerSearchValue = (val?: string) => !hasIn(props, 'searchValue') && setSearchValue(val);

  const triggerOpen = (val?: boolean) => !hasIn(props, 'open') && setOpen(val);

  const showCheckbox = mode && ['multiple', 'tags'].includes(mode) && itemRenderWithCheckbox;

  const realProps = useMemo((): TzSelectCommonProps => {
    const _props = {
      showSearch: true,
      ...rest,
      onChange: (val: any, opt: DefaultOptionType | DefaultOptionType[]) => {
        const _opt = isArray(opt) ? opt : opt ? [opt] : opt;
        const transOpt = _opt?.map((v: any) => {
          const { originLabel, label, ...rest } = v;
          return originLabel ? { ...rest, label: originLabel } : v;
        });
        onChange?.(val, isArray(opt) ? transOpt : transOpt?.[0]);
        setValue(val);
      },
      searchValue,
      onSearch: (val: string) => {
        triggerSearchValue(val);
        onSearch?.(val);
      },
      open,
      options,
      placeholder: label ? '' : placeholder,
      getPopupContainer: (triggerNode: any) => {
        if (getPopupContainer) {
          return getPopupContainer(triggerNode);
        }
        if ($(triggerNode).parents('.ant-drawer-content').length) {
          return $(triggerNode).parents('.ant-drawer-content')[0];
        } else {
          return document.getElementById('layoutMainContent');
        }
      },
      suffixIcon: suffixIcon || (
        <i className={`icon iconfont icon-arrow f16 ${open ? 'rotate180' : ''}`}></i>
      ),
      popupClassName: classNames('tz-common-select-dropdown', popupClassName, {
        'tz-select-has-checkbox-dropdown': showCheckbox,
      }),
      className: classNames('tz-common-select', className),
      onDropdownVisibleChange: (open: any) => {
        triggerOpen(open);
        !open && triggerSearchValue(undefined);
        onDropdownVisibleChange?.(open);
      },
    };
    // if (!showCheckbox) {
    //   return _props;
    // }
    const _transOptions = options?.map((item) => {
      const curryItem = curryFieldName2Val(item, fieldNames);
      const _value = curryItem('value');
      const label = curryItem('label');
      const _options = curryItem('options');
      const { disabled } = item;
      return {
        ...item,
        value: _value,
        originLabel: label,
        label: (
          <div
            className={classNames({
              'item-renderer-hascheckbox': showCheckbox,
              disabled,
            })}
          >
            {showCheckbox && (
              <TzCheckbox
                className="mr8"
                onChange={(e) => {
                  const vals = e.target.checked
                    ? uniq([...((value as string[]) || []), _value])
                    : (value as string[])?.filter((v: string) => v !== _value);
                  trigger(vals);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                }}
                checked={disabled ? false : !!value?.includes?.(_value)}
                disabled={disabled}
              />
            )}
            <span>
              {labelFormat ? (
                labelFormat(
                  <Highlighter
                    className="highlighter-select-item-option-content"
                    searchWords={searchValue ? [searchValue] : []}
                    autoEscape={true}
                    textToHighlight={label}
                  />,
                  item,
                )
              ) : (
                <Highlighter
                  className="highlighter-select-item-option-content"
                  searchWords={searchValue ? [searchValue] : []}
                  autoEscape={true}
                  textToHighlight={label}
                />
              )}
            </span>
          </div>
        ),
        ...(_options ? { options: _options } : {}),
      };
    });
    return {
      ..._props,
      options: _transOptions,
      fieldNames: undefined,
      optionLabelProp: 'originLabel',
      // 高亮，添加了默认属性‘originLabel’
      filterOption: (v, opt) => {
        if (isFunction(filterOption)) {
          return filterOption(v, opt);
        } else {
          return toUpper(opt?.originLabel as string).includes(toUpper(v));
        }
      },
    };
  }, [rest, open, JSON.stringify(options), searchValue, showCheckbox, setValue, value]);

  const trigger = useMemoizedFn((val) => {
    const opts = realProps.options
      ?.filter((v) => val.includes(v.value))
      .map((v) => {
        const { originLabel, label, ...rest } = v;
        return originLabel ? { ...rest, label: originLabel } : v;
      }) as DefaultOptionType | DefaultOptionType[];
    onChange?.(val, opts);
    setValue(val);
  });

  return <TzSelectBase {...(realProps as TzSelectBaseProps)} value={value} ref={ref} />;
});
export default TzSelectCommon;
