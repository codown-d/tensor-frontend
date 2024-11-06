import { TablePaginationConfig, Select } from 'antd';
import { find, merge } from 'lodash';
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
import { imagesDetailWebshell, webshellFile } from '../../../../services/DataService';
import { translations } from '../../../../translations/translations';
import { TextHoverCopy } from '../../../AlertCenter/AlertCenterScreen';
import { riskLevel } from '../../../ImageReject/ImageNewStrategy';
import { questionEnum } from '../../components/ImagesScannerDataList';
import { useNavigatereFresh } from '../../../../helpers/useNavigatereFresh';
import { useAnchorItem } from '../../../../components/ComponentsLibrary/TzAnchor';

export const Webshell = forwardRef((props: any, ref?: any) => {
  let { title = translations.scanner_overview_webshell, tagType = 'unknown', imageFromType, deployRecordID } = props;
  let { jump } = useNavigatereFresh();
  const [keyword, setWebshellSearch] = useState('');
  const setLayout = useLayoutMainSearchWid({});
  const webshellColumns = [
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
    [props.securityPolicyIds, props.deployRecordID, keyword],
  );
  let { getPageKey } = useAnchorItem();
  return (
    <TzCard
      id={getPageKey(questionEnum.exceptionWebshell)}
      className={'mt20'}
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
          onSearch={setWebshellSearch}
        />
      }
      bodyStyle={{ paddingTop: '0px' }}
    >
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
                  `/${questionEnum.exceptionWebshell}?uniqueID=${record.uniqueID}&imageFromType=${imageFromType}&deployRecordID=${deployRecordID}`,
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
