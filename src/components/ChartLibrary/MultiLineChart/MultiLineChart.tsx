import React, { useState, useEffect, useRef } from 'react';
import { Chart, LineAdvance, Legend, Axis,Guide,Tooltip  } from 'bizcharts';
import './MultiLineChart.scss';
interface MultiLineChart {
  data: any;
  height?: number;
  position?: string;
  operate?: any;
  offset?: number;
  desc?: string;
  colors?: any;
}
const { Line } = Guide;

export const axisConfig = {
  line: {
    style: {
      stroke: '#fff',
    }, // 设置坐标轴线样式
  },
  grid: {
    line: {
      style: {
        stroke:'#EFF0F2',
      },
    }, // 设置坐标系栅格样式
  },
};
const MultiLineChart = (props: MultiLineChart) => {
  let {height=350} = props
  const [data, setDate] = useState(props.data);
  const { position = 'x*y', operate, desc = 'desc', colors } = props;
  const chartRef = useRef(null);
  useEffect(() => {
    setDate(props.data);
  }, [props.data]);

  return (
    <div className="ts-line-chart" ref={chartRef}>
      <div className="ts-line-chart-header">
        <div className="operate">{operate}</div>
      </div>
      <Chart  appendPadding={[50,12,8,12]}autoFit height={height} data={data} >
        <LineAdvance
          shape="smooth"
          point
          area
          position={position}
          color={[desc, colors]}
        />
        <Axis name="count"  {...axisConfig} />
        <Tooltip showCrosshairs={true} crosshairs={{
          line:{ style: {
            stroke: '#EFF0F2',
          }}
        }} />
        <Axis name="axis" line={{style: {
            stroke:'#EFF0F2',
          }}} />
        <Legend layout="horizontal" position="top-left" visible={false}/>
      </Chart>
    </div>
  );
};
export default MultiLineChart;
