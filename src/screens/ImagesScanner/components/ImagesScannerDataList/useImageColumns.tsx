import React, { useMemo } from 'react';
import EllipsisPopover from '../../../../components/ellipsisPopover/ellipsisPopover';
import { Resources } from '../../../../Resources';
import { translations } from '../../../../translations/translations';
import {
  ImageAttrTd,
  ImageInfoTd,
  SecurityIssueTd,
  fetchReport,
  getText,
  imageScanTaskFn,
} from '.';
import { Histogram } from '../../ImagesCI/CI';
import { RenderTag } from '../../../../components/tz-tag';
import { scanStatus } from '../../../../definitions';
import { LoadingOutlined } from '@ant-design/icons';
import { tabType } from '../../ImagesScannerScreen';
import { setBaseImageType } from '../Image-scanner-detail/ImagesScannerDetail';
import { ImageType } from '../../definition';
import { TzDropdown } from '../../../../components/tz-dropdown';
import { isArray, isBoolean, isUndefined } from 'lodash';

const useImageColumns = (props: { imageFromType: tabType; tableRef?: any }) => {
  let { imageFromType, tableRef } = props;
  const imageColumns = useMemo(() => {
    return [
      {
        title: translations.microseg_namespace_baseInfo,
        dataIndex: 'fullRepoName',
        width: '32%',
        ellipsis: { showTitle: false },
        render: (description: any, row: any) => {
          if (!row?.exit && isBoolean(row?.exit))
            return <EllipsisPopover lineClamp={2}>{row.name}</EllipsisPopover>;
          return <ImageInfoTd imageFromType={imageFromType} {...row} />;
        },
      },
      {
        title: translations.attribute,
        dataIndex: 'imageAttr',
        width: '8.5%',
        render: (imageAttr: any, row: any) => {
          if (!imageAttr && isUndefined(imageAttr)) return '-';
          return <ImageAttrTd {...imageAttr} imageFromType={imageFromType} />;
        },
      },
      {
        title: translations.vulnerability_statistics,
        dataIndex: 'vulnStatic',
        key: 'vulnStatic',
        width: '18%',
        render: (vulnStatic: any) => {
          if (!vulnStatic && isUndefined(vulnStatic)) return '-';
          return <Histogram severityHistogram={vulnStatic} />;
        },
      },
      {
        title: translations.compliances_breakdown_status,
        dataIndex: 'online',
        width: '9%',
        render: (online: any, row: any) => {
          if (!online && isUndefined(online)) return '-';
          return <RenderTag type={online ? 'online' : 'offline'} />;
        },
      },
      {
        title: translations.safetyProblem,
        dataIndex: 'securityIssue',
        width: '14%',
        render: (securityIssue: any, row: any) => {
          if (!securityIssue && isUndefined(securityIssue)) return '-';
          return <SecurityIssueTd securityIssue={securityIssue} imageFromType={imageFromType} />;
        },
      },
      {
        title: translations.hitPolicy,
        dataIndex: 'riskPolicy',
        key: 'riskPolicy',
        render: (riskPolicyName: any[], row: any) => {
          return isArray(riskPolicyName) && riskPolicyName.length ? (
            <EllipsisPopover lineClamp={2}>
              {riskPolicyName?.map((item) => item.name).join(' , ')}
            </EllipsisPopover>
          ) : (
            '-'
          );
        },
      },
      {
        title: translations.operation,
        width: 80,
        align: 'center',
        render: (description: any, row: any) => {
          if (!row.imageAttr || (!row?.exit && isBoolean(row?.exit))) return '-';
          let items = [
            {
              label: (
                <>
                  {row.scanStatus === scanStatus.inProgress ? <LoadingOutlined /> : null}
                  {getText(row.scanStatus)}
                </>
              ),
              key: '0',
              disabled:
                row.scanStatus === scanStatus.inProgress || row.scanStatus === scanStatus.pending,
            },
            {
              label: translations.export_report,
              key: '3',
            },
          ];
          if (imageFromType === tabType.registry) {
            items.splice(1, 0, {
              label:
                row.imageAttr.imageType === ImageType.BASE
                  ? translations.scanner_images_unsetBaseImage
                  : translations.scanner_images_setBaseImage,
              key: '1',
            });
          }
          let handleMenuClick = (e: { key: string }) => {
            if (e.key === '0') {
              imageScanTaskFn({ imageIds: [row.id], imageFromType: imageFromType });
            } else if (e.key === '1') {
              setBaseImageType(
                { imageType: row.imageAttr.imageType, imageUniqueID: row.imageUniqueID },
                (d: any) => {
                  tableRef?.current?.refresh();
                },
              );
            } else if (e.key === '3') {
              fetchReport({ imageUniqueID: [row.imageUniqueID], imageFromType });
            }
          };
          return (
            <span
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <TzDropdown
                menu={{
                  items: items.sort((a: any, b: any) => {
                    return a.key - b.key;
                  }),
                  onClick: handleMenuClick,
                }}
                destroyPopupOnHide={true}
                overlayClassName={'drop-down-menu'}
              >
                <i
                  className={'icon iconfont icon-gengduo1 f20 cabb'}
                  style={{ padding: '8px', borderRadius: '8px' }}
                ></i>
              </TzDropdown>
            </span>
          );
        },
      },
    ] as any;
  }, [imageFromType]);
  return imageColumns;
};

export default useImageColumns;
