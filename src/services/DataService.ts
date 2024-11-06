import moment from 'moment';

import { interval, Observable, of, timer } from 'rxjs';
import { map, mapTo, switchMap, tap } from 'rxjs/operators';

import {
  AuditConfig,
  Cluster,
  ComplianceCheckType,
  ComplianceScanBreakDown,
  ComplianceScanPolicyDetails,
  ComplianceScanHistory,
  Cronjob,
  CronJobForm,
  LoginFormData,
  LoginResult,
  NodeComplianceDetails,
  ImageScanSummaryResult,
  OnlineVulnerability,
  OnlineVulnerabilityComplexDetails,
  PaginationOptions,
  RuleState,
  RuntimeRule,
  ScanConfigUrl,
  ScanStatus,
  WebResponse,
  User,
  ServerAlert,
  Role,
  SetUserRoleResult,
  SetRoleAccessResult,
  Access,
  UserListFormData,
  AccessListFormData,
  RoleListFormData,
  SetRoleAccessFormData,
  SetUserRoleFormData,
  HotStorageView,
  DaysOffset,
  GarbaceCollectionTask,
  AlertCount,
  ResetUserPwd,
  MicFousParams,
  MicroServiceListItem,
  MicroServiceItemInfo,
  MicResponsibleSubmitParams,
  MicSetServiceAliasParams,
  OnlineVulnerabilityServiceDetails,
  ComplianceHarborHistory,
  SuperUser,
  UserModule,
  TensorWallSetRuleParams,
  TensorWallGetRuleParams,
  TensorWallEdgeEventListParams,
  ServiceList,
  EdgeServiceSubmit,
  EdgeServiceSubmitResult,
  TtlType,
  ClusterSegmentInfo,
  ClusterNamespace,
  ClusterResourceInfo,
  ScannerVulnsItem,
  ScanDiscoverContainer,
  ClusterResourceHasEI,
  SegmentPolicy,
  ResourceTyps,
  CalicoResource,
  CalicoConnection,
  CalicoSegment,
  MicrosegResources,
  ImageRejectImage,
  ImageRejectRuleConfigRes,
  ImageRejectRuleConfigPolicie,
  AssetsNameSpace,
  RunTimePolicyResourceKind,
  AssetsResourceContainer,
  AssetsNameSpaceResource,
  ClusterResourceInSeg,
  AssetsCluster,
  GraphListCount,
  RunTimePolicyItem,
  RunTimePolicyMod,
  AppamorControlInfoItem,
  RunTimePolicySeckind,
  CommandsWhiteControlInfoItem,
  SeccompControlInfoItem,
  DriftPreventionConfig,
  TCustomConfigs,
  TCustomConfigEditReqParams,
  TRulefigEditReqParams,
  LoggedInUserInformation,
  TRadiusLoginResult,
  TLdapLoginResult,
  TMfaBindImage,
  TAppUrls,
  TCaptchaData,
  TEditUserParam,
  TSyslog,
  BackupPollData,
  TDataManagement,
  TConfigsOperator,
  BehavioralLearnListReq,
  BehavioralLearnInfoRes,
  BehavioralLearnListRes,
  BehavioralLearnModelCommandItem,
  BehavioralLearnModelCommandReq,
  BehavioralLearnModelFileItem,
  BehavioralLearnModelFileReq,
  BehavioralLearnModelNetworkItem,
  BehavioralLearnModelNetworkReq,
  BehavioralLearnModelRes,
  EnabledBehavioralLearnReq,
  ModelLogItem,
  ModelLogReq,
  OprLearnRes,
  StartBehavioralLearnReq,
} from '../definitions';
import { getUserInformation } from './AccountService';
import { getCurrentLanguage } from './LanguageService';
import { Store } from './StoreService';
import { formatGetMethodParams, parseGetMethodParams } from '../helpers/until';
import { AuthorizationData, fetch$, fetchParams, HttpMethod } from './DataServiceHelper';
import { URL } from '../helpers/config';

import { cloneDeep, isUndefined, merge } from 'lodash';
import { IRepoItem } from '../screens/ImagesScanner/definition';
import { TSecurityPolicy } from '../screens/ImagesScanner/SecurityPolicy/interface';
import { tabType } from '../screens/ImagesScanner/ImagesScannerScreen';
import { Monitoring } from '../screens/ComponentMonitoring';
import { localLang } from '../translations';
import axios, { CancelTokenSource } from 'axios';
function fetchFile(method: HttpMethod = 'GET', body: any = null, headers?: any): any {
  let response = {};
  return {
    method,
    headers: {
      ...AuthorizationData(),
      'Accept-Language': getCurrentLanguage(),
      'Content-Type': 'application/octet-stream',
      ...headers,
    },
    body,
    selector: (res: any) => {
      try {
        response = res;
        return res.blob();
      } catch (err) {
        return { error: { message: 'Unknown error' } };
      }
    },
    response: () => {
      return response;
    },
  };
}
function uploadFile(url: any, formData: any, cfg?: any, onUploadProgress?: Function, source?: CancelTokenSource) {
  return axios.post(url, formData, {
    headers: {
      ...AuthorizationData(),
      'Content-Type': 'multipart/form-data',
      'Accept-Language': localLang,
      ...cfg,
    },
    cancelToken: source?.token,
    onUploadProgress: (progressEvent) => {
      onUploadProgress?.(progressEvent);
    },
  });
}
export function postLoginOut(): Observable<WebResponse<LoginResult>> {
  return fetch$<any>(`${URL}/api/v2/usercenter/logout`, fetchParams('POST', {}));
}
export function getProfile(): Observable<WebResponse<LoggedInUserInformation>> {
  return fetch$<any>(`${URL}/api/v2/usercenter/profile`, fetchParams('GET'), { silent: true });
}
// loginScreen
// 可能变为userCenter
// 管理模块【login，forgetpwd，activeuser】

export function postLoginForm(data: LoginFormData | string): Observable<WebResponse<LoginResult>> {
  let _data = typeof data === 'string' ? data : JSON.stringify(data);
  return fetch$<any>(`${URL}/api/v2/usercenter/login`, fetchParams('POST', _data));
}

export function postLoginFormLdap(data: LoginFormData | string): Observable<WebResponse<TLdapLoginResult>> {
  let _data = typeof data === 'string' ? data : JSON.stringify(data);
  return fetch$<any>(`${URL}/api/v2/usercenter/ldapLogin`, fetchParams('POST', _data));
}

export function postLoginFormRadius(data: LoginFormData | string): Observable<WebResponse<TRadiusLoginResult>> {
  let _data = typeof data === 'string' ? data : JSON.stringify(data);
  return fetch$<any>(`${URL}/api/v2/usercenter/radiusLogin`, fetchParams('POST', _data));
}

// api/v2/usercenter/radiusResponseChallenge
export function radiusResConfirm(data: LoginFormData | string): Observable<
  WebResponse<{
    currentAuthority: string; // 用户名
    status: string;
    type: string;
    state: string; // radius挑战 当state不为空时 需要用户响应挑战继续登录
    token: string; // jwt token
    role: string; // 用户角色
  }>
> {
  let _data = typeof data === 'string' ? data : JSON.stringify(data);
  return fetch$<any>(`${URL}/api/v2/usercenter/radiusResponseChallenge`, fetchParams('POST', _data));
}

export function getLoginSecret(data: any): Observable<WebResponse<LoginResult>> {
  const { account } = data;
  return fetch$<any>(`${URL}/api/v2/usercenter/login/secret?seed=${account}`, fetchParams());
}

export function ForgetPwd(data: {
  account: string;
  CaptchaID: string;
  CaptchaValue: string;
}): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/usercenter/forgetpwd`, fetchParams('POST', JSON.stringify(data)));
}

export function EnrollUser(data: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/usercenter/activeuser`, fetchParams('POST', JSON.stringify(data)));
}

export function subscribeToUserList(page: number, limit: number): Observable<WebResponse<User>> {
  const data = new UserListFormData();
  data.page = page;
  data.limit = limit;
  return fetch$<any>(`${URL}/api/v2/usercenter/userList`, fetchParams('POST', JSON.stringify(data)));
}

export function subscribeToAccessList(page: number, limit: number): Observable<WebResponse<Access>> {
  const data = new AccessListFormData();
  data.page = page;
  data.limit = limit;
  return fetch$<any>(`${URL}/api/v2/usercenter/accessList`, fetchParams('POST', JSON.stringify(data)));
}

export function subscribeToRoleList(page: number, limit: number): Observable<WebResponse<Role>> {
  const data = new RoleListFormData();
  data.page = page;
  data.limit = limit;
  return fetch$<any>(`${URL}/api/v2/usercenter/roleList`, fetchParams('POST', JSON.stringify(data)));
}

export function getCluster(id: string): Observable<WebResponse<Cluster>> {
  return fetch$<any>(`${URL}/api/v2/platform/config/cluster/${id}`, fetchParams());
}

export function getCronjob(checkType: ComplianceCheckType, clusterId: string): Observable<WebResponse<Cronjob>> {
  return fetch$<any>(`${URL}/api/v2/containerSec/scap/${checkType}/${clusterId}/cron`, fetchParams());
}

export function postCluster(cluster: Cluster): Observable<WebResponse<Cluster>> {
  const data = { ...cluster };
  if (data.id) {
    return fetch$<any>(`${URL}/api/v2/platform/config/cluster/${data.id}`, fetchParams('PUT', JSON.stringify(data)));
  } else {
    delete data.id;
    return fetch$<any>(`${URL}/api/v2/platform/config/cluster`, fetchParams('POST', JSON.stringify(data)));
  }
}

export function deleteCluster(id: string): Observable<WebResponse<Cluster>> {
  return fetch$<any>(`${URL}/api/v2/platform/config/cluster/${id}`, fetchParams('DELETE'));
}

function castComplianceCheckHistory(res: WebResponse<ComplianceScanHistory>): WebResponse<ComplianceScanHistory> {
  res.setItems(
    (res.data?.items || []).map((t: ComplianceScanHistory) => {
      return new ComplianceScanHistory(t);
    }),
  );
  return res;
}

export function subscribeToComplianceCheckHistory(
  checkType: ComplianceCheckType,
  clusterID: string,
): Observable<WebResponse<ComplianceScanHistory>> {
  return timer(0, 5000).pipe(
    switchMap(() => {
      const historyUrl = `${URL}/api/v2/containerSec/scap/${checkType}/${clusterID}/history`;
      return fetch$<any>(historyUrl, fetchParams(), { silent: true }).pipe(
        map((res) => castComplianceCheckHistory(res)),
      );
    }),
    map((res) => res.reverseItems()),
  );
}

export function subscribeToComplianceHarborHistory(
  limit: number,
  offset: number,
): Observable<WebResponse<ComplianceHarborHistory>> {
  return timer(0, 5000).pipe(
    switchMap(() => {
      const historyUrl = `${URL}/api/v2/containerSec/scap/harborScanList?limit=${limit}&offset=${offset}`;
      return fetch$<any>(historyUrl, fetchParams(), { silent: true });
    }),
    map((res) => res),
  );
}

export function getHarborDetailInfo(
  check_id: string,
  limit?: number,
  offset?: number,
): Observable<WebResponse<ComplianceHarborHistory>> {
  return fetch$<any>(
    `${URL}/api/v2/containerSec/scap/harborScanList?limit=${limit || 10}&offset=${offset || 0}&checkid=${check_id}`,
    fetchParams(),
  );
}

export function getHarborNodeDetailInfo(
  check_id: string,
  projectname: string,
  limit?: number,
  offset?: number,
): Observable<WebResponse<ComplianceHarborHistory>> {
  return fetch$<any>(
    `${URL}/api/v2/containerSec/scap/harborScanList?limit=${limit || 10}&offset=${
      offset || 0
    }&checkid=${check_id}&projectname=${projectname}`,
    fetchParams(),
  );
}

export function getPolicyDetailsInformation(
  checkType: ComplianceCheckType,
  checkID: string,
  policyNumber: string,
): Observable<WebResponse<ComplianceScanPolicyDetails>> {
  return fetch$<any>(
    `${URL}/api/v2/containerSec/scap/${checkType}/breakdown/${checkID}/${policyNumber}/details`,
    fetchParams(),
  );
}

export function getSpecificCheckBreakdown(
  checkType: ComplianceCheckType,
  clusterID: string,
  checkID?: string,
): Observable<WebResponse<ComplianceScanBreakDown>> {
  const url = checkID
    ? `${URL}/api/v2/containerSec/scap/${checkType}/breakdown/${checkID}`
    : `${URL}/api/v2/containerSec/scap/${checkType}/${clusterID}/breakdown`;

  return fetch$<any>(url, fetchParams()).pipe(
    map((res) => {
      res.setItems(
        (res.data?.items || []).map((t: ComplianceScanBreakDown) => {
          return new ComplianceScanBreakDown(t);
        }),
      );
      return res;
    }),
  );
}

export function getNodeSpecificCheckBreakdown(
  checkType: ComplianceCheckType,
  nodeName: string,
  checkID: string,
): Observable<WebResponse<NodeComplianceDetails>> {
  return fetch$<any>(`${URL}/api/v2/containerSec/scap/${checkType}/${nodeName}/${checkID}/details`, fetchParams(), {
    silent: true,
  });
}

export function startScanningCluster(
  clusterId: string,
  checkType: ComplianceCheckType,
): Observable<WebResponse<Cluster>> {
  return fetch$<any>(`${URL}/api/v2/containerSec/scap/${checkType}/${clusterId}`, fetchParams('POST'));
}

export function startScanningHarbor(): Observable<WebResponse<Cluster>> {
  return fetch$<any>(`${URL}/api/v2/containerSec/scap/harborScan`, fetchParams('POST'));
}

export function postClusterCronJobConfig(data: CronJobForm): Observable<WebResponse<Cronjob>> {
  const checkType = data.checkType;
  const clusterId = data.clusterID;

  return fetch$<any>(
    `${URL}/api/v2/containerSec/scap/${checkType}/${clusterId}/cron`,
    fetchParams('PUT', JSON.stringify({ cronString: data.cronString })),
  );
}

export function getClusterCronjobs(): Observable<WebResponse<Cronjob>> {
  return fetch$<any>(`${URL}/api/v2/containerSec/scap/crons`, fetchParams());
}

export function getScanConfig(): Observable<WebResponse<ScanConfigUrl>> {
  return fetch$<any>(`${URL}/api/v2/containerSec/scanner/harbor/scanConfig`, fetchParams());
}

export function subscribeToScanStatus(data?: any): Observable<WebResponse<ScanStatus>> {
  return timer(0, 5000).pipe(
    switchMap(() =>
      fetch$<any>(`${URL}/api/v2/containerSec/scanner/harbor/scanStatus?${formatParameter(data)}`, fetchParams(), {
        silent: true,
      }),
    ),
  );
}

export function subscribeToScanStatusMic(namespace: string, svcname: string): Observable<WebResponse<ScanStatus>> {
  return timer(0, 5000).pipe(
    switchMap(() =>
      fetch$<any>(
        `${URL}/api/v2/platform/microservice/serviceScan?namespace=${namespace}&svcname=${svcname}`,
        fetchParams(),
        {
          silent: true,
        },
      ),
    ),
  );
}

export function getScannerVulns(
  pagination: PaginationOptions = {},
  search?: string,
): Observable<WebResponse<ScannerVulnsItem>> {
  const offset = pagination.offset || 0;
  const limit = pagination.limit || 10;

  const url = `${URL}/api/v2/containerSec/scanner/vulns/all?limit=${limit}&offset=${offset}${
    search ? `&search=${search}` : ''
  }`;
  return fetch$<any>(url, fetchParams());
}

export function getScanDiscoverDetail(data: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/scanner/vulns/detail${parseGetMethodParams(data, true)}`;
  return fetch$<any>(url, fetchParams('GET'));
}

export function getScanDiscoverContainer(imageInfo: string): Observable<ScanDiscoverContainer[]> {
  const url = `${URL}/api/v2/containerSec/scanner/vulns/relation?imageinfo=${imageInfo}`;

  return fetch$<any>(url, fetchParams()).pipe(
    map((res) => {
      return res.getItems();
    }),
  );
}

export function getResourcesByImageVulns(data: any): Observable<WebResponse<any>> {
  const { offset = 0, limit = 10 } = data;
  const url = `${URL}/api/v2/platform/assets/resources/byImageVulns${formatGetMethodParams(
    {
      ...data,
      limit,
      offset,
    },
    true,
  )}`;

  return fetch$<any>(url, fetchParams('GET'));
}

export function getTestScanoneStatus(num: number): Observable<any> {
  return timer(0, 5000).pipe(
    switchMap(() =>
      interval(Math.random() * 10000).pipe(mapTo('Hello, I made it!' + num + '/' + new Date().getTime())),
    ),
  );
}

export function getMicServiceMain(
  pagination: PaginationOptions = {},
  itemType: 'all' | 'myFocus' = 'all',
  search = '',
): Observable<WebResponse<MicroServiceListItem>> {
  const offset = pagination.offset || 0;
  const limit = pagination.limit || 30;

  const url = `${URL}/api/v2/platform/microservice/serviceMain?limit=${limit}&offset=${offset}&itemType=${itemType}&search=${search}`;

  return fetch$<any>(url, fetchParams('GET'));
}
export function getMicServiceInfo(namespace: string, svcname: string): Observable<WebResponse<MicroServiceItemInfo>> {
  const url = `${URL}/api/v2/platform/microservice/serviceInfo?namespace=${namespace}&svcname=${svcname}`;

  return fetch$<any>(url, fetchParams('GET'));
}

export function getMicResponsibleSearch(search: string): Observable<WebResponse<string>> {
  const url = `${URL}/api/v2/platform/microservice/responsibleSearch?search=${search}`;
  return fetch$<any>(url, fetchParams('GET'));
}

export function microserviceResponsibleSubmit(data: MicResponsibleSubmitParams) {
  return fetch$<any>(
    `${URL}/api/v2/platform/microservice/responsibleSubmit`,
    fetchParams('POST', JSON.stringify(data)),
  );
}

export function micSetServiceAlias(data: MicSetServiceAliasParams) {
  return fetch$<any>(`${URL}/api/v2/platform/microservice/setServiceAlias`, fetchParams('POST', JSON.stringify(data)));
}

export function getAuditConfig(): Observable<WebResponse<AuditConfig>> {
  return fetch$<any>(`${URL}/api/v2/platform/audit/config`, fetchParams('GET'));
}

export function microserviceFocus(data: MicFousParams) {
  return fetch$<any>(`${URL}/api/v2/platform/microservice/focus`, fetchParams('POST', JSON.stringify(data)));
}

export function getStorage(type: 'cold' | 'hotLogic' | 'hotOffline') {
  return fetch$<any>(`${URL}/api/v2/platform/data/storage?dataType=${type}`, fetchParams('GET'));
}

export function getTtlDays(type: 'cold' | 'hotLogic' | 'hotOffline') {
  return fetch$<any>(`${URL}/api/v2/platform/data/ttl?dataType=${type}`, fetchParams('GET'));
}

export function setTtlDays(data: TtlType) {
  return fetch$<any>(`${URL}/api/v2/platform/data/ttl`, fetchParams('POST', JSON.stringify(data)));
}

export function startGC(data: DaysOffset) {
  return fetch$<GarbaceCollectionTask>(`${URL}/api/v2/platform/data/gc`, fetchParams('POST', JSON.stringify(data)));
}

export function getGC(gcID: string): Observable<WebResponse<GarbaceCollectionTask>> {
  return timer(0, 5000).pipe(
    switchMap(() => fetch$<any>(`${URL}/api/v2/platform/data/gc/${gcID}`, fetchParams('GET'), { silent: true })),
  );
}

export function fetchGC(gcID: string): Observable<WebResponse<GarbaceCollectionTask>> {
  return fetch$<any>(`${URL}/api/v2/platform/data/gc/${gcID}`, fetchParams('GET'), {
    silent: true,
  });
}

export function getWaterline() {
  return fetch$<any>(`${URL}/api/v2/platform/data/waterline`, fetchParams('GET'));
}

export function setWaterline(percentage: number) {
  const data = {
    percentage: percentage,
  };
  return fetch$<any>(`${URL}/api/v2/platform/data/waterline`, fetchParams('POST', JSON.stringify(data)));
}

export function getListClusters(data: any): Observable<WebResponse<any[]>> {
  const url = `${URL}/api/v2/platform/assets/clusters${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('GET'));
}
export function putAuditConfig(auditConfig: AuditConfig): Observable<WebResponse<AuditConfig>> {
  const data = { ...auditConfig };
  return fetch$<any>(`${URL}/api/v2/platform/audit/config`, fetchParams('PUT', JSON.stringify(data)));
}

export function getHotStorageView(): Observable<WebResponse<HotStorageView>> {
  return fetch$<any>(`${URL}/api/v2/platform/cleanup/logicHotStorage`, fetchParams('GET'), {
    silent: true,
  }).pipe(
    map((res) => {
      res.castItemTo(HotStorageView);
      return res;
    }),
  );
}

export function subscribeToHotStorageView(): Observable<WebResponse<HotStorageView>> {
  return timer(0, 60000).pipe(switchMap(() => getHotStorageView()));
}

export function runGarbageCollection(daysOffset: DaysOffset) {
  const data = { ...daysOffset };
  return fetch$<any>(`${URL}/api/v2/platform/cleanup/logicGC`, fetchParams('POST', JSON.stringify(data)));
}

export function subscribeToGarbageCollectionTask(
  garbageCollectionTaskId: string,
): Observable<WebResponse<GarbaceCollectionTask>> {
  return timer(0, 5000).pipe(
    switchMap(() =>
      fetch$<any>(`${URL}/api/v2/platform/cleanup/logicGC/${garbageCollectionTaskId}`, fetchParams('GET'), {
        silent: true,
      }),
    ),
  );
}

export function getESHotStorageView(): Observable<WebResponse<HotStorageView>> {
  return fetch$<any>(`${URL}/api/v2/platform/cleanup/offlineHotStorage`, fetchParams('GET'), {
    silent: true,
  }).pipe(
    map((res) => {
      res.castItemTo(HotStorageView);
      return res;
    }),
  );
}

export function subscribeToESHotStorageView(): Observable<WebResponse<HotStorageView>> {
  return timer(0, 60000).pipe(switchMap(() => getESHotStorageView()));
}

export function runESCollection(daysOffset: DaysOffset) {
  const data = { ...daysOffset };
  return fetch$<any>(`${URL}/api/v2/platform/cleanup/offlineGC`, fetchParams('POST', JSON.stringify(data)));
}

export function subscribeToESCollectionTask(
  garbageCollectionTaskId: string,
): Observable<WebResponse<GarbaceCollectionTask>> {
  return timer(0, 5000).pipe(
    switchMap(() =>
      fetch$<any>(`${URL}/api/v2/platform/cleanup/offlineGC/${garbageCollectionTaskId}`, fetchParams('GET'), {
        silent: true,
      }),
    ),
  );
}

export function getClusters(): Observable<Cluster[]> {
  return new Observable((observer) => {
    getAssetsClustersList()
      .pipe(
        tap((data: any[]) => {
          Store.clusters.next(
            data.map((item) => {
              item['label'] = item.name;
              item['value'] = item.key;
              return item;
            }),
          );
          observer.next(data);
          observer.complete();
        }),
      )
      .subscribe();
  });
}

export function getClustersList(): Observable<Cluster[]> {
  return fetch$<any>(`${URL}/api/v2/platform/config/clusters`, fetchParams('GET')).pipe(
    map((res) => {
      return res.data?.items || [];
    }),
  );
}

export function getAssetsClustersList(query?: string, pagination?: PaginationOptions): Observable<AssetsCluster[]> {
  const offset = pagination?.offset || 0;
  const limit = pagination?.limit || 10000;
  const url = `${URL}/api/v2/platform/assets/clusters${parseGetMethodParams({
    query,
    limit,
    offset,
  })}`;
  return fetch$<any>(url, fetchParams('GET')).pipe(
    map((res) => {
      return res.data?.items || [];
    }),
  );
}

export function exportComplianceFile(checkType: ComplianceCheckType, checkID: string): Observable<any> {
  return fetch$<any>(`${URL}/api/v2/containerSec/scap/${checkType}/${checkID}/exportfile`, fetchParams('GET')).pipe(
    map((res) => {
      return res.data;
    }),
  );
}

export function getComplianceFile(checkID: string): Observable<any> {
  return fetch$<any>(
    `${URL}/api/v2/containerSec/scap/${checkID}/getfile`,
    fetchFile('GET'),
    {
      silent: false,
    },
    true,
  );
}

export function runtimeDetectionRules(): Observable<WebResponse<RuntimeRule>> {
  return fetch$<any>(`${URL}/api/v2/containerSec/runtimeDetectionConfig/rules`, fetchParams('GET'));
}

export function acknowledgeAlert(alertID: string) {
  return fetch$<any>(`${URL}/api/v2/platform/alerts/${alertID}/acknowledge`, fetchParams('POST'));
}

export function serialize(obj: any): string {
  const str = [];
  for (const p in obj)
    if (obj.hasOwnProperty(p) && obj[p] !== undefined && obj[p] !== '' && obj[p] !== null) {
      str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
    }
  return str.join('&');
}

/**
 * This function is used for checking if the user is still logged in upon
 * page refreshes, etc. You can refresh this with user profile url or other one
 * 401 -> login
 */
export function acknowledgeUserSession(): Observable<any> {
  return getListClusters({
    offset: 0,
    limit: 5,
    timestamp: new Date().getTime(),
  });
}

export function getEventsCenter(data: any = {}): Observable<WebResponse<ServerAlert<any>>> {
  return fetch$<any>(`${URL}/api/v2/platform/sherlock/palace/events`, fetchParams('POST', JSON.stringify(data)));
}

export function getNodeAlertCount(nodeName: string): Observable<WebResponse<AlertCount>> {
  return fetch$<any>(`${URL}/api/v2/platform/alerts/node?nodeName=${nodeName}`, fetchParams('GET'));
}

export function onlineVulnerabilities(
  pagination: PaginationOptions = {},
): Observable<WebResponse<OnlineVulnerability>> {
  const offset = pagination.offset || 0;
  const limit = pagination.limit || 1000;

  return fetch$<any>(
    `${URL}/api/v2/containerSec/onlineVulnerabilities/current?limit=${limit}&offset=${offset}`,
    fetchParams('GET'),
  );
}
export function getOnlineVulnerabilitiesDetails(
  namespace: string,
  resourceKind: string,
  resourceName: string,
): Observable<WebResponse<OnlineVulnerabilityComplexDetails>> {
  return fetch$<any>(
    `${URL}/api/v2/containerSec/onlineVulnerabilities/details/${namespace}/${resourceKind}/${resourceName}`,
    fetchParams('GET'),
  );
}

export function getMicroserviceVulnerabilities(
  namespace: string,
  resourceKind: string,
  resourceName: string,
): Observable<WebResponse<OnlineVulnerabilityComplexDetails>> {
  return fetch$<any>(
    `${URL}/api/v2/platform/microservice/vulnerabilities/details/${namespace}/${'service'}/${resourceName}`,
    fetchParams('GET'),
  );
}

export function getOnlineVulnerability2ServiceDetails(
  namespace: string,
  resourceName: string,
  resourceKind: string,
  cluster: string,
): Observable<WebResponse<OnlineVulnerabilityServiceDetails>> {
  return fetch$<any>(
    // `${URL}/api/v2/platform/riskExplorer/serviceDetails/${nodeType}/${namespace}/${serviceName}`,
    `${URL}/api/v2/platform/riskExplorer/resourceDetails/namespace/${namespace}/kind/${resourceKind}/name/${resourceName}?cluster=${cluster}`,
    fetchParams('GET'),
  );
}

export function changeRuleState(ruleID: string, state: RuleState): Observable<WebResponse<any>> {
  const newState = state === RuleState.Enable ? 'enable' : 'disable';

  return fetch$<any>(
    `${URL}/api/v2/containerSec/runtimeDetectionConfig/rules/${ruleID}/${newState}`,
    fetchParams('POST'),
  );
}

export function harborScanAllOnline(): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/containerSec/scanner/harbor/scanOnline`, fetchParams('POST'));
}

export function harborScanMic(namespace: string, svcname: string): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/platform/microservice/serviceScan`,
    fetchParams('POST', JSON.stringify({ namespace, svcname })),
  );
}

export function harborAbortScanAll(): Observable<WebResponse<ScanStatus>> {
  return fetch$<any>(`${URL}/api/v2/containerSec/scanner/harbor/abortScanAll`, fetchParams('POST'));
}

export function getScanReportByTaskId(taskId: string): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/containerSec/scanner/report/${taskId}`, fetchParams('GET'));
}

export function getGraphOverall(param: {
  clusterID: string;
  apptype: '' | 'database' | 'web' | 'container';
  namespace?: string;
  resource_kind?: string;
  resource_name?: string;
}): Observable<WebResponse<any>> {
  const { clusterID, apptype } = param;
  return fetch$<any>(
    `${URL}/api/v2/platform/riskExplorer/wholeGraphOverall${parseGetMethodParams({
      ...param,
      cluster: clusterID,
    })}`,
    fetchParams('GET'),
  );
}
export function getNewGraphOverall(data: any): Observable<WebResponse<any>> {
  const { clusterID, apptype } = data;
  return fetch$<any>(
    `${URL}/api/v2/platform/riskExplorer/wholeGraphOverall${parseGetMethodParams({
      cluster: clusterID,
      apptype,
    })}`,
    fetchParams('GET'),
  );
}

export function resetPassword(newPwd: string): Observable<WebResponse<any>> {
  const data = new ResetUserPwd();
  data.pwd = newPwd;
  return fetch$<any>(`${URL}/api/v2/usercenter/resetPassword`, fetchParams('POST', JSON.stringify(data)));
}

export function setUserRole(
  userName: string,
  roleName: string,
  action: string,
): Observable<WebResponse<SetUserRoleResult>> {
  const data = new SetUserRoleFormData();
  data.userName = userName;
  data.roleName = roleName;
  data.action = action;
  return fetch$<any>(`${URL}/api/v1/usercenter/setUserRole`, fetchParams('POST', JSON.stringify(data)));
}

export function setRoleAccess(
  roleName: string,
  accessName: string,
  action: string,
): Observable<WebResponse<SetRoleAccessResult>> {
  const data = new SetRoleAccessFormData();
  data.roleName = roleName;
  data.accessName = accessName;
  data.action = action;

  return fetch$<any>(`${URL}/api/v1/usercenter/setRoleAccess`, fetchParams('POST', JSON.stringify(data)));
}

export function getServiceScanResults(
  sortBy: string,
  sortOrder: string,
  pagination: PaginationOptions = {},
  maxImageAgeInHours = 0,
  nameSpace: string,
  selectType: string,
  selectContent: string,
): Observable<WebResponse<ImageScanSummaryResult>> {
  const offset = pagination.offset || 0;
  const limit = pagination.limit || 30;

  const url = `${URL}/api/v2/microservice/reportsByImage?limit=${limit}&offset=${offset}&sortBy=${sortBy}&sortOrder=${sortOrder}&maxImageAgeInHours=${maxImageAgeInHours}&namespace=${nameSpace}&selecter=${selectType}&svcname=${selectContent}`;
  return fetch$<any>(url, fetchParams()).pipe(
    map((res) => {
      res.setItems(
        (res.data?.items || []).map((t: ImageScanSummaryResult) => {
          return new ImageScanSummaryResult(t);
        }),
      );
      return res;
    }),
  );
}

export function superAdminUserList(data: any): Observable<WebResponse<SuperUser>> {
  return fetch$<any>(`${URL}/api/v2/usercenter/userList${parseGetMethodParams(data)}`, fetchParams('GET'));
}

export function getImagesProblems(data: any): Observable<WebResponse<SuperUser>> {
  return fetch$<any>(`${URL}/api/v2/platform/assets/imageProblems${parseGetMethodParams(data)}`, fetchParams('GET'));
}

export function tensorWallGetRuleStatus(params: TensorWallGetRuleParams) {
  const cdata = { ...params };
  if (params.stype === 'global') {
    cdata.cluster = 'default';
    cdata.namespace = '';
    cdata.service = '';
  } else {
    cdata.cluster = 'default';
  }

  const { cluster, namespace, service, stype, rule_id } = cdata;
  return fetch$<any>(
    `${URL}/api/v1/tensorWall/getRuleStatus?cluster=${cluster}&namespace=${namespace}&service=${service}&stype=${stype}&rule_id=${rule_id}`,
    fetchParams('GET'),
  );
}

export function getUserModule(): Observable<WebResponse<UserModule>> {
  return fetch$<any>(`${URL}/api/v2/usercenter/userModule`, fetchParams('GET'));
}

export function tensorWallSetRule(data: TensorWallSetRuleParams) {
  const cdata = { ...data };
  if (data.stype === 'global') {
    cdata.cluster = 'default';
    cdata.namespace = '';
    cdata.service = '';
    cdata.streenode = '';
  } else {
    cdata.cluster = 'default';
    cdata.streenode = '';
  }

  if (cdata?.reject_response?.http_code) {
    cdata.reject_response.http_code = Number(cdata.reject_response.http_code);
  }

  return fetch$<any>(`${URL}/api/v1/tensorWall/setRule`, fetchParams('POST', JSON.stringify(cdata)));
}

export function getTensorWallEdgeServiceEventsList(data: TensorWallEdgeEventListParams) {
  const { end, start, during } = data;
  const _end = moment(end);
  const _start = start ? moment(start) : _end.clone().subtract(during);

  const u_end = _end.utc().format();
  let u_start = _start.utc().format();

  const sessionKey = 'tensorwallchartstarttime';
  const localStart = window.sessionStorage.getItem(sessionKey);
  if (localStart) {
    const _local_start = moment(localStart).valueOf();
    const dis = moment(u_start).valueOf() - _local_start;
    if (dis > 0 && dis < during) {
      u_start = localStart;
    }
  }
  window.sessionStorage.setItem(sessionKey, u_end);

  const cdata = { ...data };
  if (data.stype === 'global') {
    cdata.namespace = '';
    cdata.service = '';
  }

  return fetch$<any>(
    `${URL}/api/v1/tensorWall/edgeEventList?start=${u_start}&end=${u_end}&step=${
      cdata.step || ''
    }&cluster=${cdata.cluster || ''}&namespace=${cdata.namespace || ''}&service=${
      cdata.service || ''
    }&stype=${cdata.stype || ''}`,
    fetchParams('GET'),
  );
}

export function AddSuperAdmin(data: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/usercenter/addUser`, fetchParams('POST', JSON.stringify(data)));
}

export function editSuperAdmin(data: TEditUserParam): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/usercenter/editUser`, fetchParams('POST', JSON.stringify(data)));
}

export function resetPwd(data: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/usercenter/resetPassword`, fetchParams('POST', JSON.stringify(data)));
}

export function getTensorWallEdgeServiceList(data: TensorWallEdgeEventListParams) {
  const { end, start, during } = data;
  const _end = moment(end);
  const _start = start ? moment(start) : _end.clone().subtract(during);

  const u_end = _end.utc().format();
  let u_start = _start.utc().format();

  const sessionKey = 'tensorwallchartstarttime';
  const localStart = window.sessionStorage.getItem(sessionKey);
  if (localStart) {
    const _local_start = moment(localStart).valueOf();
    const dis = moment(u_start).valueOf() - _local_start;
    if (dis > 0 && dis < during) {
      u_start = localStart;
    }
  }
  window.sessionStorage.setItem(sessionKey, u_end);

  const cdata = { ...data };
  if (data.stype === 'global') {
    cdata.namespace = '';
    cdata.service = '';
  }

  return fetch$<any>(
    `${URL}/api/v1/tensorWall/edgeEventServiceList?start=${u_start}&end=${u_end}&step=${
      cdata.step || ''
    }&cluster=${cdata.cluster || ''}&namespace=${cdata.namespace || ''}&service=${
      cdata.service || ''
    }&stype=${cdata.stype || ''}`,
    fetchParams('GET'),
  );
}

export function tensorEdit(): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v1/tensorWall/edgeServiceEdit`, fetchParams('GET'));
}

export function tensorServiceList(limit = 10, page = 1): Observable<WebResponse<any>> {
  const offset = (page - 1) * 10;
  return fetch$<any>(`${URL}/api/v1/tensorWall/edgeServiceList?limit=${limit}&offset=${offset}`, fetchParams('GET'));
}

export function tensorServiceSearch(limit = 10, page = 0, value = ''): Observable<WebResponse<any>> {
  const offset = (page - 1) * limit;
  return fetch$<any>(
    `${URL}/api/v1/tensorWall/serviceSearch?limit=${limit}&offset=${offset}&&search=${value}`,
    fetchParams('GET'),
  );
}

export function tensorServiceSubmit(
  selectedData: ServiceList[] = [],
): Observable<WebResponse<EdgeServiceSubmitResult>> {
  const data = new EdgeServiceSubmit();
  data.edge = selectedData;
  return fetch$<any>(`${URL}/api/v1/tensorWall/edgeServiceSubmit`, fetchParams('POST', JSON.stringify(data)));
}

export function getEventsCenterStatistics(data: any): Observable<WebResponse<LoginResult>> {
  return fetch$<any>(
    `${URL}/api/v2/platform/eventsCenter/statistics?days=${data.days}&hours=${data.hours}`,
    fetchParams('GET'),
    // { silent: true }
  );
}

export function getEventsCenterSignals(data: any): Observable<WebResponse<LoginResult>> {
  return fetch$<any>(`${URL}/api/v2/platform/eventsCenter/signals${parseGetMethodParams(data)}`, fetchParams('GET'));
}

export function getNodeMapTypeStreamDetails(data: any, type: 'ingress' | 'egress'): Observable<WebResponse<any>> {
  const { Cluster, Namespace, Kind, Resource } = data;
  // 暂时处理，当后台更改后Namespace不会为空，后台设置为_external
  // 时间：2021-06-23 14:43:14

  let oldType = '';
  switch (type) {
    case 'ingress':
      oldType = 'upstream';
      break;
    case 'egress':
      oldType = 'downstream';
      break;
    default:
      oldType = type;
      break;
  }
  return fetch$<any>(
    `${URL}/api/v2/platform/networkTopo/${oldType}/cluster/${Cluster}/namespace/${
      Kind === 'External' ? '_external' : Namespace
    }/kind/${Kind}/resource/${Resource}`,
    fetchParams('GET'),
  );
}

let initPrams = (data: any) => {
  const { Cluster, Namespace, Resource, Kind, cluster, namespace, kind, resource } = data;
  return {
    cluster_key: cluster || Cluster,
    namespace: namespace || Namespace,
    res_name: resource || Resource,
    res_kind: kind || Kind,
  };
};
export interface ResProps {
  cluster_key: string;
  namespace: string;
  res_name: string;
  res_kind: string;
}
export function getResourceStream(
  data: ResProps,
  type: 'ingress' | 'egress',
  day?: '1' | '7' | '30',
): Observable<WebResponse<any>> {
  const dayTime = day || '30';
  return fetch$<any>(
    `${URL}/api/v2/platform/assets/resource/netflow/info${parseGetMethodParams({
      ...data,
      route: type,
      day: dayTime,
    })}`,
    fetchParams('GET'),
  );
}
interface PodProps extends ResProps {
  pod_name: string;
}
export function getPodStream(
  data: PodProps,
  type: 'ingress' | 'egress',
  day?: '1' | '7' | '30',
): Observable<WebResponse<any>> {
  const dayTime = day || '30';
  return fetch$<any>(
    `${URL}/api/v2/platform/assets/pod/netflow/info${parseGetMethodParams({
      ...data,
      route: type,
      day: dayTime,
    })}`,
    fetchParams('GET'),
  );
}
interface ContainerProps extends ResProps {
  container_id: string;
}
export function getContainerStream(
  data: ContainerProps,
  type: 'ingress' | 'egress',
  day?: '1' | '7' | '30',
): Observable<WebResponse<any>> {
  const dayTime = day || '30';
  return fetch$<any>(
    `${URL}/api/v2/platform/assets/container/netflow/info${parseGetMethodParams({
      ...data,
      route: type,
      day: dayTime,
    })}`,
    fetchParams('GET'),
  );
}
interface ProcessProps extends ResProps {
  container_id: string;
  proc_name: string;
}
export function getProcessStream(
  data: ProcessProps,
  type: 'ingress' | 'egress',
  day?: '1' | '7' | '30',
): Observable<WebResponse<any>> {
  const dayTime = day || '30';
  return fetch$<any>(
    `${URL}/api/v2/platform/assets/container/process/netflow/info${parseGetMethodParams({
      ...data,
      route: type,
      day: dayTime,
    })}`,
    fetchParams('GET'),
  );
}

export function getProcessList(data: ResProps): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/platform/assets/container/processlist${parseGetMethodParams(data)}`,
    fetchParams('GET'),
  );
}

export function getNodeMapDownStreamDetails(data: any): Observable<WebResponse<any>> {
  const { Cluster, Namespace, Kind, Resource } = data;
  return fetch$<any>(
    `${URL}/api/v2/platform/networkTopo/downstream/cluster/${Cluster}/namespace/${Namespace}/kind/${Kind}/resource/${Resource}`,
    fetchParams('GET'),
  );
}

export function getEventsCenterSignalProcessTree(data: any): Observable<WebResponse<any>> {
  const { cluster, namespace, podName } = data;
  return fetch$<any>(
    `${URL}/api/v2/platform/eventsCenter/signalProcessTree?cluster=${cluster}&namespace=${namespace}&podName=${podName}`,
    fetchParams('GET'),
  );
}
export function scanConfigStrategies(): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/containerSec/scanner/scan-config/strategies`, fetchParams('GET'));
}
export function deleteScanConfigStrategiesId(data: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}api/v2/containerSec/scanner/scan-config/strategy/${data.id}`, fetchParams('DELETE'));
}
export function scanConfigStrategy(data: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/containerSec/scanner/scan-config/strategy/${data.id}`, fetchParams('GET'));
}
export function postScanConfigStrategy(data: any): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/containerSec/scanner/scan-config/strategy`,
    fetchParams('POST', JSON.stringify(data)),
  );
}
export function scanConfigStrategyId(data: any): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/containerSec/scanner/scan-config/strategy/${data.id}`,
    fetchParams('PUT', JSON.stringify(data)),
  );
}
export function scanConfigConfigId(data: any): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/containerSec/scanner/scan-config/config/${data.id}`,
    fetchParams('PUT', JSON.stringify(data)),
  );
}
export function strategySoftWare({ data, id }: any): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/containerSec/scanner/scan-config/strategy/${id}/soft-ware`,
    fetchParams('POST', JSON.stringify(data)),
  );
}

export function strategyOpenSources(): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/containerSec/scanner/scan-config/strategy/open-sources`, fetchParams('GET'));
}

export function imagerejectOverview(data: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/scanner/deploy/overview${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('GET'));
}
export function deployBlockTrend(): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/scanner/deploy/blockTrend`;
  return fetch$<any>(url, fetchParams('GET'));
}
export function deployReasonTop5(data: { [key: string]: any }): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/scanner/deploy/reasonTop5${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('GET'));
}
export function getRegistrieLibrary(): Observable<string[] | undefined> {
  const url = `${URL}/api/v2/containerSec/scanner/syncImage/registries`;
  return fetch$<any>(url, fetchParams('GET')).pipe(
    map((res) => {
      return res.data?.items;
    }),
  );
}
export function getRegistrieNodeHostnames(): Observable<string[] | undefined> {
  const url = `${URL}/api/v2/containerSec/scanner/scan-config/strategy/node-hostnames`;
  return fetch$<any>(url, fetchParams('GET')).pipe(
    map((res) => {
      return res.data?.items;
    }),
  );
}

export function deployRecord(data: { [key: string]: any }): Observable<WebResponse<ImageRejectImage>> {
  const url = `${URL}/api/v2/containerSec/scanner/deploy/record${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('POST', JSON.stringify(data)));
}

export function imagerejectImageWhite(data: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/scanner/deploy/whiteImage${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('GET'));
}
export function deploywhiteImage(data: any): Observable<WebResponse<boolean>> {
  const url = `${URL}/api/v2/containerSec/scanner/deploy/whiteImage`;
  return fetch$<any>(url, fetchParams('POST', JSON.stringify(data)));
}
export function putDeployWhiteImage(data: any): Observable<WebResponse<any>> {
  let { id, ...otherData } = data;
  const url = `${URL}/api/v2/containerSec/scanner/deploy/whiteImage?id=${id}`;
  return fetch$<any>(url, fetchParams('PUT', JSON.stringify(otherData)));
}

export function imagerejectRemoveWhite(data: any): Observable<WebResponse<boolean>> {
  let { id, ...otherData } = data;
  const url = `${URL}/api/v2/containerSec/scanner/deploy/whiteImage?id=${id}`;
  return fetch$<any>(url, fetchParams('DELETE'));
}

export function imageRejectRulePolices(): Observable<WebResponse<ImageRejectRuleConfigPolicie>> {
  const url = `${URL}/api/v2/containerSec/scanner/imagereject/policy/single`;
  return fetch$<any>(url, fetchParams('GET'));
}

export function imageRejectRegistriesApi(no_policy = true): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/scanner/syncImage/registries?no_policy=${no_policy}`;
  return fetch$<any>(url, fetchParams('GET'));
}
export function scanTasks(data: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/scanner/tasks${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('GET'));
}
export function scanTasksId(data: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/scanner/tasks/${data.id}/subtasks${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('GET'));
}
export function scanTasksIdStatus(data: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/scanner/tasks/${data.id}/status`;
  return fetch$<any>(url, fetchParams('PUT', JSON.stringify(data)));
}

export function imageRejectPolicy(data: any = {}): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/containerSec/scanner/imagereject/policy/single`,
    fetchParams('POST', JSON.stringify(data)),
  );
}

export function imageRejectPolicyUpdate(data: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/scanner/imagereject/policy/global`;
  return fetch$<any>(url, fetchParams('PUT', JSON.stringify(data)));
}

export function imageRejectRuleConfig(): Observable<WebResponse<ImageRejectRuleConfigRes>> {
  const url = `${URL}/api/v2/containerSec/scanner/imagereject/policy/global`;
  return fetch$<any>(url, fetchParams('GET'));
}

export function imageRejectPolicyItemUpdate(data: ImageRejectRuleConfigPolicie): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/scanner/imagereject/policy/single/${data.id}`;
  return fetch$<any>(url, fetchParams('PUT', JSON.stringify(data)));
}

export function imageRejectPolicyDelete(id: number): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/scanner/imagereject/policy/single/${id}`;
  return fetch$<any>(url, fetchParams('DELETE'));
}

export function clusterSegments(
  cluster: string,
  pagination: PaginationOptions = {},
  search?: string,
): Observable<WebResponse<ClusterSegmentInfo>> {
  const offset = pagination.offset || 0;
  const limit = pagination.limit || 10;

  const url = `${URL}/api/v2/microseg/clusters/${cluster}/segments?limit=${limit}&offset=${offset}${
    search ? `&search=${search}` : ''
  }`;
  return fetch$<any>(url, fetchParams('GET', null, { loginUser: getUserInformation().username }));
}

export function clusterNamespaces(cluster: string): Observable<WebResponse<ClusterNamespace>> {
  const url = `${URL}/api/v2/microseg/clusters/${cluster}/namespaces`;
  return fetch$<any>(url, fetchParams('GET'));
}

export function clusterGraphResources(pagination?: PaginationOptions, param?: any): Observable<WebResponse<any>> {
  const offset = pagination?.offset || 0;
  const limit = pagination?.limit || 100;
  const { clusterID, ...obj } = param;
  const url = `${URL}/api/v2/platform/assets/resources/fuzz${parseGetMethodParams({
    cluster_key: clusterID,
    ...obj,
    limit,
    offset,
  })}`;
  return fetch$<any>(url, fetchParams('GET'));
}

export function clusterGraphPods(
  pagination?: PaginationOptions,
  param?: any,
): Observable<WebResponse<ClusterNamespace>> {
  const offset = pagination?.offset || 0;
  const limit = pagination?.limit || 100;
  const { cluster, resource, PodIP, updatedAt, ...obj } = param;
  const { start, end } = updatedAt || {};
  const data = {
    cluster_key: cluster,
    resource_name: resource,
    pod_ip: PodIP,
    start_time: start,
    end_time: end,
    ...obj,
    limit,
    offset,
  };
  const url = `${URL}/api/v2/platform/assets/pods${parseGetMethodParams(data)}`;
  // return fetch$<any>(url, fetchParams('POST', JSON.stringify(data)));
  return fetch$<any>(url, fetchParams('GET'));
}

export function clusterGraphNodes(param?: any, pagination?: PaginationOptions): Observable<WebResponse<any>> {
  const offset = pagination?.offset || 0;
  const limit = pagination?.limit || 10000;
  const { clusterID, search, NodeIP, ...obj } = param;
  const url = `${URL}/api/v2/platform/assets/nodes${parseGetMethodParams({
    cluster_key: clusterID,
    name: search,
    ip: NodeIP,
    ...obj,
    limit,
    offset,
  })}`;
  return fetch$<any>(url, fetchParams('GET'));
}

export function assetsApplications(param?: any, pagination?: PaginationOptions): Observable<WebResponse<any>> {
  const offset = pagination?.offset || 0;
  const limit = pagination?.limit || 10000;
  const url = `${URL}/api/v2/platform/assets/applications${parseGetMethodParams({
    ...param,
    limit,
    offset,
  })}`;
  return fetch$<any>(url, fetchParams('GET'));
}

export function assetsApplicationsVersion(param?: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/platform/assets/applications/versions${parseGetMethodParams({
    ...param,
  })}`;
  return fetch$<any>(url, fetchParams('GET'));
}

export function assetsApplicationsTargets(param?: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/platform/assets/applications/targets${parseGetMethodParams({
    ...param,
  })}`;
  return fetch$<any>(url, fetchParams('GET'));
}

export function clusterAssetsNodes(
  cluster_key?: string,
  query?: string,
  pagination?: PaginationOptions,
): Observable<WebResponse<any>> {
  const offset = pagination?.offset || 0;
  const limit = pagination?.limit || 10000;
  const url = `${URL}/api/v2/platform/assets/nodes${parseGetMethodParams({
    cluster_key,
    query,
    limit,
    offset,
  })}`;
  return fetch$<any>(url, fetchParams('GET'));
}

export function clusterAssetsNamespaces(
  param?: any,
  pagination?: PaginationOptions,
): Observable<WebResponse<AssetsNameSpace>> {
  const offset = pagination?.offset || 0;
  const limit = pagination?.limit || 10000;
  const { clusterID, search, hideTags, idList } = param;
  const url = `${URL}/api/v2/platform/assets/namespaces${parseGetMethodParams({
    cluster_key: clusterID,
    name: search,
    limit,
    offset,
    hideTags,
    idList,
  })}`;
  return fetch$<any>(url, fetchParams('GET'));
}

export function clusterAssetsResources(
  cluster_key: string,
  ns: string,
  query?: string,
  pagination?: PaginationOptions,
): Observable<WebResponse<AssetsNameSpace>> {
  const offset = pagination?.offset || 0;
  const limit = pagination?.limit || 10000;
  const url = `${URL}/api/v2/platform/assets/namespace/${ns}/kind/${'_'}/resources${parseGetMethodParams({
    cluster_key,
    query,
    limit,
    offset,
  })}`;
  return fetch$<any>(url, fetchParams('GET'));
}

export function updataClusterNamespaces(data: any): Observable<WebResponse<AssetsNameSpace>> {
  const url = `${URL}/api/v2/platform/assets/namespace`;
  return fetch$<any>(url, fetchParams('POST', JSON.stringify(data)));
}

export function clusterNamespaceSegments(
  cluster: string,
  namespace: string,
): Observable<WebResponse<ClusterSegmentInfo>> {
  const url = `${URL}/api/v2/microseg/clusters/${cluster}/namespaces/${namespace}/segments`;
  return fetch$<any>(url, fetchParams('GET'));
}

export function clusterNamespaceNewSegment(
  cluster: string,
  namespace: string,
  newSegmentName: string,
): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/microseg/clusters/${cluster}/namespaces/${namespace}/segments`;
  return fetch$<any>(url, fetchParams('POST', JSON.stringify({ name: newSegmentName })));
}

export function clusterNamespaceDeleteSegment(
  cluster: string,
  namespace: string,
  segmentName: string,
): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/microseg/clusters/${cluster}/namespaces/${namespace}/segments/${segmentName}`;
  return fetch$<any>(url, fetchParams('DELETE'));
}

export function clusterNamespaceUpdateSegment(
  cluster: string,
  namespace: string,
  segmentName: string,
  data: ClusterResourceInfo[] = [],
): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/microseg/clusters/${cluster}/namespaces/${namespace}/segments/${segmentName}`;

  return fetch$<any>(
    url,
    fetchParams(
      'PUT',
      JSON.stringify({
        resources: data,
      }),
    ),
  );
}

export function clusterNamespaceResourcess(
  cluster: string,
  namespace: string,
): Observable<WebResponse<ClusterResourceInfo>> {
  const url = `${URL}/api/v2/microseg/clusters/${cluster}/namespaces/${namespace}/resources`;
  return fetch$<any>(url, fetchParams('GET'));
}

export function clusterAssetsNamespaceResourcess(
  cluster_key: string,
  namespace: string,
  kind?: RunTimePolicyResourceKind,
  query?: string,
  pagination?: PaginationOptions,
): Observable<WebResponse<AssetsNameSpaceResource>> {
  const offset = pagination?.offset || 0;
  const limit = pagination?.limit || 10000;
  const url = `${URL}/api/v2/platform/assets/namespace/${namespace}/kind/${kind || '_'}/resources${parseGetMethodParams(
    {
      cluster_key,
      query,
      limit,
      offset,
    },
  )}`;
  return fetch$<any>(url, fetchParams('GET'));
}

export function clusterNamespaceTopology(
  cluster: string,
  namespace: string,
): Observable<WebResponse<ClusterResourceHasEI>> {
  const url = `${URL}/api/v2/microseg/clusters/${cluster}/namespaces/${namespace}/topology`;
  return fetch$<any>(url, fetchParams('GET'));
}

export function segmentRuleStatus(
  cluster: string,
  namespace: string,
  segmentName: string,
): Observable<
  WebResponse<{
    enable?: 0 | 1;
    revision?: number;
  }>
> {
  const url = `${URL}/api/v2/microseg/clusters/${cluster}/namespaces/${namespace}/segments/${segmentName}/policy/enabling`;
  return fetch$<any>(url, fetchParams('GET'));
}

export function segmentRuleStatusChange(
  cluster: string,
  namespace: string,
  segmentName: string,
  enable: 0 | 1,
  revision?: number,
): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/microseg/clusters/${cluster}/namespaces/${namespace}/segments/${segmentName}/policy/enabling`;

  return fetch$<any>(url, fetchParams('PUT', JSON.stringify({ enable, revision })));
}

export function getSegmentPolicy(
  cluster: string,
  namespace: string,
  segmentName: string,
): Observable<WebResponse<SegmentPolicyRes>> {
  const url = `${URL}/api/v2/microseg/clusters/${cluster}/namespaces/${namespace}/segments/${segmentName}/policy`;
  return fetch$<any>(url, fetchParams('GET'));
}

export function saveSegmentPolicy(
  cluster: string,
  namespace: string,
  segmentName: string,
  data: {
    rules: any[];
    status: 0 | 1;
    revision?: number;
    operator: string;
    allowExternal?: boolean;
  },
): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/microseg/clusters/${cluster}/namespaces/${namespace}/segments/${segmentName}/policy`;

  return fetch$<any>(url, fetchParams('POST', JSON.stringify(data)));
}

export function getSegmentPolicySuggest(
  cluster: string,
  namespace: string,
  segmentName: string,
): Observable<WebResponse<SegmentPolicy>> {
  const url = `${URL}/api/v2/microseg/clusters/${cluster}/namespaces/${namespace}/segments/${segmentName}/suggestion`;
  return fetch$<any>(url, fetchParams('GET'));
}

export function SegmentTopology(
  cluster: string,
  namespace: string,
  segment: string,
): Observable<WebResponse<ClusterResourceHasEI>> {
  const url = `${URL}/api/v2/microseg/clusters/${cluster}/namespaces/${namespace}/segments/${segment}/topology`;
  return fetch$<any>(url, fetchParams('GET'));
}

export function clusterResources(
  cluster: string,
  pagination: PaginationOptions = {},
  search?: string,
): Observable<WebResponse<ClusterResourceInfo>> {
  const offset = pagination.offset || 0;
  const limit = pagination.limit || 10;

  const url = `${URL}/api/v2/microseg/clusters/${cluster}/resources?limit=${limit}&offset=${offset}${
    search ? `&search=${search}` : ''
  }`;
  return fetch$<any>(url, fetchParams('GET', null, { loginUser: getUserInformation().username }));
}

export function resourceRuleStatus(
  cluster: string,
  namespace: string,
  resource: string,
  kind: ResourceTyps,
): Observable<
  WebResponse<{
    enable?: 0 | 1;
    revision?: number;
  }>
> {
  const url = `${URL}/api/v2/microseg/clusters/${cluster}/namespaces/${namespace}/kinds/${kind}/resources/${resource}/policy/enabling`;
  return fetch$<any>(url, fetchParams('GET'));
}

export function resourceTagInfras(cluster: string): Observable<WebResponse<ClusterResourceInSeg>> {
  const url = `${URL}/api/v2/microseg/clusters/${cluster}/resourceTag/infras`;
  return fetch$<any>(url, fetchParams('GET'));
}

export function putResourceTagInfras(
  cluster: string,
  resources: ClusterResourceInfo[],
): Observable<WebResponse<ClusterResourceInSeg>> {
  const url = `${URL}/api/v2/microseg/clusters/${cluster}/resourceTag/infras`;
  return fetch$<any>(url, fetchParams('PUT', JSON.stringify({ resources })));
}

export function resourceTagGateWays(cluster: string): Observable<WebResponse<ClusterResourceInSeg>> {
  const url = `${URL}/api/v2/microseg/clusters/${cluster}/resourceTag/gateways`;
  return fetch$<any>(url, fetchParams('GET'));
}

export function putResourceTagGateWays(
  cluster: string,
  resources: ClusterResourceInfo[],
): Observable<WebResponse<ClusterResourceInSeg>> {
  const url = `${URL}/api/v2/microseg/clusters/${cluster}/resourceTag/gateways`;
  return fetch$<any>(url, fetchParams('PUT', JSON.stringify({ resources })));
}

export function resourceRuleStatusChange(
  cluster: string,
  namespace: string,
  resource: string,
  kind: ResourceTyps,
  enable: 0 | 1,
  revision?: number,
): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/microseg/clusters/${cluster}/namespaces/${namespace}/kinds/${kind}/resources/${resource}/policy/enabling`;

  return fetch$<any>(url, fetchParams('PUT', JSON.stringify({ enable, revision })));
}

export interface SegmentPolicyRes {
  allowExternal: boolean;
  creator: string;
  revision?: number;
  rules: SegmentPolicy[];
  total: number;
  updateTime: string;
  updater: string;
}

export function getResourcePolicy(
  cluster: string,
  namespace: string,
  resource: string,
  kind: ResourceTyps,
): Observable<WebResponse<SegmentPolicyRes>> {
  const url = `${URL}/api/v2/microseg/clusters/${cluster}/namespaces/${namespace}/kinds/${kind}/resources/${resource}/policy`;
  return fetch$<any>(url, fetchParams('GET'));
}

export function getResourcePolicySuggest(
  cluster: string,
  namespace: string,
  resource: string,
  kind: ResourceTyps,
): Observable<WebResponse<SegmentPolicy>> {
  const url = `${URL}/api/v2/microseg/clusters/${cluster}/namespaces/${namespace}/kinds/${kind}/resources/${resource}/suggestion`;
  return fetch$<any>(url, fetchParams('GET'));
}

export function saveResourcePolicy(
  cluster: string,
  namespace: string,
  resource: string,
  kind: ResourceTyps,
  data: {
    rules: any[];
    status: 0 | 1;
    revision?: number;
    operator: string;
    allowExternal?: boolean;
  },
): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/microseg/clusters/${cluster}/namespaces/${namespace}/kinds/${kind}/resources/${resource}/policy`;

  return fetch$<any>(url, fetchParams('POST', JSON.stringify(data)));
}

export function ResourceTopology(
  cluster: string,
  namespace: string,
  resource: string,
  kind: ResourceTyps,
): Observable<WebResponse<ClusterResourceHasEI>> {
  const url = `${URL}/api/v2/microseg/clusters/${cluster}/namespaces/${namespace}/kinds/${kind}/resources/${resource}/topology`;
  return fetch$<any>(url, fetchParams('GET'));
}

export function clusterNamespaceNewResource(
  cluster: string,
  namespace: string,
  resource: string,
  kind: ResourceTyps,
): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/microseg/clusters/${cluster}/namespaces/${namespace}/kinds/${kind}/resources`;
  return fetch$<any>(url, fetchParams('POST', JSON.stringify({ name: resource })));
}

export function microSegmentationResourceConnections(
  resource: CalicoResource,
  direction: 'egress' | 'ingress' = 'egress',
): Observable<WebResponse<CalicoConnection>> {
  return fetch$<any>(
    `${URL}/api/v2/microsegmentation/engine/resources/${resource.type}:${resource.namespace}:${resource.name}/connections/${direction}`,
    fetchParams('GET'),
  );
}

export function microSegmentationSegments(): Observable<WebResponse<CalicoSegment>> {
  return fetch$<any>(`${URL}/api/v2/microsegmentation/engine/segments`, fetchParams('GET'));
}

export function microsegServiceResources(cluster: string, header: any): Observable<WebResponse<MicrosegResources>> {
  return fetch$<any>(`${URL}/api/v2/microseg/clusters/${cluster}/resources`, fetchParams('GET', null, header));
}
export function scanConfigGlobal(data?: any): Observable<WebResponse<MicrosegResources>> {
  return fetch$<any>(`${URL}/api/v2/containerSec/scanner/scan-config/config/global`, fetchParams('GET'));
}

export function microsegServiceResourcesConnections(
  resource: any,
  direction: 'egress' | 'ingress' = 'egress',
): Observable<WebResponse<MicrosegResources[]>> {
  const { cluster, namespace, kind, name } = resource;
  const url = `${URL}/api/v2/microseg/clusters/${cluster}/namespaces/${namespace}/kinds/${kind}/resources/${name}/${direction}`;
  return fetch$<any>(url, fetchParams('GET'));
}

export function assetsResourceDetail(
  namespace: string,
  kind: string,
  resource_name: string,
  cluster_key: string,
  pagination?: PaginationOptions,
  query?: string,
): Observable<WebResponse<AssetsResourceContainer>> {
  const offset = pagination?.offset || 0;
  const limit = pagination?.limit || 10000;
  const url = `${URL}/api/v2/platform/assets/namespace/${namespace}/kind/${kind}/resource/${resource_name}/containers${parseGetMethodParams(
    {
      cluster_key,
      query,
      limit,
      offset,
    },
  )}`;
  return fetch$<any>(url, fetchParams('GET'));
}

let formatParameter = (p: any) => {
  let str = '';
  Object.keys(p).forEach((item) => {
    str = str + `&${item}=${p[item]}`;
  });
  return str.substring(1);
};

export function ATTCKRuleList(resource: any): Observable<WebResponse<MicrosegResources[]>> {
  const url = `${URL}/api/v2/containerSec/ATTCK/ruleList?${formatParameter(resource)}`;
  return fetch$<any>(url, fetchParams('GET'));
}

export function ATTCKRuleSwitch(data: any): Observable<WebResponse<MicrosegResources[]>> {
  const url = `${URL}/api/v2/containerSec/ATTCK/ruleSwitch`;
  return fetch$<any>(url, fetchParams('POST', JSON.stringify(data)));
}

export function versionSystem(): Observable<WebResponse<MicrosegResources[]>> {
  const url = `${URL}/api/v2/platform/version/system`;
  return fetch$<any>(url, fetchParams('GET'));
}

export function versionATTCK(): Observable<WebResponse<MicrosegResources[]>> {
  const url = `${URL}/api/v2/platform/version/ATTCK`;
  return fetch$<any>(url, fetchParams('GET'));
}

export function versionATTCKHistory(data: any): Observable<WebResponse<MicrosegResources[]>> {
  const url = `${URL}/api/v2/platform/version/ATTCKHistory${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('GET'));
}

export function configATTCK(data: any): Observable<WebResponse<MicrosegResources[]>> {
  const url = `${URL}/api/v2/containerSec/ATTCK/conf`;
  return fetch$<any>(url, {
    method: 'PUT',
    headers: {
      ...AuthorizationData(),
      'Accept-Language': getCurrentLanguage(),
    },
    body: data,
    selector: (res: any) => {
      try {
        return res.json();
      } catch (err) {
        return { error: { message: 'Unknown error' } };
      }
    },
  });
}

// 获取自定义配置列表
export function customConfigs(resource: any): Observable<WebResponse<TCustomConfigs[]>> {
  const url = `${URL}/api/v2/containerSec/ATTCK/customConfigs/configs?${formatParameter({
    offset: 0,
    limit: 10,
    ...resource,
  })}`;
  return fetch$<TCustomConfigs[]>(url, fetchParams('GET'));
}

export function customInitConfig(): Observable<WebResponse<TCustomConfigs[]>> {
  const url = `${URL}/api/v2/containerSec/ATTCK/customInitConfig`;
  return fetch$<TCustomConfigs[]>(url, fetchParams('GET'));
}

// 编辑自定义配置
// export function ruleConfigsEdit(
//   resource: TRulefigEditReqParams
// ): Observable<WebResponse<any>> {
//   const url = `${URL}/api/v2/containerSec/ATTCK/customConfig/configs`;
//   return fetch$<any>(url, fetchParams('PUT', JSON.stringify(resource)));
// }
export function ruleConfigsEdit(resource: TRulefigEditReqParams): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/ATTCK/customConfigs/configs/edit`;
  return fetch$<any>(url, fetchParams('PUT', JSON.stringify(resource)));
}

//新增自定义配置
// export function customConfigEdit(
//   resource: TCustomConfigEditReqParams
// ): Observable<WebResponse<any>> {
//   const url = `${URL}/api/v2/containerSec/ATTCK/customConfigs/configs`;
//   return fetch$<any>(url, fetchParams('POST', JSON.stringify(resource)));
// }
export function customConfigAppend(resource: TCustomConfigEditReqParams): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/ATTCK/customConfigs/configs/append`;
  return fetch$<any>(url, fetchParams('PUT', JSON.stringify(resource)));
}

export function customConfigsDelete(id: number): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/ATTCK/customConfigs/config/${id}`;
  return fetch$<any>(url, fetchParams('DELETE'));
}

export function vulnsUpdata(data: any): Observable<WebResponse<MicrosegResources[]>> {
  const url = `${URL}/api/v2/containerSec/scanner/vulns/updata`;
  return fetch$<any>(url, {
    method: 'PUT',
    headers: {
      ...AuthorizationData(),
      'Accept-Language': getCurrentLanguage(),
    },
    body: data,
    selector: (res: any) => {
      try {
        return res.json();
      } catch (err) {
        return { error: { message: 'Unknown error' } };
      }
    },
  });
}

export function eventsCenterConfig(data?: any): Observable<WebResponse<MicrosegResources[]>> {
  const url = `${URL}/api/v2/platform/eventsCenter/config`;
  return fetch$<any>(url, fetchParams('GET'));
}
export function apiScanClusters(data?: any): Observable<WebResponse<MicrosegResources[]>> {
  const url = `${URL}/api/v2/platform/apiscan/clusters/${data.clusterkey}/apis${formatGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('GET'));
}

export function clusterGraphApis(param?: any, pagination?: PaginationOptions): Observable<WebResponse<any>> {
  const offset = pagination?.offset || 0;
  const limit = pagination?.limit || 10000;
  const { clusterID, cluster, ...obj } = param;
  const url = `${URL}/api/v2/platform/apiscan/apis${parseGetMethodParams({
    cluster_key: clusterID || cluster,
    cluster: cluster,
    ...obj,
    limit,
    offset,
  })}`;
  return fetch$<any>(url, fetchParams('GET'));
}

export function apiScanClustersId(data?: any): Observable<WebResponse<MicrosegResources[]>> {
  const url = `${URL}/api/v2/platform/apiscan/clusters/${data.clusterkey}/apis/${data.id}`;
  return fetch$<any>(url, fetchParams('GET'));
}
///api/v2/platform/apiscan/clusters/{cluster key}/apis/{api id}
export function postEventsCenterConfig(data: any): Observable<WebResponse<MicrosegResources[]>> {
  const url = `${URL}/api/v2/platform/eventsCenter/config`;
  return fetch$<any>(url, fetchParams('POST', JSON.stringify(data)));
}

export function getCaptchaImage(captchaID: string, reloadCaptcha: boolean): Observable<WebResponse<any>> {
  const data = { captchaID, reloadCaptcha };
  const url = `${URL}/api/v2/usercenter/getCaptchaImage`;
  return fetch$<any>(
    url,
    fetchFile('POST', JSON.stringify(data)),
    {
      silent: false,
    },
    true,
  );
}

export function userUnban(user: string): Observable<WebResponse<any>> {
  const data = { user };
  const url = `${URL}/api/v2/usercenter/user/unban`;
  return fetch$<any>(url, fetchParams('POST', JSON.stringify(data)));
}

export function userBan(user: string): Observable<WebResponse<any>> {
  const data = { user };
  const url = `${URL}/api/v2/usercenter/user/ban`;
  return fetch$<any>(url, fetchParams('POST', JSON.stringify(data)));
}

export function platformAudit(data: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/platform/audit${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('GET'));
}

export function getKubeHunter(cluster: string): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/platform/hunter/?cluster=${cluster}`;
  return fetch$<any>(url, fetchParams('GET'));
}

export function startHunterScan(data: { cluster: string }): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/platform/hunter/scan`;
  return fetch$<any>(url, fetchParams('POST', JSON.stringify(data)));
}

export function getHunterStatus(cluster: string): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/platform/hunter/status?cluster=${cluster}`;
  // return fetch$<any>(url, fetchParams('GET'));
  return timer(0, 5000).pipe(
    switchMap(() => {
      return fetch$<any>(url, fetchParams('GET'), { silent: true });
    }),
  );
}

export function auditConfig(): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/platform/audit/config`;
  return fetch$<any>(url, fetchParams('GET'));
}

export function postAuditConfig(data: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/platform/audit/config`;
  return fetch$<any>(url, fetchParams('POST', JSON.stringify(data)));
}

export function getLoginConfig(): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/usercenter/loginConfig`;
  return fetch$<any>(url, fetchParams('GET'));
}

export function setLoginConfig(rateLimitEnable: number, rateLimitThreshold: number): Observable<WebResponse<any>> {
  const data = {
    rateLimitEnable,
    rateLimitThreshold,
    rateLimitWindowSecs: 300,
  };
  const url = `${URL}/api/v2/usercenter/loginConfig`;
  return fetch$<any>(url, fetchParams('POST', JSON.stringify(data)));
}

export function getTypeLoginConfig(type: 'ldap' | 'radius'): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/usercenter/config/${type}`;
  return fetch$<any>(url, fetchParams('GET'));
}

export function ldapUploadFile(data: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/usercenter/config/ldap/cert`;
  return fetch$<any>(url, {
    method: 'POST',
    headers: {
      ...AuthorizationData(),
      'Accept-Language': getCurrentLanguage(),
    },
    body: data,
    selector: (res: any) => {
      try {
        return res.json();
      } catch (err) {
        return { error: { message: 'Unknown error' } };
      }
    },
  });
}

export function setTypeLoginConfig(type: 'ldap' | 'radius', data: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/usercenter/config/${type}`;
  return fetch$<any>(url, fetchParams('POST', JSON.stringify(data)));
}

export function getLoginType(): Observable<
  WebResponse<{
    options: ('normal' | 'ldap' | 'radius')[];
    cycleChangePwd: boolean;
    emailEnabled: boolean;
  }>
> {
  const url = `${URL}/api/v2/usercenter/config/loginOption`;
  return fetch$<any>(url, fetchParams('GET'));
}

export function createCaptcha(): Observable<WebResponse<TCaptchaData>> {
  const url = `${URL}/api/v2/usercenter/createCaptcha`;
  return fetch$<any>(url, fetchParams('POST', JSON.stringify({})));
}

// api/v2/usercenter/ldapGroup
export function ldapGroup(data: any): Observable<WebResponse<any[]>> {
  // const { offset = 0, limit = 10 } = pagination;
  const url = `${URL}api/v2/usercenter/ldapGroup${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('GET'));
}

export function postLdapGroup(data: any): Observable<WebResponse<any>> {
  const url = `${URL}api/v2/usercenter/ldapGroup`;
  return fetch$<any>(url, fetchParams('POST', JSON.stringify(data)));
}

export function putLdapGroup(data: any): Observable<WebResponse<any>> {
  const url = `${URL}api/v2/usercenter/ldapGroup`;
  return fetch$<any>(url, fetchParams('PUT', JSON.stringify(data)));
}

export function delectLdapGroup(data: { id: string | number }): Observable<WebResponse<any>> {
  const url = `${URL}api/v2/usercenter/ldapGroup`;
  return fetch$<any>(url, fetchParams('DELETE', JSON.stringify(data)));
}

export function getHistory(d?: any): Observable<WebResponse<any>> {
  const data = WebResponse.from({ data: { status: 'ok' } } as any);
  return of(data).pipe();
}

export function getReourceList(clusterKey: string, pageParams: any): Observable<WebResponse<any>> {
  const { offset = 0, limit = 10, query } = pageParams;
  const url = `${URL}/api/v2/containerSec/immune/resources?cluster_key=${clusterKey}&offset=${offset}&limit=${limit}&query=${query}`;
  return fetch$<any>(url, fetchParams('GET'));
}

export function launchLearn(resUUID: string, policyKind: string, duration: number): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/immune/resource/${resUUID}/learning/kind/${policyKind}/start/`;
  return fetch$<any>(url, fetchParams('PUT', JSON.stringify({ durationSec: duration })));
}

export function learnStatus(resUUID: string): Observable<WebResponse<any>> {
  const intervalTime = 5000;
  const url = `${URL}/api/v2/containerSec/immune/resource/${resUUID}/learning/state/`;
  return interval(intervalTime).pipe(switchMap(() => fetch$<any>(url, fetchParams('GET'), { silent: true })));
}

export function putAddCluster(data: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/platform/assets/cluster`;
  return fetch$<any>(url, fetchParams('PUT', JSON.stringify(data)));
}

export function editAddCluster(data: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/platform/assets/cluster`;
  return fetch$<any>(url, fetchParams('POST', JSON.stringify(data)));
}

export function openAPIToken(resource?: any): Observable<WebResponse<any[]>> {
  const url = `${URL}/api/v2/usercenter/openapi/token`;
  return fetch$<any>(url, fetchParams('GET'));
}

export function getNamespacesCount(): Observable<WebResponse<GraphListCount>> {
  const url = `${URL}/api/v2/platform/assets/namespaces/count`;
  return fetch$<any>(url, fetchParams('GET'));
}

export function getResourceCount(): Observable<WebResponse<GraphListCount>> {
  const url = `${URL}/api/v2/platform/assets/resources/count`;
  return fetch$<any>(url, fetchParams('GET'));
}

export function getContainersCount(): Observable<WebResponse<GraphListCount>> {
  const url = `${URL}/api/v2/platform/assets/containers/count`;
  return fetch$<any>(url, fetchParams('GET'));
}
export function assetsFrameworks(data: any): Observable<WebResponse<GraphListCount>> {
  const url = `${URL}/api/v2/platform/assets/frameworks?${formatParameter(data)}`;
  return fetch$<any>(url, fetchParams('GET'));
}
export function getPodsCount(): Observable<WebResponse<GraphListCount>> {
  const url = `${URL}/api/v2/platform/assets/pods/count`;
  return fetch$<any>(url, fetchParams('GET'));
}

export function getGraphAllTypeCount(type: string, data?: any): Observable<WebResponse<GraphListCount>> {
  const url = `${URL}/api/v2/platform/assets/${type}/count${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('GET'));
}

export function getPodsList(
  cluster_key: string,
  node_name: string,
  limit: number,
  offset: number,
): Observable<WebResponse<GraphListCount>> {
  const url = `${URL}/api/v2/platform/assets/pods/${parseGetMethodParams({
    cluster_key,
    node_name,
    limit: 100,
    offset: 0,
  })}`;
  return fetch$<any>(url, fetchParams('GET'));
}

export function getResourcePods(
  cluster_key: string,
  namespace: string,
  resourceKind: string,
  resourceName: string,
  limit: number,
  offset: number,
  query?: string,
): Observable<WebResponse<GraphListCount>> {
  const url = `${URL}/api/v2/platform/assets/pods${parseGetMethodParams({
    cluster_key,
    namespace,
    resource_kind: resourceKind,
    resource_name: resourceName,
    limit,
    offset,
    query,
  })}`;
  return fetch$<any>(url, fetchParams('GET'));
}

export function getContainerDetails(
  cluster_key: string,
  namespace: string,
  resourceKind: string,
  resourceName: string,
  limit: number,
  offset: number,
  query?: string,
): Observable<WebResponse<GraphListCount>> {
  const url = `${URL}/api/v2/platform/assets/namespace/${namespace}/kind/${resourceKind}/resource/${resourceName}/containers${parseGetMethodParams(
    {
      cluster_key,
      query,
      limit,
      offset,
    },
  )}`;
  return fetch$<any>(url, fetchParams('GET'));
}

export function updataResource(data?: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/platform/assets/resource/userData`;
  return fetch$<any>(url, fetchParams('POST', JSON.stringify(data)));
}

export function recordAction(data?: any): Observable<WebResponse<any[]>> {
  const url = `${URL}/api/v2/platform/processingCenter/record/action`;
  return fetch$<any>(url, fetchParams('POST', JSON.stringify(data)));
}
export function getClustersId(data?: any): Observable<WebResponse<any[]>> {
  const url = `${URL}/api/v2/platform/apiscan/clusters/${data.clusterId}/apis/${data.id}${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('GET'));
}
export function getClustersIdReport(data?: any): Observable<WebResponse<any[]>> {
  const url = `${URL}/api/v2/platform/apiscan/clusters/${data.clusterId}/apis/${data.id}/report`;
  return fetch$<any>(url, fetchParams('GET'));
}
export function getClustersIdScanstatus(data?: any): Observable<WebResponse<any[]>> {
  const url = `${URL}/api/v2/platform/apiscan/clusters/${data.clusterId}/apis/${data.id}/scanstatus`;
  return fetch$<any>(url, fetchParams('GET'));
}
export function getApisCount(data?: any): Observable<WebResponse<any[]>> {
  const url = `${URL}/api/v2/platform/apiscan/apis/count`;
  return fetch$<any>(url, fetchParams('GET'));
}

export function postClustersIdScan(data?: any): Observable<WebResponse<any[]>> {
  const url = `${URL}/api/v2/platform/apiscan/clusters/${data.clusterId}/apis/${data.id}/scan`;
  return fetch$<any>(url, fetchParams('POST', JSON.stringify(data)));
}
export function recordDetail(data?: any): Observable<WebResponse<any[]>> {
  const url = `${URL}/api/v2/platform/processingCenter/record/detail${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('GET'));
}
export function scannerImagesEnv(data?: any): Observable<WebResponse<any[]>> {
  const url = `${URL}/api/v2/containerSec/scanner/images/env/${data.envName}`;
  return fetch$<any>(url, fetchParams('GET'));
}

export function processingCenterRecord(data?: any): Observable<WebResponse<any[]>> {
  const url = `${URL}/api/v2/platform/processingCenter/record${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('GET'));
}

export function postProcessingCenterRecord(data?: any): Observable<WebResponse<any[]>> {
  const url = `${URL}/api/v2/platform/processingCenter/record`;
  return fetch$<any>(url, fetchParams('POST', JSON.stringify(data)));
}

export function recordStatus(data?: any): Observable<WebResponse<any[]>> {
  const url = `${URL}/api/v2/platform/processingCenter/record/status`;
  return fetch$<any>(url, fetchParams('POST', JSON.stringify(data)));
}

export function putScannerImagesEnv(data?: any): Observable<WebResponse<any[]>> {
  const url = `${URL}/api/v2/containerSec/scanner/images/env/${data.envName}?policy=${data.policy}`;
  return fetch$<any>(url, fetchParams('PUT', JSON.stringify(data)));
}
///api/v2/containerSec/scanner/images/env/:envName?policy=2
export function getTrustedImagesRsaId(data?: any): Observable<WebResponse<any[]>> {
  const url = `${URL}/api/v2/containerSec/scanner/imagereject/trustedImages/rsa/` + data.id;
  return fetch$<any>(url, fetchParams('GET'));
}
export function getTrustedImagesRsa(data?: any): Observable<WebResponse<any[]>> {
  const url = `${URL}/api/v2/containerSec/scanner/imagereject/trustedImages/rsa${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('GET'));
}
export function trustedImagesRsa(data?: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/scanner/imagereject/trustedImages/rsa`;
  return fetch$<any>(url, fetchParams('POST', JSON.stringify(data)));
}
export function putTrustedImagesRsa(data?: any): Observable<WebResponse<any[]>> {
  const url = `${URL}/api/v2/containerSec/scanner/imagereject/trustedImages/rsa/` + data.id;
  return fetch$<any>(url, fetchParams('PUT', JSON.stringify(data)));
}
export function deleteTrustedImagesRsa(data?: any): Observable<WebResponse<any[]>> {
  const url = `${URL}/api/v2/containerSec/scanner/imagereject/trustedImages/rsa/` + data.id;
  return fetch$<any>(url, fetchParams('DELETE'));
}

const tempRuntimePolicyList: RunTimePolicyItem[] = [];

const updateRuntimePolicyList = (from?: RunTimePolicyItem, to?: RunTimePolicyItem) => {
  const localName = 'runtimePolicyList';
  const _lres = window.localStorage.getItem(localName);
  const lres = _lres ? (JSON.parse(_lres) as RunTimePolicyItem[]) : [];
  let resstatus = false;
  if (!from) {
    if (to) {
      lres.push(to);
      window.localStorage.setItem(localName, JSON.stringify(lres));
      resstatus = true;
    } else {
      const res = lres.concat(tempRuntimePolicyList);
      return res;
    }
  } else {
    const cindex = tempRuntimePolicyList.findIndex((item) => item.id === from.id);
    if (cindex !== -1) {
      if (!to) {
        tempRuntimePolicyList.splice(cindex, 1);
      } else {
        tempRuntimePolicyList.splice(cindex, 1, to);
      }
      resstatus = true;
    }

    const lcindex = lres.findIndex((item) => item.id === from.id);
    if (lcindex !== -1) {
      if (!to) {
        lres.splice(lcindex, 1);
      } else {
        lres.splice(lcindex, 1, to);
      }
      window.localStorage.setItem(localName, JSON.stringify(lres));
      resstatus = true;
    }
  }
  return resstatus;
};

interface policyData {
  pagination: PaginationOptions;
  name?: string;
  search?: string;
  seckind?: string;
  cluster_key?: string;
  status?: string;
  kind?: string;
  resource_uuid?: string;
}

// 获取策略列表
export function runtimePolicyList(data: policyData): Observable<WebResponse<RunTimePolicyItem>> {
  const { pagination, name, search, seckind, cluster_key, status, kind, resource_uuid } = data;
  const offset = pagination.offset || 0;
  const limit = pagination.limit || 10;
  const url = `${URL}/api/v2/containerSec/immune/policies${parseGetMethodParams({
    limit,
    offset,
    query: search,
    seckind,
    cluster_key,
    status,
    kind,
    name,
    resource_uuid,
  })}`;
  return fetch$<any>(url, fetchParams('GET'));
}

// 获取资源详情
export function getRuntimePolicyList(id: number): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/immune/policy/${id}`;
  return fetch$<any>(url, fetchParams('GET'));
}

// 更新策略状态:start|stop
// 携带updated_at
export function runtimePolicySwitch(action: 'start' | 'stop', data: RunTimePolicyItem): Observable<WebResponse<any>> {
  const { updated_at, id } = data;
  const able = action === 'start' ? 'enable' : 'disable';
  const url = `${URL}/api/v2/containerSec/immune/policy/${id}/${able}?read_update_timestamp=${0}`;

  return fetch$<any>(url, fetchParams('POST', JSON.stringify({ updated_at })));
}

export function runtimePolicyModChange(data: RunTimePolicyItem, mode: RunTimePolicyMod): Observable<WebResponse<any>> {
  const res = updateRuntimePolicyList(
    data,
    Object.assign({}, data, {
      mode: mode,
      updatedAt: new Date().getTime(),
    }),
  ) as boolean;
  return of(
    cloneDeep({
      apiVersion: '1.0',
      data: {
        item: res,
      },
    }) as any,
  );
  // return fetch$<any>(url, fetchParams('POST', JSON.stringify(data)));
}

export function runtimePolicyEdit(
  from: RunTimePolicyItem,
  to: RunTimePolicyItem,
  id: number,
): Observable<WebResponse<any>> {
  const { profiles: old } = from;
  const { description, name, profiles, mode } = to;
  const data = {
    name,
    decision: mode === 'prevention' ? 1 : 0,
    description,
    profilesChanges: {
      add: profiles,
      delete: old,
    },
  };
  const url = `${URL}/api/v2/containerSec/immune/policy/${id}/edit?read_update_timestamp=${0}`;
  return fetch$<any>(url, fetchParams('POST', JSON.stringify(data)));
}

export function runtimePolicyDelete(form: RunTimePolicyItem): Observable<WebResponse<any>> {
  const res = updateRuntimePolicyList(form, undefined) as boolean;
  return of(
    cloneDeep({
      apiVersion: '1.0',
      data: {
        item: res,
      },
    }) as any,
  );
  // return fetch$<any>(url, fetchParams('POST', JSON.stringify(data)));
}

const tempAppamorControlList: AppamorControlInfoItem[] = [];

const updateTempAppamorControlList = (from?: AppamorControlInfoItem, to?: AppamorControlInfoItem) => {
  const localName = 'AppamorControlList';
  const _lres = window.localStorage.getItem(localName);
  const lres = _lres ? (JSON.parse(_lres) as AppamorControlInfoItem[]) : [];
  let resstatus = false;
  if (!from) {
    if (to) {
      lres.push(to);
      window.localStorage.setItem(localName, JSON.stringify(lres));
      resstatus = true;
    } else {
      const res = lres.concat(tempAppamorControlList);
      return res;
    }
  } else {
    const cindex = tempAppamorControlList.findIndex((item) => item.id === from.id);
    if (cindex !== -1) {
      if (!to) {
        tempAppamorControlList.splice(cindex, 1);
      } else {
        tempAppamorControlList.splice(cindex, 1, to);
      }
      resstatus = true;
    }

    const lcindex = lres.findIndex((item) => item.id === from.id);
    if (lcindex !== -1) {
      if (!to) {
        lres.splice(lcindex, 1);
      } else {
        lres.splice(lcindex, 1, to);
      }
      window.localStorage.setItem(localName, JSON.stringify(lres));
      resstatus = true;
    }
  }
  return resstatus;
};

const tempCommandsWhiteControlList: CommandsWhiteControlInfoItem[] = [];

const updateTempCommandsWhiteControlList = (from?: CommandsWhiteControlInfoItem, to?: CommandsWhiteControlInfoItem) => {
  const localName = 'CommandsWhiteControlList';
  const _lres = window.localStorage.getItem(localName);
  const lres = _lres ? (JSON.parse(_lres) as CommandsWhiteControlInfoItem[]) : [];
  let resstatus = false;
  if (!from) {
    if (to) {
      lres.push(to);
      window.localStorage.setItem(localName, JSON.stringify(lres));
      resstatus = true;
    } else {
      const res = lres.concat(tempCommandsWhiteControlList);
      return res;
    }
  } else {
    const cindex = tempCommandsWhiteControlList.findIndex((item) => item.id === from.id);
    if (cindex !== -1) {
      if (!to) {
        tempCommandsWhiteControlList.splice(cindex, 1);
      } else {
        tempCommandsWhiteControlList.splice(cindex, 1, to);
      }
      resstatus = true;
    }

    const lcindex = lres.findIndex((item) => item.id === from.id);
    if (lcindex !== -1) {
      if (!to) {
        lres.splice(lcindex, 1);
      } else {
        lres.splice(lcindex, 1, to);
      }
      window.localStorage.setItem(localName, JSON.stringify(lres));
      resstatus = true;
    }
  }
  return resstatus;
};

const tempSeccompControlList: SeccompControlInfoItem[] = [];

const updateTempSeccompControlList = (from?: SeccompControlInfoItem, to?: SeccompControlInfoItem) => {
  const localName = 'SeccompControlList';
  const _lres = window.localStorage.getItem(localName);
  const lres = _lres ? (JSON.parse(_lres) as SeccompControlInfoItem[]) : [];
  let resstatus = false;
  if (!from) {
    if (to) {
      lres.push(to);
      window.localStorage.setItem(localName, JSON.stringify(lres));
      resstatus = true;
    } else {
      const res = lres.concat(tempSeccompControlList);
      return res;
    }
  } else {
    const cindex = tempSeccompControlList.findIndex((item) => item.id === from.id);
    if (cindex !== -1) {
      if (!to) {
        tempSeccompControlList.splice(cindex, 1);
      } else {
        tempSeccompControlList.splice(cindex, 1, to);
      }
      resstatus = true;
    }

    const lcindex = lres.findIndex((item) => item.id === from.id);
    if (lcindex !== -1) {
      if (!to) {
        lres.splice(lcindex, 1);
      } else {
        lres.splice(lcindex, 1, to);
      }
      window.localStorage.setItem(localName, JSON.stringify(lres));
      resstatus = true;
    }
  }
  return resstatus;
};

const tempDriftPreventionControl: DriftPreventionConfig[] = [];

const updateTempDriftPreventionControl = (from?: DriftPreventionConfig, to?: DriftPreventionConfig) => {
  const localName = 'DriftPreventionConfigList';
  const _lres = window.localStorage.getItem(localName);
  const lres = _lres ? (JSON.parse(_lres) as DriftPreventionConfig[]) : [];
  let resstatus = false;
  if (!from) {
    if (to) {
      lres.push(to);
      window.localStorage.setItem(localName, JSON.stringify(lres));
      resstatus = true;
    } else {
      const res = lres.concat(tempDriftPreventionControl);
      return res;
    }
  } else {
    const cindex = tempDriftPreventionControl.findIndex((item) => item.id === from.id);
    if (cindex !== -1) {
      if (!to) {
        tempDriftPreventionControl.splice(cindex, 1);
      } else {
        tempDriftPreventionControl.splice(cindex, 1, to);
      }
      resstatus = true;
    }

    const lcindex = lres.findIndex((item) => item.id === from.id);
    if (lcindex !== -1) {
      if (!to) {
        lres.splice(lcindex, 1);
      } else {
        lres.splice(lcindex, 1, to);
      }
      window.localStorage.setItem(localName, JSON.stringify(lres));
      resstatus = true;
    }
  }
  return resstatus;
};

export function getConfigSyslog(data?: any): Observable<WebResponse<TSyslog>> {
  const url = `${URL}/api/v2/platform/sherlock/palace/config/syslog`;
  return fetch$<any>(url, fetchParams('GET'));
}

export function postConfigSyslog(data: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/platform/sherlock/palace/config/syslog`;
  return fetch$<any>(url, fetchParams('POST', JSON.stringify(data)));
}

export function postAuditConfigSyslog(data: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/platform/audit/config/syslog`;
  return fetch$<any>(url, fetchParams('POST', JSON.stringify(data)));
}

export function getAuditConfigSyslog(data?: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/platform/audit/config/syslog`;
  return fetch$<any>(url, fetchParams('GET', JSON.stringify(data)));
}
export function postNaviAuditConfigSyslog(data: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/platform/naviAudit/config/syslog`;
  return fetch$<any>(url, fetchParams('POST', JSON.stringify(data)));
}

export function getNaviAuditConfigSyslog(data?: any): Observable<WebResponse<TSyslog>> {
  const url = `${URL}/api/v2/platform/naviAudit/config/syslog`;
  return fetch$<any>(url, fetchParams('GET', JSON.stringify(data)));
}

export function getPalaceProcessTree(d?: any): Observable<WebResponse<any>> {
  let data = Object.assign(
    {},
    {
      offset_ts: '0',
      offset: '0',
      limit: 20,
      sortBy: '',
      sortOrder: '',
    },
    d,
  );
  const url = `${URL}/api/v2/platform/palace/assoc_graph_events/${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('GET'));
}

export function getProcessTreeList(evtID: number): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/platform/palace/event/${evtID}/process_tree/`;
  return fetch$<any>(url, fetchParams('GET'));
}
//api/v2/containerSec/scanner/managementCenter/docs
export function managementCenterDocs(): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/scanner/managementCenter/docs`;
  return fetch$<any>(url, fetchParams('GET'));
}
export function getEventSignals(data: any): Observable<WebResponse<any>> {
  const { offset_ts = '0', offset = '0', limit = 10, sortBy = '', sortOrder = 'desc', evtID, selection } = data;
  const url = `${URL}/api/v2/platform/palace/event/${evtID}/signals/${parseGetMethodParams({
    limit,
    offset_ts,
    offset,
    sortBy,
    sortOrder,
  })}&${selection}`;
  return fetch$<any>(url, fetchParams('GET'), {
    silent: false,
    timesTamp: false,
  });
}
///api/v2/containerSec/scanner/vulns/topNImage
export function vulnsTopNImage(data: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/scanner/vulns/topNImage${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('GET'));
}
export function getVulnsStatistic(): Observable<any> {
  const url = `${URL}/api/v2/containerSec/scanner/vulns/statistic`;
  return fetch$<any>(url, fetchParams('GET'));
}
///api/v2/containerSec/scap/v2/{scap-type}/cronjob
export function cronjob(data: any): Observable<WebResponse<any>> {
  let { scapType } = data;
  const url = `${URL}/api/v2/containerSec/scap/v2/${scapType}/cronjob`;
  return fetch$<any>(url, fetchParams('POST', JSON.stringify(data)));
}
export function getScapCronjob(data: any): Observable<WebResponse<any>> {
  let { scapType } = data;
  const url = `${URL}/api/v2/containerSec/scap/v2/${scapType}/cronjob`;
  return fetch$<any>(url, fetchParams('GET'));
}
export function getPolicies(data: any): Observable<WebResponse<any>> {
  let { scapType } = data;
  const url = `${URL}/api/v2/containerSec/scap/v2/${scapType}/policy${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('GET'));
}
///api/v2/containerSec/scap/v2/{scap-type}/policy/{id}
export function delPolicies(data: any): Observable<WebResponse<any>> {
  let { scapType, id } = data;
  const url = `${URL}/api/v2/containerSec/scap/v2/${scapType}/policy/${id}`;
  return fetch$<any>(url, fetchParams('DELETE'));
}
///api/v2/containerSec/scap/v2/{scap-type}/policy
export function postPolicy(data: any): Observable<WebResponse<any>> {
  let { scapType, id } = data;
  const url = `${URL}/api/v2/containerSec/scap/v2/${scapType}/policy`;
  return fetch$<any>(url, fetchParams('POST', JSON.stringify(data)));
}
///api/v2/containerSec/scap/v2/{scap-type}/policy/{id}
export function getPolicyInfo(data: any): Observable<WebResponse<any>> {
  let { scapType, id } = data;
  const url = `${URL}/api/v2/containerSec/scap/v2/${scapType}/policy/${id}${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('GET'));
}
///api/v2/containerSec/scap/v2/{scap-type}/record
export function getRecord(data: any): Observable<WebResponse<any>> {
  let { scapType, id } = data;
  const url = `${URL}/api/v2/containerSec/scap/v2/${scapType}/record${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('GET'));
}
///api/v2/containerSec/scap/v2/{scap-type}/rule
export function getRule(data: any): Observable<WebResponse<any>> {
  let { scapType, id } = data;
  const url = `${URL}/api/v2/containerSec/scap/v2/${scapType}/rule${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('GET'));
}
export function getRuleInfo(data: any): Observable<WebResponse<any>> {
  let { scapType, id } = data;
  const url = `${URL}/api/v2/containerSec/scap/v2/${scapType}/rule/${id}`;
  return fetch$<any>(url, fetchParams('GET'));
}
///api/v2/containerSec/scap/v2/{scap-type}/job
export function postJob(data: any): Observable<WebResponse<any>> {
  let { scapType, id } = data;
  const url = `${URL}/api/v2/containerSec/scap/v2/${scapType}/job`;
  return fetch$<any>(url, fetchParams('POST', JSON.stringify(data)));
}
export function getImageVuln(data: any): Observable<WebResponse<any>> {
  let { type } = data;
  const url = `${URL}/${type}${parseGetMethodParams(data, true)}`;
  return fetch$<any>(url, fetchParams('GET'));
}
export function startSync(data: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/scanner/syncImage/startSync`;
  return fetch$<any>(url, fetchParams('POST', JSON.stringify(data)));
}
export function getSyncStatus(): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/scanner/syncImage/syncStatus`;
  return fetch$<any>(url, fetchParams('GET'));
}
//创建单个镜像导出任务
export function exportImage(data: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/export/task/image`;
  return fetch$<any>(url, fetchParams('POST', JSON.stringify(data)));
}
//创建扫描结果的镜像导出任务
export function exportScanTask(data: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/export/task/scanTask`;
  return fetch$<any>(url, fetchParams('POST', JSON.stringify(data)));
}
//创建搜索结果的镜像导出任务
export function exportSearchScanTask(data: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/export/task/imageSearch?imageFromType=${data.parameter.imageFromType}`;
  return fetch$<any>(url, fetchParams('POST', JSON.stringify(data)));
}

// 创建日志导出任务
export function exportAuditTask(data: {
  taskCreateAt: number | string;
  creator: string;
}): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/platform/naviAudit/exportTask`;
  return fetch$<any>(url, fetchParams('POST', JSON.stringify(data)));
}

//获取导出列表
export function exportList(data: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/export/task/list${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('GET'));
}
export function registryProject(data: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/scanner/images/registryProject${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('GET'), { silent: true });
}
export function taskDownload(data: any): Observable<any> {
  const url = `${URL}/api/v2/containerSec/export/task/download?id=${data.id}`;
  return fetch$<any>(url, fetchParams('GET'));
}
export function imageVulnGobinary(data: any): Observable<WebResponse<any>> {
  let { scapType, id } = data;
  const url = `${URL}/api/v2/containerSec/scanner/vulns/imageVuln/gobinary${formatGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('GET'));
}

// api/v2/platform/naviAudit
export function getNaviAudit(data: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/platform/naviAudit${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('GET'));
}
// licenses
export function getLicenseStatus(): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/license/register/status`;
  return fetch$<any>(url, fetchParams('GET'));
}

export function getEnvKey(): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/license/envkey`;
  return fetch$<any>(url, fetchParams('GET'));
}

export function getMfaBindImage(data: {
  account: string; //需要获取mfa密钥二维码的用户名
  loginTwoFactorSecret: string; //两步登录 验证token
}): Observable<WebResponse<TMfaBindImage>> {
  const url = `${URL}/api/v2/usercenter/getMfaBindImage`;
  return fetch$<any>(url, fetchParams('POST', JSON.stringify(data)));
}
export function bindMfaVerify(data: {
  account: string;
  loginTwoFactorSecret: string;
  mfaCode: string;
}): Observable<WebResponse<TMfaBindImage>> {
  const url = `${URL}/api/v2/usercenter/bindMfaVerify`;
  return fetch$<any>(url, fetchParams('POST', JSON.stringify(data)));
}
export function loginMfaVerify(data: {
  account: string;
  loginTwoFactorSecret: string;
  mfaCode: string;
}): Observable<WebResponse<LoginResult>> {
  const url = `${URL}/api/v2/usercenter/loginMfaVerify`;
  return fetch$<any>(url, fetchParams('POST', JSON.stringify(data)));
}

export function getVerifyAppURL(): Observable<WebResponse<TAppUrls>> {
  const url = `${URL}/api/v2/usercenter/login/getVerifyAppURL`;
  return fetch$<any>(url, fetchParams('GET'));
}
export function postLicenseRegister(data: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/license/register`;
  return fetch$<any>(url, fetchParams('POST', JSON.stringify(data)));
}

export function getLicenseInfo(pageParams: any = { limit: 10, offset: 0 }): Observable<
  WebResponse<{
    expireAt: number;
    licenseType: string;
    module: string;
    nodeLimit: number;
    remainDays: number;
    serialNo: string;
    status: {
      valid: boolean; // 当前licnese是否有效
      deadlineState: string; // 过期时间状态,willExpire = 即将过期,expired = 已经过期
      nodeLimitState: string; // 节点限制状态,exceedLimit = 超出节点限制
    };
    usedNode: number;
  }>
> {
  const { limit = 10, offset = 0 } = pageParams;
  const url = `${URL}/api/v2/license/info${parseGetMethodParams({
    limit,
    offset,
  })}`;
  return fetch$<any>(url, fetchParams('GET'));
}

export function postSuperAdminInit(data: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/usercenter/superAdminInit`;
  return fetch$<any>(url, fetchParams('POST', JSON.stringify(data)));
}
///api/v2/containerSec/export/task/detail
export function taskDetail(data: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/export/task/detail${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('GET'));
}
export function taskCheckScanTask(data: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/export/task/checkScanTask${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('GET'));
}

// /api/v2/usercenter/logout
export function loginOutFn(data: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/usercenter/logout`;
  return fetch$<any>(url, fetchParams('POST', JSON.stringify(data)));
}
export function eventDetail(data: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/platform/sherlock/palace/event/detail${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('GET'));
}
//
export function palaceSuggest(data: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/platform/sherlock/palace/suggest${parseGetMethodParams(data, true)}`;
  return fetch$<any>(url, fetchParams('GET'));
}

// 获取告警列表
// /api/v2/platform/sherlock/palace/signals
export function palaceSignals(data: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/platform/sherlock/palace/signals`;
  return fetch$<any>(url, fetchParams('POST', JSON.stringify(data)));
}
///api/v2/platform/sherlock/palace/rules
export function palaceRules(data?: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/platform/sherlock/palace/rules${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('GET'));
}
export function signalDetail(data?: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/platform/sherlock/palace/signal/detail${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('GET'));
}
///api/v1/ci/image/list

export function imageList(data?: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v1/ci/image/list${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('GET'));
}
//api/v1/ci/policies
export function ciPolicies(data?: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/scanner/ci/policies${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('GET'));
}
///api/v1/ci/policy
export function postCiPolicy(data?: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/scanner/ci/policy`;
  return fetch$<any>(url, fetchParams('POST', JSON.stringify(data)));
}
///api/v1/ci/policy
export function putCiPolicy(data?: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/scanner/ci/policy`;
  return fetch$<any>(url, fetchParams('PUT', JSON.stringify(data)));
}
///api/v1/ci/policy
export function deleteCiPolicy(data?: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/scanner/ci/policy?id=${data.id}`;
  return fetch$<any>(url, fetchParams('DELETE'));
}
export function getCiPolicy(data?: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/scanner/ci/policy?id=${data.id}`;
  return fetch$<any>(url, fetchParams('GET'));
}
//api/v1/ci/images
export function getCiImages(data?: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/scanner/ci/images${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('GET'));
}
export function getCiImage(data?: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/scanner/ci/image?id=${data.id}`;
  return fetch$<any>(url, fetchParams('GET'));
}
export function getCiVulns(data?: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/scanner/ci/vulns${parseGetMethodParams(data, true)}`;
  return fetch$<any>(url, fetchParams('GET'));
}
export function getCiPkgs(data?: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/scanner/ci/pkgs${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('GET'));
}
///api/v1/ci/whitelists?limit=10&offset=0&name=?&&start_time=?&&end_time=?
export function getCiWhitelist(data?: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/scanner/ci/whitelist${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('GET'));
}
export function putCiWhitelists(data?: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/scanner/ci/whitelists`;
  return fetch$<any>(url, fetchParams('PUT', JSON.stringify(data)));
}
export function postCiWhitelists(data?: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/scanner/ci/whitelists`;
  return fetch$<any>(url, fetchParams('POST', JSON.stringify(data)));
}
export function postCiStatisticImage(data?: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/scanner/ci/statistic/image${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('GET'));
}
export function postCiStatisticTop5(data?: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/scanner/ci/statistic/top5${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('GET'));
}
///api/v1/ci/policy
export function deleteCIWhitelist(data?: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/scanner/ci/whitelist?id=${data.id}`;
  return fetch$<any>(url, fetchParams('DELETE'));
}
//ci/webhook
export function getCIWebhook(data?: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/scanner/ci/webhook`;
  return fetch$<any>(url, fetchParams('GET'));
}
export function exportTaskImage(data?: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/export/task/image`;
  return fetch$<any>(url, fetchParams('POST', JSON.stringify(data)));
}
export function exportTaskVuln(data?: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/export/task/vuln`;
  return fetch$<any>(url, fetchParams('POST', JSON.stringify(data)));
}
export function putCiWebhook(data?: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/scanner/ci/webhook`;
  return fetch$<any>(url, fetchParams('PUT', JSON.stringify(data)));
}
export function getCiWebhookRecord(data?: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/scanner/ci/webhook/record${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('GET'));
}
export function getCiVulnDetail(data?: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/scanner/ci/vuln/detail${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('GET'));
}
export function getCiSensitives(data?: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/scanner/ci/sensitives${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('GET'));
}
///api/v2/platform/drift/whitelist/create
export function whitelistCreate(data?: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/platform/drift/whitelist`;
  return fetch$<any>(url, fetchParams('POST', JSON.stringify(data)));
}
//api/v2/platform/drift/whitelist/update
export function whitelistUpdate(data?: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/platform/drift/whitelist/${data.id}`;
  return fetch$<any>(url, fetchParams('PUT', JSON.stringify(data)));
}
//api/v2/platform/drift/whitelist/delete
export function whitelistDelete(data?: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/platform/drift/whitelist/${data.id}`;
  return fetch$<any>(url, fetchParams('DELETE', JSON.stringify(data)));
}
//api/v2/platform/drift/whitelists
export function driftWhitelists(data?: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/platform/drift/whitelists${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('GET'));
}
export function getWhiteList(data?: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/platform/sherlock/palace/whitelist${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('GET'));
}
///api/v2/platform/drift/policy/37
export function driftPolicyId(id?: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/platform/drift/policy/${id}`;
  return fetch$<any>(url, fetchParams('GET'));
}
//api/v2/platform/assets/resources/types
export function resourcesTypes(id?: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/platform/assets/resources/types`;
  return fetch$<any>(url, fetchParams('GET'));
}

// 获取白名单详情
export function getWhiteListDetail(data?: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/platform/sherlock/palace/whitelist/detail${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('GET'));
}

// 全量scope
export function getScopeKind(kind: string, data?: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/platform/sherlock/palace/whitelist/scopes/${kind}${parseGetMethodParams(data, true)}`;
  return fetch$<any>(url, fetchParams('GET'));
}

// 获取rule树 palaceRules

// 更新白名单策略
export function submitWhiteList(data?: any, type?: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/platform/sherlock/palace/whitelist`;
  return fetch$<any>(url, fetchParams(type, JSON.stringify(data)));
}

// 删除白名单策略
export function delWhiteList(data?: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/platform/sherlock/palace/whitelist`;
  return fetch$<any>(url, fetchParams('DELETE', JSON.stringify(data)));
}

export function getEventNoticeNum(anchor: string): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/platform/sherlock/palace/event/notify/stats${anchor ? `?anchor=${anchor}` : ''}`;
  return timer(0, 5000).pipe(
    switchMap(() => {
      return fetch$<any>(url, fetchParams('GET'), { silent: true });
    }),
  );
}

export function getNotifyConfig(): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/platform/sherlock/palace/event/notify/config`;
  return fetch$<any>(url, fetchParams('GET'));
}
export function getNoauthConfig(): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/platform/event/noauth/config`;
  return fetch$<any>(url, fetchParams('GET'));
}

export function setNotifyConfig(data?: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/platform/sherlock/palace/event/notify/config`;
  return fetch$<any>(url, fetchParams('POST', JSON.stringify(data)));
}
//api/v2/platform/sherlock/hola/rules
export function holaRules(data?: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/platform/sherlock/hola/rules${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('GET'));
}
///api/v2/containerSec/scanner/scannerInfo/list
export function scannerInfoList(data?: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/scanner/scannerInfo/list`;
  return fetch$<any>(url, fetchParams('GET'));
}

// 获取资产发现容器列表
export function getContainerGraphList(data: any): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/platform/assets/rawContainers${parseGetMethodParams(
      merge({}, data, {
        cluster_key: data.clusterKey,
      }),
      false,
    )}`,
    fetchParams('GET'),
  );
}

// 获取资产发现单个容器
export function getContainerGraphOne(data: any): Observable<WebResponse<any>> {
  const { id } = data;
  return fetch$<any>(`${URL}/api/v2/platform/assets/rawContainer/${id}`, fetchParams('GET'));
}
//api/v2/containerSec/scap/{checkType}/{clusterKey}/scan/node
export function scanNode(data?: any): Observable<WebResponse<any>> {
  let { checkType, clusterKey } = data;
  const url = `${URL}/api/v2/containerSec/scap/${checkType}/${clusterKey}/scan/node${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('GET'));
}
//api/v2/containerSec/scap/{checkType}/{clusterKey}/overview
export function overview(data?: any): Observable<WebResponse<any>> {
  let { checkType, clusterKey } = data;
  const url = `${URL}/api/v2/containerSec/scap/${checkType}/${clusterKey}/overview${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('GET'));
}
export function breakdown(data?: any): Observable<WebResponse<any>> {
  let { checkType, clusterKey } = data;
  const url = `${URL}/api/v2/containerSec/scap/${checkType}/${clusterKey}/breakdown${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('GET'));
}
//api/v2/containerSec/scap/{checkType}/{clusterKey}/suggest
export function suggest(data?: any): Observable<WebResponse<any>> {
  let { checkType, clusterKey } = data;
  const url = `${URL}/api/v2/containerSec/scap/${checkType}/${clusterKey}/suggest${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('GET'));
}
//api/v2/containerSec/scap/{checkType}/{clusterKey}/breakdown/detail/list
export function breakdownDetailList(data?: any): Observable<WebResponse<any>> {
  let { checkType, clusterKey } = data;
  const url = `${URL}/api/v2/containerSec/scap/${checkType}/${clusterKey}/breakdown/detail/list${parseGetMethodParams(
    data,
  )}`;
  return fetch$<any>(url, fetchParams('GET'));
}
//api/v2/containerSec/scap/{checkType}/breakdown/{taskID}/{policyNumber}/details
export function breakdownDetails(data?: any): Observable<WebResponse<any>> {
  let { checkType, taskID, policyNumber } = data;
  const url = `${URL}/api/v2/containerSec/scap/${checkType}/breakdown/${taskID}/${policyNumber}/details${parseGetMethodParams(
    data,
  )}`;
  return fetch$<any>(url, fetchParams('GET'));
}
//api/v2/containerSec/scap/{checkType}/{clusterKey}/scan/node/detail/list
export function nodeDetailList(data?: any): Observable<WebResponse<any>> {
  let { checkType, clusterKey } = data;
  const url = `${URL}/api/v2/containerSec/scap/${checkType}/${clusterKey}/scan/node/detail/list${parseGetMethodParams(
    data,
  )}`;
  return fetch$<any>(url, fetchParams('GET'));
}

//api/v2/containerSec/scap/{checkType}/{nodeName}/{taskID}/details
export function nodeNameTaskIDDetails(data?: any): Observable<WebResponse<any>> {
  let { checkType, taskID, nodeName } = data;
  const url = `${URL}/api/v2/containerSec/scap/${checkType}/${nodeName}/${taskID}/details${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('GET'));
}
//api/v2/platform/sherlock/palace/event/overview
export function eventOverview(data?: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/platform/sherlock/palace/event/stats`;
  return fetch$<any>(url, fetchParams('POST', JSON.stringify(data)));
}

// /api/v2/platform/drift/default/whitelist
export function recordTrend(data?: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/platform/drift/default/whitelist`;
  return fetch$<any>(url, fetchParams('POST', JSON.stringify(data)));
}

// /api/v2/platform/drift/resource/stats
export function driftStats(data?: any): Observable<WebResponse<any>> {
  let { cluster_key } = data;
  const url = `${URL}/api/v2/platform/drift/resource/stats${parseGetMethodParams({ cluster_key })}`;
  return fetch$<any>(url, fetchParams('GET'));
}

// /api/v2/platform/drift/policy/stats/top
export function driftStatsTop(data?: any): Observable<WebResponse<any>> {
  let { cluster_key } = data;
  const url = `${URL}/api/v2/platform/drift/policy/stats/top${parseGetMethodParams({
    cluster_key,
  })}`;
  return fetch$<any>(url, fetchParams('GET'));
}

// /api/v2/platform/sherlock/palace/signal/overview
export function defenseOverview(data?: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/platform/sherlock/palace/signal/overview`;
  return fetch$<any>(url, fetchParams('POST', JSON.stringify(data)));
}
export function detailBase(data?: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/scanner/images/detail/base${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('GET'));
}
export function detailEnv(data?: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/scanner/images/detail/env${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('GET'));
}
export function detailVirus(data?: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/scanner/images/detail/virus${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('GET'));
}
export function imageWebshell(data?: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/scanner/webshells/imageWebshell/webshell${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('GET'));
}
export function imageWebshellDetail(data?: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/scanner/webshells/imageWebshell/detail${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('GET'));
}
export function imageWebshellDownload(data?: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/scanner/webshells/imageWebshell/download${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('GET'));
}
export function detailSoftware(data?: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/scanner/images/detail/software${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('GET'));
}
export function imageWebshellFile(data?: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/scanner/webshells/imageWebshell/file${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('POST', JSON.stringify(data)));
}
export function eventProcess(data?: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/platform/sherlock/palace/event/process`;
  return fetch$<any>(url, fetchParams('POST', JSON.stringify(data)));
}
///api/v2/containerSec/scanner/webshells/imageWebshell/webshel
//platform/assets/cluster/ruleversion?limit=100&offset=0
export function clusterRuleversion(data?: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/platform/assets/cluster/ruleversion${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('GET'));
}
export function deleteAssetsCluster(data?: any): Observable<WebResponse<any>> {
  let { cluster_key } = data;
  const url = `${URL}/api/v2/platform/assets/cluster/${cluster_key}${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('DELETE'));
}
// /api/v2/platform/version/ATTCKVersionList
export function ATTCKVersionList(data?: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/platform/version/ATTCKVersionList${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('GET'));
}
// /api/v2/platform/sherlock/palace/attck/matrix
export function ATTCKMatrix(data?: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/platform/sherlock/palace/attck/matrix`;
  return fetch$<any>(url, fetchParams('POST', JSON.stringify(data)));
}

// /api/v2/platform/sherlock/palace/event/stats
export function eventStats(data?: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/platform/sherlock/palace/event/stats`;
  return fetch$<any>(url, fetchParams('POST', JSON.stringify(data)));
}

export function getRiskImagesInfo(data: any): Observable<WebResponse<ImageScanSummaryResult>> {
  const params = {
    limit: 0,
    offset: 100,
  };
  const url = `${URL}/api/v2/containerSec/scanner/images/detail/riskInfo${parseGetMethodParams(params)}`;
  return fetch$<any>(url, fetchParams('POST', JSON.stringify(data)));
}
///api/v2/platform/sherlock/palace/whitelist/context
export function whitelistContext(data?: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/platform/sherlock/palace/whitelist/context${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('GET'));
}
//api/v2/platform/sherlock/palace/whitelist/check/expr
export function checkExpr(data?: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/platform/sherlock/palace/whitelist/check/expr`;
  return fetch$<any>(url, fetchParams('POST', JSON.stringify(data)));
}
export function topExport(data: any): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/platform/sherlock/palace/event/top/export`,
    fetchParams('POST', JSON.stringify(data)),
    { silent: false },
    true,
  );
}
///api/v2/platform/sherlock/palace/event/count
export function eventCount(data: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/platform/sherlock/palace/events/count`, fetchParams('POST', JSON.stringify(data)));
}
//api/v2/platform/sherlock/palace/event/process
export function eventProcessQuery(data: any): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/platform/sherlock/palace/event/process/query`,
    fetchParams('POST', JSON.stringify(data)),
  );
}
//api/v2/platform/sherlock/task/status
export function taskStatus(data: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/platform/sherlock/palace/task/status`, fetchParams('GET'));
}
export function getResources(data: any): Observable<WebResponse<any>> {
  let { cluster_key, namespace, kind, name } = data;
  return fetch$<any>(
    `${URL}/api/v2/platform/assets/cluster/${cluster_key}/namespace/${namespace}/kind/${kind}/resources/${name}`,
    fetchParams('GET'),
  );
}
export function getNamespaces(data: any): Observable<WebResponse<any>> {
  let { cluster_key, name } = data;
  return fetch$<any>(`${URL}/api/v2/platform/assets/cluster/${cluster_key}/namespaces/${name}`, fetchParams('GET'));
}
export function getPods(data: any): Observable<WebResponse<any>> {
  let { cluster_key, namespace, name } = data;
  return fetch$<any>(
    `${URL}/api/v2/platform/assets/cluster/${cluster_key}/namespace/${namespace}/pods/${name}`,
    fetchParams('GET'),
  );
}
export function getNodes(data: any): Observable<WebResponse<any>> {
  let { cluster_key, name } = data;
  return fetch$<any>(`${URL}/api/v2/platform/assets/cluster/${cluster_key}/nodes/${name}`, fetchParams('GET'));
}
export function getContainer(data: any): Observable<WebResponse<any>> {
  let { containerID } = data;
  return fetch$<any>(`${URL}/api/v2/platform/assets/rawContainer/${containerID}`, fetchParams('GET'));
}
export function getContainer2(data: any): Observable<WebResponse<any>> {
  let { containerID } = data;
  return fetch$<any>(`${URL}/api/v2/platform/assets/rawContainerByPrefix/${containerID}`, fetchParams('GET'));
}
// 新增策略
export function addSecurityPolicy(data: TSecurityPolicy): Observable<WebResponse<any>> {
  let { id, ...otherData } = data;
  return fetch$<any>(
    `${URL}/api/v2/containerSec/scanner/security/detect/policy`,
    fetchParams('POST', JSON.stringify(otherData)),
  );
}
// 删除策略
export function deleteSecurityPolicy(id: string): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/containerSec/scanner/security/detect/policy${parseGetMethodParams({
      id,
    })}`,
    fetchParams('DELETE'),
  );
}
// 更新安全策略
export function putSecurityPolicy(data: any): Observable<WebResponse<any>> {
  let { id, ...otherData } = data;
  return fetch$<any>(
    `${URL}/api/v2/containerSec/scanner/security/detect/policy${parseGetMethodParams({
      id,
    })}`,
    fetchParams('PUT', JSON.stringify(otherData)),
  );
}
// 安全策略详情
export function securityPolicyDetail(data: any): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/containerSec/scanner/security/detect/policy/detail${parseGetMethodParams(data)}`,
    fetchParams('GET'),
  );
}
export function nodeImageImagesList(data: any): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/containerSec/scanner/images/list${parseGetMethodParams(data)}`,
    fetchParams('POST', JSON.stringify(data)),
  );
}
export function configScanImage(data: any): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/containerSec/scanner/config/scan/image${parseGetMethodParams(data)}`,
    fetchParams('GET'),
  );
}
export function putConfigScanImage(data: any): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/containerSec/scanner/config/scan/image${parseGetMethodParams({
      id: data.id,
    })}`,
    fetchParams('PUT', JSON.stringify(data)),
  );
}
export function thirdUrl(data: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/usercenter/idp/login/url${parseGetMethodParams(data)}`, fetchParams('GET'));
}
///api/v2/usercenter/third/login
export function thirdLogin(data: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/usercenter/idp/login`, fetchParams('POST', JSON.stringify(data)));
}
//api/v2/usercenter/admin/resetpwd
export function usercenterEnable(data: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/usercenter/enable`, fetchParams('POST', JSON.stringify(data)));
}
export function resetMfaSecret(data: { account: string; password: string }): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/usercenter/admin/resetMfaSecret`, fetchParams('POST', JSON.stringify(data)));
}
//api/v2/usercenter/admin/resetpwd
export function adminResetpwd(data: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/usercenter/admin/resetpwd`, fetchParams('POST', JSON.stringify(data)));
}
///api/v2/usercenter/delete
export function usercenterDelete(data: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/usercenter/delete`, fetchParams('DELETE', JSON.stringify(data)));
}
export function usercenterLoginConfig(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/usercenter/loginConfig`, fetchParams('GET', JSON.stringify(data)));
}
///api/v2/usercenter/loginConfig
export function postUsercenterLoginConfig(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/usercenter/loginConfig`, fetchParams('POST', JSON.stringify(data)));
}
///api/v2/usercenter/config/idp
export function configIdp(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/usercenter/config/idp`, fetchParams('GET', JSON.stringify(data)));
}
///api/v2/usercenter/config/idp
export function putConfigIdp(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/usercenter/config/idp`, fetchParams('PUT', JSON.stringify(data)));
}
///api/v2/usercenter/config/login
export function configLogin(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/usercenter/config/login`, fetchParams('GET', JSON.stringify(data)));
}
//api/v2/usercenter/config/login
export function putConfigLogin(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/usercenter/config/login`, fetchParams('PUT', JSON.stringify(data)));
}
//api/v2/usercenter/config/ldap
export function configLdap(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/usercenter/config/ldap`, fetchParams('GET', JSON.stringify(data)));
}
//api/v2/usercenter/config/ldap
export function postConfigLdap(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/usercenter/config/ldap`, fetchParams('POST', JSON.stringify(data)));
}
export function configRadius(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/usercenter/config/radius`, fetchParams('GET', JSON.stringify(data)));
}
export function postConfigRadius(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/usercenter/config/radius`,

    fetchParams('POST', JSON.stringify(data)),
  );
}
export function sensitiveRuleList(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/containerSec/scanner/config/scan/sensitive/rule/list${parseGetMethodParams(data)}`,
    fetchParams('GET'),
  );
}
export function sensitiveRule(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/containerSec/scanner/config/scan/sensitive/rule${parseGetMethodParams(data)}`,
    fetchParams('POST', JSON.stringify(data)),
  );
}
export function deleteSensitiveRule(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/containerSec/scanner/config/scan/sensitive/rule${parseGetMethodParams(data)}`,
    fetchParams('DELETE'),
  );
}
export function putSensitiveRule(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/containerSec/scanner/config/scan/sensitive/rule${parseGetMethodParams(data)}`,
    fetchParams('PUT', JSON.stringify(data)),
  );
}
export function detectPolicyList(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/containerSec/scanner/security/detect/policy/list${parseGetMethodParams(data)}`,
    fetchParams('GET'),
  );
}
export function scanTask(data: { [x: string]: any; imageFromType: any }): Observable<WebResponse<any>> {
  let { imageFromType, ...otherData } = data;
  return fetch$<any>(
    `${URL}/api/v2/containerSec/scanner/scanTask/image/scan/task?imageFromType=${imageFromType}`,
    fetchParams('POST', JSON.stringify(otherData)),
  );
}
export function detailLayers(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/containerSec/scanner/images/detail/layers${parseGetMethodParams(data)}`,
    fetchParams('GET'),
  );
}
export function imagesDetailVuln(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/containerSec/scanner/images/detail/vuln${parseGetMethodParams(data)}`,
    fetchParams('GET'),
  );
}
export function detailSensitiveFile(data?: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/scanner/images/detail/sensitiveFile${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('GET'));
}
export function imagesDetailVirus(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/containerSec/scanner/images/detail/virus${parseGetMethodParams(data)}`,
    fetchParams('GET'),
  );
}
export function imagesDetailSoftware(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/containerSec/scanner/images/detail/software${parseGetMethodParams(data)}`,
    fetchParams('GET'),
  );
}
export function imagesDetailEnv(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/containerSec/scanner/images/detail/env${parseGetMethodParams(data)}`,
    fetchParams('GET'),
  );
}
export function imagesDetailWebshell(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/containerSec/scanner/images/detail/webshell${parseGetMethodParams(data)}`,
    fetchParams('GET'),
  );
}
export function imagesDetailVulns(data?: any): Observable<WebResponse<any>> {
  let { type = '', ...otherData } = data;
  return fetch$<any>(
    `${URL}/api/v2/containerSec/scanner/images/detail/vulns/${type}${parseGetMethodParams(otherData)}`,
    fetchParams('GET'),
  );
}
export function imagesDetailIssueStatistic(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/containerSec/scanner/images/detail/issueStatistic${parseGetMethodParams(data)}`,
    fetchParams('GET'),
  );
}
export function dbVersion(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/containerSec/scanner/db/version${parseGetMethodParams(data)}`, fetchParams('GET'));
}
export function dbHistory(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/containerSec/scanner/db/history${parseGetMethodParams(data)}`, fetchParams('GET'));
}
export function taskList(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/containerSec/scanner/scanTask/image/scan/task/list${parseGetMethodParams(data)}`,
    fetchParams('GET'),
  );
}
export function subtaskList(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/containerSec/scanner/scanTask/image/scan/subtask/list${parseGetMethodParams(data)}`,
    fetchParams('GET'),
  );
}
export function scanStatus(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/containerSec/scanner/scanTask/image/scan/task/status${parseGetMethodParams(data)}`,
    fetchParams('PUT', JSON.stringify(data)),
  );
}
export function reschedule(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/containerSec/scanner/scanTask/image/scan/subtask/reschedule${parseGetMethodParams(data)}`,
    fetchParams('PUT', JSON.stringify(data)),
  );
}
export function postSensitiveRule(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/containerSec/scanner/config/scan/sensitive/rule${parseGetMethodParams(data)}`,
    fetchParams('POST', JSON.stringify(data)),
  );
}
export function vulnConstView(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/containerSec/scanner/images/vulns/vuln/constView${parseGetMethodParams(data)}`,
    fetchParams('GET'),
  );
}
export function imagesVulnDetail(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/containerSec/scanner/images/vulns/vuln/detail${parseGetMethodParams(data)}`,
    fetchParams('GET'),
  );
}
export function webshellContent(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/containerSec/scanner/images/webshell/content${parseGetMethodParams(data)}`,
    fetchParams('GET'),
  );
}
export function sensitiveFile(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/containerSec/scanner/images/sensitive/file${parseGetMethodParams(data)}`,
    fetchParams('GET'),
  );
}
export function malwareFile(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/containerSec/scanner/images/malware/file${parseGetMethodParams(data)}`,
    fetchParams('GET'),
  );
}
export function webshellFile(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/containerSec/scanner/images/webshell/file${parseGetMethodParams(data)}`,
    fetchParams('GET'),
  );
}
export function licenseFile(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/containerSec/scanner/images/license/file${parseGetMethodParams(data)}`,
    fetchParams('GET'),
  );
}
export function viewConst(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/containerSec/scanner/config/view/const${parseGetMethodParams(data)}`,
    fetchParams('GET'),
  );
}
export function podsByOwner(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/platform/assets/podsByOwner${parseGetMethodParams(data)}`, fetchParams('GET'));
}
export function ATTCKRuleTemplates(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/containerSec/ATTCK/ruleTemplates${parseGetMethodParams(data, true)}`,
    fetchParams('GET'),
  );
}
export function ruleTemplatesApply(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/containerSec/ATTCK/ruleTemplates/apply${parseGetMethodParams(data)}`,
    fetchParams('POST', JSON.stringify(data)),
  );
}
export function ruleTemplatesDelete(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/containerSec/ATTCK/ruleTemplates/delete${parseGetMethodParams(data)}`,
    fetchParams('POST', JSON.stringify(data)),
  );
}
export function ruleTemplatesRules(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/containerSec/ATTCK/ruleTemplates/rules`, fetchParams('POST', JSON.stringify(data)));
}
export function POSTATTCKRuleTemplates(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/containerSec/ATTCK/ruleTemplates`, fetchParams('POST', JSON.stringify(data)));
}
export function wafServices(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/containerSec/waf/services${parseGetMethodParams(data)}`, fetchParams('GET'));
}
export function attackLog(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/containerSec/waf/attack/log/list${parseGetMethodParams(data)}`, fetchParams('GET'));
}
export function attackLogDetails(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/containerSec/waf/attack/log/details${parseGetMethodParams(data)}`,
    fetchParams('GET'),
  );
}
//
export function wafService(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/containerSec/waf/service`, fetchParams('POST', JSON.stringify(data)));
}
export function putWafService(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/containerSec/waf/service`, fetchParams('PUT', JSON.stringify(data)));
}
export function blackwhitelists(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/containerSec/waf/blackwhitelists${parseGetMethodParams(data)}`, fetchParams('GET'));
}
export function wafConfig(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/containerSec/waf/config${parseGetMethodParams(data)}`, fetchParams('GET'));
}
export function putWafConfig(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/containerSec/waf/config`, fetchParams('PUT', JSON.stringify(data)));
}
export function wafServiceId(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/containerSec/waf/service/${data.id}${parseGetMethodParams(data)}`,
    fetchParams('GET'),
  );
}
export function blackwhitelist(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/containerSec/waf/blackwhitelist`, fetchParams('POST', JSON.stringify(data)));
}
export function putBlackwhitelist(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/containerSec/waf/blackwhitelist`, fetchParams('PUT', JSON.stringify(data)));
} //
export function rawContainersByPod(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/platform/assets/rawContainersByPod${parseGetMethodParams(data, false)}`,
    fetchParams('GET'),
  );
}
export function yamlResources(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/containerSec/iac/yaml/resources${parseGetMethodParams(data)}`, fetchParams('GET'));
}
export function yamlTemplates(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/containerSec/iac/yaml/templates${parseGetMethodParams(data)}`, fetchParams('GET'));
}
export function deleteYamlTemplates(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/containerSec/iac/yaml/templates`, fetchParams('DELETE', JSON.stringify(data)));
}
export function postYamlTemplates(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/containerSec/iac/yaml/templates`, fetchParams('POST', JSON.stringify(data)));
}
export function putYamlTemplates(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/containerSec/iac/yaml/templates`, fetchParams('PUT', JSON.stringify(data)));
}
export function yamlTemplatesDetail(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/containerSec/iac/yaml/templates/detail${parseGetMethodParams(data)}`,
    fetchParams('GET'),
  );
}
export function yamlConfigs(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/containerSec/iac/yaml/configs${parseGetMethodParams(data)}`, fetchParams('GET'));
}
export function yamlRules(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/containerSec/iac/yaml/rules${parseGetMethodParams(data)}`, fetchParams('GET'));
}
export function exportTaskYaml(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/containerSec/export/task/yaml`, fetchParams('POST', JSON.stringify(data)));
}
export function yamlScan(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/containerSec/iac/yaml/scan`, fetchParams('POST', JSON.stringify(data)));
}
export function putYamlConfigs(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/containerSec/iac/yaml/configs`, fetchParams('PUT', JSON.stringify(data)));
}
export function yamlTasks(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/containerSec/iac/yaml/tasks${parseGetMethodParams(data)}`, fetchParams('GET'));
}
export function yamlRecords(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/containerSec/iac/yaml/records${parseGetMethodParams(data)}`, fetchParams('GET'));
}
export function templateSnapshotsDetail(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/containerSec/iac/yaml/templateSnapshots/detail${parseGetMethodParams(data)}`,
    fetchParams('GET'),
  );
}
export function recordsDetail(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/containerSec/iac/yaml/records/detail${parseGetMethodParams(data)}`,
    fetchParams('GET'),
  );
}
export function attackClasses(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/containerSec/waf/attack/classes${parseGetMethodParams(data)}`, fetchParams('GET'));
}
export function deleteServiceId(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/containerSec/waf/service/${data.id}`, fetchParams('DELETE'));
}
export function deleteBlackwhitelist(data?: any): Observable<WebResponse<any>> {
  let { id } = data;
  const url = `${URL}/api/v2/containerSec/waf/blackwhitelist/${id}`;
  return fetch$<any>(url, fetchParams('DELETE'));
}

export function putWafRules(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/containerSec/waf/rules`, fetchParams('PUT', JSON.stringify(data)));
} //
export function wafRules(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/containerSec/waf/rules${parseGetMethodParams(data)}`, fetchParams('GET'));
}
export function logRspPkg(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/containerSec/waf/attack/log/rspPkg${parseGetMethodParams(data)}`,
    fetchParams('GET'),
  );
}
export function yamlResourcesTypes(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/containerSec/iac/yaml/resources/types${parseGetMethodParams(data)}`,
    fetchParams('GET'),
  );
}
export function blackwhitelistEnabling(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/containerSec/waf/blackwhitelist/enabling`,
    fetchParams('PUT', JSON.stringify(data)),
  );
}
export function assetsServices(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/platform/assets/services${parseGetMethodParams(data)}`, fetchParams('GET'));
}
export function assetsEndpoints(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/platform/assets/endpoints${parseGetMethodParams(data)}`, fetchParams('GET'));
}
export function assetsIngresses(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/platform/assets/ingresses${parseGetMethodParams(data)}`, fetchParams('GET'));
}
export function assetsSecrets(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/platform/assets/secrets${parseGetMethodParams(data)}`, fetchParams('GET'));
}
export function assetsPvs(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/platform/assets/pvs${parseGetMethodParams(data)}`, fetchParams('GET'));
}
export function assetsPvcs(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/platform/assets/pvcs${parseGetMethodParams(data)}`, fetchParams('GET'));
}
export function assetsNamespaceLabels(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/platform/assets/namespaceLabels${parseGetMethodParams(data)}`, fetchParams('GET'));
}
export function ingressesInfo(data: {
  [x: string]: any;
  cluster_key?: any;
  namespace?: any;
  ingress_name?: any;
}): Observable<WebResponse<any>> {
  let { cluster_key, namespace, ingress_name } = data;
  return fetch$<any>(
    `${URL}/api/v2/platform/assets/cluster/${cluster_key}/namespace/${namespace}/ingresses/${ingress_name}${parseGetMethodParams(
      data,
    )}`,
    fetchParams('GET'),
  );
}
export function ingressIdRules(data: { [x: string]: any; ingress_id?: any }): Observable<WebResponse<any>> {
  let { ingress_id } = data;
  return fetch$<any>(
    `${URL}/api/v2/platform/assets/ingresses/${ingress_id}/rules${parseGetMethodParams(data)}`,
    fetchParams('GET'),
  );
}
export function assetsServicesDetail(data: {
  [x: string]: any;
  cluster_key?: any;
  namespace?: any;
  service_name?: any;
}): Observable<WebResponse<any>> {
  let { cluster_key, namespace, service_name } = data;
  return fetch$<any>(
    `${URL}/api/v2/platform/assets/cluster/${cluster_key}/namespace/${namespace}/services/${service_name}${parseGetMethodParams(
      data,
    )}`,
    fetchParams('GET'),
  );
}
export function assetsEndpointsDetail(data: {
  [x: string]: any;
  cluster_key?: any;
  namespace?: any;
  endpoints_name?: any;
}): Observable<WebResponse<any>> {
  let { cluster_key, namespace, endpoints_name } = data;
  return fetch$<any>(
    `${URL}/api/v2/platform/assets/cluster/${cluster_key}/namespace/${namespace}/endpoints/${endpoints_name}${parseGetMethodParams(
      data,
    )}`,
    fetchParams('GET'),
  );
}
export function dockerfileRecords(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/containerSec/iac/dockerfile/records${parseGetMethodParams(data)}`,
    fetchParams('GET'),
  );
}
export function taskDockerfile(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/containerSec/export/task/dockerfile`, fetchParams('POST', JSON.stringify(data)));
}
export function dockerfileResultsDetail(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/containerSec/iac/dockerfile/results/detail${parseGetMethodParams(data)}`,
    fetchParams('GET'),
  );
}
export function dockerfileTemplates(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/containerSec/iac/dockerfile/templates${parseGetMethodParams(data)}`,
    fetchParams('GET'),
  );
}
export function postDockerfileTemplates(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/containerSec/iac/dockerfile/templates`, fetchParams('POST', JSON.stringify(data)));
}
export function putDockerfileTemplates(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/containerSec/iac/dockerfile/templates`, fetchParams('PUT', JSON.stringify(data)));
}
export function dockerfileRules(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/containerSec/iac/dockerfile/rules${parseGetMethodParams(data)}`,
    fetchParams('GET'),
  );
}
export function dockerfileTemplateSnapshotsDetail(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/containerSec/iac/dockerfile/templateSnapshots/detail${parseGetMethodParams(data)}`,
    fetchParams('GET'),
  );
}
export function subsetKinds(data: { [x: string]: any; endpoints_id?: any }): Observable<WebResponse<any>> {
  let { endpoints_id } = data;
  return fetch$<any>(
    `${URL}/api/v2/platform/assets/endpoints/SubsetKinds${parseGetMethodParams(data)}`,
    fetchParams('GET'),
  );
}
export function subsetDetail(data: { [x: string]: any; endpoints_id?: any }): Observable<WebResponse<any>> {
  let { endpoints_id } = data;
  return fetch$<any>(
    `${URL}/api/v2/platform/assets/endpoints/${endpoints_id}/subsets${parseGetMethodParams(data)}`,
    fetchParams('GET'),
  );
}
export function backendKinds(data: { [key: string]: any } = {}): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/platform/assets/ingresses/backendKinds${parseGetMethodParams(data)}`,
    fetchParams('GET'),
  );
}
export function podsBySvc(data: { [key: string]: any } = {}): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/platform/assets/podsBySvc${parseGetMethodParams(data)}`, fetchParams('GET'));
}
export function nodesWithCountDetail(data: {
  [x: string]: any;
  cluster_key: any;
  name: any;
}): Observable<WebResponse<any>> {
  let { cluster_key, name } = data;
  return fetch$<any>(
    `${URL}/api/v2/platform/assets/cluster/${cluster_key}/nodes/withCount/${name}${parseGetMethodParams(data)}`,
    fetchParams('GET'),
  );
}
export function aiChat(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/platform/ai/chat`, fetchParams('POST', JSON.stringify(data)));
}
export function alertAnalyze(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/platform/ai/alert/analyze`, fetchParams('POST', JSON.stringify(data)));
}
export function namespaceLabel(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/platform/assets/namespaceLabel`, fetchParams('POST', JSON.stringify(data)));
}
export function namespaceLabelId(data?: any): Observable<WebResponse<any>> {
  let { id, label_id, ...otherData } = data;
  return fetch$<any>(
    `${URL}/api/v2/platform/assets/namespaceLabel/${id || label_id}`,
    fetchParams('PUT', JSON.stringify(otherData)),
  );
}
export function deleteNamespaceLabelId(data?: any): Observable<WebResponse<any>> {
  let { label_id } = data;
  return fetch$<any>(
    `${URL}/api/v2/platform/assets/namespaceLabel/${label_id}`,
    fetchParams('DELETE', JSON.stringify(data)),
  );
}
export function scanImage(data: { [key: string]: any }): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/containerSec/scanner/config/scan/image${parseGetMethodParams(data)}`,
    fetchParams('GET'),
  );
}
export function putScanImage(data?: any): Observable<WebResponse<any>> {
  let { id, configType, ...otherData } = data;
  return fetch$<any>(
    `${URL}/api/v2/containerSec/scanner/config/scan/image?id=${id}&configType=${configType}`,
    fetchParams('PUT', JSON.stringify(otherData)),
  );
}

// 获取基础镜像列表
export function getBaseImageList(pageParams: any): Observable<WebResponse<any>> {
  return imagesList(pageParams);
}
// 添加基础镜像
export function addBaseImage(data: {
  [x: string]: any;
  imageIds: any[];
  imageFromType: any;
}): Observable<WebResponse<any>> {
  let { imageFromType, ...otherProps } = data;
  const url = `${URL}/api/v2/containerSec/scanner/images/baseImage?imageFromType=${imageFromType}`;
  return fetch$<any>(url, fetchParams('POST', JSON.stringify(otherProps)));
}
// 移除基础镜像
export function removeBaseImage(data: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/scanner/images/baseImage${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('DELETE', JSON.stringify(data)));
}

// 获取基础镜像关联的应用镜像列表
export function getRelatedAppImageList(data: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/scanner/images/detail/appImage${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('GET'));
}

// 获取应用镜像关联的基础镜像列表
export function getRelatedBaseImageList(data?: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/scanner/images/detail/baseImage${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('GET'));
}

export function getRiskImagesUUidVerifyExistence(data: any): Observable<WebResponse<ImageScanSummaryResult>> {
  const { uuids } = data;
  const url = `${URL}/api/v2/containerSec/scanner/images/verifyExistence${parseGetMethodParams({
    uuids,
  })}`;

  return fetch$<ImageScanSummaryResult>(url, fetchParams());
}

export function getRiskImagesUUidCount(data: any): Observable<WebResponse<ImageScanSummaryResult>> {
  const { uuids } = data;
  const url = `${URL}/api/v2/containerSec/scanner/images/existenceCount${parseGetMethodParams({
    uuids,
  })}`;

  return fetch$<ImageScanSummaryResult>(url, fetchParams());
}
export function getImagesScanResultList(reqParams: any): Observable<WebResponse<ImageScanSummaryResult>> {
  const { pagination = {} } = reqParams;
  const url = `${URL}/api/v2/containerSec/scanner/images/list${parseGetMethodParams(pagination)}`;
  return fetch$<ImageScanSummaryResult>(url, fetchParams('POST', JSON.stringify(reqParams))).pipe(
    map((res) => {
      res.setItems(
        (res.data?.items || []).map((t: ImageScanSummaryResult) => {
          return new ImageScanSummaryResult(t);
        }),
      );
      return res;
    }),
  );
}
export function getRiskImagesListInfo(data: any): Observable<WebResponse<ImageScanSummaryResult>> {
  const { pagination = {}, cluster_key, namespace, resourceKind, resourceName } = data;
  const offset = pagination.offset || 0;
  const limit = pagination.limit || 10;
  const url = `${URL}/api/v2/platform/assets/imageinfos${parseGetMethodParams({
    cluster_key,
    namespace,
    resourceKind,
    resourceName,
    limit,
    offset,
  })}`;

  return fetch$<ImageScanSummaryResult>(url, fetchParams());
}
export function imagesList(data: any): Observable<WebResponse<any>> {
  let { pagination, ...otherData } = data;
  const url = `${URL}/api/v2/containerSec/scanner/images/list${parseGetMethodParams(pagination)}`;

  return fetch$<any>(url, fetchParams('POST', JSON.stringify(otherData)));
}

export function imagesOverview(data: { imageFromType: any }): Observable<WebResponse<any>> {
  let { imageFromType } = data;
  const url = `${URL}/api/v2/containerSec/scanner/images/overview?imageFromType=` + imageFromType;
  return fetch$<any>(url, fetchParams('GET'));
}

export function getImagesScanDetail(id: string): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/scanner/reportsByImageDetails?id=${id}`;
  return fetch$<any>(url, fetchParams());
}

export function scannerImagesDigestLayers(digest: string): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/scanner/images/${digest}/layers`;
  return fetch$<any>(url, fetchParams('GET'));
}

export function startScanOne(d: any): Observable<WebResponse<any>> {
  const data = {
    ...d,
    operator: getUserInformation().username,
  };
  const url = `${URL}/api/v2/containerSec/scanner/scanone`;

  return fetch$<any>(url, fetchParams('POST', JSON.stringify(data)));
}

export function getRepoList(reqParams?: {
  limit?: number;
  offset?: number;
  search?: string;
  regType?: string;
}): Observable<WebResponse<IRepoItem>> {
  const url = `${URL}/api/v2/containerSec/scanner/syncImage/registries?${serialize(reqParams)}`;
  return fetch$<any>(url, fetchParams('GET'));
}
export function scannerRegions(data: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/scanner/syncImage/regions${parseGetMethodParams(data)}`;

  return fetch$<any>(url, fetchParams('GET'));
}

export function getRepoTypes() {
  const url = `${URL}/api/v2/containerSec/scanner/syncImage/regType`;

  return fetch$<any>(url, fetchParams());
}

export function getResourcesByImage(data: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/scanner/images/resource${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('GET'));
}

export function getReportList(query: any): Observable<WebResponse<any>> {
  const { key_word = '', type, offset = 0, limit = 10 } = query;
  const url = `${URL}/api/v2/containerSec/scanner/scan-report${parseGetMethodParams({
    limit,
    offset,
    type,
    key_word,
  })}`;
  return fetch$<any>(url, fetchParams('GET'));
}

export function updateReport(id: number, data: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/scanner/scan-report/${id}`;

  return fetch$<any>(url, fetchParams('PUT', JSON.stringify(data)));
}

export function deleteReport(id: number): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/scanner/scan-report/${id}`;

  return fetch$<any>(url, fetchParams('DELETE'));
}

export function getReportDetail(id: number): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/scanner/scan-report/${id}`;

  return fetch$<any>(url, fetchParams());
}

export function addReport(data: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/scanner/scan-report`;

  return fetch$<any>(url, fetchParams('POST', JSON.stringify(data)));
}

export function geneReport(id: number): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/scanner/scan-report/${id}/subtask`;

  return fetch$<any>(url, fetchParams('POST'));
}

export function getReportRecord(id: number, pagination: any): Observable<WebResponse<any>> {
  const { offset = 0, limit = 5 } = pagination;
  const url = `${URL}/api/v2/containerSec/scanner/scan-report/${id}/subtask?limit=${limit}&offset=${offset}`;

  return fetch$<any>(url, fetchParams('GET'));
}

export function getReportData(id: number, subTaskId: number): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/scanner/scan-report/${id}/file/${subTaskId}`;

  return fetch$<any>(url, fetchParams('GET'));
}

export function getAllProjects(): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/scanner/scan-config/strategy/projects`;

  return fetch$<any>(url, fetchParams('GET'));
}

export function getAllRepos(): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/scanner/syncImage/registries?limit=${Number.MAX_SAFE_INTEGER}&offset=0`;
  return fetch$<any>(url, fetchParams('GET'));
}
export function getAddRepo(data: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/scanner/syncImage/registry${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('GET'));
}
export function addRepo(data: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/scanner/syncImage/registry`;
  return fetch$<any>(url, fetchParams('POST', JSON.stringify(data)));
}
export function updateRepo(data: { [x: string]: any; id: any }): Observable<WebResponse<any>> {
  let { id, ...otherData } = data;
  const url = `${URL}/api/v2/containerSec/scanner/syncImage/registry?id=${id}`;
  return fetch$<any>(url, fetchParams('PUT', JSON.stringify(otherData)));
}
export function removeRepo(id: string | number): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/scanner/syncImage/registry?id=${id}`;
  return fetch$<any>(url, fetchParams('DELETE'));
}
export function policySnapshot(data: { [x: string]: any; uniqueID?: any }): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/scanner/security/detect/policy/snapshot${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('GET'));
}
export function licenseList(data: { [x: string]: any }): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/scanner/config/scan/license/list${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('GET'));
}
export function detailLicense(data: { [x: string]: any }): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/scanner/images/detail/license${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('GET'));
}
export function vulnsList(data: { [x: string]: any }): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/scanner/vulns/list${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('GET'));
}
export function vulnDetail(data: { [x: string]: any }): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/scanner/images/vulns/vuln/detail${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('GET'));
}
export function relatedImage(data: { [x: string]: any }): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/scanner/images/related/image${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('GET'));
}
export function vulnsSoftware(data: { [x: string]: any }): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/scanner/vulns/software${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('GET'));
}
export function sensitiveDetail(data: { [x: string]: any }): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/scanner/images/sensitive/detail${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('GET'));
}
export function malwareDetail(data: { [x: string]: any }): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/scanner/images/malware/detail${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('GET'));
}

export function webshellDetail(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/containerSec/scanner/images/webshell/detail${parseGetMethodParams(data)}`,
    fetchParams('GET'),
  );
}
export function dockerfileScan(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/containerSec/iac/dockerfile/scan`, fetchParams('POST', JSON.stringify(data)));
}
export function deleteDockerfileTemplates(data?: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/containerSec/iac/dockerfile/templates${parseGetMethodParams(data)}`;
  return fetch$<any>(url, fetchParams('DELETE', JSON.stringify(data)));
}
export function dockerfiletemplatesDetail(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/containerSec/iac/dockerfile/templates/detail${parseGetMethodParams(data)}`,
    fetchParams('GET'),
  );
}
export function dockerfileConfigs(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/containerSec/iac/dockerfile/configs${parseGetMethodParams(data)}`,
    fetchParams('GET'),
  );
}
export function dockerfileResults(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/containerSec/iac/dockerfile/results${parseGetMethodParams(data)}`,
    fetchParams('GET'),
  );
}
export function putDockerfileConfigs(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/containerSec/iac/dockerfile/configs`, fetchParams('PUT', JSON.stringify(data)));
}
export function postDockerfileScan(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/containerSec/iac/dockerfile/scan`, fetchParams('POST', JSON.stringify(data)));
}
export function templatesDeleteConfirm(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/containerSec/iac/yaml/templates/deleteConfirm${parseGetMethodParams(data)}`,
    fetchParams('GET'),
  );
}

export function configsImport(data: any): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/platform/configs/import`;
  return fetch$<any>(url, {
    method: 'POST',
    headers: {
      ...AuthorizationData(),
      // 'Content-Type': 'multipart/form-data',
      'Accept-Language': getCurrentLanguage(),
    },
    body: data,
    selector: (res: any) => {
      try {
        return res.json();
      } catch (err) {
        return { error: { message: 'Unknown error' } };
      }
    },
  });
}

export function configsExport(data: { config: string[] }): Observable<WebResponse<any>> {
  const url = `${URL}/api/v2/platform/configs/export`;
  return fetch$<any>(url, fetchParams('POST', JSON.stringify(data)));
}

export function backupPoll(): Observable<WebResponse<BackupPollData>> {
  return fetch$<any>(`${URL}/api/v2/platform/configs/import/status`, fetchParams('GET'));
}

export function getManagementData(): Observable<WebResponse<TDataManagement>> {
  return fetch$<any>(`${URL}/api/v2/platform/data/getdata`, fetchParams('GET'));
}
export function getConfigsOperatorList(): Observable<WebResponse<TConfigsOperator>> {
  return fetch$<any>(`${URL}/api/v2/platform/configs/operatorList`, fetchParams('GET'));
}

export function setManagementData(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/platform/data/setdata`, fetchParams('POST', JSON.stringify(data)));
}
export function detailIssueOverview(data: {
  imageFromType: tabType;
  imageUniqueID?: string;
  deployRecordID?: string;
}): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/containerSec/scanner/images/detail/issueOverview${parseGetMethodParams(data)}`,
    fetchParams('GET'),
  );
}

// web 站点
export function assetsWebsiteList(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/platform/assets/exposeHosts${parseGetMethodParams(data)}`, fetchParams('GET'));
}

export function assetsWebsiteDetail(id: string, data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/platform/assets/exposeHost/${id}${parseGetMethodParams(data)}`, fetchParams('GET'));
}

// web 服务
export function assetsWebServeList(data: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/platform/assets/busiServices/web${parseGetMethodParams(data)}`, fetchParams('GET'));
}
// 获取web服务类型
export function assetsWebServeTypes(): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/platform/assets/busiServiceWebKind`, fetchParams('GET'));
}

// 运行应用详情，数据库详情，web服务详情
export function assetsWebServeDetail(id: string): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/platform/assets/busiService/${id}`, fetchParams('GET'));
}

/**
 * 启动用户可选项
 * busiType: '' | Web services | Databases
 * **/
export function getStartUserOptions(busiType?: string): Observable<WebResponse<any>> {
  let param: any = busiType ? { busiType } : null;
  return fetch$<any>(
    `${URL}/api/v2/platform/assets/busiServices/startUser${parseGetMethodParams(param)}`,
    fetchParams('GET'),
  );
}

// 数据库
export function assetsDatabaseList(req: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/platform/assets/busiServices/db${parseGetMethodParams(req)}`, fetchParams('GET'));
}
// 数据库类型
export function assetsDatabaseTypes(): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/platform/assets/busiServiceDbKind`, fetchParams('GET'));
}

// 运行应用
export function assetsRunAppList(req: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/platform/assets/busiServices${parseGetMethodParams(req)}`, fetchParams('GET'));
}

// 应用类别
export function getAssetsAppTypes(): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/platform/assets/busiServicesType`, fetchParams('GET'));
}

// 应用名称可选项
export function getAssetsAppNames(): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/platform/assets/busiServicesKind`, fetchParams('GET'));
}
export function monitorTotal(): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/platform/monitor/total`, fetchParams('GET'));
}
export function monitorHolmes(req: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/platform/monitor/holmes${parseGetMethodParams(req)}`, fetchParams('GET'));
}
export function monitorComponent(req: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/platform/monitor/component${parseGetMethodParams(req)}`, fetchParams('GET'));
}
export function monitorRefresh(req: { component: Monitoring }): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL} /api/v2/platform/monitor/refresh${parseGetMethodParams(req)}`, fetchParams('GET'));
}
///api/v2/usercenter/idp/dxhost
export function idpDxhost(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/usercenter/idp/dxhost${parseGetMethodParams(data)}`, fetchParams('GET'));
}

/**
 * 标签管理列表
 * response: type等于0表示自定义标签，其他都是内置标签
 * **/
export function getAssetsLabels(req: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/platform/assets/assetsTags${parseGetMethodParams(req)}`, fetchParams('GET'));
}
// 查询标签详情
export function getAssetsLabelInfo(id: string | number): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/platform/assets/assetsTag/${id}`, fetchParams('GET'));
}
// 保存标签
interface IAaveAssetsLabelInfo {
  id?: string | number;
  tag: {
    name: string;
    desc: string;
  };
  rels: {
    objType: string;
    objIds: string[] | number[];
  }[];
}
export function saveAssetsLabelInfo(req: IAaveAssetsLabelInfo): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/platform/assets/assetsTag`, fetchParams('POST', JSON.stringify(req)));
}
// 批量 开关标签状态
export function setAssetsLabelSwitch(req: {
  enableTagIds?: string[];
  disableTagIds?: string[];
}): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/platform/assets/assetsTagChangeStatus`, fetchParams('PUT', JSON.stringify(req)));
}
// 删除标签
export function delAssetsLabel(id: string | number): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/platform/assets/assetsTag/${id}`, fetchParams('DELETE'));
}

interface IAddOrDelLabelFromAsset {
  action: 'add' | 'delete';
  tagIds: string[];
  objs: { objType: string; objIds: string };
}
// 批量操作：批量添加、移除资产标签
export function addOrDelLabelFromAsset(req: IAddOrDelLabelFromAsset): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/platform/assets/assetsChangeTag`, fetchParams('POST', JSON.stringify(req)));
}

// 标签名称下拉框列表（自定义标签列表）
export function getCustomLabels(): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/platform/assets/assetsCustomTags`, fetchParams('GET'));
}

// 展示标签列表
export function getVisibleTags(): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/platform/assets/enableAssetsTags`, fetchParams('GET'));
}
// 资产发现：标签下的资产卡片列表
export function getAssetsInTag(tagId: string): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/platform/assets/assetsCountInTag?tagId=${tagId}`, fetchParams('GET'));
}

export function fetchBehavioralLearn(data: BehavioralLearnListReq) {
  return fetch$<BehavioralLearnListRes>(
    `${URL}/api/v2/platform/behavioral-learn/status${parseGetMethodParams(data)}`,
    fetchParams('GET'),
  );
}
export function fetchBehavioralLearnInfo(data: { resource_id: number }) {
  return fetch$<BehavioralLearnInfoRes>(
    `${URL}/api/v2/platform/behavioral-learn/resource/basic${parseGetMethodParams(data)}`,
    fetchParams('GET'),
  );
}
// 批量开始学习
export function startBehavioralLearn(data: StartBehavioralLearnReq[]) {
  return fetch$<OprLearnRes>(
    `${URL}/api/v2/platform/behavioral-learn/start`,
    fetchParams('POST', JSON.stringify(data)),
  );
}
// 停止学习
export function stopBehavioralLearn(data: { resource_id: number }) {
  return fetch$<OprLearnRes>(`${URL}/api/v2/platform/behavioral-learn/stop`, fetchParams('POST', JSON.stringify(data)));
}
// 批量启用禁用模型
export function enabledBehavioralLearn(data: EnabledBehavioralLearnReq[]) {
  return fetch$<OprLearnRes>(
    `${URL}/api/v2/platform/behavioral-learn/model/config`,
    fetchParams('POST', JSON.stringify(data)),
  );
}
// 一键学习所有资源
export function onekeyStartBehavioralLearn() {
  return fetch$<OprLearnRes>(`${URL}/api/v2/platform/behavioral-learn/onekey/learn`, fetchParams('PUT'));
}
// 一键启用禁用模型
export function onekeyEnabledBehavioralLearn(data: { enabled: boolean }) {
  return fetch$<OprLearnRes>(
    `${URL}/api/v2/platform/behavioral-learn/model/onekey/enabled`,
    fetchParams('PUT', JSON.stringify(data)),
  );
}
// 获取指定资源文件模型列表
export function modelFile(data: BehavioralLearnModelFileReq) {
  return fetch$<BehavioralLearnModelRes<BehavioralLearnModelFileItem>>(
    `${URL}/api/v2/platform/behavioral-learn/model/file${parseGetMethodParams(data)}`,
    fetchParams('GET'),
  );
}
// 获取指定资源的命令行列表
export function modelCommand(data: BehavioralLearnModelCommandReq) {
  return fetch$<BehavioralLearnModelRes<BehavioralLearnModelCommandItem>>(
    `${URL}/api/v2/platform/behavioral-learn/model/command${parseGetMethodParams(data)}`,
    fetchParams('GET'),
  );
}
// 获取指定资源的命令行列表
export function modelNetwork(data: BehavioralLearnModelNetworkReq) {
  return fetch$<BehavioralLearnModelRes<BehavioralLearnModelNetworkItem>>(
    `${URL}/api/v2/platform/behavioral-learn/model/network${parseGetMethodParams(data)}`,
    fetchParams('GET'),
  );
}
export function fetchBehavioralLearnModelFile(data: any): Observable<WebResponse<any>> {
  let method: HttpMethod = isUndefined(data.id) ? 'PUT' : 'POST';
  return fetch$<any>(`${URL}/api/v2/platform/behavioral-learn/model/file`, fetchParams(method, JSON.stringify(data)));
}
export function fetchBehavioralLearnModelCommand(data: any): Observable<WebResponse<any>> {
  let method: HttpMethod = isUndefined(data.id) ? 'PUT' : 'POST';
  return fetch$<any>(
    `${URL}/api/v2/platform/behavioral-learn/model/command`,
    fetchParams(method, JSON.stringify(data)),
  );
}
export function fetchBehavioralLearnModelNetwork(data: any): Observable<WebResponse<any>> {
  let method: HttpMethod = isUndefined(data.id) ? 'PUT' : 'POST';
  return fetch$<any>(
    `${URL}/api/v2/platform/behavioral-learn/model/network`,
    fetchParams(method, JSON.stringify(data)),
  );
}
// 获取操作日志
export function fetchModelLog(data: ModelLogReq) {
  return fetch$<BehavioralLearnModelRes<ModelLogItem>>(
    `${URL}/api/v2/platform/behavioral-learn/model/log${parseGetMethodParams(data)}`,
    fetchParams('GET'),
  );
}
export function assetsImage(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/containerSec/scanner/images/assets/image`,
    fetchParams('POST', JSON.stringify(data)),
  );
}
export function postGlobalConfig(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/platform/behavioral-learn/global/config`,
    fetchParams('POST', JSON.stringify(data)),
  );
}

export function globalConfig(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/platform/behavioral-learn/global/config`, fetchParams('GET'));
}

export function commandWhitelist(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/platform/behavioral-learn/global/command/whitelist${parseGetMethodParams(data)}`,
    fetchParams('GET'),
  );
}
export function fileWhitelist(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/platform/behavioral-learn/global/file/whitelist${parseGetMethodParams(data)}`,
    fetchParams('GET'),
  );
}
export function networkWhitelist(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/platform/behavioral-learn/global/network/whitelist${parseGetMethodParams(data)}`,
    fetchParams('GET'),
  );
}
export function fetchFileWhitelist(data: any): Observable<WebResponse<any>> {
  let method: HttpMethod = isUndefined(data.id) ? 'PUT' : 'POST';
  return fetch$<any>(
    `${URL}/api/v2/platform/behavioral-learn/global/file/whitelist`,
    fetchParams(method, JSON.stringify(data)),
  );
}
export function fetchCommandWhitelist(data: any): Observable<WebResponse<any>> {
  let method: HttpMethod = isUndefined(data.id) ? 'PUT' : 'POST';
  return fetch$<any>(
    `${URL}/api/v2/platform/behavioral-learn/global/command/whitelist`,
    fetchParams(method, JSON.stringify(data)),
  );
}
export function fetchNetworkWhitelist(data: any): Observable<WebResponse<any>> {
  let method: HttpMethod = isUndefined(data.id) ? 'PUT' : 'POST';
  return fetch$<any>(
    `${URL}/api/v2/platform/behavioral-learn/global/network/whitelist`,
    fetchParams(method, JSON.stringify(data)),
  );
}
export function delFileWhitelist(data: any): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/platform/behavioral-learn/global/file/whitelist`,
    fetchParams('DELETE', JSON.stringify(data)),
  );
}
export function delCommandWhitelist(data: any): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/platform/behavioral-learn/global/command/whitelist`,
    fetchParams('DELETE', JSON.stringify(data)),
  );
}
export function delNetworkWhitelist(data: any): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/platform/behavioral-learn/global/network/whitelist`,
    fetchParams('DELETE', JSON.stringify(data)),
  );
}
export function delModelFile(data: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/platform/behavioral-learn/model/file`, fetchParams('DELETE', JSON.stringify(data)));
}
export function delModelCommand(data: any): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/platform/behavioral-learn/model/command`,
    fetchParams('DELETE', JSON.stringify(data)),
  );
}
export function delModelNetwork(data: any): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/platform/behavioral-learn/model/network`,
    fetchParams('DELETE', JSON.stringify(data)),
  );
}
export function modelOut(data: { [x: string]: any; type: string }): Observable<WebResponse<any>> {
  let { type = 'command', ...otherData } = data;
  return fetch$<any>(
    `${URL}/api/v2/platform/behavioral-learn/model/out/${type}`,
    fetchParams('POST', JSON.stringify(otherData)),
  );
}
//微隔离
export function clusterNamespaceResources(data: { [x: string]: any }): Observable<WebResponse<any>> {
  let { cluster, namespace, ...otherData } = data;
  return fetch$<any>(
    `${URL}/api/v2/microseg/clusters/${cluster}/namespaces/${namespace}/resources${parseGetMethodParams(otherData)}`,
    fetchParams('GET'),
  );
}
export function micrClusterResources(data: { [x: string]: any }): Observable<WebResponse<any>> {
  let { cluster, ...otherData } = data;
  return fetch$<any>(
    `${URL}/api/v2/microseg/clusters/${cluster}/resources${parseGetMethodParams(otherData)}`,
    fetchParams('GET'),
  );
}
export function micrclusterNamespaceSegments(data: {
  [x: string]: any;
  cluster: any;
  namespace: any;
}): Observable<WebResponse<any>> {
  let { cluster, namespace, ...otherData } = data;
  return fetch$<any>(`${URL}/api/v2/microseg/clusters/${cluster}/namespaces/${namespace}/segments`, fetchParams('GET'));
}
export function microsegSegments(data?: { [x: string]: any }): Observable<WebResponse<any>> {
  let { ...otherData } = data || {};
  return fetch$<any>(`${URL}/api/v2/microseg/segments${parseGetMethodParams(otherData)}`, fetchParams('GET'));
}
export function microsegSegmentsId(data?: { [x: string]: any }): Observable<WebResponse<any>> {
  let { segmentId, ...otherData } = data || {};
  return fetch$<any>(
    `${URL}/api/v2/microseg/segment/${segmentId}${parseGetMethodParams(otherData)}`,
    fetchParams('GET'),
  );
}

export function micrclusterNamespaceSegmentsById(data: {
  [x: string]: any;
  groupId: any;
}): Observable<WebResponse<any>> {
  let { groupId, ...otherData } = data;
  return fetch$<any>(`${URL}/api/v2/microseg/segment/${groupId}${parseGetMethodParams(otherData)}`, fetchParams('GET'));
}
export function putMicrclusterNamespaceSegmentsById(data: {
  [x: string]: any;
  groupId: any;
}): Observable<WebResponse<any>> {
  let { groupId, ...otherData } = data;
  return fetch$<any>(`${URL}/api/v2/microseg/segments`, fetchParams('PUT', JSON.stringify(data)));
}
export function putMicrNsgrpsBase(data: { [x: string]: any; groupId: any }): Observable<WebResponse<any>> {
  let { groupId, ...otherData } = data;
  return fetch$<any>(`${URL}/api/v2/microseg/nsgrps/base`, fetchParams('PUT', JSON.stringify(data)));
}

export function resourcesCount(data: { [x: string]: any }): Observable<WebResponse<any>> {
  let { ...otherData } = data;
  return fetch$<any>(`${URL}/api/v2/microseg/resources/count${parseGetMethodParams(otherData)}`, fetchParams('GET'));
}
export function segmentResources(data: { [x: string]: any }): Observable<WebResponse<any>> {
  let { segment, ...otherData } = data;
  return fetch$<any>(
    `${URL}/api/v2/microseg/segments/${segment}/resources${parseGetMethodParams(otherData)}`,
    fetchParams('GET'),
  );
}
export function gatewayallowing(data: { [x: string]: any }): Observable<WebResponse<any>> {
  let { ...otherData } = data;
  return fetch$<any>(`${URL}/api/v2/microseg/resources/gatewayallowing`, fetchParams('PUT', JSON.stringify(data)));
}
export function addresources(data: {
  [x: string]: any;
  resources: number[];
  segmentID: number;
  cluster?: string;
  namespace?: string;
}): Observable<WebResponse<any>> {
  let { ...otherData } = data;
  return fetch$<any>(`${URL}/api/v2/microseg/segments/addresources`, fetchParams('PUT', JSON.stringify(data)));
}
export function moveresources(data: { [x: string]: any }): Observable<WebResponse<any>> {
  let { cluster, namespace, segment, ...otherData } = data;
  return fetch$<any>(
    `${URL}/api/v2/microseg/clusters/${cluster}/namespaces/${namespace}/segments/${segment}/moveresources`,
    fetchParams('PUT', JSON.stringify(data)),
  );
}
export function movenamespaces(data: { [x: string]: any }): Observable<WebResponse<any>> {
  let { cluster, namespace, segment, ...otherData } = data;
  return fetch$<any>(`${URL}/api/v2/microseg/nsgrps/movenamespaces`, fetchParams('PUT', JSON.stringify(data)));
}
export function postSegments(data: { [x: string]: any }): Observable<WebResponse<any>> {
  let { cluster, namespace, ...otherData } = data;
  return fetch$<any>(`${URL}/api/v2/microseg/segments`, fetchParams('POST', JSON.stringify(data)));
}
export function microsegPolicies(data: { [x: string]: any }): Observable<WebResponse<any>> {
  let { ...otherData } = data;
  return fetch$<any>(`${URL}/api/v2/microseg/policies${parseGetMethodParams(otherData)}`, fetchParams('GET'));
}
export function deleteMicrosegPolicy(data: { [x: string]: any }): Observable<WebResponse<any>> {
  let { ...otherData } = data;
  return fetch$<any>(
    `${URL}/api/v2/microseg/policy${parseGetMethodParams(otherData)}`,
    fetchParams('DELETE', JSON.stringify(data)),
  );
}
export function microsegPolicy(data: { [x: string]: any }, type: 'POST' | 'PUT'): Observable<WebResponse<any>> {
  let { ...otherData } = data;
  return fetch$<any>(`${URL}/api/v2/microseg/policy`, fetchParams(type, JSON.stringify(data)));
}
export function microsegResources(data: { [x: string]: any }): Observable<WebResponse<any>> {
  let { ...otherData } = data;
  return fetch$<any>(`${URL}/api/v2/microseg/resources${parseGetMethodParams(otherData)}`, fetchParams('GET'));
}
export function deleteSegments(data: { [x: string]: any }): Observable<WebResponse<any>> {
  let { ...otherData } = data;
  return fetch$<any>(
    `${URL}/api/v2/microseg/segments${parseGetMethodParams(otherData)}`,
    fetchParams('DELETE', JSON.stringify(data)),
  );
}
export function segmentsInnertrust(data: { [x: string]: any }): Observable<WebResponse<any>> {
  let { ...otherData } = data;
  return fetch$<any>(`${URL}/api/v2/microseg/segments/innertrust`, fetchParams('PUT', JSON.stringify(data)));
}

export function microClusterResources(data: { [x: string]: any }): Observable<WebResponse<any>> {
  let { clusterID, ...otherData } = data;
  return fetch$<any>(
    `${URL}/api/v2/microseg/clusters/${clusterID}/resources${parseGetMethodParams(data)}`,
    fetchParams('GET', null, { loginUser: getUserInformation().username }),
  );
}
export function microsegNamespaces(data: { [x: string]: any }): Observable<WebResponse<any>> {
  let { ...otherData } = data;
  return fetch$<any>(`${URL}/api/v2/microseg/namespaces${parseGetMethodParams(data)}`, fetchParams('GET'));
}
export function microsegAllassets(data: { [x: string]: any }): Observable<WebResponse<any>> {
  let { ...otherData } = data;
  return fetch$<any>(`${URL}/api/v2/microseg/allassets${parseGetMethodParams(data)}`, fetchParams('GET'));
}
export function microsegSettings(data?: { [x: string]: any }): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/microseg/settings${parseGetMethodParams(data || {})}`, fetchParams('GET'));
}
export function putMicrosegSettings(data?: { [x: string]: any }): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/microseg/settings`, fetchParams('PUT', JSON.stringify(data)));
}
export function microsegPolicyId(data: { [x: string]: any }): Observable<WebResponse<any>> {
  let { id } = data;
  return fetch$<any>(`${URL}/api/v2/microseg/policy/${id}`, fetchParams('GET'));
}
export function microsegNsgrps(data?: { [x: string]: any }): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/microseg/nsgrps${parseGetMethodParams(data || {})}`, fetchParams('GET'));
}
export function microsegNamespacesCount(data: { [x: string]: any }): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/microseg/namespaces/count${parseGetMethodParams(data)}`, fetchParams('GET'));
}
export function postNsgrps(data: { [x: string]: any }): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/microseg/nsgrps`, fetchParams('POST', JSON.stringify(data)));
}
export function deleteNsgrps(data: { [x: string]: any }): Observable<WebResponse<any>> {
  let { ...otherData } = data;
  return fetch$<any>(
    `${URL}/api/v2/microseg/nsgrps${parseGetMethodParams(otherData)}`,
    fetchParams('DELETE', JSON.stringify(data)),
  );
}
export function microsegNsgrpId(data: { [x: string]: any }): Observable<WebResponse<any>> {
  let { groupId, ...otherData } = data;
  return fetch$<any>(`${URL}/api/v2/microseg/nsgrps/${groupId}${parseGetMethodParams(data)}`, fetchParams('GET'));
}
export function addnamespaces(data: { [x: string]: any }): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/microseg/nsgrps/addnamespaces${parseGetMethodParams(data)}`, fetchParams('GET'));
}

export function putAddnamespaces(data: { [x: string]: any }): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/microseg/nsgrps/addnamespaces`, fetchParams('PUT', JSON.stringify(data)));
}
export function nsgrpsInnertrust(data?: { [x: string]: any }): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/microseg/nsgrps/innertrust`, fetchParams('PUT', JSON.stringify(data)));
}
export function ipgroups(data: { [x: string]: any }): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/microseg/ipgroups${parseGetMethodParams(data)}`, fetchParams('GET'));
}
export function ipgroupsId(data: { [x: string]: any }): Observable<WebResponse<any>> {
  let { id } = data;
  return fetch$<any>(`${URL}/api/v2/microseg/ipgroups/${id}${parseGetMethodParams(data)}`, fetchParams('GET'));
}
export function postIpgroups(data: { [x: string]: any }): Observable<WebResponse<any>> {
  let { ...otherData } = data;
  return fetch$<any>(`${URL}/api/v2/microseg/ipgroups`, fetchParams('POST', JSON.stringify(data)));
}
export function putIpgroups(data: { [x: string]: any }): Observable<WebResponse<any>> {
  let { ...otherData } = data;
  return fetch$<any>(`${URL}/api/v2/microseg/ipgroups`, fetchParams('PUT', JSON.stringify(data)));
}
export function suggestions(data: { [x: string]: any }): Observable<WebResponse<any>> {
  let { ...otherData } = data;
  return fetch$<any>(`${URL}/api/v2/microseg/suggestions${parseGetMethodParams(data)}`, fetchParams('GET'));
}
export function batchpolicies(data: { [x: string]: any }): Observable<WebResponse<any>> {
  let { ...otherData } = data;
  return fetch$<any>(`${URL}/api/v2/microseg/batchpolicies`, fetchParams('POST', JSON.stringify(data)));
}
export function deleteIpgroups(data: { [x: string]: any }): Observable<WebResponse<any>> {
  let { ...otherData } = data;
  return fetch$<any>(
    `${URL}/api/v2/microseg/ipgroups${parseGetMethodParams(data)}`,
    fetchParams('DELETE', JSON.stringify(data)),
  );
}
export function topology(data: { [x: string]: any }): Observable<WebResponse<any>> {
  let { cluster, ...otherData } = data;
  return fetch$<any>(
    `${URL}/api/v2/microseg/clusters/${cluster}/topology${parseGetMethodParams(data)}`,
    fetchParams('GET'),
  );
}
export function resourceTopology(data: { [x: string]: any }): Observable<WebResponse<any>> {
  let { cluster, namespace, kind, resource, ...otherData } = data;
  return fetch$<any>(
    `${URL}/api/v2/microseg/clusters/${cluster}/namespaces/${namespace}/kinds/${kind}/resources/${resource}/topology${parseGetMethodParams(data)}`,
    fetchParams('GET'),
  );
}
export function microseglog(data: { [x: string]: any }): Observable<WebResponse<any>> {
  let { cluster, namespace, kind, resource, ...otherData } = data;
  return fetch$<any>(
    `${URL}/api/v2/microseg/clusters/${cluster}/microseglog${parseGetMethodParams(data)}`,
    fetchParams('GET'),
  );
}
export function microsegTopology(data: { [x: string]: any }): Observable<WebResponse<any>> {
  let { ...otherData } = data;
  return fetch$<any>(`${URL}/api/v2/microseg/topology`, fetchParams('POST', JSON.stringify(data)));
}
export function policyimporting(data: { [x: string]: any }): Observable<WebResponse<any>> {
  let { ...otherData } = data;
  return fetch$<any>(`${URL}/api/v2/microseg/policyexporting${parseGetMethodParams(data)}`, fetchParams('GET'));
}
export function topologyNamespace(data: { [x: string]: any }): Observable<WebResponse<any>> {
  let { ...otherData } = data;
  return fetch$<any>(`${URL}/api/v2/microseg/topology/namespace${parseGetMethodParams(data)}`, fetchParams('GET'));
}

export function postPolicyimporting(
  data: any,
  cluster: string,
  onUploadProgress: Function,
  source: CancelTokenSource,
): Promise<any> {
  return uploadFile(
    `${URL}/api/v2/microseg/policyimporting${parseGetMethodParams({ cluster })}`,
    data,
    null,
    onUploadProgress,
    source,
  );
}
export function resourceDetails(data: { [x: string]: any }): Observable<WebResponse<any>> {
  let { cluster, ...otherData } = data;
  return fetch$<any>(
    `${URL}/api/v2/microseg/clusters/${cluster}/microseglog/resource/details`,
    fetchParams('POST', JSON.stringify(data)),
  );
}
export function flowDetails(data: { [x: string]: any; cluster?: any }): Observable<WebResponse<any>> {
  let { cluster, ...otherData } = data;
  return fetch$<any>(
    `${URL}/api/v2/microseg/clusters/${cluster}/microseglog/flow/details`,
    fetchParams('POST', JSON.stringify(data)),
  );
}
export function resourcesId(data: { [x: string]: any }): Observable<WebResponse<any>> {
  let { id, ...otherData } = data;
  return fetch$<any>(`${URL}/api/v2/microseg/resources/${id}${parseGetMethodParams(data)}`, fetchParams('GET'));
}
export function resourceDetailslog(data: { [x: string]: any; cluster?: any }): Observable<WebResponse<any>> {
  let { cluster, ...otherData } = data;
  return fetch$<any>(
    `${URL}/api/v2/microseg/clusters/${cluster}/microseglog/resource/detailslog`,
    fetchParams('POST', JSON.stringify(data)),
  );
}
export function flowDetailslog(data: { [x: string]: any; cluster?: any }): Observable<WebResponse<any>> {
  let { cluster, ...otherData } = data;
  return fetch$<any>(
    `${URL}/api/v2/microseg/clusters/${cluster}/microseglog/flow/detailslog`,
    fetchParams('POST', JSON.stringify(data)),
  );
}
export function filterMicroseglog(data: { [x: string]: any; cluster?: any }): Observable<WebResponse<any>> {
  let { cluster, ...otherData } = data;
  return fetch$<any>(`${URL}/api/v2/microseg/filter/microseglog`, fetchParams('POST', JSON.stringify(data)));
}
export function microsegReset(data?: any): Observable<WebResponse<any>> {
  let { ...otherData } = data;
  return fetch$<any>(`${URL}/api/v2/microseg/reset`, fetchParams('POST', JSON.stringify(data)));
}
export function policiesEnable(data?: any): Observable<WebResponse<any>> {
  let { ...otherData } = data;
  return fetch$<any>(`${URL}/api/v2/microseg/policies/enable`, fetchParams('PUT', JSON.stringify(data)));
}
export function policyrecreate(data?: any): Observable<WebResponse<any>> {
  let { ...otherData } = data;
  return fetch$<any>(`${URL}/api/v2/microseg/policyrecreate`, fetchParams('PUT', JSON.stringify(data)));
}
export function policytemplate(url: string): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}${url}`, fetchParams('GET'));
}
export function policyhistory(data?: any): Observable<WebResponse<any>> {
  let { id } = data;
  return fetch$<any>(`${URL}/api/v2/microseg/policyhistory/${id}${parseGetMethodParams(data)}`, fetchParams('GET'));
}
//
export function notifyConfig(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/platform/event/config`, fetchParams('POST', JSON.stringify(data)));
}
export function notifyEventTypes(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(`${URL}/api/v2/platform/event/eventTypes${parseGetMethodParams(data)}`, fetchParams('GET'));
}
export function policyLog(data?: any): Observable<WebResponse<any>> {
  return fetch$<any>(
    `${URL}/api/v2/microseg/filter/policyLog${parseGetMethodParams(data)}`,
    fetchParams('POST', JSON.stringify(data)),
  );
}
