import React, { forwardRef, Ref, useCallback, useEffect, useMemo, useState, useRef } from 'react';
import './index.less';
import NoData from '../noData/noData';
import EllipsisPopover from '../ellipsisPopover/ellipsisPopover';
import Select, { DefaultOptionType, OptionProps, SelectProps } from 'antd/lib/select';
import { hasIn, isArray, isNil, merge, sortBy } from 'lodash';
import classNames from 'classnames';
import { useUpdateEffect } from 'ahooks';

export interface TzSelectProps extends SelectProps<any> {
  label?: string;
  groupClass?: string;
  // 下拉列表通过选中值排序，默认为true
  isNeedSort?: boolean;
  // 是否是selection展示形式，默认true
  isSelection?: boolean;
}
let { Option } = Select;

const sortOptions = (
  data: TzSelectProps['options'],
  value: TzSelectProps['value'],
  fieldNames?: TzSelectProps['fieldNames'],
) => sortBy(data, (v) => !(value?.indexOf(v[fieldNames?.value || 'value']) > -1));
export const TzSelect = forwardRef((props: TzSelectProps, ref?: any) => {
  const {
    value: valueProps,
    defaultValue,
    label,
    getPopupContainer,
    placeholder,
    popupClassName,
    suffixIcon,
    className,
    onDropdownVisibleChange,
    fieldNames,
    options: optionsProps,
    open: openProps,
    mode,
    children,
    isNeedSort = true,
    isSelection = true,
    disabled,
    ...otherProps
  } = props;
  let [open, setOpen] = useState(openProps);
  let [value, setValue] = useState<any>(valueProps || defaultValue);
  const [options, setOptions] = useState(optionsProps);
  const isFirst = useRef<boolean>();

  const mergeOpen = openProps || open;

  useUpdateEffect(() => {
    isFirst.current = false;
  }, [optionsProps]);

  useEffect(() => {
    if (!isNeedSort) {
      setOptions(optionsProps);
      return;
    }
    if (!isFirst.current) {
      isFirst.current = true;
      const _val = isArray(value) ? value : [value];
      setOptions(sortOptions(optionsProps, _val, fieldNames));
    }
    !open && (isFirst.current = false);
  }, [value, optionsProps, open]);
  const groupClasses = useMemo(() => {
    const selectionClass = props.groupClass;
    delete props.groupClass;
    return selectionClass || '';
  }, [props.groupClass]);

  useUpdateEffect(() => {
    setValue(valueProps);
  }, [valueProps]);

  const tagRender = (props: any) => {
    return (
      <span className={'ant-select-selection-item tz-select-selection-item'}>
        <span style={{ maxWidth: 'calc(100% - 22px)' }}>
          <EllipsisPopover lineClamp={1} style={{ float: 'left' }}>
            {props.label}
          </EllipsisPopover>
        </span>
        {disabled ? null : (
          <i className={'icon iconfont icon-lansexiaocuohao f16 ml6'} onClick={(e) => props.onClose?.(e)}></i>
        )}
      </span>
    );
  };
  const realProps = useMemo(
    (): TzSelectProps => ({
      ...props,
      open: mergeOpen,
      ...(children ? {} : { options }),
      label,
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
      suffixIcon: suffixIcon || <i className={`icon iconfont icon-arrow f16 ${mergeOpen ? 'rotate180' : ''}`}></i>,
      popupClassName: classNames('tz-select-dropdown', popupClassName),
      className: classNames('tz-select', className),
      onDropdownVisibleChange: (open: any) => {
        !hasIn(props, 'open') && setOpen(open);
        onDropdownVisibleChange?.(open);
      },
      onChange: (val, option) => {
        setValue(val);
        props.onChange?.(val, option);
      },
    }),
    [props, mergeOpen, options, mode],
  );

  let newRealProps = useMemo(() => {
    let { isSelection, isNeedSort, ...otherRealProps } = realProps;
    return otherRealProps;
  }, [realProps]);
  return isSelection ? (
    <span
      className={classNames('tz-selection', groupClasses, {
        'select-dropdown-open': mergeOpen || (isArray(value) ? value?.length : !isNil(value)),
      })}
      style={realProps.style}
    >
      <Select
        showArrow
        allowClear
        tagRender={tagRender}
        notFoundContent={<NoData small={true} />}
        {...newRealProps}
        style={{ width: '100%' }}
        value={value}
        ref={ref}
      />
      {label && <p className={'ant-select-selection-placeholder selection-placeholder-color'}>{realProps.label}</p>}
    </span>
  ) : (
    <Select allowClear notFoundContent={<NoData small={true} />} {...(newRealProps as any)} value={value} ref={ref} />
  );
});
export const TzOption = (props: OptionProps) => {
  const realProps = useMemo(() => {
    return {
      ...props,
      className: `tz-option flex-r-c ${props.className || ''}`,
    };
  }, [props]);
  return <Option {...realProps} />;
};

export type TzSelectNormalProps = SelectProps & {
  options?: DefaultOptionType[];
};

export const TzSelectNormal = (props: TzSelectNormalProps) => {
  const { options, ...selectProps } = props;
  const _options = useMemo(() => {
    return options?.map((item) => {
      let { children, label, value, ...otherItem } = item;
      return (
        <Option {...otherItem} key={value} label={label} value={value}>
          {children || label || value}
        </Option>
      );
    });
  }, [options]);
  return (
    <TzSelect optionLabelProp="label" {...selectProps}>
      {_options}
    </TzSelect>
  );
};
type TzPrefixSelectNormalProps = SelectProps & {
  options?: DefaultOptionType[];
  prefix: React.ReactNode;
  style?: React.CSSProperties;
};

export const TzPrefixSelectNormal = (props: TzPrefixSelectNormalProps) => {
  const { options, prefix, style, ...selectProps } = props;
  const _options = useMemo(() => {
    return options?.map((item, index) => {
      return (
        <Option key={`${item.value}_${index}`} {...item}>
          {item.label || item.children || item.value}
        </Option>
      );
    });
  }, [options]);
  return (
    <div
      className={'tz-prefix-select flex-r-c'}
      style={merge(style, {
        minWidth: '200px',
        maxWidth: '420px',
        border: '1px solid #E7E9ED',
        borderRadius: '8px',
        paddingLeft: '12px',
      })}
    >
      <span>{prefix}</span>
      <span style={{ width: '0', flex: 1 }}>
        <TzSelect {...selectProps} bordered={false} style={{ paddingLeft: '0' }}>
          {_options}
        </TzSelect>
      </span>
    </div>
  );
};
