import React, { useMemo } from 'react';
import { Content , BasicProps } from 'antd/lib/layout/layout';
import classNames from 'classnames';

import './index.scss';

export const TzContent = (props: BasicProps) => {
  const realProps = useMemo(() => {
    return {
      ...props,
      className: classNames('tz-content', props.className),
    };
  }, [props]);
  return <Content {...realProps} />;
};
