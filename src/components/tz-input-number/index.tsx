import React, { useMemo } from 'react';
import './index.scss'
import { InputNumber, InputNumberProps } from 'antd';
export const TzInputNumber = (props: InputNumberProps) => {
  const realProps = useMemo(() => {
    return {
      ...props,
      className: `tz-input-number ${props.className || ''}`,
    };
  }, [props]);
  return <InputNumber {...realProps} />;
};
