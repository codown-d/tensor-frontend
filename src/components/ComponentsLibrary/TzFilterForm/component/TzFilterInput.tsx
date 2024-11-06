import React, { ChangeEvent, useMemo, useRef, useState } from 'react';
import { TzPopover } from '../../../tz-popover';
import { TzInput } from '../../../tz-input';
import { ReactComponent as ClearIcon } from '../../../../assets/icons/clear-circle.svg';
import { InputRef, Tooltip, Typography } from 'antd';
import { TWids } from '../RederValueTxt';
import { FilterInput } from '../filterInterface';
import { isString } from 'lodash';

export type TTzFilterInput = Omit<FilterInput, 'icon' | 'type'> &
  FilterInput['props'] & {
    wids?: TWids;
    onDropdownVisibleChange?: (value: boolean) => void;
  };
const TzFilterInput = ({ value, onChange, onDropdownVisibleChange, name, wids, isTag }: TTzFilterInput) => {
  const [open, setOpen] = useState(false);
  const [inputV, setInputV] = useState<TTzFilterInput['value']>(value);
  const txtRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<InputRef>(null);

  const handleOpenChange = (newOpen: boolean) => {
    newOpen ? setInputV(value) : onChange?.(inputV);
    setOpen(newOpen);
    newOpen && inputRef.current?.focus();
    onDropdownVisibleChange?.(newOpen);
  };

  const tooltipTit = useMemo(() => {
    let tit: TTzFilterInput['value'] = '';
    if (wids?.[name] && wids?.[name] > 190) {
      tit = value || '';
    }
    return tit;
  }, [value, name, wids]);

  return (
    <TzPopover
      overlayClassName="tz-form-item-input-overlay"
      content={
        <div ref={txtRef}>
          <TzInput
            autoFocus
            ref={inputRef}
            value={inputV}
            bordered={false}
            className="tz-form-item-input"
            onChange={(e: ChangeEvent<HTMLInputElement>) => setInputV(e.target.value)}
            onPressEnter={() => handleOpenChange(false)}
            addonAfter={
              <ClearIcon onClick={(e) => setInputV(undefined)} className="tz-icon tz-form-item-input-clear" />
            }
          />
        </div>
      }
      placement="bottomLeft"
      title={false}
      trigger="click"
      open={open}
      onOpenChange={handleOpenChange}
      getPopupContainer={(n) => txtRef.current ?? n}
    >
      <Tooltip className="tz-form-item-input-txt" title={tooltipTit}>
        <Typography.Text>{isTag && isString(value) ? value.replace(/[\uff0c]/g, ',') : value}</Typography.Text>
      </Tooltip>
    </TzPopover>
  );
};

export default TzFilterInput;
