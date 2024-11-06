import classNames from 'classnames';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { tap } from 'rxjs/operators';
import { WebResponse } from '../../definitions';
import { getLicenseInfo } from '../../services/DataService';
import { Store } from '../../services/StoreService';
import { translations } from '../../translations/translations';
import './LicenseToast.scss';
import { GlobalContext } from '../../helpers/GlobalContext';
import { loginOut } from '../../services/RouterService';
import { useMemoizedFn } from 'ahooks';
import { Alert } from 'antd';

const toastTxt: Record<string, string> = {
  willExpire: translations.license_licenseWillExpire,
  exceedLimit: translations.license_licenseExceedLimit,
};

const LicenseToast = () => {
  const { licenseState } = useContext(GlobalContext);
  const { deadlineState, nodeLimitState } = licenseState || {};
  const [showName, setShowName] = useState<any>(deadlineState || nodeLimitState);

  const fetchLicenseType = useMemoizedFn((onClose?: boolean) => {
    getLicenseInfo()
      .pipe(
        tap((res: WebResponse<any>) => {
          const item = res.getItem() || { status: {} };
          const { valid, deadlineState, nodeLimitState } = item.status;
          setShowName(deadlineState || nodeLimitState);
          if (!valid) {
            loginOut(true);
          }
          if (onClose) {
            setShowName(nodeLimitState);
          }
        }),
      )
      .subscribe();
  });

  useEffect(() => {
    !licenseState && fetchLicenseType();
  }, [JSON.stringify(licenseState)]);

  const contentTxt = useMemo(() => toastTxt[showName] || '', [showName]);

  useEffect(() => {
    Store.licenseToast.next(!!contentTxt);
  }, [contentTxt]);

  return !!contentTxt ? (
    <Alert
      className={classNames('license-toast-case', { 'no-clear': showName === 'exceedLimit' })}
      message={
        <>
          <i className="icon iconfont icon-tishi" />
          {contentTxt}
        </>
      }
      banner
      closable={showName === 'willExpire'}
      onClose={(e) => {
        fetchLicenseType(true);
      }}
      closeIcon={<i className={'icon iconfont icon-guanbi'} />}
    />
  ) : null;
};

export default LicenseToast;
