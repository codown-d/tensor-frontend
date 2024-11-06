import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import {
  ImagesDigestLayer,
  ImagesScanDetail,
  ImagesScanDetailVirus,
  LayerDigestInfo,
  ScanSeverity,
  SensitiveFile,
  PaginationOptions,
  DynamicObject,
  SelectItem,
  Overview,
  ScoreType,
  WebResponse,
} from '../../../../definitions';
import { ImageType, IBaseImageItem } from '../../definition';
import EllipsisPopover from '../../../../components/ellipsisPopover/ellipsisPopover';
import { addFiletToDown, copyText, utc2beijing } from '../../../../helpers/until';
import { localLang, translations } from '../../../../translations/translations';
import { TzTooltip } from '../../../../components/tz-tooltip';
import { TzConfirm, TzModal } from '../../../../components/tz-modal';
import { getScanDiscoverDetail } from '../../../../services/DataService';
import { getCurrentLanguage } from '../../../../services/LanguageService';
import { TzButton } from '../../../../components/tz-button';
import { onOperation, postExportImage, ReportStaric } from '../../components/ImagesScannerDataList';
import { TzTable, TzTableServerPage } from '../../../../components/tz-table';
import { tabType } from '../../ImagesScannerScreen';
import { LeakDetailInfo } from '../../../ImagesDiscover/ImagesDiscoverDetail';

export const leakProps = [
  {
    type: ScanSeverity.Safe,
    labe: translations.security,
    color: '#82e66f',
    bgcolor: '#b2eea6',
  },
  {
    type: ScanSeverity.Negligible,
    labe: translations.notificationCenter_columns_Negligible,
    color: '#A6ACBD',
    bgcolor: '#F3F4F6',
  },
  {
    type: ScanSeverity.Unknown,
    labe: translations.unknown,
    color: 'rgba(127, 142, 168, 0.8)',
    bgcolor: '#E1F2FF',
  },
  {
    type: ScanSeverity.Low,
    labe: translations.severity_Low,
    color: 'rgba(255, 196, 35, 0.8)',
    bgcolor: '#FFF5DC',
  },
  {
    type: ScanSeverity.Medium,
    labe: translations.severity_Medium,
    color: 'rgba(255, 138, 52, 0.8)',
    bgcolor: '#FAE5D8',
  },
  {
    type: ScanSeverity.High,
    labe: translations.severity_High,
    color: 'rgba(233, 84, 84, 0.8)',
    bgcolor: '#F0D3D3',
  },
  {
    type: ScanSeverity.Critical,
    labe: translations.notificationCenter_columns_Critical,
    color: 'rgba(158, 0, 0, 0.8)',
    bgcolor: '#E3C4C4',
  },
];

export const severityLevel: any = {
  CRITICAL: {
    text: translations.notificationCenter_columns_Critical,
    style: {
      color: '#9E0000',
      backgroundColor: 'rgba(158, 0, 0, 0.1)',
    },
  },
  HIGH: {
    text: translations.severity_High,
    style: {
      color: '#E95454',
      backgroundColor: 'rgba(233, 84, 84, 0.12)',
    },
  },
  MEDIUM: {
    text: translations.severity_Medium,
    style: {
      color: '#FF8A34',
      backgroundColor: 'rgba(255, 138, 52, 0.1)',
    },
  },
  LOW: {
    text: translations.severity_Low,
    style: {
      color: '#FFC423',
      backgroundColor: 'rgba(255, 196, 35, 0.1)',
    },
  },
  UNKNOWN: {
    text: translations.unknown,
    style: {
      color: '#7F8EA8',
      backgroundColor: 'rgba(124, 138, 164, 0.1)',
    },
  },
  ALL: {
    en: 'all',
    zh: translations.scanner_images_all,
    text: translations.scanner_images_all,
    style: {
      color: '#2177D1',
      backgroundColor: 'rgba(33,119,209, 0.1)',
    },
    color: '#2177D1',
    bgcolor: 'rgba(33,119,209, 0.1)',
  },
};

export const ShareDockUrl = (props: { href: string }) => {
  const { href } = props;
  const shareClick = useCallback(
    (e: any) => {
      e.preventDefault();
      copyText(href, true);
    },
    [href],
  );
  return (
    <TzButton className={'ml16'} icon={<i className={'icon iconfont icon-fenxiang'}></i>} onClick={shareClick}>
      {translations.scanner_detail_share}
    </TzButton>
  );
};
export let setBaseImageType = (
  props: {
    imageType: ImageType;
    imageIds?: number[];
    imageUniqueID?: string;
  },
  callback?: (item?: any) => void,
) => {
  let imageType = props.imageType;
  TzConfirm({
    title: <></>,
    content:
      imageType == ImageType.BASE
        ? translations.scanner_images_deleteConfirmContent
        : translations.scanner_images_addConfirmContent,
    okText: imageType == ImageType.BASE ? translations.scanner_config_delete : translations.sure,
    cancelText: translations.confirm_modal_cancel,
    okButtonProps: {
      type: 'primary',
      danger: imageType == ImageType.BASE,
    },
    onOk() {
      onOperation({ ...props, imageType }, () => {
        callback && callback();
      });
    },
  });
};
export const BaseImageOperation = (props: { imageType: ImageType; imageUniqueID: string; callback?: any }) => {
  return (
    <TzButton
      onClick={() => {
        setBaseImageType(props, () => {
          props?.callback && props.callback();
        });
      }}
    >
      {props.imageType === ImageType.BASE
        ? translations.scanner_detail_unsetBaseImage
        : translations.scanner_detail_setBaseImage}
    </TzButton>
  );
};

export const CopyActionText = (props: {
  children: string;
  popover?: boolean;
  realChildren?: any;
  realCopyText?: string;
}) => {
  const { children, popover, realChildren, realCopyText } = props;
  return (
    <span onClick={() => copyText(realCopyText || children)} className="copy_text">
      <i className={'icon iconfont icon-fuzhi'} style={{ marginRight: '6px' }}></i>
      {popover ? (
        <span>
          <EllipsisPopover>{children}</EllipsisPopover>
        </span>
      ) : (
        <span className="popover">{realChildren || children}</span>
      )}
    </span>
  );
};

export enum RiskTypes {
  malicious = 'malicious',
  pkgs = 'pkgs',
  sensitive_files = 'sensitive_files',
  vulus = 'vulus',
  webshell_info = 'webshell_info',
}
let DetailInfo = (props: any) => {
  let { name, pkgName, pkgVersion, PkgName = '', CVEID = '', InstalledVersion = '' } = props.data;
  let [dataInfo, setDataInfo] = useState<any>({});
  useEffect(() => {
    getScanDiscoverDetail({
      vulnName: CVEID || name,
      pkgName: PkgName || pkgName,
      pkgVersion: InstalledVersion || pkgVersion,
    }).subscribe((res) => {
      if (res.error) return;
      let item = res.getItem();
      setDataInfo(item);
    });
  }, [props.data]);
  return <LeakDetailInfo data={dataInfo} />;
};
export const SeverityIconTag = (props: { data: any; itemClick?: (p: any) => void }) => {
  let { data = {} } = props;
  let o: any = Object.assign(
    {
      CRITICAL: '',
      HIGH: '',
      MEDIUM: '',
      LOW: '',
      UNKNOWN: '',
      NEGLIGIBLE: '',
    },
    data,
  );
  return (
    <>
      {Object.keys(o).map((item) => {
        let key = item;
        if (!o[key] || !severityLevel[key]) {
          return null;
        }
        let { style, text } = severityLevel[key];
        return (
          <span
            className={'f14 mr8 radius6 family-s cursor-p'}
            onClick={() => {
              props['itemClick'] && props.itemClick(key);
            }}
            style={Object.assign(
              {
                padding: '0px 12px',
                lineHeight: '28px',
                display: 'inline-block',
              },
              style,
            )}
          >
            <TzTooltip title={`${severityLevel[key].text + ':' + o[item] || text}`}>
              <p
                className={'mr6'}
                style={{
                  background: severityLevel[key].style.color,
                  width: '8px',
                  height: '8px',
                  borderRadius: '8px',
                  display: 'inline-block',
                }}
              ></p>
              {o[item] || text}
            </TzTooltip>
          </span>
        );
      })}
    </>
  );
};
export const SeverityIcon = (props: any) => {
  const { data } = props;
  let obj: DynamicObject = {};
  data.forEach((item: any) => {
    if (item.Severity) {
      if (obj[item.Severity]) {
        obj[item.Severity] += 1;
      } else {
        obj[item.Severity] = 1;
      }
    } else if (item.severity) {
      if (obj[item.severity]) {
        obj[item.severity] += 1;
      } else {
        obj[item.severity] = 1;
      }
    }
  });
  return (
    <>
      <SeverityIconTag
        data={obj}
        itemClick={(key: any) => {
          props['itemClick'] && props.itemClick(key);
        }}
      />
    </>
  );
};

export const Severitycomponent = (props: { severity: string }) => {
  let { style, text } = severityLevel[props.severity] || {};
  return (
    <span className={'t-c severity-span'} style={style}>
      {text}
    </span>
  );
};
export const ExpandedRowChildren = (props: any) => {
  const { tableData } = props;
  let columns: any = [
    {
      title: translations.scanner_detail_container_name,
      dataIndex: 'name',
      key: 'name',
      ellipsis: {
        showTitle: false,
      },
      render(_name: any, row: any) {
        let str = row.CVEID || row.name;
        return <EllipsisPopover>{str}</EllipsisPopover>;
      },
    },
    {
      title: translations.scanner_detail_severity,
      dataIndex: 'severity',
      align: 'center',
      render(_item: any, row: any) {
        let lang = getCurrentLanguage();
        let str = row.Severity || row.severity;
        return (
          <span className={'t-c severity-span'} style={severityLevel[str].style}>
            {severityLevel[str].text}
          </span>
        );
      },
    },
    {
      title: translations.scanner_detail_soft_pack,
      dataIndex: 'pkgName',
      key: 'pkgName',
      ellipsis: {
        showTitle: false,
      },
      render(_pkgName: any, row: any) {
        let str = row.PkgName || row.pkgName;
        return <EllipsisPopover lineClamp={2}>{str}</EllipsisPopover>;
      },
    },
    {
      title: translations.scanner_detail_leak_version,
      dataIndex: 'pkgVersion',
      key: 'pkgVersion',
      ellipsis: {
        showTitle: false,
      },
      render(_pkgVersion: any, row: any) {
        let str = row.InstalledVersion || row.pkgVersion;
        return <EllipsisPopover>{str}</EllipsisPopover>;
      },
    },
    {
      title: translations.runtimePolicy_container_path,
      dataIndex: 'target',
      key: 'target',
    },
    {
      title: translations.attack_path,
      dataIndex: 'attackPath',
      width: '110px',
      key: 'attackPath',
      render(attackPath: any, _row: any) {
        return attackPath;
      },
    },
  ];
  return (
    <div
      style={{
        background: 'transparent',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      <TzTable
        className={'bg-f3'}
        dataSource={tableData}
        columns={columns}
        rowKey={'id'}
        pagination={{ defaultPageSize: 10, hideOnSinglePage: true }}
        expandable={{
          expandedRowRender: (record) => {
            return <DetailInfo data={record} />;
          },
        }}
      />
    </div>
  );
};
export const filtersOperation = Object.keys(severityLevel)
  .filter((item) => 'ALL' !== item)
  .map((item) => {
    return { text: severityLevel[item].text, value: item };
  });
export const filtersRepairable = [
  {
    text: translations.yes,
    value: 'true',
    label: translations.yes,
  },
  {
    text: translations.no,
    value: 'false',
    label: translations.no,
  },
];
