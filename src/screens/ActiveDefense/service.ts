import { Observable } from 'rxjs';
import { WebResponse } from '../../definitions';
import { parseGetMethodParams } from '../../helpers/until';
import { fetch$, fetchParams } from '../../services/DataServiceHelper';
import { URL } from '../../helpers/config';

export function getBaitImageList(): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/watson/baitImages${parseGetMethodParams({
    offset: 0,
    limit: 1000,
  })}`;

  return fetch$<any>(url, fetchParams('GET', null));
}

export function getBaitImages(id: string | number): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/watson/baitImage?id=${id}`;

  return fetch$<any>(url, fetchParams('GET', null));
}

export function getBaitList(
  params: any,
  offset: Number,
  limit: Number,
): Observable<WebResponse<any>> {
  const { bait_id, have_alerts, ...rest } = params;
  let url = `${URL}/api/v2/containerSec/watson/baitServices${parseGetMethodParams({
    ...rest,
    offset,
    limit,
  })}`;
  if (typeof have_alerts !== 'undefined') url += `&have_alerts=${have_alerts}`;
  if (bait_id && bait_id.length)
    url =
      bait_id.length === 1
        ? `${url}&bait_id=${bait_id[0]}`
        : `${url}${bait_id.map((id: any) => `&bait_id=${id}`).join('')}`;

  return fetch$<any>(url, fetchParams('GET', null));
}

export function getBaitDetail(
  clusterKey: string,
  namespace: string,
  name: string,
): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/watson/baitService${parseGetMethodParams({
    cluster_key: clusterKey,
    namespace,
    name,
  })}`;

  return fetch$<any>(url, fetchParams('GET', null));
}

export function updateBaitService(data: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/watson/baitService`;

  return fetch$<any>(url, fetchParams('POST', JSON.stringify(data)));
}

export function createBaitService(data: any) {
  const url = `${URL}/api/v2/containerSec/watson/baitService`;

  return fetch$<any>(url, fetchParams('PUT', JSON.stringify(data)));
}

export function deleteBaitService(id: string | number) {
  const url = `${URL}/api/v2/containerSec/watson/baitService${parseGetMethodParams({
    id,
  })}`;

  return fetch$<any>(url, fetchParams('DELETE', null));
}
