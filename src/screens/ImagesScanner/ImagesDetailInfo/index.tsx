import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import './index.scss';
import { TzButton } from '../../../components/tz-button';
import { TzCard } from '../../../components/tz-card';
import { TzTable, TzTableServerPage } from '../../../components/tz-table';
import { TablePaginationConfig } from 'antd/lib/table';
import {
  getCiPkgs,
  getCiSensitives,
  getCiVulnDetail,
  getCiVulns,
  getHistory,
  getCiImage,
} from '../../../services/DataService';
import { map } from 'rxjs/operators';
import moment from 'moment';
import { RenderTag, TzTag } from '../../../components/tz-tag';
import { TzCheckbox } from '../../../components/tz-checkbox';
import { TzInputSearch } from '../../../components/tz-input-search';
import { CiQuestions, Histogram, PageTitle, statusEnum, CiStatusEnum } from '../ImagesCI/CI';
import { TzTimelineNoraml } from '../../../components/tz-timeline';
import { localLang, translations } from '../../../translations/translations';
import { Store } from '../../../services/StoreService';
import { TzDrawerFn } from '../../../components/tz-drawer';
import { initTypes } from '../../ImageReject/ImageNewStrategy';
import {
  filtersOperation,
  filtersRepairable,
  Severitycomponent,
  SeverityIconTag,
} from '../components/Image-scanner-detail/ImagesScannerDetail';
import { TextHoverCopy } from '../../AlertCenter/AlertCenterScreen';
import { addWhiteList } from '../WhiteList';
import EllipsisPopover from '../../../components/ellipsisPopover/ellipsisPopover';
import { getCurrentLanguage } from '../../../services/LanguageService';
import { classFilters, OSVersion } from '../LifeCycle';
import { TzTooltip } from '../../../components/tz-tooltip';
import useLayoutMainSearchWid from '../../../helpers/useLayoutMainSearchWid';
import TzAnchor, { useAnchorItem } from '../../../components/ComponentsLibrary/TzAnchor';
import ArtTemplateDataInfo from '../../../components/ComponentsLibrary/ArtTemplateDataInfo';
import { Tittle } from '../../../components/ComponentsLibrary/Tittle';
import { Radar } from '@antv/g2plot';
import { find, merge } from 'lodash';
import { useViewConst } from '../../../helpers/use_fun';
let getPolicyActionStyle = (str: string, row: any) => {
  let obj: any = {
    '0': '',
    alert: 'policy-action-alarm',
    alarm: 'policy-action-alarm',
    block: 'policy-action-block',
    reject: 'policy-action-block',
    '1': 'policy-action-alarm',
    '2': 'policy-action-block',
  };
  let { Match = 0, White, MatchAction } = row;
  return <span className={Match !== 0 ? obj[MatchAction] : ''}>{str}</span>;
};
export let VulnDetailInfo = ({ getDataFn, ...props }: any) => {
  let [dataInfo, setInfo] = useState<any>(null);
  const [chart, setChart] = useState<Radar>();
  const vulnDetailRef = useRef<HTMLDivElement>(null);
  let {
    name = '',
    uniqueVuln,
    id,
    uniqueID = '',
    languageName = '',
    languagePath = '',
    goName = '',
    goPath = '',
    gobinery = '',
    pkgName = '',
    pkgVersion = '',
    frame = '',
  } = props;
  let getCiVulnkDetailFn = () => {
    getDataFn({
      vulnName: name,
      pkgName,
      pkgVersion,
      uniqueVuln,
      uniqueID,
      languageName,
      languagePath,
      goName,
      goPath,
      gobinery,
      frame,
      id,
      imageID: id,
      imageUniqueID: uniqueID,
    }).subscribe((res: any) => {
      if (res.error || !vulnDetailRef.current) return;
      // eslint-disable-next-line import/namespace, @typescript-eslint/ban-ts-comment
      // @ts-ignore
      chart?.clear();
      let data = [];
      let item = res.getItem();
      let obj = Object.assign(
        {},
        item,
        { ...item?.vulninfo },
        { ...item?.vulninfo?.cvss },
        { ...item?.vulninfo?.cnnvds },
      );
      let newObj = merge(obj, {
        posAttr: obj.posAttr || obj.cvssMap,
        cvssV3Score: obj.cvssV3Score || obj.cvssv3score,
        cvssv3vector: obj.cvssV3Vector || obj.cvssv3vector,
        cnnvdName: obj.cnnvdName || obj.number,
        classView: obj.classView || obj.updator,
        cnnvdFixSuggestion: obj.cnnvdFixSuggestion || obj.fix_suggestion,
        fixedVersion: obj.fixedVersion || obj.fixedby,
        references: obj.references || obj.links,
      });
      let o: any = {
        AV: translations.difficult_to_attack_the_position,
        AC: translations.attack_complexity,
        UI: translations.whether_to_trigger_automatically,
        PR: translations.pequired_permission_level,
        C: translations.risk_of_information_leakage,
        A: translations.information_system_tampering_risk,
        I: translations.cause_doS_risk,
        S: translations.scope_of_authority_expanded,
      };
      data = Object.keys(newObj.posAttr).reduce((pre: any, item) => {
        pre.push({
          item: o[item],
          user: obj.name,
          score: Number(obj.posAttr[item].replace('%', '')),
        });
        return pre;
      }, []);
      setInfo(newObj);
      // $('#vulnDetail').children().remove();
      const radarPlot = new Radar(vulnDetailRef.current, {
        data,
        padding: [10, 0, 10, 0],
        xField: 'item',
        yField: 'score',
        seriesField: 'user',
        legend: false,
        tooltip: {
          customContent: (value, items) => {
            let tObj: any = {
              AV: {
                P: translations.physical_access,
                L: translations.local_access,
                A: translations.adjacent_network_access,
                N: translations.network_access,
              },
              UI: {
                N: translations.automatic,
                R: translations.not_automatic,
              },
              PR: {
                N: translations.nothing,
                L: translations.severity_Low,
                H: translations.severity_High,
              },
              AC: {
                L: translations.severity_Low,
                H: translations.severity_High,
              },
              C: {
                N: translations.nothing,
                L: translations.severity_Low,
                H: translations.severity_High,
              },
              A: {
                N: translations.nothing,
                L: translations.severity_Low,
                H: translations.severity_High,
              },
              I: {
                N: translations.nothing,
                L: translations.severity_Low,
                H: translations.severity_High,
              },
              S: {
                C: translations.expand,
                U: translations.unchanged,
              },
            };
            let str = newObj?.cvssv3vector
              ? newObj?.cvssv3vector
                  .split('/')
                  .slice(1)
                  .reduce((pre: string, item: string) => {
                    let arr = item.split(':');
                    let tObjItem = tObj[arr[0]][arr[1]];
                    return (pre += `<div class='flex-r-c cvssv3-vector-item' ><span>${
                      o[arr[0]]
                    } </span><span>${tObjItem}</span></div>`);
                  }, `<div class="cvssv3-vector"><div class='cvssv3-vectortitle'>${obj.name}</div>`)
              : '';
            return `${str}</div>`;
          },
        },
        meta: {
          score: {
            min: 0,
            max: 120,
            nice: true,
          },
        },
        xAxis: {
          line: null,
          tickLine: null,
          grid: {
            line: {
              style: {
                lineDash: null,
                stroke: '#E7E9ED',
              },
            },
          },
        },
        yAxis: {
          label: false,
          line: null,
          tickLine: null,
          grid: {
            line: {
              type: 'line',
              style: {
                lineDash: null,
                stroke: '#E7E9ED',
              },
            },
            alternateColor: 'rgba(36, 72, 128, 0.05)',
          },
        },
        area: {
          //color:'#2D94FF',
          style: () => {
            return {
              fill: '#2D94FF',
            };
          },
        },
        point: {
          size: 4,
        },
      });
      setChart(radarPlot);
      radarPlot.render();
    });
  };
  const dataInfoList = useMemo(() => {
    if (!dataInfo) return [];
    const obj: any = {
      cvssV3Score: translations.scanner_report_CVSS3Score + '：',
      cnnvdName: translations.scanner_report_CNNVDNumber + '：',
      updator: translations.scanner_report_leakType + '：',
      description: translations.scanner_detail_leak_desc + '：',
      cnnvdFixSuggestion: translations.scanner_report_fixAdvise + '：',
      fixedVersion: translations.scanner_detail_fix_tip + '：',
      references: translations.scanner_detail_side_link + '：',
    };
    if (localLang === 'en') {
      delete obj.cnnvdFixSuggestion;
    }
    return Object.keys(obj).map((item) => {
      let o: any = {
        title: obj[item] || '-',
        content: dataInfo[item],
      };
      if ('cvssv3score' === item) {
        o['render'] = () => {
          return (
            <span className="d_val" style={{ color: '#e95454' }}>
              {Number(dataInfo[item]).toFixed(2)}
            </span>
          );
        };
      }
      if ('description' === item || 'fix_suggestion' === item) {
        o['render'] = () => {
          return dataInfo[item];
        };
      }
      if ('references' === item) {
        o['render'] = () => {
          return dataInfo[item].length ? (
            <div style={{ display: 'block', width: '100%' }}>
              {dataInfo[item].map((item: any) => {
                return (
                  <a
                    href={item}
                    key={item}
                    target="_blank"
                    className="links mb4"
                    style={{ display: 'flex', width: '100%' }}
                    rel="noreferrer"
                  >
                    <EllipsisPopover>{item}</EllipsisPopover>
                  </a>
                );
              })}
            </div>
          ) : (
            '-'
          );
        };
      }
      return o;
    });
  }, [dataInfo]);
  useEffect(() => {
    getCiVulnkDetailFn();
  }, []);
  return (
    <>
      <div ref={vulnDetailRef} style={{ height: '250px' }} className={'mb20'}></div>
      <ArtTemplateDataInfo
        rowProps={{ gutter: [0, 0] }}
        data={dataInfoList.filter((item) => {
          return !!item.content;
        })}
        span={1}
        className={'vuln-detail'}
      />
    </>
  );
};
const ImagesDetailInfo = (props: any) => {
  const navigate = useNavigate();
  const [result] = useSearchParams();
  let [query, setQuery] = useState({
    id: result.get('id'),
  });
  const [info, setInfo] = useState<any>(null);
  const [severityIconData, setSeverityIconData] = useState(null);
  const [match_policy, setMatchPolicy] = useState(false);
  const [match_sensitive_policy, setMatchSensitivePolicy] = useState(false);
  const [keyword, setSearch] = useState('');
  const [pkgsSearch, setPkgsSearch] = useState('');
  const [sensitiveSearch, setSensitiveSearch] = useState('');

  const listComp = useRef<any>(null);
  const listCompPkgs = useRef<any>(null);
  const listCompSensitive = useRef<any>(null);

  let vulnClass = useViewConst({ constType: 'vulnClass' });
  const items = [
    {
      href: '#base',
      title: <EllipsisPopover>{translations.compliances_breakdown_taskbaseinfo}</EllipsisPopover>,
    },
    {
      href: '#leak',
      title: <EllipsisPopover>{translations.scanner_images_vulnerabilities}</EllipsisPopover>,
    },
    {
      href: '#sensitive',
      title: <EllipsisPopover>{translations.scanner_images_sensitive}</EllipsisPopover>,
    },
    {
      href: '#software',
      title: <EllipsisPopover>{translations.scanner_detail_soft_pack}</EllipsisPopover>,
    },
    {
      href: '#layer',
      title: <EllipsisPopover>{translations.vulnerabilityDetails_scanDetailsURL}</EllipsisPopover>,
    },
  ];
  const pkgsColumns: any = [
    {
      title: translations.scanner_detail_soft_pack,
      dataIndex: 'PkgName',
      width: '25%',
      render(PkgName: any, row: any) {
        return <EllipsisPopover lineClamp={2}>{PkgName}</EllipsisPopover>;
      },
    },
    {
      title: translations.package_version,
      dataIndex: 'PkgVersion',
      width: '25%',
    },
    {
      title: translations.vulnerability_statistics,
      dataIndex: 'Histogram',
      render: (data: any) => {
        return <Histogram severityHistogram={data} />;
      },
    },
  ];
  const sensitiveColumns = [
    {
      title: translations.scanner_images_sensitive,
      dataIndex: 'Name',
      render: (name: any, row: any) => {
        if (row.Match && info) {
          row['MatchAction'] = info.policy_snapshot.sensitive_file.action;
        }
        return getPolicyActionStyle(name, row);
      },
    },
    {
      title: translations.scanner_detail_file_path,
      dataIndex: 'Path',
      width: '40%',
      render: (name: any, row: any) => {
        return <TextHoverCopy text={name} />;
      },
    },
  ];
  const leakColumns: any = useMemo(
    () => [
      {
        title: translations.scanner_report_leakNum,
        dataIndex: 'name',
        render: (name: any, row: any) => {
          if (row.Match && info) {
            row['MatchAction'] = info.policy_snapshot.vuln.action;
          }
          return getPolicyActionStyle(name, row);
        },
      },
      {
        title: translations.scanner_report_eventLevel,
        key: 'severity',
        dataIndex: 'severity',
        className: 'th-center',
        width: '14%',
        align: 'center',
        filters: filtersOperation,
        render: (severity: string) => {
          return <Severitycomponent severity={severity} />;
        },
      },
      {
        title: translations.scanner_detail_soft_pack,
        dataIndex: 'pkgName',
        render(pkgName: any, row: any) {
          return <EllipsisPopover lineClamp={2}>{pkgName}</EllipsisPopover>;
        },
      },
      {
        title: translations.package_version,
        dataIndex: 'pkgVersion',
        width: '15.5%',
        render: (text: any) => {
          return text;
        },
      },
      {
        title: (
          <>
            {translations.scanner_detail_leak_type}
            <TzTooltip title={translations.unStandard.str94}>
              <i className={'icon iconfont icon-wenhao ml4'}></i>
            </TzTooltip>
          </>
        ),
        dataIndex: 'class',
        filters: vulnClass,
        render: (pkgVersion: any) => find(vulnClass, (item) => item.value === pkgVersion + '')?.label || '-',
      },
      {
        title: translations.repairable,
        dataIndex: 'fixedBy',
        align: 'center',
        filters: filtersRepairable,
        render: (text: any) => {
          return <span className="pr12">{text ? translations.yes : translations.no}</span>;
        },
      },
    ],
    [vulnClass],
  );
  const reqFunOrder = useCallback(
    (pagination: TablePaginationConfig, filters: any) => {
      let { severity = [], canFixed = [], fixedBy } = filters;
      if (!info)
        return getHistory().pipe(
          map(() => {
            return {
              data: [],
              total: [].length,
            };
          }),
        );
      const { current = 1, pageSize = 10 } = pagination;
      const offset = (current - 1) * pageSize;
      const pageParams = {
        offset,
        limit: pageSize,
        imageID: info.ID,
        match_policy,
        keyword,
        class: filters.class && filters.class.join(','),
        severity: severity ? severity.join(',') : '',
        canFixed: fixedBy ? fixedBy.join(',') : '',
        fixedBy: fixedBy ? fixedBy.join(',') : '',
      };
      return getCiVulns(pageParams).pipe(
        map((res: any) => {
          if (res.error)
            return {
              data: [],
              total: 0,
            };
          let items = res.getItems();
          let item = res.getItem();
          setSeverityIconData(
            Object.keys(item).reduce((pre: any, it) => {
              pre[it.substring(3).toLocaleUpperCase()] = item[it];
              return pre;
            }, {}),
          );
          return {
            data: items,
            total: res.data.totalItems,
          };
        }),
      );
    },
    [info, match_policy, keyword],
  );
  const reqFunPkgs = useCallback(
    (pagination: TablePaginationConfig) => {
      if (!info)
        return getHistory().pipe(
          map(() => {
            return {
              data: [],
              total: [].length,
            };
          }),
        );
      const { current = 1, pageSize = 10 } = pagination;
      const offset = (current - 1) * pageSize;
      const pageParams = {
        offset,
        limit: pageSize,
        image_id: info.ID,
        search: pkgsSearch,
      };
      return getCiPkgs(pageParams).pipe(
        map(({ data }: any) => {
          if (data) {
            return {
              data: data.items,
              total: data.totalItems,
            };
          } else {
            return {
              data: [],
              total: 0,
            };
          }
        }),
      );
    },
    [info, pkgsSearch],
  );
  const reqFunSensitive = useCallback(
    (pagination: TablePaginationConfig) => {
      if (!info)
        return getHistory().pipe(
          map(() => {
            return {
              data: [],
              total: [].length,
            };
          }),
        );
      const { current = 1, pageSize = 10 } = pagination;
      const offset = (current - 1) * pageSize;
      const pageParams = {
        offset,
        limit: pageSize,
        image_id: info.ID,
        match_policy: match_sensitive_policy,
        keyword: sensitiveSearch,
      };
      return getCiSensitives(pageParams).pipe(
        map(({ data }: any) => {
          if (data) {
            return {
              data: data.items,
              total: data.totalItems,
            };
          } else {
            return {
              data: [],
              total: 0,
            };
          }
        }),
      );
    },
    [info, sensitiveSearch, match_sensitive_policy],
  );
  let featchGetCiImage = useCallback(() => {
    getCiImage(query).subscribe((res) => {
      let info = res.getItem();
      info && setInfo(info);
    });
  }, [query.id]);
  useEffect(() => {
    featchGetCiImage();
  }, []);
  let PolicySnapshot = (props: any) => {
    let data: any = useMemo(() => {
      return Object.keys(props).reduce((pre, item) => {
        if ('sensitive_file' === item) {
          pre = Object.keys(props['sensitive_file']).reduce((p, ite) => {
            return Object.assign({}, p, {
              ['sensitive_file_' + ite]: props['sensitive_file'][ite],
            });
          }, pre);
        } else if ('vuln' === item) {
          pre = Object.keys(props['vuln']).reduce((p, ite) => {
            return Object.assign({}, p, {
              ['vuln_' + ite]: props['vuln'][ite],
            });
          }, pre);
        }
        return Object.assign({}, pre, { [item]: props[item] });
      }, {});
    }, [props]);
    let vuln_level_title = useMemo(() => {
      let node = initTypes.find((item) => item.value == data['vuln_severity']);
      return node ? node.label : '';
    }, [data]);
    let getDataInfo = useCallback(
      (arr: string[]) => {
        if (!data) return [];
        const obj: any = {
          vuln_action: translations.imageReject_strategy_action_title + '：',
          vuln_severity: `${translations.scanner_detail_severity}：`,
          vuln_black_list_vulns: translations.imageReject_self_leak_name + '：',
          vuln_white_list_vulns: translations.imageReject_self_leak_name + '：',
          sensitive_file_action: translations.imageReject_strategy_action_title + '：',
          sensitive_file_ext: translations.customize_sensitive_file_types + '：',
        };
        return arr.map((item) => {
          let o: any = {
            title: obj[item] || '-',
            content: data[item],
          };
          if ('sensitive_file_action' === item || 'vuln_action' === item) {
            o['className'] = 'item-flex-center';
            o['render'] = (row: any) => {
              return <RenderTag type={data[item]} />;
            };
          }
          if ('vuln_severity' === item) {
            o['render'] = (row: any) => {
              let localLang = getCurrentLanguage();
              return (
                <p>
                  {localLang === 'zh'
                    ? vuln_level_title + translations.and_above
                    : translations.and_above + vuln_level_title}
                </p>
              );
            };
          }
          if (('vuln_black_list_vulns' === item || 'vuln_white_list_vulns' === item) && data[item]) {
            o['render'] = (row: any) => {
              return (
                <p>
                  {data[item].map((item: any) => {
                    return item ? <TzTag className={'t-c mb6'}>{item}</TzTag> : null;
                  })}
                </p>
              );
            };
          }
          if ('sensitive_file_ext' === item) {
            o['render'] = (row: any) => {
              return (
                <p>
                  {data[item].map((item: any) => {
                    return item.value ? <TzTag className={'t-c mb6'}>{item.value}</TzTag> : null;
                  })}
                </p>
              );
            };
          }
          return o;
        });
      },
      [data, vuln_level_title],
    );
    let vulnWhitelistColumns: any = [
      {
        title: translations.scanner_detail_container_name,
        dataIndex: 'name',
      },
      {
        title: translations.imageReject_used_for_obj,
        dataIndex: 'object',
        align: 'center',
        render: (name: any, row: any) => {
          return name === 'all' ? (
            <TzTag>{translations.all_packages}</TzTag>
          ) : (
            <>
              {name.split(',').map((item: any) => {
                return <TzTag className="mr8">{item}</TzTag>;
              })}
            </>
          );
        },
      },
    ];
    return (
      <>
        <Tittle
          title={
            <>
              {translations.imageReject_vulnerabilityRules_tab_title}{' '}
              <RenderTag type={data.vuln_enabled + ''} className={'ml10'} />{' '}
            </>
          }
          className={'mb20'}
        />
        <ArtTemplateDataInfo rowProps={{ gutter: [0, 0] }} data={getDataInfo(['vuln_action'])} span={1} />
        <PageTitle title={translations.rule_conditions} className={'f14 mt16 mb12'} style={{ color: '#3e4653' }} />
        <ArtTemplateDataInfo
          data={getDataInfo(['vuln_severity', 'vuln_black_list_vulns'])}
          span={1}
          rowProps={{ gutter: [0, 0] }}
        />
        <PageTitle title={translations.rule_white_list} className={'f14 mt16 mb12'} style={{ color: '#3e4653' }} />
        <TzCheckbox className={'mb12'} disabled={true} checked={data.vuln_ignore_unfixed}>
          {translations.ignore_unrepairable_vulnerabilities}
        </TzCheckbox>
        <br />
        <TzCheckbox className={'mb12'} disabled={true} checked={data.vuln_ignore_lang_pkg_vuln}>
          {translations.ignore_application_vulnerabilities}
        </TzCheckbox>
        <p className={'mb12'}>{translations.imageReject_self_leak_name}：</p>
        <TzTable
          dataSource={data.raw_vuln_white_list}
          columns={vulnWhitelistColumns}
          pagination={{ defaultPageSize: 5, hideOnSinglePage: true }}
        />
        <Tittle
          title={
            <>
              {translations.imageReject_sensitiveRules_tab_title}
              <RenderTag type={data.sensitive_file_enabled + ''} className={'ml10'} />
            </>
          }
          className={'mb20 mt12'}
        />
        <ArtTemplateDataInfo rowProps={{ gutter: [0, 0] }} data={getDataInfo(['sensitive_file_action'])} span={1} />
        <PageTitle title={translations.rule_conditions} className={'f14 mt16 mb12'} style={{ color: '#3e4653' }} />
        <ArtTemplateDataInfo
          rowProps={{ gutter: [0, 0] }}
          className={'modal-policy-snapshot'}
          data={getDataInfo(['sensitive_file_ext'])}
          span={1}
        />
      </>
    );
  };
  const dataInfoList = useMemo(() => {
    if (!info) return [];
    const obj: any = {
      os: translations.oS_version + '：',
      pipeline_name: translations.task_name + '：',
      questions: translations.safetyProblem + '：',
      scan_time: translations.scanningTime + '：',
      policy_snapshot: translations.policy_snapshot + '：',
    };
    return Object.keys(obj).map((item) => {
      let o: any = {
        title: obj[item] || '-',
        content: info[item],
      };
      if ('policy_snapshot' === item) {
        o['render'] = (row: any) => {
          return (
            <TzButton
              type={'text'}
              className={'ml-8'}
              onClick={async () => {
                if (info.policy_snapshot.name) {
                  let dw: any = await TzDrawerFn({
                    className: 'drawer-body0',
                    width: 560,
                    title: info.policy_snapshot.name,
                    children: <PolicySnapshot {...info.policy_snapshot} />,
                  });
                  dw.show();
                }
              }}
            >
              {info.policy_snapshot.name || '-'}
            </TzButton>
          );
        };
      }
      if ('questions' === item) {
        o['render'] = (row: any) => {
          return <CiQuestions Questions={info[item]} />;
        };
      }
      if ('scan_time' === item) {
        o['render'] = (row: any) => {
          return (
            <EllipsisPopover className={'f-l'}>{moment(info[item]).format('YYYY-MM-DD HH:mm:ss')}</EllipsisPopover>
          );
        };
      }
      if ('os' === item) {
        o['render'] = () => {
          return <OSVersion os={info[item]} />;
        };
      }
      return o;
    });
  }, [info]);
  let all_remediation = useMemo(() => {
    if (!info) return [];
    const obj: any = {
      all_remediation: translations.safety_advice + '：',
    };
    return Object.keys(obj).map((item) => {
      let o: any = {
        title: obj[item] || '-',
        content: info[item],
      };
      if ('all_remediation' === item) {
        o['className'] = 'dfas';
        o['render'] = (row: any) => {
          return (
            <div>
              {info.all_remediation.vuln && <p style={{ lineHeight: '22px' }}>{translations.unStandard.str70}:</p>}
              <p style={{ lineHeight: '24px' }}>{info.all_remediation.vuln}</p>
              {info.all_remediation.sensitive && (
                <p style={{ lineHeight: '24px' }}>{translations.unStandard.str71}：</p>
              )}
              <p style={{ lineHeight: '24px' }}>{info.all_remediation.sensitive}</p>
            </div>
          );
        };
      }
      return o;
    });
  }, [info]);
  let actionsList = useMemo(() => {
    if (!info || !info.layers) return null;
    return info.layers.map((item: any, index: number) => {
      let { Created, CreatedBy } = item;
      item['children'] = (
        <>
          <div>
            <p className={'mb8'} style={{ fontSize: '16px', fontWeight: 550, color: '#3e4653' }}>
              {moment(Created * 1000).format('YYYY-MM-DD HH:mm:ss')}
            </p>
            <p>
              {translations.scanner_detail_created_by}：{CreatedBy}
            </p>
          </div>
        </>
      );
      return item;
    });
  }, [info]);
  const l = useLocation();
  useEffect(() => {
    if (info) {
      let status = info.mode || CiStatusEnum.abnormal;
      if (status === CiStatusEnum.pass && info.match_whitelist) {
        status = CiStatusEnum.normalPass;
      }
      Store.header.next({
        title: (
          <>
            {info.image_name}
            {
              <TzTag className={'ml10 f14'} style={statusEnum[status].style}>
                {statusEnum[status].label}
              </TzTag>
            }
          </>
        ),
        extra:
          info.in_whitelist || status === CiStatusEnum.pass || status === CiStatusEnum.abnormal ? null : (
            <TzButton
              onClick={() => {
                addWhiteList('add', { name: [info.image_name] }, () => {
                  featchGetCiImage();
                });
              }}
            >
              {translations.add_white_list}
            </TzButton>
          ),
        onBack: () => {
          navigate(-1);
        },
      });
    }
  }, [info, l]);
  let PkgsInfo = (props: any) => {
    let { imageID, pkgName, pkgVersion, PkgVersion, PkgName } = props;
    const reqFunPkgsInfoVuln = useCallback(
      (pagination: TablePaginationConfig, filters: any) => {
        let { severity = [], canFixed = [] } = filters;
        if (!info) {
          return getHistory().pipe(
            map(() => {
              return {
                data: [],
                total: [].length,
              };
            }),
          );
        }
        const { current = 1, pageSize = 10 } = pagination;
        const offset = (current - 1) * pageSize;
        const pageParams = {
          offset,
          limit: pageSize,
          imageID,
          class: filters.class && filters.class.join(','),
          pkgName: pkgName || PkgName,
          pkgVersion: pkgVersion || PkgVersion,
          severity: severity ? severity.join(',') : '',
          canFixed: canFixed ? canFixed.join(',') : '',
        };
        return getCiVulns(pageParams).pipe(
          map((res: any) => {
            if (res.error)
              return {
                data: [],
                total: 0,
              };
            let items = res.getItems();
            return {
              data: items,
              total: res.data.totalItems,
            };
          }),
        );
      },
      [props],
    );
    let pkgsLeakColumns: any = [...leakColumns];
    pkgsLeakColumns.splice(0, 1, {
      title: translations.scanner_detail_container_name,
      dataIndex: 'name',
    });
    return (
      <>
        <TzTableServerPage
          tableLayout={'fixed'}
          columns={pkgsLeakColumns}
          defaultPagination={{
            current: 1,
            pageSize: 10,
            hideOnSinglePage: true,
          }}
          onRow={(record) => {
            return {
              onClick: async (event) => {
                let dw: any = await TzDrawerFn({
                  className: 'drawer-body0',
                  title: record.name,
                  destroyOnClose: true,
                  children: <VulnDetailInfo {...record} getDataFn={getCiVulnDetail} />,
                });
                dw.show();
              },
            };
          }}
          rowKey={'id'}
          reqFun={reqFunPkgsInfoVuln}
        />
      </>
    );
  };
  const searchWid = useLayoutMainSearchWid();
  let { getPageKey } = useAnchorItem();
  return (
    <>
      <div className="ml32 mr32 images-detail-info mt4">
        <div className="flex-r">
          <div className="flex-c mb40" style={{ flex: 1, width: 0 }}>
            <div className={'pt4'} id={getPageKey('base')}></div>
            <TzCard title={translations.compliances_breakdown_taskbaseinfo} bodyStyle={{ padding: '4px 0 0' }}>
              <ArtTemplateDataInfo className={'w70'} data={dataInfoList} span={3} />
              <ArtTemplateDataInfo className={'w70'} data={all_remediation} span={1} />
            </TzCard>
            <TzCard
              title={
                <div className="flex-r dfjb dfac">
                  <div>
                    <span className="mr12 vam">{translations.scanner_images_vulnerabilities}</span>
                    {info && info.vulnFlag ? (
                      <RenderTag type={'policy' + info.policy_snapshot.vuln.action} className={'middle'} />
                    ) : null}
                  </div>

                  <TzInputSearch
                    style={{ width: searchWid }}
                    placeholder={translations.scanner_detail_leak_search_plh}
                    onSearch={(val) => {
                      setSearch(val);
                    }}
                  />
                </div>
              }
              style={{ marginTop: '20px' }}
              id={getPageKey('leak')}
              bodyStyle={{ paddingTop: '0px' }}
            >
              <div
                className="flex-r mb8"
                style={{
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <TzCheckbox
                  onChange={(val) => {
                    setMatchPolicy(val.target.checked);
                  }}
                >
                  {translations.view_only_the_vulnerabilities_of_the_hit_policy}
                </TzCheckbox>
                <span className="flex-r" style={{ flex: 1, justifyContent: 'flex-end', marginRight: -8 }}>
                  <SeverityIconTag data={severityIconData} />
                </span>
              </div>
              <TzTableServerPage
                columns={leakColumns}
                defaultPagination={{
                  current: 1,
                  pageSize: 10,
                  hideOnSinglePage: true,
                }}
                onRow={(record) => {
                  return {
                    onClick: async (event) => {
                      let dw: any = await TzDrawerFn({
                        className: 'drawer-body0',
                        title: record.name,
                        destroyOnClose: true,
                        children: <VulnDetailInfo {...record} getDataFn={getCiVulnDetail} />,
                      });
                      dw.show();
                    },
                  };
                }}
                rowKey={'id'}
                ref={listComp}
                reqFun={reqFunOrder}
              />
            </TzCard>
            <TzCard
              title={
                <div className="flex-r dfjb dfac">
                  <div>
                    <span className={'mr12 vam'}>{translations.scanner_images_sensitive}</span>
                    {info && info.sensitiveFlag ? (
                      <RenderTag type={'policy' + info.policy_snapshot.sensitive_file.action} className={'middle'} />
                    ) : null}
                  </div>
                  <TzInputSearch
                    style={{ width: searchWid }}
                    placeholder={translations.unStandard.str72}
                    onSearch={(val) => {
                      setSensitiveSearch(val);
                    }}
                  />
                </div>
              }
              style={{ marginTop: '20px' }}
              id={getPageKey('sensitive')}
              bodyStyle={{ paddingTop: '0px' }}
            >
              <div
                className="flex-r mb8"
                style={{
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <TzCheckbox
                  onChange={(val) => {
                    setMatchSensitivePolicy(val.target.checked);
                  }}
                >
                  {translations.only_view_sensitive_files_of_hit_policy}
                </TzCheckbox>
              </div>
              <TzTableServerPage
                columns={sensitiveColumns}
                rowKey={(record) => {
                  return record.Path + '' + record.Name;
                }}
                ref={listCompSensitive}
                reqFun={reqFunSensitive}
              />
            </TzCard>
            <TzCard
              title={
                <div className="flex-r dfjb dfac">
                  <span>{translations.scanner_detail_soft_pack} </span>
                  <TzInputSearch
                    style={{ width: searchWid }}
                    placeholder={translations.unStandard.str73}
                    onSearch={(val) => {
                      setPkgsSearch(val);
                    }}
                  />
                </div>
              }
              style={{ marginTop: '20px' }}
              id={getPageKey('software')}
              bodyStyle={{ paddingTop: '0px' }}
            >
              <TzTableServerPage
                columns={pkgsColumns}
                defaultPagination={{
                  current: 1,
                  pageSize: 10,
                  hideOnSinglePage: true,
                }}
                rowKey={(record) => {
                  return record.PkgVersion + '' + record.PkgName;
                }}
                expandable={{
                  expandedRowRender: (record) => {
                    return <PkgsInfo PkgVersion={record.PkgVersion} PkgName={record.PkgName} imageID={info.ID} />;
                  },
                }}
                ref={listCompPkgs}
                reqFun={reqFunPkgs}
              />
            </TzCard>
            <TzCard
              title={translations.scanner_taskReport_spanTitle}
              style={{ marginTop: '20px' }}
              id={getPageKey('layer')}
              bodyStyle={{ paddingTop: '0px', paddingLeft: '60px' }}
            >
              <TzTimelineNoraml timeList={actionsList} />
            </TzCard>
          </div>
          <TzAnchor items={items} />
        </div>
      </div>
    </>
  );
};
export default ImagesDetailInfo;
