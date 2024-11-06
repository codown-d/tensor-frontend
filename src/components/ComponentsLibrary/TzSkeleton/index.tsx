import React, { useMemo } from 'react';
import './index.scss';
import { Skeleton, SkeletonProps } from 'antd';
interface Props extends SkeletonProps {
  children?: any;
}

const TzSkeleton = (props: Props) => {
  const { children, ...otherProps } = props;
  const realProps = useMemo(() => {
    return {
      ...otherProps,
    };
  }, [otherProps]);
  return <Skeleton {...realProps}> {children}</Skeleton>;
};
export default TzSkeleton;
