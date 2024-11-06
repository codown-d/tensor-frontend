import React, { PureComponent, useEffect, useState } from 'react';
import EllipsisPopover from '../../components/ellipsisPopover/ellipsisPopover';
import './AlertRulersScreens.scss';

export interface DealData {
  title: string;
  className?: string;
  titleStyle?: React.CSSProperties;
  content: string | any;
  render?: (arg1: any) => any;
  renderTitle?: (arg1: any) => any;
}
export const renderTableDomTemplate = (data: DealData[], className = '') => {
  return data.length === 0 ? null : (
    <div className={`item-details-case ${className}`}>
      <div className="details-content">
        {data.map((item: DealData, index: number) => {
          return (
            <React.Fragment key={index}>
              <div className={`content-item `}>
                <span className="content-item_title txt-hide" style={{ height: '48px' }}>
                  <EllipsisPopover>{item.title ? item.title : '-'}</EllipsisPopover>
                </span>
                <span className="content-item_txt">
                  {item?.render
                    ? item.render(item)
                    : (
                        <EllipsisPopover>
                          {Object.prototype.toString.call(item.content) === '[object Array]'
                            ? item.content.join(',')
                            : item.content}
                        </EllipsisPopover>
                      ) || '-'}
                </span>
              </div>
              {data.length - 1 === index &&
              data.length % 2 !== 0 &&
              className !== 'details-content-large' ? (
                <div className={`content-item blank-item`}>
                  <span className="content-item_title"></span>
                  <span className="content-item_txt"></span>
                </div>
              ) : (
                <></>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
