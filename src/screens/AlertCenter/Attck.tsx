import React, { useCallback, useState, useEffect } from 'react';
import { localLang, translations } from '../../translations/translations';
import './Attck.scss';
import { ATTCKMatrix } from '../../services/DataService';
import { TzButton } from '../../components/tz-button';
import EllipsisPopover from '../../components/ellipsisPopover/ellipsisPopover';
import { TzCard } from '../../components/tz-card';
import { useLocation, useNavigate } from 'react-router-dom';
import { severityType } from './eventDataUtil';
import { TzCol, TzRow } from '../../components/tz-row-col';
import { Routes } from '../../Routes';
import { Store } from '../../services/StoreService';
import { SupportedLangauges } from '../../definitions';
import { LoadingImg } from '../../components/tz-table';
// import { useActivate, useAliveController } from 'react-activation';
import { useMemoizedFn } from 'ahooks';
import { parseGetMethodParams } from '../../helpers/until';
import { useNavigatereFresh } from '../../helpers/useNavigatereFresh';
export const DataMatrix = (props: any) => {
  let [matrixList, setMatrixList] = useState<any>([]);

  // const { refreshScope } = useAliveController();
  // let navigate = useNavigate();
  let getATTCKMatrix = useCallback(() => {
    ATTCKMatrix({
      page: { offset: 0, limit: 500 },
      query: { ruleKey: ['ATT&CK'] },
      sort: {
        field: 'updatedAt',
        order: 'desc',
      },
    }).subscribe((res) => {
      let items = res.getItems();
      setMatrixList(items);
    });
  }, []);
  let getTitleNum = useCallback((node, item) => {
    if (item.count) {
      $(node).text(item.count).css('color', 'rgba(233, 84, 84, 1)');
    } else {
      $(node).text(0).css('color', 'rgba(179, 186, 198, 1)');
    }
  }, []);
  useEffect(() => {
    getATTCKMatrix();
  }, []);
  let getColor = useCallback((item) => {
    let obj: any = {
      High: {
        background: 'rgba(233, 84, 84, 1)',
        boxShadow: 'rgba(233, 84, 84, 0.25)',
      },
      Medium: {
        background: 'rgba(255, 138, 52, 1)',
        boxShadow: 'rgba(255, 138, 52,0.25)',
      },
      Low: {
        background: 'rgba(255, 196, 35, 1)',
        boxShadow: 'rgba(255, 196, 35, 0.25)',
      },
      unSeverity: {
        background: 'rgba(231, 233, 237, 1)',
        boxShadow: 'rgba(255, 255, 255, 1)',
      },
    };
    let key = severityType[item.severity] || 'unSeverity';
    return obj[key];
  }, []);
  let langEn = localLang === SupportedLangauges.English;
  let { jump } = useNavigatereFresh();
  return (
    <div
      className="flex-r att-ck"
      ref={(node) => {
        let t = document.body.offsetWidth > 1440 ? 'zxxl' : 'zxl';
        $(node).addClass(t);
      }}
    >
      <TzRow className={'ATTCK-row'}>
        {matrixList.length ? (
          matrixList.map((item: any) => {
            return (
              <TzCol span={3}>
                <div
                  className={'attck-div'}
                  ref={(node) => {
                    setTimeout(() => {
                      let el = $(node).offset();
                      const overflow =
                        $(node).height() < $(node).children('.col-item-cont').height();
                      let height = overflow ? `100%` : 'auto';
                      overflow && el && $(node).addClass('overflow-item');
                      el && $(node).css('height', height);
                    }, 0);
                  }}
                >
                  <p
                    className={'mb8 attck-div-title'}
                    style={{ paddingLeft: '12px', paddingRight: '4px' }}
                  >
                    <div
                      style={{
                        color: '#3E4653',
                        overflow: 'hidden',
                        lineHeight: `${langEn ? '14px' : 'inherit'}`,
                        height: `${langEn ? '28px' : 'auto'}`,
                      }}
                      className={`fw550 ${langEn ? 'f12' : 'f14'}`}
                    >
                      {item.name}
                    </div>
                    <div
                      className={'f20 fw550 title-num'}
                      style={{ lineHeight: '28px' }}
                      ref={(node) => getTitleNum(node, item)}
                    >
                      {0}
                    </div>
                  </p>
                  <div id={'col-item-cont'} className={'col-item-cont'}>
                    {item.items.map((ite: any) => {
                      return (
                        <TzCard
                          bodyStyle={{ padding: '0px 0px 4px' }}
                          className={`mb8 attck-rule-item_${
                            ite.count ? severityType[item.severity] : ''
                          }`}
                          style={{
                            overflow: 'hidden',
                            borderColor: getColor(ite).background,
                          }}
                          onClick={async () => {
                            let { key, name, start = 0, end = 0 } = ite;
                            let data = {
                              start: start - 1,
                              end: end + 1,
                              description: name,
                              enRuleKeyPath: key,
                            };
                            jump(Routes.AttckDetail + parseGetMethodParams(data), 'AttckDetail');
                          }}
                        >
                          <p
                            style={{
                              height: '6px',
                              background: getColor(ite).background,
                            }}
                          ></p>
                          <div style={{ padding: '0 8px' }} className={'mt12'}>
                            <p
                              className={'t-c f20 fw550 mb4'}
                              style={{
                                lineHeight: '28px',
                                color: ite.count ? getColor(ite).background : '#B3BAC6',
                              }}
                            >
                              {ite.count}
                            </p>
                            <p style={{ height: '48px' }}>
                              <EllipsisPopover lineClamp={3} lineHeight={16} title={ite.name}>
                                <span
                                  className={'f12'}
                                  style={{
                                    lineHeight: '16px',
                                    display: 'block',
                                    textAlign: 'center',
                                    color: ite.count ? '#3E4653' : '#8E97A3',
                                  }}
                                >
                                  {ite.name}
                                </span>
                              </EllipsisPopover>
                            </p>
                          </div>
                        </TzCard>
                      );
                    })}
                  </div>
                </div>
              </TzCol>
            );
          })
        ) : (
          <div
            style={{ width: '100%', height: '100%', justifyContent: 'center' }}
            className={'flex-r-c'}
          >
            <LoadingImg />
          </div>
        )}
      </TzRow>
    </div>
  );
};
const ATTCK = () => {
  let navigate = useNavigate();
  const l = useLocation();
  const setHeader = useMemoizedFn(() => {
    Store.header.next({
      title: 'ATT&CK',
      extra: (
        <TzButton
          icon={<i className={'icon iconfont icon-jingxiangsaomiao-peizhi'} />}
          onClick={async () => {
            navigate(`${Routes.AttckRuleConfiguration}`);
          }}
        >
          {translations.ruleConfiguration}
        </TzButton>
      ),
    });
  });
  useEffect(() => {
    setHeader();
  }, [l]);
  return (
    <div className={'ATTCK-case mlr32'}>
      <DataMatrix />
    </div>
  );
};

export default ATTCK;
