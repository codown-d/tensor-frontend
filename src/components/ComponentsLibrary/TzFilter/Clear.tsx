import React, { useContext } from 'react';
import { ReactComponent as ClearIcon } from '../../../assets/icons/clear.svg';
import { translations } from '../../../translations/translations';
import { TzTooltip } from '../../tz-tooltip';
import { FilterContext } from './useTzFilter';
const Clear = () => {
  const context = useContext(FilterContext);
  const { clearFormItems } = context;
  return (
    <TzTooltip title={translations.clearCondition} placement="topRight">
      <div className="tz-filter-clear" onClick={clearFormItems}>
        <ClearIcon className="tz-icon tz-filter-icon" />
      </div>
    </TzTooltip>
  );
};
export default Clear;
