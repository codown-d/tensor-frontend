import moment from 'moment';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import AnalysisTimeLine from '../../components/ComponentsLibrary/AnalysisTimeLine/AnalysisTimeLine';
import SwitchChanger from '../../components/ComponentsLibrary/SwitchChanger/SwitchChanger';
import { TzButton } from '../../components/tz-button';
import { TzCard } from '../../components/tz-card';
import { TableScrollFooter, TzTable, TzTableServerPage } from '../../components/tz-table';
import { TzTag } from '../../components/tz-tag';
import { TzTree } from '../../components/tz-tree';
import { SelectItem, WebResponse } from '../../definitions';
import { map, tap } from 'rxjs/operators';
import {
  alertAnalyze,
  eventDetail,
  getContainer,
  getHistory,
  getNamespaces,
  getNodes,
  getPods,
  getResources,
  holaRules,
  palaceSignals,
  processingCenterRecord,
} from '../../services/DataService';
import {
  getSeverityTag,
  TzTableTzTdInfo,
  TzTableTzTdRules,
  TzTableTzTdType,
  TzTableTzTdWarn,
} from './AlertCenterScreen';
import './EventDetail.scss';
import { translations } from '../../translations/translations';
import { addSignMark, dealOrder, EvenMarkerDom } from './EventData';
import { useThrottle } from '../../services/ThrottleUtil';
import { TzDrawer, TzDrawerFn, TzDrawerFullScreenFn } from '../../components/tz-drawer';
import { PalaceDetailInfo } from './PalaceEvent';
import { Store } from '../../services/StoreService';
import { Routes } from '../../Routes';
import EllipsisPopover from '../../components/ellipsisPopover/ellipsisPopover';
import { TablePaginationConfig } from 'antd/lib/table';
import { merge } from 'lodash';
import { getAllowWhitelist } from './WhiteListPolicyDetail';
import { parseGetMethodParams } from '../../helpers/until';
import { Observable } from 'rxjs';
import { showFailedMessage } from '../../helpers/response-handlers';
import { operations } from './eventDataUtil';
import ArtTemplateDataInfo from '../../components/ComponentsLibrary/ArtTemplateDataInfo';
import TzAnchor, { useAnchorItem } from '../../components/ComponentsLibrary/TzAnchor';
import WhiteListPolicyModalDetail from './WhiteListPolicyModalDetail';
import { useMemoizedFn, useUnmount } from 'ahooks';
import DisposalRecordChildren from './DisposalRecordDrawer';
import { getUserInformation } from '../../services/AccountService';

const responseStatus: SelectItem[] = [
  {
    label: translations.isolated,
    value: 'isolated',
  },
  {
    label: translations.scanner_images_finished,
    value: 'end',
  },
];

const items = [
  {
    href: '#base',
    title: <EllipsisPopover>{translations.compliances_breakdown_taskbaseinfo}</EllipsisPopover>,
  },
  {
    href: '#titleDetail',
    title: <>{translations.runtimePolicy_drawer_title_detail}</>,
  },
  {
    href: '#object',
    title: <EllipsisPopover>{translations.associated_objects}</EllipsisPopover>,
  },
  {
    href: '#analysis',
    title: <EllipsisPopover>{translations.palaceEventTab}</EllipsisPopover>,
  },
  {
    href: '#order',
    title: <EllipsisPopover>{translations.disposal_of_work_order}</EllipsisPopover>,
  },
];

export const TzAIContainer = (props: any) => {
  return (
    <div className={'fixed-widgets'} style={{ bottom: 20 }}>
      <div
        style={{ lineHeight: 48 }}
        onClick={() => {
          let userInfo = getUserInformation();
          let text = $('#titleDetail .art-template').text();
          alertAnalyze({
            text: text,
            user: userInfo.username, // 用户名
          }).subscribe((res) => {});
        }}
        className={'fixed-widgets-content'}
      >
        AI
      </div>
    </div>
  );
};
const EventDetail = (props: any) => {
  const navigate = useNavigate();
  const [result] = useSearchParams();
  const params = useParams() || {};
  const [info, setInfo] = useState<any>(undefined);
  const [loading, setLoading] = useState(false);
  const [noMore, setNoMore] = useState(false);
  const [columns, setColumns] = useState([]);
  const [selectTime, setSelectTime] = useState<any>(null);
  const [page, setPage] = useState<any>({ limit: 5, offset: 0, token: '' });
  const [signalsList, setSignalsList] = useState<any>([]);
  const scrollRef = useRef<any>(null);
  const listComp = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  let [contextList, setContextList] = useState<any>({});
  let [disposalRecordId, setDisposalRecordId] = useState<string>();
  const cacheDrawerData = useRef<string>();

  const getDataInfo = useCallback(() => {
    eventDetail(props?.id ? { id: props.id } : params)
      .pipe(
        tap((res: WebResponse<any>) => {
          let item = res.getItem();
          item && setInfo(item);
        }),
      )
      .subscribe();
  }, [JSON.stringify(params)]);
  useEffect(() => {
    getDataInfo();
  }, [getDataInfo]);

  const fetchSignals = useCallback(() => {
    if (!info) return;
    let params = {
      query: {
        ruleKey: result.get('formType') === 'kubeMonitor' ? ['kubeMonitor'] : [],
        eventID: info.id,
        createdAt: selectTime,
      },
      page,
    };
    setLoading(true);
    palaceSignals(params).subscribe((res: any) => {
      const items = res.getItems();
      setSignalsList((pre: any) => {
        if (page.offset === 0) {
          return [...items].slice(0);
        }
        return [...pre, ...items].slice(0);
      });
      setPage((pre: any) => {
        return merge(pre, { token: res.data?.pageToken });
      });
      setLoading(false);
      if (items.length < params.page.limit) {
        setNoMore(true);
      }
    });
  }, [info, page, selectTime]);

  const onScrollHandle = useCallback(
    useThrottle(() => {
      if (!scrollRef.current || loading || noMore) {
        return;
      }
      const { scrollTop, clientHeight, scrollHeight } = scrollRef.current;
      const isBottom = scrollTop + clientHeight + 1 >= scrollHeight;
      if (isBottom) {
        setPage((pre: any) => {
          let o = { offset: pre.offset + pre.limit, limit: pre.limit };
          return merge({}, pre, o);
        });
      }
    }, 0),
    [scrollRef, noMore, loading],
  );
  const dataInfoMarkList = useMemo(() => {
    if (!info) return [];
    const obj: any = {
      status: translations.event_marker + '：',
      processor: translations.last_tagged_by + '：',
      timestamp: translations.latest_marking_time + '：',
      remark: translations.mark_comments + '：',
    };
    return Object.keys(obj).map((item) => {
      let o: any = {
        title: obj[item] || '-',
        content: info.process?.[item] || '-',
        className: 'w100',
      };
      if ('status' === item) {
        o['render'] = () => {
          return <EvenMarkerDom status={info.process?.status || undefined} info={true} />;
        };
      }
      if ('timestamp' === item) {
        o['render'] = () => {
          return info.process && info.process.timestamp
            ? moment(info.process.timestamp).format('YYYY-MM-DD HH:mm:ss')
            : '-';
        };
      }
      return o;
    });
  }, [info]);
  const dataInfoList = useMemo(() => {
    if (!info) return [];
    const obj: any = {
      id: translations.event_number + '：',
      updatedAt: translations.scanner_report_occurTime + '：',
      signalsCount: translations.number_of_associated_alarms + '：',
      type: translations.palaceEvent_aboutType + '：',
    };
    return Object.keys(obj).map((item) => {
      let o: any = {
        title: obj[item] || '-',
        content: info[item],
        className: 'w100',
      };
      if ('signalsCount' === item) {
        o['render'] = () => {
          return <TzTableTzTdWarn {...info} />;
        };
      }
      if ('type' === item) {
        o['render'] = () => {
          let obj: any = {
            ruleScope: translations.rule_association,
            process: translations.process_association,
            规则关联: translations.rule_association,
            进程关联: translations.process_association,
          };
          return <TzTag>{obj[info[item]]}</TzTag>;
        };
      }
      if ('updatedAt' === item) {
        o['render'] = () => {
          return moment(info[item]).format('YYYY-MM-DD HH:mm:ss');
        };
      }
      return o;
    });
  }, [info]);
  const dataInfoListC = useMemo(() => {
    if (!info) return [];
    let data: any = { severity: info.severity, ...info.ruleDetail, description: info.description };
    let obj: any = {
      type: translations.originalWarning_rule + '：',
      severity: translations.imagesDiscover_severity + '：',
      urgency: translations.needEmergencyHandle + '：',
      description: translations.clusterManage_aDescription + '：',
      suggestion: translations.disposal_suggestions + '：',
    };
    return Object.keys(obj).map((item) => {
      let o: any = {
        title: obj[item] || '-',
        content: data[item] || '-',
      };
      if ('type' === item) {
        o['render'] = () => {
          return (
            <div style={{ overflow: 'hidden', display: 'flex' }}>
              <TzTag>
                <EllipsisPopover style={{ marginTop: 3, height: 22 }}>{data[item]}</EllipsisPopover>
              </TzTag>
            </div>
          );
        };
      }
      if ('severity' === item) {
        o['render'] = () => {
          return getSeverityTag(data[item]);
        };
      }

      if ('suggestion' === item || 'description' === item) {
        o['className'] = 'item-flex-start';
        o['render'] = () => {
          return data[item];
        };
      }
      return o;
    });
  }, [info]);
  const dataInfoListD = useMemo(() => {
    if (!info) return [];
    let data: any = info['context'] || {};
    return Object.keys(data).map((item) => {
      let o: any = {
        title: (contextList[item] || item) + '：',
        content: data[item] || '-',
      };
      return o;
    });
  }, [info, contextList]);
  useEffect(() => {
    holaRules({ domain: 'signal.context', type: 'key' }).subscribe((res) => {
      let item = res.getItem() || {};
      setContextList(item);
    });
  }, []);
  const dataSource = useMemo(() => {
    if (!info) {
      return null;
    }
    if (info.resources.length !== 0) {
      let col: any = [];
      let str: any = {
        cluster: translations.compliances_cronjobs_selectCluster,
        namespace: translations.scanner_listColumns_namespace,
        pod: 'Pod',
        container: translations.commonpro_Container,
        resource: translations.resources,
        registry: translations.library,
        repo: translations.image,
        tag: translations.image_tag,
        hostname: translations.host_name,
        ip: 'IP',
        scene: translations.object_type,
      };
      Object.keys(info.resources[0]).map((item) => {
        if (str[item]) {
          col.push({
            title: str[item],
            dataIndex: item,
            ellipsis: true,
            render: (text: any, row: any) => {
              let query: any = {},
                postDetect: Observable<WebResponse<any>>;
              let obj: any = {
                container: translations.commonpro_Container,
                pod: 'pod',
                hostname: translations.host_name,
                namespace: translations.activeDefense_ns,
                resource: translations.resources,
              };
              if (['container', 'pod'].includes(item)) {
                if (item === 'container') {
                  if (window.REACT_APP_ASSET_MODULE.includes('container')) {
                    return (
                      <EllipsisPopover lineHeight={22} style={{ verticalAlign: 'top' }}>
                        {text.name}
                      </EllipsisPopover>
                    );
                  }
                  query = {
                    type: 'container',
                    containerID: row['container'].id,
                    ClusterID: row['cluster'].id,
                    name: row['container'].id,
                  };
                  postDetect = getContainer({
                    containerID: row['container'].id,
                  });
                } else if (item === 'pod') {
                  query = {
                    type: 'pod',
                    PodUID: row['pod'].id,
                    PodName: row['pod'].name,
                    name: row['pod'].name,
                    ClusterID: row['cluster'].id,
                  };
                  postDetect = getPods({
                    cluster_key: row['cluster'].id,
                    namespace: row['namespace'].name,
                    name: row['pod'].name,
                  });
                }
                return (
                  <TzButton
                    type={'text'}
                    style={{ maxWidth: '100%' }}
                    onClick={() => {
                      if (Object.values(query).filter((item) => !item).length) {
                        showFailedMessage(translations.error_query);
                      } else {
                        postDetect.subscribe(async (res) => {
                          let ite = res.getItem();
                          if (res.error || !ite || Object.values(ite).length == 0) {
                            return showFailedMessage(`${query.name} ${obj[item]} ${translations.not_exist}`);
                          } else {
                            navigate(`/assets/${item}-details${parseGetMethodParams(query)}`);
                          }
                        });
                      }
                    }}
                  >
                    <EllipsisPopover lineHeight={22} style={{ verticalAlign: 'top' }}>
                      {text.name}
                    </EllipsisPopover>
                  </TzButton>
                );
              } else if (['hostname', 'namespace', 'resource'].includes(item)) {
                if (item === 'hostname') {
                  query = {
                    type: 'node',
                    NSName: row['hostname'].name,
                    name: row['hostname'].name,
                    ClusterID: row['cluster'].id,
                  };
                  postDetect = getNodes({
                    cluster_key: row['cluster'].id,
                    name: row['hostname'].name,
                  });
                } else if (item === 'namespace') {
                  query = {
                    type: item,
                    NSName: row['namespace'].name,
                    name: row['namespace'].name,
                    ClusterID: row['cluster'].id,
                  };

                  postDetect = getNamespaces({
                    cluster_key: row['cluster'].id,
                    name: row['namespace'].name,
                  });
                } else if (item === 'resource') {
                  let name = row['resource'].name.split('(')[0],
                    kind = row['resource'].name.split('(')[1].slice(0, -1);
                  query = {
                    type: item,
                    NSName: row?.namespace?.name,
                    name,
                    ClusterID: row['cluster'].id,
                    kind,
                  };
                  postDetect = getResources({
                    cluster_key: row['cluster'].id,
                    namespace: row?.namespace?.name,
                    kind,
                    name,
                  });
                }
                return (
                  <TzButton
                    type={'text'}
                    style={{ maxWidth: '100%' }}
                    onClick={() => {
                      if (Object.values(query).filter((item) => !item).length) {
                        showFailedMessage(translations.error_query);
                      } else {
                        postDetect.subscribe((res) => {
                          let ite = res.getItem();
                          if (res.error || !ite || Object.values(ite).length == 0) {
                            return showFailedMessage(`${query.name} ${obj[item]} ${translations.not_exist}`);
                          }
                          if (item === 'resource') {
                            query['resource_id'] = ite.resource_id;
                          }
                          navigate(`${Routes.ClustersOnlineVulnerabilitiesDetails}${parseGetMethodParams(query)}`);
                        });
                      }
                    }}
                  >
                    <EllipsisPopover lineHeight={22} style={{ verticalAlign: 'top' }}>
                      {text.name}
                    </EllipsisPopover>
                  </TzButton>
                );
              } else {
                return text.name;
              }
            },
          });
        }
      });
      setColumns(col);
    }
    return info.resources;
  }, [info]);

  const onSelect = useCallback(() => {}, []);
  const treeData = useMemo(() => {
    return [
      {
        title: 'parent 1',
        key: '0-0',
        children: [
          {
            title: 'parent 1-0',
            key: '0-0-0',
            disabled: true,
            children: [
              {
                title: 'leaf',
                key: '0-0-0-0',
                disableCheckbox: true,
              },
              {
                title: 'leaf',
                key: '0-0-0-1',
              },
            ],
          },
          {
            title: 'parent 1-1',
            key: '0-0-1',
            children: [
              {
                title: <span style={{ color: '#1890ff' }}>sss</span>,
                key: '0-0-1-0',
              },
            ],
          },
        ],
      },
    ];
  }, []);
  const analysisColumns = [
    {
      title: translations.alarm_information,
      key: 'id',
      dataIndex: 'id',
      ellipsis: true,
      // width: '40%',
      render(item: any, row: any) {
        let obj = Object.assign({}, row, { description: row.ruleKey.name });
        return <TzTableTzTdInfo {...obj} t={'detail'} />;
      },
    },
    {
      title: translations.hit_rule,
      key: 'id',
      dataIndex: 'id',
      width: '14%',
      ellipsis: {
        showTitle: false,
      },
      render(item: any, row: any) {
        return <TzTableTzTdType {...row} />;
      },
    },
    {
      title: translations.rule_label,
      key: 'id',
      dataIndex: 'id',
      width: '16%',
      ellipsis: {
        showTitle: false,
      },
      render(item: any, row: any) {
        return <TzTableTzTdRules {...row} />;
      },
    },
    {
      title: translations.scanner_report_occurTime,
      key: 'createdAt',
      dataIndex: 'createdAt',
      width: '14%',
      render: (attack_time: any, row: any) => {
        return moment(attack_time).format('YYYY-MM-DD HH:mm:ss');
      },
    },
  ];

  useEffect(() => {
    fetchSignals();
  }, [page, selectTime, info]);

  const setTimeFn = useCallback((arg: any) => {
    let { startAt = -1, endAt = -1 } = arg || {};
    setNoMore(false);
    setPage((pre: any) => {
      return { offset: 0, limit: 5 };
    });
    setSelectTime(() => {
      return {
        start: startAt,
        end: endAt,
      };
    });
    setSignalsList([]);
  }, []);
  const infoTypeExtra = useMemo(() => {
    if (!info) return null;
    if (info.type === 'process' || info.type === translations.process_association) {
      return (
        <div style={{ width: '190px' }}>
          <SwitchChanger
            itemList={[
              { key: 'list-perspective', label: translations.listPerspective },
              { key: 'view-perspective', label: translations.view_angle },
            ]}
            callback={() => {}}
          />
        </div>
      );
    }
  }, [info]);

  const infoTypeDom = useMemo(() => {
    if (!info) return null;
    if (info.type === 'ruleScope' || info.type === 'rule_scope' || info.type === translations.rule_association) {
      return (
        <div className="flex-r">
          <div style={{ width: '20%', borderRight: '1px solid #F4F6FA' }}>
            <p className={'e-title mb20'} style={{ paddingLeft: '0px' }}>
              {translations.time_axis}
            </p>
            <AnalysisTimeLine timeLineList={info?.timeline} callback={setTimeFn} />
          </div>
          <div style={{ flex: 1, width: '0' }}>
            <p className={'e-title'}>{translations.associated_alarm_list}</p>
            <div ref={scrollRef} className="time-event-case noScrollbar" onWheel={onScrollHandle}>
              <TzTable
                dataSource={signalsList}
                pagination={false}
                sticky={true}
                rowKey={'id'}
                onRow={(record) => {
                  return {
                    onClick: async (event) => {
                      let dw: any = await TzDrawerFn({
                        className: 'drawer-body0',
                        title: (
                          <div className="ant-drawer-title df dfac">
                            {translations.warningInfo}
                            <TzTag style={{ marginLeft: '12px' }}>{record.id}</TzTag>
                          </div>
                        ),
                        width: '40%',
                        children: <PalaceDetailInfo {...record} />,
                      });
                      dw.show();
                    },
                  };
                }}
                columns={analysisColumns}
                footer={() => {
                  return <TableScrollFooter isData={!!(signalsList.length >= 5)} noMore={noMore} />;
                }}
              />
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex-r">
          <div style={{ width: '256px', borderRight: '1px solid #F4F6FA' }} className="mr24">
            <p className={'e-title'}>
              {translations.processTree}
              <div className="f-r">
                <TzButton type={'text'}>{translations.confirm_modal_restore}</TzButton>
                <TzButton type={'text'}>{translations.notificationCenter_placeEvent_selectAll}</TzButton>
              </div>
            </p>
            <TzTree
              checkable
              defaultExpandedKeys={['0-0-0', '0-0-1']}
              defaultSelectedKeys={['0-0-0', '0-0-1']}
              defaultCheckedKeys={['0-0-0', '0-0-1']}
              onSelect={onSelect}
              treeData={treeData}
            />
          </div>
          <div style={{ flex: 1 }}>
            <p className={'e-title'}>{translations.associated_alarm_list}</p>
            <div>
              <TzTable dataSource={dataSource} pagination={{ defaultPageSize: 5 }} columns={[]} />
            </div>
          </div>
        </div>
      );
    }
  }, [info, onSelect, treeData, analysisColumns, setTimeFn]);

  const reqFunOrder = useCallback(
    (pagination: TablePaginationConfig) => {
      const { current = 1, pageSize = 10 } = pagination;
      const offset = (current - 1) * pageSize;
      if (!info) {
        return getHistory().pipe(
          map(() => {
            return {
              data: [],
              total: [].length,
            };
          }),
        );
      }
      const pageParams = {
        offset,
        limit: pageSize,
        filter: JSON.stringify({ eventID: info.id }),
      };
      return processingCenterRecord(pageParams).pipe(
        map((res: any) => {
          let items = res.getItems();
          return {
            data: items,
            total: res?.data?.totalItems,
          };
        }),
      );
    },
    [info],
  );
  const orderColumns = [
    {
      title: translations.Work_order_no,
      dataIndex: 'id',
    },
    // {
    //   title: '工单名称',
    //   dataIndex: 'baitName',
    //   render: () => {
    //     return '暂无数据';
    //   },
    // },
    {
      title: translations.work_order_type,
      key: 'opType',
      dataIndex: 'opType',
      width: 130,
      render: (text: any) => {
        let node = operations.find((item) => item.value === text);
        return node?.label;
      },
    },
    {
      title: translations.sponsor,
      dataIndex: 'lastOpUser',
    },
    {
      title: translations.compliances_node_status,
      dataIndex: 'status',
      render: (text: any) => {
        let node = responseStatus.find((item) => item.value === text);
        return node?.label;
      },
      width: 90,
    },
    {
      title: translations.originating_time,
      key: 'updatedAt',
      dataIndex: 'updatedAt',
      width: 200,
      render: (text: number) => {
        return <span>{moment(text).format('YYYY-MM-DD HH:mm:ss')}</span>;
      },
    },
  ];

  let Extra = () => {
    if (!info) return <></>;
    let allowWhitelist = getAllowWhitelist(info.ruleKeys.map((item: { categoryKey: any }) => item.categoryKey));
    let node = info.resources.filter((item: { [x: string]: any }) => !!item['pod']);
    return (
      <>
        {node.length !== 0 && (
          <TzButton
            onClick={(event) => {
              event.stopPropagation();
              let disposalObjectList = info.resources
                .filter((item: { [x: string]: any }) => !!item['pod'])
                .map((item: any) => {
                  return {
                    label: item.pod.name,
                    value: `${item.cluster.id}@${item.namespace.name}@${item.pod.name}`,
                  };
                });
              dealOrder(info, disposalObjectList, (item: any) => {
                cacheDrawerData.current = item.id;
                setDisposalRecordId(item.id);
                listComp.current.refresh();
              });
            }}
          >
            {translations.management}
          </TzButton>
        )}
        {allowWhitelist ? (
          <TzButton
            className="ml16"
            onClick={async () => {
              let rules = (info.ruleKeys || []).reduce((pre: any, item: any) => {
                if (pre[item.categoryKey]) {
                  pre[item.categoryKey] = [...pre[item.categoryKey], item.nameKey];
                } else {
                  pre[item.categoryKey] = [item.nameKey];
                }
                return pre;
              }, {});
              let scopes = [info.scopes];
              let ids = [info.id];
              Store.policyDetail.next({
                scopes,
                rules,
                type: 'event',
                ids,
              });
              if (props.anchorTag) {
                let dw: any = await TzDrawerFullScreenFn({
                  children: (
                    <WhiteListPolicyModalDetail
                      setOpenModal={() => {
                        dw.hiden();
                      }}
                    />
                  ),
                  onCloseCallBack() {},
                });
                dw.show();
              } else {
                navigate(Routes.PalaceEventWhiteListDetail.replace('/:id', `/${'new'}`));
              }
            }}
          >
            {translations.increase_white_list}
          </TzButton>
        ) : null}
        <TzButton
          className="ml16"
          onClick={() => {
            addSignMark(info, getDataInfo);
          }}
        >
          {translations.sign}
        </TzButton>
      </>
    );
  };
  let Title = () => {
    if (!info) return <></>;
    return (
      <>
        <span className="mr12">{info?.name}</span>
        {getSeverityTag(info?.severity)}
      </>
    );
  };
  const setHeader = useMemoizedFn(() => {
    props.id ||
      Store.header.next({
        title: <Title />,
        extra: <Extra />,
        onBack: () => {
          navigate(-1);
        },
      });
  });
  const l = useLocation();

  useEffect(setHeader, [info, props.id, l]);

  const closeDrawer = useMemoizedFn(() => {
    setDisposalRecordId(undefined);
    listComp.current.refresh();
  });
  useUnmount(() => {
    closeDrawer();
  });
  let { getPageKey } = useAnchorItem();
  return (
    <>
      <div className="event-detail" ref={containerRef}>
        <div className="flex-r">
          <div className="flex-c" style={{ flex: 1, paddingBottom: '24px', width: 0 }}>
            <TzCard
              title={translations.compliances_breakdown_taskbaseinfo}
              id={getPageKey('base')}
              bordered
              bodyStyle={{ padding: '4px 0 0' }}
            >
              <ArtTemplateDataInfo data={dataInfoList} span={2} />
              <ArtTemplateDataInfo data={dataInfoMarkList.slice(0, 3)} span={2} />
              <ArtTemplateDataInfo data={dataInfoMarkList.slice(3)} span={1} />
            </TzCard>
            <TzCard
              title={translations.runtimePolicy_drawer_title_detail}
              style={{ marginTop: '20px' }}
              id={getPageKey('titleDetail')}
              bordered
              bodyStyle={{ padding: '4px 0 0' }}
            >
              <ArtTemplateDataInfo data={dataInfoListC.slice(0, -2)} span={2} />
              <ArtTemplateDataInfo data={dataInfoListC.slice(-2)} span={1} />
              <ArtTemplateDataInfo data={dataInfoListD} span={2} />
            </TzCard>
            <TzCard
              title={translations.associated_objects}
              style={{ marginTop: '20px' }}
              id={getPageKey('object')}
              bordered
              bodyStyle={{ paddingTop: '0px' }}
            >
              <TzTable
                className="nohoverTable"
                dataSource={dataSource}
                pagination={{ defaultPageSize: 5 }}
                columns={columns}
              />
            </TzCard>
            <TzCard
              title={translations.palaceEventTab}
              style={{ marginTop: '20px' }}
              id={getPageKey('analysis')}
              bordered
              bodyStyle={{ paddingTop: '0px', paddingRight: '0px' }}
              extra={infoTypeExtra}
            >
              {infoTypeDom}
            </TzCard>
            <TzCard
              title={translations.disposal_of_work_order}
              style={{ marginTop: '20px' }}
              id={getPageKey('order')}
              bordered
              bodyStyle={{ paddingTop: '0px', paddingBottom: 0 }}
            >
              <TzTableServerPage
                columns={orderColumns}
                defaultPagination={{
                  current: 1,
                  pageSize: 5,
                  hideOnSinglePage: true,
                }}
                onRow={(record) => {
                  return {
                    onClick: (event) => {
                      cacheDrawerData.current = record.id;
                      setDisposalRecordId(record.id);
                    },
                  };
                }}
                rowKey={'id'}
                ref={listComp}
                reqFun={reqFunOrder}
              />
            </TzCard>
          </div>
          <TzAnchor items={items} />
        </div>
      </div>
      {!!disposalRecordId && (
        <TzDrawer
          getContainer={() => containerRef.current}
          onClose={closeDrawer}
          visible={!!disposalRecordId}
          title={translations.disposalDetails}
          width="80%"
          className="drawer-body0"
          closable={false}
        >
          <DisposalRecordChildren recordId={disposalRecordId} />
        </TzDrawer>
      )}
      {false && <TzAIContainer />}
    </>
  );
};

export default EventDetail;
