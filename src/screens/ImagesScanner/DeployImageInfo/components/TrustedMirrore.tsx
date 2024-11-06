import React, { useMemo } from 'react';
import { get, keys } from 'lodash';
import ArtTemplateDataInfo from '../../../../components/ComponentsLibrary/ArtTemplateDataInfo';
import { TzCard, TzCardHeaderState } from '../../../../components/tz-card';
import { TzFormItem, TzFormItemsSubTit } from '../../../../components/tz-form';
import { translations } from '../../../../translations/translations';
import { RenderTag } from '../../../../components/tz-tag';
import { TzSwitch } from '../../../../components/tz-switch';
import { tabType } from '../../ImagesScannerScreen';
import { StrategyAction, segmentedOp } from '../../../../components/ComponentsLibrary/TzStrategyAction';
import { useAnchorItem } from '../../../../components/ComponentsLibrary/TzAnchor';

const TrustedMirrore = (props: any) => {
  let { form, errorFields, title, id, imageFromType } = props;
  let { getPageKey } = useAnchorItem();
  return (
    <TzCard title={<TzCardHeaderState title={title} errorInfo={errorFields['vuln.enable']} />} id={getPageKey(id)}>
      <TzFormItem
        label={translations.functionSwitch}
        name={['trustImage', 'enable']}
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
          name={['trustImage', 'action']}
          initialValue={'alarm'}
        >
          <StrategyAction data={segmentedOp} />
        </TzFormItem>
      )}
      <TzFormItemsSubTit />
      <p className="form-text">{translations.image_non_trusted}</p>
    </TzCard>
  );
};
export let useTrustImageDataInfo = (trustImage: { [x: string]: any }) => {
  const dataInfo = useMemo(() => {
    if (!trustImage) return [];
    let obj: any = {
      action: translations.imageReject_strategy_action_title,
    };
    return keys(obj).map((key) => {
      const content = get(trustImage, key) || '-';
      let o: any = {
        title: `${obj[key] || '-'}：`,
        content,
      };
      if ('action' === key) {
        o['className'] = 'item-flex-center';
        o['render'] = (row: any) => {
          return <RenderTag type={trustImage[key]} />;
        };
      }
      return o;
    });
  }, [trustImage]);
  return dataInfo;
};
export let TrustImageDetailDom = (props: { data: any; imageFromType: tabType }) => {
  let { data, imageFromType } = props;
  let dataInfo = useTrustImageDataInfo(data);
  return (
    <>
      {imageFromType === tabType.deploy ? (
        <ArtTemplateDataInfo data={dataInfo.slice(0, 1)} span={1} rowProps={{ gutter: [0, 0] }} />
      ) : null}
      <TzFormItemsSubTit />
      <p className="form-text mb20">{translations.image_non_trusted}</p>
    </>
  );
};
TrustedMirrore.Detail = ({ data, id, title, imageFromType }: any) => {
  let trustImage = data.trustImage || {};
  return (
    <TzCard
      title={
        <>
          {title}
          <RenderTag type={trustImage.enable + ''} className={'ml10'} />
        </>
      }
      id={id}
      bodyStyle={{ paddingTop: 4 }}
    >
      <TrustImageDetailDom data={trustImage} imageFromType={imageFromType} />
    </TzCard>
  );
};
export default TrustedMirrore;
