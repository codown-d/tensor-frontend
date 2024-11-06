import React, { useCallback, useMemo } from 'react';
import { BreadcrumbItemProps, PageHeader, PageHeaderProps } from 'antd';
import './index.scss';
import { merge } from 'lodash';
import { useNavigate } from 'react-router-dom';
import TzBreadcrumb from '../TzBreadcrumb';
export interface TzPageHeaderProps extends PageHeaderProps {
  navbarTools?: any[];
}
export interface BackIconProps {
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}
export let BackIcon = (props: BackIconProps) => {
  let { className = '', style = {} } = props;
  return (
    <i
      {...props}
      className={`icon iconfont icon-arrow f28 backicon ${className}`}
      style={merge(
        {
          transform: 'rotateZ(90deg)',
          fontWeight: 550,
        },
        style,
      )}
    ></i>
  );
};
const TzPageHeader = (props: TzPageHeaderProps) => {
  const navigate = useNavigate();
  const realProps = useMemo(() => {
    let obj = {
      ...props,
      className: `tz-header ${props.className || ''}`,
      title: (
        <span className={'flex-r-c'} style={{ justifyContent: 'flex-start' }}>
          <span>{props.title}</span>
          {props?.navbarTools && props.navbarTools.map((T, i) => <T key={i} />)}
        </span>
      ),
      extra: props?.extra ? <div>{props.extra}</div> : null,
    };
    delete obj.navbarTools;
    return obj;
  }, [props]);

  let breadcrumbRender = useCallback((props: PageHeaderProps) => {
    let { breadcrumb = [] } = props;
    let itemList = (breadcrumb as BreadcrumbItemProps[]).map((item) => {
      let { href, ...otherItem } = item;
      const result: any = { ...otherItem };
      result['onClick'] = () => {
        href && navigate(href + '');
      };
      return result;
    });
    return itemList.length ? <TzBreadcrumb itemList={itemList} className="mt8" /> : null;
  }, []);

  let onBack = useCallback(() => {
    if (Object.prototype.toString.call(realProps?.onBack).slice(8, -1) === 'Function') {
      realProps.onBack && realProps.onBack();
    } else {
      navigate(-1);
    }
  }, [realProps]);
  return (
    <PageHeader
      {...realProps}
      breadcrumbRender={breadcrumbRender}
      onBack={realProps?.onBack ? onBack : undefined}
      backIcon={<BackIcon />}
    />
  );
};
export default TzPageHeader;
