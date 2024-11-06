import React, { useMemo } from 'react';
import { Layout, SiderProps } from 'antd';
import './index.scss';
const { Sider} = Layout;
export const TzSider = (props: SiderProps) => {
  const realProps = useMemo(() => {
    return {
      ...props,
      theme:props.theme||'light',
      className: `tz-sider ${props.className||''}`,
    };
  }, [props]);
  return <Sider {...realProps} />;
};
