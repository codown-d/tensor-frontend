import React, { useCallback, useMemo, useState } from 'react';
import { usePagination, useUpdateEffect } from 'ahooks';
import { cloneDeep, isEqual, keys, set, split } from 'lodash';
import moment from 'moment';
import { useMatch, useNavigate } from 'react-router-dom';
// import { useAliveController } from 'react-activation';
// import { useNavigate } from 'react-router-dom';
import { map } from 'rxjs/operators';
import { TzFilter, TzFilterForm } from '../../../components/ComponentsLibrary';
import useTzFilter, { FilterContext } from '../../../components/ComponentsLibrary/TzFilter/useTzFilter';
import { FilterFormParam } from '../../../components/ComponentsLibrary/TzFilterForm/filterInterface';
import { TzSelectProps } from '../../../components/tz-select';
import { TzTable } from '../../../components/tz-table';
import { policyActionEnum, RenderTag, TzTag } from '../../../components/tz-tag';
import { WebResponse } from '../../../definitions';
import { showFailedMessage } from '../../../helpers/response-handlers';
import { Routes } from '../../../Routes';
import { getContainerGraphList } from '../../../services/DataService';
import { translations } from '../../../translations/translations';
import { statusValToKey } from './util';
import { TListComponentProps } from './interface';
// import { Store } from '../../../services/StoreService';
import { TextHoverCopy } from '../../AlertCenter/AlertCenterScreen';
import { getClusterName } from '../../../helpers/use_fun';
import EllipsisPopover from '../../../components/ellipsisPopover/ellipsisPopover';
import { useNavigatereFresh } from '../../../helpers/useNavigatereFresh';
import './Container.scss';
import LabelCol, { useBatchLabelContext, BatchButton } from '../../../components/label-col';

const optionStatus: TzSelectProps['options'] = [
  {
    value: '0',
    label: 'running', // translations.running,
  },
  {
    value: '1',
    label: 'created', // translations.clusterGraphList_containerInfo_status_created,
  },
  // {
  //   value: '2',
  //   label: translations.clusterGraphList_containerInfo_status_restarting,
  // },
  // {
  //   value: '3',
  //   label: translations.clusterGraphList_containerInfo_status_removing,
  // },
  // {
  //   value: '4',
  //   label: translations.clusterGraphList_containerInfo_status_paused,
  // },
  {
    value: '2',
    label: 'exited', // translations.clusterGraphList_containerInfo_status_exited,
  },
  {
    value: '3',
    label: 'unknown',
  },
  // {
  //   value: '6',
  //   label: translations.clusterGraphList_containerInfo_status_dead,
  // },
];
const optionType: TzSelectProps['options'] = [
  {
    value: 'true',
    label: translations.clusterGraphList_containerInfo_k8scontainer,
  },
  {
    value: 'false',
    label: translations.clusterGraphList_containerInfo_unk8scontainer,
  },
];

export const TzTableTzTdInfoAssets = (props: {
  [x: string]: any;
  name: string;
  containerName?: any;
  clusterName?: any;
  nodeName?: any;
  namespace?: any;
  resourceName?: any;
  podName?: any;
}) => {
  let { name, _nk, ...otherProps } = props;
  let obj: any = {
    clusterName: translations.clusterManage_key,
    nodeName: translations.compliances_breakdown_statusName,
    namespace: translations.onlineVulnerability_outerShapeMeaning,
    resourceName: translations.resources,
    podName: 'Pod',
  };
  return (
    <>
      <div style={{ maxWidth: 'calc(100% - 24px)' }} className="mb6">
        <TextHoverCopy text={name} lineClamp={2} style={{ lineHeight: '24px', fontSize: '16px' }} />
      </div>
      <p>
        {keys(otherProps).map((ite) => {
          return (
            <TzTag className="ant-tag-gray small mt2 mb2" style={{ maxWidth: '223px' }} key={Math.random()}>
              <EllipsisPopover title={(otherProps as any)[ite]}>{`${obj[ite]}：${
                (otherProps as any)[ite]
              }`}</EllipsisPopover>
            </TzTag>
          );
        })}
      </p>
    </>
  );
};

const ContainerTable = (_props: TListComponentProps) => {
  const { clusterList, clusterKeyToName, hideLabel, containerIds, rowKey = 'id' } = _props;
  const navigate = useNavigate();
  const [filters, setFilters] = useState<any>(Object.assign({}));
  // 批量操作hook
  const batchLabelCtx = useBatchLabelContext();
  const [{ rowSelection, isInLabelPage, onlyShowSelect, tagRelateAssetIds }, { setRefreshTable }] = batchLabelCtx[0]
    ? batchLabelCtx
    : ([{}, {}] as any);
  const inWebsiteInfoPage = !!useMatch(Routes.AssetsWebsiteInfo);

  const {
    data: dataSource,
    loading,
    pagination,
    refresh,
  } = usePagination(
    ({ current, pageSize }) => {
      const offset = (current - 1) * pageSize;
      let newFilters = { ...filters };
      if (filters.status) {
        newFilters = set(
          newFilters,
          'status',
          filters.status.map((v: string, index: number) => (index ? `${'status'}=${v}` : v)).join('&'),
        );
      }
      const param: any = {
        offset,
        limit: pageSize,
        hideTags: isInLabelPage,
        ...newFilters,
      };
      // web 站点详情页特殊处理
      if (containerIds) {
        // 没有 containerIds ，数据为空，不调用接口
        if (containerIds === 'empty') {
          return Promise.resolve({ list: [], total: 0 });
        }
        param.container_ids = containerIds;
      } else {
        param.container_ids = isInLabelPage && !onlyShowSelect ? '' : tagRelateAssetIds;
      }
      return getContainerGraphList(param)
        .pipe(
          map((res: WebResponse<any>) => ({
            list: res.getItems(),
            total: res.totalItems,
          })),
        )
        .toPromise();
    },
    {
      defaultPageSize: _props.pageSize || 10,
      refreshDeps: [filters, containerIds, onlyShowSelect],
    },
  );
  setRefreshTable && setRefreshTable(refresh);

  const columns = useMemo(() => {
    const cols = [
      {
        title: translations.clusterGraphList_containerDetail_containerInfo,
        dataIndex: 'resourceName',
        width: '40%',
        render: (item: any, row: any) => {
          return (
            <TzTableTzTdInfoAssets
              name={row.name}
              clusterName={getClusterName(row.clusterKey)}
              nodeName={row.nodeName}
              namespace={row.namespace}
              resourceName={row.resourceName}
              podName={row.podName}
            />
          );
        },
      },
      {
        title: translations.scanner_report_containerType,
        dataIndex: 'k8sManaged',
        key: 'k8sManaged',
        render: (item: any, row: any) => {
          return (
            <>
              {item
                ? translations.clusterGraphList_containerInfo_k8scontainer
                : translations.clusterGraphList_containerInfo_unk8scontainer}
            </>
          );
        },
      },
      {
        title: translations.license_status,
        dataIndex: 'status',
        key: 'status',
        render: (item: any, row: any) => {
          if (!item && String(item) !== '0') return null;
          const val = statusValToKey[item];
          return <RenderTag type={val} title={val} />;
        },
      },
      {
        title: translations.frame_info,
        dataIndex: 'FrameworkStr',
        key: 'FrameworkStr',
        render: (item: string) => <EllipsisPopover lineClamp={2}>{item || '-'}</EllipsisPopover>,
      },
      {
        title: translations.asset_label,
        dataIndex: 'Tags',
        render: (item: any, row: any) => {
          return <LabelCol labels={item} />;
        },
      },
      {
        title: translations.clusterGraphList_tabInfo_createTime,
        dataIndex: 'createdAt',
        key: 'createdAt',
        // width: '14%',
        width: '170px',
        render: (time: any) => moment(time).format('YYYY-MM-DD HH:mm:ss'),
      },
    ] as any;
    if (isInLabelPage) {
      return cols.filter((col: any) => col.title !== translations.asset_label);
    }
    return cols;
  }, [clusterKeyToName, isInLabelPage]);

  const configFilter: FilterFormParam[] = useMemo(
    () => [
      {
        label: translations.clusterGraphList_tabInfo_containerName,
        name: 'container_name',
        type: 'input',
        icon: 'icon-Dockerjingxiang',
      },
      {
        label: translations.clusterGraphList_node,
        name: 'node_name',
        type: 'input',
        icon: 'icon-jiedian',
        props: { isTag: true },
      },
      {
        label: translations.clusterGraphList_namespace,
        name: 'namespace',
        type: 'input',
        icon: 'icon-mingmingkongjian',
        props: { isTag: true },
      },
      {
        label: translations.resources,
        name: 'resource_name',
        type: 'input',
        icon: 'icon-ziyuan',
        props: { isTag: true },
      },
      {
        label: 'pod',
        name: 'pod_name',
        type: 'input',
        icon: 'icon-pod',
        props: { isTag: true },
      },
      {
        label: translations.clusterGraphList_containerDetail_frameName,
        name: 'framework_name',
        type: 'input',
        icon: 'icon-yuming',
        props: { isTag: true },
      },
      {
        label: translations.clusterGraphList_containerDetail_frameVersion,
        name: 'framework_version',
        type: 'input',
        icon: 'icon-biaoji',
        props: { isTag: true },
      },
      {
        label: translations.clusterGraphList_cluster,
        name: 'clusterKey',
        type: 'select',
        icon: 'icon-jiqun',
        props: {
          options: clusterList,
        },
      },
      {
        label: translations.license_status,
        name: 'status',
        type: 'select',
        icon: 'icon-yunhangzhuangtai',
        props: {
          mode: 'multiple',
          options: optionStatus,
        },
      },
      {
        label: translations.scanner_report_containerType,
        name: 'k8s_managed',
        type: 'select',
        icon: 'icon-leixing',
        props: {
          options: optionType,
        },
      },
    ],
    [clusterList],
  );
  const initData = _props.hideLabel ? undefined : useMemo(() => ({ status: ['0', '1'] }), []);

  const data = useTzFilter({ initial: configFilter, initialValues: initData });

  useUpdateEffect(() => {
    data.updateFilter(
      configFilter.map((item) => ({
        ...item,
        value: filters[item.name],
      })) as FilterFormParam[],
    );
  }, [clusterList]);

  const handleChange = useCallback((values: any) => {
    const temp = {};
    keys(values).forEach((key) => {
      let _val = cloneDeep(values[key]);
      if (['namespace', 'node_name', 'pod_name', 'resource_name'].includes(key)) {
        const formatVal = split(_val.replace(/[\uff0c]/g, ','), ',').filter((v) => v !== '');
        set(temp, [key], formatVal.map((v, index) => (index ? `${key}=${v}` : v)).join('&'));
        return;
      }
      set(temp, [key], _val);
    });
    setFilters((prev: any) => (isEqual(temp, prev) ? prev : temp));
  }, []);

  // let { jump } = useNavigatereFresh();
  return (
    <div className="container-wrap-kh92">
      <div className="mb12">
        <FilterContext.Provider value={{ ...data }}>
          <div className="data-list-case-bar">
            {!hideLabel && !isInLabelPage && <span className="headTit">{translations.clusterGraphList_container}</span>}
            <TzFilter />
          </div>
          <TzFilterForm onChange={handleChange} />
        </FilterContext.Provider>
      </div>
      {!inWebsiteInfoPage && <BatchButton />}
      <TzTable
        columns={columns}
        loading={loading}
        dataSource={dataSource?.list}
        pagination={{ ...pagination, total: dataSource?.total }}
        sticky={true}
        rowKey={rowKey}
        rowSelection={rowSelection}
        onRow={(record) => {
          return {
            onClick: () => {
              if (window.REACT_APP_ASSET_MODULE.includes('container')) return;
              if (!record?.id) {
                showFailedMessage(translations.clusterGraphList_containerInfo_toastError, '400');
                return;
              }

              navigate(
                `${Routes.RiskGraphListContainerDetail}?containerID=${record?.id}&ClusterID=${record?.clusterKey}`,
              );
              // jump(
              //   `${Routes.RiskGraphListContainerDetail}?containerID=${record?.id}&ClusterID=${record?.clusterKey}`,
              //   'RiskGraphListContainerDetail',
              // );
            },
          };
        }}
      />
    </div>
  );
};

export default ContainerTable;
