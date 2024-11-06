import { usePagination, useUpdateEffect } from 'ahooks';
import { cloneDeep, isEqual, keys, set } from 'lodash';
import moment from 'moment';
import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { map } from 'rxjs/operators';
import { TzFilter, TzFilterForm } from '../../../components/ComponentsLibrary';
import useTzFilter, { FilterContext } from '../../../components/ComponentsLibrary/TzFilter/useTzFilter';
import { FilterFormParam } from '../../../components/ComponentsLibrary/TzFilterForm/filterInterface';
import { TzTable } from '../../../components/tz-table';
import { WebResponse } from '../../../definitions';
import { showFailedMessage } from '../../../helpers/response-handlers';
import { Routes } from '../../../Routes';
import { clusterGraphPods } from '../../../services/DataService';
import { translations } from '../../../translations/translations';
import { TListComponentProps } from './interface';
// import { useAliveController } from 'react-activation';
import { getClusterName } from '../../../helpers/use_fun';
import { TzTableTzTdInfoAssets } from './Container';
import LabelCol, { useBatchLabelContext, BatchButton } from '../../../components/label-col';

const PodListTable = (_props: TListComponentProps) => {
  // const { refreshScope } = useAliveController();
  const { clusterList, clusterKeyToName, rowKey = 'id' } = _props;
  const navigate = useNavigate();
  const [filters, setFilters] = useState<any>({});
  // 批量操作hook
  const [{ rowSelection, isInLabelPage, onlyShowSelect, tagRelateAssetIds }, { setRefreshTable }] =
    useBatchLabelContext();

  const {
    data: dataSource,
    loading,
    pagination,
    refresh,
  } = usePagination(
    ({ current, pageSize }) => {
      const offset = (current - 1) * pageSize;
      const param: any = {
        offset,
        limit: pageSize,
      };
      const idList = isInLabelPage && !onlyShowSelect ? '' : tagRelateAssetIds;
      return clusterGraphPods(param, { ...filters, hideTags: isInLabelPage, idList })
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

  const columns = useMemo(() => {
    const cols = [
      {
        title: translations.clusterGraphList_tabInfo_pod,
        dataIndex: 'info',
        width: '50%',
        render: (item: any, row: any) => {
          return (
            <TzTableTzTdInfoAssets
              name={row.PodName}
              clusterName={getClusterName(row.ClusterKey)}
              namespace={row.Namespace}
              resourceName={row.ResourceName}
            />
          );
        },
      },
      {
        title: 'Pod IP',
        dataIndex: 'PodIP',
        render: (time: any) => time || '-',
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
        dataIndex: 'CreatedAt',
        key: 'CreatedAt',
        width: '14%',
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
        label: translations.clusterGraphList_tabInfo_podName,
        name: 'name',
        type: 'input',
        icon: 'icon-pod',
      },
      {
        label: translations.clusterGraphList_namespace,
        name: 'namespace',
        type: 'input',
        icon: 'icon-mingmingkongjian',
      },
      {
        label: translations.resources,
        name: 'resource',
        type: 'input',
        icon: 'icon-ziyuan',
      },
      {
        label: 'Pod IP',
        name: 'PodIP',
        type: 'input',
        icon: 'icon-ziyuan',
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
      {
        label: translations.clusterGraphList_tabInfo_createTime,
        name: 'updatedAt',
        type: 'rangePickerCt',
        icon: 'icon-shijian',
        props: {
          showTime: true,
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
    const temp = {};
    keys(values).forEach((key) => {
      let _val = cloneDeep(values[key]);
      if (key === 'updatedAt') {
        _val[0] && set(temp, [key, 'start'], moment(_val[0]).toISOString());
        _val[1] && set(temp, [key, 'end'], moment(_val[1]).toISOString());
        return;
      }
      set(temp, [key], _val);
    });
    setFilters((prev: any) => (isEqual(temp, prev) ? prev : temp));
  }, []);

  return (
    <div>
      <div className="mb12">
        <FilterContext.Provider value={{ ...data }}>
          <div className="data-list-case-bar">
            {!isInLabelPage && <span className="headTit">Pod</span>}
            <TzFilter />
          </div>
          <TzFilterForm onChange={handleChange} />
        </FilterContext.Provider>
      </div>
      <BatchButton />
      <TzTable
        className="pods-list-case"
        loading={loading}
        columns={columns}
        dataSource={dataSource?.list}
        pagination={{ ...pagination, total: dataSource?.total }}
        sticky={true}
        rowKey={rowKey}
        rowSelection={rowSelection}
        onRow={(record) => {
          return {
            onClick: () => {
              if (!record?.id) {
                showFailedMessage(translations.clusterGraphList_containerInfo_toastError, '400');
                return;
              }
              navigate(
                `${Routes.RiskGraphListPodDetail}?PodUID=${record?.PodUID ?? ''}&PodName=${
                  record?.PodName ?? ''
                }&ClusterID=${record?.ClusterKey}`,
              );
            },
          };
        }}
      />
    </div>
  );
};

export default PodListTable;
