import { Tag, TagProps } from 'antd';
import React, { useMemo } from 'react';
import { translations } from '../../translations/translations';
import './index.scss';
import { merge } from 'lodash';
import EllipsisPopover from '../../components/ellipsisPopover/ellipsisPopover';

export const TzTag = (props: TagProps) => {
  const realProps = useMemo(() => {
    return {
      ...props,
      closeIcon: <i className={'icon iconfont icon-lansexiaocuohao f16 ml6'} style={{ height: '16px' }}></i>,
      className: `tz-tag ${props.className || ''} ${
        props.children === translations.microseg_namespace_ban ||
        props.children === translations.deactivate ||
        props.children === translations.deflectDefense_disabled
          ? 'ant-tag-gray'
          : ''
      }`,
      color: props.color || 'default',
    };
  }, [props]);
  return props.children ? <Tag {...realProps} /> : null;
};

export const policyActionEnum: any = {
  running: {
    title: translations.running,
    style: {
      color: 'rgba(33, 119, 209, 1)',
      background: 'rgba(33, 119, 209, 0.05)',
    },
  },
  created: {
    title: translations.clusterGraphList_containerInfo_status_created,
    style: {
      color: 'rgba(82, 196, 26, 1)',
      background: 'rgba(82, 196, 26, 0.05)',
    },
  },
  restarting: {
    title: translations.clusterGraphList_containerInfo_status_restarting,
    style: {
      color: 'rgba(255, 196, 35, 1)',
      background: 'rgba(255, 196, 35, 0.05)',
    },
  },
  removing: {
    title: translations.clusterGraphList_containerInfo_status_removing,
    style: {
      color: 'rgba(233, 84, 84, 1)',
      background: 'rgba(233, 84, 84, 0.05)',
    },
  },
  paused: {
    title: translations.clusterGraphList_containerInfo_status_paused,
    style: {
      color: 'rgba(255, 138, 52, 1)',
      background: 'rgba(255, 138, 52, 0.05)',
    },
  },

  exited: {
    title: translations.clusterGraphList_containerInfo_status_exited,
    style: {
      color: 'rgba(152, 166, 190, 1)',
      background: 'rgba(152, 166, 190, 0.05)',
    },
  },
  dead: {
    title: translations.clusterGraphList_containerInfo_status_dead,
    style: {
      color: 'rgba(152, 166, 190, 1)',
      background: 'rgba(152, 166, 190, 0.05)',
    },
  },
  alert: {
    title: translations.imageReject_reject_type_alarm,
    style: {
      color: 'rgba(255, 196, 35, 1)',
      background: 'rgba(255, 196, 35, 0.1000)',
    },
  },
  alarm: {
    title: translations.imageReject_reject_type_alarm,
    style: {
      color: 'rgba(255, 196, 35, 1)',
      background: 'rgba(255, 196, 35, 0.1000)',
    },
  },
  reject: {
    title: translations.deflectDefense_blockUp,
    style: {
      color: 'rgba(233, 84, 84, 1)',
      background: 'rgba(233, 84, 84, 0.1000)',
    },
  },
  block: {
    title: translations.deflectDefense_blockUp,
    style: {
      color: 'rgba(233, 84, 84, 1)',
      background: 'rgba(233, 84, 84, 0.1000)',
    },
  },
  ignore: {
    title: translations.imageReject_reject_type_ignore,
    style: {
      color: '#fff',
      background: '#2177d1',
    },
  },
  policyblock: {
    title: translations.imageReject_reject_type_reject,
    style: {
      color: 'rgba(233,84,84,1)',
      background: 'rgba(233,84,84,0.1)',
    },
  },
  policyalert: {
    title: translations.imageReject_reject_type_alarm,
    style: {
      color: 'rgba(255, 196, 35, 1)',
      background: 'rgba(255, 196, 35, 0.1)',
    },
  },
  pass: {
    title: translations.compliances_breakdown_numSuccessful,
    style: {
      color: 'rgba(82, 196, 26, 1)',
      background: 'rgba(82, 196, 26, 0.1)',
    },
  },
  normal: {
    title: translations.superAdmin_normal,
    style: {
      color: 'rgba(82, 196, 26, 1)',
      background: 'rgba(82, 196, 26, 0.1)',
    },
  },
  abnormal: {
    title: translations.abnormal,
    style: {
      color: 'rgba(255,138,52, 1)',
      background: 'rgba(255,138,52, 0.1)',
    },
  },
  normalpass: {
    title: translations.white_list_passed,
    style: {
      color: 'rgba(82, 196, 26, 1)',
      background: 'rgba(82, 196, 26, 0.1)',
    },
  },
  reponormal: {
    title: translations.superAdmin_normal,
    style: {
      color: 'rgba(82, 196, 26, 1)',
      background: 'rgba(82, 196, 26, 0.1)',
    },
  },
  repoabnormal: {
    title: translations.abnormal,
    style: {
      color: 'rgba(233, 84, 84, 1)',
      background: 'rgba(233, 84, 84, 0.1)',
    },
  },
  true: {
    title: translations.confirm_modal_isopen,
  },

  false: {
    title: translations.confirm_modal_isclose,
    style: {
      color: 'rgba(142, 151, 163, 1)',
      background: 'rgba(142, 151, 163, 0.1)',
    },
  },
  closed: {
    title: translations.confirm_modal_close,
    style: {
      color: 'rgba(142, 151, 163, 1)',
      background: 'rgba(142, 151, 163, 0.1)',
    },
  },

  ready: {
    title: translations.deflectDefense_ready,
    style: {
      color: 'rgba(255, 196, 35, 1)',
      background: 'rgba(255, 196, 35, 0.1)',
    },
  },
  disable: {
    title: translations.deflectDefense_disabled,
    style: {
      color: 'rgba(142, 151, 163, 1)',
      background: 'rgba(142, 151, 163, 0.1)',
    },
  },
  not_disable: {
    title: translations.confirm_modal_isenable,
  },
  temp_open: {
    title: translations.deflectDefense_strat,
  },
  open: {
    title: translations.confirm_modal_isopen,
  },
  white: {
    title: translations.confirm_whitelist,
  },
  compliancepass: {
    title: translations.compliances_breakdown_numSuccessful,
    style: {
      color: 'rgba(82, 196, 26, 1)',
      background: 'rgba(82, 196, 26, 0.1)',
    },
  },
  complianceinfo: {
    title: translations.ignored,
    style: {
      color: 'rgba(152, 166, 190, 1)',
      background: 'rgba(152, 166, 190, 0.1)',
    },
  },
  compliancefail: {
    title: translations.compliances_breakdown_numFailed,
    style: {
      color: 'rgba(233, 84, 84, 1)',
      background: 'rgba(233, 84, 84, 0.1)',
    },
  },
  compliancewarn: {
    title: translations.compliances_policyDetails_Warn,
    style: {
      color: 'rgba(255, 138, 52, 1)',
      background: 'rgba(255, 138, 52, 0.1)',
    },
  },
  fail: {
    title: translations.compliances_historyColumns_numFailed,
    style: {
      color: 'rgba(233, 84, 84, 1)',
      background: 'rgba(233, 84, 84, 0.1)',
    },
  },
  finish: {
    title: translations.compliances_historyColumns_finishedAt,
    style: {
      color: 'rgba(33, 119, 209, 1)',
      background: 'rgba(33, 119, 209, 0.05)',
    },
  },

  offline: {
    title: translations.activeDefense_offline,
    style: {
      color: 'rgba(142, 151, 163, 1)',
      backgroundColor: 'rgba(142, 151, 163, 0.1)',
    },
  },
  online: {
    title: translations.activeDefense_online,
  },
  noready: {
    title: translations.clusterGraphList_noReady,
    style: {
      color: 'rgba(152, 166, 190, 1)',
      background: 'rgba(152, 166, 190, 0.05)',
    },
  },
  critical: {
    title: translations.notificationCenter_columns_Critical,
    style: {
      color: '#9E0000',
      backgroundColor: 'rgba(158, 0, 0, 0.1)',
    },
  },
  high: {
    title: translations.severity_High,
    style: {
      color: '#E95454',
      backgroundColor: 'rgba(233, 84, 84, 0.12)',
    },
  },
  medium: {
    title: translations.severity_Medium,
    style: {
      color: '#FF8A34',
      backgroundColor: 'rgba(255, 138, 52, 0.1)',
    },
  },
  low: {
    title: translations.severity_Low,
    style: {
      color: '#FFC423',
      backgroundColor: 'rgba(255, 196, 35, 0.1)',
    },
  },
  infotag: {
    title: '',
    style: {
      color: 'rgba(33,119,209,1)',
      backgroundColor: 'rgba(33,119,209,0.1)',
    },
  },
  safe: {
    title: translations.security,
    style: {
      color: 'rgba(82, 196, 26, 1)',
      background: 'rgba(82,196,26,0.1)',
    },
  },

  unsafe: {
    title: translations.risk,
    style: {
      color: 'rgba(233, 84, 84, 1)',
      background: 'rgba(233, 84, 84, 0.1)',
    },
  },

  // https://project.feishu.cn/tensorsecurity/issue/detail/3003892618
  //20240419 siyu飞书修改未知的颜色为灰色
  unknown: {
    title: translations.unknown,
    style: {
      color: 'rgba(127, 142, 168, 1)',
      background: 'rgba(127, 142, 168, 0.1)',
    },
  },
  maybe: {
    title: translations.suspected,
    style: {
      color: 'rgba(255, 196, 35, 1)',
      background: 'rgba(255,196,35,0.1)',
    },
  },

  certainly: {
    title: translations.pagination_sure,
    style: {
      color: 'rgba(233, 84, 84, 1)',
      background: 'rgba(233, 84, 84, 0.1)',
    },
  },
  inthreat: {
    title: translations.risk,
    style: {
      color: 'rgba(233, 84, 84, 1)',
      background: 'rgba(233, 84, 84, 0.1)',
    },
  },
  secure: {
    title: translations.security,
    style: {
      color: 'rgba(82, 196, 26, 1)',
      background: 'rgba(82, 196, 26, 0.1)',
    },
  },
  passthrough: {
    title: translations.transparent_transmission,
    style: {
      color: 'rgba(82,196,26,1)',
      background: 'rgba(82,196,26,0.1)',
    },
  },
  protect: {
    title: translations.intercept,
    style: {
      color: 'rgba(233,84,84,1)',
      background: 'rgba(233,84,84,0.1)',
    },
  },
  failed: {
    title: translations.failed,
    style: {
      color: 'rgba(233,84,84,1)',
      background: 'rgba(233,84,84,0.1)',
    },
  },
  pvavailable: {
    title: 'Available',
    style: {
      color: 'rgba(82,196,26,1)',
      background: 'rgba(82,196,26,0.1)',
    },
  },
  pvbound: {
    title: 'Bound',
    style: {
      color: 'rgba(33,119,209,1)',

      background: 'rgba(33,119,209,0.05)',
    },
  },

  pvfailed: {
    title: 'Failed',
    style: {
      color: 'rgba(233,84,84,1)',
      background: 'rgba(233,84,84,0.1)',
    },
  },
  pvpending: {
    title: 'Pending',
    style: {
      color: 'rgba(255,196,35,1)',

      background: 'rgba(255,196,35,0.1)',
    },
  },
  pvreleased: {
    title: 'Released',
    style: {
      color: 'rgba(142,151,163,1)',
      background: 'rgba(142,151,163,0.1)',
    },
  },
  pvcbound: {
    title: 'Bound',
    style: {
      color: 'rgba(33,119,209,1)',
      background: 'rgba(33,119,209,0.05)',
    },
  },
  pvcpending: {
    title: 'Pending',
    style: {
      color: 'rgba(255,196,35,1)',
      background: 'rgba(255,196,35,0.1)',
    },
  },

  pvclost: {
    title: 'Lost',
    style: {
      color: 'rgba(233,84,84,1)',
      background: 'rgba(233,84,84,0.1)',
    },
  },
  exception: {
    title: translations.abnormal,
    style: {
      color: 'rgba(255,138,52,1)',
      background: 'rgba(255,138,52,0.1)',
    },
  },
  not_yet_learned: {
    title: translations.not_yet_learned,
    style: {
      color: 'rgba(142, 151, 163, 1)',
      background: 'rgba(142, 151, 163, 0.1)',
    },
  },
  currently_learning: {
    title: translations.currently_learning,
    style: {
      color: 'rgba(255, 196, 35, 1)',
      background: 'rgba(255, 196, 35, 0.1)',
    },
  },
  not_effective: {
    title: translations.not_effective,
    style: {
      color: 'rgba(255, 138, 52, 1)',
      background: 'rgba(255, 138, 52, 0.1)',
    },
  },
  effective: {
    title: translations.effective,
    style: {
      color: '#2177d1',
      background: 'rgba(33, 119, 209, 0.05)',
    },
  },
  allow: {
    title: translations.microseg_segments_policy_action_resolve,
    style: {
      color: 'rgba(82, 196, 26, 1)',
      background: 'rgba(82, 196, 26, 0.05)',
    },
  },
  refuse: {
    title: translations.microseg_segments_policy_action_reject,
    style: {
      color: 'rgba(233, 84, 84, 1)',
      background: 'rgba(233, 84, 84, 0.05)',
    },
  },

  micrprotect: {
    title: translations.protection_mode,
    style: {
      color: 'rgba(233,84,84,1)',
      background: 'rgba(233,84,84,0.1)',
    },
  },

  micralert: {
    title: translations.simulation_mode,
    style: {
      color: 'rgba(255,196,35,1)',
      background: 'rgba(255,196,35,0.1)',
    },
  },
  micrlog: {
    title: translations.travel_pattern,
    style: {
      color: 'rgba(82,196,26,1)',
      background: 'rgba(82,196,26,0.1)',
    },
  },
  flowallow: {
    title: translations.microseg_segments_policy_action_resolve,
    style: {
      color: 'rgba(82,196,26,1)',
      background: 'rgba(82,196,26,0.1)',
    },
  },

  flowdeny: {
    title: translations.commonpro_Deny,
    style: {
      color: 'rgba(233,84,84,1)',
      background: 'rgba(233,84,84,0.1)',
    },
  },
  flowalert: {
    title: translations.imageReject_reject_type_alarm,
    style: {
      color: 'rgba(255,196,35,1)',
      background: 'rgba(255,196,35,0.1)',
    },
  },
  warning: {
    title: translations.warning,
    style: {
      color: 'rgba(255,196,35,1)',
      background: 'rgba(255,196,35,0.1)',
    },
  },
  protecting: {
    title: translations.protecting,
    style: {
      color: 'rgba(82, 196, 26, 1)',
      background: 'rgba(82, 196, 26, 0.05)',
    },
  },
};
type TzRenderTagProps = TagProps & {
  type: string;
  className?: string | undefined;
  title?: string | undefined;
};

export const RenderTag = (props: TzRenderTagProps) => {
  let { type, className = '', title = '', style, ...tagProps } = props;
  let key = (type + '').toLowerCase();
  if (!policyActionEnum[key]) {
    return <span>-</span>;
  }
  return (
    <TzTag className={`f14 ${className}`} key={key} style={merge(style, policyActionEnum[key].style)} {...tagProps}>
      <EllipsisPopover>{title || policyActionEnum[key].title}</EllipsisPopover>
    </TzTag>
  );
};
