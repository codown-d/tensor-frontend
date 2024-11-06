import classNames from 'classnames';
import React, { useMemo, useRef } from 'react';
import { translations } from '../../../translations/translations';
import './index.scss';

interface ChartInfoProps {
  tStyle: any;
  aStyle: any;
  node: any;
}

const severityList: any = {
  Critical: translations.onlineVulnerability_filters_criticalLevel,
  High: translations.onlineVulnerability_filters_highLevel,
  Medium: translations.onlineVulnerability_filters_mediumLevel,
  Low: translations.onlineVulnerability_filters_lowLevel,
  Negligible: translations.onlineVulnerability_filters_negligibleLevel,
  Unknown: translations.risk_unknownLevel,
};

export const ChartNumGroup = (props: ChartInfoProps) => {
  const ref = useRef<any>(null);
  const { tStyle, aStyle, node } = props;

  const orData = useMemo(() => {
    return node?.data?.type ? node?.data : {};
  }, [node]);

  const [dts, das] = useMemo(() => {
    return [tStyle, aStyle];
  }, [tStyle, aStyle]);

  return (
    <>
      <div className="chart-info num-group" style={dts} ref={ref}>
        <div
          className={classNames('num-case', {
            [orData.severity]: orData?.severity,
          })}
        >{`${severityList[orData?.severity]}${translations.numRisk}：${
          orData?.name
        }`}</div>
      </div>
      <div className="arrow-block black" style={das}></div>
    </>
  );
};
export default ChartNumGroup;
