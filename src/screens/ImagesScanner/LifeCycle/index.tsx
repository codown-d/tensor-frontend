import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import './index.scss';
import { TzButton } from '../../../components/tz-button';
import { TzCard } from '../../../components/tz-card';
import { TzTableServerPage } from '../../../components/tz-table';
import { TablePaginationConfig } from 'antd/lib/table';
import { merge, get, find, isEqual, keys, sample, sampleSize } from 'lodash';
import { RenderTag, TzTag } from '../../../components/tz-tag';
import {
  detailBase,
  getHistory,
  getRelatedAppImageList,
  getResourcesByImage,
  getRelatedBaseImageList,
  imagesDetailVulns,
  imagesVulnDetail,
  detailLayers,
  imagesDetailIssueStatistic,
  vulnDetail,
  vulnsList,
  detailIssueOverview,
} from '../../../services/DataService';
import { map, tap } from 'rxjs/operators';
import moment from 'moment';
import { copyText, getTime, parseGetMethodParams } from '../../../helpers/until';
import { TzConfirm } from '../../../components/tz-modal';
import { TzInputSearch } from '../../../components/tz-input-search';
import { Histogram, PageTitle } from '../ImagesCI/CI';
import { TzTimelineNoraml } from '../../../components/tz-timeline';
import { localLang, translations } from '../../../translations/translations';
import { Store } from '../../../services/StoreService';
import { TzDrawerFn } from '../../../components/tz-drawer';
import {
  fetchReport,
  questionEnum,
  nodeQuestionIcon,
  registryQuestionIcon,
  imageScanTaskFn,
  imageAttrOp,
  ImageAttrTd,
  registrySelectQuesOp,
} from '../components/ImagesScannerDataList';
import {
  filtersOperation,
  filtersRepairable,
  BaseImageOperation,
} from '../components/Image-scanner-detail/ImagesScannerDetail';
import { TextHoverCopy } from '../../AlertCenter/AlertCenterScreen';
import EllipsisPopover from '../../../components/ellipsisPopover/ellipsisPopover';
import { TzSelect } from '../../../components/tz-select';
import { SelectItem, scanStatus, WebResponse } from '../../../definitions';
import NoData from '../../../components/noData/noData';
import { ImageType } from '../definition';
import { TzCol, TzRow } from '../../../components/tz-row-col';
import { TzTooltip } from '../../../components/tz-tooltip';
import { TzCheckbox, TzCheckboxGroup } from '../../../components/tz-checkbox';
import { getClusterName, useViewConst } from '../../../helpers/use_fun';
import { Routes } from '../../../Routes';
import ScoreRules from '../components/score-rules/ScoreRules';
import { riskLevel } from '../../ImageReject/ImageNewStrategy';
import useLayoutMainSearchWid from '../../../helpers/useLayoutMainSearchWid';
import TzAnchor, { useAnchorItem } from '../../../components/ComponentsLibrary/TzAnchor';
import ArtTemplateDataInfo from '../../../components/ComponentsLibrary/ArtTemplateDataInfo';
import { useMemoizedFn, useMount, useSetState, useUpdateEffect } from 'ahooks';
import { Observable, Subscription } from 'rxjs';
import { tabType } from '../ImagesScannerScreen';
import { Radar } from '@antv/g2plot';
import { statusValToKey } from '../../MultiClusterRiskExplorer/ListComponent/util';
import { TzTableTzTdInfoAssets } from '../../MultiClusterRiskExplorer/ListComponent/Container';
import { PolicySnapshot } from './PolicySnapshot';
import useImageColumns from '../components/ImagesScannerDataList/useImageColumns';
import { useNavigatereFresh } from '../../../helpers/useNavigatereFresh';
import { NodeTabEnvPath } from './components/NodeTabEnvPath';
import { NodeTabLeak } from './components/NodeTabLeak';
import { NodeTabLicense } from './components/NodeTabLicense';
import { NodeTabPkgs } from './components/NodeTabPkgs';
import { NodeTabSensitive } from './components/NodeTabSensitive';
import { NodeTabVirus } from './components/NodeTabVirus';
import { NodeTabWebshell } from './components/NodeTabWebshell';
export let VulnDetailInfo = (props: { uniqueID: any }) => {
  let [dataInfo, setInfo] = useState<any>(null);
  let { uniqueID } = props;
  let vulnDetailRef = useRef<any>(null);
  let getCiVulnkDetailFn = () => {
    vulnDetail({ uniqueID }).subscribe((res: any) => {
      if (res.error) return;
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
      data = Object.keys({
        A: '0%',
        AC: '0%',
        AV: '0%',
        C: '0%',
        I: '0%',
        PR: '0%',
        S: '0%',
        UI: '0%',
      }).reduce((pre: any, item) => {
        pre.push({
          item: o[item],
          user: obj.name,
          score: Number(obj.posAttr[item].replace('%', '')),
        });
        return pre;
      }, []);
      setInfo(newObj);
      const radarPlot = new Radar(vulnDetailRef.current as any, {
        data,
        padding: [30, 0, 30, 0],
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
      radarPlot.render();
    });
  };
  useEffect(() => {
    getCiVulnkDetailFn();
  }, []);
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

  return (
    <>
      <div ref={vulnDetailRef} style={{ height: '260px' }} className={'mb20'}></div>
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
export let OSVersion = (data: any) => {
  let { maintained, family, name } = data['os'] || {};
  return (
    <span
      className="flex-r-s"
      style={{
        color: !maintained ? 'rgba(233, 84, 84, 1)' : 'rgba(62, 70, 83, 1)',
        alignItems: 'center',
      }}
    >
      {family}&nbsp;{name || '-'}
      {!maintained ? (
        <TzTooltip title={translations.unStandard.str89}>
          <i className={'icon iconfont icon-tishi ml8'}></i>
        </TzTooltip>
      ) : null}
    </span>
  );
};
export let FixSuggestion = (info: { suggests: any[] }) => {
  return (
    <div
      style={{
        maxHeight: '234px',
        overflow: 'auto',
        background: '#F4F6FA',
        padding: '4px 24px 12px',
      }}
    >
      {info?.suggests?.map((item: any) => {
        return (
          <>
            <p
              style={{
                color: '#3E4653',
                fontWeight: 550,
                fontSize: '12px',
                marginTop: '8px',
              }}
            >
              {item.title}
            </p>
            {item.data.map((ite: any) => {
              return <p style={{ fontSize: '12px' }}>{ite}</p>;
            })}
          </>
        );
      })}

      {!info?.suggests || info?.suggests?.length === 0 ? <NoData /> : null}
    </div>
  );
};
export enum RiskTypes {
  malicious = 'malicious',
  pkgs = 'pkgs',
  sensitive_files = 'sensitive_files',
  vulus = 'vulus',
  webshell_info = 'webshell_info',
}
export const classFilters = [
  { text: translations.application_vulnerability, value: 'lang-pkgs' },
  { text: translations.system_FLAW, value: 'os-pkgs' },
];
export let WhiteListTag = (props: any) => {
  let { flag } = props;
  return flag ? (
    <TzTooltip title={translations.white_list_passed}>
      <img src="/images/bai.png" className="bmd" />
    </TzTooltip>
  ) : null;
};
export const leakColumnsFn = (vulnType: any, filteredValue: any, viewConstEnum: any) => {
  let { constView = [], vulnClass = [] } = viewConstEnum;
  let obj: any = {
    vuln: [
      {
        title: translations.vulnerability_information,
        dataIndex: 'name',
        key: 'name',
        width: '20%',
        className: 'task-name',
        render(item: any, row: any) {
          if (!row?.policyDetect) return;
          let { inWhite, exception } = row?.policyDetect;
          return (
            <div>
              <WhiteListTag flag={inWhite} />
              <p
                style={{
                  wordBreak: 'break-all',
                  color: exception ? 'rgba(233, 84, 84, 1)' : '#3e4653',
                }}
              >
                {item}
              </p>
              <TzTag className={'ant-tag-gray small'} style={{ maxWidth: '100%' }}>
                <EllipsisPopover>
                  {translations.runtimePolicy_container_path}：{row.target || '-'}
                </EllipsisPopover>
              </TzTag>
            </div>
          );
        },
      },
      {
        title: translations.kubeScan_severity,
        dataIndex: 'severity',
        filters: filtersOperation,
        className: 'th-center',
        align: 'center',
        render(item: any) {
          return <RenderTag type={item || 'CRITICAL'} className={'t-c'} />;
        },
      },
      {
        title: translations.pkg_info,
        dataIndex: 'pkgName',
        key: 'pkgName',
        render(pkgName: any, _row: any) {
          return (
            <EllipsisPopover lineClamp={2}>
              {pkgName}({_row.pkgVersion})
            </EllipsisPopover>
          );
        },
      },
      {
        title: translations.attack_path,
        dataIndex: 'attackPath',
        width: '12%',
        filters: constView,
        render: (attackPath: any) => find(constView, (item) => item.value === attackPath + '')?.label || '-',
      },
      {
        title: (
          <span className="flex-r-c">
            {translations.scanner_detail_leak_type}
            <TzTooltip title={translations.unStandard.str94}>
              <i className={'icon iconfont icon-wenhao ml4'}></i>
            </TzTooltip>
          </span>
        ),
        dataIndex: 'class',
        width: '14%',
        filters: vulnClass,
        render: (pkgVersion: any) => find(vulnClass, (item) => item.value === pkgVersion + '')?.label || '-',
      },
      {
        title: translations.kernel_vulnerability,
        dataIndex: 'kernelVuln',
        filters: filtersRepairable,
        key: 'kernelVuln',
        className: 'th-center',
        width: '12%',
        align: 'center',
        render: (text: any) => {
          let node = find(filtersRepairable, (item) => item.value === text + '');
          return <span className="pr12">{node?.text || text}</span>;
        },
      },
      {
        title: translations.repairable,
        dataIndex: 'canFixed',
        align: 'center',
        width: '16%',
        className: 'th-center',
        filters: filtersRepairable,
        render: (text: any) => {
          let node = find(filtersRepairable, (item) => item.value === text + '');
          return <span className="pr12">{node?.text || text}</span>;
        },
      },
    ],
    pkg: [
      {
        title: translations.scanner_detail_soft_pack,
        dataIndex: 'pkgName',
        render(pkgName: any, row: any) {
          return <EllipsisPopover lineClamp={2}>{pkgName}</EllipsisPopover>;
        },
      },
      {
        title: translations.scanner_detail_leak_version,
        dataIndex: 'pkgVersion',
      },

      {
        title: translations.runtimePolicy_container_path,
        dataIndex: 'filepath',
        render(filepath: any, _row: any) {
          return <EllipsisPopover lineClamp={2}>{filepath}</EllipsisPopover>;
        },
      },
      {
        title: translations.scanner_detail_severity,
        dataIndex: 'severityOverview',
        key: 'severityOverview',
        width: '400px',
        render(record: any, _row: any) {
          if (!record) return null;
          let obj = record.reduce((pre: any, item: any) => {
            pre[item.severity] = item.count;
            return pre;
          }, {});
          return <Histogram severityHistogram={obj} />;
        },
      },
    ],
    frame: [
      {
        title: translations.developmentFramework,
        dataIndex: 'frame',
        key: 'frame',
      },
      {
        title: translations.scanner_detail_severity,
        dataIndex: 'severityOverview',
        key: 'severityOverview',
        align: 'center',
        render(record: any, _row: any) {
          if (!record) return null;
          let obj = record.reduce((pre: any, item: any) => {
            pre[item.severity] = item.count;
            return pre;
          }, {});
          return <Histogram severityHistogram={obj} />;
        },
      },
    ],
    language: [
      {
        title: translations.programingLanguage,
        dataIndex: 'languageName',
        key: 'languageName',
      },
      {
        title: translations.dependentFilePath,
        dataIndex: 'languagePath',
        key: 'languagePath',
      },
      {
        title: translations.scanner_detail_severity,
        dataIndex: 'severityOverview',
        align: 'center',
        render(record: any, _row: any) {
          if (!record) return null;
          let obj = record.reduce((pre: any, item: any) => {
            pre[item.severity] = item.count;
            return pre;
          }, {});
          return <Histogram severityHistogram={obj} />;
        },
      },
    ],
    gobinary: [
      {
        title: translations.goFileName,
        dataIndex: 'goName',
        key: 'goName',
      },
      {
        title: translations.goFilePath,
        dataIndex: 'goPath',
        key: 'goPath',
      },
      {
        title: translations.scanner_detail_severity,
        dataIndex: 'severityOverview',
        align: 'center',
        render(record: any, _row: any) {
          if (!record) return null;
          let obj = record.reduce((pre: any, item: any) => {
            pre[item.severity] = item.count;
            return pre;
          }, {});
          return <Histogram severityHistogram={obj} />;
        },
      },
    ],
  };
  return obj[vulnType];
};
export let LayerBtn = (props: {
  imageUniqueID: any;
  value: any;
  tagType: any;
  imageFromType: any;
  layerDigest: any;
  securityPolicyIds: any;
}) => {
  let { value = [], ...otherProps } = props;
  const [ctype, setctype] = useState(undefined as questionEnum | undefined);
  let arr = useMemo(() => {
    return value.reduce((pre: any, item: any) => {
      let node = find(registrySelectQuesOp, (ite) => ite.value == item);
      pre.push(
        <TzButton
          type={node?.value === ctype ? 'primary' : 'default'}
          style={{ minWidth: 'initial' }}
          danger
          className={'mr16'}
          onClick={() => setctype((pre) => (node?.value === pre ? undefined : node?.value))}
        >
          {node?.label}
        </TzButton>,
      );
      return pre;
    }, []);
  }, [ctype]);

  const layersInfoList = useMemo(() => {
    if (ctype === questionEnum.exceptionVuln) {
      return <NodeTabLeak {...otherProps} />;
    } else if (ctype === questionEnum.exceptionSensitive) {
      return <NodeTabSensitive {...otherProps} />;
    } else if (ctype === questionEnum.exceptionMalware) {
      return <NodeTabVirus {...otherProps} />;
    } else if (ctype === questionEnum.exceptionWebshell) {
      return <NodeTabWebshell {...otherProps} />;
    } else if (ctype === questionEnum.exceptionLicense) {
      return <NodeTabLicense {...otherProps} />;
    }
  }, [ctype]);
  return (
    <>
      {arr.length ? (
        <div className="mt8">
          <span className="family-s mr16 fw40">{translations.scanner_detail_risk_dots}:</span>
          {arr}
        </div>
      ) : null}
      <div>{layersInfoList}</div>
    </>
  );
};

export let NodePkgsInfo = (props: { imageFromType: tabType; imageUniqueID: string; uniqueID: string }) => {
  const [filteredValue, setFilteredValue] = useState<any>({});
  const reqFunPkgsInfoVuln = useCallback(
    (pagination: TablePaginationConfig, filters: any) => {
      setFilteredValue(filters);
      const { current = 1, pageSize = 10 } = pagination;
      const offset = (current - 1) * pageSize;
      const pageParams = {
        offset,
        limit: pageSize,
        type: 'vuln',
        imageUniqueID: props.imageUniqueID,
        pkgUniqueID: props.uniqueID,
        imageFromType: props.imageFromType,
        ...filters,
      };
      let fn = props.imageFromType == tabType.deploy ? vulnsList : imagesDetailVulns;
      return fn(pageParams).pipe(
        map((res: any) => {
          let items = res.getItems();
          return {
            data: items,
            total: res.data?.totalItems,
          };
        }),
      );
    },
    [props.imageUniqueID, props.uniqueID],
  );

  let constView = useViewConst({ constType: 'vulnAttackPath' });
  let vulnClass = useViewConst({ constType: 'vulnClass' });
  let pkgsLeakColumns: any = useMemo(() => {
    return [
      {
        title: translations.vulnerability_information,
        dataIndex: 'name',
        render(item: any, row: any) {
          return (
            <>
              <p style={{ wordBreak: 'break-all' }}>{item}</p>
              <TzTag
                className={'ant-tag ant-tag-default tz-tag small mt4'}
                style={{ color: '#6c7480', maxWidth: '100%' }}
              >
                <EllipsisPopover>
                  {translations.runtimePolicy_container_path}：{row.target}
                </EllipsisPopover>
              </TzTag>
            </>
          );
        },
      },
      {
        title: translations.kubeScan_severity,
        dataIndex: 'severity',
        filters: filtersOperation,
        filteredValue: filteredValue.severity || null,
        width: '16%',
        className: 'th-center',
        align: 'center',
        render(item: any) {
          return <RenderTag type={item || 'CRITICAL'} />;
        },
      },
      {
        title: translations.pkg_info,
        dataIndex: 'pkgName',
        key: 'pkgName',
        width: localLang == 'en' ? '19%' : '13%',
        render(pkgName: any, _row: any) {
          return (
            <>
              <EllipsisPopover lineClamp={2}>{pkgName}</EllipsisPopover>
              <EllipsisPopover lineClamp={2}>{_row.pkgVersion}</EllipsisPopover>
            </>
          );
        },
      },
      {
        title: translations.attack_path,
        dataIndex: 'attackPath',
        key: 'attackPath',
        filters: constView,
        filteredValue: filteredValue.attackPath || null,
        width: '16%',
        render(attackPath: any, _row: any) {
          let node = constView.find((item: { value: any }) => {
            return item.value === attackPath;
          });
          return <span>{node?.label}</span>;
        },
      },
      {
        title: translations.scanner_detail_leak_type,
        dataIndex: 'class',
        width: localLang == 'en' ? '10%' : '13%',
        filters: vulnClass,
        render: (pkgVersion: any) => find(vulnClass, (item) => item.value === pkgVersion + '')?.label || '-',
      },
      {
        title: translations.kernel_vulnerability,
        dataIndex: 'kernelVuln',
        filters: filtersRepairable,
        width: localLang == 'en' ? '15%' : '13%',
        className: 'th-center',
        align: 'center',
        filteredValue: filteredValue.kernelVuln || null,
        key: 'kernelVuln',
        render: (text: any) => {
          let node = find(filtersRepairable, (item) => item.value === text + '');
          return <span className="pr12">{node?.text || text}</span>;
        },
      },
      {
        title: translations.repairable,
        dataIndex: 'canFixed',
        width: '16%',
        className: 'th-center',
        align: 'center',
        filters: filtersRepairable,
        filteredValue: filteredValue.canFixed || null,
        render: (text: any) => {
          let node = find(filtersRepairable, (item) => item.value === text + '');
          return <span className="pr12">{node?.text || text}</span>;
        },
      },
    ];
  }, [filteredValue, constView, vulnClass]);
  return (
    <>
      <TzTableServerPage
        columns={pkgsLeakColumns}
        tableLayout={'fixed'}
        onRow={(record) => {
          return {
            onClick: async (event) => {
              let dw: any = await TzDrawerFn({
                className: 'drawer-body0',
                title: record.name,
                children: <VulnDetailInfo {...record} getDataFn={imagesVulnDetail} />,
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

const ImagesDetailInfo = (props: any) => {
  const location = useLocation();
  const navigate = useNavigate();
  const l = useLocation();
  const [result] = useSearchParams();
  let [query, setQuery] = useSetState<{
    imageFromType: any;
    imageUniqueID?: any;
    securityPolicyIds?: any[];
  }>({
    imageFromType: result.get('imageFromType'),
    imageUniqueID: result.get('imageUniqueID'),
  });
  const [info, setInfo] = useState<any>(null);
  const [imagesDigest, setImagesDigest] = useState<any>([]);
  const [keyword, setKeyword] = useState<any>(null);
  const [associateContainersKeyword, setAssociateContainersKeyword] = useState<any>(null);
  const setLayout = useLayoutMainSearchWid({});
  const [issueStatistic, setIssueStatistic] = useState<any>({});
  const listComp = useRef<any>(null);
  const lineContainerRef = useRef<any>(null);
  let leak = useRef<any>(null);
  let sensitive = useRef<any>(null);
  let virus = useRef<any>(null);
  let webshell = useRef<any>(null);
  let license = useRef<any>(null);
  let pkgs = useRef<any>(null);
  let envPath = useRef<any>(null);
  const items = [
    {
      href: '#statistics',
      title: <EllipsisPopover>{translations.clusterGraphList_detail_base}</EllipsisPopover>,
    },
    {
      href: '#base',
      title: <EllipsisPopover>{translations.clusterGraphList_detail_info}</EllipsisPopover>,
    },
    {
      href: `#${questionEnum.exceptionVuln}`,
      title: <EllipsisPopover>{translations.scanner_images_vulnerabilities}</EllipsisPopover>,
    },
    {
      href: `#${questionEnum.exceptionSensitive}`,
      title: <EllipsisPopover>{translations.scanner_images_sensitive}</EllipsisPopover>,
    },
    {
      href: `#${questionEnum.exceptionMalware}`,
      title: <EllipsisPopover>{translations.virus}</EllipsisPopover>,
    },
    {
      href: `#${questionEnum.exceptionWebshell}`,
      title: <EllipsisPopover>{translations.scanner_overview_webshell}</EllipsisPopover>,
    },
    {
      href: `#${questionEnum.exceptionPKG}`,
      title: <EllipsisPopover>{translations.scanner_detail_soft_pack}</EllipsisPopover>,
    },
    {
      href: `#${questionEnum.exceptionLicense}`,
      title: <EllipsisPopover>{translations.license_file_reference}</EllipsisPopover>,
    },
    {
      href: `#${questionEnum.exceptionEnv}`,
      title: <EllipsisPopover>{translations.scanner_detail_envPath}</EllipsisPopover>,
    },
    {
      href: '#layer',
      title: <EllipsisPopover>{translations.risk_backtracking}</EllipsisPopover>,
    },
  ];
  const dataInfoList = useMemo(() => {
    if (!info) return [];
    let library = {
      registryName: translations.library + '：',
      digest: 'Digest：',
      online: translations.compliances_breakdown_dotstatus + '：',
      size: translations.scanner_detail_size + '：',
      os: translations.oS_version + '：',
      imageAttr: translations.attribute + '：',
      bootUser: translations.start_user + '：',
      pullCount: translations.number_downloads + '：',
      buildAt: translations.clusterManage_createtime + '：',
    };
    let node = {
      nodeHostname: translations.compliances_breakdown_statusName + '：',
      nodeClusterName: translations.clusterManage_key + '：',
      digest: 'Digest：',
      online: translations.compliances_breakdown_dotstatus + '：',
      size: translations.scanner_detail_size + '：',
      os: translations.oS_version + '：',
      bootUser: translations.start_user + '：',
      imageAttr: translations.attribute + '：',
    };
    let obj: any = {
      lastSyncAt: translations.sys_time + '：',
      lastScanAt: translations.last_scan_time_C + '：',
      totalPolicy: translations.security_policy + '：',
      riskPolicy: translations.hitPolicy + '：',
    };
    if (query.imageFromType === tabType.registry) {
      obj = { ...library, ...obj };
    } else if (query.imageFromType === tabType.node) {
      obj = { ...node, ...obj };
    }
    return Object.keys(obj).map((item) => {
      let o: any = {
        title: obj[item] || '-',
        content: info[item] || '-',
      };
      if ('registryName' === item) {
        o['render'] = (row: any) => {
          return `${info[item]}(${info['registryUrl']})`;
        };
      }
      if ('nodeHostname' === item) {
        o['render'] = () => {
          return info[item];
        };
      }
      if ('online' === item) {
        o['render'] = (row: any) => {
          return <RenderTag type={info[item] ? 'online' : 'offline'} />;
        };
      }
      if ('imageAttr' === item) {
        o['render'] = (row: any) => {
          return <ImageAttrTd {...info['imageAttr']} imageFromType={query.imageFromType} />;
        };
      }
      if ('digest' === item) {
        o['render'] = (_row: any) => {
          return <TextHoverCopy text={info[item]} />;
        };
      }
      if ('os' === item) {
        o['render'] = () => {
          return <OSVersion os={info[item]} />;
        };
      }
      if ('lastSyncAt' === item || 'lastScanAt' === item || 'buildAt' === item) {
        o['render'] = () => {
          return getTime(info[item]);
        };
      }
      if ('totalPolicy' === item || 'riskPolicy' === item) {
        o['render'] = () => {
          if (info[item]) {
            let arr = info[item]
              .map((ite: any) => {
                return (
                  <TzButton
                    style={{ maxWidth: '99%' }}
                    className={'ml0'}
                    type={'text'}
                    onClick={async () => {
                      if (ite.name) {
                        let dw: any = await TzDrawerFn({
                          className: 'drawer-body0',
                          width: 560,
                          title: <span style={{ paddingRight: '20px', display: 'inline-block' }}>{ite.name}</span>,
                          children: (
                            <PolicySnapshot
                              imageFromType={query.imageFromType}
                              id={query.imageUniqueID}
                              uniqueID={ite.uniqueID}
                            />
                          ),
                        });
                        dw.show();
                      }
                    }}
                  >
                    <EllipsisPopover>{ite.name}</EllipsisPopover>
                  </TzButton>
                );
              })
              .reduce((pre: any, item: any) => {
                pre.push(item, ',');
                return pre;
              }, []);
            arr.pop();
            return (
              <p className={'flex-r ml-8'} style={{ flexWrap: 'wrap', width: '100%' }}>
                {arr.length != 0 ? arr : <span className={'ml8'}>-</span>}
              </p>
            );
          } else {
            return '-';
          }
        };
      }
      return o;
    });
  }, [info, query]);
  const setHeader = useMemoizedFn(() => {
    if (info) {
      Store.header.next({
        title: (
          <div className="flex-r-c">
            {info.fullRepoName}:{info.tag}
            <span style={{ color: 'rgba(233, 84, 84, 1)', height: '28px' }} className="ml12">
              {info.riskScore}
              <span className="f12 ml4">{translations.imageReject_score}</span>
            </span>
            <TzTooltip title={translations.scanner_detail_scoreRules}>
              <i
                className={'icon iconfont icon-wenhao ml4'}
                style={{ color: '#B3BAC6' }}
                onClick={() => {
                  TzConfirm({
                    width: 800,
                    title: translations.scanner_detail_scoreRules,
                    className: 'footer_null',
                    content: <ScoreRules />,
                  });
                }}
              />
            </TzTooltip>
          </div>
        ),
        extra: (
          <span>
            <TzButton
              disabled={info.scanStatus === scanStatus.pending}
              onClick={() => {
                imageScanTaskFn({ imageIds: [info.id], imageFromType: query.imageFromType });
              }}
            >
              {translations.scanner_images_scann}
            </TzButton>
            <TzButton
              className={` ml16 ${query.imageFromType === tabType.registry ? 'mr16' : ''}`}
              onClick={() => {
                fetchReport({ imageIds: [info.id], imageFromType: query.imageFromType });
              }}
            >
              {translations.export_report}
            </TzButton>
            {query.imageFromType === tabType.registry ? (
              <BaseImageOperation
                callback={() => {
                  getDetailBaseFn(query);
                }}
                imageType={info?.imageAttr.imageType}
                imageUniqueID={info?.imageUniqueID}
              />
            ) : null}
          </span>
        ),
        onBack: () => {
          navigate(-1);
        },
        footer: null,
      });
    }
  });
  useEffect(setHeader, [info, query, l]);
  let breadcrumb = useMemo(() => {
    return [
      {
        children: translations.mirror_lifecycle,
        href: Routes.ImagesCILifeCycle,
      },
      {
        children:
          query.imageFromType === tabType.registry
            ? translations.scanner_report_repoImage
            : query.imageFromType === tabType.node
              ? translations.scanner_report_nodeImage
              : translations.imageReject_toonline,
        href: Routes.ImagesCILifeCycle + `?tab=${query.imageFromType}`,
      },
      {
        children: translations.scanner_detail_title,
      },
    ];
  }, [query]);
  const setBreadcrumb = useMemoizedFn(() => {
    Store.breadcrumb.next(breadcrumb);
  });
  useEffect(() => {
    setBreadcrumb();
  }, [setBreadcrumb, l]);

  const lineContainerColumns = useMemo(() => {
    return [
      {
        title: translations.clusterGraphList_containerDetail_containerInfo,
        dataIndex: 'container_name',
        width: '50%',
        render: (_text: string, row: any) => {
          return (
            <TzTableTzTdInfoAssets
              name={row.name}
              clusterName={getClusterName(row.clusterKey)}
              nodeName={row.nodeName}
              namespace={row.namespace}
              resourceName={row.resourceName}
              podName={row.podName}
            />
          );
        },
      },
      {
        title: translations.scanner_report_containerType,
        dataIndex: 'k8sManaged',
        render: (item: any, row: any) => {
          return (
            <>
              {item
                ? translations.clusterGraphList_containerInfo_k8scontainer
                : translations.clusterGraphList_containerInfo_unk8scontainer}
            </>
          );
        },
      },
      {
        title: translations.compliances_breakdown_dotstatus,
        dataIndex: 'status',
        render: (item: any, row: any) => {
          if (!item && String(item) !== '0') return null;
          return <RenderTag type={statusValToKey[item]} />;
        },
      },
      {
        title: translations.clusterManage_createtime,
        dataIndex: 'createdAt',
        width: '14%',
        render: (_text: string, row: any) => getTime(_text),
      },
    ];
  }, []);
  let isBaseImage = useMemo(() => {
    return info?.imageAttr.imageType === ImageType.BASE;
  }, [info]);

  let relateTableColumns = useImageColumns({
    imageFromType: query.imageFromType,
    tableRef: listComp,
  });
  let lineContainerReqFun = useCallback(
    (pagination: TablePaginationConfig) => {
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
      let pageParams = merge({}, query, {
        limit: pageSize,
        offset,
        keyword: associateContainersKeyword,
        imageUniqueID: info.imageUniqueID,
      });
      return getResourcesByImage(pageParams).pipe(
        map((res: any) => {
          const items = res.getItems();
          return {
            data: items,
            total: res?.data?.totalItems || 0,
          };
        }),
      );
    },
    [query, info, associateContainersKeyword],
  );
  const reqFunImageList = useCallback(
    (pagination: TablePaginationConfig) => {
      if (!query.imageUniqueID || !query.imageFromType || !query.securityPolicyIds) {
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
      let pageParams = merge(
        {
          offset,
          limit: pageSize,
          keyword,
        },
        query,
      );
      const fetchData = isBaseImage ? getRelatedAppImageList : getRelatedBaseImageList;
      return fetchData(pageParams).pipe(
        map((res: any) => {
          const items = res.getItems();
          return {
            data: items,
            total: res?.data?.totalItems || 0,
          };
        }),
      );
    },
    [JSON.stringify(query), isBaseImage, keyword],
  );

  const getScannerImagesDigestLayers = useCallback(() => {
    detailLayers(query).subscribe((res) => {
      let items = res.getItems().map((item, index) => {
        let { securityIssue = [], digest } = item;
        return merge(item, {
          ...query,
          layerDigest: digest,
          value: securityIssue.map((it: { value: any }) => it.value),
        });
      });
      setImagesDigest(items);
    });
  }, [query]);
  let actionsList = useMemo(() => {
    if (!imagesDigest) return undefined;
    return imagesDigest.map((item: any, index: number) => {
      let { created, createdBy, layerDigest, value, tagType, ...otherItems } = item;
      item['children'] = (
        <>
          <div>
            <p className={'mb8'} style={{ fontSize: '16px', fontWeight: 550, color: '#3e4653' }}>
              {created ? moment(created).format('YYYY-MM-DD HH:mm:ss') : '-'}
            </p>
            <p>
              {translations.scanner_detail_image_digest}：{layerDigest}
            </p>
            <p>
              {translations.scanner_detail_created_by}：{createdBy}
            </p>
            <LayerBtn {...otherItems} value={value} layerDigest={layerDigest} />
          </div>
        </>
      );
      return item;
    });
  }, [imagesDigest]);
  let getImagesDetailIssueStatistic = useCallback(() => {
    imagesDetailIssueStatistic(query).subscribe((res) => {
      if (res.error) return;
      let item = res.getItem();
      let { total, risk } = item;
      let o = Object.keys(total).reduce((pre: any, ite) => {
        pre[ite] = {
          total: total[ite],
          risk: risk[ite],
        };
        return pre;
      }, {});
      setIssueStatistic(o);
    });
  }, [query]);
  useUpdateEffect(() => {
    if (!query.imageUniqueID) return;
    // getdetailBase();
    getScannerImagesDigestLayers();
    getImagesDetailIssueStatistic();
  }, [JSON.stringify(query)]);

  let getDetailBaseFn = useMemoizedFn((prams) => {
    detailBase(prams).subscribe((res) => {
      if (res.error) return;
      let info = res.getItem();
      setInfo(info);
      setQuery({ ...prams, securityPolicyIds: info.totalPolicy.map((ite: any) => ite.id) });
    });
  });
  useEffect(() => {
    setQuery({ imageUniqueID: result.get('imageUniqueID') });
    getDetailBaseFn({
      imageUniqueID: result.get('imageUniqueID'),
      imageFromType: result.get('imageFromType'),
    });
  }, [location]);

  let getComponents = useMemo(() => {
    if (!keys(issueStatistic).length || !query?.securityPolicyIds) return;
    return (
      <>
        <NodeTabLeak
          ref={leak}
          {...query}
          tagType={issueStatistic[questionEnum.exceptionVuln]?.risk ? 'unsafe' : 'safe'}
        />
        <NodeTabSensitive
          ref={sensitive}
          {...query}
          tagType={issueStatistic[questionEnum.exceptionSensitive]?.risk ? 'unsafe' : 'safe'}
        />
        <NodeTabVirus
          ref={virus}
          {...query}
          tagType={issueStatistic[questionEnum.exceptionMalware]?.risk ? 'unsafe' : 'safe'}
        />
        <NodeTabWebshell
          ref={webshell}
          {...query}
          tagType={issueStatistic[questionEnum.exceptionWebshell]?.risk ? 'unsafe' : 'safe'}
        />
        <NodeTabPkgs
          ref={pkgs}
          {...query}
          tagType={issueStatistic[questionEnum.exceptionPKG]?.risk ? 'unsafe' : 'safe'}
        />
        <NodeTabLicense
          ref={license}
          {...query}
          tagType={issueStatistic[questionEnum.exceptionLicense]?.risk ? 'unsafe' : 'safe'}
        />
        <NodeTabEnvPath
          ref={envPath}
          {...query}
          tagType={issueStatistic[questionEnum.exceptionEnv]?.risk ? 'unsafe' : 'safe'}
        />
      </>
    );
  }, [issueStatistic, query.securityPolicyIds]);

  let getRiskNumNode = useCallback(
    (type: questionEnum, data: { nodeTitle: any }) => {
      let { total, risk } = issueStatistic[type] || {};
      let { nodeTitle } = data;
      //1 root 0非root
      if (!total && type === questionEnum.exceptionBoot) {
        nodeTitle = translations.started_unroot_user;
      }
      //1 不可信 0可信
      if (!total && type === questionEnum.untrusted) {
        nodeTitle = translations.trustedImage;
      }

      //1 不在仓库 0在仓库
      if (!total && type === questionEnum.notInRegistry) {
        nodeTitle = translations.scanner_report_repoImage;
      }
      return (
        <>
          <p>
            {[questionEnum.untrusted, questionEnum.exceptionBoot, questionEnum.notInRegistry].includes(
              type,
            ) ? null : type === questionEnum.exceptionMalware || type === questionEnum.exceptionLicense ? (
              <span className={'risk-num'}>{total}</span>
            ) : (
              <>
                <span className={'risk-num'}>{risk}</span>
                {total ? (
                  <>
                    /
                    <span className={'total-num'} style={{ color: 'rgba(62, 70, 83, 1)' }}>
                      {total}
                    </span>
                  </>
                ) : null}
              </>
            )}
          </p>
          <p className={'f12 node-statistics-info'} style={{ wordBreak: 'break-all' }}>
            {nodeTitle}
          </p>
        </>
      );
    },
    [issueStatistic],
  );
  const reportContentOpts = useMemo(() => {
    return info?.totalPolicy.map((t: any) => {
      return {
        ...t,
        label: t.name,
        value: t.id,
      };
    });
  }, [info?.totalPolicy]);
  let issueStatisticDom = useMemo(() => {
    let questionIcon = query.imageFromType === tabType.registry ? registryQuestionIcon : nodeQuestionIcon;
    return (
      <TzRow gutter={[16, 16]} className={'mb20'}>
        {keys(questionIcon).map((item) => {
          if (!keys(issueStatistic).length) return null;
          let risk = !!issueStatistic[item]?.risk;
          return (
            <TzCol span={6}>
              <TzCard
                bodyStyle={{ padding: '12px 20px' }}
                className={`issue-statistic-card cursor-p ${item}`}
                onClick={() => {
                  if (item === questionEnum.exceptionPkgLicense) {
                    $('#layoutMain').animate(
                      {
                        scrollTop: $('#exceptionPKG').offset().top - 100,
                      },
                      { duration: 300, easing: 'swing' },
                    );
                  } else {
                    $('#' + item).length != 0 &&
                      $('#layoutMain').animate(
                        {
                          scrollTop: $('#' + item).offset().top - 100,
                        },
                        { duration: 300, easing: 'swing' },
                      );
                  }
                }}
              >
                <div className={'flex-r-c'} style={{ width: '100%', height: '48px', justifyContent: 'end' }}>
                  <div className="p-a ml20">{getRiskNumNode(item as questionEnum, questionIcon[item])}</div>
                  <div
                    className={'node-issue-statistic-icon'}
                    style={{
                      background: risk ? 'rgba(233, 84, 84, 0.10)' : 'rgba(82, 196, 26, 0.10)',
                    }}
                  >
                    <i
                      className={`icon iconfont ${questionIcon[item].icon} f24 mt10`}
                      style={{
                        color: risk ? 'rgba(233, 84, 84, 1)' : 'rgba(82, 196, 26,1)',
                        lineHeight: '20px',
                      }}
                    ></i>
                  </div>
                </div>
              </TzCard>
            </TzCol>
          );
        })}
      </TzRow>
    );
  }, [query.imageFromType, issueStatistic]);

  useEffect(() => {
    let timer: string | number | NodeJS.Timeout | undefined;
    const sub = Store.imagesCILifeCycleTag.subscribe((val) => {
      if (val) {
        timer = setTimeout(() => {
          Store.imagesCILifeCycleTag.next('');
          $('#' + val).length &&
            $('#layoutMain').animate(
              {
                scrollTop: $('#' + val).offset().top - 100,
              },
              { duration: 300, easing: 'swing' },
            );
        }, 1000);
      }
    });
    return () => {
      sub?.unsubscribe();
      clearTimeout(timer);
    };
  }, []);
  let { jump } = useNavigatereFresh();
  let { getPageKey } = useAnchorItem();
  return (
    <>
      <div className={`mlr32 images-detail mt4 ${query.imageFromType}`}>
        <div className="flex-r">
          <div className="flex-c mb40" style={{ flex: 1 }}>
            <div id={getPageKey('statistics')}>
              {reportContentOpts?.length ? (
                <p className={'mb12 statistics-group'}>
                  <TzCheckboxGroup
                    value={query.securityPolicyIds}
                    options={reportContentOpts}
                    onChange={(securityPolicyIds) => {
                      setQuery({ securityPolicyIds });
                    }}
                  />
                </p>
              ) : null}
              {issueStatisticDom}
            </div>
            <TzCard
              id={getPageKey('base')}
              title={translations.compliances_breakdown_taskbaseinfo}
              bodyStyle={{ paddingTop: '4px' }}
            >
              <ArtTemplateDataInfo data={dataInfoList.slice(0, -2)} span={2} rowProps={{ gutter: [0, 0] }} />
              <ArtTemplateDataInfo data={dataInfoList.slice(-2)} span={1} rowProps={{ gutter: [0, 0] }} />
              <div>
                <PageTitle title={translations.safety_advice} className={'mb8 second-title'} />
                <FixSuggestion {...info} />
                {query.imageFromType === tabType.registry ? (
                  <>
                    <PageTitle
                      title={translations.scanner_detail_line_container}
                      className={'mb8 mt20 second-title'}
                      extra={
                        <TzInputSearch
                          style={{ width: setLayout }}
                          placeholder={translations.enter_container_resource}
                          onChange={setAssociateContainersKeyword}
                        />
                      }
                    />
                    <TzTableServerPage
                      columns={lineContainerColumns}
                      reqFun={lineContainerReqFun}
                      ref={lineContainerRef}
                      rowKey={'id'}
                      onRow={(record) => {
                        return {
                          onClick: () => {
                            let { id, clusterKey } = record;
                            jump(
                              `${Routes.RiskGraphListContainerDetail}?containerID=${id}&ClusterID=${clusterKey}`,
                              'RiskGraphListContainerDetail',
                            );
                          },
                        };
                      }}
                    />
                    <PageTitle
                      title={
                        isBaseImage
                          ? translations.scanner_detail_applicationImage
                          : translations.scanner_detail_baseImage
                      }
                      className={'mb8 mt20 second-title'}
                      extra={
                        <TzInputSearch
                          style={{ width: setLayout, fontSize: 14 }}
                          placeholder={translations.scanner_config_placeholder}
                          onSearch={(val) => {
                            setKeyword(val);
                          }}
                        />
                      }
                    />
                    <TzTableServerPage
                      columns={relateTableColumns.slice(0, -1)}
                      reqFun={reqFunImageList}
                      ref={listComp}
                      defaultPagination={{ defaultPageSize: 5 }}
                      equalServerPageAnyway={false}
                      onRow={(record) => {
                        let { imageUniqueID } = record;
                        return {
                          onClick: () => {
                            jump(
                              `${Routes.RegistryImagesDetailInfo}?imageUniqueID=${imageUniqueID}&imageFromType=${query.imageFromType}`,
                              'RegistryImagesDetailInfo',
                            );
                          },
                        };
                      }}
                    />
                  </>
                ) : null}
              </div>
            </TzCard>
            {getComponents}
            <TzCard
              className={'layer mt20'}
              title={translations.risk_backtracking}
              id={getPageKey('layer')}
              bodyStyle={{ paddingTop: '7px', paddingLeft: '24px' }}
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
