import classNames from 'classnames';
import React, { useState } from 'react';
import './AnalysisTimeLine.scss';
interface AnalysisTimeLineProps {
  timeLineList: any[];
  callback: (arg?: any) => void;
}
const AnalysisTimeLine = (props: AnalysisTimeLineProps) => {
  let { timeLineList, callback = () => {} } = props;
  let [activeLine, setActiveLine] = useState<any>();
  return (
    <div className={'flex-c analysis-timeLine'} style={{ width: '100%' }}>
      <div className="lineItem"></div>
      {timeLineList.map((item, index) => {
        if (!item.num) {
          return;
        }
        return (
          <>
            <div
              className={classNames('cr', { 'active-time-line': activeLine === index })}
              onClick={() => {
                setActiveLine((pre: any) => {
                  if (pre === index) {
                    callback();
                    return '';
                  }
                  callback(item);
                  return index;
                });
              }}
            >
              {item.num > 99 ? '99+' : item.num}
            </div>
            <div className="lineItem"></div>
          </>
        );
      })}
      <div className="troangle"></div>
    </div>
  );
};

export default AnalysisTimeLine;
