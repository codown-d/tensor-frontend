import './index.scss';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { TzInput } from '../../components/tz-input';
import { translations } from '../../translations/translations';
import { TzSelect } from '../../components/tz-select';
import { TzButton } from '../../components/tz-button';
import { TableScrollFooter, TzTable } from '../../components/tz-table';
import { map, tap } from 'rxjs/operators';
import {
  auditConfig,
  getAuditConfigSyslog,
  platformAudit,
  postAuditConfig,
  postAuditConfigSyslog,
} from '../../services/DataService';
import moment, { Moment } from 'moment';
import { DynamicObject, WebResponse } from '../../definitions';
import { TzSwitch } from '../../components/tz-switch';
import { DealData, renderTableDomTemplate } from '../AlertCenter/AlertRulersScreens';
import { TzDrawer } from '../../components/tz-drawer';
import { TzTabs } from '../../components/tz-tabs';
import { Store } from '../../services/StoreService';
import useTzFilter, { FilterContext } from '../../components/ComponentsLibrary/TzFilter/useTzFilter';
import { FilterFormParam } from '../../components/ComponentsLibrary/TzFilterForm/filterInterface';
import { TzFilter, TzFilterForm } from '../../components/ComponentsLibrary';
import EllipsisPopover from '../../components/ellipsisPopover/ellipsisPopover';
import { useLocation } from 'react-router-dom';
import { useDebounceFn, useMemoizedFn } from 'ahooks';
import { TzForm, TzFormItem } from '../../components/tz-form';
import Form from 'antd/lib/form';
let Children = () => {
  let [formItemSyslog, setFormItemSyslog] = useState<any>({
    enable: false,
    addr: '',
    network: '',
    tag: '',
    facility: '',
    severity: '',
  });
  let [isEdit, setIsEdit] = useState(false);
  let [activeKey, setActiveKey] = useState('1');
  const [logEnabled, setLogEnabled] = useState(false);
  useEffect(() => {
    getConfigSyslogFn();
    auditConfig().subscribe((res) => {
      if (res.error) return;
      let item = res.getItem();
      setLogEnabled(item.logEnabled);
    });
  }, []);
  let switchChange = useCallback((checked: boolean, event: React.MouseEvent<HTMLButtonElement>) => {
    postAuditConfig({ logEnabled: checked }).subscribe((res) => {
      if (res.error) {
        return;
      }
      let item = res.getItem();
      setLogEnabled(item.logEnabled);
    });
  }, []);
  let syslogData = useMemo(() => {
    let networkOp = [
      {
        label: 'udp',
        value: 'udp',
      },
      {
        label: 'tcp',
        value: 'tcp',
      },
    ];
    let facilityOp = [
      'kern',
      'user',
      'mail',
      'daemon',
      'auth',
      'syslog',
      'lpr',
      'news',
      'uucp',
      'cron',
      'authpriv',
      'ftp',
      'local0',
      'local1',
      'local2',
      'local3',
      'local4',
      'local5',
      'local6',
      'local7',
    ].map((item) => {
      return { label: item, value: item };
    });
    let severityOp = ['emerg', 'alert', 'crit', 'err', 'warning', 'notice', 'info', 'debug'].map((item) => {
      return { label: item, value: item };
    });
    let o: DynamicObject = {
      enable: (v: DealData) => {
        return (
          <TzFormItem name="enable" noStyle valuePropName="checked">
            <TzSwitch />
          </TzFormItem>
        );
      },
      network: (v: DealData) => {
        return (
          <TzFormItem name="network" noStyle>
            <TzSelect
              placeholder={translations.originalWarning_pleaseSelect + translations.networkProtocol}
              options={networkOp}
            />
          </TzFormItem>
        );
      },
      addr: (v: DealData) => {
        return (
          <TzFormItem name="addr" noStyle>
            <TzInput placeholder={translations.superAdmin_inputPlaceholder + translations.address} />
          </TzFormItem>
        );
      },
      tag: (v: DealData) => {
        return (
          <TzFormItem name="tag" noStyle>
            <TzInput placeholder={translations.superAdmin_inputPlaceholder + 'tag'} />
          </TzFormItem>
        );
      },
      facility: (v: DealData) => {
        return (
          <TzFormItem name="facility" noStyle>
            <TzSelect placeholder={translations.originalWarning_pleaseSelect + 'Facility'} options={facilityOp} />
          </TzFormItem>
        );
      },
      severity: (v: DealData) => {
        return (
          <TzFormItem name="severity" noStyle>
            <TzSelect placeholder={translations.originalWarning_pleaseSelect + 'Severity'} options={severityOp} />
          </TzFormItem>
        );
      },
    };

    let translationStr: DynamicObject = {
      enable: translations.functionSwitch,
      network: translations.networkProtocol,
      addr: translations.address,
      tag: translations.tag,
      facility: translations.facility,
      severity: translations.syslogSeverity,
    };
    let arr = Object.keys(translationStr).map((item) => {
      let obj: DealData = {
        title: translationStr[item] || item,
        content: formItemSyslog[item],
      };
      if (item === 'enable') {
        obj['content'] = (
          <span className={`${formItemSyslog[item] ? 'tagON' : 'tagOFF'}`}>
            {formItemSyslog[item] ? translations.confirm_modal_isopen : translations.confirm_modal_isclose}
          </span>
        );
      }
      if (isEdit) {
        obj['render'] = o[item];
      }
      return obj;
    });
    return arr;
  }, [isEdit, formItemSyslog]);
  let getConfigSyslogFn = useCallback(() => {
    getAuditConfigSyslog().subscribe((res) => {
      if (res.error) {
        return;
      }
      let item = res.getItem();
      setFormItemSyslog(item);
    });
  }, []);
  let postEventsCenterConfigData = useMemoizedFn(() => {
    formIns
      .validateFields()
      .then((sendData) => {
        postAuditConfigSyslog(sendData).subscribe((res) => {
          if (res.error) {
            return;
          }
          setIsEdit(false);
          getConfigSyslogFn();
        });
      })
      .catch(() => {});
  });
  useEffect(() => {
    Store.btnEdit.next(!isEdit);
  }, [isEdit]);
  const [formIns] = Form.useForm();
  return (
    <>
      <div className="p-r alarm-config" style={{ marginTop: '0px' }}>
        <TzTabs
          className={'tabs-nav-mb20 tab-ml0'}
          activeKey={activeKey}
          onChange={setActiveKey}
          tabBarExtraContent={
            activeKey === '1' ? null : (
              <>
                {isEdit ? (
                  <>
                    <TzButton key={'cancel'} size={'small'} onClick={() => setIsEdit(false)}>
                      {translations.cancel}
                    </TzButton>
                    <TzButton key={'save'} size={'small'} onClick={postEventsCenterConfigData} className="ml20">
                      {translations.save}
                    </TzButton>
                  </>
                ) : (
                  <TzButton
                    key={'edit'}
                    size={'small'}
                    onClick={() => {
                      formIns.setFieldsValue(formItemSyslog);
                      setIsEdit(true);
                    }}
                  >
                    {translations.edit}
                  </TzButton>
                )}
              </>
            )
          }
          items={[
            {
              label: translations.basicSettings,
              key: '1',
              children: (
                <div
                  className="item-details-case"
                  style={{
                    float: 'initial',
                    color: '#676E79',
                    fontWeight: 400,
                  }}
                >
                  {translations.openAudit}
                  <TzSwitch className={'ml26'} checked={logEnabled} onChange={switchChange} />
                </div>
              ),
            },
            {
              label: translations.exportConfiguration,
              key: '2',
              children: <TzForm form={formIns}>{renderTableDomTemplate(syslogData, 'details-content-large')}</TzForm>,
            },
          ]}
        />
      </div>
    </>
  );
};
let targetId = '#layoutMain';
const resourceKind = [
  'services',
  'endpoints',
  'pods',
  'secrets',
  'configmaps',
  'crontabs',
  'deployments',
  'jobs',
  'nodes',
  'rolebindings',
  'clusterroles',
  'daemonsets',
  'replicasets',
  'statefulsets',
  'horizontalpodautoscalers',
  'replicationcontrollers',
  'cronjobs',
].map((item) => {
  return { label: item, value: item };
});
const operations = ['get', 'list', 'watch', 'create', 'update', 'patch', 'delete', 'exec'].map((item) => {
  return { label: item, value: item };
});
const responseStatus = ['200', '401'].map((item) => {
  return { label: item, value: item };
});
const stage = ['RequestReceived', 'ResponseStarted', 'ResponseComplete', 'Panic'].map((item) => {
  return { label: item, value: item };
});
const PlatformAPI = () => {
  const [noMore, setNoMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [offsetID, setOffsetID] = useState('');
  const [tableData, setTableData] = useState<any[]>([]);
  const [sendData, setSendData] = useState<{
    SourceIPs: string;
    Namespace: string;
    ResourceName: string;
    ResourceKind: string | null;
    Verb: string | null;
    ResponseStatusCode: string | null;
    Stage: string | null;
    StageTimestamp: Moment[];
  }>({});
  const { run } = useDebounceFn(
    () => {
      onScrollHandle();
    },
    {
      wait: 500,
    },
  );
  let onScrollHandle = useMemoizedFn(() => {
    if (loading || noMore) {
      return;
    }
    let { scrollTop, clientHeight, scrollHeight } = $(targetId)[0];
    const isBottom = scrollTop + clientHeight + 100 > scrollHeight;
    if (isBottom) {
      reqFun();
    }
  });
  useEffect(() => {
    $(targetId).off('mousewheel DOMMouseScroll scroll').on('mousewheel DOMMouseScroll scroll', run);
    return () => {
      $(targetId).off('mousewheel DOMMouseScroll scroll');
    };
  }, []);

  const columns = [
    {
      title: 'IP',
      dataIndex: 'SourceIPs',
      render: (text: string[]) => {
        const str = text.join(',');
        return <EllipsisPopover lineClamp={2}>{str}</EllipsisPopover>;
      },
    },
    {
      title: translations.tensorSelect_operations,
      dataIndex: 'Verb',
      width: '10%',
    },
    {
      title: translations.responseStatus,
      dataIndex: 'ResponseStatusCode',
      width: '9%',
      render: (text: any) => {
        return text || '-';
      },
    },
    {
      title: translations.onlineVulnerability_columns_namespace,
      dataIndex: 'Namespace',
    },
    {
      title: translations.onlineVulnerability_columns_resourceKind,
      dataIndex: 'ResourceKind',
    },
    {
      title: translations.resources,
      dataIndex: 'ResourceName',
      width: '15%',
      render: (text: string) => {
        return text ? <EllipsisPopover lineClamp={2}>{text}</EllipsisPopover> : '-';
      },
    },
    {
      title: translations.Stage,
      dataIndex: 'Stage',
      width: '18%',
    },
    {
      title: translations.StageTimestamp,
      dataIndex: 'StageTimestamp',
      width: '14%',
      render: (text: number) => {
        return moment(text).format('YYYY-MM-DD HH:mm:ss');
      },
    },
  ];
  useEffect(() => {
    setTableData([]);
    setOffsetID('');
    setTimeout(() => {
      reqFun();
    }, 0);
  }, [JSON.stringify(sendData)]);
  const reqFun = useMemoizedFn(() => {
    setLoading(true);
    const { StageTimestamp, ...cloneSendData } = sendData || {};
    const pageParams = {
      offsetID,
      limit: 20,
      filter: JSON.stringify(cloneSendData || {}),
      endTimestamp: StageTimestamp?.[1] ? StageTimestamp[1].valueOf() : '',
      startTimestamp: StageTimestamp?.[0] ? StageTimestamp[0].valueOf() : '',
    };
    platformAudit(pageParams).subscribe((res) => {
      let items = res.getItems().map((item: any) => {
        item['RequestReceivedTimestamp'] = moment(item.RequestReceivedTimestamp).format('YYYY-MM-DD HH:mm:ss');
        return item;
      });
      setTableData((pre) => {
        pre.push(...items);
        return [...pre];
      });
      setOffsetID(items.slice(-1)[0]?.ID);
      setNoMore(items.length < pageParams.limit);
      setLoading(false);
    });
  });
  const [isEditBtn, setIsEditBtn] = useState(true);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const fetchStoreClusterID = Store.btnEdit
      .pipe(
        tap((val) => {
          setIsEditBtn(val);
        }),
      )
      .subscribe();
    return () => fetchStoreClusterID.unsubscribe();
  }, []);

  const l = useLocation();
  useEffect(() => {
    Store.header.next({
      title: translations.APIAudit,
      extra: (
        <TzButton
          onClick={() => setVisible(true)}
          icon={<i className={'icon iconfont icon-jingxiangsaomiao-peizhi'}></i>}
        >
          {translations.scanner_images_setting}
        </TzButton>
      ),
    });
  }, [l]);

  const platformAPIFilter: FilterFormParam[] = useMemo(
    () => [
      {
        label: translations.disposalIp,
        name: 'SourceIPs',
        type: 'input',
        icon: 'icon-ziyuan',
      },
      {
        label: translations.onlineVulnerability_columns_namespace,
        name: 'Namespace',
        type: 'input',
        icon: 'icon-mingmingkongjian',
      },
      {
        label: translations.resources,
        name: 'ResourceName',
        type: 'input',
        icon: 'icon-ziyuan',
      },
      {
        label: translations.onlineVulnerability_columns_resourceKind,
        name: 'ResourceKind',
        type: 'select',
        icon: 'icon-leixing',
        props: {
          options: resourceKind,
        },
      },
      {
        label: translations.tensorSelect_operations,
        name: 'Verb',
        type: 'select',
        icon: 'icon-caozuo',
        props: {
          options: operations,
        },
      },
      {
        label: translations.responseStatus,
        name: 'ResponseStatusCode',
        type: 'select',
        icon: 'icon-xiangyingzhuangtai',
        props: {
          options: responseStatus,
        },
      },
      {
        label: translations.Stage,
        name: 'Stage',
        type: 'select',
        icon: 'icon-jieduan',
        props: {
          options: stage,
        },
      },
      {
        label: translations.date,
        name: 'StageTimestamp',
        type: 'rangePicker',
        icon: 'icon-shijian',
        props: {
          showTime: true,
        },
      },
    ],
    [resourceKind, operations, responseStatus, stage],
  );

  const filterData = useTzFilter({ initial: platformAPIFilter });

  const handleChange = useCallback((values: any) => {
    setSendData(values);
  }, []);
  return (
    <>
      <div className="platform-api mlr32">
        <div className="platform-api-table">
          <div className="mt4 mb12">
            <FilterContext.Provider value={{ ...filterData }}>
              <TzFilter />
              <TzFilterForm onChange={handleChange} />
            </FilterContext.Provider>
          </div>
          <TzTable
            columns={columns}
            rowKey={'ID'}
            loading={loading}
            expandable={{
              expandedRowRender: (record) => {
                const filter: string[] = [];
                const translationStr: DynamicObject = {
                  Username: translations.platformAPIData_Username,
                  Level: translations.platformAPIData_Level,
                  RequestReceivedTimestamp: translations.platformAPIData_RequestReceivedTimestamp,
                  UserAgent: translations.platformAPIData_UserAgent,
                  RequestURI: translations.platformAPIData_RequestURI,
                  APIVersion: translations.platformAPIData_APIVersion,
                  AuthorizationDecision: translations.platformAPIData_AuthorizationDecision,
                  AuthorizationReason: translations.platformAPIData_AuthorizationReason,
                };
                const latestWarnInfo: { title: string; content: string }[] = [];
                Object.keys(translationStr).forEach((item: string) => {
                  filter.includes(item) ||
                    latestWarnInfo.push({
                      title: translationStr[item] || item,
                      content: record[item],
                    });
                });
                return renderTableDomTemplate(latestWarnInfo, 'content-item_titleW');
              },
            }}
            sticky={true}
            dataSource={tableData}
            pagination={false}
            footer={() => {
              return <TableScrollFooter isData={!!(tableData.length >= 20)} noMore={noMore} />;
            }}
          />
        </div>
      </div>
      <TzDrawer
        open={visible}
        onClose={() => {
          setVisible(false);
        }}
        className="drawer-body0"
        width="50%"
        closable={isEditBtn}
        title={translations.alarmConfig}
      >
        <Children key="1" />
      </TzDrawer>
    </>
  );
};

export default PlatformAPI;
