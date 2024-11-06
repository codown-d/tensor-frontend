import React, { useMemo } from 'react';
import './index.scss';
import { Anchor, AnchorProps } from 'antd';
import classNames from 'classnames';
import SiderAnchor, { SiderAnchorProps } from './SiderAnchor';
import { useLocation } from 'react-router-dom';
import { useMemoizedFn } from 'ahooks';
import { merge } from 'lodash';

type TzAnchorProps = (AnchorProps | SiderAnchorProps) & {
  isSideAnchor?: boolean; //侧边栏anchor，默认true
};
export const useAnchorItem = () => {
  const { key: pathKey } = useLocation();
  let getAnchorItem = useMemoizedFn((items: { href: string }[]) => {
    return items.map((item: any) => {
      return merge({}, item, {
        href: item.href.replace('#', `#${pathKey}_`),
      });
    });
  });
  let getPageKey = useMemoizedFn((item?: string) => {
    return item ? `${pathKey}_${item}` : pathKey;
  });
  return { getAnchorItem, pageKey: pathKey, getPageKey };
};
const TzAnchor = (props: TzAnchorProps) => {
  const { className, isSideAnchor = true, ...rest } = props;

  if (!isSideAnchor) {
    return <Anchor className={classNames('tz-anchor', { className })} {...rest} />;
  }
  return <SiderAnchor {...(rest as SiderAnchorProps)} className={className} />;
};
export default TzAnchor;
