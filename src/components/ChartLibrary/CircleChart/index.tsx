import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import './index.scss';
import NoData from '../../noData/noData';
import { translations } from '../../../translations/translations';
import { merge, sum } from 'lodash';
import * as echarts from 'echarts';
import { EChartsOption } from 'echarts';
import { useDebounceFn } from 'ahooks';
export interface CircleChartDataItem {
  fillColor: string;
  name: string;
  value: number;
  percent?: string;
}
export interface CircleChartProps {
  [x: string]: any;
  option: EChartsOption;
  width?: number;
  height?: number;
}
const CircleChart = (props: CircleChartProps) => {
  let { width, height, total = 0, option, _nk, ...otherData } = props;
  let myChart = useRef<any>();
  let chartOption = useMemo(() => {
    return merge(
      {
        tooltip: {
          trigger: 'item',
          borderColor: 'transparent',
        },
        legend: {
          selectedMode: false,
          orient: 'vertical',
          itemGap: 16,
          align: 'left',
          icon: 'circle',
          itemHeight: 8,
          right: '8%',
          y: 'center',
          textStyle: { padding: [0, -6] },
        },
        series: [
          {
            type: 'pie',
            radius: ['78%', '94%'],
            center: ['30%', '50%'],
            label: {
              show: true,
              position: 'center',
              fontSize: 32,
              color: '#3E4653',
              formatter: [`{a|${total}}`, `{b|${translations.sum}}`].join('\n'),
              rich: {
                a: {
                  padding: [20, 0, 0, 0],
                  fontSize: 32,
                  fontWeight: 600,
                  color: '#3E4653',
                },
                b: {
                  fontSize: 12,
                  color: '#6C7480',
                  lineHeight: 20,
                },
              },
            },
            emphasis: {
              itemStyle: {
                color: 'inherit',
              },
            },
            data: [],
          },
        ],
      },
      option,
    );
  }, [props.option]);
  const { run: onResize } = useDebounceFn(
    (val) => {
      myChart.current?.resize(val);
    },
    {
      wait: 300,
    },
  );
  let seriesSum = useMemo(() => {
    return sum(
      chartOption.series.map((item) => {
        return sum(item.data.map((it: any) => it.value));
      }),
    );
  }, [chartOption.series]);
  let dom = useMemo(() => {
    return chartOption.series.length === 0 || seriesSum === 0 ? (
      <NoData className={'mt16'} />
    ) : (
      <div
        style={{ width: '100%', height: '100%' }}
        {...otherData}
        ref={(node) => {
          let width = $(node).width();
          let height = $(node).height();
          if (node && width && height) {
            myChart.current && echarts?.dispose(myChart.current);
            myChart.current = echarts.init(node);
            myChart.current.setOption(chartOption);
            onResize({
              width: width,
              height: height,
            });
          }
        }}
      ></div>
    );
  }, [JSON.stringify(chartOption), seriesSum]);
  return <>{dom}</>;
};
export default CircleChart;
