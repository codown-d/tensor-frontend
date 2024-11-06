import { isArray, isEqual, keys, merge, set, values } from 'lodash';
import moment from 'moment';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './EventOverviewDetails.less';
import { TzButton } from '../../components/tz-button';
import { TzRangePickerProps } from '../../components/tz-range-picker';
import { TzCol, TzRow } from '../../components/tz-row-col';
import { TzSelect } from '../../components/tz-select';
import { downFile, parseGetMethodParams } from '../../helpers/until';
import { eventOverview, palaceRules, topExport } from '../../services/DataService';
import { Store } from '../../services/StoreService';
import { translations } from '../../translations/translations';
import { PageTitle } from '../ImagesScanner/ImagesCI/CI';
import EventChart from './Chart';
import './Configure.scss';
import { TzCheckbox } from '../../components/tz-checkbox';
import { useLocation, useNavigate } from 'react-router-dom';
import { Routes } from '../../Routes';
// import { useActivate, useAliveController } from 'react-activation';
import { useLocationConsumer } from '../../helpers/useWithLocationListener';
import {
  getCascaderLabels,
  markOptions,
  optionsKind,
  optionsSeverity,
  optionTags,
  selectType,
  TSuggestName,
} from './eventDataUtil';
import { getOptValue, TQuery, transValues } from './EventData';
import { FilterFormParam } from '../../components/ComponentsLibrary/TzFilterForm/filterInterface';
import { useMemoizedFn, useUpdateEffect } from 'ahooks';
import useTzFilter, { FilterContext } from '../../components/ComponentsLibrary/TzFilter/useTzFilter';
import { TzFilter, TzFilterForm } from '../../components/ComponentsLibrary';
import useScopeFilter from './useScopeFilter';
import ReactDOM from 'react-dom';
import { SingleValueType } from '../../components/ComponentsLibrary/TzCascader/interface';
import EllipsisPopover from '../../components/ellipsisPopover/ellipsisPopover';

let echartColor: any = [
  'rgba(77, 163, 253, 1)',
  'rgba(242, 126, 126, 1)',
  'rgba(255, 173, 102, 1)',
  'rgba(246, 154, 221, 1)',
  'rgba(179, 224, 92, 1)',
  'rgba(131, 135, 189, 1)',
  'rgba(245, 225, 36, 1)',
  'rgba(90, 216, 166, 1)',
  'rgba(119, 226, 239, 1)',
  'rgba(105, 141, 218, 1)',
  'rgba(131, 166, 220, 1)',
  'rgba(149, 162, 175, 1)',
  'rgba(178, 122, 183, 1)',
  'rgba(245, 141, 154, 1)',
  'rgba(251, 193, 23, 1)',
  'rgba(171, 140, 245, 1)',
  'rgba(141, 200, 255, 1)',
  'rgba(222, 194, 121, 1)',
  'rgba(120, 175, 187, 1)',
  'rgba(121, 191, 158, 1)',
  'rgba(78, 125, 158, 1)',
];
export let severityColor: any = {
  high: 'rgba(233,84,84,1)',
  medium: 'rgba(255,138,52,1)',
  low: 'rgba(255,196,35,1)',
};
//按严重程度,按命中规则,按集群,按节点,按命名空间,按资源
let grouping = [
  {
    label: translations.by_severity,
    value: 'severity',
  },
  {
    label: translations.by_hit_rules,
    value: 'ruleKey',
  },
  {
    label: translations.by_cluster,
    value: 'cluster',
  },
  {
    label: translations.by_node,
    value: 'hostname',
  },
  {
    label: translations.by_namespace,
    value: 'namespace',
  },
  {
    label: translations.by_resource,
    value: 'resource',
  },
];
const DEFAULT_RANGEPICKERP_ROPS: TzRangePickerProps = {
  allowClear: false,
  showTime: true,
  format: 'YYYY/MM/DD HH:mm:ss',
  ranges: {
    [translations.hours_24]: [moment().add(-24, 'h'), moment()],
    [translations.days_7]: [moment().add(-7, 'd'), moment()],
    [translations.days_30]: [moment().add(-30, 'd'), moment()],
  },
};
const EventOverviewDetails = () => {
  const navigate = useNavigate();
  // const { refreshScope } = useAliveController();
  let [chartTop, setChartTop] = useState({});
  let [option, setOption] = useState<any>({});
  let [groupKind, setGroupKind] = useState<any>('severity');
  let [optionsRules, setOptionsRules] = useState([]);
  let [legendState, setLegendState] = useState<any>({});
  let [initByActive, setInitByActive] = useState<any>(Store.eventoverview.value);

  const initData = useMemo((): TQuery => {
    return {
      updatedAt: [moment().add(-24, 'h'), moment()],
      ...initByActive,
    };
  }, [initByActive]);

  const filterOriginValues = useRef(initData);
  const [query, setQuery] = useState<TQuery>(() => transValues(initData));
  const [containerWid, setContainerWid] = useState<number>(0);

  useEffect(() => {
    Store.layoutMainContentSize.subscribe((val) => {
      setContainerWid((val?.width || 0) - 138 - 68);
    });
  }, [Store.layoutMainContentSize]);

  let myChart = useRef<any>(null);

  let overviewParam = useMemo(() => {
    return {
      query,
      id: '',
      type: ['ruleScope'],
      statsType: 'eventOverview',
      payload: {
        groupKind,
        getSummary: false,
        getTop: true,
        getTendency: true,
      },
    };
  }, [query, groupKind]);
  let postEventOverview = useCallback(() => {
    eventOverview(overviewParam).subscribe((res: any) => {
      let { tendency = [], top = [] } = res.getItem();
      let color: any = groupKind === 'severity' ? Object.values(severityColor) : echartColor;
      let newItems = tendency.map((item: any) => {
        let { group } = item;
        if (groupKind === 'severity') {
          let high = ['0', '1', '2', '3'],
            medium = ['4', '5'],
            low = ['6', '7'];
          let highCount = high.reduce((pre, ite) => pre + (group[ite] ? group[ite].num : 0), 0);
          let mediumCount = medium.reduce((pre, ite) => pre + (group[ite] ? group[ite].num : 0), 0);
          let lowCount = low.reduce((pre, ite) => pre + (group[ite] ? group[ite].num : 0), 0);
          let keys = Object.keys(group);
          let obj: any = {};
          if (keys.some((item) => high.includes(item))) {
            obj['high'] = {
              key: 'high',
              label: translations.notificationCenter_columns_High,
              num: highCount,
              color: severityColor['high'],
            };
          }
          if (keys.some((item) => medium.includes(item))) {
            obj['medium'] = {
              key: 'medium',
              label: translations.notificationCenter_columns_Medium,
              num: mediumCount,
              color: severityColor['medium'],
            };
          }
          if (keys.some((item) => low.includes(item))) {
            obj['low'] = {
              key: 'low',
              label: translations.notificationCenter_columns_Low,
              num: lowCount,
              color: severityColor['low'],
            };
          }
          item['group'] = obj;
        }
        return item;
      });
      let seriesKeys = newItems.reduce((pre: any, item: any) => {
        let { group, timeAt: xAxis } = item;
        Object.keys(group).forEach((ite) => {
          if (pre[ite]) {
            pre[ite].push([xAxis, group[ite].num]);
          } else {
            pre[ite] = [[xAxis, group[ite].num]];
          }
        });
        return pre;
      }, {});
      let series = keys(seriesKeys).map((item, index) => {
        let rgx = /^rgba\(((,?\s*\d+){3}).+$/;
        let { group } = newItems[0];
        return {
          id: item,
          color: severityColor[item] ? severityColor[item] : color[index],
          name: group[item].label,
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: color[index].replace(rgx, 'rgba($1, .1)'),
                },
                {
                  offset: 1,
                  color: color[index].replace(rgx, 'rgba($1, 0)'),
                },
              ],
              global: false, // 缺省为 false
            },
          },
          data: seriesKeys[item],
        };
      });
      let newTop = top;
      if (groupKind === 'severity') {
        let high = [0, 1, 2, 3],
          medium = [4, 5],
          low = [6, 7];
        newTop = [
          {
            key: 'high',
            label: translations.notificationCenter_columns_High,
            num: top.reduce((pre: any, ite: { key: number; num: any }) => {
              if (high.includes(ite.key)) {
                pre = pre + ite.num;
              }
              return pre;
            }, 0),
          },
          {
            key: 'medium',
            label: translations.notificationCenter_columns_Medium,
            num: top.reduce((pre: any, ite: { key: number; num: any }) => {
              if (medium.includes(ite.key)) {
                pre = pre + ite.num;
              }
              return pre;
            }, 0),
          },
          {
            key: 'low',
            label: translations.notificationCenter_columns_Low,
            num: top.reduce((pre: any, ite: { key: number; num: any }) => {
              if (low.includes(ite.key)) {
                pre = pre + ite.num;
              }
              return pre;
            }, 0),
          },
        ]
          .filter((item) => item.num)
          .sort((a, b) => b.num - a.num)
          .map((item: any) => {
            let node: any = series.filter((ite) => ite.id === item.key);
            item['color'] = node[0].color;
            return item;
          });
      } else {
        newTop = top.map((item: { [x: string]: unknown }, index: number) => {
          let node: any = series.filter((ite) => ite.id === item.key);
          item['color'] = node[0].color;
          return item;
        });
      }
      setLegendState(
        newTop.reduce((pre: any, item: any) => {
          pre[item.label] = true;
          return pre;
        }, {}),
      );
      setChartTop(newTop);
      setOption({
        color: series.map((item) => item.color),
        legend: { show: false },
        xAxis: {
          axisLabel: {
            formatter: function (value: string, index: any) {
              let d = query.updatedAt.end - query.updatedAt.start;
              let str = 'MM/DD';
              if (d < 60 * 1000) {
                str = 'MM/DD HH:mm:ss';
              } else if (d < 24 * 3600 * 1000) {
                str = 'MM/DD HH:mm';
              } else if (d < 24 * 3600 * 1000 * 3) {
                str = 'MM/DD HH:mm';
              } else if (d < 24 * 3600 * 1000 * 30) {
                str = 'MM/DD';
              }
              return moment(value).format(str);
            },
          },
        },
        series,
      });
    });
  }, [overviewParam]);
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
          return item['key'] == 'kubeMonitor' ? false : true;
        }),
      );
    });
  };
  useEffect(() => {
    postEventOverview();
  }, [postEventOverview]);
  useEffect(() => {
    getPalaceRules();
  }, []);
  let postTopExport = useCallback(() => {
    topExport(overviewParam).subscribe((res: any) => {
      downFile(res, `event.csv`);
    });
  }, [overviewParam, groupKind]);
  const l = useLocation();
  let setHeader = useCallback(() => {
    Store.header.next({
      title: (
        <div className="event-overview-detail-title">
          <span>{translations.event_overview}</span>
          <TzSelect
            placeholder={translations.grouping}
            style={{ width: '160px' }}
            className={'ml12'}
            value={groupKind}
            onChange={setGroupKind}
            options={grouping}
          />
        </div>
      ),
      extra: (
        <div style={{ display: 'flex', justifyContent: 'space-round' }}>
          <div id="filterBtnId" className="mr12"></div>
          <TzButton onClick={postTopExport}>{translations.export_CSV}</TzButton>
        </div>
      ),
      onBack: () => {
        navigate(-1);
      },
    });
  }, [postTopExport, l]);
  useEffect(setHeader, [setHeader]);

  // const { from, to } = useLocationConsumer();

  // useActivate(() => {
  //   const getInitByActive =
  //     from.pathname === Routes.NotificationCenter
  //       ? Store.eventoverview.value
  //       : { ...filterOriginValues.current };
  //   setInitByActive(() => {
  //     return merge({}, getInitByActive);
  //   });
  //   setHeader();
  // });
  useEffect(() => {
    Object.keys(legendState).forEach((name) => {
      let type = legendState[name] ? 'legendSelect' : 'legendUnSelect';
      myChart.current &&
        myChart.current.dispatchAction({
          type,
          name,
        });
    });
  }, [legendState]);
  let setLegendselected = useCallback(
    (name) => {
      setLegendState((pre: any) => {
        pre[name] = !pre[name];
        return { ...pre };
      });
    },
    [myChart],
  );
  let getLegendDom = useCallback(
    (item, legendIndex) => {
      if (!item) return null;
      let { color, key, label, num } = item;
      return (
        <p
          className={`legend-item mb4 ${legendState[label] ? '' : 'legend-item-unact'}`}
          onClick={() => setLegendselected(label)}
        >
          <span className={'legend-item-index'} style={{ width: '24px', textAlign: 'right' }}>
            {key === '__key::other$$' ? '' : `#${legendIndex}`}
          </span>
          <span
            ref={(node) => {
              $(node).css({ background: color });
            }}
            className={'marker'}
          ></span>
          <span className={'legend-item-name'}>
            <span className="legend-item-name-label">
              <EllipsisPopover>{label}</EllipsisPopover>
            </span>
            <span className="legend-item-name-num">
              {key === '__key::other$$' || (
                <TzButton
                  className={'legend-item-detail ml8 f12'}
                  size={'small'}
                  type={'text'}
                  onClick={(e) => {
                    e.stopPropagation();
                    let obj: any = {
                      ...query,
                      ...query.updatedAt,
                      title: label,
                    };
                    if ('severity' === groupKind) {
                      let o: any = {
                        high: [0, 1, 2, 3],
                        medium: [4, 5],
                        low: [6, 7],
                      };
                      obj['severity'] = o[key];
                    } else if ('ruleKey' === groupKind) {
                      obj['ruleKey'] = [key];
                    } else {
                      let arr = key.split('/');
                      arr.forEach((element: any, index: string | number) => {
                        let key: any = ['cluster', 'hostname', 'namespace', 'resource'];
                        set(obj, ['scope', key[index]], [element]);
                      });
                    }
                    delete obj.updatedAt;
                    let params = parseGetMethodParams(
                      Object.assign(obj, {
                        scope: JSON.stringify(query.scope),
                      }),
                      true,
                    );
                    // refreshScope('EventDetailsList');
                    navigate(Routes.EventDetailsList + params);
                  }}
                >
                  {translations.runtimePolicy_details}
                </TzButton>
              )}
              <span
                style={{
                  width: '24px',
                  display: 'inline-block',
                  textAlign: 'right',
                }}
              >
                {num}
              </span>
            </span>
          </span>
        </p>
      );
    },
    [legendState, myChart, query, groupKind],
  );
  let getLegend = useMemo(() => {
    let chartTopArr = values(chartTop),
      chartTopItem: unknown = null;
    if (!chartTopArr.length) return null;
    if (chartTopArr.find((item: any) => item.key === '__key::other$$')) {
      chartTopItem = chartTopArr.pop();
    }
    let span = 12,
      arr = [
        chartTopArr.slice(0, Math.ceil(chartTopArr.length / 2)),
        chartTopArr.slice(Math.ceil(chartTopArr.length / 2)),
      ];
    if (document.body.clientWidth > 1440) {
      let a = Math.ceil((chartTopArr.length - Math.ceil(chartTopArr.length / 3)) / 2);
      span = 8;
      arr = [
        chartTopArr.slice(0, Math.ceil(chartTopArr.length / 3)),
        chartTopArr.slice(Math.ceil(chartTopArr.length / 3), Math.ceil(chartTopArr.length / 3) + a),
        chartTopArr.slice(Math.ceil(chartTopArr.length / 3) + a),
      ];
    }
    if (chartTopItem) {
      let i = chartTopArr.length % arr.length;
      arr[i].push(chartTopItem);
    }
    let index = 0;
    return arr.map((item: any[]) => {
      return (
        <TzCol span={span}>
          {item.map((it) => {
            if (it.key !== '__key::other$$') {
              index++;
            }
            return getLegendDom(it, index);
          })}
        </TzCol>
      );
    });
  }, [getLegendDom, chartTop]);

  const { scopeFilterItems, suggestOptions } = useScopeFilter(initData);

  const configFilter: FilterFormParam[] = useMemo(() => {
    return [
      {
        label: translations.hit_rule,
        name: 'ruleKey',
        type: 'cascader',
        icon: 'icon-celveguanli',
        enumLabel: getCascaderLabels(optionsRules, initData?.ruleKey as SingleValueType[]),
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
        fixed: true,
        value: initData.updatedAt,
        props: {
          ...DEFAULT_RANGEPICKERP_ROPS,
          onChange: (e: any) => {
            const end = moment(e[1]).valueOf();
            Store.eventsCenter.next({ timer: +end });
          },
        },
      },
    ] as FilterFormParam[];
  }, [scopeFilterItems, optionTags, initData, optionsRules, markOptions, optionsKind, optionsSeverity]);

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
  }, [suggestOptions, optionsRules, initByActive]);

  const data = useTzFilter({
    initial: configFilter,
    initialValues: initData,
  });

  useUpdateEffect(() => {
    data.updateFilter({
      formItems: configFilter,
      formValues: initData,
      formEnumLabels: initialEnumLabels,
    });
  }, [optionsRules, scopeFilterItems, initialEnumLabels, initData]);

  const handleChange = useCallback((values: any) => {
    filterOriginValues.current = values;
    const _values = transValues(values);
    setQuery((prev) => {
      return isEqual(_values, prev) ? prev : _values;
    });
  }, []);

  const onChangeFilters = useMemoizedFn((vals) => data.updateFormItemValue(vals));

  return (
    <div className="mlr32" style={{ position: 'relative' }}>
      <div className="mb16 event-overview-filter">
        <FilterContext.Provider value={{ ...data }}>
          <div className="data-list-case-bar">
            {document.getElementById('filterBtnId') &&
              ReactDOM.createPortal(<TzFilter />, document.getElementById('filterBtnId') as HTMLDivElement)}
          </div>
          <TzFilterForm onChange={handleChange} />
        </FilterContext.Provider>
      </div>
      <PageTitle
        className={'f16 mb8'}
        title={
          <>
            {translations.event_statistics}
            <TzCheckbox
              defaultChecked={true}
              className={'ml12 fw400'}
              onChange={(e) => {
                e.stopPropagation();
                let checked = e.target.checked;
                setLegendState((pre: any) => {
                  return Object.keys(pre).reduce((pre: any, item) => {
                    pre[item] = checked;
                    return pre;
                  }, {});
                });
              }}
              style={{ color: '#3e4653' }}
            >
              {translations.onlineVulnerability_filters_selectAll}
            </TzCheckbox>
          </>
        }
      />
      <TzRow className={'customize-legend'} gutter={[32, 0]}>
        {getLegend}
      </TzRow>
      <div
        ref={(node) => {
          $(node).css({
            height: (containerWid * 0.28 > 300 ? containerWid * 0.28 : 300) + 'px',
          });
        }}
      >
        <EventChart
          data={option}
          refresh={(time: any) => {
            onChangeFilters({
              updatedAt: [moment(time.start), moment(time.end)],
            });
          }}
          finished={(chart: any) => {
            chart.dispatchAction({
              type: 'takeGlobalCursor',
              key: 'dataZoomSelect',
              // 启动或关闭
              dataZoomSelectActive: true,
            });
          }}
          ready={(chart: any) => {
            myChart.current = chart;
          }}
        />
      </div>
    </div>
  );
};

export default EventOverviewDetails;
