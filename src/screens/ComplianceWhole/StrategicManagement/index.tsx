import React, {
  forwardRef,
  PureComponent,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import './index.scss';
import { TzButton } from '../../../components/tz-button';
import { TzTableServerPage } from '../../../components/tz-table';
import { TablePaginationConfig } from 'antd/lib/table';
import { delPolicies, getPolicies } from '../../../services/DataService';
import { map, tap } from 'rxjs/operators';
import moment from 'moment';
import { TzInputSearch } from '../../../components/tz-input-search';
import { Routes } from '../../../Routes';
import { TzConfirm } from '../../../components/tz-modal';
import { WebResponse } from '../../../definitions';
import { Store } from '../../../services/StoreService';
import { TzMessageSuccess } from '../../../components/tz-mesage';
import { translations } from '../../../translations/translations';
// import { useActivate } from 'react-activation';
import { useMemoizedFn } from 'ahooks';
import useLayoutMainSearchWid from '../../../helpers/useLayoutMainSearchWid';

export const deleteStrategy = (info: any, callback?: (arg0: WebResponse<any>) => void) => {
  TzConfirm({
    content: translations.unStandard.str42(info.name),
    okText: translations.delete,
    okButtonProps: { danger: true },
    cancelText: translations.cancel,
    onOk() {
      delPolicies(info).subscribe((res) => {
        if (!res.error) {
          TzMessageSuccess(translations.baseline_deleted_successfully);
        }
        !callback || callback(res);
      });
    },
  });
};
const StrategicManagement = (props: any) => {
  const [name, setName] = useState<any>('');
  const listComp = useRef<any>(null);
  const navigate = useNavigate();
  const l = useLocation();
  const [result] = useSearchParams();
  let [query, setQuery] = useState({
    scapType: result.get('scapType') || 'kube',
  });
  const leakColumns = [
    {
      title: translations.baseline_name,
      dataIndex: 'name',
    },
    {
      title: translations.updated_by,
      key: 'operator',
      dataIndex: ['operator', 'account'],
    },
    {
      title: translations.notificationCenter_placeEvent_updateTime,
      dataIndex: 'updatedAt',
      width: '14%',
      render: (time: any) => moment(time).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      width: '80px',
      title: translations.operation,
      render: (text: any, row: any) => {
        return row.isDefault ? (
          '-'
        ) : (
          <>
            <TzButton
              type="text"
              danger
              onClick={(event) => {
                event.stopPropagation();
                deleteStrategy(Object.assign({}, row, { scapType: query.scapType }), () => {
                  listComp.current.refresh();
                });
              }}
            >
              {translations.delete}
            </TzButton>
          </>
        );
      },
    },
  ];
  const reqFunOrder = useCallback(
    (pagination: TablePaginationConfig) => {
      const { current = 1, pageSize = 10 } = pagination;
      const offset = (current - 1) * pageSize;
      const pageParams = {
        offset,
        limit: pageSize,
        name,
      };
      return getPolicies({ ...query, ...pageParams }).pipe(
        map(({ data }: any) => {
          let { items = [], totalItems = 0 } = data || {};
          return {
            data: items,
            total: totalItems,
          };
        }),
      );
    },
    [name],
  );
  const setHeader = useMemoizedFn(() => {
    Store.header.next({
      title: translations.baseline_management,
      onBack: () => {
        navigate(-1);
      },
    });
  });
  useEffect(setHeader, [l]);
  // useActivate(setHeader);
  const fitlerWid = useLayoutMainSearchWid({});
  return (
    <>
      <div className="ml32 mr32 mb20 pt4">
        <div className="flex-r-c mb12">
          <TzButton
            type={'primary'}
            onClick={() => {
              navigate(
                `${Routes.ComplianceStrategicManagementInfo}?type=${'add'}&scapType=${query.scapType}`,
              );
            }}
          >
            {translations.scanner_config_confirm}
          </TzButton>
          <TzInputSearch
            style={{ width: fitlerWid }}
            value={name}
            placeholder={translations.unStandard.str43}
            onSearch={(val) => {
              setName(val);
            }}
          />
        </div>
        <TzTableServerPage
          columns={leakColumns}
          rowKey={'id'}
          onRow={(record) => {
            return {
              onClick: (event) => {
                navigate(
                  `${Routes.ComplianceStrategicManagementInfo}?id=${record.id}&type=${'info'}&scapType=${query.scapType}`,
                );
              },
            };
          }}
          ref={listComp}
          reqFun={reqFunOrder}
        />
      </div>
    </>
  );
};
export default StrategicManagement;
