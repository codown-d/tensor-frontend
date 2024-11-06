import React, { useEffect, useMemo, useRef } from 'react';
import * as echarts from 'echarts';
import 'echarts-liquidfill/src/liquidFill.js';
import './LiquidFill.scss';
import classNames from 'classnames';
import { translations } from '../../translations/translations';

interface FillOptions {
  width?: number;
  height?: number;
  data: any[];
  occupancyData?: { total: number; used: number; can_create: number };
}

export const LiquidFill = (props: FillOptions) => {
  const { width = 400, height = 400, data, occupancyData } = props;
  const chartRef = useRef<any>(undefined);
  const options = useMemo(() => {
    if (!data?.length) return {};
    let option = {
      series: [
        {
          type: 'liquidFill',
          data: data,
          color: ['rgba(45, 148, 255, 0.1)', 'rgba(45, 148, 255, 0.3)', 'rgba(45, 148, 255, 0.8)'],
          amplitude: '4%',
          outline: {
            show: true,
            borderDistance: 0,
            itemStyle: {
              borderColor: 'rgba(45, 148, 255, 1)',
              borderWidth: 4,
              shadowColor: 'rgba(0, 0, 0, 0.1)',
            },
          },
          backgroundStyle: {
            color: '#fff',
          },
          itemStyle: {
            shadowBlur: 0,
          },
          label: {
            show: false,
          },
        },
      ],
      tooltip: {
        show: true,
        position: function (point: any) {
          return [point[0], point[1] - 88];
        },
        trigger: 'item',
        backgroundColor: 'rgba(255, 255, 255, 1)',
        extraCssText: 'box-shadow: 0px 1px 12px rgba(144, 168, 205, 0.25);',
        padding: [12, 16],
        textStyle: {
          color: '#6C7480',
          fontStyle: 'normal',
          fontWeight: 'normal',
          fontSize: 12,
        },
        formatter: (params: any, ticket: any, callback: any) => {
          if (!occupancyData?.total) return '';
          return `
            <div class="df dfdc formatter-group">
              <div class="all-num">${translations.executable_strategy}：${occupancyData?.total}</div>
              <div class="used-num">${translations.policies_established}：${occupancyData?.used}</div>
              <div class="remaining-num">${translations.createable_policies}：${occupancyData?.can_create}
              </div>
            </div>`;
        },
      },
    };
    return option;
  }, [data, occupancyData]);

  useEffect(() => {
    const chart = echarts.init(chartRef.current);
    chart.setOption(options);
  }, [options]);

  return (
    <div style={{ position: 'relative', height: '230px', overflow: 'hidden' }} className="dfc">
      <div
        style={{
          width: `${width}px`,
          height: `${height}px`,
        }}
        ref={chartRef}
      ></div>
      {!!occupancyData?.total ? (
        <>
          <div
            className={classNames('fq-center-group', {
              white: data[2] >= 0.6,
            })}
          >
            <span className="dib txt-case">{translations.policies_established}</span>
            <span className="dib num-case">{occupancyData?.used}</span>
          </div>
        </>
      ) : null}
    </div>
  );
};
