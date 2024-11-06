import { useCreation, useLocalStorageState, useMemoizedFn, useUpdateEffect } from 'ahooks';
import { CascaderProps } from 'antd/lib/cascader';
import { CheckboxChangeEventTarget } from 'antd/lib/checkbox/Checkbox';
import { isArray, isEqual, last, orderBy } from 'lodash';
import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  MenuType,
  SingleValueType,
  TreeNode,
  TzCascaderProps,
  ValuesType,
  ValueType,
} from './interface';
import {
  findNodeByValue,
  flattenTree,
  formatOption,
  getNodeTranValue,
  getPath,
  hasChildChecked,
  hasParentChecked,
  reconcile,
  sortOption,
  transformValue,
  transOpt,
  SortOptionRes,
  addNodeChild,
  CASCADER_OPTION_ALL,
  getOptionsByValue,
  getMenuByOptions,
  findNodeOptByValue,
} from './util';

type TTzCascaderPanel = TzCascaderProps & {
  value: ValuesType;
  onChange: (val: ValuesType | undefined, options: any) => {};
  setLoadData?: any;
};

interface TTzCascaderPanelRetrun {
  data: TreeNode[];
  menu: { options: CascaderProps<TreeNode>['options'] }[];
  setMenu: Dispatch<SetStateAction<{ options: TreeNode[] }[]>>;
  panelVal: ValueType[];
  setPanelVal: (arg: TTzCascaderPanelRetrun['panelVal']) => void;
  nodeCheckedFunc: (arg: CheckboxChangeEventTarget) => void;
  hasParentCheckedFunc: (arg: ValueType) => boolean;
  hasChildCheckedFunc: (arg: ValueType) => boolean;
  listItemClickFunc: (item: TreeNode, level: number) => void;
  lastSectedVal: SingleValueType | undefined;
  queryLoadingId: ValueType[] | undefined;
}

const useTzCascaderPanel = (param: TTzCascaderPanel): TTzCascaderPanelRetrun => {
  const { options, value, onChange, multiple, open, query, expandTrigger, setLoadData } = param;

  const { cacheUrl, fieldNames, nodeRender, loadOptions, leaf } = query || {};

  const [queryLoadingId, setQueryLoadingId] = useState<ValueType[] | undefined>();

  const [menu, setMenu] = useState<MenuType[]>([]);

  const [expand, setExpand] = useState<
    | {
        nodeVal: ValueType;
        level: number;
      }
    | undefined
  >();

  // 是否是点击菜单项，false：否，true：是
  const menuRenderRef = useRef<
    | {
        nodeVal: ValueType;
        level: number;
      }
    | undefined
  >();

  const tempOptionsRef = useRef<TreeNode[] | undefined>();

  const [optionsLoadData, setOptionsLoadData] = useLocalStorageState<any | undefined>(
    `options-load-data-${cacheUrl}`,
    undefined,
  );

  const optionDataMap = useCreation(() => {
    if (!open) {
      return {
        options: options,
        lastSectedVal: undefined,
      };
    }
    const needSort = (options?.length || 0) > (tempOptionsRef.current?.length || 0);
    let defaultOpt = options;
    let sortOptionsData: SortOptionRes | undefined;
    if (needSort) {
      sortOptionsData = value?.length
        ? sortOption(options, (multiple ? value : [value]) as SingleValueType[])
        : undefined;
      defaultOpt = sortOptionsData?.options || options;
    }
    tempOptionsRef.current = defaultOpt;
    return {
      options: defaultOpt?.length ? formatOption(defaultOpt) : [],
      lastSectedVal: sortOptionsData?.lastSectedVal || menuRenderRef.current?.nodeVal,
    };
  }, [options, open]);

  const [lastSectedVal, setLastSectedVal] = useState<SingleValueType>();

  const { options: optionData, lastSectedVal: optionDataMapLastSectedVal } = optionDataMap;

  const data = useCreation(() => {
    return optionData?.length ? flattenTree(optionData) : [];
  }, [optionData]);

  const optLastSectedVal = useMemo(() => {
    if (isArray(optionDataMapLastSectedVal)) {
      return optionDataMapLastSectedVal;
    }
    return findNodeByValue(optionDataMapLastSectedVal as ValueType | undefined, data);
  }, [optionDataMapLastSectedVal, data]);

  useEffect(() => {
    setLastSectedVal((prev) => (!isEqual(prev, optLastSectedVal) ? optLastSectedVal : prev));
  }, [optLastSectedVal]);

  const getDataByValue = useCreation((): {
    val: ValueType[];
    menu: MenuType[];
  } => {
    let _menu: TreeNode[][];
    if (!value?.length) {
      return {
        val: [],
        menu: optionData?.length ? getMenuByOptions([optionData]) : [],
      };
    }
    if (multiple) {
      const multipleVal = value as SingleValueType[];
      if (!multipleVal.filter((v) => v?.length)?.length) {
        return {
          val: [],
          menu: optionData?.length ? getMenuByOptions([optionData]) : [],
        };
      }
      const lastVal = (
        optLastSectedVal?.length ? optLastSectedVal : last(multipleVal)
      ) as SingleValueType;
      _menu = lastVal
        .map(
          (v: ValueType, idx: number) =>
            transOpt(
              `${'_' + idx + '_' + (idx ? getPath(lastVal, idx) : '_' + v)}`,
              data,
              optionData,
            ) || [],
        )
        .filter((v) => v?.length);
      const _v = transformValue(
        multipleVal.map((v) => {
          const level = v.length - 1;
          return `_${level}${getNodeTranValue(v)}`;
        }) as ValueType[],
        data,
      );

      return {
        val: _v,
        menu: getMenuByOptions(_menu),
      };
    } else {
      const singleVal = value as SingleValueType;
      const level = singleVal.length - 1;
      _menu = singleVal
        .map((v: ValueType, idx: number) =>
          transOpt(
            `${'_' + idx + '_' + (idx ? getPath(singleVal, idx) : '_' + v)}`,
            data,
            optionData,
          ),
        )
        .filter((v) => v?.length) as TreeNode[][];
      return {
        val: [`_${level}${getNodeTranValue(singleVal)}`] as ValueType[],
        menu: getMenuByOptions(_menu),
      };
    }
  }, [value, multiple, data, optionData]);

  const dataMenu = getDataByValue?.menu;
  const dataVal = getDataByValue.val;

  const [panelVal, setPanelVal] = useState<ValueType[]>(dataVal);

  useUpdateEffect(() => {
    open && setPanelVal((prev) => (!isEqual(orderBy(dataVal), orderBy(prev)) ? dataVal : prev));
  }, [JSON.stringify(dataVal), open]);

  // options变动后重新渲染
  useEffect(() => {
    if (!open) {
      return;
    }
    if (!menuRenderRef.current) {
      setMenu(dataMenu);
      return;
    }
    const { level, nodeVal } = menuRenderRef.current;
    const nextMenuItem = data.find((v) => v.value === nodeVal)?.children;
    const curMenuItem = getOptionsByValue(nodeVal, data);
    setMenu((pre: any) => {
      return nextMenuItem?.length
        ? [...pre].slice(0, level + 1).concat({
            options: nextMenuItem,
          })
        : curMenuItem?.length
        ? [...pre].slice(0, level).concat({
            options: curMenuItem,
          })
        : pre;
    });
  }, [dataMenu, data, expand]);

  useEffect(() => {
    if (!open) {
      tempOptionsRef.current = undefined;
      menuRenderRef.current = undefined;
    }
  }, [open]);

  const getNode = useMemoizedFn((val) => data.find((v) => v.value === val));

  const trigger = useMemoizedFn((val) => {
    if (!val?.length && !value?.length) {
      return;
    }
    if (!val?.length) {
      onChange(undefined, undefined);
      return;
    }
    const opts = val
      .map((v: ValueType): TreeNode[] | undefined => {
        const item = findNodeOptByValue(v, data);
        return item;
      })
      .filter((v: TreeNode | undefined) => !!v?.length) as TreeNode[][];

    if (!multiple) {
      onChange(
        opts?.[0]?.map((item) => item.value),
        opts?.[0],
      );
    } else {
      onChange(
        opts?.map((item) => item?.map((v) => v.value)),
        opts,
      );
    }
  });

  const nodeCheckedFunc = useMemoizedFn((e: CheckboxChangeEventTarget) => {
    const { value: curVal, checked } = e;
    const node = getNode(curVal);

    if (!node) {
      return;
    }

    if (node._value === CASCADER_OPTION_ALL) {
      menuRenderRef.current = undefined;
      setExpand(undefined);
    }
    if (multiple) {
      const res = node && reconcile(node, checked, panelVal);
      !isEqual(orderBy(res), orderBy(panelVal)) && trigger(res);
    } else {
      !isEqual([curVal], panelVal) && trigger([curVal]);
    }
  });

  const hasParentCheckedFunc = useCallback(
    (nodeVal: ValueType) => {
      const node = getNode(nodeVal);
      return !!(node && hasParentChecked(node, panelVal));
    },
    [panelVal],
  );

  const hasChildCheckedFunc = useCallback(
    (nodeVal: ValueType) => {
      const node = getNode(nodeVal);
      return !!(node && hasChildChecked(node, panelVal));
    },
    [panelVal],
  );

  const renderByData = useMemoizedFn(
    ({
      resData,
      node,
      target,
      cache,
      cal,
    }: {
      resData: any[];
      node: TreeNode;
      target: string;
      cache: boolean;
      cal?: any;
    }) => {
      let _resData =
        fieldNames || nodeRender
          ? resData.map((item) => {
              let transOptiongItems = item;
              if (fieldNames) {
                const { label, value, children } = fieldNames;
                const newItem: Record<string, string | TreeNode[]> = {};
                label && (newItem['label'] = item[label]);
                value && (newItem['value'] = item[value]);
                children && (newItem['children'] = item[children]);
                transOptiongItems = { isLeaf: leaf || item.nodeNumber < 1, ...item, ...newItem };
              }
              if (nodeRender) {
                transOptiongItems = {
                  ...transOptiongItems,
                  ...nodeRender(transOptiongItems),
                };
              }
              return transOptiongItems;
            })
          : resData;
      cache &&
        setOptionsLoadData((prev: TreeNode[]) => ({
          ...(prev || {}),
          [target]: _resData,
        }));

      const temp = addNodeChild(optionData as TreeNode[], node, _resData);
      setLoadData(temp);
      setQueryLoadingId((prev) => prev?.filter((v) => v !== node.value));
      cal?.();
    },
  );

  const listItemClickFunc = useMemoizedFn((node, level) => {
    const { disabled } = node;
    if (!node.value) {
      return;
    }

    if (node.isLeaf) {
      if (!getNode(node.value)?.parent) {
        menuRenderRef.current = undefined;
        setExpand(undefined);
      }
      !disabled &&
        nodeCheckedFunc({
          value: node.value,
          checked: !hasParentCheckedFunc(node.value),
        });
      // return;
    }

    menuRenderRef.current = {
      nodeVal: node.value,
      level,
    };
    setExpand(menuRenderRef.current);

    if (!query && node.children?.length) {
      expandTrigger !== 'hover' &&
        setMenu((pre: any) => {
          return [...pre].slice(0, level + 1).concat({
            options: node.children,
          });
        });
      return;
    }

    if (!query) {
      return;
    }

    if (queryLoadingId?.includes(node.value)) {
      return;
    }

    if (!node.isLeaf && expandTrigger !== 'hover') {
      setQueryLoadingId((prev) => [...(prev || []), node.value]);
      const _value = node._value;
      const res = optionsLoadData?.[_value];
      const defaultParam = {
        node,
        target: _value,
      };
      if (res?.length) {
        renderByData({
          resData: res,
          cache: false,
          ...defaultParam,
        });
        return;
      }
      loadOptions?.(
        _value,
        (res: any) => {
          const options = res.getItems();
          options &&
            renderByData({
              resData: options,
              cache: !!cacheUrl,
              ...defaultParam,
            });
        },
        level,
      );
    }
  });

  return {
    data,
    menu,
    setMenu,
    panelVal,
    setPanelVal,
    nodeCheckedFunc,
    hasParentCheckedFunc,
    hasChildCheckedFunc,
    listItemClickFunc,
    lastSectedVal,
    queryLoadingId,
  };
};

export default useTzCascaderPanel;
