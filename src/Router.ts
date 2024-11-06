import { Routes } from './Routes';
import { translations } from './translations';
import { RouteTypes } from './definitions';
import NavbarOnlineVulnerabilities from './components/navbar-online-vulnerabilities/NavbarOnlineVulnerabilities';
import LoginScreen from './screens/Login/LoginScreen';
import PageLoading, { loadable } from './components/loading/PageLoading';
import ClusterSelector from './screens/RiskExplorer/OnlineVulnerabilities/MultiOnlineVulnerSelector';
import { ROLES } from './access';
import { tabType } from './screens/ImagesScanner/ImagesScannerScreen';

/**
 * keepalive取路由组件名， eg: 路由组件Routes.Dashboard对应的keepalive为Dashboard
 * iframe禁用copy方法,组件内有copy方法时请处理
 **/
export const publicRouter: RouteTypes[] = [
  {
    name: 'Login',
    path: Routes.LoginScreen,
    element: LoginScreen,
    layout: false,
  },
  {
    path: Routes.SendEmail,
    element: loadable({
      loader: () => import('./screens/Login/newUser/newUser'),
      loading: PageLoading,
    }),
    layout: false,
  },
  {
    name: 'email',
    path: Routes.NewUser,
    element: loadable({
      loader: () => import('./screens/Login/newUser/newUser'),
      loading: PageLoading,
    }),
    layout: false,
  },

  {
    path: Routes.SSOLogin,
    element: loadable({
      loader: () => import('./screens/Login/SSO'),
      loading: PageLoading,
    }),
  },
  {
    path: Routes.None,
    element: loadable({
      loader: () => import('../src/components/noData/NoAuth'),
      loading: PageLoading,
    }),
  },
];

const routers: RouteTypes[] = [
  {
    name: 'Home',
    path: Routes.Dashboard,
    access: '2',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/welcome/WelcomeScreen'),
      loading: PageLoading,
    }),
    title: translations.dashboard,
  },
  {
    path: Routes.OnlineVulnerabilities,
    element: loadable({
      loader: () => import('./screens/RiskExplorer/OnlineVulnerabilities/OnlineVulnerabilitiesScreen'),
      loading: PageLoading,
    }),
    access: '2',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    navbarTools: [ClusterSelector, NavbarOnlineVulnerabilities],
    title: translations.riskExplorer,
    keepalive: 'OnlineVulnerabilities',
  },
  {
    path: Routes.ClustersOnlineVulnerabilitiesGraphList,
    access: '2',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/MultiClusterRiskExplorer/MultiClusterRiskExplorerGraphList'),
      loading: PageLoading,
    }),
    // navbarTools: [ClusterSelector],
    title: translations.sidebar_listView,
    keepalive: 'ClustersOnlineVulnerabilitiesGraphList',
  },
  {
    path: Routes.AssetsIngressInfo,
    access: '2',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/MultiClusterRiskExplorer/AssetIngress/IngressInfo'),
      loading: PageLoading,
    }),
    title: translations.sidebar_listView,
    onBack: () => {
      history.go(-1);
    },
    breadcrumb: [
      {
        children: translations.sidebar_listView,
        href: Routes.ClustersOnlineVulnerabilitiesGraphList,
      },
      {
        children: 'Ingress',
        href: Routes.ClustersOnlineVulnerabilitiesGraphList + '?tab=Ingress',
      },
      {
        children: translations.ingress_details,
      },
    ],
  },
  {
    path: Routes.AssetsServiceInfo,
    access: '2',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/MultiClusterRiskExplorer/AssetService/ServiceInfo'),
      loading: PageLoading,
    }),
    title: translations.sidebar_listView,
    keepalive: 'AssetsServiceInfo',
    onBack: () => {
      history.go(-1);
    },
    breadcrumb: [
      {
        children: translations.sidebar_listView,
        href: Routes.ClustersOnlineVulnerabilitiesGraphList,
      },
      {
        children: 'Service',
        href: Routes.ClustersOnlineVulnerabilitiesGraphList + '?tab=Service',
      },
      {
        children: translations.service_details,
      },
    ],
  },
  {
    path: Routes.AssetsWebsiteInfo,
    access: '2',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/MultiClusterRiskExplorer/AssetWebSite/WebsiteInfo'),
      loading: PageLoading,
    }),
    title: translations.sidebar_listView,
    // keepalive: 'AssetsWebsiteInfo',
    onBack: () => {
      history.go(-1);
    },
    breadcrumb: [
      {
        children: translations.sidebar_listView,
        href: Routes.ClustersOnlineVulnerabilitiesGraphList,
      },
      {
        children: translations.web_site,
        href: Routes.ClustersOnlineVulnerabilitiesGraphList + '?tab=webSite',
      },
      {
        children: translations.web_site_detail,
      },
    ],
  },
  {
    path: Routes.AssetsWebServeDetail,
    access: '2',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/MultiClusterRiskExplorer/AssetWebServe/WebServeDetail'),
      loading: PageLoading,
    }),
    title: translations.sidebar_listView,
    // keepalive: 'AssetsWebServeDetail',
    onBack: () => {
      history.go(-1);
    },
    breadcrumb: [
      {
        children: translations.sidebar_listView,
        href: Routes.ClustersOnlineVulnerabilitiesGraphList,
      },
      {
        children: translations.clusterGraphList_web,
        href: Routes.ClustersOnlineVulnerabilitiesGraphList + '?tab=web',
      },
      {
        children: translations.web_serve_info,
      },
    ],
  },
  {
    path: Routes.AssetsDatabaseDetail,
    access: '2',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/MultiClusterRiskExplorer/AssetDataBase/DataBaseDetail'),
      loading: PageLoading,
    }),
    title: translations.sidebar_listView,
    onBack: () => {
      history.go(-1);
    },
    breadcrumb: [
      {
        children: translations.sidebar_listView,
        href: Routes.ClustersOnlineVulnerabilitiesGraphList,
      },
      {
        children: translations.clusterGraphList_database,
        href: Routes.ClustersOnlineVulnerabilitiesGraphList + '?tab=database',
      },
      {
        children: translations.database_detail,
      },
    ],
  },
  {
    path: Routes.AssetsRunningAppDetail,
    access: '2',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/MultiClusterRiskExplorer/AssetRunApp/RunAppDetail'),
      loading: PageLoading,
    }),
    title: translations.sidebar_listView,
    onBack: () => {
      history.go(-1);
    },
    breadcrumb: [
      {
        children: translations.sidebar_listView,
        href: Routes.ClustersOnlineVulnerabilitiesGraphList,
      },
      {
        children: translations.running_applications,
        href: Routes.ClustersOnlineVulnerabilitiesGraphList + '?tab=runApp',
      },
      {
        children: translations.running_app_detail,
      },
    ],
  },
  // 标签管理
  {
    path: Routes.LabelManag,
    keepalive: 'LabelManag',
    access: '2',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/LabelManag'),
      loading: PageLoading,
    }),
    onBack: () => {
      history.go(-1);
    },
    title: translations.sidebar_listView,
    breadcrumb: [
      {
        children: translations.sidebar_listView,
        href: Routes.ClustersOnlineVulnerabilitiesGraphList,
      },
      {
        children: '标签管理',
      },
    ],
  },
  {
    path: Routes.LabelManagCreate,
    access: '2',
    keepalive: 'LabelManagCreate',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/LabelManag/create'),
      loading: PageLoading,
    }),
    onBack: () => {
      history.go(-1);
    },
    title: translations.sidebar_listView,
    breadcrumb: [
      {
        children: translations.sidebar_listView,
        href: Routes.ClustersOnlineVulnerabilitiesGraphList,
      },
      {
        children: '标签管理',
        href: Routes.LabelManag,
      },
      {
        children: '新增标签',
      },
    ],
  },
  {
    path: Routes.LabelManagEdit,
    keepalive: 'LabelManagEdit',
    access: '2',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/LabelManag/create'),
      loading: PageLoading,
    }),
    onBack: () => {
      history.go(-1);
    },
    title: translations.sidebar_listView,
    breadcrumb: [
      {
        children: translations.sidebar_listView,
        href: Routes.ClustersOnlineVulnerabilitiesGraphList,
      },
      {
        children: '标签管理',
        href: Routes.LabelManag,
      },
      {
        children: '编辑标签',
      },
    ],
  },
  {
    path: Routes.AssetsEndpointsInfo,
    access: '2',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/MultiClusterRiskExplorer/AssetEndpoints/EndpointsInfo'),
      loading: PageLoading,
    }),
    title: translations.sidebar_listView,
    keepalive: 'AssetsEndpointsInfo',
    onBack: () => {
      history.go(-1);
    },
    breadcrumb: [
      {
        children: translations.sidebar_listView,
        href: Routes.ClustersOnlineVulnerabilitiesGraphList,
      },
      {
        children: 'Endpoints',
        href: Routes.ClustersOnlineVulnerabilitiesGraphList + '?tab=Endpoints',
      },
      {
        children: translations.endpoints_details,
      },
    ],
  },
  {
    path: Routes.RiskGraphListPodDetail,
    access: '2',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/MultiClusterRiskExplorer/ListDetailsScreens/PodDetail'),
      loading: PageLoading,
    }),
    title: 'Pod ' + translations.notificationCenter_placeEvent_detail,
    keepalive: 'RiskGraphListPodDetail',
    breadcrumb: [
      {
        children: translations.sidebar_listView,
        href: Routes.ClustersOnlineVulnerabilitiesGraphList,
      },
      {
        children: 'Pod',
        href: Routes.ClustersOnlineVulnerabilitiesGraphList + '?tab=pods',
      },
      {
        children: 'Pod ' + translations.notificationCenter_placeEvent_detail,
      },
    ],
  },
  {
    path: Routes.RiskGraphListContainerDetail,
    access: '2',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/MultiClusterRiskExplorer/ContainerDetail'),
      loading: PageLoading,
    }),
    // 缓存bug
    // keepalive: 'RiskGraphListContainerDetail',
    onBack: () => {
      history.go(-1);
    },
    title: translations.clusterGraphList_containerDetail_title,
    breadcrumb: [
      {
        children: translations.sidebar_listView,
        href: Routes.ClustersOnlineVulnerabilitiesGraphList,
      },
      {
        children: translations.clusterGraphList_container,
        href: Routes.ClustersOnlineVulnerabilitiesGraphList + '?tab=rawContainers',
      },
      {
        children: translations.clusterGraphList_containerDetail_title,
      },
    ],
  },
  {
    path: Routes.RiskGraphListApiDetail,
    access: '2',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/MultiClusterRiskExplorer/AssetDiscoveryInfo/ApiDetailScreen'),
      loading: PageLoading,
    }),
    title: 'API ' + translations.notificationCenter_placeEvent_detail,
    breadcrumb: [
      {
        children: translations.sidebar_listView,
        href: Routes.ClustersOnlineVulnerabilitiesGraphList,
      },
      {
        children: translations.api,
        href: Routes.ClustersOnlineVulnerabilitiesGraphList + '?tab=apis',
      },
      {
        children: translations.api_detail,
      },
    ],
  },
  {
    path: Routes.AssetDiscovery,
    access: '2',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/MultiClusterRiskExplorer/AssetDiscoveryInfo'),
      loading: PageLoading,
    }),
    // navbarTools: [NavbarClustersGraphDetails],
    // title: '资产详情',
    // hideMenu: true,
    // className: 'pb0',
  },
  {
    path: Routes.ClustersOnlineVulnerabilitiesDetails,
    access: '2',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/MultiClusterRiskExplorer/MultiClusterRiskExplorerGraphDetails'),
      loading: PageLoading,
    }),
    keepalive: 'ClustersOnlineVulnerabilitiesDetails',
  },
  {
    path: Routes.ScannerImages,
    access: '3',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/ImagesScanner/ImagesScannerScreen'),
      loading: PageLoading,
    }),
    title: translations.breadcrumb_imageScanner_title,
  },
  {
    path: Routes.ImagesCILifeCycle,
    access: '3',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/ImagesScanner/ImagesCI/ImagesCILifeCycle'),
      loading: PageLoading,
    }),
    title: '',
  },
  {
    path: Routes.SecurityPolicy,
    access: '2',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/ImagesScanner/SecurityPolicy'),
      loading: PageLoading,
    }),
    title: translations.security_policy,
    onBack: () => {
      history.go(-1);
    },
    breadcrumb: [
      {
        children: translations.mirror_lifecycle,
        href: Routes.ImagesCILifeCycle,
      },
      {
        children: translations.scanner_report_repoImage,
        href: Routes.ImagesCILifeCycle + `?tab=${tabType.registry}`,
      },
      {
        children: translations.security_policy,
      },
    ],
  },
  {
    path: Routes.SecurityPolicyEdit,
    access: '2',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/ImagesScanner/SecurityPolicy/SecurityPolicyEdit'),
      loading: PageLoading,
    }),
    title: translations.imageReject_create_new_rule,
    onBack: () => {
      history.go(-1);
    },
    breadcrumb: [
      {
        children: translations.mirror_lifecycle,
        href: Routes.ImagesCILifeCycle,
      },
      {
        children: translations.scanner_report_repoImage,
        href: Routes.ImagesCILifeCycle + `?tab=${tabType.registry}`,
      },
      {
        children: translations.security_policy,
        href: Routes.SecurityPolicy,
      },
      {
        children: translations.imageReject_create_new_rule,
      },
    ],
  },
  {
    path: Routes.SecurityPolicyDetail,
    access: '2',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/ImagesScanner/SecurityPolicy/SecurityPolicyInfo'),
      loading: PageLoading,
    }),
    title: translations.strategyDetails,
    breadcrumb: [
      {
        children: translations.mirror_lifecycle,
        href: Routes.ImagesCILifeCycle,
      },
      {
        children: translations.scanner_report_repoImage,
        href: Routes.ImagesCILifeCycle + `?tab=${tabType.registry}`,
      },
      {
        children: translations.security_policy,
        href: Routes.SecurityPolicy,
      },
      {
        children: translations.strategyDetails,
      },
    ],
  },
  {
    path: Routes.ImageScanRecord,
    access: '2',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/ImagesScanner/ScanRecord'),
      loading: PageLoading,
    }),
    title: translations.scanRecord,
    keepalive: 'ImageScanRecord',
    onBack: () => {
      history.go(-1);
    },
    breadcrumb: [
      {
        children: translations.mirror_lifecycle,
        href: Routes.ImagesCILifeCycle,
      },

      {
        children: translations.scanner_report_repoImage,
        href: Routes.ImagesCILifeCycle + `?tab=${tabType.registry}`,
      },
      {
        children: translations.scanRecord,
      },
    ],
  },
  {
    path: Routes.ImageScanReports,
    access: '2',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/ImagesScanner/ScanReports'),
      loading: PageLoading,
    }),
    title: translations.scanner_report_title,
    onBack: () => {
      history.go(-1);
    },
    breadcrumb: [
      {
        children: translations.sidebar_listView,
        href: Routes.ClustersOnlineVulnerabilitiesGraphList,
      },
      {
        children: translations.nodeMirroring,
        href: Routes.ClustersOnlineVulnerabilitiesGraphList + '?tab=nodeImage',
      },
      {
        children: translations.scanner_report_title,
      },
    ],
  },
  {
    path: Routes.ImageScanReportDetail,
    access: '2',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/ImagesScanner/ScanReports/ScanReportDetail'),
      loading: PageLoading,
    }),
    title: translations.scanner_report_reportDetail,
    onBack: () => {
      history.go(-1);
    },
    breadcrumb: [
      {
        children: translations.sidebar_listView,
        href: Routes.ClustersOnlineVulnerabilitiesGraphList,
      },
      {
        children: translations.nodeMirroring,
        href: Routes.ClustersOnlineVulnerabilitiesGraphList + '?tab=nodeImage',
      },
      {
        children: translations.scanner_report_title,
        href: Routes.ImageScanReports,
      },
      {
        children: translations.scanner_report_reportDetail,
      },
    ],
  },

  {
    path: Routes.ImageFileInfo,
    access: '2',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/ImagesScanner/ImageFileInfo'),
      loading: PageLoading,
    }),
    keepalive: 'ImageFileInfo',
    title: translations.scanner_report_reportDetail,
    onBack: () => {
      history.go(-1);
    },
    breadcrumb: [
      {
        children: translations.mirror_lifecycle,
        href: Routes.ImagesCILifeCycle,
      },
      {
        children: translations.warehouseImage,
        href: Routes.ImagesCILifeCycle + `?tab=${tabType.registry}`,
      },
      {
        children: translations.scanner_detail_title,
      },
    ],
  },
  {
    path: Routes.ImagesDetailInfo,
    access: '3',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/ImagesScanner/ImagesDetailInfo'),
      loading: PageLoading,
    }),
    title: '',
    breadcrumb: [
      {
        children: translations.mirror_lifecycle,
        href: Routes.ImagesCILifeCycle,
      },

      {
        children: 'CI',
        href: Routes.ImagesCILifeCycle + '?tab=ci',
      },
      {
        children: translations.scanner_detail_title,
      },
    ],
  },
  {
    path: Routes.RegistryImagesDetailInfo,
    access: '3',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/ImagesScanner/LifeCycle'),
      loading: PageLoading,
    }),
    title: '',
    keepalive: 'RegistryImagesDetailInfo',
    breadcrumb: [
      {
        children: translations.mirror_lifecycle,
        href: Routes.ImagesCILifeCycle,
      },
      {
        children: translations.scanner_report_repoImage,
        href: Routes.ImagesCILifeCycle + `?tab=${tabType.registry}`,
      },
      {
        children: translations.scanner_detail_title,
      },
    ],
  },
  {
    path: Routes.DeployImageInfo,
    access: '3',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/ImagesScanner/DeployImageInfo'),
      loading: PageLoading,
    }),
    title: '',
    keepalive: 'DeployImageInfo',
    breadcrumb: [
      {
        children: translations.mirror_lifecycle,
        href: Routes.ImagesCILifeCycle,
      },
      {
        children: translations.imageReject_toonline,
        href: Routes.ImagesCILifeCycle + `?tab=${tabType.deploy}`,
      },
      {
        children: translations.scanner_detail_title,
      },
    ],
  },
  {
    path: Routes.StrategicManagement,
    access: '3',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/ImagesScanner/LifeCycle/StrategicManagement'),
      loading: PageLoading,
    }),
    title: '',
    breadcrumb: [
      {
        children: translations.mirror_lifecycle,
        href: Routes.ImagesCILifeCycle,
      },
      {
        children: 'CI',
        href: Routes.ImagesCILifeCycle + '?tab=ci',
      },
      {
        children: translations.policy_management,
      },
    ],
  },
  {
    path: Routes.StrategicManagementInfo,
    access: '3',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/ImagesScanner/LifeCycle/StrategicManagement/StrategicManagementInfo'),
      loading: PageLoading,
    }),
    title: '',
    breadcrumb: [
      {
        children: translations.mirror_lifecycle,
        href: Routes.ImagesCILifeCycle,
      },
      {
        children: 'CI',
        href: Routes.ImagesCILifeCycle + '?tab=ci',
      },
      {
        children: translations.policy_management,
      },
    ],
  },
  {
    path: Routes.ComplianceWhole,
    access: '3',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/ComplianceWhole/index'),
      loading: PageLoading,
    }),
    title: translations.compliance_testing,
    keepalive: 'ComplianceWhole',
  },
  {
    path: Routes.ComplianceHistoryInfo,
    access: '3',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/ComplianceWhole/index'),
      loading: PageLoading,
    }),
    keepalive: 'ComplianceHistoryInfo',
    title: '',
    breadcrumb: [
      {
        children: translations.compliance_testing,
        href: Routes.ComplianceWhole,
      },
      {
        children: translations.scanManagement,
        href: Routes.ComplianceScanManagement,
      },
      {
        children: translations.scan_record_details,
      },
    ],
  },
  {
    path: Routes.ComplianceStrategicManagement,
    access: '3',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/ComplianceWhole/StrategicManagement'),
      loading: PageLoading,
    }),
    keepalive: 'ComplianceStrategicManagement',
    title: '',
    breadcrumb: [
      {
        children: translations.compliance_testing,
        href: Routes.ComplianceWhole,
      },
      {
        children: translations.baseline_management,
      },
    ],
  },
  {
    path: Routes.ComplianceStrategicManagementInfo,
    access: '3',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/ComplianceWhole/StrategicManagement/StrategicManagementInfo'),
      loading: PageLoading,
    }),
    title: '',
    breadcrumb: [
      {
        children: translations.compliance_testing,
        href: Routes.ComplianceWhole,
      },
      {
        children: translations.baseline_management,
      },
      {
        children: translations.new_baseline,
      },
    ],
  },
  {
    path: Routes.ComplianceInfo,
    access: '3',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/ComplianceWhole/ComplianceInfo'),
      loading: PageLoading,
    }),
    title: '',
    breadcrumb: [
      {
        children: translations.compliance_testing,
        href: Routes.ComplianceWhole,
      },
      {
        children: translations.compliance_details,
      },
    ],
  },
  {
    path: Routes.ComplianceScanManagement,
    access: '3',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/ComplianceWhole/ScanManagement'),
      loading: PageLoading,
    }),
    title: '',
    keepalive: 'ComplianceScanManagement',
    breadcrumb: [
      {
        children: translations.compliance_testing,
        href: Routes.ComplianceWhole,
      },
      {
        children: translations.scanManagement,
      },
    ],
  },
  {
    path: Routes.WhiteList,
    access: '3',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/ImagesScanner/WhiteList'),
      loading: PageLoading,
    }),
    title: translations.white_list,
    onBack: true,
    breadcrumb: [
      {
        children: translations.mirror_lifecycle,
        href: Routes.ImagesCILifeCycle,
      },
      {
        children: 'CI',
        href: Routes.ImagesCILifeCycle + '?tab=ci',
      },
      {
        children: translations.white_list,
      },
    ],
  },
  {
    path: Routes.imageRejectWhiteList,
    access: '3',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/ImageReject/WhiteList'),
      loading: PageLoading,
    }),
    title: translations.white_list,
    onBack: true,
    breadcrumb: [
      {
        children: translations.mirror_lifecycle,
        href: Routes.ImagesCILifeCycle,
      },
      {
        children: translations.imageReject_toonline,
        href: Routes.ImagesCILifeCycle + '?tab=deploy',
      },
      {
        children: translations.white_list,
      },
    ],
  },
  {
    path: Routes.imageRejectPolicyManagement,
    access: '3',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/ImageReject/PolicyManagement'),
      loading: PageLoading,
    }),
    title: translations.policy_management,
    keepalive: 'imageRejectPolicyManagement',
    onBack: true,
    breadcrumb: [
      {
        children: translations.mirror_lifecycle,
        href: Routes.ImagesCILifeCycle,
      },
      {
        children: translations.imageReject_toonline,
        href: Routes.ImagesCILifeCycle + '?tab=deploy',
      },
      {
        children: translations.policy_management,
      },
    ],
  },

  {
    path: Routes.ImageConfig,
    access: '3',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/ImagesScanner/ImageConfig'),
      loading: PageLoading,
    }),
    title: translations.scanner_images_setting,
    keepalive: 'ImageConfig',
    onBack: true,
    breadcrumb: [
      {
        children: translations.mirror_lifecycle,
        href: Routes.ImagesCILifeCycle,
      },
      {
        children: translations.scanner_images_setting,
      },
    ],
  },
  {
    path: Routes.ImageConfigRepoManagementEdit,
    access: '3',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/ImagesScanner/ImageConfig/RepoManagement/Edit'),
      loading: PageLoading,
    }),
    title: translations.scanner_config_addRepo,
    onBack: true,
    breadcrumb: [
      {
        children: translations.mirror_lifecycle,
        href: Routes.ImagesCILifeCycle,
      },
      {
        children: translations.scanner_images_setting,
        href: Routes.ImageConfig + '?tab=warehouseManagement',
      },
      {
        children: translations.scanner_config_repoManage,
        href: Routes.ImageConfig + '?tab=warehouseManagement',
      },
      {
        children: translations.scanner_config_addRepo,
      },
    ],
  },
  {
    path: Routes.ImageConfigRepoManagementInfo,
    access: '3',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/ImagesScanner/ImageConfig/RepoManagement/Info'),
      loading: PageLoading,
    }),
    title: translations.warehouse_details,
    onBack: true,
    breadcrumb: [
      {
        children: translations.mirror_lifecycle,
        href: Routes.ImagesCILifeCycle,
      },
      {
        children: translations.scanner_images_setting,
        href: Routes.ImageConfig + '?tab=warehouseManagement',
      },
      {
        children: translations.scanner_config_repoManage,
        href: Routes.ImageConfig + '?tab=warehouseManagement',
      },
      {
        children: translations.warehouse_details,
      },
    ],
  },

  {
    path: Routes.KeyManagementEdit,
    access: '3',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/ImagesScanner/ImageConfig/KeyManagement/Edit'),
      loading: PageLoading,
    }),
    title: translations.newSecretKey,
    onBack: true,
    breadcrumb: [
      {
        children: translations.mirror_lifecycle,
        href: Routes.ImagesCILifeCycle,
      },
      {
        children: translations.scanner_images_setting,
        href: Routes.ImageConfig + '?tab=baseImage',
      },
      {
        children: translations.trusted_key,
        href: Routes.ImageConfig + '?tab=baseImage',
      },
      {
        children: translations.newSecretKey,
      },
    ],
  },

  {
    path: Routes.KeyManagementInfo,
    access: '3',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/ImagesScanner/ImageConfig/KeyManagement/Info'),
      loading: PageLoading,
    }),
    title: translations.keyDetails,
    onBack: true,
    breadcrumb: [
      {
        children: translations.mirror_lifecycle,
        href: Routes.ImagesCILifeCycle,
      },
      {
        children: translations.scanner_images_setting,
        href: Routes.ImageConfig + '?tab=trustedkey',
      },
      {
        children: translations.trusted_key,
        href: Routes.ImageConfig + '?tab=trustedkey',
      },
      {
        children: translations.keyDetails,
      },
    ],
  },
  {
    path: Routes.ImageDiscover,
    access: '3',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/ImagesDiscover'),
      loading: PageLoading,
    }),
    title: translations.sidebar_imageScanner,
    keepalive: 'ImageDiscover',
  },
  {
    path: Routes.ImagesDiscoverDetail,
    access: '3',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/ImagesDiscover/ImagesDiscoverDetail'),
      loading: PageLoading,
    }),
    keepalive: 'ImagesDiscoverDetail',
    title: translations.imagesDiscover_detail_title,
    onBack: true,
    breadcrumb: [
      {
        children: translations.sidebar_imageScanner,
        href: Routes.ImageDiscover,
      },
      {
        children: translations.imagesDiscover_detail_title,
      },
    ],
  },
  {
    path: Routes.ImageReject,
    access: '3',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/ImageReject'),
      loading: PageLoading,
    }),
    title: translations.imageReject_title,
  },
  {
    path: Routes.NotificationCenter,
    roles: [ROLES.ADMIN, ROLES.NORMAL, ROLES.AUDIT],
    access: ['2', '3'],
    element: loadable({
      loader: () => import('./screens/AlertCenter/AlertCenterScreen'),
      loading: PageLoading,
    }),
    title: translations.alertCenter,
    keepalive: 'NotificationCenter',
  },
  {
    path: Routes.PalaceEventCenterId,
    roles: [ROLES.ADMIN, ROLES.NORMAL, ROLES.AUDIT],
    element: loadable({
      loader: () => import('./screens/AlertCenter/EventDetail'),
      loading: PageLoading,
    }),
    title: '',
    keepalive: 'PalaceEventCenterId',
    breadcrumb: [
      {
        children: translations.alertCenter,
        href: Routes.NotificationCenter,
      },
      {
        children: translations.event_details,
      },
    ],
    hidefoot: true,
  },
  {
    path: Routes.EventOverviewDetails,
    roles: [ROLES.ADMIN, ROLES.NORMAL, ROLES.AUDIT],
    element: loadable({
      loader: () => import('./screens/AlertCenter/EventOverviewDetails'),
      loading: PageLoading,
    }),
    title: '',
    breadcrumb: [
      {
        children: translations.alertCenter,
        href: Routes.NotificationCenter,
      },
      {
        children: translations.event_overview,
      },
    ],
    keepalive: 'EventOverviewDetails',
  },

  {
    path: Routes.EventDetailsList,
    roles: [ROLES.ADMIN, ROLES.NORMAL, ROLES.AUDIT],
    element: loadable({
      loader: () => import('./screens/AlertCenter/EventDetailsList'),
      loading: PageLoading,
    }),
    title: '',
    keepalive: 'EventDetailsList',
    breadcrumb: [
      {
        children: translations.alertCenter,
        href: Routes.NotificationCenter,
      },
      {
        children: translations.event_overview,
        href: Routes.EventOverviewDetails,
      },
    ],
  },
  {
    path: Routes.PalaceEventSeting,
    roles: [ROLES.ADMIN, ROLES.NORMAL, ROLES.AUDIT],
    element: loadable({
      loader: () => import('./screens/AlertCenter/Configure'),
      loading: PageLoading,
    }),
    title: '',
    breadcrumb: [
      {
        children: translations.alertCenter,
        href: Routes.NotificationCenter,
      },
      {
        children: translations.scanner_images_setting,
      },
    ],
    hidefoot: true,
  },
  {
    path: Routes.PalaceEventWhiteListDetail,
    roles: [ROLES.ADMIN, ROLES.NORMAL, ROLES.AUDIT],
    element: loadable({
      loader: () => import('./screens/AlertCenter/WhiteListPolicyDetail'),
      loading: PageLoading,
    }),
    title: '',
    breadcrumb: [
      {
        children: translations.alertCenter,
        href: Routes.NotificationCenter,
      },
      {
        children: translations.scanner_images_setting,
        href: Routes.PalaceEventSeting,
      },
      {
        children: translations.strategyDetails,
      },
    ],
    hidefoot: true,
  },
  {
    path: Routes.Attck,
    access: '3',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/AlertCenter/Attck'),
      loading: PageLoading,
    }),
    title: translations.breadcrumb_attck_title,
  },
  {
    path: Routes.AttckRuleConfiguration,
    access: '3',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/AlertCenter/RuleConfiguration'),
      loading: PageLoading,
    }),
    title: translations.rule_management,
    breadcrumb: [
      {
        children: 'ATT&CK',
        href: Routes.Attck,
      },
      {
        children: translations.rule_management,
      },
    ],
  },
  {
    path: Routes.AttckRuleCustom,
    access: '3',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/AlertCenter/RuleCustom'),
      loading: PageLoading,
    }),
    title: translations.rule_custom,
    breadcrumb: [
      {
        children: 'ATT&CK',
        href: Routes.Attck,
      },
      {
        children: translations.rule_management,
        href: Routes.AttckRuleConfiguration,
      },
      {
        children: translations.rule_custom,
      },
    ],
  },
  {
    path: Routes.AttckDetail,
    access: '3',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/AlertCenter/AttckDetail'),
      loading: PageLoading,
    }),
    title: '',
    keepalive: 'AttckDetail',
  },
  {
    path: Routes.ImmuneDefense,
    access: '3',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/ImmuneDefense/List'),
      loading: PageLoading,
    }),
    title: translations.immune_defense,
  },
  {
    path: Routes.ImmuneDefenseInfo,
    access: '3',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/ImmuneDefense/Info'),
      loading: PageLoading,
    }),
    title: translations.immune_defense_info,
    breadcrumb: [
      {
        children: translations.immune_defense,
        href: Routes.ImmuneDefense,
      },
      {
        children: translations.immune_defense_info,
      },
    ],
    onBack: true,
  },
  {
    path: Routes.ImmuneDefenseConfig,
    access: '3',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/ImmuneDefense/Config'),
      loading: PageLoading,
    }),
    title: translations.config,
    breadcrumb: [
      {
        children: translations.immune_defense,
        href: Routes.ImmuneDefense,
      },
      {
        children: translations.config,
      },
    ],
    onBack: true,
  },
  {
    path: Routes.ActiveDefense,
    access: '3',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/ActiveDefense/ActiveDefense'),
      loading: PageLoading,
    }),
    keepalive: 'ActiveDefense',
    title: translations.activeDefense_title,
    navbarTools: [ClusterSelector],
  },
  {
    path: Routes.DeflectDefense,
    access: '3',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/DeflectDefense/DeflectDefense'),
      loading: PageLoading,
    }),
    title: translations.deflectDefense_title,
    navbarTools: [ClusterSelector],
    keepalive: 'DeflectDefense',
  },
  {
    path: Routes.DeflectDefenseInfo,
    access: '3',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/DeflectDefense/DeflectDefenseInfo'),
      loading: PageLoading,
    }),
    keepalive: 'DeflectDefenseInfo',
    title: translations.strategyDetails,
    breadcrumb: [
      {
        children: translations.deflectDefense_title,
        href: Routes.DeflectDefense,
      },
      {
        children: translations.strategyDetails,
      },
    ],
  },
  {
    path: Routes.DeflectDefenseAdd,
    access: '3',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/DeflectDefense/AddDeflectDefense'),
      loading: PageLoading,
    }),
    title: translations.deflectDefense_newStrategy,
    breadcrumb: [
      {
        children: translations.deflectDefense_title,
        href: Routes.DeflectDefense,
      },
      {
        children: translations.deflectDefense_newStrategy,
      },
    ],
  },
  {
    path: Routes.DeflectDefenseWhiteList,
    access: '3',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/DeflectDefense/WhiteList'),
      loading: PageLoading,
    }),
    title: translations.strategyDetails,
    breadcrumb: [
      {
        children: translations.deflectDefense_title,
        href: Routes.DeflectDefense,
      },
      {
        children: translations.white_list,
      },
    ],
  },
  {
    path: Routes.kubeMonitor,
    access: '3',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/AlertCenter/kubeMonitor'),
      loading: PageLoading,
    }),
    title: translations.sidebar_kubeMonitor,
  },
  {
    path: Routes.DataManagement,
    roles: [ROLES.PLATFORM_ADMIN],
    element: loadable({
      loader: () => import('./screens/DataManagement'),
      loading: PageLoading,
    }),
    title: translations.dataManagement,
  },
  {
    path: Routes.SystemUpgrade,
    roles: [ROLES.PLATFORM_ADMIN],
    element: loadable({
      loader: () => import('./screens/SystemUpgrade/SystemUpgrade'),
      loading: PageLoading,
    }),
    title: translations.systemUpgrade,
  },

  {
    path: Routes.UpgradeHistory,
    roles: [ROLES.PLATFORM_ADMIN],
    element: loadable({
      loader: () => import('./screens/SystemUpgrade/UpgradeHistory'),
      loading: PageLoading,
    }),
    title: translations.rule_base_history,
    breadcrumb: [
      {
        children: translations.systemUpgrade,
        href: Routes.SystemUpgrade,
      },
      {
        children: translations.rule_base_history,
      },
    ],
  },
  {
    path: Routes.VulnUpgradeHistory,
    roles: [ROLES.PLATFORM_ADMIN],
    element: loadable({
      loader: () => import('./screens/SystemUpgrade/VulnUpgradeHistory'),
      loading: PageLoading,
    }),
    title: translations.unStandard.str236,
    breadcrumb: [
      {
        children: translations.systemUpgrade,
        href: Routes.SystemUpgrade,
      },
      {
        children: translations.unStandard.str236,
      },
    ],
  },
  {
    path: Routes.VirusUpgradeHistory,
    roles: [ROLES.PLATFORM_ADMIN],
    element: loadable({
      loader: () => import('./screens/SystemUpgrade/VirusUpgradeHistory'),
      loading: PageLoading,
    }),
    title: translations.unStandard.str215,
    breadcrumb: [
      {
        children: translations.systemUpgrade,
        href: Routes.SystemUpgrade,
      },
      {
        children: translations.unStandard.str215,
      },
    ],
  },

  {
    path: Routes.SuperAdmin,
    roles: [ROLES.PLATFORM_ADMIN],
    element: loadable({
      loader: () => import('./screens/SuperAdmin/SuperAdminScreen'),
      loading: PageLoading,
    }),
    title: translations.account,
  },

  {
    path: Routes.LoginConfig,
    roles: [ROLES.PLATFORM_ADMIN],
    element: loadable({
      loader: () => import('./screens/SuperAdmin/LoginConfig'),
      loading: PageLoading,
    }),
    title: translations.scanner_images_setting,
    breadcrumb: [
      {
        children: translations.account,
        href: Routes.SuperAdmin,
      },
      {
        children: translations.scanner_images_setting,
      },
    ],
    onBack: true,
  },
  {
    path: Routes.MultiClusterManage,
    roles: [ROLES.PLATFORM_ADMIN],
    element: loadable({
      loader: () => import('./screens/ClusterManagement/MultiClusterScreen'),
      loading: PageLoading,
    }),
    title: translations.sidebar_clusterManage,
  },
  {
    path: Routes.ComponentMonitoring,
    roles: [ROLES.PLATFORM_ADMIN],
    element: loadable({
      loader: () => import('./screens/ComponentMonitoring'),
      loading: PageLoading,
    }),
    title: translations.componentMonitoring,
  },

  {
    path: Routes.MicroisolationVisualize,
    access: '4',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/Microisolation'),
      loading: PageLoading,
    }),
    title: translations.calico_visualize,
  },
  {
    path: Routes.MicroisolationObjectManagement,
    access: '4',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/Microisolation/ObjectManagement'),
      loading: PageLoading,
    }),
    title: translations.object_management,
  },
  {
    path: Routes.MicroisolationObjectManagementAdd,
    access: '4',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/Microisolation/ObjectManagement/ResourceGroup/Info'),
      loading: PageLoading,
    }),
    title: translations.new_resource_groups,
    breadcrumb: [
      {
        children: translations.calico_root,
        href: Routes.MicroisolationVisualize,
      },
      {
        children: translations.object_management,
        href: Routes.MicroisolationObjectManagement,
      },
      {
        children: translations.microseg_segments_segment_title,
        href: Routes.MicroisolationObjectManagement,
      },
      {
        children: translations.new_resource_groups,
      },
    ],
    onBack: true,
  },
  {
    path: Routes.MicroisolationObjectManagementEdit,
    access: '4',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/Microisolation/ObjectManagement/ResourceGroup/Info'),
      loading: PageLoading,
    }),
    title: translations.edit_resource_group,
    breadcrumb: [
      {
        children: translations.calico_root,
        href: Routes.MicroisolationVisualize,
      },
      {
        children: translations.object_management,
        href: Routes.MicroisolationObjectManagement,
      },
      {
        children: translations.microseg_segments_segment_title,
        href: Routes.MicroisolationObjectManagement,
      },
      {
        children: translations.edit_resource_group,
      },
    ],
    onBack: true,
  },

  {
    path: Routes.MicroisolationPolicyManagement,
    access: '4',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/Microisolation/PolicyManagement'),
      loading: PageLoading,
    }),
    title: translations.policy_management,
  },
  {
    path: Routes.MicroisolationPolicyManagementEdit,
    access: '4',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/Microisolation/PolicyManagement/Info'),
      loading: PageLoading,
    }),
    title: translations.imageReject_edit_rule_title,
    breadcrumb: [
      {
        children: translations.calico_root,
        href: Routes.MicroisolationVisualize,
      },
      {
        children: translations.policy_management,
        href: Routes.MicroisolationPolicyManagement,
      },
      {
        children: translations.imageReject_edit_rule_title,
      },
    ],
    onBack: true,
  },
  {
    path: Routes.MicroisolationPolicyManagementAdd,
    access: '4',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/Microisolation/PolicyManagement/Info'),
      loading: PageLoading,
    }),
    title: translations.imageReject_create_new_rule,
    breadcrumb: [
      {
        children: translations.calico_root,
        href: Routes.MicroisolationVisualize,
      },
      {
        children: translations.policy_management,
        href: Routes.MicroisolationPolicyManagement,
      },
      {
        children: translations.imageReject_create_new_rule,
      },
    ],
    onBack: true,
  },
  {
    path: Routes.MicroisolationFlowRate,
    access: '4',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/Microisolation/FlowRate'),
      loading: PageLoading,
    }),
    title: translations.traffic_log_c,
  },
  {
    path: Routes.MicroisolationConfig,
    access: '4',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/Microisolation/Config'),
      loading: PageLoading,
    }),
    title: translations.calico_cluster_title,
    breadcrumb: [
      {
        children: translations.calico_root,
        href: Routes.MicroisolationVisualize,
      },
      {
        children: translations.policy_management,
        href: Routes.MicroisolationPolicyManagement,
      },
      {
        children: translations.calico_cluster_title,
      },
    ],
    onBack: true,
  },
  {
    path: Routes.PlatformAPI,
    access: '3',
    roles: [ROLES.ADMIN, ROLES.NORMAL, ROLES.AUDIT],
    element: loadable({
      loader: () => import('./screens/PlatformAPI'),
      loading: PageLoading,
    }),
    title: '',
  },

  {
    path: Routes.Firewall,
    access: '3',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/Firewall'),
      loading: PageLoading,
    }),
    title: translations.firewall,
  },
  {
    path: Routes.AppInfo,
    access: '3',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/Firewall/AppInfo'),
      loading: PageLoading,
    }),
    title: translations.add_new_app,
    breadcrumb: [
      {
        children: translations.firewall,
        href: Routes.Firewall,
      },
      {
        children: translations.list_apps,
        href: Routes.Firewall,
      },
      {
        children: translations.add_new_app,
      },
    ],
    onBack: true,
  },

  {
    path: Routes.AppInfoDetail,
    access: '3',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/Firewall/AppInfoDetail'),
      loading: PageLoading,
    }),
    title: '',
    breadcrumb: [
      {
        children: translations.firewall,
        href: Routes.Firewall,
      },
      {
        children: translations.list_apps,
        href: Routes.Firewall,
      },
      {
        children: translations.application_details,
      },
    ],
    onBack: true,
  },
  {
    path: Routes.Blackwhitelists,
    access: '3',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/Firewall/Blackwhitelists'),
      loading: PageLoading,
    }),
    title: translations.black_and_white_lists,
    breadcrumb: [
      {
        children: translations.firewall,
        href: Routes.Firewall,
      },
      {
        children: translations.black_and_white_lists,
      },
    ],
    onBack: true,
  },
  {
    path: Routes.RulesManager,
    access: '3',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/Firewall/RulesManager'),
      loading: PageLoading,
    }),
    title: translations.rule_management,
    breadcrumb: [
      {
        children: translations.firewall,
        href: Routes.Firewall,
      },
      {
        children: translations.rule_management,
      },
    ],
    onBack: true,
  },
  {
    path: Routes.WafConfig,
    access: '3',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/Firewall/WafConfig'),
      loading: PageLoading,
    }),
    title: translations.scanner_images_setting,
    breadcrumb: [
      {
        children: translations.firewall,
        href: Routes.Firewall,
      },
      {
        children: translations.scanner_images_setting,
      },
    ],
    onBack: true,
  },
  {
    path: Routes.OpenAPI,
    roles: [ROLES.PLATFORM_ADMIN, ROLES.ADMIN],
    element: loadable({
      loader: () => import('./screens/OpenAPI'),
      loading: PageLoading,
    }),
    title: translations.openAPI,
  },
  {
    path: Routes.KuberScanner,
    access: '3',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/KubeScanner/KubeScannerScreen'),
      loading: PageLoading,
    }),
    navbarTools: [ClusterSelector],
    title: translations.breadcrumb_kubeScann_title,
  },
  {
    path: Routes.AuditLog,
    roles: [ROLES.AUDIT],
    element: loadable({
      loader: () => import('./screens/AuditLog/AuditLogScreen'),
      loading: PageLoading,
    }),
    title: translations.breadcrumb_auditLog_title,
  },

  {
    path: Routes.AuditLogConfig,
    roles: [ROLES.AUDIT],
    element: loadable({
      loader: () => import('./screens/AuditLogConfig'),
      loading: PageLoading,
    }),
    title: translations.scanner_images_setting,
    breadcrumb: [
      {
        children: translations.breadcrumb_auditLog_title,
        href: Routes.AuditLog,
      },
      {
        children: translations.scanner_images_setting,
      },
    ],
    onBack: true,
  },
  {
    path: Routes.NotificationManagement,
    roles: [ROLES.PLATFORM_ADMIN],
    element: loadable({
      loader: () => import('./screens/NoticeConfigScreen'),
      loading: PageLoading,
    }),
    title: translations.event_notifications,
  },
  {
    path: Routes.LicenseScreen,
    roles: [ROLES.PLATFORM_ADMIN],
    element: loadable({
      loader: () => import('./screens/License/LicenseScreen'),
      loading: PageLoading,
    }),
    title: translations.license_licenseActivat,
  },
  {
    path: Routes.YamlScan,
    access: '3',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/YamlScan'),
      loading: PageLoading,
    }),
    title: translations.yaml_security_detection,
    keepalive: 'YamlScan',
  },
  {
    path: Routes.YamlScanBaselineManagement,
    access: '3',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/YamlScan/BaselineManagement/index'),
      loading: PageLoading,
    }),
    title: translations.baseline_management,
    breadcrumb: [
      {
        children: translations.yaml_security_detection,
        href: Routes.YamlScan,
      },
      {
        children: translations.baseline_management,
      },
    ],
    onBack: true,
  },
  {
    path: Routes.YamlScanBaselineManagementInfo,
    access: '3',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/YamlScan/BaselineManagement/Info'),
      loading: PageLoading,
    }),
    title: translations.baseline_management,
    breadcrumb: [
      {
        children: translations.yaml_security_detection,
        href: Routes.YamlScan,
      },
      {
        children: translations.baseline_management,
        href: Routes.YamlScanBaselineManagement,
      },
      {
        children: translations.baseline_details,
      },
    ],
    onBack: true,
  },
  {
    path: Routes.YamlScanBaselineManagementEdit,
    access: '3',
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/YamlScan/BaselineManagement/Edit'),
      loading: PageLoading,
    }),
    title: translations.baseline_management,
    breadcrumb: [
      {
        children: translations.yaml_security_detection,
        href: Routes.YamlScan,
      },
      {
        children: translations.baseline_management,
        href: Routes.YamlScanBaselineManagement,
      },
      {
        children: translations.edit_baseline,
      },
    ],
    onBack: true,
  },
  {
    path: Routes.ScanConfig,
    access: '3',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/YamlScan/ScanConfig'),
      loading: PageLoading,
    }),
    title: translations.scanConfiguration,
    breadcrumb: [
      {
        children: translations.yaml_security_detection,
        href: Routes.YamlScan,
      },
      {
        children: translations.scanConfiguration,
      },
    ],
    onBack: true,
  },
  {
    path: Routes.YamlScanInfo,
    access: '3',
    roles: [ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/YamlScan/YamlScanInfo'),
      loading: PageLoading,
    }),
    title: translations.details_test_results,
    breadcrumb: [
      {
        children: translations.yaml_security_detection,
        href: Routes.YamlScan,
      },
      {
        children: translations.details_test_results,
      },
    ],
    onBack: true,
  },

  {
    path: Routes.IaCSecurity,
    access: '3',
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/IaCSecurity/index'),
      loading: PageLoading,
    }),
    keepalive: 'IaCSecurity',
    title: translations.iac_security,
  },
  {
    path: Routes.IaCSecurityBaselineManagement,
    access: '3',
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/IaCSecurity/BaselineManagement/index'),
      loading: PageLoading,
    }),
    title: translations.baseline_management,
    breadcrumb: [
      {
        children: translations.iac_security,
        href: Routes.IaCSecurity,
      },
      {
        children: translations.baseline_management,
      },
    ],
    onBack: true,
  },
  {
    path: Routes.IaCSecurityBaselineManagementInfo,
    access: '3',
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/IaCSecurity/BaselineManagement/Info'),
      loading: PageLoading,
    }),
    title: translations.baseline_management,
    breadcrumb: [
      {
        children: translations.iac_security,
        href: Routes.IaCSecurity,
      },
      {
        children: translations.baseline_management,
        href: Routes.IaCSecurityBaselineManagement,
      },
      {
        children: translations.baseline_details,
      },
    ],
    onBack: true,
  },
  {
    path: Routes.IaCSecurityBaselineManagementEdit,
    access: '3',
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/IaCSecurity/BaselineManagement/Edit'),
      loading: PageLoading,
    }),
    title: translations.baseline_management,
    breadcrumb: [
      {
        children: translations.iac_security,
        href: Routes.IaCSecurity,
      },
      {
        children: translations.baseline_management,
        href: Routes.IaCSecurityBaselineManagement,
      },
      {
        children: translations.new_baseline,
      },
    ],
    onBack: true,
  },
  {
    path: Routes.IaCSecurityScanConfig,
    access: '3',
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/IaCSecurity/ScanConfig/index'),
      loading: PageLoading,
    }),
    title: translations.imageReject_rule_ctro,
    breadcrumb: [
      {
        children: translations.iac_security,
        href: Routes.IaCSecurity,
      },
      {
        children: translations.imageReject_rule_ctro,
      },
    ],
    onBack: true,
  },
  {
    path: Routes.IaCSecurityInfo,
    access: '3',
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/IaCSecurity/IaCSecurityInfo/index'),
      loading: PageLoading,
    }),
    title: translations.details_test_results,
    breadcrumb: [
      {
        children: translations.iac_security,
        href: Routes.IaCSecurity,
      },
      {
        children: translations.details_test_results,
      },
    ],
    onBack: true,
  },
  {
    path: Routes.ManualScanning,
    access: '3',
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/IaCSecurity/ManualScanning/index'),
      loading: PageLoading,
    }),
    title: translations.manual_scanning,
    breadcrumb: [
      {
        children: translations.iac_security,
        href: Routes.IaCSecurity,
      },
      {
        children: translations.manual_scanning,
      },
    ],
    onBack: true,
  },
  {
    path: Routes.MicroisolationPolicyDetail,
    access: '3',
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.NORMAL],
    element: loadable({
      loader: () => import('./screens/Microisolation/PolicyManagement/Detail'),
      loading: PageLoading,
    }),
    title: translations.strategyDetails,
    breadcrumb: [
      {
        children: translations.calico_root,
        href: Routes.MicroisolationVisualize,
      },
      {
        children: translations.policy_management,
        href: Routes.MicroisolationPolicyManagement,
      },
      {
        children: translations.strategyDetails,
      },
    ],
    onBack: true,
  },
];

export default routers;
