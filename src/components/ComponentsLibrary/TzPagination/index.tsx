import Button from 'antd/lib/button';
import Pagination, { PaginationProps } from 'antd/lib/pagination';
import React, { useMemo, useState, useEffect } from 'react';
import { TzButton } from '../../tz-button';
import './index.scss';
export interface TzPaginationProps extends PaginationProps {
}
const TzPagination = (props: TzPaginationProps) => {
  const realProps = useMemo(() => {
    return {
      ...props,
      className: `tz-pagination ${props.className || ''}`,
    };
  }, [props]);
  return <Pagination {...realProps} />;
};
export default TzPagination;

export const TzPaginationOther = (props: TzPaginationProps) => {
  let { current: currentPage, total, defaultCurrent } = props
  let [current, setCurrent] = useState(currentPage || defaultCurrent || 1)
  return <ul className={`flex-r tz-pagination-other ${props.className}`} style={{ alignItems: 'center' }}>
    <li className={'pagination-prev'}>
      <TzButton type={'link'}
        style={{ height: '26px' }}
        disabled={current == 1}
        onClick={() => { 
          setCurrent(pre => pre - 1) 
          props?.onChange && props?.onChange(current-1, 1)
        }}>
        <i className={'icon iconfont icon-arrow f-l'} style={{ color: 'rgba(142, 151, 163, 1)' }}></i>
      </TzButton>
    </li>
    <li className={'ml4 mr4 f12'}>
      {current}
      <span className={''}>/</span>
      {total}
    </li>
    <li className={'pagination-next'}>
      <TzButton type={'link'}
        style={{ height: '26px' }}
        disabled={current == total}
        onClick={() => { 
          setCurrent(pre => (pre + 1)) 
          props?.onChange && props?.onChange(current+1, 1)}}>
        <i className={'icon iconfont icon-arrow f-l'} style={{ color: 'rgba(142, 151, 163, 1)' }}></i>
      </TzButton>
    </li>
  </ul>;
};