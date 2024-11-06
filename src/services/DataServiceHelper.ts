import { Observable, ObservableInput, throwError } from 'rxjs';
import { WebResponse } from '../definitions';
import { fromFetch } from 'rxjs/fetch';
import { getUserToken } from './AccountService';
import { getCurrentLanguage } from './LanguageService';
import { showFailedMessage } from '../helpers/response-handlers';
import { loginOut } from './RouterService';
import { catchError, map, tap, timeoutWith, retry } from 'rxjs/operators';
import { AUTHORIZATION_NAME, IS_MICRO_FRONT_IFRAME } from '../helpers/config';
import { downBlobFile } from '../helpers/until';

export const AuthBearer = 'Bearer';
export const AuthorizationData = (): Record<string, string> => {
  const token = getUserToken();
  // TODO: MicroFrontIframe
  if (IS_MICRO_FRONT_IFRAME) {
    return {
      [AUTHORIZATION_NAME]: token,
    };
  }
  return { [AUTHORIZATION_NAME]: token ? `${AuthBearer} ${token}` : AuthBearer };
};

export type HttpMethod = 'POST' | 'GET' | 'DELETE' | 'UPDATE' | 'PATCH' | 'PUT';

export function fetchParams(method: HttpMethod = 'GET', body: any = null, header?: any): any {
  const authorizationData = AuthorizationData();
  return {
    method,
    headers: {
      ...authorizationData,
      'Accept-Language': getCurrentLanguage(),
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...header,
    },
    body,
    selector: async (res: any) => {
      let { status } = res;
      try {
        if (status != 401) {
          let contentType = res.headers.get('Content-Type');
          let disposition = res.headers.get('Content-Type');
          if (contentType.indexOf('application/json') != -1) {
            return res && res.json && res.json();
          } else if (contentType.indexOf('application/zip') != -1) {
            return res && res.blob && res.blob({ disposition: res.headers.get('Content-Disposition') });
          } else if (contentType.indexOf('application/octet-stream') != -1) {
            let blob = await res.blob();
            downBlobFile({ data: blob, headers: res.headers });
            return Promise.resolve({
              blob: blob,
              disposition,
              contentType,
            });
          }
        } else if (status === 401) {
          loginOut(true);
        }
        return res && res.json && res.json();
      } catch (err) {
        return { error: { message: 'Unknown error' } };
      }
    },
  };
}

export function fetch$<T>(
  input: string,
  init: RequestInit & { selector: (response: Response) => ObservableInput<T> },
  options: any = {
    silent: false, //控制response处不处理
    timesTamp: true,
  },
  auth = false,
  timeOut = 1000 * 5 * 60,
): Observable<WebResponse<T>> {
  let { method, headers } = init;
  if (options.silent) {
    // init.headers = Object.assign({}, headers, {
    //   'X-Auto-Request': 'polling',
    // });
  }
  if (method?.toUpperCase() === 'GET' && options.timesTamp) {
    if (input.includes('?') && !input.includes('timestamp')) {
      input = input.includes('?') ? `${input}&timestamp=${Date.now()}` : `${input}?timestamp=${Date.now()}`;
    }
  }
  if (!['/task/list', '/notify/stats', '/palace/task/status'].some((item) => input.indexOf(item) != -1)) {
    (window as any).NProgress.start();
  }
  return fromFetch(input, init).pipe(
    retry(3),
    timeoutWith(timeOut, throwError('http timeout')),
    tap((res: any) => {
      let f = [
        '/vulns/statistic',
        '/vulns/topNImage',
        '/task/list',
        '/notify/stats',
        '/palace/task/status',
        '/assets/clusters',
        '/license/info',
        '/notify/config',
      ].some((item) => input.indexOf(item) != -1);
      if (!res.data && res.error && res.error.code != -200 && !f && !options.silent) {
        showFailedMessage(res.error?.message, res.error?.code?.toString());
      }
    }),
    map((res: any) => {
      let { contentType = 'application/json' } = res;
      if (res?.constructor === Object && contentType === 'application/json') {
        return WebResponse.from<any>(res);
      } else {
        return res;
      }
    }),
    tap(() => {
      (window as any).NProgress.done();
    }),
    catchError((response: WebResponse<any>) => {
      (window as any).NProgress.done();
      return throwError(response);
    }),
  );
}
