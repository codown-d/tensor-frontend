import React, { useMemo, useRef } from 'react';
import './index.scss';

interface ChartTooltipProps {
  style: React.CSSProperties;
  text: string;
}

export const ChartTooltip = (props: ChartTooltipProps) => {
  let { text, style } = props;
  const ref = useRef<any>(null);
  return (
    <>
      <div className="chart-tooltip" style={style} ref={ref}>
        {text}
      </div>
    </>
  );
};
export default ChartTooltip;
