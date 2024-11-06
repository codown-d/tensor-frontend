import React, { useContext, useEffect, useMemo, useState } from 'react';
import EllipsisPopover from '../../../components/ellipsisPopover/ellipsisPopover';
import { translations } from '../../../translations/translations';
import TzAnchor, { useAnchorItem } from '../../../components/ComponentsLibrary/TzAnchor';
import ModelStep from './components/ModelStep';
import ModelData from './components/ModelData';
import BaseInfo from './components/BaseInfo';
import Record from './components/Record';
import './index.scss';
import useData from './useData';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ImmuneDefenseContext } from './context';
import { useDebounceFn, useMemoizedFn } from 'ahooks';
import { LEARNING_STATUS } from '../util';
import { RenderTag } from '../../../components/tz-tag';
import { Store } from '../../../services/StoreService';
import { TzButton } from '../../../components/tz-button';
import useLearnOpr from '../hooks/useLearnOpr';
import { TzSpace } from '../../../components/tz-space';
import { useActivate } from 'react-activation';
import WebSocketContext from './components/WebSocketContext';

export const immuneDefenseItems = [
  {
    href: '#modelStep',
    title: <EllipsisPopover>{translations.modelStage}</EllipsisPopover>,
    component: ModelStep,
  },
  {
    href: '#baseInfo',
    title: <EllipsisPopover>{translations.policy_info}</EllipsisPopover>,
    component: BaseInfo,
  },
  {
    href: '#modelData',
    title: <EllipsisPopover>{translations.modelBehavior}</EllipsisPopover>,
    component: ModelData,
  },
  {
    href: '#record',
    title: <EllipsisPopover>{translations.operationLog}</EllipsisPopover>,
    component: Record,
  },
];

export default () => {
  const [result] = useSearchParams();
  let [query] = useState({ id: Number(result.get('id')) || -1 });
  const state = useData(query.id);
  const navigate = useNavigate();
  const { handleOprClick } = useLearnOpr();
  const { baseInfo, getBehavioralLearnInfo } = state;

  const { subscribe } = useContext(WebSocketContext);
  const refresh = useMemoizedFn(() => {
    getBehavioralLearnInfo(query.id);
  });
  const { run } = useDebounceFn(handleOprClick, {
    wait: 500,
  });
  const setHeader = useMemoizedFn(() => {
    if (baseInfo?.resource_id) {
      const learnStatusObj = LEARNING_STATUS[baseInfo?.learn_status ?? -1];
      const { oprKeys, type } = learnStatusObj || {};
      let { resource_id, learn_status, is_can_learn } = baseInfo;
      Store.header.next({
        title: (
          <div className="flex-r-c">
            {baseInfo?.name}
            <RenderTag type={type} className="ml12" />
          </div>
        ),
        extra: (
          <TzSpace size={16}>
            {is_can_learn
              ? oprKeys?.map((v) => (
                  <TzButton
                    onClick={(e) =>
                      run(
                        {
                          type: v,
                          resource_ids: resource_id,
                          learn_status,
                        },
                        refresh,
                        e,
                      )
                    }
                    key={v}
                  >
                    {(translations as any)[v]}
                  </TzButton>
                ))
              : null}
          </TzSpace>
        ),
        onBack: () => {
          navigate(-1);
        },
      });
    }
  });

  const l = useLocation();
  useEffect(setHeader, [baseInfo?.resource_id, baseInfo?.learn_status, l]);
  useEffect(() => {
    baseInfo?.resource_id &&
      subscribe &&
      subscribe({
        domain: 'behavioral_learn',
        scene: 'learning_status',
        type: 'control',
        command: 'start',
        data: { resource_id: baseInfo?.resource_id },
        callback: (data: any) => {
          refresh();
        },
      });
  }, [baseInfo?.resource_id]);
  let getAnchor = useMemo(() => {
    return <TzAnchor items={immuneDefenseItems.map(({ href, title }) => ({ href, title }))} />;
  }, []);
  let { pageKey } = useAnchorItem();
  return (
    <div className="immune-defense-container flex-r mlr32">
      <ImmuneDefenseContext.Provider value={{ ...state }}>
        <div className="flex-c" style={{ flex: 1, paddingBottom: '44px', width: 0 }}>
          {immuneDefenseItems.map(({ component: Com, href, title }) => (
            <Com id={href.replace('#', pageKey + '_')} title={title} key={href} />
          ))}
        </div>
      </ImmuneDefenseContext.Provider>
      {getAnchor}
    </div>
  );
};
