import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TzButton } from '../../../components/tz-button';
import { translations } from '../../../translations/translations';
import { CardProps } from 'antd/lib/card';
import TzAnchor, { useAnchorItem } from '../../../components/ComponentsLibrary/TzAnchor';
import useData from '../../ImmuneDefense/Info/useData';
import { immuneDefenseItems } from '../../ImmuneDefense/Info';
import { ImmuneDefenseContext } from '../../ImmuneDefense/Info/context';
import AssetModelStep from './AssetModelStep';
import { TzSpace } from '../../../components/tz-space';
import { LEARNING_STATUS } from '../../ImmuneDefense/util';
import useLearnOpr from '../../ImmuneDefense/hooks/useLearnOpr';
import AssetBaseInfo from './AssetBaseInfo';
import { useDebounceFn } from 'ahooks';

export default function (props: { cardProps?: CardProps }) {
  const [result] = useSearchParams();
  let [query] = useState({ id: Number(result.get('resource_id')) });
  const state = useData(query.id);
  const { handleOprClick } = useLearnOpr();
  const { baseInfo, getBehavioralLearnInfo } = state;
  const learnStatusObj = LEARNING_STATUS[baseInfo?.learn_status ?? -1];
  let { resource_id, learn_status, is_can_learn } = baseInfo || {};
  const { oprKeys } = learnStatusObj || {};
  const { run } = useDebounceFn(handleOprClick, {
    wait: 500,
  });
  let { pageKey } = useAnchorItem();
  return (
    <div className="asset-immune-defense immune-defense">
      <div className="flex-r">
        <ImmuneDefenseContext.Provider value={{ ...state }}>
          <div className="flex-c mt20" style={{ flex: 1, paddingBottom: '44px', width: 0 }}>
            {immuneDefenseItems.map(({ component: Com, href, title }) => {
              let key = pageKey + '_';
              return href === '#modelStep' ? (
                <AssetModelStep
                  id={href.replace('#', key)}
                  title={title}
                  extra={
                    <TzSpace size={16}>
                      {is_can_learn
                        ? oprKeys?.map((v) => (
                            <TzButton
                              size={'small'}
                              key={v}
                              onClick={(e) => {
                                if (resource_id) {
                                  run(
                                    {
                                      type: v,
                                      resource_ids: resource_id,
                                      learn_status,
                                    },
                                    () => {
                                      getBehavioralLearnInfo(query.id);
                                    },
                                    e,
                                  );
                                }
                              }}
                            >
                              {(translations as any)[v]}
                            </TzButton>
                          ))
                        : null}
                    </TzSpace>
                  }
                />
              ) : href === '#baseInfo' ? (
                <AssetBaseInfo id={href.replace('#', key)} title={title} />
              ) : (
                <Com id={href.replace('#', key)} title={title} />
              );
            })}
          </div>
        </ImmuneDefenseContext.Provider>
        <TzAnchor items={immuneDefenseItems} />
      </div>
    </div>
  );
}
