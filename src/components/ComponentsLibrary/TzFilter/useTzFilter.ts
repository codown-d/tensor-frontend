import { assign, isArray, keys, set } from 'lodash';
import { createContext, useReducer, useMemo } from 'react';
import { produce } from 'immer';
import {
  FilterFormParam,
  FilterFormValueType,
  FormValues,
} from '../TzFilterForm/filterInterface';
import {
  dataClassify,
  getFieldNameByItem,
  getFormItemByItems,
  TzFilterState,
  FilterData,
  TzFilterParams,
  TzUpdateFilterParams,
} from './util';

type TzFilterBack = {
  addFilter: (payload: FilterFormParam) => void;
  removeFilter: (id: string) => void;
  updateFilter: (payload: TzUpdateFilterParams | FilterFormParam[]) => void;
  updateFormItemValue: (payload: FormValues) => void;
  clearFormItems: () => void;
  updateEnumLabels: (payload: TzFilterState['enumLabels']) => void;
  popoverFilterData: FilterData['popoverFilterData'];
  inputFilterData: FilterData['inputFilterData'];
  state: TzFilterState;
};

enum ActionType {
  INIT_FILTER = 'INIT_FILTER',
  ADD_FILTER = 'ADD_FILTER',
  UPDATE_FILTER = 'UPDATE_FILTER',
  REMOVE_FILTER = 'REMOVE_FILTER',
  UPDATE_FILTER_ITEM = 'UPDATE_FILTER_ITEM',
  REMOVE_ALL = 'REMOVE_ALL',
  UPDATE_FILTER_ITEM_VALUE = 'UPDATE_FILTER_ITEM_VALUE',
  UPDATE_ENUM_LABELS = 'UPDATE_ENUM_LABELS',
}

const {
  UPDATE_FILTER,
  ADD_FILTER,
  REMOVE_FILTER,
  UPDATE_FILTER_ITEM,
  UPDATE_FILTER_ITEM_VALUE,
  REMOVE_ALL,
  UPDATE_ENUM_LABELS,
} = ActionType;

type UpdateAction = { type: ActionType.UPDATE_FILTER; payload: TzFilterState };
type AddAction = { type: ActionType.ADD_FILTER; payload: FilterFormParam };
type RemoveAction = {
  type: ActionType.REMOVE_FILTER;
  payload: string | string[];
};
type RemoveAllAction = { type: ActionType.REMOVE_ALL };
type UpdateFilterItemAction = {
  type: ActionType.UPDATE_FILTER_ITEM;
  payload: FilterFormParam;
};
type UpdateFilterItemValueAction = {
  type: ActionType.UPDATE_FILTER_ITEM_VALUE;
  payload: FilterFormValueType;
};
type UpdateEnumLabels = {
  type: ActionType.UPDATE_ENUM_LABELS;
  payload: TzFilterState['enumLabels'];
};
type FilterDataAction =
  | UpdateAction
  | AddAction
  | RemoveAction
  | UpdateAction
  | UpdateFilterItemAction
  | UpdateFilterItemValueAction
  | RemoveAllAction
  | UpdateEnumLabels;
const reducer = produce((draft: TzFilterState, action: FilterDataAction) => {
  const {
    filterFormItems = [],
    fitlerFormValues = {},
    enumLabels = {},
  } = draft;
  switch (action.type) {
    case UPDATE_FILTER: {
      const _payload = action.payload as UpdateAction['payload'];
      set(draft, 'filterFormItems', _payload.filterFormItems);
      set(draft, 'enumLabels', _payload.enumLabels);
      set(draft, 'fitlerFormValues', _payload.fitlerFormValues);
      break;
    }
    case ADD_FILTER: {
      const _payload = action.payload as AddAction['payload'];
      const { fitlerFormValues: v } = getFormItemByItems([_payload], true);
      filterFormItems.push(_payload);
      assign(fitlerFormValues, v);
      break;
    }
    case REMOVE_FILTER: {
      let _payload: string[];

      if (!isArray(action.payload)) {
        _payload = [action.payload];
      } else {
        _payload = action.payload;
      }

      _payload.forEach((id) => {
        const item = filterFormItems.find((v) => v.name === id);
        if (!item) {
          return;
        }
        const ids = getFieldNameByItem(item);
        ids.forEach((id) => {
          delete fitlerFormValues[id];
        });

        const index = filterFormItems.findIndex(
          (v: FilterFormParam) => v.name === id
        );
        index !== -1 && filterFormItems.splice(index, 1);
      });

      break;
    }
    case UPDATE_FILTER_ITEM: {
      const _payload = action.payload as UpdateFilterItemAction['payload'];
      const index = filterFormItems.findIndex(
        (v: FilterFormParam) => v.name === _payload.name
      );
      const { filterFormItems: i, fitlerFormValues: v } = getFormItemByItems([
        _payload,
      ]);
      index !== -1 && (filterFormItems[index] = i[0]);
      assign(fitlerFormValues, v);
      break;
    }
    case REMOVE_ALL: {
      filterFormItems.splice(0, filterFormItems.length);
      keys(fitlerFormValues).forEach((key) => delete fitlerFormValues[key]);
      break;
    }
    case UPDATE_FILTER_ITEM_VALUE: {
      const _payload = action.payload as UpdateFilterItemValueAction['payload'];
      assign(fitlerFormValues, _payload);
      break;
    }
    case UPDATE_ENUM_LABELS: {
      const _payload = action.payload as UpdateEnumLabels['payload'];
      assign(enumLabels, _payload);
      break;
    }
    default:
  }
});

const useTzFilter = (params: TzFilterParams): TzFilterBack => {
  const { initial } = params;
  const transData = useMemo(() => getFormItemByItems(params, true), [params]);
  const [state, dispatch] = useReducer(reducer, transData);
  const { filterFormItems } = state;

  const filterData = useMemo(() => dataClassify(initial), [initial]);

  const updateFilter = (payload: TzUpdateFilterParams | FilterFormParam[]) => {
    let initialValues: TzFilterState['fitlerFormValues'] = {};
    let initialEnumLabels: TzFilterState['enumLabels'] = {};
    let initial: TzFilterState['filterFormItems'];
    if (isArray(payload)) {
      initial = payload as unknown as FilterFormParam[];
    } else {
      const _payload = payload as unknown as TzUpdateFilterParams;
      initial = _payload.formItems;
      initialValues = _payload.formValues;
      initialEnumLabels = _payload.formEnumLabels;
    }
    dispatch({
      type: UPDATE_FILTER,
      payload: getFormItemByItems(
        { initial, initialValues, initialEnumLabels },
        true
      ),
    } as UpdateAction);
  };

  const addFilter = (payload: AddAction['payload']) => {
    filterFormItems.some((v) => payload.name === v.name)
      ? updateFilterItem(payload)
      : dispatch({
          type: ADD_FILTER,
          payload: payload,
        } as AddAction);
  };
  const removeFilter = (id: RemoveAction['payload']) => {
    dispatch({
      type: REMOVE_FILTER,
      payload: id,
    } as RemoveAction);
  };
  const updateFilterItem = (payload: UpdateFilterItemAction['payload']) => {
    filterFormItems.some((v) => payload.name === v.name) &&
      dispatch({
        type: UPDATE_FILTER_ITEM,
        payload,
      } as UpdateFilterItemAction);
  };

  const clearFormItems = () => {
    const temp = filterFormItems.filter((item) => !item.fixed);

    temp?.length === filterFormItems?.length
      ? dispatch({
          type: REMOVE_ALL,
        } as RemoveAllAction)
      : removeFilter(temp.map((v) => v.name));
  };
  const updateFormItemValue = (payload: FormValues) => {
    const _keys = keys(payload);
    const deletesVals: string[] = [];
    const validateVals: FormValues[] = [];
    _keys.forEach((key) => {
      if (isArray(payload[key]) ? payload[key]?.length : payload[key]) {
        validateVals.push({ [key]: payload[key] });
      } else {
        deletesVals.push(key);
      }
    });

    validateVals.length &&
      dispatch({
        type: UPDATE_FILTER_ITEM_VALUE,
        payload,
      } as UpdateFilterItemValueAction);

    deletesVals.length && removeFilter(deletesVals);
  };

  const updateEnumLabels = (payload: TzFilterState['enumLabels']) => {
    dispatch({
      type: UPDATE_ENUM_LABELS,
      payload,
    } as UpdateEnumLabels);
  };

  return {
    addFilter,
    removeFilter,
    updateFilter,
    updateFormItemValue,
    clearFormItems,
    state,
    updateEnumLabels,
    ...filterData,
  };
};
export default useTzFilter;

export const FilterContext = createContext<TzFilterBack>({
  addFilter: () => null,
  removeFilter: () => null,
  updateFilter: () => null,
  clearFormItems: () => null,
  updateEnumLabels: () => null,
  updateFormItemValue: () => null,
  popoverFilterData: [],
  inputFilterData: [],
  state: {
    filterFormItems: [],
    fitlerFormValues: undefined,
  },
});
