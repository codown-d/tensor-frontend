import { TablePaginationConfig } from 'antd';
import { merge } from 'lodash';
import React, { forwardRef, useCallback, useState } from 'react';
import { map } from 'rxjs/operators';
import { TzButton } from '../../../../components/tz-button';
import { TzCard } from '../../../../components/tz-card';
import TzInputSearch from '../../../../components/tz-input-search';
import { TzTableServerPage } from '../../../../components/tz-table';
import { RenderTag } from '../../../../components/tz-tag';
import { downloadFile } from '../../../../helpers/until';
import useLayoutMainSearchWid from '../../../../helpers/useLayoutMainSearchWid';
import { detailLicense, licenseFile } from '../../../../services/DataService';
import { translations } from '../../../../translations/translations';
import { TextHoverCopy } from '../../../AlertCenter/AlertCenterScreen';
import { useViewConst } from '../../../../helpers/use_fun';
import { questionEnum } from '../../components/ImagesScannerDataList';
import { useAnchorItem } from '../../../../components/ComponentsLibrary/TzAnchor';

export const License = forwardRef((props: any, ref?: any) => {
  let { title = translations.risk_license_file, tagType = 'unknown', imageFromType } = props;
  const [keyword, setPkgsSearch] = useState('');
  let openLicense = useViewConst({ constType: 'openLicense' });
  const setLayout = useLayoutMainSearchWid({});
  const licenseColumns: any = [
    {
      title: translations.scanner_detail_file_name,
      dataIndex: 'filename',
      width: '20%',
      render: (data: any, row: any) => {
        return (
          <span
            style={{
              wordBreak: 'break-all',
            }}
          >
            {data}
          </span>
        );
      },
    },
    {
      title: translations.calico_cluster_type,
      dataIndex: 'name',
      width: '20%',
      filters: openLicense,
      render: (data: any, row: any) => {
        return data;
      },
    },
    {
      title: translations.scanner_detail_file_path,
      dataIndex: 'filepath',
      render: (name: any, row: any) => {
        return <TextHoverCopy text={name} lineClamp={2} />;
      },
    },
    {
      title: translations.scanner_images_operation,
      width: '80px',
      render: (name: any, row: any) => {
        return (
          <TzButton
            type={'text'}
            onClick={(e) => {
              e.stopPropagation();
              let o = {
                uniqueID: row.uniqueID,
                downloadFilename: row.downloadFilename,
              };
              downloadFile(o, licenseFile);
            }}
          >
            {translations.scanner_report_download}
          </TzButton>
        );
      },
    },
  ];
  const reqFunPkgs = useCallback(
    (pagination: TablePaginationConfig, filters) => {
      const { current = 1, pageSize = 10 } = pagination;
      const offset = (current - 1) * pageSize;
      let o = Object.keys(filters).reduce((pre: any, item) => {
        pre[item] = filters[item] ? filters[item].join(',') : '';
        return pre;
      }, {});
      const pageParams = merge(
        {
          offset,
          limit: pageSize,
          keyword,
          ...o,
        },
        props,
      );
      return detailLicense(pageParams).pipe(
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
      id={getPageKey(questionEnum.exceptionLicense)}
      title={
        <span>
          {title}
          <RenderTag type={tagType} className={'ml12 middle'} />
        </span>
      }
      extra={
        <TzInputSearch
          style={{ width: setLayout }}
          placeholder={translations.unStandard.str138}
          onSearch={setPkgsSearch}
        />
      }
      className={'mt20'}
      bodyStyle={{ paddingTop: '0px' }}
    >
      <TzTableServerPage columns={licenseColumns} tableLayout={'fixed'} rowKey={'id'} reqFun={reqFunPkgs} />
    </TzCard>
  );
});
