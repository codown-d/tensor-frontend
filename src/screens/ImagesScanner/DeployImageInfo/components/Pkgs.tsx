import { TablePaginationConfig } from 'antd';
import { merge } from 'lodash';
import React, { forwardRef, useCallback, useState } from 'react';
import { map } from 'rxjs/operators';
import EllipsisPopover from '../../../../components/ellipsisPopover/ellipsisPopover';
import { TzCard } from '../../../../components/tz-card';
import TzInputSearch from '../../../../components/tz-input-search';
import { TzTableServerPage } from '../../../../components/tz-table';
import { RenderTag, TzTag } from '../../../../components/tz-tag';
import useLayoutMainSearchWid from '../../../../helpers/useLayoutMainSearchWid';
import { imagesDetailSoftware } from '../../../../services/DataService';
import { translations } from '../../../../translations/translations';
import { filtersOperation } from '../../components/Image-scanner-detail/ImagesScannerDetail';
import { questionEnum } from '../../components/ImagesScannerDataList';
import { Histogram } from '../../ImagesCI/CI';
import { NodePkgsInfo } from '../../LifeCycle';
import { useAnchorItem } from '../../../../components/ComponentsLibrary/TzAnchor';

export const Pkgs = (props: any) => {
  let { title = translations.risk_packages, tagType = 'unknown' } = props;
  const [keyword, setPkgsSearch] = useState('');
  const setLayout = useLayoutMainSearchWid({});
  const pkgsColumns: any = [
    {
      title: translations.scanner_detail_soft_pack,
      dataIndex: 'pkgName',
      width: '20%',
      render(pkgName: any, row: any) {
        return (
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
        );
      },
    },
    {
      title: translations.package_version,
      dataIndex: 'pkgVersion',
      width: '20%',
      render: (data: any, row: any) => {
        return (
          <span
            style={{
              color: row.policyDetect.exception ? 'rgba(233, 84, 84, 1)' : '',
              wordBreak: 'break-all',
            }}
          >
            {data}
          </span>
        );
      },
    },
    {
      title: translations.source_license,
      dataIndex: 'license',
      width: '40%',
      render: (license: any, row: any) => {
        let data = typeof license === 'string' ? [license] : license;

        return (
          <span
            style={{
              color: row.policyDetect.exceptionPkgLicense ? 'rgba(233, 84, 84, 1)' : '',
              wordBreak: 'break-all',
            }}
          >
            {data?.join ? data?.join(' ，') : data}
          </span>
        );
      },
    },
    {
      title: translations.vulnerability_statistics,
      dataIndex: 'severityOverview',
      width: '20%',
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
    [props.securityPolicyIds, props.deployRecordID, keyword],
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
          placeholder={translations.clusterManage_placeholder}
          onSearch={setPkgsSearch}
        />
      }
      className={'mt20'}
      bodyStyle={{ paddingTop: '0px' }}
    >
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
                imageUniqueID={record.imageUniqueID}
                uniqueID={record.uniqueID}
              />
            );
          },
        }}
        reqFun={reqFunPkgs}
      />
    </TzCard>
  );
};
