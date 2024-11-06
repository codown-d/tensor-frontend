import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { map, tap } from 'rxjs/operators';
import { TzButton } from '../../components/tz-button';
import { TzTableServerPage } from '../../components/tz-table';
import { formatGeneralTime, WebResponse } from '../../definitions';
import { getEnvKey, getLicenseInfo, postLicenseRegister } from '../../services/DataService';
import { translations } from '../../translations/translations';
import './LicenseScreen.scss';
import EnvKeyModal from '../Login/EnvKeyModal';
import { showFailedMessage } from '../../helpers/response-handlers';

interface IProps {
  children?: any;
  history?: any;
}

export interface DynamicObject {
  [key: string]: any;
}

const defPagination = {
  current: 1,
  pageSize: 10,
  hideOnSinglePage: true,
};

export const nodeLimitTxt = (n: number) => {
  if (Number.isNaN(Number(n))) {
    return '-';
  }
  return n === -1 ? translations.unlimited : n;
};

let licenseVal = '';

const LicenseList = () => {
  const tablelistRef = useRef(undefined as any);

  const [envkey, setEnvkey] = useState('');
  const [envKeyModalOpen, setEnvKeyModalOpen] = useState<boolean>();

  const fetchEnvKey = useCallback(() => {
    getEnvKey()
      .pipe(
        tap((res: WebResponse<any>) => {
          const _envKey = res.data?.envKey;
          setEnvkey(_envKey || '');
        }),
      )
      .subscribe();
  }, []);

  useEffect(() => {
    fetchEnvKey();
  }, []);

  const fetchLicenseSubmit = (license: string) => {
    const data = {
      licenseCode: license,
    };
    postLicenseRegister(data)
      .pipe(
        tap((res: WebResponse<any>) => {
          const resStatus = !!res.data;
          if (res.error && res.error.message) {
            showFailedMessage(res.error.message);
            return;
          }
          if (resStatus) {
            setEnvKeyModalOpen(false);
            tablelistRef && tablelistRef.current.refresh();
            return;
          }
        }),
      )
      .subscribe();
  };

  const reqFun = useCallback((pagination) => {
    const { current = 1, pageSize = 10 } = pagination;
    const offset = (current - 1) * pageSize;
    const pageParams = {
      offset,
      limit: pageSize,
    };
    return getLicenseInfo(pageParams).pipe(
      map((res) => {
        const item = res.getItem();
        const items = item ? [item] : [];
        return {
          data: items,
          total: items.length,
        };
      }),
    );
  }, []);

  const rowKey = useCallback((item: any) => {
    return item?.serialNo;
  }, []);

  const columns = useMemo(() => {
    return [
      {
        title: 'License',
        dataIndex: 'serialNo',
        key: 'serialNo',
      },
      {
        title: translations.license_module,
        dataIndex: 'module',
        ellipsis: true,
        key: 'module',
      },
      {
        title: translations.license_type,
        dataIndex: 'licenseType',
        key: 'licenseType',
      },
      {
        title: translations.license_useNode,
        dataIndex: 'usedNode',
        key: 'usedNode',
      },
      {
        title: translations.license_nodeNum,
        dataIndex: 'nodeLimit',
        key: 'nodeLimit',
        render: (n: any) => {
          return nodeLimitTxt(n);
        },
      },
      {
        title: translations.license_lastDay,
        dataIndex: 'remainDays',
        key: 'remainDays',
      },
      {
        title: translations.license_endTime,
        dataIndex: 'expireAt',
        key: 'expireAt',
        render: (_: any) => {
          if (Number.isNaN(Number(_))) {
            return '-';
          }
          return <>{formatGeneralTime(_ * 1000)}</>;
        },
      },
      {
        title: translations.license_status,
        dataIndex: 'status',
        key: 'status',
        render: (_: any, row: any) => {
          if (row.status.deadlineState === 'willExpire') {
            return <span className="tag-span warn">{translations.license_statusWillExpire}</span>;
          }
          if (row.status.deadlineState === 'expired') {
            return <span className="tag-span warn">{translations.license_statusExpired}</span>;
          }
          if (row.status.nodeLimitState === 'exceedLimit') {
            return <span className="tag-span warn">{translations.license_statusExceedLimit}</span>;
          }
          if (row.status.valid) {
            return <span className="tag-span safe">{translations.license_statusSafe}</span>;
          }
          return <></>;
        },
      },
      {
        title: translations.license_operate,
        key: 'operate',
        render: (item: any) => {
          return (
            <TzButton type="text" onClick={() => setEnvKeyModalOpen(true)}>
              {translations.update}
            </TzButton>
          );
        },
      },
    ] as any;
  }, []);
  return (
    <div className="license-list-case mlr32">
      <TzTableServerPage
        columns={columns}
        defaultPagination={defPagination}
        rowKey={rowKey}
        reqFun={reqFun}
        ref={tablelistRef}
        equalServerPageAnyway={false}
      />
      {envKeyModalOpen && (
        <EnvKeyModal
          open
          onOk={(val) => {
            fetchLicenseSubmit(val);
          }}
          onCancel={() => setEnvKeyModalOpen(false)}
          envKey={envkey}
        />
      )}
    </div>
  );
};

const LicenseScreen = (props: IProps) => {
  return (
    <>
      <LicenseList />
    </>
  );
};

export default LicenseScreen;
