import { IResponseError, WebResponse } from '../definitions';
import { message } from 'antd';
import { throttle } from 'lodash';
import { translations } from '../translations/translations';
export declare type MessageTypeOptions =
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'loading';

const getToastType = (ec?: any): MessageTypeOptions => {
  let errorCode = ec + '';
  if (errorCode === undefined || errorCode.startsWith('5')) {
    return 'error';
  } else if (errorCode.startsWith('4') || errorCode.startsWith('1')) {
    return 'error';
  } else if (errorCode === '0') {
    return 'success';
  }
  return 'error';
};
let throttleMessage = throttle((msg, errorCode) => {
  msg && message.open({
    type: getToastType(errorCode),
    duration: 3,
    content: msg,
  });
}, 300, { trailing: false });
export function showSuccessMessage(msg: string) {
  return message.success(msg, 3);
}
export function showFailedMessage(msg?: string, errorCode?: string) {
  throttleMessage(msg, errorCode === '500');
}
export function onSubmitFailed(error?: IResponseError): void {
  showFailedMessage(error?.message, error?.code);
}
export function onResult(result: WebResponse<any>): void {
  let { data, error } = result
  if (error) {
    onSubmitFailed(error)
  } else {
    showSuccessMessage(data?.item.msg || translations.scanner_report_operateSuccess)
  }
}
