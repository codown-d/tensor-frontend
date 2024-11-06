import { TablePaginationConfig } from 'antd';
import { merge } from 'lodash';
import React, { forwardRef, useCallback, useState } from 'react';
import { map } from 'rxjs/operators';
import EllipsisPopover from '../../../../components/ellipsisPopover/ellipsisPopover';
import { TzButton } from '../../../../components/tz-button';
import { TzCard } from '../../../../components/tz-card';
import TzInputSearch from '../../../../components/tz-input-search';
import { TzTableServerPage } from '../../../../components/tz-table';
import { RenderTag, TzTag } from '../../../../components/tz-tag';
import { downloadFile } from '../../../../helpers/until';
import useLayoutMainSearchWid from '../../../../helpers/useLayoutMainSearchWid';
import { Routes } from '../../../../Routes';
import { detailSensitiveFile, sensitiveFile } from '../../../../services/DataService';
import { translations } from '../../../../translations/translations';
import { TextHoverCopy } from '../../../AlertCenter/AlertCenterScreen';
import { questionEnum } from '../../components/ImagesScannerDataList';
import { WhiteListTag } from '../../LifeCycle';
import { useNavigatereFresh } from '../../../../helpers/useNavigatereFresh';
import { useAnchorItem } from '../../../../components/ComponentsLibrary/TzAnchor';

export const Sensitive = (props: any, ref?: any) => {
  let { title = translations.scanner_images_sensitive, tagType = 'unknown', imageFromType, deployRecordID } = props;
  const [keyword, setSensitiveSearch] = useState('');
  const setLayout = useLayoutMainSearchWid({});
  const columns = [
    {
      title: translations.scanner_images_sensitive,
      dataIndex: 'filename',
      className: 'task-name',
      render: (name: any, row: any) => {
        let inWhite = row.policyDetect.inWhite;
        return (
          <>
            <WhiteListTag flag={inWhite} />
            <TextHoverCopy text={name} />
          </>
        );
      },
    },
    {
      title: translations.scanner_detail_file_path,
      dataIndex: 'filepath',
      width: '40%',
      render: (name: any, row: any) => {
        return <TextHoverCopy text={name} />;
      },
    },
    {
      title: 'MD5',
      dataIndex: 'md5',
      render: (md5: any, row: any) => <EllipsisPopover lineClamp={2}>{md5}</EllipsisPopover>,
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
              downloadFile(row, sensitiveFile);
            }}
          >
            {translations.scanner_report_download}
          </TzButton>
        );
      },
    },
  ];
  const reqFun = useCallback(
    (pagination: TablePaginationConfig) => {
      const { current = 1, pageSize = 10 } = pagination;
      const offset = (current - 1) * pageSize;
      const pageParams = merge(
        {
          offset,
          limit: pageSize,
          keyword,
        },
        props,
      );
      return detailSensitiveFile(pageParams).pipe(
        map((res) => {
          let items = res.getItems();
          return {
            data: items,
            total: res?.data?.totalItems,
          };
        }),
      );
    },
    [props.securityPolicyIds, props.deployRecordID, keyword],
  );
  let { jump } = useNavigatereFresh();
  let { getPageKey } = useAnchorItem();
  return (
    <TzCard
      id={getPageKey(questionEnum.exceptionSensitive)}
      title={
        <span>
          {title}
          <RenderTag type={tagType} className={'ml12 middle'} />
        </span>
      }
      extra={
        <TzInputSearch
          style={{ width: setLayout }}
          placeholder={translations.unStandard.str72}
          onSearch={setSensitiveSearch}
        />
      }
      className={`mt20`}
      bodyStyle={{ paddingTop: '0px' }}
    >
      <TzTableServerPage
        columns={columns}
        rowKey={'id'}
        tableLayout={'fixed'}
        reqFun={reqFun}
        onRow={(record) => {
          return {
            onClick: () => {
              jump(
                Routes.ImageFileInfo.replace(
                  '/:type',
                  `/${questionEnum.exceptionSensitive}?uniqueID=${record.uniqueID}&imageFromType=${imageFromType}&deployRecordID=${deployRecordID}`,
                ),
                'ImageFileInfo',
              );
            },
          };
        }}
      />
    </TzCard>
  );
};
