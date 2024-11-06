import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { TzTableServerPage } from '../../../components/tz-table';
import { versionATTCKHistory } from '../../../services/DataService';
import { map } from 'rxjs/operators';
import { TablePaginationConfig } from 'antd/lib/table';
import moment from 'moment';
import { translations } from '../../../translations/translations';
import { TzInput } from '../../../components/tz-input';
import { Store } from '../../../services/StoreService';
import { TzInputSearch } from '../../../components/tz-input-search';
import { useLocation, useNavigate } from 'react-router-dom';
const UpgradeHistory = (props: any) => {
  const navigate = useNavigate();
  let [keyword, setKeyword] = useState<any>();
  const columns = [
    {
      title: translations.ruleBaseNumberVersion,
      dataIndex: 'version',
    },
    {
      title: translations.compliances_breakdown_operator,
      dataIndex: 'user',
    },
    {
      title: translations.upgradeTime,
      dataIndex: 'timestamp',
      render: (text: number, row: any, index: number) => {
        return {
          children: <span>{moment(text).format('YYYY-MM-DD HH:mm:ss')}</span>,
        };
      },
    },
  ];
  const reqFun = useCallback(
    (pagination: TablePaginationConfig) => {
      const { current = 1, pageSize = 10 } = pagination;
      const offset = (current - 1) * pageSize;
      const pageParams = {
        offset,
        limit: pageSize,
        version: keyword,
      };
      return versionATTCKHistory(pageParams).pipe(
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
      title: translations.rule_base_history,
      extra: (
        <>
          <TzInputSearch placeholder={translations.unStandard.str141} onChange={setKeyword} />
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
