import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { del, getContainerDetail, getDetail, getExRecords, whitelist, update } from './service';
import { TablePaginationConfig } from 'antd';
import { WebResponse } from '../../definitions';
import { map, tap } from 'rxjs/operators';
import { TzCard } from '../../components/tz-card';
import { TzTableServerPage } from '../../components/tz-table';
import { TzButton } from '../../components/tz-button';
import { localLang, translations } from '../../translations/translations';
import EllipsisPopover from '../../components/ellipsisPopover/ellipsisPopover';
import moment from 'moment';
import SearchInputCom from '../../components/search-input/SearchInputComponent';
import { Routes } from '../../Routes';
import { TzCheckbox } from '../../components/tz-checkbox';
import { defenseOverview, driftPolicyId } from '../../services/DataService';
import { useAssetsClusterList } from '../../helpers/use_fun';
import { TzSwitch } from '../../components/tz-switch';
import { Store } from '../../services/StoreService';
import { getUserInformation } from '../../services/AccountService';
import { TzConfirm } from '../../components/tz-modal';
import { TzMessageError, TzMessageSuccess, TzMessageWarning } from '../../components/tz-mesage';
import { TzDrawerFn } from '../../components/tz-drawer';
import InfoContainerDetail from '../MultiClusterRiskExplorer/MultiDetailsTab/InfoContainerDetail';
import { TzTooltip } from '../../components/tz-tooltip';
import { PalaceDetailInfo } from '../AlertCenter/PalaceEvent';
import { PageTitle } from '../ImagesScanner/ImagesCI/CI';
import { TzTabsNormal } from '../../components/tz-tabs';
import { flatten, merge } from 'lodash';
import { TzRangePicker } from '../../components/tz-range-picker';
import EventChart from '../AlertCenter/Chart';
import ContainerSelector from './ContainerListSelector';
import TzInputSearch from '../../components/tz-input-search';
import ArtTemplateDataInfo from '../../components/ComponentsLibrary/ArtTemplateDataInfo';
import TzAnchor, { useAnchorItem } from '../../components/ComponentsLibrary/TzAnchor';
import { useMemoizedFn, useSize } from 'ahooks';
import { RenderTag } from '../../components/tz-tag';
import { StrategyAction } from '../../components/ComponentsLibrary/TzStrategyAction';
import { useNavigatereFresh } from '../../helpers/useNavigatereFresh';
import { JumpResource } from '../MultiClusterRiskExplorer/components';
import { newActiongDataList } from '../ImagesScanner/SecurityPolicy/SecurityPolicyInfo';

let containerFnLoad = false;

const items = [
  {
    href: '#base',
    title: <EllipsisPopover>{translations.compliances_breakdown_taskbaseinfo}</EllipsisPopover>,
  },
  {
    href: '#chart',
    title: <EllipsisPopover>{translations.deflectDefense_recordChart}</EllipsisPopover>,
  },
  {
    href: '#list',
    title: <EllipsisPopover>{translations.runtimePolicy_listtitle}</EllipsisPopover>,
  },
  {
    href: '#whitelist',
    title: <EllipsisPopover>{translations.white_list}</EllipsisPopover>,
  },
];

export const enableTypeList = [
  {
    zh: translations.imageReject_reject_type_alarm,
    en: 'pass',
  },
  {
    zh: translations.deflectDefense_blockUp,
    en: 'block',
  },
  {
    zh: translations.confirm_whitelist,
    en: 'hit_whitelist',
  },
];

const ExceptRecord = (props: any) => {
  const { rowData } = props;
  const [search, setSearch] = useState<string>('');
  const [checkbox, setCheckbox] = useState(false);
  const navigate = useNavigate();
  // const { refreshScope } = useAliveController();

  const filterEnable = useMemo(() => {
    const typeList = enableTypeList.slice(0);
    return typeList.map((t) => {
      return {
        text: localLang === 'zh' ? t.zh : t.en,
        value: t.en,
      };
    });
  }, [localLang]);

  const getRecords = useCallback(
    (pagination: TablePaginationConfig, filter: any) => {
      const { action } = filter;
      let { pageSize = 10, current = 1 } = pagination;
      let { policy_id = '', container_name = '' } = rowData;
      let param = {
        file_path: search,
        policy_id: policy_id,
        checkbox: checkbox,
        container_name: container_name,
      };
      if (action) {
        param = Object.assign(param, {
          action,
        });
      }
      return getExRecords(param).pipe(
        map((res: WebResponse<any>) => {
          let items = res.getItems();
          let arr = items.filter((item) => (checkbox ? !item.in_global_whitelist : true));
          return {
            data: arr.slice((current - 1) * pageSize, current * pageSize),
            total: arr.length,
          };
        }),
      );
    },
    [rowData, search, checkbox],
  );

  const columns = useMemo(() => {
    return [
      {
        title: translations.deflectDefense_filepath,
        dataIndex: 'file_path',
        className: 'rivet',
        width: '10%',
        render(file_path: any, record: any) {
          const txt = file_path;
          return (
            <div>
              {record.in_global_whitelist ? (
                <TzTooltip title={translations.white_list_passed}>
                  <img src="/images/bai.png" />
                </TzTooltip>
              ) : null}
              <EllipsisPopover>{txt}</EllipsisPopover>
            </div>
          );
        },
      },
      {
        title: translations.deflectDefense_containerId,
        dataIndex: 'container_id',
        ellipsis: {
          showTitle: false,
        },
        width: '25%',
        render(container_id: any, record: any) {
          return <EllipsisPopover lineClamp={2}>{container_id}</EllipsisPopover>;
        },
      },
      {
        title: 'PodName',
        dataIndex: 'pod_name',
        render(PodName: any, record: any) {
          return <EllipsisPopover lineClamp={2}>{PodName}</EllipsisPopover>;
        },
      },
      {
        title: translations.actions,
        dataIndex: 'action',
        align: 'center',
        className: 'th-center',
        ellipsis: {
          showTitle: false,
        },
        width: '16%',
        filters: filterEnable,
        render(action: any) {
          const obj: any = {
            pass: 'alert',
            block: 'block',
            hit_whitelist: 'white',
          };
          return <RenderTag className={''} type={obj[action]} />;
        },
      },
      {
        title: translations.deflectDefense_occurTime,
        dataIndex: 'happend_time',
        width: '14%',
        render(happend_time: any) {
          return moment(happend_time).format('YYYY-MM-DD HH:mm:ss');
        },
      },
      {
        title: translations.associated_alarm_ID,
        key: 'id',
        width: '160px',
        render(record: any) {
          return (
            <TzButton
              type={'text'}
              className={'ml-8'}
              onClick={async (event) => {
                let dw: any = await TzDrawerFn({
                  width: '38.9%',
                  title: translations.warningInfo,
                  children: <PalaceDetailInfo {...record} />,
                });
                dw.show();
              }}
            >
              {record.id}
            </TzButton>
          );
        },
      },
    ] as any;
  }, [filterEnable]);
  return (
    <div>
      <div className={'flex-r-c'}>
        <span className="exception-rec">
          <i className={'icon iconfont icon-tishi mr8'} style={{ color: '#B3BAC6' }}></i>
          {translations.deflectDefense_exceptionRec}
        </span>
        <TzButton
          onClick={() => {
            // refreshScope('NotificationCenter');
            navigate(
              `${Routes.NotificationCenter}?tab=flowcenter&cluster_key=${rowData.cluster_name}_${
                rowData.cluster_key
              }&resource=${rowData.resource}(${rowData.resource_type})&namespace=${
                rowData.namespace
              }&ruleKey=DriftPrevention&start=${moment(rowData?.created_at).valueOf()}`,
            );
          }}
        >
          {translations.deflectDefense_viewAlert}
        </TzButton>
      </div>
      <div className={'flex-r-c mt12 mb8'}>
        <TzCheckbox
          style={{ flex: 1 }}
          checked={checkbox}
          onChange={(val) => {
            setCheckbox(val.target.checked);
          }}
        >
          {translations.unStandard.str56}
        </TzCheckbox>
        <SearchInputCom
          style={{ width: 300 }}
          onChange={setSearch}
          placeholder={translations.deflectDefense_exceptionSearchTip}
        />
      </div>
      <TzTableServerPage tableLayout={'fixed'} columns={columns} reqFun={getRecords} rowKey="id" />
    </div>
  );
};
const DeflectDefenseInfo = () => {
  const [baseInfo, setInfo] = useState<any>(null);
  const tablelistRef = useRef<any>(null);
  const [search, setSearch] = useState('');

  const navigate = useNavigate();
  const l = useLocation();
  // const { refreshScope } = useAliveController();
  const [result] = useSearchParams();
  let policyId = useMemo(() => {
    return result.get('policyId');
  }, []);
  const clusterList = useAssetsClusterList();
  let putUpdate = useCallback(
    (data) => {
      update(
        Object.assign(
          {},
          {
            policy_id: baseInfo.id,
            enable: baseInfo.enable,
            mode: baseInfo.mode,
            updater: getUserInformation().username,
          },
          data,
        ),
      ).subscribe((res) => {
        if (res.error) {
          return;
        }
        getDriftPolicyId();
        TzMessageSuccess(translations.successfully_modified_the_policy);
      });
    },
    [baseInfo],
  );
  let dataInfo = useMemo(() => {
    if (!baseInfo) return [];
    const obj: any = {
      resource: `${translations.resource_name}：`,
      resource_type: `${translations.microseg_resources_res_kind}：`,
      namespace: translations.calico_cluster_namespace + '：',
      cluster_key: translations.compliances_cronjobs_selectCluster + '：',
      created_at: translations.runtimePolicy_policy_created + '：',
      updated_at: translations.notificationCenter_placeEvent_updateTime + '：',
      enable: translations.compliances_breakdown_dotstatus + '：',
      mode: translations.deflectDefense_defenseMode + '：',
    };
    let arr = Object.keys(obj).map((item) => {
      let o: any = {
        title: obj[item] || '-',
        content: baseInfo[item],
      };
      if ('resource' === item) {
        o['render'] = (row: any) => {
          let { namespace, resource, cluster_key, resource_type } = baseInfo;
          return (
            <JumpResource
              name={resource}
              kind={resource_type}
              namespace={namespace}
              clusterKey={cluster_key}
              title={resource}
            />
          );
        };
      }
      if ('namespace' === item) {
        o['render'] = (row: any) => {
          return (
            <Link
              style={{ width: '100%' }}
              // target="_blank"
              to={`${Routes.ClustersOnlineVulnerabilitiesDetails}?type=${item}&NSName=${baseInfo['namespace']}&name=${baseInfo['resource']}&ClusterID=${baseInfo['cluster_key']}`}
            >
              <TzButton style={{ maxWidth: '100%' }} type={'text'}>
                <EllipsisPopover>{baseInfo[item]}</EllipsisPopover>
              </TzButton>
            </Link>
          );
        };
      }
      if ('mode' === item) {
        o['render'] = (row: any) => {
          return (
            <StrategyAction
              data={newActiongDataList}
              value={baseInfo[item]}
              onChange={(val) => {
                putUpdate({ mode: val });
              }}
            />
          );
        };
      }
      if ('enable' === item) {
        o['render'] = (row: any) => {
          if (baseInfo.scanner_status < 2) {
            return <RenderTag type={'ready'} />;
          }
          return (
            <TzSwitch
              checked={baseInfo[item] == 1}
              checkedChildren={translations.deflectDefense_enabled}
              unCheckedChildren={translations.deflectDefense_disabled}
              onChange={(val) => {
                putUpdate({ enable: val ? 1 : 0 });
              }}
            />
          );
        };
      }
      if ('cluster_key' === item) {
        o['render'] = (row: any) => {
          let o: any = clusterList.find((ite: { value: any }) => baseInfo[item] === ite.value) || {};
          return o['label'];
        };
      }
      if ('created_at' === item) {
        o['render'] = (row: any) => {
          return moment(baseInfo[item]).format('YYYY-MM-DD HH:mm:ss');
        };
      }
      if ('updated_at' === item) {
        o['render'] = (row: any) => {
          return moment(baseInfo[item]).format('YYYY-MM-DD HH:mm:ss');
        };
      }
      return o;
    });
    return arr;
  }, [baseInfo, clusterList]);
  let getContainerDetailFn = () => {};
  useEffect(() => {
    getContainerDetailFn();
  }, [baseInfo]);

  let { jump } = useNavigatereFresh();
  let columns: any = useMemo(
    () => [
      {
        title: translations.deflectDefense_containerName,
        key: 'key',
        dataIndex: 'container_name',
        render: (container_name: any, row: any) => {
          return (
            <TzButton
              type={'text'}
              onClick={(event) => {
                event.stopPropagation();
                if (containerFnLoad) return;
                containerFnLoad = true;
                getContainerDetail(row.container_id).subscribe(async (res) => {
                  containerFnLoad = false;
                  let item = res.getItem();
                  let dw: any = await TzDrawerFn({
                    title: translations.clusterGraphList_containerDetail_title,
                    width: '75%',
                    children: (
                      <InfoContainerDetail
                        containerData={Object.assign({}, item, {
                          command: (item?.command || []).join(' '),
                        })}
                      />
                    ),
                  });
                  dw.show();
                });
              }}
            >
              {container_name}
            </TzButton>
          );
        },
      },
      {
        title: translations.clusterGraphList_navImage,
        key: 'image',
        dataIndex: 'image',
        render: (image: any, row: any) => {
          return (
            <TzButton
              type={'text'}
              disabled={row.image_id === 0}
              onClick={(event) => {
                event.stopPropagation();
                if (row.image_id) {
                  jump(
                    Routes.RegistryImagesDetailInfo +
                      `?imageUniqueID=${row.imageUniqueID}&imageFromType=${row.imageFromType}`,
                    'RegistryImagesDetailInfo',
                  );
                }
              }}
            >
              {image}
            </TzButton>
          );
        },
      },
    ],
    [],
  );
  const reqFun = useCallback(
    (pagination: TablePaginationConfig) => {
      const { current = 1, pageSize = 10 } = pagination;
      const offset = (current - 1) * pageSize;
      const pageParams = {
        policy_id: policyId,
        offset,
        limit: pageSize,
      };
      return getDetail(pageParams).pipe(
        map((res: WebResponse<any>) => {
          let items = res.getItems();
          return {
            data: res.getItems(),
            total: res.totalItems,
          };
        }),
      );
    },
    [policyId],
  );

  const onSearchContainer = useCallback((value: string) => {
    tablelistRef.current.initPage();
    setSearch(value);
  }, []);
  let columnsWhhite: any = useMemo(
    () => [
      {
        title: translations.deflectDefense_filepath,
        key: 'filepath',
        dataIndex: 'filepath',
      },
      {
        title: translations.deflectDefense_hash,
        key: 'check_sum',
        dataIndex: 'check_sum',
        width: '50%',
      },
    ],
    [],
  );
  const reqFunWhite = useCallback(
    (pagination: TablePaginationConfig) => {
      const { current = 1, pageSize = 10 } = pagination;
      const offset = (current - 1) * pageSize;
      const pageParams = {
        policy_id: policyId,
        offset,
        limit: pageSize,
        search,
      };
      return whitelist(pageParams).pipe(
        map((res: WebResponse<any>) => {
          return {
            data: res.getItems(),
            total: res.totalItems,
          };
        }),
      );
    },
    [search, policyId],
  );

  let getDriftPolicyId = useCallback(() => {
    driftPolicyId(policyId).subscribe((res) => {
      setInfo(res.getItem());
    });
  }, [policyId]);
  useEffect(() => {
    getDriftPolicyId();
  }, [getDriftPolicyId]);
  const setHeader = useMemoizedFn(() => {
    Store.header.next({
      title: translations.strategyDetails,
      extra: (
        <TzButton
          danger
          onClick={() => {
            TzConfirm({
              content: translations.unStandard.str57(),
              okText: translations.delete,
              okButtonProps: { danger: true },
              cancelText: translations.cancel,
              onOk() {
                if (baseInfo?.enable === 1 && baseInfo?.scanner_status === 2) {
                  TzMessageError(translations.activeDefense_delStop);
                  return;
                }
                del(policyId + '').subscribe((res) => {
                  if (res.data) {
                    navigate(Routes.DeflectDefense, { replace: true });
                    TzMessageSuccess(translations.activeDefense_delSuccessTip);
                  }
                });
              },
            });
          }}
        >
          {translations.delete}
        </TzButton>
      ),
      onBack: () => {
        navigate(-1);
      },
    });
  });

  useEffect(() => {
    setHeader();
  }, [policyId, baseInfo?.enable, l]);
  let [filters, setFilters] = useState<any>({
    createdAt: {
      start: null,
      end: null,
    },
  });

  useEffect(() => {
    if (baseInfo?.created_at) {
      setFilters((pre: any) => {
        let cObj = Object.assign({}, pre, {
          createdAt: {
            start:
              moment(baseInfo?.created_at).valueOf() > moment().add(-24, 'h').valueOf()
                ? moment(baseInfo?.created_at).valueOf()
                : moment().add(-24, 'h').valueOf(),
            end: moment().valueOf(),
          },
        });
        return cObj;
      });
    }
  }, [baseInfo?.created_at]);
  const [csList, setCSList] = useState('');
  let [activeKey, setActiveKey] = useState('24');
  const refBubbleChart = useRef<any>(null);
  const defRef = useRef<any>(null);
  let [option, setOption] = useState({});
  const { width = 0 } = useSize(defRef) || {};
  let onChangeFilters = useCallback(
    (data: any) => {
      setFilters((pre: any) => {
        let cObj = Object.assign({}, pre, data);
        return cObj;
      });
    },
    [baseInfo?.created_at],
  );

  useEffect(() => {
    const fetchStoreContainerListFn = Store.defenseContainerID
      .pipe(
        tap((cs: string) => {
          setCSList(cs);
        }),
      )
      .subscribe();
    return () => fetchStoreContainerListFn.unsubscribe();
  }, []);
  let severityC = useRef([]);
  let query: any = useMemo(() => {
    const cs = csList ? csList.split(',') : [];
    let {
      ruleKey = ['DriftPrevention'],
      severity = [],
      createdAt = {},
      cluster = [],
      container = [...cs],
      pod = [],
      namespace = [],
      resource = [],
      registry = [],
      repo = [],
      tag = [],
      hostname = [],
    } = filters;
    severityC.current = severity;
    let objs = merge({}, filters, {
      scope: {
        container,
        cluster: cluster.map((item: any) => {
          return item.split('_')[0];
        }),
        pod,
        namespace,
        resource,
        registry,
        repo,
        tag,
        hostname,
      },
      // ruleKey: ruleKey.map((item: any[]) => item.join('/')),
      ruleKey,
      severity: flatten(
        severity.map((item: string) => {
          return item.split(',');
        }),
      ).map((item) => Number(item)),
      createdAt: createdAt,
    });
    // delete objs['createdAt'];
    return objs;
  }, [filters, csList]);
  let postEventOverview = useCallback(() => {
    if (!query?.createdAt?.start) return;
    defenseOverview({ query }).subscribe((res: any) => {
      let items = res.getItems();
      if (!query.scope?.container.length) {
        items = [];
      }
      let obj: any = {
        [translations.imageReject_reject_type_reject]: {
          name: translations.imageReject_reject_type_reject,
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: 'rgba(233,84,84,0.1)', // 0% 处的颜色
                },
                {
                  offset: 1,
                  color: 'rgba(233,84,84,0)', // 100% 处的颜色
                },
              ],
              global: false, // 缺省为 false
            },
          },
          data: [[filters.createdAt.start, 0]],
        },

        [translations.imageReject_reject_type_alarm]: {
          name: translations.imageReject_reject_type_alarm,
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: 'rgba(255,196,35,0.1)', // 0% 处的颜色
                },
                {
                  offset: 1,
                  color: 'rgba(255,196,35,0)', // 100% 处的颜色
                },
              ],
              global: false, // 缺省为 false
            },
          },
          data: [[filters.createdAt.start, 0]],
        },
      };
      items.forEach((item: any) => {
        let { termSet, timeAt } = item;
        let xAxis = timeAt; //moment(timeAt).format("MM-DD HH:mm")
        obj[translations.imageReject_reject_type_reject].data.push([xAxis, termSet['block']]);
        obj[translations.imageReject_reject_type_alarm].data.push([xAxis, termSet['pass']]);
      });

      obj[translations.imageReject_reject_type_reject].data.push([query.createdAt.end, 0]);
      obj[translations.imageReject_reject_type_alarm].data.push([query.createdAt.end, 0]);

      let selected: any = {
        [translations.imageReject_reject_type_reject]: false,
        [translations.imageReject_reject_type_alarm]: false,
      };
      if (severityC.current.length) {
        severityC.current.forEach((item: any) => {
          let o: any = {
            block: translations.imageReject_reject_type_reject,
            pass: translations.imageReject_reject_type_alarm,
          };
          return (selected[o[item]] = true);
        });
      } else {
        selected = {
          [translations.imageReject_reject_type_reject]: true,
          [translations.imageReject_reject_type_alarm]: true,
        };
      }
      setOption({
        color: [
          'rgba(233,84,84,1)',
          // 'rgba(255,138,52,1)',
          'rgba(255,196,35,1)',
        ],
        legend: {
          data: Object.keys(obj),
          selected,
        },
        xAxis: {
          axisLabel: {
            formatter: function (value: string, index: any) {
              let d = query.createdAt.end - query.createdAt.start;
              let str = 'MM/DD';
              if (d < 60 * 1000) {
                str = 'MM/DD HH:mm:ss';
              } else if (d < 24 * 3600 * 1000) {
                str = 'MM/DD HH:mm';
              } else if (d < 24 * 3600 * 1000 * 3) {
                str = 'MM/DD HH:mm';
              } else if (d < 24 * 3600 * 1000 * 30) {
                str = 'MM/DD';
              }

              return moment(value).format(str);
            },
          },
        },
        series: Object.keys(obj).map((item) => {
          let o = Object.assign(
            {},
            {
              type: 'line',
              symbol: 'circle',
              symbolSize: [2, 2],
              showSymbol: true,
              smooth: true,
              lineStyle: {
                width: 2,
              },
            },
            obj[item],
          );
          return o;
        }),
      });
    });
  }, [query]);
  useEffect(() => {
    postEventOverview();
  }, [postEventOverview]);

  const WhiteHeadDom = useMemo(() => {
    return (
      <div className="df dfac dfjb">
        <span>{translations.white_list}</span>
        <TzInputSearch placeholder={translations.deflectDefense_exceptionSearchTip} onSearch={onSearchContainer} />
      </div>
    );
  }, [onSearchContainer]);
  let { getPageKey } = useAnchorItem();
  return (
    <div className="deflect-defense-info mlr32 mt4">
      <div className="flex-r" style={{ width: '100%' }}>
        <div ref={defRef} className="flex-c" style={{ flex: 1, paddingBottom: '24px', width: 0 }}>
          <TzCard
            title={translations.compliances_breakdown_taskbaseinfo}
            id={getPageKey('base')}
            bodyStyle={{ padding: '4px 0 0' }}
          >
            <ArtTemplateDataInfo data={dataInfo} span={2} />
          </TzCard>
          <TzCard id={getPageKey('chart')} className={'mt20'} bodyStyle={{ paddingTop: '16px' }}>
            <div
              className={'flex-r'}
              style={{
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
            >
              <div className="df dfac">
                <PageTitle
                  title={translations.deflectDefense_recordChart}
                  style={{
                    color: '#3E4653',
                    fontSize: '16px',
                    fontWeight: '500',
                  }}
                />
                <ContainerSelector policyId={policyId} />
              </div>
              <div
                style={{
                  width: '360px',
                  justifyContent: 'space-between',
                  alignItems: 'end',
                }}
                className={'flex-c'}
              >
                <TzTabsNormal
                  activeKey={activeKey}
                  onChange={(_key) => {
                    setActiveKey(_key);
                    onChangeFilters({
                      createdAt: {
                        start: moment()
                          .add(-parseInt(_key), _key == '24' ? 'hours' : 'days')
                          .valueOf(),
                        end: moment().valueOf(),
                      },
                    });
                  }}
                  className="tabs-nav-mb0 tabs-nav-border0 mb12 f14"
                  style={{ padding: '0px', fontWeight: 400 }}
                  tabpanes={[
                    {
                      tab: translations.hours_24,
                      tabKey: '24',
                    },
                    {
                      tab: translations.days_7,
                      tabKey: '7',
                    },
                    {
                      tab: translations.days_30,
                      tabKey: '30',
                    },
                  ]}
                />
                <TzRangePicker
                  allowClear={false}
                  format="YYYY/MM/DD HH:mm:ss"
                  ranges={
                    {
                      [translations.hours_24]: [moment().add(-24, 'h'), moment()],
                      [translations.days_7]: [moment().add(-7, 'd'), moment()],
                      [translations.days_30]: [moment().add(-30, 'd'), moment()],
                    } as any
                  }
                  showTime
                  value={[moment(filters.createdAt.start), moment(filters.createdAt.end)]}
                  onChange={(e: any) => {
                    setActiveKey('0');
                    onChangeFilters({
                      createdAt: {
                        start: moment(e[0]).valueOf(),
                        end: moment(e[1]).valueOf(),
                      },
                    });
                  }}
                />
              </div>
            </div>
            <div style={{ height: '245px', width: width - 50 + 'px' }}>
              <EventChart
                ref={refBubbleChart}
                data={option}
                selectedMode
                refresh={(time: any) => {
                  setActiveKey('0');
                  onChangeFilters({ createdAt: time });
                }}
              />
            </div>
          </TzCard>
          <TzCard
            title={translations.runtimePolicy_listtitle}
            className={'mt20'}
            id={getPageKey('list')}
            bodyStyle={{ paddingTop: '8px' }}
          >
            <TzTableServerPage
              columns={columns}
              reqFun={reqFun}
              rowKey={'container_id'}
              expandable={{
                expandedRowRender: (item: any) => {
                  let o: any = clusterList.find((ite: { value: any }) => baseInfo['cluster_key'] === ite.value) || {};
                  return (
                    <ExceptRecord
                      rowData={{
                        ...item,
                        policy_id: policyId,
                        ...baseInfo,
                        cluster_name: o['label'],
                      }}
                    />
                  );
                },
              }}
            />
          </TzCard>
          <TzCard
            title={WhiteHeadDom}
            className={'mt20 mb20'}
            id={getPageKey('whitelist')}
            bodyStyle={{ paddingTop: '8px' }}
          >
            <TzTableServerPage
              columns={columnsWhhite}
              reqFun={reqFunWhite}
              rowKey={'container_id'}
              ref={tablelistRef}
            />
          </TzCard>
        </div>
        <TzAnchor items={items} />
      </div>
    </div>
  );
};

export default DeflectDefenseInfo;
