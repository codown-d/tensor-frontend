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

const BaseImageRules = (props: any) => {
  let { form, errorFields, title, id, imageFromType } = props;
  return (
    <TzCard title={<TzCardHeaderState title={title} errorInfo={errorFields['vuln.enable']} />} id={id}>
      <TzFormItem
        label={translations.functionSwitch}
        name={['baseImage', 'enable']}
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
          name={['baseImage', 'action']}
          initialValue={'alarm'}
        >
          <StrategyAction data={segmentedOp} />
        </TzFormItem>
      )}
      <TzFormItemsSubTit />
      <p className="form-text">{translations.application_base_image}</p>
    </TzCard>
  );
};
export let useBaseImageDataInfo = (baseImage: { [x: string]: any }) => {
  const dataInfo = useMemo(() => {
    if (!baseImage) return [];
    let obj: any = {
      action: translations.imageReject_strategy_action_title,
    };
    return keys(obj).map((key) => {
      const content = get(baseImage, key) || '-';
      let o: any = {
        title: `${obj[key] || '-'}：`,
        content,
      };
      if ('action' === key) {
        o['className'] = 'item-flex-center';
        o['render'] = (row: any) => {
          return <RenderTag type={baseImage[key]} />;
        };
      }
      return o;
    });
  }, [baseImage]);
  return dataInfo;
};
export let BaseImageDetailDom = (props: { data: any; imageFromType: tabType }) => {
  let { data, imageFromType } = props;
  let dataInfo = useBaseImageDataInfo(data);
  return (
    <>
      {imageFromType === tabType.deploy ? (
        <ArtTemplateDataInfo data={dataInfo.slice(0, 1)} span={1} rowProps={{ gutter: [0, 0] }} />
      ) : null}
      <TzFormItemsSubTit />
      <p className="form-text mb12">{translations.imageReject_baseimage_cfg_title}</p>
    </>
  );
};
BaseImageRules.Detail = ({ data, id, title, imageFromType }: any) => {
  let baseImage = data.baseImage || {};
  return (
    <TzCard
      title={
        <>
          {title}
          <RenderTag type={baseImage.enable + ''} className={'ml10'} />
        </>
      }
      id={id}
      bodyStyle={{ paddingTop: 0, paddingBottom: 0 }}
    >
      <BaseImageDetailDom data={baseImage} imageFromType={imageFromType} />
    </TzCard>
  );
};
export default BaseImageRules;
