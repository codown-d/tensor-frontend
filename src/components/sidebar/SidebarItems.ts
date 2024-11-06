import { translations } from '../../translations/translations';
import { Routes } from '../../Routes';

import React, { ReactNode } from 'react';
import { REACT_APP_SIDEBAR_REJECT } from '../../helpers/config';
let RejectSideBar = REACT_APP_SIDEBAR_REJECT;
export type TMenuDataDefault = {
  title: string;
  label: ReactNode;
  className: string;
  key: string;
  id: string; //部署控制左侧目录显示影藏  id取路由组件名， eg: 路由组件Routes.Dashboard对应的id为Dashboard
  icon?: string;
  hidden?: boolean;
  children?: TMenuDataDefault[];
};
export const menuDataDefault: TMenuDataDefault[] = [
  {
    title: translations.dashboard,
    label: translations.dashboard,
    className: '',
    key: Routes.Dashboard,
    id: 'Dashboard',
    icon: 'icon-yibiaopan',
  },
  {
    title: translations.riskExplorer,
    label: translations.riskExplorer,
    className: 'riskExplorer2',
    icon: 'icon-fengxiantansuo',
    key: Routes.OnlineVulnerabilities,
    id: 'OnlineVulnerabilities',
  },
  {
    title: translations.sidebar_listView,
    label: translations.sidebar_listView,
    className: 'clusterList',
    icon: 'icon-zichanfaxian',
    key: Routes.ClustersOnlineVulnerabilitiesGraphList,
    id: 'ClustersOnlineVulnerabilitiesGraphList',
  },
  {
    title: translations.alertCenter,
    label: translations.alertCenter,
    className: 'alertCenter',
    icon: 'icon-jingbaozhongxin',
    key: Routes.NotificationCenter,
    id: 'NotificationCenter',
  },
  {
    title: translations.sidebar_attck,
    label: translations.sidebar_attck,
    className: 'attckScreen',
    icon: 'icon-a-ATTCK',
    key: Routes.Attck,
    id: 'Attck',
  },
  {
    title: translations.immune_defense,
    label: translations.immune_defense,
    className: 'immuneDefense',
    icon: 'icon-fangyumoshi',
    key: Routes.ImmuneDefense,
    id: 'ImmuneDefense',
  },
  {
    title: translations.activeDefense_title,
    label: translations.activeDefense_title,
    className: 'activeDefense',
    icon: 'icon-zhudongfangyu',
    key: Routes.ActiveDefense,
    id: 'ActiveDefense',
  },
  {
    title: translations.deflectDefense_title,
    label: translations.deflectDefense_title,
    className: 'deflectDefense',
    icon: 'icon-pianyifangyu',
    key: Routes.DeflectDefense,
    id: 'DeflectDefense',
  },
  {
    title: translations.calico_root,
    label: translations.calico_root,
    className: 'calico',
    icon: 'icon-weigeli',
    id: 'calico',
    key: 'calico',
    children: [
      {
        title: translations.calico_visualize,
        label: translations.calico_visualize,
        className: 'calico-visualize',
        key: Routes.MicroisolationVisualize,
        id: 'CalicoVisualize',
      },
      {
        title: translations.traffic_log_c,
        label: translations.traffic_log_c,
        className: 'traffic-log',
        key: Routes.MicroisolationFlowRate,
        id: 'MicroisolationFlowRate',
      },
      {
        title: translations.policy_management,
        label: translations.policy_management,
        className: 'policy-management',
        key: Routes.MicroisolationPolicyManagement,
        id: 'MicroisolationPolicyManagement',
      },
      {
        title: translations.object_management,
        label: translations.object_management,
        className: 'object-management',
        key: Routes.MicroisolationObjectManagement,
        id: 'MicroisolationObjectManagement',
      },
    ],
  },
  {
    title: translations.firewall,
    label: translations.firewall,
    className: 'firewall',
    icon: 'icon-yingyongfanghuoqiang',
    key: Routes.Firewall,
    id: 'Firewall',
  },
  {
    title: translations.imageSecurity,
    label: translations.imageSecurity,
    className: 'imageScanning',
    icon: 'icon-jingxiang',
    id: 'ImageScanningBox',
    key: 'imageScanningBox',
    children: [
      {
        title: translations.mirror_lifecycle,
        label: translations.mirror_lifecycle,
        className: 'lifeCycle',
        key: Routes.ImagesCILifeCycle,
        id: 'ImagesCILifeCycle',
      },
      {
        title: translations.sidebar_imageScanner,
        label: translations.sidebar_imageScanner,
        className: 'imageScanner',
        key: Routes.ImageDiscover,
        id: 'ImageDiscover',
      },
    ],
  },
  {
    title: translations.iac_security,
    label: translations.iac_security,
    className: 'iac-security',
    icon: 'icon-jingxiangsaomiao',
    key: Routes.IaCSecurity,
    id: 'IaCSecurity',
  },
  {
    title: translations.compliance_testing,
    label: translations.compliance_testing,
    className: 'compliance',
    icon: 'icon-anquanhegui',
    key: Routes.ComplianceWhole,
    id: 'ComplianceWhole',
  },
  {
    title: translations.platformAPI,
    label: translations.platformAPI,
    className: 'security',
    icon: 'icon-pingtaianquan',
    id: 'PlatformSecurity',
    key: 'PlatformSecurity',
    children: [
      {
        title: translations.yaml_security_detection,
        label: translations.yaml_security_detection,
        className: 'yamlScan',
        key: Routes.YamlScan,
        id: 'YamlScan',
      },
      {
        title: translations.K8sApiAudit,
        label: translations.K8sApiAudit,
        className: 'PlatformAPI',
        key: Routes.PlatformAPI,
        id: 'PlatformAPI',
      },
      {
        title: translations.sidebar_kubeMonitor,
        label: translations.sidebar_kubeMonitor,
        className: 'kubeMonitor',
        key: Routes.kubeMonitor,
        id: 'kubeMonitor',
      },
      {
        title: translations.sidebar_kubeScan,
        label: translations.sidebar_kubeScan,
        className: 'KubeScanner',
        key: Routes.KuberScanner,
        id: 'KuberScanner',
      },
    ],
  },
  {
    title: translations.sidebar_settings,
    label: translations.sidebar_settings,
    className: 'settings',
    icon: 'icon-shezhi',
    id: 'Settings_box',
    key: 'Settings_box',
    children: [
      {
        title: translations.componentMonitoring,
        label: translations.componentMonitoring,
        className: 'component-monitoring',
        key: Routes.ComponentMonitoring,
        id: 'ComponentMonitoring',
      },

      {
        title: translations.event_notifications,
        label: translations.event_notifications,
        className: 'notification-management',
        key: Routes.NotificationManagement,
        id: 'NotificationManagement',
      },
      {
        title: translations.dataManagement,
        label: translations.dataManagement,
        className: 'dataManagement',
        key: Routes.DataManagement,
        id: 'DataManagement',
      },
      {
        title: translations.account,
        label: translations.account,
        className: 'superAdmin',
        key: Routes.SuperAdmin,
        id: 'SuperAdmin',
      },
      {
        title: translations.sidebar_auditLog,
        label: translations.sidebar_auditLog,
        className: 'auditLog',
        key: Routes.AuditLog,
        id: 'AuditLog',
      },
      {
        title: translations.sidebar_clusterManage,
        label: translations.sidebar_clusterManage,
        className: 'clusters',
        key: Routes.MultiClusterManage,
        id: 'MultiClusterManage',
      },
      {
        title: translations.license_licenseActivat,
        label: translations.license_licenseActivat,
        className: 'licenseScreen',
        key: Routes.LicenseScreen,
        id: 'LicenseScreen',
      },
      {
        title: translations.systemUpgrade,
        label: translations.systemUpgrade,
        className: 'dashboard superAdmin',
        key: Routes.SystemUpgrade,
        id: 'SystemUpgrade',
      },
      {
        title: translations.openAPI,
        label: translations.openAPI,
        className: 'openAPI',
        key: Routes.OpenAPI,
        id: 'OpenAPI',
      },
    ],
  },
];

let menuList = () => {
  let re = (data: any, node: any) => {
    if (data.length === 0) return;
    for (let i = 0; i < data.length; i++) {
      let item = data[i];
      if (item.id === node) {
        data.splice(i, 1);
        return;
      } else if (item['children']) {
        re(item['children'], node);
      }
    }
  };
  while (RejectSideBar.length) {
    let node = RejectSideBar.pop();
    re(menuDataDefault, node);
  }
  let res = (list: any) => {
    for (let o of list || []) {
      o['icon'] = React.createElement('span', {
        className: `iconfont ${o.icon}`,
      });
      res(o.children);
    }
  };
  res(menuDataDefault);
  return menuDataDefault;
};
let menuData = menuList();
export default menuData;
