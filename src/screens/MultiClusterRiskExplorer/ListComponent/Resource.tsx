import { usePagination, useUpdateEffect } from 'ahooks';
import { isEqual } from 'lodash';
import React, { useCallback, useEffect, useRef, useMemo, useState } from 'react';
import { map, tap } from 'rxjs/operators';
import { TzFilter, TzFilterForm } from '../../../components/ComponentsLibrary';
import useTzFilter, { FilterContext } from '../../../components/ComponentsLibrary/TzFilter/useTzFilter';
import { FilterFormParam } from '../../../components/ComponentsLibrary/TzFilterForm/filterInterface';
import EllipsisPopover from '../../../components/ellipsisPopover/ellipsisPopover';
import { TzInput } from '../../../components/tz-input';
import { TzConfirm } from '../../../components/tz-modal';
import { TzSelect, TzSelectProps } from '../../../components/tz-select';
import { TzTable } from '../../../components/tz-table';
import { WebResponse } from '../../../definitions';
import { getUserInformation } from '../../../services/AccountService';
import {
  clusterGraphResources,
  resourcesTypes,
  superAdminUserList,
  updataResource,
} from '../../../services/DataService';
import { translations } from '../../../translations/translations';
import { TEditRowData, TListComponentProps } from './interface';
import LabelCol, { useBatchLabelContext, BatchButton } from '../../../components/label-col';
import './resource.scss';
import { useJumpResourceFn } from '../components';
import { showSuccessMessage } from '../../../helpers/response-handlers';

const ResourceListTable = (_props: TListComponentProps) => {
  const { clusterList, clusterKeyToName, rowKey = 'id' } = _props;
  const [filters, setFilters] = useState<any>({});
  const [editResource, setEditResource] = useState<any>();
  const [editRowData, setEditRowData] = useState<TEditRowData>();
  const [autOptions, setAutOptions] = useState<TzSelectProps['options']>([]);
  const [resourceTypes, setResourceTypes] = useState<TzSelectProps['options']>([]);
  const [tableRefresh, setTableRefresh] = useState<boolean>();
  // 批量操作hook
  const [{ rowSelection, isInLabelPage, onlyShowSelect, tagRelateAssetIds }, { setRefreshTable }] =
    useBatchLabelContext();

  useEffect(() => {
    const { username } = getUserInformation();
    superAdminUserList({
      offset: 0,
      limit: 100,
    })
      .pipe(
        tap((res: WebResponse<any>) => {
          const items = res.getItems().map((t) => ({
            label: t.account,
            value: t.userName,
          }));
          setAutOptions(items);
        }),
      )
      .subscribe();

    resourcesTypes()
      .pipe(
        tap((res: WebResponse<any>) => {
          const items = res.getItems();
          const list = items.map((item) => ({ label: item, value: item }));
          setResourceTypes(list);
        }),
      )
      .subscribe();
  }, []);

  const saveItemResource = useCallback(
    (item: any) => {
      const data = {
        resource_list: [{ cluster_key: item.cluster, kind: item.kind, name: item.name, namespace: item.namespace }],
        alias: item.alias,
        managers: item.managers,
        authority: item.authority,
      };
      updataResource(data)
        .pipe(
          tap((_res: WebResponse<any>) => {
            showSuccessMessage(translations.microseg_namespace_operateSuccess);
            setEditResource(undefined);
            refreshTable();
          }),
        )
        .subscribe();
    },
    [setEditResource],
  );

  const columnResource = useMemo(() => {
    const cols = [
      {
        title: translations.clusterGraphList_resourceName,
        dataIndex: 'name',
        key: 'name',
        width: '20%',
        render: (item: any, row: any) => {
          return item;
        },
      },
      {
        title: translations.clusterGraphList_resourceType,
        dataIndex: 'kind',
        key: 'kind',
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
        title: translations.clusterGraphList_namespace,
        key: 'namespace',
        render: (item: any) => {
          return (
            <>
              <span>{item.namespace}</span>
            </>
          );
        },
      },
      {
        title: translations.clusterGraphList_alias,
        dataIndex: 'alias',
        key: 'alias',
        render: (item: any, row: any) => {
          if (row.uid === editResource?.uid) {
            return (
              <span onClick={(event) => event.stopPropagation()}>
                <TzInput
                  placeholder={translations.clusterGraphList_aliasInput}
                  maxLength={16}
                  defaultValue={row.alias}
                  value={editRowData?.alias}
                  onChange={(e) => {
                    setEditRowData(
                      (prev) =>
                        ({
                          ...prev,
                          alias: e.target.value,
                        }) as TEditRowData,
                    );
                  }}
                />
              </span>
            );
          }
          return <>{item || '-'}</>;
        },
      },
      {
        title: translations.clusterGraphList_managers,
        dataIndex: 'managers',
        key: 'managers',
        width: '15%',
        ellipsis: true,
        render: (item: any, row: any) => {
          if (row.uid === editResource?.uid) {
            return (
              <span onClick={(event) => event.stopPropagation()}>
                <TzSelect
                  placeholder={translations.please_select_person_charge}
                  mode="multiple"
                  options={autOptions}
                  filterOption={(input, option: any) => option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                  defaultValue={row.managers?.map((v: any) => v.userName) || []}
                  value={editRowData?.managers}
                  onChange={(e) => {
                    setEditRowData((prev) => ({ ...prev, managers: e }) as TEditRowData);
                  }}
                />
              </span>
            );
          }
          return (
            <div style={{ width: '100%' }}>
              <EllipsisPopover style={{ verticalAlign: 'top' }} lineClamp={2} className="esli_zl_99">
                {item
                  ?.map((v: any) => v.account)
                  .slice(0)
                  .join('、') || '-'}
              </EllipsisPopover>
            </div>
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
        title: translations.clusterGraphList_operate,
        key: 'key',
        width: 90,
        render: (item: any) => {
          if (item.uid === editResource?.uid) {
            return (
              <>
                <span
                  className="editBtn"
                  onClick={(event) => {
                    event.stopPropagation();
                    saveItemResource(editRowData);
                  }}
                >
                  {translations.save}
                </span>
                <span
                  className="editBtn"
                  onClick={(event) => {
                    event.stopPropagation();
                    setEditResource(undefined);
                    refreshTable();
                  }}
                >
                  {translations.cancel}
                </span>
              </>
            );
          }
          return (
            <span
              className="editBtn"
              onClick={(event) => {
                event.stopPropagation();
                if (
                  editResource &&
                  !(
                    editResource.alias === editRowData?.alias &&
                    isEqual(editResource.managers || [], editRowData?.managers || [])
                  )
                ) {
                  TzConfirm({
                    icon: <span></span>,
                    content: translations.configuration_cancelTip,
                    okText: translations.notificationCenter_action,
                    okButtonProps: {
                      className: 'primary-btn',
                    },
                    cancelText: translations.cancel,
                    closable: true,
                    onOk: () => {
                      saveItemResource({ ...editResource, ...editRowData });
                    },
                    onCancel: () => {
                      setEditResource(undefined);
                    },
                  });
                } else {
                  setEditRowData({ ...item, managers: item.managers?.map((v: any) => v.userName) });
                  setEditResource(item);
                }
              }}
            >
              {translations.clusterGraphList_edit}
            </span>
          );
        },
      },
    ] as any;
    if (isInLabelPage) {
      return cols.filter((col: any) => col.title !== translations.asset_label);
    }
    return cols;
  }, [editResource, clusterKeyToName, editRowData, autOptions, isInLabelPage]);

  const refreshTable = () => setTableRefresh(true);

  const {
    data: dataSource,
    loading,
    pagination,
    run,
    params,
    refresh,
  } = usePagination(
    ({ current, pageSize }) => {
      const pageParams: any = {
        offset: (current - 1) * pageSize,
        limit: pageSize,
      };
      setTableRefresh(false);

      const idList = isInLabelPage && !onlyShowSelect ? '' : tagRelateAssetIds;
      const param = { ...filters, hideTags: isInLabelPage, idList };
      return clusterGraphResources(pageParams, param)
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

  useEffect(() => {
    tableRefresh &&
      run({
        current: params[0]?.current || 1,
        pageSize: params[0]?.pageSize || 10,
      });
  }, [tableRefresh]);

  const configFilter: FilterFormParam[] = useMemo(
    () => [
      {
        label: translations.clusterGraphList_resourceName,
        name: 'name',
        type: 'input',
        icon: 'icon-ziyuan',
      },
      {
        label: translations.clusterGraphList_namespaces,
        name: 'namespace',
        type: 'input',
        icon: 'icon-mingmingkongjian',
      },
      {
        label: translations.clusterGraphList_resourceType,
        name: 'kind',
        type: 'select',
        icon: 'icon-leixing',
        props: {
          options: resourceTypes,
        },
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
    ],
    [clusterList, resourceTypes],
  );

  const data = useTzFilter({ initial: configFilter });

  useUpdateEffect(() => {
    data.updateFilter(
      configFilter.map((item) => ({
        ...item,
        value: filters[item.name],
      })) as FilterFormParam[],
    );
  }, [clusterList, resourceTypes]);

  const handleChange = useCallback((values: any) => {
    setFilters((prev: any) => (isEqual(values, prev) ? prev : values));
  }, []);
  let { jumpResourceFn } = useJumpResourceFn();
  return (
    <div className="p_resource_z0">
      <div className="mb12">
        <FilterContext.Provider value={{ ...data }}>
          <div className="data-list-case-bar">
            {!isInLabelPage && <span className="headTit">{translations.clusterGraphList_resources}</span>}
            <TzFilter />
          </div>
          <TzFilterForm onChange={handleChange} />
        </FilterContext.Provider>
      </div>
      <BatchButton />
      <TzTable
        loading={loading}
        dataSource={dataSource?.list}
        pagination={{ ...pagination, total: dataSource?.total }}
        sticky={true}
        rowKey={rowKey}
        columns={columnResource}
        onRow={(record) => {
          return {
            onClick: () => {
              let data = {
                ...record,
                type: 'resource',
                clusterKey: record.cluster,
              };
              jumpResourceFn(data);
            },
          };
        }}
        rowSelection={rowSelection}
      />
    </div>
  );
};

export default ResourceListTable;
