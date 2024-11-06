import { usePagination, useUpdateEffect } from 'ahooks';
import { isEqual } from 'lodash';
import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { map } from 'rxjs/operators';
import { TzFilter, TzFilterForm } from '../../../components/ComponentsLibrary';
import useTzFilter, { FilterContext } from '../../../components/ComponentsLibrary/TzFilter/useTzFilter';
import { FilterFormParam } from '../../../components/ComponentsLibrary/TzFilterForm/filterInterface';
import { TzTable } from '../../../components/tz-table';
import { WebResponse } from '../../../definitions';
import { Routes } from '../../../Routes';
import { clusterGraphApis } from '../../../services/DataService';
import { translations } from '../../../translations/translations';
import { TListComponentProps } from './interface';
import LabelCol, { BatchButton, useBatchLabelContext } from '../../../components/label-col';

const OPERATIONMODE = [
  {
    value: 'GET',
    label: 'GET',
  },
  {
    value: 'POST',
    label: 'POST',
  },
  {
    value: 'HEAD',
    label: 'HEAD',
  },
  {
    value: 'PUT',
    label: 'PUT',
  },
  {
    value: 'CONNECT',
    label: 'CONNECT',
  },
  {
    value: 'TRACE',
    label: 'TRACE',
  },
  {
    value: 'OPTIONS',
    label: 'OPTIONS',
  },
  {
    value: 'PATCH',
    label: 'PATCH',
  },
  {
    value: 'DELETE',
    label: 'DELETE',
  },
  {
    value: 'LOCK',
    label: 'LOCK',
  },
  {
    value: 'MKCOL',
    label: 'MKCOL',
  },
  {
    value: 'LINK',
    label: 'LINK',
  },
  {
    value: 'UNLINK',
    label: 'UNLINK',
  },
  {
    value: 'COPY',
    label: 'COPY',
  },
  {
    value: 'MOVE',
    label: 'MOVE',
  },
];

const API = (_props: TListComponentProps) => {
  const { clusterList, clusterKeyToName, rowKey = 'id' } = _props || {};
  const navigate = useNavigate();
  const [filters, setFilters] = useState<any>({});
  // 批量操作hook
  const [{ rowSelection, isInLabelPage, onlyShowSelect, tagRelateAssetIds }, { setRefreshTable }] =
    useBatchLabelContext();

  const columns = useMemo(() => {
    const cols = [
      {
        title: translations.runtimePolicy_container_path,
        dataIndex: 'url',
        key: 'url',
        width: '30%',
        render: (item: any) => {
          return (
            <>
              <span>{item}</span>
            </>
          );
        },
      },
      {
        title: translations.contentType,
        dataIndex: 'contentType',
        key: 'contentType',
        render: (item: any) => item || '-',
      },
      {
        title: translations.operationMode,
        dataIndex: 'method',
        key: 'method',
      },
      {
        title: translations.clusterGraphList_cluster,
        dataIndex: 'cluster',
        key: 'cluster',
        render: (item: any) => {
          return (
            <>
              <span>{clusterKeyToName?.[item] || '-'}</span>
            </>
          );
        },
      },
      {
        title: translations.onlineVulnerability_outerShapeMeaning,
        key: 'namespace',
        dataIndex: 'namespace',
      },
      {
        title: translations.resources,
        key: 'resource',
        dataIndex: 'resource',
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
      return cols.filter((col: any) => col.title !== translations.asset_label);
    }
    return cols;
  }, [clusterKeyToName, isInLabelPage]);

  const {
    data: dataSource,
    loading,
    pagination,
    refresh,
  } = usePagination(
    ({ current, pageSize }) => {
      const offset = (current - 1) * pageSize;
      const idList = isInLabelPage && !onlyShowSelect ? '' : tagRelateAssetIds;
      const pageParams: any = {
        offset,
        limit: pageSize,
        ...filters,
        hideTags: isInLabelPage,
        idList,
      };
      return clusterGraphApis(filters, pageParams)
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
        label: translations.clusterGraphList_detailContainer_path,
        name: 'path',
        type: 'input',
        icon: 'lj',
      },
      {
        label: translations.contentType,
        name: 'content_type',
        type: 'input',
        icon: 'icon-leixing',
      },
      {
        label: translations.clusterGraphList_namespace,
        name: 'namespace',
        type: 'input',
        icon: 'icon-mingmingkongjian',
        props: {
          isTag: true,
        },
      },
      {
        label: translations.resources,
        name: 'resource',
        type: 'input',
        icon: 'icon-ziyuan',
        props: {
          isTag: true,
        },
      },
      {
        label: translations.operationMode,
        name: 'method',
        type: 'select',
        icon: 'icon-caozuo',
        props: {
          options: OPERATIONMODE,
        },
      },
      {
        label: translations.clusterGraphList_cluster,
        name: 'cluster',
        type: 'select',
        icon: 'icon-jiqun',
        props: {
          options: clusterList,
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
            {!isInLabelPage && <span className="headTit">API</span>}
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
              navigate(`${Routes.RiskGraphListApiDetail}?type=api&apiID=${record?.id}&clusterId=${record?.cluster}`);
            },
          };
        }}
      />
    </div>
  );
};

export default API;
