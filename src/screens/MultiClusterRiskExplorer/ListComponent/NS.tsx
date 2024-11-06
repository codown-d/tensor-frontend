import { usePagination, useUpdateEffect } from 'ahooks';
import { isEqual } from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { map, tap } from 'rxjs/operators';
import { TzFilter, TzFilterForm } from '../../../components/ComponentsLibrary';
import useTzFilter, { FilterContext } from '../../../components/ComponentsLibrary/TzFilter/useTzFilter';
import { FilterFormParam } from '../../../components/ComponentsLibrary/TzFilterForm/filterInterface';
import EllipsisPopover from '../../../components/ellipsisPopover/ellipsisPopover';
import { TzInput } from '../../../components/tz-input';
import { TzConfirm } from '../../../components/tz-modal';
import { TzSelectNormal, TzSelectProps } from '../../../components/tz-select';
import { TzTable } from '../../../components/tz-table';
import { WebResponse } from '../../../definitions';
import { Routes } from '../../../Routes';
import { getUserInformation } from '../../../services/AccountService';
import { clusterAssetsNamespaces, superAdminUserList, updataClusterNamespaces } from '../../../services/DataService';
import { translations } from '../../../translations/translations';
import { escapeString } from '../GraphResFilterHelper';
import { TEditRowData, TListComponentProps } from './interface';
import { useNavigate } from 'react-router-dom';
import LabelCol, { useBatchLabelContext, BatchButton } from '../../../components/label-col';
import './namespace.scss';
import { showSuccessMessage } from '../../../helpers/response-handlers';

const NSListTable = (_props: TListComponentProps) => {
  const { clusterList, clusterKeyToName, rowKey = 'id' } = _props;
  const [filters, setFilters] = useState<any>({});
  const [autOptions, setAutOptions] = useState<TzSelectProps['options']>([]);
  const [editResource, setEditResource] = useState<any>();
  const [editRowData, setEditRowData] = useState<TEditRowData>();
  const [tableRefresh, setTableRefresh] = useState<boolean>();
  const navigate = useNavigate();
  // const { refreshScope } = useAliveController();
  // 批量操作hook
  const [{ assetTopTag, rowSelection, isInLabelPage, onlyShowSelect, tagRelateAssetIds }, { setRefreshTable }] =
    useBatchLabelContext();

  useEffect(() => {
    const { username } = getUserInformation();
    superAdminUserList({
      offset: 0,
      limit: 100,
    })
      .pipe(
        tap((res: WebResponse<any>) => {
          const items = res.getItems().map((t) => {
            return {
              label: t.account,
              value: t.userName,
            };
          });
          setAutOptions(items);
        }),
      )
      .subscribe();
  }, []);

  const saveItem = useCallback(
    (item: any) => {
      const data = {
        ns_list: [
          {
            cluster_key: item.ClusterKey,
            name: item.Name,
          },
        ],
        alias: item.Alias,
        managers: item.Managers,
        authority: item.Authority,
      };
      updataClusterNamespaces(data)
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

  const refreshTable = () => setTableRefresh(true);

  const idList = isInLabelPage && !onlyShowSelect ? '' : tagRelateAssetIds;
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

      return clusterAssetsNamespaces({ ...filters, hideTags: isInLabelPage, idList }, pageParams)
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

  const columns = useMemo(() => {
    const cols = [
      {
        title: translations.clusterGraphList_namespace,
        key: 'Name',
        width: '30%',
        render: (item: any) => {
          return (
            <>
              <span>{item.Name}</span>
            </>
          );
        },
      },
      {
        title: translations.clusterGraphList_cluster,
        key: 'ClusterKey',
        render: (item: any) => {
          return (
            <>
              <span>{clusterKeyToName?.[item.ClusterKey] || '-'}</span>
            </>
          );
        },
      },
      {
        title: translations.clusterGraphList_alias,
        key: 'Alias',
        render: (item: any) => {
          if (item.UID === editResource?.UID) {
            return (
              <TzInput
                placeholder={translations.clusterGraphList_aliasInput}
                maxLength={16}
                stopEvent
                value={editRowData?.Alias}
                onChange={(e) => {
                  setEditRowData(
                    (prev) =>
                      ({
                        ...prev,
                        Alias: e.target.value,
                      }) as TEditRowData,
                  );
                }}
              />
            );
          }
          return <>{item.Alias || '-'}</>;
        },
      },
      {
        title: translations.clusterGraphList_managers,
        key: 'Managers',
        width: '30%',
        ellipsis: true,
        render: (item: any) => {
          if (item.UID === editResource?.UID) {
            return (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <TzSelectNormal
                  placeholder={translations.please_select_person_charge}
                  mode="multiple"
                  options={autOptions}
                  filterOption={(input, option: any) => option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                  defaultValue={item.Managers?.map((v: any) => v.userName) || []}
                  className={'w100'}
                  value={editRowData?.Managers}
                  onChange={(e) => {
                    setEditRowData((prev) => ({ ...prev, Managers: e }) as TEditRowData);
                  }}
                />
              </span>
            );
          }
          return (
            <div style={{ width: '100%' }}>
              <EllipsisPopover style={{ verticalAlign: 'top' }} lineClamp={2} className="eli_jk30">
                {item.Managers?.map((v: any) => v.account).join('、') || '-'}
              </EllipsisPopover>
            </div>
          );
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
        title: translations.clusterGraphList_operate,
        key: 'key',
        width: 110,
        render: (item: any) => {
          if (item.UID === editResource?.UID) {
            return (
              <>
                <span
                  className="editBtn"
                  onClick={(e) => {
                    e.stopPropagation();
                    saveItem(editRowData);
                  }}
                >
                  {translations.save}
                </span>
                <span
                  className="editBtn"
                  onClick={(e) => {
                    e.stopPropagation();
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
                    editResource.Alias === editRowData?.Alias &&
                    isEqual(editResource.Managers || [], editRowData?.Managers || [])
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
                      saveItem({ ...editResource, ...editRowData });
                    },
                    onCancel: () => {
                      setEditResource(undefined);
                      setEditRowData(undefined);
                    },
                  });
                } else {
                  setEditRowData({ ...item, Managers: item.Managers?.map((v: any) => v.userName) });
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
  }, [editResource, clusterKeyToName, editRowData, autOptions, saveItem, isInLabelPage]);

  const configFilter: FilterFormParam[] = useMemo(
    () => [
      {
        label: translations.clusterGraphList_namespaces,
        name: 'search',
        type: 'input',
        icon: 'icon-mingmingkongjian',
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
    <div className="p_namespace_k4">
      <div className="mb12">
        <FilterContext.Provider value={{ ...data }}>
          <div className="data-list-case-bar">
            {!isInLabelPage && <span className="headTit">{translations.clusterGraphList_namespaces}</span>}
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
        columns={columns}
        onRow={(record) => {
          return {
            onClick: () => {
              navigate(
                `${Routes.ClustersOnlineVulnerabilitiesDetails}?type=namespace&NSName=${
                  record.Name
                }&ClusterID=${escapeString(record.ClusterKey)}`,
              );
            },
          };
        }}
        rowSelection={rowSelection}
      />
    </div>
  );
};

export default NSListTable;
