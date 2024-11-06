import React from 'react';
import { Input } from 'antd';
import './TSInput.scss';

interface InputProps {
  placeholder?: string;
  onChange?: onChange;
  className?: string;
  defaultValue?: string;
}
interface onChange {
  (v: any): void;
}
const TSInput = (props: InputProps) => {
  return (
    <div className="ts-input">
      <Input {...props} />
    </div>
  );
};
export default TSInput;
