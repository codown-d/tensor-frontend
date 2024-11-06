import { Cascader, UploadFile, UploadProps } from 'antd';
import Form from 'antd/lib/form';
import { debounce, merge } from 'lodash';
import React, { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { map, switchMap } from 'rxjs/operators';
import { modeOption } from '.';
import TzCascader from '../../components/ComponentsLibrary/TzCascader';
import { TreeNode, TzCascaderOptionProps } from '../../components/ComponentsLibrary/TzCascader/interface';
import { StrategyAction } from '../../components/ComponentsLibrary/TzStrategyAction';
import TzTextArea from '../../components/ComponentsLibrary/TzTextArea';
import { TzButton } from '../../components/tz-button';
import { TzForm, TzFormItem } from '../../components/tz-form';
import { TzInput } from '../../components/tz-input';
import { TzConfirm } from '../../components/tz-modal';
import { TzRadioGroup } from '../../components/tz-radio';
import { TzUpload } from '../../components/tz-upload';
import { Routes } from '../../Routes';
import { getUserToken } from '../../services/AccountService';
import {
  clusterAssetsNamespaces,
  clusterGraphResources,
  putWafService,
  wafService,
  wafServiceId,
} from '../../services/DataService';
import { AuthBearer } from '../../services/DataServiceHelper';
import { Store } from '../../services/StoreService';
import { translations } from '../../translations/translations';
import { filter } from '../ComplianceWhole/ScanManagement';
import { useAssetsClusterList } from '../../helpers/use_fun';
import './AppInfo.scss';
import { TzMessageSuccess } from '../../components/tz-mesage';

const AppInfo = () => {
  const [result] = useSearchParams();
  let [appInfoId] = useState(result.get('id'));
  const [resourceList, setOptions] = useState<TzCascaderOptionProps[]>([]);
  const [fileListCrt, setFileListCrt] = useState<UploadFile[]>([]);
  const [fileListKey, setFileListKey] = useState<UploadFile[]>([]);
  const [form] = Form.useForm();
  let l = useLocation();
  let setHeader = useCallback(() => {
    Store.header.next({
      title: appInfoId ? translations.editing_applications : translations.add_new_app,
    });
  }, [appInfoId, l]);
  let clusters = useAssetsClusterList();
  useEffect(() => {
    clusters.length &&
      Promise.all(
        clusters.map((item: any) => {
          return new Promise((resolve) => {
            clusterAssetsNamespaces({ clusterID: item.value }).subscribe((res) => {
              let nsList = res.getItems().map((ite) => {
                return {
                  value: ite.Name,
                  label: ite.Name,
                  namespace: ite.Name,
                  clusterID: ite.ClusterKey,
                  isLeaf: false,
                };
              });
              Promise.all(
                nsList.map((ite: any) => {
                  return new Promise((re) => {
                    let { namespace, clusterID } = ite;
                    clusterGraphResources(
                      {
                        offset: 0,
                        limit: 10000, //后端修改为10000 20240108
                      },
                      { namespace, clusterID },
                    ).subscribe((res) => {
                      let items = res.getItems().map((it) => {
                        return {
                          ...it,
                          value: `${it.name}(${it.kind})_${it.uid}`,
                          label: `${it.name}(${it.kind})`,
                          isLeaf: true,
                        };
                      });
                      ite['children'] = items;
                      ite['isLeaf'] = !items.length;
                      re('');
                    });
                  });
                }),
              ).then((res) => {
                item['children'] = nsList;
                item['isLeaf'] = !nsList.length;
                resolve(nsList);
              });
            });
          });
        }),
      ).then((res) => {
        setOptions([...clusters]);
      });
  }, [clusters]);
  useEffect(() => {
    setHeader();
  }, [setHeader]);

  let navigate = useNavigate();
  const fieldsChangeRef = useRef<boolean>();
  let setFooter = useCallback(() => {
    Store.pageFooter.next(
      <div style={{ width: '100%' }}>
        <TzButton
          type={'primary'}
          className={' f-r'}
          onClick={() => {
            form.submit();
          }}
        >
          {appInfoId ? translations.save : translations.newAdd}
        </TzButton>
        <TzButton
          className={'mr20 f-r'}
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
      </div>,
    );
  }, [appInfoId, l]);
  let wafServiceIdFn = useCallback(() => {
    wafServiceId({ id: appInfoId }).subscribe((res) => {
      if (res.error) return;
      let item = res.getItem();
      form.setFieldsValue(
        merge({}, item, {
          resource: [item.cluster_key, item.namespace, `${item.resource_name}(${item.kind})`],
        }),
      );
      setFileListCrt(() =>
        item.tls_crt
          ? [
              {
                uid: '1',
                name: `${translations.crt}.crt`,
                status: 'done',
              },
            ]
          : [],
      );
      setFileListKey(
        item.tls_key
          ? [
              {
                uid: '1',
                name: `${translations.private}.key`,
                status: 'done',
              },
            ]
          : [],
      );
    });
  }, []);
  useEffect(() => {
    appInfoId && wafServiceIdFn();
  }, [appInfoId]);
  useEffect(() => {
    setFooter();
  }, [setFooter]);
  let actionList = modeOption;
  const token = getUserToken();
  let protocol = Form.useWatch('protocol', form);
  return (
    <div className="app-info mlr32 ml40 ">
      <div className={'mlr24'}>
        <TzForm
          form={form}
          validateTrigger={'onChange'}
          initialValues={{ protocol: 'http', mode: 'passthrough', uri_prefix: '/' }}
          onFinish={(values) => {
            let resource = values.resource?.[2] || '';
            let resource_name = resource.match(/(\S*)\(/)[1];
            let kind = resource.match(/\((\S*)\)/)[1];
            let obj = {
              cluster_key: values.resource?.[0],
              namespace: values.resource?.[1],
              resource_name: resource_name,
              kind: kind,
            };
            delete values.resource;
            let fn = appInfoId ? putWafService : wafService;
            fn(merge({}, values, obj)).subscribe((res) => {
              if (res.error) return;
              TzMessageSuccess(appInfoId ? `${translations.saveSuccess}` : `${translations.activeDefense_successTip}`);
              navigate(`${Routes.Firewall}`);
            });
          }}
          onFieldsChange={(a, b) => {
            fieldsChangeRef.current = true;
          }}
        >
          <TzFormItem hidden name="id">
            <TzInput />
          </TzFormItem>
          <TzFormItem
            name="name"
            label={translations.app_name}
            rules={[
              {
                required: true,
                message: translations.clusterManage_placeholder + translations.app_name,
              },
            ]}
          >
            <TzInput maxLength={50} placeholder={translations.clusterManage_placeholder + translations.app_name} />
          </TzFormItem>
          <TzFormItem
            name="host"
            label={translations.domain_name}
            rules={[
              {
                required: true,
                message: translations.clusterManage_placeholder + translations.domain_name,
              },
              {
                pattern: /^(?:(http|https|ftp):\/\/)?((?:[\w-]+\.)+[a-z0-9]+)((?:\/[^/?#]*)+)?(\?[^#]+)?(#.+)?$/i,
                message: translations.unStandard.str256,
              },
            ]}
          >
            <TzInput
              disabled={!!appInfoId}
              placeholder={translations.clusterManage_placeholder + translations.domain_name}
            />
          </TzFormItem>
          <TzFormItem
            name="resource"
            label={translations.resources + '：'}
            rules={[
              {
                required: true,
                message: translations.runtimePolicy_policy_res_place,
              },
            ]}
          >
            <TzCascader
              disabled={!!appInfoId}
              placeholder={translations.runtimePolicy_policy_res_place}
              options={resourceList}
              showSearch={{ filter }}
            />
          </TzFormItem>
          <TzFormItem
            name="uri_prefix"
            label={translations.ingress_path}
            rules={[
              {
                required: true,
                message: translations.clusterManage_placeholder + translations.ingress_path,
              },
            ]}
          >
            <TzInput placeholder={translations.clusterManage_placeholder + translations.ingress_path} />
          </TzFormItem>

          <TzFormItem name="protocol" label={translations.microseg_segments_policy_protocol_type}>
            <TzRadioGroup
              disabled={!!appInfoId}
              options={[
                {
                  label: 'http',
                  value: 'http',
                },
                {
                  label: 'https',
                  value: 'https',
                },
              ]}
            />
          </TzFormItem>
          {protocol === 'https' ? (
            <>
              <TzFormItem name="tls_crt" label={translations.microseg_segments_policy_protocol_type} noStyle>
                <TzUpload
                  accept=".crt"
                  name="tls-crt"
                  action="/api/v2/containerSec/waf/certCrt"
                  className={'flex-r app-info-upload'}
                  disabled={!!appInfoId}
                  fileList={fileListCrt}
                  iconRender={() => <i className={'icon iconfont icon-wenjian'}></i>}
                  headers={{
                    Authorization: token ? `${AuthBearer} ${token}` : AuthBearer,
                  }}
                  showUploadList={{
                    removeIcon: (
                      <i
                        className={'icon iconfont icon-lajitong'}
                        style={{ color: 'rgba(233, 84, 84, 1)', paddingRight: '0px' }}
                      ></i>
                    ),
                  }}
                  onChange={({ file }) => {
                    if (file.status === 'removed') {
                      setFileListCrt([]);
                    } else {
                      setFileListCrt([file]);
                    }
                    if (file.status === 'done') {
                      return form.setFieldsValue({ tls_crt: file.response.data.id });
                    }
                  }}
                  onRemove={() => {
                    setFileListCrt([]);
                    return true;
                  }}
                >
                  <TzButton disabled={!!appInfoId} icon={<i className={'icon iconfont icon-wenjian'}></i>}>
                    {translations.upload_certificate_file}
                  </TzButton>
                </TzUpload>
              </TzFormItem>
              <TzFormItem name="tls_key" label={translations.microseg_segments_policy_protocol_type} noStyle>
                <TzUpload
                  accept=".key"
                  name="tls-key"
                  action="/api/v2/containerSec/waf/certKey"
                  className={'flex-r app-info-upload mt12 mb16'}
                  disabled={!!appInfoId}
                  fileList={fileListKey}
                  iconRender={() => <i className={'icon iconfont icon-wenjian'}></i>}
                  headers={{
                    Authorization: token ? `${AuthBearer} ${token}` : AuthBearer,
                  }}
                  showUploadList={{
                    removeIcon: (
                      <i
                        className={'icon iconfont icon-lajitong'}
                        style={{ color: 'rgba(233, 84, 84, 1)', paddingRight: '0px' }}
                      ></i>
                    ),
                  }}
                  onChange={({ file }) => {
                    if (file.status === 'removed') {
                      setFileListKey([]);
                    } else {
                      setFileListKey([file]);
                    }
                    if (file.status === 'done') {
                      return form.setFieldsValue({ tls_key: file.response.data.id });
                    }
                  }}
                >
                  <TzButton disabled={!!appInfoId} icon={<i className={'icon iconfont icon-wenjian'}></i>}>
                    {translations.upload_private_key_file}
                  </TzButton>
                </TzUpload>
              </TzFormItem>
            </>
          ) : null}
          <TzFormItem name="mode" label={translations.actions}>
            <StrategyAction data={actionList} />
          </TzFormItem>
          <TzFormItem name="description" label={translations.imageReject_comment_title}>
            <TzTextArea placeholder={translations.unStandard.str40} maxLength={100} />
          </TzFormItem>
        </TzForm>
      </div>
    </div>
  );
};
export default AppInfo;
