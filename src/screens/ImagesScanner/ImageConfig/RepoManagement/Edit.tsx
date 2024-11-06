import Form from 'antd/lib/form';
import React, { useCallback, useEffect, useMemo, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { tap } from 'rxjs/operators';
import { onRemoveRepo } from '.';
import ArtTemplateDataInfo from '../../../../components/ComponentsLibrary/ArtTemplateDataInfo';
import { TzButton } from '../../../../components/tz-button';
import { TzCard } from '../../../../components/tz-card';
import { TzDrawer } from '../../../../components/tz-drawer';
import { TzForm, TzFormItem, MyFormItem } from '../../../../components/tz-form';
import { TzInput } from '../../../../components/tz-input';
import { TzInputNumber } from '../../../../components/tz-input-number';
import { TzInputPassword } from '../../../../components/tz-input-password';
import { TzInputTextArea } from '../../../../components/tz-input-textarea';
import { TzConfirm } from '../../../../components/tz-modal';
import { TzSelect } from '../../../../components/tz-select';
import { RenderTag } from '../../../../components/tz-tag';
import { WebResponse } from '../../../../definitions';
import { onSubmitFailed, showSuccessMessage } from '../../../../helpers/response-handlers';
import { getTime } from '../../../../helpers/until';
import { Routes } from '../../../../Routes';
import { scannerRegions, getAddRepo, updateRepo, addRepo } from '../../../../services/DataService';
import { Store } from '../../../../services/StoreService';
import { translations } from '../../../../translations/translations';
import { useScannerInfoList } from '../../../../helpers/use_fun';
import { useRepoTypes } from './use_fun';
import { find } from 'lodash';
import { TzMessageSuccess } from '../../../../components/tz-mesage';
import { flushSync } from 'react-dom';
import { useMemoizedFn } from 'ahooks';
const AddRepoManagement = (props: any, ref?: any) => {
  const [regionOptions, setRegionOptions] = useState<any>([]);
  let navigate = useNavigate();
  const [result] = useSearchParams();
  let id = result.get('id');
  const [formIns] = Form.useForm();
  const regType = Form.useWatch('regType', formIns) || '';
  let repoTypes = useRepoTypes();
  let getScannerRegions = () => {
    scannerRegions('ali-acr-ee').subscribe((res) => {
      if (res.error) return;
      let items = res.getItems() || [];
      setRegionOptions(
        items.map((item: any) => {
          return { label: item.local_name, value: item.region_id };
        }),
      );
    });
  };
  useEffect(() => {
    getScannerRegions();
  }, []);
  useEffect(() => {
    if (id) {
      getAddRepo({ id }).subscribe((res) => {
        if (res.error) return;
        let item = res.getItem();
        delete item.password;
        formIns.setFieldsValue(item);
      });
    } else {
      formIns.setFieldsValue({
        id: null,
        name: null,
        regType: null,
        username: null,
        url: null,
        accessKey: null,
        accessSecret: null,
        regionId: null,
        instanceId: null,
        password: null,
        scannerInstance: null,
        description: null,
      });
    }
  }, []);
  const clusterList = useScannerInfoList();

  let setHeader = () => {
    let title = id ? translations.scanner_config_editRepo : translations.scanner_config_addRepo;
    Store.header.next({
      title: title,
    });
    let breads = props.breadcrumb.slice(0);
    breads.pop();
    Store.breadcrumb.next([
      ...breads,
      {
        children: title,
      },
    ]);
  };
  let l = useLocation();
  useEffect(setHeader, [l]);
  const fieldsChangeRef = useRef<boolean>();

  const onBack = useMemoizedFn(() => {
    navigate(-1);
    flushSync(() => {
      navigate(`${Routes.ImageConfig}?tab=warehouseManagement`, {
        replace: true,
        state: { keepAlive: true },
      });
    });
  });
  let setFooter = useCallback(() => {
    Store.pageFooter.next(
      <div style={{ width: '100%', textAlign: 'right' }}>
        <TzButton
          className={'mr24'}
          onClick={() => {
            if (fieldsChangeRef.current) {
              TzConfirm({
                content: translations.deflectDefense_cancelTip,
                okText: translations.superAdmin_confirm,
                cancelText: translations.breadcrumb_back,
                onOk() {
                  navigate(-1);
                },
              });
            } else {
              navigate(-1);
            }
          }}
        >
          {translations.cancel}
        </TzButton>
        <TzButton
          type={'primary'}
          onClick={() => {
            formIns.validateFields().then((val) => {
              let fn = id ? updateRepo : addRepo;
              if (id && !formIns.isFieldTouched('password')) {
                delete val.password;
              }
              fn(val).subscribe((res) => {
                if (res.error && res.error.message) {
                  onSubmitFailed(res.error);
                } else {
                  TzMessageSuccess(id ? translations.edit_succeeded : translations.add_success_tip);
                  // navigate(-1);
                  onBack();
                }
              });
            });
          }}
        >
          {id ? translations.save : translations.newAdd}
        </TzButton>
      </div>,
    );
  }, [l]);
  useEffect(() => {
    setFooter();
  }, [setFooter]);
  return (
    <div className={'repo-management-edit mlr32 plr24'}>
      <TzForm
        form={formIns}
        autoComplete="new-password"
        onFieldsChange={(a, b) => {
          fieldsChangeRef.current = true;
        }}
      >
        <TzFormItem name="id" hidden={true}>
          <TzInput />
        </TzFormItem>
        <TzFormItem
          name="name"
          label={translations.scanner_config_repoName}
          rules={[
            {
              required: true,
              whitespace: true,
              message: translations.unStandard.notEmptyTip(translations.scanner_config_repoName),
            },
          ]}
        >
          <TzInput placeholder={translations.scanner_config_addRepoPlaceholder} maxLength={50} />
        </TzFormItem>
        <TzFormItem
          name="regType"
          label={translations.scanner_config_repoType}
          rules={[
            {
              required: true,
              message: translations.unStandard.notEmptyTip(translations.scanner_config_repoType),
            },
          ]}
        >
          <TzSelect disabled={!!id} placeholder={translations.scanner_config_repoTypePlaceHolder} options={repoTypes} />
        </TzFormItem>
        {'ali-acr' == regType || 'ali-acr-ee' === regType ? (
          <>
            <TzFormItem
              name="accessKey"
              label="AccessKey ID"
              tooltip={translations.unStandard.str58}
              rules={[
                {
                  required: true,
                  message: translations.unStandard.notEmptyTip(translations.unStandard.str58),
                },
              ]}
            >
              <TzInput placeholder={translations.unStandard.str59} />
            </TzFormItem>
            <TzFormItem
              name="accessSecret"
              label="AccessKey Secret"
              tooltip={translations.unStandard.str58}
              rules={[
                {
                  required: true,
                  message: translations.unStandard.notEmptyTip(translations.unStandard.str58),
                },
              ]}
            >
              <TzInput placeholder={translations.unStandard.str60} />
            </TzFormItem>
          </>
        ) : null}
        {'ali-acr-ee' === regType ? (
          <>
            <TzFormItem
              name="regionId"
              label={translations.region}
              rules={[
                {
                  required: true,
                  message: translations.unStandard.notEmptyTip(translations.region),
                },
              ]}
            >
              <TzSelect placeholder={translations.please_select_a_region} options={regionOptions} />
            </TzFormItem>

            <TzFormItem
              name="instanceId"
              label={translations.instance_ID}
              rules={[
                {
                  required: true,
                  message: translations.unStandard.notEmptyTip(translations.instance_ID),
                },
              ]}
            >
              <TzInput placeholder={translations.unStandard.str61} />
            </TzFormItem>
          </>
        ) : null}
        <TzFormItem
          name="url"
          label={translations.scanner_config_repoAddr}
          rules={[
            {
              required: true,
              whitespace: true,
              message: translations.unStandard.notEmptyTip(translations.scanner_config_repoAddr),
            },
            {
              pattern: /^https?:\/\//i,
              message: translations.scanner_config_repoPrefix,
            },
          ]}
        >
          <TzInput disabled={!!id} placeholder={translations.scanner_config_repoAddrPlaceHolder} maxLength={255} />
        </TzFormItem>
        <TzFormItem
          name="username"
          label={translations.scanner_config_account}
          rules={[
            {
              required: true,
              whitespace: true,
              message: translations.unStandard.notEmptyTip(translations.scanner_config_account),
            },
          ]}
        >
          <TzInput
            placeholder={
              'ali-acr-ee' === regType ? translations.unStandard.str62 : translations.scanner_config_accountPlaceHolder
            }
          />
        </TzFormItem>
        <TzFormItem
          name="password"
          label={translations.password}
          rules={[
            {
              required: true,
              message: translations.unStandard.notEmptyTip(translations.password),
            },
          ]}
          initialValue={'********'}
        >
          <TzInputPassword
            allowClear
            autoComplete="new-password"
            iconRender={() => <></>}
            onFocus={(e) => {
              e.persist();
              setTimeout(() => {
                $(e.target).val('');
              }, 0);
            }}
            placeholder={
              'ali-acr-ee' === regType ? translations.unStandard.str63 : translations.scanner_config_passwordPlaceHolder
            }
          />
        </TzFormItem>
        <TzFormItem
          name="scannerInstance"
          label={translations.Scan}
          rules={[
            {
              required: true,
              whitespace: true,
              message: translations.unStandard.notEmptyTip(translations.Scan),
            },
          ]}
          extra={translations.unStandard.str64}
        >
          <TzSelect
            options={clusterList}
            placeholder={translations.please_select_cluster_scanner}
            showSearch
            filterOption={(input, option) => {
              return !input || (option?.label + '').toLowerCase().indexOf(input.toLowerCase()) >= 0;
            }}
          />
        </TzFormItem>
        {regType.indexOf('harbor') == 0 ? null : (
          <MyFormItem
            label={translations.scanner_config_syncInterval}
            initialValue={5}
            name="syncInterval"
            render={(children) => (
              <>
                {children}
                <span className="antd-form-text">&nbsp;&nbsp;{translations.scanner_config_syncTimeUnit}</span>
              </>
            )}
            rules={[
              {
                required: true,
                message: translations.unStandard.notEmptyTip(translations.scanner_config_syncInterval),
              },
            ]}
          >
            <TzInputNumber min={5} style={{ width: '140px' }} />
          </MyFormItem>
        )}
        <TzFormItem name="description" label={translations.imageReject_comment_title}>
          <TzInputTextArea
            maxLength={150}
            placeholder={translations.clusterManage_placeholder + translations.imageReject_comment_title}
          />
        </TzFormItem>
      </TzForm>
    </div>
  );
};
AddRepoManagement.Detail = (props: { id: any }) => {
  let { id } = props;
  let l = useLocation();
  const [info, setInfo] = useState<any>(undefined);
  let getAddRepoFn = () => {
    getAddRepo({ id }).subscribe((res) => {
      if (res.error) return;
      let item = res.getItem();
      setInfo(item);
    });
  };
  useEffect(() => {
    getAddRepoFn();
  }, []);

  const scannerList = useScannerInfoList();
  const dataInfoList = useMemo(() => {
    if (!info) return [];
    const obj: any = {
      regType: translations.scanner_config_repoType + '：',
      url: translations.scanner_config_repoAddr + '：',
      username: translations.scanner_config_account + '：',
      password: translations.password + '：',
      scannerInstance: translations.Scan + '：',
      syncInterval: translations.scanner_config_syncInterval + '：',
      regionId: translations.synchronization_scope + '：',
      createdAt: translations.last_sync_time + ':',
      description: translations.imageReject_comment_title + '：',
    };
    if (info['regType'].indexOf('harbor') == 0) {
      delete obj.syncInterval;
    }
    return Object.keys(obj).map((item) => {
      let o: any = {
        title: obj[item] || '-',
        content: info[item],
      };
      if ('scannerInstance' === item) {
        o['render'] = () => {
          return find(scannerList, (ite) => ite.value === info[item])?.label || info[item];
        };
      }
      if ('createdAt' === item) {
        o['render'] = () => {
          return getTime(info[item]);
        };
      }
      if ('syncInterval' === item) {
        o['render'] = () => {
          return info[item] + translations.scanner_config_syncTimeUnit;
        };
      }

      if ('password' === item) {
        o['render'] = () => {
          return '********';
        };
      }
      return o;
    });
  }, [info, scannerList]);
  let navigate = useNavigate();
  let setHeader = useCallback(() => {
    Store.header.next({
      title: (
        <div className={'flex-r-c'}>
          {info?.name}
          <RenderTag type={'repo' + info?.status} className={'ml12'} />
        </div>
      ),
      extra: (
        <>
          <TzButton
            className="mr16"
            onClick={() => {
              navigate(`${Routes.ImageConfigRepoManagementEdit}?id=${id}`);
            }}
          >
            {translations.edit}
          </TzButton>
          <TzButton
            danger
            onClick={() => {
              TzConfirm({
                content: translations.unStandard.str34(translations.library + info.name),
                okText: translations.delete,
                okButtonProps: {
                  type: 'primary',
                  danger: true,
                },
                onOk() {
                  onRemoveRepo(info.id, () => {
                    navigate(-1);
                    flushSync(() => {
                      navigate(`${Routes.ImageConfig}?tab=warehouseManagement`, {
                        replace: true,
                        state: { keepAlive: true },
                      });
                    });
                  });
                },
              });
            }}
          >
            {translations.delete}
          </TzButton>
        </>
      ),
    });
  }, [info]);
  useEffect(() => {
    info?.name && setHeader();
  }, [setHeader, l]);
  return (
    <div className={'mlr32'}>
      <TzCard title={translations.compliances_breakdown_taskbaseinfo} bodyStyle={{ paddingBottom: 0 }}>
        <ArtTemplateDataInfo data={dataInfoList.slice(0, -1)} span={2} rowProps={{ gutter: [0, 0] }} />
        <ArtTemplateDataInfo data={dataInfoList.slice(-1)} span={1} rowProps={{ gutter: [0, 0] }} />
      </TzCard>
    </div>
  );
};
export default AddRepoManagement;
