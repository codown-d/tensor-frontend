import { BaseOptionType, CascaderProps, DefaultOptionType } from 'antd/lib/cascader';
import { ReactNode } from 'react';
export interface TzCascaderOptionProps {
  value: string;
  label: string;
  children?: TzCascaderOptionProps[];
  isLeaf?: boolean;
  loading?: boolean;
}
export interface TzDefaultOptionType extends DefaultOptionType {
  explain?: string | undefined | null;
}

export type TreeNode = (TzDefaultOptionType | BaseOptionType) & {
  parent?: TreeNode;
};

export declare type ValueType = string | number;
export declare type SingleValueType = ValueType[];
export declare type ValuesType = SingleValueType | SingleValueType[];

export declare type MenuType = { options: TreeNode[] };

export type TzCascaderProps = CascaderProps<TreeNode> & {
  label?: string;
  query?: {
    /** 加载的数据是否都为叶子节点，true：是， false：否 */
    leaf?: boolean;
    /** 需要缓存的请求地址 */
    cacheUrl?: string;
    /** options映射字段 */
    fieldNames?: {
      label?: string;
      value?: string;
      children?: string;
    };
    /** 节点项自定义渲染，例如设置disabled字段 */
    nodeRender?: (arg: TreeNode) => TreeNode;
    loadOptions?: (value: string, callback: any, level: number) => void;
  };
  /** label自定义展示 */
  labelFormat?: (node: ReactNode, row: TreeNode) => ReactNode;
};
