import { TablePaginationConfig } from 'antd';
import React, { useCallback, useRef } from 'react';
import { getPolicyInfo, getRecord } from '../../services/DataService';
import { map } from 'rxjs/internal/operators/map';
import { translations } from '../../translations/translations';
import moment from 'moment';
import { TzButton } from '../../components/tz-button';
import { useNavigate } from 'react-router-dom';
import { Routes } from '../../Routes';
import { TzTag } from '../../components/tz-tag';
import { getStatusFile } from '../ComplianceWhole/CompliancwContainer';
import { TzCard } from '../../components/tz-card';
import { TzTableServerPage } from '../../components/tz-table';
// import { useAliveController } from 'react-activation';

const ScanRecord = ({ query }: any) => {
  const navigate = useNavigate();
  const listComp = useRef(undefined as any);
  // const { refreshScope } = useAliveController();
  const reqFun = useCallback((pagination: TablePaginationConfig) => {
    const { current = 1, pageSize = 10 } = pagination;
    const offset = (current - 1) * pageSize;
    const pageParams = {
      offset,
      limit: pageSize,
    };
    return getRecord(Object.assign({}, query, pageParams)).pipe(
      map((res: any) => {
        return {
          data: res.getItems(),
          total: res.data?.totalItems,
        };
      }),
    );
  }, []);
  let columns: any = [
    {
      title: translations.scanningTime,
      key: 'createdAt',
      dataIndex: 'createdAt',
      render: (text: any, _: any) => {
        return (
          <>
            {moment(Number(text) * 1000).format('YYYY-MM-DD')}
            <br />
            {moment(Number(text) * 1000).format('HH:mm:ss')}
          </>
        );
      },
    },
    {
      title: translations.scan_baseline,
      key: 'policyName',
      dataIndex: 'policyName',
      render: (text: any, _: any) => {
        return text ? (
          <TzButton
            type={'text'}
            onClick={(e) => {
              e.stopPropagation();
              getPolicyInfo({
                scapType: query.scapType,
                id: _.policyId,
              }).subscribe((res) => {
                if (!res['error']) {
                  let item = res.getItem();
                  navigate(`${Routes.ComplianceStrategicManagementInfo}?id=${item.id}&type=info`);
                }
              });
            }}
          >
            {text}
          </TzButton>
        ) : (
          '-'
        );
      },
    },
    {
      title: translations.originalWarning_cluster,
      key: 'clusterName',
      dataIndex: 'clusterName',
      render: (text: any, _: any) => {
        return text;
      },
    },
    {
      title: translations.tensorStart_status,
      key: 'state',
      align: 'center',
      dataIndex: 'state',
      width: '10%',
      className: 'td-center',
      render: (state: any, _: any) => {
        let status: any = {
          '0': {
            color: 'rgb(255, 196, 35)',
            background: 'rgba(255, 196, 35,0.1)',
            text: translations.running,
          },
          '1': {
            color: 'rgba(33, 119, 209, 1)',
            background: 'rgba(33, 119, 209, 0.1)',
            text: translations.compliances_historyColumns_finishedAt,
          },
          '2': {
            color: 'rgba(233, 84, 84, 1)',
            background: 'rgba(233, 84, 84, 0.1)',
            text: translations.compliances_historyColumns_numFailed,
          },
        };
        return (
          <TzTag
            style={{
              color: status[state].color,
              background: status[state].background,
            }}
          >
            {status[state].text}
          </TzTag>
        );
      },
    },
    {
      title: translations.reportScreen_operator,
      key: 'operator',
      dataIndex: ['operator', 'account'],
      render: (text: any, _: any) => {
        return text || '-';
      },
    },
    {
      title: translations.operation,
      key: 'operation',
      width: '60px',
      dataIndex: 'operation',
      className: 'td-center',
      render: (text: any, row: any) => {
        return row.state == 1 ? (
          <TzButton
            type={'text'}
            onClick={(event) => {
              event.stopPropagation();
              getStatusFile(row.checkType, row.checkId);
            }}
          >
            {translations.export}
          </TzButton>
        ) : null;
      },
    },
  ];
  return (
    <TzCard
      title={translations.scanRecord}
      className={'mt16 mb40'}
      bodyStyle={{ paddingTop: '0px' }}
    >
      <TzTableServerPage
        columns={columns}
        reqFun={reqFun}
        ref={listComp}
        onRow={(record) => {
          return {
            onClick: (event) => {
              let { policyId, checkId, checkType, clusterId, state } = record;
              if (state !== 1) return;
              // window.open(
              //   `/#${Routes.ComplianceHistoryInfo}?policyId=${policyId}&checkType=${checkType}&clusterKey=${clusterId}&taskID=${checkId}`,
              // );
              // refreshScope('ComplianceHistoryInfo');
              navigate(
                `${Routes.ComplianceHistoryInfo}?policyId=${policyId}&checkType=${checkType}&clusterKey=${clusterId}&taskID=${checkId}`,
              );
            },
          };
        }}
      />
    </TzCard>
  );
};

export default ScanRecord;
