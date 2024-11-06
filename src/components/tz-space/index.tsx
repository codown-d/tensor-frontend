import { Space, SpaceProps } from 'antd';
import React, { useMemo } from 'react';

import './index.scss';

export const TzSpace = (props: SpaceProps) => {
  const realProps = useMemo(() => {
    return {
      ...props,
      className: `tz-space ${props.className || ''}`,
    };
  }, [props]);
  return <Space {...realProps} />;
};
