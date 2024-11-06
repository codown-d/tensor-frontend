import React, { useEffect, useMemo, useRef, useState } from 'react';
import { TzTabs } from '../../components/tz-tabs';
import { translations } from '../../translations/translations';
import './AlertCenterScreen.scss';
import DisposalRecord from './DisposalRecord';
import PalaceEvent from './PalaceEvent';
import { TzTooltip } from '../../components/tz-tooltip';
import { TzTag } from '../../components/tz-tag';
import EllipsisPopover from '../../components/ellipsisPopover/ellipsisPopover';
import { copyText } from '../../helpers/until';
import { TzButton } from '../../components/tz-button';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Routes } from '../../Routes';
import EventData from './EventData';
import { Store } from '../../services/StoreService';
import { getDomWidth } from '../../services/ThrottleUtil';
import { keys, merge } from 'lodash';
import { optionTags } from './eventDataUtil';
import useNewSearchParams from '../../helpers/useNewSearchParams';
import { useMemoizedFn } from 'ahooks';
export const classNameTemp: any = {
  Critical: 'btn-critical',
  High: 'btn-high',
  Medium: 'btn-medium',
  Low: 'btn-low',
  Negligible: 'btn-negligible',
  None: 'btn-none',
  Undefined: 'btn-und',
};

// Sprint-4 统一修改枚举值: 高危->高，中危->中，低危->低
export const tampTit: any = {
  Critical: translations.notificationCenter_columns_Critical,
  High: translations.notificationCenter_columns_High,
  Medium: translations.notificationCenter_columns_Medium,
  Low: translations.notificationCenter_columns_Low,
  Negligible: translations.notificationCenter_columns_Negligible,
  None: translations.notificationCenter_columns_Unknown,
  Unknown: translations.onlineVulnerability_filters_unknownLevel,
  //Undefined: translations.notificationCenter_columns.Unknown
};
export function setTemp(num: number) {
  let severity = 'None';
  switch (Number(num)) {
    case 0:
      severity = 'High';
      break;
    case 1:
      severity = 'High';
      break;
    case 2:
      severity = 'High';
      break;
    case 3:
      severity = 'High';
      break;
    case 4:
      severity = 'Medium';
      break;
    case 5:
      severity = 'Medium';
      break;
    case 6:
      severity = 'Low';
      break;
    case 7:
      severity = 'Low';
      break;
    case 8:
      severity = 'None';
      break;
    case 9:
      severity = 'None';
      break;
    case 10:
      severity = 'None';
      break;
    default:
      severity = 'None';
  }
  return severity;
}

let newSeverityLevel: any = {
  '0': {
    title: translations.notificationCenter_columns_High,
    className: 'btn-high',
  },
  '1': {
    title: translations.notificationCenter_columns_High,
    className: 'btn-high',
  },
  '2': {
    title: translations.notificationCenter_columns_High,
    className: 'btn-high',
  },
  '3': {
    title: translations.notificationCenter_columns_High,
    className: 'btn-high',
  },
  '4': {
    title: translations.notificationCenter_columns_Medium,
    className: 'btn-medium',
  },
  '5': {
    title: translations.notificationCenter_columns_Medium,
    className: 'btn-medium',
  },
  '6': {
    title: translations.notificationCenter_columns_Low,
    className: 'btn-low',
  },
  '7': {
    title: translations.notificationCenter_columns_Low,
    className: 'btn-low',
  },
};
export const getSeverityTag = (severity: number, type?: 'small') => {
  let { title = translations.type_missing, className = '' } = newSeverityLevel[severity] || {};
  return (
    <>
      <span className={`t-c severity-span ${type || ''} ` + className}>{title}</span>
    </>
  );
};

export const TextHoverTd = (props: { text: string; style?: any; cls?: string; stopFn?: boolean; fn?: any }) => {
  const divDom = useRef<any>(null);
  const [wb, setWb] = useState<boolean>(false);
  const { style = { maxWidth: '100%' }, text, cls = 'hoverBtn dib ofh', stopFn = false } = props;
  useEffect(() => {
    if (divDom.current && text) {
      const wg = divDom.current?.offsetWidth;
      const wc = getDomWidth(text);
      setWb(() => {
        return wc > wg ? true : false;
      });
    }
  }, [divDom?.current, text]);
  return (
    <div
      ref={divDom}
      style={{ height: '28px' }}
      onClick={(event) => {
        if (stopFn) return;
        event.stopPropagation();
      }}
    >
      <div
        style={style}
        className={cls}
        onClick={(event) => {
          props?.fn && props?.fn(event);
        }}
      >
        {wb ? (
          <TzTooltip placement="topLeft" title={text}>
            {text}
          </TzTooltip>
        ) : (
          text
        )}
      </div>
    </div>
  );
};

export const TextHoverCopy = (props: {
  text: string;
  style?: React.CSSProperties;
  className?: string;
  children?: React.ReactNode;
  lineClamp?: number;
}) => {
  const { style = {}, text, className = '', lineClamp = 1 } = props;
  let [showTooltip, setShowTooltip] = useState(false);
  return props.text || props?.children ? (
    <div className={`flex-r text-hover-copy ${className}`} style={merge(style)}>
      <span
        className={'text-hover-copy-content'}
        style={{
          maxWidth: showTooltip ? 'calc(100%)' : '100%',
          display: 'flex',
          overflow: 'hidden',
          height: lineClamp === 1 ? '22px' : 'auto',
        }}
        onClick={(event) => {
          event.stopPropagation();
          copyText(text);
        }}
      >
        <EllipsisPopover lineClamp={lineClamp} title={text} onChange={setShowTooltip}>
          {props.children || text}
        </EllipsisPopover>
        <i className="icon iconfont icon-fuzhi mt4 ml4"></i>
      </span>
    </div>
  ) : (
    <span>-</span>
  );
};

export const TzTableTzTdInfo = (props: any) => {
  let { scopes, scope, description = '', severity, id, t, pstyle = {} } = props;
  let obj: any = {};
  [
    'cluster',
    'hostname',
    'namespace',
    'resource',
    'pod',
    'container',
    'registry',
    'repo',
    'tag',
    'nodename',
    'podname',
  ].forEach((item) => {
    // event - detail在用 如果没有scope,删除
    if (scope) {
      if (scope[item]) {
        obj[item] = scope[item];
      }
      return;
    }
    if (scopes[item]) {
      obj[item] = scopes[item];
    }
  });
  return (
    <div style={{ color: '#3e4653' }}>
      {description ? (
        <div className="flex-r tzTable-title" style={{ alignItems: 'center' }}>
          <span
            className={'mr8'}
            style={{
              maxWidth: '70%',
              fontSize: '16px',
              paddingRight: '4px',
              height: '22px',
              display: 'inline-block',
              boxSizing: 'border-box',
            }}
          >
            <EllipsisPopover>{description}</EllipsisPopover>
          </span>
          {getSeverityTag(severity, 'small')}
        </div>
      ) : null}
      <TextHoverCopy
        text={id}
        style={{
          color: '#6C7480',
          padding: `${t === 'detail' ? '4px 0px' : '8px 0px'}`,
          ...pstyle,
        }}
      />
      <div className="tzTable-tzTd">
        {keys(obj)
          .map((item: any, index) => {
            let len = obj[item].length;
            let name = obj[item]
              .map((item: { name: any }) => {
                return item.name;
              })
              .join(',');
            if (!len) return null;
            let fName = obj[item][0].name;
            let kind = obj[item][0].kind;
            let str = `${kind}：${fName} ${len > 1 ? `+${len - 1}` : ''}`;
            let tooltip = false;
            if ('pod' === item || 'hostname' === item) {
              if (fName.length > 20) {
                str = `${kind}：${fName.substr(0, 12)}...${fName.substr(-8)} ${len > 1 ? `+${len - 1}` : ''}`;
                tooltip = true;
              } else {
                str = `${kind}：${fName} ${len > 1 ? `+${len - 1}` : ''}`;
              }
            } else if (fName.length > 12) {
              str = `${kind}：${fName.substr(0, 12)}... ${len > 1 ? `+${len - 1}` : ''}`;
              tooltip = true;
            }
            return (
              <span className={'mb4 mr4'} key={index}>
                {tooltip ? (
                  <TzTooltip placement="topLeft" title={name}>
                    <TzTag className="small" style={{ display: 'inline-flex' }}>
                      {str}
                    </TzTag>
                  </TzTooltip>
                ) : (
                  <TzTag className="small" style={{ display: 'inline-flex' }}>
                    {str}
                  </TzTag>
                )}
              </span>
            );
          })
          .pushEvery((index: React.Key | null | undefined) => (
            <span className={'mb4'} key={index}>
              {'>'}
            </span>
          ))}
      </div>
    </div>
  );
};
export const TzTableTzTdType = (props: any) => {
  let { type = '', ruleKeys = props['ruleKeys'] || [props['ruleKey']] || [] } = props;
  return (
    <div>
      {type ? (
        <div style={{ color: '#3E4653' }} className="number">
          <EllipsisPopover>{type}</EllipsisPopover>
        </div>
      ) : null}
      <div style={{ color: '#6C7480' }}>
        <EllipsisPopover>{ruleKeys.map((item: { category: any }) => item.category).join(' ，')}</EllipsisPopover>{' '}
      </div>
    </div>
  );
};
export const TzTableTzTdWarn = (props: {
  signalsCount: any;
  cn?: string | undefined;
  icon?: JSX.Element | undefined;
}) => {
  let { signalsCount, cn = 'td-warn', icon = <></> } = props;
  return (
    <>
      {Object.keys(signalsCount).length
        ? Object.keys(signalsCount).map((item: any, index) => {
            let { className = '', title = translations.type_missing } = newSeverityLevel[item] || {};
            let newClassName = `${cn} ${className}`;
            return (
              <TzTooltip title={`${newSeverityLevel[item]?.title} : ${signalsCount[item]}`} key={index}>
                <span
                  className={`t-c severity-span mt2 mb2 ${newClassName}`}
                  style={{ marginRight: '8px', fontWeight: 600 }}
                >
                  {icon}
                  {signalsCount[item]}
                </span>
              </TzTooltip>
            );
          })
        : '-'}
    </>
  );
};
export const TzTableTzTdRules = (props: any) => {
  let { tags } = props;
  let textArr = optionTags
    .filter((item: { value: any }) => {
      return tags.includes(item.value);
    })
    .map((item) => item.label);
  if (!textArr.length) {
    return <>-</>;
  }
  return (
    <div style={{ overflow: 'hidden', display: 'flex' }} className={''}>
      {textArr.map((item: any, index) => {
        return (
          <TzTag style={{ maxWidth: '100%' }} key={index}>
            <EllipsisPopover style={{ height: 22 }}>{item}</EllipsisPopover>
          </TzTag>
        );
      })}
    </div>
  );
};
const AlertCenterScreen = (props: any) => {
  const {
    allSearchParams: { tab: tabKey = 'palace' },
  } = useNewSearchParams();
  let navigate = useNavigate();
  const l = useLocation();
  const [_, setURLSearchParams] = useSearchParams();
  let dom = useMemo(() => {
    if (tabKey === 'palace') {
      return <EventData tabKey={tabKey} />;
    } else if (tabKey === 'association') {
      return <DisposalRecord tabKey={tabKey} />;
    } else {
      return <PalaceEvent tabKey={tabKey} />;
    }
  }, [tabKey.trim()]);
  let items = [
    {
      label: translations.notificationCenter_columns_message,
      key: 'palace',
      children: null,
    },
    {
      label: translations.disposal_of_work_order,
      key: 'association',
      children: null,
    },
    { label: translations.alarm_log, key: 'flowcenter', children: null },
  ];
  let setHeader = useMemoizedFn(() => {
    Store.header.next({
      title: translations.alertCenter,
      extra: (
        <TzButton
          className="df dfac"
          icon={<i className="icon iconfont icon-jingxiangsaomiao-peizhi f16"></i>}
          onClick={() => {
            navigate(Routes.PalaceEventSeting);
          }}
        >
          {translations.calico_cluster_title}
        </TzButton>
      ),
      footer: (
        <TzTabs
          activeKey={tabKey || 'palace'}
          onChange={(val: any) => {
            setURLSearchParams({ tab: val });
            Store.pageFooter.next(null);
            Store.eventsCenter.next({ anchor: 0 });
          }}
          items={items}
        />
      ),
    });
  });
  useEffect(setHeader, [tabKey, l]);
  return (
    <div className="events-center">
      <div style={{ background: '#fff' }}>{dom}</div>
    </div>
  );
};

export default AlertCenterScreen;
