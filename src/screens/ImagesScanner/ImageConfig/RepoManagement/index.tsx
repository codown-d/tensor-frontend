import Form from 'antd/lib/form';
import { TablePaginationConfig } from 'antd/lib/table';
import { cloneDeep, isEqual, keys, set } from 'lodash';
import moment from 'moment';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { map, tap } from 'rxjs/operators';
import { TzFilter, TzFilterForm } from '../../../../components/ComponentsLibrary';
import useTzFilter, {
  FilterContext,
} from '../../../../components/ComponentsLibrary/TzFilter/useTzFilter';
import { FilterFormParam } from '../../../../components/ComponentsLibrary/TzFilterForm/filterInterface';
import EllipsisPopover from '../../../../components/ellipsisPopover/ellipsisPopover';
import { TzButton } from '../../../../components/tz-button';
import { TzMessageSuccess } from '../../../../components/tz-mesage';
import { TzConfirm } from '../../../../components/tz-modal';
import { TzTableServerPage } from '../../../../components/tz-table';
import { RenderTag } from '../../../../components/tz-tag';
import { SelectItem, WebResponse } from '../../../../definitions';
import { onSubmitFailed, showSuccessMessage } from '../../../../helpers/response-handlers';
import { Routes } from '../../../../Routes';
import {
  startSync,
  getSyncStatus,
  removeRepo,
  getRepoList,
} from '../../../../services/DataService';
import { translations } from '../../../../translations/translations';
import { IRepoItem } from '../../definition';
import { useRepoTypes } from './use_fun';
import { getTime } from '../../../../helpers/until';
let timer: NodeJS.Timeout;
let regStatus = [
  {
    label: translations.superAdmin_normal,
    value: 'normal',
  },
  {
    label: translations.abnormal,
    value: 'abnormal',
  },
];
export const onRemoveRepo = (id: string, callback?: () => void) => {
  removeRepo(id).subscribe((res) => {
    if (res.error && res.error.message) {
      onSubmitFailed(res.error);
    } else {
      showSuccessMessage(translations.imageReject_delete_success_tip);
      callback && callback();
    }
  });
};
export const RepoManagement = (props: any) => {
  const [immediateRegisterId, setImmediateRegisterId] = useState<string[]>([]);
  const [filterValue, setFilterValue] = useState<{ [key: string]: string[] }>({
    reg_type: [],
  });
  const l = useLocation();
  let navigate = useNavigate();
  let repoTypes = useRepoTypes();
  const listRef = useRef<any>(null);
  const [filters, setFilters] = useState<any>({});

  const fetchRepoList = useCallback(
    (pagination?: TablePaginationConfig) => {
      const { current = 1, pageSize = 10 } = pagination || {};
      const offset = (current - 1) * pageSize;
      let { endTime, startTime } = filters?.updatedAt || {};
      const pageParams = {
        offset,
        limit: pageSize,
        ...filters,
        endTime: endTime ? moment(endTime).valueOf() : '',
        startTime: startTime ? moment(startTime).valueOf() : '',
      };
      delete pageParams.updatedAt;
      return getRepoList(pageParams).pipe(
        map((resp: WebResponse<any>) => {
          let items = resp.getItems();
          let f = items.some((item) => item.status === 'abnormal');
          if (f) {
            listRef.current &&
              setTimeout(() => {
                listRef.current?.refresh();
              }, 5000);
          }
          return {
            data: items,
            total: resp.data?.totalItems,
          };
        }),
      );
    },
    [filters],
  );

  const repoColumns = useMemo(() => {
    return [
      {
        title: translations.scanner_config_repoName,
        dataIndex: 'name',
        ellipsis: {
          showTitle: false,
        },
        render: (text: string) => {
          return <EllipsisPopover preHidden={true}>{text}</EllipsisPopover>;
        },
      },
      {
        title: translations.scanner_config_repoAddr,
        dataIndex: 'url',
        width: '20%',
        ellipsis: {
          showTitle: false,
        },
        render: (text: string) => {
          return <EllipsisPopover lineClamp={2}>{text}</EllipsisPopover>;
        },
      },
      {
        title: translations.scanner_config_repoType,
        dataIndex: 'regType',
        ellipsis: {
          showTitle: false,
        },
        render: (text: string) => {
          let node = repoTypes.find((item: { value: string }) => text === item.value);
          return <EllipsisPopover lineClamp={2}>{node ? node.label : '-'}</EllipsisPopover>;
        },
      },
      {
        title: translations.compliances_node_status,
        dataIndex: 'status',
        width: '10%',
        ellipsis: {
          showTitle: false,
        },
        align: 'center',
        render: (text: string) => {
          return <RenderTag type={'repo' + text} />;
        },
      },
      {
        title: translations.last_synchronization_time,
        dataIndex: 'LastSyncAt',
        render: (text: number) => getTime(text),
      },
      {
        title: translations.scanner_config_operation,
        dataIndex: 'action',
        width: '19%',
        render: (_: any, row: IRepoItem) => {
          let f = immediateRegisterId.includes(row.id);
          return (
            <>
              <TzButton
                loading={f}
                disabled={f}
                type={'text'}
                onClick={(e) => {
                  e.stopPropagation();
                  startSync({ registryID: row.id }).subscribe((res) => {
                    if (!res.error) {
                      setImmediateRegisterId((pre) => {
                        pre.push(row.id);
                        return [...pre];
                      });
                    }
                  });
                }}
              >
                {f ? translations.synchronizing : translations.sync_now}
              </TzButton>
              <TzButton
                type={'text'}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`${Routes.ImageConfigRepoManagementEdit}?id=${row.id}`);
                }}
              >
                {translations.edit}
              </TzButton>
              <TzButton
                type={'text'}
                danger
                onClick={(e) => {
                  e.stopPropagation();
                  TzConfirm({
                    content: translations.unStandard.str34(translations.library + row.name),
                    okText: translations.delete,
                    okButtonProps: {
                      type: 'primary',
                      danger: true,
                    },
                    onOk() {
                      onRemoveRepo(row.id, () => {
                        listRef.current.refresh();
                      });
                    },
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
  }, [repoTypes, filterValue, immediateRegisterId]);
  let oldData: { [x: string]: any } = [];
  let getSyncStatusFn = (time = 5000) => {
    timer = setTimeout(() => {
      getSyncStatus().subscribe((res) => {
        if (!res.error) {
          let items = res.getItems();
          setImmediateRegisterId((pre) => {
            return items.map((item) => {
              if (item.status) {
                return item.registryID;
              } else {
                return null;
              }
            });
          });
          let a = items.map((it) => it.registryID);
          let newData = items;
          oldData = oldData.filter((item: { registryID: any }) => {
            return a.includes(item.registryID);
          });
          oldData.map((item: { registryID: any; status: any }) => {
            let a = newData.find((it) => it.registryID === item.registryID);
            if (item.status && item.status !== a.status) {
              TzMessageSuccess(translations.synchronization_succeeded);
            }
          });
          oldData = newData;
          getSyncStatusFn();
        }
      });
    }, time);
  };
  useEffect(() => {
    getSyncStatusFn(0);
    return () => {
      clearTimeout(timer);
    };
  }, [l]);

  const configFilter: FilterFormParam[] = useMemo(() => {
    return [
      {
        label: translations.scanner_config_repoName,
        name: 'name',
        type: 'input',
        icon: 'icon-cangku',
      },
      {
        label: translations.scanner_config_repoAddr,
        name: 'url',
        type: 'input',
        icon: 'icon-weizhi',
      },

      {
        label: translations.scanner_config_repoType,
        name: 'regType',
        type: 'select',
        icon: 'icon-leixing',
        props: {
          mode: 'multiple',
          options: repoTypes,
        },
      },
      {
        label: translations.compliances_node_status,
        name: 'status',
        type: 'select',
        icon: 'icon-celveguanli',
        props: {
          mode: 'multiple',
          options: regStatus,
        },
      },

      {
        label: translations.last_sync_time,
        name: 'scan_time',
        type: 'rangePickerCt',
        icon: 'icon-shijian',
        props: {
          showTime: true,
          format: 'YYYY/MM/DD HH:mm:ss',
        },
      },
    ] as FilterFormParam[];
  }, [repoTypes]);
  const data = useTzFilter({
    initial: configFilter,
  });
  const handleChange = useCallback((values: any) => {
    const temp = {};
    keys(values).forEach((key) => {
      let _val = cloneDeep(values[key]);
      if (key === 'scan_time') {
        _val[0] && set(temp, 'updatedAt.startTime', _val[0]);
        _val[1] && set(temp, 'updatedAt.endTime', _val[1]);
        return;
      }
      set(temp, [key], _val);
    });
    setFilters(temp);
  }, []);
  return (
    <div className="image-setting">
      <div className="mb12">
        <FilterContext.Provider value={{ ...data }}>
          <div className={'flex-r-c'}>
            <TzButton
              type={'primary'}
              onClick={() => {
                navigate(`${Routes.ImageConfigRepoManagementEdit}`);
              }}
            >
              {translations.scanner_config_confirm}
            </TzButton>
            <TzFilter />
          </div>
          <TzFilterForm onChange={handleChange} />
        </FilterContext.Provider>
      </div>
      <TzTableServerPage
        tableLayout={'fixed'}
        columns={repoColumns as any}
        rowKey="id"
        reqFun={fetchRepoList}
        ref={listRef}
        onRow={(record) => {
          return {
            onClick: () => {
              navigate(`${Routes.ImageConfigRepoManagementInfo}?id=${record.id}`);
            },
          };
        }}
      />
    </div>
  );
};
