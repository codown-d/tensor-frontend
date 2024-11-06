import React, { useMemo } from 'react';
import classNames from 'classnames';
import { get, keys, merge, toLower, uniq } from 'lodash';
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
import { sensitiveRuleList } from '../../../../services/DataService';
import { curriedFormItemLabel } from './util';
import { StrategyAction, segmentedOp } from '../../../../components/ComponentsLibrary/TzStrategyAction';
import { tabType } from '../../ImagesScannerScreen';
import TzSelectTag from '../../../../components/ComponentsLibrary/TzSelectTag';
import { PageTitle } from '../../ImagesCI/CI';

const fieldsLabelMap: any = {
  enable: translations.functionSwitch,
  white: translations.custom_application_path,
};
const curriedLabel = curriedFormItemLabel(fieldsLabelMap);
// 木马病毒规则
const TrojanVirusRules = (props: any) => {
  let { form, errorFields, title, id, imageFromType } = props;
  return (
    <TzCard
      bodyStyle={{ padding: '0 24px 4px 24px' }}
      className={classNames({ 'has-error': errorFields['vuln.enable'] })}
      title={<TzCardHeaderState title={title} errorInfo={errorFields['vuln.enable']} />}
      id={id}
    >
      <TzFormItem
        label={translations.functionSwitch}
        name={['malware', 'enable']}
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
          name={['malware', 'action']}
          initialValue={'alarm'}
        >
          <StrategyAction data={segmentedOp} />
        </TzFormItem>
      )}
      <PageTitle title={translations.rule_conditions} className={'f14 mt16 mb12'} style={{ color: '#3e4653' }} />
      <p className="form-text">{translations.trojan_virus_present}</p>

      <PageTitle title={translations.rule_white_list} className={'f14 mt16 mb12'} style={{ color: '#3e4653' }} />
      <TzFormItem label={curriedLabel('white')} name={['malware', 'white']}>
        <TzSelectTag placeholder={translations.unStandard.securityPolicyMalwarePathTip} />
      </TzFormItem>
    </TzCard>
  );
};
export let useMalwareFileDataInfo = (malware: { [x: string]: any }) => {
  const dataInfo = useMemo(() => {
    if (!malware) return [];
    let obj: any = {
      action: translations.imageReject_strategy_action_title + '：',
      white: translations.custom_application_path + '：',
    };
    return keys(obj).map((key) => {
      const content = get(malware, key) || '-';
      let o: any = {
        title: obj[key] || '-',
        content,
      };
      if ('action' === key) {
        o['className'] = 'item-flex-center';
        o['render'] = (row: any) => {
          return <RenderTag type={malware[key]} />;
        };
      }
      if ('black' === key || 'white' === key) {
        o = merge(o, renderTagItem(malware?.[key], o));
      }
      return o;
    });
  }, [malware]);
  return dataInfo;
};
export let MalwareDetailDom = (props: { data: any; imageFromType: tabType }) => {
  let { data, imageFromType } = props;
  let dataInfo = useMalwareFileDataInfo(data);
  return (
    <>
      {imageFromType === tabType.deploy ? (
        <ArtTemplateDataInfo data={dataInfo.slice(0, 1)} span={1} rowProps={{ gutter: [0, 0] }} />
      ) : null}
      <TzFormItemsSubTit />
      <p className="form-text mb20">{translations.trojan_virus_present}</p>
      <TzFormItemsSubTit title={translations.rule_white_list} />
      <ArtTemplateDataInfo data={dataInfo.slice(-1)} span={1} rowProps={{ gutter: [0, 0] }} />
    </>
  );
};
TrojanVirusRules.Detail = ({ data, id, title, imageFromType }: any) => {
  let malware = data.malware || {};
  return (
    <TzCard
      title={
        <>
          {title}
          <RenderTag type={malware.enable + ''} className={'ml10'} />
        </>
      }
      id={id}
      bodyStyle={{ paddingTop: 4, paddingBottom: 0 }}
    >
      <MalwareDetailDom data={malware} imageFromType={imageFromType} />
    </TzCard>
  );
};
export default TrojanVirusRules;
