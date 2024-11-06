import React, { useCallback, useMemo, useState, useRef } from 'react';
import { map, tap } from 'rxjs/operators';
import { assetsEndpoints } from '../../../services/DataService';
import { translations } from '../../../translations/translations';
import { TzTableServerPage } from '../../../components/tz-table';
import { getClusterName, useAssetsClusterList } from '../../../helpers/use_fun';
import { getTime, parseGetMethodParams } from '../../../helpers/until';
import useTzFilter, { FilterContext } from '../../../components/ComponentsLibrary/TzFilter/useTzFilter';
import { TzFilter, TzFilterForm } from '../../../components/ComponentsLibrary';
import { FilterFormParam } from '../../../components/ComponentsLibrary/TzFilterForm/filterInterface';
import { Routes } from '../../../Routes';
import { useFiltersFn } from '../AssetService';
import EllipsisPopover from '../../../components/ellipsisPopover/ellipsisPopover';
import { useNavigatereFresh } from '../../../helpers/useNavigatereFresh';
import LabelCol, { BatchButton, useBatchLabelContext } from '../../../components/label-col';

const AssetEndpoints = (props: any) => {
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
      return assetsEndpoints(params).pipe(
        map((res) => {
          const items = res.getItems();
          return {
            data: items,
            total: res.data?.totalItems,
          };
        }),
      );
    },
    [filters, onlyShowSelect, isInLabelPage],
  );
  const columns = useMemo(() => {
    const items = [
      {
        title: translations.endpoints_name,
        dataIndex: 'name',
        render: (item: string, row: any) => {
          return item ? <EllipsisPopover lineClamp={2}>{item}</EllipsisPopover> : '-';
        },
      },
      {
        title: translations.service_name,
        dataIndex: 'serviceName',
        render: (item: string, row: any) => {
          return item ? <EllipsisPopover lineClamp={2}>{item}</EllipsisPopover> : '-';
        },
      },
      {
        title: translations.clusterManage_key,
        dataIndex: 'clusterKey',
        render: (item: string, row: any) => {
          let name = getClusterName(item);
          return name;
        },
      },
      {
        title: translations.onlineVulnerability_outerShapeMeaning,
        dataIndex: 'namespace',
        render: (item: string, row: any) => {
          return item ? <EllipsisPopover lineClamp={2}>{item}</EllipsisPopover> : '-';
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
        width: '14%',
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
        label: translations.endpoints_name,
        name: 'endpoints_name',
        type: 'input',
        icon: 'icon-jiedian',
      },
      {
        label: translations.service_name,
        name: 'service_name',
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
    <div className="asset-endpoint">
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
        rowKey={rowKey}
        reqFun={reqFun}
        rowSelection={rowSelection}
        onRow={(record) => {
          return {
            onClick: () => {
              let obj = {
                cluster_key: record.clusterKey,
                namespace: record.namespace,
                endpoints_name: record.name,
              };
              jump(Routes.AssetsEndpointsInfo + `${parseGetMethodParams(obj)}`, 'AssetsEndpointsInfo');
            },
          };
        }}
      />
    </div>
  );
};

export default AssetEndpoints;
