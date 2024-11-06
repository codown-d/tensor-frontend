import React, { useMemo, forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { TzTabsNormal } from '../../components/tz-tabs';
import { translations, localLang } from '../../translations/translations';
import { TzTooltip } from '../../components/tz-tooltip';
import { onSubmitFailed, showSuccessMessage } from '../../helpers/response-handlers';
import { Subscription, throwError } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';
import { SupportedLangauges, WebResponse } from '../../definitions';
import {
  createBaitService,
  deleteBaitService,
  getBaitImageList,
  getBaitImages,
  getBaitList,
  updateBaitService,
} from './service';
import { TzInput } from '../../components/tz-input';
import { TzButton } from '../../components/tz-button';
import './ActiveDefense.scss';
import { TzForm, TzFormItem, MyFormItem } from '../../components/tz-form';
import { TzDrawer } from '../../components/tz-drawer';
import { find, isEmpty, isEqual, merge, omit } from 'lodash';
import { TzSelect } from '../../components/tz-select';
import { getAssetsClustersList, clusterAssetsNamespaces, getHistory } from '../../services/DataService';
import { TzTable, TzTableServerPage } from '../../components/tz-table';
import moment from 'moment';
import { TzTableTzTdWarn } from '../AlertCenter/AlertCenterScreen';
import { getClusterName, useAssetsClusterList, useAssetsClusters, useClusterList } from '../../helpers/use_fun';
import PalaceEvent from '../AlertCenter/PalaceEvent';
import { TzConfirm } from '../../components/tz-modal';
import { TablePaginationConfig } from 'antd/lib/table';
import Form from 'antd/lib/form';
import { FilterFormParam } from '../../components/ComponentsLibrary/TzFilterForm/filterInterface';
import useTzFilter, { FilterContext } from '../../components/ComponentsLibrary/TzFilter/useTzFilter';
import { TzFilter, TzFilterForm } from '../../components/ComponentsLibrary';
import { Store } from '../../services/StoreService';
import EllipsisPopover from '../../components/ellipsisPopover/ellipsisPopover';
import { useMemoizedFn, useUnmount } from 'ahooks';
import { RenderTag } from '../../components/tz-tag';
import { Tittle } from '../../components/ComponentsLibrary/Tittle';
import { filtersRepairable } from '../ImagesScanner/components/Image-scanner-detail/ImagesScannerDetail';
import useNewSearchParams from '../../helpers/useNewSearchParams';
import ArtTemplateDataInfo from '../../components/ComponentsLibrary/ArtTemplateDataInfo';
import { tabChange } from '../../helpers/until';

const baits = [
  {
    label: SupportedLangauges.Chinese ? 'Redis 未授权访问漏洞' : 'Redis Unauthorized access leak',
    value: '1',
  },
  {
    label: SupportedLangauges.Chinese ? 'ES Groovy 远程代码执行漏洞' : 'ES Groovy Remote code exec leak',
    value: '2',
  },
  {
    label: SupportedLangauges.Chinese ? 'Tomcat AJP 文件包含漏洞' : 'Tomcat AJP File contains leak',
    value: '3',
  },
  {
    label: SupportedLangauges.Chinese ? 'Jenkins 远程命令执行漏洞' : 'Jenkins Remote command exec leak',
    value: '4',
  },
  {
    label: SupportedLangauges.Chinese ? 'Jupyter Notebook 未授权访问漏洞' : 'Jupyter Notebook Unauthorized access leak',
    value: '5',
  },
  {
    label: SupportedLangauges.Chinese ? 'VSFTPD弱口令漏洞' : 'VSFTPD weak password leak',
    value: '6',
  },
  {
    label: SupportedLangauges.Chinese ? 'SSH弱口令漏洞' : 'SSH weak password leak',
    value: '7',
  },
  {
    label: SupportedLangauges.Chinese ? 'MySQL弱口令漏洞' : 'MySQL weak password leak',
    value: '8',
  },
];

const outboundOnMap = {
  [SupportedLangauges.Chinese]: [
    {
      label: '只进不出',
      value: 'true',
    },
    {
      label: '可进可出',
      value: 'false',
    },
  ],
  [SupportedLangauges.English]: [
    {
      label: 'Inbound Only',
      value: 'true',
    },
    {
      label: 'Inbound and Outbound',
      value: 'false',
    },
  ],
};

const serviceStatus = [
  {
    label: translations.scanner_overview_typeOnline,
    value: 'online',
  },
  {
    label: translations.scanner_overview_typeNotline,
    value: 'offline',
  },
];

const BaitRepo = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>([]);
  const sub = useRef<null | Subscription>(null);
  const fetchBaitImageList = useCallback(() => {
    sub?.current && sub.current.unsubscribe();
    setLoading(true);
    sub.current = getBaitImageList()
      .pipe(
        tap((resp: any) => {
          setData(resp.getItems());
        }),
        catchError((error) => {
          return throwError(error);
        }),
        finalize(() => setLoading(false)),
      )
      .subscribe();
  }, []);

  useEffect(() => {
    fetchBaitImageList();
  }, [fetchBaitImageList]);

  const columns: any = useMemo(() => {
    return [
      {
        title: '',
        key: 'index',
        render: (text: any, _: any, index: number) => {
          return index + 1;
        },
        width: 59,
      },
      {
        title: translations.activeDefense_baitName,
        key: 'baitName',
        dataIndex: 'baitName',
        ellipsis: {
          showTitle: false,
        },
        width: 300,
      },
      {
        title: translations.activeDefense_existLeakType,
        key: 'vulnerability',
        dataIndex: 'vulnerability',
        ellipsis: {
          showTitle: false,
        },
        width: 200,
      },
      {
        title: translations.activeDefense_existLeakDesc,
        key: 'description',
        dataIndex: 'description',
        ellipsis: {
          showTitle: false,
        },
        render(item: any) {
          return (
            <TzTooltip title={item} className={'ofh db'} placement="topLeft">
              {item}
            </TzTooltip>
          );
        },
      },
    ];
  }, []);

  return (
    <div className="bait-repo">
      <TzTable
        dataSource={data}
        columns={columns}
        pagination={{ defaultPageSize: 10, showQuickJumper: true }}
        loading={loading}
      />
    </div>
  );
};

const BaitServiceSearch = (props: { showBait?: any; setParams: any }) => {
  const { showBait, setParams } = props;
  const imagesScannerScreenFilter: FilterFormParam[] = useMemo(
    () => [
      {
        label: translations.activeDefense_serviceName,
        name: 'name',
        type: 'input',
        icon: 'icon-ziyuan',
      },
      {
        label: translations.activeDefense_serviceLoc,
        name: 'resource_name',
        type: 'input',
        icon: 'icon-weizhi',
      },
      {
        label: translations.activeDefense_ns,
        name: 'namespace',
        type: 'input',
        icon: 'icon-mingmingkongjian',
      },
      {
        label: translations.activeDefense_containBait,
        name: 'bait_id',
        type: 'select',
        icon: 'icon-pod',
        props: {
          mode: 'multiple',
          options: baits,
        },
      },
      {
        label: translations.activeDefense_existRelatedAlert,
        name: 'have_alerts',
        type: 'select',
        icon: 'icon-gaojing',
        props: {
          options: filtersRepairable,
        },
      },
      {
        label: translations.activeDefense_serviceStatus,
        name: 'status',
        type: 'select',
        icon: 'icon-yunhangzhuangtai',
        props: {
          options: serviceStatus,
        },
      },
    ],
    [localLang, baits],
  );

  const data = useTzFilter({ initial: imagesScannerScreenFilter });

  const handleChange = useCallback((values: any) => {
    setParams(values);
  }, []);
  return (
    <div className={''}>
      <div className="mb12">
        <FilterContext.Provider value={{ ...data }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <TzButton onClick={showBait} type={'primary'}>
              {translations.activeDefense_add}
            </TzButton>
            <TzFilter />
          </div>
          <TzFilterForm onChange={handleChange} />
        </FilterContext.Provider>
      </div>
    </div>
  );
};
const SeverityTag = (data: any) => {
  if (!data.events?.length) {
    return <>-</>;
  }
  let result = data.events
    .map((item: any) => item.severity)
    .reduce((accu: any, name: string) => {
      if (name in accu) {
        accu[name]++;
      } else {
        accu[name] = 1;
      }
      return accu;
    }, {});
  let getSeverity = (result: any) => {
    let obj: any = {};
    Object.keys(result).map((item: any) => {
      if (item <= 3) {
        obj['3'] = obj['3'] ? obj['3'] + result[item] : result[item];
      } else if (item <= 5) {
        obj['5'] += obj['5'] ? obj['5'] + result[item] : result[item];
      } else if (item <= 7) {
        obj['7'] += obj['7'] ? obj['7'] + result[item] : result[item];
      }
    });
    return obj;
  };
  let resSeverity = getSeverity(result);
  return (
    <span className={'active-defense-severity'}>
      <TzTableTzTdWarn signalsCount={resSeverity} />
    </span>
  );
};
const BaitService = (props: any) => {
  let [cluster, setCluster] = useState(undefined);
  const clusters = useClusterList();
  const cacheDrawerData = useRef<any>();
  const [params, setParams] = useState<any>({});
  const [dataSource, setDataSource] = useState<any>([]);
  const operateRef = useRef<any>(null);
  const showBaitForm = useCallback((data) => operateRef?.current.show(data), [operateRef]);
  const detailRef = useRef<any>(null);
  const listComp = useRef(undefined as any);
  let columns = useMemo(() => {
    const col = [
      {
        title: translations.service_information,
        dataIndex: 'name',
        render: (text: string, row: any, index: number) => {
          return (
            <>
              <div
                className={'mb6 flex-r-c'}
                style={{
                  justifyContent: 'flex-start',
                }}
              >
                <p style={{ maxWidth: '75%', height: '22px' }}>
                  <EllipsisPopover>{row.name}</EllipsisPopover>
                </p>
                <p className={'ml16'}>
                  <RenderTag type={row.status} className="middle" />
                </p>
              </div>
              <div>
                <RenderTag
                  type={'infoTag'}
                  title={translations.activeDefense_serviceLoc + '：' + row.resourceName}
                  className="small"
                />
              </div>
            </>
          );
        },
      },
      {
        title: translations.activeDefense_ns,
        dataIndex: 'namespace',
        width: '10%',
      },
      {
        title: translations.activeDefense_outboundOff,
        dataIndex: 'outboundOff',
        width: '12%',
        render: (text: string, row: any, index: number) => {
          return row.outboundOff ? outboundOnMap[localLang][0].label : outboundOnMap[localLang][1].label;
        },
      },
      {
        title: translations.activeDefense_relateAlert,
        dataIndex: 'events',
        width: 120,
        render: (text: string, row: any, index: number) => {
          return <SeverityTag {...row} />;
        },
      },

      {
        title: translations.activeDefense_containBait,
        dataIndex: 'baitType',
      },

      {
        title: translations.activeDefense_createTime,
        dataIndex: 'crateAt',
        width: '11%',
        render: (text: string, row: any, index: number) => {
          return moment(row.crateAt).format('YYYY-MM-DD HH:mm:ss');
        },
      },

      {
        title: translations.operation,
        dataIndex: 'namespace',
        width: 132,
        render: (text: string, row: any, index: number) => {
          return (
            <div
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <TzButton
                type={'text'}
                className={'mr12'}
                onClick={() => {
                  showBaitForm(row);
                }}
              >
                {translations.edit}
              </TzButton>
              <TzButton
                type={'text'}
                danger
                onClick={() => {
                  TzConfirm({
                    content: `${translations.activeDefense_deleteTip} ${row.name} ?`,
                    onOk: () => onDel(row.id),
                    okType: 'danger',
                  });
                }}
              >
                {translations.delete}
              </TzButton>
            </div>
          );
        },
      },
    ];
    return col;
  }, []);

  const reqFun = useCallback(
    (pagination: TablePaginationConfig) => {
      if (!cluster) {
        return getHistory().pipe(
          map(() => {
            return {
              data: [],
              total: [].length,
            };
          }),
        );
      }
      const { current = 1, pageSize = 10 } = pagination;
      const offset = (current - 1) * pageSize;
      let p = Object.assign({}, params);
      return getBaitList({ cluster_key: cluster, ...p }, offset, pageSize).pipe(
        map((res: any) => {
          let items = res.getItems();
          setDataSource(items);
          return {
            data: items,
            total: res.data.totalItems,
          };
        }),
      );
    },
    [cluster, params],
  );
  const closeDrawer = useMemoizedFn(() => {
    detailRef.current?.hideDetail?.();
  });
  useUnmount(() => {
    closeDrawer();
  });
  const onDel = useCallback((id) => {
    deleteBaitService(id).subscribe((res) => {
      if (res.error && res.error.message) {
        onSubmitFailed(res.error);
      } else {
        showSuccessMessage(translations.activeDefense_delSuccessTip);
        closeDrawer();
        listComp.current.refresh();
      }
    });
  }, []);
  useEffect(() => {
    const fetchGetclusterID = Store.clusterID.subscribe((clusterID: any) => {
      setCluster(clusterID);
    });
    return () => fetchGetclusterID.unsubscribe();
  }, []);
  useEffect(() => {
    if (cacheDrawerData.current) {
      let node = find(dataSource, (item) => cacheDrawerData.current.id === item.id);
      detailRef.current?.setNewDataInfo(node);
    }
  }, [dataSource]);
  return (
    <div className="bait-service mlr32">
      <BaitServiceSearch setParams={setParams} showBait={() => showBaitForm({})} />
      <TzTableServerPage
        columns={columns}
        reqFun={reqFun}
        onRow={(record) => {
          return {
            onClick: () => {
              cacheDrawerData.current = record;
              detailRef.current?.show(record);
            },
          };
        }}
        rowKey={'id'}
        ref={listComp}
      />
      <BaitForm
        ref={operateRef}
        clusters={clusters}
        fetchList={() => {
          listComp.current.refresh();
        }}
      />
      <BaitServiceDetail
        ref={detailRef}
        onEdit={(data: any) => showBaitForm(data)}
        onClose={() => {
          cacheDrawerData.current = undefined;
        }}
        onDel={(data: any) =>
          TzConfirm({
            content: `${translations.activeDefense_deleteTip} ${data.name} ?`,
            onOk: () => onDel(data.id),
            okType: 'danger',
          })
        }
      />
    </div>
  );
};

const BaitForm = forwardRef((props: any, ref?: any) => {
  const { fetchList } = props;
  let clusterList = useAssetsClusterList();
  const cluster = useAssetsClusters();
  const [visible, setVisible] = useState<boolean>(false);
  const [formIns] = Form.useForm();
  const [nsOp, setNs] = useState<any>([]);
  const [baitImages, setBaitImages] = useState<any>([]);

  const resourceNamePattern = /^[a-z]([a-z0-9]*$|[a-z0-9-]+[a-z0-9]+$)/g;

  const getNs = useMemoizedFn(() => {
    if (cluster)
      clusterAssetsNamespaces({ clusterID: cluster?.key, search: '' }).subscribe((result: any) => {
        if (result.error && result.error.message) {
          onSubmitFailed(result.error);
        } else {
          setNs(
            result.getItems().map((item: any) => ({
              value: item.Name,
              label: item.Name,
            })),
          );
        }
      });
  });

  const fetchBaitImages = useMemoizedFn((id: string | number) => {
    getBaitImages(id).subscribe((result: any) => {
      if (result.error) {
        setBaitImages(undefined);
      } else {
        setBaitImages(result.getItem());
      }
    });
  });

  const baitImageOptions = useMemo(() => {
    return (
      baitImages?.repositories?.map((item: any) => ({
        value: item.image,
        label: item.image,
      })) || []
    );
  }, [baitImages]);

  useEffect(() => {
    getNs();
  }, [cluster]);

  const addDomTitle = useMemo(() => {
    return (
      <>
        <strong>{translations.configuration_item_description}</strong>
        <div>
          <strong>{translations.microserviceList_micServiceName}：</strong>
          {translations.unStandard.str83}
        </div>
        <div>
          <strong>{translations.activeDefense_containBait}：</strong>
          {translations.unStandard.str82}
        </div>
        <div>
          <strong>{translations.activeDefense_outboundOff}：</strong>
          {translations.unStandard.str84}
        </div>
        <div>
          <strong>{translations.activeDefense_baitImage}：</strong>
          {translations.bait_source}
        </div>
        <div>
          <strong>{translations.unStandard.str86}：</strong>
          {translations.unStandard.str85}
        </div>
      </>
    );
  }, []);
  let baitId = Form.useWatch('baitId', formIns);
  let formId = Form.useWatch('id', formIns);
  useEffect(() => {
    if (baitId) {
      formIns.setFieldsValue({ baitImage: undefined });
      fetchBaitImages(baitId);
    }
  }, [baitId]);
  let image = Form.useWatch('image', formIns);
  useEffect(() => {
    if (image && baitImages) {
      const registryId = (baitImages?.repositories?.find((item: any) => item.image === image) || {}).registryId;
      formIns.setFieldsValue({ registryId, baitName: baitImages?.baitName });
    }
  }, [image, baitImages]);
  const operate = useMemoizedFn(() => {
    formIns.validateFields().then((val) => {
      let fn = val.id ? updateBaitService : createBaitService;
      fn(merge(val, { baitId: Number(val.baitId), outboundOff: val.outboundOff === 'true' })).subscribe((result) => {
        if (result.error && result.error.message) {
          onSubmitFailed(result.error);
        } else {
          showSuccessMessage(
            val.id ? translations.activeDefense_updateSuccessTip : translations.activeDefense_successTip,
          );
          fetchList();
          setVisible(false);
        }
      });
    });
  });
  const cancel = useCallback(() => {
    let f = formIns.isFieldsTouched(['name', 'baitId', 'outboundOff', 'image', 'resourceName', 'namespace']);
    if (f) {
      TzConfirm({
        content: formId ? translations.activeDefense_cancelEditTip : translations.activeDefense_cancelAddTip,
        onOk: () => {
          setVisible(false);
          formIns.resetFields();
        },
        okType: 'primary',
      });
    } else {
      setVisible(false);
      formIns.resetFields();
    }
  }, [formId]);
  useImperativeHandle(ref, () => {
    return {
      show(data: any) {
        formIns.setFieldsValue({
          ...data,
          outboundOff: data.outboundOff != undefined ? data.outboundOff + '' : undefined,
          baitId: data.baitId ? data.baitId + '' : undefined,
        });
        setVisible(true);
      },
    };
  }, []);

  return (
    <>
      <TzDrawer
        onClose={cancel}
        open={visible}
        extra={
          <div className="mr8">
            <TzButton className={'mr16 cancel-btn'} onClick={cancel}>
              {translations.cancel}
            </TzButton>
            <TzButton onClick={operate}>{formId ? translations.save : translations.scanner_report_add}</TzButton>
          </div>
        }
        title={
          formId ? (
            translations.edit
          ) : (
            <>
              {translations.activeDefense_add}
              <TzTooltip title={addDomTitle}>
                <i className={'iconfont icon-wenhao ml8 f16'} style={{ color: '#B3BAC6' }}></i>
              </TzTooltip>
            </>
          )
        }
        destroyOnClose={true}
        width={560}
        className="ad-form"
        closable={false}
      >
        <TzForm form={formIns}>
          <TzFormItem name="id" hidden>
            <TzInput />
          </TzFormItem>
          <TzFormItem name="baitName" hidden>
            <TzInput />
          </TzFormItem>
          <TzFormItem name="registryId" hidden>
            <TzInput />
          </TzFormItem>

          <TzFormItem
            name="name"
            label={translations.activeDefense_serviceName}
            rules={[
              {
                required: true,
                whitespace: true,
                message: translations.activeDefense_serviceNamePla,
              },
            ]}
          >
            <TzInput placeholder={translations.activeDefense_serviceNamePla} maxLength={50} />
          </TzFormItem>

          <TzFormItem
            name="baitId"
            label={translations.activeDefense_containBait}
            rules={[
              {
                required: true,
                whitespace: true,
                message: translations.activeDefense_containBaitPla,
              },
            ]}
          >
            <TzSelect
              disabled={formId}
              placeholder={translations.activeDefense_containBaitPla}
              filterOption={(input, option: any) => option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0}
              showSearch
              options={baits}
            />
          </TzFormItem>
          <TzFormItem
            name="outboundOff"
            label={translations.activeDefense_outboundOff}
            rules={[
              {
                required: true,
                message: translations.activeDefense_outboundOnPla,
              },
            ]}
          >
            <TzSelect
              showSearch
              disabled={formId}
              placeholder={translations.activeDefense_outboundOnPla}
              filterOption={(input, option: any) => option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0}
              options={outboundOnMap[localLang]}
            />
          </TzFormItem>
          <TzFormItem
            name="image"
            label={translations.activeDefense_baitImage}
            rules={[
              {
                required: true,
                whitespace: true,
                message: translations.activeDefense_baitImagePla,
              },
            ]}
          >
            <TzSelect
              disabled={formId}
              placeholder={translations.activeDefense_baitImagePla}
              showSearch
              filterOption={(input, option: any) => option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0}
              options={baitImageOptions}
            />
          </TzFormItem>
          <TzFormItem
            name=""
            label={translations.activeDefense_serviceLoc}
            rules={[
              {
                required: true,
                message: '',
                validator: (_) => Promise.resolve(),
              },
            ]}
          >
            <MyFormItem
              name="clusterKey"
              initialValue={cluster?.key}
              className="adCluster"
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: translations.activeDefense_clusterPla,
                },
              ]}
              render={(children) => (
                <div className={'score-input-select'}>
                  <span
                    className="prefix"
                    style={{
                      background: '#fff',
                      width: '80px',
                    }}
                  >{`${translations.activeDefense_cluster}:`}</span>
                  {children}
                </div>
              )}
            >
              <TzSelect
                bordered={false}
                showSearch
                defaultValue={cluster?.key}
                disabled={true}
                placeholder={translations.activeDefense_clusterPla}
                filterOption={(input, option: any) => option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                options={clusterList}
              />
            </MyFormItem>
            <MyFormItem
              name="namespace"
              className="adNs"
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: translations.activeDefense_nsPla,
                },
              ]}
              render={(children) => (
                <div className={'score-input-select'}>
                  <span
                    className="prefix"
                    style={{
                      background: '#fff',
                      width: '80px',
                    }}
                  >{`${translations.activeDefense_ns}:`}</span>
                  {children}
                </div>
              )}
            >
              <TzSelect
                showSearch
                bordered={false}
                disabled={formId}
                placeholder={translations.activeDefense_nsPla}
                filterOption={(input, option: any) => option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                options={nsOp}
              />
            </MyFormItem>
            <TzFormItem
              name="resourceName"
              rules={[
                {
                  required: true,
                  message: translations.activeDefense_resourcePla,
                },
                {
                  pattern: resourceNamePattern,
                  message: translations.activeDefense_formatError,
                },
              ]}
            >
              <TzInput
                disabled={formId}
                placeholder={translations.activeDefense_resourcePla}
                maxLength={50}
                prefix={`${translations.resources}：`}
              />
            </TzFormItem>
          </TzFormItem>
        </TzForm>
      </TzDrawer>
    </>
  );
});

const DetailTitle = (props: { status: string; name: string; onEdit: any; onDel: any }) => {
  const { status, name, onEdit, onDel } = props;

  return (
    <div className="ad-drawer-title flex-r" style={{ justifyContent: 'space-between', width: '100%' }}>
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <span className="ellipsis title-txt mr8">
          <TzTooltip title={name} placement="topLeft">
            {name}
          </TzTooltip>
        </span>
        <RenderTag type={status} />
      </span>
      <span>
        <TzButton onClick={onEdit} className={'mr16'}>
          {translations.edit}
        </TzButton>
        <TzButton danger onClick={onDel} className={'mr24'}>
          {translations.delete}
        </TzButton>
      </span>
    </div>
  );
};

const BaitServiceDetail = forwardRef((props: any, ref: any) => {
  const cluster = useClusterList();
  const { onEdit, onDel, onClose } = props;
  const [data, setData] = useState<any>(undefined);
  const [visible, setVisible] = useState<any>(false);
  useImperativeHandle(ref, () => {
    return {
      show(data: any) {
        setVisible(true);
        setData(data);
      },
      baitId() {
        return data?.id;
      },
      hideDetail() {
        setVisible(false);
      },
      setNewDataInfo(data: any) {
        setData(data);
      },
    };
  }, [data]);

  const tableObj = useMemo(() => {
    if (!data) {
      return [];
    }
    let obj: any = {
      baitType: translations.activeDefense_containBait,
      resourceName: translations.activeDefense_serviceLoc,
      namespace: translations.activeDefense_ns,
      clusterKey: translations.activeDefense_cluster,
      crateAt: translations.activeDefense_createTime,
    };
    return Object.keys(obj).map((item) => {
      let o: any = {
        title: obj[item] + '：',
        content: data[item] || '-',
      };
      if ('clusterKey' === item) {
        o['render'] = () => {
          return getClusterName(data[item]);
        };
      }
      return o;
    });
  }, [data]);
  let { clusterName, clusterKey } = useMemo(() => {
    let node = find(cluster, (item) => item.value === data?.clusterKey) || {};
    return { clusterName: node.name, clusterKey: node.value };
  }, [cluster, data]);
  return (
    <TzDrawer
      destroyOnClose
      // @ts-ignore
      getContainer={(n: any) => document.querySelector('.active-defense-card') ?? n}
      onClose={() => {
        onClose();
        setVisible(false);
      }}
      open={visible}
      width={'80%'}
      bodyStyle={{ paddingTop: 0 }}
      title={
        <DetailTitle status={data?.status} name={data?.name} onEdit={() => onEdit(data)} onDel={() => onDel(data)} />
      }
      className="ad-detail scroll-drawer"
    >
      <Tittle className={'mb16'} title={translations.activeDefense_baseInfo} />
      <ArtTemplateDataInfo data={tableObj} span={2} rowProps={{ gutter: [0, 0] }} />
      <Tittle
        className={'mb16'}
        title={translations.activeDefense_allAlert}
        extra={<div id="activeDefenseAllAlertFilterBtnId"></div>}
      />
      <div style={{ margin: '-16px 0' }}>
        <PalaceEvent
          scrollTarget={'.scroll-drawer .ant-drawer-body'}
          filter={false}
          onShow={false}
          filters={{
            ruleKey: [['Watson']],
            namespace: [data ? data['namespace'] : ''],
            cluster: [`${clusterName}_${clusterKey}`],
            resource: [data ? data['prefixName'] + '(Deployment)' : ''],
          }}
        />
      </div>
    </TzDrawer>
  );
});

export default (props: any) => {
  const cluster = useClusterList();
  const { allSearchParams, addSearchParams } = useNewSearchParams();

  let tabsProps = useMemo(() => {
    return {
      activeKey: allSearchParams.tab || undefined,
      onChange: (tab: string) => tabChange(tab),
    };
  }, [props, allSearchParams]);
  const tabPanes = useMemo(() => {
    let { label: name, value: clu } = Store.clusterItem.value;
    return [
      {
        tab: translations.activeDefense_baitService,
        tabKey: 'baits',
        children: <BaitService />,
      },
      {
        tab: translations.activeDefense_alertList,
        tabKey: 'bait-libs',
        children: (
          <div className="main-content">
            <PalaceEvent onShow={false} formType={'Watson'} filters={{ cluster: [`${name}_${clu}`] }} />
          </div>
        ),
      },
      {
        tab: translations.activeDefense_baitRepo,
        tabKey: 'alerts',
        children: (
          <div className="main-content">
            <BaitRepo />
          </div>
        ),
      },
    ];
  }, [cluster]);

  return (
    <div className="active-defense-card">
      <TzTabsNormal tabpanes={tabPanes} tabsProps={tabsProps} />
    </div>
  );
};
