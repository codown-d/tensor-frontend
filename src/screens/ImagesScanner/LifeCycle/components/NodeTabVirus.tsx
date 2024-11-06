import { TablePaginationConfig, Select } from 'antd';
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { WhiteListTag } from '..';
import EllipsisPopover from '../../../../components/ellipsisPopover/ellipsisPopover';
import { TzCard } from '../../../../components/tz-card';
import { TzCheckbox } from '../../../../components/tz-checkbox';
import TzInputSearch from '../../../../components/tz-input-search';
import { TzTableServerPage } from '../../../../components/tz-table';
import { RenderTag } from '../../../../components/tz-tag';
import useLayoutMainSearchWid from '../../../../helpers/useLayoutMainSearchWid';
import { imagesDetailVirus, malwareFile } from '../../../../services/DataService';
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

export const NodeTabVirus = forwardRef((props: any, ref?: any) => {
  let { title = translations.virus, imageFromType } = props;
  const [keyword, setVirusSearch] = useState('');
  const [exceptVirus, setExceptVirus] = useState(true);
  let { jump } = useNavigatereFresh();
  const setLayout = useLayoutMainSearchWid({});
  const virusColumns = useMemo(
    () => [
      {
        title: translations.trojan_name,
        dataIndex: 'name',
        className: 'task-name',
        render: (name: any, row: any) => {
          let { inWhite, exception } = row.policyDetect;
          return (
            <>
              <WhiteListTag flag={inWhite} />
              <p style={{ color: exception ? 'rgba(233, 84, 84, 1)' : '#3e4653' }}> {name}</p>
            </>
          );
        },
      },
      {
        title: translations.scanner_detail_file_name,
        dataIndex: 'filename',
        render: (name: any, row: any) => {
          return <TextHoverCopy text={name} lineClamp={2} />;
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
                downloadFile(row, malwareFile);
              }}
            >
              {translations.scanner_report_download}
            </TzButton>
          );
        },
      },
    ],
    [],
  );
  const reqFunDetailVirus = useCallback(
    (pagination: TablePaginationConfig) => {
      const { current = 1, pageSize = 10 } = pagination;
      const offset = (current - 1) * pageSize;
      const pageParams = merge(
        {
          offset,
          limit: pageSize,
          keyword,
          exceptionMalware: exceptVirus,
        },
        props,
      );
      return imagesDetailVirus(pageParams).pipe(
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
    [props.imageUniqueID, props.securityPolicyIds, keyword, exceptVirus],
  );
  useImperativeHandle(
    ref,
    () => {
      return { show: setExceptVirus };
    },
    [],
  );
  let { getPageKey } = useAnchorItem();

  let { tagType } = useGetTagType({ ...props, exceptionType: questionEnum.exceptionMalware });
  return (
    <TzCard
      id={getPageKey(questionEnum.exceptionMalware)}
      className={`mt20`}
      title={
        <span>
          {title}
          {tagType ? <RenderTag type={tagType} className={'ml12 middle'} /> : null}
        </span>
      }
      extra={
        <TzInputSearch
          style={{ width: setLayout }}
          placeholder={translations.unStandard.str137}
          onSearch={setVirusSearch}
        />
      }
      bodyStyle={{ paddingTop: '0px' }}
    >
      <p className={'mb8'}>
        <TzCheckbox
          className="mr24"
          checked={exceptVirus}
          onChange={(e) => {
            setExceptVirus(e.target.checked);
          }}
        >
          {translations.unStandard.str238}
        </TzCheckbox>
      </p>
      <TzTableServerPage
        columns={virusColumns}
        tableLayout={'fixed'}
        rowKey={(record) => record.Path + '' + record.Name}
        reqFun={reqFunDetailVirus}
        onRow={(record) => {
          return {
            onClick: () => {
              imageFromType === tabType.registry &&
                jump(
                  Routes.ImageFileInfo.replace(
                    '/:type',
                    `/${questionEnum.exceptionMalware}?uniqueID=${record.uniqueID}&imageFromType=${imageFromType}&imageUniqueID=${props.imageUniqueID}`,
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
