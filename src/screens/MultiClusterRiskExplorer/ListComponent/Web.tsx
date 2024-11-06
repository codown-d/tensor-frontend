import { usePagination, useUpdateEffect } from 'ahooks';
import { DefaultOptionType } from 'antd/lib/select';
import { isEqual } from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { map, tap } from 'rxjs/operators';
import { TzFilter, TzFilterForm } from '../../../components/ComponentsLibrary';
import useTzFilter, { FilterContext } from '../../../components/ComponentsLibrary/TzFilter/useTzFilter';
import { FilterFormParam } from '../../../components/ComponentsLibrary/TzFilterForm/filterInterface';
import EllipsisPopover from '../../../components/ellipsisPopover/ellipsisPopover';
import { TzTable } from '../../../components/tz-table';
import { WebResponse } from '../../../definitions';
import { Routes } from '../../../Routes';
import {
  assetsApplications,
  assetsApplicationsTargets,
  assetsApplicationsVersion,
} from '../../../services/DataService';
import { translations } from '../../../translations/translations';
import { TListComponentProps } from './interface';
import { useNavigate } from 'react-router-dom';
// import { Store } from '../../../services/StoreService';
// import { useAliveController } from 'react-activation';

const Web = (_props: TListComponentProps) => {
  const { clusterList, clusterKeyToName } = _props;
  const [filters, setFilters] = useState<any>({});
  const [type, setType] = useState<DefaultOptionType[]>([]);
  const [version, setVersion] = useState<DefaultOptionType[]>([]);
  const navigate = useNavigate();
  // const { refreshScope } = useAliveController();

  useEffect(() => {
    assetsApplicationsVersion({ app_type: 'web' })
      .pipe(tap((res: WebResponse<any>) => setVersion(res.getItems()?.map((v: string) => ({ label: v, value: v })))))
      .subscribe();
    assetsApplicationsTargets({ app_type: 'web' })
      .pipe(tap((res: WebResponse<any>) => setType(res.getItems()?.map((v: string) => ({ label: v, value: v })))))
      .subscribe();
  }, []);

  const columns = useMemo(() => {
    return [
      {
        title: translations.clusterGraphList_resourceName,
        dataIndex: 'resourceName',
        key: 'resourceName',
        ellipsis: true,
        width: '30%',
        render: (item: any, row: any) => {
          return (
            <>
              <div style={{ maxWidth: '100%' }} className="ofh">
                <EllipsisPopover lineClamp={2}>{item}</EllipsisPopover>
              </div>
            </>
          );
        },
      },
      {
        title: translations.scanner_detail_namespace,
        dataIndex: 'namespace',
        key: 'namespace',
      },
      {
        title: translations.clusterGraphList_webType,
        dataIndex: 'appTargetName',
        key: 'appTargetName',
      },
      {
        title: translations.clusterGraphList_cluster,
        dataIndex: 'clusterKey',
        key: 'clusterKey',
        render: (item: any, row: any) => {
          return <>{clusterKeyToName?.[item] || '-'}</>;
        },
      },
      {
        title: translations.clusterGraphList_webVersion,
        dataIndex: 'appTargetVersion',
        key: 'appTargetVersion',
      },
    ];
  }, [clusterKeyToName]);

  const {
    data: dataSource,
    loading,
    pagination,
  } = usePagination(
    ({ current, pageSize }) => {
      const offset = (current - 1) * pageSize;
      const pageParams: any = {
        offset,
        limit: pageSize,
      };
      return assetsApplications({ ...filters, app_type: 'web' }, pageParams)
        .pipe(
          map((res: WebResponse<any>) => ({
            list: res.getItems(),
            total: res.totalItems,
          })),
        )
        .toPromise();
    },
    {
      refreshDeps: [filters],
    },
  );

  const configFilter: FilterFormParam[] = useMemo(
    () => [
      {
        label: translations.clusterGraphList_resourceName,
        name: 'resource_name',
        type: 'input',
        icon: 'icon-ziyuan',
      },
      {
        label: translations.clusterGraphList_webType,
        name: 'app_target',
        type: 'select',
        icon: 'icon-leixing',
        props: {
          options: type,
        },
      },
      {
        label: translations.clusterGraphList_cluster,
        name: 'cluster_key',
        type: 'select',
        icon: 'icon-jiqun',
        props: {
          options: clusterList,
        },
      },
      {
        label: translations.clusterGraphList_webVersion,
        name: 'app_version',
        type: 'select',
        icon: 'icon-banben',
        props: {
          options: version,
        },
      },
    ],
    [clusterList, type, version],
  );

  const data = useTzFilter({ initial: configFilter });

  useUpdateEffect(() => {
    data.updateFilter(
      configFilter.map((item) => ({
        ...item,
        value: filters[item.name],
      })) as FilterFormParam[],
    );
  }, [clusterList, type, version]);

  const handleChange = useCallback((values: any) => {
    setFilters((prev: any) => (isEqual(values, prev) ? prev : values));
  }, []);

  return (
    <>
      <div>
        <div className="mb12">
          <FilterContext.Provider value={{ ...data }}>
            <div className="data-list-case-bar">
              <span className="headTit">{translations.clusterGraphList_web}</span>
              <TzFilter />
            </div>
            <TzFilterForm onChange={handleChange} />
          </FilterContext.Provider>
        </div>
        <TzTable
          columns={columns}
          loading={loading}
          dataSource={dataSource?.list}
          pagination={{ ...pagination, total: dataSource?.total }}
          sticky={true}
          rowKey="ID"
          onRow={(record) => {
            return {
              onClick: () => {
                navigate(
                  `${Routes.ClustersOnlineVulnerabilitiesDetails}?type=web&NSName=${record.namespace}&name=${record.resourceName}&ClusterID=${record?.clusterKey}`,
                );
              },
            };
          }}
        />
      </div>
    </>
  );
};

export default Web;
