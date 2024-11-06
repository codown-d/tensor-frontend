import { Observable } from 'rxjs';
import {
  WebResponse,
} from '../../definitions';
import { fetch$, fetchParams } from '../../services/DataServiceHelper';
import { parseGetMethodParams } from '../../helpers/until';
import { URL } from '../../helpers/config';


export function getReportList(data: any): Observable<WebResponse<any>> {
  const { query, type, offset = 0, limit = 10 } = data;
  const url = `${URL}/api/v2/platform/report${parseGetMethodParams(
    {
      limit,
      offset,
      query,
      type,
    }
  )}`;
  return fetch$<any>(url, fetchParams('GET'));
}

export function updateReport(data: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/platform/report/template`;

  return fetch$<any>(url, fetchParams('PUT', JSON.stringify(data)));
}

export function deleteReport(id: number): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/platform/report/template`;

  return fetch$<any>(url, fetchParams('DELETE', JSON.stringify({ id })));
}

export function getReportRecord(data:any): Observable<WebResponse<any>> {
  const { templateID, offset = 0, limit = 10 } = data;
  const url = `${URL}/api/v2/platform/report/record/${parseGetMethodParams(
    {
      limit,
      offset,
      templateID,
    }
  )}`;

  return fetch$<any>(url, fetchParams());
}

export function addReport(data: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/platform/report/template`;

  return fetch$<any>(url, fetchParams('POST', JSON.stringify(data)));
}

export function geneReport(id: number): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/platform/report/record`;

  return fetch$<any>(url, fetchParams('POST', JSON.stringify({ templateID: id })));
}

export function getReportData(uuid: string): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/platform/report/recordDetail?uuid=${uuid}`;

  return fetch$<any>(url, fetchParams('GET'));
}

export function getReportDetail(id: number | string): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/platform/report/template/?id=${id}`;

  return fetch$<any>(url, fetchParams('GET'));
}