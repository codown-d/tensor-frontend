import Form from 'antd/lib/form';
import classNames from 'classnames';
import { get, keys, merge } from 'lodash';
import React, { useMemo } from 'react';
import ArtTemplateDataInfo, {
  renderTagItem,
} from '../../../../components/ComponentsLibrary/ArtTemplateDataInfo';
import {
  StrategyAction,
  segmentedOp,
} from '../../../../components/ComponentsLibrary/TzStrategyAction';
import TzSelectTag from '../../../../components/ComponentsLibrary/TzSelectTag';
import { TzCard, TzCardHeaderState } from '../../../../components/tz-card';
import { TzCheckbox } from '../../../../components/tz-checkbox';
import { TzFormItem, TzFormItemsSubTit } from '../../../../components/tz-form';
import { TzSwitch } from '../../../../components/tz-switch';
import { RenderTag, TzTag } from '../../../../components/tz-tag';
import { translations } from '../../../../translations/translations';
import { tabType } from '../../ImagesScannerScreen';
import { NamePath } from 'rc-field-form/lib/interface';
import { useFormErrorInfo } from '../../../../components/tz-form/useFormLib';
import { securityPolicyValidator } from '../SecurityPolicyEdit';

const AEVRules = (props: any) => {
  let { form, errorFields, title, id, imageFromType, setErrorFields } = props;
  let { errorInfo } = useFormErrorInfo(errorFields, ['env.checkPassword', 'env.black']);
  return (
    <TzCard className={classNames({ 'has-error': errorInfo })} title={title} id={id}>
      <TzFormItem
        label={translations.functionSwitch}
        name={['env', 'enable']}
        valuePropName="checked"
        initialValue={false}
      >
        <TzSwitch
          checkedChildren={translations.confirm_modal_isopen}
          unCheckedChildren={translations.confirm_modal_isclose}
        />
      </TzFormItem>
      {tabType.deploy === imageFromType && (
        <TzFormItem
          initialValue={'alarm'}
          label={translations.imageReject_strategy_action_title}
          name={['env', 'action']}
        >
          <StrategyAction data={segmentedOp} />
        </TzFormItem>
      )}
      <TzFormItemsSubTit errorInfo={errorInfo} />

      <TzFormItem
        name={['env', 'checkPassword']}
        valuePropName="checked"
        className="mb12"
        initialValue={false}
        rules={[
          (formInstance) => ({
            validator: () => securityPolicyValidator(formInstance, setErrorFields, 'env'),
          }),
        ]}
        dependencies={[
          ['env', 'enable'],
          ['env', 'black'],
        ]}
      >
        <TzCheckbox>{translations.env_var_containing_pwd}</TzCheckbox>
      </TzFormItem>
      <TzFormItem
        label={translations.customEnvironmentVariables}
        name={['env', 'black']}
        className={'mb0'}
        initialValue={[]}
        rules={[
          (formInstance) => ({
            validator: () => securityPolicyValidator(formInstance, setErrorFields, 'env'),
          }),
        ]}
        dependencies={[
          ['env', 'enable'],
          ['env', 'checkPassword'],
        ]}
      >
        <TzSelectTag placeholder={translations.unStandard.envVarTip} />
      </TzFormItem>
    </TzCard>
  );
};
export let useEnvDataInfo = (env: { [x: string]: any }) => {
  const dataInfo = useMemo(() => {
    if (!env) return [];
    let obj: any = {
      action: translations.imageReject_strategy_action_title,
      black: translations.customEnvironmentVariables,
    };
    return keys(obj).map((key) => {
      const content = get(env, key) || '-';
      let o: any = {
        title: `${obj[key] || '-'}：`,
        content,
      };
      if ('action' === key) {
        o['className'] = 'item-flex-center';
        o['render'] = (row: any) => {
          return <RenderTag type={env[key]} />;
        };
      }
      if ('black' === key) {
        o = merge(o, renderTagItem(env?.[key], o));
      }
      return o;
    });
  }, [env]);
  return dataInfo;
};
export let EnvDetailDom = (props: { data: any; imageFromType: tabType }) => {
  let { data, imageFromType } = props;
  if (!data) return null;
  let dataInfo = useEnvDataInfo(data);
  return (
    <>
      {imageFromType === tabType.deploy ? (
        <ArtTemplateDataInfo data={dataInfo.slice(0, 1)} span={1} rowProps={{ gutter: [0, 0] }} />
      ) : null}
      <TzFormItemsSubTit />
      <TzCheckbox disabled={true} checked={data?.checkPassword} className="mb12">
        {translations.env_var_containing_pwd}
      </TzCheckbox>
      <ArtTemplateDataInfo data={dataInfo.slice(-1)} span={1} rowProps={{ gutter: [0, 0] }} />
    </>
  );
};
AEVRules.Detail = ({ data, id, title, imageFromType }: any) => {
  let env = data.env || {};
  return (
    <TzCard
      title={
        <>
          {title}
          <RenderTag type={env.enable + ''} className={'ml10'} />
        </>
      }
      id={id}
      bodyStyle={{ paddingTop: 0, paddingBottom: 0 }}
    >
      <EnvDetailDom data={env} imageFromType={imageFromType} />
    </TzCard>
  );
};
export default AEVRules;
