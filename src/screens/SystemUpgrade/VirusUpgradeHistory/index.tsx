import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { TzTableServerPage } from '../../../components/tz-table';
import { dbHistory, dbVersion } from '../../../services/DataService';
import { map } from 'rxjs/operators';
import { TablePaginationConfig } from 'antd/lib/table';
import moment from 'moment';
import { translations } from '../../../translations/translations';
import { Store } from '../../../services/StoreService';
import { TzInputSearch } from '../../../components/tz-input-search';
import { virusOptions } from '../SystemUpgrade';
import { useLocation, useNavigate } from 'react-router-dom';
const UpgradeHistory = (props: any) => {
  const navigate = useNavigate();
  let [keyword, setKeyword] = useState<any>();
  const columns = [
    {
      title: translations.ruleBaseNumberVirus,
      dataIndex: 'version',
    },
    {
      title: translations.virus_type,
      dataIndex: 'dbType',
      filters: virusOptions.slice(0, -1).map((item: any) => {
        return {
          text: item.label,
          value: item.value,
        };
      }),
    },
    {
      title: translations.compliances_breakdown_operator,
      dataIndex: 'updater',
    },
    {
      title: translations.upgradeTime,
      dataIndex: 'updateTime',
      render: (text: number, row: any, index: number) => {
        return {
          children: <span>{moment(text).format('YYYY-MM-DD HH:mm:ss')}</span>,
        };
      },
    },
  ];
  const reqFun = useCallback(
    (pagination: TablePaginationConfig, filters: any) => {
      const { current = 1, pageSize = 10 } = pagination;
      const offset = (current - 1) * pageSize;
      const pageParams = {
        offset,
        limit: pageSize,
        version: keyword,
        ...filters,
      };
      return dbHistory(pageParams).pipe(
        map(({ data }: any) => {
          return {
            data: data.items,
            total: data.totalItems,
          };
        }),
      );
    },
    [keyword],
  );

  const l = useLocation();
  useEffect(() => {
    Store.header.next({
      title: translations.unStandard.str215,
      extra: (
        <>
          <TzInputSearch placeholder={translations.unStandard.str214} onChange={setKeyword} />
        </>
      ),
      onBack: () => {
        navigate(-1);
      },
    });
  }, [l]);
  return (
    <div className={'upgrade-history mlr32'}>
      <TzTableServerPage
        className={'nohoverTable'}
        columns={columns}
        defaultPagination={{
          current: 1,
          pageSize: 10,
          hideOnSinglePage: false,
        }}
        rowKey="name"
        reqFun={reqFun}
      />
    </div>
  );
};
export default UpgradeHistory;
