import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { translations } from '../../translations/translations';
import { Store } from '../../services/StoreService';
import { TzButton } from '../../components/tz-button';
import { useMemoizedFn } from 'ahooks';
import { useLocation } from 'react-router-dom';

export type IResult = [
  {
    active: boolean;
    rowSelection: any;
  },
  {
    setActive: (...args: any[]) => void;
    setSelectedRowKeys: (...args: any[]) => void;
  },
];

export function useBatchAction(rowKey: string, onToggle: any): IResult {
  const [active, setActive] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<any>([]);
  const l = useLocation();

  const handleRowSelection = (selected: boolean, selectedRows: any[]) => {
    const ids = selectedRows.map((_item) => _item[rowKey]);
    setSelectedRowKeys((val: any[]) => {
      return selected ? [...val, ...ids] : val.filter((_id) => !ids.includes(_id));
    });
  };

  const rowSelection = useMemo(() => {
    if (!active) return undefined;
    return {
      columnWidth: '32px',
      selectedRowKeys,
      onSelect: (record: any, selected: boolean, selectedRows: any, nativeEvent: any) => {
        nativeEvent.stopPropagation();
        handleRowSelection(selected, [record]);
      },
      onSelectAll: (selected: any, selectedRows: any, changeRows: any) => {
        handleRowSelection(selected, changeRows);
      },
    };
  }, [active, selectedRowKeys]);

  const setFooter = useCallback(() => {
    const selectedNum = selectedRowKeys.length;

    const btnJsx = (
      <div>
        <span className="mr16 ml16">{`${translations.selected} ${selectedNum} ${translations.items}`}</span>
        <TzButton
          className={'mr20'}
          disabled={!selectedNum}
          onClick={() => onToggle('open', selectedRowKeys)}
        >
          开启
        </TzButton>
        <TzButton
          className={'mr20'}
          disabled={!selectedNum}
          onClick={() => onToggle('close', selectedRowKeys)}
        >
          关闭
        </TzButton>
      </div>
    );
    Store.pageFooter.next(active ? btnJsx : null);
  }, [active, selectedRowKeys]);
  useEffect(() => setFooter(), [setFooter, l]);

  return [
    {
      active,
      rowSelection,
    },
    {
      setActive,
      setSelectedRowKeys,
    },
  ];
}

interface IBatchButtonProps {
  style?: any;
  active: any;
  setActive: any;
  setSelectedRowKeys: any;
}

export function BatchButton(props: IBatchButtonProps) {
  const { style = {} } = props;
  const { active, setActive, setSelectedRowKeys } = props;

  const onClickBatch = useMemoizedFn(() => {
    if (!active) {
      setSelectedRowKeys!([]);
    }
    setActive!(!active);
  });

  return (
    <TzButton style={{ margin: '-4px 0 12px', ...style }} onClick={onClickBatch}>
      {active ? translations.cancel_batch_operation : translations.batch_operation}
    </TzButton>
  );
}
