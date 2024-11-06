import React, { useCallback, useMemo, useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { translations } from '../../../translations';
import { TzCard } from '../../../components/tz-card';
import { TzButton } from '../../../components/tz-button';
import ArtTemplateDataInfo from '../../../components/ComponentsLibrary/ArtTemplateDataInfo';
import {
  micrclusterNamespaceSegmentsById,
  microsegNsgrpId,
  putMicrNsgrpsBase,
  putMicrclusterNamespaceSegmentsById,
} from '../../../services/DataService';
import { useMemoizedFn } from 'ahooks';
import { TzInput } from '../../../components/tz-input';
import { TzForm, TzFormItem } from '../../../components/tz-form';
import { Form } from 'antd';
import { TzRadioGroup } from '../../../components/tz-radio';
import { find, isEqual, merge } from 'lodash';
import { TzMessageSuccess } from '../../../components/tz-mesage';
import { getClusterName } from '../../../helpers/use_fun';
export let resourceGroupRadioOp = [
  {
    label: translations.scanner_images_yes,
    labelGroup: translations.internal_mutual_trust,
    value: true,
    icon: 'icon-huxin',
    tips: translations.resources_within_group,
  },
  {
    label: translations.scanner_images_no,
    labelGroup: translations.cancel_mutual_trust,
    value: false,
    icon: 'icon-geli',
    tips: translations.permitted_communicate,
  },
];
interface BaseInfoProps {
  type: 'resourceGroup' | 'namespaceGroup';
  groupId: string;
  onChange: () => void;
}
const BaseInfo = (props: BaseInfoProps, ref: any) => {
  let { groupId, type, onChange } = props;
  const [info, setInfo] = useState<any>(undefined);
  const [isEdit, setIsEdit] = useState<any>(false);
  const [form] = Form.useForm();
  let innerTrust = Form.useWatch('innerTrust', form);
  let getInnerTrustTips = useMemo(() => {
    let node = find(resourceGroupRadioOp, (item) => item.value === innerTrust);
    return node?.tips;
  }, [innerTrust]);
  const dataInfoList = useMemo(() => {
    if (!info) return [];
    const artTemplateDataKey: any = {
      name: translations.compliances_policyDetails_name + '：',
      innerTrust: translations.whether_mutual_trust + '：',
      cluster: translations.clusterManage_key + '：',
      namespace: translations.onlineVulnerability_outerShapeMeaning + '：',
    };
    if (type === 'namespaceGroup') {
      delete artTemplateDataKey.namespace;
    }
    return Object.keys(artTemplateDataKey).map((item) => {
      let o: any = {
        title: artTemplateDataKey[item] || '-',
        content: info[item],
      };
      if (item === 'name') {
        o['render'] = () => {
          return isEdit ? (
            <TzFormItem noStyle={true} name={'name'}>
              <TzInput placeholder={translations.microseg_segments_segment_name_palce} />
            </TzFormItem>
          ) : (
            info[item]
          );
        };
      }
      if (item === 'innerTrust') {
        o['className'] = 'flex-r-s';
        o['render'] = () => {
          let node = find(resourceGroupRadioOp, (ite) => isEqual(ite.value, info[item]));
          return isEdit ? (
            <TzFormItem noStyle={true} name={'innerTrust'}>
              <TzRadioGroup options={resourceGroupRadioOp} />
            </TzFormItem>
          ) : (
            <span className="flex-r-c">{node?.label}</span>
          );
        };
      }

      if (item === 'cluster') {
        o['render'] = () => {
          return getClusterName(info[item]);
        };
      }
      return o;
    });
  }, [info, isEdit, getInnerTrustTips]);
  const getDataInfo = useMemoizedFn(() => {
    let fn = type === 'resourceGroup' ? micrclusterNamespaceSegmentsById : microsegNsgrpId;
    fn({ groupId }).subscribe((res) => {
      let item = res.getItem();
      setInfo(item);
    });
  });
  useEffect(() => {
    getDataInfo();
  }, [groupId]);
  useImperativeHandle(
    ref,
    () => {
      return { refresh: getDataInfo };
    },
    [],
  );
  return (
    <TzCard
      title={translations.compliances_breakdown_taskbaseinfo}
      bodyStyle={{ padding: '4px 0 8px' }}
      extra={
        <>
          {isEdit ? (
            <>
              <TzButton
                className="mr16"
                onClick={() => {
                  form?.validateFields().then((value: any) => {
                    let fn = type === 'resourceGroup' ? putMicrclusterNamespaceSegmentsById : putMicrNsgrpsBase;
                    fn(merge(info, { groupId }, value)).subscribe((res) => {
                      if (res.error) return;
                      setIsEdit(false);
                      getDataInfo();
                      TzMessageSuccess(translations.saveSuccess);
                      onChange();
                    });
                  });
                }}
              >
                {translations.save}
              </TzButton>
              <TzButton
                onClick={() => {
                  setIsEdit(false);
                }}
              >
                {translations.cancel}
              </TzButton>
            </>
          ) : (
            <TzButton
              onClick={() => {
                setIsEdit(true);
                form.setFieldsValue(info);
              }}
            >
              {translations.edit}
            </TzButton>
          )}
        </>
      }
    >
      <TzForm form={form}>
        <ArtTemplateDataInfo data={dataInfoList} span={2} />
      </TzForm>
    </TzCard>
  );
};
export default forwardRef(BaseInfo);
