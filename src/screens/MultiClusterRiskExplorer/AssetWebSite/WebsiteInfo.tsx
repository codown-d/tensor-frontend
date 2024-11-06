import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { TzCard } from '../../../components/tz-card';
import { Store } from '../../../services/StoreService';
import { translations } from '../../../translations/translations';
import { TzTable, TzTableServerPage } from '../../../components/tz-table';
import ArtTemplateDataInfo from '../../../components/ComponentsLibrary/ArtTemplateDataInfo';
import useListClusters from '../useListClusters';
import ContainerTable from '../ListComponent/Container';
import { assetsWebsiteDetail } from '../../../services/DataService';
import EllipsisPopover from '../../../components/ellipsisPopover/ellipsisPopover';

// 基本信息字段
const BaseInfoAttrs = [
  {
    serveKey: 'protocol',
    title: translations.clusterGraphList_containerDetail_protocol,
  },
  {
    serveKey: 'svcName',
    title: translations.service_type,
  },
  {
    serveKey: 'rootDir',
    title: translations.home_directory_path,
  },
  {
    serveKey: 'user',
    title: translations.start_user,
  },
  /** 暂时不做
  {
    serveKey: 'null',
    title: translations.owner_permission,
  },***/
];

const columnsPort = [
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

const WebsiteInfo = () => {
  const [info, setInfo] = useState<any>({});
  const [result] = useSearchParams();
  const l = useLocation();
  const websiteId = result.get('websiteId') || '';
  const domain = result.get('domain') || '-';
  useEffect(() => {
    Store.header.next({
      title: domain,
    });
  }, [domain, l]);

  useEffect(() => {
    websiteId &&
      assetsWebsiteDetail(websiteId).subscribe((res) => {
        if (res.error) return;
        setInfo(res.getItem());
      });
  }, [websiteId]);

  const dataInfoList = useMemo(() => {
    if (!info) {
      return [];
    }
    return BaseInfoAttrs.map((item) => {
      return {
        ...item,
        title: item.title + '：',
        content: info[item.serveKey] || '-',
      };
    });
  }, [info]);

  const containerProps = useListClusters();

  return (
    <div className="mlr32 mt4 website-detail-wrap" style={{ paddingBottom: '40px' }}>
      <TzCard title={translations.compliances_breakdown_taskbaseinfo} bodyStyle={{ padding: '4px 0 0' }} id="info">
        <ArtTemplateDataInfo data={dataInfoList} span={2} />
      </TzCard>
      <TzCard
        className="t-bottom12"
        title={translations.microseg_segments_policy_port_title}
        style={{ marginTop: '20px' }}
        bordered
        bodyStyle={{ paddingTop: '0px' }}
        id="microseg_segments_policy_port_title"
      >
        <TzTable
          columns={columnsPort}
          className={'nohoverTable'}
          rowKey={'id'}
          dataSource={info?.ports}
          pagination={{ defaultPageSize: 5, showQuickJumper: true }}
        />
      </TzCard>

      {/*容器*/}
      <TzCard
        className="asset-website-info t-bottom12"
        title=""
        style={{ marginTop: '20px', paddingTop: '16px' }}
        bordered
        bodyStyle={{ paddingTop: '0px' }}
        id="container-table"
      >
        <div style={ContainerLabelCss}>{translations.clusterGraphList_container}</div>
        <ContainerTable {...containerProps} hideLabel pageSize={5} containerIds={info?.ContainerIds || 'empty'} />
      </TzCard>
    </div>
  );
};

const ContainerLabelCss: any = {
  position: 'absolute',
  left: '24px',
  top: '23px',
  fontSize: '16px',
  fontWeight: 550,
};

export default WebsiteInfo;
