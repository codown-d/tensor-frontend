import { TablePaginationConfig } from 'antd/lib/table';
import moment from 'moment';
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
import { useLocation, useNavigate } from 'react-router-dom';
import { map } from 'rxjs/operators';
import { TzButton } from '../../../../components/tz-button';
import TzInputSearch from '../../../../components/tz-input-search';
import { TzConfirm } from '../../../../components/tz-modal';
import { TzTableServerPage } from '../../../../components/tz-table';
import { WebResponse } from '../../../../definitions';
import { Routes } from '../../../../Routes';
import { deleteCiPolicy, ciPolicies } from '../../../../services/DataService';
import { Store } from '../../../../services/StoreService';
import { translations } from '../../../../translations/translations';
import './index.scss';
import useLayoutMainSearchWid from '../../../../helpers/useLayoutMainSearchWid';

export const deleteStrategy = (info: any, callback?: (arg0: WebResponse<any>) => void) => {
  TzConfirm({
    content: translations.unStandard.str57(info.name),
    okText: translations.delete,
    okButtonProps: { danger: true },
    cancelText: translations.cancel,
    onOk() {
      deleteCiPolicy(info).subscribe((res) => {
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
  const leakColumns = [
    {
      title: translations.policyName,
      dataIndex: 'name',
    },
    {
      title: translations.creator,
      key: 'operator',
      dataIndex: 'operator',
    },
    {
      title: translations.notificationCenter_placeEvent_updateTime,
      dataIndex: 'updated_at',
      width: '14%',
      render: (time: any) => moment(time).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: translations.updated_by,
      dataIndex: 'Updater',
    },
    {
      width: '140px',
      title: translations.operation,
      render: (text: any, row: any) => {
        return (
          <>
            <TzButton
              type="text"
              className="ml-8"
              onClick={(event) => {
                event.stopPropagation();
                navigate(`${Routes.StrategicManagementInfo}?id=${row.id}&type=${'edit'}`);
              }}
            >
              {translations.edit}
            </TzButton>
            <TzButton
              type="text"
              danger
              onClick={(event) => {
                event.stopPropagation();
                deleteStrategy(row, () => {
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
      return ciPolicies(pageParams).pipe(
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
  useEffect(() => {
    Store.header.next({
      title: translations.policy_management,
      onBack: () => {
        navigate(-1);
      },
    });
  }, [l]);
  const fitlerWid = useLayoutMainSearchWid({});
  return (
    <>
      <div className="ml32 mr32 mb20 pt4">
        <div className="flex-r-c mb12">
          <TzButton
            type={'primary'}
            onClick={() => {
              navigate(`${Routes.StrategicManagementInfo}?type=${'add'}`);
            }}
          >
            {translations.scanner_config_confirm}
          </TzButton>
          <TzInputSearch
            style={{ width: fitlerWid }}
            value={name}
            placeholder={translations.runtimePolicy_policy_name_place}
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
                navigate(`${Routes.StrategicManagementInfo}?id=${record.id}&type=${'info'}`);
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
