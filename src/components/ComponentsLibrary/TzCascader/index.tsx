import React, { useState, useEffect, useMemo, ReactNode, useCallback, forwardRef } from 'react';
import './index.scss';
import Cascader, { DefaultOptionType } from 'antd/lib/cascader';
import { TzCascaderPanel } from './TzCascaderPanel';
import { flattenDeep, hasIn, isEqual, merge } from 'lodash';
import { useCreation, useUpdateEffect } from 'ahooks';
import classNames from 'classnames';
import NoData from '../../noData/noData';
import { TreeNode, TzCascaderProps, ValuesType } from './interface';
import { mergeOptions } from './util';
import { getStatusStr, useAssetsClusterNode } from '../../../helpers/use_fun';
import { translations } from '../../../translations/translations';
import { TzTooltip } from '../../tz-tooltip';
import { clusterGraphNodes } from '../../../services/DataService';

const TzCascader = forwardRef((props: TzCascaderProps, ref) => {
  const { options: propsOptions, query } = props;
  const [options, setOptions] = useState(propsOptions || []);
  const [value, setValue] = useState<any>(props.value ?? props.defaultValue ?? []);
  const [searchValue, setSearchValue] = useState<any>(props.searchValue);
  const [open, setOpen] = useState<boolean>(!!props?.open);

  useUpdateEffect(() => {
    setOptions((prev) => {
      const res: TreeNode[] | undefined = query ? mergeOptions(propsOptions || [], prev || []) : propsOptions;
      return !isEqual(prev, res) ? res || [] : prev;
    });
  }, [propsOptions]);

  const mergeOpen = hasIn(props, 'open') ? props.open : open;

  useUpdateEffect(() => {
    setSearchValue(props.searchValue);
  }, [props.searchValue]);

  useEffect(() => {
    return () => {
      !mergeOpen && setSearchValue(undefined);
    };
  }, [mergeOpen]);

  useUpdateEffect(() => {
    setValue((prev: ValuesType) => {
      return !isEqual(value, props.value) ? props.value : prev;
    });
  }, [props.value]);

  const defaultProps = useCreation(
    () => ({
      ref,
      style: { width: '100%' },
      notFoundContent: <NoData small={true} />,
      showSearch: {
        limit: 10000,
        filter: (inputValue: string, path: DefaultOptionType[]) =>
          path.some((option) => (option.label as string).toLowerCase().indexOf(inputValue.toLowerCase()) > -1),
      },
      ...props,
      options,
      value,
      popupClassName: classNames('tz-cascader-popupClassName', props.popupClassName),
      onChange: (val: any, option: any) => {
        if (!hasIn(props, 'open')) {
          setTimeout(() => {
            setOpen(false);
          });
        }
        props?.onChange?.(val, option);
      },
      onSearch: setSearchValue,
      searchValue,
      open: mergeOpen,
      onDropdownVisibleChange: (val: boolean) => {
        !hasIn(props, 'open') && setOpen(val);
        props.onDropdownVisibleChange?.(val);
      },
      label: props.label,
      getPopupContainer: (triggerNode: any) => {
        if (props.getPopupContainer) {
          return props.getPopupContainer(triggerNode);
        }
        if ($(triggerNode).parents('.ant-drawer-content').length) {
          return $(triggerNode).parents('.ant-drawer-content')[0];
        } else {
          return document.getElementById('layoutMainContent');
        }
      },
      placeholder: props.label ? '' : props.placeholder,
      className: classNames('tz-cascader', { 'select-dropdown-open': mergeOpen || value?.length }, props.className),
      removeIcon: props.removeIcon || (
        <i
          className={'icon iconfont icon-lansexiaocuohao'}
          style={{ fontSize: '16px', fontWeight: 400, color: '#2177d1' }}
        ></i>
      ),
    }),
    [props, value, mergeOpen, searchValue, JSON.stringify(options)],
  );

  const dropdownRender = useCallback(
    (menus: ReactNode) => {
      const node = (
        <div
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <TzCascaderPanel
            {...props}
            value={value}
            showSearch={defaultProps.showSearch}
            options={options}
            setLoadData={(data: TreeNode[]) => {
              setOptions((prev) => (!isEqual(prev, data) ? data || [] : prev));
            }}
            onChange={defaultProps.onChange}
            searchValue={props.searchValue}
            open={mergeOpen}
          />
        </div>
      );
      return defaultProps.dropdownRender ? defaultProps.dropdownRender(node) : node;
    },
    [props, value, mergeOpen, options, defaultProps.onChange],
  );

  const customerProps = useMemo(
    () => (searchValue || !options?.length ? defaultProps : ({ ...defaultProps, dropdownRender } as any)),
    [searchValue, defaultProps, mergeOpen, JSON.stringify(options)],
  );

  return (
    <span className={`tz-selection ${defaultProps.className}`} style={defaultProps.style}>
      <Cascader {...customerProps} />
      <p className={'ant-select-selection-placeholder selection-placeholder-color'}> {defaultProps.label} </p>
    </span>
  );
});
export const TzCascaderClusterNode = forwardRef((props: any, ref) => {
  let { className, clusterInfoMap, placeholder = translations.please_select_the_scanning_object } = props;
  let [clusterInfos, setClusterInfos] = useState<any>([]);
  const clusterListNode = useAssetsClusterNode();
  let newclusterListNode = useMemo(() => {
    return [
      // {
      //   value: 'all',
      //   label: translations.all_clusters,
      //   isLeaf: true,
      // },
      ...clusterListNode.map((item: any) => {
        return merge({}, item, { disabled: flattenDeep(props.value).includes('all') });
      }),
    ].map((v) => ({ ...v, notShowStatus: true }));
  }, [clusterListNode, props.value]);
  return (
    <TzCascader
      {...props}
      className={className}
      displayRender={(label: any, selectedOptions: any) => {
        if (!selectedOptions[0]) return label;
        return selectedOptions.map((item: any) => (item ? item.label : clusterInfoMap.current?.[label[1]])).join('/');
      }}
      options={newclusterListNode}
      placeholder={placeholder}
      multiple
      labelFormat={(node: ReactNode, row: any) => {
        return !row?.notShowStatus
          ? row?.Ready === 1
            ? node
            : React.createElement(TzTooltip, { title: getStatusStr(row) }, node)
          : node;
      }}
      query={{
        loadOptions: (clusterID: string, call: any) => {
          clusterGraphNodes({ clusterID }).subscribe(call);
        },
        cacheUrl: '/api/v2/platform/assets/nodes',
        fieldNames: {
          value: 'ID',
          label: 'HostName',
        },
        nodeRender: (node) => ({
          disabled: flattenDeep(clusterInfos).includes('all')
            ? true
            : getStatusStr(node) !== translations.clusterGraphList_on,
        }),
        leaf: true,
      }}
      onChange={(val) => {
        let arr: any = flattenDeep(val);
        setClusterInfos(arr);
        let newVal = arr.includes('all') ? [['all']] : val;
        props?.onChange && props?.onChange(newVal);
      }}
    />
  );
});
export default TzCascader;
