import { TablePaginationConfig } from 'antd';
import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { WhiteListTag } from '..';
import EllipsisPopover from '../../../../components/ellipsisPopover/ellipsisPopover';
import { TzCard } from '../../../../components/tz-card';
import { TzCheckbox } from '../../../../components/tz-checkbox';
import TzInputSearch from '../../../../components/tz-input-search';
import { TzTableServerPage } from '../../../../components/tz-table';
import { RenderTag } from '../../../../components/tz-tag';
import useLayoutMainSearchWid from '../../../../helpers/useLayoutMainSearchWid';
import { detailSensitiveFile, sensitiveFile } from '../../../../services/DataService';
import { translations } from '../../../../translations/translations';
import { questionEnum } from '../../components/ImagesScannerDataList';
import { map } from 'rxjs/operators';
import { merge } from 'lodash';
import { useNavigatereFresh } from '../../../../helpers/useNavigatereFresh';
import { tabType } from '../../ImagesScannerScreen';
import { Routes } from '../../../../Routes';
import { TzButton } from '../../../../components/tz-button';
import { TextHoverCopy } from '../../../AlertCenter/AlertCenterScreen';
import { downloadFile } from '../../../../helpers/until';
import { useAnchorItem } from '../../../../components/ComponentsLibrary/TzAnchor';
import useGetTagType from './useTagTypeHook';

export const NodeTabSensitive = forwardRef((props: any, ref?: any) => {
  let { title = translations.scanner_images_sensitive, imageFromType } = props;
  let { jump } = useNavigatereFresh();
  const [keyword, setSensitiveSearch] = useState('');
  const [exceptSensitive, setExceptSensitive] = useState(true);
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
            <TextHoverCopy
              lineClamp={2}
              text={name}
              style={{ color: row.policyDetect.exception ? 'rgba(233, 84, 84, 1)' : '#3e4653' }}
            />
          </>
        );
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
      title: 'MD5',
      dataIndex: 'md5',
      render: (md5: any, row: any) => <EllipsisPopover lineClamp={2}>{md5}</EllipsisPopover>,
    },
    {
      title: translations.scanner_images_operation,
      width: '80px',
      render: (name: any, row: any) => {
        return imageFromType === tabType.node ? (
          '-'
        ) : (
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
          exceptionSensitive: exceptSensitive,
        },
        props,
      );
      return detailSensitiveFile(pageParams).pipe(
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
    [props.imageUniqueID, props.securityPolicyIds, keyword, exceptSensitive],
  );
  useImperativeHandle(
    ref,
    () => {
      return { show: setExceptSensitive };
    },
    [],
  );
  let { getPageKey } = useAnchorItem();

  let { tagType } = useGetTagType({ ...props, exceptionType: questionEnum.exceptionSensitive });
  return (
    <TzCard
      id={getPageKey(questionEnum.exceptionSensitive)}
      title={
        <span>
          {title}
          {tagType ? <RenderTag type={tagType} className={'ml12 middle'} /> : null}
        </span>
      }
      extra={
        <TzInputSearch
          style={{ width: setLayout }}
          placeholder={translations.unStandard.str72}
          onSearch={(val) => {
            setSensitiveSearch(val);
          }}
        />
      }
      className={`mt20`}
      bodyStyle={{ paddingTop: '0px' }}
    >
      <TzCheckbox
        checked={exceptSensitive}
        onChange={(e) => {
          setExceptSensitive(e.target.checked);
        }}
      >
        {translations.unStandard.str208}
      </TzCheckbox>
      <TzTableServerPage
        columns={columns}
        rowKey={'id'}
        tableLayout={'fixed'}
        reqFun={reqFun}
        onRow={(record) => {
          return {
            onClick: () => {
              imageFromType === tabType.registry &&
                jump(
                  Routes.ImageFileInfo.replace(
                    '/:type',
                    `/${questionEnum.exceptionSensitive}?uniqueID=${record.uniqueID}&imageFromType=${imageFromType}&imageUniqueID=${props.imageUniqueID}`,
                  ),
                  'ImageFileInfo',
                );
            },
          };
        }}
      />
    </TzCard>
  );
});
