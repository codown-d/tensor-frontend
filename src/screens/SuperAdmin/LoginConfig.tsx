import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { localLang, translations } from '../../translations/translations';
import {
  configIdp,
  configLdap,
  configLogin,
  configRadius,
  ldapGroup,
  ldapUploadFile,
  postConfigLdap,
  postConfigRadius,
  postLdapGroup,
  putConfigIdp,
  putConfigLogin,
} from '../../services/DataService';
import AddInfoBtn from '../../components/ComponentsLibrary/AddInfoBtn';
import './LoginConfig.scss';
import { TzInput } from '../../components/tz-input';
import { TzTable } from '../../components/tz-table';
import { TzButton } from '../../components/tz-button';
import { TzSelect, TzSelectNormal } from '../../components/tz-select';
import { MyFormItem, TzForm, TzFormItem } from '../../components/tz-form';
import Form from 'antd/lib/form';
import { TzCard } from '../../components/tz-card';
import { TzSwitch } from '../../components/tz-switch';
import { TzCol, TzRow } from '../../components/tz-row-col';
import { moduleIDOptions } from './SuperAdminScreen';
import TzPopconfirm from '../../components/ComponentsLibrary/TzPopconfirm';
import { TzConfirm } from '../../components/tz-modal';
import { cloneDeep, findIndex, merge } from 'lodash';
import { TzInputNumber } from '../../components/tz-input-number';
import { getUserInformation } from '../../services/AccountService';
import { TzUpload } from '../../components/tz-upload';
import { FileAddOutlined } from '@ant-design/icons/lib/icons';
import { UploadFile } from 'antd/lib/upload';
import { showSuccessMessage } from '../../helpers/response-handlers';
import ArtTemplateDataInfo from '../../components/ComponentsLibrary/ArtTemplateDataInfo';
import { PWD_LEVEL } from '../Login/component/PwdStrengthBar';
import TzSelectTag from '../../components/ComponentsLibrary/TzSelectTag';
import { RenderTag, TzTag } from '../../components/tz-tag';
import { useMemoizedFn } from 'ahooks';
import { getCurrentLanguage } from '../../services/LanguageService';

export const roleNameOptions = [
  {
    label: translations.superAdmin_userModule_User,
    value: 'normal',
  },
  {
    label: translations.administrator,
    value: 'admin',
  },
  {
    label: translations.super_admin,
    value: 'super-admin',
  },
];
const getPwdLevelLabel = (val: string | undefined) => (val ? PWD_LEVEL.find((v) => v.value === val)?.label : undefined);
const protocolList = [
  {
    label: 'TCP',
    value: 'TCP',
  },
  {
    label: 'UDP',
    value: 'UDP',
  },
];
const LoginConfig = (props: any, ref?: any) => {
  const [roleDataList, setRoleDataList] = useState<any>([]);
  const [ldapDataList, setLdapDataList] = useState<any>([]);
  const [ldapInfoDataList, setLdapInfoDataList] = useState<any>([]);

  const [editLogin, setEditLogin] = useState(false);
  const [editSSO, setEditSSO] = useState(false);
  const [editLdap, setEditLdap] = useState(false);
  const [editRadius, setEditRadius] = useState(false);

  const [formLogin] = Form.useForm();
  const [formSSO] = Form.useForm();
  const [formLdap] = Form.useForm();
  const [formRadius] = Form.useForm();

  const [loginInfo, setLoginInfo] = useState<any>(null);
  const [SSOInfo, setSSOInfo] = useState<any>(null);
  const [ldapInfo, setLdapInfo] = useState<any>(null);
  const [radiusInfo, setRadiusInfo] = useState<any>(null);
  const dataSSOInfoList = useMemo(() => {
    if (!SSOInfo) return [];
    const obj: any = {
      discoveryEndpoint: translations.server_address + '：',
      clientId: 'ID：',
      clientSecret: 'secret：',
    };
    return Object.keys(obj).map((item) => {
      let o: any = {
        title: obj[item] || item,
        content: SSOInfo[item] || '-',
      };
      return o;
    });
  }, [SSOInfo]);
  const ldapInfoList = useMemo(() => {
    if (!ldapInfo) return [];
    const obj: any = {
      addr: translations.server_address + '：',
      port: translations.server_port + '：',
      baseDN: translations.superAdmin_loginLdapConfig_root + '：',
      bindDN: translations.platformAPIData_Username + '：',
      bindPassword: translations.user_password + '：',
      userFilter: translations.query_user_filter + '：',
      groupField: translations.superAdmin_loginLdapConfig_groupField + '：',
      connType: translations.superAdmin_loginLdapConfig_connType + '：',
      serverNameOverride: translations.superAdmin_loginLdapConfig_serverName + '：',
    };
    return Object.keys(obj).map((item) => {
      let o: any = {
        title: obj[item] || item,
        content: ldapInfo[item] || '-',
      };
      return o;
    });
  }, [ldapInfo]);
  let radiusInfoList = useMemo(() => {
    if (!radiusInfo) return [];
    const obj: any = {
      addr: translations.server_address + '：',
      port: translations.server_port + '：',
      network: translations.calico_protocol + '：',
      secret: translations.superAdmin_loginLdapConfig_sevret + '：',
    };
    return Object.keys(obj).map((item) => {
      let o: any = {
        title: obj[item] || item,
        content: radiusInfo[item] || '-',
      };
      return o;
    });
  }, [radiusInfo]);
  let showLoginRoleModal = (data: any, callBack?: any) => {
    let formInstance: any;
    let UserForm = forwardRef((props, ref) => {
      const [form] = Form.useForm();
      useImperativeHandle(ref, () => {
        return { ...form };
      }, []);
      return (
        <>
          <TzForm form={form} initialValues={merge({}, { name: undefined, roleName: undefined, auth: [] }, data)}>
            <TzFormItem
              name="name"
              label={translations.superAdmin_loginLdapConfig_ldapItemName}
              rules={[{ required: true, message: translations.unStandard.str177 }]}
            >
              <TzInput placeholder={translations.superAdmin_loginLdapConfig_inputLdapIName} maxLength={50} />
            </TzFormItem>
            <TzFormItem
              name="roleName"
              label={translations.role}
              rules={[{ required: true, message: translations.unStandard.str178 }]}
            >
              <TzInput placeholder={translations.unStandard.str176} maxLength={50} />
            </TzFormItem>
            <TzFormItem
              name="auth"
              label={translations.modules}
              rules={[{ required: true, message: translations.unStandard.str179 }]}
            >
              <TzSelect mode={'multiple'} placeholder={translations.unStandard.str192} options={moduleIDOptions} />
            </TzFormItem>
          </TzForm>
        </>
      );
    });
    TzConfirm({
      width: '560px',
      title: data.name ? translations.unStandard.str180 : translations.unStandard.str193,
      okText: data.name ? translations.save : translations.scanner_config_confirm,
      content: (
        <UserForm
          ref={(form) => {
            formInstance = form;
          }}
        />
      ),
      onOk() {
        return new Promise((resolve, reject) => {
          formInstance?.validateFields().then((value: any) => {
            callBack && callBack(value, resolve, reject);
          }, reject);
        });
      },
    });
  };
  let showLdapModal = (data: any, callBack?: any) => {
    let formInstance: any;
    let LdapForm = forwardRef((props, ref) => {
      const [form] = Form.useForm();
      useImperativeHandle(ref, () => {
        return { ...form };
      }, []);
      return (
        <>
          <TzForm form={form} initialValues={merge({}, { name: undefined, roleName: undefined, auth: [] }, data)}>
            <TzFormItem
              name="name"
              label={translations.superAdmin_loginLdapConfig_ldapItemName}
              rules={[{ required: true, message: translations.unStandard.str177 }]}
            >
              <TzInput placeholder={translations.superAdmin_loginLdapConfig_inputLdapIName} />
            </TzFormItem>
            <TzFormItem
              name="role"
              label={translations.role}
              rules={[{ required: true, message: translations.unStandard.str178 }]}
            >
              <TzSelect placeholder={translations.unStandard.str176} options={roleNameOptions} />
            </TzFormItem>
            <TzFormItem
              name="modules"
              label={translations.modules}
              rules={[{ required: true, message: translations.unStandard.str179 }]}
            >
              <TzSelect mode={'multiple'} placeholder={translations.unStandard.str192} options={moduleIDOptions} />
            </TzFormItem>
          </TzForm>
        </>
      );
    });
    TzConfirm({
      width: '560px',
      title: data.name
        ? translations.superAdmin_loginLdapConfig_changeLdapItem
        : translations.superAdmin_loginLdapConfig_addLdapItem,
      okText: data.name ? translations.save : translations.scanner_config_confirm,
      content: (
        <LdapForm
          ref={(form) => {
            formInstance = form;
          }}
        />
      ),
      onOk() {
        return new Promise((resolve, reject) => {
          formInstance?.validateFields().then((value: any) => {
            callBack && callBack(value, resolve, reject);
          }, reject);
        });
      },
    });
  };
  useEffect(() => {
    formSSO.setFieldsValue({
      permissionMapping: [...roleDataList].map((item: any) => {
        return merge({}, item, {
          auth: item['auth'].map((it: any) => {
            return { id: it };
          }),
        });
      }),
    });
  }, [roleDataList]);
  let columns = useMemo(() => {
    const col: any = [
      {
        title: translations.superAdmin_loginLdapConfig_ldapItemName,
        dataIndex: 'name',
      },
      {
        title: translations.superAdmin_loginLdapConfig_ldapItemRole,
        dataIndex: 'roleName',
      },
      {
        title: translations.modules,
        dataIndex: 'auth',
        className: 'td-center',
        render: (text: any, row: any, index: number) => {
          return getRoleLabel(row.auth);
        },
      },
    ];
    editSSO &&
      col.push({
        width: '120px',
        className: 'td-center',
        title: translations.operation,
        render: (text: any, row: any) => {
          return (
            <>
              <TzButton
                type="text"
                className={'mr4'}
                onClick={(event) => {
                  showLoginRoleModal(row, (value: any, resolve: any, reject: any) => {
                    setRoleDataList((pre: any[]) => {
                      let index = findIndex(pre, (o) => {
                        return o.name == row.name;
                      });
                      index != -1 && pre.splice(index, 1, value);
                      return [...pre];
                    });
                    resolve();
                  });
                }}
              >
                {translations.edit}
              </TzButton>
              <TzPopconfirm
                placement="topRight"
                title={translations.unStandard.str39}
                okText={translations.delete}
                okButtonProps={{ danger: true }}
                cancelButtonProps={{ type: 'text', danger: true }}
                cancelText={translations.confirm_modal_cancel}
                onConfirm={() => {
                  setRoleDataList((pre: any[]) => {
                    let index = findIndex(pre, (o) => {
                      return o.name == row.name;
                    });
                    index != -1 && pre.splice(index, 1);
                    return [...pre];
                  });
                }}
              >
                <TzButton type="text" danger>
                  {translations.delete}
                </TzButton>
              </TzPopconfirm>
            </>
          );
        },
      });
    return col;
  }, [editSSO]);
  let columnsLdap = useMemo(() => {
    const col: any = [
      {
        title: translations.superAdmin_loginLdapConfig_ldapItemName,
        dataIndex: 'name',
      },
      {
        title: translations.superAdmin_loginLdapConfig_ldapItemRole,
        dataIndex: 'role',
        render: (text: any, row: any, index: number) => {
          let node = roleNameOptions.filter((item) => item.value === text);
          return node.map((item) => item.label).join(', ');
        },
      },
      {
        title: translations.modules,
        dataIndex: 'modules',
        className: 'td-center',
        render: (text: any, row: any, index: number) => {
          return getRoleLabel(row.modules);
        },
      },
    ];
    editLdap &&
      col.push({
        width: '120px',
        className: 'td-center',
        title: translations.operation,
        render: (text: any, row: any) => {
          return (
            <>
              <TzButton
                type="text"
                className={'mr4'}
                onClick={(event) => {
                  showLdapModal(row, (value: any, resolve: any, reject: any) => {
                    setLdapDataList((pre: any[]) => {
                      let index = findIndex(pre, (o) => {
                        return o.name == row.name;
                      });
                      index != -1 && pre.splice(index, 1, value);
                      return [...pre];
                    });
                    resolve();
                  });
                }}
              >
                {translations.edit}
              </TzButton>
              <TzPopconfirm
                placement="topRight"
                title={translations.unStandard.str39}
                okText={translations.delete}
                okButtonProps={{ danger: true }}
                cancelButtonProps={{ type: 'text', danger: true }}
                cancelText={translations.confirm_modal_cancel}
                onConfirm={() => {
                  setLdapDataList((pre: any[]) => {
                    let index = findIndex(pre, (o) => {
                      return o.name == row.name;
                    });
                    index != -1 && pre.splice(index, 1);
                    return [...pre];
                  });
                }}
              >
                <TzButton type="text" danger>
                  {translations.delete}
                </TzButton>
              </TzPopconfirm>
            </>
          );
        },
      });
    return col;
  }, [editLdap]);
  let getConfigIdp = useCallback(() => {
    configIdp().subscribe((res) => {
      if (res.error) return;
      let item = res.getItem();
      let o = merge(item, {
        defaultAuthList: item.defaultAuth?.map((ite: { id: any }) => ite.id),
        permissionMapping: item.permissionMapping?.map((ite: { auth: any[] }) => {
          return merge(ite, { auth: ite.auth.map((ie) => ie.id) });
        }),
      });
      setSSOInfo(o);
      setRoleDataList([...o?.permissionMapping]);
      formSSO.setFieldsValue(o);
    });
  }, []);
  let getConfigLogin = useCallback(() => {
    configLogin().subscribe((res) => {
      let item = res.getItem();
      if (res.error) return;
      item['cycleDay'] = item['cycleDay'] || 90;
      item['rateLimitThreshold'] = item['rateLimitThreshold'] || 5;
      setLoginInfo(merge({}, item));
      formLogin.setFieldsValue(merge({}, item));
    });
  }, []);

  const userRole = useMemo(() => {
    let user = getUserInformation();
    return user.role === 'normal';
  }, []);
  let getConfigLdap = useCallback(() => {
    configLdap().subscribe((res) => {
      if (res.error) return;
      let item = res.getItem();
      let { conf = {}, groupList = [] } = item;
      setLdapInfo(conf);
      formLdap.setFieldsValue(conf);
      let items = groupList.map((item: any) => {
        return merge({}, item, {
          modules: item.modules.map((ite: { id: any }) => ite.id),
        });
      });
      setLdapDataList(items);
      setLdapInfoDataList(items);
    });
  }, []);

  let getConfigRadius = useCallback(() => {
    configRadius().subscribe((res) => {
      if (res.error) return;
      let item = res.getItem();
      setRadiusInfo(item);
      formRadius.setFieldsValue(item);
    });
  }, []);
  useEffect(() => {
    getConfigLogin();
    getConfigIdp();
    getConfigLdap();
    getConfigRadius();
  }, []);
  let getRoleLabel = useCallback((idList) => {
    return (
      idList &&
      moduleIDOptions
        .filter((item) => {
          return idList.includes(item.value) || idList.includes(item.value + '');
        })
        .map((item: any) => {
          return item.label;
        })
        .join('，')
    );
  }, []);
  let tableData = useMemo(() => {
    return editSSO ? roleDataList : SSOInfo?.permissionMapping;
  }, [roleDataList, SSOInfo, editSSO]);
  let tableLdapData = useMemo(() => {
    return editLdap ? ldapDataList : ldapInfoDataList;
  }, [ldapDataList, ldapInfoDataList, editLdap]);

  const UploadTypeFile = forwardRef((props: any, ref: any) => {
    const [fileList, setFileList] = useState<any>([]);
    const [dataFile, setDataFile] = useState<any>({});
    const [uploadType, setUploadType] = useState<string>('');
    const fatchUpload = useCallback(
      (dataFile) => {
        const formData = new FormData();
        Object.keys(dataFile).forEach((t: string) => {
          formData.append(t, dataFile[t] as File);
        });
        return ldapUploadFile(formData);
      },
      [fileList, dataFile],
    );
    const propsUpload = useMemo(() => {
      return {
        className: 'upload-container-accounts flex-r mb20',
        multiple: false,
        maxCount: 1,
        progress: {
          strokeColor: {
            '0%': '#108ee9',
            '100%': '#87d068',
          },
          strokeWidth: 3,
          format: (percent: any) => `${parseFloat(percent.toFixed(2))}%`,
        },
        iconRender: () => <i className={'icon iconfont icon-wenjian'}></i>,
        showUploadList: {
          removeIcon: (
            <i
              className={'icon iconfont icon-lajitong'}
              style={{ color: 'rgba(233, 84, 84, 1)', paddingRight: '0px' }}
            ></i>
          ),
        },
        beforeUpload(file: File) {
          let oldKey = '';
          switch (uploadType) {
            case 'f1':
              dataFile['ca'] && (oldKey = dataFile['ca'].uid);
              const newDataFileCA = Object.assign({}, dataFile, {
                ca: file,
              });
              setDataFile(newDataFileCA);
              break;
            case 'f2':
              dataFile['clientCert'] && (oldKey = dataFile['clientCert'].uid);
              const newDataFileCert = Object.assign({}, dataFile, {
                clientCert: file,
              });
              setDataFile(newDataFileCert);

              break;
            case 'f3':
              dataFile['clientKey'] && (oldKey = dataFile['clientKey'].uid);
              const newDataFileKey = Object.assign({}, dataFile, {
                clientKey: file,
              });
              setDataFile(newDataFileKey);
              break;
          }
          const newFileList = fileList.filter((t: any) => t.uid !== oldKey && oldKey !== '');
          setFileList((pre: any) => {
            return [...newFileList, file];
          });
          return false;
        },
        onRemove(file: UploadFile<any>): boolean {
          setFileList((pre: any) => {
            const index = pre.findIndex((value: File) => value === file.originFileObj);
            pre.splice(index, 1);
            return pre;
          });
          return true;
        },
      };
    }, [uploadType, dataFile]);
    useImperativeHandle(ref, () => {
      return {
        fatchUpload: () => {
          return fatchUpload(dataFile);
        },
      };
    }, [dataFile]);
    return (
      <div className="upload-case">
        <TzUpload {...propsUpload}>
          <TzButton className={'mr8'} icon={<FileAddOutlined />} onClick={() => setUploadType('f1')}>
            {translations.superAdmin_loginLdapConfig_CA}
          </TzButton>
        </TzUpload>
        <TzUpload {...propsUpload}>
          <TzButton className={'mr8'} icon={<FileAddOutlined />} onClick={() => setUploadType('f2')}>
            {translations.superAdmin_loginLdapConfig_clientCert}
          </TzButton>
        </TzUpload>
        <TzUpload {...propsUpload}>
          <TzButton className={'mr8'} icon={<FileAddOutlined />} onClick={() => setUploadType('f3')}>
            {translations.superAdmin_loginLdapConfig_clientKey}
          </TzButton>
        </TzUpload>
      </div>
    );
  });

  let localLang = getCurrentLanguage();
  let cycleChangePwd = Form.useWatch('cycleChangePwd', formLogin);
  let rateLimitEnable = Form.useWatch('rateLimitEnable', formLogin);
  const pwdLevelOptions = useMemo(() => {
    return cloneDeep(PWD_LEVEL)
      .reverse()
      .map((item) => ({
        ...item,
        label:
          localLang === 'zh' ? `${item.label}${translations.and_above}` : `${translations.and_above} ${item.label}`,
      }));
  }, []);
  const connType = useMemo(() => {
    return [
      {
        label: 'NON-TLS',
        value: 'NON-TLS',
        disabled: false,
      },
      {
        label: 'TLS',
        value: 'TLS',
        disabled: false,
      },
      {
        label: 'StartTLS',
        value: 'StartTLS',
        disabled: false,
      },
    ];
  }, []);

  return (
    <div className={'login-config mlr32 mt4'}>
      <TzCard
        key={+editLogin}
        title={
          <>
            {translations.loginConfig}
            <span className={'f-r'}>
              {editLogin ? (
                <>
                  <TzButton
                    size={'small'}
                    type={'primary'}
                    onClick={() => {
                      formLogin?.validateFields().then((value: any) => {
                        putConfigLogin(value).subscribe((res) => {
                          if (res.error) {
                            return;
                          }
                          setEditLogin(false);
                          getConfigLogin();
                        });
                      });
                    }}
                  >
                    {translations.save}
                  </TzButton>
                  <TzButton
                    size={'small'}
                    className={'ml8'}
                    onClick={() => {
                      formLogin.resetFields();
                      setEditLogin(false);
                    }}
                  >
                    {translations.cancel}
                  </TzButton>
                </>
              ) : (
                <TzButton
                  size={'small'}
                  onClick={() => {
                    setEditLogin(true);
                  }}
                  disabled={userRole}
                >
                  {translations.edit}
                </TzButton>
              )}
            </span>
          </>
        }
        bodyStyle={{ padding: editLogin ? '0 24px 20px 24px' : '0 16px 20px 24px' }}
      >
        <TzForm form={formLogin} initialValues={loginInfo}>
          <div className={'config-item'}>
            <p className={'flex-r-c'} style={{ justifyContent: 'space-between' }}>
              {translations.unStandard.str157}
              {editLogin ? (
                <TzFormItem noStyle name="firstLoginChangePwd" valuePropName="checked">
                  <TzSwitch
                    checkedChildren={translations.confirm_modal_isopen}
                    unCheckedChildren={translations.confirm_modal_isclose}
                  />
                </TzFormItem>
              ) : (
                <RenderTag type={loginInfo?.firstLoginChangePwd + ''} />
              )}
            </p>
            <p className={'mt4 tips'}>{translations.unStandard.str158}</p>
          </div>
          <div className={'config-item'}>
            <p className={'flex-r-c'} style={{ justifyContent: 'space-between' }}>
              {translations.unStandard.str159}
              {editLogin ? (
                <TzFormItem noStyle name="resetLoginChangePwd" valuePropName="checked">
                  <TzSwitch
                    checkedChildren={translations.confirm_modal_isopen}
                    unCheckedChildren={translations.confirm_modal_isclose}
                  />
                </TzFormItem>
              ) : (
                <RenderTag type={loginInfo?.resetLoginChangePwd + ''} />
              )}
            </p>
            <p className={'mt4  tips'}>{translations.unStandard.str160}</p>
          </div>
          <div className={'config-item'}>
            <p className={'flex-r-c'} style={{ justifyContent: 'space-between' }}>
              {translations.unStandard.str161}
              <TzFormItem noStyle name="cycleChangePwd" valuePropName="checked" hidden={!editLogin}>
                <TzSwitch
                  checkedChildren={translations.confirm_modal_isopen}
                  unCheckedChildren={translations.confirm_modal_isclose}
                />
              </TzFormItem>
              {editLogin ? null : <RenderTag type={loginInfo?.cycleChangePwd + ''} />}
            </p>
            <p className={'mt4  tips'}>{translations.unStandard.str162}</p>
          </div>
          {cycleChangePwd ? (
            <div className={'config-item'}>
              <p className={'flex-r-c'} style={{ justifyContent: 'space-between' }}>
                {translations.unStandard.str163}
                {editLogin ? (
                  <MyFormItem
                    noStyle
                    name="cycleDay"
                    render={(children) => (
                      <div className={'my-form-item-children'}>
                        {children}
                        <span style={{ paddingRight: '11px' }}>{translations.day}</span>
                      </div>
                    )}
                  >
                    <TzInputNumber
                      style={{ width: '115px' }}
                      parser={(value: any) => parseInt(value) || 90}
                      bordered={false}
                      min={1}
                      max={9999}
                      controls={false}
                      defaultValue={90}
                    />
                  </MyFormItem>
                ) : (
                  <span className={'f-r mr16'}>
                    {' '}
                    {loginInfo?.cycleDay}&nbsp;{translations.day}
                  </span>
                )}
              </p>
              <p className={'mt4  tips'}>{translations.unStandard.str164}</p>
            </div>
          ) : null}
          <div className={'config-item'} style={{ marginBottom: 0 }}>
            <p className={'flex-r-c'} style={{ justifyContent: 'space-between' }}>
              {translations.unStandard.str165}
              <TzFormItem noStyle name="rateLimitEnable" valuePropName="checked" hidden={!editLogin}>
                <TzSwitch
                  checkedChildren={translations.confirm_modal_isopen}
                  unCheckedChildren={translations.confirm_modal_isclose}
                />
              </TzFormItem>
              {editLogin ? null : <RenderTag type={loginInfo?.rateLimitEnable + ''} />}
            </p>
            <p className={'mt4  tips'}>{translations.unStandard.str166}</p>
          </div>
          {rateLimitEnable ? (
            <div className={'config-item'} style={{ marginBottom: '0', marginTop: 12 }}>
              <p className={'flex-r-c'} style={{ justifyContent: 'space-between' }}>
                {translations.unStandard.str167}
                {editLogin ? (
                  <MyFormItem
                    noStyle
                    name="rateLimitThreshold"
                    render={(children) => (
                      <div className={'my-form-item-children'}>
                        {children}
                        <span style={{ paddingRight: '11px' }}>{translations.superAdmin_times}</span>
                      </div>
                    )}
                  >
                    <TzInputNumber
                      style={{ width: '115px' }}
                      bordered={false}
                      parser={(value: any) => parseInt(value) || 5}
                      min={1}
                      max={9999}
                      controls={false}
                      defaultValue={1}
                    />
                  </MyFormItem>
                ) : (
                  <span className={'f-r mr16'}>
                    {loginInfo?.rateLimitThreshold}&nbsp;{translations.superAdmin_times}
                  </span>
                )}
              </p>
              <p className={'mt4  tips'}>{translations.unStandard.str168}</p>
            </div>
          ) : null}
          <div className={'config-item'} style={{ marginBottom: '0', marginTop: 12 }}>
            <p className={'flex-r-c'} style={{ justifyContent: 'space-between' }}>
              {translations.unStandard.configPwd}
              {editLogin ? (
                <TzFormItem noStyle name="PwdSecurityLevel">
                  <TzSelect style={{ width: localLang === 'zh' ? '141px' : '167px' }} options={pwdLevelOptions} />
                </TzFormItem>
              ) : (
                <span className={'f-r mr16'}>
                  {!loginInfo?.PwdSecurityLevel
                    ? '-'
                    : localLang === 'zh'
                      ? getPwdLevelLabel(loginInfo?.PwdSecurityLevel) + translations.and_above
                      : translations.and_above + getPwdLevelLabel(loginInfo?.PwdSecurityLevel)}
                </span>
              )}
            </p>
            <p className={'mt4  tips'}>{translations.unStandard.configPwdTip}</p>
          </div>
          <div className={'config-item'} style={{ marginBottom: 0, marginTop: 12 }}>
            <p className={'flex-r-c'} style={{ justifyContent: 'space-between' }}>
              {translations.unStandard.configMFA}
              <TzFormItem noStyle name="mfaVerityLogin" valuePropName="checked" hidden={!editLogin}>
                <TzSwitch
                  checkedChildren={translations.confirm_modal_isopen}
                  unCheckedChildren={translations.confirm_modal_isclose}
                />
              </TzFormItem>
              {editLogin ? null : <RenderTag type={loginInfo?.mfaVerityLogin + ''} />}
            </p>
            <p className={'mt4  tips'}>{translations.unStandard.configMFATip}</p>
          </div>
          <div className={'config-item'} style={{ marginBottom: '0', marginTop: 12 }}>
            <p className={'flex-r-c'} style={{ justifyContent: 'space-between' }}>
              {translations.unStandard.configIpBlackList}
            </p>
            <p className={'mt4 mb4 tips'}>{translations.unStandard.configIpBlackListTip}</p>

            {editLogin ? (
              <TzFormItem style={{ marginBottom: 0 }} name="iPBlackList">
                <TzSelectTag placeholder={translations.unStandard.balckIpTips} style={{ width: '100%' }} />
              </TzFormItem>
            ) : (
              <div style={{ marginBottom: '-8px' }}>
                {loginInfo?.iPBlackList?.map((v: string) => <TzTag className="mb8">{v}</TzTag>) || (
                  <span className="mb8">-</span>
                )}
              </div>
            )}
          </div>
        </TzForm>
      </TzCard>
      <TzCard
        className={'mt20'}
        headStyle={{ lineHeight: '28px' }}
        title={
          <>
            {translations.SSO}
            {!editSSO && <RenderTag type={SSOInfo?.enabled + ''} className={'ml12'} />}
            <span className={'f-r'}>
              {editSSO ? (
                <>
                  <TzButton
                    size={'small'}
                    type={'primary'}
                    onClick={() => {
                      formSSO?.validateFields().then((value: any) => {
                        let newValue = merge(value, {
                          defaultAuth: value.defaultAuthList.map((item: any) => {
                            return { id: item };
                          }),
                        });
                        putConfigIdp(newValue).subscribe((res) => {
                          if (res.error) {
                            return;
                          }
                          setEditSSO(false);
                          getConfigIdp();
                        });
                      });
                    }}
                  >
                    {translations.save}
                  </TzButton>
                  <TzButton
                    size={'small'}
                    className={'ml8'}
                    onClick={() => {
                      // TzConfirm({
                      //   title: '',
                      //   content: translations.scanner_report_editPrompt,
                      //   okText: translations.confirm_modal_sure,
                      //   cancelText: translations.breadcrumb_back,
                      //   onOk() {
                      setEditSSO(false);
                      //   },
                      // });
                    }}
                  >
                    {translations.cancel}
                  </TzButton>
                </>
              ) : (
                <TzButton
                  size={'small'}
                  onClick={() => {
                    setRoleDataList([...SSOInfo?.permissionMapping]);
                    setEditSSO(true);
                  }}
                  disabled={userRole}
                >
                  {translations.edit}
                </TzButton>
              )}
            </span>
          </>
        }
        bodyStyle={{ padding: 0 }}
      >
        <TzForm form={formSSO}>
          {editSSO ? (
            <>
              <p className={'mb12 plr24'}>
                <p className={'mb4'}>{translations.functionSwitch}:</p>
                <TzFormItem noStyle name="enabled" valuePropName="checked">
                  <TzSwitch
                    checkedChildren={translations.confirm_modal_isopen}
                    unCheckedChildren={translations.confirm_modal_isclose}
                  />
                </TzFormItem>
              </p>
            </>
          ) : null}
          <div
            className={'config-item config-SSO'}
            style={{ marginBottom: '12px', borderTop: 0, padding: '8px 24px 0 24px' }}
          >
            <p className={'flex-r-c'} style={{ justifyContent: 'space-between' }}>
              {translations.unStandard.str169}
              {editSSO ? (
                <TzFormItem noStyle name="defaultAuthList">
                  <TzSelect
                    mode={'multiple'}
                    placeholder={translations.unStandard.str192}
                    style={{ width: '340px' }}
                    options={moduleIDOptions}
                  />
                </TzFormItem>
              ) : (
                <span className={'f-r'}>{getRoleLabel(SSOInfo?.defaultAuth.map((it: { id: any }) => it.id))}</span>
              )}
            </p>
            <p className={'mt4 mb12  tips'}>{translations.unStandard.str170}</p>
          </div>
          {editSSO ? (
            <div className="plr24">
              <TzFormItem name="permissionMapping" hidden></TzFormItem>
              <TzRow gutter={48}>
                <TzCol span={24}>
                  <TzFormItem name="discoveryEndpoint" label={translations.server_address}>
                    <TzInput placeholder={translations.unStandard.str172} />
                  </TzFormItem>
                </TzCol>
                <TzCol span={24}>
                  <TzFormItem name="clientId" label={'ID'}>
                    <TzInput placeholder={translations.unStandard.str173} />
                  </TzFormItem>
                </TzCol>
                <TzCol span={24}>
                  <TzFormItem name="clientSecret" label={'secret'} style={{ marginBottom: '12px' }}>
                    <TzInput placeholder={translations.unStandard.str174} />
                  </TzFormItem>
                </TzCol>
              </TzRow>
            </div>
          ) : (
            <ArtTemplateDataInfo className={'mt12'} data={dataSSOInfoList} span={1} />
          )}
          <div className="plr24">
            <p className={'config-title mb10'}>{translations.unStandard.str171}</p>
            {editSSO ? (
              <div className="mb20">
                <TzTable
                  dataSource={tableData}
                  className={'nohoverTable'}
                  scroll={{ y: $('body').width() >= 1440 ? 310 : 290 }}
                  locale={{ emptyText: <></> }}
                  columns={columns}
                  pagination={false}
                />
                <AddInfoBtn
                  title={translations.newAdd}
                  className={'mt16'}
                  onClick={async () => {
                    showLoginRoleModal(
                      {
                        name: null,
                        role: null,
                        auth: null,
                      },
                      (value: any, resolve: any, reject: any) => {
                        setRoleDataList((pre: any[]) => {
                          pre.unshift(value);
                          return [...pre];
                        });
                        resolve();
                      },
                    );
                  }}
                />
              </div>
            ) : (
              <TzTable
                dataSource={tableData}
                className={'nohoverTable'}
                scroll={{ y: 310 }}
                columns={columns}
                pagination={{ defaultPageSize: 5 }}
              />
            )}
          </div>
        </TzForm>
      </TzCard>
      <TzCard
        className={'mt20'}
        title={
          <>
            {translations.superAdmin_loginLdapConfig_ldagConfig}
            {!editLdap && <RenderTag type={ldapInfo?.enable + ''} className={'ml12'} />}
            <span className={'f-r'}>
              {editLdap ? (
                <>
                  <TzButton
                    size={'small'}
                    type={'primary'}
                    onClick={() => {
                      formLdap?.validateFields().then((value: any) => {
                        postConfigLdap({ conf: value, groupList: ldapDataList }).subscribe((res) => {
                          if (res.error) {
                            return;
                          }
                          setEditLdap(false);
                          getConfigLdap();
                        });
                      });
                    }}
                  >
                    {translations.save}
                  </TzButton>
                  <TzButton
                    size={'small'}
                    className={'ml8'}
                    onClick={() => {
                      formLdap.resetFields();
                      setEditLdap(false);
                    }}
                  >
                    {translations.cancel}
                  </TzButton>
                </>
              ) : (
                <>
                  <TzButton
                    className="mr8"
                    size={'small'}
                    onClick={() => {
                      let fileUploadInstance: any;
                      TzConfirm({
                        width: '560px',
                        title: translations.superAdmin_loginLdapConfig_uploadFile,
                        okText: translations.upload,
                        content: (
                          <UploadTypeFile
                            ref={(instance) => {
                              fileUploadInstance = instance;
                            }}
                          />
                        ),
                        onOk() {
                          return new Promise((resolve, reject) => {
                            fileUploadInstance.fatchUpload().subscribe((res: any) => {
                              if (res.error) {
                                reject();
                              } else {
                                showSuccessMessage(translations.uploaded_successfully);
                                resolve(res);
                              }
                            });
                          });
                        },
                      });
                    }}
                  >
                    {translations.superAdmin_loginLdapConfig_uploadFile}
                  </TzButton>
                  <TzButton
                    size={'small'}
                    onClick={() => {
                      setEditLdap(true);
                    }}
                    disabled={userRole}
                  >
                    {translations.edit}
                  </TzButton>
                </>
              )}
            </span>
          </>
        }
        bodyStyle={{ padding: '4px 0 0' }}
      >
        {editLdap ? (
          <TzForm className="plr24 pb20" form={formLdap}>
            <TzFormItem name="enable" label={translations.functionSwitch} valuePropName="checked">
              <TzSwitch
                checkedChildren={translations.confirm_modal_isopen}
                unCheckedChildren={translations.confirm_modal_isclose}
              />
            </TzFormItem>
            <TzRow gutter={[48, 0]}>
              <TzCol span={12}>
                <TzFormItem name="addr" label={translations.server_address}>
                  <TzInput placeholder={translations.unStandard.str172} />
                </TzFormItem>
              </TzCol>
              <TzCol span={12}>
                <TzFormItem name="port" label={translations.server_port}>
                  <TzInputNumber
                    placeholder={translations.unStandard.str181}
                    style={{ width: '100%' }}
                    controls={false}
                  />
                </TzFormItem>
              </TzCol>
              <TzCol span={12}>
                <TzFormItem name="baseDN" label={translations.superAdmin_loginLdapConfig_root}>
                  <TzInput placeholder={translations.unStandard.str182} />
                </TzFormItem>
              </TzCol>
              <TzCol span={12}>
                <TzFormItem name="bindDN" label={translations.license_userName}>
                  <TzInput placeholder={translations.unStandard.str183} />
                </TzFormItem>
              </TzCol>
              <TzCol span={12}>
                <TzFormItem name="bindPassword" label={translations.user_password}>
                  <TzInput placeholder={translations.unStandard.str184} />
                </TzFormItem>
              </TzCol>
              <TzCol span={12}>
                <TzFormItem name="userFilter" label={translations.query_user_filter}>
                  <TzInput placeholder={translations.unStandard.str185} />
                </TzFormItem>
              </TzCol>
              <TzCol span={12}>
                <TzFormItem name="groupField" label={translations.superAdmin_loginLdapConfig_groupField}>
                  <TzInput placeholder={translations.unStandard.str186} />
                </TzFormItem>
              </TzCol>
              <TzCol span={12}>
                <TzFormItem name="connType" label={translations.superAdmin_loginLdapConfig_connType}>
                  <TzSelectNormal
                    placeholder={`${translations.superAdmin_loginLdapConfig_selectPlaPrefix}${translations.superAdmin_loginLdapConfig_connType}`}
                    options={connType}
                  />
                </TzFormItem>
              </TzCol>
              <TzCol span={24}>
                <TzFormItem
                  name="serverNameOverride"
                  label={translations.superAdmin_loginLdapConfig_serverName}
                  style={{ marginBottom: '12px' }}
                >
                  <TzInput placeholder={translations.unStandard.str188} />
                </TzFormItem>
              </TzCol>
            </TzRow>
          </TzForm>
        ) : (
          <ArtTemplateDataInfo data={ldapInfoList} span={2} />
        )}
        <div className="plr24">
          <p className={'config-title mb4'}>{translations.superAdmin_loginLdapConfig_ldapGroup}</p>
          {editLdap ? (
            <div className="mb20">
              <TzTable
                className={'nohoverTable'}
                dataSource={tableLdapData}
                scroll={{ y: $('body').width() >= 1440 ? 310 : 290 }}
                locale={{ emptyText: <></> }}
                columns={columnsLdap}
                pagination={false}
              />
              <AddInfoBtn
                title={translations.newAdd}
                className={'mt16'}
                onClick={async () => {
                  showLdapModal(
                    {
                      name: null,
                      role: null,
                      modules: null,
                    },
                    (value: any, resolve: any, reject: any) => {
                      setLdapDataList((pre: any[]) => {
                        pre.unshift(value);
                        return [...pre];
                      });
                      resolve();
                    },
                  );
                }}
              />
            </div>
          ) : (
            <TzTable
              className={'nohoverTable'}
              dataSource={tableLdapData}
              scroll={{ y: 310 }}
              columns={columnsLdap}
              pagination={{ defaultPageSize: 5 }}
            />
          )}
        </div>
      </TzCard>
      <TzCard
        className={'mt20 mb40'}
        title={
          <>
            {translations.radius_config}
            {!editRadius && <RenderTag type={radiusInfo?.enable + ''} className={'ml12'} />}
            <span className={'f-r'}>
              {editRadius ? (
                <>
                  <TzButton
                    size={'small'}
                    type={'primary'}
                    onClick={() => {
                      formRadius?.validateFields().then((value: any) => {
                        postConfigRadius(merge(value, { port: Number(value.port) })).subscribe((res) => {
                          if (res.error) {
                            return;
                          }
                          setEditRadius(false);
                          getConfigRadius();
                        });
                      });
                    }}
                  >
                    {translations.save}
                  </TzButton>
                  <TzButton
                    size={'small'}
                    className={'ml8'}
                    onClick={() => {
                      setEditRadius(false);
                    }}
                  >
                    {translations.cancel}
                  </TzButton>
                </>
              ) : (
                <TzButton
                  size={'small'}
                  onClick={() => {
                    setEditRadius(true);
                  }}
                  disabled={userRole}
                >
                  {translations.edit}
                </TzButton>
              )}
            </span>
          </>
        }
        bodyStyle={{ padding: '4px 0 0' }}
      >
        {editRadius ? (
          <TzForm className="plr24 pb20" form={formRadius}>
            <TzFormItem name="enable" label={translations.functionSwitch} valuePropName="checked">
              <TzSwitch
                checkedChildren={translations.confirm_modal_isopen}
                unCheckedChildren={translations.confirm_modal_isclose}
              />
            </TzFormItem>
            <TzRow gutter={[48, 0]}>
              <TzCol span={12}>
                <TzFormItem name="addr" label={translations.server_address}>
                  <TzInput placeholder={translations.unStandard.str172} />
                </TzFormItem>
              </TzCol>
              <TzCol span={12}>
                <TzFormItem name="port" label={translations.server_port}>
                  <TzInput placeholder={translations.unStandard.str181} />
                </TzFormItem>
              </TzCol>
              <TzCol span={12}>
                <TzFormItem name="network" label={translations.calico_protocol}>
                  <TzSelect placeholder={translations.unStandard.str189} options={protocolList} />
                </TzFormItem>
              </TzCol>
              <TzCol span={12}>
                <TzFormItem name="secret" label={translations.superAdmin_loginLdapConfig_sevret}>
                  <TzInput placeholder={translations.unStandard.str190} />
                </TzFormItem>
              </TzCol>
            </TzRow>
          </TzForm>
        ) : (
          <ArtTemplateDataInfo data={radiusInfoList} span={2} />
        )}
      </TzCard>
    </div>
  );
};

export default LoginConfig;
