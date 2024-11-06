import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TzCard } from '../../../components/tz-card';
import { TzTableServerPage } from '../../../components/tz-table';
import { TzInputSearch } from '../../../components/tz-input-search';
import { getPodsList, superAdminUserList } from '../../../services/DataService';
import { map, tap } from 'rxjs/operators';
import './DetailTabInfo.scss';
import { escapeString, SearchObj } from '../GraphResFilterHelper';
import { translations } from '../../../translations/translations';
import { Link, useNavigate } from 'react-router-dom';
import { Routes } from '../../../Routes';
import { RenderTableContianerTemp } from '../MultiDetailsTab/DetailTabInfo';
import { getClusterName, useAssetsClusterList } from '../../../helpers/use_fun';
import EllipsisPopover from '../../../components/ellipsisPopover/ellipsisPopover';
import ArtTemplateDataInfo from '../../../components/ComponentsLibrary/ArtTemplateDataInfo';
import moment from 'moment';
import { TzCol, TzRow } from '../../../components/tz-row-col';
import { Resources } from '../../../Resources';
import AssetTopSpace from '../../../components/AssetModule/TopSpace';
import { JumpResource, useJumpResourceFn } from '../components';

interface IProps {
  setHeader: any;
  children?: any;
  history?: any;
  paramData?: any;
  paramObj: SearchObj;
  initFatch?: (clusterID: string) => void;
}

const defPagination = {
  current: 1,
  pageSize: 5,
  hideOnSinglePage: true,
};

export const DetailTabNodeInfo = (props: IProps) => {
  const {
    paramData: { HostName = '' },
    paramObj: { ClusterID: clusterID = '' },
  } = props;
  const tablelistRef = useRef<any>(null);
  const [search, setSearch] = useState('');
  const clusterList = useAssetsClusterList();
  const navigate = useNavigate();

  const tableObj = useMemo(() => {
    let data: any = {
      ClusterKey: translations.clusterManage_key,
      NodeIP: 'IP',
      OsImage: translations.clusterGraphList_nodeInfo_version,
      OsInfo: translations.clusterGraphList_nodeInfo_kernelVersion,
      ContainerRuntimeVersion: translations.clusterGraphList_nodeInfo_runtimeVersion,
      Cpu: translations.cpu_usage,
      Memory: translations.memory_usage,
      Disk: translations.disk_usage,
    };
    let { paramData } = props;
    return Object.keys(data).map((item) => {
      let o: any = {
        title: data[item] + '：',
        content: paramData[item] || '-',
      };
      if ('ClusterKey' === item) {
        o['render'] = (row: any) => {
          return getClusterName(paramData[item]);
        };
      }
      return o;
    });
  }, [props.paramData, clusterList]);

  const onSearch = useCallback((value: string) => {
    tablelistRef.current.initPage();
    setSearch(value);
  }, []);

  const reqFun = useCallback(
    (pagination, filter) => {
      const { current = 1, pageSize = 5 } = pagination;
      const offset = (current - 1) * pageSize;
      return getPodsList(clusterID, HostName, pageSize, offset).pipe(
        map((res) => {
          const items = res.getItems();
          const podsList = items
            .slice(0)
            .filter((t: any) => t.PodName.toLowerCase().includes(search.toLowerCase()) || !search)
            .filter(
              (t: any) => !filter || !filter.ResourceKind || filter.ResourceKind.join('').includes(t.ResourceKind),
            );
          const sliceItem = podsList.slice(offset, current * pageSize);
          return {
            data: sliceItem,
            total: podsList.length,
          };
        }),
      );
    },
    [search],
  );

  const rowKey = useCallback((item: any) => {
    return item.PodName;
  }, []);

  const columns = useMemo(() => {
    return [
      {
        title: translations.clusterGraphList_tabInfo_podName,
        dataIndex: 'PodName',
        width: '25%',
        render: (item: any, row: any) => {
          return (
            <>
              <div style={{ maxWidth: '100%', display: 'inline-flex' }} className="hoverBtn">
                <EllipsisPopover title={item || '-'}>
                  <span
                    onClick={async (event) => {
                      event.stopPropagation();
                      navigate(`${Routes.RiskGraphListPodDetail}?PodName=${item}&PodUID=${row.PodUID ?? ''}`);
                      return;
                    }}
                  >
                    {item}
                  </span>
                </EllipsisPopover>
              </div>
            </>
          );
        },
      },
      {
        title: translations.clusterGraphList_nodeInfo_fromResource,
        dataIndex: 'ResourceName',
        width: '25%',
        render: (item: any, row: any) => {
          return (
            <JumpResource name={item} namespace={row.namespace} clusterKey={clusterID} kind={row.kind} title={item} />
          );
        },
      },
      {
        title: translations.clusterGraphList_tabInfo_containerType,
        dataIndex: 'ResourceKind',
        width: '20%',
        filters: [
          { text: 'Deployment', value: 'Deployment' },
          { text: 'StatefulSet', value: 'StatefulSet' },
          { text: 'ReplicaSet', value: 'ReplicaSet' },
          { text: 'Job', value: 'Job' },
          { text: 'DeamonSet', value: 'DeamonSet' },
          { text: 'Pod', value: 'Pod' },
          { text: 'CronJob', value: 'CronJob' },
          { text: 'ReplicationController', value: 'ReplicationController' },
        ],
      },
      {
        title: translations.clusterGraphList_namespace,
        dataIndex: 'Namespace',
        render: (item: any, row: any) => {
          return (
            <>
              <div className="hoverBtn dib" onClick={(e) => e.stopPropagation()}>
                <Link
                  // target="_blank"
                  to={
                    Routes.ClustersOnlineVulnerabilitiesDetails +
                    `?type=namespace&NSName=${row.Namespace}&ClusterID=${escapeString(clusterID)}`
                  }
                >
                  {item}
                </Link>
              </div>
            </>
          );
        },
      },
      {
        title: translations.clusterGraphList_tabInfo_createTime,
        dataIndex: 'CreatedAt',
        width: '10%',
        render: (item: string) => {
          return moment(item).format('YYYY-MM-DD HH:mm:ss');
        },
      },
    ];
  }, [clusterID]);
  const SpaceItems = useMemo(() => {
    let mockDataNew: any = {
      ImageCount: {
        img: Resources.AssetImages,
        txt: translations.number_images,
      },
      ContainerCount: {
        img: Resources.AssetContainer,
        txt: translations.number_containers,
      },
      PodCount: {
        img: Resources.AssetPod,
        txt: translations.number_pods,
      },
    };
    return Object.keys(mockDataNew)
      .filter((item) => !window.REACT_APP_ASSET_MODULE.includes(item))
      .map((t) => {
        let { img, txt } = mockDataNew[t];
        let num = props.paramData[t];
        return (
          <TzCol span={6}>
            <div
              className={`flex-r-c ${t}`}
              style={{ overflow: 'hidden', paddingLeft: 24, paddingRight: 24, height: 80 }}
            >
              <div className={'flex-r-c img-content'}>
                <img alt="" src={img} style={{ width: 30, height: 30, borderRadius: '52px' }} />
              </div>
              <div className="" style={{ textAlign: 'center' }}>
                <p className="num-txt">{num}</p>
                <p className="des-txt">{txt}</p>
              </div>
            </div>
          </TzCol>
        );
      });
  }, [props.paramData]);
  return (
    <div className="details-info-case detail-tab-info mt20">
      <AssetTopSpace type={'pods'} data={props.paramData} clusterID={clusterID}></AssetTopSpace>
      <div className="details-content-case">
        <TzCard
          title={translations.runtimePolicy_drawer_title_detail}
          style={{ marginTop: '20px' }}
          id="info"
          bordered
          bodyStyle={{ padding: '4px 0 0' }}
        >
          <ArtTemplateDataInfo className={'wauto info-art-span2'} data={tableObj} span={2} />
        </TzCard>
        <TzCard
          title={translations.clusterGraphList_nodeInfo_schedulingInfo}
          extra={<TzInputSearch placeholder={translations.chart_map_searchPod} onSearch={onSearch} />}
          style={{ marginTop: '20px' }}
          id="container"
          bordered
          bodyStyle={{ paddingTop: '0px' }}
        >
          <TzTableServerPage
            columns={columns}
            tableLayout={'fixed'}
            defaultPagination={defPagination}
            rowKey={rowKey}
            reqFun={reqFun}
            ref={tablelistRef}
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
            equalServerPageAnyway={false}
          />
        </TzCard>
      </div>
    </div>
  );
};
