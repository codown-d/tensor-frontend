import React, { useEffect, useCallback, useMemo, useRef } from 'react';
import { overview } from '../../../services/DataService';
import { translations } from '../../../translations/translations';
let ComplianceNodeChart = (props: any) => {
  const complianceNodeChartRef = useRef<HTMLDivElement>(null);
  let initChart = () => {
    let chartDom = complianceNodeChartRef.current;
    if (!chartDom) return { setOption: () => {} };
    let myChart = (window as any).echarts.init(chartDom, null, { height: 240, padding: 10 });
    let option = {
      tooltip: {
        trigger: 'item',
        borderColor: 'transparent',
        formatter: function (params: any, ticket: any, callback: any) {
          let data = myChart.getOption().series[0].data;
          let color = myChart.getOption().color;
          let res = `<div style='width:156px;padding-left:6px'>
          <div style='font-weight:550;color:#3E4653'>${params.seriesName}</div>
          ${data
            .map((item: any, index: number) => {
              return `<p style='padding-top:6px'>
            <span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:${color[index]};"></span>
            ${item.name}：${item.value}
            </p>`;
            })
            .join('')} </div>`;
          return res;
        },
      },
      color: ['rgba(242, 138, 138, 1)', 'rgba(33, 119, 209, 1)'],
      series: [
        {
          name: translations.sum + '：0',
          type: 'pie',
          radius: ['78%', '92%'],
          avoidLabelOverlap: false,
          label: {
            show: true,
            position: 'center',
            formatter: function (data: any) {
              return `{value|${data.seriesName.split('：')[1]}} \n\n{unit|${translations.sum}}`;
            },
            rich: {
              value: {
                fontSize: 32,
                fontWeight: 'bolder',
                color: '#3E4653',
              },
              unit: {
                fontSize: 12,
                color: '#6C7480',
              },
            },
          },
          emphasis: {
            label: {
              backgroundColor: '#fff',
              show: true,
              formatter: function (data: any) {
                let { value, name } = data;
                return `{value|${value}} \n\n{unit|${name}}`;
              },
              padding: [10, 10, 10, 10],
              rich: {
                value: {
                  fontSize: 32,
                  fontWeight: 'bolder',
                  color: '#3E4653',
                },
                unit: {
                  fontSize: 12,
                  color: '#6C7480',
                },
              },
            },
          },
          labelLine: {
            show: false,
          },
          data: [],
        },
      ],
    };
    option && myChart.setOption(option);
    return myChart;
  };
  let clusterKey = useMemo(() => {
    return props.clusterKey;
  }, [props.clusterKey]);
  let overviewFn = useCallback(() => {
    overview(props).subscribe((res) => {
      let item = res.getItem();
      let { completedNode = 0, failedNode = 0 } = item;
      let chart = initChart();
      let data = [
        { value: failedNode, name: translations.compliances_historyColumns_numFailed },
        { value: completedNode, name: translations.compliances_historyColumns_finishedAt },
      ];
      chart.setOption({
        series: [
          {
            name:
              `${translations.sum}：` +
              data.reduce((pre, item) => {
                return pre + item.value;
              }, 0),
            data,
          },
        ],
      });
    });
  }, [props.checkType, props.clusterKey]);
  useEffect(() => {
    if (clusterKey) {
      overviewFn();
    }
  }, [overviewFn]);
  return <div ref={complianceNodeChartRef} className={'complianceNodeChart'} style={{ marginTop: '-10pxs' }} />;
};

export default ComplianceNodeChart;
