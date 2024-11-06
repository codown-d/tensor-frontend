import { cloneDeep, flatten, isArray, isEqual, keys, merge, set } from 'lodash';
import moment from 'moment';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './PalaceEvent.scss';
import { TzFilter, TzFilterForm } from '../../components/ComponentsLibrary';
import { TzDrawerFn } from '../../components/tz-drawer';
import { TableScrollFooter, TzTable } from '../../components/tz-table';
import { TzTag } from '../../components/tz-tag';
import { holaRules, palaceRules, palaceSignals, signalDetail } from '../../services/DataService';
import { getSeverityTag, TzTableTzTdInfo, TzTableTzTdRules } from './AlertCenterScreen';
import { TzTooltip } from '../../components/tz-tooltip';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Routes } from '../../Routes';
import { getCascaderLabels, optionsSeverity, optionTags, selectType, TSuggestName } from './eventDataUtil';
import { Store } from '../../services/StoreService';
import { TzButton } from '../../components/tz-button';
import { TzCheckbox } from '../../components/tz-checkbox';
import { translations } from '../../translations/translations';
import { getAllowWhitelist } from './WhiteListPolicyDetail';
import EllipsisPopover from '../../components/ellipsisPopover/ellipsisPopover';
import { FilterFormParam } from '../../components/ComponentsLibrary/TzFilterForm/filterInterface';
import useTzFilter, { FilterContext } from '../../components/ComponentsLibrary/TzFilter/useTzFilter';
import useScopeFilter from './useScopeFilter';
import { valueIsNull } from '../../components/ComponentsLibrary/TzFilter/util';
import { useMemoizedFn, useUpdateEffect } from 'ahooks';
import { createPortal } from 'react-dom';
import ArtTemplateDataInfo from '../../components/ComponentsLibrary/ArtTemplateDataInfo';
import { Tittle } from '../../components/ComponentsLibrary/Tittle';
import { Result } from 'definitions';
import { useAnchorItem } from '../../components/ComponentsLibrary/TzAnchor';
import { useInfiniteScroll } from '../../helpers/use_fun';
export let PalaceDetailInfo = (props: any) => {
  let [dataInfo, setDataInfo] = useState<any>({
    ruleDetail: {},
    severity: 0,
    context: {},
  });
  let [contextList, setContextList] = useState<any>({});
  let dataContextList = useMemo(() => {
    let info = Object.assign({}, dataInfo.context);
    return Object.keys(info).map((item) => {
      let o: any = {
        title: (contextList[item] || item) + '：',
        content: info[item],
        render: () => {
          return <EllipsisPopover>{info[item] || '-'}</EllipsisPopover>;
        },
      };
      return o;
    });
  }, [dataInfo, contextList]);
  let dataInRuleDetailfoList = useMemo(() => {
    let obj: any = {
      name: translations.originalWarning_ruleName + '：',
      type: translations.originalWarning_rule + '：',
      severity: translations.scanner_expandedView_severity + '：',
      urgency: translations.needEmergencyHandle + '：',
      suggestion: translations.disposal_suggestions + '：',
      description: translations.clusterManage_aDescription + '：',
    };
    let info = Object.assign({}, dataInfo.ruleDetail, {
      severity: dataInfo.severity,
    });
    return Object.keys(obj)
      .map((item) => {
        let o: any = {
          title: obj[item] || '-',
          content: info[item] || '-',
        };
        if ('severity' === item) {
          o['render'] = () => {
            return getSeverityTag(info[item]);
          };
        }
        if ('type' === item) {
          o['render'] = () => {
            return <TzTag className="">{info[item]}</TzTag>;
          };
        }
        if ('suggestion' === item || 'description' === item) {
          o['className'] = 'item-flex-start';
          o['render'] = () => {
            return info[item];
          };
        }
        return o;
      })
      .filter((item) => item.content || item.content === 0);
  }, [dataInfo]);
  let getSignalDetail = useCallback(() => {
    signalDetail({ id: props.id }).subscribe((res: any) => {
      let item = res.getItem();
      setDataInfo(item);
    });
  }, [props]);
  let getHolaRules = () => {
    holaRules({ domain: 'signal.context', type: 'key' }).subscribe((res) => {
      let item = res.getItem() || {};
      setContextList(item);
    });
  };
  useEffect(() => {
    getSignalDetail();
    getHolaRules();
  }, []);
  return (
    <>
      <Tittle title={translations.hit_rule} className="mt4" />
      <ArtTemplateDataInfo
        className={'base-case palace-event-temp mt20'}
        data={dataInRuleDetailfoList}
        span={1}
        rowProps={{ gutter: [0, 0] }}
      />
      <Tittle title={translations.alarm_environment} className="mt12" />
      <ArtTemplateDataInfo
        className={'base-case palace-event-temp mt20 mb12'}
        data={dataContextList}
        span={1}
        rowProps={{ gutter: [0, 0] }}
      />
    </>
  );
};

const transValues = (data: any) => {
  const temp = {};
  keys(data).forEach((key) => {
    let _val = cloneDeep(data[key]);
    if (selectType.some((v) => v.value === key)) {
      if (key === 'cluster') {
        _val = _val.map((item: any) => {
          return item.split('_')[1];
        });
      }
      set(temp, ['scope', key], _val);
      return;
    }
    if (key === 'ruleKey') {
      set(
        temp,
        [key],
        _val.map((item: any[]) => item.join('/')),
      );
      return;
    }
    if (key === 'severity') {
      set(
        temp,
        [key],
        flatten(
          _val.map((item: string) => {
            return item.split(',');
          }),
        ).map((item) => Number(item)),
      );
      return;
    }

    if (key === 'createdAt' && _val) {
      _val[0] && set(temp, [key, 'start'], moment(_val[0]).valueOf());
      _val[1] && set(temp, [key, 'end'], moment(_val[1]).valueOf());
      return;
    }
    set(temp, [key], _val);
  });
  return temp;
};
const PalaceEvent = (props: any) => {
  let { formType = '', filter = true, scrollTarget = '#layoutMain', onShow = true, filterPortalId } = props;
  let navigate = useNavigate();
  const [result] = useSearchParams();
  const initData = useMemo(
    () =>
      merge({}, props.filters, {
        cluster: result.getAll('cluster_key') ?? [],
        namespace: result.getAll('namespace') ?? [],
        resource: result.getAll('resource') ?? [],
        ruleKey: result.get('ruleKey') ? [[result.get('ruleKey')]] : [],
        createdAt: result.get('start') ? [moment(+(result.get('start') as string)), moment()] : undefined,
      }),
    [JSON.stringify(props.filters)],
  );
  let [filters, setFilters] = useState<any>(props.filters);
  let [optionsRules, setOptionsRules] = useState([]);
  const [neglect, setNeglect] = useState(false);
  const [tableOp, setTableOp] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<any>([]);

  let columns = useMemo(() => {
    let items = [
      {
        title: translations.alarm_information,
        width: '40%',
        dataIndex: 'id',
        render(item: any, row: any) {
          let t = row.isWhitelistFilter && onShow;
          let obj = Object.assign({}, row, { description: row.ruleKey.name });
          return (
            <div>
              {t ? (
                <TzTooltip title={translations.white_list_passed}>
                  <img src="/images/bai.png" />
                </TzTooltip>
              ) : null}
              <TzTableTzTdInfo {...obj} />
            </div>
          );
        },
      },
      {
        title: translations.associatedEvents,
        dataIndex: 'eventIDs',
        width: '16%',
        render(item: any, row: any) {
          return (
            !item ||
            item.map((it: any, index: React.Key | null | undefined) => {
              return (
                <TzButton
                  style={{ maxWidth: '100%' }}
                  key={index}
                  type={'text'}
                  onClick={(event) => {
                    event.stopPropagation();
                    Store.menuCacheItem.next('PalaceEventCenterId');
                    navigate(Routes.PalaceEventCenterId.replace('/:id', `/${it}`));
                  }}
                >
                  <EllipsisPopover lineClamp={1}>{it}</EllipsisPopover>
                </TzButton>
              );
            })
          );
        },
      },
      {
        title: translations.hit_rule,
        dataIndex: 'object',
        render(object: any, row: any) {
          return row.ruleKey.category;
        },
      },
      {
        title: translations.rule_label,
        dataIndex: 'id',
        render(item: any, row: any) {
          return <TzTableTzTdRules {...row} />;
        },
      },
      {
        title: translations.scanner_report_occurTime,
        dataIndex: 'createdAt',
        render(item: any, row: any) {
          return (
            <>
              <div>{moment(item).format('YYYY-MM-DD')}</div>
              <div>{moment(item).format('HH:mm:ss')}</div>
            </>
          );
        },
      },
    ];
    if (onShow) {
      items.push({
        title: translations.operation,
        dataIndex: 'operate',
        render(_: any, row: any) {
          let tt = !row.isWhitelistFilter || getAllowWhitelist([row.ruleKey.categoryKey]);
          return tt ? (
            <TzButton
              className="ml-8"
              onClick={(event) => {
                event.stopPropagation();
                setTableOp((pre) => (pre ? !pre : pre));
                let rules = { [row.ruleKey.categoryKey]: row.ruleKey.nameKey };
                let scopes = [row.scope];
                let ids = [row.id];
                Store.policyDetail.next({
                  scopes,
                  rules,
                  type: 'palace',
                  ids,
                });
              }}
              type="text"
            >
              <Link to={Routes.PalaceEventWhiteListDetail.replace('/:id', `/${'new'}`)}>
                {' '}
                {translations.increase_white_list}{' '}
              </Link>
            </TzButton>
          ) : (
            <>-</>
          );
        },
      });
    }
    return items;
  }, [onShow]);

  let getPalaceRules = () => {
    palaceRules().subscribe((res: any) => {
      let items = res.getItems();
      let re = (list: any) => {
        for (let o of list || []) {
          o['value'] = o['key'];
          o['label'] = o['title'];
          re(o.children);
        }
      };
      re(items);
      setOptionsRules(
        items.filter((item: { [x: string]: any }) => {
          return formType ? item['key'] == formType : item['key'] == 'kubeMonitor' ? false : true;
        }),
      );
    });
  };

  const { scopeFilterItems, suggestOptions } = useScopeFilter(initData);

  useEffect(() => {
    getPalaceRules();
  }, []);
  const palaceEventFilter: FilterFormParam[] = useMemo(() => {
    let _initData: any = {};
    keys(initData).forEach((key) => {
      !valueIsNull(initData[key]) && set(_initData, key, initData[key]);
    });
    return [
      {
        label: translations.alarm_no,
        name: 'id',
        type: 'input',
        icon: 'icon-bianhao',
      },
      {
        label: translations.hit_rule,
        name: 'ruleKey',
        type: 'cascader',
        icon: 'icon-celveguanli',
        enumLabel: getCascaderLabels(optionsRules, initData?.ruleKey),
        props: {
          options: optionsRules,
          multiple: true,
        },
      },
      ...scopeFilterItems,
      {
        label: translations.scanner_detail_severity,
        name: 'severity',
        type: 'select',
        icon: 'icon-chengdu',
        props: {
          mode: 'multiple',
          options: optionsSeverity,
        },
      },
      {
        label: translations.rule_label,
        name: 'tags',
        type: 'select',
        icon: 'icon-biaoqian',
        props: {
          mode: 'multiple',
          options: optionTags,
        },
      },
      {
        label: translations.scanner_report_occurTime,
        name: 'createdAt',
        type: 'rangePickerCt',
        icon: 'icon-shijian',
        props: {
          showTime: true,
        },
      },
    ].map((item) => ({
      ...item,
      value: _initData[item.name],
    })) as FilterFormParam[];
  }, [scopeFilterItems, optionsRules, initData]);

  const initialEnumLabels = useMemo(() => {
    const obj = {};
    function getLabel(options: any, value: string | number) {
      if (!value && value !== 0) {
        return;
      }
      const _value = isArray(value) ? value : [value];
      if (!_value?.length) {
        return;
      }
      return _value
        .map((v: any, idx: number) => {
          const item = options?.find((x: any) => x.value === v);
          return item ? item.label : v;
        })
        .join(' , ');
    }
    keys(initData).forEach((key) => {
      const _value = initData[key];
      if (selectType.some((v) => v.value === key)) {
        const key2OptionLabel = getLabel(suggestOptions?.[key as TSuggestName], _value);
        merge(obj, { [key]: key2OptionLabel });
      }

      if (key === 'ruleKey') {
        const key2OptionLabel = getLabel(optionsRules, _value);
        merge(obj, { [key]: key2OptionLabel });
      }
    });
    return obj;
  }, [suggestOptions, optionsRules, initData]);

  const tzFilterData = useTzFilter({
    initial: palaceEventFilter,
    initialValues: initData,
  });

  useUpdateEffect(() => {
    tzFilterData.updateFilter({
      formItems: palaceEventFilter,
      formValues: initData,
      formEnumLabels: initialEnumLabels,
    });
  }, [optionsRules, scopeFilterItems, initialEnumLabels, initData]);

  const handleChange = useCallback((values: any) => {
    setFilters(values);
  }, []);

  const l = useLocation();
  useEffect(() => {
    Store.pageFooter.next(
      tableOp ? (
        <div>
          <span className="mr16 ml16">{`${translations.selected} ${selectedRowKeys.length} ${translations.items}`}</span>
          <TzButton
            disabled={!selectedRowKeys.length}
            onClick={() => {
              const items = data?.list.filter((t: any) => selectedRowKeys.includes(t.id)) || [];
              const scopes: any[] = [],
                ids: any[] = [];
              let rules = items.reduce((pre: any, { ruleKey: item, scope, id }: any) => {
                scopes.push(scope);
                ids.push(id);
                if (pre[item.categoryKey]) {
                  pre[item.categoryKey].includes(item.nameKey) ||
                    (pre[item.categoryKey] = [...pre[item.categoryKey], item.nameKey]);
                } else {
                  pre[item.categoryKey] = [item.nameKey];
                }
                return pre;
              }, {});
              Store.policyDetail.next({
                scopes,
                rules,
                type: 'palace',
                ids,
              });
              setTableOp(false);
              navigate(Routes.PalaceEventWhiteListDetail.replace('/:id', `/${'new'}`));
            }}
          >
            {translations.add_white_list}
          </TzButton>
        </div>
      ) : null,
    );
  }, [tableOp, selectedRowKeys, l]);

  const handleRowSelection = useCallback((selected: boolean, selectedRows: any[]) => {
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
  }, []);
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
      getCheckboxProps: (record: any) => ({
        disabled: record.in_whitelist || record.status === 'pass',
        name: record.name,
      }),
    };
  }, [tableOp, selectedRowKeys, handleRowSelection]);
  let sendData = useMemo(() => {
    return merge({}, transValues(filters), {
      ignoreWhitelist: !!neglect,
    });
  }, [filters]);
  let getLoadMoreList = useMemoizedFn((nextId: string | undefined, limit: number): Promise<Result> => {
    return new Promise((resolve) => {
      let data = {
        query: merge({ ruleKey: formType === 'Watson' ? ['Watson'] : [] }, sendData),
        sort: {
          field: 'createdAt',
          order: 'desc',
        },
        page: { limit, token: nextId },
      };
      palaceSignals(data).subscribe((res: any) => {
        let items: any[] = res.getItems();
        resolve({
          list: items,
          nextId: res.data?.pageToken,
        });
      });
    });
  });

  const { data, loadingMore, noMore } = useInfiniteScroll((d) => getLoadMoreList(d?.nextId, 20), {
    target: $(scrollTarget)[0],
    reloadDeps: [filters],
  });
  return (
    <div className="flowcenter-case">
      {filter && (
        <div className="palace-event-filter">
          <FilterContext.Provider value={{ ...tzFilterData }}>
            <div className="palace-event-toolbar">
              {filterPortalId && document.getElementById(filterPortalId) ? (
                createPortal(<TzFilter />, document.getElementById(filterPortalId) as HTMLDivElement)
              ) : (
                <TzFilter />
              )}
              {onShow && (
                <div className="palace-event-toolbar-btn">
                  <TzButton
                    onClick={() => {
                      setTableOp((pre) => !pre);
                    }}
                  >
                    {tableOp ? translations.cancel_batch_operation : translations.batch_operation}
                  </TzButton>
                  <TzCheckbox
                    checked={neglect}
                    onChange={(e) => {
                      setNeglect(e.target.checked);
                    }}
                  >
                    <span style={{ color: '#3E4653' }}>{translations.ignore_alarms_in_white_list}</span>
                  </TzCheckbox>
                </div>
              )}
            </div>
            <TzFilterForm onChange={handleChange} />
          </FilterContext.Provider>
        </div>
      )}
      <TzTable
        loading={loadingMore}
        dataSource={data?.list}
        pagination={false}
        rowSelection={rowSelection}
        sticky={true}
        rowClassName={(record) => {
          if (record.isWhitelistFilter && onShow) return 'rivet';
          return '';
        }}
        onRow={(record) => {
          return {
            onClick: async (event) => {
              let dw: any = await TzDrawerFn({
                className: 'drawer-body0 detail-palace-case',
                width: '38.9%',
                title: (
                  <p className="ant-drawer-title df dfac">
                    {translations.warningInfo}
                    <TzTag>{record.id}</TzTag>
                    {record?.isWhitelistFilter && <TzTag>{translations.white_list}</TzTag>}
                  </p>
                ),
                children: <PalaceDetailInfo {...record} />,
                onCloseCallBack() {},
              });
              dw.show();
            },
          };
        }}
        rowKey={'id'}
        columns={columns}
        footer={() => {
          return <TableScrollFooter isData={!!data?.list?.length} noMore={noMore} />;
        }}
      />
    </div>
  );
};

export default PalaceEvent;
