import { usePagination, useUpdateEffect } from 'ahooks';
import { isEqual } from 'lodash';
import React, { useCallback, useMemo, useState } from 'react';
import { map } from 'rxjs/operators';
import { TzFilter, TzFilterForm } from '../../../components/ComponentsLibrary';
import useTzFilter, { FilterContext } from '../../../components/ComponentsLibrary/TzFilter/useTzFilter';
import { FilterFormParam } from '../../../components/ComponentsLibrary/TzFilterForm/filterInterface';
import { TzSelectProps } from '../../../components/tz-select';
import { TzTable } from '../../../components/tz-table';
import { WebResponse } from '../../../definitions';
import { Routes } from '../../../Routes';
import { clusterGraphNodes } from '../../../services/DataService';
import { translations } from '../../../translations/translations';
import { TListComponentProps } from './interface';
import { useNavigate } from 'react-router-dom';
// import { useAliveController } from 'react-activation';
// import { Store } from '../../../services/StoreService';
import LabelCol, { BatchButton, useBatchLabelContext } from '../../../components/label-col';

const optionStatus: TzSelectProps['options'] = [
  {
    value: '0',
    label: translations.clusterGraphList_on,
  },
  {
    value: '1',
    label: translations.clusterGraphList_off,
  },
  {
    value: '2',
    label: translations.clusterGraphList_noReady,
  },
];

const NodeListTable = (_props: TListComponentProps) => {
  const { clusterList, clusterKeyToName, rowKey = 'ID' } = _props;
  const [filters, setFilters] = useState<any>({});
  const navigate = useNavigate();
  // const { refreshScope } = useAliveController();
  // 批量操作hook
  const [{ rowSelection, isInLabelPage, onlyShowSelect, tagRelateAssetIds }, { setRefreshTable }] =
    useBatchLabelContext();

  const columns = useMemo(() => {
    const items = [
      {
        title: translations.clusterGraphList_nodeName,
        key: 'HostName',
        width: '40%',
        render: (item: any) => {
          return (
            <>
              <span>{item.HostName}</span>
            </>
          );
        },
      },
      {
        title: 'IP',
        dataIndex: 'NodeIP',
        key: 'NodeIP',
      },
      {
        title: translations.clusterGraphList_cluster,
        dataIndex: 'ClusterKey',
        key: 'ClusterKey',
        render: (item: any) => {
          return <>{clusterKeyToName?.[item] || '-'}</>;
        },
      },
      {
        title: translations.clusterGraphList_nodeStatus,
        key: 'Status',
        width: 140,
        render: (item: any) => {
          if (item?.Status === 1) {
            return translations.clusterGraphList_off;
          }
          return (
            <>
              {item?.Ready === 1 && item?.Status === 0
                ? translations.clusterGraphList_on
                : translations.clusterGraphList_noReady}
            </>
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
    ];
    if (isInLabelPage) {
      return items.filter((col: any) => col.title !== translations.asset_label);
    }
    return items;
  }, [clusterKeyToName, isInLabelPage]);

  const {
    data: dataSource,
    loading,
    pagination,
    refresh,
  } = usePagination(
    ({ current, pageSize }) => {
      const offset = (current - 1) * pageSize;
      const pageParams: any = {
        offset,
        limit: pageSize,
      };
      const idList = isInLabelPage && !onlyShowSelect ? '' : tagRelateAssetIds;
      return clusterGraphNodes({ ...filters, hideTags: isInLabelPage, idList }, pageParams)
        .pipe(
          map((res: WebResponse<any>) => ({
            list: res.getItems(),
            total: res.totalItems,
          })),
        )
        .toPromise();
    },
    {
      refreshDeps: [filters, onlyShowSelect],
    },
  );

  setRefreshTable(refresh);

  const configFilter: FilterFormParam[] = useMemo(
    () => [
      {
        label: translations.clusterGraphList_nodeName,
        name: 'search',
        type: 'input',
        icon: 'lj',
      },
      {
        label: 'IP',
        name: 'NodeIP',
        type: 'input',
        icon: 'icon-ziyuan',
      },
      {
        label: translations.clusterGraphList_cluster,
        name: 'clusterID',
        type: 'select',
        icon: 'icon-jiqun',
        props: {
          options: clusterList,
        },
      },
      {
        label: translations.deflectDefense_status,
        name: 'status',
        type: 'select',
        icon: 'icon-yunhangzhuangtai',
        props: {
          options: optionStatus,
        },
      },
    ],
    [clusterList],
  );

  const data = useTzFilter({ initial: configFilter });

  useUpdateEffect(() => {
    data.updateFilter(
      configFilter.map((item) => ({
        ...item,
        value: filters[item.name],
      })) as FilterFormParam[],
    );
  }, [clusterList]);

  const handleChange = useCallback((values: any) => {
    setFilters((prev: any) => (isEqual(values, prev) ? prev : values));
  }, []);
  return (
    <div>
      <div className="mb12">
        <FilterContext.Provider value={{ ...data }}>
          <div className="data-list-case-bar">
            {!isInLabelPage && <span className="headTit">{translations.clusterGraphList_nodes}</span>}
            <TzFilter />
          </div>
          <TzFilterForm onChange={handleChange} />
        </FilterContext.Provider>
      </div>
      <BatchButton />
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
              navigate(
                `${Routes.ClustersOnlineVulnerabilitiesDetails}?type=node&NSName=${record.HostName}&ClusterID=${record?.ClusterKey}`,
              );
            },
          };
        }}
      />
    </div>
  );
};

export default NodeListTable;
