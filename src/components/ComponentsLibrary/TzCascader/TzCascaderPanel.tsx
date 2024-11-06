import { LoadingOutlined, RightOutlined } from '@ant-design/icons/lib/icons';
import { useInfiniteScroll, useMemoizedFn, useUpdateEffect } from 'ahooks';
import { BaseOptionType } from 'antd/lib/select';
import classNames from 'classnames';
import { zip } from 'lodash';
import React, { useState, useMemo, useRef, useCallback } from 'react';
import { translations } from '../../../translations/translations';
import NoData from '../../noData/noData';
import { TzCheckbox } from '../../tz-checkbox';
import { TzInput } from '../../tz-input';
import { TzSelectProps } from '../../tz-select';
import { TreeNode, ValueType } from './interface';
import './TzCascaderPanel.scss';
import useTzCascaderPanel from './useTzCascaderPanel';
import { getPath } from './util';

const wrapTag = (content: string, keyword: string) => {
  if (!keyword || !content) {
    return content;
  }
  const _content = content.toLowerCase?.();
  const _keyword = keyword.toLowerCase?.();
  if (!_keyword || !_content) {
    return content;
  }
  const indexof = _content.indexOf(_keyword);
  const _start = indexof;
  const highlight = content.substring(_start, _keyword.length + _start);
  const val = highlight ? `<span class="highlight">${highlight}</span>` : '';
  return content.replace(new RegExp(keyword, 'gi'), val);
};
/**
 * checked: 自己或被动被checked
 * indeterminate: 非checked状态&有部分子节点倍checked
 * unchecked: 默认状态
 */

const VIRTUALLEN = 10;

const TzCascaderPanelItem = (props: any) => {
  const {
    setMenu,
    nodeCheckedFunc,
    hasParentCheckedFunc,
    hasChildCheckedFunc,
    listItemClickFunc,
    options,
    multiple,
    expandTrigger,
    dropdownMenuColumnStyle,
    value,
    open,
    query,
    lastSectedVal,
    labelFormat,
    queryLoadingId,
    level,
    showSearch,
  } = props;

  const { limit = VIRTUALLEN, filter } = showSearch || {};

  const containerRef = useRef(null);

  const getItemVal = useMemo(() => {
    if (!open) {
      return;
    }
    if (!lastSectedVal?.length) {
      return undefined;
    }
    const realVal = lastSectedVal.map(
      (v: ValueType, idx: number) => `${'_' + idx + '_' + (idx ? getPath(lastSectedVal, idx) : '_' + v)}`,
    );

    return options?.find((v: TreeNode) => realVal?.includes(v.value))?.value;
  }, [options, value, multiple, open, lastSectedVal]);

  const [filterValue, setFilterValue] = useState<any>(undefined);
  const [itemValue, setItemValue] = useState<any>(getItemVal);

  useUpdateEffect(() => {
    open && setItemValue(getItemVal);
    if (!open) {
      setItemValue(undefined);
      setFilterValue(undefined);
    }
  }, [open, getItemVal]);

  let getIndeterminate = (item: TreeNode) => {
    const checked = hasParentCheckedFunc(item.value);

    if (
      !checked &&
      query &&
      value?.length &&
      !item.isLeaf &&
      !item.children?.length &&
      zip(...value)[level].includes(item._value)
    ) {
      return true;
    }

    return !checked && hasChildCheckedFunc(item.value);
  };

  const listItemClick = useMemoizedFn((e, item) => {
    e.stopPropagation();
    setItemValue(item.value);
    listItemClickFunc(item, level);
  });

  const onMouseEnter = useMemoizedFn((e, item) => {
    if (expandTrigger !== 'hover') {
      return;
    }
    if (!item.isLeaf) {
      setMenu((pre: any) => {
        return [...pre].slice(0, level + 1).concat({
          options: item.children,
        });
      });
    }
  });

  const RenderArrow = useMemoizedFn((item) => (
    <div className="tz-panel-menu-item-expand-icon">
      <span role="img" aria-label="right" className="anticon anticon-right">
        {queryLoadingId?.includes(item.value) ? (
          <LoadingOutlined className="tz-panel-menu-item-rw" />
        ) : (
          <RightOutlined className="tz-panel-menu-item-rw" />
        )}
      </span>
    </div>
  ));

  const getSearchLabel = useMemoizedFn((label) => {
    return (
      <span
        dangerouslySetInnerHTML={{
          __html: wrapTag(label, filterValue),
        }}
      />
    );
  });

  const filterList = useMemo(
    () => options.filter((v: TreeNode) => !filterValue || (filterValue && filter?.(filterValue, [v]))),
    [filterValue, options],
  );

  const getLoadMoreList = useMemoizedFn((nextId: TzSelectProps['options'] | undefined, limit: number) => {
    let start = 0;
    if (nextId) {
      start = filterList.findIndex((i: BaseOptionType) => i === nextId);
    }
    const end = start + limit;
    const list = filterList.slice(start, end);
    const nId = filterList.length >= end ? filterList[end] : undefined;

    return Promise.resolve({
      list,
      nextId: nId,
    });
  });

  const { data } = useInfiniteScroll((d) => getLoadMoreList(d?.nextId, limit), {
    target: containerRef,
    isNoMore: (d) => d?.nextId === undefined,
    reloadDeps: [filterList, filterValue],
  });

  const optionListLen = options?.length;

  const optListRender = useMemo(() => {
    if (!options?.length) {
      return <NoData small />;
    }
    const { list } = data || {};

    if (!list?.length) {
      return <NoData small />;
    }

    return (
      <div
        ref={containerRef}
        className={classNames('tz-panel-menu', {
          'tz-panel-menu-virtual': optionListLen > limit,
        })}
      >
        <ul>
          {list.map((item: TreeNode, index) => {
            const { disabled } = item;
            return (
              <li
                key={index}
                className={classNames(
                  'tz-panel-option-item',
                  {
                    'item-act': itemValue === item.value,
                  },
                  {
                    'tz-panel-option-item-haschildren': !item.isLeaf,
                  },
                  { disabled },
                )}
                style={dropdownMenuColumnStyle}
                onMouseEnter={(e) => onMouseEnter(e, item)}
                onClick={(e) => listItemClick(e, item)}
              >
                {multiple ? (
                  <TzCheckbox
                    {...item}
                    className="tz-panel-option-item-checkbox"
                    indeterminate={item.disabled ? false : getIndeterminate(item)}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    checked={item.disabled ? false : hasParentCheckedFunc(item.value)}
                    onChange={(e) => nodeCheckedFunc(e.target)}
                  >
                    <span style={{ display: 'none' }}> {item.label}</span>
                  </TzCheckbox>
                ) : null}
                <div className="tz-panel-menu-item-content" title={item.label}>
                  {labelFormat ? labelFormat(getSearchLabel(item.label), item) : getSearchLabel(item.label)}
                </div>

                {!item.isLeaf ? RenderArrow(item) : null}
              </li>
            );
          })}
        </ul>
      </div>
    );
  }, [
    value,
    listItemClick,
    hasParentCheckedFunc,
    hasChildCheckedFunc,
    itemValue,
    dropdownMenuColumnStyle,
    onMouseEnter,
    nodeCheckedFunc,
    data?.list,
    query,
    RenderArrow,
    labelFormat,
    optionListLen,
  ]);

  return (
    <div style={{ minWidth: '111px' }} className={'tz-cascader-panel tz-cascader-menu'}>
      <TzInput
        placeholder={translations.search_content}
        value={filterValue}
        size="small"
        prefix={<i className={'icon iconfont icon-sousuo'}></i>}
        onChange={(e) => {
          e.stopPropagation();
          setItemValue('');
          setFilterValue(e.target.value);
          setMenu((pre: any) => [...pre].slice(0, level + 1));
        }}
        onKeyDown={(e) => e.stopPropagation()}
      />
      <div className="tz-checkbox-group">{optListRender}</div>
    </div>
  );
};

/***
 * 扩展属性：changeOnSelect、defaultValue、disabled、popupClassName、expandIcon、expandTrigger、notFoundContent、status、multiple、dropdownMenuColumnStyle
 *
 */
export const TzCascaderPanel = (props: any) => {
  const { menu, ...rest } = useTzCascaderPanel(props);

  return (
    <div className="tz-cascader-menus">
      {menu.map((item, index) => {
        return <TzCascaderPanelItem {...props} {...item} {...rest} level={index} key={index} />;
      })}
    </div>
  );
};
