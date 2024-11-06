import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { TzCard } from '../../../components/tz-card';
import { map, tap } from 'rxjs/operators';
import { Store } from '../../../services/StoreService';
import { assetsServicesDetail, podsBySvc } from '../../../services/DataService';
import { translations } from '../../../translations/translations';
import { TzTable, TzTableServerPage } from '../../../components/tz-table';
import ArtTemplateDataInfo from '../../../components/ComponentsLibrary/ArtTemplateDataInfo';
import { of } from 'rxjs';
import TzInputSearch from '../../../components/tz-input-search';
import { getClusterName } from '../../../helpers/use_fun';
import { JumpPod, JumpNamespace, JumpEndpoint, JumpNode } from '../components';
import TzAnchor, { useAnchorItem } from '../../../components/ComponentsLibrary/TzAnchor';
import { RenderTableContianerTemp } from '../MultiDetailsTab/DetailTabInfo';
import { getTime } from '../../../helpers/until';
let items = [
  {
    href: '#info',
    title: <>{translations.clusterGraphList_detail_info}</>,
  },
  {
    href: '#scanner_images_tag',
    title: <>{translations.scanner_images_tag}</>,
  },
  {
    href: '#microseg_segments_policy_port_title',
    title: <>{translations.microseg_segments_policy_port_title}</>,
  },
  {
    href: '#associate_pods',
    title: <>{translations.associate_pods}</>,
  },
];
const ServiceInfo = (props: any) => {
  const [info, setInfo] = useState<any>(null);
  const [searchPod, setSearchPod] = useState('');
  const [search, setSearch] = useState('');
  const [result] = useSearchParams();
  let [query] = useState({
    cluster_key: result.get('cluster_key') || '',
    namespace: result.get('namespace') || '',
    service_name: result.get('service_name') || '',
  });

  let getAssetsServicesInfo = useCallback(() => {
    assetsServicesDetail(query).subscribe((res) => {
      if (res.error) return;
      let item = res.getItem();
      setInfo(item);
    });
  }, [query]);
  const l = useLocation();
  const setHeader = useCallback(() => {
    Store.header.next({
      title: info?.name,
    });
  }, [info, l]);
  useEffect(() => {
    setHeader();
  }, [setHeader]);
  // useActivate(() => {
  //   setHeader();
  // });
  useEffect(() => {
    getAssetsServicesInfo();
  }, [getAssetsServicesInfo]);
  const reqFun2 = useCallback(
    (pagination) => {
      if (!info?.id) {
        return of(undefined);
      }
      const { current = 1, pageSize = 10 } = pagination;
      const offset = (current - 1) * pageSize;
      let params = {
        offset,
        limit: pageSize,
        query: searchPod,
      };
      return podsBySvc({
        cluster_key: info.clusterKey,
        namespace: info.namespace,
        svc_name: info.name,
        ...params,
      }).pipe(
        map((res) => {
          const items = res.getItems();
          return {
            data: items,
            total: res.data?.totalItems,
          };
        }),
      );
    },
    [info, searchPod],
  );
  const columns = useMemo(() => {
    let items = [
      {
        title: translations.label_name,
        dataIndex: 'LabelName',
      },
      {
        title: translations.label_value,
        dataIndex: 'LabelValue',
      },
    ];
    return items;
  }, []);
  const columnsPort = useMemo(() => {
    let items = [
      {
        title: translations.compliances_policyDetails_name,
        dataIndex: 'name',
      },
      {
        title: translations.calico_protocol,
        dataIndex: 'protocol',
      },
      {
        title: translations.exposing_ports,
        dataIndex: 'port',
      },
      {
        title: translations.clusterGraphList_containerDetail_containerPorts,
        dataIndex: 'targetPort',
      },
    ];
    return items;
  }, []);
  const columnsPod = useMemo(() => {
    return [
      {
        title: translations.scanner_detail_pod_name,
        dataIndex: 'PodName',
        render: (item: string, row: any) => {
          return (
            <JumpPod PodName={row.PodName} namespace={row.Namespace} clusterKey={row.ClusterKey} title={row.PodName} />
          );
        },
      },
      {
        title: 'Pod IP',
        dataIndex: 'PodIP',
      },
      {
        title: translations.compliances_breakdown_dotname,
        dataIndex: 'NodeName',
        render: (item: string, row: any) => {
          return <JumpNode namespace={row.NodeName} clusterKey={row.ClusterKey} title={row.NodeName} />;
        },
      },
      {
        title: translations.clusterManage_createtime,
        dataIndex: 'CreatedAt',
        render: (CreatedAt: string) => {
          return getTime(CreatedAt);
        },
      },
    ];
  }, []);

  const dataInfoList = useMemo(() => {
    if (!info) {
      return [];
    }
    const obj: any = {
      type: translations.clusterGraphList_webType + '：',
      clusterIp: translations.cluster_IP + '：',
      portsStr: translations.microseg_segments_policy_port_title + '：',
      clusterKey: translations.clusterManage_key + '：',
      namespace: translations.onlineVulnerability_outerShapeMeaning + '：',
      name: 'Endpoints：',
      CreatedAt: translations.clusterManage_createtime + '：',
    };
    return Object.keys(obj).map((item) => {
      let o: any = {
        title: obj[item] || '-',
        content: info[item] || '-',
      };
      if ('namespace' === item) {
        o['render'] = () => {
          return <JumpNamespace namespace={info.namespace} clusterKey={info.clusterKey} title={info.namespace} />;
        };
      }
      if ('name' === item) {
        o['render'] = () => {
          return <JumpEndpoint clusterKey={info.clusterKey} namespace={info.namespace} name={info.name} />;
        };
      }
      if ('clusterKey' === item) {
        o['render'] = () => {
          return getClusterName(info[item]);
        };
      }
      if ('CreatedAt' === item) {
        o['render'] = () => {
          return getTime(info[item]);
        };
      }
      return o;
    });
  }, [info]);
  let getdataSourceLabels = useMemo(() => {
    return (
      info?.labels?.filter((item: any) => {
        return item.LabelName.indexOf(search) !== -1 || item.LabelValue.indexOf(search) !== -1;
      }) || []
    );
  }, [info?.labels, search]);
  let { getPageKey } = useAnchorItem();
  return (
    <div className="asset-service-info mlr32 mt4">
      <div className="flex-r">
        <div style={{ flex: 1, width: 0 }} className="mb40">
          <TzCard
            title={translations.compliances_breakdown_taskbaseinfo}
            bodyStyle={{ paddingBottom: '0px' }}
            id={getPageKey('info')}
          >
            <ArtTemplateDataInfo data={dataInfoList} span={2} rowProps={{ gutter: [0, 0] }} />
          </TzCard>
          <TzCard
            title={translations.scanner_images_tag}
            extra={
              <TzInputSearch
                placeholder={translations.unStandard.str272}
                allowClear
                onChange={(val: any) => setSearch(val)}
              />
            }
            style={{ marginTop: '20px' }}
            bordered
            bodyStyle={{ paddingTop: '0px' }}
            id={getPageKey('scanner_images_tag')}
          >
            <TzTable
              className={'nohoverTable'}
              columns={columns}
              rowKey={'id'}
              dataSource={getdataSourceLabels}
              pagination={{ defaultPageSize: 5, showQuickJumper: true }}
            />
          </TzCard>
          <TzCard
            title={translations.microseg_segments_policy_port_title}
            style={{ marginTop: '20px' }}
            bordered
            bodyStyle={{ paddingTop: '0px' }}
            id={getPageKey('microseg_segments_policy_port_title')}
          >
            <TzTable
              columns={columnsPort}
              className={'nohoverTable'}
              rowKey={'id'}
              dataSource={info?.ports}
              pagination={{ defaultPageSize: 5, showQuickJumper: true }}
            />
          </TzCard>
          <TzCard
            title={translations.associate_pods}
            extra={
              <TzInputSearch
                placeholder={translations.unStandard.str272}
                allowClear
                onChange={(val: any) => setSearchPod(val)}
              />
            }
            style={{ marginTop: '20px' }}
            bordered
            bodyStyle={{ paddingTop: '0px' }}
            id={getPageKey('associate_pods')}
          >
            <TzTableServerPage
              columns={columnsPod}
              rowKey={'id'}
              reqFun={reqFun2}
              expandable={{
                expandedRowRender: (record) => {
                  const { ClusterKey, Namespace, PodName, ResourceName } = record;
                  const paramData = {
                    cluster_key: ClusterKey,
                    namespace: Namespace,
                    pod_name: PodName,
                    resource_name: ResourceName,
                  };
                  return <RenderTableContianerTemp paramData={paramData} />;
                },
              }}
              defaultPagination={{
                current: 1,
                pageSize: 5,
              }}
            />
          </TzCard>
        </div>
        <TzAnchor items={items} />
      </div>
    </div>
  );
};

export default ServiceInfo;
