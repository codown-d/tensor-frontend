import React, { useState } from 'react';
import { formatGeneralTime, TimeHistories } from '../../definitions';
import { translations } from '../../translations/translations';
import './TimeLine.scss';
import { Resources } from '../../Resources';
import classNames from 'classnames';
import { TzButton } from '../tz-button';

function deal_time(timestamp: number) {
  return formatGeneralTime(timestamp);
}

function sortby(a: any, b: any) {
  return a.timestamp - b.timestamp;
}

const TimeLine = (props: {
  data: TimeHistories[];
  setData: (data: any) => void;
}) => {
  let $data: TimeHistories[] = [];
  if (props.data.length < 1) {
    return null;
  }
let [curKey,setCurKey]=useState(-1)
  let intervals: any,
    newTArr: any,
    _lenght: number,
    start: number,
    end: number,
    timeNode: any,
    dealTime: any[] = [];

  // 取出数据，生成时间戳
  newTArr = props.data.map((t: any, key: any) => {
    const _item = t;
    // 时间戳
    _item._timestamp || (_item._timestamp = deal_time(t.timestamp));
    return _item;
  });

  // 排序;
  newTArr.sort(sortby);
  $data = newTArr.slice(0);
  // 数组最大值
  _lenght = newTArr.length - 1;
  // 偏移量
  intervals = (newTArr[_lenght]?.timestamp - newTArr[0]?.timestamp) / 10;

  if (intervals < 2 * 60 * 1000) {
    intervals = 120000;
  }

  // 最小时间
  start = newTArr[0]?.timestamp - intervals;
  // 最大时间
  end =
    newTArr[_lenght]?.timestamp +
    intervals -
    (newTArr[0]?.timestamp - intervals);

  const endItem = newTArr[_lenght]?.timestamp + intervals;
  const startRound = deal_time(start);
  const nowTime = new Date().getTime();
  const endRound =
    endItem > nowTime
      ? translations.notificationCenter_columns_timeEnd
      : deal_time(endItem);

  // 生成位移位置
  timeNode = newTArr.map((d: any) => {
    const l = Math.floor(((d.timestamp - start) / end) * 1000) / 10;
    return {
      _left: l,
      data: d,
    };
  });
  // 处理聚合
  timeNode.forEach((t: any, key: number) => {
    if (key === 0 && dealTime.length === 0) {
      dealTime.push({
        data: [t.data, ...[]],
        _left: t._left,
      });
    }
    if (dealTime.length && key !== 0) {
      const _key = dealTime.length - 1;
      if (t._left - dealTime[_key]._left < 5) {
        dealTime[_key].data.push(t.data);
      } else {
        dealTime.push({
          data: [t.data],
          _left: t._left,
        });
      }
    }
  });

  return (
    <div className="time-case">
      <span className="time-title family-s mb16">
      <i className={'icon iconfont icon-xingzhuangjiehe mr6'} style={{color:'#8E97A3'}}></i>
        {translations.notificationCenter_history}
        <TzButton type={'text'} className="ml12 family-s" onClick={() => {
          setCurKey(-1)
          props.setData($data)
        }}>
          {translations.notificationCenter_displayAll}
        </TzButton>
      </span>
      <div className="line-case">
        <div className="line"></div>
        <>
          <div className="startRound">{startRound}</div>
          <div className="endRound">{endRound}</div>
          {dealTime
            ? dealTime.map((n: any, key: number) => {
                return (
                  <div
                    className={classNames('round', {
                      more: n.data?.length > 1,'act':key==curKey
                    })}
                    style={{ left: `${n._left}%` }}
                    key={key}
                    onClick={() => {
                      setCurKey(key)
                      props.setData(n.data);}}
                    title={n.data[0]._timestamp}
                  >
                    {n.data && n.data?.length > 1 ? n.data.length : null}
                  </div>
                );
              })
            : null}
        </>
      </div>
    </div>
  );
};

export default TimeLine;
