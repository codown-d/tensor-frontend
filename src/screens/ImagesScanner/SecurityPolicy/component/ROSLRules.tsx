import React, { useMemo } from 'react';
import classNames from 'classnames';
import { find, get, keys, merge, toLower, uniq } from 'lodash';
import moment from 'moment';
import ArtTemplateDataInfo, { renderTagItem } from '../../../../components/ComponentsLibrary/ArtTemplateDataInfo';
import TzTextArea from '../../../../components/ComponentsLibrary/TzTextArea';
import { TzCard, TzCardHeaderState } from '../../../../components/tz-card';
import { TzCheckbox } from '../../../../components/tz-checkbox';
import { TzFormItem, TzFormItemsSubTit } from '../../../../components/tz-form';
import { TzInput } from '../../../../components/tz-input';
import { TzRadio, TzRadioGroup } from '../../../../components/tz-radio';
import { TzSelect } from '../../../../components/tz-select';
import { langGap, lowerUpperFirst } from '../../../../helpers/until';
import { translations } from '../../../../translations/translations';
import { useAssetsClusterList } from '../../../../helpers/use_fun';
import useLayoutMainSearchWid from '../../../../helpers/useLayoutMainSearchWid';
import Form from 'antd/lib/form';
import { useUpdateEffect } from 'ahooks';
import { RenderTag, TzTag } from '../../../../components/tz-tag';
import { TzSwitch } from '../../../../components/tz-switch';
import { StrategyAction, segmentedOp } from '../../../../components/ComponentsLibrary/TzStrategyAction';
import { tabType } from '../../ImagesScannerScreen';
import { NamePath } from 'rc-field-form/lib/interface';
import { useFormErrorInfo } from '../../../../components/tz-form/useFormLib';
import { securityPolicyValidator } from '../SecurityPolicyEdit';

const LICENSE_MAP = ['GPL', 'MIT', 'Apache License', 'BSD', 'MPL', 'FreeBSD', 'ISC'];

const ROSLRules = (props: any) => {
  let { form, errorFields, title, id, imageFromType, setErrorFields } = props;
  let { errorInfo } = useFormErrorInfo(errorFields, ['pkgLicense.black']);
  return (
    <TzCard className={classNames({ 'has-error': errorInfo })} title={title} id={id}>
      <TzFormItem
        label={translations.functionSwitch}
        name={['pkgLicense', 'enable']}
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
          name={['pkgLicense', 'action']}
          initialValue={'alarm'}
        >
          <StrategyAction data={segmentedOp} />
        </TzFormItem>
      )}
      <TzFormItemsSubTit errorInfo={errorInfo} />

      <TzFormItem
        rules={[
          (formInstance) => ({
            validator: () => securityPolicyValidator(formInstance, setErrorFields, 'pkgLicense'),
          }),
        ]}
        label={translations.disallowedOpen}
        name={['pkgLicense', 'black']}
        className={'mb0'}
        initialValue={[]}
        dependencies={[['pkgLicense', 'enable']]}
      >
        <TzSelect
          placeholder={translations.clusterManage_placeholder + translations.disallowedOpen}
          mode="tags"
          showArrow={false}
          dropdownStyle={{ display: 'none' }}
        />
      </TzFormItem>
    </TzCard>
  );
};
export let usePkgLicenseDataInfo = (pkgLicense: { [x: string]: any }) => {
  const dataInfo = useMemo(() => {
    if (!pkgLicense) return [];
    let obj: any = {
      action: translations.imageReject_strategy_action_title,
      black: translations.disallowedOpen,
    };
    return keys(obj).map((key) => {
      const content = get(pkgLicense, key) || '-';
      let o: any = {
        title: `${obj[key] || '-'}：`,
        content,
      };
      if ('action' === key) {
        o['className'] = 'item-flex-center';
        o['render'] = (row: any) => {
          return <RenderTag type={pkgLicense[key]} />;
        };
      }
      if ('black' === key) {
        o = merge(o, renderTagItem(pkgLicense?.[key], o));
      }
      return o;
    });
  }, [pkgLicense]);
  return dataInfo;
};
export let PkgLicenseDetailDom = (props: { data: any; imageFromType: tabType }) => {
  let { data, imageFromType } = props;
  let dataInfo = usePkgLicenseDataInfo(data);
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
ROSLRules.Detail = ({ data, id, title, imageFromType }: any) => {
  let pkgLicense = data.pkgLicense || {};
  return (
    <TzCard
      title={
        <>
          {title}
          <RenderTag type={pkgLicense.enable + ''} className={'ml10'} />
        </>
      }
      id={id}
      bodyStyle={{ paddingTop: 0, paddingBottom: 0 }}
    >
      <PkgLicenseDetailDom data={pkgLicense} imageFromType={imageFromType} />
    </TzCard>
  );
};
export default ROSLRules;
