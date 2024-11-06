import { TSeverity } from '../../../definitions';
export type WhiteColumn = {
  vulnID?: string;
  pkgName?: string;
  pkgVersion?: string;
};
export type TSecurityPolicy = {
  createdAt?: number;
  updatedAt?: number;
  creator?: string;
  id?: number;
  isDefault?: boolean;
  updater?: string;
  policyType: 'regImage' | 'nodeImage' | 'deploy';
  malware?: {
    enable?: boolean;
    action?: string;
    white?: string[];
  };
  vuln?: {
    ignoreUnfixed?: boolean;
    ignoreKernelVuln?: boolean;
    ignoreLangVuln?: boolean;
    enable?: boolean;
    action?: string;
    severity?: TSeverity;
    black?: WhiteColumn[];
    white?: WhiteColumn[];
  };
  license?: {
    action?: string;
    black?: string[];
    enable?: boolean;
  };
  rootBootEnable?: boolean;
  name?: string;
  webshell?: {
    enable?: boolean;
    action?: string;
    riskLevel?: string[];
    white?: string[];
  };
  pkg?: {
    enable?: boolean;
    action?: string;
    black?: [
      {
        name: string;
        installVersion: string;
      },
    ];
  };
  env?: {
    enable?: boolean;
    action?: string;
    checkPassword?: boolean;
    black?: string[];
  };
  comment?: string;
  scope?: {
    scopeType?: string;
    imageFromType?: string;
    imageRegexp?: string[];
    clusterKey?: string[];
    allCluster?: boolean;
    allReg?: boolean;
    regIds?: string[];
    regName?: string[];
  };
  sensitive?: {
    allWhite?: boolean;
    allBlack?: boolean;
    enable?: boolean;
    action?: string;
    white?: string[];
    black?: string[];
  };
};
