import React, { useState } from 'react';
import { TzModal } from '../../../components/tz-modal';
import { SuperUser } from '../../../definitions';
import { Form } from 'antd';
import { translations } from '../../../translations/translations';
import { TzForm, TzFormItem } from '../../../components/tz-form';
import { TzInput } from '../../../components/tz-input';
import { TzRadioGroup } from '../../../components/tz-radio';
import { ROLES } from '../../../access';
import { TzCheckboxGroup } from '../../../components/tz-checkbox';
import { AddSuperAdmin, editSuperAdmin } from '../../../services/DataService';
import { TzMessageSuccess } from '../../../components/tz-mesage';
import { getUserInformation } from '../../../services/AccountService';
import { useMemoizedFn } from 'ahooks';
import { useWatch } from 'antd/lib/form/Form';
import './index.scss';
import { trim } from 'lodash';
export type TEditUser = {
  open: boolean;
  onOkCall: (values: any) => void;
  onCancel?: () => void;
  rowData?: Partial<SuperUser>;
};
export const ROLES_OPT = [
  {
    value: ROLES.SUPER_ADMIN,
    label: translations.super_admin,
    authName: translations.allModule,
    opr: translations.commonpro_readWrite,
    hidden: true,
  },
  {
    value: ROLES.PLATFORM_ADMIN,
    label: translations.platformAdmin,
    authName: translations.platformManagement,
    opr: translations.commonpro_readWrite,
  },
  {
    value: ROLES.ADMIN,
    label: translations.administrator,
    opr: translations.commonpro_readWrite,
  },
  {
    value: ROLES.AUDIT,
    label: translations.auditor,
    authName: translations.audit,
    opr: translations.commonpro_readWrite,
  },
  {
    value: ROLES.NORMAL,
    label: translations.platformAPIData_Username,
    opr: translations.commonpro_readOnly,
  },
];
export const MODULES_OPT = [
  { value: '2', label: translations.platform },
  { value: '3', label: translations.container_security },
  { value: '4', label: translations.calico_root },
];
const EditUser = ({ open, onCancel, onOkCall, rowData }: TEditUser) => {
  const [formRef] = Form.useForm();
  const [confirmLoading, setConfirmLoading] = useState<boolean>();
  const { userName, role: rowRole } = rowData || {};
  const getOprAuth = useMemoizedFn(() => {
    const { role } = getUserInformation();
    if (rowRole === ROLES.SUPER_ADMIN) {
      return false;
    }
    return [ROLES.SUPER_ADMIN, ROLES.PLATFORM_ADMIN].includes(role);
  });

  const role = useWatch(['role'], formRef);

  return (
    <TzModal
      title={userName ? translations.superAdmin_editUser : translations.superAdmin_addUser}
      wrapClassName="edit-user-wrap"
      onCancel={onCancel}
      visible={open}
      okText={userName ? translations.save : translations.newAdd}
      cancelText={translations.confirm_modal_cancel}
      destroyOnClose={true}
      maskClosable={false}
      confirmLoading={confirmLoading}
      onOk={() => {
        formRef.validateFields().then((res) => {
          setConfirmLoading(true);
          const api = userName ? editSuperAdmin : AddSuperAdmin;
          api({
            ...res,
            username: userName,
          })
            .subscribe((res) => {
              if (res.error) {
                return;
              }
              TzMessageSuccess(translations[userName ? 'activeDefense_updateSuccessTip' : 'activeDefense_successTip']);
              onOkCall(res);
            })
            .add(() => setConfirmLoading(false));
        });
      }}
    >
      <TzForm
        layout="vertical"
        form={formRef}
        initialValues={{
          ...rowData,
          moduleID: rowData?.module_id,
        }}
      >
        <TzFormItem
          rules={[
            {
              required: true,
              message: translations.unStandard.requireTip(translations.license_userName),
            },
          ]}
          label={translations.license_userName}
          name="account"
          required
        >
          <TzInput placeholder={translations.unStandard.requireTip(translations.license_userName)} />
        </TzFormItem>
        <TzFormItem
          label={translations.mobile}
          name="mobile"
          rules={[
            {
              validator: (rule, value: string[]) => {
                return new Promise((resolve, reject) => {
                  if (!trim(value)) {
                    resolve(value);
                  }
                  let pattern = /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/;
                  let f = pattern.test(value);
                  if (f) {
                    resolve(value);
                  } else {
                    reject(translations.please_enter_correct_phone_number);
                  }
                });
              },
            },
          ]}
        >
          <TzInput placeholder={translations.unStandard.requireTip(translations.mobile)} />
        </TzFormItem>
        {getOprAuth() && (
          <>
            <TzFormItem
              rules={[
                {
                  required: true,
                  message: translations.unStandard.requireSelectTip(translations.role),
                },
              ]}
              label={translations.role}
              name="role"
              tooltip={translations.unStandard.editRoleTips}
            >
              <TzRadioGroup disabled={!!userName} options={ROLES_OPT.filter((v) => !v.hidden)} />
            </TzFormItem>
            {[ROLES.ADMIN, ROLES.NORMAL].includes(role) && (
              <TzFormItem
                label={translations.superAdmin_loginLdapConfig_ldapItemModules}
                name="moduleID"
                rules={[
                  {
                    required: true,
                    message: translations.unStandard.requireSelectTip(
                      translations.superAdmin_loginLdapConfig_ldapItemModules,
                    ),
                  },
                ]}
              >
                <TzCheckboxGroup options={MODULES_OPT} />
              </TzFormItem>
            )}
          </>
        )}
      </TzForm>
    </TzModal>
  );
};
export default EditUser;
