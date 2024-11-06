import TreeSelect, { TreeSelectProps } from 'antd/lib/tree-select';
import React, { useMemo, useState, useCallback, useEffect } from 'react';
import EllipsisPopover from '../../ellipsisPopover/ellipsisPopover';
import './index.scss';
export interface TzTreeSelectProps extends TreeSelectProps {
  label?: string;
  options?: any[];
}
const TzTreeSelect = (props: TzTreeSelectProps) => {
  const { options, ...otherProps } = props;
  let [dropdownVisible, setDropdownVisible] = useState(false);
  let [onFocus, setOnFocus] = useState(false);
  let [value, setValue] = useState<any>(props.value || props.defaultValue);
  const realProps = useMemo(() => {
    return {
      ...otherProps,
      getPopupContainer: () => document.getElementById('layoutMainContent')||document.body,
    };
  }, [otherProps]);
  let getDropdownVisibleFalse = useCallback(() => {
    if ((typeof value === 'undefined' || value['length'] === 0 || value === '') && !onFocus) {
      setDropdownVisible(false);
    } else {
      setDropdownVisible(true);
    }
  }, [value, onFocus]);
  useEffect(() => {
    getDropdownVisibleFalse();
  }, [getDropdownVisibleFalse]);
  useEffect(() => {
    setValue(props.value)
  }, [props.value]);
  let tagRender = (props: any) => {
    return (
      <span className={'ant-select-selection-item tz-select-selection-item'}>
        <span className={'w100p'}>
          <EllipsisPopover lineClamp={1}>{props.label}</EllipsisPopover>
        </span>
        <i className={'icon iconfont icon-lansexiaocuohao f16 ml6'} onClick={props.onClose}></i>
      </span>
    );
  };
  return <span className={`tz-selection ${dropdownVisible ? 'select-dropdown-open' : 'select-dropdown-close'}`}
    style={realProps.style}
  >
    <TreeSelect
      {...realProps}
      tagRender={tagRender}
      style={{width:'100%'}}
      value={value}
      onFocus={() => setOnFocus(true)}
      onBlur={() => setOnFocus(false)}
      onChange={(value, label, extra) => {
        setValue(value)
        !realProps?.onChange || realProps.onChange(value, label, extra);
      }}
    />
    {props.label && (
      <p className={'ant-select-selection-placeholder selection-placeholder-color'}>
        {realProps.label}
      </p>
    )}
  </span>;
};
export default TzTreeSelect;
