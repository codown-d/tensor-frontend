import moment from 'moment';
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import './EventData.scss';
import { TzInput } from '../../components/tz-input';
import { TzConfirm } from '../../components/tz-modal';
import { TzSelect, TzSelectProps } from '../../components/tz-select';
import { TableScrollFooter, TzTable } from '../../components/tz-table';
import { TzTabsNormal } from '../../components/tz-tabs';
import {
  getEventsCenter,
  palaceRules,
  postProcessingCenterRecord,
  eventOverview,
  eventProcess,
  eventCount,
  eventProcessQuery,
} from '../../services/DataService';
import { localLang, translations } from '../../translations/translations';
import { TzTableTzTdInfo, TzTableTzTdRules, TzTableTzTdType, TzTableTzTdWarn } from './AlertCenterScreen';
import { TzForm, TzFormItem } from '../../components/tz-form';
import { Routes } from '../../Routes';
import { TzRangePicker, TzRangePickerProps } from '../../components/tz-range-picker';
import { TzFilter, TzFilterForm } from '../../components/ComponentsLibrary';
import { TzMessageSuccess } from '../../components/tz-mesage';
import { flatten, set, keys, isEqual, floor, merge, isArray, cloneDeep, last } from 'lodash';
import { Store } from '../../services/StoreService';
import { openDrawer } from './DisposalRecord';
import { TzDropdown } from '../../components/tz-dropdown';
import EventChart from './Chart';
import { PageTitle } from '../ImagesScanner/ImagesCI/CI';
import Form, { FormInstance } from 'antd/lib/form';
import { TzRadioGroup } from '../../components/tz-radio';
import TzTextArea from '../../components/ComponentsLibrary/TzTextArea';
import { getUserInformation } from '../../services/AccountService';
import { getAllowWhitelist } from './WhiteListPolicyDetail';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { FilterFormParam } from '../../components/ComponentsLibrary/TzFilterForm/filterInterface';
import useTzFilter, { FilterContext } from '../../components/ComponentsLibrary/TzFilter/useTzFilter';
import {
  getCascaderLabels,
  markOptions,
  operations,
  optionsKind,
  optionsSeverity,
  optionTags,
  selectType,
  TSuggestName,
} from './eventDataUtil';
import { useInfiniteScroll, useMemoizedFn, useSize, useUpdateEffect } from 'ahooks';
import useScopeFilter from './useScopeFilter';
import { TzButton } from '../../components/tz-button';
import { severityColor } from './EventOverviewDetails';
import { ColumnsType } from 'antd/lib/table/interface';
import { valueIsNull } from '../../components/ComponentsLibrary/TzFilter/util';
import { TzSpace } from '../../components/tz-space';
import { Result } from 'definitions';
export let dealOrder = (item: any, disposalObjectList: any, callback: any) => {
  let eventID = item.id;
  let refDom: FormInstance<any>;
  let PostFrom = (props: any) => {
    let { disposalObjectList } = props;
    const [form] = Form.useForm();
    useEffect(() => {
      refDom = form;
    }, []);
    return (
      <TzForm form={form} initialValues={{ object: [] }}>
        {null && (
          <TzFormItem
            name="title"
            label={translations.work_order_name}
            rules={[
              {
                required: true,
                message: 'Please input the title of collection!',
              },
            ]}
          >
            <TzInput />
          </TzFormItem>
        )}
        <TzFormItem
          name="opType"
          label={translations.disposal_operation}
          rules={[
            {
              required: true,
              message: translations.originalWarning_pleaseSelect + translations.disposalType,
            },
          ]}
        >
          <TzSelect
            placeholder={translations.originalWarning_pleaseSelect + translations.disposalType}
            options={operations}
          />
        </TzFormItem>
        <TzFormItem
          name="object"
          style={{ marginBottom: 0 }}
          rules={[
            {
              required: true,
              message: translations.originalWarning_pleaseSelect + translations.disposalObject,
            },
          ]}
          label={translations.disposalObject}
        >
          <TzSelect
            placeholder={translations.originalWarning_pleaseSelect + translations.disposalObject}
            mode="multiple"
            maxTagCount={1}
            options={disposalObjectList}
          />
        </TzFormItem>
      </TzForm>
    );
  };
  return TzConfirm({
    closable: true,
    className: 'event-modal',
    title: translations.initiate_disposal_work_order,
    okText: translations.submit,
    onOk: (close) => {
      return new Promise(function (resolve, reject) {
        refDom
          .validateFields()
          .then((res) => {
            let d = Object.assign(
              {
                eventID: eventID,
                action: res.opType === 'PodIsolation' ? 'isolate' : 'delete',
              },
              res,
            );
            postProcessingCenterRecord(d).subscribe((res) => {
              let item = res.getItem();
              if (item) {
                resolve(res);
                callback(item);
              } else {
                reject(res);
              }
            });
          })
          .catch((res) => {
            reject(res);
          });
      }).then((res) => {
        TzMessageSuccess(translations.disposal_succeeded);
      });
    },
    content: (
      <div className="t-l">
        <PostFrom disposalObjectList={disposalObjectList} />
      </div>
    ),
  });
};
let reloadFn = () => {};
export let EvenMarkerDom = (props: any) => {
  let { status = 0, processor, timestamp, info = false } = props;
  let arr: any = ['unprocessed', 'processed', 'ignored', 'processed_later'];
  let type = arr[status];
  let evenMarker: any = {
    unprocessed: {
      title: translations.unprocessed,
      style: {
        background: 'rgba(233, 84, 84, 1)',
      },
    },
    processed: {
      title: translations.processed,
      style: {
        background: 'rgba(82, 196, 26, 1)',
      },
    },
    ignored: {
      title: translations.ignored,
      style: {
        background: 'rgba(179, 186, 198, 1)',
      },
    },
    processed_later: {
      title: translations.processed_later,
      style: {
        background: 'rgba(255, 196, 35, 1)',
      },
    },
  };
  return (
    <div className={'even-marker'} style={{}}>
      {!info ? (
        <div
          className={'even-marker-info'}
          style={{
            minWidth: '254px',
            fontSize: '12px',
            width: 'auto',
            color: '#3E4653',
            whiteSpace: 'nowrap',
          }}
        >
          <div className={'mb6'}>{`${translations.last_tagged_by}：${processor || '-'}`}</div>
          <div>{`${translations.latest_marking_time}：${
            timestamp ? moment(timestamp).format('YYYY-MM-DD HH:mm:ss') : '-'
          }`}</div>
        </div>
      ) : null}
      <span className="mr6" style={evenMarker[type].style}></span>
      {evenMarker[type].title}
    </div>
  );
};
export let marrkOptions = [
  {
    label: translations.unprocessed,
    value: 0,
  },
  {
    label: translations.processed,
    value: 1,
  },
  {
    label: translations.ignored,
    value: 2,
  },
  {
    label: translations.processed_later,
    value: 3,
  },
];
let TzFormDomm = (props: any) => {
  const [formIns] = Form.useForm();
  useEffect(() => {
    props?.getFormInstance(formIns);
  }, [props]);
  return (
    <TzForm
      form={formIns}
      initialValues={{
        eventID: props.id,
        processor: getUserInformation().username,
        processStatus: 0,
        remark: '',
        timestamp: new Date().getTime(),
      }}
    >
      <TzFormItem name={'timestamp'} hidden>
        <TzInput />
      </TzFormItem>
      <TzFormItem name={'eventID'} hidden>
        <TzInput />
      </TzFormItem>
      <TzFormItem name={'processor'} hidden>
        <TzInput />
      </TzFormItem>
      <TzFormItem
        label={translations.event_marker}
        name={'processStatus'}
        rules={[
          {
            required: true,
            message: translations.originalWarning_pleaseSelect + translations.event_marker,
          },
        ]}
      >
        <TzRadioGroup options={marrkOptions} />
      </TzFormItem>
      <TzFormItem
        label={translations.mark_comments}
        name={'remark'}
        style={{ marginBottom: '0px' }}
        rules={[
          {
            max: 150,
            message: translations.unStandard.str136,
          },
        ]}
      >
        <TzTextArea placeholder={translations.unStandard.str130} />
      </TzFormItem>
    </TzForm>
  );
};
export let addSignMark = (props: any, callback: any) => {
  let formInstance: any;
  let { query = null, ...row } = props;
  let len = typeof row.id === 'string' ? 1 : row.id.length;
  TzConfirm({
    title: (
      <>
        {translations.sign}
        <span className={'f14'} style={{ fontWeight: 400, color: '#3E4653' }}>
          {translations.unStandard.str148(len)}
        </span>{' '}
      </>
    ),
    okText: translations.submit,
    width: 560,
    content: (
      <TzFormDomm
        {...row}
        getFormInstance={(instance: any) => {
          formInstance = instance;
        }}
      />
    ),
    cancelText: translations.cancel,
    onOk() {
      return new Promise((resolve, reject) => {
        const p = formInstance?.validateFields();
        p.then((value: any) => {
          let postData =
            query || value.eventID instanceof Array
              ? eventProcessQuery(
                  Object.assign({}, value, {
                    query,
                    eventIDs: value['eventID'].filter((item: any) => !!item),
                    eventID: value['eventID'].filter((item: any) => !!item),
                  }),
                )
              : eventProcess(value);
          postData.subscribe((res: any) => {
            if (res.error) {
              reject();
            } else {
              resolve(res);
              callback();
            }
          });
        }, reject);
      });
    },
  });
};
export const getEventColumns = (callback: () => void, navigate: any) => {
  return [
    {
      title: translations.event_information,
      dataIndex: 'id',
      width: '35%',
      render(item: any, row: any) {
        return <TzTableTzTdInfo {...row} />;
      },
    },
    {
      title: translations.scanner_report_eventType,
      dataIndex: 'id',
      render(item: any, row: any) {
        return <TzTableTzTdType {...row} />;
      },
    },
    {
      title: translations.number_of_associated_alarms,
      dataIndex: 'id',
      width: '12%',
      render(item: any, row: any) {
        let o: any = {
          3: [0, 1, 2, 3].reduce((pre, item) => pre + (row?.signalsCount[item] || 0), 0),
          5: [4, 5].reduce((pre, item) => pre + (row?.signalsCount[item] || 0), 0),
          7: [6, 7].reduce((pre, item) => pre + (row?.signalsCount[item] || 0), 0),
        };
        let signalsCount = keys(o).reduce((pre: any, item) => {
          if (o[item]) {
            pre[item] = o[item];
          }
          return pre;
        }, {});
        let p = Object.assign(row, { signalsCount });
        return <TzTableTzTdWarn {...p} />;
      },
    },
    {
      title: translations.scanner_images_tag,
      dataIndex: 'id',
      width: '10%',
      render(item: any, row: any) {
        return <TzTableTzTdRules key={+new Date()} {...row} />;
      },
    },
    {
      title: translations.event_marker,
      dataIndex: 'id',
      render(item: any, row: any) {
        return <EvenMarkerDom {...row.process} process={row.process || {}} />;
      },
    },
    {
      title: translations.scanner_report_occurTime,
      dataIndex: 'updatedAt',
      width: '12%',
      render(item: any, row: any) {
        return (
          <div style={{ color: '#3E4653' }}>
            {moment(item).format('YYYY-MM-DD')}
            <br />
            {moment(item).format('HH:mm:ss')}
          </div>
        );
      },
    },
    {
      title: translations.operation,
      width: '8%',
      align: 'center',
      dataIndex: 'id',
      render(item: any, row: any) {
        const fn = () => {
          let disposalObjectList = row.resources
            .filter((item: { [x: string]: any }) => !!item['pod'])
            .map((item: any) => {
              return {
                label: item.pod.name,
                value: `${item.cluster.id}@${item.namespace.name}@${item.pod.name}`,
              };
            });
          dealOrder(row, disposalObjectList, (item: any) => {
            reloadFn();
            openDrawer(item.id);
          });
        };
        let node = row.resources.filter((item: { [x: string]: any }) => !!item['pod']);
        let allowWhitelist = getAllowWhitelist(row.ruleKeys.map((item: { categoryKey: any }) => item.categoryKey));
        let rules = (row.ruleKeys || []).reduce((pre: any, item: any) => {
          if (pre[item.categoryKey]) {
            pre[item.categoryKey] = [...pre[item.categoryKey], item.nameKey];
          } else {
            pre[item.categoryKey] = [item.nameKey];
          }
          return pre;
        }, {});
        let scopes = [row.scopes];
        let ids = [row.id];
        let items = [
          {
            label: translations.sign,
            key: '2',
          },
        ];
        if (allowWhitelist) {
          items.push({
            label: translations.increase_white_list,
            key: '1',
          });
        }
        if (node.length) {
          items.push({
            label: translations.management,
            key: '0',
          });
        }
        let handleMenuClick = async (e: { key: string }) => {
          if (e.key == '0') {
            fn();
          } else if (e.key == '1') {
            Store.policyDetail.next({
              scopes,
              rules,
              type: 'event',
              ids,
            });
            navigate(Routes.PalaceEventWhiteListDetail.replace('/:id', `/${'new'}`));
          } else if (e.key == '2') {
            addSignMark(row, () => {
              callback && callback();
            });
          }
        };
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <TzDropdown
              trigger={['hover', 'click']}
              menu={{
                items: items.sort((a: any, b: any) => {
                  return a.key - b.key;
                }),
                onClick: handleMenuClick,
              }}
              overlayClassName={'drop-down-menu'}
              destroyPopupOnHide={true}
              getPopupContainer={(triggerNode) => triggerNode}
            >
              <i className={'icon iconfont icon-gengduo1 f18 cabb'} style={{ padding: '10px 10px 4px 10px' }}></i>
            </TzDropdown>
          </div>
        );
      },
    },
  ] as ColumnsType<any>;
};

export type TFields = 'id' | 'ruleKey' | 'processStatus' | 'type' | 'severity';
export type TQuery = {
  [key in TFields]?: any;
} & {
  scope?: { [key in TSuggestName]?: any };
  updatedAt: {
    start: number;
    end: number;
  };
} & Record<string, any>;
export const severityFilters = optionsSeverity.map((item: any) => {
  item['text'] = item['label'];
  return item;
});

export const DEFAULT_RANGEPICKERP_ROPS: TzRangePickerProps = {
  allowClear: false,
  showTime: true,
  format: 'YYYY/MM/DD HH:mm:ss',
  ranges: {
    [translations.hours_24]: [moment().add(-24, 'h'), moment()],
    [translations.days_7]: [moment().add(-7, 'd'), moment()],
    [translations.days_30]: [moment().add(-30, 'd'), moment()],
  },
};

export type TPage = {
  offset: number;
  limit: number;
  token: string | undefined;
};
export const VALUE_TIME_DAY = 86400000;
export const getDEFAULT_PAGE_PARAM = () => {
  return { offset: 0, limit: 20, token: '' };
};
const getTimeSection = (end: number, start: number): string => {
  const d = floor((end - start) / VALUE_TIME_DAY, 2);
  return d != 1 ? `${d}` : '24';
};
export const EventDataChart = forwardRef((props: any, ref: any) => {
  const navigate = useNavigate();
  const { query = {}, onChangeFilters, filters } = props;
  const { start, end } = query.updatedAt;
  let [activeKey, setActiveKey] = useState(getTimeSection(end, start));
  let [totalInfo, setTotalInfo] = useState<any>({
    total: { title: translations.number_of_events, total: 0 },
    unProcessed: { title: translations.unprocessed, total: 0 },
    processed: { title: translations.processed, total: 0 },
    pendingProcessed: { title: translations.processed_later, total: 0 },
    omitted: { title: translations.ignored, total: 0 },
  });
  let [option, setOption] = useState<any>({});
  let myChart = useRef<any>();
  let fetchEventOverview = useRef<any>(null);

  useUpdateEffect(() => {
    setActiveKey(getTimeSection(end, start));
  }, [end, start]);
  let postEventOverview = useCallback(() => {
    fetchEventOverview?.current && fetchEventOverview.current.unsubscribe();
    fetchEventOverview.current = eventOverview({
      query,
      id: '',
      type: ['ruleScope'],
      statsType: 'eventOverview',
      payload: {
        groupKind: 'severity',
        getSummary: true,
        getTop: false,
        getTendency: true,
      },
    }).subscribe((res: any) => {
      let { summary = {}, tendency = [] } = res.getItem() || {};
      let newItems = tendency.map((item: any) => {
        let { group } = item;
        let highCount = [0, 1, 2, 3].reduce((pre, ite) => pre + (group[ite] ? group[ite].num : 0), 0);
        let mediumCount = [4, 5].reduce((pre, ite) => pre + (group[ite] ? group[ite].num : 0), 0);
        let lowCount = [6, 7].reduce((pre, ite) => pre + (group[ite] ? group[ite].num : 0), 0);
        item['group'] = {
          high: {
            label: translations.notificationCenter_columns_High,
            num: highCount,
          },
          medium: {
            label: translations.notificationCenter_columns_Medium,
            num: mediumCount,
          },
          low: {
            label: translations.notificationCenter_columns_Low,
            num: lowCount,
          },
        };
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
      let series = Object.keys(seriesKeys).map((item, index) => {
        let rgx = /^rgba\(((,?\s*\d+){3}).+$/;
        let { group } = newItems[0];
        return {
          id: item,
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
                  color: severityColor[item].replace(rgx, 'rgba($1, .1)'),
                },
                {
                  offset: 1,
                  color: severityColor[item].replace(rgx, 'rgba($1, 0)'),
                },
              ],
              global: false, // 缺省为 false
            },
            data: [[start]],
          },
          data: seriesKeys[item],
        };
      });
      setTotalInfo((pre: any) => {
        return Object.keys(pre).reduce((p: any, item) => {
          pre[item].total = summary[item];
          return pre;
        }, pre);
      });
      setOption({
        color: ['rgba(233,84,84,1)', 'rgba(255,138,52,1)', 'rgba(255,196,35,1)'],
        legend: {
          data: [
            { name: translations.notificationCenter_columns_High },
            { name: translations.notificationCenter_columns_Medium },
            { name: translations.notificationCenter_columns_Low },
          ],
        },
        xAxis: {
          axisLabel: {
            formatter: function (value: string) {
              const d = end - start;
              let str = 'MM/DD';
              if (d < 60 * 1000) {
                str = 'MM/DD HH:mm:ss';
              } else if (d < VALUE_TIME_DAY) {
                str = 'MM/DD HH:mm';
              } else if (d < VALUE_TIME_DAY * 3) {
                str = 'MM/DD HH:mm';
              } else if (d < VALUE_TIME_DAY * 30) {
                str = 'MM/DD';
              }
              return moment(value).format(str);
            },
          },
        },
        series,
      });
    });
  }, [query]);

  useEffect(() => {
    postEventOverview();
  }, [postEventOverview]);
  useImperativeHandle(ref, () => {
    return {
      refreshData() {
        postEventOverview();
      },
    };
  }, [query]);

  const rangePickerProps = useMemo(
    (): TzRangePickerProps => ({
      ...DEFAULT_RANGEPICKERP_ROPS,
      onChange: (e: any) => {
        const end = moment(e[1]).valueOf();
        const start = moment(e[0]).valueOf();
        setActiveKey(getTimeSection(end, start));
        Store.eventsCenter.next({ timer: +end });
        onChangeFilters({
          updatedAt: e,
        });
      },
    }),
    [onChangeFilters],
  );

  return (
    <div style={{ position: 'relative' }} className={'plr32 see-event-detail-content'}>
      <div className={'flex-r mb8'} style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className={'flex-c'} style={{ flex: 1, alignItems: 'flex-start' }}>
          <PageTitle
            className={'mb12 f16'}
            title={<span style={{ display: 'inline-block' }}>{translations.originalWarning_eventOverview}</span>}
          />
          <ul className={'flex-r ml16'}>
            {Object.keys(totalInfo).map((item, index) => {
              let { total = 0, title = '' } = totalInfo[item];
              return (
                <li className={'mr55'} key={index}>
                  <div className={'event-overview-number t-c'}> {total} </div>
                  <div className={'t-c f12'} style={{ color: '#8E97A3' }}>
                    {title}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
        <div className={'flex-c'} style={{ alignItems: 'flex-end' }}>
          <TzTabsNormal
            activeKey={activeKey}
            onChange={(_key) => {
              const end = moment().valueOf();
              Store.eventsCenter.next({ timer: +end });
              setActiveKey(_key);
              onChangeFilters({
                updatedAt: [moment().add(-parseInt(_key), _key == '24' ? 'h' : 'd'), moment()],
              });
            }}
            className="tabs-nav-mb0 tabs-nav-border0 f14 mb8"
            style={{ padding: '0px', fontWeight: 400, display: 'inline-block' }}
            tabpanes={[
              {
                tab: translations.hours_24,
                tabKey: '24',
              },
              {
                tab: translations.days_7,
                tabKey: '7',
              },
              {
                tab: translations.days_30,
                tabKey: '30',
              },
            ]}
          />
          <TzRangePicker style={{ width: '360px' }} {...rangePickerProps} value={[moment(start), moment(end)]} />
        </div>
      </div>
      <div style={{ height: '245px' }}>
        <EventChart
          data={option}
          finished={(chart: any) => {
            myChart.current = chart;
            chart.dispatchAction({
              type: 'takeGlobalCursor',
              key: 'dataZoomSelect',
              // 启动或关闭
              dataZoomSelectActive: true,
            });
          }}
          refresh={(time: any) => {
            setActiveKey('0');
            onChangeFilters({ updatedAt: time });
          }}
        />
      </div>
      <div
        className={`see-event-detail ${localLang}`}
        onClick={() => {
          Store.eventoverview.next(filters);
          navigate(Routes.EventOverviewDetails);
        }}
      >
        {translations.see_details}
      </div>
    </div>
  );
});

export const transValues = (data: any, formType?: string) => {
  const temp: TQuery = { updatedAt: { start: 0, end: 0 } };
  const values = cloneDeep(data);
  keys(values).forEach((key) => {
    let _val = values[key];
    if (valueIsNull(_val)) {
      return;
    }
    if (selectType.some((v) => v.value === key)) {
      if (key === 'cluster') {
        _val = _val.map((item: any) => last(item.split('_')));
      }
      set(temp, ['scope', key], _val);
      return;
    }
    if (key === 'ruleKey') {
      let rk = _val.map((item: any[]) => item.join('/'));
      set(temp, [key], rk.length ? rk : formType === 'kubeMonitor' ? ['kubeMonitor'] : []);
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
    if (key === 'updatedAt') {
      set(temp, [key], {
        start: moment(_val[0]).valueOf(),
        end: moment(_val[1]).valueOf(),
      });
      return;
    }
    set(temp, [key], _val);
  });
  return temp;
};
export const getOptValue = (options: TzSelectProps['options'], initVal: any) =>
  options?.length
    ? options
        .filter((v) => initVal?.includes(v.value))
        .map((v) => v.label)
        .join(' , ')
    : undefined;

const EventData = (props: any) => {
  let { formType = '' } = props;
  const navigate = useNavigate();
  const [result] = useSearchParams();
  let [optionsRules, setOptionsRules] = useState([]);
  let [showPageFooter, setShowPageFooter] = useState(false);
  let [selectedRowKeys, setSelectedRowKeys] = useState<any>([]);
  const initData = useMemo(() => {
    return {
      updatedAt: [moment().add(-24, 'h'), moment()],
      ...props.filters,
      ...(result.get('resource')
        ? {
            cluster: result.getAll('cluster'),
            namespace: result.getAll('namespace'),
            resource: result.getAll('resource'),
            ruleKey: result.get('ruleKey')
              ? result.get('ruleKey') === 'ATT'
                ? [['ATT&CK']]
                : result
                    .get('ruleKey')
                    ?.split(',')
                    .map((item) => {
                      return [item];
                    })
              : [],
            severity: result.getAll('severity') ?? [],
            updatedAt: [moment().add(-7, 'd'), moment()],
          }
        : {}),
    };
  }, [JSON.stringify(props.filters)]);

  const filterOriginValues = useRef(initData);
  const [query, setQuery] = useState<TQuery>(() => transValues(initData, formType));
  let eventDataChartRef = useRef<any>();
  let getFetchData = useCallback(
    (token: string | undefined, limit: number): Promise<Result> => {
      return new Promise((resolve) => {
        let data = {
          query: merge({ ruleKey: formType === 'kubeMonitor' ? ['kubeMonitor'] : [] }, query),
          sort: {
            field: 'updatedAt',
            order: 'desc',
          },
          page: { limit, token },
        };
        getEventsCenter(data).subscribe((res) => {
          let list = res.getItems();
          let nextId = res.data?.pageToken;
          resolve({
            list,
            nextId: list.length < limit ? undefined : nextId,
          });
        });
      });
    },
    [query],
  );

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
          return formType
            ? item['key'] == formType
            : !['apparmor', 'imageSecurity', 'seccompProfile', 'kubeMonitor'].includes(item['key']);
        }),
      );
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
  }, [suggestOptions, optionsRules]);

  const dataFilter = useTzFilter({
    initial: EventDataFilter,
    initialValues: initData,
  });

  useUpdateEffect(() => {
    dataFilter.updateFilter({
      formItems: EventDataFilter,
      formValues: initData,
      formEnumLabels: initialEnumLabels,
    });
  }, [optionsRules, scopeFilterItems, initialEnumLabels, initData]);

  const handleChange = useCallback(
    (values: any) => {
      filterOriginValues.current = values;
      const _values = transValues(values, formType);
      setQuery((prev) => (isEqual(_values, prev) ? prev : _values));
    },
    [formType],
  );
  const onChangeFilters = useMemoizedFn((vals) => dataFilter.updateFormItemValue(vals));
  const ref = useRef<HTMLDivElement>(null);
  const { data, loading, noMore, reload } = useInfiniteScroll((d) => getFetchData(d?.nextId, 20), {
    target: ref,
    manual: true,
    isNoMore: (d) => d?.nextId === undefined,
  });
  useEffect(() => {
    reload();
    reloadFn = reload;
  }, [query]);
  const { height: hs } = useSize($('.layout-main-container>.tz-header')[0]) || { height: 0 };
  return (
    <div id={'eventDataContent'} style={{ height: `calc(100vh - ${hs}px)`, overflow: 'auto' }} ref={ref}>
      {formType !== 'kubeMonitor' ? (
        <div className={'mt24'}>
          <EventDataChart
            query={query}
            setQuery={setQuery}
            onChangeFilters={onChangeFilters}
            ref={eventDataChartRef}
            filters={filterOriginValues.current}
          />
        </div>
      ) : null}
      <div className="event-case">
        <div className="mt4 mb12 palace-toolbar">
          <FilterContext.Provider value={{ ...dataFilter }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <TzSpace size={16}>
                {formType ? null : (
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
                )}
                {showPageFooter ? (
                  <></>
                ) : (
                  <TzButton
                    onClick={() => {
                      eventCount({ query }).subscribe((res) => {
                        if (res.error) return;
                        let { count } = res.getItem();
                        let arr = new Array(count);
                        addSignMark({ id: arr, query }, () => {
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
          dataSource={data?.list}
          pagination={false}
          sticky={true}
          onRow={(record) => {
            return {
              onClick: (event) => {
                event.stopPropagation();
                let url = Routes.PalaceEventCenterId.replace('/:id', `/${record.id}`);
                if (formType === 'kubeMonitor') {
                  url = url + `?formType=kubeMonitor`;
                }
                navigate(url);
              },
            };
          }}
          rowKey={'id'}
          columns={getEventColumns(reload, navigate)}
          footer={() => {
            return <TableScrollFooter isData={!!data?.list?.length} noMore={noMore} />;
          }}
        />
      </div>
    </div>
  );
};

export default EventData;
