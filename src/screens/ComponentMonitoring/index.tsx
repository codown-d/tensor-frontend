import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { monitorTotal } from '../../services/DataService';
import { translations } from '../../translations/translations';
import './index.scss';
import CircleChart from '../../components/ChartLibrary/CircleChart';
import { PageTitle } from '../ImagesScanner/ImagesCI/CI';
import { TzCol, TzRow } from '../../components/tz-row-col';
import { TzTabs } from '../../components/tz-tabs';
import DesInfo from './DesInfo';
import ComponentMonitoringTab from './ComponentMonitoringTab';
import { useSize } from 'ahooks';
export enum Monitoring {
  holmes = 'holmes',
  scanner = 'scanner',
  clusterManager = 'cluster-manager',
}

const ComponentMonitoring = () => {
  let [monitoringData, setMonitoringData] = useState<any>({});
  let [activeKey, setActiveKey] = useState(Monitoring.holmes);
  const size = useSize(document.querySelector('body'));
  let getMonitorTotal = useCallback(() => {
    monitorTotal().subscribe((res) => {
      if (res.error) return;
      setMonitoringData(res.getItem());
    });
  }, []);
  useEffect(() => {
    getMonitorTotal();
  }, [getMonitorTotal]);

  let getOption = useCallback(
    (type) => {
      let {
        ClusterManagerPodTotal,
        ClusterManagerPodNotRunning,
        ClusterManagerPodRunning,
        HolmesContainerNotRunning,
        HolmesContainerRunning,
        HolmesContainerTotal,
        ScannerPodNotRunning,
        ScannerPodRunning,
        ScannerPodTotal,
      } = monitoringData;
      let chartData = [
        {
          value: HolmesContainerRunning,
          name: `${translations.superAdmin_normal}   ${HolmesContainerRunning}`,
          fillColor: '#52C41A',
        },
        {
          value: HolmesContainerNotRunning,
          name: `${translations.abnormal}   ${HolmesContainerNotRunning}`,
          fillColor: '#E95454',
        },
      ];
      let total = HolmesContainerTotal;
      if (type === Monitoring.clusterManager) {
        chartData[0].value = ClusterManagerPodRunning;
        chartData[1].value = ClusterManagerPodNotRunning;
        chartData[0].name = `${translations.superAdmin_normal}   ${ClusterManagerPodRunning}`;
        chartData[1].name = `${translations.abnormal}   ${ClusterManagerPodNotRunning}`;
        total = ClusterManagerPodTotal;
      } else if (type === Monitoring.scanner) {
        chartData[0].value = ScannerPodRunning;
        chartData[1].value = ScannerPodNotRunning;
        chartData[0].name = `${translations.superAdmin_normal}   ${ScannerPodRunning}`;
        chartData[1].name = `${translations.abnormal}   ${ScannerPodNotRunning}`;
        total = ScannerPodTotal;
      }
      return {
        color: chartData?.map((item) => item.fillColor),
        legend: {
          right: size?.width && size?.width < 1440 ? '10%' : '8%',
        },
        series: [
          {
            center: ['40%', '50%'],
            label: { formatter: [`{a|${total}}`, `{b|${translations.sum}}`].join('\n') },
            data: chartData,
          },
        ],
      };
    },
    [monitoringData, size],
  );
  return (
    <>
      <div className="component-monitoring mlr32 mt4">
        <DesInfo title={translations.container_component} className="mb20" />
        <div className="flex-r-c">
          <div style={{ flex: 1 }}>
            <PageTitle title={translations.protective_container} />
            <div style={{ height: '180px' }}>
              <CircleChart option={getOption(Monitoring.holmes)} />
            </div>
          </div>
          <div className="mid" style={{ flex: 1 }}>
            <PageTitle title={translations.cluster_management} style={{ marginLeft: '40px' }} />
            <div
              style={{
                height: '180px',
              }}
            >
              <CircleChart option={getOption(Monitoring.clusterManager)} />
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <PageTitle title={translations.mirrors_scan} style={{ marginLeft: '40px' }} />
            <div style={{ height: '180px' }}>
              <CircleChart option={getOption(Monitoring.scanner)} />
            </div>
          </div>
        </div>
        <PageTitle title={translations.list_components} className="mt24 mb10" />
        <TzTabs
          activeKey={activeKey}
          destroyInactiveTabPane={true}
          className={'tab-ml0'}
          tabBarStyle={{ marginBottom: 24 }}
          onChange={(val: any) => {
            setActiveKey(val);
            $('#layoutMain').scrollTop(0);
          }}
          items={[
            {
              label: translations.protective_container,
              key: Monitoring.holmes,
              children: <ComponentMonitoringTab type={Monitoring.holmes} getMonitorTotal={getMonitorTotal} />,
            },
            {
              label: translations.cluster_management,
              key: Monitoring.clusterManager,
              children: <ComponentMonitoringTab type={Monitoring.clusterManager} getMonitorTotal={getMonitorTotal} />,
            },
            {
              label: translations.mirrors_scan,
              key: Monitoring.scanner,
              children: <ComponentMonitoringTab type={Monitoring.scanner} getMonitorTotal={getMonitorTotal} />,
            },
          ]}
        />
      </div>
    </>
  );
};

export default ComponentMonitoring;
