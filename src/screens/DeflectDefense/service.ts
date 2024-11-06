import { Observable } from 'rxjs';
import { AssetsNameSpace, PaginationOptions, WebResponse } from '../../definitions';
import { parseGetMethodParams } from '../../helpers/until';
import { fetch$, fetchParams } from '../../services/DataServiceHelper';
import { getUserInformation } from '../../services/AccountService';
import { URL } from '../../helpers/config';

export function getList(data: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/platform/drift/policy/list${parseGetMethodParams(data)}`;

  return fetch$<any>(url, fetchParams('GET', null));
}

export function getExRecords(data: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/platform/drift/policy/abnormal${parseGetMethodParams(data)}`;

  return fetch$<any>(url, fetchParams('GET', null));
}

export function getDetail(data: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/platform/drift/policy/detail${parseGetMethodParams(data)}`;

  return fetch$<any>(url, fetchParams('GET', null));
}

export function getContainerDetail(containerID: string | number): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/platform/drift/container?container_id=${containerID}`;

  return fetch$<any>(url, fetchParams('GET', null));
}

export function update(data: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/platform/drift/policy/update`;
  const payload = JSON.stringify({
    ...data,
    updater: getUserInformation().username,
  });
  return fetch$<any>(url, fetchParams('POST', payload));
}

export function del(id: string | number): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/platform/drift/policy/delete?policy_id=${id}`;

  return fetch$<any>(url, fetchParams('POST'));
}

export function add(data: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/platform/drift/policy/create`;
  const payload = JSON.stringify({
    ...data,
    creator: getUserInformation().username,
  });
  return fetch$<any>(url, fetchParams('POST', payload));
}

export function addPost(data: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/platform/drift/policy/batch/create`;
  let param = data.map((t: any) => {
    return {
      ...t,
      creator: getUserInformation().username,
    };
  });
  const payload = JSON.stringify({ data: param });
  return fetch$<any>(url, fetchParams('POST', payload));
}

export function getNS(
  cluster_key: string,
  query?: string,
  pagination?: PaginationOptions,
): Observable<WebResponse<AssetsNameSpace>> {
  const offset = pagination?.offset || 0;
  const limit = pagination?.limit || 10000;
  const url = `${URL}/api/v2/platform/drift/namespaces${parseGetMethodParams({
    cluster_key,
    query,
    limit,
    offset,
  })}`;
  return fetch$<any>(url, fetchParams('GET'));
}

// /api/v2/platform/drift/default/whitelist
export function whitelist(data: any): Observable<WebResponse<AssetsNameSpace>> {
  const url = `${URL}/api/v2/platform/drift/default/whitelist${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('GET'));
}

// /api/v2/platform/drift/policy/batch/update
export function updateFn(data: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/platform/drift/policy/batch/update`;
  let param = data.map((t: any) => {
    return {
      ...t,
      updater: getUserInformation().username,
    };
  });
  const payload = JSON.stringify({ data: param });
  return fetch$<any>(url, fetchParams('PUT', payload));
}

export function getResource(
  cluster_key: string,
  ns: string,
  pagination?: PaginationOptions,
): Observable<WebResponse<AssetsNameSpace>> {
  const offset = pagination?.offset || 0;
  const limit = pagination?.limit || 10000;
  const url = `${URL}/api/v2/platform/drift/resources${parseGetMethodParams({
    cluster_key,
    namespace: ns,
    limit,
    offset,
  })}`;
  return fetch$<any>(url, fetchParams('GET'));
}
