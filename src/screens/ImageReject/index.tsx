import { TablePaginationConfig } from 'antd';
import moment from 'moment';
import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { map } from 'rxjs/operators';
import { TzButton } from '../../components/tz-button';
import { TzMessageSuccess } from '../../components/tz-mesage';
import { TzConfirm } from '../../components/tz-modal';
import { TzProgress } from '../../components/tz-progress';
import { TzTableServerPage } from '../../components/tz-table';
import {
  deployBlockTrend,
  deployReasonTop5,
  deployRecord,
  deploywhiteImage,
  imagerejectOverview,
  putDeployWhiteImage,
} from '../../services/DataService';
import { localLang, translations } from '../../translations/translations';
import './index.scss';
import NoData from '../../components/noData/noData';

import { Histogram, PageTitle } from '../ImagesScanner/ImagesCI/CI';
import { useLocation, useNavigate } from 'react-router-dom';
import { Routes } from '../../Routes';
import { RenderTag, TzTag } from '../../components/tz-tag';
import { tabType } from '../ImagesScanner/ImagesScannerScreen';
import { TzFilter, TzFilterForm } from '../../components/ComponentsLibrary';
import useTzFilter, { FilterContext } from '../../components/ComponentsLibrary/TzFilter/useTzFilter';
import { FilterFormParam } from '../../components/ComponentsLibrary/TzFilterForm/filterInterface';
import { Store } from '../../services/StoreService';
import { cloneDeep, concat, filter, find, isArray, isEqual, keys, merge, set, uniq, values } from 'lodash';
import { getUserInformation } from '../../services/AccountService';
import { getTime } from '../../helpers/until';
import { TextHoverCopy } from '../AlertCenter/AlertCenterScreen';
import { TzTabsNormal } from '../../components/tz-tabs';
import EventChart from '../AlertCenter/Chart';
import { WhiteListTag } from '../ImagesScanner/LifeCycle';
import { configTypeEnum } from '../ImagesScanner/ImageConfig/ImageScanConfig';
import { useAssetsClusterList, useViewConst } from '../../helpers/use_fun';
import { TzForm, TzFormItem } from '../../components/tz-form';
import { TzInput } from '../../components/tz-input';
import Form, { FormInstance } from 'antd/lib/form';
import { TzDatePickerCT } from '../../components/tz-range-picker';
import TzSelectTag from '../../components/ComponentsLibrary/TzSelectTag';
import { TzDatePicker } from '../../components/tz-date-picker';
import { TzInputNumber } from '../../components/tz-input-number';
import { useDetectPolicyList } from '../../services/ServiceHook';
import {
  SecurityIssueTd,
  deploySelectQuesOp,
  imageSeverityOp,
  registrySelectQuesOp,
} from '../ImagesScanner/components/ImagesScannerDataList';
import { useNavigatereFresh } from '../../helpers/useNavigatereFresh';
import { getType } from '../ImagesScanner/components/Image-scanner-overview/ImagesScannerOverview';
import EllipsisPopover from '../../components/ellipsisPopover/ellipsisPopover';
import { ScaleLine, getMax } from '../DeflectDefense/component/Top5';

const RejectTop5 = (props: any) => {
  const [data, setReasonTop5] = useState<any>([]);
  const reqFunTop5 = useCallback(() => {
    deployReasonTop5({}).subscribe((res) => {
      let data = res.getItems().sort((a: any, b: any) => b.count - a.count);
      let bg = ['#A84242', '#E05E5F', '#F58531', '#F8BF23', '#2177D1'];
      let obj: any = getType(tabType.deploy);
      data.forEach((item: any) => {
        item['reason'] = obj[item.reason];
        item['fillColor'] = bg.shift();
      });
      setReasonTop5(data);
    });
  }, []);
  useEffect(() => {
    reqFunTop5();
  }, []);
  const { progressItems, maxCount } = useMemo(() => {
    let maxCount = Math.max(...data?.map((item: any) => item.count || 0), 0);
    maxCount = getMax(maxCount);
    let dom = data?.length ? (
      data?.map((item: any) => {
        const count = item.count || 0;
        const percent = maxCount === 0 ? 0 : (count * 100) / maxCount;
        const title = item.reason;
        return (
          <>
            <div className="top5_item_title flex-r-c" style={{ width: '100%' }}>
              {title}
              <span style={{ color: item?.fillColor }}>{count}</span>
            </div>
            <TzProgress
              key={title}
              percent={percent}
              strokeColor={item?.fillColor || { from: '#89DAF6', to: '#3FADF6' }}
              format={() => {
                return count;
              }}
              showInfo={false}
              success={{ percent: -1 }}
              className="top5_item_bar"
            />
          </>
        );
      })
    ) : (
      <NoData />
    );
    return { progressItems: dom, maxCount };
  }, [data]);
  return (
    <div className="reject_top5_box">
      <PageTitle title={translations.imageReject_top5_title} className="mb12 f14" />
      <div className="reject_top5">{progressItems}</div>
      <ScaleLine max={maxCount} />
    </div>
  );
};

const RejectCount = (props: any) => {
  const [trend, setTrend] = useState<any>({ day7: 23, day30: 23, hour24: 23 });
  let dataList: any = {
    hour24: translations.imageReject_detail_count_24h,
    day7: translations.imageReject_detail_count_7d,
    day30: translations.imageReject_detail_count_30d,
  };
  const deployBlockTrendFn = () => {
    deployBlockTrend().subscribe((res) => {
      setTrend(res.getItem());
    });
  };
  useEffect(() => {
    deployBlockTrendFn();
  }, []);
  return (
    <div className="reject_count mb24">
      <PageTitle title={translations.imageReject_detail_count_title} className="mb16" />
      <div className="flex-r-c" style={{ justifyContent: 'space-around' }}>
        {keys(dataList).map((item: any, index) => {
          return (
            <div key={index}>
              <div className="count_txt fim family-s">{trend?.[item] || '-'}</div>
              <div className="count_title">
                <span>{dataList[item]}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const duringList = [
  {
    tab: translations.hours_24,
    tabKey: 'hour24',
    children: null,
  },
  {
    tab: translations.days_7,
    tabKey: 'day7',
    children: null,
  },

  {
    tab: translations.days_30,
    tabKey: 'day30',
    children: null,
  },
];
let axisLabel = function (during: string, value: string | undefined) {
  let str = 'MM/DD';
  if (during === 'hour24') {
    str = 'H:mm';
  } else if ('day7' === during) {
    str = 'M-DD';
  } else if ('day30' === during) {
    str = 'M-DD';
  }
  return moment(value).format(str);
};
const RejectGraph = (props: any) => {
  let [data, setData] = useState<any>([]);
  let [option, setOption] = useState<any>({});
  let [during, setDuring] = useState<any>();
  useEffect(() => {
    if (!data?.length) return;
    let severityColor: any = {
      total: {
        yAxisLabel: translations.number_of_detections,
        color: 'rgba(33, 119, 209, 1)',
      },
      alarm: {
        yAxisLabel: translations.number_of_alarms,
        color: 'rgba(255, 196, 35, 1)',
      },
      block: {
        yAxisLabel: translations.number_of_blocks,
        color: 'rgba(233, 84, 84, 1)',
      },
    };
    let seriesKeys: any = data.reduce((pre: any, item: any) => {
      keys(item.group).forEach((ite) => {
        if (isArray(pre[ite])) {
          pre[ite].push([item.timeAt, item.group[ite]]);
        } else {
          pre[ite] = [[item.timeAt, item.group[ite]]];
        }
      });
      if (isArray(pre['total'])) {
        pre['total'].push([item.timeAt, item.total]);
      } else {
        pre['total'] = [[item.timeAt, item.total]];
      }
      return pre;
    }, {});
    let series = keys(severityColor).map((item, index) => {
      let rgx = /^rgba\(((,?\s*\d+){3}).+$/;
      let { yAxisLabel, color } = severityColor[item];
      return {
        id: item,
        name: yAxisLabel,
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
                color: color.replace(rgx, 'rgba($1, .1)'),
              },
              {
                offset: 1,
                color: color.replace(rgx, 'rgba($1, 0)'),
              },
            ],
            global: false, // 缺省为 false
          },
          //data: [[start]],
        },
        data: seriesKeys[item],
      };
    });
    setOption({
      color: values(severityColor).map((item) => item.color),
      tooltip: {
        className: 'echart-tooltip',
        trigger: 'axis',
        formatter: function (params: any) {
          let str = '',
            title;
          params.forEach((item: any) => {
            title = item.value[0];
            str += `<div class='echart-tooltip-item'><span class='marker'>${item.marker}</span><span class='seriesName'>${item.seriesName} <span class='f-r num'>${item.value[1]}</span></span></div>`;
          }, 0);
          return `<div class='echart-tooltip-content'>
              <div class='echart-tooltip-title'>${axisLabel(during, title)}</div>
              ${str}
            </div>`;
        },
      },
      legend: {
        data: values(severityColor).map((item) => ({ name: item.yAxisLabel })),
      },
      xAxis: {
        axisLabel: {
          formatter: (value: string) => axisLabel(during, value),
        },
      },
      series,
    });
  }, [data]);
  const reqFun = useCallback((during: string) => {
    setDuring(during);
    imagerejectOverview({ graph: during }).subscribe((res) => {
      let data = res.getItems();
      setData(data);
    });
  }, []);
  useEffect(() => {
    reqFun('hour24');
  }, []);
  return (
    <>
      <PageTitle
        className="mb12"
        title={translations.scan_trend_chart}
        extra={
          <TzTabsNormal
            className="tabs-nav-mb0 tabs-nav-border0 f14"
            style={{ padding: '0px', fontWeight: 400, display: 'inline-block' }}
            tabpanes={duringList}
            onChange={(val) => {
              reqFun(val);
              setDuring(val);
            }}
          />
        }
      />
      <div style={{ height: 340 }}>
        <EventChart showTooltipTotal={false} data={option} />
      </div>
    </>
  );
};

export const OverView = () => {
  return (
    <div className="reject_overview flex-r">
      <div className="reject_overview_left" style={{ flex: 1, width: 0, height: '100%' }}>
        <RejectGraph />
      </div>
      <div className="reject_overview_right" style={{ width: '48%' }}>
        <div className="reject-divide-line"></div>
        <RejectCount />
        <RejectTop5 />
      </div>
    </div>
  );
};
let WhiteListDom = (props: { formInstance?: (reg: any) => void; setFormInstance?: any; param?: any }) => {
  let { setFormInstance, param = undefined } = props;
  const [formInstance] = Form.useForm();
  useEffect(() => {
    param['expirationAt'] && (param['expirationAt'] = moment(param['expirationAt']));
    param['creator'] = getUserInformation().username;
    param['updater'] = getUserInformation().username;
    formInstance.setFieldsValue(param);
    setFormInstance(formInstance);
    return () => {
      formInstance.resetFields();
    };
  }, []);
  let imageName = Form.useWatch('imageName', formInstance);
  return (
    <TzForm form={formInstance} validateTrigger={'onChange'}>
      <TzFormItem name="id" hidden>
        <TzInputNumber />
      </TzFormItem>
      {param.type !== 'edit' ? (
        <TzFormItem name="creator" hidden>
          <TzInput />
        </TzFormItem>
      ) : (
        <TzFormItem name="updater" hidden>
          <TzInput />
        </TzFormItem>
      )}
      <TzFormItem
        name="imageName"
        label={translations.image}
        rules={[
          {
            required: true,
            message: `${translations.image_not_empty}`,
          },
        ]}
        style={{ marginBottom: '24px' }}
        extra={param.type === 'newAdd' ? translations.unStandard.str277 : null}
      >
        {param.type === 'newAdd' ? (
          <TzSelectTag placeholder={translations.please_enter_the_image} />
        ) : (
          imageName?.map(
            (item: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal | null | undefined) => {
              return (
                <TzTag style={{ maxWidth: '100%' }}>
                  <EllipsisPopover className="f-l">{item}</EllipsisPopover>
                </TzTag>
              );
            },
          )
        )}
      </TzFormItem>
      <TzFormItem
        name="expirationAt"
        label={translations.expiry_date}
        rules={[
          {
            required: true,
            message: `${translations.unStandard.str51}`,
          },
        ]}
      >
        <TzDatePicker
          placeholder={translations.unStandard.str51}
          allowClear
          showTime
          disabledDate={(time) => {
            return moment(moment().format('YYYY-MM-DD')).valueOf() > moment(time).valueOf();
          }}
        />
      </TzFormItem>
    </TzForm>
  );
};
export const setWhiteList = (props: any, callback?: () => void) => {
  let { type, ...otherData } = props;
  let formInstance: FormInstance;
  TzConfirm({
    width: '560px',
    title:
      type === 'edit'
        ? translations.edit_white_list
        : type === 'newAdd'
          ? translations.add_white_list
          : translations.increase_white_list,
    okText: type === 'edit' ? translations.save : translations.newAdd,
    content: (
      <WhiteListDom
        setFormInstance={(form: FormInstance<any>) => {
          formInstance = form;
        }}
        param={props}
      />
    ),
    onOk() {
      return new Promise((resolve, reject) => {
        formInstance
          .validateFields()
          .then((value) => {
            value['expirationAt'] = moment(value.expirationAt).valueOf();
            let fn = value.id ? putDeployWhiteImage : deploywhiteImage;
            fn(value).subscribe((res) => {
              if (res.error) {
                reject();
              } else {
                resolve(res);
                callback && callback();
                TzMessageSuccess(
                  type === 'edit'
                    ? translations.white_list_edited_successfully
                    : translations.white_list_added_successfully,
                );
              }
              if (res.error) return;
            });
          })
          .catch(() => {
            reject();
          });
      });
    },
  });
};
let DeployImageInfoTd = (props: {
  [x: string]: any;
  registryName?: any;
  timeLabel?: string;
  imageFromType?: tabType;
}) => {
  let { imageFromType } = props;
  let name = `${props.fullRepoName}:${props.tag}`;
  let str = `${translations.scanner_config_repoAddr}：${props.registryUrl}`;
  let white = props.white;
  return (
    <>
      <WhiteListTag flag={white} />
      <p>
        <div className={'flex-r-c'} style={{ justifyContent: 'flex-start' }}>
          <div style={{ maxWidth: '80%' }} className="f16">
            <TextHoverCopy text={name} lineClamp={2} style={{ lineHeight: '24px' }} />
          </div>
        </div>
      </p>
      <p>
        <TzTag className={'ant-tag-gray small mt8 mb8'}>{`${str}`}</TzTag>
      </p>
      <p
        className="f14"
        style={{
          color: '#8E97A3',
        }}
      >
        {imageFromType === tabType.deploy ? translations.detection_time : translations.scanningTime}：
        {getTime(props.createdAt)}
      </p>
    </>
  );
};
const ListTable = () => {
  let imageFromType = tabType.deploy;
  const navigate = useNavigate();
  const [filters, setFilters] = useState<any>({});
  let [showPageFooter, setShowPageFooter] = useState(false);
  let [selectedRowKeys, setSelectedRowKeys] = useState<any>([]);
  const reqFun = useCallback(
    (pagination: TablePaginationConfig) => {
      const { current = 1, pageSize = 10 } = pagination;
      const offset = (current - 1) * pageSize;
      let { updatedAt, ...otherfilters } = filters;
      const pageParams = {
        offset,
        limit: pageSize,
        ...otherfilters,
        ...updatedAt,
      };

      return deployRecord(pageParams).pipe(
        map((res) => {
          let items = res.getItems();
          return {
            data: items,
            total: res.data?.totalItems,
          };
        }),
      );
    },
    [filters],
  );
  const listComp = useRef(undefined as any);
  let deployAction = useViewConst({ constType: 'deployAction' });
  const imageColumns = useMemo(() => {
    return [
      {
        title: translations.microseg_namespace_baseInfo,
        dataIndex: 'fullRepoName',
        className: 'task-name',
        ellipsis: { showTitle: false },
        render: (description: any, row: any) => {
          return <DeployImageInfoTd {...row} imageFromType={tabType.deploy} />;
        },
      },
      {
        title: translations.vulnerability_statistics,
        width: '18%',
        dataIndex: 'vulnStatic',
        render: (vulnStatic: any) => {
          return <Histogram severityHistogram={vulnStatic} />;
        },
      },
      {
        title: translations.compliances_breakdown_dotstatus,
        dataIndex: 'action',
        width: '9%',
        align: 'center',
        render: (action: any, row: any) => {
          let node = find(deployAction, (item) => item.value === action);
          return (
            <RenderTag
              type={node?.value === 'block' ? 'policyblock' : node?.value === 'alarm' ? 'policyalert' : 'pass'}
            />
          );
        },
      },
      {
        title: translations.safetyProblem,
        dataIndex: 'securityIssue',
        width: '17%',
        render: (securityIssue: any, row: any) => {
          return <SecurityIssueTd securityIssue={securityIssue} imageFromType={imageFromType} />;
        },
      },
      {
        title: translations.hitPolicy,
        width: '12%',
        dataIndex: 'riskPolicy',
        render: (riskPolicy: any, row: any) => {
          return riskPolicy?.length ? (
            <EllipsisPopover lineClamp={2}>
              {riskPolicy.map((item: { name: any }) => item.name).join(' , ')}
            </EllipsisPopover>
          ) : (
            '-'
          );
        },
      },
      {
        title: translations.operation,
        width: '140px',
        render: (description: any, row: any) => {
          return !row.inWhite ? (
            <TzButton
              className="ml-8"
              type={'text'}
              onClick={(event) => {
                event.stopPropagation();
                setWhiteList({ type: 'add', imageName: [rowKey(row).split('_').pop()] }, () => {
                  listComp.current.refresh();
                });
              }}
            >
              {translations.increase_white_list}
            </TzButton>
          ) : (
            '-'
          );
        },
      },
    ];
  }, [deployAction]);
  let detectPolicyList = useDetectPolicyList(configTypeEnum.deploy);

  const imagesScannerScreenFilter: FilterFormParam[] = useMemo(
    () => [
      {
        label: translations.scanner_images_imageName,
        name: 'imageKeyword',
        type: 'input',
        icon: 'icon-jingxiang',
      },
      {
        label: translations.scanner_config_repoAddr,
        name: 'registryKeyword',
        type: 'input',
        icon: 'icon-cangku',
      },
      {
        label: translations.safetyProblem,
        name: 'securityIssue',
        type: 'select',
        icon: 'icon-wenti',
        props: {
          mode: 'multiple',
          options: deploySelectQuesOp,
        },
        condition: {
          name: 'issueIntersection',
          props: {
            optionLabelProp: 'optionLabel',
            options: [
              {
                value: 'or',
                optionLabel: <span>&cup;</span>,
                label: (
                  <>
                    <span className="mr8 fw550 f15">&cup;</span>
                    {translations.union}
                  </>
                ),
              },
              {
                value: 'and',
                optionLabel: <span>&cap;</span>,
                label: (
                  <>
                    <span className="mr8 fw550 f15">&cap;</span>
                    {translations.intersection}
                  </>
                ),
              },
            ],
          },
        },
      },
      {
        label: translations.hitPolicy,
        name: 'policyUniqueID',
        type: 'select',
        icon: 'icon-xiangyingzhuangtai',
        props: {
          mode: 'multiple',
          options: detectPolicyList,
        },
        condition: {
          name: 'policyIntersection',
          props: {
            optionLabelProp: 'optionLabel',
            options: [
              {
                value: 'or',
                optionLabel: <span>&cup;</span>,
                label: (
                  <>
                    <span className="mr8 fw550 f15">&cup;</span>
                    {translations.union}
                  </>
                ),
              },
              {
                value: 'and',
                optionLabel: <span>&cap;</span>,
                label: (
                  <>
                    <span className="mr8 fw550 f15">&cap;</span>
                    {translations.intersection}
                  </>
                ),
              },
            ],
          },
        },
      },
      {
        label: translations.vulnerability_statistics,
        name: 'vulnStatic',
        type: 'select',
        icon: 'icon-chengdu',
        props: {
          options: imageSeverityOp,
          mode: 'multiple',
        },
      },
      {
        label: translations.compliances_node_status,
        name: 'deployAction',
        type: 'select',
        icon: 'icon-saomiaozhuangtai',
        props: {
          mode: 'multiple',
          options: deployAction,
        },
      },
      {
        label: translations.detection_time,
        name: 'scan_time',
        type: 'rangePickerCt',
        icon: 'icon-shijian',
        props: {
          showTime: true,
          format: 'YYYY/MM/DD HH:mm:ss',
        },
      },
    ],
    [deployAction, detectPolicyList],
  );
  const data = useTzFilter({ initial: imagesScannerScreenFilter });
  const handleChange = useCallback((values: any) => {
    const temp = {};
    keys(values).forEach((key) => {
      let _val = cloneDeep(values[key]);
      if (key === 'scan_time') {
        _val[0] && set(temp, 'updatedAt.startTime', _val[0].valueOf());
        _val[1] && set(temp, 'updatedAt.endTime', _val[1].valueOf());
        return;
      }
      set(temp, [key], _val);
    });
    setFilters(temp);
  }, []);
  let handleRowSelection = (selected: boolean, selectedRows: any[]) => {
    setSelectedRowKeys((pre: any) => {
      selectedRows.forEach((item: any) => {
        if (selected) {
          pre.push(`${item.id}_${item.imageName}`);
        } else {
          pre.remove(`${item.id}_${item.imageName}`);
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
  let setFooter = useCallback(() => {
    Store.pageFooter.next(
      showPageFooter ? (
        <div>
          <span className="mr16 ml16">{`${translations.selected} ${selectedRowKeys.length} ${translations.items}`}</span>
          <TzButton
            onClick={(event) => {
              event.stopPropagation();
              setWhiteList(
                {
                  type: 'add',
                  imageName: uniq(
                    selectedRowKeys.map((ite: string) => {
                      return ite.split('_').pop();
                    }),
                  ),
                },
                () => {
                  listComp.current.refresh();
                  setShowPageFooter((pre) => {
                    if (!pre) {
                      setSelectedRowKeys([]);
                    }
                    return !pre;
                  });
                },
              );
            }}
          >
            {translations.increase_white_list}
          </TzButton>
        </div>
      ) : null,
    );
  }, [showPageFooter, selectedRowKeys, l]);
  useEffect(() => {
    setFooter();
  }, [setFooter]);
  const rowKey = useCallback((item) => {
    return `${item.id}_${item.imageName}`;
  }, []);
  let { jump } = useNavigatereFresh();
  return (
    <>
      <PageTitle
        title={translations.mirror_scan_record}
        className="mb16 f16"
        extra={
          <>
            <TzButton
              onClick={() => {
                navigate(Routes.imageRejectWhiteList);
              }}
              icon={<i className={'icon iconfont icon-jianceguize'}></i>}
            >
              {translations.white_list}
            </TzButton>
            <TzButton
              onClick={() => {
                jump(
                  `${Routes.imageRejectPolicyManagement}?imageFromType=${imageFromType}`,
                  'imageRejectPolicyManagement',
                );
              }}
              className={'ml16'}
              icon={<i className={'icon iconfont icon-jingxiangsaomiao-peizhi'}></i>}
            >
              {translations.policy_management}
            </TzButton>
          </>
        }
      />
      <div className="mb12 mt16">
        <FilterContext.Provider value={{ ...data }}>
          <div className={'flex-r-c'}>
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
            <TzFilter />
          </div>
          <TzFilterForm onChange={handleChange} />
        </FilterContext.Provider>
      </div>

      <TzTableServerPage
        rowSelection={rowSelection}
        columns={imageColumns as any}
        rowKey={rowKey}
        reqFun={reqFun}
        ref={listComp}
        onRow={(record) => {
          return {
            onClick: () => {
              jump(`${Routes.DeployImageInfo}?deployRecordID=${record.id}`, 'DeployImageInfo');
            },
          };
        }}
      />
    </>
  );
};

const ImageReject = () => {
  return (
    <>
      <div className="mb24">
        <OverView />
      </div>
      <ListTable />
    </>
  );
};

export default ImageReject;
