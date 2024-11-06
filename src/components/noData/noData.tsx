import classNames from 'classnames';
import React from 'react';
import { Resources } from '../../Resources';
import { translations } from '../../translations/translations';
import './noData.scss';
const NoData = (props?: any) => {
  let { small, ...otherProps } = props || {};
  return (
    <div {...otherProps} className={`nodata ${props?.className}`}>
      <img
        src={Resources.NoData}
        alt="NoData"
        className={classNames({
          small: props?.small,
        })}
      />
      <span>{translations.datatable_noData}</span>
    </div>
  );
};

export default NoData;
