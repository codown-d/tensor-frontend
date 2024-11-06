import moment from 'moment';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './EventData.scss';
import { TableScrollFooter, TzTable } from '../../components/tz-table';
import { getEventsCenter, palaceRules, eventCount } from '../../services/DataService';
import { translations } from '../../translations/translations';
import { Routes } from '../../Routes';
import { TzFilter, TzFilterForm } from '../../components/ComponentsLibrary';
import { useThrottle } from '../../services/ThrottleUtil';
import { keys, isEqual, merge, isArray } from 'lodash';
import { Subscription } from 'rxjs';
import { Store } from '../../services/StoreService';
import { useLocation, useNavigate } from 'react-router-dom';
import { FilterFormParam } from '../../components/ComponentsLibrary/TzFilterForm/filterInterface';
import useTzFilter, { FilterContext } from '../../components/ComponentsLibrary/TzFilter/useTzFilter';
import {
  getCascaderLabels,
  markOptions,
  optionsKind,
  optionsSeverity,
  optionTags,
  selectType,
  TSuggestName,
} from './eventDataUtil';
import { useUpdateEffect } from 'ahooks';
import useScopeFilter from './useScopeFilter';
import { TzButton } from '../../components/tz-button';
// import { useActivate, useAliveController } from 'react-activation';
import { TzSpace } from '../../components/tz-space';
import {
  addSignMark,
  DEFAULT_RANGEPICKERP_ROPS,
  getDEFAULT_PAGE_PARAM,
  getEventColumns,
  getOptValue,
  TPage,
  TQuery,
  transValues,
} from './EventData';
import classNames from 'classnames';
const EventDataList = (props: any) => {
  let [page, setPage] = useState<TPage>(getDEFAULT_PAGE_PARAM());
  let { formType = '', _nk, ...otherProps } = props;
  const navigate = useNavigate();
  // const { refreshScope } = useAliveController();
  let [dataSource, setDataSource] = useState<any>([]);
  let [noMore, setNoMore] = useState(false);
  let [loading, setLoading] = useState(false);
  let [optionsRules, setOptionsRules] = useState([]);
  let [pageToken, setPageToken] = useState([]);

  let [showPageFooter, setShowPageFooter] = useState(false);
  let [selectedRowKeys, setSelectedRowKeys] = useState<any>([]);
  const initData = useMemo(() => {
    return {
      //updatedAt: [moment().add(-24, 'h'), moment()],
      ...props.filters,
    };
  }, [JSON.stringify(props.filters)]);

  const filterOriginValues = useRef(initData);
  const [query, setQuery] = useState<TQuery>(() => transValues(initData));
  const reqsub = useRef(undefined as undefined | Subscription);
  let scrollRef = useRef<any>(null);
  let eventDataChartRef = useRef<any>();
  let sendQuery = useMemo(() => {
    let o: any = {};
    if (['namespace'].includes(props.type)) {
      o = {
        // scope: {
        cluster: [props.ClusterID],
        namespace: [props.NSName],
        // },
      };
    } else if (['resource', 'web', 'database'].includes(props.type)) {
      o = {
        // scope: {
        cluster: [props.ClusterID],
        namespace: [props.namespace],
        resource: props.resourceName && props.resourceKind ? [`${props.resourceName}(${props.resourceKind})`] : [],
        // },
      };
    } else if (['node'].includes(props.type)) {
      o = {
        // scope: {
        cluster: [props.ClusterID],
        hostname: [props.HostName],
        // },
      };
    } else if (['pod'].includes(props.type)) {
      o = {
        // scope: {
        cluster: [props.ClusterID],
        namespace: [props.Namespace],
        resource: props.ResourceName && props.ResourceKind ? [`${props.ResourceName}(${props.ResourceKind})`] : [],
        pod: [props.PodName],
        // },
      };
    } else if (['container'].includes(props.type)) {
      o = {
        // scope: {
        cluster: [props.ClusterID],
        namespace: [props.namespace],
        resource: props.resourceName && props.resourceKind ? [`${props.resourceName}(${props.resourceKind})`] : [],
        pod: [props.podName],
        container: [props.name],
        // },
      };
    }
    const transVals = transValues(o);

    let data: any = {
      query: merge({}, query, transVals),
      sort: {
        field: 'updatedAt',
        order: 'desc',
      },
      page,
    };
    if (data.query?.updatedAt.start <= 0) {
      delete data.query?.updatedAt;
    }
    return data;
  }, [query, page, props]);
  let getDataSource = useCallback(() => {
    reqsub.current?.unsubscribe();
    setLoading(true);
    reqsub.current = getEventsCenter(sendQuery).subscribe((res: any) => {
      let items: any[] = res.getItems();
      setDataSource((pre: any) => {
        if (page.offset === 0) {
          return items;
        } else {
          return [].concat(...pre, ...items);
        }
      });
      setLoading(false);
      setPageToken(res.data?.pageToken);
      setNoMore(sendQuery.page.limit != items.length);
    });
  }, [sendQuery]);
  const refreshData = useCallback(() => {
    eventDataChartRef.current && eventDataChartRef.current?.refreshData();
    setPage(getDEFAULT_PAGE_PARAM);
  }, [getDataSource]);
  let onScrollHandle = useCallback(
    useThrottle(() => {
      if (!scrollRef.current || loading || noMore) {
        return;
      }
      const { scrollTop, clientHeight, scrollHeight } = scrollRef.current;
      const isBottom = scrollTop + clientHeight + 60 >= scrollHeight;
      if (isBottom && scrollTop) {
        setLoading(true);
        setPage((prev) => {
          return merge({}, prev, {
            offset: prev.offset + prev.limit,
            limit: prev.limit,
            token: pageToken,
          });
        });
      }
    }, 100),
    [loading, noMore, scrollRef, pageToken],
  );

  let initOnScroll = () => {
    let dom = $('#layoutMain');
    scrollRef.current = dom[0];
    dom.off('mousewheel DOMMouseScroll scroll').on('mousewheel DOMMouseScroll scroll', onScrollHandle);
  };
  useEffect(() => {
    initOnScroll();
  }, []);
  useEffect(() => {
    Store.onRefreshEventsList.next(refreshData);
  }, [refreshData]);
  useEffect(() => {
    getDataSource();
  }, [getDataSource]);

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
      setOptionsRules(items);
    });
  };
  useEffect(() => {
    getPalaceRules();
  }, []);

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
  let setFooter = useCallback(() => {
    Store.pageFooter.next(
      showPageFooter ? (
        <div>
          <span className="mr16 ml16">{`${translations.selected} ${selectedRowKeys.length} ${translations.items}`}</span>
          <TzButton
            className={'mr20'}
            disabled={!selectedRowKeys.length}
            onClick={() => {
              addSignMark({ id: selectedRowKeys }, () => {
                setShowPageFooter(false);
              });
            }}
          >
            {translations.sign}
          </TzButton>
        </div>
      ) : null,
    );
  }, [showPageFooter, selectedRowKeys]);

  const l = useLocation();
  useEffect(() => {
    setFooter();
  }, [setFooter, l]);
  // useActivate(() => {
  //   setFooter();
  // });
  const { scopeFilterItems, suggestOptions } = useScopeFilter(initData);
  const EventDataFilter: FilterFormParam[] = useMemo(() => {
    return [
      {
        label: translations.event_number,
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
      {
        label: translations.event_marker,
        name: 'processStatus',
        type: 'select',
        icon: 'icon-biaoji',
        enumLabel: getOptValue(markOptions, initData?.processStatus),
        props: {
          mode: 'multiple',
          options: markOptions,
        },
      },
      {
        label: translations.scanner_report_eventType,
        name: 'type',
        type: 'select',
        icon: 'icon-leixing',
        enumLabel: getOptValue(optionsKind, initData?.type),
        isShowAll: false,
        props: {
          mode: 'multiple',
          options: optionsKind,
          isShowAll: false,
        },
      },
      {
        label: translations.scanner_detail_severity,
        name: 'severity',
        type: 'select',
        icon: 'icon-chengdu',
        enumLabel: getOptValue(optionsSeverity, initData?.severity),
        props: {
          mode: 'multiple',
          options: optionsSeverity,
        },
      },
      {
        label: translations.scanner_images_tag,
        name: 'tags',
        type: 'select',
        icon: 'icon-biaoqian',
        enumLabel: getOptValue(optionTags, initData?.tags),
        props: {
          mode: 'multiple',
          options: optionTags,
        },
      },
      ...scopeFilterItems,
      {
        label: translations.notificationCenter_rule_timestamp,
        name: 'updatedAt',
        type: 'rangePicker',
        icon: 'icon-shijian',
        value: initData.updatedAt,
        props: {
          ...DEFAULT_RANGEPICKERP_ROPS,
          allowClear: true,
          onChange: (e: any) => {
            const end = moment(e[1]).valueOf();
            Store.eventsCenter.next({ timer: +end });
          },
        },
      },
    ]
      .filter((item) => {
        return !['registry', 'repo', 'tag'].includes(item.name);
      })
      .filter((item) => {
        if (['resource', 'web', 'database'].includes(props.type)) {
          return !['cluster', 'namespace', 'resource'].includes(item.name); //TEN-1753
        } else if (['node'].includes(props.type)) {
          return !['cluster', 'hostname'].includes(item.name);
        } else if (['pod'].includes(props.type)) {
          return !['cluster', 'namespace', 'resource', 'pod'].includes(item.name);
        } else if (['container'].includes(props.type)) {
          return ![
            'cluster',
            'container',
            'namespace',
            'pod',
            'resource',
            'registry',
            'repo',
            'tag',
            'hostname',
          ].includes(item.name);
        } else if (['namespace'].includes(props.type)) {
          return !['cluster', 'namespace'].includes(item.name);
        }
      }) as FilterFormParam[];
  }, [scopeFilterItems, optionTags, initData, optionsRules, markOptions, optionsKind, optionsSeverity, props.type]);

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
  }, [suggestOptions, optionsRules]);

  const data = useTzFilter({
    initial: EventDataFilter,
    initialValues: initData,
  });

  useUpdateEffect(() => {
    data.updateFilter({
      formItems: EventDataFilter,
      formValues: initData,
      formEnumLabels: initialEnumLabels,
    });
  }, [optionsRules, scopeFilterItems, initialEnumLabels, initData]);

  const handleChange = useCallback((values: any) => {
    filterOriginValues.current = values;
    const _values = transValues(values);
    setQuery((prev) => (isEqual(_values, prev) ? prev : _values));
    setPage(getDEFAULT_PAGE_PARAM);
  }, []);

  return (
    <>
      <div className={classNames('event-data-list event-case', props.className)}>
        <div className="mt4 mb8 palace-toolbar">
          <FilterContext.Provider value={{ ...data }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <TzSpace size={16}>
                <TzButton
                  onClick={() => {
                    setShowPageFooter((pre) => {
                      if (!pre) {
                        setSelectedRowKeys([]);
                      }
                      return !pre;
                    });
                  }}
                >
                  {showPageFooter ? translations.cancel_batch_operation : translations.batch_operation}
                </TzButton>
                {showPageFooter ? (
                  <></>
                ) : (
                  <TzButton
                    onClick={() => {
                      eventCount({ query: sendQuery.query }).subscribe((res) => {
                        if (res.error) return;
                        let { count } = res.getItem();
                        let arr = new Array(count);
                        addSignMark({ id: arr, query: sendQuery.query }, () => {
                          setShowPageFooter(false);
                          Store.palaceTaskPrevStatus.next('pending');
                        });
                      });
                    }}
                  >
                    {translations.sign}
                  </TzButton>
                )}
              </TzSpace>
              <TzFilter />
            </div>
            <TzFilterForm onChange={handleChange} />
          </FilterContext.Provider>
        </div>
        <TzTable
          rowSelection={rowSelection}
          loading={loading}
          dataSource={dataSource}
          pagination={false}
          sticky={true}
          onRow={(record) => {
            return {
              onClick: (event) => {
                event.stopPropagation();
                navigate(Routes.PalaceEventCenterId.replace('/:id', `/${record.id}?formType=${formType}`));
              },
            };
          }}
          rowKey={'id'}
          columns={getEventColumns(refreshData, navigate)}
          footer={() => {
            return <TableScrollFooter isData={!!(dataSource.length >= 20)} noMore={noMore} />;
          }}
        />
      </div>
    </>
  );
};

export default EventDataList;
