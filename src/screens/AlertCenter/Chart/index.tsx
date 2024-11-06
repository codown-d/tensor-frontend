import { mergeWith, merge, throttle, debounce } from 'lodash';
import moment from 'moment';
import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import './index.less';
import { useDebounceFn, useMemoizedFn } from 'ahooks';
import * as echarts from 'echarts';
import NoData from '../../../components/noData/noData';
let EventChart = forwardRef((props: any, ref: any) => {
  let { showTooltipTotal = true } = props;
  let myChart = useRef<any>(null);
  let chartOption = useMemo(() => {
    let option = merge(
      {
        tooltip: {
          className: 'echart-tooltip',
          trigger: 'axis',
          formatter: function (params: any) {
            let sum = 0,
              str = '',
              title;
            params.forEach((item: any) => {
              sum += item.value[1];
              title = item.value[0];
              str += `<div class='echart-tooltip-item'><span class='marker'>${item.marker}</span><span class='seriesName'>${item.seriesName} <span class='f-r num'>${item.value[1]}</span></span></div>`;
            }, 0);
            return `<div class='echart-tooltip-content'>
                <div class='echart-tooltip-title'>${moment(title).format('YYYY-MM-DD HH:mm')}</div>
                ${str}
                ${
                  showTooltipTotal
                    ? `<div class='echart-tooltip-total'>Total：<span class='num'>${sum}<span></div>`
                    : ''
                }
              </div>`;
          },
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985',
            },
          },
        },
        grid: {
          top: '20px',
          left: '2%',
          right: '2%',
          bottom: '22px',
          containLabel: true,
        },
        xAxis: {
          type: 'time',
          axisPointer: {
            lineStyle: {
              color: 'rgba(33, 119, 209, 0.8)',
              width: 2,
            },
          },
          splitLine: {
            lineStyle: {
              color: ['#E7E9ED'],
            },
          },
        },
        yAxis: [
          {
            type: 'value',
            axisPointer: {
              show: false,
            },
            splitLine: {
              lineStyle: {
                type: 'dashed',
                color: ['#E7E9ED'],
              },
            },
          },
        ],
        toolbox: {
          feature: {
            dataZoom: {
              yAxisIndex: 'none',
              iconStyle: {
                opacity: 0,
              },
            },
          },
        },
        series: [],
      },
      props.data,
      {
        legend: props.data?.legend
          ? merge(
              {
                itemGap: 32,
                icon: 'circle',
                itemHeight: 8,
                bottom: '0px',
                textStyle: { padding: [0, -6] },
              },
              props.data?.legend,
            )
          : false,
      },
    );
    option.series = option.series.map((item: any) => {
      return merge(
        {
          type: 'line',
          smooth: true,
          showSymbol: false,
          emphasis: { focus: 'series' },
          lineStyle: { width: 2 },
        },
        item,
      );
    });
    return option;
  }, [props.data]);
  const init = useMemoizedFn(() => {
    if (!myChart.current) return;
    myChart.current.on('dataZoom', function (params: any) {
      let { startValue, endValue } = params.batch[0];
      props.refresh && props.refresh([moment(startValue), moment(endValue)]);
    });
    myChart.current.on('legendselectchanged', function (params: any) {
      props.legendselectchanged && props.legendselectchanged(params);
    });
    myChart.current.on('finished', function () {
      props?.finished && props?.finished(myChart.current);
    });
    myChart.current.on('mousemove', { element: 'my_el' }, function (e: any) {
      props?.mousemove && props?.mousemove(e);
    });
    props?.ready && props?.ready(myChart.current);
    myChart?.current?.setOption(chartOption);
  });
  useEffect(() => {
    myChart?.current?.clear();
    chartOption.series.length && myChart?.current?.setOption(chartOption, true);
  }, [chartOption.series, myChart?.current]);
  useImperativeHandle(
    ref,
    () => {
      return {
        getChart() {
          return myChart.current;
        },
      };
    },
    [myChart],
  );
  const { run: onResize } = useDebounceFn(
    (val) => {
      myChart.current?.resize(val);
    },
    {
      wait: 300,
    },
  );
  return chartOption.series.length ? (
    <div
      style={{ width: '100%', height: '100%' }}
      ref={(node) => {
        if (node) {
          myChart.current && echarts?.dispose(myChart.current);
          myChart.current = echarts.init(node);
          init();
        }
        let width = $(node).width();
        let height = $(node).height();
        if (height && height) {
          onResize({
            width: width,
            height: height,
          });
        }
      }}
    ></div>
  ) : (
    <NoData />
  );
});
export default EventChart;
