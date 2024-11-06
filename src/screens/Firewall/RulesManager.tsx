import { TablePaginationConfig } from 'antd/lib/table';
import { isEqual, merge } from 'lodash';
import React, { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { map } from 'rxjs/operators';
import TzFilter from '../../components/ComponentsLibrary/TzFilter';
import useTzFilter, {
  FilterContext,
} from '../../components/ComponentsLibrary/TzFilter/useTzFilter';
import TzFilterForm from '../../components/ComponentsLibrary/TzFilterForm';
import { FilterFormParam } from '../../components/ComponentsLibrary/TzFilterForm/filterInterface';
import { TzButton } from '../../components/tz-button';
import { TzInputSearch } from '../../components/tz-input-search';
import { TzSwitch } from '../../components/tz-switch';
import { TzTableServerPage } from '../../components/tz-table';
import { onSubmitFailed, showSuccessMessage } from '../../helpers/response-handlers';
import { putWafRules, wafRules } from '../../services/DataService';
import { Store } from '../../services/StoreService';
import { translations } from '../../translations/translations';
import './Blackwhitelists.scss';
import useLayoutMainSearchWid from '../../helpers/useLayoutMainSearchWid';
import { useLocation } from 'react-router-dom';

const RulesManager = () => {
  const [filters, setFilters] = useState<any>();
  let [showPageFooter, setShowPageFooter] = useState(false);
  let [selectedRowKeys, setSelectedRowKeys] = useState<any>([]);
  const tableRef = useRef(undefined as any);
  let setPutWafRules = useCallback((data, callback: () => void) => {
    putWafRules(data).subscribe((res) => {
      if (res.error && res.error.message) {
        onSubmitFailed(res.error);
      } else {
        callback();
      }
    });
  }, []);
  const columns = [
    {
      title: translations.protection_rule_type,
      dataIndex: 'category',
      width: '30%',
      ellipsis: { showTitle: false },
      render: (description: any, row: any) => {
        return <>{description}</>;
      },
    },
    {
      title: translations.notificationCenter_columns_description,
      dataIndex: 'description',
      render: (description: any, row: any) => {
        return <>{description}</>;
      },
    },
    {
      title: translations.clusterManage_operate,
      dataIndex: 'status',
      width: '80px',
      ellipsis: { showTitle: false },
      render: (status: any, row: any) => {
        return (
          <>
            <TzSwitch
              size={'small'}
              checked={!status}
              onChange={() => {
                setPutWafRules(
                  {
                    category_id: [row.category_id],
                    status: row.status === 0 ? 1 : 0,
                  },
                  () => {
                    showSuccessMessage(
                      row.status === 0
                        ? translations.shutdown_successful
                        : translations.enablement_success,
                    );
                    tableRef.current.refresh();
                  },
                );
              }}
            ></TzSwitch>{' '}
          </>
        );
      },
    },
  ];

  const reqFun = useCallback(
    (pagination: TablePaginationConfig) => {
      const { current = 1, pageSize = 10 } = pagination;
      const offset = (current - 1) * pageSize;
      let pageParams = Object.assign({ limit: pageSize, offset }, filters);
      return wafRules(pageParams).pipe(
        map((res: any) => {
          let items = res.getItems();
          return {
            data: items,
            total: res?.data?.totalItems,
          };
        }),
      );
    },
    [filters],
  );
  let handleRowSelection = (selected: boolean, selectedRows: any[]) => {
    setSelectedRowKeys((pre: any) => {
      selectedRows.forEach(({ category_id }: any) => {
        if (selected) {
          pre.push(category_id);
        } else {
          pre.remove(category_id);
        }
      });
      return [...pre];
    });
  };
  const rowSelection = useMemo(() => {
    if (!showPageFooter) return undefined;
    return {
      columnWidth: '32px',
      selectedRowKeys,
      onSelect: (record: any, selected: any, selectedRows: any, nativeEvent: any) => {
        nativeEvent.stopPropagation();
        handleRowSelection(selected, [record]);
      },
      onSelectAll: (selected: any, selectedRows: any, changeRows: any) => {
        handleRowSelection(selected, changeRows);
      },
    };
  }, [showPageFooter, selectedRowKeys]);
  let l = useLocation();
  let setFooter = useCallback(() => {
    Store.pageFooter.next(
      showPageFooter ? (
        <div>
          <span className="mr16 ml16">{`${translations.selected} ${selectedRowKeys.length} ${translations.items}`}</span>
          <TzButton
            className={'mr20'}
            disabled={!selectedRowKeys.length}
            onClick={() => {
              setPutWafRules(
                {
                  category_id: selectedRowKeys,
                  status: 0,
                },
                () => {
                  showSuccessMessage(translations.batch_activation_successful);
                  tableRef.current.refresh();
                  setShowPageFooter(false);
                  setSelectedRowKeys([]);
                },
              );
            }}
          >
            {translations.deflectDefense_strat}
          </TzButton>
          <TzButton
            className={'mr20'}
            disabled={!selectedRowKeys.length}
            onClick={() => {
              setPutWafRules(
                {
                  category_id: selectedRowKeys,
                  status: 1,
                },
                () => {
                  showSuccessMessage(translations.batch_shutdown_successful);
                  tableRef.current.refresh();
                  setShowPageFooter(false);
                  setSelectedRowKeys([]);
                },
              );
            }}
          >
            {translations.confirm_modal_close}
          </TzButton>
        </div>
      ) : null,
    );
  }, [showPageFooter, selectedRowKeys, l]);
  useEffect(() => {
    setFooter();
  }, [setFooter]);
  const fitlerWid = useLayoutMainSearchWid({});
  return (
    <div className="rules-manager mlr32">
      <div className="mb12 mt4 flex-r-c">
        <TzButton
          type={'primary'}
          onClick={() => {
            setShowPageFooter((pre) => !pre);
          }}
        >
          {showPageFooter ? translations.cancel_batch_operation : translations.batch_operation}
        </TzButton>
        <TzInputSearch
          style={{ fontSize: 14, width: `${fitlerWid}px` }}
          placeholder={translations.unStandard.str251}
          allowClear
          onSearch={(val) => {
            setFilters({
              name: val,
            });
          }}
        />
      </div>
      <TzTableServerPage
        rowSelection={rowSelection}
        className={'nohoverTable mb40'}
        columns={columns}
        tableLayout={'fixed'}
        defaultPagination={{
          current: 1,
          pageSize: 1000,
          hideOnSinglePage: true,
        }}
        rowKey="category_id"
        reqFun={reqFun}
        ref={tableRef}
      />
    </div>
  );
};
export default RulesManager;
