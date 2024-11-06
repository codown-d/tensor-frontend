import React, { ReactNode, forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import './Top5.scss';
export const Top5 = (props: {
  data?: {
    name: string;
    count: number;
  }[];
  max?: number;
}) => {
  const { data, max = 0 } = props;
  const list = useMemo(() => {
    return data?.map((item, index) => {
      return (
        <div key={index} className="top5-item">
          <div className="flex-r-c mb2" style={{ justifyContent: 'space-between' }}>
            <span className="top5-item-name txt-hide">{item.name}</span>
            <span className="txt-count">{item.count}</span>
          </div>
          <div
            style={{
              width: '100%',
              background: '#F4F6FA',
              borderRadius: '3px',
            }}
          >
            <div
              style={{
                width: `${Math.floor((item.count / max) * 100)}%`,
                height: '10px',
                background: 'linear-gradient(90deg, #2177D1 0%, #2D94FF 110.06%)',
                borderRadius: '3px',
              }}
            ></div>
          </div>
        </div>
      );
    });
  }, [data]);
  return (
    <div className="top5-list-group">
      {list}
      <ScaleLine max={max} />
    </div>
  );
};
export let getMax = (max: number) => {
  let newMax =
    (parseInt(Math.floor(max).toString().substr(0, 2)) + 1) * Math.pow(10, Math.floor(max).toString().length - 2);
  return newMax > 400 ? newMax : 400;
};
export let ScaleLine = (props: { max: number }) => {
  let { max } = props;
  let arr: any = [];
  if (max <= 5) {
    arr = [<div key={0}>0</div>, <div key={5}>5</div>];
  } else {
    for (let index = 0; index < 5; index++) {
      arr.push(<div key={(index / 5) * max}>{(index / 5) * max}</div>);
    }
    arr.push(<div key={max}>{max}</div>);
  }
  return <div className="flex-r-c scale-case">{arr}</div>;
};
