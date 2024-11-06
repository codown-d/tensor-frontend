import { flatten, last, reverse, set, slice, sortBy, zip } from 'lodash';
import type { MenuType, SingleValueType, TreeNode, ValueType, ValuesType } from './interface';
import { valueType } from 'antd/lib/statistic/utils';
import { Children } from 'react';
import { retry } from 'rxjs/operators';

export type SortOptionRes = {
  options: TreeNode[] | undefined;
  lastSectedVal: SingleValueType | undefined;
};
export const CASCADER_OPTION_ALL = 'all';
export function sortOption(
  root: TreeNode[] | undefined,
  value: SingleValueType[] | undefined,
): SortOptionRes {
  const defaultRes = {
    options: root,
    lastSectedVal: undefined,
  };
  if (!value?.length || !root?.length) {
    return defaultRes;
  }

  const hasAllNode = root.find((node) => node.value === CASCADER_OPTION_ALL);

  const filterNodes = root.filter((node) => node.value !== CASCADER_OPTION_ALL);

  if (!filterNodes?.length) {
    return defaultRes;
  }

  const getLevelItems = zip(...value);

  const lastSectedVal: SingleValueType = [];

  function loop(nodes: TreeNode[], level: number): TreeNode[] {
    let lastIdx = -1;
    const value = getLevelItems[level];
    if (!value) {
      return nodes;
    }

    const item = sortBy(nodes, (v) => {
      const _isIn = !value?.includes(v.value);
      !_isIn && lastIdx++;
      return _isIn;
    });

    const nextItem = item[lastIdx];
    if (nextItem?.children?.length) {
      return item.map((_item, index) => {
        if (lastIdx === index) {
          lastSectedVal.push(_item.value);
          return {
            ..._item,
            children: loop(nextItem.children, level + 1),
          };
        }
        return _item;
      });
    }
    nextItem && lastSectedVal.push(nextItem.value);
    return item;
  }

  const res = loop(filterNodes as TreeNode[], 0);

  return {
    options: hasAllNode ? [hasAllNode, ...res] : res,
    lastSectedVal: flatten(value).includes(CASCADER_OPTION_ALL)
      ? [CASCADER_OPTION_ALL]
      : lastSectedVal,
  };
}

export function formatOption(root: TreeNode[]): TreeNode[] {
  function loop(nodes: TreeNode[], level: number = 0, parent?: TreeNode): TreeNode[] {
    return nodes.map((node) => {
      const { children, value, _value: nodeVal, label } = node;
      // 唯一键值
      const _value = nodeVal ?? `_${level}_${parent?._value || ''}_${value}`;
      const newNode: TreeNode = nodeVal
        ? node
        : {
            isLeaf: !children?.length,
            ...node,
            level,
            parent,
            _value: value,
            value: _value,
          };
      if (children) {
        return {
          ...newNode,
          children: loop(children, level + 1, newNode),
        };
      }
      return newNode;
    });
  }
  return loop(root);
}
export function arr2Tree(arr: SingleValueType[][]) {
  function arr2List(arr: SingleValueType[]) {
    const list = [];
    const head: TreeNode = {
      value: arr[0],
      children: [],
    };
    let prev = head;
    list.push(prev);
    for (let i = 1; i < arr.length; i++) {
      const current = {
        value: arr[i],
        children: [],
      };
      prev.children.push(current);
      prev = current;
    }
    return list;
  }

  function mergeList(tree: TreeNode[], list: TreeNode[]) {
    if (!tree) {
      return;
    }
    const hasCommonParent = tree.some((treeItem: TreeNode) => {
      // 有共同的父节点
      if (treeItem.value === list[0].value) {
        mergeList(treeItem.children, list[0].children);
        return true;
      }
      return false;
    });

    if (!tree.length || !hasCommonParent) {
      tree.push(list[0]);
    }
  }

  function arr2Tree(arr: SingleValueType[][]) {
    const tree: TreeNode[] = [];
    arr.forEach((item: SingleValueType[]) => {
      const list = arr2List(item);
      mergeList(tree, list);
    });
    return tree;
  }

  return arr2Tree(arr);
}
// 添加 parent 链接到父节点
export function flattenTree(root: TreeNode[]): TreeNode[] {
  const res: TreeNode[] = [];
  function dfs(nodes: TreeNode[], parent?: TreeNode) {
    if (!nodes) {
      return;
    }

    const newChildren: TreeNode[] = [];

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const { children } = node;

      const newNode: TreeNode = {
        ...node,
        parent,
      };

      res.push(newNode);
      newChildren.push(newNode);

      if (children) {
        dfs(children, newNode);
      }
    }

    if (parent) {
      parent.children = newChildren;
    }
  }
  dfs(root);

  return res;
}

// 是否有子节点（包括自己）被选中
export function hasChildChecked(item: TreeNode, curValue: ValueType[]): boolean {
  function dfs(node: TreeNode): boolean {
    if (!node) {
      return false;
    }

    const { value, children } = node;
    const _children = children?.filter((v: TreeNode) => !v.disabled);

    if (curValue.includes(value)) {
      return true;
    }
    if (!_children?.length) {
      return false;
    }
    return _children.some((child: TreeNode) => dfs(child));
  }

  return dfs(item);
}

// 是否有父节点（包括自己）被选中
export function hasParentChecked(item: TreeNode, value: ValueType[]): boolean {
  let tmp: TreeNode | null | undefined = item;

  while (tmp) {
    if (value.includes(tmp.value)) {
      return true;
    }

    tmp = tmp.parent;
  }

  return false;
}

// 删除所有子孙节点的 value, 不包括自己
export function removeAllDescendanceValue(root: TreeNode, value: ValueType[]): ValueType[] {
  const allChildrenValue: ValueType[] = [];
  function dfs(node: TreeNode): void {
    if (node.children) {
      node?.children?.forEach((item: TreeNode) => {
        allChildrenValue.push(item.value);
        dfs(item);
      });
    }
  }
  dfs(root);
  return value.filter((val) => !allChildrenValue.includes(val));
}

// 状态提升
export function liftTreeState(item: TreeNode, curVal: ValueType[]): ValueType[] {
  const { value } = item;

  // 加入当前节点 value
  const nextValue = curVal.concat(value);
  let last = item;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    // 如果父节点的所有子节点都已经 checked, 添加该节点 value，继续尝试提升
    if (
      last?.parent?.children
        .filter((t: TreeNode) => !t.disabled)
        ?.every((child: TreeNode) => nextValue.includes(child.value))
    ) {
      nextValue.push(last.parent.value);
      last = last.parent;
    } else {
      break;
    }
  }
  // 移除最后一个满足 checked 的父节点的所有子孙节点 value
  return removeAllDescendanceValue(last, nextValue);
}

// 状态下沉
export function sinkTreeState(root: TreeNode, value: ValueType[]): ValueType[] {
  const parentValues: ValueType[] = [];
  const subTreeValues: ValueType[] = [];

  function getCheckedParent(node: TreeNode | null | undefined): TreeNode | null {
    if (!node) {
      return null;
    }
    parentValues.push(node.value);
    if (value.includes(node.value)) {
      return node;
    }

    return getCheckedParent(node.parent);
  }

  const checkedParent = getCheckedParent(root);
  if (!checkedParent) {
    return value;
  }

  function dfs(node: TreeNode) {
    if (!node.children || node.value === root.value) {
      return;
    }
    node.children
      .filter((t: TreeNode) => !t.disabled)
      ?.forEach((item: TreeNode) => {
        if (item.value !== root.value) {
          if (parentValues.includes(item.value)) {
            dfs(item);
          } else {
            subTreeValues.push(item.value);
          }
        }
      });
  }
  dfs(checkedParent);
  // 替换 checkedParent 下子树的值
  const nextValue = removeAllDescendanceValue(checkedParent, value).filter(
    (item) => item !== checkedParent.value,
  );
  return Array.from(new Set(nextValue.concat(subTreeValues)));
}

// checked, unchecked 时重新计算
export function reconcile(item: TreeNode, checked: boolean, value: ValueType[]): ValueType[] {
  if (checked) {
    // 如果已经有父节点被 checked, 再进行 checked 没有意义，直接忽略
    // 主要是用在避免初始化时传入的 value 结构不合理
    if (hasParentChecked(item, value)) {
      return value;
    }
    return liftTreeState(item, value);
  }
  return sinkTreeState(item, value);
}

// 通过 value 查找完整路径
export function findNodeByValue(
  value: ValueType | undefined,
  flattenData: TreeNode[],
): ValueType[] | undefined {
  // const path=[]
  if (!value || !flattenData?.length) {
    return;
  }
  function findParent(findVal: ValueType, path: ValueType[]): ValueType[] | undefined {
    const cur = flattenData.find((v) => v.value === findVal);
    if (!cur) {
      return path;
    }

    path.push(cur['_value']);

    if (cur.parent) {
      return findParent(cur.parent.value, path);
    } else {
      return path;
    }
  }
  const getVal = findParent(value, []);
  return getVal ? reverse(getVal) : undefined;
}
// 通过 value 查找节点信息
export function findNodeOptByValue(
  value: ValueType | undefined,
  flattenData: TreeNode[],
): TreeNode[] | undefined {
  // const path=[]
  if (!value || !flattenData?.length) {
    return;
  }
  function findParent(findVal: ValueType, path: TreeNode[]): TreeNode[] | undefined {
    const cur = flattenData.find((v) => v.value === findVal);
    if (!cur) {
      return path;
    }

    const { _value, ...rest } = cur;

    path.push({
      ...rest,
      value: _value,
    });

    if (cur.parent) {
      return findParent(cur.parent.value, path);
    } else {
      return path;
    }
  }
  const getVal = findParent(value, []);
  return getVal ? reverse(getVal) : undefined;
}

// 过滤非法数据
export function transformValue(value: ValueType[], flattenData: TreeNode[]) {
  let nextValue: ValueType[] = [];
  for (let i = 0; i < value.length; i++) {
    const node = flattenData.find((item) => item.value === value[i]);
    if (node) {
      nextValue = reconcile(node, true, nextValue);
    } else {
      nextValue.push(value[i]);
    }
  }
  return nextValue;
}

export function getOptionsByValue(value: ValueType, flattenData: TreeNode[]) {
  const node = flattenData.find((v) => v.value === value);
  if (!node) {
    return undefined;
  }
  if (node?.parent) {
    return node.parent.children;
  }
  return [];
}

export const transOpt = (
  v: ValueType,
  data: TreeNode[],
  optionData: TreeNode[] | undefined,
): TreeNode[] | undefined => {
  const opt = getOptionsByValue(v, data);
  if (!opt) {
    return opt;
  }
  return opt?.length ? opt : optionData;
};

export const getPath = (path: SingleValueType, idx: number) =>
  slice(path, idx - 1, idx + 1).join('_');

export const getNodeTranValue = (value: SingleValueType) => {
  if (!value?.length) {
    return value;
  }
  const len = value.length;
  return `${len === 1 ? '__' + value[len - 1] : '_' + getPath(value, len - 1)}`;
};

export function addNodeChild(tree: TreeNode[], node: TreeNode, childVal: TreeNode[]): TreeNode[] {
  function loop(t: TreeNode[]): TreeNode[] {
    return t.map(({ _value, value, children, ...v }) => {
      const defaultObj = { ...v, value: _value };
      if (value === node.value) {
        return { ...defaultObj, children: childVal };
      }
      if (children) {
        return { ...defaultObj, children: loop(children) };
      }
      return defaultObj;
    });
  }
  return loop(tree);
}

export const mergeOptions = (
  options: TreeNode[],
  loadData: TreeNode[],
  isLoad?: boolean,
): TreeNode[] => {
  if (!loadData?.length) {
    return options;
  }
  if (!isLoad) {
    return options.map((item) => {
      const loadDataNode = loadData.find((v) => v.value === item.value) || {};
      return { ...loadDataNode, ...item, children: loadDataNode.children || item.children };
    });
  }

  return loadData.map((item) => {
    const optNode = options.find((v) => v.value === item.value) || {};
    return { ...item, ...optNode, children: item.children || optNode.children };
  });
};

export function getMenuByOptions(options: TreeNode[][]): MenuType[] {
  return options.map((v) => ({ options: v }));
}
