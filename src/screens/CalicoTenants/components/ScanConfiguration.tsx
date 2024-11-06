import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cronjob, getPolicies, getScapCronjob } from '../../../services/DataService';
import { map } from 'rxjs/internal/operators/map';
import moment from 'moment';
import { Form, TablePaginationConfig } from 'antd';
import { DealData } from '../../AlertCenter/AlertRulersScreens';
import { localLang, translations } from '../../../translations/translations';
import { SupportedLangauges, WebResponse } from '../../../definitions';
import { TzForm, TzFormItem } from '../../../components/tz-form';
import { TzInput } from '../../../components/tz-input';
import { TzSwitch } from '../../../components/tz-switch';
import { TzSelect } from '../../../components/tz-select';
import { TzCol, TzRow } from '../../../components/tz-row-col';
import { TzTimePicker } from '../../../components/ComponentsLibrary';
import { TzCascaderClusterNode } from '../../../components/ComponentsLibrary/TzCascader';
import ArtTemplateDataInfo from '../../../components/ComponentsLibrary/ArtTemplateDataInfo';
import { PageTitle } from '../../ImagesScanner/ImagesCI/CI';
import { TzTableServerPage } from '../../../components/tz-table';
import { RenderTag, TzTag } from '../../../components/tz-tag';
import EllipsisPopover from '../../../components/ellipsisPopover/ellipsisPopover';
import {
  monthDay,
  week,
  yearDay,
} from '../../MultiClusterRiskExplorer/ListComponent/NodeMirroringConfig';
import { tap } from 'rxjs/internal/operators/tap';

const isZh = localLang === SupportedLangauges.Chinese;
export const TIME_FORMAT = 'HH:mm:ss';
let getTimeFormat = (type: any) => {
  let obj: any = {
    '1': {
      type: TIME_FORMAT,
      format: TIME_FORMAT,
    },
    '2': {
      type: TIME_FORMAT,
      format: TIME_FORMAT,
    },
    '3': {
      type: `d/${TIME_FORMAT}`,
      format: isZh ? `每周dd ${TIME_FORMAT}` : `dd,${TIME_FORMAT}`,
      lang: isZh ? '' : 'pre week',
    },
    '4': {
      type: `DD/${TIME_FORMAT}`,
      format: isZh ? `每月D日 ${TIME_FORMAT}` : `Do,${TIME_FORMAT}`,
      lang: isZh ? '' : 'per month',
    },
    '5': {
      type: `MM/DD/${TIME_FORMAT}`,
      format: isZh ? `每年M月D号 ${TIME_FORMAT}` : `MMMM Do,${TIME_FORMAT}`,
      lang: isZh ? '' : 'per year',
    },
  };
  return obj[type];
};
const ScanConfiguration = ({ query, formSecretKey, edit, setEdit }: any) => {
  const [dataConfig, setDataConfig] = useState<any>();
  const [scanningStrategyList, setScanningStrategyList] = useState<any>([]);
  const listComp = useRef(undefined as any);
  const clusterInfoMap = useRef();
  const getDataInfo = useCallback(() => {
    getScapCronjob(query)
      .pipe(
        map((res: any) => {
          let item = res.getItem();
          if (!item) return;
          let index = item.cron ? item.cron.time.lastIndexOf('/') : 0;
          if (!item.clusterInfo) return;
          const culsterInfoData = item.clusterInfo?.reduce(
            (pre: any, ite: any) => {
              let arr = [];
              let names: any = {};
              if (ite.nodes) {
                ite.nodes.forEach((it: any) => {
                  arr.push([ite.clusterKey, it]);
                });
                ite.nodeName?.forEach((it: any, idx: number) => {
                  names[ite.nodes[idx]] = it;
                });
              } else {
                arr.push([ite.clusterKey]);
                names[ite.clusterKey] = ite.clusterName;
              }
              pre[0].push(...arr);
              pre[1] = { ...pre[1], ...names };
              return pre;
            },
            [[], {}],
          );

          clusterInfoMap.current = culsterInfoData[1];
          let obj = [
            {
              name: 'id',
              value: item.id,
            },
            {
              name: 'policyId',
              value: item.policyId,
            },
            {
              name: 'status',
              value: item.status,
            },
            {
              name: 'type',
              value: item.cron ? item.cron.type : 2,
            },
            {
              name: 'time1',
              value: item.cron ? item.cron.time.slice(0, index) : null,
            },
            {
              name: 'time2',
              value: item.cron ? moment(item.cron.time.slice(index + 1), TIME_FORMAT) : moment(),
            },
            {
              name: 'clusterInfo',
              value: item.clusterInfo ? culsterInfoData[0] : [],
            },
          ];
          formSecretKey.setFields(obj);
          setDataConfig(item);
        }),
      )
      .subscribe();
  }, [query]);
  const reqFun = useCallback((pagination: TablePaginationConfig) => {
    const { current = 1, pageSize = 10 } = pagination;
    return getScapCronjob(query).pipe(
      map((res: any) => {
        let item = res.getItem();
        return {
          data: item.clusterInfo,
          total: item.clusterInfo ? item.clusterInfo.length : 0,
        };
      }),
    );
  }, []);
  let dataInfo: DealData[] = useMemo(() => {
    let dataInfo: DealData[] = [];
    let str: any = {
      status: translations.functionSwitch + '：',
      policyName: translations.scan_baseline + '：',
      cron: translations.compliances_breakdown_runduring + '：',
    };
    if (!dataConfig) return [];
    Object.keys(str).map((item) => {
      let obj: DealData = {
        title: str[item] || item,
        content: dataConfig[item] || '-',
      };
      if ('status' === item) {
        obj['render'] = () => {
          return <RenderTag type={dataConfig[item] + ''} className={'mt-4'} />;
        };
      }
      if ('cron' === item) {
        obj['render'] = () => {
          if (!dataConfig['cron'] || !dataConfig['cron'].time) return '-';
          let { type, format, lang = '' } = getTimeFormat(dataConfig['cron'].type);
          return moment(dataConfig['cron'].time, type).format(format) + ' ' + lang;
        };
      }
      dataInfo.push(obj);
    });
    return dataInfo;
  }, [dataConfig]);

  let columns: any = useMemo(() => {
    return [
      {
        title: '',
        key: 'clusterName',
        width: '60px',
        align: 'center',
        dataIndex: 'clusterName',
        render: (text: any, _: any, i: number) => {
          return <>{i < 10 ? `0${i + 1}` : i + 1}</>;
        },
      },
      {
        title: translations.object_scope,
        key: 'clusterName',
        dataIndex: 'clusterName',
        render: (text: any, _: any) => {
          return (
            <div className={'flex-r'}>
              <TzTag style={{ maxWidth: '200px' }}>
                <EllipsisPopover>
                  {translations.compliances_cronjobs_selectCluster}：{text}
                </EllipsisPopover>{' '}
              </TzTag>
              <TzTag>
                <EllipsisPopover style={{ marginTop: 3, height: 22 }}>
                  {translations.compliances_breakdown_statusName}：
                  {_.nodeName ? _.nodeName.join(' , ') : translations.allNodes}
                </EllipsisPopover>
              </TzTag>
            </div>
          );
        },
      },
    ];
  }, []);
  const type = Form.useWatch('type', formSecretKey);
  let [dateList, optionList] = useMemo(() => {
    let dateList = [
      { label: translations.compliances_cronjobs_presets_daily, value: 2 },
      { label: translations.compliances_cronjobs_presets_weekly, value: 3 },
      { label: translations.compliances_cronjobs_presets_monthly, value: 4 },
      { label: translations.compliances_cronjobs_presets_yearly, value: 5 },
    ];
    let optionList: any = [];
    switch (type) {
      case 1:
      case 2:
        optionList = [];
        break;
      case 3:
        optionList = week.map((item, index) => {
          return {
            value: index + '',
            label: item,
          };
        });
        break;
      case 4:
        optionList = monthDay;
        break;
      case 5:
        optionList = yearDay;
        break;
    }
    return [dateList, optionList];
  }, [type]);
  useEffect(() => {
    if (dataConfig && dataConfig.cron?.type !== type && optionList.length) {
      setTimeout(() => {
        formSecretKey.setFields([
          {
            name: 'time1',
            value: optionList[0].value,
          },
        ]);
      }, 500);
    }
  }, [type, dataConfig, optionList]);
  useEffect(() => {
    getPolicies({ ...query, offset: 0, limit: 10000 })
      .pipe(
        tap((res: WebResponse<any>) => {
          if (!res['error']) {
            let items = res.getItems();
            let arr = items.map((item: any) => {
              return {
                label: item.name,
                value: item.id,
              };
            });
            setScanningStrategyList(arr);
          }
        }),
      )
      .subscribe();
    getDataInfo();
  }, [query]);
  if (edit) {
    return (
      <TzForm
        className="plr24"
        form={formSecretKey}
        initialValues={{
          status: true,
          type: 2,
          policyId: null,
          time1: moment(),
          time2: moment(),
        }}
        onFinish={(value: {
          clusterInfo: any[];
          time1: string;
          time2: moment.MomentInput;
          type: any;
          policyId: any;
          status: any;
          id: any;
        }) => {
          let clusterInfo = value.clusterInfo
            .filter((item) => item.length)
            .reduce((pre: any, item: any) => {
              if (pre[item[0]]) {
                item[1] ? pre[item[0]].push(item[1]) : null;
              } else {
                item[1] ? (pre[item[0]] = [item[1]]) : (pre[item[0]] = []);
              }
              return pre;
            }, {});
          let clusterInfos = Object.keys(clusterInfo).map((item) => {
            return {
              clusterKey: item,
              isAllNodes: !clusterInfo[item].length,
              nodes: clusterInfo[item],
            };
          });
          let obj = Object.assign(
            {},
            {
              clusterInfos,
              cron: {
                time: value.time1
                  ? value.time1 + moment(value.time2).format(`/${TIME_FORMAT}`)
                  : moment(value.time2).format(TIME_FORMAT),
                type: value.type,
              },
              policyId: value.policyId,
              status: value.status,
              id: value.id,
            },
            query,
          );
          cronjob(obj).subscribe((res) => {
            if (res.error) return;
            setEdit(false);
            getDataInfo();
          });
        }}
      >
        <TzFormItem hidden={true} name="id">
          <TzInput />
        </TzFormItem>
        <TzFormItem label={translations.functionSwitch} name="status" valuePropName="checked">
          <TzSwitch
            checkedChildren={translations.confirm_modal_isopen}
            unCheckedChildren={translations.confirm_modal_isclose}
          />
        </TzFormItem>
        <TzFormItem
          label={translations.scan_baseline}
          name="policyId"
          rules={[
            {
              required: true,
              message: translations.please_select_scanning_baseline,
            },
          ]}
        >
          <TzSelect
            placeholder={translations.please_select_scanning_baseline}
            options={scanningStrategyList}
            style={{ width: '456px' }}
          />
        </TzFormItem>
        <TzRow>
          <TzCol flex={'144px'}>
            <TzFormItem label={translations.compliances_breakdown_runduring} name="type">
              <TzSelect options={dateList} />
            </TzFormItem>
          </TzCol>
          {type == 1 || type == 2 ? null : (
            <TzCol flex={'144px'} style={{ marginLeft: '12px', paddingTop: '26px' }}>
              <TzFormItem name="time1" noStyle={true}>
                <TzSelect options={optionList} />
              </TzFormItem>
            </TzCol>
          )}
          {type == 1 ? null : (
            <TzCol flex={'144px'} style={{ marginLeft: '12px', paddingTop: '26px' }}>
              <TzFormItem name="time2" noStyle={true}>
                <TzTimePicker />
              </TzFormItem>
            </TzCol>
          )}
        </TzRow>
        <TzFormItem
          label={translations.scanning_object}
          name="clusterInfo"
          style={{ marginBottom: '20px' }}
        >
          <TzCascaderClusterNode clusterInfoMap={clusterInfoMap} />
        </TzFormItem>
      </TzForm>
    );
  } else {
    return (
      <>
        <ArtTemplateDataInfo data={dataInfo} span={1} />
        <div className="plr24">
          <PageTitle
            title={translations.scanning_object}
            className={'mb8'}
            style={{ fontWeight: 550, fontSize: '14px', color: '#3E4653' }}
          />
          <TzTableServerPage
            columns={columns}
            tableLayout={'fixed'}
            reqFun={reqFun}
            ref={listComp}
          />
        </div>
      </>
    );
  }
};

export default ScanConfiguration;
