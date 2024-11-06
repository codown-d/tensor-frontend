import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { TzCard } from '../../../components/tz-card';
import { TimeFormat, WebResponse } from '../../../definitions';
import { map, tap } from 'rxjs/operators';
import { Store } from '../../../services/StoreService';
import { getContainerGraphOne, getHistory, getListClusters } from '../../../services/DataService';
import { RenderTag } from '../../../components/tz-tag';
import EllipsisPopover from '../../../components/ellipsisPopover/ellipsisPopover';
import { translations, localLang } from '../../../translations/translations';
import { TzTableServerPage } from '../../../components/tz-table';
import moment from 'moment';
import '../ListDetailsScreens/PodDetail.scss';
import '../MultiClusterRiskExplorerGraphDetails.scss';
import './ContainerDetailScreen.scss';
import ArtTemplateDataInfo from '../../../components/ComponentsLibrary/ArtTemplateDataInfo';
import TzAnchor, { useAnchorItem } from '../../../components/ComponentsLibrary/TzAnchor';
import EventDataList from '../../AlertCenter/EventDataList';
import { TzDrawer } from '../../../components/tz-drawer';
import { useMemoizedFn, useSize } from 'ahooks';
import useNewSearchParams from '../../../helpers/useNewSearchParams';
import { find, isEqual } from 'lodash';
import { filtersRepairable } from '../../ImagesScanner/components/Image-scanner-detail/ImagesScannerDetail';
import { useAssetsClusterList } from '../../../helpers/use_fun';
import { bytesToSize } from '../../../helpers/until';
import { JumpNamespace, JumpNode, JumpPod, JumpResource } from '../components';
import { statusValToKey } from '../ListComponent/util';
import GridDetailsV3 from '../../MultiClusterGridMap/GridChartMapV3';

interface EProps {
  children?: any;
  history?: any;
  environment?: any[];
}

const dropInitials: any = {
  namespace: 'namespace',
  resourceName: 'resource',
};

const defPagination = {
  current: 1,
  pageSize: 5,
  hideOnSinglePage: true,
};

const items = [
  {
    href: '#base',
    title: <>{translations.clusterGraphList_detailed_info}</>,
  },
  {
    href: '#mount',
    title: <>{translations.clusterGraphList_detail_mount}</>,
  },
  {
    href: '#ports',
    title: <>{translations.clusterGraphList_detail_port}</>,
  },
  {
    href: '#process',
    title: <>{translations.clusterGraphList_detail_process}</>,
  },
  {
    href: '#topology',
    title: <>{translations.clusterGraphList_detail_topology}</>,
  },
  {
    href: '#securityEvents',
    title: <>{translations.security_events}</>,
  },
];

const EnvironmentInfo = (props: EProps) => {
  const { environment } = props;
  const items = environment || [];
  return (
    <>
      {items.map((t) => {
        return (
          <span
            style={{
              display: 'block',
              color: '#3E4653',
              marginBottom: '12px',
              wordWrap: 'break-word',
            }}
          >
            {t}
          </span>
        );
      })}
    </>
  );
};

const ContainerDetail = (props: any) => {
  const navigate = useNavigate();
  const [result] = useSearchParams();
  const tablelistMountRef = useRef<any>(null);
  const tablelistPortRef = useRef<any>(null);
  const rowBoxRef = useRef<HTMLDivElement>(null);
  const rowTxtRef = useRef<HTMLDivElement>(null);
  const tablelistProcessRef = useRef<any>(null);
  const [baseInfo, setInfo] = useState<any>(null);
  const [query, setQuery] = useState({
    id: result.get('containerID'),
    clusterID: result.get('ClusterID'),
  });
  const [showVariate, setShowVariate] = useState<boolean>(false);
  const [envList, setEnvList] = useState<any[]>([]);
  const [showMore, setShowMore] = useState(false);
  const { width: rowBoxW = 0 } = useSize(rowBoxRef) ?? {};
  const { width: rowTxtW = 0 } = useSize(rowTxtRef) ?? {};
  useEffect(() => {
    setShowMore(rowTxtW > rowBoxW);
  }, [rowBoxW, rowTxtW]);

  let getContainerGraphOneFn = useMemoizedFn(() => {
    if (!query.id) return;
    getContainerGraphOne(query).subscribe((res) => {
      if (res.error) return;
      const item = res.getItem();
      setInfo(item);
    });
  });
  useEffect(() => {
    getContainerGraphOneFn();
  }, [query]);

  let listCluster = useAssetsClusterList();
  const clusterName = useMemo(() => {
    let node = find(listCluster, (item) => {
      return item.value === baseInfo?.clusterKey;
    });
    return node?.label || '-';
  }, [listCluster, baseInfo]);

  const dataCreateInfo = useMemo(() => {
    if (!baseInfo) return [];
    const obj: any = {
      k8sManaged: `${translations.clusterGraphList_detailContainer_k8sManaged}：`,
      id: `${translations.clusterGraphList_detailContainer_containerid}：`,
      clusterKey: `${translations.clusterGraphList_cluster}：`,
      nodeName: `${translations.clusterGraphList_node}：`,
      nodeIP: `${translations.clusterGraphList_detailContainer_nodeIP}：`,
      namespace: `${translations.clusterGraphList_namespace}：`,
      resourceName: `${translations.resources}：`,
      podName: `${translations.clusterGraphList_detailContainer_podName}：`,
      image: `${translations.clusterGraphList_detailContainer_imageName}：`,
      imageDigest: `${translations.clusterGraphList_detailContainer_imageDigest}：`,
      imageCreated: `${translations.clusterGraphList_detailContainer_createTime}：`,
      imageSize: `${translations.clusterGraphList_detailContainer_imageData}：`,
      path: `${translations.clusterGraphList_detailContainer_path}：`,
      cmd: `${translations.clusterGraphList_detailContainer_cmd}：`,
      reservedCPU: `${translations.clusterGraphList_detailContainer_reservedCPU}：`,
      reservedMemory: `${translations.clusterGraphList_detailContainer_reservedMemory}：`,
      arguments: `${translations.clusterGraphList_detailContainer_arguments}：`,
      user: `${translations.clusterGraphList_detailContainer_user}：`,
      storageType: `${translations.storage_mode}：`,
      networkMode: `${translations.clusterGraphList_detailContainer_webMode}：`,
      gateway: `${translations.clusterGraphList_detailContainer_webPath}：`,
      ip: `${translations.clusterGraphList_detailContainer_ip}：`,
      mac: `${translations.clusterGraphList_detailContainer_mac}：`,
      ipv6: `${translations.clusterGraphList_detailContainer_ipv6}：`,
      FrameworkStr: `${translations.frame_info}：`,
      FrameworkPath: `${translations.frame_path}：`,
      createdAt: `${translations.clusterGraphList_tabInfo_createTime}：`,
      runningStatus: `${translations.run_status}：`,
    };
    return Object.keys(obj).map((item) => {
      let o: any = {
        title: obj[item] || '-',
        content: baseInfo?.[item] || '-',
      };
      if (item === 'clusterKey') {
        o['render'] = () => {
          return clusterName;
        };
      }
      if (item === 'resourceName') {
        o['render'] = () => {
          let { namespace, resourceName, clusterKey, resourceKind } = baseInfo;
          return (
            <JumpResource
              name={resourceName}
              kind={resourceKind}
              namespace={namespace}
              clusterKey={clusterKey}
              title={resourceName}
            />
          );
        };
      }
      if (item === 'namespace') {
        o['render'] = () => {
          return baseInfo?.[item] ? (
            <JumpNamespace
              namespace={baseInfo?.namespace}
              clusterKey={baseInfo?.clusterKey}
              title={baseInfo?.namespace}
            />
          ) : (
            '-'
          );
        };
      }
      if (item === 'nodeName') {
        o['render'] = () => {
          return baseInfo?.[item] ? (
            <JumpNode namespace={baseInfo?.nodeName} clusterKey={baseInfo?.clusterKey} title={baseInfo?.nodeName} />
          ) : (
            '-'
          );
        };
      }
      if (item === 'podName') {
        o['render'] = () => {
          // status 为5 表示 pod退出 不存在了
          if (baseInfo?.status === 5) {
            return '-';
          }
          return baseInfo?.[item] && baseInfo?.[item] !== '-' ? (
            <JumpPod
              PodName={baseInfo?.podName}
              namespace={baseInfo?.namespace}
              clusterKey={baseInfo?.clusterKey}
              title={baseInfo?.podName}
            />
          ) : (
            '-'
          );
        };
      }
      if (item === 'k8sManaged') {
        o['render'] = () => {
          return baseInfo?.[item]
            ? translations.clusterGraphList_containerInfo_k8scontainer
            : translations.clusterGraphList_containerInfo_unk8scontainer;
        };
      }
      if (item === 'cmd') {
        o['render'] = () => {
          return <EllipsisPopover>{(baseInfo?.[item] || []).join(',')}</EllipsisPopover>;
        };
      }
      if (item === 'reservedCPU') {
        o['render'] = () => {
          return baseInfo?.[item] ? Math.floor(baseInfo?.[item]) + 'm' : '-';
        };
      }
      if (item === 'imageCreated') {
        o['render'] = () => {
          return moment(baseInfo?.[item]).format(TimeFormat);
        };
      }
      if (item === 'imageSize') {
        o['render'] = () => {
          return baseInfo?.[item] ? bytesToSize(baseInfo?.[item]) : '-';
        };
      }
      if (item === 'reservedMemory') {
        o['render'] = () => {
          return baseInfo?.[item] ? bytesToSize(baseInfo?.[item]) : '-';
        };
      }
      if (item === 'networkMode') {
        o['render'] = () => {
          return baseInfo?.[item]?.includes('container')
            ? 'container' + translations.clusterGraphList_detailContainer_mode
            : baseInfo?.[item] + translations.clusterGraphList_detailContainer_mode;
        };
      }
      if (item === 'arguments') {
        o['render'] = () => {
          return baseInfo?.[item] ? <EllipsisPopover>{baseInfo?.[item]?.join('、')}</EllipsisPopover> : '-';
        };
      }
      if (item === 'createdAt') {
        o['render'] = () => {
          return moment(baseInfo?.[item]).format(TimeFormat);
        };
      }
      if (item === 'runningStatus') {
        o['render'] = () => {
          return baseInfo?.statusDesc ?? '-';
        };
      }
      return o;
    });
  }, [baseInfo, clusterName]);

  const dataRemarkInfo = useMemo(() => {
    let wsDom = baseInfo?.environment?.map((t: any) => {
      return (
        <span
          className={'ml40'}
          style={{
            width: 'auto',
            whiteSpace: 'nowrap',
          }}
        >
          {t}
        </span>
      );
    });
    return [
      {
        title: translations.clusterGraphList_detailContainer_envir + '：',
        titleStyle: { alignItems: 'center' },
        render: () => {
          return (
            <div ref={rowBoxRef} className={'detail-container-envir flex-r'} style={{ width: '100%' }}>
              <div
                className={`df dfac detail-container-envir-item ${showMore ? 'envir-more' : ''}`}
                style={{
                  position: 'relative',
                  width: '0',
                  flex: 1,
                  overflow: 'hidden',
                  display: 'inline-flex',
                }}
              >
                <div
                  ref={rowTxtRef}
                  className={`df dfac ml-40`}
                  style={{
                    display: 'inline-flex',
                  }}
                >
                  {wsDom}
                </div>
              </div>
              {showMore && (
                <span
                  className="more-btn hoverBtn ml16"
                  onClick={() => {
                    setShowVariate(true);
                    setEnvList(baseInfo?.environment);
                  }}
                >
                  {translations.clusterGraphList_detailContainer_seeMore}
                </span>
              )}
            </div>
          );
        },
      },
    ] as any;
  }, [baseInfo, showVariate, showMore]);

  const reqFunMount = useCallback(
    (pagination) => {
      const { current = 1, pageSize = 10 } = pagination;
      const offset = (current - 1) * pageSize;
      return getHistory().pipe(
        map(() => {
          const items = baseInfo?.volumeMounts || [];
          const datas = items.slice(offset, offset + pageSize);
          return {
            data: datas,
            total: items?.length,
          };
        }),
      );
    },
    [baseInfo],
  );
  const rowKeyMount = useCallback((item: any) => {
    return item.key;
  }, []);
  const columnsMount = useMemo(() => {
    let items = [
      {
        title: translations.clusterGraphList_detailContainer_sourcePath,
        dataIndex: 'SourcePath',
        width: '15%',
        render: (item: string, row: any) => {
          return (
            <div className="ofh" style={{ maxWidth: '160px', cursor: 'pointer' }}>
              <EllipsisPopover>{item || '-'}</EllipsisPopover>
            </div>
          );
        },
      },
      {
        title: translations.clusterGraphList_detailContainer_mountPath,
        dataIndex: 'mountPath',
        width: '15%',
        render: (item: string, row: any) => {
          return (
            <div className="ofh" style={{ maxWidth: '160px', cursor: 'pointer' }}>
              <EllipsisPopover>{item || '-'}</EllipsisPopover>
            </div>
          );
        },
      },
      {
        title: translations.clusterGraphList_detailContainer_volumeName,
        dataIndex: 'name',
        ellipsis: {
          showTitle: true,
        },
        render: (item: string, row: any) => {
          return <>{item || '-'}</>;
        },
      },
      {
        title: translations.clusterGraphList_detailContainer_dataMountMode,
        dataIndex: 'Type',
        render: (item: string, row: any) => {
          return <>{item || '-'}</>;
        },
      },
      {
        title: translations.clusterGraphList_detailContainer_readOnly,
        dataIndex: 'readOnly',
        render: (text: any) => {
          let node = find(filtersRepairable, (item) => item.value === text + '');
          return node?.text || text;
        },
      },
      {
        title: translations.clusterGraphList_detailContainer_childPath,
        dataIndex: 'subPath',
        ellipsis: {
          showTitle: true,
        },
        render: (item: string, row: any) => {
          return <>{item || '-'}</>;
        },
      },
    ];
    let subPathExprObj: any = {
      title: translations.clusterGraphList_detailContainer_childPathEx,
      dataIndex: 'subPathExpr',
      render: (item: string, row: any) => {
        return <>{item || '-'}</>;
      },
    };
    let mountPropagationObj: any = {
      title: translations.clusterGraphList_detailContainer_mountPropagationMode,
      dataIndex: 'mountPropagation',
      render: (item: string, row: any) => {
        return <>{item || '-'}</>;
      },
    };
    if (localLang === 'en') {
      subPathExprObj['width'] = '160px';
      mountPropagationObj['width'] = '180px';
    }
    items.push(subPathExprObj);
    items.push(mountPropagationObj);
    return items;
  }, []);

  const reqFunPort = useCallback(
    (pagination) => {
      const { current = 1, pageSize = 10 } = pagination;
      const offset = (current - 1) * pageSize;
      return getHistory().pipe(
        map((res) => {
          const items = baseInfo?.ports || [];
          const datas = items.slice(offset, offset + pageSize);
          return {
            data: datas,
            total: items.length,
          };
        }),
      );
    },
    [baseInfo],
  );

  const rowKeyPort = useCallback((item: any) => {
    return item.key;
  }, []);

  const columnsPort = useMemo(() => {
    return [
      {
        title: translations.clusterGraphList_detailContainer_portName,
        dataIndex: 'Name',
        key: 'Name',
        width: '20%',
        ellipsis: {
          showTitle: true,
        },
        render: (item: string, row: any) => {
          return <>{item || '-'}</>;
        },
      },
      {
        title: translations.clusterGraphList_detailContainer_containerPort,
        dataIndex: 'ContainerPort',
        width: '20%',
        ellipsis: {
          showTitle: true,
        },
        render: (item: string, row: any) => {
          return <>{item || '-'}</>;
        },
      },
      {
        title: translations.clusterGraphList_detailContainer_hostPort,
        dataIndex: 'HostPort',
        ellipsis: {
          showTitle: true,
        },
        render: (item: string, row: any) => {
          return <>{item || '-'}</>;
        },
      },
      {
        title: translations.clusterGraphList_detailContainer_protocol,
        dataIndex: 'Proto',
        ellipsis: {
          showTitle: true,
        },
        render: (item: string, row: any) => {
          return <>{item || '-'}</>;
        },
      },
      {
        title: translations.clusterGraphList_detailContainer_cIP,
        dataIndex: 'ContainerIP',
        ellipsis: {
          showTitle: true,
        },
        render: (item: string, row: any) => {
          return <>{item || '-'}</>;
        },
      },
      {
        title: translations.clusterGraphList_detailContainer_hostIP,
        dataIndex: 'HostIP',
        ellipsis: {
          showTitle: true,
        },
        render: (item: string, row: any) => {
          return <>{item || '-'}</>;
        },
      },
    ];
  }, []);

  const reqFunProcess = useCallback(
    (pagination) => {
      const { current = 1, pageSize = 10 } = pagination;
      const offset = (current - 1) * pageSize;
      return getHistory().pipe(
        map((res) => {
          const items = baseInfo?.processes || [];
          const datas = items.slice(offset, offset + pageSize);
          return {
            data: datas,
            total: items.length,
          };
        }),
      );
    },
    [baseInfo],
  );

  const rowKeyProcess = useCallback((item: any) => {
    return item.key;
  }, []);

  const columnsProcess = useMemo(() => {
    return [
      {
        title: translations.clusterGraphList_detailContainer_processName,
        dataIndex: 'comm',
        width: '20%',
        ellipsis: {
          showTitle: true,
        },
        render: (item: string, row: any) => {
          return <>{item || '-'}</>;
        },
      },
      {
        title: translations.clusterGraphList_detailContainer_hostPID,
        dataIndex: 'hostPid',
        width: '20%',
        ellipsis: {
          showTitle: true,
        },
        render: (item: string, row: any) => {
          return <>{item || '-'}</>;
        },
      },
      {
        title: translations.clusterGraphList_detailContainer_PID,
        dataIndex: 'containerPid',
        ellipsis: {
          showTitle: true,
        },
        render: (item: string, row: any) => {
          return <>{item || '-'}</>;
        },
      },
      {
        title: translations.clusterGraphList_detailContainer_user,
        dataIndex: 'userName',
        ellipsis: {
          showTitle: true,
        },
        render: (item: string, row: any) => {
          return <>{item || '-'}</>;
        },
      },
      {
        title: translations.clusterGraphList_detailContainer_startTime,
        dataIndex: 'startTime',
        key: 'startTime',
        width: '14%',
        render: (time: any) => moment(time).format('YYYY-MM-DD HH:mm:ss'),
      },
    ];
  }, []);

  const detailParams = useMemo(() => {
    if (!baseInfo) return null;
    const { namespace, resourceKind, resourceName, clusterKey, k8sManaged, id, name } = baseInfo;
    return {
      Cluster: clusterKey,
      Namespace: namespace,
      Kind: resourceKind,
      Resource: resourceName,
      container_name: name,
      container_id: id,
      k8sManaged: k8sManaged,
    };
  }, [baseInfo]);

  const l = useLocation();
  const setHeader = useCallback(() => {
    const { name, status } = baseInfo || {};
    Store.header.next({
      title: (
        <div className="df dfac head-txt-case pod-detail-head-case">
          <div
            style={{
              position: 'relative',
              paddingRight: '72px',
              whiteSpace: 'break-spaces',
            }}
          >
            {name}
            {status || String(status) === '0' ? (
              <RenderTag type={statusValToKey[status]} title={statusValToKey[status]} className="ml12" />
            ) : null}
          </div>
        </div>
      ),
      extra: null,
      onBack: () => {
        navigate(-1);
      },
    });
  }, [baseInfo?.name, baseInfo?.status, l]);
  useEffect(() => {
    setHeader();
  }, [setHeader]);

  const { allSearchParams } = useNewSearchParams();
  let { getPageKey } = useAnchorItem();
  return (
    <>
      <div className="detail-container-case mlr32 mt4">
        <div className="flex-r">
          <div
            className="flex-c"
            style={{
              flexGrow: 1,
              paddingBottom: '40px',
              width: 0,
            }}
          >
            <div id={getPageKey('base')}>
              <TzCard title={translations.clusterGraphList_detailed_info} bordered bodyStyle={{ padding: '4px 0 0' }}>
                <ArtTemplateDataInfo data={dataCreateInfo} span={2} />
                <ArtTemplateDataInfo data={dataRemarkInfo} span={1} />
              </TzCard>
            </div>
            <TzCard
              title={translations.clusterGraphList_detail_mount}
              style={{ marginTop: '20px' }}
              id={getPageKey('mount')}
              bordered
              bodyStyle={{ paddingTop: '0px' }}
            >
              <TzTableServerPage
                columns={columnsMount}
                className="nohoverTable headerThlhA"
                defaultPagination={defPagination}
                rowKey={rowKeyMount}
                reqFun={reqFunMount}
                ref={tablelistMountRef}
                equalServerPageAnyway={false}
              />
            </TzCard>
            <TzCard
              title={translations.clusterGraphList_detail_port}
              style={{ marginTop: '20px' }}
              id={getPageKey('ports')}
              bordered
              bodyStyle={{ paddingTop: '0px' }}
            >
              <TzTableServerPage
                key={'ports'}
                className="nohoverTable"
                columns={columnsPort}
                defaultPagination={defPagination}
                rowKey={rowKeyPort}
                reqFun={reqFunPort}
                ref={tablelistPortRef}
                equalServerPageAnyway={false}
              />
            </TzCard>
            <TzCard
              title={translations.clusterGraphList_detail_process}
              style={{ marginTop: '20px' }}
              id={getPageKey('process')}
              bordered
              bodyStyle={{ paddingTop: '0px' }}
            >
              <TzTableServerPage
                className="nohoverTable"
                columns={columnsProcess}
                defaultPagination={defPagination}
                rowKey={rowKeyProcess}
                reqFun={reqFunProcess}
                ref={tablelistProcessRef}
                equalServerPageAnyway={false}
              />
            </TzCard>
            <TzCard
              title={translations.clusterGraphList_detail_topology}
              style={{ marginTop: '20px' }}
              id={getPageKey('topology')}
              bordered
              bodyStyle={{ paddingTop: '0px', paddingRight: '0px' }}
            >
              {detailParams && <GridDetailsV3 detailParams={detailParams} type={'container'} />}
            </TzCard>
            <TzCard
              title={translations.security_events}
              style={{ marginTop: '20px' }}
              id={getPageKey('securityEvents')}
              bordered
              bodyStyle={{ paddingTop: '0px' }}
            >
              <EventDataList {...baseInfo} {...allSearchParams} name={baseInfo?.name} type="container" />
            </TzCard>
          </div>
          <TzAnchor items={items} />
        </div>
      </div>
      <TzDrawer
        title={translations.clusterGraphList_containerDetail_environmentVariable}
        open={!!showVariate}
        width={560}
        children={<EnvironmentInfo environment={envList} />}
        destroyOnClose={true}
        onClose={() => {
          setShowVariate(false);
          setEnvList([]);
        }}
      />
    </>
  );
};

export default ContainerDetail;
