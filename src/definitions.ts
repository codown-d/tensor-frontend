import { BreadcrumbItemProps } from 'antd/lib/breadcrumb';
import React from 'react';
import moment from 'moment';
import { ImageType } from './screens/ImagesScanner/definition';
import { translations } from './translations/translations';
declare global {
  interface Array<T> {
    remove(o: T): Array<T>;
    findOne(val: T, key: string): string | null;
    pushEvery(o: React.ReactNode): Array<T>;
  }
  interface Window {
    QRCode: any;
    REACT_APP_SIDEBAR_REJECT: string[]; //侧边栏模块
    REACT_APP_ASSET_MODULE: any[]; //全局变量名
    TOP_WINDOW: any; //最顶层window（主要针对有iframe情况才有区别）
    GLOBAL_WINDOW: any; //对路由操作时，用这个获取windowd对象，以方便全局统一处理
  }
}
export enum SupportedLangauges {
  Chinese = 'zh',
  English = 'en',
}
export enum Overview {
  typeOnline = 'typeOnline',
  typeNotline = 'typeNotline',
  typeWarnline = 'typeWarnline',
  typeNull = 'typeNull',
}
export enum BaseChartDataType {
  typeOther = 'typeOther',
  typeFailed = 'typeFailed',
  typeSuccess = 'typeSuccess',
  typeWarn = 'typeWarn',
}
export enum ScoreType {
  suc = 'suc',
  mid = 'mid',
  low = 'low',
  err = 'err',
}
export interface IResponseErrorItem {
  domain?: string;
  reason?: string;
  message?: string;
  location?: string;
  locationType?: string;
  extendedHelp?: string;
  sendReport?: string;
}

export interface IResponseError {
  code?: string;
  message?: string;
  errors?: Array<IResponseErrorItem>;
}

export interface IResponseData<T> {
  kind?: string;
  pageToken?: string;
  fields?: string;
  etag?: string;
  id?: string;
  lang?: string;
  updated?: string;
  deleted?: boolean;
  currentItemCount?: number;
  itemsPerPage?: number;
  startIndex?: number;
  totalItems?: number;
  pageIndex?: number;
  totalPages?: number;
  items?: Array<T>;
  item?: T;
  envKey?: string;

  // used by compliance breakdown screen
  // REFACTORME
  errorOn?: Array<string>;
  waitingOn?: Array<string>;
  successOn?: Array<string>;
}

export class WebResponse<T> {
  apiVersion?: string;
  context?: string;
  id?: string;
  params?: {
    id?: string;
  };
  data?: IResponseData<T>;
  error?: IResponseError;
  getUsedDiskSpace: any;
  challengeState: boolean;
  message?: string;

  isSuccess(): boolean {
    return !!this.data;
  }

  isForbidden(): boolean {
    return this.error && this.error.code && this.error.code.toString() === '401' ? true : false;
  }

  public setItems(items: T[]): void {
    if (!this.data) {
      return;
    }

    this.data.items = items;
  }

  public setError(error: IResponseError): WebResponse<T> {
    this.error = error;
    return this;
  }

  /**
   * Creates a new instance of the WebResponse, with given data.
   * @todo you can pass error object
   * @param data
   */
  public static from<T>(raw: WebResponse<T>): WebResponse<T> {
    const res = new WebResponse<T>();
    res.data = raw.data;
    res.context = raw.context;
    res.error = raw.error;
    res.params = raw.params;
    res.id = raw.id;
    res.message = raw.message;
    return res;
  }

  public get itemsPerPage(): number {
    return this.data?.itemsPerPage || this.data?.items?.length || 0;
  }

  public get totalItems(): number {
    return this.data?.totalItems || this.data?.items?.length || 0;
  }

  // used by compliance breakdown screen
  // REFACTORME
  public get errorOn(): Array<string> {
    return this.data?.errorOn || [''];
  }

  // used by compliance breakdown screen
  // REFACTORME
  public get waitingOn(): Array<string> {
    return this.data?.waitingOn || [''];
  }

  // used by compliance breakdown screen
  // REFACTORME
  public get successOn(): Array<string> {
    return this.data?.successOn || [''];
  }

  public reverseItems(): WebResponse<T> {
    if (!this.data || !this.data.items) {
      return this;
    }

    this.data.items = this.data.items.reverse();

    return this;
  }

  public getItem(): T | null {
    if (!this.data?.item) {
      return null;
    }

    return this.data?.item;
  }

  public getItems(): T[] {
    if (!this.data?.items) {
      return [];
    }

    return this.data?.items;
  }
  public getData(): any {
    if (this.data?.items) {
      return this.data.items || [];
    } else {
      return this.data || [];
    }
  }
  /**
   * Converts response data into an class instance
   */
  public castItemTo(TClass: any): WebResponse<T> {
    if (!this.data || !this.data.item) {
      return this;
    }
    this.data.item = new TClass(this.data.item);
    return this;
  }

  get errorMessage(): string {
    return this.error?.message || translations.unknownError;
  }
}

export const DateFormat = 'YYYY MM DD HH:mm:ss';
export const TimeFormat = 'YYYY-MM-DD HH:mm:ss';

export class ComplianceScanHistory {
  checkId?: string;
  clusterId?: string;
  clusterName?: string;
  createdAt?: number;
  finishedAt?: number;
  numError = 0;
  numFailed = 0;
  numInconclusive = 0;
  numSuccessful = 0;
  numWaiting = 0;
  score?: number;

  metaClusterName: string;
  formattedStartDate: string;
  formattedFinishDate: string;

  operator?: string;

  constructor(raw: ComplianceScanHistory) {
    this.checkId = raw.checkId;
    this.clusterId = raw.clusterId;
    this.clusterName = raw.clusterName;
    this.operator = raw.operator;

    if (raw.createdAt) {
      this.createdAt = raw.createdAt * 1000;
    }

    if (raw.finishedAt) {
      this.finishedAt = raw.finishedAt * 1000;
    }

    this.numError = raw.numError || 0;
    this.score = raw.score;
    this.numFailed = raw.numFailed || 0;
    this.numInconclusive = raw.numInconclusive || 0;
    this.numSuccessful = raw.numSuccessful || 0;
    this.numWaiting = raw.numWaiting || 0;

    if (this.createdAt) {
      this.formattedStartDate = moment(this.createdAt).format(DateFormat);
    }

    if (this.finishedAt) {
      this.formattedFinishDate = moment(this.finishedAt).format(DateFormat);
    }
  }

  public get totalNodes(): number {
    const totalNodes = this.numError + this.numFailed + this.numSuccessful + this.numInconclusive + this.numWaiting;

    return totalNodes;
  }

  public get completedNodes(): number {
    return this.totalNodes - this.numWaiting;
  }

  public get progress(): number {
    return this.totalNodes === 0 ? 0 : parseFloat(Math.round((this.completedNodes / this.totalNodes) * 100).toFixed(2));
  }

  public get progressString(): string {
    return `${this.progress}%`;
  }

  public get completionRate(): number {
    return parseFloat(((this.totalNodes - this.numError) / this.totalNodes).toFixed(2));
  }

  public get completionRatePrecentage(): string {
    return this.completedNodes === this.totalNodes ? `${this.completionRate * 100}%` : '-';
  }
}
export interface HarborReport_Item {
  harbor_config_link: string;
  rule_desc_cn: string;
  rule_desc_en: string;
  rule_name: string;
  status: string;
}
export interface ComplianceHarborHistoryReport {
  docker_contenttrust: HarborReport_Item[];
  library: HarborReport_Item[];
}
export interface ComplianceHarborHistory {
  check_id: string;
  created_at: number;
  finished_at: number;
  harbor: string;
  report: ComplianceHarborHistoryReport;
}

export interface ComplianceScanPolicyDetailsInfo {
  remediation?: string;
  nodeName: string;
  testStatus?: ComplianceMapStatus;
}

export class ComplianceScanPolicyDetails {
  audit?: string;
  description?: string;
  expectedResult?: string;
  section?: string;
  policyNumber?: string;
  remediation?: string;
  rationale?: string;
  testInfo?: string[];
  details: string;
  items: string[];
  reason: string;

  numFailed?: number;
  numInfo?: number;
  numSuccessful?: number;
  numWarn?: number;
  numError?: number;
  numWaiting?: number;

  failedOn?: ComplianceScanPolicyDetailsInfo[];
  infoOn?: ComplianceScanPolicyDetailsInfo[];
  successfulOn?: ComplianceScanPolicyDetailsInfo[];
  warnOn?: ComplianceScanPolicyDetailsInfo[];
  errorOn?: ComplianceScanPolicyDetailsInfo[];
  waitingOn?: ComplianceScanPolicyDetailsInfo[];
}

export class ComplianceScanBreakDown {
  description?: string;
  section?: string;
  policyNumber?: string;

  numFailed?: number;
  numInfo?: number;
  numSuccessful?: number;
  numWarn?: number;
  numError?: number;
  numWaiting?: number;
  policyId?: number;
  numInconclusive?: number;

  classified?: string;

  constructor(raw: ComplianceScanBreakDown) {
    this.description = raw.description;
    this.section = raw.section;
    this.policyNumber = raw.policyNumber;
    this.numFailed = raw.numFailed;
    this.numInfo = raw.numInfo;
    this.numSuccessful = raw.numSuccessful;
    this.numWarn = raw.numWarn;
    this.numError = raw.numError;
    this.policyId = raw.policyId;
    this.numWaiting = raw.numWaiting;
    this.numInconclusive = (this.numWarn || 0) + (this.numInfo || 0);
    this.classified = raw.classified;
  }
}
export interface TLdapLoginResult {
  currentAuthority: string; // 用户名
  status: string;
  type: 'ldapAccount';
  token: string; // jwt token
  role: string; // 用户角色
}
export interface TRadiusLoginResult {
  currentAuthority: string; // 用户名
  status: string;
  type: 'radiusAccount';
  token: string; // jwt token
  role: string; // 用户角色
  challengeState: string; // radius挑战 当state不为空时 需要用户响应挑战继续登录
}
export type TTwoFactorLoginStatus =
  | 'MfaBinding'
  | 'mfaSecretVerify'
  | 'MfaVerify'
  | 'TwoFactorVerifyFailed'
  | 'anewLogin';
export interface LoginResult {
  challengeState?: string;
  currentAuthority: string;
  status: string;
  token: string;
  type: string;
  role: string;
  state?: string;
  changePwdHashCode: string;
  cycleChangePwdDay: number;
  mustChangePwd: boolean;
  platform: string;
  licenseStatus: {
    valid: boolean;
    deadlineState: string;
    nodeLimitState: string;
  };
  //新增字段：
  //     twoFactorLoginStatus 字段:有 4 个常量值：
  //     MfaBinding          跳转到 绑定获取二维码 API
  //     mfaSecretVerify     跳转到 验证绑定状态 API
  //     MfaVerify           跳转到 登录二步验证 API
  //     TwoFactorVerifyFailed  动态码验证失败，重新操作（逻辑上为：动态码错误，重新输入动态码）
  //     anewLogin           跳转到 /api/v2/usercenter/login ，及 重新登录
  //     为空时，按照以前的逻辑走，

  //  MfaImage 字段: 为 绑定用户密钥的二维码，仅在 绑定获取二维码 API的返回中出现，使用base64 加密。
  // （和验证码相同）

  //  twoFactorSecret 字段: 为 验证两步登录同步性的 token，详细处理方式详见 各个API ；每次使用最新的token值
  //  备注：在返回了新的TwoFactorSecret 字段的值后，需携带 这个新的token 访问 两步登录 有关API
  twoFactorLoginStatus: TTwoFactorLoginStatus;
  //两步登录 验证token
  twoFactorSecret: 'e5/xPTv1AE66cgpsvD2xqxIvBUerf3Ndgi/XLlZlXWbM2ewn9pmdtc2kPDXhXr/r';
}
export interface TMfaBindImage {
  currentAuthority: string;
  //下一步两步登录的状态： mfaSecretVerify 表示 跳转到 验证绑定状态 API
  twoFactorLoginStatus: TTwoFactorLoginStatus;
  //下一步骤 两步登录 所需的 新验证token
  twoFactorSecret: string;
  //二维码的base64加密字符串
  mfaImage?: string;
  mfaSecret?: string;
  mfaQrCodeInfo?: string;
}
export interface TAppUrls {
  android: string;
  ios: string;
}
export interface LoginFormData {
  account?: string;
  password?: string;
  CaptchaID?: string;
  CaptchaValue?: string;
  state?: string;
}

export interface AuditConfig {
  coldStorageDays: number;
}

export interface GarbaceCollectionTask {
  id: string;
  status: string;
  startTime?: string;
}

export class HotStorageView {
  total: number;
  used: number;

  constructor(raw?: HotStorageView) {
    if (!raw) {
      return;
    }
    this.total = raw.total;
    this.used = raw.used;
  }

  getUsedDiskSpace(): number {
    return Math.round((this.used / this.total) * 100);
  }

  getAvailableDiskSpaceInGB(): string {
    return Math.round(((this.total - this.used) / Math.pow(1024, 3)) * 100) / 100 + 'GB';
  }
}

export interface DaysOffset {
  dataType?: 'cold' | 'hotLogic' | 'hotOffline' | 'waterline';
  daysOffset: number;
}

export interface Cluster {
  config: string;
  cronConfig?: {
    dockerBenchCronString: string;
    hostBenchCronString: string;
    kubeBenchCronString: string;
  };
  id?: string;
  name: string;
}

export enum ComplianceCheckType {
  Kubernetes = 'kube',
  Host = 'host',
  Docker = 'docker',
}

export const LatestComplianceCheckIdentifier = 'latest';

export interface Cronjob {
  clusterId: string;
  clusterName: string;
  cronString: string;
  cronType: string;
  preset?: string;
}

export interface CronJobForm {
  cronString: string;
  clusterID: string;
  checkType: string;
}

export interface CronJobPreset {
  id: string;
  cronString?: string;
  name: string;
}

export interface cnvdVulnerabilityInfo {
  number: string;
  desription: string;
  referenceLink: string;
  severity: ScanSeverity;
  title: string;
}

export interface cnnvdVulnerabilityInfo {
  fix_suggestion: string;
  number: string;
  referenceLink: string;
}

export interface cvssVulnerabilityInfo {
  cvssv2score: string;
  cvssv2vector: string;
  cvssv3exploitabilityScore: string;
  cvssv3impactScore: string;
  cvssv3score: string;
  cvssv3vector: string;
}

export interface Vulnerability {
  id: string;
  description: string;
  featurename: string;
  featureversion: string;
  fixedby: string;
  links: string[];
  namespace: string;
  severity: ScanSeverity;
  cnvds?: cnvdVulnerabilityInfo[];
  cnnvds?: cnnvdVulnerabilityInfo[];
  cvss?: cvssVulnerabilityInfo;
}

export interface AffectedImage {
  digest: string;
  finishedAt: number;
  harborURL: string;
  repository: string;
  tag: string;
  taskID: string;
}

export interface ScannerResult {
  affectedImages: AffectedImage[];
  vulnInfo: Vulnerability;
}

export interface ScanConfigUrl {
  href: string;
}

export interface HarborScanStatusMetrics {
  error: number;
  pending: number;
  running: number;
  success: number;
}

export interface HarborScanStatus {
  completed: number;
  ongoing: boolean;
  requester: string;
  total: number;
  metrics: HarborScanStatusMetrics;
}

export interface ScanStatus {
  isAborted: boolean;
  harborStatus: HarborScanStatus;
}

export interface PaginationOptions {
  offset?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
}

export enum ScanSeverity {
  Unknown = 'Unknown',
  Negligible = 'Negligible',
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Critical = 'Critical',
  Safe = 'Safe',
}
export enum ScanSeverityToNum {
  Unknown = 0,
  Negligible = 1,
  Low = 2,
  Medium = 3,
  High = 4,
  Critical = 6,
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
  Safe = 1,
}
export class RuntimeRule {
  enabled: boolean;
  name: string;
  cvss3Vector?: string;
  cvss3Score: number;
  cvss2Vector?: string;
  cvss2Score: number;
  description?: string;
  id: string;

  constructor(raw: RuntimeRule) {
    this.id = raw.id;
    this.enabled = raw.enabled;
    this.name = raw.name;
    this.cvss2Vector = raw.cvss2Vector;
    this.cvss3Vector = raw.cvss3Vector;
    this.cvss2Score = raw.cvss2Score;
    this.cvss3Score = raw.cvss3Score;
    this.description = raw.description;
  }
}

export enum RuleState {
  Enable = 'Enable',
  Disable = 'Disable',
}

export enum OnlineVulnerabilityKind {
  ReplicaSet = 'ReplicaSet',
  DaemonSet = 'DaemonSet',
}

export class OnlineVulnerability {
  namespace: string;
  overallSeverity: ScanSeverity;
  resourceKind: OnlineVulnerabilityKind;
  resourceName: string;
  runningContainers: string[];
  runningPods: string[];
  topVulnerabilities: Vulnerability[];
}

export interface OnlineVulnerabilityContainer {
  containerName: string;
  digest: string;
  harborURL: string;
  instancesRunning: Array<{
    node: string;
    podName: string;
    seccompProfile: string;
    driftPrevention: string;
  }>;
  instancesTerminated: Array<{
    node: string;
    podName: string;
    seccompProfile: string;
    driftPrevention: string;
  }>;
  instancesWaiting: Array<{
    node: string;
    podName: string;
    seccompProfile: string;
    driftPrevention: string;
  }>;
  repository: string;
  sensitiveFiles: Array<{
    name: string;
    description: string;
  }>;
  tag: string;
  vulnerabilities: Array<Vulnerability>;
  wasScanned: boolean;
  taskID: string;
}

export interface OnlineVulnerabilityComplexDetails {
  containers: {
    [key: string]: OnlineVulnerabilityContainer;
  };
  namespace: string;
  resourceKind: OnlineVulnerabilityKind;
  resourceName: string;
}

export interface Hierarchy {
  name: string;
  id?: string;
  children?: Hierarchy[];
  [key: string]: any;
}

export interface IGraph {
  data?: Hierarchy;
  width: number;
  height: number;
  select: (item: any, highliteOnDoc?: CalicoConnection[]) => void;
  focusHandler?: any;
  expandCircle?: (id: string, type: string) => void;
  ratioChange?: (ratio: number) => void;
  showTooltip?: (node: any, view: any, { zX, zy }: any, ratio: any) => void;
  links?: any[];
  docIsOpen?: boolean;
  isbright?: boolean;
  threshold?: number;
  omitChange?: (val: boolean) => void;
  onCloseDrawer?: (data?: any) => void;
  selReplyNode?: any;
  omittedMark?: boolean;
  showType?: 'drawer' | 'search' | 'null' | 'all';
  operation?: any;
  popupNodeID?: any;
  popupNodeNS?: any;
}

export interface LayerReport {
  layerNo: number;
  layerDigest: string;
  sensitives: Array<{ name: string; description: string }>;
  vulnerabilitiesAdded: Vulnerability[];
  vulnerabilitiesRemoved: Vulnerability[];
}

export interface ScannerReportContainer {
  sensitives: Array<{ name: string; description: string }>;
  vulnerabilitiesAdded: Vulnerability[];
  vulnerabilitiesRemoved: Vulnerability[];
}

export interface SeverityHistogram {
  numCritical: number;
  numHigh: number;
  numLow: number;
  numMedium: number;
  numNegligible: number;
  numUnknown: number;
}

export class ImageScanSummaryResult {
  overallSeverity: string;
  repository: string;
  tag: string;
  digest: string;
  taskID: string;
  topVulnerabilities: Vulnerability[];
  sensitiveFiles: Array<{
    name: string;
    description: string;
  }>;
  severityHistogram: SeverityHistogram;

  startedAt: number;
  finishedAt: number;
  formattedStartDate: string;
  formattedFinishDate: string;

  full_repo_name: string;
  tags: string;
  os: string;
  size: string;
  library: string;
  online: boolean;
  questions: {
    id: string;
    time: string;
    digest: string;
    link_object_id: string;
  }[];
  complete_time: string;
  push_time: string;
  scanStatus: string;
  Id: string;
  id: string;
  image_type: string;
  registry_name: string;
  registry_deleted_at: number;

  constructor(raw: ImageScanSummaryResult) {
    let self: any = this;
    Object.keys(raw).forEach((item) => {
      self[item] = (raw as any)[item];
    });
    this.overallSeverity = raw.overallSeverity;
    this.repository = raw.repository;
    this.tag = raw.tag;
    this.digest = raw.digest;
    this.taskID = raw.taskID;
    this.topVulnerabilities = raw.topVulnerabilities;
    this.sensitiveFiles = raw.sensitiveFiles;
    this.full_repo_name = raw.full_repo_name;
    this.tags = raw.tags;
    this.os = raw.os;
    this.size = raw.size;
    this.library = raw.library;
    this.questions = raw.questions;
    this.complete_time = raw.complete_time;
    this.push_time = raw.push_time;
    this.scanStatus = raw.scanStatus;
    this.Id = raw.Id;
    this.id = raw.id;
    this.online = raw.online;
    this.image_type = raw.image_type;
    this.registry_name = raw.registry_name;
    this.registry_deleted_at = raw.registry_deleted_at;

    if (raw.startedAt) {
      this.startedAt = raw.startedAt * 1000;
    }

    if (raw.finishedAt) {
      this.finishedAt = raw.finishedAt * 1000;
    }

    if (this.startedAt) {
      this.formattedStartDate = moment(this.startedAt).format(DateFormat);
    }

    if (this.finishedAt) {
      this.formattedFinishDate = moment(this.finishedAt).format(DateFormat);
    }
  }
}

export interface SeverityHistogramInfo {
  critical: number;
  high: number;
  medium: number;
  low: number;
  negligible: number;
  unknown: number;
}
export interface ScanDiscoverStatistic {
  vuln_total: number; //漏洞总数
  severity: {
    Critical: number; //危险
    High: number; //高危
    Medium: number; //中危
    Low: number; //低危
    Negligible: number; //可忽略
    Unknown: number; //未知
  };
  top5: {
    Name: string;
    Score: number;
    SeverityHistogramInfo: SeverityHistogramInfo;
    tag: string;
    id: number;
  }[];
}

export interface ScannerVulnsItem {
  name: string;
  severity: ScanSeverity;
  pkgname: string;
  pkgversion: string;
}

export interface ImagesScanDetailVirus {
  filename: string;
  filepath: string;
  virusname: string;
}
export interface ImagesScanDetailVuln {
  digest: string;
  finishedAt: number;
  harborURL: string;
  overallSeverity: ScanSeverity;
  repository: string;
  sensitiveFiles: SensitiveFile[];
  severityHistogram: SeverityHistogram;
  startedAt: number;
  tag: string;
  taskID: string;
  topVulnerabilities: Vulnerability[];
  risk_score: number;
  sensitive_score: number;
  virus_score: number;
  vuln_score: number;
  webshell_score: number;
}

export interface ImagesOverview {
  onlineTotal?: number;
  online?: {
    network_vuln: number;
    sensitive: number;
    virus: number;
    vuln: number;
    webshell: number;
  };
  imageTotal?: number;
  sum?: {
    network_vuln: number;
    sensitive: number;
    virus: number;
    vuln: number;
    webshell: number;
  };
}

export interface AssetContainer {
  cluster: string;
  containerID: string;
  digest: string;
  driftPrevention: string;
  harborURL: string;
  image: string;
  isDeleted: boolean;
  lastUpdateTime: number;
  name: string;
  namespace: string;
  node: string;
  overallSeverity: string;
  podName: string;
  podOwnerKind: string;
  podOwnerName: string;
  podUID: string;
  repository: string;
  seccompProfile: string;
  state: string;
  tag: string;
  taskID: string;
  wasScanned: boolean;
  topVulnerabilities: Vulnerability[];
  vulnerabilities: Vulnerability[];
}

export interface securityIssue {
  label: string;
  info: string;
  value: number;
}
export interface imageAttr {
  hasFixedVuln: boolean;
  imageType: ImageType;
  reinforced: boolean;
  trusted: boolean;
}
export interface ImageScanWebshellItem {
  codes: string[];
  filename: string;
  filepath: string;
  score: number;
}
export interface ImagesScanDetail {
  id: string;
  full_repo_name: string;
  tags: string;
  digest: string;
  os: string;
  size: number;
  library: string;
  questions: any;
  sentiveFixSuggestion: any[];
  vulnFixSuggestion: any[];
  complete_time: string;
  FirstPushTime: string;
  LastPullTime: string;
  LastPushTime: string;
  image_scan_env: any;
  image_scan_vuln: ImagesScanDetailVuln;
  image_scan_virus: ImagesScanDetailVirus[];
  container: AssetContainer[];
  image_scan_webshell?: ImageScanWebshellItem[];
  image_type: number;
  imageType: string;
}
export interface ScanDiscoverContainer {
  image_name: string;
  service_name: string;
  namespace: string;
  alias: string;
  full_repo_name: string;
  digest: string;
  library: string;
  tag: string;
  id: number;
}
export interface ScanDiscoverDetail {
  vulninfo: {
    name: string;
    vulnname?: string;
    severity: ScanSeverity;
    pkgname: string;
    pkgversion: string;
    cnvds: cnvdVulnerabilityInfo[];
    cvss: cvssVulnerabilityInfo;
    links: string[];
    fixedby: string;
    cvssMap: any;
    description: string;
    cnnvds: cnnvdVulnerabilityInfo;
  };
  vuln_image_list: {
    digest: string;
    full_repo_name: string;
    library: string;
    id: number;
  }[];
  containers: ScanDiscoverContainer[];
}

export interface LayerDigestInfo {
  created_at: string;
  deleted_at: string | number;
  id: number;
  image_id: number;
  is_basic: number;
  layer_digest: string;
  malicious_info: any;
  pkg_info: any;
  sensitive_file: SensitiveFile[];
  updated_at: string;
  vuln_info: Vulnerability[];
  webshell_info: any;
  // sensitive_file：表示敏感文件列表，
  // malicious_info：恶意文件列表（暂时没有数据，后面可能会补）
  // pkg_info：软件包信息（暂时没有数据，后面可能会补）
  // vuln_info：漏洞列表，各字段表示的意义和 /api/v2/containerSec/scanner/reportsByImageDetails 接口中image_scan_vuln一致
}

export interface ImagesDigestLayer {
  created: string;
  created_by: string;
  image_digest: string;
  image_id: string;
  malicious: string[]; // 恶意文件名的列表（字符串列表）
  pkgs: string[]; // 软件包名列表
  sensitive_files: string[]; // 敏感文件名列表
  vulus: string[]; // 漏洞的ID列表
  //   created：创建时间
  // created_by：创建命令
  webshell_info: string[];
}

export class ScannerReportTask {
  digest: string;
  overallSeverity: string;
  repository: string;
  tag: string;
  taskID: string;
  topVulnerabilities: Vulnerability[];
  perLayerReport: LayerReport[];

  constructor(raw: ScannerReportTask) {
    this.digest = raw.digest;
    this.overallSeverity = raw.overallSeverity;
    this.repository = raw.repository;
    this.tag = raw.tag;
    this.taskID = raw.taskID;
    this.topVulnerabilities = raw.topVulnerabilities;
    this.perLayerReport = raw.perLayerReport;
  }
}

export enum ComplianceMapStatus {
  Pass = 'PASS',
  Fail = 'FAIL',
  Warn = 'WARN',
  Info = 'INFO',
  Note = 'NOTE',
  UNKNOWN = 'UNKNOWN',
}

export interface ComplianceMapEntry {
  policyNumber: string;
  section: string;
  description: string;
  remediation: string;
  testStatus: ComplianceMapStatus;
}

export class NodeComplianceDetails {
  checkID: string;
  clusterID: string;
  status: string;
  nodeName: string;
  logs: string;
  complianceMap: ComplianceMapEntry[];

  constructor(raw: NodeComplianceDetails) {
    this.checkID = raw.checkID;
    this.clusterID = raw.clusterID;
    this.status = raw.status;
    this.nodeName = raw.nodeName;
    this.complianceMap = raw.complianceMap;
  }
}

export enum RiskFilter {
  Default = '',
  MediumToCritical = 'medToCrit',
  NetworkBased = 'networkBased',
  OnlineVulnerability = 'OnlineVulnerability',
}

export type ScannerScreenSortBy = 'severity' | 'feature-name';

export type ScannerScreenSortOrder = 'asc' | 'desc';

export interface Notification {
  title: string;
  description: string;
  date: string;
  icon?: string;
  type?: NotificationType;
  actions?: Array<INotificationAction>;
}

export interface INotificationAction {
  name: string;
  fn: Function;
}
export type Fn = (arg1?: any, arg2?: any, arg3?: any, arg4?: any) => any;
export enum taskStatus {
  pending = 1,
  inProgress = 2,
  succeeded = 3,
  failed = 4,
  terminate = 5,
}
export enum scanStatus {
  unknow = 'unknow',
  pending = 'pending',
  inProgress = 'inprogress',
  succeeded = 'success',
  failed = 'failed',
  not_scan = 'notscan',
}
export enum NotificationType {
  DEFAULT = 'default',
  PRIMARY = 'primary',
  SUCCESS = 'success',
  WARNING = 'warning',
  DANGER = 'danger',
}
export interface SelectItem {
  label: string;
  value: string | number;
  disabled?: boolean;
}
export enum ServerAlertKind {
  Falco = 'ATT&CK',
  ActiveDefense = 'Watson',
  RuntimeDetection = 'vulnerabilityExploitAttack',
  ExploitRisk = 'reverseShellAttack',
  DriftPrevention = 'immune',
  DeflectDefense = 'driftPrevention',
  //SeccompProfile = 'seccompProfile',
  ImageSecurity = 'imageSecurity',
  kubeMonitor = 'kubeMonitor',
  //fileAccessException = 'apparmor',
}

export interface ComplianceCheckServerAlert {
  affectedNodes: string[];
  checkID: string;
  checkType: ComplianceCheckType;
  clusterID: string;
  policyID: string;
}

export interface RuntimeDetectionServerAlert {
  containerId: string;
  podUid: string;
  podName: string;
  ruleName: string;
  description: string;
  cvss3Vector: string;
  cvss3Score: number;
  cvss2Vector: string;
  cvss2Score: number;
}

export interface ExploitRiskServerAlert {
  containerId: string;
  podUid: string;
  description: string;
  podName: string;
  pid: number;
}

export interface DriftPreventionServerAlert {
  affectedPod: string;
  action: string;
  reason: string;
  crc32Actual: number; // optional field
  crc32Expected: number; // optional field
  filepath: string;
  syscall: string;
}

export interface SeccompProfileServerAlert {
  affectedPod: string;
  action: string;
  syscall: string;
  phase: string;
}

export interface FalcoServerAlert {
  affectedPod: string;
  command: string;
  container: string;
  user: string;
  image: string;
  syscall: string;
  ruleType: string;
}

export class ServerAlert<T> {
  acknowledged: boolean;
  rule: T;
  data: T;
  id: string;
  message: string;
  cluster: string;
  customKV: any;
  severity: ScanSeverity;
  kind: ServerAlertKind;
  timestamp: string;
  history?: TimeHistories[];

  constructor(raw: ServerAlert<T>) {
    this.acknowledged = raw.acknowledged;
    this.rule = raw.rule;
    this.data = raw.data;
    this.id = raw.id;
    this.message = raw.message;
    this.severity = raw.severity;
    this.kind = raw.kind;
    this.timestamp = raw.timestamp;
    this.history = raw?.history;
  }
}

export class AlertCount {
  count: number;

  constructor(count: number) {
    this.count = count;
  }
}

export enum Colors {
  Red = '#A84242',
  Orange = '#E05E5F',
  Green = '#A6ACBD',
  Yellow = '#F8BF23',
}

export interface DropDownItem {
  id?: number;
  title: string;
  icon?: string;
  value?: string;
}
type TAccess = '2' | '3' | '4';
export interface RouteTypes {
  name?: string;
  path: string;
  element: any;
  data?: any;
  description?: any;
  title?: string;
  navbarTools?: any[];
  breadcrumb?: BreadcrumbItemProps[];
  breadcrumbData?: any;
  layout?: boolean; //是否不显示左侧menu和header
  hideMenu?: boolean; //是否不显示左侧menu显示header
  hideHeader?: boolean; //是否不显示header
  hidefoot?: boolean; //是否不显示foot
  keepalive?: string; //是否缓存
  onBack?: (() => void) | boolean;
  className?: string;
  roles?: string[];
  access?: TAccess | TAccess[]; //2- 平台 4-未隔离 3-容器
}

export function formatGeneralDate(date: any): string {
  return moment(date).format(DateFormat);
}

export function formatGeneralTime(date: any): string {
  return moment(date).format(TimeFormat);
}

export class AddUserResult {
  success: boolean;
  userId?: string;
  userName?: string;
  pwd?: string;
  level?: number;
}

export class SetUserRoleResult {
  success: boolean;
}

export class SetRoleAccessResult {
  success: boolean;
}

export class AddRoleAccessResult {
  success: boolean;
}

export class DeleteRoleAccessResult {
  success: boolean;
}

export class SetModLevelResult {
  success: boolean;
}

export class UserListFormData {
  page?: number;
  limit?: number;
}

export class AccessListFormData {
  page?: number;
  limit?: number;
}

export class RoleListFormData {
  page?: number;
  limit?: number;
}

export class ResetUserPwd {
  pwd?: string;
}

export class AddUserFormData {
  userName?: string;
  roleName?: string;
}

export class SetUserRoleFormData {
  userName?: string;
  roleName?: string;
  action?: string;
}

export class SetRoleAccessFormData {
  roleName?: string;
  accessName?: string;
  action?: string;

  ToMap(): {} {
    return {
      role_name: this.roleName,
      access_name: this.accessName,
      action: this.action,
    };
  }
}

export class User {
  userName: string;
  userId: string;
  pwd: string;
  roleNameList: string[];
}

export class Role {
  id: string;
  roleName: string;
  accessNameList: string[];
  describe: string;

  static ToSelectArray(ary: Role[]): RoleSelect[] {
    const result: RoleSelect[] = [];
    for (let i = 0; i < ary?.length; i++) {
      const r: RoleSelect = new RoleSelect(ary[i]);
      result.push(r);
    }
    return result;
  }
}

export class RoleSelect {
  id: string; /* use Role.roleName */
  name: string;
  accessNameList: string[];
  describe: string;

  constructor(role: Role) {
    this.id = role.roleName;
    this.name = role.roleName;
    this.accessNameList = role.accessNameList;
    this.describe = role.describe;
  }
}

export class Access {
  id: string;
  accessName: string;
  url: string;
  describe: string;

  static ToSelectArray(ary: Access[]): AccessSelect[] {
    const result: AccessSelect[] = [];
    for (let i = 0; i < ary?.length; i++) {
      const a: AccessSelect = new AccessSelect(ary[i]);
      result.push(a);
    }
    return result;
  }
}

export class AccessSelect {
  id: string; /* use Access.accessName */
  name: string;
  url: string;
  describe: string;

  constructor(access: Access) {
    this.id = access.accessName;
    this.name = access.accessName;
    this.url = access.url;
    this.describe = access.describe;
  }
}

export interface RiskFilterVulnerabilityLevel {
  iconActive: string;
  icon: string;
  name: string;
  type?: RiskFilter;
  extraClass?: string;
}

export interface ILoading {
  color?: string;
}

export interface ISpotlight {
  [key: string]: any;
}

export interface LoggedInUserInformation {
  username: string;
  account: string;
  type: 'account';
  role: string;
  platform: string;
  module_id?: RouteTypes['access'][];
}

export class MicroServiceDetails {
  name: string;
  children?: MicroServiceDetails;
}

export interface MicFousParams {
  namespace: string;
  svcName: string;
  optType: 'Focus' | 'UnFocus';
}

export interface MicResponsibleSubmitParams {
  namespace: string;
  svcName: string;
  respName: string[];
}

export interface MicSetServiceAliasParams {
  namespace: string;
  svcName: string;
  aliasName: string;
}

export interface MicroServiceListItem {
  ResName: string[];
  isFocus: boolean;
  name: string;
  namespace: string;
}

export interface MicroServiceItemInfo {
  namespace: string;
  name: string;
  ResName: string[];
  isFocus: boolean;
  serviceEdit: boolean;
  repository: string[];
  aliasName?: string;
}

export interface RiskExplorerTag {
  ComplianceCheck?: number;
  ExploitRisk?: number;
  RuntimeDetection?: number;
  ImageVulnerabilities?: number;
  [t: string]: any;
}

export interface RiskExplorerOverall {
  namespaceName: string;
  resourcesList: RiskExplorerService[];
}

export type RiskExplorerServiceNodeType = 'service' | 'ownerReference';
export interface RiskExplorerService {
  appTargetName: string;
  appTargetVersion: string;
  containerList: RiskExplorerContainer[];
  finalSeverity: ScanSeverity;
  riskLevel: number;
  namespace: string;
  managers: { account: string; userName: string }[];
  authority: string;
  alias: string;
  resourceName: string;
  tag: RiskExplorerTag;
  nodeType: RiskExplorerServiceNodeType;
  resourceKind: 'ReplicaSet' | 'StatefulSet' | 'DeamonSet' | 'Job' | 'Deployment';
}

export interface RiskExplorerContainer {
  containerID: string;
  name: string;
  namespaceName: string;
  resourceName: string;
}

export interface SensitiveFile {
  description: string;
  description_en: string;
  description_zh: string;
  name: string;
}

export enum ServiceRiskType {
  ImageVulnerabilities = 'ImageVulnerabilities',
}

export interface ServiceRiskItem {
  riskType: ServiceRiskType;
  riskData: {
    sensitiveFiles: SensitiveFile[];
    scanTaskID: string;
    vulnerabilities: Vulnerability[];
    harborURL?: string;
  };
}

export interface ServiceInstance {
  node: string;
  podName: string;
}

export interface ServiceDetailsContainer {
  name: string;
  digest: string;
  instancesRunning: ServiceInstance[];
  instancesRuning: ServiceInstance[];
  instancesTerminated: ServiceInstance[];
  instancesWaiting: ServiceInstance[];
  repository: string;
  repoTag: string;
  riskItems: ServiceRiskItem[];
}

export interface OnlineVulnerabilityServiceDetails {
  containers: ServiceDetailsContainer[];
  riskItems: ServiceRiskItem[];
  namespace: string;
  resourceKind: OnlineVulnerabilityKind;
  resourceName: string;
}

export interface OnlineVulnerabilitiesFilterOptions {
  applicationVulnerabilities?: any;
  criticalLevel: boolean;
  edgeService: boolean;
  highLevel: boolean;
  imageVulnerabilities?: any;
  lowLevel: boolean;
  mediumLevel: boolean;
  negligibleLevel: boolean;
  runtimeThreats?: any;
  unknownLevel: boolean;
  [x: string]: boolean;
}

export interface OnlineVulnerabilitiesFilterCount {
  applicationVulnerabilities: number;
  criticalLevel: number;
  edgeService: number;
  highLevel: number;
  imageVulnerabilities: number;
  lowLevel: number;
  mediumLevel: number;
  negligibleLevel: number;
  runtimeThreats: number;
  unknownLevel: number;
}

export interface Node {
  data: any;
  depth: number;
  height: number;
  parent: Node;
  r: number;
  value: number;
  x: number;
  y: number;
  [x: string]: any;
}
export interface TimeHistories {
  timestamp?: number;
  containerId?: string;
  podName?: string;
  podUid?: string;
}

export interface Prompt {
  hasUpdates?: boolean;
  newCursor?: string;
  updatesNumStr: string;
}

export type TensorWallRuleStype = 'service' | 'global' | 'cluster' | 'namespace' | 'streenode'; //目前可选 global  service
//后期可选  cluster namespace streenode
export type TensorWallRuleOpt_type = 'OBSERVED' | 'REJECT';
export type TensorWallRuleStatus = 'enable' | 'disable';
export interface TensorWallSetRuleParams {
  status: TensorWallRuleStatus;
  cluster: string;
  namespace: string;
  streenode: string;
  service: string;
  opt_type: TensorWallRuleOpt_type;
  stype: TensorWallRuleStype;
  rule_id?: number;
  reject_response?: {
    http_code: number;
    content_type: string;
    headers: object;
    body: string;
  };
}

export interface TensorWallGetRuleParams {
  stype: TensorWallRuleStype;
  cluster: string;
  namespace: string;
  service: string;
  rule_id?: number;
}

export type TensorWallGetRuleResStatus =
  | '_OBSERVED'
  //观测状态
  | '_DISABLED'
  // 关闭，
  | 'REJECT'; // 阻断状态

export interface TensorWallEdgeEventListParams {
  during: number;
  step?: string;
  end?: number;
  cluster?: string;
  namespace?: string;
  service?: string;
  stype?: TensorWallRuleStype;
  start?: number;
}

export interface TensorWallEdgeServiceEventsListResItem {
  cluster: string;
  namespace: string;
  service: string;
}

export interface TensorWallEdgeServiceEventsListResEvents {
  cluster: string;
  decision: 'OBSERVED' | 'REJECTED';
  detail: string;
  namespace: string;
  'request-id': string;
  'rgroup-id': string;
  'rule-id': string;
  service: string;
  timestamp: string;
  value?: number;
}
export interface TensorWallEdgeServiceEventsListRes {
  items: TensorWallEdgeServiceEventsListResEvents[];
}

export interface TensorWallEdgeServiceListRes {
  items: TensorWallEdgeServiceEventsListResItem[];
}
export interface TableKind<T> {
  title: string;
  center?: boolean;
  className?: string | string[];
  flex?: number;
  link?: string;
  kind?: string;
  sort?: (row: T) => JSX.Element | string;
}

export interface ServiceList {
  cluster?: string;
  namespace: string;
  status?: string;
  selected?: boolean;
  svcname?: string;
}

export class EdgeServiceSubmit {
  edge: ServiceList[];
}

export class EdgeServiceSubmitResult {
  status?: string;
}
export interface MenuDataType {
  title: string;
  label: string;
  icon?: any;
  link?: string;
  open?: boolean;
  parent?: MenuDataType;
  className?: string;
  currentActive?: boolean;
  children?: MenuDataType[];
  hide?: boolean;
  id: string;
  key: string;
}

export interface SuperUser {
  userName: string;
  account: string;
  role: string;
  module_id: RouteTypes['access'][];
  status: 1 | 2 | 3 | 4; //1=正常 2=待激活 3=锁定 4=停用
  create_at: '';
}

export class UserModule {
  id: number;
  module_name: string;
}
export class AddSuperUser {
  userName?: string;
  pwduserName?: string;
  roleName?: string;
  moduleID?: string[];
  pwd?: string;
  oldpwd?: string;
  hash_code?: string;
}

export interface StrongType {
  dataType: 'cold' | 'hotLogic' | 'hotOffline';
}

export interface TtlType {
  dataType: 'cold' | 'hotLogic' | 'hotOffline';
  ttlDays: number;
}

export interface GCItem {
  id: string;
  status: string;
  startTime?: string;
}

export interface MicroMapDetails {
  Cluster: string;
  Kind: string;
  Namespace: string;
  Resource: string;
  pod_name?: string;
  container_name?: string;
  container_id?: string;
  k8sManaged?: string;
}

export interface ImageRejectTop5 {
  reject_reason_cn: string;
  reject_reason_en: string;
  count: number;
  fillColor?: string;
}

export interface ImageRejectOverview {
  one_day_count: number;
  seven_day_count: number;
  graphs: number[];
  reasonTop5: ImageRejectTop5[];
}

export interface ImageRejectImage {
  created_at: string;
  deleted_at: string;
  full_repo_name: string;
  id: number;
  library: string;
  reject_at: string;
  reject_detail: string;
  reject_reason: number[];
  tag: string;
  vuln_level: ScanSeverity;
  vuln_score: number;
  name: string;
  digest: string;
}

export interface ImageRejectImageWhite {
  id: number;
  full_repo_name: string;
  tag: string;
  library: string;
  created_at: string;
  digest: string;
}

export interface RejectVuln {
  id: number;
  reject_policy_id: number;
  library: string;
  name: string;
  reject_policy: string;
  created_at: string;
}

export enum MaliciousRejectType {
  alarm = 'alarm',
  alert = 'alert',
  block = 'block',
  reject = 'reject',
  ignore = 'ignore',
}

export interface ImageRejectRuleConfigPolicie {
  id: number;
  name: string;
  library: string[];
  comment: string;
  operator: string;
  vuln_score: number;
  vuln_level: ScanSeverity;
  vuln_policy: MaliciousRejectType;
  sensitive_file_policy: MaliciousRejectType;
  malicious_policy: MaliciousRejectType;
  reject_vulns: RejectVuln[];
  created_at: string;
  updated_at: string;
  enable: boolean;
  web_shell_policy: MaliciousRejectType;
  base_image_policy: MaliciousRejectType;
  web_shell_score: number;
  cicd_enable: boolean;
  k8s_enable: boolean;
  mode: ImageRejectRuleConfigMode;
  online_monitor: boolean;
}
export enum ImageRejectRuleConfigMode {
  safe = 'safe',
  normal = 'base',
}
export interface ImageRejectRuleConfigRes {
  cicd_enable: boolean;
  k8s_enable: boolean;
  mode: ImageRejectRuleConfigMode;
  online_monitor: boolean;
}

export interface DynamicObject {
  [key: string]: any;
}

export interface ClusterSegmentInfo {
  cluster: string;
  id: number;
  name: string;
  namespace: string;
  resources?: ClusterResourceInfo[];
}
export interface ClusterNamespace {
  cluster: string;
  name: string;
}

export interface ClusterResourceInfo {
  cluster: string;
  id: number;
  kind: ResourceTyps;
  name: string;
  namespace: string;
  isFake: boolean;
  updatetime?: string;
  operator?: string;
  dstPort?: number;
  protocol?: string;
}

export interface ClusterResourceInSeg extends ClusterResourceInfo {
  segmentId?: 0 | number;
  segmentName?: string;
}

export interface ClusterResourceHasEI extends ClusterResourceInSeg {
  egress: ClusterResourceInSeg[];
  ingress: ClusterResourceInSeg[];
}

export enum PolicyDirection {
  in = 'Ingress',
  out = 'Egress',
}

export enum SegmentPolicyTypes {
  segment = 'Segment',
  source = 'Resource',
  address = 'IPBlock',
  namespaceGroup = 'Nsgrp',
  tenant = 'Tenant',
}

export enum SegmentPolicyActions {
  resolve = 'Allow',
  reject = 'Deny',
  resolvepro = 'Log',
}

export enum ResourceTyps {
  ReplicaSet = 'ReplicaSet',
  StatefulSet = 'StatefulSet',
  DaemonSet = 'DaemonSet',
  Deployment = 'Deployment',
  Job = 'Job',
  CronJob = 'CronJob',
}

export enum SegmentPolicyProtocol {
  UDP = 'UDP',
  TCP = 'TCP',
}

export interface SegmentPolicy {
  srcNamespace?: {
    cluster: string;
    name: string;
  };
  srcNsgrp?: {
    cluster: string;
    name: string;
  };
  srcTenant?: {
    cluster: string;
    name: string;
  };
  action: SegmentPolicyActions;
  comment: string;
  direction: PolicyDirection;
  dstIPBlock?: string;
  dstId?: number;
  dstResource?: {
    cluster: string;
    kind: ResourceTyps;
    name: string;
    namespace: string;
  };
  dstSegment?: {
    cluster: string;
    name: string;
    namespace: string;
  };
  dstType?: SegmentPolicyTypes;
  ports: string;
  protocol: string;
  srcIPBlock?: string;
  srcId?: number;
  srcResource?: {
    cluster: string;
    kind: ResourceTyps;
    name: string;
    namespace: string;
  };
  srcSegment?: {
    cluster: string;
    name: string;
    namespace: string;
  };
  srcType?: SegmentPolicyTypes;
  isSegRule?: boolean;
  dstNamespace?: {
    cluster: string;
    name: string;
  };
  dstNsgrp?: {
    cluster: string;
    name: string;
  };
  dstTenant?: {
    cluster: string;
    name: string;
  };
}

export interface CalicoResource {
  createdAt?: string;
  deletedAt?: string;
  id?: string;
  name: string;
  namespace: string;
  segmentID?: number;
  type: string;
  updatedAt?: string;
  resources: any[];
}

export interface CalicoConnectionResource {
  isExternal?: boolean;
  IpAddr?: string;
  name: string;
  namespace: string;
  type: OnlineVulnerabilityKind;
}

export interface CalicoConnection {
  DstResource: CalicoConnectionResource;
  SrcResource: CalicoConnectionResource;
  createdAt: string;
  deletedAt: null;
  id: number;
  port: number;
  protocol: string;
  updatedAt: string;
}

export interface CalicoSegment {
  name: string;
  resources: CalicoResource[];
  createdAt: string;
  deletedAt: string;
  id: number;
  updatedAt: string;
}

export interface CalicoSegmentExtended extends CalicoSegment {
  selected?: boolean;
}

export interface CalicoRelation {
  name: string;
  id?: string;
  namespace?: string;
  color?: string;
  top?: number;
  left?: number;
  segments?: CalicoResource[];
  children?: CalicoResource[];
}

export interface MicrosegResources {
  cluster: string;
  name: string;
  kind: string;
  isFake: boolean;
  id: number;
  namespace: string;
  segmentId: number;
  segmentName: string;
  dstPort: number;
  protocol: string;
}

export interface ResourceConnection {
  egress: MicrosegResources[];
  ingress: MicrosegResources[];
}

export enum RunTimePolicySeckind {
  Appamor = 'appamor',
  DriftPrevention = 'driftprevention',
  CommandsWhiteList = 'commandswhitelist',
  Seccomp = 'seccomp',
}

export enum RunTimePolicyMod {
  detection = 'detection',
  prevention = 'prevention',
}

export enum RunTimePolicyResourceKind {
  ReplicaSet = ' ReplicaSet',
  StatefulSet = 'StatefulSet',
  DaemonSet = 'DaemonSet',
  Deployment = 'Deployment',
  Job = 'Job',
  CronJob = 'CronJob',
}

export interface RunTimePolicyItem {
  active: boolean;
  author: string;
  createdAt: string;
  description: string;
  id: number;
  kind: RunTimePolicySeckind;
  mode: RunTimePolicyMod;
  decision: number;
  name: string;
  resources: AssetsNameSpaceResource[];
  relatedResource: any;
  updater: string;
  updated_at: string;
  updatedAt: string;
  profiles?: any[];
  status: number;
}

export interface AssetsCluster {
  displayName: string;
  createdAt: number;
  creator: string;
  description: string;
  key: string;
  name: string;
  updatedAt: number;
  updater: string;
  platForm: string;
}

export interface AssetsNameSpace {
  ClusterKey: string;
  CreatedAt: string;
  ID: number;
  Labels: any;
  Name: string;
  OwnerReferences: any;
  Status: number;
  UID: string;
  UpdatedAt: string;
  hasResource?: boolean;
}

export interface AssetsNameSpaceResource {
  cluster: string;
  namespace: string;
  name: string;
  kind: RunTimePolicyResourceKind;
  uid: string;
}
export interface AssetsResourceContainer {
  cluster: string;
  image: string;
  name: string;
  containerName: string;
  imageID: string;
  namespace: string;
  resource_kind: RunTimePolicyResourceKind;
  resource_name: string;
}

export enum AppamorControlCompetence {
  read = `read`,
  write = `write`,
  denyread = `denyread`,
  denywrite = `denywrite`,
}
export interface AppamorControlInfoItem {
  id: string;
  path: string;
  competence?: AppamorControlCompetence[];
  container: string;
}

export interface CommandsWhiteControlInfoItem {
  id: string;
  path: string;
  command?: string;
  container: string;
}

export enum SeccompControlStatus {
  allow = `Allow`,
  deny = `Deny`,
  log = `Log`,
}
export interface SeccompControlInfoItem {
  id: string;
  syscall: string;
  status?: SeccompControlStatus;
  container: string;
}

export interface DriftPreventionConfig {
  id: string;
  executable?: boolean;
  rcotainer?: boolean;
  container: string;
}

export namespace SecurityProfiles {
  export interface CommandWhiteListItem {
    command: string;
    workingDirectory: string;
  }
  export interface RuntimePolicyDto {
    name: string;
    description: string;
    resourceImageChangeAction?: string;
  }

  export interface ApparmorProfile {
    enabled: boolean;
    id: number;
    apparmorProfileData: Array<{ file: string; access: string }>;
    trainingStartWhitelistOption: string;
    trainingStatus: string;
    trainingTimeout: number;
  }

  export interface CommandWhitelistProfile {
    enabled: boolean;
    id: number;
    trainingStartWhitelistOption: string;
    trainingStatus: string;
    trainingTimeout: number;
  }

  export interface DriftProfile {
    enabled: boolean;
    id: number;
  }

  export interface SeccompProfileData {
    syscall: string;
  }

  export interface SeccompProfile {
    enabled: boolean;
    id: number;
    seccompProfileData: SeccompProfileData[];
    trainingStartWhitelistOption: string;
    trainingStatus: string;
    trainingTimeout: number;
  }

  export interface SecurityPolicy {
    active: boolean;
    apparmorProfile: ApparmorProfile;
    author: string;
    commandWhitelistProfile: CommandWhitelistProfile;
    createdAt: Date;
    description: string;
    driftProfile: DriftProfile;
    id: number;
    mode: string;
    name: string;
    resourceImageChangeAction: string;
    seccompProfile: SeccompProfile;
    updatedAt: Date;
    resources?: Resource[];
    updatedBy: string;
  }

  export interface Resource {
    cluster: string;
    containerName: string;
    id: number;
    imageName: string;
    imageRegistry: string;
    imageTag: string;
    kind: string;
    name: string;
    namespace: string;
  }
}

export interface GraphListCount {
  count: number;
}
export type TCustomConfigsRule = {
  key: string;
  name: string;
  category: string;
  module: string;
  severity: number;
  hthreats: number;
};
export type TCustomConfigsSetting = {
  id?: number;
  type: string; // list/expression, 当前只支持list
  key: string;
  name?: string;
  prompt?: string;
  value?: string[];
};
export type TCustomConfigs = {
  id?: number;
  rule: TCustomConfigsRule;
  customSetting: TCustomConfigsSetting;
  effect: string;
};
export type TCustomConfigsListReqParams = {
  rule?: string;
  query?: string;
  id?: number;
};
export type TCustomConfigsList = TCustomConfigs & {
  id: number;
  updater: { username: string; account: string };
  creator: string;
  updatedAt: number;
  createdAt: number;
};

export type TRulefigEditReqParams = {
  id: number;
  customSetting: TCustomConfigs['customSetting'];
};

export type TCustomConfigEditReqParams = {
  ruleKey: string;
  customSetting: TCustomConfigs['customSetting'];
};

export type TSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NEGLIGIBLE' | 'UNKNOWN';

export type TCaptchaData = { captchaID: string; image: string };

export type TRole = 'super-admin' | 'platform-admin' | 'admin' | 'audit' | 'normal';
export type TEditUserParam = {
  username: string; // 用户唯一标识
  account: string;
  roleName: TRole;
  moduleID: RouteTypes['access'][];
};
export type TSyslog = {
  enable: boolean;
  enableStr: boolean;
  network: string;
  addr: string;
  tag: string;
  facility: string;
  severity: string;
};
//wait:等待备份； backup:备份中； success：备份成功; failed:备份失败
export type BackupPollDataStatus = 'wait' | 'backup' | 'success' | 'failed';
export interface BackupPollData {
  Status: Record<string, BackupPollDataStatus>;
  Import: 'success';
}
export interface TView {
  total: number;
  used: number;
}
export interface TDataManagement {
  coldTTLDays: number;
  hotOfflineTTLDays: number;
  hotLogicTTLDays: number;
  waterlineData: number;
  coldView: TView;
  hotOfflineView: TView;
  hotLogicView: TDataManagement;
}

export interface TConfigsOperator {
  Key: string;
  Name: string;
  child: Omit<TConfigsOperator, 'child'>[];
}

export interface BehavioralLearnListReq {
  cluster_key?: string;
  resource_kind?: string;
  start_time?: string;
  end_time?: string;
  learn_status?: number; // 0、1、2、3分别表示未学习、学习中、已学习未生效、已生效
  namespace?: string;
  resource_name?: string;
  image_name?: string;
  limit: number;
  offset: number;
}

export interface BehavioralLearnListItem {
  ResourceUUID: number;
  Name: string;
  NotInModelCount: number;
  namespace: string;
  Kind: string;
  images: string[];
  behavioral_learn_status: number;
  behavioral_learn_start_time: number;
  cluster_key: string;
  is_can_learn: boolean;
}

export interface BehavioralLearnInfoRes {
  name: string;
  namespace: string;
  kind: string;
  learn_status: number;
  cluster: string;
  resource_id: number;
  start_time: number;
  containers: any[];
  is_can_learn: boolean;
}
export interface BehavioralLearnListRes {
  startIndex: number;
  status: number;
  itemsPerPage: number;
  totalItems: number;
  items: BehavioralLearnListItem[];
}
export interface StartBehavioralLearnReq {
  resource_id: number;
  time?: number; // 学习时间(秒)
}
export interface EnabledBehavioralLearnReq {
  resource_id: number;
  enabled: boolean;
}
export interface OprLearnRes {
  status: number;
  totalItems: number;
}
export interface BehavioralLearnModelBasicReq {
  resource_id: number;
  limit?: number;
  offset?: number;
  is_in_model: boolean; //标识是否在模型内
  start_id?: number | string;
}
export interface BehavioralLearnModelFileReq extends BehavioralLearnModelBasicReq {
  permission?: number; //文件读写类型1表示只读，2表示读写
  file_name?: string; //支持模糊查询文件名/路径称
}
export interface BehavioralLearnModelFileItem {
  name: string;
  path: string;
  permission: number;
  update_at: number;
  is_in_model: false;
  id: number;
  event_id: number;
}
export type BehavioralLearnModelRes<T> = {
  status: number;
  itemsPerPage: number;
  totalItems: number;
  items: T[];
};
export interface BehavioralLearnModelCommandReq extends BehavioralLearnModelBasicReq {
  search_str?: string; //支持模糊查询命令行或者路径
}
export interface BehavioralLearnModelCommandItem {
  updated_at: number;
  user: string;
  path: string;
  is_in_model: boolean;
  id: number;
  command: string;
  event_id: number;
}

export interface BehavioralLearnModelNetworkReq extends BehavioralLearnModelBasicReq {
  stream_direction?: number; //1 是出流量，2 是入流量
  port?: number;
  search_str?: string; //支持模糊查询资源名称
}
export interface BehavioralLearnModelNetworkItem {
  port: number;
  update_time: number;
  resource_name: string;
  stream_direction: number;
  is_in_model: boolean;
  id: number;
  event_id: number;
}
export interface ModelLogReq {
  resource_id: number;
  limit: number;
  offset: number;
}

export interface ModelLogItem {
  user: string;
  action: string;
  resource_name: number;
}
export interface ModelCommand {
  resource_id: number;
  limit: number;
  offset: number;
  is_in_model: boolean;
  search_str?: string;
}
export interface Result {
  list: any[];
  nextId: string | undefined;
}
