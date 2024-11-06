import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { translations } from '../../../../translations';
import useTzFilter, { FilterContext } from '../../../../components/ComponentsLibrary/TzFilter/useTzFilter';
import { useMemoizedFn } from 'ahooks';
import { TablePaginationConfig } from 'antd';
import { TzFilter, TzFilterForm } from '../../../../components/ComponentsLibrary';
import { TzButton } from '../../../../components/tz-button';
import { TzMessageSuccess } from '../../../../components/tz-mesage';
import { TzTable, TzTableServerPage } from '../../../../components/tz-table';
import { isEqual, findIndex, sortBy, merge, find } from 'lodash';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  deleteSegments,
  microsegResources,
  microsegSegments,
  segmentsInnertrust,
} from '../../../../services/DataService';
import { Store } from '../../../../services/StoreService';
import { FilterFormParam } from '../../../../components/ComponentsLibrary/TzFilterForm/filterInterface';
import { columnsList } from '../../../../screens/Microisolation/lib';
import { WebResponse } from 'definitions';
import { map } from 'rxjs/operators';
import { TzConfirm, TzConfirmDelete } from '../../../../components/tz-modal';
import { showSuccessMessage } from '../../../../helpers/response-handlers';
import { useAssetsClusterList } from '../../../../helpers/use_fun';
import { Routes } from '../../../../Routes';
import { innerTrustOp, strategicPatternOp } from './Info';
import { TzDrawerFn } from '../../../../components/tz-drawer';
import { RenderTag } from '../../../../components/tz-tag';
import TzInputSearch from '../../../../components/tz-input-search';
let ResourceInfo = (props: any) => {
  let { id, namespace, cluster } = props;
  let [dataSource, setDataSource] = useState<any>([]);
  let [filter, setSearch] = useState<any>('');
  useEffect(() => {
    microsegResources({ segmentID: id, namespace, cluster, resourceName: filter }).subscribe((res) => {
      if (res.error) return;
      let items = res.getItems();
      setDataSource(items);
    });
  }, [filter]);
  let columns = useMemo(() => {
    let a = ['namespace', 'cluster'];
    let arr = columnsList.filter((item: any) => a.includes(item.dataIndex));
    let newArr = sortBy(arr, (x) => findIndex(a, (y) => x.dataIndex === y));
    return [
      {
        title: translations.calico_dock_resourceName,
        key: 'name',
        dataIndex: 'name',
      },
      {
        title: translations.calico_dock_resourceType,
        key: 'kind',
        dataIndex: 'kind',
      },
      ...newArr,
    ];
  }, []);
  return (
    <>
      <div className="p-a" style={{ right: '59px', top: '24px', left: 'auto' }}>
        <TzInputSearch
          style={{ width: '30%' }}
          placeholder={translations.microseg_resources_res_name_place}
          onChange={(value: any) => setSearch(value)}
        />
      </div>
      <TzTable
        className="nohoverTable"
        dataSource={dataSource}
        columns={columns}
        pagination={{ defaultPageSize: 10, showQuickJumper: true }}
      />
    </>
  );
};
const ResourceGroup = (props: any) => {
  const [filters, setFilters] = useState<any>({});
  let [showPageFooter, setShowPageFooter] = useState(false);
  let [selectedRowKeys, setSelectedRowKeys] = useState<any>([]);
  const listComp = useRef(undefined as any);
  const reqFun = useCallback(
    (pagination?: TablePaginationConfig) => {
      const { current = 1, pageSize = 10 } = pagination || {};
      const offset = (current - 1) * pageSize;
      const pageParams = {
        offset,
        limit: pageSize,
        ...filters,
      };
      return microsegSegments(pageParams).pipe(
        map((res: WebResponse<any>) => {
          const items = res.getItems();
          return {
            data: items,
            total: res?.data?.totalItems || 0,
          };
        }),
      );
    },
    [filters],
  );
  let handleRowSelection = (selected: boolean, selectedRows: any[]) => {
    setSelectedRowKeys((pre: any) => {
      selectedRows.forEach(({ id }: any) => {
        if (selected) {
          pre.push(id);
        } else {
          pre.remove(id);
        }
      });
      return [...pre];
    });
  };
  const rowSelection = useMemo(() => {
    if (!showPageFooter) return undefined;
    return {
      columnWidth: '32px',
      selectedRowKeys,
      onSelect: (record: any, selected: any, selectedRows: any, nativeEvent: any) => {
        nativeEvent.stopPropagation();
        handleRowSelection(selected, [record]);
      },
      onSelectAll: (selected: any, selectedRows: any, changeRows: any) => {
        handleRowSelection(selected, changeRows);
      },
    };
  }, [showPageFooter, selectedRowKeys]);
  let l = useLocation();

  let delResourceGroup = useMemoizedFn((row: { ids: string[]; re_namespace: string }) => {
    let { ids, re_namespace } = row;
    TzConfirmDelete({
      title: null,
      content: `删除后将一并清除关联的策略，是否确定删除资源组 ${re_namespace}？`,
      width: '520px',
      onOk() {
        deleteSegments({ ids }).subscribe((res) => {
          if (res.error) return;
          showSuccessMessage('删除成功！');
          setShowPageFooter(false);
          listComp.current.refresh();
        });
      },
    });
  });
  let setFooter = useMemoizedFn(() => {
    Store.pageFooter.next(
      showPageFooter ? (
        <div>
          <span className="mr16 ml16">{`${translations.selected} ${selectedRowKeys.length} ${translations.items}`}</span>
          <TzButton
            className={'mr16 ml20'}
            disabled={!selectedRowKeys.length}
            onClick={() => {
              setSegmentsInnertrust({ innerTrust: true });
            }}
          >
            {translations.internal_mutual_trust}
          </TzButton>
          <TzButton
            className={'mr16'}
            disabled={!selectedRowKeys.length}
            onClick={() => {
              setSegmentsInnertrust({ innerTrust: false });
            }}
          >
            {translations.cancel_mutual_trust}
          </TzButton>
          <TzButton
            className={'mr16'}
            disabled={!selectedRowKeys.length}
            onClick={() => {
              setSegmentsInnertrust({ mode: 'warning' });
            }}
          >
            {translations.warningMode}
          </TzButton>
          <TzButton
            className={'mr16'}
            disabled={!selectedRowKeys.length}
            onClick={() => {
              setSegmentsInnertrust({ mode: 'protecting' });
            }}
          >
            {translations.protectingMode}
          </TzButton>
          <TzButton
            className={'mr16'}
            danger
            disabled={!selectedRowKeys.length}
            onClick={() => {
              delResourceGroup({ ids: selectedRowKeys, re_namespace: '' });
            }}
          >
            {translations.delete}
          </TzButton>
        </div>
      ) : null,
    );
  });
  useCallback(() => {
    setShowPageFooter(props.activeKey === 'resourceGroup');
  }, [props.activeKey]);
  useEffect(() => {
    setFooter();
  }, [l, showPageFooter, selectedRowKeys]);
  let clusterList = useAssetsClusterList();
  const multiClusterManageFilter: FilterFormParam[] = useMemo(
    () => [
      {
        label: translations.compliances_policyDetails_name,
        name: 'name',
        type: 'input',
        icon: 'icon-ziyuan',
      },
      {
        label: translations.scanner_listColumns_namespace,
        name: 'namespace',
        type: 'input',
        icon: 'icon-mingmingkongjian',
      },
      {
        label: translations.internal_mutual_trust,
        name: 'innerTrust',
        type: 'select',
        icon: 'icon-jiedian',
        props: {
          options: innerTrustOp.map((item: any) => {
            return merge({}, item, { value: item['value'] + '' });
          }),
        },
      },
      {
        label: translations.microseg_namespace_strategyMode,
        name: 'mode',
        type: 'select',
        icon: 'icon-celveguanli',
        props: {
          options: strategicPatternOp,
        },
      },
      {
        label: translations.clusterManage_key,
        name: 'cluster',
        type: 'select',
        icon: 'icon-jiqun',
        props: {
          mode: 'multiple',
          options: clusterList,
        },
      },
    ],
    [],
  );
  const data = useTzFilter({ initial: multiClusterManageFilter });
  const handleChange = useCallback((values: any) => {
    setFilters((prev: any) => (isEqual(values, prev) ? prev : values));
  }, []);
  let columns = useMemo(() => {
    let a = ['namespace_group_name', 'innerTrust', 'resourceNumber', 'mode', 'namespace', 'cluster'];
    let arr = columnsList
      .filter((item: any) => a.includes(item.dataIndex))
      .map((item: any) => {
        if (item.dataIndex === 'resourceNumber') {
          item['align'] = 'right';
          item['width'] = '8%';
          item['render'] = (item: number, record: any) => {
            return item ? (
              <TzButton
                type={'text'}
                onClick={async () => {
                  let node = find(strategicPatternOp, (item) => item.value === record.mode);
                  let dw: any = await TzDrawerFn({
                    width: '80%',
                    title: (
                      <>
                        {record.name}&nbsp;&nbsp;
                        <RenderTag type={node?.value || 'warning'} />
                      </>
                    ),
                    children: <ResourceInfo {...record} />,
                  });
                  dw.show();
                }}
              >
                {item}
              </TzButton>
            ) : (
              <span style={{ paddingRight: '18px' }}>{item}</span>
            );
          };
        }
        return item;
      });
    let newArr = sortBy(arr, (x) => findIndex(a, (y) => x.dataIndex === y));
    return [
      ...newArr,
      {
        title: translations.clusterManage_operate,
        dataIndex: 'operate',
        width: '100px',
        render: (status: any, row: any) => {
          return (
            <>
              <TzButton
                type="text"
                onClick={() => navigate(Routes.MicroisolationObjectManagementEdit.replace('/:id', `/${row.id}`))}
              >
                {translations.edit}
              </TzButton>
              <TzButton
                type="text"
                danger
                onClick={() => {
                  delResourceGroup({ ids: [row.id], re_namespace: row.name });
                }}
              >
                {translations.delete}
              </TzButton>
            </>
          );
        },
      },
    ];
  }, []);
  const navigate = useNavigate();
  let setSegmentsInnertrust = useMemoizedFn((data) => {
    segmentsInnertrust(merge({ segmentIDs: selectedRowKeys }, data)).subscribe((res) => {
      if (res.error) return;
      listComp.current.refresh();
      showSuccessMessage(translations.scanner_images_addSuccess);
      setSelectedRowKeys([]);
      setShowPageFooter(false);
    });
  });
  return (
    <>
      <div className="mb12">
        <FilterContext.Provider value={{ ...data }}>
          <div className="flex-r-c">
            <div>
              {!showPageFooter ? (
                <>
                  <TzButton type={'primary'} onClick={() => navigate(Routes.MicroisolationObjectManagementAdd)}>
                    {translations.newAdd}
                  </TzButton>
                  <TzButton
                    className={'ml16'}
                    onClick={() => {
                      setShowPageFooter(true);
                    }}
                  >
                    {translations.batch_operation}
                  </TzButton>
                </>
              ) : (
                <TzButton
                  onClick={() => {
                    setShowPageFooter(false);
                    setSelectedRowKeys([]);
                  }}
                >
                  {translations.cancel_batch_operation}
                </TzButton>
              )}
            </div>
            <TzFilter />
          </div>
          <TzFilterForm className="mb12" onChange={handleChange} />
        </FilterContext.Provider>
      </div>

      <TzTableServerPage
        className="nohoverTable"
        rowSelection={rowSelection}
        columns={columns}
        tableLayout={'fixed'}
        rowKey={(item) => item.id}
        reqFun={reqFun}
        ref={listComp}
      />
    </>
  );
};
export default ResourceGroup;
