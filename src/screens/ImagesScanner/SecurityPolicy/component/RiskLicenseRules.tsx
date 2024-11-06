import React, { useMemo } from 'react';
import classNames from 'classnames';
import { find, get, keys, merge, toLower, uniq } from 'lodash';
import ArtTemplateDataInfo, { renderTagItem } from '../../../../components/ComponentsLibrary/ArtTemplateDataInfo';
import { TzCard, TzCardHeaderState } from '../../../../components/tz-card';
import { TzFormItem, TzFormItemsSubTit } from '../../../../components/tz-form';
import { TzSelect } from '../../../../components/tz-select';
import { translations } from '../../../../translations/translations';
import { RenderTag, TzTag } from '../../../../components/tz-tag';
import { TzSwitch } from '../../../../components/tz-switch';
import { segmentedOp, StrategyAction } from '../../../../components/ComponentsLibrary/TzStrategyAction';
import { tabType } from '../../ImagesScannerScreen';
import { useFormErrorInfo } from '../../../../components/tz-form/useFormLib';
import { securityPolicyValidator } from '../SecurityPolicyEdit';
import { useViewConst } from '../../../../helpers/use_fun';
import { lowerUpperFirst } from '../../../../helpers/until';

const RiskLicenseRules = (props: any) => {
  let { form, errorFields, title, id, imageFromType, setErrorFields } = props;
  let { errorInfo } = useFormErrorInfo(errorFields, ['license.black']);
  let openLicense = useViewConst({ constType: 'openLicense' });
  return (
    <TzCard className={classNames({ 'has-error': errorInfo })} title={title} id={id}>
      <TzFormItem
        label={translations.functionSwitch}
        name={['license', 'enable']}
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
          name={['license', 'action']}
          initialValue={'alarm'}
        >
          <StrategyAction data={segmentedOp} />
        </TzFormItem>
      )}
      <TzFormItemsSubTit errorInfo={errorInfo} />

      <TzFormItem
        label={translations.risk_license_file_reference}
        name={['license', 'black']}
        className={'mb0'}
        initialValue={[]}
        rules={[
          (formInstance) => ({
            validator: () => securityPolicyValidator(formInstance, setErrorFields, 'license'),
          }),
        ]}
        dependencies={[['license', 'enable']]}
      >
        <TzSelect
          showSearch={false}
          mode="multiple"
          allowClear
          placeholder={translations.unStandard.requireSelectTip(lowerUpperFirst(translations.disallowedOpen))}
          options={openLicense}
        />
      </TzFormItem>
    </TzCard>
  );
};
export let useLicenseDataInfo = (license: { [x: string]: any }) => {
  const dataInfo = useMemo(() => {
    if (!license) return [];
    let obj: any = {
      action: translations.imageReject_strategy_action_title,
      black: translations.disallowedOpen,
    };
    return keys(obj).map((key) => {
      const content = get(license, key) || '-';
      let o: any = {
        title: `${obj[key] || '-'}：`,
        content,
      };
      if ('action' === key) {
        o['className'] = 'item-flex-center';
        o['render'] = (row: any) => {
          return <RenderTag type={license[key]} />;
        };
      }
      if ('black' === key) {
        o = merge(o, renderTagItem(license?.[key], o));
      }
      return o;
    });
  }, [license]);
  return dataInfo;
};
export let LicenseDetailDom = (props: { data: any; imageFromType: tabType }) => {
  let { data, imageFromType } = props;
  let dataInfo = useLicenseDataInfo(data);
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
RiskLicenseRules.Detail = ({ data, id, title, imageFromType }: any) => {
  let license = data.license || {};
  return (
    <TzCard
      title={
        <>
          {title}
          <RenderTag type={license.enable + ''} className={'ml10'} />
        </>
      }
      id={id}
      bodyStyle={{ paddingTop: 0, paddingBottom: 0 }}
    >
      <LicenseDetailDom data={license} imageFromType={imageFromType} />
    </TzCard>
  );
};
export default RiskLicenseRules;
