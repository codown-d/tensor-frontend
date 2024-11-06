import React, { useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { TzTableServerPage } from '../../../../components/tz-table';
import { TzButton } from '../../../../components/tz-button';
import { translations } from '../../../../translations/translations';
import { TzConfirm } from '../../../../components/tz-modal';
import { keys, values } from 'lodash';
import { LearnStatus, SegmentedType } from '../useData';
import { modelOut, getHistory } from '../../../../services/DataService';
import { showSuccessMessage } from '../../../../helpers/response-handlers';
import { map } from 'rxjs/operators';
import getTableColumns from './useTableHook';
import { columnsObj } from './InModelBehavior';
import ModelServiceHook from './ModelServiceHook';
import { ImmuneDefenseContext } from '../context';
import { TzTooltip } from '../../../../components/tz-tooltip';

export default function TableInModelBehavior(props: {
  [x: string]: any;
  type: SegmentedType;
  search_str?: any;
  cname?: any;
  all_container?: any;
  learn_status?: any;
  _nk?: any;
}) {
  let { _nk, type, learn_status, changeType, ...otherProps } = props;
  const { refreshFn, setRefreshFn } = useContext(ImmuneDefenseContext);
  const listComp = useRef(undefined as any);
  let fetch = ModelServiceHook({ type });
  let newColumns = useMemo(() => {
    let columns = getTableColumns(columnsObj[props.type + '_false']);
    if (learn_status >= LearnStatus.learning) {
      columns.push({
        title: translations.operation,
        dataIndex: 'operation',
        width: '16%',
        render: (item: any, row: any) => {
          let { can_add_model } = row;
          return (
            <TzTooltip title={translations.exists_model} overlayStyle={can_add_model ? { display: 'none' } : undefined}>
              <TzButton
                type="text"
                disabled={!can_add_model}
                className="ml0"
                onClick={(event) => {
                  TzConfirm({
                    content: translations.joining_model,
                    onOk() {
                      return new Promise(function (resolve, reject) {
                        modelOut({ id: row.id, type: type.toLowerCase() }).subscribe((res) => {
                          props?.changeType(type);
                          if (res.error) {
                            reject();
                          } else {
                            resolve(res);
                            keys(refreshFn).map((item) => {
                              refreshFn[item]();
                            });
                            listComp.current?.refresh();
                            showSuccessMessage(translations.join_model_successful);
                          }
                        });
                      });
                    },
                  });
                }}
              >
                {translations.join_model}
              </TzButton>
            </TzTooltip>
          );
        },
      });
    }
    return columns;
  }, [type, learn_status, refreshFn]);
  const reqFun = useCallback(
    (pagination, fliter) => {
      if (!otherProps.resource_id) {
        return getHistory().pipe(
          map(() => {
            return {
              data: [],
              total: 0,
            };
          }),
        );
      }
      const { current = 1, pageSize = 10 } = pagination;

      const offset = (current - 1) * pageSize;
      let obj = keys(fliter).reduce((pre: any, item) => {
        pre[item] = fliter[item]?.join(',');
        return pre;
      }, {});
      let prams = {
        limit: pageSize,
        offset,
        is_in_model: false,
        ...otherProps,
        ...obj,
      };
      return fetch(prams).pipe(
        map((res: any) => {
          let items = res.getItems();
          return {
            data: items,
            total: res?.data?.totalItems,
          };
        }),
      );
    },
    [fetch, JSON.stringify(otherProps), learn_status],
  );
  useEffect(() => {
    setRefreshFn({
      OutModelBehavior: () => {
        listComp.current.refresh();
      },
    });
  }, []);
  return (
    <TzTableServerPage
      reqFun={reqFun}
      ref={listComp}
      rowKey={(record: any) => values(record).join('_')}
      columns={newColumns}
    />
  );
}
