import { TreeProps } from 'antd/lib/tree';
import Tree from 'antd/lib/tree/Tree';
import React, { useMemo } from 'react';
import './index.scss';
interface TzTreeProps extends TreeProps{

}
export const TzTree = (props: TzTreeProps) => {
  const realProps = useMemo(() => {
    return {
      ...props,
      className: `tz-tree ${props.className || ''}`,
    };
  }, [props]);
  return <Tree {...realProps}/>;
};
