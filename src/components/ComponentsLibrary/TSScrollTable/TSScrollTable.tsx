import React, { useMemo, useState } from 'react';
import DataTable, { IDataTableProps } from 'react-data-table-component';

type TSScrollTableProps = IDataTableProps;
const TSScrollTable = (props: TSScrollTableProps) => {
  const filteredProps = useMemo(() => {
    const cpProps = { ...props };
    return cpProps;
  }, [props]);
  return (
    <div>
      <DataTable {...filteredProps} />
    </div>
  );
};
export default TSScrollTable;
