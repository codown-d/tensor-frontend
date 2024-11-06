import { TablePaginationConfig } from 'antd';
import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { NodePkgsInfo, WhiteListTag } from '..';
import EllipsisPopover from '../../../../components/ellipsisPopover/ellipsisPopover';
import { TzCard } from '../../../../components/tz-card';
import { TzCheckbox } from '../../../../components/tz-checkbox';
import TzInputSearch from '../../../../components/tz-input-search';
import { TzTableServerPage } from '../../../../components/tz-table';
import { RenderTag } from '../../../../components/tz-tag';
import useLayoutMainSearchWid from '../../../../helpers/useLayoutMainSearchWid';
import { imagesDetailSoftware, imagesDetailVulns, imagesVulnDetail } from '../../../../services/DataService';
import { translations } from '../../../../translations/translations';
import { filtersOperation } from '../../components/Image-scanner-detail/ImagesScannerDetail';
import { questionEnum } from '../../components/ImagesScannerDataList';
import { map } from 'rxjs/operators';
import { merge } from 'lodash';
import { Histogram } from '../../ImagesCI/CI';
import { useAnchorItem } from '../../../../components/ComponentsLibrary/TzAnchor';

export const NodeTabPkgs = forwardRef((props: any, ref?: any) => {
  let { title = translations.scanner_detail_soft_pack, tagType = 'unknown' } = props;
  const [keyword, setPkgsSearch] = useState('');
  const [exceptionPkg, setAbnormalSoft] = useState<any>(true);
  const [exceptionPkgLicense, setAbnormalLicense] = useState<any>(true);

  const setLayout = useLayoutMainSearchWid({});
  const pkgsColumns: any = [
    {
      title: translations.scanner_detail_soft_pack,
      dataIndex: 'pkgName',
      width: '21%',
      className: 'task-name',
      render(pkgName: any, row: any) {
        let { inWhite, exception } = row.policyDetect;
        return (
          <>
            <WhiteListTag flag={inWhite} />
            <EllipsisPopover lineClamp={2} title={pkgName}>
              <span
                style={{
                  color: row.policyDetect.exception ? 'rgba(233, 84, 84, 1)' : '',
                  wordBreak: 'break-all',
                }}
              >
                {pkgName}
              </span>
            </EllipsisPopover>
          </>
        );
      },
    },
    {
      title: translations.package_version,
      dataIndex: 'pkgVersion',
      width: '21%',
      render: (data: any, row: any) => {
        return (
          <EllipsisPopover lineClamp={2} title={data}>
            <span
              style={{
                color: row.policyDetect.exception ? 'rgba(233, 84, 84, 1)' : '',
                wordBreak: 'break-all',
              }}
            >
              {data}
            </span>
          </EllipsisPopover>
        );
      },
    },
    {
      title: translations.source_license,
      dataIndex: 'license',
      width: '21%',
      render: (license: any, row: any) => {
        let data = typeof license === 'string' ? [license] : license;
        return (
          <EllipsisPopover lineClamp={2} title={data?.join(' ，')}>
            <span
              style={{
                color: row.policyDetect.exceptionPkgLicense ? 'rgba(233, 84, 84, 1)' : '',
                wordBreak: 'break-all',
              }}
            >
              {data?.join(' ，') || '-'}
            </span>{' '}
          </EllipsisPopover>
        );
      },
    },
    {
      title: translations.vulnerability_statistics,
      dataIndex: 'severityOverview',
      filters: filtersOperation,
      render: (data: any) => {
        let obj = data.reduce((pre: any, item: any) => {
          pre[item.severity] = item.count;
          return pre;
        }, {});
        return <Histogram severityHistogram={obj} />;
      },
    },
  ];
  const reqFunPkgs = useCallback(
    (pagination: TablePaginationConfig, filters) => {
      const { current = 1, pageSize = 10 } = pagination;
      const offset = (current - 1) * pageSize;
      const pageParams = merge(
        {
          offset,
          limit: pageSize,
          keyword,
          severity: filters.severityOverview,
          exceptionPkg,
          exceptionPkgLicense,
        },
        props,
      );
      return imagesDetailSoftware(pageParams).pipe(
        map((res: any) => {
          let items = res.getItems();
          return {
            data: items,
            total: res?.data?.totalItems || 0,
          };
        }),
      );
    },
    [props.imageUniqueID, props.securityPolicyIds, keyword, exceptionPkg, exceptionPkgLicense],
  );
  useImperativeHandle(
    ref,
    () => {
      return { show: setAbnormalSoft };
    },
    [],
  );
  let { getPageKey } = useAnchorItem();
  return (
    <TzCard
      id={getPageKey(questionEnum.exceptionPKG)}
      title={
        <span>
          {title}
          <RenderTag type={tagType} className={'ml12 middle'} />
        </span>
      }
      extra={
        <TzInputSearch
          style={{ width: setLayout }}
          placeholder={translations.originalWarning_placeholder}
          onSearch={setPkgsSearch}
        />
      }
      className={'mt20'}
      bodyStyle={{ paddingTop: '0px' }}
    >
      <p className="flex-r-c mb8">
        <span>
          <TzCheckbox
            className="mr24"
            checked={exceptionPkg}
            onChange={(e) => {
              setAbnormalSoft(e.target.checked);
            }}
          >
            {translations.view_risk_packages}
          </TzCheckbox>
          <TzCheckbox
            checked={exceptionPkgLicense}
            onChange={(e) => {
              setAbnormalLicense(e.target.checked);
            }}
          >
            {translations.view_disallowed_open_source_licenses}
          </TzCheckbox>
        </span>
      </p>
      <TzTableServerPage
        columns={pkgsColumns}
        tableLayout={'fixed'}
        rowKey={(record) => {
          return record.pkgVersion + '' + record.pkgName;
        }}
        expandable={{
          expandedRowRender: (record) => {
            return (
              <NodePkgsInfo
                imageFromType={props.imageFromType}
                imageUniqueID={props.imageUniqueID}
                uniqueID={record.uniqueID}
              />
            );
          },
        }}
        reqFun={reqFunPkgs}
      />
    </TzCard>
  );
});
