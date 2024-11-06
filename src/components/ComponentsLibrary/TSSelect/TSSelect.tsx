import React, { useState, useEffect } from 'react';
import './TSSelect.scss';
import { Select } from 'antd';
const { Option } = Select;

interface SelectProps {
  type?: string;
  value?: string | number;
  placeholder?: string;
  label?: string;
  onChange?: onChange;
  size?: SizeType;
  options: OptionsItem[];
}
export declare type SizeType = 'small' | 'middle' | 'large' | undefined;
interface OptionsItem {
  value: any;
  label: string;
}
interface onChange {
  (msg: string): void;
}
const TSSelect = (props: SelectProps) => {
  const {
    value = props.options[0].value,
    label,
    onChange,
    size = 'middle',
  } = props;
  const [options, setOptions] = useState(props.options);
  useEffect(() => {
    setOptions(props.options);
  }, [props.options]);
  const change = (val: any) => {
    (onChange as any)(val);
  };
  return (
    <div className="ts-select">
      {label ? (
        <span className="titles tit-left">{label}:&nbsp;&nbsp;</span>
      ) : null}
      <Select defaultValue={value} size={size} onChange={change}>
        {options.map((item) => (
          <Option value={item.value} key={item.value}>
            {item.label}
          </Option>
        ))}
      </Select>
    </div>
  );
};
export default TSSelect;
