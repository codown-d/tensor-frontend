import { cloneDeep, isBoolean, keys, set } from 'lodash';
import moment from 'moment';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { finalize, tap } from 'rxjs/operators';
import { TzFilter, TzFilterForm } from '../../components/ComponentsLibrary';
import useTzFilter, { FilterContext } from '../../components/ComponentsLibrary/TzFilter/useTzFilter';
import { FilterFormParam } from '../../components/ComponentsLibrary/TzFilterForm/filterInterface';
import { TzButton } from '../../components/tz-button';
import { TzContent } from '../../components/tz-content';
import { TzLayout } from '../../components/tz-layout';
import { TableScrollFooter, TzTable } from '../../components/tz-table';
import { formatGeneralTime, SelectItem, WebResponse } from '../../definitions';
import { addFiletToDown, screens } from '../../helpers/until';
import { getUserInformation } from '../../services/AccountService';
import { exportAuditTask, getListClusters, getNaviAudit } from '../../services/DataService';
import { getCurrentLanguage } from '../../services/LanguageService';
import { useThrottle } from '../../services/ThrottleUtil';
import { translations } from '../../translations/translations';
import './AuditLogScreen.scss';
import { TzTag } from '../../components/tz-tag';
import { Store } from '../../services/StoreService';
import { Routes } from '../../Routes';
import { useLocation, useNavigate } from 'react-router-dom';
import EllipsisPopover from '../../components/ellipsisPopover/ellipsisPopover';

const syslogStatusEnum = [
  { value: 'true', label: translations.success },
  { value: 'false', label: translations.failed },
];
export interface DynamicObject {
  [key: string]: any;
}
let lang = getCurrentLanguage();
const mockOptions = [
  {
    value: lang === 'zh' ? '新增' : 'Create',
    label: translations.newAdd,
  },
  {
    value: lang === 'zh' ? '编辑' : 'Edit',
    label: translations.edit,
  },
  {
    value: lang === 'zh' ? '删除' : 'Delete',
    label: translations.delete,
  },
  {
    value: lang === 'zh' ? '启用/停用' : 'Enable/Disable',
    label: translations.enable_Disable,
  },
  {
    value: lang === 'zh' ? '导出' : 'Import',
    label: translations.export,
  },
  {
    value: lang === 'zh' ? '上传' : 'Upload',
    label: translations.upload,
  },
  {
    value: lang === 'zh' ? '发起处置' : 'Process',
    label: translations.addDisposal,
  },
  {
    value: lang === 'zh' ? '学习' : 'study',
    label: translations.study,
  },

  {
    value: lang === 'zh' ? '停止学习' : 'Stop learning',
    label: translations.runtimePolicy_details_stopTraining,
  },
];

let mark = false;

const AuditLog = () => {
  const selectorRef = useRef<any>();
  const [filterData, setFilterData] = useState<{ [t: string]: any } | undefined>();
  const [res, setRes] = useState<any[]>([]);
  const [clusterIDs, setClusterIDs] = useState<any[]>([]);
  const [state, setState] = useState({ noMore: false, loading: false });
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const fatchNaviAudit = useCallback((data: any) => {
    getNaviAudit({
      limit: 20,
      sortOrder: 'desc',
      ...data,
    })
      .pipe(
        tap((response: WebResponse<any>) => {
          const items = response.getItems() || [];
          setState((pre) =>
            Object.assign({}, pre, {
              loading: false,
              noMore: items.length < 10,
            }),
          );
          if (data?.offsetID) {
            setRes((pre) => {
              return [...pre, ...items];
            });
          } else {
            setRes(items);
          }
        }),
        finalize(() => {
          mark = false;
        }),
      )
      .subscribe();
  }, []);

  useEffect(() => {
    fatchNaviAudit({ limit: 20 });
  }, [fatchNaviAudit]);

  const onScrollHandle = useCallback(
    useThrottle(() => {
      if (!selectorRef.current || state.loading || mark) {
        return;
      }
      if (state.noMore) {
        return;
      }
      const scrollTop = selectorRef.current.scrollTop;
      const clientHeight = selectorRef.current.clientHeight;
      const scrollHeight = selectorRef.current.scrollHeight;
      const isBottom = scrollTop + clientHeight + 60 >= scrollHeight;
      if (isBottom) {
        mark = true;
        setState((pre) => Object.assign({}, pre, { loading: true }));
        if (res.slice(-1).length === 0) {
          return;
        }
        const { ID } = res.slice(-1)[0];
        const data = Object.assign({ offsetID: ID }, filterData);

        fatchNaviAudit(data);
      }
    }, 100),
    [res, state, selectorRef, filterData, fatchNaviAudit],
  );

  useEffect(() => {
    selectorRef.current = $('#layoutMain')[0];
    $(selectorRef.current).on('mousewheel DOMMouseScroll scroll', onScrollHandle);
    return () => {
      $(selectorRef.current).off('mousewheel DOMMouseScroll scroll');
    };
  }, [onScrollHandle]);

  const l = useLocation();
  let setHeader = useCallback(() => {
    Store.header.next({
      extra: (
        <TzButton
          icon={<i className="icon iconfont icon-jingxiangsaomiao-peizhi f16"></i>}
          onClick={() => {
            navigate(Routes.AuditLogConfig);
          }}
        >
          {translations.scanner_images_setting}
        </TzButton>
      ),
    });
  }, [l]);

  useEffect(() => {
    setHeader();
    getListClusters({ offset: 0, limit: 100 })
      .pipe(
        tap((res: WebResponse<any>) => {
          const items = res.getItems();
          setClusterIDs(items);
        }),
      )
      .subscribe();
  }, []);

  const replaceName = useCallback(
    (str: string) => {
      if (!str) {
        return str;
      }
      let isExist = false;
      let strCopy = str;
      clusterIDs.map((t) => {
        if (strCopy.includes(t.key)) {
          isExist = true;
          strCopy = strCopy.replace(t.key, `${t.name}(${t.key})`);
        }
        return t;
      });
      return strCopy;
    },
    [clusterIDs],
  );

  const columns = useMemo(() => {
    return [
      {
        title: translations.scanner_report_occurTime,
        dataIndex: 'Time',
        key: 'Time',
        width: '200px',
        render: (item: any) => {
          return formatGeneralTime(item);
        },
      },
      {
        title: translations.license_userName,
        dataIndex: 'UserName',
        key: 'UserName',
        width: '25%',
        render: (txt: string) => <EllipsisPopover>{txt}</EllipsisPopover>,
      },
      {
        title: 'IP',
        dataIndex: 'Ip',
        key: 'Ip',
        width: '13%',
      },
      {
        title: translations.license_status,
        dataIndex: 'Status',
        key: 'Status',
        width: '15%',
        align: 'center',
        render: (text: string) => {
          if (!text) {
            return '-';
          }
          return (
            <TzTag className={text === 'true' ? 'btn-suc' : 'btn-high'}>
              {translations[text === 'true' ? 'success' : 'failed']}
            </TzTag>
          );
        },
      },
      {
        title: translations.operation,
        dataIndex: 'Operation',
        key: 'Operation',
        width: '10%',
        render: (item: any) => {
          return <>{item}</>;
        },
      },
      {
        title: translations.specific_behavior,
        dataIndex: 'Detail',
        key: 'Detail',
        render: (txt: string) => <EllipsisPopover lineClamp={2}>{replaceName(txt)}</EllipsisPopover>,
      },
    ] as any;
  }, [replaceName]);

  const exportLogs = useCallback((event: any) => {
    addFiletToDown(event);
    setLoading(true);
    const { username = '' } = getUserInformation();
    exportAuditTask({ taskCreateAt: String(Date.now()), creator: username })
      .pipe(
        tap((res: WebResponse<any>) => {
          const item = res.getItem();
          if (item) {
            setLoading(false);
          }
        }),
        finalize(() => {
          setLoading(false);
        }),
      )
      .subscribe();
  }, []);

  const auditLogFilter: FilterFormParam[] = useMemo(
    () => [
      {
        label: translations.license_userName,
        name: 'User.Name',
        type: 'input',
        icon: 'icon-yonghuming',
      },
      {
        label: 'IP',
        name: 'HttpRequest.RemoteIP',
        type: 'input',
        icon: 'icon-ziyuan',
      },

      {
        label: translations.specific_behavior,
        name: 'Detail',
        type: 'input',
        icon: 'icon-ziyuan',
      },
      {
        label: translations.license_status,
        name: 'Status',
        type: 'select',
        icon: 'icon-celveguanli',
        props: {
          options: syslogStatusEnum,
        },
      },
      {
        label: translations.operation,
        name: 'Verb',
        type: 'select',
        icon: 'icon-caozuo',
        props: {
          options: mockOptions,
        },
      },
      {
        label: translations.scanner_report_occurTime,
        name: 'defaultRangeValue',
        type: 'rangePickerCt',
        icon: 'icon-shijian',
        props: {
          showTime: true,
        },
      },
    ],
    [mockOptions],
  );

  const FilterData = useTzFilter({ initial: auditLogFilter });

  const handleChange = useCallback((values: any) => {
    const temp = { filter: null };
    keys(values).forEach((key) => {
      let _val = cloneDeep(values[key]);
      if (key === 'defaultRangeValue') {
        _val[0] && set(temp, 'startTimestamp', moment(_val[0]).valueOf());
        _val[1] && set(temp, 'endTimestamp', moment(_val[1]).valueOf());
        return;
      }
      set(temp, ['filter', key], _val);
    });

    setRes([]);
    const data = Object.assign({ limit: 20 }, { ...temp, filter: temp?.filter ? JSON.stringify(temp.filter) : null });
    fatchNaviAudit(data);
    setFilterData(data);
  }, []);
  return (
    <div className="log-list-case mlr32">
      <TzFilterForm className="mb12" onChange={handleChange} />
      <div className="mt4 mb12">
        <FilterContext.Provider value={{ ...FilterData }}>
          <div className="log-list-case-filter">
            <TzButton onClick={exportLogs} loading={loading}>
              {translations.export}
            </TzButton>
            <TzFilter />
          </div>
          <TzFilterForm onChange={handleChange} />
        </FilterContext.Provider>
      </div>
      <TzTable
        dataSource={res}
        tableLayout={'fixed'}
        loading={state.loading}
        pagination={false}
        sticky={true}
        rowKey={'ID'}
        columns={columns}
        footer={() => {
          return <TableScrollFooter isData={!!(res.length >= 10)} noMore={state.noMore} />;
        }}
      />
    </div>
  );
};

const AuditLogScreen = () => {
  return (
    <>
      <TzLayout>
        <TzContent className="bg-white audit-log-case">
          <AuditLog />
        </TzContent>
      </TzLayout>
    </>
  );
};

export default AuditLogScreen;
