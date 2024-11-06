import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState, useImperativeHandle } from 'react';
import DataTable, { IDataTableProps } from 'react-data-table-component';
import ReactPaginate from 'react-paginate';
import { translations } from '../../translations/translations';
import NoData from '../noData/noData';
import { Skeleton } from '../skeleton/Skeleton';
import classNames from 'classnames';
import './TableList.scss';

export const PaginationComponent = (props: {
  currentPage?: number;
  onChangePage: (val: number) => void;
  rowCount?: number;
  rowsPerPage?: number;
  onChangeRowsPerPage?: any;
  innerPageStyle?: boolean;
  resetCurrentPage?: any;
}) => {
  const {
    currentPage = 0,
    onChangePage,
    // onChangeRowsPerPage,
    rowCount = 0,
    rowsPerPage = 10,
    innerPageStyle,
    resetCurrentPage,
  } = props;
  const handlePageClick = useCallback(
    ({ selected }) => {
      const val = selected + 1;
      if (!val || isNaN(Number(val)) || String(val) === `${currentPage}`) {
        return;
      }
      if (resetCurrentPage) resetCurrentPage(false);
      onChangePage(val);
    },
    [onChangePage, currentPage],
  );

  const [innerCurrentPage, setInnerCurrentPage] = useState(currentPage);
  useEffect(() => {
    setInnerCurrentPage(currentPage);
  }, [currentPage]);
  const pageJumpInput = useCallback((e: any) => {
    const val = e.target.value;
    setInnerCurrentPage(val);
  }, []);
  const pageCount = useMemo(() => {
    if (rowsPerPage === 0) {
      return 1;
    }
    if (rowCount % rowsPerPage === 0) {
      const tempPageCount = Math.floor(rowCount / rowsPerPage);
      return tempPageCount === 0 ? 1 : tempPageCount;
    } else {
      return Math.floor(rowCount / rowsPerPage) + 1;
    }
  }, [rowCount, rowsPerPage]);
  const sureJump = useCallback(() => {
    let val = innerCurrentPage;
    if (!val || isNaN(Number(val)) || String(val) === `${currentPage}`) {
      return;
    }
    if (val > pageCount) {
      val = pageCount;
    }
    onChangePage(val);
  }, [innerCurrentPage, pageCount, currentPage, onChangePage]);

  return (
    <div className={`victor-pagination-compontant ${innerPageStyle ? 'innerPageStyle' : ''}`}>
      {/* <button onClick={() => onChangeRowsPerPage(2)}>2</button> */}
      <ReactPaginate
        previousLabel={<>&lt;</>}
        nextLabel={<>&gt;</>}
        breakLabel={'...'}
        // breakClassName={'break-btn'}
        pageCount={pageCount}
        marginPagesDisplayed={1}
        pageRangeDisplayed={3}
        onPageChange={handlePageClick}
        containerClassName="pagination-compontant"
        activeClassName="page-active"
        pageClassName="page"
        disabledClassName="page-disable"
        forcePage={currentPage - 1}
      />
      <div className="page-jump-box">
        <div className="adapt-tz-box">
          <span>{translations.pagination_jumpTo}: </span>
          <input value={innerCurrentPage} type="text" onChange={pageJumpInput} />
        </div>
        {/* <span>{translations.pagination_page}</span> */}
        <button type="button" onClick={sureJump}>
          {translations.pagination_sure}
        </button>
      </div>
    </div>
  );
};

export interface LocalDataTableProps extends IDataTableProps {
  boxClassName?: string;
  loading?: boolean; // 当paginationServer为true时，组件获取数据后不可卸载，否则分页失效，因此loading作为属性传入不可三联判断显示
  innerPageStyle?: boolean; // 二级三级列表下的分页样式,
}
export const LocalDataTable = forwardRef((props: LocalDataTableProps, ref?: any) => {
  const {
    boxClassName,
    className,
    paginationComponent,
    pagination,
    loading,
    expandableRows,
    data,
    innerPageStyle,
    onChangePage,
  } = props;
  const [resetCurrentPageFlag, resetCurrentPage] = useState<boolean>(false);
  const tbEl = useRef(null as null | HTMLDivElement);

  const PaginationUsed = useMemo(() => {
    if (!pagination) {
      return null;
    }

    return (
      paginationComponent ||
      ((params: any) => {
        if (resetCurrentPageFlag) params = { ...params, currentPage: 1 };
        return <PaginationComponent {...params} innerPageStyle={innerPageStyle} resetCurrentPage={resetCurrentPage} />;
      })
    );
  }, [pagination, paginationComponent, innerPageStyle, resetCurrentPageFlag]);

  const onChangePageUsed = useCallback(
    (page: number, totalRows: number) => {
      if (tbEl.current) {
        const btns = tbEl.current.querySelectorAll('button') as any;
        Array.from(btns).forEach((item: any) => {
          const lb = item.getAttribute('aria-label');
          if (lb === 'Collapse Row') {
            item.click();
          }
        });
      }

      onChangePage && onChangePage(page, totalRows);
    },
    [onChangePage],
  );

  const filteredProps = useMemo(() => {
    const cpProps = { ...props };
    delete cpProps.paginationComponent;
    delete cpProps.loading;
    delete cpProps.boxClassName;
    delete cpProps.innerPageStyle;
    delete cpProps.onChangePage;
    return cpProps;
  }, [props]);

  useImperativeHandle(
    ref,
    () => {
      return {
        resetCurrentPage,
      };
    },
    [resetCurrentPage],
  );

  return (
    <div className={classNames(boxClassName, 'customTables')} ref={tbEl}>
      {loading && <Skeleton hideGrid={true} />}
      {!loading && (!data || (data.length <= 0 && <NoData />))}
      <DataTable
        className={`normal_table_list_data_table  ${expandableRows ? 'has_expandable_rows_btn' : ''} ${
          loading || !data || data.length <= 0 ? 'normal_table_list_data_table_none' : ''
        } ${className || ''}`}
        paginationComponent={PaginationUsed}
        onChangePage={onChangePageUsed}
        {...filteredProps}
      />
    </div>
  );
});

export default LocalDataTable;
