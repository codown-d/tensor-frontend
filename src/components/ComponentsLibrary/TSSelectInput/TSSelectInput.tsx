import { Input, Select } from 'antd';
import React, { useState } from 'react';
import './TSSelectInput.scss';

const { Option } = Select;

interface SelectInputProps {
  option: {
    value: string;
    label: string;
    disabled?: boolean;
  }[];
  defaultValue?: string;
  onChange: onChange;
  placeholder?: string;
}

interface onChange {
  (msg: any): void;
}

const TSSelectInput = (props: SelectInputProps) => {
  const { defaultValue = '', option, placeholder } = props;
  const defaultSelectValue = option.filter((item) => !item.disabled)[0].value;
  // eslint-disable-next-line
  const [senData, setSenData] = useState({
    select: defaultSelectValue,
    input: defaultValue,
  });
  const change = (e: any, t: string) => {
    setSenData((pre) => {
      let d: any;
      if (t === 'select') {
        d = Object.assign({}, pre, { select: e });
      } else {
        const text = e ? e.target.value : '';
        d = Object.assign({}, pre, { input: text });
      }
      props.onChange(d);
      return d;
    });
  };
  return (
    <div className="ts-select-input">
      <Input.Group compact>
        <Select
          defaultValue={defaultSelectValue}
          className={'ts-select-label'}
          placeholder={placeholder}
          onChange={(e) => change(e, 'select')}
        >
          {option.map((item) => {
            return (
              <Option
                value={item.value}
                key={item.value}
                disabled={item.disabled}
              >
                {item.label}
              </Option>
            );
          })}
        </Select>
        <Input
          defaultValue={defaultValue}
          className={'inner-input'}
          onChange={(e) => {
            e.persist();
            change(e, 'input');
          }}
        />
      </Input.Group>
    </div>
  );
};
export default TSSelectInput;
