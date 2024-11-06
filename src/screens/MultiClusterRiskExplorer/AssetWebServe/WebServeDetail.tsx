import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { TzCard } from '../../../components/tz-card';
import { Store } from '../../../services/StoreService';
import { translations } from '../../../translations/translations';
import { TzTable, TzTableServerPage } from '../../../components/tz-table';
import ArtTemplateDataInfo from '../../../components/ComponentsLibrary/ArtTemplateDataInfo';
import { assetsWebServeDetail, getHistory } from '../../../services/DataService';
import moment from 'moment/moment';
import { Routes } from '../../../Routes';
import EllipsisPopover from '../../../components/ellipsisPopover/ellipsisPopover';
import { TzButton } from '../../../components/tz-button';
import { EllipsisMoreDrawer } from '../components';

// 基本信息字段
const BaseInfoAttrs = [
  {
    serveKey: 'containerName',
    title: translations.scanner_detail_containerName,
  },
  {
    serveKey: 'podName',
    title: translations.notificationCenter_details_podName,
  },
  {
    serveKey: 'svcType',
    title: translations.service_type,
  },
  {
    serveKey: 'svcVersion',
    title: translations.service_version,
  },
  {
    serveKey: 'user',
    title: translations.start_user,
  },
  // {
  //   serveKey: 'userGroup',
  //   title: translations.group,
  // },
  {
    serveKey: 'binaryDir',
    title: translations.binary_file_path,
  },
  {
    serveKey: 'logDir',
    title: translations.access_log_path,
  },
  {
    serveKey: 'configDir',
    title: translations.configuration_file_path,
  },
];

const ColumnsPort = [
  {
    title: translations.clusterGraphList_containerDetail_portName,
    dataIndex: 'Name',
    render: (item: string, row: any) => <EllipsisPopover lineClamp={2}>{item || '-'}</EllipsisPopover>,
  },
  {
    title: translations.clusterGraphList_containerDetail_containerPorts,
    dataIndex: 'ContainerPort',
    render: (v: any) => v || '-',
  },
  {
    title: translations.clusterGraphList_containerDetail_hostPort,
    dataIndex: 'HostPort',
    render: (v: any) => v || '-',
  },
  {
    title: translations.calico_protocol,
    dataIndex: 'Proto',
    render: (v: string) => v || '-',
  },
  {
    title: translations.clusterGraphList_detailContainer_cIP,
    dataIndex: 'ContainerIP',
    render: (item: string, row: any) => <EllipsisPopover lineClamp={2}>{item || '-'}</EllipsisPopover>,
  },
  {
    title: translations.clusterGraphList_detailContainer_hostIP,
    dataIndex: 'HostIP',
    render: (item: string, row: any) => <EllipsisPopover lineClamp={2}>{item || '-'}</EllipsisPopover>,
  },
];

// 进程列表
const ColumnsProcess = [
  {
    title: translations.clusterGraphList_detailContainer_processName,
    dataIndex: 'comm',
    width: '20%',
    render: (item: string, row: any) => <EllipsisPopover lineClamp={2}>{item || '-'}</EllipsisPopover>,
  },
  {
    title: translations.clusterGraphList_detailContainer_hostPID,
    dataIndex: 'hostPid',
    width: '20%',
    render: (item: string, row: any) => <EllipsisPopover lineClamp={2}>{item || '-'}</EllipsisPopover>,
  },
  {
    title: translations.clusterGraphList_detailContainer_PID,
    dataIndex: 'containerPid',
    render: (item: string, row: any) => <EllipsisPopover lineClamp={2}>{item || '-'}</EllipsisPopover>,
  },
  {
    title: translations.clusterGraphList_detailContainer_user,
    dataIndex: 'userName',
    render: (item: string, row: any) => <EllipsisPopover lineClamp={2}>{item || '-'}</EllipsisPopover>,
  },
  {
    title: translations.clusterGraphList_detailContainer_startTime,
    dataIndex: 'startTime',
    key: 'startTime',
    width: 170,
    render: (time: any) => moment(time).format('YYYY-MM-DD HH:mm:ss'),
  },
];

const defPagination = {
  current: 1,
  pageSize: 5,
  hideOnSinglePage: true,
};

const rowKeyProcess = (item: any) => item.key;

const AnchorItems = [
  {
    href: '#info',
    title: translations.scanner_detail_tab_base,
  },
  {
    href: '#port',
    title: translations.chart_map_port,
  },
  {
    href: '#process',
    title: translations.process,
  },
];

export default () => {
  const [info, setInfo] = useState<any>({});
  const [result] = useSearchParams();
  const webServeId = result.get('webServeId') || '';
  if (!webServeId) {
    console.error('缺少 query.webServeId 参数');
  }

  const dataInfoList = useMemo(() => {
    if (!info) {
      return [];
    }
    return BaseInfoAttrs.map((item) => {
      const content = info[item.serveKey];
      let render;
      const isPodName = item.title === translations.notificationCenter_details_podName;
      if (isPodName || translations.scanner_detail_containerName === item.title) {
        let targetUrl = `${Routes.RiskGraphListContainerDetail}?containerID=${info.rawContainerId}&ClusterID=${info.clusterKey}`;
        if (isPodName) {
          targetUrl = `${Routes.RiskGraphListPodDetail}?PodUID=${info.PodUID ?? ''}&PodName=${
            info.podName ?? ''
          }&ClusterID=${info.clusterKey}`;
        }
        render = () =>
          !content ? (
            '-'
          ) : (
            <Link style={{ width: '100%', display: 'inherit' }} to={targetUrl}>
              <TzButton style={{ maxWidth: '100%' }} type={'text'}>
                <EllipsisPopover>{content}</EllipsisPopover>
              </TzButton>
            </Link>
          );
      }
      return {
        ...item,
        title: item.title + '：',
        content,
        render,
      };
    });
  }, [info]);

  const cmdRow: any = useMemo(() => {
    if (!info) {
      return [];
    }
    return [
      {
        title: translations.cmd_parameter + '：',
        titleStyle: { alignItems: 'left' },
        render: () => <EllipsisMoreDrawer title={translations.cmd_parameter} content={info?.cmd} />,
        // render = () => (<EllipsisPopover overlayClassName="tooltip-webserve-a0">{content || '-'}</EllipsisPopover>),
      },
    ];
  }, [info?.cmd]);

  // const reqFunProcess = useCallback(
  //   (pagination) => {
  //     const { current = 1, pageSize = 10 } = pagination;
  //     const offset = (current - 1) * pageSize;
  //     return getHistory().pipe(
  //       map((res) => {
  //         const items = info?.processes || [];
  //         const datas = items.slice(offset, offset + pageSize);
  //         return {
  //           data: datas,
  //           total: items.length,
  //         };
  //       }),
  //     );
  //   },
  //   [info?.processes],
  // );

  const l = useLocation();
  useEffect(() => {
    Store.header.next({ title: translations.web_serve_info });
  }, [l]);
  useEffect(() => {
    assetsWebServeDetail(webServeId).subscribe((res) => {
      if (res.error) return;
      setInfo(res.getItem());
    });
  }, [webServeId]);

  return (
    <div className="mlr32 mt4" style={{ paddingBottom: '40px' }}>
      <TzCard title={translations.compliances_breakdown_taskbaseinfo} bodyStyle={{ padding: '4px 0 0' }}>
        <ArtTemplateDataInfo data={dataInfoList} span={2} />
        <ArtTemplateDataInfo data={cmdRow} span={1} />
      </TzCard>
      <TzCard
        className="t-bottom12"
        title={translations.microseg_segments_policy_port_title}
        style={{ marginTop: '20px' }}
        bordered
        bodyStyle={{ paddingTop: '0px' }}
      >
        <TzTable
          columns={ColumnsPort}
          className={'nohoverTable'}
          rowKey={'id'}
          dataSource={info?.ports}
          pagination={{ defaultPageSize: 5, showQuickJumper: true }}
        />
      </TzCard>
      <TzCard
        className="t-bottom12"
        title={translations.clusterGraphList_detail_process}
        style={{ marginTop: '20px' }}
        bordered
        bodyStyle={{ paddingTop: '0px' }}
      >
        <TzTable
          columns={ColumnsProcess}
          className={'nohoverTable'}
          rowKey="HostPort"
          dataSource={info?.processes}
          pagination={{ defaultPageSize: 5, showQuickJumper: true }}
        />
      </TzCard>
    </div>
  );
};
