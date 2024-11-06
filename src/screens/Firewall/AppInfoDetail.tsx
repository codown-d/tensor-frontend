import { find, merge } from 'lodash';
import moment from 'moment';
import React, { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
// import { useAliveController } from 'react-activation';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Subscription } from 'rxjs';
import { detectionModeOption, modeOption } from '.';
import { TzFilter, TzFilterForm } from '../../components/ComponentsLibrary';
import ArtTemplateDataInfo from '../../components/ComponentsLibrary/ArtTemplateDataInfo';
import TzAnchor, { useAnchorItem } from '../../components/ComponentsLibrary/TzAnchor';
import useTzFilter, { FilterContext } from '../../components/ComponentsLibrary/TzFilter/useTzFilter';
import { FilterFormParam } from '../../components/ComponentsLibrary/TzFilterForm/filterInterface';
import EllipsisPopover from '../../components/ellipsisPopover/ellipsisPopover';
import { TzButton } from '../../components/tz-button';
import { TzCard } from '../../components/tz-card';
import { TzDrawerFn } from '../../components/tz-drawer';
import { TzMessageSuccess } from '../../components/tz-mesage';
import { TzConfirm } from '../../components/tz-modal';
import { TableScrollFooter, TzTable, TzTableServerPage } from '../../components/tz-table';
import { RenderTag, TzTag } from '../../components/tz-tag';
import { Routes } from '../../Routes';
import { attackLog, deleteServiceId, wafService, wafServiceId } from '../../services/DataService';
import { Store } from '../../services/StoreService';
import { useThrottle } from '../../services/ThrottleUtil';
import { translations } from '../../translations/translations';
import { getDEFAULT_PAGE_PARAM, TPage } from '../AlertCenter/EventData';
import { useAssetsClusterList, useAttackClasses } from '../../helpers/use_fun';
import './AppInfo.scss';
import AttackLogInfo from './AttackLogInfo';
import { JumpEndpoint, JumpNamespace, JumpResource } from '../MultiClusterRiskExplorer/components';
import { flushSync } from 'react-dom';

const AppInfoDetail = () => {
  let navigate = useNavigate();
  let l = useLocation();
  // const { refreshScope } = useAliveController();
  const [result] = useSearchParams();
  const [filters, setFilters] = useState<any>({ uuid: result.get('id') });
  const [info, setInfo] = useState<any>(null);
  const [query, setQuery] = useState<any>({ id: result.get('id') });
  let [pagination, setPagination] = useState<TPage>(getDEFAULT_PAGE_PARAM());
  let [dataSource, setDataSource] = useState<any>([]);
  let [pageToken, setPageToken] = useState('');
  let [noMore, setNoMore] = useState(false);
  let [loading, setLoading] = useState(false);
  let clusters = useAssetsClusterList();
  let scrollRef = useRef<any>(null);
  const reqsub = useRef(undefined as undefined | Subscription);
  let setHeader = useCallback(() => {
    if (!info) return;
    Store.header.next({
      title: info.name,
      extra: (
        <div
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <TzButton
            onClick={(e) => {
              navigate(`${Routes.AppInfo}?id=${info.id}`, { replace: true });
            }}
          >
            {translations.edit}
          </TzButton>
          <TzButton
            className={'ml16'}
            danger
            onClick={(e) => {
              TzConfirm({
                content: translations.unStandard.str257(info.name),
                onOk: () => {
                  deleteServiceId({ id: info.id }).subscribe((res) => {
                    if (res.error) {
                      return;
                    }
                    TzMessageSuccess(translations.delete_success_tip);
                    // navigate(`${Routes.Firewall}`);
                    navigate(-1);
                    flushSync(() => {
                      navigate(Routes.Firewall, {
                        replace: true,
                        state: { keepAlive: true },
                      });
                    });
                  });
                },
                okButtonProps: {
                  type: 'primary',
                  danger: true,
                },
                okText: translations.delete,
              });
            }}
          >
            {translations.delete}
          </TzButton>
        </div>
      ),
    });
  }, [info, l]);
  useEffect(() => {
    setHeader();
  }, [setHeader]);
  let getAttackLogDetails = useCallback(() => {
    wafServiceId(query).subscribe((res) => {
      if (res.error) return;
      let item = res.getItem();
      setInfo(item);
    });
  }, [query]);
  useEffect(() => {
    getAttackLogDetails();
  }, []);
  const dataInfoList = useMemo(() => {
    const obj: any = {
      host: translations.domain_name + '：',
      cluster_key: translations.clusterManage_key + '：',
      namespace: translations.onlineVulnerability_outerShapeMeaning + '：',
      resource_name: translations.resources + '：',
      kind: translations.microseg_resources_res_kind + '：',
      mode: translations.actions + '：',
      description: translations.imageReject_comment_title + '：',
    };
    if (!info) {
      return [];
    }
    return Object.keys(obj).map((item) => {
      let o: any = {
        title: obj[item] || '-',
        content: info[item] || '-',
      };
      if ('cluster_key' === item) {
        o['render'] = (row: any) => {
          let clusterName = find(clusters, (c: any) => c.value === info[item])?.label;
          return clusterName;
        };
      }
      if ('namespace' === item) {
        o['render'] = (row: any) => {
          return <JumpNamespace namespace={info[item]} clusterKey={info['cluster_key']} title={info[item]} />;
        };
      }
      if ('resource_name' === item) {
        o['render'] = (row: any) => {
          return (
            <JumpResource
              namespace={info['namespace']}
              clusterKey={info['cluster_key']}
              title={info['resource_name']}
              name={info['resource_name']}
              kind={info['kind']}
            />
          );
        };
      }
      if ('mode' === item) {
        o['render'] = (row: any) => {
          let node = find(modeOption, (ite) => ite.value === info[item]);
          return <RenderTag type={info[item]} title={node?.label} />;
        };
      }
      return o;
    });
  }, [info, clusters]);
  const items = [
    {
      href: '#base',
      title: <EllipsisPopover>{translations.compliances_breakdown_taskbaseinfo}</EllipsisPopover>,
    },
    {
      href: '#attackLog',
      title: <EllipsisPopover>{translations.attack_log}</EllipsisPopover>,
    },
  ];
  let attack_type = useAttackClasses();
  const columns: any = useMemo(
    () => [
      {
        title: translations.attacked_address,
        dataIndex: 'attacked_addr',
        width: '35%',
        ellipsis: { showTitle: false },
        render: (description: any, row: any) => {
          return <EllipsisPopover lineClamp={2}>{description}</EllipsisPopover>;
        },
      },
      {
        title: translations.type_of_attack,
        dataIndex: 'attack_type',
        ellipsis: { showTitle: false },
        render: (type: any, row: any) => {
          let item: any = find(attack_type, ({ value }) => value === type);
          return <EllipsisPopover lineClamp={2}>{item?.label}</EllipsisPopover>;
        },
      },
      {
        title: translations.attack_IP,
        dataIndex: 'attack_ip',
        ellipsis: { showTitle: false },
        render: (description: any, row: any) => {
          return <>{description}</>;
        },
      },
      {
        title: translations.actions,
        dataIndex: 'action',
        width: '18%',
        align: 'center',
        render: (action: any, row: any) => {
          return <RenderTag type={action === 'drop' ? 'protect' : 'alert'} />;
        },
      },
      {
        title: translations.notificationCenter_rule_timestamp,
        dataIndex: 'attack_time',
        width: '14%',
        render: (time: any) => moment(time).format('YYYY-MM-DD HH:mm:ss'),
      },
    ],
    [attack_type],
  );
  let getDataSource = useCallback(() => {
    reqsub.current?.unsubscribe();
    let attack_time = filters?.attack_time?.map((item: any) => {
      return moment(item).valueOf();
    });
    let data = Object.assign({}, { ...pagination }, filters, {
      cluster: info?.cluster_key,
      serviceId: info?.id,
      startTime: attack_time?.[0],
      endTime: attack_time?.[1],
    });
    delete data.attack_time;
    setLoading(true);
    reqsub.current = attackLog(data).subscribe((res: any) => {
      let items: any[] = res.getItems();
      setDataSource((pre: any) => {
        if (pagination.offset === 0) {
          return items;
        } else {
          return [].concat(...pre, ...items);
        }
      });
      setLoading(false);
      setPageToken(res.data?.token);
      setNoMore(data.limit != items.length);
    });
  }, [query, pagination, info, filters]);
  useEffect(() => {
    getDataSource();
  }, [getDataSource]);
  const screenFilter: FilterFormParam[] = useMemo(
    () => [
      {
        label: translations.attacked_address,
        name: 'attackAddr',
        type: 'input',
        icon: 'icon-weizhi',
      },
      {
        label: translations.attack_IP,
        name: 'attackIp',
        type: 'input',
        icon: 'icon-ziyuan',
      },
      {
        label: translations.type_of_attack,
        name: 'attackType',
        type: 'select',
        icon: 'icon-leixing',
        props: {
          mode: 'multiple',
          options: attack_type,
        },
      },
      {
        label: translations.actions,
        name: 'action',
        type: 'select',
        icon: 'icon-xiangyingzhuangtai',
        props: {
          mode: 'multiple',
          options: detectionModeOption,
        },
      },
      {
        label: translations.notificationCenter_rule_timestamp,
        name: 'attack_time',
        type: 'rangePickerCt',
        icon: 'icon-shijian',
        props: {
          showTime: true,
          format: 'YYYY/MM/DD HH:mm:ss',
        },
      },
    ],
    [attack_type],
  );
  const data = useTzFilter({ initial: screenFilter });
  const handleChange = useCallback((values: any) => {
    setFilters((pre: any) => merge({}, values));
    setPagination(getDEFAULT_PAGE_PARAM());
  }, []);
  let onScrollHandle = useCallback(
    useThrottle(() => {
      if (!scrollRef.current || loading || noMore) {
        return;
      }
      const { scrollTop, clientHeight, scrollHeight } = scrollRef.current;
      const isBottom = scrollTop + clientHeight + 60 >= scrollHeight;
      if (isBottom && scrollTop) {
        setLoading(true);
        setPagination((prev) => {
          return merge({}, prev, {
            offset: prev.offset + prev.limit,
            limit: prev.limit,
            token: pageToken,
          });
        });
      }
    }, 100),
    [loading, noMore, scrollRef, pageToken],
  );
  let initOnScroll = () => {
    let dom = $('#layoutMain');
    scrollRef.current = dom[0];
    dom.off('mousewheel DOMMouseScroll scroll').on('mousewheel DOMMouseScroll scroll', onScrollHandle);
  };
  useEffect(() => {
    initOnScroll();
  }, []);
  let { getPageKey } = useAnchorItem();
  return (
    <div className="app-info mlr32 mt4">
      <div className="flex-r">
        <div style={{ flex: 1, width: 0 }}>
          <TzCard
            id={getPageKey('base')}
            className={'mb20'}
            title={translations.compliances_breakdown_taskbaseinfo}
            bodyStyle={{ padding: '4px 0px 0px' }}
          >
            <ArtTemplateDataInfo data={dataInfoList.slice(0, -1)} span={2} />
            <ArtTemplateDataInfo data={dataInfoList.slice(-1)} span={1} />
          </TzCard>
          <TzCard id={getPageKey('attackLog')} headStyle={{ height: 0 }} bodyStyle={{}}>
            <div className="mb12 mt16">
              <FilterContext.Provider value={{ ...data }}>
                <div className={'flex-r-c'}>
                  <span className={'f16 fw550'} style={{ color: '#3e4653' }}>
                    {translations.attack_log}
                  </span>
                  <TzFilter />
                </div>
                <TzFilterForm onChange={handleChange} />
              </FilterContext.Provider>
            </div>
            <TzTable
              columns={columns}
              tableLayout={'fixed'}
              rowKey="uuid"
              loading={loading}
              dataSource={dataSource}
              pagination={false}
              sticky={true}
              onRow={(record) => {
                let item: any = find(attack_type, ({ value }) => value === record.attack_type);
                return {
                  onClick: async () => {
                    let dw: any = await TzDrawerFn({
                      title: (
                        <div className={'flex-r-c'} style={{ justifyContent: 'flex-start' }}>
                          <TzTag className={'mr12 f14'}>{item.label}</TzTag>
                          <span>{record.attacked_addr}</span>
                        </div>
                      ),
                      width: '80%',
                      destroyOnClose: true,
                      children: <AttackLogInfo uuid={record.uuid} />,
                    });
                    dw.show();
                  },
                };
              }}
              footer={() => {
                return <TableScrollFooter noMore={noMore} isData={dataSource.length >= 20} />;
              }}
            />
          </TzCard>
        </div>
        <TzAnchor items={items} />
      </div>
    </div>
  );
};
export default AppInfoDetail;
