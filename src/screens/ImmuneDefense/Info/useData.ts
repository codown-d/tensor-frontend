import produce from 'immer';
import { useCallback, useEffect, useReducer, useState } from 'react';
import { BehavioralLearnInfoRes } from '../../../definitions';
import { fetchBehavioralLearnInfo } from '../../../services/DataService';
import { merge, set } from 'lodash';
import { useSetState } from 'ahooks';
import { SetState } from 'ahooks/lib/useSetState';

export enum ActionType {
  SET_BASIC_INFO = 'SET_BASIC_INFO',
}
export enum SegmentedType {
  COMMAND = 'COMMAND',
  FILE = 'FILE',
  NETWORK = 'NETWORK',
}
// 0、1、2、3分别表示未学习、学习中、已学习未生效、已生效
export enum LearnStatus {
  not_learned,
  learning,
  not_effective,
  validated,
}
const { SET_BASIC_INFO } = ActionType;
export type SetBasicInfo = {
  type: ActionType.SET_BASIC_INFO;
  payload: BehavioralLearnInfoRes | null;
};
type DataAction = SetBasicInfo;
type LearnState = {
  baseInfo?: SetBasicInfo['payload'];
};
const reducer = produce((draft: LearnState, action: DataAction) => {
  switch (action.type) {
    case SET_BASIC_INFO: {
      set(draft, 'baseInfo', action.payload);
      break;
    }
    default:
  }
});
export type LearnParamsRes = LearnState & {
  getBehavioralLearnInfo: (resource_id: any) => void;
  setRefreshFn: SetState<{}>;
  refreshFn: {
    [key: string]: () => void;
  };
};
const useData = (resource_id?: number): LearnParamsRes => {
  const [state, dispatch] = useReducer(reducer, {});
  const [refreshFn, setRefreshFn] = useSetState({});
  const setBasicInfo = (payload: SetBasicInfo['payload']) => {
    dispatch({
      type: SET_BASIC_INFO,
      payload: payload,
    });
  };
  let getBehavioralLearnInfo = useCallback((resource_id) => {
    fetchBehavioralLearnInfo({ resource_id }).subscribe((res) => {
      if (res.error) {
        return;
      }
      setBasicInfo(merge(res.getItem()));
    });
  }, []);
  useEffect(() => {
    resource_id && getBehavioralLearnInfo(resource_id);
  }, [resource_id]);
  return {
    ...state,
    getBehavioralLearnInfo,
    setRefreshFn,
    refreshFn,
  };
};

export default useData;
