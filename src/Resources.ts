import { transform } from 'lodash';
import { URL } from './helpers/config';

const _Resources = {
  // WelcomeScreen
  Dashboard: '/images/dashboard.png',
  RiskExploration: '/images/riskExplorer.png',
  AssetDiscovery: '/images/zcfx.png',
  AlarmCenter: '/images/bjzx.png',
  //Attck:'/images/attck.png',
  ImmuneDefense: '/images/myfy.png',
  LoadIcon: '/images/load-icon.gif',
  OperationStrategy: '/images/yxscl.png',
  learningTasks: '/images/xxrw.png',
  MicroIsolation: '/images/wgl.png',
  Visualization: '/images/ksh.png',
  AssetManagement: '/images/zcgl.png',
  AssetGroupManagement: '/images/zczgl.png',
  ClusterRiskMonitoring: '/images/jqfxjk.png',
  MirrorScan: '/images/jxsm.png',
  MirrorScanZ: '/images/jxsmz.png',
  VulnerabilityDiscovery: '/images/ldfx.png',
  MirrorBlocking: '/images/jxzd.png',
  SafetyCompliance: '/images/aqhg.png',
  Kubernetes: '/images/kubernetes.png',
  Docker: '/images/docker.png',
  Host: '/images/zj.png',
  Harbor: '/images/harbor.png',
  SetUp: '/images/sz.png',
  //DataManagement:'/images/sjgl.png',
  UserPermissionSettings: '/images/yhqxsz.png',
  SoftwareUpgrade: '/images/rjsj.png',
  PlatformSecurity: '/images/ptaq.png',
  APIAudit: '/images/apisj.png',
  OpenAPI: '/images/openAPI.png',
  DashboardProtect: '/images/dashboard_protect.png',
  Algorithm: '/images/algorithm.png',

  // SuperAdminUserScreen、SuperAdminRoleScreen
  IcoUserGray: '/images/ico_user_gray.png',
  IcoPsw: '/images/ico_psw.png',
  IcoCancle: '/images/ico_cancle.png',
  IcoOk: '/images/ico_ok.png',
  IcoEdit: '/images/ico_edit.png',

  // SuperAdminAccessScreen
  IcoUrl: '/images/ico_url.png',

  // ScannerTaskReportScreen
  Critical: '/images/critical.png',
  High: '/images/High.png',
  Medium: '/images/Medium.png',
  Low: '/images/Low.png',
  Negligible: '/images/Negligible.png',
  SettingsDark: '/images/settings_dark.svg',
  Whale: '/images/whale.png',

  // ScannerScreen
  OnlineVulnerabilityActive: '/images/online-vulnerability-active.png',
  OnlineVulnerability: '/images/online-vulnerability.png',
  NetworkActive: '/images/network-active.png',
  Network: '/images/network.png',
  MidToCriticalActive: '/images/mid-to-critical-active.png',
  MidToCritical: '/images/mid-to-critical.png',
  BySeverityActive: '/images/by-severity-active.png',
  BySeverity: '/images/by-severity.png',
  IcoShareActive: '/images/ico_share.svg',
  IcoShare: '/images/ico_share_delault.svg',

  // OnlineVulnerabilityDetailsScreen
  Depot: '/images/depot.png',

  StopDark: '/images/stop_dark.png',
  ArrowUp: '/images/stop_dark.png',

  // NonePage
  NonePage: '/images/404.png',

  // LoginScreen
  LogoLargeIcon: '/images/logo-white.png',

  // ComplianceMainScreen
  ScreenX: '/images/X.png',
  ScreenCheck: '/images/check.png',
  IcoPass: '/images/ico_pass.png',
  IcoFail: '/images/ico_fail.png',
  IcoWarn: '/images/ico_warn.png',
  IcoInfo: '/images/ico_warn.png',

  // ClustersCronjobsScreen
  IcoClockDanger: `/images/ico_k8s.png`,
  IcoClock: `/images/ico_host.png`,
  IcoHost: `/images/ico_host.png`,
  IcoDocker: `/images/ico_docker.png`,
  IcoK8s: `/images/ico_k8s.png`,
  IcoJobEdit: '/images/ico_job_edit.png',
  IcoExport: '/images/ico_export.png',

  // Alert-helper
  NotifyWaring: `/images/notifyWaring.png`,
  NotifyDanger: `/images/notifyDanger.png`,
  NotifyDefault: `/images/notifyDefault.png`,
  NotifySuccess: `/images/notifySucess.png`,
  NotifyPrimary: `/images/notifyPrimary.png`,

  // VSelect
  IcoAdd: '/images/ico_add.png',
  IcoSub: '/images/ico_sub.png',

  // spotlight
  Loupe: '/images/loupe.png',

  // SidebarComponent
  DashboardSVG: '/images/dashboard.svg',
  IcoSafeSeeker: '/images/icoSeeker.svg',
  IcoAlarmCenter: '/images/ico_alarm_center.svg',
  IcoSafeLimit: '/images/ico_safe_limit.svg',
  KubernetesIcon: '/images/kubernetes_ico.svg',
  DockerIcon: '/images/docker_ico.svg',
  HostIcon: '/images/host_ico.svg',
  CronJobIcon: '/images/cronjobs_ico.svg',
  //Harbor: '/images/Harbor.svg',
  IcoImageScanning: '/images/imageScanning.svg',
  ScannedImagesIcon: '/images/scanned-images_ico.svg',
  IcoImageweak: '/images/imageweak.svg',
  IcoSetting: '/images/ico_setting.svg',
  ClusterIcon: '/images/clusters_ico.svg',
  RuntimeDetection: 'icons/RuntimeDetection.svg',
  DataManagement: '/images/ico_dataManagement.svg',
  UserAdmin: '/images/ico_user.svg',
  LogoutIcon: '/images/logout.svg',
  LogoProIco: '/images/logo.png',
  LogoSmallIcon: '/images/logo-white-small.png',
  MicServiceListIcon: '/images/MicServiceListIcon.png',
  MicServiceMapIcon: '/images/MicServiceMapIcon.png',
  MicServiceAbstract: '/images/MicServiceAbstract.png',
  ServiceAPI: '/images/ServiceAPI.png',
  ServiceMap: '/images/ServiceMap.png',
  AuthenticationConfiguration: '/images/AuthenticationConfiguration.png',
  VulnerabilityScanning: '/images/VulnerabilityScanning.png',
  DataSecurity: '/images/dataSecurity.png',
  NotificationCenter: '/images/NotificationCenter.png',
  TensorWall: '/images/tensorWall.png',
  GetStated: '/images/getState.png',

  // scanner-tabs
  TabsOne: '/images/tabs_one.png',
  TabsTwo: '/images/tabs_two.png',
  TabsThree: '/images/tabs_three.png',
  TabsFour: '/images/tabs_four.png',
  IcoCopy: '/images/ico_copy.png',

  // ScanControls
  IcoScan: `/images/ico_scan.svg`,
  Pause: `/images/Pause.png`,

  // noData
  NoData: '/images/nodata.png',
  403: '/images/403.png',

  // navbar
  FlagChaina: '/images/china.png',
  FlagUsa: '/images/usa.png',
  ProfileIcon: '/images/profile.svg',
  LogoutGrayIcon: '/images/logoutGrayIcon.svg',
  BellIcon: '/images/bell.png',

  // NavNotification
  NotifyEmpty: '/images/notifyEmpty.png',
  BaselineMailOutline: '/images/baseline_mail_outline.png',
  Collapse: '/images/collapse.svg',

  // MicServiceAbstract
  APIs: '/images/APIs.png',
  Upstream: '/images/upstream.png',
  Downstream: '/images/downstream.png',
  LeadingCadre: '/images/leadingCadre.png',
  ImageName: '/images/imageName.png',
  Servicetype: '/images/servicetype.png',
  ServiceAgreement: '/images/ServiceAgreement.png',
  SettingGear: '/images/SettingGear.png',
  NotificationBell: '/images/NotificationBell.png',
  EditIco: '/images/edit.png',

  // Public
  SearchIcon: '/images/search.svg',
  DoubleArrow: '/images/double-arrow.svg',
  thread1: '/images/thread-1.svg',
  thread1active: '/images/thread-1-active.svg',
  thread2: '/images/thread-2.svg',
  thread2active: '/images/thread-2-active.svg',
  thread3: '/images/thread-3.svg',
  thread3active: '/images/thread-3-active.svg',
  thread4: '/images/thread-4.svg',
  thread4active: '/images/thread-4-active.svg',
  whiteAdd: '/images/whiteAdd.png',
  InputX: '/images/inputX.png',
  pwd_suc: '/images/pwdOK.png',
  Logo: '/images/logo.png',
  whiteSet: '/images/whiteSet.png',
  Unlock: '/images/Unlock.png',
  blueList: '/images/blueList.png',
  Bells: '/images/Bells.png',
  back: '/images/back.svg',
  chartX: '/images/chartX.png',
  ruleX: '/images/rule-X.png',
  Loading: '/images/lighthouse.gif',

  //Alert Center
  BlueLow: '/images/blueLow.png',
  listDisplay: '/images/ico_list.png',
  matrixsDisplay: '/images/ico_matrixs.png',
  EnvironmentFile: '/images/EnvironmentFile.png',
  DetectionRules: '/images/DetectionRules.png',
  AlarmHistory: '/images/AlarmHistory.png',
  Shape: '/images/Shape.png',
  Attck: '/images/attck.png',
  KubeMonitor: '/images/kubeMonitor.png',

  // imagesSacnner
  exportFile: '/images/exportFile.png',
  Loopholes: '/images/Loopholes.png',
  virus: '/images/virus.png',
  sensitive: '/images/sensitive.png',
  netVulner: '/images/networkVulnerabilities.png',
  scanAll: '/images/scanAll.svg',

  // SelectService
  SearchBtn: '/images/search-btn.png',

  // siderbar-microservice
  MicroService: '/images/MicroService.png',
  ServiceList: '/images/ServiceList.png',

  // compliances
  Compliance: '/images/ico_saomiao.png',
  Renwu: '/images/renwu.png',

  // node-map
  NewArrowUp: '/images/newArrowUp.png',
  NewArrowDown: '/images/newArrowDown.png',
  // old icon 可能没在用了
  WhiteArrow: '/images/whiteArrow.png',
  BlueArrow: '/images/blueArrow.png',
  SeeMore: '/images/seeMore.png',

  // imagenewStrategy
  EditTable: '/images/edit_table.png',
  DelTable: '/images/del_table.png',
  NewAdd: '/images/new_add.png',

  // imageReject
  WhiteMenu: '/images/white_menu.png',
  RuleConfig: '/images/rule_config.png',
  IcoCICD: '/images/ico_cicd.png',
  IcoImageContent: '/images/ico_imgcontent.png',
  IcoServeOnline: '/images/ico_serveonline.png',
  IcoOnlineWatch: '/images/ico_onlinewatch.png',

  // asset discovery
  AssetResource: '/images/asset-resource.png',
  AssetImages: '/images/asset-images.png',
  AssetContainer: '/images/asset-container.png',
  AssetPod: '/images/asset-pod.png',
  AssetEvent: '/images/asset-event.png',
  AssetVulner: '/images/asset-vulner.png',
  GraphCluster: '/images/graph-cluster.png',
  GraphNamespace: '/images/graph-namespace.png',
  GraphResource: '/images/graph-resource.png',
  GraphContainer: '/images/graph-container.png',
  GraphNode: '/images/graph-node.png',
  GraphPod: '/images/graph-pod.png',
  GraphApi: '/images/graph-api.png',
  GraphWebSite: '/images/graph-web.png',
  GraphWeb: '/images/web-services.png',
  GraphDatabase: '/images/graph-database.png',
  GraphNodeImage: '/images/graph-nodeImage.png',
  GraphWarehouse: '/images/graph-warehouse.png',
  GraphWarehouseImage: '/images/graph-warehouseImage.png',
  GraphRunAppImage: '/images/run-app.png',

  // kube space
  KubeServer: '/images/kube-server.png',
  KubeNodes: '/images/kube-nodes.png',
  KubeLoophole: '/images/kube-loophole.png',

  // not use icons
  LoginSecureImage: '/images/login.png',
  NotificationIcon: '/images/alert.svg',
  RightCarrotIcon: '/images/angle-right-solid.png',
  Backup: `/images/backup.png`,
  BaselineCheckCircleOutline: '/images/baseline_check_circle_outline.png',
  BaselineErrorOutline: '/images/baseline_error_outline.png',
  BaselineHighlightOff: '/images/baseline_highlight_off.png',
  BaselineLoop: '/images/baseline_loop.png',
  BreadCrumbRight: '/images/breadcrumb-right.png',
  ComplianceIcon: '/images/compliance.png',
  ScreenEnding: '/images/ending.svg',
  Home: '/images/home-breadcrumb.png',
  PlayDark: '/images/play_dark.svg',
  RuntimeDetectionIcon: '/images/runtime-detection.png',
  SettingsIcon: '/images/settings.svg',
  ScreenStart: '/images/start.svg',
  VulnerabilityIcon: '/images/vulnerability.png',
  Expand: '/images/expand.svg',
  Collapse2: '/images/collapse2.svg',
  hour_24: '/images/hour_24.png',
  day_7: '/images/day_7.png',
  day_30: '/images/day_30.png',
  warning: '/images/warning.png',
  login_logo: '/images/login_logo.svg',

  filter: '/icons/filter.svg',
  endpoints: '/images/endpoints.png',
  ingress: '/images/ingress.png',
  label: '/images/label.png',
  pv: '/images/PV.png',
  pvc: '/images/PVC.png',
  secret: '/images/secret.png',
  service: '/images/service.png',
};
export const Resources: any = transform(_Resources, (result, value, key) => (result[key] = `${URL}${value}`));
