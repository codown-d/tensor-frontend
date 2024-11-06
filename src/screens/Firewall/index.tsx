import { TablePaginationConfig } from 'antd/lib/table';
import moment from 'moment';
import React, { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { map } from 'rxjs/operators';
import TzFilter from '../../components/ComponentsLibrary/TzFilter';
import useTzFilter, { FilterContext } from '../../components/ComponentsLibrary/TzFilter/useTzFilter';
import TzFilterForm from '../../components/ComponentsLibrary/TzFilterForm';
import { FilterFormParam } from '../../components/ComponentsLibrary/TzFilterForm/filterInterface';
import { TzButton } from '../../components/tz-button';
import { TzMessageSuccess } from '../../components/tz-mesage';
import { TzConfirm } from '../../components/tz-modal';
import { TableScrollFooter, TzTable, TzTableServerPage } from '../../components/tz-table';
import { TzTabs } from '../../components/tz-tabs';
import { getUrlQuery, isEqual, tabChange } from '../../helpers/until';
import { Routes } from '../../Routes';
import {
  attackClasses,
  attackLog,
  deleteSensitiveRule,
  deleteServiceId,
  wafServices,
} from '../../services/DataService';
import { Store } from '../../services/StoreService';
import { translations } from '../../translations/translations';
import { useAssetsClusterList, useAssetsClusters } from '../../helpers/use_fun';
import { TextHoverCopy } from '../AlertCenter/AlertCenterScreen';
import { RenderTag, TzTag } from '../../components/tz-tag';
import EllipsisPopover from '../../components/ellipsisPopover/ellipsisPopover';
import { TzDrawerFn } from '../../components/tz-drawer';
import AttackLogInfo from './AttackLogInfo';
import { useLocation, useNavigate } from 'react-router-dom';
import { find, merge } from 'lodash';
import { getDEFAULT_PAGE_PARAM, TPage } from '../AlertCenter/EventData';
import { Subscription } from 'rxjs';
import { useThrottle } from '../../services/ThrottleUtil';
import useNewSearchParams from '../../helpers/useNewSearchParams';
export let modeOption = [
  {
    label: translations.transparent_transmission,
    value: 'passthrough',
  },
  {
    label: translations.imageReject_reject_type_alarm,
    value: 'alert',
  },
  {
    label: translations.intercept,
    value: 'protect',
  },
];
export let detectionModeOption = [
  {
    label: translations.imageReject_reject_type_alarm,
    value: 'warn',
  },
  {
    label: translations.intercept,
    value: 'drop',
  },
];
let ListApps = () => {
  const [filters, setFilters] = useState<any>({});
  const tableRef = useRef(undefined as any);
  let navigate = useNavigate();
  let clusterList = useAssetsClusterList();
  const columns: any = [
    {
      title: translations.app_information,
      dataIndex: 'name',
      ellipsis: { showTitle: false },
      render: (name: any, row: any) => {
        let { host } = row;
        return (
          <>
            <p style={{ width: '100%', overflow: 'hidden' }} className={'f16'}>
              <EllipsisPopover lineClamp={2}>{name}</EllipsisPopover>
            </p>
            <p className={'tzTable-tzTd mt8'}>
              <TzTag className="small" style={{ display: 'inline-flex' }}>
                {translations.domain_name}：<TextHoverCopy text={host} />
              </TzTag>
            </p>
          </>
        );
      },
    },
    {
      title: translations.resources,
      dataIndex: 'resource_name',
      ellipsis: { showTitle: false },
      render: (description: any, row: any) => {
        let { cluster_key, namespace } = row;
        let cluster_name = clusterList.filter((item) => item.value === cluster_key)[0]?.label || cluster_key;
        return (
          <>
            <p className={'f16'}>{description}</p>
            <p className={'tzTable-tzTd'}>
              <TzTag className="small mt8" style={{ display: 'inline-flex' }}>
                {translations.clusterManage_key}：{cluster_name}
              </TzTag>
              <TzTag className="small mt8" style={{ display: 'inline-flex' }}>
                {translations.onlineVulnerability_outerShapeMeaning}：{namespace}
              </TzTag>
            </p>
          </>
        );
      },
    },
    {
      title: translations.number_of_attacks_today,
      dataIndex: 'attack_number',
      ellipsis: { showTitle: false },
      width: '15%',
      render: (attack_number: any, row: any) => {
        return <>{attack_number}</>;
      },
    },
    {
      title: translations.actions,
      dataIndex: 'mode',
      width: '14%',
      align: 'center',
      ellipsis: { showTitle: false },
      render: (mode: any, row: any) => {
        let node = find(modeOption, (ite) => ite.value === mode);
        return <RenderTag type={mode} title={node?.label} />;
      },
    },
    {
      title: translations.clusterManage_operate,
      dataIndex: 'fullRepoName',
      width: '120px',
      ellipsis: { showTitle: false },
      render: (description: any, row: any) => {
        return (
          <div
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <TzButton
              type={'text'}
              onClick={(e) => {
                navigate(`${Routes.AppInfo}?id=${row.id}`);
              }}
            >
              {translations.edit}
            </TzButton>
            <TzButton
              type={'text'}
              className={'ml4'}
              danger
              onClick={(e) => {
                TzConfirm({
                  content: translations.unStandard.str257(row.name),
                  onOk: () => {
                    deleteServiceId(row).subscribe((res) => {
                      if (res.error) {
                        return;
                      }
                      TzMessageSuccess(translations.delete_success_tip);
                      tableRef.current.refresh();
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
        );
      },
    },
  ];

  const screenFilter: FilterFormParam[] = useMemo(
    () => [
      {
        label: translations.app_name,
        name: 'name',
        type: 'input',
        icon: 'icon-leixing',
      },
      {
        label: translations.domain_name,
        name: 'host',
        type: 'input',
        icon: 'icon-yuming',
      },
      {
        label: translations.resources,
        name: 'resource_name',
        type: 'input',
        icon: 'icon-ziyuan',
      },
      {
        label: translations.onlineVulnerability_outerShapeMeaning,
        name: 'namespace',
        type: 'input',
        icon: 'icon-mingmingkongjian',
      },
      {
        label: translations.clusterManage_key,
        name: 'cluster_key',
        type: 'select',
        icon: 'icon-jiqun',
        props: {
          mode: 'multiple',
          options: clusterList,
        },
      },
      {
        label: translations.actions,
        name: 'mode',
        type: 'select',
        icon: 'icon-xiangyingzhuangtai',
        props: {
          mode: 'multiple',
          options: modeOption,
        },
      },
    ],
    [clusterList],
  );
  const data = useTzFilter({ initial: screenFilter });
  const handleChange = useCallback((values: any) => {
    setFilters((pre: any) => merge({}, values));
  }, []);
  const reqFun = useCallback(
    (pagination: TablePaginationConfig) => {
      const { current = 1, pageSize = 10 } = pagination;
      const offset = (current - 1) * pageSize;
      let pageParams = Object.assign({ limit: pageSize, offset }, filters);
      return wafServices(pageParams).pipe(
        map((res: any) => {
          let items = res.getItems();
          return {
            data: items,
            total: res?.data?.totalItems,
          };
        }),
      );
    },
    [filters],
  );
  return (
    <>
      <div className="mb12 mt16">
        <FilterContext.Provider value={{ ...data }}>
          <div className={'flex-r-c'}>
            <TzButton
              type={'primary'}
              onClick={() => {
                navigate(`${Routes.AppInfo}`);
              }}
            >
              {translations.add_new_app}
            </TzButton>
            <TzFilter />
          </div>
          <TzFilterForm onChange={handleChange} />
        </FilterContext.Provider>
      </div>
      <TzTableServerPage
        columns={columns}
        tableLayout={'fixed'}
        rowKey="id"
        reqFun={reqFun}
        onRow={(record) => {
          return {
            onClick: () => {
              navigate(`${Routes.AppInfoDetail}?id=${record.id}`);
            },
          };
        }}
        ref={tableRef}
      />
    </>
  );
};
export let DetectionRecords = () => {
  const [filters, setFilters] = useState<any>({ uuid: '' });
  const tableRef = useRef(undefined as any);
  let [attack_type, setAttack_type] = useState([]);
  let [pagination, setPagination] = useState<TPage>(getDEFAULT_PAGE_PARAM());
  let [dataSource, setDataSource] = useState<any>([]);
  let [pageToken, setPageToken] = useState('');
  let [noMore, setNoMore] = useState(false);
  let [loading, setLoading] = useState(false);
  let scrollRef = useRef<any>(null);
  const reqsub = useRef(undefined as undefined | Subscription);
  let clusterList = useAssetsClusterList();
  const columns: any = useMemo(
    () => [
      {
        title: translations.attacked_address,
        dataIndex: 'attacked_addr',
        ellipsis: { showTitle: false },
        width: '20%',
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
          return <EllipsisPopover lineClamp={2}>{description}</EllipsisPopover>;
        },
      },

      {
        title: translations.the_attacked_app,
        dataIndex: 'attacked_app',
        ellipsis: { showTitle: false },
        render: (description: any, row: any) => {
          return <EllipsisPopover lineClamp={2}>{description}</EllipsisPopover>;
        },
      },
      {
        title: translations.clusterManage_key,
        dataIndex: 'cluster_key',
        ellipsis: { showTitle: false },
        width: '8%',
        render: (cluster: any, row: any) => {
          let cluster_name = find(clusterList, (item) => item.value === cluster)?.label || cluster;
          return <EllipsisPopover lineClamp={2}>{cluster_name}</EllipsisPopover>;
        },
      },
      {
        title: translations.actions,
        dataIndex: 'action',
        ellipsis: { showTitle: false },
        width: '14%',
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
    [attack_type, clusterList],
  );
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
        label: translations.the_attacked_app,
        name: 'attackApp',
        type: 'input',
        icon: 'icon-zhujimingcheng',
      },
      {
        label: translations.type_of_attack,
        name: 'attackType',
        type: 'select',
        icon: 'icon-pod',
        props: {
          mode: 'multiple',
          options: attack_type,
        },
      },
      {
        label: translations.clusterManage_key,
        name: 'cluster',
        type: 'select',
        icon: 'icon-jiqun',
        props: {
          mode: 'multiple',
          options: clusterList,
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
    [detectionModeOption, attack_type, clusterList],
  );
  let getDataSource = useCallback(() => {
    reqsub.current?.unsubscribe();
    let attack_time = filters?.attack_time?.map((item: any) => {
      return moment(item).valueOf();
    });
    let data = Object.assign({}, { ...pagination }, filters, {
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
  }, [pagination, filters]);
  useEffect(() => {
    getDataSource();
  }, [getDataSource]);
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

  let getAttackClasses = useCallback(() => {
    attackClasses().subscribe((res) => {
      if (res.error) return;
      let items: any = res.getItems();
      setAttack_type(
        items.map((item: any) => {
          return { label: item.describe, value: item.type };
        }),
      );
    });
  }, []);
  useEffect(getAttackClasses, []);
  return (
    <>
      <div className="mb12 mt16">
        <FilterContext.Provider value={{ ...data }}>
          <div className={'flex-r-c'}>
            <span className={'f16 fw550'} style={{ color: '#1e222a' }}>
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
                  <>
                    <TzTag className={'mr12 f14'}>{item.label}</TzTag>
                    {record.attacked_addr}
                  </>
                ),
                width: '80%',
                destroyOnClose: true,
                children: <AttackLogInfo uuid={record.uuid} />,
              });
              dw.show();
            },
          };
        }}
        ref={tableRef}
        footer={() => {
          return <TableScrollFooter noMore={noMore} isData={dataSource.length >= 20} />;
        }}
      />
    </>
  );
};
const Firewall = () => {
  // let [activeKey, setActiveKey] = useState(getUrlQuery('tab') || 'list_apps');
  const { allSearchParams, addSearchParams } = useNewSearchParams();
  const { tab: activeKey = 'list_apps' } = allSearchParams;
  let navigate = useNavigate();
  let l = useLocation();
  let setHeader = useCallback(() => {
    Store.header.next({
      title: translations.firewall,
      extra: (
        <>
          <TzButton
            icon={<i className={'icon iconfont icon-jingxiangsaomiao-peizhi'}></i>}
            onClick={() => {
              navigate(Routes.RulesManager);
            }}
          >
            {translations.rule_management}
          </TzButton>
          <TzButton
            className={'ml16'}
            icon={<i className={'icon iconfont icon-jingxiangsaomiao-peizhi'}></i>}
            onClick={() => {
              navigate(Routes.WafConfig);
            }}
          >
            {translations.scanner_images_setting}
          </TzButton>
          <TzButton
            className={'ml16'}
            icon={<i className={'icon iconfont icon-jingxiangsaomiao-peizhi '}></i>}
            onClick={() => {
              navigate(Routes.Blackwhitelists);
            }}
          >
            {translations.black_and_white_lists}
          </TzButton>
        </>
      ),
      footer: (
        <TzTabs
          activeKey={activeKey}
          onChange={(val) => {
            tabChange(val);
            addSearchParams({ tab: val });
          }}
          items={[
            { label: translations.list_apps, key: 'list_apps', children: null },
            { label: translations.detection_records, key: 'detection_records', children: null },
          ]}
        />
      ),
    });
  }, [activeKey]);

  useEffect(() => {
    setHeader();
  }, [setHeader, l]);
  return (
    <div className="firewall mlr32 mt8">
      <TzTabs
        activeKey={activeKey}
        tabBarStyle={{ display: 'none' }}
        destroyInactiveTabPane
        items={[
          {
            label: translations.list_apps,
            key: 'list_apps',
            children: <ListApps />,
          },
          {
            label: translations.detection_records,
            key: 'detection_records',
            children: <DetectionRecords />,
          },
        ]}
      />
    </div>
  );
};
export default Firewall;
