import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AssetTopSpace from '../../../components/AssetModule/TopSpace';
import { TzCard } from '../../../components/tz-card';
import { TzTableServerPage } from '../../../components/tz-table';
import { TzInputSearch } from '../../../components/tz-input-search';
import {
  getContainerDetails,
  getContainerGraphList,
  getHistory,
  getImagesProblems,
  getListClusters,
  getResourcePods,
  getResources,
  podsByOwner,
  rawContainersByPod,
} from '../../../services/DataService';
import { map, tap } from 'rxjs/operators';
import './DetailTabInfo.scss';
import GridDetailsV3 from '../../MultiClusterGridMap/GridChartMapV3';
import { escapeString, SearchObj } from '../GraphResFilterHelper';
import { translations } from '../../../translations/translations';
import InfoContainerDetail from './InfoContainerDetail';
import { WebResponse } from '../../../definitions';
import { Routes } from '../../../Routes';
import { Link, useNavigate } from 'react-router-dom';
import { TzTooltip } from '../../../components/tz-tooltip';
import EllipsisPopover from '../../../components/ellipsisPopover/ellipsisPopover';
import { classNameTemp, tampTit } from '../../AlertCenter/AlertCenterScreen';
import { RenderTag, TzTag } from '../../../components/tz-tag';
import moment from 'moment';
import { showFailedMessage } from '../../../helpers/response-handlers';
import ArtTemplateDataInfo from '../../../components/ComponentsLibrary/ArtTemplateDataInfo';
import TzAnchor, { useAnchorItem } from '../../../components/ComponentsLibrary/TzAnchor';
import { TzDrawer } from '../../../components/tz-drawer';
// import { useAliveController } from 'react-activation';
import { statusValToKey } from '../ListComponent/util';
import { questionIcon } from '../../ImagesScanner/components/ImagesScannerDataList';
import { TablePaginationConfig } from 'antd/lib/table';
import { useNavigatereFresh } from '../../../helpers/useNavigatereFresh';
interface IProps {
  children?: any;
  history?: any;
  paramData?: any;
  paramObj: SearchObj;
  initFatch?: () => void;
}

interface EProps {
  children?: any;
  history?: any;
  paramData: {
    cluster_key: string;
    namespace: string;
    pod_name: string;
  };
}

const defPagination = {
  current: 1,
  pageSize: 10,
  hideOnSinglePage: true,
};

const defPaginationPods = {
  current: 1,
  pageSize: 10,
  hideOnSinglePage: true,
};

const defPaginationExpand = {
  current: 1,
  pageSize: 5,
  hideOnSinglePage: true,
};

const items = [
  {
    href: '#statistics',
    title: <>{translations.clusterGraphList_detail_base}</>,
  },
  {
    href: '#info',
    title: <>{translations.clusterGraphList_detail_info}</>,
  },
  {
    href: '#container',
    title: <>{translations.clusterGraphList_detail_containerDefintion}</>,
  },
  {
    href: '#deploy',
    title: <>{translations.clusterGraphList_detail_deployment}</>,
  },
  {
    href: '#topology',
    title: <>{translations.clusterGraphList_detail_topology}</>,
  },
];

export const RenderTableContianerTemp = (props: EProps) => {
  const { paramData } = props;
  const reqFun = useCallback(
    (pagination: TablePaginationConfig) => {
      const { current = 1, pageSize = 10 } = pagination;
      const offset = (current - 1) * pageSize;
      const param: any = {
        ...paramData,
        status: '0&status=1',
        offset,
        limit: pageSize,
      };
      return rawContainersByPod(param).pipe(
        map((res) => {
          const items = res.getItems();
          return {
            data: items,
            total: res.totalItems,
          };
        }),
      );
    },
    [paramData],
  );

  const rowKey = useCallback((item: any) => {
    return item.id;
  }, []);

  const column = useMemo(() => {
    return [
      {
        title: translations.clusterGraphList_tabInfo_containerName,
        dataIndex: 'name',
        width: '36vw',
        render: (item: any) => {
          return (
            <div style={{ width: '30vw' }} className="ofh">
              <TzTooltip title={item || '-'}>{item || '-'}</TzTooltip>
            </div>
          );
        },
      },
      {
        title: translations.license_status,
        dataIndex: 'status',
        key: 'status',
        render: (item: any, row: any) => {
          const val = statusValToKey[item];
          if (!item && String(item) !== '0') return null;
          return <RenderTag type={val} title={val} />;
        },
      },
      {
        title: translations.clusterGraphList_tabInfo_createTime,
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: 180,
        render(item: any, row: any) {
          return moment(item).format('YYYY-MM-DD HH:mm:ss');
        },
      },
    ];
  }, []);
  let { jump } = useNavigatereFresh();
  return (
    <TzTableServerPage
      columns={column}
      defaultPagination={defPaginationExpand}
      rowKey={rowKey}
      reqFun={reqFun}
      equalServerPageAnyway={false}
      onRow={(record) => {
        return {
          onClick: async () => {
            if (window.REACT_APP_ASSET_MODULE.includes('container')) return;
            if (!record?.id) {
              showFailedMessage(translations.clusterGraphList_containerInfo_toastError, '400');
              return;
            }
            jump(
              `${Routes.RiskGraphListContainerDetail}?containerID=${record?.id}&ClusterID=${record?.clusterKey}`,
              'RiskGraphListContainerDetail',
            );
          },
        };
      }}
    />
  );
};
const DetailTabInfo = (props: IProps) => {
  const {
    paramData: {
      resourceKind = '',
      resourceName = '',
      webType = '',
      webFrameVersion = '',
      appTargetName = '',
      appTargetVersion = '',
      namespace = '-',
      finalSeverity = 'Unknown',
    },
    paramObj: { Alias = '-', Managers = [], type = '', ClusterID: clusterID = '' },
  } = props;
  const tablelistRef = useRef<any>(null);
  const containerDetailRef = useRef<any>(null);
  const [search, setSearch] = useState('');
  const [searchPods, setSearchPods] = useState('');
  const [visible, setVisible] = useState('');
  const [containerData, setContainerData] = useState(null);
  const [errorIcons, setErrorIcons] = useState<{ Info: string; id: number }[]>([]);
  const [clusterKeyToName, setClusterKeyToName] = useState<any>({});
  const navigate = useNavigate();

  useEffect(() => {
    getListClusters({ offset: 0, limit: 1000 })
      .pipe(
        tap((res: WebResponse<any>) => {
          const items = res.getItems();
          let objs: any = {};
          items.map((item) => {
            objs[item.key] = item.name;
            return item;
          });
          setClusterKeyToName(objs);
        }),
      )
      .subscribe();
  }, []);

  useEffect(() => {
    const data = {
      resourceKind,
      resourceName,
      namespace,
      clusterKey: clusterID,
      limit: 10,
      offset: 0,
    };
    if (!resourceName) {
      //showFailedMessage(translations.error_query);
      return;
    }
    getImagesProblems(data)
      .pipe(
        tap((res: WebResponse<any>) => {
          const items = res.getItems().map((t) => {
            return {
              Info: '',
              id: t,
            };
          });
          setErrorIcons(items);
        }),
      )
      .subscribe();
  }, [clusterID, resourceKind, resourceName, namespace]);

  const onSearchContainer = useCallback((value: string) => {
    tablelistRef.current.initPage();
    setSearch(value);
  }, []);

  const reqFunContainer = useCallback(
    (pagination: TablePaginationConfig) => {
      const { current = 1, pageSize = 10 } = pagination;
      const offset = (current - 1) * pageSize;
      if (!resourceName) {
        return getHistory().pipe(
          map(() => {
            return {
              data: [],
              total: [].length,
            };
          }),
        );
      }
      return getContainerDetails(clusterID, namespace, resourceKind, resourceName, pageSize, offset, search).pipe(
        map((res) => {
          const items = res.getItems();
          return {
            data: items,
            total: res.totalItems,
          };
        }),
      );
    },
    [namespace, resourceKind, resourceName, search, clusterID],
  );

  const rowKeyContainer = useCallback((item: any) => {
    return item.key;
  }, []);

  const columnsContainer = useMemo(() => {
    return [
      {
        title: translations.clusterGraphList_detailResource_colums_name,
        dataIndex: 'name',
        width: '25%',
      },
      {
        title: translations.clusterGraphList_tabInfo_containerType,
        dataIndex: 'type',
        width: '25%',
      },
      {
        title: translations.clusterGraphList_tabInfo_containerDirectory,
        dataIndex: 'working_dir',
        width: '25%',
        render: (item: string, row: any) => item || '-',
      },
      {
        title: translations.clusterGraphList_tabInfo_order,
        dataIndex: 'command',
        render: (item: string, row: any) => {
          return item ? (
            <div className="ofh" style={{ maxWidth: '400px' }}>
              <EllipsisPopover>{item}</EllipsisPopover>
            </div>
          ) : (
            '-'
          );
        },
      },
    ];
  }, []);

  const onSearchPods = useCallback((value: string) => {
    setSearchPods(value);
  }, []);

  const reqFunPods = useCallback(
    (pagination: TablePaginationConfig) => {
      const { current = 1, pageSize = 10 } = pagination;
      const offset = (current - 1) * pageSize;
      if (!resourceName) {
        return getHistory().pipe(
          map(() => {
            return {
              data: [],
              total: 0,
            };
          }),
        );
      }
      return podsByOwner({
        cluster_key: clusterID,
        namespace,
        resource_kind: resourceKind,
        resource_name: resourceName,
        limit: pageSize,
        offset,
        query: searchPods,
      }).pipe(
        map((res) => {
          let items = [];
          let totalItems = 0;
          items = res.getItems();
          totalItems = res?.data?.totalItems || 0;
          return {
            data: items,
            total: totalItems,
          };
        }),
      );
    },
    [namespace, resourceKind, resourceName, searchPods, clusterID],
  );

  const rowKeyPods = useCallback((item: any) => {
    return item.PodUID;
  }, []);

  const columnsPods = useMemo(() => {
    return [
      {
        title: translations.clusterGraphList_tabInfo_podName,
        dataIndex: 'PodName',
        width: '30%',
        ellipsis: true,
        render: (item: any, row: any) => {
          return resourceKind === 'Pod' ? (
            item
          ) : (
            <>
              <div style={{ maxWidth: '100%', display: 'inline-flex' }} className="hoverBtn">
                <EllipsisPopover title={item || '-'}>
                  <span
                    onClick={async (event) => {
                      event.stopPropagation();
                      // refreshScope('RiskGraphListPodDetail');
                      navigate(`${Routes.RiskGraphListPodDetail}?PodUID=${row.PodUID ?? ''}&PodName=${item}`);
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
        title: 'Pod IP',
        dataIndex: 'PodIP',
      },
      {
        title: translations.clusterGraphList_nodeName,
        dataIndex: 'NodeName',
        width: '25%',
        ellipsis: true,
        render: (item: any) => {
          return (
            <>
              {item === '-' ? (
                item
              ) : (
                <div style={{ maxWidth: '100%', display: 'inline-flex' }} className="hoverBtn">
                  <EllipsisPopover title={item}>
                    <span
                      onClick={async (event) => {
                        event.stopPropagation();
                        // refreshScope('ClustersOnlineVulnerabilitiesDetails');
                        navigate(
                          Routes.ClustersOnlineVulnerabilitiesDetails.replace(':type', 'namespace') +
                            `?type=node&NSName=${item}&ClusterID=${escapeString(clusterID)}`,
                        );
                      }}
                    >
                      {item}
                    </span>
                  </EllipsisPopover>
                </div>
              )}
            </>
          );
        },
      },
      {
        title: translations.clusterGraphList_tabInfo_createTime,
        dataIndex: 'CreatedAt',
        width: '200px',
        render: (item: string) => {
          return moment(item).format('YYYY-MM-DD HH:mm:ss');
        },
      },
    ];
  }, [clusterID, resourceKind]);

  const detailParams = useMemo(() => {
    return {
      Cluster: clusterID,
      Namespace: namespace,
      Kind: resourceKind,
      Resource: resourceName,
    };
  }, [namespace, resourceKind, resourceName, clusterID]);

  const dataCreateInfo = useMemo(() => {
    let data: any = {
      [translations.clusterGraphList_namespace]: (
        <>
          <Link
            // target="_blank"
            to={
              Routes.ClustersOnlineVulnerabilitiesDetails +
              `?type=namespace&NSName=${namespace}&ClusterID=${escapeString(clusterID)}`
            }
          >
            <span className="hoverBtn">{namespace}</span>
          </Link>
        </>
      ),
      [translations.clusterGraphList_cluster]: clusterKeyToName?.[clusterID] || '-',
    };
    if (props.paramData.appType === 'database') {
      data = {
        ...data,
        [translations.clusterGraphList_appType]: appTargetName,
        [translations.clusterGraphList_appTargetVersion]: appTargetVersion,
      };
    } else if (props.paramData.appType === 'web') {
      data = {
        ...data,
        [translations.clusterGraphList_webType]: appTargetName,
        [translations.clusterGraphList_webVersion]: <EllipsisPopover lineClamp={2}>{appTargetVersion}</EllipsisPopover>,
      };
    }

    let managerUi: JSX.Element = '-' as any;
    if (Managers?.length) {
      const managerStr = Managers.map((_item) => _item.account).join('、');
      managerUi = (
        <EllipsisPopover lineClamp={2} title={managerStr}>
          {managerStr}
        </EllipsisPopover>
      );
    }
    data = {
      ...data,
      [translations.clusterGraphList_alias]: Alias,
      [translations.clusterGraphList_managers]: managerUi,
      [translations.onlineVulnerability_filters_riskLevelFilter]: (
        <div className={'btn-state ' + classNameTemp[finalSeverity || 'None']}>
          {tampTit[finalSeverity || 'Unknown']}
        </div>
      ),
      [translations.problems]: (
        <div className="df dfac" style={{ lineHeight: '30px' }}>
          {errorIcons.map((t: any) => {
            const { Info, id } = t;
            if (Info || questionIcon[id]) {
              return (
                <TzTooltip title={Info || questionIcon[id].title}>
                  <i
                    className={'iconfont f22 mr10 ' + questionIcon[id].icon}
                    style={{ color: 'rgb(33, 119, 209)' }}
                  ></i>
                </TzTooltip>
              );
            } else {
              return <span style={{ color: 'red' }}>枚举类型异常</span>;
            }
          })}
        </div>
      ),
    };
    return Object.keys(data).map((item) => {
      let o: any = {
        title: item + '：',
        content: '-',
        render: () => {
          return data[item] || '-';
        },
      };
      return o;
    });
  }, [
    namespace,
    Managers,
    clusterID,
    webType,
    webFrameVersion,
    appTargetName,
    appTargetVersion,
    finalSeverity,
    errorIcons,
    clusterKeyToName,
  ]);

  const ContainerHeadDom = useMemo(() => {
    return (
      <div className="df dfac dfjb">
        <span>{translations.clusterGraphList_detail_containerDefintion}</span>
        <TzInputSearch
          placeholder={translations.originalWarning_placeholder}
          // enterButton={translations.clusterGraphList.search}
          onSearch={onSearchContainer}
          // suffix
        />
      </div>
    );
  }, [onSearchContainer]);

  const DeployHeadDom = useMemo(() => {
    return (
      <div className="df dfac dfjb">
        <span>{translations.clusterGraphList_detail_deployment}</span>
        <TzInputSearch
          placeholder={translations.originalWarning_placeholder}
          // enterButton={translations.clusterGraphList.search}
          onSearch={onSearchPods}
          // suffix
        />
      </div>
    );
  }, [onSearchPods]);

  let { getPageKey } = useAnchorItem();
  return (
    <div className="details-info-case">
      <div className="flex-r">
        <div
          className="flex-c details-content-case mt20"
          style={{
            flexGrow: 1,
            width: 0,
            paddingBottom: '40px',
          }}
        >
          <div id={getPageKey('statistics')}>
            <AssetTopSpace type={type} data={props.paramData} clusterID={clusterID}></AssetTopSpace>
          </div>
          <TzCard
            title={translations.clusterGraphList_detail_info}
            style={{ marginTop: '20px' }}
            id={getPageKey('info')}
            bordered
            bodyStyle={{ padding: '4px 0 0' }}
          >
            <ArtTemplateDataInfo className={'wauto info-art-span2'} data={dataCreateInfo} span={2} />
          </TzCard>
          <TzCard
            title={ContainerHeadDom}
            className={'mt20'}
            id={getPageKey('container')}
            bodyStyle={{ paddingTop: '0px' }}
          >
            <TzTableServerPage
              columns={columnsContainer}
              defaultPagination={defPagination}
              rowKey={rowKeyContainer}
              reqFun={reqFunContainer}
              ref={tablelistRef}
              onRow={(record) => {
                return {
                  onClick: () => {
                    setVisible(record?.name);
                    setContainerData(record);
                  },
                };
              }}
              equalServerPageAnyway={false}
            />
          </TzCard>
          <TzCard title={DeployHeadDom} className={'mt20'} id={getPageKey('deploy')} bodyStyle={{ paddingTop: '0px' }}>
            <TzTableServerPage
              columns={columnsPods}
              defaultPagination={defPaginationPods}
              rowKey={rowKeyPods}
              reqFun={reqFunPods}
              equalServerPageAnyway={false}
              expandable={{
                expandedRowRender: (record) => {
                  const { ClusterKey, Namespace, PodName, ResourceName } = record;
                  const paramData = {
                    cluster_key: ClusterKey,
                    namespace: Namespace,
                    pod_name: PodName,
                  };
                  return <RenderTableContianerTemp paramData={paramData} />;
                },
              }}
            />
          </TzCard>
          <TzCard
            className={'mt20 13456'}
            title={translations.clusterGraphList_detail_topology}
            id={getPageKey('topology')}
            bodyStyle={{ paddingTop: '0px' }}
          >
            <GridDetailsV3 detailParams={detailParams} type={'resource'} />
          </TzCard>
        </div>
        <TzAnchor wrapperClassName="anchor-right" items={items} />
      </div>
      <TzDrawer
        title={translations.clusterGraphList_containerDetail_title}
        open={visible !== ''}
        width={'75%'}
        children={
          <InfoContainerDetail containerName={visible} containerData={containerData} ref={containerDetailRef} />
        }
        destroyOnClose={true}
        onClose={() => {
          setVisible('');
        }}
      />
    </div>
  );
};

export default DetailTabInfo;
