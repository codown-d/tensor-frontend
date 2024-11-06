import Switch, { SwitchProps } from 'antd/lib/switch';
import React, { useMemo } from 'react';
import './index.scss';

export const TzSwitch = (props: SwitchProps) => {
  const realProps = useMemo(() => {
    let s = props?.unCheckedChildren || props?.checkedChildren ? '' : '';
    return {
      ...props,
      className: `tz-switch ${props.className || ''} ${s}`,
    };
  }, [props]);
  return <Switch {...realProps} />;
};
