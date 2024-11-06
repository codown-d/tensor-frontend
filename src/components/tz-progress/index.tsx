import { Progress, ProgressProps } from 'antd';
import React, { useMemo } from 'react';

import './index.scss';

export const TzProgress = (props: ProgressProps) => {
  const realProps = useMemo(() => {
    return {
      ...props,
      className: `tz-progress ${props.className || ''}`,
    };
  }, [props]);
  return <Progress {...realProps} />;
};
