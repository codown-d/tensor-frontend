import React, { useCallback, useMemo, useRef, useState } from 'react';
import { map, tap } from 'rxjs/operators';
import { assetsServices, getListClusters } from '../../../services/DataService';
import { TzTag } from '../../../components/tz-tag';
import EllipsisPopover from '../../../components/ellipsisPopover/ellipsisPopover';
import { translations } from '../../../translations/translations';
import { TzTableServerPage } from '../../../components/tz-table';
import { getClusterName, useAssetsClusterList } from '../../../helpers/use_fun';
import { getTime, parseGetMethodParams } from '../../../helpers/until';
import useTzFilter, { FilterContext } from '../../../components/ComponentsLibrary/TzFilter/useTzFilter';
import { TzFilter, TzFilterForm } from '../../../components/ComponentsLibrary';
import { FilterFormParam } from '../../../components/ComponentsLibrary/TzFilterForm/filterInterface';
import { Routes } from '../../../Routes';
import { cloneDeep, isEqual, keys, set } from 'lodash';
import moment from 'moment';
import { useNavigatereFresh } from '../../../helpers/useNavigatereFresh';
import LabelCol, { BatchButton, useBatchLabelContext } from '../../../components/label-col';

export const useFiltersFn = (values: any, setFilters: React.Dispatch<any>) => {
  const temp = {};
  keys(values).forEach((key) => {
    let _val = cloneDeep(values[key]);
    if (key === 'updatedAt') {
      _val[0] && set(temp, [key, 'start_time'], moment(_val[0]).toISOString());
      _val[1] && set(temp, [key, 'end_time'], moment(_val[1]).toISOString());
      return;
    }
    set(temp, [key], _val);
  });
  setFilters((prev: any) => (isEqual(temp, prev) ? prev : temp));
};

let servicTypeOp = [
  {
    label: 'ClusterIP',
    value: 'ClusterIP',
  },
  {
    label: 'NodePort',
    value: 'NodePort',
  },
  {
    label: 'LoadBalancer',
    value: 'LoadBalancer',
  },
  {
    label: 'ExternalName',
    value: 'ExternalName',
  },
];

const AssetService = (props: any) => {
  let { title = '', rowKey = 'id' } = props;
  const [filters, setFilters] = useState<any>({});
  let clusterList = useAssetsClusterList();
  // 批量操作hook
  const [{ rowSelection, isInLabelPage, onlyShowSelect, tagRelateAssetIds }, { setRefreshTable }] =
    useBatchLabelContext();

  const tableRef = useRef<any>(null);
  setRefreshTable(tableRef.current?.refresh);

  const reqFun = useCallback(
    (pagination) => {
      const { current = 1, pageSize = 10 } = pagination;
      let { start_time, end_time } = filters?.updatedAt || {};
      const offset = (current - 1) * pageSize;
      const idList = isInLabelPage && !onlyShowSelect ? '' : tagRelateAssetIds;
      let params = {
        offset,
        limit: pageSize,
        ...filters,
        start_time,
        end_time,
        hideTags: isInLabelPage,
        idList,
      };
      return assetsServices(params).pipe(
        map((res) => {
          const items = res.getItems();
          return {
            data: items,
            total: res.data?.totalItems,
          };
        }),
      );
    },
    [filters, onlyShowSelect],
  );
  const columns = useMemo(() => {
    const items = [
      {
        title: translations.service_info,
        dataIndex: 'name',
        width: '30%',
        render: (name: string, row: any) => {
          const t1 = `${translations.clusterManage_key}：${getClusterName(row.clusterKey)}aaaabbbcccd`;
          const t2 = `${translations.onlineVulnerability_outerShapeMeaning}：${row.namespace}`;
          return (
            <>
              <p className="mb6">
                <EllipsisPopover lineClamp={2} className="f16">
                  {name}
                </EllipsisPopover>
              </p>
              <p>
                <TzTag
                  className={'small ant-tag-gray mt2 mb2'}
                  style={{ maxWidth: '50%', justifyContent: 'flex-start' }}
                >
                  <EllipsisPopover title={t1} placement="topLeft">
                    {t1}
                  </EllipsisPopover>
                </TzTag>

                <TzTag
                  className={'small ant-tag-gray mt2 mb2'}
                  style={{ maxWidth: '50%', justifyContent: 'flex-start' }}
                >
                  <EllipsisPopover title={t2} placement="topLeft">
                    {t2}
                  </EllipsisPopover>
                </TzTag>
              </p>
            </>
          );
        },
      },
      {
        title: translations.service_type,
        dataIndex: 'type',
        // width: '20%',
        render: (item: string, row: any) => {
          return item;
        },
      },
      {
        title: translations.cluster_IP,
        dataIndex: 'clusterIp',
        // width: '15%',
        render: (item: string, row: any) => {
          let name = getClusterName(item);
          return name || '-';
        },
      },
      {
        title: translations.microseg_segments_policy_port_title,
        dataIndex: 'ports',
        // width: '25%',
        render: (ports: any, row: any) => {
          return (
            <EllipsisPopover lineClamp={2}>
              {ports?.map((item: { port: any; protocol: any }) => `${item.port}/${item.protocol}`).join(' ，') || '-'}
            </EllipsisPopover>
          );
        },
      },
      {
        title: translations.asset_label,
        dataIndex: 'tags',
        render: (item: any, row: any) => {
          return <LabelCol labels={item} />;
        },
      },
      {
        title: translations.clusterManage_createtime,
        dataIndex: 'CreatedAt',
        width: 200,
        render: (CreatedAt: number, row: any) => {
          return getTime(CreatedAt);
        },
      },
    ];
    if (isInLabelPage) {
      return items.filter((col: any) => col.title !== translations.asset_label);
    }
    return items;
  }, [isInLabelPage]);
  const screenFilter: FilterFormParam[] = useMemo(
    () => [
      {
        label: translations.service_name,
        name: 'name',
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
        label: translations.cluster_IP,
        name: 'ip',
        type: 'input',
        icon: 'icon-zhujimingcheng',
      },
      {
        label: translations.service_type,
        name: 'type',
        type: 'select',
        icon: 'icon-leixing',
        props: {
          mode: 'multiple',
          options: servicTypeOp,
        },
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
        label: translations.clusterManage_createtime,
        name: 'updatedAt',
        type: 'rangePickerCt',
        icon: 'icon-shijian',
        props: {
          showTime: true,
          format: 'YYYY/MM/DD HH:mm:ss',
        },
      },
    ],
    [clusterList],
  );
  const data = useTzFilter({ initial: screenFilter });
  const handleChange = useCallback((values: any) => {
    useFiltersFn(values, setFilters);
  }, []);
  let { jump } = useNavigatereFresh();

  return (
    <div className="asset-service">
      <div className="mb12">
        <FilterContext.Provider value={{ ...data }}>
          <div className={'flex-r-c'}>
            {!isInLabelPage && <span className="headTit">{title}</span>}
            <TzFilter />
          </div>
          <TzFilterForm onChange={handleChange} />
        </FilterContext.Provider>
      </div>
      <BatchButton />
      <TzTableServerPage
        ref={tableRef}
        columns={columns}
        tableLayout={'fixed'}
        rowKey={rowKey}
        reqFun={reqFun}
        rowSelection={rowSelection}
        onRow={(record) => {
          return {
            onClick: () => {
              let obj = {
                cluster_key: record.clusterKey,
                namespace: record.namespace,
                service_name: record.name,
              };
              jump(Routes.AssetsServiceInfo + `${parseGetMethodParams(obj)}`, 'AssetsServiceInfo');
            },
          };
        }}
      />
    </div>
  );
};

export default AssetService;
