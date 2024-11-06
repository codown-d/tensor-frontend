import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { translations } from '../../../translations';
import './index.scss';
import { TzForm, TzFormItem } from '../../../components/tz-form';
import { TzSwitch } from '../../../components/tz-switch';
import Form from 'antd/lib/form';
import { TzSelect } from '../../../components/tz-select';
import { useAssetsClusterList } from '../../../helpers/use_fun';
import { TzCol, TzRow } from '../../../components/tz-row-col';
import { RenderTag, TzTag } from '../../../components/tz-tag';
import { TzRadioGroup } from '../../../components/tz-radio';
import { useMemoizedFn, useSetState, useUpdateEffect } from 'ahooks';
import { find, get } from 'lodash';
import { TzTooltip } from '../../../components/tz-tooltip';
import { TzCascader } from '../../../components/ComponentsLibrary';
import { filter } from '../../../screens/ComplianceWhole/ScanManagement';
import { useMicroFun } from '../lib/use_fun';
import TzSelectTag from '../../../components/ComponentsLibrary/TzSelectTag';
import { FormItemIPBlockHelp, getSelectErrorInfo, getSelectPlaceholder } from './Automatic';
import { testPort } from '../lib';
import useSourceObjectEnum from './useSourceObjectEnum';
export let sourceObjectEnum = [
  //   {
  //     label: translations.resources,
  //     value: 'Resource',
  //   },
  {
    label: translations.microseg_segments_segment_title,
    value: 'Segment',
  },
  //   {
  //     label: translations.onlineVulnerability_outerShapeMeaning,
  //     value: 'Namespace',
  //   },
  //   {
  //     label: translations.microseg_namespace_sidetitle,
  //     value: 'Nsgrp',
  //   },
  {
    label: translations.ip_group,
    value: 'IPBlock',
  },
];
export let priorityOptions = [
  {
    label: '1',
    value: 1,
  },
  {
    label: '2',
    value: 2,
  },
  {
    label: '3',
    value: 3,
  },
  {
    label: '4',
    value: 4,
  },
  {
    label: '5',
    value: 5,
  },
];
export let reverseOptions = [
  {
    label: '是',
    value: true,
  },
  {
    label: '否',
    value: false,
  },
];
export let protocolEnum = [
  { label: 'TCP', value: 'TCP' },
  { label: 'UDP', value: 'UDP' },
  { label: 'ICMP', value: 'ICMP' },
  { label: '不限', value: 'ANY' },
];
export let PortsTooltip = () => {
  return (
    <TzTooltip
      title={
        <div className="microisolation-tooltip">
          <p className="ip-group-modal-title">{translations.filling_instructions}</p>
          <p className="ip-group-modal-item mt16">{translations.unStandard.ports_supported}:</p>
          <p className="f12 mt8" style={{ color: '#6C7480', paddingLeft: '16px' }}>
            {translations.unStandard.port_example}
            <br />
            {translations.unStandard.port_range_example}
          </p>
          <p className="ip-group-modal-item mt16">{translations.unStandard.multiple_separated_line}</p>
        </div>
      }
      color={'#fff'}
      overlayInnerStyle={{ color: '#000', padding: '16px 20px' }}
    >
      <i className={'iconfont icon-wenhao icon-wenti'}></i>
    </TzTooltip>
  );
};
const Manual = (props: any) => {
  const { id } = props;
  let [srcTypeOp, setSrcTypeOp] = useSetState<any>({});
  const { formIns } = props;
  let clusterList = useAssetsClusterList();
  const cluster = Form.useWatch('cluster', formIns);
  const srcType = Form.useWatch('srcType', formIns);
  const dstType = Form.useWatch('dstType', formIns);
  const dstId = Form.useWatch('dstId', formIns);
  const protocol = Form.useWatch('protocol', formIns);
  let { getResourcesOp, getNamespaceOp, getSegmentOp, getNamespaceGroupOp, getIpgroups } = useMicroFun({
    callback: setSrcTypeOp,
  });
  let getDstIdDom = useMemo(() => {
    let dstId = get(srcTypeOp, [dstType, cluster]);
    if (['Resource', 'Segment'].includes(dstType)) {
      return (
        <TzCascader
          placeholder={translations.microseg_segments_policy_dst_obj_place}
          options={dstId}
          showSearch={{ filter }}
        />
      );
    } else {
      return (
        <TzSelect
          placeholder={translations.microseg_segments_policy_dst_obj_place}
          options={dstId}
          showSearch
          filterOption={(input, option: any) => option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0}
        />
      );
    }
  }, [dstType, cluster, srcTypeOp]);
  let getSrcIdDom = useMemo(() => {
    let srcId = get(srcTypeOp, [srcType, cluster]);
    if (['Resource', 'Segment'].includes(srcType)) {
      return (
        <TzCascader
          placeholder={translations.microseg_segments_policy_src_obj_place}
          options={srcId}
          showSearch={{ filter }}
        />
      );
    } else {
      return (
        <TzSelect
          placeholder={translations.microseg_segments_policy_src_obj_place}
          options={srcId}
          showSearch
          filterOption={(input, option: any) => option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0}
        />
      );
    }
  }, [srcType, cluster, srcTypeOp]);
  useEffect(() => {
    if (srcTypeOp?.[dstType]?.[cluster] && srcTypeOp?.[srcType]?.[cluster]) return;
    // if (dstType === 'Resource' || srcType === 'Resource') {
    //   getResourcesOp(cluster);
    // }
    if (dstType === 'Segment' || srcType === 'Segment') {
      getSegmentOp(cluster);
    }
    // if (dstType === 'Namespace' || srcType === 'Namespace') {
    //   getNamespaceOp(cluster);
    // }
    // if (dstType === 'Nsgrp' || srcType === 'Nsgrp') {
    //   getNamespaceGroupOp(cluster);
    // }
    if (dstType === 'IPBlock' || srcType === 'IPBlock') {
      getIpgroups(cluster);
    }
  }, [srcType, dstType, cluster]);

  let { srcTypeOpEnum, dstTypeOpEnum } = useSourceObjectEnum({ srcType, dstType });
  return (
    <TzForm form={formIns} style={{ padding: '0 24px' }}>
      <TzFormItem valuePropName="checked" label={translations.enable_rule} name={'enable'} initialValue={true} required>
        <TzSwitch
          checkedChildren={translations.microseg_tenants_enabled}
          unCheckedChildren={translations.deactivateC}
        />
      </TzFormItem>
      <TzFormItem hidden name={'id'}></TzFormItem>
      <TzFormItem
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
          disabled={id}
          placeholder={translations.activeDefense_clusterPla}
          options={clusterList}
          onChange={() => {
            formIns.setFieldsValue({
              srcId: undefined,
              dstId: undefined,
            });
          }}
        />
      </TzFormItem>
      <TzFormItem label={translations.microseg_segments_policy_src_obj} required>
        <TzRow gutter={[8, 0]}>
          <TzCol flex={'150px'}>
            <TzFormItem name={'srcType'} initialValue={'Segment'} noStyle>
              <TzSelect
                placeholder={translations.activeDefense_clusterPla}
                options={srcTypeOpEnum}
                onChange={() => {
                  formIns.setFieldsValue({
                    srcId: undefined,
                  });
                }}
              />
            </TzFormItem>
          </TzCol>
          <TzCol flex={1}>
            <TzFormItem
              name={'srcId'}
              noStyle
              rules={[
                {
                  required: true,
                  message: getSelectErrorInfo(srcType),
                },
              ]}
            >
              {getSrcIdDom}
            </TzFormItem>
          </TzCol>
        </TzRow>
      </TzFormItem>
      <TzFormItem
        label={translations.microseg_segments_policy_dst_obj}
        required
        help={dstType === 'IPBlock' && dstId ? <FormItemIPBlockHelp id={dstId} cluster={cluster} /> : undefined}
      >
        <TzRow gutter={[8, 0]}>
          <TzCol flex={'150px'}>
            <TzFormItem name={'dstType'} initialValue={'Segment'} noStyle>
              <TzSelect
                placeholder={translations.activeDefense_clusterPla}
                options={dstTypeOpEnum}
                onChange={(val) => {
                  if (id) {
                    formIns.setFieldsValue({
                      dstId: undefined,
                    });
                  } else {
                    formIns.setFieldsValue({
                      dstId: undefined,
                    });
                  }
                }}
              />
            </TzFormItem>
          </TzCol>
          <TzCol flex={1}>
            <TzFormItem
              name={'dstId'}
              noStyle
              rules={[
                {
                  required: true,
                  message: getSelectErrorInfo(dstType),
                },
              ]}
            >
              {getDstIdDom}
            </TzFormItem>
          </TzCol>
        </TzRow>
      </TzFormItem>
      <TzFormItem label={translations.originalWarning_rule} name={'action'}>
        <RenderTag type="allow" title={translations.commonpro_Allow} />
      </TzFormItem>
      <TzFormItem
        label={translations.calico_protocol}
        name={'protocol'}
        initialValue={'TCP'}
        rules={[
          {
            required: true,
            message: translations.unStandard.str37,
          },
        ]}
      >
        <TzRadioGroup options={protocolEnum} />
      </TzFormItem>
      {protocol === 'ICMP' || protocol === 'ANY' ? null : (
        <TzFormItem
          label={
            <div>
              <span>{translations.microseg_segments_policy_port_title}：</span>
              {/* <PortsTooltip /> */}
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

      <TzFormItem label={translations.add_counter_rules} name={'reverse'} initialValue={false} hidden={id}>
        <TzRadioGroup options={reverseOptions} />
      </TzFormItem>
    </TzForm>
  );
};
export default Manual;
