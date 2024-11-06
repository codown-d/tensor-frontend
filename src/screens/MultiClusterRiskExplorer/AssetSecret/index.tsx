import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { TzCard } from '../../../components/tz-card';
import { TimeFormat, WebResponse } from '../../../definitions';
import { map, tap } from 'rxjs/operators';
import { Store } from '../../../services/StoreService';
import { assetsSecrets, assetsServices, getListClusters } from '../../../services/DataService';
import { TzTag } from '../../../components/tz-tag';
import EllipsisPopover from '../../../components/ellipsisPopover/ellipsisPopover';
import { translations } from '../../../translations/translations';
import { TzTableServerPage } from '../../../components/tz-table';
// import { useActivate, useAliveController, useUnactivate } from 'react-activation';
import { useMemoizedFn, useSize, useUnmount } from 'ahooks';
import { getClusterName, useAssetsClusterList } from '../../../helpers/use_fun';
import { getTime } from '../../../helpers/until';
import useTzFilter, { FilterContext } from '../../../components/ComponentsLibrary/TzFilter/useTzFilter';
import { TzFilter, TzFilterForm } from '../../../components/ComponentsLibrary';
import { FilterFormParam } from '../../../components/ComponentsLibrary/TzFilterForm/filterInterface';
import { merge } from 'lodash';
import { useFiltersFn } from '../AssetService';
import LabelCol, { BatchButton, useBatchLabelContext } from '../../../components/label-col';

const AssetSecret = (props: any) => {
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
      return assetsSecrets(params).pipe(
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
        title: translations.secret_name,
        dataIndex: 'name',
        width: '20%',
        render: (item: string, row: any) => {
          return item ? <EllipsisPopover lineClamp={2}>{item}</EllipsisPopover> : '-';
        },
      },
      {
        title: translations.asset_discovery_label,
        dataIndex: 'LabelList',
        width: '20%',
        render: (LabelList: any[], row: any) => {
          return (
            <EllipsisPopover lineClamp={2}>
              {LabelList?.map((item: any) => `${item.LabelName}：${item.LabelValue}`).join('，') || '-'}
            </EllipsisPopover>
          );
        },
      },
      {
        title: translations.clusterManage_key,
        dataIndex: 'clusterKey',
        render: (item: string, row: any) => {
          return getClusterName(item);
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
        dataIndex: 'Tags',
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
        label: translations.secret_name,
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

  return (
    <div className="asset-secret">
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
        className={'nohoverTable'}
        rowKey={rowKey}
        reqFun={reqFun}
        rowSelection={rowSelection}
        onRow={(record) => {
          return {
            onClick: () => {
              //navigate(Routes.YamlScanInfo + `?id=${record.id}`);
            },
          };
        }}
      />
    </div>
  );
};

export default AssetSecret;
