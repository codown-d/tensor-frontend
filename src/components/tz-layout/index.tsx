import React, { useCallback, useEffect, useMemo } from 'react';
import { Layout } from 'antd';
import { BasicProps } from 'antd/lib/layout/layout';
import classNames from 'classnames';
import './index.scss';

export const TzLayout = (props: BasicProps) => {
  const realProps = useMemo(() => {
    return {
      ...props,
      className: classNames('tz-layout', props.className),
    };
  }, [props]);

  return <Layout {...realProps} />;
};
