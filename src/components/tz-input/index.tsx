import Input, { InputProps, InputRef } from 'antd/lib/input';
import Group from 'antd/lib/input/Group';
import React, { forwardRef, useEffect, useMemo, useState } from 'react';
import './index.scss';
import classNames from 'classnames';

export type TzInputProps = InputProps & {
  label?: string;
  groupClass?: string;
  stopEvent?: boolean;
  // 是否是selection展示形式，默认true
  isSelection?: boolean;
};

type TzCompoundedComponent = React.ForwardRefExoticComponent<TzInputProps & React.RefAttributes<InputRef>> & {
  Group: typeof Group;
};

export const TzInput = forwardRef<InputRef, TzInputProps>((props, ref) => {
  const { isSelection = true, className, ...restProps } = props;
  let [visible, setVisible] = useState(false);
  let [value, setValue] = useState<any>();
  let dropdownClass = useMemo(() => {
    let str = 'select-dropdown-close';
    if (visible || (value && value['length'])) {
      str = 'select-dropdown-open';
    }
    return str;
  }, [props, visible, value]);

  const groupClasses = useMemo(() => {
    const selectionClass = props.groupClass;
    delete props.groupClass;
    return selectionClass || '';
  }, [props.groupClass]);

  const realProps = useMemo(() => {
    return {
      ...props,
      autoComplete: 'off',
      label: props.label,
      placeholder: props.label ? '' : props.placeholder,
      //   allowClear: typeof props.allowClear == 'boolean' ? props.allowClear : true,
    };
  }, [props, value, className]);

  useEffect(() => {
    setValue(props.value || props.defaultValue);
  }, [props.value]);

  const [en, lv] = useMemo(() => {
    return [props?.onMouseEnter, props?.onMouseLeave];
  }, [realProps]);

  if (!isSelection) {
    return <Input {...restProps} ref={ref} className={classNames('tz-input', className)} />;
  }

  return (
    <span
      className={`tz-selection ${dropdownClass} ${groupClasses} ${realProps.className}`}
      onClick={(e) => {
        props.stopEvent && e.stopPropagation();
      }}
      style={realProps.style}
      onMouseEnter={en}
      onMouseLeave={lv}
    >
      <Input
        {...realProps}
        className={'tz-input'}
        style={{ width: '100%' }}
        ref={ref}
        onFocus={(val) => {
          setVisible(true);
          !realProps.onFocus || realProps.onFocus(val);
        }}
        onBlur={(val) => {
          setVisible(false);
          !realProps.onBlur || realProps.onBlur(val);
        }}
        onChange={(e) => {
          setValue(e.target.value);
          !realProps.onChange || realProps.onChange(e);
        }}
      />
      {realProps.label && (
        <p className={'ant-select-selection-placeholder selection-placeholder-color'}>{realProps.label}</p>
      )}
    </span>
  );
}) as TzCompoundedComponent;

TzInput.Group = Group;
