import React, { useContext, useEffect, useState } from 'react';
import './LoginScreen.scss';
import { LoginResult, TRadiusLoginResult, WebResponse } from '../../definitions';
import {
  createCaptcha,
  getEnvKey,
  getLicenseInfo,
  getLicenseStatus,
  getLoginSecret,
  getLoginType,
  postLicenseRegister,
  postLoginForm,
  postLoginFormLdap,
  postLoginFormRadius,
  radiusResConfirm,
} from '../../services/DataService';
import { tap } from 'rxjs/operators';
import { translations } from '../../translations/translations';
import { showFailedMessage } from '../../helpers/response-handlers';
import { Resources } from '../../Resources';
import classNames from 'classnames';
import { TzInput } from '../../components/tz-input';
import { TzButton } from '../../components/tz-button';
import { TzForm, TzFormItem } from '../../components/tz-form';
import { encrypt } from '../../services/ThrottleUtil';
import { onLoginSuccessed } from '../../helpers/until';
import modal from 'antd/lib/modal';
import notification from 'antd/lib/notification';
import { TzTooltip } from '../../components/tz-tooltip';
import { Store } from '../../services/StoreService';
import { Link, redirect, useNavigate } from 'react-router-dom';
import { Routes } from '../../Routes';
import EnvKeyModal from './EnvKeyModal';
// import { useAliveController } from 'react-activation';
import { useMemoizedFn } from 'ahooks';
import RestPwdPopup from './component/ResetPwd/RestPwdPopup';
import DynamicPwdPopup from './DynamicPwdPopup';
import { Form } from 'antd';
import LanguageSwitch from './component/LanguageSwitch';
import { GlobalContext } from '../../helpers/GlobalContext';
import { LogoLottie } from './component/Lottie';
import TwoFactorSecretPopup, { TMfaConfigs } from './TwoFactorSecretPopup';
import { REACT_APP_SUBJECT } from '../../helpers/config';
type TLoginScreen = {};
type TLoginOptions = 'normal' | 'ldap' | 'radius';
type TConfigs = {
  cycleChangePwd?: boolean;
  emailEnabled?: boolean;
  options?: TLoginOptions[];
  skipKey?: boolean;
  CaptchaID?: string;
};

const TYPE_TXT: Record<TLoginOptions, string> = {
  normal: translations.platform_login,
  ldap: translations.ldap_login,
  radius: translations.radius_login,
};

function LoginScreen(props: TLoginScreen) {
  const { setCycleChangePwdDay, setLicenseInfo } = useContext(GlobalContext);
  const [captchaImg, setCaptchaImg] = useState<string>();
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [showDynamicPwdPopup, setShowDynamicPwdPopup] = useState<boolean>(false);
  const [isFirst, setIsFirst] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [envKey, setEnvKey] = useState<string>();
  const [changePwdHashCode, setChangePwdHashCode] = useState<string>();
  const [mfaConfig, setMfaConfig] = useState<TMfaConfigs | undefined>();
  const [challengeState, setChallengeState] = useState<string>();
  const [selectLoginType, setSelectLoginType] = useState<TLoginOptions>('normal');
  const [configs, setConfigs] = useState<TConfigs>({});
  const [toLoginForm, setToLoginForm] = useState<boolean>();
  const [loginForm] = Form.useForm();
  const fetchCodeID = useMemoizedFn(() => {
    createCaptcha()
      .pipe(
        tap((res: WebResponse<any>) => {
          if (res.error) {
            return;
          }
          let item = res.getItem();
          const { captchaID, image, skip } = item;
          setCaptchaImg(image);
          setConfigs((prev) => ({ ...prev, skipKey: skip, CaptchaID: captchaID }));
        }),
      )
      .subscribe();
  });
  const fetchEnvKey = useMemoizedFn(() => {
    getEnvKey()
      .pipe(
        tap((res: WebResponse<any>) => {
          if (res.error) {
            return;
          }
          setEnvKey(res.data?.envKey || '');
        }),
      )
      .subscribe();
  });
  const fetchLoginType = useMemoizedFn(() => {
    getLoginType()
      .pipe(
        tap((res) => {
          if (res.error) {
            return;
          }
          const item = res.getItem();
          setConfigs((prev) => ({ ...prev, ...item }));
        }),
      )
      .subscribe();
  });
  const fetchLicenseFirst = useMemoizedFn(() => {
    getLicenseStatus()
      .pipe(
        tap((res: WebResponse<any>) => {
          if (res.error) {
            return;
          }
          const item = res.getItem();
          const { first, register } = item;
          setIsRegister(register);
          setIsFirst(first);
          if (register) {
            fetchLoginType();
            !first && setToLoginForm(true);
          } else {
            fetchEnvKey();
          }
        }),
      )
      .subscribe();
  });
  useEffect(() => {
    // clear?.();
    Store?.eventsCenter?.next?.({});
    notification.destroy();
    modal.destroyAll();
    fetchCodeID();
    fetchLicenseFirst();
  }, []);

  const onAdminPwdOk = useMemoizedFn((res) => {
    const resStatus = !!res.data;
    if (!resStatus) {
      return;
    }
    setIsFirst(false);
    setIsRegister(true);
    setToLoginForm(true);
    fetchLoginType();
  });

  const mustChangePwdOk = useMemoizedFn((res) => {
    onLoginSuccessed(res.getItem());
  });
  const fetchLicenseSubmit = useMemoizedFn((licenseCode: string) => {
    postLicenseRegister({ licenseCode })
      .pipe(
        tap((res: WebResponse<any>) => {
          if (res.error) {
            fetchCodeID();
            return;
          }
          setEnvKey(undefined);
          setIsRegister(true);
        }),
      )
      .subscribe();
  });
  const dynamicPwdOk = useMemoizedFn((dynamicPassword) => {
    const { account } = loginForm.getFieldsValue();
    radiusResConfirm({
      account,
      password: dynamicPassword,
      state: challengeState,
    })
      .pipe(
        tap((result) => {
          setIsLoading(false);
          if (result.error) {
            fetchCodeID();
            return;
          }
          const item = result.getItem();
          const { state } = item || {};
          if (state) {
            showFailedMessage(translations.loginScreen_loginAgin);
            setShowDynamicPwdPopup(true);
            setChallengeState(state);
            return;
          } else {
            setShowDynamicPwdPopup(false);
            setChallengeState('');
          }
          onLoginSuccessed(item);
        }),
      )
      .subscribe();
  });
  const onFinish = useMemoizedFn((formValues) => {
    getLoginSecret(formValues)
      .pipe(
        tap((res) => {
          if (res.error) {
            fetchCodeID();
            return;
          }
          const item: any = res.getItem();
          const webKey = item.key;
          if (!webKey) {
            return;
          }
          const { account } = formValues;
          const { CaptchaID } = configs;

          const param = `${account}##${encrypt(JSON.stringify({ ...formValues, CaptchaID }), webKey)}`;
          loginSubmit(param);
        }),
      )
      .subscribe();
  });
  const fetchLicenseType = useMemoizedFn(() => {
    getLicenseInfo()
      .pipe(
        tap((res: WebResponse<any>) => {
          if (res.error) {
            return;
          }
          const item = res.getItem() || { status: {} };
          setLicenseInfo(item.status || undefined);
        }),
      )
      .subscribe();
  });
  const loginSuccessedRes = useMemoizedFn((res) => {
    onLoginSuccessed(res);
    fetchLicenseType();
  });
  const radiusLoginCallBack = useMemoizedFn((res: TRadiusLoginResult) => {
    if (res.challengeState) {
      setToLoginForm(false);
      setShowDynamicPwdPopup(true);
      setChallengeState(res.challengeState);
      return;
    }
    loginSuccessedRes(res);
  });
  const normalLoginCallBack = useMemoizedFn((res: LoginResult) => {
    const { twoFactorLoginStatus, twoFactorSecret } = res;
    const { account } = loginForm.getFieldsValue();
    if (twoFactorLoginStatus) {
      setToLoginForm(false);
      setMfaConfig({
        twoFactorLoginStatus,
        twoFactorSecret,
        account,
      });
      return;
    }

    const { cycleChangePwd } = configs;
    if (res.mustChangePwd) {
      setToLoginForm(false);
      setChangePwdHashCode(res.changePwdHashCode);
      return;
    } else if (cycleChangePwd && res?.cycleChangePwdDay < 5 && res.role != 'super-admin') {
      setCycleChangePwdDay(res?.cycleChangePwdDay);
    }
    loginSuccessedRes(res);
  });
  const loginSubmit = useMemoizedFn((param) => {
    setIsLoading(true);
    let fetchFun: any = postLoginForm;
    let calFn: any = normalLoginCallBack;
    switch (selectLoginType) {
      case 'ldap':
        fetchFun = postLoginFormLdap;
        calFn = loginSuccessedRes;
        break;
      case 'radius':
        fetchFun = postLoginFormRadius;
        calFn = radiusLoginCallBack;
        break;
    }
    fetchFun(param)
      .pipe(
        tap((res: WebResponse<any>) => {
          setIsLoading(false);
          if (res.error) {
            fetchCodeID();
            return;
          }
          calFn(res.getItem());
        }),
      )
      .subscribe();
  });

  const optionsLen = configs.options?.length || 0;
  return (
    <>
      <div
        className="login-screen"
        style={{
          background: "url('/images/bg.jpg') no-repeat",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {toLoginForm && (
          <div
            className="login-screen-card"
            style={{
              background: "url('/images/form-bg.jpg') no-repeat",
              backgroundSize: '100% 100%',
            }}
          >
            <div className="login-screen-card-form">
              {REACT_APP_SUBJECT === 'tensor' ? (
                <LogoLottie />
              ) : (
                <img
                  src={Resources.login_logo}
                  style={{ width: '100%', marginBottom: '10px', maxHeight: '63px' }}
                  className="login-logo"
                />
              )}
              <div
                className={classNames('df dfac dfjs type-case', {
                  noShow: optionsLen < 2,
                })}
              >
                {optionsLen > 1 &&
                  configs.options?.map((t: TLoginOptions) => {
                    return (
                      <span
                        className={classNames('type-tit', {
                          onSelect: selectLoginType === t,
                        })}
                        onClick={() => setSelectLoginType(t)}
                      >
                        {TYPE_TXT[t]}
                      </span>
                    );
                  })}
              </div>
              <TzForm form={loginForm} onFinish={onFinish} layout="vertical">
                <TzFormItem name="account">
                  <TzInput placeholder={translations.loginScreen_username} />
                </TzFormItem>
                <TzFormItem name="password" className={`${configs.skipKey ? ' mb-16' : ''}`}>
                  <TzInput type="password" placeholder={translations.password} />
                </TzFormItem>
                {!configs.skipKey && (
                  <div className={'flex-r'} style={{ justifyContent: 'space-between' }}>
                    <div style={{ flex: '1', width: '0' }}>
                      <TzFormItem name="CaptchaValue" style={{ marginBottom: '0px' }}>
                        <TzInput autoComplete="off" placeholder={translations.newUser_code} />
                      </TzFormItem>
                    </div>
                    <div className="captcha-input" onClick={fetchCodeID}>
                      {captchaImg ? (
                        <img src={`data:image/png;base64,${captchaImg}`} alt="" style={{ height: '36px' }} />
                      ) : (
                        <p className="code-txt flex-c">
                          <span>{translations.get_failed}</span>
                          <span>{translations.please_click_refresh}</span>
                        </p>
                      )}
                    </div>
                  </div>
                )}
                <span className={`forget`}>
                  {configs.emailEnabled ? (
                    <Link to={Routes.NewUser}>{translations.loginScreen_forget}</Link>
                  ) : (
                    <TzTooltip title={translations.unStandard.str195}>{translations.loginScreen_forget}</TzTooltip>
                  )}
                </span>
                <TzButton type="primary" htmlType="submit" style={{ width: '100%' }}>
                  {isLoading ? translations.loginScreen_loading : translations.login}
                </TzButton>
              </TzForm>
            </div>
            <LanguageSwitch />
          </div>
        )}
      </div>
      {/* 动态密码 */}
      {showDynamicPwdPopup && <DynamicPwdPopup onOk={dynamicPwdOk} open={showDynamicPwdPopup} />}
      {/* 软件激活 */}
      {!!envKey && (
        <EnvKeyModal
          mask={false}
          hideCancel
          okText={translations.submit}
          title={translations.license_appActivat}
          open={!!envKey}
          onOk={fetchLicenseSubmit}
          envKey={envKey}
        />
      )}

      {/* 激活后第一次登录设置密码 */}
      {isRegister && isFirst && (
        <RestPwdPopup type="resetPwdByFirst" hideCancel open={isRegister && isFirst} onSuccessCall={onAdminPwdOk} />
      )}
      {/* 必须修改密码 */}
      {!!changePwdHashCode && (
        <RestPwdPopup
          hash={changePwdHashCode}
          type="resetPwdByHash"
          hideCancel
          open={!!changePwdHashCode}
          onSuccessCall={mustChangePwdOk}
        />
      )}
      {/* MFA */}
      {!!mfaConfig && (
        <TwoFactorSecretPopup
          mfaConfig={mfaConfig}
          open={!!mfaConfig}
          onOk={loginSuccessedRes}
          onCancel={() => {
            setToLoginForm(true);
            fetchCodeID();
            setMfaConfig(undefined);
          }}
        />
      )}
    </>
  );
}

export default LoginScreen;
