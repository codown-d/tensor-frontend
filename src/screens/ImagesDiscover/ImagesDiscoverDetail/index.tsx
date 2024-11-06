import React, { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import CoordinateChart from '../../../components/coordinateChart/coordinateChart';
import EllipsisPopover from '../../../components/ellipsisPopover/ellipsisPopover';
import { ScanDiscoverDetail, SupportedLangauges } from '../../../definitions';
import { toCaseObjKeys, vectorSplit } from '../../../helpers/until';
import { getHistory, relatedImage, vulnDetail, vulnsSoftware } from '../../../services/DataService';
import { localLang, translations } from '../../../translations/translations';
import './index.scss';
import { TzTableServerPage } from '../../../components/tz-table';
import { getCurrentLanguage } from '../../../services/LanguageService';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Store } from '../../../services/StoreService';
import { RenderTag } from '../../../components/tz-tag';
import { useMemoizedFn } from 'ahooks';
import { map } from 'rxjs/operators';
import { TablePaginationConfig } from 'antd/lib/table';
import { TzCard } from '../../../components/tz-card';
import TzInputSearch from '../../../components/tz-input-search';
import { TextHoverCopy } from '../../AlertCenter/AlertCenterScreen';
import { JumpImageDetail } from '../../MultiClusterRiskExplorer/components';
// import { useActivate } from 'react-activation';
import { VulnDetailInfo } from '../../ImagesScanner/LifeCycle';

export const LeakDetailInfo = (props: { data?: ScanDiscoverDetail }) => {
  const { data } = props;
  const vulninfo = useMemo(() => {
    return data?.vulninfo && toCaseObjKeys(data?.vulninfo);
  }, [data]);

  const { preList, effectList } = useMemo(() => {
    const vector = vulninfo?.cvss?.cvssv3vector;
    if (!vector) {
      return {} as any;
    }
    return vectorSplit(vector);
  }, [vulninfo]);

  const keyfields1 = useMemo(() => {
    return ['a'];
  }, []);
  const keyfields2 = useMemo(() => {
    return ['a'];
  }, []);

  const dLinks = useMemo(() => {
    return vulninfo?.links?.map((item: any) => {
      return (
        <a href={item} key={item} target="_blank" rel="noopener noreferrer">
          {item}
        </a>
      );
    });
  }, [vulninfo]);

  const cvssv3score = useMemo(() => {
    const _v = vulninfo?.cvss?.cvssv3score as any;
    if (!_v) {
      return undefined;
    }
    if (_v === '0' || _v === 0) {
      return 'N/A';
    }
    return Number(_v).toFixed(2);
  }, [vulninfo]);

  let lang = getCurrentLanguage();
  return (
    <div className="scan_leak_expend radius8">
      {vulninfo?.cvss?.cvssv3vector && (
        <div className="coor_box">
          <div className="coor_item" style={{ paddingLeft: '30px' }}>
            <div className="d_title">{translations.scanner_detail_leak_target_pre}&nbsp;:</div>
            <CoordinateChart keyfields={keyfields1} data={preList || []} colorType="blue" />
          </div>
          <div className="coor_item" style={{ paddingRight: '30px' }}>
            <div className="d_title">{translations.scanner_detail_leak_target_eff}&nbsp;:</div>
            <CoordinateChart keyfields={keyfields2} data={effectList || []} colorType="red" />
          </div>
        </div>
      )}
      {cvssv3score && (
        <div className="scan_leak_exp_detail_item score">
          <span className="d_title">{translations.scanner_detail_leak_cvsss_core}&nbsp;:</span>
          <span className="d_val">{cvssv3score}</span>
        </div>
      )}
      {vulninfo?.cnnvds?.number && (
        <div className="scan_leak_exp_detail_item">
          <span className="d_title">{translations.scanner_detail_cnnvd_id}&nbsp;:</span>
          <span className="d_val">{vulninfo?.cnnvds?.number || '-'}</span>
        </div>
      )}
      {vulninfo?.cnvds?.[0]?.title && (
        <div className="scan_leak_exp_detail_item">
          <span className="d_title">{translations.scanner_detail_leak_type}&nbsp;:</span>
          <span className="d_val">{vulninfo?.cnvds?.[0]?.title || '-'}</span>
        </div>
      )}
      {(vulninfo?.cnvds?.[0]?.desription || vulninfo?.description) && (
        <div className="scan_leak_exp_detail_item">
          <span className="d_title f-l">{translations.scanner_detail_leak_desc}&nbsp;:</span>
          <span className="d_val">
            {localLang === SupportedLangauges.Chinese
              ? vulninfo?.cnvds?.[0]?.desription || vulninfo.description
              : vulninfo.description || vulninfo?.cnvds?.[0]?.desription}
          </span>
        </div>
      )}
      {vulninfo?.cnnvds && lang == 'zh' ? (
        <div className="scan_leak_exp_detail_item">
          <span className="d_title f-l">{translations.kubeScan_recordSug}&nbsp;:</span>
          <span className="d_val">{(vulninfo?.cnnvds as any).fix_suggestion}</span>
        </div>
      ) : null}
      {vulninfo?.fixedby && (
        <div className="scan_leak_exp_detail_item">
          <span className="d_title">{translations.scanner_detail_fix_tip}&nbsp;:</span>
          <span className="d_val">{vulninfo?.fixedby || '-'}</span>
        </div>
      )}
      {dLinks && dLinks?.length > 0 ? (
        <div className="scan_leak_exp_detail_item links">
          <span className="d_title">{translations.scanner_detail_side_link}&nbsp;:</span>
          <span className="d_val">{dLinks || '-'}</span>
        </div>
      ) : null}
    </div>
  );
};
const ImagesDiscoverDetail = (props: any, ref?: any) => {
  const [result] = useSearchParams();
  const [info, setInfo] = useState<any>(null);
  let [searchRelatedImage, setSearchRelatedImage] = useState<any>('');
  let [searchVulnsSoftware, setSearchVulnsSoftware] = useState<any>('');
  const navigate = useNavigate();
  const l = useLocation();
  let [query] = useState({
    uniqueID: result.get('uniqueID'),
  });
  useEffect(() => {
    vulnDetail(query).subscribe((res: any) => {
      if (res.error) return;
      setInfo(res.getItem());
    });
  }, []);
  const setHeader = useMemoizedFn(() => {
    if (info) {
      Store.header.next({
        title: (
          <div className={'flex-r-c'}>
            <span>{info.name}</span>
            <RenderTag type={info.severity} className={'ml16'} />
          </div>
        ),
        onBack: () => {
          navigate(-1);
        },
      });
    }
  });
  useEffect(setHeader, [info, query, l]);
  // useActivate(() => {
  //   setHeader();
  // });
  let columnsVulnsSoftware = [
    {
      title: translations.software_package_name,
      dataIndex: 'name',
    },
    {
      title: translations.package_version,
      dataIndex: 'version',
    },
    {
      title: translations.runtimePolicy_container_path,
      dataIndex: 'filepath',
      render: (item: string, row: any) => {
        return (
          <div style={{ maxWidth: '100%' }}>
            <TextHoverCopy text={item} />
          </div>
        );
      },
    },
    {
      title: translations.software_source_license,
      dataIndex: 'license',
      render: (license: any, row: any) => {
        let item = typeof license === 'string' ? [license] : license;
        return item ? <EllipsisPopover>{item.join('，')}</EllipsisPopover> : '-';
      },
    },
  ];
  let columnsRelatedImage = [
    {
      title: translations.scanner_images_imageName,
      dataIndex: 'image',
      render: (item: string, row: any) => {
        return (
          <JumpImageDetail
            imageUniqueID={row.imageUniqueID}
            imageFromType={row.imageFromType}
            name={item}
          />
        );
      },
    },
    {
      title: translations.scanner_report_repo,
      dataIndex: 'registry',
      render: (item: any, row: any) => {
        return item.map((ite: any) => `${ite.name}(${ite.url})`).join('，') || '-';
      },
    },
    {
      title: translations.compliances_breakdown_statusName,
      dataIndex: 'node',
      render: (item: any, row: any) => {
        return item.map((ite: any) => ite.hostname).join('，') || '-';
      },
    },
    {
      title: translations.scanner_detail_line_container,
      dataIndex: 'container',
      render: (item: any, row: any) => {
        return <EllipsisPopover>{item.join('，')}</EllipsisPopover>;
      },
    },
  ];
  let reqFunRelatedImage = useCallback(
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
      return relatedImage({
        vulnUniqueID: info.uniqueID,
        offset,
        limit: pageSize,
        imageKeyword: searchRelatedImage,
      }).pipe(
        map((res) => {
          let items = res.getItems();
          return {
            data: items,
            total: res?.data?.totalItems,
          };
        }),
      );
    },
    [info, searchRelatedImage],
  );
  let reqFunVulnsSoftware = useCallback(
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
      return vulnsSoftware({
        vulnUniqueID: info.uniqueID,
        offset,
        limit: pageSize,
        keyword: searchVulnsSoftware,
      }).pipe(
        map((res) => {
          let items = res.getItems();
          return {
            data: items,
            total: res?.data?.totalItems,
          };
        }),
      );
    },
    [info, searchVulnsSoftware],
  );
  return (
    <div className={'images-discover-detail mlr32'}>
      <TzCard title={translations.compliances_breakdown_taskbaseinfo}>
        <VulnDetailInfo {...query} />
      </TzCard>
      <TzCard
        title={translations.associate_packages}
        className={'mt20'}
        extra={
          <TzInputSearch
            placeholder={translations.package_name_version_path}
            onChange={setSearchVulnsSoftware}
          />
        }
      >
        <TzTableServerPage
          columns={columnsVulnsSoftware}
          rowKey={'id'}
          tableLayout={'fixed'}
          reqFun={reqFunVulnsSoftware}
        />
      </TzCard>
      <TzCard
        title={translations.clusterGraphList_navImage}
        className={'mt20 mb40'}
        extra={
          <TzInputSearch
            placeholder={translations.enter_image_repository_information}
            onChange={setSearchRelatedImage}
          />
        }
      >
        <TzTableServerPage
          columns={columnsRelatedImage}
          rowKey={'id'}
          tableLayout={'fixed'}
          reqFun={reqFunRelatedImage}
        />
      </TzCard>
    </div>
  );
};

export default forwardRef(ImagesDiscoverDetail);
