import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { map, tap } from 'rxjs/operators';
import { TzTable, TzTableServerPage } from '../../components/tz-table';
import {
  clusterRuleversion,
  getListClusters,
  monitorComponent,
  monitorHolmes,
  monitorRefresh,
  monitorTotal,
} from '../../services/DataService';
import { translations } from '../../translations/translations';
import './index.scss';
import { TzButton } from '../../components/tz-button';
import { find, isEqual } from 'lodash';
import useTzFilter, { FilterContext } from '../../components/ComponentsLibrary/TzFilter/useTzFilter';
import { TzFilter, TzFilterForm } from '../../components/ComponentsLibrary';
import { FilterFormParam } from '../../components/ComponentsLibrary/TzFilterForm/filterInterface';

import { TextHoverCopy } from '../AlertCenter/AlertCenterScreen';
import { getClusterName, useAssetsClusterList } from '../../helpers/use_fun';
import { getTime } from '../../helpers/until';
import { RenderTag } from '../../components/tz-tag';
import { TzMessageSuccess } from '../../components/tz-mesage';
import EllipsisPopover from '../../components/ellipsisPopover/ellipsisPopover';
import { Monitoring } from '.';
import { TzTooltip } from '../../components/tz-tooltip';
export let regStatus = [
  {
    label: translations.superAdmin_normal,
    value: 'Normal',
  },
  {
    label: translations.abnormal,
    value: 'Abnormal',
  },
];
let cluster_type_op = [
  { label: 'kubernetes', value: 'kubernetes' },
  { label: 'openshifit', value: 'openshifit' },
];
const ComponentMonitoringTab = (props: { type: any; getMonitorTotal: () => void }) => {
  let { type, getMonitorTotal } = props;
  let [filters, setFilters] = useState<any>({});
  let [btnLoading, setBtnLoading] = useState(false);
  const listRef = useRef<any>(null);

  const reqFun = useCallback(
    (pagination) => {
      const { current = 1, pageSize = 10 } = pagination;
      const offset = (current - 1) * pageSize;
      const pageParams = {
        offset,
        limit: pageSize,
        ...filters,
        component: type,
      };
      let fn = type === Monitoring.holmes ? monitorHolmes : monitorComponent;
      return fn(pageParams).pipe(
        map((res) => {
          const items = res.getItems();
          return {
            data: items,
            total: res?.totalItems || 0,
          };
        }),
      );
    },
    [filters, type],
  );
  let clusterList = useAssetsClusterList();
  const multiClusterManageFilter: FilterFormParam[] = useMemo(
    () =>
      [
        {
          label: translations.compliances_policyDetails_name,
          name: 'podName',
          type: 'input',
          icon: 'icon-pod',
        },
        {
          label: translations.version_number,
          name: 'version',
          type: 'input',
          icon: 'icon-tishi',
        },
        {
          label: translations.clusterManage_key,
          name: 'clusterKey',
          type: 'select',
          icon: 'icon-jiqun',
          props: {
            mode: 'multiple',
            options: clusterList,
          },
        },
        {
          label: translations.compliances_breakdown_dotstatus,
          name: 'podStatus',
          type: 'select',
          icon: 'icon-yunhangzhuangtai',
          props: {
            mode: 'multiple',
            options: regStatus,
          },
        },
        {
          label: translations.compliances_breakdown_statusName,
          name: 'nodeName',
          type: 'input',
          icon: 'icon-jiedian',
        },
      ].filter((item) => {
        let obj: any = {
          [Monitoring.holmes]: ['podName', 'version', 'podStatus', 'clusterKey', 'nodeName'],
          [Monitoring.clusterManager]: ['podName', 'version', 'podStatus', 'clusterKey', 'nodeName'],
          [Monitoring.scanner]: ['podName', 'version', 'podStatus', 'clusterKey', 'nodeName'],
        };
        return !!obj[type].includes(item.name);
      }) as FilterFormParam[],
    [cluster_type_op, type, clusterList],
  );

  const data = useTzFilter({ initial: multiClusterManageFilter });
  const handleChange = useCallback((values: any) => {
    setFilters((prev: any) => (isEqual(values, prev) ? prev : values));
  }, []);

  let getColumnsList = useCallback(
    (activeKey) => {
      let obj: any = {
        [Monitoring.holmes]: ['podName', 'version', 'podStatus', 'containerRunning', 'clusterKey', 'ndName'],
        [Monitoring.clusterManager]: [
          'podName',
          'version',
          'podStatus',
          'clusterKey',
          'ndName',
          'cpu',
          'mem',
          'blockIO',
          'heartbeat_time',
        ],
        [Monitoring.scanner]: [
          'podName',
          'version',
          'podStatus',
          'clusterKey',
          'ndName',
          'cpu',
          'mem',
          'blockIO',
          'lastUpdateTimeStamp',
        ],
        expand: ['containerName', 'containerStatus', 'cpu', 'mem', 'blockIO', 'metricsTimeStamp'],
      };
      let arr = [
        {
          title: translations.compliances_policyDetails_name,
          dataIndex: 'podName',
          key: 'podName',
          render: (podName: any, row: any) => {
            return <TextHoverCopy text={podName} lineClamp={2} style={{ lineHeight: '24px' }} />;
          },
        },
        {
          title: (
            <div className="flex-r">
              {translations.version_number}
              <TzTooltip title={translations.unStandard.str301}>
                <i className="icon iconfont icon-banben ml4" />
              </TzTooltip>
            </div>
          ),
          dataIndex: 'version',
          key: 'version',
          render: (version: any, row: any) => {
            return version || '-';
          },
        },
        {
          title: translations.compliances_breakdown_dotstatus,
          dataIndex: 'podStatus',
          key: 'podStatus',
          className: 'th-center',
          align: 'center',
          render: (item: any, row: any) => {
            return <RenderTag type={item} />;
          },
        },
        {
          title: translations.clusterManage_key,
          dataIndex: 'clusterKey',
          key: 'clusterKey',
          render: (item: any, row: any) => {
            let label = find(clusterList, (ite) => ite.value === item)?.label;
            return label;
          },
        },
        {
          title: translations.container_runs_total,
          dataIndex: 'containerRunning',
          key: 'containerRunning',
          render: (item: any, row: any) => {
            let { containerRunning, containerTotal } = row;
            return `${containerRunning}/${containerTotal}`;
          },
        },
        {
          title: translations.compliances_breakdown_statusName,
          dataIndex: 'ndName',
          key: 'ndName',
          render: (item: any, row: any) => {
            return <EllipsisPopover lineClamp={2}> {row.nodeName}</EllipsisPopover>;
          },
        },

        {
          title: translations.scanner_detail_containerName,
          dataIndex: 'containerName',
          key: 'containerName',
          render: (item: any, row: any) => {
            return <TextHoverCopy lineClamp={2} text={item} />;
          },
        },
        {
          title: translations.health,
          dataIndex: 'containerStatus',
          key: 'containerStatus',
          render: (item: any, row: any) => {
            return <RenderTag type={item} />;
          },
        },
        {
          title: translations.cpu_utilization,
          dataIndex: 'cpu',
          key: 'cpu',
          render: (item: any, row: any) => {
            return item || '-';
          },
        },
        {
          title: translations.memory,
          dataIndex: 'mem',
          key: 'mem',
          render: (item: any, row: any) => {
            return item || '-';
          },
        },
        {
          title: translations.disk_io,
          dataIndex: 'blockIO',
          key: 'blockIO',
          render: (item: any, row: any) => {
            return item || '-';
          },
        },
        {
          title: translations.lastUpdated,
          dataIndex: 'metricsTimeStamp',
          key: 'metricsTimeStamp',
          render: (item: number, row: any) => {
            return getTime(item);
          },
        },
        {
          title: translations.heartbeat_time,
          dataIndex: 'heartbeat_time',
          key: 'heartbeat_time',
          render: (item: number, row: any) => {
            return getTime(row.lastUpdateTimeStamp);
          },
        },
        {
          title: translations.lastUpdated,
          dataIndex: 'lastUpdateTimeStamp',
          key: 'lastUpdateTimeStamp',
          render: (item: number, row: any) => {
            return getTime(item);
          },
        },
      ];
      return obj[activeKey].map((item: string) => {
        let node = find(arr, (ite) => ite.key === item);
        return node;
      });
    },
    [clusterList],
  );
  let ExceptRecord = (props: any) => {
    let { record = [] } = props;
    return (
      <TzTable
        tableLayout={'fixed'}
        className={'unhoverTable'}
        columns={getColumnsList('expand')}
        pagination={{ defaultPageSize: 5, showQuickJumper: true, hideOnSinglePage: true }}
        rowKey={'podName'}
        dataSource={record}
      />
    );
  };
  return (
    <>
      <FilterContext.Provider value={{ ...data }}>
        <div className="flex-r-c">
          <TzButton
            loading={btnLoading}
            onClick={() => {
              setBtnLoading(true);
              monitorRefresh({ component: type }).subscribe((res) => {
                setBtnLoading(false);
                if (res.error) return;
                getMonitorTotal();
                listRef.current.refresh();
                TzMessageSuccess(translations.refresh_successful);
              });
            }}
          >
            {translations.refresh_manually}
          </TzButton>
          <TzFilter />
        </div>
        <TzFilterForm className="mb12" onChange={handleChange} />
      </FilterContext.Provider>
      <TzTableServerPage
        tableLayout={'fixed'}
        columns={getColumnsList(type)}
        ref={listRef}
        rowKey={'podName'}
        reqFun={reqFun}
        expandable={
          type === Monitoring.holmes
            ? {
                expandRowByClick: true,
                columnWidth: 24,
                expandedRowRender: (item: any) => {
                  return <ExceptRecord record={item.containerData} />;
                },
              }
            : undefined
        }
      />
    </>
  );
};

export default ComponentMonitoringTab;
