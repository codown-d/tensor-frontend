import { TablePaginationConfig } from 'antd';
import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { WhiteListTag } from '..';
import { TzCard } from '../../../../components/tz-card';
import { TzCheckbox } from '../../../../components/tz-checkbox';
import TzInputSearch from '../../../../components/tz-input-search';
import { TzTableServerPage } from '../../../../components/tz-table';
import { RenderTag } from '../../../../components/tz-tag';
import useLayoutMainSearchWid from '../../../../helpers/useLayoutMainSearchWid';
import { detailLicense, licenseFile } from '../../../../services/DataService';
import { translations } from '../../../../translations/translations';
import { questionEnum } from '../../components/ImagesScannerDataList';
import { map } from 'rxjs/operators';
import { merge } from 'lodash';
import { TzButton } from '../../../../components/tz-button';
import { tabType } from '../../ImagesScannerScreen';
import { TextHoverCopy } from '../../../AlertCenter/AlertCenterScreen';
import { downloadFile } from '../../../../helpers/until';
import { useAnchorItem } from '../../../../components/ComponentsLibrary/TzAnchor';
import { useViewConst } from '../../../../helpers/use_fun';
import useGetTagType from './useTagTypeHook';

export const NodeTabLicense = forwardRef((props: any, ref?: any) => {
  let { title = translations.license_file_reference, imageFromType } = props;
  const [keyword, setPkgsSearch] = useState('');
  const [exceptionLicense, setAbnormalSoft] = useState<any>(true);

  let openLicense = useViewConst({ constType: 'openLicense' });
  const setLayout = useLayoutMainSearchWid({});
  const licenseColumns: any = [
    {
      title: translations.scanner_detail_file_name,
      dataIndex: 'filename',
      width: '20%',
      className: 'task-name',
      render: (data: any, row: any) => {
        let { inWhite, exception } = row.policyDetect;
        return (
          <>
            <WhiteListTag flag={inWhite} />
            <span
              style={{
                color: row.policyDetect.exception ? 'rgba(233, 84, 84, 1)' : '',
                wordBreak: 'break-all',
              }}
            >
              {data}
            </span>
          </>
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
      render: (data: any, row: any) => {
        return <TextHoverCopy text={data} lineClamp={2} />;
      },
    },
    {
      title: translations.scanner_images_operation,
      width: '80px',
      render: (name: any, row: any) => {
        return (
          imageFromType === tabType.registry && (
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
          )
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
          exceptionLicense,
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
    [props.imageUniqueID, props.securityPolicyIds, keyword, exceptionLicense],
  );
  useImperativeHandle(
    ref,
    () => {
      return { show: setAbnormalSoft };
    },
    [],
  );
  let { getPageKey } = useAnchorItem();
  let { tagType } = useGetTagType({ ...props, exceptionType: questionEnum.exceptionLicense });
  return (
    <TzCard
      id={getPageKey(questionEnum.exceptionLicense)}
      title={
        <span>
          {title}
          {tagType ? <RenderTag type={tagType} className={'ml12 middle'} /> : null}
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
      <p className="flex-r-c mb8">
        <span>
          <TzCheckbox
            className="mr24"
            checked={exceptionLicense}
            onChange={(e) => {
              setAbnormalSoft(e.target.checked);
            }}
          >
            {translations.review_license_file_reference_risk}
          </TzCheckbox>
        </span>
      </p>
      <TzTableServerPage
        columns={licenseColumns}
        className={'nohoverTable'}
        tableLayout={'fixed'}
        rowKey={'id'}
        reqFun={reqFunPkgs}
      />
    </TzCard>
  );
});
