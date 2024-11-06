import Segmented, { SegmentedProps } from 'antd/lib/segmented';
import React, { useMemo } from 'react';
import './index.scss';
interface TzSegmentedProps extends SegmentedProps {}

const TzSegmented = (props: any) => {
  const realProps = useMemo(() => {
    return {
      ...props,
      className: `tz-segmented ${props.className || ''}`,
    };
  }, [props]);
  return <Segmented {...realProps} />;
};
export default TzSegmented;
