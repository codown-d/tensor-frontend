import { useState } from 'react';
import {
  SingleValueType,
  TreeNode,
  TzCascaderProps,
  ValueType,
} from '../../components/ComponentsLibrary/TzCascader/interface';
import { translations } from '../../translations/translations';

export type TSuggestName =
  | 'cluster'
  | 'container'
  | 'namespace'
  | 'pod'
  | 'resource'
  | 'registry'
  | 'repo'
  | 'tag'
  | 'hostname';

export type TSelectType = {
  value: TSuggestName;
  label: string;
  icon: string;
};

export const markOptions = [
  {
    label: translations.unprocessed,
    value: 0,
  },
  {
    label: translations.processed,
    value: 1,
  },
  {
    label: translations.ignored,
    value: 2,
  },
  {
    label: translations.processed_later,
    value: 3,
  },
];

export const optionsKind = [
  {
    value: 'ruleScope',
    label: translations.rule_association,
  },
];

export const optionsSeverity = [
  {
    value: '0,1,2,3',
    label: translations.notificationCenter_columns_High,
  },
  {
    value: '4,5',
    label: translations.notificationCenter_columns_Medium,
  },
  {
    value: '6,7',
    label: translations.notificationCenter_columns_Low,
  },
];

export const optionTags = [
  {
    value: 'Credential_Access',
    label: translations.voucher_acquisition,
    severity: 4,
  },
  {
    value: 'Defense_Evasion',
    label: translations.detection_avoidance,
    severity: 4,
  },
  {
    value: 'Discovery',
    label: translations.intranet_information_detection,
    severity: 4,
  },
  {
    value: 'Execution',
    label: translations.command_execution,
    severity: 1,
  },
  {
    value: 'Exfiltration',
    label: translations.data_leakage,
    severity: 1,
  },
  {
    value: 'Lateral_Movement',
    label: translations.lateral_movement,
    severity: 5,
  },
  {
    value: 'Persistence',
    label: translations.rear_door_maintenance,
    severity: 4,
  },
  {
    value: 'Privilege_Escalation',
    label: translations.permission_promotion,
    severity: 5,
  },
];

export const selectType: TSelectType[] = [
  {
    value: 'cluster',
    label: translations.compliances_cronjobs_selectCluster,
    icon: 'icon-jiqun',
  },

  {
    value: 'container',
    label: translations.commonpro_Container,
    icon: 'icon-Dockerjingxiang',
  },

  {
    value: 'namespace',
    label: translations.scanner_listColumns_namespace,
    icon: 'icon-mingmingkongjian',
  },
  {
    value: 'pod',
    label: 'pod',
    icon: 'icon-pod',
  },
  {
    value: 'resource',
    label: translations.resources,
    icon: 'icon-ziyuan',
  },
  //   {
  //     value: 'registry',
  //     label: translations.library,
  //     icon: 'icon-cangku',
  //   },
  //   {
  //     value: 'repo',
  //     label: translations.image,
  //     icon: 'icon-jingxiang',
  //   },
  //   {
  //     value: 'tag',
  //     label: translations.image_tag,
  //     icon: 'icon-jingxiangtag',
  //   },
  {
    value: 'hostname',
    label: translations.host_name,
    icon: 'icon-jiedian',
  },
];
export const optionTagsFilters = optionTags.map((item: any) => {
  item['text'] = item['label'];
  return item;
});
export const severityFilters = optionsSeverity.map((item: any) => {
  item['text'] = item['label'];
  return item;
});

export const operations = [
  {
    label: translations.podIsolation,
    value: 'PodIsolation',
  },
  {
    label: translations.podDeletion,
    value: 'PodDeletion',
  },
];
export const severityType: any = ['High', 'High', 'High', 'High', 'Medium', 'Medium', 'Low', 'Low'];

export const timeTabBar = [
  {
    tab: translations.hours_24,
    tabKey: '24',
  },
  {
    tab: translations.days_7,
    tabKey: '7',
  },
  {
    tab: translations.days_30,
    tabKey: '30',
  },
];

export const getCascaderLabels = (options: TreeNode[], values: SingleValueType[]) => {
  function val2Label(val: ValueType, opt: TzCascaderProps['options']): TreeNode | undefined {
    return (val && opt?.length ? opt.find((v) => v.value === val) : val) as TreeNode | undefined;
  }
  return values
    ?.map((vals: SingleValueType) => {
      const st1 = val2Label(vals[0], options);
      const st2 = val2Label(vals[1], st1?.children);
      return [st1?.label, st2?.label].filter((v) => !!v).join(' / ');
    })
    .filter((v) => !!v)
    .join(' , ');
};
export const useOpenModal = () => {
  return useState(false);
};
