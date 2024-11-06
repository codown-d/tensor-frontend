import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { translations } from '../../../../translations/translations';
import { TzForm, TzFormItem } from '../../../../components/tz-form';
import { TzInputPassword } from '../../../../components/tz-input-password';
import Form from 'antd/lib/form';
import './index.scss';
import PwdStrengthBar from '../PwdStrengthBar';
import { useDebounce, useUpdateEffect } from 'ahooks';
import { calculatePasswordStrength } from '../../util';
import classNames from 'classnames';
import { copyText } from '../../../../helpers/until';
import { TzTooltip } from '../../../../components/tz-tooltip';
import { TzInput } from '../../../../components/tz-input';
import PasswordControll from './PasswordControll';

export type TResetPwd = {
  type?: 'resetPwd' | 'resetPwdByFirst' | 'resetPwdByHash'; // 默认为用户修改密码resetPwd；resetPwdByFirst: 登陆页第一次设置密码；resetPwdByHash：忘记密码页重置密码；
};
export type TFormValues = {
  pwd: string;
};
const ResetPwd = forwardRef(({ type = 'resetPwd' }: TResetPwd, ref: any) => {
  const [form] = Form.useForm();
  const [strength, setStrength] = useState<number>(-1);
  const [pwd, setPwd] = useState<string>();
  const [rePwd, setRePwd] = useState<string>();
  const [copyTxtMouseIn, setCopyTxtMouseIn] = useState<boolean>(false);
  const debouncedValue = useDebounce(pwd, { wait: 500 });
  useImperativeHandle(
    ref,
    () => {
      return {
        getFormData: () => form.validateFields(),
      };
    },
    [],
  );
  useEffect(() => {
    const _val = debouncedValue?.trim();
    form.setFieldValue('pwd', _val);
    if (!_val) {
      setStrength(-1);
      return;
    }
    const score = calculatePasswordStrength(_val);
    if (score < 50) {
      setStrength(0);
    } else if (score < 60) {
      setStrength(1);
    } else if (score < 80) {
      setStrength(2);
    } else {
      setStrength(3);
    }
  }, [debouncedValue]);

  const pwdValue = Form.useWatch('pwd', form);
  const rePwdValue = Form.useWatch('pwdagain', form);

  useUpdateEffect(() => {
    form.validateFields(['pwd']);
  }, [pwdValue]);
  useUpdateEffect(() => {
    form.validateFields(['pwdagain']);
  }, [rePwdValue]);

  return (
    <TzForm form={form} className="reset-pwd">
      {type === 'resetPwd' && (
        <TzFormItem
          name="oldpwd"
          label={translations.superAdmin_resetPwd_oldpwd}
          rules={[
            {
              required: true,
              message: translations.unStandard.requireTip(translations.superAdmin_resetPwd_oldpwd),
            },
          ]}
        >
          <TzInputPassword
            allowClear
            placeholder={translations.unStandard.requireTip(
              translations.superAdmin_resetPwd_oldpwd,
            )}
          />
        </TzFormItem>
      )}
      {type === 'resetPwdByFirst' && (
        <TzFormItem label={translations.license_userName}>
          <p>
            <p
              className="hover copy-row"
              onClick={() => copyText('SeedAdmin')}
              onMouseEnter={() => setCopyTxtMouseIn(true)}
              onMouseLeave={() => setCopyTxtMouseIn(false)}
            >
              {<TzTooltip title={translations.copy}>SeedAdmin</TzTooltip>}
              {copyTxtMouseIn && (
                <i
                  style={{ color: '#2177d1' }}
                  className={classNames('icon iconfont icon-fuzhi hover admin')}
                />
              )}
            </p>
          </p>
        </TzFormItem>
      )}
      <TzFormItem
        required
        label={
          <div className="pwd-tip">
            <span>{translations.superAdmin_resetPwd_newpwd}</span>
            <PwdStrengthBar strength={strength} />
          </div>
        }
        className="mb4"
      >
        <PasswordControll onChange={setPwd} value={pwd} />
        <TzFormItem
          name="pwd"
          rules={[
            {
              required: true,
              whitespace: true,
              message: translations.unStandard.requireTip(translations.superAdmin_resetPwd_newpwd),
            },
          ]}
          extra={translations.unStandard.pwdInputTip}
          className="mb20"
        />
      </TzFormItem>
      <TzFormItem required label={translations.superAdmin_resetPwd_comfirmpwd} className="mb0">
        <PasswordControll
          onChange={(val) => {
            form.setFieldValue('pwdagain', val);
            setRePwd(val);
          }}
          value={rePwd}
        />
        <TzFormItem
          name="pwdagain"
          rules={[
            {
              required: true,
              message: translations.superAdmin_resetPwd_comfirmplaceholder,
            },
            {
              message: translations.passwords_inconsistent,
              validator: (rule, value) => {
                return value === form.getFieldValue('pwd') || !value
                  ? Promise.resolve()
                  : Promise.reject();
              },
            },
          ]}
        />
      </TzFormItem>
    </TzForm>
  );
});
export default ResetPwd;
