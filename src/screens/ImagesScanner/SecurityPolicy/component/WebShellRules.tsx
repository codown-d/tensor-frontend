import React, { useMemo } from 'react';
import classNames from 'classnames';
import { find, get, keys, merge, toLower, uniq } from 'lodash';
import ArtTemplateDataInfo, {
  renderTagItem,
} from '../../../../components/ComponentsLibrary/ArtTemplateDataInfo';
import { TzCard, TzCardHeaderState } from '../../../../components/tz-card';
import { TzFormItem, TzFormItemsSubTit } from '../../../../components/tz-form';
import { TzSelect } from '../../../../components/tz-select';
import { translations } from '../../../../translations/translations';
import { RenderTag, TzTag } from '../../../../components/tz-tag';
import { TzSwitch } from '../../../../components/tz-switch';
import { riskLevel } from '../../../ImageReject/ImageNewStrategy';
import {
  StrategyAction,
  segmentedOp,
} from '../../../../components/ComponentsLibrary/TzStrategyAction';
import { tabType } from '../../ImagesScannerScreen';
import { useFormErrorInfo } from '../../../../components/tz-form/useFormLib';
import { securityPolicyValidator } from '../SecurityPolicyEdit';
const WebShellRules = (props: any) => {
  let { form, errorFields, title, id, imageFromType, setErrorFields } = props;
  let { errorInfo } = useFormErrorInfo(errorFields, ['webshell.riskLevel']);
  return (
    <TzCard
      bodyStyle={{ padding: '0 24px 4px 24px' }}
      className={classNames({ 'has-error': errorInfo })}
      title={title}
      id={id}
    >
      <TzFormItem
        label={translations.functionSwitch}
        name={['webshell', 'enable']}
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
          label={translations.imageReject_strategy_action_title}
          name={['webshell', 'action']}
          initialValue={'alarm'}
        >
          <StrategyAction data={segmentedOp} />
        </TzFormItem>
      )}
      <TzFormItemsSubTit errorInfo={errorInfo} />

      <TzFormItem
        rules={[
          (formInstance) => ({
            validator: () => securityPolicyValidator(formInstance, setErrorFields, 'webshell'),
          }),
        ]}
        label={translations.risk_level}
        name={['webshell', 'riskLevel']}
        initialValue={[]}
        dependencies={[['webshell', 'enable']]}
      >
        <TzSelect
          style={{ maxWidth: 260 }}
          showSearch={false}
          mode="multiple"
          allowClear
          placeholder={`${translations.originalWarning_pleaseSelect}`}
          options={riskLevel}
        />
      </TzFormItem>
    </TzCard>
  );
};

export let WebShellDataInfo = (webshell: { [x: string]: any }) => {
  const dataInfo = useMemo(() => {
    if (!webshell) return [];
    let obj: any = {
      action: translations.imageReject_strategy_action_title,
      riskLevel: translations.risk_level,
    };
    return keys(obj).map((key) => {
      const content = get(webshell, key) || '-';
      let o: any = {
        title: `${obj[key] || '-'}：`,
        content,
      };
      if ('action' === key) {
        o['className'] = 'item-flex-center';
        o['render'] = (row: any) => {
          return <RenderTag type={webshell[key]} />;
        };
      }
      if ('riskLevel' === key) {
        let node = webshell?.[key].map((item: string) => {
          return riskLevel.find((ite) => {
            return ite.value === item;
          })?.label;
        });
        o = merge(o, renderTagItem(node, o));
      }
      return o;
    });
  }, [webshell]);
  return dataInfo;
};
export let WebShellDetailDom = (props: { data: any; imageFromType: tabType }) => {
  let { data, imageFromType } = props;
  let dataInfo = WebShellDataInfo(data);
  return (
    <>
      {imageFromType === tabType.deploy ? (
        <ArtTemplateDataInfo data={dataInfo.slice(0, 1)} span={1} rowProps={{ gutter: [0, 0] }} />
      ) : null}
      <TzFormItemsSubTit />
      <ArtTemplateDataInfo data={dataInfo.slice(-1)} span={1} rowProps={{ gutter: [0, 0] }} />
    </>
  );
};
WebShellRules.Detail = ({ data, id, title, imageFromType }: any) => {
  let webshell = data.webshell || {};
  return (
    <TzCard
      title={
        <>
          {title}
          <RenderTag type={webshell?.enable + ''} className={'ml10'} />
        </>
      }
      id={id}
      bodyStyle={{ paddingTop: 0, paddingBottom: 0 }}
    >
      <WebShellDetailDom data={webshell} imageFromType={imageFromType} />
    </TzCard>
  );
};
export default WebShellRules;
