import React, { useMemo } from 'react';
import Form from 'antd/lib/form';
import classNames from 'classnames';
import { find, get, keys, toLower } from 'lodash';
import ArtTemplateDataInfo from '../../../../components/ComponentsLibrary/ArtTemplateDataInfo';
import TzTextArea from '../../../../components/ComponentsLibrary/TzTextArea';
import { TzCard, TzCardHeaderState } from '../../../../components/tz-card';
import { TzCheckbox } from '../../../../components/tz-checkbox';
import { TzFormItem } from '../../../../components/tz-form';
import { TzInput } from '../../../../components/tz-input';
import { TzRadioGroup, TzRadio } from '../../../../components/tz-radio';
import { getTime, langGap, lowerUpperFirst } from '../../../../helpers/until';
import { translations } from '../../../../translations/translations';
import { useAssetsClusterList } from '../../../../helpers/use_fun';
import { tabType } from '../../ImagesScannerScreen';
import { curriedFormItemLabel } from './util';
import { useGetLibrary } from '../../../../services/ServiceHook';
import { TzSwitch } from '../../../../components/tz-switch';
import { useFormErrorInfo } from '../../../../components/tz-form/useFormLib';
import { TzTooltip } from '../../../../components/tz-tooltip';
import { securityPolicyValidator } from '../SecurityPolicyEdit';
import TzSelectTag from '../../../../components/ComponentsLibrary/TzSelectTag';
import TzSelect from '../../../../components/ComponentsLibrary/tzSelect';
const fieldsLabelMap: any = {
  name: translations.policyName,
  creator: translations.creator,
  createdAt: translations.runtimePolicy_policy_created,
  updater: translations.updated_by,
  updatedAt: translations.update_time,
  scope: translations.effectiveness_scope,
  deployMod: translations.microseg_namespace_strategyMode,
  comment: translations.imageReject_comment_title,
};

const curriedLabel = curriedFormItemLabel(fieldsLabelMap);
export let deployModOp = [
  {
    value: 'base',
    label: translations.imageReject_reject_moda_base,
  },
  {
    value: 'safe',
    label: translations.imageReject_reject_moda_safe,
  },
];
const BaseInfo = (props: any) => {
  let { form, errorFields, title, id, imageFromType, setErrorFields } = props;
  const clusterList = useAssetsClusterList();
  const libraryList = useGetLibrary();
  const scopeType = Form.useWatch(['scope', 'scopeType'], form);
  const allCluster = Form.useWatch(['scope', 'allCluster'], form);
  const allReg = Form.useWatch(['scope', 'allReg'], form);
  let { errorInfo } = useFormErrorInfo(errorFields, [
    'name',
    'scope.allReg',
    'scope.regIds',
    'scope.allCluster',
    'scope.clusterKey',
    'scope.imageRegexp',
  ]);
  return (
    <TzCard
      className={classNames({ 'has-error': errorInfo })}
      title={<TzCardHeaderState title={title} errorInfo={errorInfo} />}
      id={id}
    >
      <TzFormItem
        label={translations.policyName}
        name="name"
        rules={[
          {
            required: true,
            message: translations.unStandard.notEmptyTip(translations.policyName),
          },
        ]}
      >
        <TzInput
          maxLength={50}
          placeholder={translations.unStandard.inputMaxLenTip(toLower(curriedLabel('name')), 50)}
        />
      </TzFormItem>
      {imageFromType === tabType.deploy ? (
        <>
          <TzFormItem
            label={translations.microseg_namespace_status}
            name={'enable'}
            valuePropName="checked"
            initialValue={false}
          >
            <TzSwitch
              checkedChildren={translations.superAdmin_loginLdapConfig_enable}
              unCheckedChildren={translations.deactivateC}
            />
          </TzFormItem>
          <TzFormItem name={['scope', 'scopeType']} initialValue={'image'} style={{ marginBottom: '8px' }} hidden>
            <TzRadioGroup>
              <TzRadio value="image">{translations.mirror_expression}</TzRadio>
            </TzRadioGroup>
          </TzFormItem>
          <TzFormItem
            name={['scope', 'imageRegexp']}
            label={translations.effectiveness_scope}
            initialValue={[]}
            rules={[
              { required: true },
              (formInstance) => ({
                validator: () => securityPolicyValidator(formInstance, setErrorFields, 'scope'),
              }),
            ]}
            extra={translations.unStandard.str80}
          >
            <TzSelectTag
              placeholder={lowerUpperFirst(
                `${translations.originalWarning_pleaseSelect}${langGap}${translations.mirror_expression}`,
              )}
            />
          </TzFormItem>
          <TzFormItem
            tooltip={translations.unStandard.str291}
            label={translations.microseg_namespace_strategyMode}
            name={'deployMod'}
            initialValue={'base'}
          >
            <TzRadioGroup>
              {deployModOp.map((item) => (
                <TzRadio value={item.value}>{item.label}</TzRadio>
              ))}
            </TzRadioGroup>
          </TzFormItem>
        </>
      ) : (
        <TzFormItem
          label={curriedLabel('scope')}
          name={['scope']}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <TzFormItem
            name={['scope', 'scopeType']}
            initialValue={imageFromType === tabType.registry ? 'registry' : 'cluster'}
            style={{ paddingBottom: '4px', margin: '0px' }}
            rules={[
              (formInstance) => ({
                validator: () => securityPolicyValidator(formInstance, setErrorFields, 'scope'),
              }),
            ]}
          >
            <TzRadioGroup>
              {imageFromType === tabType.registry ? (
                <TzRadio value="registry">{translations.library}</TzRadio>
              ) : (
                <TzRadio value="cluster">{translations.clusterManage_key}</TzRadio>
              )}
              <TzRadio value="image">{translations.mirror_expression}</TzRadio>
            </TzRadioGroup>
          </TzFormItem>
          {scopeType === 'registry' ? (
            <>
              <TzFormItem
                name={['scope', 'allReg']}
                valuePropName="checked"
                style={{ marginBottom: '4px' }}
                initialValue={true}
                rules={[
                  (formInstance) => ({
                    validator: () => securityPolicyValidator(formInstance, setErrorFields, 'scope'),
                  }),
                ]}
                dependencies={[
                  ['scope', 'regIds'],
                  ['scope', 'scopeType'],
                ]}
              >
                <TzCheckbox>{translations.all_warehouses}</TzCheckbox>
              </TzFormItem>
              <TzFormItem
                hidden={scopeType !== 'registry'}
                name={['scope', 'regIds']}
                initialValue={[]}
                style={{ marginBottom: '0px' }}
                rules={[
                  (formInstance) => ({
                    validator: () => securityPolicyValidator(formInstance, setErrorFields, 'scope'),
                  }),
                ]}
                dependencies={[
                  ['scope', 'allReg'],
                  ['scope', 'scopeType'],
                ]}
              >
                <TzSelect
                  isSelection={false}
                  maxTagCount="responsive"
                  allowClear
                  mode="multiple"
                  placeholder={translations.scanner_config_chooseRepo}
                  options={libraryList}
                  disabled={allReg}
                />
              </TzFormItem>
            </>
          ) : null}
          {scopeType === 'cluster' ? (
            <>
              <TzFormItem
                name={['scope', 'allCluster']}
                valuePropName="checked"
                style={{ marginBottom: '4px' }}
                dependencies={[
                  ['scope', 'scopeType'],
                  ['scope', 'clusterKey'],
                ]}
                initialValue={true}
                rules={[
                  (formInstance) => ({
                    validator: () => securityPolicyValidator(formInstance, setErrorFields, 'scope'),
                  }),
                ]}
              >
                <TzCheckbox>{translations.clusterManage_key}</TzCheckbox>
              </TzFormItem>
              <TzFormItem
                hidden={scopeType !== 'cluster'}
                name={['scope', 'clusterKey']}
                dependencies={[
                  ['scope', 'scopeType'],
                  ['scope', 'allCluster'],
                ]}
                style={{ marginBottom: '0px' }}
                initialValue={[]}
                rules={[
                  (formInstance) => ({
                    validator: () => securityPolicyValidator(formInstance, setErrorFields, 'scope'),
                  }),
                ]}
              >
                <TzSelect
                  isSelection={false}
                  maxTagCount="responsive"
                  allowClear
                  mode="multiple"
                  placeholder={translations.activeDefense_clusterPla}
                  options={clusterList}
                  disabled={allCluster}
                />
              </TzFormItem>{' '}
            </>
          ) : null}
          <TzFormItem
            hidden={scopeType !== 'image'}
            name={['scope', 'imageRegexp']}
            initialValue={[]}
            style={{ margin: 0 }}
            rules={[
              (formInstance) => ({
                validator: () => securityPolicyValidator(formInstance, setErrorFields, 'scope'),
              }),
            ]}
            extra={translations.unStandard.str80}
            dependencies={[['scope', 'scopeType']]}
          >
            <TzSelectTag
              placeholder={lowerUpperFirst(
                `${translations.originalWarning_pleaseSelect}${langGap}${translations.mirror_expression}`,
              )}
            />
          </TzFormItem>
        </TzFormItem>
      )}
      <TzFormItem label={curriedLabel('comment')} name="comment" className={'mb0'}>
        <TzTextArea
          maxLength={150}
          placeholder={translations.unStandard.inputMaxLenTip(toLower(curriedLabel('comment')), 150)}
        ></TzTextArea>
      </TzFormItem>
    </TzCard>
  );
};
export let useBaseInfoDataInfo = (data: { [x: string]: any }, imageFromType: tabType) => {
  const clusterList = useAssetsClusterList();
  const libraryList = useGetLibrary();
  const dataInfo = useMemo(() => {
    if (keys(data).length == 0) return [];
    let obj: any = {
      creator: translations.creator,
      createdAt: translations.runtimePolicy_policy_created,
      updater: translations.updated_by,
      updatedAt: translations.update_time,
      scope: translations.effectiveness_scope,
      deployMod: translations.microseg_namespace_strategyMode,
      comment: translations.imageReject_comment_title,
    };
    if (imageFromType !== tabType.deploy) {
      delete obj['deployMod'];
    }
    return keys(obj)
      .map((key) => {
        const content = get(data, key) || '-';
        let o: any = {
          title: `${curriedLabel(key) || '-'}：`,
          content,
        };
        if (key === 'scope') {
          if (data[key]?.scopeType === 'image' || !data[key]?.scopeType) {
            o.content = data[key].imageRegexp?.join(' , ') || '-';
          } else if (data[key]?.scopeType === 'registry') {
            if (data[key]?.allReg) {
              o.content = translations.all_warehouses;
            } else {
              const regIds = data[key]?.regIds;
              o['render'] = () => {
                return (
                  regIds
                    ?.map((str: string) => find(libraryList, (v) => v.value === str)?.label || null)
                    .filter((v: string | null) => !!v)
                    .join(' , ') || '-'
                );
              };
            }
          } else if (data[key]?.scopeType === 'cluster') {
            if (data[key]?.allCluster) {
              o.content = translations.all_clusters;
            } else {
              const clusterKey = data[key]?.clusterKey;
              o['render'] = () => {
                return (
                  clusterKey
                    ?.map((str: string) => find(clusterList, (v) => v.value === str)?.label || null)
                    .filter((v: string | null) => !!v)
                    .join(' , ') || '-'
                );
              };
            }
          }
        }
        if (['createdAt', 'updatedAt'].includes(key)) {
          o['render'] = () => {
            return getTime(data[key]);
          };
        }
        if (key === 'comment') {
          o['render'] = () => {
            return content;
          };
        }
        if (key === 'deployMod') {
          o['render'] = () => {
            return (
              <>
                <span className="f-l">{find(deployModOp, (ite) => ite.value === data[key])?.label}</span>
                <TzTooltip title={translations.unStandard.str291} className="ml4">
                  <i className={'icon iconfont icon-wenhao ml4'} style={{ lineHeight: '22px' }}></i>
                </TzTooltip>
              </>
            );
          };
        }
        return o;
      })
      .filter((item) => !!item);
  }, [data, clusterList]);
  return dataInfo;
};
export let BaseInfoDetailDom = (props: { data: any; imageFromType: tabType; from?: 'snapshot' }) => {
  let { data, imageFromType, from } = props;
  let dataInfo = useBaseInfoDataInfo(data, imageFromType);
  let num = imageFromType === tabType.deploy ? -3 : -2;
  return (
    <>
      <ArtTemplateDataInfo
        data={dataInfo.slice(0, num)}
        span={from === 'snapshot' ? 1 : 2}
        rowProps={{ gutter: [0, 0] }}
      />
      <ArtTemplateDataInfo data={dataInfo.slice(num)} span={1} rowProps={{ gutter: [0, 0] }} />
    </>
  );
};
BaseInfo.Detail = ({ data, id, title, imageFromType }: any) => {
  return (
    <TzCard
      title={title}
      id={id}
      className="security-policy-detail-card"
      bodyStyle={{ paddingTop: 0, paddingBottom: 0 }}
    >
      <BaseInfoDetailDom data={data} imageFromType={imageFromType} />
    </TzCard>
  );
};
export default BaseInfo;
