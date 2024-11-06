import React, { useMemo } from 'react';
import classNames from 'classnames';
import { get, keys, toLower, uniq } from 'lodash';
import moment from 'moment';
import ArtTemplateDataInfo from '../../../../components/ComponentsLibrary/ArtTemplateDataInfo';
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
import { tabType } from '../../ImagesScannerScreen';
import { StrategyAction, segmentedOp } from '../../../../components/ComponentsLibrary/TzStrategyAction';

// root 用户启动规则
const ExistInReg = (props: any) => {
  let { form, errorFields, title, id, imageFromType } = props;
  return (
    <TzCard title={<TzCardHeaderState title={title} errorInfo={errorFields['vuln.enable']} />} id={id}>
      <TzFormItem label={translations.functionSwitch} name={['existInReg', 'enable']} valuePropName="checked">
        <TzSwitch
          checkedChildren={translations.confirm_modal_isopen}
          unCheckedChildren={translations.confirm_modal_isclose}
        />
      </TzFormItem>
      {tabType.deploy === imageFromType && (
        <TzFormItem
          label={translations.imageReject_strategy_action_title}
          name={['existInReg', 'action']}
          initialValue={'alarm'}
        >
          <StrategyAction data={segmentedOp} />
        </TzFormItem>
      )}
      <TzFormItemsSubTit />
      <p className="form-text">{translations.image_non_warehouse_image}</p>
    </TzCard>
  );
};
export let useExistInRegDataInfo = (existInReg: { [x: string]: any }) => {
  const dataInfo = useMemo(() => {
    if (!existInReg) return [];
    let obj: any = {
      action: translations.imageReject_strategy_action_title,
    };
    return keys(obj).map((key) => {
      const content = get(existInReg, key) || '-';
      let o: any = {
        title: `${obj[key] || '-'}：`,
        content,
      };
      if ('action' === key) {
        o['className'] = 'item-flex-center';
        o['render'] = (row: any) => {
          return <RenderTag type={existInReg[key]} />;
        };
      }
      return o;
    });
  }, [existInReg]);
  return dataInfo;
};
export let ExistInRegDetailDom = (props: { data: any; imageFromType: tabType }) => {
  let { data, imageFromType } = props;
  let dataInfo = useExistInRegDataInfo(data);
  return (
    <>
      {imageFromType === tabType.deploy ? (
        <ArtTemplateDataInfo data={dataInfo.slice(0, 1)} span={1} rowProps={{ gutter: [0, 0] }} />
      ) : null}
      <TzFormItemsSubTit />
      <p className="form-text mb12">{translations.image_non_warehouse_image}</p>
    </>
  );
};
ExistInReg.Detail = ({ data, id, title, imageFromType }: any) => {
  let existInReg = data.existInReg || {};
  return (
    <TzCard
      title={
        <>
          {title}
          <RenderTag type={existInReg.enable + ''} className={'ml10'} />
        </>
      }
      id={id}
      bodyStyle={{ paddingTop: 0, paddingBottom: 0 }}
    >
      <ExistInRegDetailDom data={existInReg} imageFromType={imageFromType} />
    </TzCard>
  );
};
export default ExistInReg;
