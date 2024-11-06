import React, { useContext } from 'react';
import { get } from 'lodash';
import './index.scss';
import InputFilter from './InputFilter';
import PopoverFilter from './PopoverFilter';
import { FilterContext } from './useTzFilter';
import Clear from './Clear';
import { ReactComponent as FilterIcon } from '../../../assets/icons/filter.svg';
import classNames from 'classnames';

export type TFilterProps = {
  className?: string;
  inputStyle?: any;
};
const Filter = ({ className, inputStyle }: TFilterProps) => {
  const context = useContext(FilterContext);

  return (
    <div className={classNames('tz-filter', className)}>
      <InputFilter inputStyle={inputStyle} />
      {!get(context, 'state.filterFormItems')?.length ? (
        <PopoverFilter icon={<FilterIcon className="tz-icon tz-filter-icon" />} addTipPlacement="topRight" />
      ) : (
        <Clear />
      )}
    </div>
  );
};

export default Filter;
