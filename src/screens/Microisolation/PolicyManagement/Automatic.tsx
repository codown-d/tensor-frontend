import React, { useCallback, useMemo, useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { translations } from '../../../translations';
import './Automatic.less';
import { TzForm, TzFormItem } from '../../../components/tz-form';
import { TzSwitch } from '../../../components/tz-switch';
import { find, findIndex, get, isArray, keys, merge, mergeWith, pick, set, sortBy } from 'lodash';
import { ipgroups, suggestions } from '../../../services/DataService';
import Form, { FormInstance } from 'antd/lib/form';
import { TzSelect } from '../../../components/tz-select';
import { getClusterName, useAssetsClusterList } from '../../../helpers/use_fun';
import { TzCol, TzRow } from '../../../components/tz-row-col';
import { RenderTag, TzTag } from '../../../components/tz-tag';
import { TzRadioGroup } from '../../../components/tz-radio';
import { useMemoizedFn, useSetState } from 'ahooks';
import DesInfo from '../../../screens/ComponentMonitoring/DesInfo';
import { TzRangePicker } from '../../../components/tz-range-picker';
import { TzButton } from '../../../components/tz-button';
import { TzCard } from '../../../components/tz-card';
import { TzTable } from '../../../components/tz-table';
import { columnsList, flag, testPort } from '../lib';
import NoData from '../../../components/noData/noData';
import { TzCascader } from '../../../components/ComponentsLibrary';
import { filter } from '../../../screens/ComplianceWhole/ScanManagement';
import moment from 'moment';
import { TzConfirm } from '../../../components/tz-modal';
import { PortsTooltip, priorityOptions, protocolEnum, sourceObjectEnum } from './Manual';
import { getUid } from '../../../helpers/until';
import TzPopconfirm from '../../../components/ComponentsLibrary/TzPopconfirm';
import { useGetResourcesGroup, useMicroFun } from '../lib/use_fun';
import { addIPGroup } from '../ObjectManagement/IPGroup';
import { TzMessageWarning } from '.././../../components/tz-mesage';
import TzSelectTag from '.././../../components/ComponentsLibrary/TzSelectTag';
import { TzInput } from '.././../../components/tz-input';
import ArtTemplateDataInfo from '.././../../components/ComponentsLibrary/ArtTemplateDataInfo';
import useSourceObjectEnum from './useSourceObjectEnum';

let FormLabel = (props: { title: any; type: any; callback: (val: any) => void }) => {
  let { title, type, callback } = props;
  const [formInstance] = Form.useForm();
  return (
    <div className="flex-r-c" style={{ width: '100%' }}>
      <span>{title}:</span>
      {type === 'IPBlock' ? (
        <TzButton
          type={'text'}
          onClick={() =>
            addIPGroup({
              item: {},
              formInstance,
              callback,
            })
          }
        >
          <i className="iconfont icon-jiahao f12 mr8"></i>
          {translations.add_IP_group}
        </TzButton>
      ) : null}
    </div>
  );
};
export let getSelectPlaceholder = (type: 'Resource' | 'Segment' | 'Namespace' | 'Nsgrp' | 'IPBlock') => {
  let obj = {
    Resource: translations.unStandard.requireSelectTip(translations.resources),
    Segment: translations.unStandard.requireSelectTip(translations.microseg_segments_segment_title),
    Namespace: translations.unStandard.requireSelectTip(translations.onlineVulnerability_outerShapeMeaning),
    Nsgrp: translations.unStandard.requireSelectTip(translations.microseg_namespace_sidetitle),
    IPBlock: translations.unStandard.requireSelectTip(translations.ip_group),
  };
  return obj[type];
};
export let getSelectErrorInfo = (type: 'Resource' | 'Segment' | 'Namespace' | 'Nsgrp' | 'IPBlock') => {
  let obj = {
    Resource: translations.unStandard.notEmptyTip(translations.resources),
    Segment: translations.unStandard.notEmptyTip(translations.microseg_segments_segment_title),
    Namespace: translations.unStandard.notEmptyTip(translations.onlineVulnerability_outerShapeMeaning),
    Nsgrp: translations.unStandard.notEmptyTip(translations.microseg_namespace_sidetitle),
    IPBlock: translations.unStandard.notEmptyTip(translations.ip_group),
  };
  return obj[type];
};

export let FormItemIPBlockHelp = (props: { id: any; cluster: string }) => {
  let { id, cluster } = props;
  let [srcTypeOp, setSrcTypeOp] = useState<any[]>([]);
  useEffect(() => {
    ipgroups({ cluster }).subscribe((res) => {
      let items = res.getItems().map((ite) => {
        return {
          value: ite.id,
          label: ite.name,
          ipSet: ite.ipSet,
          original: {
            cluster: cluster,
            name: ite.name,
          },
        };
      });
      setSrcTypeOp(items);
    });
  }, [id]);
  let node = find(srcTypeOp, (item) => item.value === id);
  return node ? (
    <div className="form-item-ip-block-help">
      {translations.ip_ranges}：{node?.ipSet}
    </div>
  ) : null;
};
let PolicyDom = (props: { formInstance: FormInstance<any>; param?: any }) => {
  let { formInstance, param = {} } = props;
  let [srcTypeOp, setSrcTypeOp] = useSetState<any>({});
  let clusterList = useAssetsClusterList();
  const srcTypeC = Form.useWatch('srcTypeC', formInstance);
  const dstTypeC = Form.useWatch('dstTypeC', formInstance);
  const srcIdC = Form.useWatch('srcIdC', formInstance);
  const dstIdC = Form.useWatch('dstIdC', formInstance);
  const cluster = Form.useWatch('cluster', formInstance);
  const protocol = Form.useWatch('protocol', formInstance);
  let { getResourcesOp, getSegmentOp, getNamespaceOp, getNamespaceGroupOp, getIpgroups } = useMicroFun({
    callback: setSrcTypeOp,
  });
  let getTypeDom = useMemoizedFn((type) => {
    let selectOp = get(srcTypeOp, [type, cluster]);
    if (['Resource', 'Segment'].includes(type)) {
      return <TzCascader placeholder={getSelectPlaceholder(type)} options={selectOp} showSearch={{ filter }} />;
    } else {
      return (
        <TzSelect
          placeholder={getSelectPlaceholder(type)}
          options={selectOp}
          showSearch
          filterOption={(input, option: any) => option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0}
        />
      );
    }
  });

  useEffect(() => {
    if (srcTypeOp?.[dstTypeC]?.[cluster] && srcTypeOp?.[srcTypeC]?.[cluster]) return;
    if (dstTypeC === 'Resource' || srcTypeC === 'Resource') {
      getResourcesOp(cluster);
    }
    if (dstTypeC === 'Segment' || srcTypeC === 'Segment') {
      getSegmentOp(cluster);
    }
    if (dstTypeC === 'Namespace' || srcTypeC === 'Namespace') {
      getNamespaceOp(cluster);
    }
    if (dstTypeC === 'Nsgrp' || srcTypeC === 'Nsgrp') {
      getNamespaceGroupOp(cluster);
    }
    if (dstTypeC === 'IPBlock' || srcTypeC === 'IPBlock') {
      getIpgroups(cluster);
    }
  }, [srcTypeC, dstTypeC, cluster]);
  useEffect(() => {
    let { srcType, dstType, srcId, dstId, portList, ...otherParams } = param;
    let srcIdC = srcId;
    let dstIdC = dstId;
    let srcTypeC = srcType == 'Unknown' ? translations.unknown : srcType;
    let dstTypeC = dstType == 'Unknown' ? translations.unknown : dstType;
    if (srcType === 'Resource' || srcType === 'Segment') {
      srcIdC = [param.srcDetail?.namespace, param.srcId];
    }
    if (dstType === 'Resource' || dstType === 'Segment') {
      dstIdC = [param.dstDetail?.namespace, param.dstId];
    }

    formInstance.setFieldsValue(
      merge(otherParams, { srcIdC, dstIdC, srcTypeC, dstTypeC, portList: portList || undefined }),
    );
    return () => {
      formInstance.resetFields();
    };
  }, []);
  useEffect(() => {
    if (srcTypeC === 'IPBlock') {
      let node = find(srcTypeOp.IPBlock?.[cluster], (item) => item.value === srcIdC);
      formInstance.setFieldsValue({
        srcDetailC: node?.original,
      });
    }
    if (dstTypeC === 'IPBlock') {
      let node = find(srcTypeOp.IPBlock?.[cluster], (item) => item.value === dstIdC);
      formInstance.setFieldsValue({
        dstDetailC: node?.original,
      });
    }
  }, [srcTypeOp.IPBlock, srcTypeC, dstTypeC, srcIdC, dstIdC]);

  const dataInfoList = useMemo(() => {
    if (!param) return [];
    const obj: any = {
      cluster: translations.clusterManage_key + '：',
      dstDetail: translations.traffic_direction + '：',
    };
    return Object.keys(obj).map((item) => {
      let o: any = {
        title: obj[item] || '-',
        content: param[item],
      };
      if ('cluster' === item) {
        o['render'] = () => {
          return getClusterName(param[item]);
        };
      }
      if ('dstDetail' === item) {
        o['render'] = () => {
          return (
            <div className="flex-r-c">
              {param['srcDetail']['name']}
              <img src="/images/arrow.png" alt="" className="ml4 mr4" style={{ width: '35px' }} />
              {param['dstDetail']['name']}
            </div>
          );
        };
      }
      return o;
    });
  }, [param]);

  const srcType = Form.useWatch('srcTypeC', formInstance);
  const dstType = Form.useWatch('dstTypeC', formInstance);
  let { srcTypeOpEnum, dstTypeOpEnum } = useSourceObjectEnum({ srcType, dstType });
  return (
    <TzForm form={formInstance} className="automatic-form">
      <ArtTemplateDataInfo data={dataInfoList} span={1} rowProps={{ gutter: [0, 0] }} />
      <TzFormItem
        hidden
        label={translations.clusterManage_key}
        name={'cluster'}
        rules={[
          {
            required: true,
            message: translations.unStandard.notEmptyTip(translations.clusterManage_key),
          },
        ]}
      >
        <TzSelect
          disabled
          placeholder={translations.activeDefense_clusterPla}
          options={clusterList}
          onChange={() => {
            formInstance.setFieldsValue({
              srcIdC: undefined,
              dstIdC: undefined,
            });
          }}
        />
      </TzFormItem>
      <TzFormItem name={'srcDetailC'} hidden>
        <TzInput />
      </TzFormItem>
      <TzFormItem name={'dstDetailC'} hidden>
        <TzInput />
      </TzFormItem>
      <TzFormItem
        className="form-item-label-w100"
        label={
          <FormLabel
            title={translations.microseg_segments_policy_src_obj}
            type={srcTypeC}
            callback={(val) => {
              let { ID } = val;
              formInstance.setFieldsValue({ srcIdC: ID });
              getIpgroups(cluster);
            }}
          />
        }
        required
        validateStatus={flag.includes(srcTypeC) ? 'error' : 'validating'}
        help={srcTypeC === 'IPBlock' && srcIdC ? <FormItemIPBlockHelp id={srcIdC} cluster={cluster} /> : undefined}
      >
        <TzRow gutter={[8, 0]}>
          <TzCol flex={'150px'}>
            <TzFormItem
              name={'srcTypeC'}
              initialValue={'Resource'}
              noStyle
              rules={[
                (formInstance) => ({
                  validator: () => {
                    let { getFieldsValue } = formInstance;
                    let { srcTypeC } = getFieldsValue(['srcTypeC']);
                    if (flag.includes(srcTypeC)) {
                      return Promise.reject(translations.type_error);
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <TzSelect
                placeholder={translations.activeDefense_clusterPla}
                options={srcTypeOpEnum}
                onChange={() => {
                  formInstance.setFieldsValue({
                    srcIdC: undefined,
                  });
                }}
              />
            </TzFormItem>
          </TzCol>
          <TzCol flex={1}>
            <TzFormItem
              noStyle
              name={'srcIdC'}
              rules={[
                {
                  required: true,
                  message: getSelectErrorInfo(srcTypeC),
                },
              ]}
            >
              {getTypeDom(srcTypeC)}
            </TzFormItem>
          </TzCol>
        </TzRow>
      </TzFormItem>
      <TzFormItem
        className="form-item-label-w100"
        label={
          <FormLabel
            title={translations.microseg_segments_policy_dst_obj}
            type={dstTypeC}
            callback={(val) => {
              let { ID } = val;
              formInstance.setFieldsValue({ dstIdC: ID });
              getIpgroups(cluster);
            }}
          />
        }
        required
        validateStatus={flag.includes(dstTypeC) ? 'error' : 'validating'}
        help={dstTypeC === 'IPBlock' && dstIdC ? <FormItemIPBlockHelp id={dstIdC} cluster={cluster} /> : undefined}
      >
        <TzRow gutter={[8, 0]}>
          <TzCol flex={'150px'}>
            <TzFormItem
              name={'dstTypeC'}
              initialValue={'Resource'}
              noStyle
              rules={[
                (formInstance) => ({
                  validator: () => {
                    let { getFieldsValue } = formInstance;
                    let { dstTypeC } = getFieldsValue(['dstTypeC']);
                    if (flag.includes(dstTypeC)) {
                      return Promise.reject(translations.type_error);
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <TzSelect
                placeholder={translations.activeDefense_clusterPla}
                options={dstTypeOpEnum}
                onChange={() => {
                  formInstance.setFieldsValue({
                    dstIdC: undefined,
                  });
                }}
              />
            </TzFormItem>
          </TzCol>
          <TzCol flex={1}>
            <TzFormItem
              name={'dstIdC'}
              noStyle
              rules={[
                {
                  required: true,
                  message: getSelectErrorInfo(dstTypeC),
                },
              ]}
            >
              {getTypeDom(dstTypeC)}
            </TzFormItem>
          </TzCol>
        </TzRow>
      </TzFormItem>
      <TzFormItem
        className="form-item-label-w100"
        style={{ marginBottom: '20px' }}
        label={
          <div className="flex-r-c" style={{ width: '100%' }}>
            <span>{translations.originalWarning_rule}：</span>
            <RenderTag type="allow" title={translations.commonpro_Allow} />
          </div>
        }
        name={'action'}
      ></TzFormItem>
      <TzFormItem
        label={translations.calico_protocol}
        name={'protocol'}
        initialValue={'TCP'}
        rules={[
          {
            required: true,
            message: translations.unStandard.notEmptyTip(translations.calico_protocol),
          },
        ]}
      >
        <TzRadioGroup options={protocolEnum} />
      </TzFormItem>
      {protocol === 'ICMP' || protocol === 'ANY' ? null : (
        <TzFormItem
          className="form-item-label-w100"
          label={
            <div className="flex-r-c" style={{ width: '100%' }}>
              <span>{translations.microseg_segments_policy_port_title}：</span>
              <PortsTooltip />
            </div>
          }
          name={'portList'}
          rules={[
            {
              required: true,
              message: translations.unStandard.notEmptyTip(translations.microseg_segments_policy_port_title),
            },
            {
              whitespace: true,
              validator: (val, value: string[]) => {
                return testPort(value);
              },
            },
          ]}
        >
          <TzSelectTag placeholder={translations.unStandard.multiple_inputs_separated_breaks} />
        </TzFormItem>
      )}
    </TzForm>
  );
};
export default forwardRef((props: any, ref) => {
  const { formIns } = props;
  const [formRulesIns] = Form.useForm();
  const [formInstance] = Form.useForm();
  let [loading, setLoading] = useState(false);
  let rules = Form.useWatch('rules', formIns);
  let editRules = useMemoizedFn((item: any, index: number) => {
    TzConfirm({
      width: '560px',
      title: translations.edit_recommendation_rule,
      content: <PolicyDom formInstance={formInstance} param={item} />,
      onOk() {
        return new Promise((resolve, reject) => {
          formInstance.validateFields().then((value) => {
            let { srcDetail, dstDetail, ...otherItem } = item;
            let { srcDetailC, dstDetailC, srcTypeC, dstTypeC, srcIdC, dstIdC, ...otherValue } = value;
            set(
              rules,
              [index],
              merge({}, otherItem, otherValue, {
                srcDetail: srcDetailC || srcDetail,
                dstDetail: dstDetailC || dstDetail,
                srcType: srcTypeC,
                dstType: dstTypeC,
                srcId: isArray(srcIdC) ? srcIdC.pop() : srcIdC,
                dstId: isArray(dstIdC) ? dstIdC.pop() : dstIdC,
              }),
            );
            formIns.setFieldsValue({ rules });
            resolve('');
          }, reject);
        });
      },
    });
  });
  let columns = useMemo(() => {
    let a = ['source_object', 'target_audience'];
    let arr = columnsList.filter((item: any) => a.includes(item.dataIndex));
    let newArr = sortBy(arr, (x) => findIndex(a, (y) => x.dataIndex === y));

    return [
      ...newArr,
      {
        title: translations.enabled_state,
        dataIndex: 'enable',
        width: '10%',
        align: 'center',
        render: (enable: any, row: any, index: number) => {
          return (
            <TzSwitch
              defaultChecked={enable}
              size={'small'}
              onChange={(val) => {
                set(rules, [index, 'enable'], val);
                formIns.setFieldsValue({ rules });
              }}
            />
          );
        },
      },
      {
        title: translations.scanner_report_operate,
        dataIndex: 'ip_name',
        width: '14%',
        render: (status: any, row: any, index: number) => {
          return (
            <>
              <TzButton
                type="text"
                className="ml8"
                onClick={() => {
                  editRules(row, index);
                }}
              >
                {translations.edit}
              </TzButton>
              <TzPopconfirm
                title={translations.unStandard.str39}
                cancelButtonProps={{ type: 'text', danger: true }}
                okButtonProps={{ danger: true }}
                okText={translations.delete}
                onConfirm={() => {
                  rules.splice(index, 1);
                  formIns.setFieldsValue({ rules: [...rules] });
                }}
              >
                <TzButton type="text" danger>
                  {translations.delete}
                </TzButton>
              </TzPopconfirm>
            </>
          );
        },
      },
    ];
  }, [rules]);
  let resourceList = useGetResourcesGroup();

  let getsuggestions = useMemoizedFn(() => {
    formRulesIns.validateFields().then((values) => {
      setLoading(true);
      let start = moment(values['time'][0]).valueOf();
      let end = moment(values['time'][1]).valueOf();
      suggestions(merge(values, { id: values.id, end, start })).subscribe((res) => {
        setLoading(false);
        if (res.error) {
          return;
        }
        let items = res.getItems().map((item) => {
          item['_id'] = getUid();
          return item;
        });
        if (items.length == 0) {
          formIns.setFieldsValue({ rules: [] });
          TzMessageWarning(translations.no_recommended_rules + '!');
          return;
        }
        formIns.setFieldsValue({ rules: items });
      });
    });
  });
  useImperativeHandle(ref, () => {
    return {
      resetFields: () => {
        formIns.setFieldsValue({ rules: undefined });
        formRulesIns.setFieldsValue({ id: undefined });
      },
    };
  }, []);
  return (
    <div>
      <DesInfo title={translations.advised_resource} className="mb20" />
      <TzForm form={formRulesIns} style={{ padding: '0 24px' }}>
        <TzFormItem
          label={translations.microseg_segments_segment_title}
          name={'id'}
          rules={[
            {
              required: true,
              message: translations.unStandard.notEmptyTip(translations.microseg_segments_segment_title),
            },
          ]}
        >
          <TzSelect
            placeholder={translations.originalWarning_pleaseSelect + translations.microseg_segments_segment_title}
            options={resourceList}
          />
        </TzFormItem>
        <TzFormItem
          label={translations.time_range}
          name="time"
          style={{ width: '40%' }}
          initialValue={[moment().add(-7, 'd'), moment()]}
          rules={[
            {
              required: true,
              message: translations.unStandard.notEmptyTip(translations.flow_time),
            },
          ]}
        >
          <TzRangePicker
            showTime
            ranges={
              {
                [translations.hours_24]: [moment().add(-24, 'h'), moment()],
                [translations.days_7]: [moment().add(-7, 'd'), moment()],
                [translations.days_30]: [moment().add(-30, 'd'), moment()],
              } as any
            }
          />
        </TzFormItem>
        <TzButton loading={loading} onClick={getsuggestions} type={'primary'}>
          {loading
            ? translations.recommended
            : rules && rules?.length != 0
              ? translations.re_recommended
              : translations.referral_rules}
        </TzButton>
      </TzForm>
      <TzCard style={{ margin: '16px 0' }} bodyStyle={{ padding: '0  24px 16px' }} title={translations.referral_rules}>
        <TzForm form={formIns}>
          <TzFormItem name="rules" hidden>
            <TzInput />
          </TzFormItem>
        </TzForm>
        {rules && rules?.filter((item: any) => item.srcType == 'Unknown' || item.dstType == 'Unknown').length != 0 ? (
          <p className={`form-item-tips mb16`}>{translations.not_create_addresses}</p>
        ) : null}
        {rules && rules.length ? (
          <TzTable dataSource={rules} tableLayout={'fixed'} rowKey={'_id'} columns={columns} className="mt-4" />
        ) : (
          <NoData />
        )}
      </TzCard>
    </div>
  );
});
