import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { translations } from '../../translations/translations';
import './SuperAdminScreen.scss';
import { TzTableServerPage } from '../../components/tz-table';
import { TablePaginationConfig } from 'antd/lib/table';
import {
  adminResetpwd,
  resetMfaSecret,
  superAdminUserList,
  usercenterDelete,
  usercenterEnable,
} from '../../services/DataService';
import { map } from 'rxjs/operators';
import { TzButton } from '../../components/tz-button';
import { TzConfirm, TzSuccess } from '../../components/tz-modal';
import { TzInput } from '../../components/tz-input';
import { isArray, merge } from 'lodash';
// import { useActivate } from 'react-activation';
import { useLocation, useNavigate } from 'react-router-dom';
import { Routes } from '../../Routes';
import { Store } from '../../services/StoreService';
import { getUserInformation } from '../../services/AccountService';
import { TextHoverCopy } from '../AlertCenter/AlertCenterScreen';
import useTzFilter, { FilterContext } from '../../components/ComponentsLibrary/TzFilter/useTzFilter';
import TzFilter from '../../components/ComponentsLibrary/TzFilter';
import TzFilterForm from '../../components/ComponentsLibrary/TzFilterForm';
import { FilterFormParam } from '../../components/ComponentsLibrary/TzFilterForm/filterInterface';
import { TzMessageSuccess } from '../../components/tz-mesage';
import { copyText } from '../../helpers/until';
import { ROLES } from '../../access';
import { TzDropdown } from '../../components/tz-dropdown';
import { useMemoizedFn } from 'ahooks';
import EditUser, { MODULES_OPT, ROLES_OPT, TEditUser } from './EditUser';
import { SuperUser } from '../../definitions';
import { Space } from 'antd';
import { TzInputPassword } from '../../components/tz-input-password';
import { TzForm } from '../../components/tz-form';
export const moduleIDOptions = [
  {
    label: translations.platform,
    value: 2,
  },
  {
    label: translations.container_security,
    value: 3,
  },
  {
    label: translations.calico_root,
    value: 4,
  },
];
let obj: any = {
  '1': translations.superAdmin_normal,
  '2': translations.pending_activation,
  '3': translations.superAdmin_locked,
  '4': translations.deactivate,
};
let statusOp = Object.keys(obj).map((item) => {
  return {
    label: obj[item],
    value: item,
  };
});

export let userRoleOp = [
  {
    label: translations.administrator,
    value: 'admin',
  },
  {
    label: translations.platformAPIData_Username,
    value: 'normal',
  },
];
type TAutyType = 'edit' | 'delete' | 'mfa' | 'enable' | 'resetPwd';
const getOprAuth = (type: TAutyType, row?: SuperUser) => {
  const { role, username } = getUserInformation();
  const { userName, role: rowRole, status } = row || {};
  switch (type) {
    case 'edit':
      if (![ROLES.SUPER_ADMIN, ROLES.PLATFORM_ADMIN].includes(role)) {
        return false;
      }
      if (role === ROLES.SUPER_ADMIN) {
        return rowRole === ROLES.SUPER_ADMIN ? userName === username : true;
      }
      if (role === ROLES.PLATFORM_ADMIN) {
        return rowRole !== ROLES.SUPER_ADMIN;
      }
    case 'mfa':
      return [ROLES.SUPER_ADMIN, ROLES.PLATFORM_ADMIN].includes(role);
    case 'enable':
      //20231217 修改起停用权限由平台管理员增加为包含超级管理员
      return [ROLES.PLATFORM_ADMIN, ROLES.SUPER_ADMIN].includes(role);
    case 'delete':
      //后端接口不返回超级管理员此逻辑暂时屏蔽
      //   if (rowRole === ROLES.SUPER_ADMIN) {
      //     return false;
      //   }
      return [ROLES.SUPER_ADMIN, ROLES.PLATFORM_ADMIN].includes(role) && userName !== username;
    case 'resetPwd':
      return status !== 2 && [ROLES.SUPER_ADMIN, ROLES.PLATFORM_ADMIN].includes(role);
    default:
      return false;
  }
};
const SuperAdminScreen = () => {
  const navigate = useNavigate();
  const [dataForm, setDataForm] = useState<any>({});
  const [editData, setEditData] = useState<TEditUser['rowData']>();
  const listComp = useRef<any>(null);
  const [filters, setFilters] = useState<any>();

  const { role, username } = useMemo(() => getUserInformation(), []);

  const handleMenuClick = useMemoizedFn((e: { key: string }, row, callback?: () => void) => {
    switch (e.key) {
      case 'enable':
        usercenterEnable({
          usernames: isArray(row) ? row : [row.userName],
          enable: true,
        }).subscribe((res) => {
          if (res.error) {
            return;
          }
          listComp.current && listComp.current.refresh();
          TzMessageSuccess(translations.unStandard.str203);
          callback?.();
        });
        break;
      case 'unEnable':
        usercenterEnable({
          usernames: isArray(row) ? row : [row.userName],
          enable: false,
        }).subscribe((res) => {
          if (res.error) {
            return;
          }
          listComp.current && listComp.current.refresh();
          TzMessageSuccess(translations.unStandard.str202);
          callback?.();
        });
        break;
      case 'mfa':
      case 'resetPwd':
        let value: unknown;
        let config = {
          width: 560,
          title: e.key === 'mfa' ? translations.resetMfa : translations.resetPwd,
          okText: translations.superAdmin_reset,
          content: (
            <TzForm autoComplete={'off'}>
              <p className={'mb4'}>{translations.authentication}:</p>
              <TzInputPassword
                placeholder={translations.unStandard.str205}
                onChange={(e) => {
                  e.persist();
                  value = e.target.value;
                }}
              />
            </TzForm>
          ),
          onOk() {
            return new Promise((resolve, reject) => {
              if (!value) {
                m.update(
                  merge({}, config, {
                    content: (
                      <TzForm autoComplete={'off'}>
                        <p className={'mb4'}>{translations.authentication}:</p>
                        <TzInputPassword
                          status="error"
                          placeholder={translations.unStandard.str198}
                          onChange={(e) => {
                            e.persist();
                            value = e.target.value;
                          }}
                        />
                      </TzForm>
                    ),
                  }),
                );
                reject();
                return;
              }
              const api = e.key === 'mfa' ? resetMfaSecret : adminResetpwd;
              api({
                username: row.userName, // 需要重置的用户账号​
                password: value,
              } as any).subscribe((res) => {
                listComp.current && listComp.current.refresh();
                if (res.error) {
                  reject();
                } else {
                  let item = res.getItem();
                  resolve(res);
                  TzMessageSuccess(e.key === 'mfa' ? translations.unStandard.resetMFA : translations.unStandard.str204);
                  if (e.key === 'mfa') {
                    return;
                  }

                  TzSuccess({
                    width: 560,
                    title: translations.reset_successful,
                    okText: translations.confirm_modal_close,
                    onOk: () => {
                      copyText(item.password);
                    },
                    content: (
                      <div className="flex-r">
                        {' '}
                        {translations.superAdmin_resetPwd_newpwd}：&nbsp;
                        <TextHoverCopy text={item.password} style={{ width: '70%' }} />{' '}
                      </div>
                    ),
                  });
                }
              });
            });
          },
        };
        let m = TzConfirm(config);
        break;
      default:
        break;
    }
  });
  let columns = useMemo(
    () => [
      {
        title: translations.superAdmin_userName,
        dataIndex: 'account',
        width: '20%',
      },
      {
        title: translations.superAdmin_userRole,
        dataIndex: 'role',
        width: '12%',
        render: (text: string) => {
          if (!text) {
            return '-';
          }
          return ROLES_OPT.find((t) => t.value === text)?.label;
        },
      },
      {
        title: translations.mobile,
        dataIndex: 'mobile',
        width: '12%',
        render: (text: string) => text || '-',
      },
      {
        title: translations.superAdmin_loginLdapConfig_auth,
        dataIndex: 'module_id',
        render: (text: any, row: any, index: number) => {
          if ([ROLES.SUPER_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.AUDIT].includes(row.role)) {
            return ROLES_OPT.find((t) => t.value === row.role)?.authName;
          }
          return text?.map((v: string) => MODULES_OPT.find((t) => t.value === v)?.label).join('，') || '-';
        },
      },
      {
        title: translations.clusterGraphList_authority,
        dataIndex: 'auth',
        width: '8%',
        render: (_: unknown, row: any, index: number) => ROLES_OPT.find((t) => t.value === row.role)?.opr ?? '-',
      },
      {
        title: translations.tensorStart_status,
        dataIndex: 'status',
        width: '8%',
        render: (text: number, row: any, index: number) => {
          return obj[text] || translations.abnormal;
        },
      },
      {
        title: translations.superAdmin_settings,
        width: '170px',
        render: (text: string, row: any, index: number) => {
          if (row.role === ROLES.SUPER_ADMIN && row.userName !== username) {
            return '-';
          }
          return (
            <Space size={12}>
              {getOprAuth('edit', row) && (
                <TzButton type={'text'} key={'edit'} onClick={() => setEditData(row)}>
                  {translations.edit}
                </TzButton>
              )}
              {getOprAuth('delete', row) && (
                <TzButton
                  type={'text'}
                  danger
                  onClick={() => {
                    TzConfirm({
                      content: translations.unStandard.str196(row.account),
                      onOk: () => {
                        usercenterDelete({ usernames: [row.userName] }).subscribe((res) => {
                          if (res.error) {
                            return;
                          }
                          listComp.current && listComp.current.refresh();
                          TzMessageSuccess(translations.imageReject_delete_success_tip);
                        });
                      },
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
              )}

              <TzDropdown
                trigger={['hover', 'click']}
                menu={{
                  items: [
                    {
                      label: translations.enable,
                      key: 'enable',
                    },
                    {
                      label: translations.deactivate,
                      key: 'unEnable',
                      type: 'enable',
                    },
                    {
                      label: translations.resetPwd,
                      key: 'resetPwd',
                    },
                    {
                      label: translations.resetMfa,
                      key: 'mfa',
                    },
                  ].filter(({ type, key }: any) => {
                    const show = getOprAuth(type ?? key, row);
                    if (key === 'enable') {
                      return show && row.status === 4;
                    }
                    if (key === 'unEnable') {
                      return show && row.status === 1;
                    }
                    return show;
                  }),
                  onClick: (e) => handleMenuClick(e, row),
                }}
                overlayClassName={'drop-down-menu'}
                destroyPopupOnHide={true}
                getPopupContainer={(triggerNode) => triggerNode}
              >
                <TzButton className="more-icon" type="text">
                  <i className={'icon iconfont icon-gengduo1 f20 cabb'} />
                </TzButton>
              </TzDropdown>
            </Space>
          );
        },
      },
    ],
    [dataForm],
  );
  const reqFun = useCallback(
    (pagination: TablePaginationConfig) => {
      const { current = 1, pageSize = 10 } = pagination;
      let query = {
        ...(filters || {}),
        offset: (current - 1) * pageSize,
        limit: pageSize,
      };
      return superAdminUserList(query).pipe(
        map((res: any) => {
          let items = res.getItems();
          return {
            data: items,
            total: res.data.totalItems,
          };
        }),
      );
    },
    [filters],
  );

  let setHeader = () => {
    Store.header.next({
      title: translations.account,
      extra: (
        <TzButton
          icon={<i className="icon iconfont icon-jingxiangsaomiao-peizhi f16"></i>}
          onClick={() => {
            navigate(Routes.LoginConfig);
          }}
        >
          {translations.scanner_images_setting}
        </TzButton>
      ),
    });
  };
  const l = useLocation();
  useEffect(() => {
    setHeader();
  }, [l]);
  const imagesScannerScreenFilter: FilterFormParam[] = useMemo(
    () => [
      {
        label: translations.license_userName,
        name: 'keyword',
        type: 'input',
        icon: 'icon-yonghujiaose',
      },
      {
        label: translations.superAdmin_userRole,
        name: 'role',
        type: 'select',
        icon: 'icon-yonghujiaose',
        props: {
          mode: 'multiple',
          options: ROLES_OPT,
        },
      },
      // {
      //   label: translations.superAdmin_loginLdapConfig_auth,
      //   name: 'module_id',
      //   type: 'select',
      //   icon: 'icon-leixing',
      //   props: {
      //     mode: 'multiple',
      //     options: MODULES_OPT,
      //   },
      // },
      {
        label: translations.license_status,
        name: 'status',
        type: 'select',
        icon: 'icon-celveguanli',
        props: {
          mode: 'multiple',
          options: statusOp,
        },
      },
    ],
    [],
  );
  const data = useTzFilter({ initial: imagesScannerScreenFilter });
  const handleChange = useCallback((values: any) => {
    setFilters(values);
  }, []);
  const onEditCancel = useMemoizedFn(() => setEditData(undefined));
  const onOkCall = useMemoizedFn(() => {
    onEditCancel();
    listComp.current.resetPagination();
  });
  let [showPageFooter, setShowPageFooter] = useState(false);
  let [selectedRowKeys, setSelectedRowKeys] = useState<any>([]);

  let handleRowSelection = (selected: boolean, selectedRows: any[]) => {
    setSelectedRowKeys((pre: any) => {
      selectedRows.forEach(({ userName }: any) => {
        if (selected) {
          pre.push(userName);
        } else {
          pre.remove(userName);
        }
      });
      return [...pre];
    });
  };
  const rowSelection = useMemo(() => {
    if (!showPageFooter) return undefined;
    return {
      columnWidth: '32px',
      selectedRowKeys,
      onSelect: (record: any, selected: any, selectedRows: any, nativeEvent: any) => {
        nativeEvent.stopPropagation();
        handleRowSelection(selected, [record]);
      },
      onSelectAll: (selected: any, selectedRows: any, changeRows: any) => {
        handleRowSelection(selected, changeRows);
      },
    };
  }, [showPageFooter, selectedRowKeys]);
  let setFooter = useCallback(() => {
    Store.pageFooter.next(
      showPageFooter ? (
        <div>
          <span className="mr16 ml16">{`${translations.selected} ${selectedRowKeys.length} ${translations.items}`}</span>
          <TzButton
            className={'mr20'}
            disabled={!selectedRowKeys.length}
            onClick={() => {
              handleMenuClick({ key: 'unEnable' }, selectedRowKeys, () => {
                setShowPageFooter(false);
                setSelectedRowKeys([]);
              });
            }}
          >
            {translations.deactivate}
          </TzButton>
          <TzButton
            className={'mr20'}
            disabled={!selectedRowKeys.length}
            onClick={() => {
              handleMenuClick({ key: 'enable' }, selectedRowKeys, () => {
                setShowPageFooter(false);
                setSelectedRowKeys([]);
              });
            }}
          >
            {translations.enable}
          </TzButton>
          {getOprAuth('delete', { role: role } as SuperUser) && (
            <TzButton
              danger
              disabled={!selectedRowKeys.length}
              onClick={() => {
                TzConfirm({
                  content: translations.del_account,
                  onOk: () => {
                    usercenterDelete({ usernames: selectedRowKeys }).subscribe((res) => {
                      if (res.error) {
                        return;
                      }
                      listComp.current && listComp.current.refresh();
                      TzMessageSuccess(translations.imageReject_delete_success_tip);
                      setShowPageFooter(false);
                      setSelectedRowKeys([]);
                    });
                  },
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
          )}
        </div>
      ) : null,
    );
  }, [showPageFooter, selectedRowKeys, l]);
  useEffect(() => {
    setFooter();
  }, [setFooter]);
  return (
    <div className="super_admin_screen mlr32">
      <FilterContext.Provider value={{ ...data }}>
        <div className={'flex-r'} style={{ justifyContent: 'space-between' }}>
          <div>
            <TzButton onClick={() => setEditData({})} type={'primary'}>
              {translations.superAdmin_addUser}
            </TzButton>
            {[ROLES.PLATFORM_ADMIN, ROLES.SUPER_ADMIN].includes(role) ? (
              <TzButton
                className="ml16"
                onClick={() => {
                  setShowPageFooter((pre) => {
                    if (!pre) {
                      setSelectedRowKeys([]);
                    }
                    return !pre;
                  });
                }}
              >
                {showPageFooter ? translations.cancel_batch_operation : translations.batch_operation}
              </TzButton>
            ) : (
              <></>
            )}
          </div>

          <TzFilter />
        </div>
        <TzFilterForm onChange={handleChange} />
      </FilterContext.Provider>
      <TzTableServerPage
        rowSelection={rowSelection}
        ref={listComp}
        className={'nohoverTable mt12'}
        columns={columns}
        rowKey={'userName'}
        reqFun={reqFun}
      />
      {!!editData && <EditUser onCancel={onEditCancel} rowData={editData} open={!!editData} onOkCall={onOkCall} />}
    </div>
  );
};

export default SuperAdminScreen;
