import React, { useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { BasicCardProps } from '../../type';
import { TzCard } from '../../../../components/tz-card';
import { TzTableServerPage } from '../../../../components/tz-table';
import { translations } from '../../../../translations/translations';
import { ModelLogReq, formatGeneralTime } from '../../../../definitions';
import EllipsisPopover from '../../../../components/ellipsisPopover/ellipsisPopover';
import { TablePaginationConfig } from 'antd';
import { fetchModelLog, getHistory } from '../../../../services/DataService';
import { map } from 'rxjs/operators';
import { ImmuneDefenseContext } from '../context';
import { getTime } from '../../../../helpers/until';

function Record(props: BasicCardProps) {
  const { baseInfo, setRefreshFn } = useContext(ImmuneDefenseContext) ?? {};
  const listComp = useRef(undefined as any);
  const columns = useMemo(
    () => [
      {
        title: translations.scanner_report_occurTime,
        dataIndex: 'created_at',
        render: (created_at: any, row: any) => {
          return created_at ? getTime(created_at) : '-';
        },
      },
      {
        title: translations.superAdmin_userName,
        dataIndex: 'user',
        width: '30%',
        render: (user: string) => {
          return <EllipsisPopover>{user === 'system' ? '-' : user}</EllipsisPopover>;
        },
      },
      {
        title: translations.specific_behavior,
        dataIndex: 'action',
        width: '30%',
        render: (action: string, row: any) => {
          let obj: any = {
            ADD: translations.add_model + row.id,
            DELETE: translations.del_model + row.id,
            UPDATE: translations.edit_model + row.id,
            START: translations.learn_model,
            STOP: translations.stop_model,
            TRUE: translations.enable_model,
            FALSE: translations.disable_m,
          };
          return <EllipsisPopover>{obj[action]}</EllipsisPopover>;
        },
      },
    ],
    [],
  );
  const reqFun = useCallback(
    (pagination?: TablePaginationConfig) => {
      if (!baseInfo?.resource_id) {
        return getHistory().pipe(
          map(() => {
            return {
              data: [],
              total: [].length,
            };
          }),
        );
      }
      const { current = 1, pageSize = 10 } = pagination || {};
      const offset = (current - 1) * pageSize;
      const pageParams: ModelLogReq = {
        offset,
        limit: pageSize,
        resource_id: +baseInfo?.resource_id,
      };
      return fetchModelLog(pageParams).pipe(
        map((res: any) => {
          let items = res.getItems();
          return {
            data: items,
            total: res.data?.totalItems,
          };
        }),
      );
    },
    [baseInfo],
  );
  useEffect(() => {
    setRefreshFn({
      record: () => {
        listComp.current.refresh();
      },
    });
  }, []);
  return (
    <TzCard {...props}>
      <TzTableServerPage
        columns={columns}
        rowKey="created_at"
        reqFun={reqFun}
        ref={listComp}
        equalServerPageAnyway={false}
      />
    </TzCard>
  );
}

export default Record;
