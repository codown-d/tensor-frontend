import { translations } from "../../translations/translations";

export const categoryTypeList = [
  {
    zh: translations.defensive_escape,
    en: 'Defense Evasion',
    children: [
      {
        en: 'Connect from Proxy server',
        zh: '连接到代理服务器',
      },
      {
        en: 'General Defense Evasion',
        zh: '一般防御逃逸',
      },
    ],
  },
  {
    zh: translations.permission_promotion,
    en: 'Privilege Escalation',
    children: [
      {
        en: 'Cluser-admin binding',
        zh: 'Cluser-admin 绑定',
      },
      {
        en: 'Privileged container',
        zh: '特权容器',
      },
      {
        en: 'hostPath mount',
        zh: '主机路径挂载',
      },
    ],
  },
  {
    zh: translations.lateral_movement,
    en: 'Lateral Movement',
    children: [
      {
        en: 'ARP poisoning and IP spoofing',
        zh: 'ARP中毒和IP欺骗',
      },
      {
        en: 'CoreDNS poisoning',
        zh: '核心DNS投毒',
      },
    ],
  },
  {
    zh: '信息发现',
    en: 'Discovery',
    children: [
      {
        en: 'Access Kubelet API',
        zh: '访问Kubelet API',
      },
      {
        en: 'Access Kubernetes Dashboard',
        zh: '访问 Kubernetes Dashboard',
      },
      {
        en: 'Access the K8S API Server',
        zh: '访问K8S API服务器',
      },
      {
        en: 'Instance Metadata API',
        zh: '实例元数据API',
      },
    ],
  },
  {
    zh: '初始化访问',
    en: 'Initial Access',
    children: [
      {
        en: 'Exposed sensitive interfaces',
        zh: '暴露敏感接口',
      },
      {
        en: 'General Sensitive Information',
        zh: '一般敏感信息',
      },
    ],
  },
  {
    zh: '授权访问',
    en: 'Credential Access',
    children: [
      {
        en: 'Access container service account',
        zh: '访问容器的service账户',
      },
      {
        en: 'List K8S secrets',
        zh: '列出 K8S secrets',
      },
      {
        en: 'Mount service principal',
        zh: '挂载主要服务',
      },
    ],
  },
  {
    zh: 'CVE',
    en: 'CVE',
    children: [
      {
        en: 'Denial Of Service (CVE)',
        zh: '拒绝服务(CVE)',
      },
      {
        en: 'Privilege Escalation (CVE)',
        zh: '权限提升(CVE)',
      },
      { en: 'Remote Code Execution (CVE)', zh: '远程代码执行(CVE)' },
    ],
  },
  {
    zh: '影响',
    en: 'Impact',
    children: [
      {
        en: 'Data Destruction',
        zh: '数据破坏',
      },
    ],
  },
  {
    zh: '执行',
    en: 'Execution',
    children: [
      {
        en: 'Exec into container',
        zh: '容器内执行',
      },
      {
        en: 'New container',
        zh: '新容器',
      },
      {
        en: 'Sidecar injection',
        zh: 'Sidecar 注入',
      },
    ],
  },
  {
    zh: '持久化',
    en: 'Persistence',
    children: [
      {
        en: 'General Peristence',
        zh: '一般持久化',
      },
    ],
  },
];

export const severityTypeList = [
  {
    zh: translations.severity_High,
    en: 'high',
  },
  {
    zh: translations.severity_Medium,
    en: 'medium',
  },
  {
    zh: translations.severity_Low,
    en: 'low',
  },
];

export const getSeverityNum = (items: any[]) => {
  let high = 0,
    medium = 0,
    low = 0;
  items.map((t) => {
    if (t.severity === 'high' || t.severity === translations.severity_High) {
      high++;
    }
    if (t.severity === 'medium' || t.severity === translations.severity_Medium) {
      medium++;
    }
    if (t.severity === 'low' || t.severity === translations.severity_Low) {
      low++;
    }
    return t;
  });
  return {
    high,
    medium,
    low,
  };
};
