import Input from 'antd/lib/input';
import { TextAreaProps } from 'antd/lib/input/TextArea';
import React, { useMemo } from 'react';

import './index.scss';

const { TextArea } = Input;

export const TzInputTextArea = (props: TextAreaProps) => {
  const realProps = useMemo(() => {
    return {
      ...props,
      className: `tz-input-textarea ${props.className || ''}`,
    };
  }, [props]);
  return <TextArea {...realProps} />;
};
