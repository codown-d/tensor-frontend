import React, { forwardRef } from 'react';
import './index.less';
import AsyncSelect, { TzAsyncSelect } from './AsyncSelect';
import AllInSelect, { AllInSelectProps } from './AllInSelect';
import TzSelectBase, { TzSelectBaseProps } from './TzSelectBase';
import TzSelectCommon, { TzSelectCommonProps } from './TzSelectCommon';
import { hasIn } from 'lodash';
import { DefaultOptionType } from 'antd/lib/select';
export function filterOption(input: string, option: DefaultOptionType | undefined) {
  if (typeof option?.label === 'string') {
    return option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0;
  } else {
    return option?.originLabel?.toLowerCase().indexOf(input.toLowerCase()) >= 0;
  }
}

export type TzSelectProps = Partial<TzAsyncSelect> &
  Partial<TzSelectBaseProps> &
  Partial<TzSelectCommonProps> & {
    // 是否全选，默认true
    isShowAll?: boolean;
  };
/** 注：服务器加载和全选功能互斥 **/
const TzSelect = forwardRef((props: TzSelectProps, ref?: any) => {
  const { isShowAll = true, loadOptions, ...restProps } = props;
  const { mode } = restProps;

  const mergeProps = {
    ...restProps,
    ref,
  };

  // 服务器加载扩展
  if (!!loadOptions) {
    return <AsyncSelect {...mergeProps} loadOptions={loadOptions} />;
  }

  // 通过children配置的options，默认使用antd的功能
  if (!hasIn(props, 'options')) {
    return <TzSelectBase {...(mergeProps as TzSelectBaseProps)} />;
  }

  // 全选扩展
  const mergeIsShowAll = mode && ['multiple', 'tags'].includes(mode) && isShowAll;
  if (mergeIsShowAll) {
    return <AllInSelect {...(mergeProps as AllInSelectProps)} />;
  }

  return <TzSelectCommon {...(mergeProps as TzSelectBaseProps)} />;
});
export default TzSelect;
