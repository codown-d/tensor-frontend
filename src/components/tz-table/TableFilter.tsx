import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import { screens } from '../../helpers/until';
import './TableFilter.scss';
import TzDivider from '../ComponentsLibrary/TzDivider';
import { TzRow } from '../tz-row-col';
import { translations } from '../../translations/translations';
export default (props: any) => {
  let [height, setHeight] = useState('72px');
  const { gutter, spanCount } = useMemo(() => {
    return screens();
  }, []);
  let filterCol = useMemo(() => {
    return props.filterCol;
  }, [props.filterCol]);
  return (
    <div className={`palace-filter-p ${props.className || ''}`}>
      <div
        className="palace-filter"
        style={{
          height: height,
          paddingBottom: height === 'auto' ? '22px' : '12px',
        }}
      >
        <TzRow gutter={gutter}>{filterCol}</TzRow>
      </div>

      <TzDivider
        className="table-filter"
        style={{
          marginTop: height === 'auto' ? '-10px' : '0px',
          marginBottom: '12px',
        }}
      >
        <span
          style={{
            padding: '0 1em',
            // 屏幕宽在1440以下，超过三个显示展开，在1440以上，超过4个显示展开
            display: `${
              (filterCol.length <= 4 && spanCount === 6) ||
              (filterCol.length <= 3 && spanCount === 8)
                ? 'none'
                : ''
            }`,
          }}
          onClick={() => {
            setHeight((pre) => {
              return pre === 'auto' ? '72px' : 'auto';
            });
          }}
          className="cursor-p spread-span"
        >
          {height === 'auto' ? translations.pack_up : translations.open}
          <i
            className="icon iconfont icon-arrow-double"
            style={{
              position: 'relative',
              top: '1px',
              transition: '0.3s',
              display: 'inline-block',
              transform: height === 'auto' ? 'rotate(180deg)' : '',
            }}
          ></i>
        </span>
      </TzDivider>
    </div>
  );
};
