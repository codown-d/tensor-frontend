import classNames from 'classnames';
import React from 'react';
import { Resources } from '../../Resources';
import { translations } from '../../translations/translations';
import './noAuth.scss';
const NoAuth = (props?: any) => {
  return (
    <div className="nodata-wrapper">
      <div className="nodata" {...props}>
        <img
          src={Resources['403']}
          alt="403"
          className={classNames({
            small: props?.small,
          })}
        />
        <span>{translations.datatable_403}</span>
      </div>
    </div>
  );
};

export default NoAuth;
