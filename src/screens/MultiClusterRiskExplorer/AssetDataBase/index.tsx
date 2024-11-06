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
import { assetsDatabaseList, assetsDatabaseTypes, getStartUserOptions } from '../../../services/DataService';
import { translations } from '../../../translations/translations';
import { TListComponentProps } from '../ListComponent/interface';
import { useNavigate } from 'react-router-dom';
// import { useAliveController } from 'react-activation';
// import { Store } from '../../../services/StoreService';
import LabelCol, { BatchButton, useBatchLabelContext } from '../../../components/label-col';

const Database = (props: { rowKey: string }) => {
  const { rowKey = 'id' } = props;
  const [filters, setFilters] = useState<any>({});
  const [startUserOpts, setStarUser] = useState<DefaultOptionType[]>([]);
  const [dbTypeOpts, setDbType] = useState<DefaultOptionType[]>([]);
  const navigate = useNavigate();
  // const { refreshScope } = useAliveController();
  // 批量操作hook
  const [{ rowSelection, isInLabelPage, onlyShowSelect, tagRelateAssetIds }, { setRefreshTable }] =
    useBatchLabelContext();

  const columns = useMemo(() => {
    const items = [
      {
        title: translations.clusterGraphList_tabInfo_containerName,
        dataIndex: 'containerName',
        key: 'containerName',
        width: '20%',
        render: (item: any) => {
          return (
            <div style={{ maxWidth: '100%' }} className="ofh">
              <EllipsisPopover title={item || '-'}>{item}</EllipsisPopover>
            </div>
          );
        },
      },
      {
        title: translations.clusterGraphList_appType,
        dataIndex: 'svcName',
        key: 'svcName',
        render: (v: string) => v || '-',
      },
      {
        title: translations.clusterGraphList_appTargetVersion,
        dataIndex: 'svcVersion',
        key: 'svcVersion',
        render: (v: string) => v || '-',
      },
      {
        title: translations.start_user,
        dataIndex: 'user',
        key: 'user',
        render: (v: string) => v || '-',
      },
      {
        title: translations.binary_file_path,
        width: '20%',
        dataIndex: 'binaryDir',
        key: 'binaryDir',
        render: (v: string) => v || '-',
      },
      {
        title: translations.configuration_file_path,
        width: '20%',
        dataIndex: 'configDir',
        key: 'configDir',
        render: (v: string) => v || '-',
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
  }, [isInLabelPage]);

  const configFilter: FilterFormParam[] = useMemo(
    () => [
      {
        label: translations.clusterGraphList_tabInfo_containerName,
        name: 'containerName',
        type: 'input',
        icon: 'icon-ziyuan',
      },
      {
        label: translations.clusterGraphList_appTargetVersion,
        name: 'svcVersion',
        type: 'input',
        icon: 'icon-biaoji',
      },
      {
        label: translations.clusterGraphList_appType,
        name: 'svcName',
        type: 'select',
        icon: 'icon-leixing',
        props: {
          mode: 'multiple',
          options: dbTypeOpts,
        },
      },
      {
        label: translations.start_user,
        name: 'user',
        type: 'select',
        icon: 'icon-yonghuming',
        props: {
          mode: 'multiple',
          options: startUserOpts,
        },
      },
    ],
    [dbTypeOpts, startUserOpts],
  );
  const data = useTzFilter({ initial: configFilter });

  const handleChangeFilter = useCallback((values: any) => {
    setFilters((prev: any) => (isEqual(values, prev) ? prev : values));
  }, []);

  // useUpdateEffect(() => {
  //   data.updateFilter(
  //     configFilter.map((item) => ({
  //       ...item,
  //       value: filters[item.name],
  //     })) as FilterFormParam[],
  //   );
  // }, [clusterList, type, version]);

  useEffect(() => {
    getStartUserOptions('Databases')
      .pipe(tap((res: WebResponse<any>) => setStarUser(res.getItems()?.map((v: string) => ({ label: v, value: v })))))
      .subscribe();

    assetsDatabaseTypes()
      .pipe(tap((res: WebResponse<any>) => setDbType(res.getItems()?.map((v: string) => ({ label: v, value: v })))))
      .subscribe();
  }, []);

  const {
    data: dataSource,
    loading,
    pagination,
    refresh,
  } = usePagination(
    ({ current, pageSize }) => {
      const offset = (current - 1) * pageSize;
      const idList = isInLabelPage && !onlyShowSelect ? '' : tagRelateAssetIds;
      const req = {
        ...filters,
        offset,
        limit: pageSize,
        hideTags: isInLabelPage,
        idList,
      };
      return assetsDatabaseList(req)
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

  const handleClickRow = useCallback((record) => {
    const targetUrl = `${Routes.AssetsDatabaseDetail}?dbId=${record.id}`;
    return {
      onClick: () => {
        navigate(targetUrl);
      },
    };
  }, []);

  return (
    <>
      <div className="mb12">
        <FilterContext.Provider value={{ ...data }}>
          <div className="data-list-case-bar">
            {!isInLabelPage && <span className="headTit">{translations.clusterGraphList_database}</span>}
            <TzFilter />
          </div>
          <TzFilterForm onChange={handleChangeFilter} />
        </FilterContext.Provider>
      </div>
      <BatchButton />
      <TzTable
        rowSelection={rowSelection}
        columns={columns}
        loading={loading}
        dataSource={dataSource?.list}
        pagination={{ ...pagination, total: dataSource?.total }}
        sticky={true}
        rowKey={props.rowKey}
        onRow={handleClickRow}
      />
    </>
  );
};

export default Database;
