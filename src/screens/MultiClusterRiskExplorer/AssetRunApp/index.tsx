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
  assetsRunAppList,
  getStartUserOptions,
  getAssetsAppNames,
  getAssetsAppTypes,
} from '../../../services/DataService';
import { translations, localLang } from '../../../translations/translations';
import { TListComponentProps } from '../ListComponent/interface';
import { useNavigate } from 'react-router-dom';
import LabelCol, { BatchButton, useBatchLabelContext } from '../../../components/label-col';
// import { useAliveController } from 'react-activation';
// import { Store } from '../../../services/StoreService';

const RunApp = (props: { rowKey: string }) => {
  const { rowKey = 'id' } = props;
  const [filters, setFilters] = useState<any>({});
  const [startUserOpts, setStarUser] = useState<DefaultOptionType[]>([]);
  const [appCategorys, setAppCategorys] = useState<DefaultOptionType[]>([]);
  const [appNames, setAppNames] = useState<DefaultOptionType[]>([]);
  const [appCategoryTranslation, setAppCategoryTranslation] = useState<Record<string, string>>({});

  const navigate = useNavigate();
  // 批量操作hook
  const [{ rowSelection, isInLabelPage, onlyShowSelect, tagRelateAssetIds }, { setRefreshTable }] =
    useBatchLabelContext();

  const configFilter: FilterFormParam[] = useMemo(
    () => [
      {
        label: translations.clusterGraphList_tabInfo_containerName,
        name: 'containerName',
        type: 'input',
        icon: 'icon-rongqi',
      },
      {
        label: translations.app_version,
        name: 'svcVersion',
        type: 'input',
        icon: 'icon-biaoji',
      },
      {
        label: translations.app_name,
        name: 'svcName',
        type: 'select',
        icon: 'icon-zhujimingcheng',
        props: {
          mode: 'multiple',
          options: appNames,
        },
      },
      {
        label: translations.app_category,
        name: 'svcType',
        type: 'select',
        icon: 'icon-leixing',
        props: {
          mode: 'multiple',
          options: appCategorys,
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
    [appCategorys, startUserOpts, appNames],
  );
  const filterStore = useTzFilter({ initial: configFilter });

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
              <EllipsisPopover lineClamp={2} title={item || '-'}>
                {item || '-'}
              </EllipsisPopover>
            </div>
          );
        },
      },
      {
        title: translations.app_name,
        dataIndex: 'svcName',
        key: 'svcName',
        render: (v: string) => v || '-',
      },
      {
        title: translations.app_version,
        dataIndex: 'svcVersion',
        key: 'svcVersion',
        render: (v: string) => v || '-',
      },
      {
        title: translations.app_category,
        dataIndex: 'svcType',
        key: 'svcTypeLabel',
        render: (v: string) => appCategoryTranslation[v] || '-',
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
        render: (v: string) => (
          <div style={{ maxWidth: '100%' }} className="ofh">
            <EllipsisPopover lineClamp={2} title={v || '-'}>
              {v || '-'}
            </EllipsisPopover>
          </div>
        ),
      },
      {
        title: translations.configuration_file_path,
        width: '20%',
        dataIndex: 'configDir',
        key: 'configDir',
        render: (v: string) => (
          <div style={{ maxWidth: '100%' }} className="ofh">
            <EllipsisPopover lineClamp={2} title={v || '-'}>
              {v || '-'}
            </EllipsisPopover>
          </div>
        ),
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
  }, [appCategoryTranslation, isInLabelPage]);

  useEffect(() => {
    getStartUserOptions()
      .pipe(tap((res: WebResponse<any>) => setStarUser(res.getItems()?.map((v: string) => ({ label: v, value: v })))))
      .subscribe();

    getAssetsAppTypes()
      .pipe(
        tap((res: WebResponse<any>) => {
          const opts: DefaultOptionType[] = [];
          const translationMap: Record<string, string> = {};
          res.getItems()?.forEach((_item) => {
            const label = _item[localLang];
            opts.push({ label, value: _item.en });
            translationMap[_item.en] = label;
          });
          setAppCategorys(opts);
          setAppCategoryTranslation(translationMap);
        }),
      )
      .subscribe();

    getAssetsAppNames()
      .pipe(tap((res: WebResponse<any>) => setAppNames(res.getItems()?.map((v) => ({ label: v, value: v })))))
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
      return assetsRunAppList(req)
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
    const targetUrl = `${Routes.AssetsRunningAppDetail}?appId=${record.id}`;
    return {
      onClick: () => {
        navigate(targetUrl);
      },
    };
  }, []);

  return (
    <>
      <div className="mb12">
        <FilterContext.Provider value={{ ...filterStore }}>
          <div className="data-list-case-bar">
            {!isInLabelPage && <span className="headTit">{translations.running_applications}</span>}
            <TzFilter />
          </div>
          <TzFilterForm onChange={handleChangeFilter} />
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
    </>
  );
};

export default RunApp;
