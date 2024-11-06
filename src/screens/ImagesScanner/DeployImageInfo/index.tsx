import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import './index.scss';
import { TzButton } from '../../../components/tz-button';
import { TzCard } from '../../../components/tz-card';
import { TzTableServerPage } from '../../../components/tz-table';
import { TablePaginationConfig } from 'antd/lib/table';
import { merge, get, find, isEqual, keys } from 'lodash';
import { RenderTag, TzTag } from '../../../components/tz-tag';
import {
  detailBase,
  getRelatedBaseImageList,
  detailLayers,
  imagesDetailIssueStatistic,
  detailIssueOverview,
  getRelatedAppImageList,
} from '../../../services/DataService';
import { map, tap } from 'rxjs/operators';
import moment from 'moment';
import { copyText, getTime, parseGetMethodParams } from '../../../helpers/until';
import { TzInputSearch } from '../../../components/tz-input-search';
import { Histogram, PageTitle } from '../ImagesCI/CI';
import { TzTimelineNoraml } from '../../../components/tz-timeline';
import { localLang, translations } from '../../../translations/translations';
import { Store } from '../../../services/StoreService';
import { TzDrawerFn } from '../../../components/tz-drawer';
import {
  sannStatus,
  SannStatusDom,
  SecurityIssueTd,
  questionEnum,
  imageAttrOp,
  ImageAttrTd,
} from '../components/ImagesScannerDataList';
import { TextHoverCopy } from '../../AlertCenter/AlertCenterScreen';
import EllipsisPopover from '../../../components/ellipsisPopover/ellipsisPopover';
import { ImageType } from '../definition';
import { Routes } from '../../../Routes';
import useLayoutMainSearchWid from '../../../helpers/useLayoutMainSearchWid';
import TzAnchor, { useAnchorItem } from '../../../components/ComponentsLibrary/TzAnchor';
import ArtTemplateDataInfo from '../../../components/ComponentsLibrary/ArtTemplateDataInfo';
// import { useActivate } from 'react-activation';
import { useMemoizedFn, useMount, useUpdateEffect } from 'ahooks';
import { tabType } from '../ImagesScannerScreen';
import { setWhiteList } from '../../ImageReject';
import { FixSuggestion, LayerBtn, OSVersion } from '../LifeCycle';
import { Vuln } from './components/Vuln';
import { Env } from './components/Env';
import { License } from './components/License';
import { Pkgs } from './components/Pkgs';
import { Webshell } from './components/Webshell';
import { Sensitive } from './components/Sensitive';
import { Virus } from './components/Virus';
import { PolicySnapshot } from '../LifeCycle/PolicySnapshot';
import { useNavigatereFresh } from '../../../helpers/useNavigatereFresh';
import useImageColumns from '../components/ImagesScannerDataList/useImageColumns';
import { Layer } from './components/Layer';

const DeployImageInfo = (props: any) => {
  const navigate = useNavigate();
  const [result] = useSearchParams();
  let [query, setQuery] = useState<{
    imageFromType: any;
    deployRecordID?: any;
    securityPolicyIds?: any;
  }>({
    deployRecordID: result.get('deployRecordID'),
    imageFromType: tabType.deploy,
  });
  const [info, setInfo] = useState<any>(null);
  const [keyword, setKeyword] = useState<any>(null);
  const setLayout = useLayoutMainSearchWid({});
  const [issueStatistic, setIssueStatistic] = useState<any>({});

  <Sensitive {...query} tagType={issueStatistic[questionEnum.exceptionSensitive]} />;
  let { pageKey } = useAnchorItem();
  const items = useMemo(
    () =>
      [
        {
          href: `#${questionEnum.exceptionVuln}`,
          title: <EllipsisPopover>{translations.scanner_images_vulnerabilities}</EllipsisPopover>,
          component: <Vuln {...query} tagType={issueStatistic[questionEnum.exceptionVuln]} />,
        },
        {
          href: `#${questionEnum.exceptionSensitive}`,
          title: <EllipsisPopover>{translations.scanner_images_sensitive}</EllipsisPopover>,
          component: <Sensitive {...query} tagType={issueStatistic[questionEnum.exceptionSensitive]} />,
        },
        {
          href: `#${questionEnum.exceptionMalware}`,
          title: <EllipsisPopover>{translations.virus}</EllipsisPopover>,
          component: <Virus {...query} tagType={issueStatistic[questionEnum.exceptionMalware]} />,
        },
        {
          href: `#${questionEnum.exceptionWebshell}`,
          title: <EllipsisPopover>{translations.scanner_overview_webshell}</EllipsisPopover>,
          component: <Webshell {...query} tagType={issueStatistic[questionEnum.exceptionWebshell]} />,
        },
        {
          href: `#${questionEnum.exceptionPKG}`,
          title: <EllipsisPopover>{translations.risk_packages}</EllipsisPopover>,
          component: <Pkgs {...query} tagType={issueStatistic[questionEnum.exceptionPKG]} />,
        },
        {
          href: `#${questionEnum.exceptionLicense}`,
          title: <EllipsisPopover>{translations.risk_license_file}</EllipsisPopover>,
          component: <License {...query} tagType={issueStatistic[questionEnum.exceptionLicense]} />,
        },
        {
          href: `#${questionEnum.exceptionEnv}`,
          title: <EllipsisPopover>{translations.scanner_overview_envs}</EllipsisPopover>,
          component: <Env {...query} tagType={issueStatistic[questionEnum.exceptionEnv]} />,
        },
        {
          href: '#layer',
          title: <EllipsisPopover>{translations.risk_backtracking}</EllipsisPopover>,
          component: <Layer {...query} />,
        },
      ].filter((item) => {
        let key = item.href.substring(1).replace(`${pageKey}_`, '');
        return key === 'layer' || !!issueStatistic[key];
      }),
    [query, issueStatistic],
  );
  let anchorItems = useMemo(() => {
    return [
      {
        href: '#base',
        title: <EllipsisPopover>{translations.clusterGraphList_detail_info}</EllipsisPopover>,
      },
      ...items,
    ];
  }, [items]);
  const dataInfoList = useMemo(() => {
    if (!info) return [];
    let obj: any = {
      registryName: translations.library + '：',
      digest: 'Digest：',
      size: translations.scanner_detail_size + '：',
      imageAttr: translations.attribute + '：',
      os: translations.oS_version + '：',
      bootUser: translations.start_user + '：',
      createdAt: translations.detection_time + '：',
      totalPolicy: translations.security_policy + '：',
      riskPolicy: translations.hitPolicy + '：',
      securityIssue: translations.safetyProblem + '：',
    };
    return Object.keys(obj).map((item) => {
      let o: any = {
        title: obj[item] || '-',
        content: info[item] || '-',
      };
      if ('registryName' === item) {
        o['render'] = (row: any) => {
          return `${info['registryUrl']}`;
        };
      }
      if ('imageAttr' === item) {
        o['render'] = (row: any) => {
          return <ImageAttrTd {...info['imageAttr']} imageFromType={tabType.deploy} />;
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
      if ('createdAt' === item) {
        o['render'] = () => {
          return getTime(info[item]);
        };
      }
      if ('riskPolicy' === item || 'totalPolicy' === item) {
        o['className'] = 'item-flex-start';
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
                          children: <PolicySnapshot imageFromType={query.imageFromType} uniqueID={ite.uniqueID} />,
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
      if ('securityIssue' === item) {
        o['render'] = () => {
          return <SecurityIssueTd securityIssue={info[item]} imageFromType={tabType.deploy} />;
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
            <RenderTag
              className="ml12"
              type={
                info?.white
                  ? 'normalPass'
                  : info?.action === 'block'
                    ? 'policyblock'
                    : info?.action === 'alarm'
                      ? 'policyalert'
                      : 'pass'
              }
            />
          </div>
        ),
        extra: info.inWhite ? null : (
          <TzButton
            className="ml-8"
            onClick={(event) => {
              event.stopPropagation();
              setWhiteList({ type: 'add', imageName: [info.registryUrl + ':' + info.tag] }, () => {
                getdetailBase();
              });
            }}
          >
            {translations.increase_white_list}
          </TzButton>
        ),
        onBack: () => {
          navigate(-1);
        },
      });
    }
  });
  let l = useLocation();
  useEffect(setHeader, [info, l]);
  let relateTableColumns = useImageColumns({
    imageFromType: query.imageFromType,
  });
  let isBaseImage = useMemo(() => {
    return info?.imageAttr.imageType === ImageType.BASE;
  }, [info]);
  const reqFunImageList = useCallback(
    (pagination: TablePaginationConfig) => {
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
    [query, isBaseImage, keyword],
  );
  let getdetailBase = useCallback(() => {
    detailBase(query).subscribe((res) => {
      let info = res.getItem();
      setInfo(info);
      setQuery((pre) => {
        return {
          ...pre,
          securityPolicyIds: info.totalPolicy.map((ite: any) => ite.id),
        };
      });
    });
  }, [query]);
  let getImagesDetailIssueStatistic = useCallback(() => {
    detailIssueOverview(query).subscribe((res) => {
      if (res.error) return;
      let item = res.getItem();
      setIssueStatistic(item);
    });
  }, [query]);
  useUpdateEffect(() => {
    getImagesDetailIssueStatistic();
  }, [query]);
  useMount(() => {
    getdetailBase();
  });

  let { jump } = useNavigatereFresh();
  let { getPageKey } = useAnchorItem();
  return (
    <>
      <div className={`deploy-image-info mlr32 mt4`}>
        <div className="flex-r">
          <div className="flex-c mb40" style={{ flex: 1 }}>
            <TzCard
              id={getPageKey('base')}
              title={translations.compliances_breakdown_taskbaseinfo}
              bodyStyle={{ paddingTop: '4px' }}
            >
              <ArtTemplateDataInfo data={dataInfoList.slice(0, -3)} span={2} rowProps={{ gutter: [0, 0] }} />
              <ArtTemplateDataInfo data={dataInfoList.slice(-3)} span={1} rowProps={{ gutter: [0, 0] }} />
              <PageTitle title={translations.safety_advice} className={'mb8 second-title'} />
              <FixSuggestion {...info} />
              <PageTitle
                title={
                  isBaseImage ? translations.scanner_detail_applicationImage : translations.scanner_detail_baseImage
                }
                className={'mb8 mt24 second-title'}
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
                defaultPagination={{ defaultPageSize: 5 }}
                equalServerPageAnyway={false}
                onRow={(record) => {
                  let { imageUniqueID } = record;
                  return {
                    onClick: () => {
                      jump(
                        `${Routes.RegistryImagesDetailInfo}?imageUniqueID=${imageUniqueID}&imageFromType=${tabType.registry}`,
                        'RegistryImagesDetailInfo',
                      );
                    },
                  };
                }}
              />
            </TzCard>
            {items.map((item) => item.component)}
          </div>
          <TzAnchor items={anchorItems} />
        </div>
      </div>
    </>
  );
};
export default DeployImageInfo;
