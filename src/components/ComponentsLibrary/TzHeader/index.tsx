import React, { useMemo } from 'react';
import { Layout } from 'antd';
import { BasicProps } from 'antd/lib/layout/layout';
import './index.scss';
const { Header } = Layout;
export const TzHeader = (props: BasicProps & { type?: 'line' }) => {
  let { type, ...otherProps } = props;
  const realProps = useMemo(() => {
    return {
      ...otherProps,
      className: `tz-header ${props.className || ''} ${type === 'line' ? 'header-line' : ''}`,
    };
  }, [props]);
  return <Header {...realProps} />;
};
