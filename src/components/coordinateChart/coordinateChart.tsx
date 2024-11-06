import React, { useMemo } from 'react';
import {
  Chart,
  Point,
  Line,
  Axis,
  Area,
  Tooltip,
  Coordinate,
  Legend,
} from 'bizcharts';
import DataSet from '@antv/data-set';

const CoordinateChart = (props: {
  keyfields: string[];
  data: any[];
  colorType?: 'blue' | 'red';
}) => {
  const { data, keyfields, colorType } = props;

  const dv = useMemo(() => {
    const { DataView } = DataSet;
    const _dv = new DataView().source(data);
    _dv.transform({
      type: 'fold',
      fields: keyfields, // 展开字段集
      key: 'user', // key字段
      value: 'score', // value字段
    });
    return _dv;
  }, [data, keyfields]);

  const colors = useMemo(() => {
    if (colorType === 'red') {
      return {
        background: 'rgba(245, 132, 109, 0.8)',
        border: '#EFA18B',
      };
    }
    return {
      background: 'rgba(108, 190, 245, 0.8)',
      border: '#7DC2F0',
    };
  }, [colorType]);

  const tooltip = useMemo(() => {
    return data.map((ittem) => {
      const { item, txt } = ittem;
      return (
        <div
          key={item}
          style={{
            padding: '4px 5px',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span>{item}&nbsp;:&nbsp;</span>
          <span>{txt}</span>
        </div>
      );
    });
  }, [data]);

  return (
    <Chart
      padding="auto"
      appendPadding={[50, 50]}
      height={300}
      data={dv.rows}
      autoFit
      scale={{
        score: {
          min: 0,
          max: 1,
        },
      }}
      // interactions={['legend-highlight']}
    >
      <Coordinate type="polar" radius={0.5} />
      <Point
        position="item*score"
        color={colors.border}
        shape="circle"
        size={4}
        style={{
          stroke: '#fff',
          lineWidth: 1,
          fillOpacity: 1,
        }}
      />
      <Line position="item*score" color={colors.border} size="2" />
      <Area position="item*score" color={colors.background} />
      <Axis
        name="score"
        label={null}
        grid={{
          line: { type: 'line' },
          alternateColor: 'rgba(0, 0, 0, 0.05)',
        }}
      />
      <Axis
        name="item"
        line={false}
        label={{
          offset: 58,
          autoRotate: true,
          style: {
            fontSize: 12,
            textAlign: 'center',
            fill: '#5f6c7a',
            fontWeight: 400,
          },
        }}
      />
      <Legend visible={false} />
      {/* <Tooltip visible={false} /> */}

      <Tooltip>
        {(title, items) => {
          return <div>{tooltip}</div>;
        }}
      </Tooltip>
    </Chart>
  );
};

export default CoordinateChart;
