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
import { assetsWebServeList, assetsWebServeTypes, getStartUserOptions } from '../../../services/DataService';
import { translations } from '../../../translations/translations';
import { TListComponentProps } from '../ListComponent/interface';
import { useNavigate } from 'react-router-dom';
import LabelCol, { BatchButton, useBatchLabelContext } from '../../../components/label-col';
// import { Store } from '../../../services/StoreService';
// import { useAliveController } from 'react-activation';

const WebServe = (props: { rowKey: string }) => {
  const { rowKey = 'id' } = props;
  const [filters, setFilters] = useState<any>({});
  const [startUserOpts, setStartUserOpts] = useState<DefaultOptionType[]>([]);
  const [serveTypes, setServeTypes] = useState<DefaultOptionType[]>([]);
  const navigate = useNavigate();
  // 批量操作hook
  const [{ rowSelection, isInLabelPage, onlyShowSelect, tagRelateAssetIds }, { setRefreshTable }] =
    useBatchLabelContext();

  useEffect(() => {
    getStartUserOptions('Web services').subscribe((res) => {
      if (res.error) return;
      const items = (res.getItems() || []).map((v) => ({ value: v, label: v }));
      setStartUserOpts(items);
    });

    assetsWebServeTypes().subscribe((res) => {
      if (res.error) return;
      const items = (res.getItems() || []).map((v) => ({ value: v, label: v }));
      setServeTypes(items);
    });
  }, []);

  const columns = useMemo(() => {
    const items = [
      {
        title: translations.clusterGraphList_tabInfo_containerName,
        dataIndex: 'containerName',
        key: 'containerName',
        width: '20%',
        render: (itemVal: string) => {
          return (
            <div style={{ maxWidth: '100%' }} className="ofh">
              <EllipsisPopover lineClamp={2}>{itemVal || '-'}</EllipsisPopover>
            </div>
          );
        },
      },
      {
        title: translations.service_type,
        dataIndex: 'svcName',
        key: 'svcType',
        render: (v: string) => v || '-',
      },
      {
        title: translations.service_version,
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
        offset,
        limit: pageSize,
        hideTags: isInLabelPage,
        idList,
        ...filters,
      };
      return assetsWebServeList(req)
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
        label: translations.clusterGraphList_tabInfo_containerName,
        name: 'containerName',
        type: 'input',
        icon: 'icon-ziyuan',
      },
      {
        label: translations.service_version,
        name: 'svcVersion',
        type: 'input',
        icon: 'icon-biaoji',
      },
      {
        label: translations.service_type,
        name: 'svcName',
        type: 'select',
        icon: 'icon-jiqun',
        props: {
          mode: 'multiple',
          options: serveTypes,
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
    [serveTypes, startUserOpts],
  );

  const data = useTzFilter({ initial: configFilter });

  // useUpdateEffect(() => {
  //   data.updateFilter(
  //     configFilter.map((item) => ({
  //       ...item,
  //       value: filters[item.name],
  //     })) as FilterFormParam[],
  //   );
  // }, [clusterList]);

  const handleChange = useCallback((values: any) => {
    setFilters((prev: any) => (isEqual(values, prev) ? prev : values));
  }, []);

  const handleClickRow = useCallback((record) => {
    const targetUrl = `${Routes.AssetsWebServeDetail}?webServeId=${record.id}`;
    return {
      onClick: () => navigate(targetUrl),
    };
  }, []);

  return (
    <div>
      <div className="mb12">
        <FilterContext.Provider value={{ ...data }}>
          <div className="data-list-case-bar">
            {!isInLabelPage && <span className="headTit">{translations.clusterGraphList_web}</span>}
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
        onRow={handleClickRow}
      />
    </div>
  );
};

export default WebServe;
