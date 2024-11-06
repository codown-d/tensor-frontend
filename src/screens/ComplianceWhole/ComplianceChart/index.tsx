import React, { useEffect, useCallback, useRef } from 'react';
import { overview } from '../../../services/DataService';
import { translations } from '../../../translations/translations';
let ComplianceChart = (props: any) => {
  const complianceChartRef = useRef<HTMLDivElement>(null);
  let initChart = (value = 70) => {
    let chartDom = complianceChartRef.current;
    if (!chartDom) return { setOption: () => {} };
    let myChart = (window as any).echarts.init(chartDom, null, { height: 240, padding: 10 });
    let option = {
      series: [
        {
          type: 'gauge',
          axisLine: {
            lineStyle: {
              width: 10,
              color: [
                [value / 100, 'rgba(33, 119, 209, 1)'],
                [1, '#f4f6fa'],
              ],
            },
          },
          radius: '92%',
          itemStyle: {
            color: 'rgba(33, 119, 209, 0)',
          },
          progress: {
            show: true,
          },
          pointer: {
            width: 6,
            itemStyle: {
              color: 'rgba(33, 119, 209, 1)',
            },
          },
          axisTick: {
            distance: -10,
            length: 10,
            lineStyle: {
              color: '#E7E9ED',
              width: 1,
            },
          },
          splitLine: {
            distance: -10,
            length: 10,
            lineStyle: {
              color: '#fff',
              width: 1,
            },
          },
          axisLabel: {
            color: '#6C7480',
            distance: 16,
            fontSize: 12,
          },
          anchor: {
            show: true,
            showAbove: true,
            size: 8,
            itemStyle: {
              borderWidth: 2,
              borderColor: 'rgba(33, 119, 209, 1)',
            },
          },
          detail: {
            valueAnimation: true,
            formatter: function (value: any) {
              return '{value|' + value.toFixed(0) + '}{unit|%}';
            },
            rich: {
              value: {
                fontSize: 32,
                fontWeight: 'bolder',
                color: '#3E4653',
              },
              unit: {
                fontSize: 12,
                color: '#3E4653',
                fontWeight: 'bolder',
                padding: [0, 0, -6, 4],
              },
            },
            color: '#3E4653',
            fontSize: 12,
          },
          title: {
            offsetCenter: [0, '65%'],
            color: '#6C7480',
            fontSize: 12,
          },
          data: [
            {
              value: value,
              name: translations.compliance_passing_rate,
            },
          ],
        },
      ],
    };
    option && myChart.setOption(option);
    return myChart;
  };
  let overviewFn = useCallback(() => {
    overview(props).subscribe((res) => {
      let item = res.getItem();
      let { check_fail = 0.01, check_pass = 0 } = item;
      let chart = initChart(0);
      let value: any = ((check_pass / (check_fail + check_pass + 0.0001)) * 100).toFixed(0);
      chart.setOption({
        series: [
          {
            data: [
              {
                value,
                name: translations.compliance_passing_rate,
              },
            ],
            axisLine: {
              lineStyle: {
                color: [
                  [value / 100, 'rgba(33, 119, 209, 1)'],
                  [1, '#f4f6fa'],
                ],
              },
            },
          },
        ],
      });
    });
  }, [props.checkType, props.clusterKey]);
  useEffect(() => {
    if (props['clusterKey']) {
      overviewFn();
    }
  }, [overviewFn]);
  return <div ref={complianceChartRef} className={props.checkType}></div>;
};

export default ComplianceChart;
