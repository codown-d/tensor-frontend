import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import classNames from 'classnames';
import { TzTooltip } from '../../../components/tz-tooltip';
import { TzTag } from '../../../components/tz-tag';
import './OnlineVulnerabilitiesDrawer.scss';
import { tampTit } from '../../AlertCenter/AlertCenterScreen';
import { tap } from 'rxjs/operators';
import { eventStats, getRiskImagesInfo, getRiskImagesListInfo } from '../../../services/DataService';
import { Store } from '../../../services/StoreService';
import { WebResponse } from '../../../definitions';
import { Routes } from '../../../Routes';
import moment from 'moment';
import { isNumber, keys } from 'lodash';
import { translations } from '../../../translations/translations';
import { useNavigate } from 'react-router-dom';
import { questionEnum, questionIcon } from '../../ImagesScanner/components/ImagesScannerDataList';
import { useNavigatereFresh } from '../../../helpers/useNavigatereFresh';
import { useJumpResourceFn } from '../../../screens/MultiClusterRiskExplorer/components';

interface IProps {
  children?: any;
  history?: any;
  data?: any;
  setNodeFn?: (data: any) => void;
}

export const chartTagStyle: any = {
  Deployment: {
    title: 'Deployment',
    style: {
      color: '#6C7480',
      backgroundColor: 'rgba(33, 119, 209, 0.05)',
    },
  },
};

const severityStyle: any = {
  Critical: {
    icon: {
      background: '#9E0000',
    },
    style: {
      background: 'rgba(158, 0, 0, 0.1)',
      color: '#9E0000',
    },
  },
  High: {
    icon: {
      background: '#E95454',
    },
    style: {
      background: 'rgba(233, 84, 84, 0.1)',
      color: '#E95454',
    },
  },
  Medium: {
    icon: {
      background: '#FF986B',
    },
    style: {
      background: 'rgba(255, 152, 107, 0.1)',
      color: '#FF986B',
    },
  },
  Low: {
    icon: {
      background: '#FFC423',
    },
    style: {
      background: 'rgba(255, 196, 35, 0.1)',
      color: '#FFC423',
    },
  },
  Negligible: {
    icon: {
      background: '#7F8EA8',
    },
    style: {
      background: 'rgba(127, 142, 168, 0.1)',
      color: '#7F8EA8',
    },
  },
  None: {
    icon: {
      background: '#7F8EA8',
    },
    style: {
      background: 'rgba(127, 142, 168, 0.1)',
      color: '#7F8EA8',
    },
  },
};

const riskSeverityToEvent: any = {
  CRITICAL: 'Critical',
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
  UNKNOWN: 'Negligible',
};

const eventToSeverity: any = {
  0: 'High',
  1: 'High',
  2: 'High',
  3: 'High',
  4: 'Medium',
  5: 'Medium',
  6: 'Low',
  7: 'Low',
  8: 'Low',
  9: 'Low',
  10: 'Low',
};

const severityToEvent: any = {
  Critical: '0,1,2,3',
  High: '0,1,2,3',
  Medium: '4,5',
  Low: '6,7',
  Negligible: '6,7',
};

const serverAlertKind: any = {
  'ATT&CK': 'ATT&CK',
  主动防御: 'Watson',
  RuntimeDetection: 'vulnerabilityExploitAttack',
  ExploitRisk: 'reverseShellAttack',
  DriftPrevention: 'immune',
  偏移防御: 'DriftPrevention',
  系统调用异常: 'seccompProfile',
  镜像安全: 'imageSecurity',
  集群风险监控: 'kubeMonitor',
  文件访问控制: 'apparmor',
  Watson: 'Watson',
  driftPrevention: 'DriftPrevention',
  seccompProfile: 'seccompProfile',
  imageSecurity: 'imageSecurity',
  kubeMonitor: 'kubeMonitor',
  apparmor: 'apparmor',
};

const riskScoreColor = (t: any) => {
  if (!isNumber(t)) return {};
  if (t >= 0 && t <= 60) {
    return {
      color: '#E95454',
    };
  }
  if (t > 60 && t <= 80) {
    return {
      color: '#FF8A34',
    };
  }
  if (t > 80 && t <= 95) {
    return {
      color: '#FFC423',
    };
  }
  if (t > 95 && t <= 100) {
    return {
      color: '#52C41A',
    };
  }
};

const linkTabImageDetail: any = ['leak', 'virus', 'sensitive', 'webshell'];

const OnlineVulnerabilitiesDrawer = (props: IProps, ref?: any) => {
  const { data } = props;

  const orData = useMemo(() => {
    return data?.original ? data?.original : {};
  }, [data?.original]);

  const [mark, setMark] = useState<boolean>(false);
  const [animationMark, setAnimationMark] = useState<boolean>(false);
  const [imagesUUid, setImagesUUid] = useState<any>([]);
  const [riskImages, setRiskImages] = useState<any>([]);
  const [riskEvent, setRiskEvent] = useState<any>(null);
  const navigate = useNavigate();

  const eventStatsFn = useCallback(() => {
    if (!orData?.resourceName) {
      return;
    }
    const data = {
      query: {
        scope: {
          cluster: [Store.clusterID.value],
          namespace: [orData.namespace],
          resource: [`${orData.resourceName}(${orData.resourceKind})`],
        },
        updatedAt: {
          start: moment().add(-7, 'd').valueOf(),
          end: moment().valueOf(),
        },
      },
      statsType: 'riskEvent',
    };
    eventStats(data)
      .pipe(
        tap((res: WebResponse<any>) => {
          const item = res.getItem();
          setRiskEvent(item);
        }),
      )
      .subscribe();
  }, [orData]);

  const fetchImagesUUid = useCallback(() => {
    if (!orData?.resourceName) {
      return;
    }
    const { resourceName, resourceKind, namespace } = orData;
    const data = {
      resourceKind,
      resourceName,
      cluster_key: Store.clusterID.value,
      namespace,
    };
    getRiskImagesListInfo(data)
      .pipe(
        tap((res: WebResponse<any>) => {
          const items = res.getItems();
          let itemsObj: any = {};
          const uuids = items.map((t) => {
            itemsObj[t.uuid] || (itemsObj[t.uuid] = t.name);
            return t.uuid;
          });
          setImagesUUid(uuids);
        }),
      )
      .subscribe();
  }, [orData]);

  useEffect(() => {
    eventStatsFn();
    fetchImagesUUid();
  }, [eventStatsFn, fetchImagesUUid, orData]);

  useEffect(() => {
    if (!imagesUUid || !imagesUUid.length) {
      setRiskImages([]);
      return;
    }
    const data = {
      uuids: imagesUUid,
    };
    getRiskImagesInfo(data)
      .pipe(
        tap((res: WebResponse<any>) => {
          const items = res.getItems();
          setRiskImages(items);
        }),
      )
      .subscribe();
  }, [imagesUUid]);

  const cls = useMemo(() => {
    const t = mark && data ? 300 : 0;
    setTimeout(() => {
      setAnimationMark(() => (mark && data ? true : false));
    }, t);
    return mark && data ? 'show' : 'close';
  }, [mark, data]);

  const closeFn = useCallback(
    (m) => {
      if (!m) {
        props.setNodeFn && props.setNodeFn(undefined);
      }
      setMark(m);
    },
    [props.setNodeFn],
  );
  // const { refreshScope } = useAliveController();

  let { jump } = useNavigatereFresh();
  const severityTagsDom = useCallback((severityOverview, id, imageFromType) => {
    const obj: any = { Critical: 0, High: 0, Medium: 0, Low: 0, Negligible: 0 };
    severityOverview.map((s: any) => {
      obj[riskSeverityToEvent[s.severity]] = s.count;
      return s;
    });
    return (
      <div className="df dfac dfw">
        {Object.keys(obj).map((k) => {
          if (!obj[k]) return null;
          return (
            <TzTooltip title={`${tampTit[k]} : ${obj[k]}`}>
              <span
                className={'tag-severity dfc'}
                style={{
                  marginRight: '8px',
                  marginTop: '8px',
                  ...severityStyle[k].style,
                }}
              >
                <i className="icon-round" style={{ ...severityStyle[k].icon }}></i>
                {obj[k]}
              </span>
            </TzTooltip>
          );
        })}
      </div>
    );
  }, []);

  const questIconDom = useCallback((item, id, imageFromType) => {
    const obj: any = {
      [questionEnum.exceptionMalware]: item[questionEnum.exceptionMalware] || 0,
      [questionEnum.exceptionSensitive]: item[questionEnum.exceptionSensitive] || 0,
      [questionEnum.exceptionWebshell]: item[questionEnum.exceptionWebshell] || 0,
    };
    return keys(obj).map((k) => {
      let f = Boolean(obj[k]);
      let { title, icon } = questionIcon[k];
      return (
        <div
          className={classNames('df dfac quest-group', {
            'sel-color': f,
          })}
          style={{ flex: 1 }}
          onClick={(e) => {
            e.stopPropagation();
            Store.imagesCILifeCycleTag.next(k);
            jump(
              `${Routes.RegistryImagesDetailInfo}?imageUniqueID=${id}&imageFromType=${imageFromType}`,
              'RegistryImagesDetailInfo',
            );
          }}
        >
          <TzTooltip title={title}>
            <i title={title} className={'iconfont f20 mr8 ' + icon}></i>
          </TzTooltip>
          <span className={classNames({ 'color-val': f })}>{obj[k]}</span>
        </div>
      );
    });
  }, []);

  const RiskInfo = useMemo(() => {
    return riskImages.map((k: any) => {
      let { imageUniqueID, fullRepoName, riskScore, imageFromType } = k.imageBaseResponse;
      return (
        <div className="images-info-group interact">
          <div
            className="df dfac dfjb"
            onClick={() => {
              jump(
                `${Routes.RegistryImagesDetailInfo}?imageUniqueID=${imageUniqueID}&imageFromType=${imageFromType}`,
                'RegistryImagesDetailInfo',
              );
            }}
          >
            <span className="name-txt-link">{fullRepoName}</span>
            <span className="score-group" style={riskScoreColor(riskScore)}>
              <span className="score-txt">{riskScore} </span>
              {translations.imageReject_score}
            </span>
          </div>
          <div
            className="df w100p mt4"
            onClick={() => {
              Store.imagesCILifeCycleTag.next('exceptionVuln');
              jump(
                `${Routes.RegistryImagesDetailInfo}?imageUniqueID=${imageUniqueID}&imageFromType=${imageFromType}`,
                'RegistryImagesDetailInfo',
              );
            }}
          >
            <TzTooltip title={questionIcon[questionEnum.exceptionVuln].title}>
              <i
                title={questionIcon[questionEnum.exceptionVuln].title}
                className={`iconfont ${questionIcon[questionEnum.exceptionVuln].icon} f20 mr8 mt8 cVuln df dfac`}
                style={{
                  color: !!k.severityOverview?.length ? '#6c7480' : '#b3bac6',
                }}
              ></i>
            </TzTooltip>
            {severityTagsDom(k.severityOverview, imageUniqueID, imageFromType)}
          </div>
          <div className="df mt12 w100p btmCase">{questIconDom(k.issue.total, imageUniqueID, imageFromType)}</div>
        </div>
      );
    });
  }, [riskImages, severityTagsDom, questIconDom]);

  const eventTypeTagsDom = useCallback(
    (obj) => {
      return (
        <>
          {Object.keys(obj).map((k) => {
            return (
              <TzTooltip title={`${k} : ${obj[k]}`}>
                <span
                  className={'tag-severity dfc mt8'}
                  onClick={(e) => {
                    e.stopPropagation();
                    let name = Store.clusterItem.value?.name;
                    if (name) {
                      // refreshScope('NotificationCenter');
                      navigate(
                        `${Routes.NotificationCenter}?tab=palace&cluster=${name}_${Store.clusterID.value}&namespace=${orData?.namespace}&resource=${orData?.resourceName}(${orData?.resourceKind})&ruleKey=${serverAlertKind[k]}`,
                      );
                      // window.open(
                      //   `${window.GLOBAL_WINDOW.location.origin}/#${
                      //     Routes.NotificationCenter
                      //   }?tab=palace&cluster=${Store.clusterID.value + '_' + name}&namespace=${
                      //     orData?.namespace
                      //   }&resource=${orData?.resourceName}(${orData?.resourceKind})&ruleKey=${
                      //     serverAlertKind[k]
                      //   }`,
                      //   '_blank',
                      // );
                    }
                  }}
                  style={{
                    marginRight: '8px',
                    fontWeight: '400',
                    color: '#2177D1',
                    background: 'rgba(33, 119, 209, 0.05)',
                  }}
                >
                  <i className="icon-round" style={{ background: '#2177D1' }}></i>
                  {k} {obj[k]}
                </span>
              </TzTooltip>
            );
          })}
        </>
      );
    },
    [orData],
  );

  const severityTagsEventDom = useCallback(
    (obj) => {
      return (
        <>
          {Object.keys(obj).map((k) => {
            if (!obj[k]) return null;
            return (
              <TzTooltip title={`${tampTit[k]} : ${obj[k]}`}>
                <span
                  className={'tag-severity dfc'}
                  style={{
                    marginRight: '8px',
                    ...severityStyle[k].style,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    let name = Store.clusterItem.value?.name;
                    if (name) {
                      // refreshScope('NotificationCenter');
                      navigate(
                        `${Routes.NotificationCenter}?tab=palace&cluster=${name}_${Store.clusterID.value}&namespace=${orData?.namespace}&resource=${orData?.resourceName}(${orData?.resourceKind})&severity=${severityToEvent[k]}`,
                      );
                      // window.open(
                      //   `${window.GLOBAL_WINDOW.location.origin}/#${
                      //     Routes.NotificationCenter
                      //   }?tab=palace&cluster=${Store.clusterID.value + '_' + name}&namespace=${
                      //     orData?.namespace
                      //   }&resource=${orData?.resourceName}(${orData?.resourceKind})&severity=${
                      //     severityToEvent[k]
                      //   }`,
                      //   '_blank',
                      // );
                    }
                  }}
                >
                  <i className="icon-round" style={{ ...severityStyle[k].icon }}></i>
                  {obj[k]}
                </span>
              </TzTooltip>
            );
          })}
        </>
      );
    },
    [orData],
  );

  const RiskEventDom = useMemo(() => {
    let totalSeverity = 0;
    const obj: any = { High: 0, Medium: 0, Low: 0 };
    if (riskEvent) {
      Object.keys(riskEvent.severity).map((t) => {
        if (eventToSeverity[t]) {
          obj[eventToSeverity[t]] += riskEvent.severity[t];
        }
        totalSeverity += riskEvent.severity[t];
        return t;
      });
    }

    return (
      <div className="content-card-list df dfdc mt16">
        <div className="df dfac dfjb plr20">
          <span className="subtitle-txt">
            {translations.scanner_report_platformEvent}（{totalSeverity}）
          </span>
          <span
            className="control-more hoverBtn"
            onClick={() => {
              let name = Store.clusterItem.value?.name;
              if (name) {
                // refreshScope('NotificationCenter');
                navigate(
                  `${Routes.NotificationCenter}?tab=palace&cluster=${name}_${Store.clusterID.value}&namespace=${orData?.namespace}&resource=${orData?.resourceName}(${orData?.resourceKind})`,
                );
              }
            }}
          >
            {translations.see_all}
          </span>
        </div>
        {Object.keys(riskEvent?.severity || {}).length ? (
          <>
            <div className="df dfac dfjb plr20 mt12">
              <span className="name-txt-link">{translations.by_severity}</span>
            </div>
            <div className="df dfac dfw plr20 w100p mt8">{severityTagsEventDom(obj)}</div>
          </>
        ) : null}
        {Object.keys(riskEvent?.category || {}).length ? (
          <>
            <div className="df dfac dfjb mt12 plr20">
              <span className="name-txt-link">{translations.by_event_type}</span>
            </div>
            <div className="df dfac dfw w100p plr20">{eventTypeTagsDom(riskEvent.category)}</div>
          </>
        ) : null}
      </div>
    );
  }, [riskEvent, orData]);

  useImperativeHandle(
    ref,
    () => {
      return {
        show() {
          closeFn(true);
        },
        close() {
          closeFn(false);
        },
      };
    },
    [],
  );
  let { jumpResourceFn } = useJumpResourceFn();
  return (
    <>
      <div className={classNames('detail-drawer-group', cls)}>
        <div className={classNames('detail-head-group')}>
          <div
            className="df dfac dfw w100p"
            style={{
              paddingRight: '8px',
              boxSizing: 'border-box',
            }}
          >
            <span
              className="head-txt"
              onClick={() => {
                let data = {
                  kind: orData?.resourceKind,
                  name: orData?.resourceName,
                  namespace: orData.namespace,
                  clusterKey: Store.clusterID.value,
                };
                jumpResourceFn(data);
              }}
            >
              {orData?.resourceName}
              &nbsp;&nbsp;
              <TzTag className={classNames('f14 detail-tz-small-tag')} style={chartTagStyle['Deployment'].style}>
                {orData?.resourceKind}
              </TzTag>
            </span>
          </div>
          {animationMark ? (
            <span className="control-icon" onClick={() => closeFn(false)}>
              <i className={'icon iconfont icon-close f20'}></i>
            </span>
          ) : null}
        </div>
        {animationMark ? (
          <div className={classNames('detail-content-group noScrollbar')}>
            <div className="content-card-list df dfdc">
              <div className="df dfac dfjb plr20">
                <span className="subtitle-txt">
                  {translations.risk_image}（{riskImages.length}）
                </span>
              </div>
              {RiskInfo}
            </div>
            {RiskEventDom}
          </div>
        ) : null}
      </div>
    </>
  );
};

export default forwardRef(OnlineVulnerabilitiesDrawer);
