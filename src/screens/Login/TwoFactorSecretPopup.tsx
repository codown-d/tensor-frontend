import React, { useEffect, useMemo, useRef, useState } from 'react';
import { TzModal } from '../../components/tz-modal';
import { translations } from '../../translations/translations';
import { TzInput } from '../../components/tz-input';
import {
  bindMfaVerify,
  getMfaBindImage,
  getVerifyAppURL,
  loginMfaVerify,
} from '../../services/DataService';
import { useInterval, useMemoizedFn } from 'ahooks';
import { tap } from 'rxjs/internal/operators/tap';
import { TAppUrls, TMfaBindImage, TTwoFactorLoginStatus } from '../../definitions';
import Qrcode from './Qrcode';
import { TzButton } from '../../components/tz-button';
import { TzForm, TzFormItem } from '../../components/tz-form';
import { Form } from 'antd';
import { showFailedMessage } from '../../helpers/response-handlers';

const getConfig = (step: number) => {
  switch (step) {
    case 1:
    case 2:
      return {
        title: translations.unStandard.MFASettingTit,
        btnTxt: translations.microseg_tenants_nextStep,
      };
    case 3:
      return {
        title: translations.unStandard.MFASettingSucTit,
        btnTxt: translations.confirm_modal_retur,
      };
    case 4:
      return {
        title: translations.unStandard.MFATit,
        btnTxt: translations.submit,
      };

    default:
      return {};
  }
};
export type TMfaConfigs = {
  twoFactorLoginStatus: TTwoFactorLoginStatus;
  twoFactorSecret?: string;
  account: string;
};
type TTwoFactorSecretPopup = {
  mfaConfig: TMfaConfigs;
  open: boolean;
  onOk: (values: any) => void;
  onCancel: () => void;
};
const TwoFactorSecretPopup = ({ open, onOk, onCancel, mfaConfig }: TTwoFactorSecretPopup) => {
  const { account, twoFactorLoginStatus, twoFactorSecret = '' } = mfaConfig;
  const [form] = Form.useForm();
  const [value, setValue] = useState<string>();
  const [data, setData] = useState<TMfaBindImage>();
  const [appUrls, setAppUrls] = useState<TAppUrls | null>();
  const twoFactorSecretRef = useRef(twoFactorSecret);
  const [step, setStep] = useState<number>(() => {
    if (twoFactorLoginStatus === 'MfaBinding') {
      return 1;
    }
    if (twoFactorLoginStatus === 'MfaVerify') {
      return 4;
    }
    return 5;
  });
  const [count, setCount] = useState<number>(5);
  const [delay, setDelay] = useState<number | undefined>();
  const { title, btnTxt } = useMemo(() => getConfig(step), [step]);
  const clear = useInterval(() => {
    setCount(count - 1);
  }, delay);

  const fetchVerifyAppURL = useMemoizedFn(() => {
    getVerifyAppURL()
      .pipe(
        tap((res) => {
          if (res.error) {
            return;
          }
          setAppUrls(res.getItem());
        }),
      )
      .subscribe();
  });
  const fetchMfaBindImage = useMemoizedFn(() => {
    getMfaBindImage({
      account,
      loginTwoFactorSecret: twoFactorSecretRef.current,
    })
      .pipe(
        tap((res) => {
          if (res.error) {
            return;
          }
          const item = res.getItem();
          const { twoFactorSecret } = item || {};
          twoFactorSecretRef.current = twoFactorSecret || '';
          setData(item ?? undefined);
        }),
      )
      .subscribe();
  });
  useEffect(() => {
    if (step === 1) {
      fetchVerifyAppURL();
      fetchMfaBindImage();
    }
  }, [step]);

  const toLogin = useMemoizedFn(() => {
    clear();
    setDelay(undefined);
    onCancel();
  });

  const onSubmit = useMemoizedFn((param) => {
    if (step === 1) {
      setStep((prev) => prev + 1);
      return;
    }
    if (step === 2) {
      form.validateFields().then((res) => {
        bindMfaVerify({
          ...res,
          account,
          loginTwoFactorSecret: twoFactorSecretRef.current,
        })
          .pipe(
            tap((res) => {
              if (res.error) {
                return;
              }
              const { twoFactorLoginStatus, twoFactorSecret } = res.getItem() || {};
              if (twoFactorLoginStatus === 'TwoFactorVerifyFailed') {
                twoFactorSecretRef.current = twoFactorSecret || '';
                showFailedMessage(translations.unStandard.dynamicVerifyFail);
                return;
              }
              setStep((prev) => prev + 1);
              setDelay(1000);
            }),
          )
          .subscribe();
      });
    }
    if (step === 3) {
      toLogin();
    }
    if (step === 4) {
      form.validateFields().then((res) => {
        loginMfaVerify({
          ...res,
          account,
          loginTwoFactorSecret: twoFactorSecretRef.current || '',
        })
          .pipe(
            tap((res) => {
              const item = res.getItem();
              const { twoFactorLoginStatus, twoFactorSecret } = item || {};
              if (twoFactorLoginStatus === 'TwoFactorVerifyFailed') {
                twoFactorSecretRef.current = twoFactorSecret || '';
                showFailedMessage(translations.unStandard.dynamicVerifyFail);
                return;
              }
              onOk(item);
            }),
          )
          .subscribe();
      });
    }
  });
  useEffect(() => {
    if (count < 1) {
      toLogin();
    }
  }, [count]);

  return (
    <TzModal
      title={title}
      className="mfa-modal"
      closable={false}
      mask={false}
      open={open}
      cancelText={translations.confirm_modal_close}
      okText={translations.login}
      centered
      destroyOnClose={true}
      wrapClassName="mfa-modal-wrap"
      footer={[
        <TzButton key="submit" type="primary" onClick={onSubmit}>
          {btnTxt}
        </TzButton>,
      ]}
    >
      <TzForm form={form}>
        <div className="mfa-modal-main">
          {step === 1 && (
            <div className={`step step${step} mb24`}>
              <p className="tips">{translations.unStandard.authAppInstallTips}</p>
              <div className="qr-content">
                <div className="qr-content-item">
                  <div className="qr-box">
                    <Qrcode text={appUrls?.android || ''} />
                  </div>
                  <span className="qr-content-item-txt">
                    <i className="icon iconfont icon-anzhuo" />
                    Android {translations.reportScreen_download}
                  </span>
                </div>
                <div className="qr-content-item">
                  <div className="qr-box">
                    <Qrcode text={appUrls?.ios || ''} />
                  </div>
                  <span className="qr-content-item-txt">
                    <i className="icon iconfont icon-pingguo" />
                    iPhone {translations.reportScreen_download}
                  </span>
                </div>
              </div>
              <p className="tips">{translations.unStandard.scanQrInstallSucTips}</p>
            </div>
          )}
          {step === 2 && (
            <div className={`step step${step}`}>
              <p className="tips">{translations.unStandard.scanQrTips}</p>

              <div className="qr-content">
                <div className="qr-content-item">
                  <div className="qr-box">
                    <Qrcode width={140} height={140} text={data?.mfaQrCodeInfo || ''} />
                  </div>
                  <span className="qr-content-item-txt">Secret: {data?.mfaSecret}</span>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className={`step step${step} mb24`}>
              <p className="tips">
                {translations.unStandard.secretSuccessTips}
                {count}...
              </p>
            </div>
          )}
          {step === 4 && (
            <div className={`step step${step}`}>
              <p className="tips form-lable">{translations.newUser_code}：</p>
            </div>
          )}
        </div>
        {[2, 4].includes(step) && (
          <TzFormItem
            name="mfaCode"
            rules={[
              {
                required: true,
                whitespace: true,
                message: translations.unStandard.secretTips,
              },
            ]}
          >
            <TzInput
              allowClear
              placeholder={translations.unStandard.secretTips}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onPressEnter={onSubmit}
            />
          </TzFormItem>
        )}
      </TzForm>
    </TzModal>
  );
};
export default TwoFactorSecretPopup;
