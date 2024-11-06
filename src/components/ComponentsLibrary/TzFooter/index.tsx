import React, { useMemo } from 'react';
import { Layout } from 'antd';
import { BasicProps } from 'antd/lib/layout/layout';
import './index.scss';
const { Footer} = Layout;
export const TzFooter = (props: BasicProps) => {
  const realProps = useMemo(() => {
    return {
      ...props,
      className: `tz-footer ${props.className}`,
    };
  }, [props]);
  return <Footer {...realProps} />;
};
