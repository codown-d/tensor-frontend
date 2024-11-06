
import { get,hasIn, isArray, keys} from "lodash"
import {  FilterFormParam, FilterFormParamCommon, FilterInput ,FormValues} from "../TzFilterForm/filterInterface"
import {  SELECTTYPE } from "../TzFilterForm/utils"

export type TzFilterState = {
    filterFormItems: FilterFormParam[]
    fitlerFormValues: FormValues | undefined
    enumLabels?: Record<string, string>
}
export type TzFilterParams ={
    initial: FilterFormParam[]
    initialValues?:TzFilterState['fitlerFormValues']
    initialEnumLabels?:TzFilterState['enumLabels']
}
export type TzUpdateFilterParams =  {
    formItems: FilterFormParam[]
    formValues?: TzFilterState['fitlerFormValues']
    formEnumLabels?:TzFilterState['enumLabels']
}

export const valueIsNull = (val: any):boolean|undefined => {
    if(val === 0){
        return false
    }
    if(isArray(val)){
        return !val.filter(v => !valueIsNull(v)).length
    }
    return !val

}

export const getFormItemByItems = (params:TzFilterParams | FilterFormParam[],setConditinDefaultVal?: boolean):TzFilterState => {
    let items
    let initialValues:TzFilterState['fitlerFormValues']={}
    let initialEnumLabels:TzFilterState['enumLabels']
    if(isArray(params)){
        items = params
    }else{
        items = params.initial
        initialValues = params.initialValues ||{}
        initialEnumLabels = params.initialEnumLabels
    }
    if(!items?.length){
        return {
            filterFormItems:[],
            fitlerFormValues: {},
            enumLabels:{}
        }
    }
    let val:FormValues={}
    let _enumLabels:any ={} 
     items.forEach(v => v.enumLabel && (_enumLabels[v.name] = v.enumLabel))
     const valueKeys = keys(initialValues ||{})
    const filterFormItems = items.filter(v => (valueKeys.includes(v.name) || hasIn(v, 'value')) && (!valueIsNull(v.value || initialValues?.[v.name]))).map((v:FilterFormParam) => {
        const {value, ...rest} = v
        val = {...val, [v.name]: value ?? initialValues?.[v.name]}
        if((v.type === SELECTTYPE) && v.condition){
            const {value: conVal, ...restCon} = v.condition
            // 三联展示中的中间条件值 设置初始值，默认选中第一项
            setConditinDefaultVal && (val={...val, [v.condition.name]: initialValues?.[restCon.name] ?? get(restCon, ['props','options', 0, 'value'])}) 
            return {
                ...rest, 
                condition: {
                    ...restCon
                }
            }
        }else{
            return {...rest}
        }
    })
    return {
        filterFormItems,
        fitlerFormValues: val,
        enumLabels: {...initialEnumLabels,..._enumLabels}
    }
}

export const getFieldNameByItem = (item: FilterFormParam):string[] => {
    const {name, type} = item
    if((type === SELECTTYPE) && item.condition){
        return [name, item.condition.name]
    }
    return [name]
}

export type FilterData = {
    inputFilterData: FilterInput[];
    popoverFilterData: FilterFormParamCommon[];
};

export const defaultData:FilterData = { inputFilterData: [], popoverFilterData: [] };
  
export const dataClassify = (data: FilterFormParam[]): FilterData => {
  if (!data?.length) {
    return defaultData;
  }
  return data.reduce(
    (t: FilterData, v: FilterFormParam) => {
      v.type === 'input'
        ? t.inputFilterData.push(v as FilterInput)
        : t.popoverFilterData.push(v as FilterFormParamCommon);
      return t;
    },
    { inputFilterData: [], popoverFilterData: [] }
  );
};