import Divider, { DividerProps } from 'antd/lib/divider';
import React, { useMemo } from 'react';
import './index.scss';
interface TzDividerProps extends DividerProps {
  children?: any;
}

const TzDivider = (props: TzDividerProps) => {
  const { children, ...otherProps } = props;
  const realProps = useMemo(() => {
    return {
      ...otherProps,
    };
  }, [otherProps]);
  return <Divider {...realProps}> {children}</Divider>;
};
export default TzDivider;
