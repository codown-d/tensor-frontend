import classNames from 'classnames';
import React, { useMemo, useRef } from 'react';
import { translations } from '../../../translations/translations';
import './index.scss';
import { merge } from 'lodash';

interface ChartInfoProps {
  tStyle: any;
  aStyle: any;
  node: any;
  ratio: any;
}

export const ChartNSInfo = (props: ChartInfoProps) => {
  const ref = useRef<any>(null);
  console.log(props);
  const { tStyle, aStyle, node, ratio } = props;

  const orData = useMemo(() => {
    return node?.data?.name ? node?.data : {};
  }, [node]);

  const [dts] = useMemo(() => {
    return [tStyle];
  }, [tStyle, aStyle, node, ratio]);

  return (
    <div className="chart-info ns-group" style={merge(dts)} ref={ref}>
      <div style={{ position: 'relative' }}>
        {`${translations.calico_cluster_namespace}: ${orData.id}`}
        <div className="arrow-block black"></div>
      </div>
    </div>
  );
};
export default ChartNSInfo;
