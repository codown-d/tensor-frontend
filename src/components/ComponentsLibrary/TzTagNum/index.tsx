import React, { useMemo } from 'react';
import { TzTooltip } from '../../tz-tooltip';
import './index.scss';

interface TzTagNumProps {
  list: any;
  onClick?: (arg: any) => void
}
let obj: any = {
  fail: {
    title: 0,
    style: {
      color: 'rgba(233, 84, 84, 1)',
      background: 'rgba(233, 84, 84, 0.1)',
    }
  },
  warn: {
    title: 0,
    style: {
      color: 'rgba(255, 152, 107, 1)',
      background: 'rgba(255, 152, 107, 0.1)',
    }
  },
  pass: {
    title: 0,
    style: {
      color: 'rgba(82, 196, 26, 1)',
      background: 'rgba(82, 196, 26, 0.1)',
    }
  },
  info: {
    title: 0,
    style: {
      color: 'rgba(152, 166, 190, 1)',
      background: 'rgba(152, 166, 190, 0.1)',
    }
  },
}
const TzTagNum = (props: TzTagNumProps) => {
  let { list = {}, onClick = () => { } } = props;
  return <>
    {!list || Object.keys(list).map((item: string | number) => {
      return list[item].tooltip ? <TzTooltip title={list[item].tooltip}>
        <span className="t-c severity-span ml8"
          style={obj[item].style} onClick={() => { onClick(item) }}>
          <span className={'cir'} style={{ background: obj[item].style.color }}></span>
          {list[item].title}
        </span>
      </TzTooltip> : <span className="t-c severity-span ml8"
        style={obj[item].style} onClick={() => { onClick(item) }}>
        <span className={'cir'} style={{ background: obj[item].style.color }}></span>
        {list[item].title}
      </span>
    })}
  </>;
};
export default TzTagNum;
