import { FilterDropdownProps } from 'antd/lib/table/interface';
import moment from 'moment';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { map, tap } from 'rxjs/operators';
import { TzButton } from '../../components/tz-button';
import TzInputSearch from '../../components/tz-input-search';
import { TzConfirm } from '../../components/tz-modal';
import { TzDatePickerCT } from '../../components/tz-range-picker';
import { TzTableServerPage } from '../../components/tz-table';
import { TzTabs } from '../../components/tz-tabs';
import { TzTag } from '../../components/tz-tag';
import { formatGeneralTime } from '../../definitions';
import { showSuccessMessage } from '../../helpers/response-handlers';
import { Routes } from '../../Routes';
import { delWhiteList, getConfigSyslog, getWhiteList, postConfigSyslog } from '../../services/DataService';
import { Store } from '../../services/StoreService';
import { translations } from '../../translations/translations';
import './Configure.scss';
import { tagObjs } from './WhiteListPolicyDetail';
import SysLog from './SysLog';

const WhiteListScreen = () => {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<any>({});
  const navigate = useNavigate();
  const tablelistRef = useRef<any>(undefined);
  const [treeVisible, setTreeVisible] = useState<boolean>(false);

  const delDetail = useCallback(
    (id) => {
      delWhiteList({ id: Number(id) })
        .pipe(
          tap((res: any) => {
            if (!res.error) {
              tablelistRef && tablelistRef.current.refresh();
              showSuccessMessage(translations.activeDefense_delSuccessTip);
            }
          }),
        )
        .subscribe();
    },
    [tablelistRef],
  );

  const cancelSelect = useCallback((props) => {
    const { clearFilters } = props;
    clearFilters && clearFilters();
    setFilters({});
  }, []);

  const treeRefresh = useCallback(
    (props) => {
      const { confirm, setSelectedKeys } = props;
      setSelectedKeys && setSelectedKeys([filters?.updatedAt]);
      confirm && confirm([filters?.updatedAt]);
      tablelistRef && tablelistRef.current.refresh();
      setTreeVisible(false);
    },
    [filters?.updatedAt, tablelistRef],
  );
  const rangePickerPropsCT: any = useMemo(() => {
    let { start, end } = filters['updatedAt'] || {};
    let startTimestamp = start ? moment(start) : '';
    let endTimestamp = end ? moment(end) : '';
    return {
      defaultRangeValue: [startTimestamp, endTimestamp],
    };
  }, [filters?.updatedAt]);

  const onChangeFilters = useCallback((data: any) => {
    setFilters((pre: any) => {
      let cObj = Object.assign({}, pre, data);
      Object.entries(data).map((t: any) => {
        let dKey = t[0];
        if (t[1]?.length === 0 || t[1] === '') {
          if (cObj[dKey] || cObj[dKey] === '') {
            delete cObj[dKey];
          }
        }
      });
      return cObj;
    });
  }, []);

  const filterTree = useCallback(
    (props: any) => {
      return (
        <div className="tree-case">
          <div style={{ padding: '8px' }}>
            <TzDatePickerCT
              onChangeRangePicker={(val) => {
                onChangeFilters({ updatedAt: { start: val[0], end: val[1] } });
              }}
              label={[translations.originalWarning_endTimer, translations.originalWarning_startTimer]}
              {...rangePickerPropsCT}
            />
          </div>

          <div className="confirm-case">
            <TzButton
              className="tree-cancel"
              type="link"
              size="small"
              disabled={!filters?.updatedAt}
              onClick={() => cancelSelect(props)}
            >
              {translations.superAdmin_reset}
            </TzButton>
            <TzButton type="primary" className="tree-confirm" size="small" onClick={() => treeRefresh(props)}>
              {translations.pagination_sure}
            </TzButton>
          </div>
        </div>
      );
    },
    [onChangeFilters, cancelSelect, treeRefresh, filters],
  );
  const reqFun = useCallback(
    (pagination, fliter, _sorter) => {
      const { current = 1, pageSize = 10 } = pagination;
      const offset = (current - 1) * pageSize;
      let pageParams = {
        offset,
        limit: pageSize,
        keyword: search,
        startAt: fliter?.createdAt?.[0]?.['start'] ? moment(fliter.createdAt[0]['start']).valueOf() : '',
        endAt: fliter?.createdAt?.[0]?.['end'] ? moment(fliter.createdAt[0]['end']).valueOf() : '',
        status: (fliter?.status || []).join(','),
      };
      return getWhiteList(pageParams).pipe(
        map((res: any) => {
          const items = res.getItems();
          return {
            data: items,
            total: res?.data?.totalItems,
          };
        }),
      );
    },
    [search],
  );

  const rowKey = useCallback((item: any) => {
    return item.name;
  }, []);

  const statusFilter = useMemo(() => {
    const statusType = [
      {
        value: 'enabled',
        text: translations.superAdmin_loginLdapConfig_enable,
      },
      { value: 'disabled', text: translations.deflectDefense_disabled },
    ];
    const typeList = statusType;
    return typeList.map((t, tk) => {
      return {
        ...t,
        title: t.text,
        key: '0-' + tk,
      };
    });
  }, []);

  const columns = useMemo(() => {
    return [
      {
        title: translations.policyName,
        dataIndex: 'name',
        width: '30%',
        render: (item: any) => item || '-',
      },
      {
        title: translations.policyNotes,
        dataIndex: 'remark',
        width: '30%',
        render: (item: any) => item || '-',
      },
      {
        title: translations.clusterManage_createtime,
        key: 'createdAt',
        dataIndex: 'createdAt',
        filterDropdownVisible: treeVisible,
        filterDropdown: (props: FilterDropdownProps) => filterTree(props),
        onFilterDropdownVisibleChange: (visible: boolean) => setTreeVisible(visible),
        render: (_: any) => {
          return <>{formatGeneralTime(_)}</>;
        },
      },
      {
        title: translations.compliances_node_status,
        key: 'status',
        dataIndex: 'status',
        filters: statusFilter,
        width: '9%',
        render: (_: any) => {
          return _ ? (
            <>
              <TzTag className={'ml-16 f14'} style={tagObjs[_].style}>
                {tagObjs[_].label}
              </TzTag>
            </>
          ) : (
            '-'
          );
        },
      },
      {
        title: translations.operation,
        key: 'operate',
        dataIndex: 'operate',
        width: '120px',
        render: (_: any, row: any) => {
          return (
            <>
              <TzButton
                type="text"
                className="ml-8"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(Routes.PalaceEventWhiteListDetail.replace('/:id', `/${row.id}?type=edit`));
                }}
              >
                {translations.edit}
              </TzButton>
              <TzButton
                type="text"
                danger
                onClick={(e) => {
                  e.stopPropagation();
                  TzConfirm({
                    content: translations.unStandard.str57(row?.name),
                    onOk: () => delDetail(row.id),
                    okButtonProps: {
                      type: 'primary',
                      danger: true,
                    },
                    okText: translations.delete,
                  });
                }}
              >
                {translations.delete}
              </TzButton>
            </>
          );
        },
      },
    ] as any;
  }, [delDetail, statusFilter, treeVisible, filterTree, filters?.updatedAt]);
  return (
    <>
      <div className="action-group df dfjb">
        <TzButton
          type="primary"
          onClick={(e) => {
            e.stopPropagation();
            navigate(Routes.PalaceEventWhiteListDetail.replace('/:id', `/${'new'}?type=add`));
          }}
        >
          {translations.scanner_config_confirm}
        </TzButton>
        <TzInputSearch
          style={{ width: '30%' }}
          placeholder={translations.runtimePolicy_policy_name_place}
          className="h36"
          onChange={(value: any) => setSearch(value)}
        />
      </div>
      <TzTableServerPage
        tableLayout={'fixed'}
        columns={columns}
        rowKey={rowKey}
        reqFun={reqFun}
        onRow={(record) => {
          return {
            onClick: () => {
              navigate(Routes.PalaceEventWhiteListDetail.replace('/:id', `/${record.id}?type=info`));
            },
          };
        }}
        ref={tablelistRef}
        equalServerPageAnyway={false}
      />
    </>
  );
};

const Configure = (props: any) => {
  const navigate = useNavigate();
  const l = useLocation();
  const [defaultActiveKey, setdDefaultActiveKey] = useState('whiteList');
  useEffect(() => {
    Store.header.next({
      title: translations.scanner_images_setting,
      onBack: () => {
        navigate(-1);
      },
    });
    Store.policyDetail.next({});
  }, [l]);
  let items = [
    {
      label: translations.white_list_policy,
      key: 'whiteList',
      children: <WhiteListScreen />,
    },
    {
      label: translations.configuration_management,
      key: 'exportManagement',
      children: <SysLog postApi={postConfigSyslog} getApi={getConfigSyslog} />,
    },
  ];
  return (
    <>
      <div className="event-configure">
        <TzTabs defaultActiveKey={defaultActiveKey} className="whiteListTabs" items={items} />
      </div>
    </>
  );
};

export default Configure;
