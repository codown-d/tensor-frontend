import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState, useRef } from 'react';
import './index.scss';
import { Observable, Subscription } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import NoData from '../noData/noData';
import { Resources } from '../../Resources';
import { merge } from 'lodash';
import { localLang, translations } from '../../translations/translations';
import classNames from 'classnames';
import Table, { TablePaginationConfig, TableProps } from 'antd/lib/table';
import { FilterValue, SorterResult, TableCurrentDataSource } from 'antd/lib/table/interface';
import ConfigProvider from 'antd/lib/config-provider';
import zh_CN from 'antd/lib/locale/zh_CN';
import en_US from 'antd/lib/locale/en_US';
import { SupportedLangauges } from '../../definitions';

export const TableScrollFooter = (props: TableScrollProps) => {
  let [text, noMore, lenghtMark] = useMemo(() => {
    let text = props.text || '没有更多数据了';
    let noMore = props.noMore;
    const lenghtMark = props.isData || false;
    return [text, noMore, lenghtMark];
  }, [props]);
  return (
    <>
      {noMore && lenghtMark ? (
        <div className={'table-footer'}>
          ————<span style={{ padding: '0 24px' }}>{text}</span>————
        </div>
      ) : null}
    </>
  );
};

// ccc
export const LoadingImg = () => {
  return (
    <div style={{ width: '100px' }}>
      <img src={Resources.Loading} alt="loading" style={{ width: '100px', height: '100px' }} />
      <div style={{ color: '#2177D1', textAlign: 'center' }}>{translations.loading}</div>
    </div>
  );
};

const ExpandedChildren = (props: any) => {
  const {
    record,
    index,
    indent,
    expanded,
    expandable: { expandedRowRender },
    onExpandFn,
    hoverKey,
    setHoverKey,
    getRowKey,
  } = props;
  const _key = getRowKey(record);
  const childrenDom = useMemo(() => {
    return expandedRowRender(record, index, indent, expanded);
  }, [record, index, indent, expanded]);
  return (
    <>
      <div
        onMouseEnter={() => {
          if (hoverKey === _key && hoverKey) {
            return;
          }
          setHoverKey(_key);
        }}
        onMouseLeave={() => {
          setHoverKey(undefined);
        }}
        className="ant-table-expanded-row-group"
      >
        {expandedRowRender && childrenDom}
        <div
          onClick={(e) => onExpandFn.current && onExpandFn.current(record, e)}
          className="ant-table-expanded-close-btn"
        >
          <span style={{ fontSize: '12px' }}>
            <i className="icon iconfont icon-arrow f-l mt3 rotatez" /> &nbsp;
            {translations.pack_up}
          </span>
        </div>
      </div>
    </>
  );
};

interface TableScrollProps {
  text?: string | React.ReactNode;
  noMore: boolean;
  isData?: boolean;
  loading?: boolean;
}
export interface TzTableProps extends TableProps<any> {
  ref?: any;
}

export const TzTable = (props: TzTableProps) => {
  let { dataSource, ...tableProps } = props;
  let defaultTablePagination = {
    defaultCurrent: 1,
    defaultPageSize: 10,
    showSizeChanger: true,
    pageSizeOptions: [10, 20, 50, 100],
    showTotal: (total: any) => `${translations.sum} ${total} ${translations.t}`,
    total: 0,
    showQuickJumper: true,
    itemRender: (_: any, type: string, originalElement: any) => {
      if (type === 'prev') {
        return (
          <div className="ant-pagination-item-link">
            <i className={'iconfont icon-arrow'} style={{ transform: 'rotateZ(90deg)' }}></i>
          </div>
        );
      }
      if (type === 'next') {
        return (
          <div className="ant-pagination-item-link">
            <i className={'iconfont icon-arrow'} style={{ transform: 'rotateZ(-90deg)' }}></i>
          </div>
        );
      }
      return originalElement;
    },
  };
  const getRowKey = useCallback(
    (record: any) => {
      const { rowKey } = props;
      if (!rowKey) {
        return undefined;
      }
      if (typeof rowKey === 'string') {
        return record && record[rowKey];
      }
      if (typeof rowKey === 'function') {
        const key = rowKey(record);
        return key;
      }
    },
    [props.rowKey],
  );
  const [hoverKey, setHoverKey] = useState<string | undefined>(undefined);
  let onExpandFn = useRef(() => {});
  const tzExpandable = useMemo(() => {
    if (!props.expandable) {
      return undefined;
    }
    return Object.assign({}, props.expandable, {
      columnWidth: 40,
      expandRowByClick: true,
      expandIcon: ({ expanded, onExpand, record }: any) => {
        onExpandFn.current = onExpand;
        return (
          <span className="tz-expandico" onClick={(e: any) => onExpand(record, e)}>
            <i className={`icon iconfont f16 ${expanded ? 'icon-arrow' : 'icon-arrow expand'}`} />
          </span>
        );
      },
      expandedRowRender: (record: any, index: any, indent: any, expanded: any) => {
        return (
          <ExpandedChildren
            record={record}
            index={index}
            indent={indent}
            expanded={expanded}
            expandable={props.expandable}
            onExpandFn={onExpandFn}
            hoverKey={hoverKey}
            setHoverKey={setHoverKey}
            getRowKey={getRowKey}
          />
        );
      },
    });
  }, [props.expandable, props.onExpand, hoverKey, getRowKey, onExpandFn]);

  const realProps = useMemo(() => {
    let pagination: any = merge({}, defaultTablePagination, props.pagination);
    if (
      pagination.defaultPageSize < defaultTablePagination.defaultPageSize &&
      !pagination.pageSizeOptions.includes(pagination.defaultPageSize)
    ) {
      pagination.pageSizeOptions.unshift(pagination.defaultPageSize);
    }
    if (props?.pagination && props?.pagination?.hideOnSinglePage == false) {
      pagination['hideOnSinglePage'] = false;
    } else {
      pagination['hideOnSinglePage'] = pagination.defaultPageSize === 10 || pagination.pageSize === 10 ? true : false;
    }

    return {
      ...props,
      className: classNames('tz-table', props.className, {
        'tz-table-expand': props.expandable,
      }),
      pagination: !props.pagination ? props.pagination : pagination,
      expandable: tzExpandable,
      loading: {
        indicator: <LoadingImg />,
        spinning: !!props.loading,
      },
      locale: Object.assign(
        {
          emptyText: !!props.loading ? <></> : NoData,
        },
        props.locale,
      ),
      rowClassName: (record: any, index: number) => {
        const _key = getRowKey(record);
        let strClassNames = index % 2 === 0 ? 'odd ' : 'even ';
        if (hoverKey === _key && _key) {
          strClassNames += ' openHover ';
        }
        if (props.rowClassName) {
          if (typeof props.rowClassName === 'string') {
            return strClassNames + props.rowClassName;
          } else {
            return strClassNames + (props.rowClassName as any)(record, index);
          }
        } else {
          return strClassNames;
        }
      },
    };
  }, [props, tzExpandable, getRowKey, hoverKey]);
  return (
    <ConfigProvider locale={localLang === SupportedLangauges.English ? en_US : zh_CN}>
      <Table {...realProps} />
    </ConfigProvider>
  );
};
interface OnchangeParameter {
  pagination: TablePaginationConfig;
  filters?: Record<string, FilterValue | null>;
  sorter?: SorterResult<any> | SorterResult<any>[];
  extra?: TableCurrentDataSource<any>;
}

export interface TzTableServerPageProps extends TableProps<any> {
  defaultPagination?: TablePaginationConfig;
  defaultFilters?: any;
  reqFun?: (
    pagination: TablePaginationConfig,
    filters?: Record<string, FilterValue | null>,
    sorter?: SorterResult<any> | SorterResult<any>[],
    extra?: TableCurrentDataSource<any>,
  ) => Observable<
    | {
        data?: any[];
        total?: number;
        current?: number;
        pageSize?: number;
      }
    | undefined
  >;
  equalServerPageAnyway?: boolean;
  setFilterFunc?: any;
  totalRow?: number;
}

export const TzTableServerPage = forwardRef((props: TzTableServerPageProps, ref?: any) => {
  let defaultTablePagination = {
    defaultCurrent: 1,
    defaultPageSize: 10,
    pageSize: 10,
    showSizeChanger: true,
    pageSizeOptions: [10, 20, 50, 100],
  };
  const { reqFun, equalServerPageAnyway = true, setFilterFunc, onChange, totalRow, ...tableProps } = props;
  const defaultPagination = useMemo(() => {
    return merge({}, defaultTablePagination, props.defaultPagination);
  }, [props?.defaultPagination]);

  const [data, setdata] = useState([] as any);
  const [loading, setloading] = useState(true);

  const reqsub = useRef(undefined as undefined | Subscription);
  const reqParams = useRef<any>({
    pagination: defaultPagination,
    filters: props.defaultFilters || {},
  });

  const reqSubFun = useCallback(() => {
    reqsub.current?.unsubscribe();
    setloading(true);
    const { pagination, filters, sorter = {}, extra = {} } = reqParams.current;
    reqsub.current =
      reqFun &&
      reqFun(pagination, filters, sorter, extra)
        .pipe(
          tap((res) => {
            setdata(res?.data);
            let pagination = reqParams.current.pagination;
            if (res?.data?.length === 0 && pagination.current !== 1) {
              reqParams.current = merge(
                { pagination, filters },
                {
                  pagination: {
                    total: res?.total,
                    current: pagination.current - 1,
                  },
                },
              );
              setTimeout(() => {
                reqSubFun();
              }, 0);
            } else {
              reqParams.current = merge({ pagination, filters }, { pagination: { total: res?.total } });
            }
          }),
          finalize(() => {
            setloading(false);
          }),
        )
        .subscribe();
  }, [reqFun, reqParams]);

  const handleTableChange = (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: any,
    extra: TableCurrentDataSource<any>,
  ) => {
    if (filters && setFilterFunc) setFilterFunc(filters);
    !onChange || onChange(pagination, filters, sorter, extra);
    reqParams.current = {
      pagination,
      filters,
      sorter,
      extra,
    };
    reqSubFun();
  };
  useEffect(() => {
    let { pagination = {} } = reqParams.current;
    reqParams.current = Object.assign({}, reqParams.current, merge({ pagination }, { pagination: { current: 1 } }));
    reqSubFun();
    return () => {
      reqsub.current?.unsubscribe();
    };
  }, [props.reqFun, reqParams]);

  useImperativeHandle(ref, () => {
    let obj = {
      updateItem(item: any, nitem: any, compkeys: string[] = ['id']) {
        if (!item || !data) {
          return data;
        }
        const cIndex = data.findIndex(
          (_item: any) =>
            _item === item ||
            compkeys.every((k) => {
              if (_item[k] === undefined || item[k] === undefined) {
                return false;
              }
              return _item[k] === item[k];
            }),
        );
        if (cIndex !== -1) {
          const cpdata = data?.slice(0);
          if (nitem === null) {
            cpdata?.splice(cIndex, 1);
          } else {
            cpdata?.splice(cIndex, 1, nitem);
          }
          setdata(cpdata);
          return cpdata;
        }
        return data;
      },
      getData() {
        return { data, ...reqParams };
      },
      setData(data: any) {
        setdata(data);
      },
      initPage() {
        obj.resetPagination();
      },
      refresh(data?: OnchangeParameter) {
        if (data) {
          reqParams.current = merge({}, reqParams.current, data);
        } else {
          reqSubFun();
        }
      },
      resetPagination() {
        let { pagination = {} } = reqParams.current;
        reqParams.current = Object.assign({}, reqParams.current, merge(pagination, { current: 1 }));
        reqSubFun();
      },
      resetFilter(filters = {}) {
        reqParams.current = merge({}, reqParams.current, {
          filters,
        });
        reqSubFun();
      },
      // 为了table下滑时，每次更新数据后修改分页数，使其pagesize和数据总数保持一致，保证不会显示分页
      setNewPagination(pag: any) {
        reqParams.current = Object.assign({}, reqParams.current, {
          pagination: pag,
        });
      },
    };
    return obj;
  }, [data, reqParams]);

  const pagination = useMemo(() => {
    if (totalRow === undefined) {
      return reqParams.current.pagination;
    }
    return { ...reqParams.current.pagination, total: totalRow };
  }, [reqParams.current.pagination, totalRow]);

  return (
    <TzTable
      dataSource={data}
      pagination={pagination}
      loading={loading}
      {...tableProps}
      getPopupContainer={(triggerNode: any) => {
        if ($(triggerNode).parents('.ant-drawer-content').length) {
          return $(triggerNode).parents('.ant-drawer-content')[0];
        } else {
          return document.getElementById('layoutMainContent');
        }
      }}
      onChange={handleTableChange}
    />
  );
});

export interface TzTableKeyValProps {
  data: { [key: string]: any };
  keysSort?: string[];
  colCount?: number;
  tableProps?: TableProps<any>;
  keyFormatFun?: (keyName: string, vaL: any) => any;
  valFormatFun?: (keyName: string, vaL: any) => any;
  keyWidth?: string | number;
  valueWidth?: string | number;
}

interface TempColumn {
  real: any;
  keyText: string;
  val: any;
}

export const TzTableKeyVal = (props: TzTableKeyValProps) => {
  const keyMark = 'key';
  const valMark = 'val';

  const { data, keysSort, colCount = 2, tableProps, keyFormatFun, valFormatFun, keyWidth, valueWidth } = props;
  const _keys = useMemo(() => {
    return keysSort || Object.keys(data);
  }, [data, keysSort]);

  const spliceKeys = useMemo(() => {
    const arrSplit: string[][] = [];
    let tempOneTime: string[] = [];

    _keys.forEach((item, index) => {
      tempOneTime.push(item);
      if ((index + 1) % colCount === 0) {
        arrSplit.push(tempOneTime);
        tempOneTime = [];
      }
    });

    if (tempOneTime.length > 0) {
      arrSplit.push(tempOneTime);
    }
    return arrSplit;
  }, [_keys, colCount]);

  const [dataSource, columns] = useMemo(() => {
    const maxlen = spliceKeys?.[0]?.length || 0;

    const _cols: string[] = [];

    const _dataSource = spliceKeys.map((rowitem, index) => {
      const obj = {
        __id: index,
      } as { [_key: string]: any };

      for (let i = 0; i < maxlen; i++) {
        const _keyName = `${keyMark}_${i}`;
        const keyText = rowitem[i] || '';

        const val = keyText ? data[keyText] : '';
        const _valName = `${valMark}_${i}`;

        obj[_keyName] = { real: keyText, keyText, val } as TempColumn;
        obj[_valName] = { real: val, keyText, val } as TempColumn;

        if (!_cols.includes(_keyName)) {
          _cols.push(_keyName);
        }
        if (!_cols.includes(_valName)) {
          _cols.push(_valName);
        }
      }
      return obj;
    });

    const _columns = _cols.map((colkey) => {
      const iskey = colkey.startsWith(keyMark);
      const isval = colkey.startsWith(valMark);

      let column: any = {
        title: colkey,
        dataIndex: colkey,
        className: iskey ? 'iskey' : isval ? 'isval' : '',
        render(item: TempColumn) {
          if (iskey) {
            return keyFormatFun ? keyFormatFun(item.keyText, item.val) || '' : item.real;
          }
          if (isval) {
            return valFormatFun ? valFormatFun(item.keyText, item.val) || '' : item.real;
          }
          return item.real;
        },
      };
      if (keyWidth && valueWidth) column = { ...column, width: iskey ? keyWidth : valueWidth };
      return column;
    });

    return [_dataSource, _columns];
  }, [data, keyFormatFun, spliceKeys, valFormatFun, keyWidth, valueWidth]);

  const rowKey = useCallback((item) => {
    return item.__id;
  }, []);

  return (
    <Table
      className={`tz-table-keyval nohoverTable`}
      showHeader={false}
      bordered
      rowKey={rowKey}
      dataSource={dataSource}
      columns={columns}
      pagination={false}
      {...tableProps}
    />
  );
};
