import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import TzInputSearch from '../../../../components/tz-input-search';
import { sensitiveRuleList } from '../../../../services/DataService';
import { curriedFormItemLabel } from './util';
import { segmentedOp, StrategyAction } from '../../../../components/ComponentsLibrary/TzStrategyAction';
import { tabType } from '../../ImagesScannerScreen';
import { useFormErrorInfo } from '../../../../components/tz-form/useFormLib';
import { NamePath } from 'rc-field-form/lib/interface';
import { securityPolicyValidator } from '../SecurityPolicyEdit';
import { useGetSensitiveRuleList } from '../../../../services/ServiceHook';

const fieldsLabelMap: any = {
  enable: translations.functionSwitch,
  black: translations.customizeSensitiveFiles,
  allWhite: translations.all_sensitive_file_rules,
  white: translations.rule_white_list,
};
const curriedLabel = curriedFormItemLabel(fieldsLabelMap);
//敏感文件规则
const SensitiveFileRules = (props: any) => {
  let { form, errorFields, title, id, imageFromType, setErrorFields } = props;
  let sensitiveRuleList = useGetSensitiveRuleList();
  let allBlack = Form.useWatch(['sensitive', 'allBlack'], form);
  let allWhite = Form.useWatch(['sensitive', 'allWhite'], form);
  let { errorInfo } = useFormErrorInfo(errorFields, ['sensitive.enable', 'sensitive.allBlack', 'sensitive.black']);

  return (
    <TzCard className={classNames({ 'has-error': errorInfo })} title={title} id={id}>
      <TzFormItem
        label={curriedLabel('enable')}
        name={['sensitive', 'enable']}
        valuePropName="checked"
        initialValue={false}
        rules={[
          (formInstance) => ({
            validator: () => securityPolicyValidator(formInstance, setErrorFields, 'sensitive'),
          }),
        ]}
      >
        <TzSwitch
          checkedChildren={translations.confirm_modal_isopen}
          unCheckedChildren={translations.confirm_modal_isclose}
        />
      </TzFormItem>

      {tabType.deploy === imageFromType && (
        <TzFormItem
          label={translations.imageReject_strategy_action_title}
          name={['sensitive', 'action']}
          initialValue={'alarm'}
        >
          <StrategyAction data={segmentedOp} />
        </TzFormItem>
      )}
      <TzFormItemsSubTit errorInfo={errorInfo} />
      <TzFormItem label={curriedLabel('black')}>
        <TzFormItem noStyle>
          <TzFormItem
            name={['sensitive', 'allBlack']}
            valuePropName="checked"
            className="mb4"
            initialValue={false}
            rules={[
              (formInstance) => ({
                validator: () => securityPolicyValidator(formInstance, setErrorFields, 'sensitive'),
              }),
            ]}
            dependencies={[
              ['sensitive', 'enable'],
              ['sensitive', 'black'],
            ]}
          >
            <TzCheckbox>{curriedLabel('allWhite')}</TzCheckbox>
          </TzFormItem>
          <TzFormItem
            className="mb0"
            rules={[
              (formInstance) => ({
                validator: () => securityPolicyValidator(formInstance, setErrorFields, 'sensitive'),
              }),
            ]}
            name={['sensitive', 'black']}
            initialValue={[]}
            dependencies={[
              ['sensitive', 'enable'],
              ['sensitive', 'allBlack'],
            ]}
          >
            <TzSelect
              mode="multiple"
              placeholder={translations.select_sensitive_files_rule}
              disabled={allBlack}
              options={sensitiveRuleList}
            />
          </TzFormItem>
        </TzFormItem>
      </TzFormItem>
      <TzFormItemsSubTit title={curriedLabel('white')} />
      <TzFormItem label={curriedLabel('black')} className={'mb0'}>
        <TzFormItem noStyle>
          <TzFormItem name={['sensitive', 'allWhite']} valuePropName="checked" className="mb4">
            <TzCheckbox>{curriedLabel('allWhite')}</TzCheckbox>
          </TzFormItem>
          <TzFormItem className="mb0" name={['sensitive', 'white']}>
            <TzSelect
              mode="multiple"
              placeholder={translations.select_sensitive_files_rule}
              disabled={allWhite}
              options={sensitiveRuleList}
            />
          </TzFormItem>
        </TzFormItem>
      </TzFormItem>
    </TzCard>
  );
};
export let useSensitiveFileDataInfo = (data: { [x: string]: any }) => {
  const dataInfo = useMemo(() => {
    if (!data) return [];
    let obj: any = {
      action: translations.imageReject_strategy_action_title,
      black: translations.customizeSensitiveFiles,
      white: translations.customizeSensitiveFiles,
    };
    return keys(obj).map((key) => {
      let o: any = {
        title: `${obj[key] || '-'}：`,
        content: data[key] || '-',
      };
      if ('action' === key) {
        o['className'] = 'flex-r-c';
        o['render'] = (row: any) => {
          return <RenderTag type={data[key]} />;
        };
      }
      if ('black' === key) {
        if (data['allBlack']) {
          o['titleStyle'] = { alignItems: 'center' };
          o['render'] = () => {
            return <TzTag>{translations.all_sensitive_file_rules}</TzTag>;
          };
        } else {
          o = merge(o, renderTagItem(data?.[key], o));
        }
      }
      if ('white' === key) {
        if (data['allWhite']) {
          o['titleStyle'] = { alignItems: 'center' };
          o['render'] = () => {
            return <TzTag>{translations.all_sensitive_file_rules}</TzTag>;
          };
        } else {
          o = merge(o, renderTagItem(data?.[key], o));
        }
      }
      return o;
    });
  }, [data]);
  return dataInfo;
};
export let SensitiveDetailDom = (props: { sensitive: any; imageFromType: tabType }) => {
  let { sensitive, imageFromType } = props;
  let dataInfo = useSensitiveFileDataInfo(sensitive);
  return (
    <>
      {imageFromType === tabType.deploy ? (
        <ArtTemplateDataInfo data={dataInfo.slice(0, 1)} span={1} rowProps={{ gutter: [0, 0] }} />
      ) : null}
      <TzFormItemsSubTit />
      <ArtTemplateDataInfo data={dataInfo.slice(1, 2)} span={1} rowProps={{ gutter: [0, 0] }} />
      <TzFormItemsSubTit title={translations.rule_white_list} />
      <ArtTemplateDataInfo data={dataInfo.slice(-1)} span={1} rowProps={{ gutter: [0, 0] }} />
    </>
  );
};
SensitiveFileRules.Detail = ({ data, id, title, imageFromType }: any) => {
  let sensitive = data.sensitive || {};
  return (
    <TzCard
      title={
        <>
          {title}
          <RenderTag type={sensitive.enable + ''} className={'ml10'} />
        </>
      }
      id={id}
      bodyStyle={{ paddingTop: 0, paddingBottom: '0px' }}
    >
      <SensitiveDetailDom sensitive={sensitive} imageFromType={imageFromType} />
    </TzCard>
  );
};
export default SensitiveFileRules;
