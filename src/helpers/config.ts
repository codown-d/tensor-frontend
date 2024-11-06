export const URL = process.env.PUBLIC_URL; //公共前缀
// export const URL = 'https://console-local02.tensorsecurity.cn';
export const IS_MICRO_FRONT_IFRAME = process.env.REACT_APP_ENV === 'micro-front-iframe'; //作为iframe

// TODO: MicroFrontIframe
export const AUTHORIZATION_NAME = IS_MICRO_FRONT_IFRAME ? 'ai-jwt-token' : 'Authorization'; //传给后端对应Authorization字段名
// export const AUTHORIZATION_NAME = 'Authorization';
export const REACT_APP_SUBJECT = process.env.REACT_APP_SUBJECT;
//侧边栏模块
export const REACT_APP_SIDEBAR_REJECT = process.env.REACT_APP_SIDEBAR_REJECT?.split(',').filter((item) => item) || [];

window.REACT_APP_SIDEBAR_REJECT = (process.env.REACT_APP_SIDEBAR_REJECT || '').split(',');
window.REACT_APP_ASSET_MODULE = (process.env.REACT_APP_ASSET_MODULE || '').split(',');
window.TOP_WINDOW = IS_MICRO_FRONT_IFRAME ? window.top ?? window : window; //需接管浏览器路由
window.GLOBAL_WINDOW = window;
