import { TablePaginationConfig, Select } from 'antd';
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { WhiteListTag } from '..';
import EllipsisPopover from '../../../../components/ellipsisPopover/ellipsisPopover';
import { TzCard } from '../../../../components/tz-card';
import { TzCheckbox } from '../../../../components/tz-checkbox';
import TzInputSearch from '../../../../components/tz-input-search';
import { TzTableServerPage } from '../../../../components/tz-table';
import { RenderTag } from '../../../../components/tz-tag';
import useLayoutMainSearchWid from '../../../../helpers/useLayoutMainSearchWid';
import { imagesDetailWebshell, webshellFile } from '../../../../services/DataService';
import { translations } from '../../../../translations/translations';
import { questionEnum } from '../../components/ImagesScannerDataList';
import { map } from 'rxjs/operators';
import { merge } from 'lodash';
import { TzButton } from '../../../../components/tz-button';
import { useNavigatereFresh } from '../../../../helpers/useNavigatereFresh';
import { TextHoverCopy } from '../../../AlertCenter/AlertCenterScreen';
import { riskLevel } from '../../../ImageReject/ImageNewStrategy';
import { Routes } from '../../../../Routes';
import { downloadFile } from '../../../../helpers/until';
import { useAnchorItem } from '../../../../components/ComponentsLibrary/TzAnchor';
import useGetTagType from './useTagTypeHook';

export const NodeTabWebshell = forwardRef((props: any, ref?: any) => {
  let { title = translations.scanner_overview_webshell, imageFromType } = props;

  let { jump } = useNavigatereFresh();
  const [keyword, setWebshellSearch] = useState('');
  const [exceptionWebshell, setWebshellFile] = useState(true);
  const setLayout = useLayoutMainSearchWid({});
  const webshellColumns = [
    {
      title: translations.scanner_detail_file_name,
      dataIndex: 'filename',
      className: 'task-name',
      render: (name: any, row: any) => {
        let { inWhite, exception } = row.policyDetect;
        return (
          <>
            <WhiteListTag flag={inWhite} />
            <TextHoverCopy
              text={name}
              lineClamp={2}
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
      title: translations.risk_level,
      dataIndex: 'riskLevel',
      width: '100px',
      filters: riskLevel,
      render: (name: any, row: any) => {
        let node = riskLevel.find((item) => {
          return item.value === name;
        });
        return node ? <RenderTag type={node.value} title={node?.text} /> : '-';
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
              downloadFile(row, webshellFile);
            }}
          >
            {translations.scanner_report_download}
          </TzButton>
        );
      },
    },
  ];
  const getImageWebshell = useCallback(
    (pagination: TablePaginationConfig, filters: any) => {
      const { current = 1, pageSize = 10 } = pagination;
      const offset = (current - 1) * pageSize;
      const pageParams = merge(
        {
          offset,
          limit: pageSize,
          keyword,
          exceptionWebshell,
          ...filters,
        },
        props,
      );
      return imagesDetailWebshell(pageParams).pipe(
        map((res: any) => {
          let items = res.getItems();
          return {
            data: items,
            total: res.data?.totalItems,
          };
        }),
      );
    },
    [props.imageUniqueID, props.securityPolicyIds, keyword, exceptionWebshell],
  );
  useImperativeHandle(
    ref,
    () => {
      return { show: setWebshellFile };
    },
    [],
  );
  let { getPageKey } = useAnchorItem();

  let { tagType } = useGetTagType({ ...props, exceptionType: questionEnum.exceptionWebshell });
  return (
    <TzCard
      id={getPageKey(questionEnum.exceptionWebshell)}
      className={'mt20'}
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
          onSearch={setWebshellSearch}
        />
      }
      bodyStyle={{ paddingTop: '0px' }}
    >
      <p className={'mb8'}>
        <TzCheckbox
          className="mr24"
          checked={exceptionWebshell}
          onChange={(e) => {
            setWebshellFile(e.target.checked);
          }}
        >
          {translations.unStandard.str207}
        </TzCheckbox>
      </p>

      <TzTableServerPage
        columns={webshellColumns}
        tableLayout={'fixed'}
        rowKey={(record) => record.Path + '' + record.Name}
        onRow={(record) => {
          return {
            onClick: () => {
              jump(
                Routes.ImageFileInfo.replace(
                  '/:type',
                  `/${questionEnum.exceptionWebshell}?uniqueID=${record.uniqueID}&imageFromType=${imageFromType}&imageUniqueID=${props.imageUniqueID}`,
                ),
                'ImageFileInfo',
              );
            },
          };
        }}
        reqFun={getImageWebshell}
      />
    </TzCard>
  );
});
