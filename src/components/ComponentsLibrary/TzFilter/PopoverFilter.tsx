import React, { ChangeEvent, ReactNode, useCallback, useContext, useMemo, useRef, useState } from 'react';
import Icon from '@ant-design/icons';
import classNames from 'classnames';
import { TzInput } from '../../tz-input';
import { TzPopover } from '../../tz-popover';
import {
  FilterDatePicker,
  FilterFormParam,
  FilterFormParamCommon,
  FilterSelect,
} from '../TzFilterForm/filterInterface';
import RenderItem from '../TzFilterForm/RenderItem';
import './index.scss';
import { FilterContext } from './useTzFilter';
import { PopoverProps } from 'antd';
import { TzTooltip } from '../../tz-tooltip';
import { TooltipPlacement } from 'antd/es/tooltip';
import { isArray, merge, upperCase } from 'lodash';
import NoData from '../../noData/noData';
import moment from 'moment';
import { DATES, getDefaultFormat, SELECTS } from '../TzFilterForm/utils';
import { TzSelectProps } from '../../tz-select';
import { useSize } from 'ahooks';
import { translations } from '../../../translations/translations';

/**
 * 图标都是一一对应，必传项
 * 图标svg:
 * 命中规则：mzgz / 事件标记：sjbj / 事件类型：sjlx / 严重程度：yzcd / 标签：bq
 * 集群：jq / 容器：rq / 命名空间：mmkj / pod：pod / 资源：zy
 * 仓库：ck / 镜像：jx / 镜像tag：jxtag / 主机名称：zlmc / 发生时间：fssj
 *
 */

type TPopoverFilter = {
  Popoverprops?: PopoverProps;
  icon: ReactNode;
  className?: string;
  addTipPlacement?: TooltipPlacement | undefined;
};
const PopoverFilter = ({ Popoverprops, className, icon, addTipPlacement }: TPopoverFilter) => {
  const context = useContext(FilterContext);
  const { addFilter: onChange, popoverFilterData: data, updateEnumLabels } = context;
  const [fitlerItem, setFitlerItem] = useState<FilterFormParamCommon>();
  const [value, setValue] = useState<any>();
  const [open, setOpen] = useState(false);
  const filterOverRef = useRef<any>();
  const [search, setSearch] = useState<string>();
  const [titleVal, setTitleVal] = useState<string>();

  const { height: containerH = 0 } = useSize(document.querySelector('body')) || {};

  const triggerChange = useCallback(
    (value) => {
      if (isArray(value) ? value.length : value) {
        fitlerItem &&
          onChange({
            ...fitlerItem,
            value: value,
          });
      }
    },
    [fitlerItem, onChange],
  );

  const initState = () => {
    setValue(undefined);
    setFitlerItem(undefined);
    setSearch(undefined);
    setTitleVal(undefined);
  };

  const handleOpenChange = useCallback(
    (arg: boolean) => {
      if (arg) {
        setOpen(arg);
        return;
      }
      triggerChange(value);
      setOpen(false);
      initState();
    },
    [value, fitlerItem, triggerChange],
  );

  const onOk = useCallback(
    (val) => {
      triggerChange(val);
      setOpen(false);
      initState();
    },
    [triggerChange],
  );

  const handleListItemClick = useCallback(({ value, ...rest }) => {
    setFitlerItem(rest);
  }, []);

  const handleChange = useCallback(
    (val) => {
      if (fitlerItem?.type === 'rangePicker') {
        const format = getDefaultFormat(fitlerItem);
        setTitleVal(val?.map((v: moment.Moment) => (v ? moment(v).format(format) : '')));
      }
    },
    [fitlerItem],
  );

  const handleItemChange = useCallback(
    (val: any, items) => {
      handleChange(val);
      if (fitlerItem?.type === 'rangePickerCt') {
        onOk(formatTriggerValue(val));
      } else {
        setValue(formatTriggerValue(val));
      }
    },
    [fitlerItem],
  );

  const formatTriggerValue = useCallback(
    (val) => {
      if (fitlerItem?.type === 'rangePickerCt') {
        return [val, null];
      }
      return val;
    },
    [fitlerItem],
  );

  const mergeProps = useCallback(
    (fitlerItem) => {
      if (DATES.includes(fitlerItem.type)) {
        let mergeItem = merge({}, fitlerItem) as FilterDatePicker;
        merge(mergeItem, {
          ...mergeItem,
          props: {
            ...mergeItem.props,
            autoFocus: true,
            onOk: (e: FilterDatePicker['value']) => {
              if (fitlerItem?.type === 'rangePicker') {
                if (isArray(e) && e[0] && e[1]) {
                  onOk(formatTriggerValue(e));
                }
              } else if (fitlerItem?.type !== 'rangePickerCt') {
                onOk(formatTriggerValue(e));
              }
              (fitlerItem as FilterDatePicker).props?.onOk?.(e as moment.Moment);
            },
          },
        });
        return mergeItem;
      }
      if (fitlerItem.type === 'select' && fitlerItem.props.mode !== 'multiple') {
        let mergeItem = merge({}, fitlerItem) as FilterSelect;
        merge(mergeItem, {
          onChange: (val: TzSelectProps['value'], valStr: any) => {
            onOk(formatTriggerValue(val));
          },
        });
        return mergeItem;
      }

      return fitlerItem;
    },
    [handleChange],
  );

  const filtered = useMemo(
    () => (search ? data.filter((item) => upperCase(item.label).indexOf(upperCase(search)) > -1) : data),
    [data, search],
  );

  const content = useMemo(() => {
    if (fitlerItem) {
      return (
        <RenderItem
          value={value}
          onChange={handleItemChange}
          updateEnumLabels={updateEnumLabels}
          {...mergeProps(fitlerItem)}
          isFilter
          overRef={filterOverRef.current}
        />
      );
    }

    return filtered.length ? (
      <ul className="tz-filter-list-ul" style={{ maxHeight: containerH - 81 }}>
        {filtered.map((item: FilterFormParam, index) => (
          <li className="tz-filter-list-li" onClick={() => handleListItemClick(item)} key={index}>
            {item.icon ? (
              <i className={classNames('tz-filter-form-item-label-icon icon iconfont', item.icon)}></i>
            ) : null}
            {item.label}
          </li>
        ))}
      </ul>
    ) : (
      <NoData small />
    );
  }, [filtered, fitlerItem, value, handleItemChange, search, onOk, mergeProps, containerH]);

  const title = useMemo(
    () => (
      <TzInput
        onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
        className="tz-filter-overlay-search"
        allowClear={false}
        placeholder={translations.searchTxt}
      />
    ),
    [setSearch],
  );

  const titleRender = useMemo(() => {
    if (!open) {
      return '';
    }

    if (fitlerItem?.type && (SELECTS.includes(fitlerItem.type) || DATES.includes(fitlerItem?.type))) {
      return '';
    }

    return fitlerItem?.label ?? title;
  }, [titleVal, fitlerItem, open, title]);
  return (
    <div className={classNames('tz-filter-popover', className)}>
      <TzPopover
        getPopupContainer={(n) => n}
        open={open}
        content={
          !open ? null : (
            <div
              className={classNames('tz-filter-overlay-popcontent', `tz-filter-overlay-popcontent-${fitlerItem?.type}`)}
              ref={filterOverRef}
            >
              {content}
            </div>
          )
        }
        trigger="click"
        overlayClassName={classNames('tz-filter-overlay', {
          'tz-filter-overlay-item-panel': !!fitlerItem,
          'tz-filter-overlay-item-panel-list-overflow':
            !fitlerItem && containerH - (36 * filtered.length + 16 + 81) < 0,
        })}
        title={titleRender}
        onOpenChange={handleOpenChange}
        placement="bottomRight"
        {...Popoverprops}
      >
        <TzTooltip title={translations.addCondition} placement={addTipPlacement} autoAdjustOverflow>
          <div
            className={classNames('tz-filter-button', {
              'tz-filter-button-active': open,
            })}
          >
            {icon}
          </div>
        </TzTooltip>
      </TzPopover>
    </div>
  );
};

export default PopoverFilter;
