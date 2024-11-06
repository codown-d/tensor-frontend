import React, { PureComponent, useEffect, useState } from 'react';
import './newUser.scss';
import { translations } from '../../../translations/translations';
import classNames from 'classnames';
import './SendEMail.scss';
import { TCaptchaData, WebResponse } from '../../../definitions';
import { createCaptcha, ForgetPwd } from '../../../services/DataService';
import { catchError, tap } from 'rxjs/operators';
import { TzInput } from '../../../components/tz-input';
import { throwError } from 'rxjs';
import { TzForm, TzFormItem } from '../../../components/tz-form';
import { Form } from 'antd';
import { useMemoizedFn } from 'ahooks';
import { TzButton } from '../../../components/tz-button';

interface IProps {
  children?: any;
  toastClose: () => void;
}

interface IState {
  res?: any;
  loading: boolean;
  email: string;
  emailError: boolean | string;
  captchaID: string;
  imgUrl: string;
  code: string;
}
const SendEMail = ({ toastClose }: IProps) => {
  const [form] = Form.useForm();
  const [data, setData] = useState<TCaptchaData>();
  const [loading, setLoading] = useState<boolean>();
  const fetchCodeID = useMemoizedFn(() => {
    createCaptcha()
      .pipe(
        tap((res: any) => {
          if (res.error) {
            return;
          }
          setData(res.getItem());
        }),
      )
      .subscribe();
  });
  const onSubmit = useMemoizedFn((res) => {
    setLoading(true);
    ForgetPwd({
      ...res,
      CaptchaID: data?.captchaID || '',
    })
      .pipe(
        tap((res: WebResponse<any>) => {
          setLoading(false);
          if (res.error) {
            fetchCodeID();
            return;
          }
          toastClose();
        }),
        catchError((error) => {
          setLoading(false);
          fetchCodeID();
          return throwError(error);
        }),
      )
      .subscribe();
  });
  useEffect(fetchCodeID, []);
  return (
    <TzForm form={form} className="forget-pwd-email" onFinish={onSubmit}>
      <TzFormItem
        label={translations.newUser_email}
        name="account"
        rules={[
          {
            required: true,
            whitespace: true,
            message: translations.unStandard.requireTip(translations.newUser_email),
          },
          { type: 'email', message: translations.newUser_emailError },
        ]}
      >
        <TzInput allowClear placeholder={translations.unStandard.requireTip(translations.newUser_email)} />
      </TzFormItem>
      <TzFormItem className="code-row">
        <TzFormItem
          name="CaptchaValue"
          className="code-input"
          label={null}
          rules={[
            {
              required: true,
              message: translations.unStandard.requireTip(translations.newUser_code),
            },
          ]}
        >
          <TzInput allowClear placeholder={translations.newUser_code} />
        </TzFormItem>

        <div onClick={fetchCodeID} className="imgCode">
          {data?.image ? <img src={`data:image/png;base64,${data?.image}`} alt="" /> : translations.newUser_refresh}
        </div>
      </TzFormItem>
      <TzButton loading={loading} className="mt4" type="primary" htmlType="submit">
        {translations.submit}
      </TzButton>
    </TzForm>
  );
};

export default SendEMail;
