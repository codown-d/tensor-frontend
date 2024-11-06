import { camelCase, merge } from 'lodash';
import React, { useCallback, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { LoadingImg } from '../../../components/tz-table';
import { getUrlQuery, onLoginSuccessed, parseGetMethodParams } from '../../../helpers/until';
import { Routes } from '../../../Routes';
import { thirdLogin, thirdUrl } from '../../../services/DataService';
import './index.scss';
/**
 * 单点登录通用解决方案
 * 空白登录跳转页面
 * 参数说明
 * platformParam 平台键值对用于区分各家登录平台 已经各家单点登录使用的到参数
 * 
 * dx：道客平台 
 * mock_test：测试平台
 * 
 * 
 * 支持类似微信地址跳转验证方式
 * 
 */
let platformParam: any = {
  mock_test: ['session_state', 'code'],
  dx: ['session_state', 'code'],
};
const SSOLogin = (props: any) => {
  const [result] = useSearchParams();
  const navigate = useNavigate();
  let platform = result.get('platform') || 'mock_test';
  let getThirdUrl = useCallback(() => {
    thirdUrl({ platform }).subscribe((res) => {
      let item = res.getItem();
      localStorage.setItem('platform', platform);
      window.GLOBAL_WINDOW.location.href = `${item.url}&redirect_uri=${encodeURIComponent(
        `${
          window.GLOBAL_WINDOW.location.protocol + '//' + window.GLOBAL_WINDOW.location.host
        }/#/sso-login`,
      )}`;
    });
  }, []);
  useEffect(() => {
    let query = getUrlQuery();
    if (Object.values(query).some((item: any) => item.indexOf('#/sso-login') != -1)) {
      let p = Object.keys(query).reduce((pre: any, item) => {
        pre[item] = query[item].replace('#/sso-login', '');
        return pre;
      }, {});
      window.GLOBAL_WINDOW.location.href = `/#${Routes.SSOLogin}${parseGetMethodParams(p)}`;
      return;
    }
    let platform = localStorage.getItem('platform');
    if (platform && platformParam[platform].every((item: string | number) => !!query[item])) {
      let qy = merge({
        redirectUri: `${
          window.GLOBAL_WINDOW.location.protocol + '//' + window.GLOBAL_WINDOW.location.host
        }/#/sso-login`,
        ...query,
      });
      thirdLogin({
        platform,
        payload: Object.keys(qy).reduce((pre: any, item) => {
          pre[camelCase(item)] = qy[item];
          return pre;
        }, {}),
      }).subscribe((res) => {
        let item = res.getItem();
        window.localStorage.setItem('IDToken', item.IDToken);
        onLoginSuccessed(item);
      });
      return;
    }
    getThirdUrl();
  }, []);
  return (
    <div className="sso-login">
      <LoadingImg />
    </div>
  );
};

export default SSOLogin;
