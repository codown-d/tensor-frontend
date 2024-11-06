export const Routes = {
  Dashboard: '/',
  // 合规检测-Kubernetes、docker、主机
  ComplianceWhole: '/compliance-whole',
  // 合规历史记录
  // 策略管理
  ComplianceStrategicManagement: '/compliance-whole/strategic-management',
  // 策略管理详情
  ComplianceStrategicManagementInfo: '/compliance-whole/strategic-management-info',
  // 合规详情
  ComplianceInfo: '/compliance-whole/compliance-info',
  // 合规历史详情
  ComplianceHistoryInfo: '/compliance-whole/compliance-history-info',
  //合规历史详情
  ComplianceHistoryDetail: '/compliance-whole/compliance-history-detail',
  // 合规详情
  ComplianceScanManagement: '/compliance-whole/scan-management',
  // 事件中心
  NotificationCenter: '/palace',
  // 事件中心详情
  PalaceEventCenterId: '/palace/event-center/:id',

  // 事件中心详情概览
  EventOverviewDetails: '/palace/event-overview-details',
  // 事件中心详情概览列表
  EventDetailsList: '/palace/event-overview-details/event-details-list',
  // 事件配置
  PalaceEventSeting: '/palace/configure',
  // 事件白名单详情
  PalaceEventWhiteListDetail: '/palace/configure/:id',
  // attck
  Attck: '/holmes',
  AttckRuleConfiguration: '/holmes/rule-configuration',
  AttckRuleCustom: '/holmes/rule-configuration/rule-custom',
  AttckDetail: '/holmes/holmes-detail',

  //镜像相关
  SecurityPolicy: '/image-security/security-policy',
  SecurityPolicyEdit: '/image-security/security-policy/edit',
  SecurityPolicyDetail: '/image-security/security-policy/info',
  ImageScanRecord: '/image-security/scan-record',
  ImageScanReports: '/image-security/scan-reports',
  ImageScanReportDetail: '/image-security/scan-reports/report-detail/:type',
  //文件详情
  ImageFileInfo: '/image-security/image-file-info/:type',
  // 镜像扫描
  ScannerImages: '/image-security/images',
  // 策略管理
  StrategicManagement: '/image-security/life-cycle/strategic-management',
  StrategicManagementInfo: '/image-security/life-cycle/strategic-management/info',
  // 镜像生命周期
  ImagesCILifeCycle: '/image-security/life-cycle',
  // ci详情
  ImagesDetailInfo: '/image-security/life-cycle/ci-images-detail',
  // 仓库节点详情
  RegistryImagesDetailInfo: '/image-security/life-cycle/registry-images-detail',
  // 部署上线镜像详情
  DeployImageInfo: '/image-security/life-cycle/deploy-image-info',
  // 策略管理详情
  // 白名单
  WhiteList: '/image-security/life-cycle/white-list',
  // 镜像阻断白名单
  imageRejectWhiteList: '/image-security/image-reject/white-list',
  imageRejectPolicyManagement: '/image-security/image-reject/policy-management',

  // 白名单
  // 漏洞发现
  ImageDiscover: '/image-security/vulnerabilities',
  // 漏洞发现详情
  ImagesDiscoverDetail: '/image-security/vulnerabilities/images-discover-detail',
  // 镜像阻断
  ImageReject: `/image-security/intercepts`,
  // 风险探索
  OnlineVulnerabilities: '/risk-explorer',
  // 资产发现
  ClustersOnlineVulnerabilitiesGraphList: '/assets',
  AssetsIngressInfo: '/assets/ingress-info',
  AssetsServiceInfo: '/assets/service-info',
  AssetsEndpointsInfo: '/assets/endpoints-info',
  AssetsWebsiteInfo: '/assets/website-info',
  AssetsWebServeDetail: '/assets/webserve-detail',
  AssetsDatabaseDetail: '/assets/database-detail',
  AssetsRunningAppDetail: '/assets/runapp-detail',
  // 标签管理
  LabelManag: '/assets/label-manag',
  LabelManagCreate: '/assets/label-create',
  LabelManagEdit: '/assets/label-edit',

  //节点镜像扫描记录
  NodeMirroringConfig: '/assets/node-mirroring-config',
  // 资产发现pod
  RiskGraphListPodDetail: '/assets/pod-details',
  // 资产发现容器
  RiskGraphListContainerDetail: '/assets/container-details',
  // 资产发现api
  RiskGraphListApiDetail: '/assets/container-api',
  // api
  AssetDiscovery: '/risk-explorer/asset-discovery',
  // 资产详情
  ClustersOnlineVulnerabilitiesDetails: '/assets/clusters-online-vulnerabilities-details',
  // 资产发现-容器
  ClustersContainerDetails: '/assets/assets-container-details/:id',
  //  登录页
  LoginScreen: '/login',
  // 发送邮件
  NewUser: '/email',
  // 找回密码
  SendEmail: '/email/:type/:hash',

  SSOLogin: '/sso-login',
  // 暂无权限
  NoAuth: '/no-auth',
  // 404
  None: '/404',

  // API 审计
  PlatformAPI: '/cluster-security/k8s-api-audits',
  // 安全扫描
  KuberScanner: '/cluster-security/k8s-scanner',
  // 集群风险监控
  kubeMonitor: '/cluster-security/k8s-monitor',
  // 数据管理
  DataManagement: '/ctrl-center/data-management',
  // 软件升级
  SystemUpgrade: '/ctrl-center/upgrade',
  // 软件升级历史记录
  UpgradeHistory: '/ctrl-center/upgrade/history',
  VulnUpgradeHistory: '/ctrl-center/upgrade/vuln-history',
  VirusUpgradeHistory: '/ctrl-center/upgrade/virus-history',
  // 账户管理
  SuperAdmin: '/ctrl-center/accounts',

  // 登录配置
  LoginConfig: '/ctrl-center/accounts/LoginConfig',
  // 集群管理
  MultiClusterManage: '/ctrl-center/clusters',
  ComponentMonitoring: '/ctrl-center/component-monitoring',
  // 软件许可
  LicenseScreen: '/ctrl-center/license',
  // OpenAPI
  OpenAPI: '/ctrl-center/open-apis',
  ActiveDefense: '/watson',
  DeflectDefense: '/deflect-defense',
  DeflectDefenseInfo: '/deflect-defense/info',
  DeflectDefenseAdd: '/deflect-defense/add',
  DeflectDefenseWhiteList: '/deflect-defense/whiteList',
  // 审计日志
  AuditLog: '/ctrl-center/audit-log',
  // 审计日志配置
  AuditLogConfig: '/ctrl-center/audit-log/config',
  NotificationManagement: '/ctrl-center/notification-management',

  Demo: '/demo',
  YamlScan: '/yaml-scan',
  YamlScanBaselineManagement: '/yaml-scan/baseline-management',
  YamlScanBaselineManagementInfo: '/yaml-scan/baseline-management/info',
  YamlScanBaselineManagementEdit: '/yaml-scan/baseline-management/edit',
  ScanConfig: '/yaml-scan/scan-config',
  YamlScanInfo: '/yaml-scan/yaml-scan-info',
  //应用防火墙
  Firewall: '/firewall',
  AppInfo: '/firewall/app-info',
  AppInfoDetail: '/firewall/app-info-detail',
  Blackwhitelists: '/firewall/blackwhitelists',
  WafConfig: '/firewall/waf-config',
  RulesManager: '/firewall/rules-manager',
  //镜像仓库配置
  ImageConfig: '/image-security/life-cycle/image-config',
  ImageConfigRepoManagementEdit: '/image-security/life-cycle/image-config/repo-management-edit',
  ImageConfigRepoManagementInfo: '/image-security/life-cycle/image-config/repo-management-info',
  KeyManagementEdit: '/image-security/life-cycle/image-config/key-management-edit',
  KeyManagementInfo: '/image-security/life-cycle/image-config/key-management-info',
  // IaCSecurity IaC 安全
  IaCSecurity: '/iac-security',
  IaCSecurityBaselineManagement: '/iac-security/baseline-management',
  IaCSecurityBaselineManagementInfo: '/iac-security/baseline-management/info',
  IaCSecurityBaselineManagementEdit: '/iac-security/baseline-management/edit',
  IaCSecurityScanConfig: '/iac-security/scan-config',
  IaCSecurityInfo: '/iac-security/info',
  ManualScanning: '/iac-security/manual-scanning',

  ImmuneDefense: '/immune-defense',
  ImmuneDefenseInfo: '/immune-defense/info',
  ImmuneDefenseConfig: '/immune-defense/config',
  //微隔离
  //   Microisolation: '/microisolation',
  MicroisolationVisualize: '/microisolation/visualize',
  MicroisolationConfig: '/microisolation/config',

  MicroisolationObjectManagement: '/microisolation/object-management',
  MicroisolationObjectManagementAdd: '/microisolation/object-management/add',
  MicroisolationObjectManagementEdit: '/microisolation/object-management/edit/:id',

  MicroisolationPolicyManagement: '/microisolation/policy-management',
  MicroisolationPolicyManagementEdit: '/microisolation/policy-management/edit/:id',
  MicroisolationPolicyManagementAdd: '/microisolation/policy-management/add',

  MicroisolationFlowRate: '/microisolation/flow-rate',
  MicroisolationPolicyDetail: '/microisolation/golicy-detail',
};
