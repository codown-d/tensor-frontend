import { useUpdateEffect } from 'ahooks';
import { Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { get } from 'lodash';
import React, { useCallback, useMemo, useState } from 'react';
import EllipsisPopover from '../../../components/ellipsisPopover/ellipsisPopover';
import { TzTable } from '../../../components/tz-table';
import { TCustomConfigs, TCustomConfigsRule } from '../../../definitions';
import { translations } from '../../../translations/translations';
import { classNameTemp, setTemp, tampTit } from '../AlertCenterScreen';
import { severityFilters } from '../EventData';
import { hthreatsFilters } from '../RuleConfiguration/util';

export type RecordType = TCustomConfigsRule & Pick<TCustomConfigs, 'effect'>;
export type TRuleTableSelect = {
  dataSource: RecordType[];
  onChange?: (value: React.Key[]) => void;
  value?: string[];
  readOnly?: boolean;
};
const DEFAULT_FILTERED_INFO = { severity: null, hthreats: null };
const RuleTableSelect = ({
  dataSource: dataSourceOrigin,
  onChange: triggerChange,
  value: selectedRowKeys,
  readOnly,
}: TRuleTableSelect) => {
  const [dataSource, setDataSource] = useState(dataSourceOrigin);
  const [filteredInfo, setFilteredInfo] = useState(DEFAULT_FILTERED_INFO);

  useUpdateEffect(() => {
    setFilteredInfo(DEFAULT_FILTERED_INFO);
    setDataSource(dataSourceOrigin);
  }, [dataSourceOrigin]);

  const columns: ColumnsType<RecordType> = [
    {
      title: translations.originalWarning_rule,
      dataIndex: 'category',
      key: 'category',
      width: '90px',
      render: (text: string) => (
        <EllipsisPopover lineClamp={2}>{text ? text : '-'}</EllipsisPopover>
      ),
    },
    {
      title: translations.originalWarning_ruleName,
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <EllipsisPopover lineClamp={2}>{text ? text : '-'}</EllipsisPopover>
      ),
    },
    {
      title: translations.effect,
      dataIndex: 'effect',
      key: 'effect',
      render: (text: string) => (
        <EllipsisPopover lineClamp={2}>{text ? text : '-'}</EllipsisPopover>
      ),
    },
    {
      title: translations.notificationCenter_columns_severity,
      dataIndex: 'severity',
      key: 'severity',
      className: 'th-center',
      align: 'center',
      width: '100px',
      ...(readOnly
        ? {}
        : {
            filters: severityFilters,
            filteredValue: filteredInfo.severity || null,
          }),
      render: (text: number) => {
        const transSeverity = setTemp(text);
        return (
          <div className={'btn-state ' + classNameTemp[transSeverity]}>
            {tampTit[transSeverity]}
          </div>
        );
      },
    },
    {
      title: translations.needEmergencyHandle,
      dataIndex: 'hthreats',
      key: 'hthreats',
      className: 'th-center',
      align: 'center',
      width: '156px',
      ...(readOnly
        ? {}
        : {
            filters: hthreatsFilters,
            filteredValue: filteredInfo.hthreats || null,
          }),
      render: (text: number) => {
        let node = hthreatsFilters.find((item) => item.value === text);
        return (
          <span
            className={text ? 'btn-high' : ''}
            style={{ background: 'transparent', border: '0px' }}
          >
            {node?.text}
          </span>
        );
      },
    },
  ];

  const onSelectChange = useCallback(
    (newSelectedRowKeys: React.Key[]) => {
      triggerChange?.(newSelectedRowKeys);
    },
    [triggerChange],
  );

  const rowSelection = useMemo(() => {
    return {
      columnWidth: '32px',
      selectedRowKeys,
      onChange: onSelectChange,
    };
  }, [selectedRowKeys, onSelectChange]);
  const onChange = useCallback(
    (pagination, filters, sorter, extra) => {
      setFilteredInfo(filters);
      const { hthreats, severity: _severity } = filters;
      const severity = _severity?.length ? _severity.join(',').split(',') : null;
      if ((hthreats ?? severity ?? '') === '') {
        setDataSource(dataSourceOrigin);
        return;
      }
      const newData = dataSourceOrigin.filter((item) => {
        const row_severity = '' + get(item, 'severity');
        const row_hthreats = +get(item, 'hthreats');
        if (hthreats?.length && severity?.length) {
          return severity.includes(row_severity) && hthreats.includes(row_hthreats);
        }
        if (severity?.length) {
          return severity.includes(row_severity);
        }
        if (hthreats?.length) {
          return hthreats.includes(row_hthreats);
        }
        return true;
      });

      setDataSource(newData);
    },
    [dataSourceOrigin],
  );

  return (
    <TzTable
      className="nohoverTable"
      rowSelection={readOnly ? undefined : rowSelection}
      columns={columns}
      rowKey={(record) => record.key}
      dataSource={dataSource}
      onChange={onChange}
      pagination={false}
    />
  );
};

export default RuleTableSelect;
