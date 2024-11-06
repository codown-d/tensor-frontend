import React, { useMemo } from 'react';
import './index.scss';
import Password, { PasswordProps } from 'antd/lib/input/Password';

export const TzInputPassword = (props: PasswordProps) => {
  const realProps = useMemo(() => {
    return {
      ...props,
      className: `tz-input-password ${props.className || ''}`,
    };
  }, [props]);
  return <Password {...realProps} />;
};
