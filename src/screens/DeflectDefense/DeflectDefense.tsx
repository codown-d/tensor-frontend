import { TablePaginationConfig } from 'antd';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import EllipsisPopover from '../../components/ellipsisPopover/ellipsisPopover';
import { TzButton } from '../../components/tz-button';
import { TzTableServerPage } from '../../components/tz-table';
import { Routes } from '../../Routes';
import { driftStats, driftStatsTop, getAssetsClustersList } from '../../services/DataService';
import { translations } from '../../translations/translations';
import { useAssetsClusters, useRresourcesTypes } from '../../helpers/use_fun';
import './DeflectDefense.scss';
import { TzTooltip } from '../../components/tz-tooltip';
import { del, getList, updateFn } from './service';
import { Store } from '../../services/StoreService';
import { LiquidFill } from '../../components/LiquidFill/LiquidFill';
import { TzCard } from '../../components/tz-card';
import { WebResponse } from '../../definitions';
import NoData from '../../components/noData/noData';
import { TzMessageError, TzMessageSuccess } from '../../components/tz-mesage';
import { TzConfirm } from '../../components/tz-modal';
import { FilterFormParam } from '../../components/ComponentsLibrary/TzFilterForm/filterInterface';
import { MODEOP_ENUM, STATUSOP_ENUM } from './util';
import useTzFilter, { FilterContext } from '../../components/ComponentsLibrary/TzFilter/useTzFilter';
import { TzFilter, TzFilterForm } from '../../components/ComponentsLibrary';
import { useUpdateEffect } from 'ahooks';
// import { useActivate, useAliveController } from 'react-activation';
import { isEqual } from 'lodash';
import { RenderTag } from '../../components/tz-tag';
import { Top5 } from './component/Top5';

let enableToStatus: any = {
  open: 1,
  disable: 0,
  ready: 2,
};

const DeflectDefense = () => {
  const [clusters, setClusters] = useState<any>([]);
  const [filters, setFilters] = useState<any>({});
  const navigate = useNavigate();
  const l = useLocation();
  // const { refreshScope } = useAliveController();
  const cluster = useAssetsClusters();
  const clusterKey = cluster?.key;
  const [tableOp, setTableOp] = useState(false);
  const [selectedRows, setSelectedRows] = useState<any>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<any>([]);
  const listComp = useRef(undefined as any);

  const resourcetypeList = useRresourcesTypes();

  const getClusters = useCallback(() => {
    getAssetsClustersList().subscribe((result) => {
      setClusters(result.map((item: any) => ({ label: item.name, value: item.key })));
    });
  }, []);

  useEffect(() => {
    getClusters();
  }, []);
  const [topData, setTopData] = useState<any[]>([]);
  const [maxScale, setMaxScale] = useState<number>(0);
  const [statusNum, setStatusNum] = useState<any>({ total: 0, used: 0 });

  const ck = useMemo(() => {
    const ckey = Store.clusterID.value;
    return ckey ? ckey : null;
  }, [Store.clusterID.value]);

  const getDriftStats = useCallback(() => {
    if (!ck) return;
    driftStats({ cluster_key: ck })
      .pipe(
        tap((res: WebResponse<any>) => {
          const item = res.getItem();
          const { total = 0, used = 0, can_create = 0 } = item;
          const obj = { total, used, can_create };
          setStatusNum((prev: any) => (isEqual(obj, prev) ? prev : obj));
        }),
      )
      .subscribe();
  }, [ck]);

  const occupancy = useMemo(() => {
    const { total = 0, used = 0 } = statusNum;
    if (!total) return [];

    let occ = Math.floor((used / total) * 100) / 100;
    let occl = occ > 0.04 ? Math.floor((occ - 0.04 * (1 - occ)) * 100) / 100 : occ;
    let occll = occl > 0.04 ? Math.floor((occl - 0.04 * (1 - occ)) * 100) / 100 : occl;
    return [occ, occl, occll];
  }, [statusNum]);

  const getDriftStatsTop = useCallback(() => {
    if (!ck) return;
    driftStatsTop({ cluster_key: ck })
      .pipe(
        tap((res: WebResponse<any>) => {
          const items = res.getItems();
          const uItems = items
            ?.sort((a, b) => {
              return b.count - a.count;
            })
            .filter((t) => !!t.count);
          let m = uItems?.[0]?.count || 0;
          let _max = Math.floor(m / 50) * 50;
          let ms = _max < m ? _max + 50 : _max;
          setMaxScale((pre) => (pre === ms ? pre : ms));
          setTopData((prev: any) => (isEqual(uItems, prev) ? prev : uItems));
        }),
      )
      .subscribe();
  }, [ck]);

  useEffect(() => {
    getDriftStats();
    getDriftStatsTop();
  }, [getDriftStats, getDriftStatsTop, ck]);

  const handleRowSelection = useCallback((selected: boolean, selectedRows: any[]) => {
    setSelectedRows((pre: any) => {
      selectedRows.forEach((s: any) => {
        if (selected) {
          pre.push(s);
        } else {
          pre = pre.filter((f: any) => f.policy_id !== s?.policy_id);
        }
      });
      return [...pre];
    });
    setSelectedRowKeys((pre: any) => {
      selectedRows.forEach(({ policy_id }) => {
        if (selected) {
          pre.push(policy_id);
        } else {
          pre.remove(policy_id);
        }
      });
      return [...pre];
    });
  }, []);

  const changeRowSelectedFn = useCallback((selectedRows: any[]) => {
    setSelectedRows((pre: any) => {
      selectedRows.forEach(({ policy_id }) => {
        pre = pre.filter((f: any) => f.policy_id !== policy_id);
      });
      return [...pre];
    });
    setSelectedRowKeys((pre: any) => {
      selectedRows.forEach(({ policy_id }) => {
        pre.remove(policy_id);
      });
      return [...pre];
    });
  }, []);

  const reqFun = useCallback(
    (pagination: TablePaginationConfig) => {
      const { current = 1, pageSize = 10 } = pagination;
      const offset = (current - 1) * pageSize;
      let paramsObj = {
        cluster_key: clusterKey,
        ...filters,
        offset,
        enable: enableToStatus?.[filters.enable],
        limit: pageSize || 10,
      };
      if (paramsObj.enable || paramsObj.enable === 0) {
        paramsObj['status'] = 2;
      }
      if (paramsObj.enable === 2) {
        delete paramsObj['enable'];
        paramsObj['status'] = 1;
      }
      if (!clusterKey) {
        return of(undefined);
      }
      return getList(paramsObj).pipe(
        map((res: any) => {
          const items = res.getItems().map((item: any) => ({
            ...item,
            clusterName: clusters.find((c: any) => c.value === item.cluster_key)?.label,
          }));
          return {
            data: items,
            total: res.data?.totalItems,
          };
        }),
      );
    },
    [clusterKey, clusters, filters],
  );

  const columns: any = useMemo(() => {
    return [
      {
        title: translations.deflectDefense_resourceName,
        key: 'name',
        render(record: any) {
          const txt = record?.resource;
          return (
            <span>
              <EllipsisPopover>{txt}</EllipsisPopover>
            </span>
          );
        },
      },
      {
        title: translations.deflectDefense_resourceType,
        key: 'resource_type',
        dataIndex: 'resource_type',
      },
      {
        title: translations.deflectDefense_ns,
        key: 'namespace',
        render(record: any) {
          const txt = record.namespace;
          return <EllipsisPopover>{txt}</EllipsisPopover>;
        },
      },
      {
        title: (
          <>
            {translations.deflectDefense_status}
            <TzTooltip placement="top" title={translations.defense_status_des}>
              <i className={'icon iconfont icon-wenhao'}></i>
            </TzTooltip>
          </>
        ),
        key: 'enable',
        align: 'center',
        render(record: any) {
          let txt = 'open';
          if (record.enable == 0) {
            txt = 'disable';
          }
          if (record.scanner_status < 2) {
            txt = 'ready';
          }
          return <RenderTag type={txt} />;
        },
      },
      {
        title: translations.deflectDefense_defenseMode,
        key: 'mode',
        align: 'center',
        render(record: any) {
          return <RenderTag type={record.mode} />;
        },
      },
      {
        title: translations.deflectDefense_exceptionRecNum,
        key: 'num',
        // align: 'right',
        align: 'center',
        render(record: any) {
          const txt = record.abnormal_num;
          return <span style={{ paddingRight: '0px' }}>{txt}</span>;
        },
      },
      {
        title: translations.tensorSelect_operations,
        key: 'operate',
        width: '68px',
        render(record: any) {
          return (
            <TzButton
              danger
              type="text"
              // disabled={tableOp}
              onClick={(event) => {
                event.stopPropagation();
                TzConfirm({
                  content: translations.unStandard.str57(),
                  okText: translations.delete,
                  okButtonProps: { danger: true },
                  cancelText: translations.cancel,
                  onOk() {
                    if (record?.enable === 1 && record?.scanner_status === 2) {
                      TzMessageError(translations.activeDefense_delStop);
                      return;
                    }
                    del(record?.policy_id + '').subscribe((res) => {
                      if (res.data) {
                        listComp?.current && listComp?.current.refresh();
                        if (selectedRowKeys.includes(record?.policy_id)) {
                          changeRowSelectedFn([record]);
                        }
                        getDriftStats();
                        getDriftStatsTop();
                        TzMessageSuccess(translations.activeDefense_delSuccessTip);
                      }
                    });
                  },
                });
              }}
            >
              {translations.delete}
            </TzButton>
          );
        },
      },
    ];
  }, [clusterKey, listComp, tableOp, changeRowSelectedFn, selectedRowKeys, getDriftStats, getDriftStatsTop]);

  const rowSelection = useMemo(() => {
    if (!tableOp) return undefined;
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
  }, [tableOp, selectedRowKeys, handleRowSelection]);

  const fnPutRow = useCallback(
    (selectedRows: any[], obj: any) => {
      const items = selectedRows.map((t) => {
        const { policy_id, enable, mode } = t;
        return Object.assign({ policy_id, enable, mode }, obj);
      });
      updateFn(items).subscribe((res) => {
        if (res.error) {
          return;
        }
        setTableOp(false);
        setSelectedRows([]);
        setSelectedRowKeys([]);
        TzMessageSuccess(translations.updateSucceeded);
        listComp?.current && listComp.current.refresh();
      });
    },
    [listComp],
  );

  useEffect(() => {
    Store.pageFooter.next(
      tableOp ? (
        <div>
          <span className="mr16 ml16">{`${translations.selected} ${selectedRows.length}  ${translations.items}`}</span>
          <TzButton
            disabled={!selectedRows.length}
            className={'mr16'}
            onClick={() => fnPutRow(selectedRows, { enable: 1 })}
          >
            {translations.deflectDefense_strat}
          </TzButton>
          <TzButton
            disabled={!selectedRows.length}
            className={'mr16'}
            onClick={() => fnPutRow(selectedRows, { enable: 0 })}
          >
            {translations.deflectDefense_stop}
          </TzButton>
          <TzButton
            disabled={!selectedRows.length}
            className={'mr16'}
            onClick={() => fnPutRow(selectedRows, { mode: 'alert' })}
          >
            {translations.deflectDefense_alertMode}
          </TzButton>
          <TzButton disabled={!selectedRows.length} onClick={() => fnPutRow(selectedRows, { mode: 'block' })}>
            {translations.deflectDefense_blockMode}
          </TzButton>
        </div>
      ) : null,
    );
  }, [tableOp, selectedRows, fnPutRow, l]);

  const deflectDefenseFilter: FilterFormParam[] = useMemo(
    () => [
      {
        label: translations.resource_name,
        name: 'search',
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
        label: translations.compliances_node_status,
        name: 'enable',
        type: 'select',
        icon: 'icon-celveguanli',
        props: {
          options: STATUSOP_ENUM,
        },
      },
      {
        label: translations.deflectDefense_defenseMode,
        name: 'mode',
        type: 'select',
        icon: 'icon-fangyumoshi',
        props: {
          options: MODEOP_ENUM,
        },
      },
      {
        label: translations.microseg_resources_res_kind,
        name: 'resource_type',
        type: 'select',
        icon: 'icon-leixing',
        props: {
          options: resourcetypeList,
        },
      },
    ],
    [resourcetypeList],
  );

  const data = useTzFilter({ initial: deflectDefenseFilter });

  useUpdateEffect(() => {
    data.updateFilter(deflectDefenseFilter);
  }, [resourcetypeList]);

  const handleChange = useCallback((values: any) => {
    setFilters(values);
  }, []);

  const setHeader = () => {
    Store.header.next({
      title: translations.deflectDefense_title,
      extra: (
        <TzButton
          icon={<i className={'icon iconfont icon-jianceguize'}></i>}
          onClick={() => {
            navigate(Routes.DeflectDefenseWhiteList);
          }}
        >
          {translations.white_list}
        </TzButton>
      ),
    });
  };
  useEffect(() => {
    setHeader();
  }, [l]);

  // useActivate(() => {
  //   listComp?.current && listComp.current.refresh();
  //   setTableOp(() => {
  //     setSelectedRows([]);
  //     setSelectedRowKeys([]);
  //     return false;
  //   });
  //   getDriftStats();
  //   getDriftStatsTop();
  //   setHeader();
  // });

  return (
    <div className="deflect-defense mlr32">
      <div className="visualization-group">
        <TzCard
          className="left-case"
          bordered={false}
          title={
            <>
              {translations.deflectDefense_policyOverview} {'   '}
              <TzTooltip placement="right" title={translations.defense_os_des}>
                <i className={'icon iconfont icon-tishi showTool'}></i>
              </TzTooltip>
            </>
          }
        >
          <LiquidFill width={400} height={400} data={occupancy} occupancyData={statusNum} />
        </TzCard>
        <TzCard bordered={false} className="right-case " title={translations.deflectDefense_top5}>
          <>{maxScale ? <Top5 data={topData} max={maxScale} /> : <NoData />}</>
        </TzCard>
      </div>
      <FilterContext.Provider value={{ ...data }}>
        <div className="deflect-defense-toolbar">
          <div className="deflect-defensetoolbar-btn">
            <TzButton
              type="primary"
              onClick={() => {
                navigate(`${Routes.DeflectDefenseAdd}?ck=${Store.clusterID.value}`);
              }}
              className={'mr16'}
            >
              {translations.deflectDefense_newStrategy}
            </TzButton>
            <TzButton
              onClick={() => {
                setTableOp((pre) => {
                  pre && setSelectedRows([]);
                  pre && setSelectedRowKeys([]);
                  return !pre;
                });
              }}
            >
              {tableOp ? translations.cancel_batch_operation : translations.batch_operation}
            </TzButton>
          </div>
          <TzFilter />
        </div>
        <TzFilterForm onChange={handleChange} />
      </FilterContext.Provider>

      <TzTableServerPage
        className="dd-list"
        columns={columns}
        rowSelection={rowSelection}
        rowKey="policy_id"
        reqFun={reqFun}
        ref={listComp}
        onRow={(record) => ({
          onClick: (e) => {
            e.stopPropagation();
            // 暂时解决同名资源位置缓存问题，正常应该用refreshScope
            // Store.menuCacheItem.next('DeflectDefenseInfo');
            // refreshScope('DeflectDefenseInfo');
            navigate(`${Routes.DeflectDefenseInfo}?policyId=${record.policy_id}`);
          },
        })}
      />
    </div>
  );
};

export default DeflectDefense;
