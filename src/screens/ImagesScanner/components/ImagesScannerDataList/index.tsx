import React, { useCallback, useEffect, useMemo, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { useMemoizedFn, useUnmount } from 'ahooks';
import { scanStatus, SelectItem, taskStatus } from '../../../../definitions';
import { translations } from '../../../../translations/translations';
import { TzSelect } from '../../../../components/tz-select';
import { TzConfirm } from '../../../../components/tz-modal';
import { TzMessageWarning } from '../../../../components/tz-mesage';
import {
  addBaseImage,
  exportImage,
  exportScanTask,
  exportSearchScanTask,
  imagesList,
  registryProject,
  removeBaseImage,
  scanConfigStrategies,
  scanTask,
} from '../../../../services/DataService';
import { onResult, onSubmitFailed, showSuccessMessage } from '../../../../helpers/response-handlers';
import { TablePaginationConfig } from 'antd/lib/table';
import { map } from 'rxjs/operators';
import { useLocation, useNavigate } from 'react-router-dom';
import { EllipsisPopover } from '../../../../components/ellipsisPopover/ellipsisPopover';
import classNames from 'classnames';
import { RenderTag, TzTag } from '../../../../components/tz-tag';
import { TzTableServerPage } from '../../../../components/tz-table';
import { TzButton } from '../../../../components/tz-button';
import { Store } from '../../../../services/StoreService';
import { Routes } from '../../../../Routes';
import useTzFilter, { FilterContext } from '../../../../components/ComponentsLibrary/TzFilter/useTzFilter';
import TzFilter from '../../../../components/ComponentsLibrary/TzFilter';
import TzFilterForm from '../../../../components/ComponentsLibrary/TzFilterForm';
import { TzCard } from '../../../../components/tz-card';
import { find, isArray, isEqual, keys, last, merge, set } from 'lodash';
// import { useActivate, useAliveController, useUnactivate } from 'react-activation';
import { FilterFormParam } from '../../../../components/ComponentsLibrary/TzFilterForm/filterInterface';
import { addFiletToDown, copyText, getContainer, getTime, getUrlQuery } from '../../../../helpers/until';
import { getUserInformation } from '../../../../services/AccountService';
import { TzForm, TzFormItem } from '../../../../components/tz-form';
import { TzInput } from '../../../../components/tz-input';
import { TzRadio, TzRadioGroup } from '../../../../components/tz-radio';
import Form, { FormInstance } from 'antd/lib/form';
import { ImageType } from '../../definition';
import { TzTooltip } from '../../../../components/tz-tooltip';
import { LoadingOutlined } from '@ant-design/icons';
import { TzDropdown } from '../../../../components/tz-dropdown';
import { tabType } from '../../ImagesScannerScreen';
import { TextHoverCopy } from '../../../AlertCenter/AlertCenterScreen';
import { Histogram, PageTitle } from '../../ImagesCI/CI';
import { useDetectPolicyList, useRegistryProject } from '../../../../services/ServiceHook';
import { setBaseImageType } from '../Image-scanner-detail/ImagesScannerDetail';
import { getClusterName, useAssetsClusterList } from '../../../../helpers/use_fun';
import { configTypeEnum } from '../../ImageConfig/ImageScanConfig';
import { useNavigatereFresh } from '../../../../helpers/useNavigatereFresh';
import useImageColumns from './useImageColumns';
export enum questionEnum {
  exceptionVuln = 'exceptionVuln',
  exceptionSensitive = 'exceptionSensitive',
  exceptionMalware = 'exceptionMalware',
  exceptionWebshell = 'exceptionWebshell',
  exceptionPKG = 'exceptionPKG',
  exceptionEnv = 'exceptionEnv',
  exceptionPkgLicense = 'exceptionPkgLicense',
  exceptionLicense = 'exceptionLicense',
  exceptionBoot = 'exceptionBoot',
  untrusted = 'untrusted',
  trusted = 'trusted',
  hasFixedVuln = 'hasFixedVuln',
  hasSuggestion = 'hasSuggestion',
  notInRegistry = 'notInRegistry',
  notExitBaseImage = 'notExitBaseImage',
  imageNotScanned = 'imageNotScanned',
}
export const questionIcon: any = {
  [questionEnum.exceptionVuln]: {
    icon: 'icon-loudong',
    title: translations.scanner_images_vulnerabilities,
    nodeTitle: translations.unStandard.str209,
  },
  [questionEnum.exceptionSensitive]: {
    icon: 'icon-minganwenjian1',
    title: translations.scanner_images_sensitive,
    nodeTitle: translations.unStandard.str210,
  },
  [questionEnum.exceptionMalware]: {
    icon: 'icon-eyiwenjian',
    title: translations.virus,
    nodeTitle: translations.virus,
  },
  [questionEnum.exceptionWebshell]: {
    icon: 'icon-WebShell',
    title: 'WebShell',
    nodeTitle: translations.unStandard.str213,
  },
  [questionEnum.exceptionPKG]: {
    icon: 'icon-buheguiruanjian',
    title: translations.nonCompliant,
    nodeTitle: translations.unStandard.str211,
  },
  [questionEnum.exceptionEnv]: {
    icon: 'icon-yichanghuanjingbianliang',
    title: translations.abnormalEnvironment,
    nodeTitle: translations.unStandard.str212,
  },
  [questionEnum.exceptionPkgLicense]: {
    icon: 'icon-buyunxukaiyuanxuke',
    title: translations.disallowedOpen,
    nodeTitle: translations.disallowedOpen,
  },
  [questionEnum.exceptionLicense]: {
    icon: 'icon-wenjianyinyong',
    title: translations.risk_license_file_reference,
    nodeTitle: translations.risk_license_file_reference,
  },
};
let exceptionBoot = {
  [questionEnum.exceptionBoot]: {
    icon: 'icon-tequanqidong',
    title: translations.started_root_user,
    nodeTitle: translations.started_root_user,
  },
};
export const registryQuestionIcon = {
  ...questionIcon,
  [questionEnum.untrusted]: {
    icon: 'icon-feikexinjingxiang',
    title: translations.untrusted_mirroring,
    nodeTitle: translations.untrusted_mirroring,
  },
  ...exceptionBoot,
};
export const nodeQuestionIcon = {
  ...questionIcon,
  [questionEnum.notInRegistry]: {
    icon: 'icon-feicangkujingxiang',
    title: translations.non_warehouse_images,
    nodeTitle: translations.non_warehouse_images,
  },
  ...exceptionBoot,
};
export const deployQuestionIcon = {
  ...questionIcon,
  [questionEnum.untrusted]: {
    icon: 'icon-feikexinjingxiang',
    title: translations.untrusted_mirroring,
    nodeTitle: translations.untrusted_mirroring,
  },
  [questionEnum.notInRegistry]: {
    icon: 'icon-feicangkujingxiang',
    title: translations.non_warehouse_images,
    nodeTitle: translations.non_warehouse_images,
  },
  [questionEnum.notExitBaseImage]: {
    icon: 'icon-feijichujingxianggoujian',
    title: translations.non_base_image_build,
    nodeTitle: translations.non_base_image_build,
  },
  [questionEnum.imageNotScanned]: {
    icon: 'icon-weisaomiaojingxiang',
    title: translations.image_not_scanned,
    nodeTitle: translations.image_not_scanned,
  },
  ...exceptionBoot,
};
export const getText = (status: scanStatus) => {
  if (status === scanStatus.pending) {
    return `${translations.scanner_images_pending}`;
  } else if (status === scanStatus.inProgress) {
    return ` ${translations.scanner_images_running}`;
  }
  return translations.scanner_images_scann;
};

export const onOperation = (
  row: {
    imageType: any;
    imageIds?: any;
    imageUniqueID?: any;
  },
  callback?: (item?: any) => void,
) => {
  let { imageUniqueID, imageType, imageIds } = row;
  let fn = (imageType: ImageType) => {
    return imageType === ImageType.BASE
      ? removeBaseImage({ imageUniqueID, imageFromType: tabType.registry })
      : addBaseImage({
          imageIds: isArray(imageIds) ? imageIds : [row.imageUniqueID],
          imageFromType: tabType.registry,
        });
  };
  fn(imageType).subscribe((result) => {
    if (result.error && result.error.message) {
      onSubmitFailed(result.error);
    } else {
      showSuccessMessage(
        imageType === ImageType.BASE
          ? translations.scanner_images_removeSuccess
          : translations.scanner_images_addSuccess,
      );
      callback &&
        callback(
          merge(row, {
            imageAttr: { imageType: imageType === ImageType.BASE ? ImageType.APP : ImageType.BASE },
          }),
        );
    }
  });
};

const transData = (data: any) =>
  data.map((v: any) => {
    if (v.projects?.length) {
      return {
        label: v.name,
        value: v.key,
        children: transData(v.projects),
      };
    }
    return {
      label: v.name,
      value: v.key,
    };
  });

export const registrySelectQuesOp = Object.keys(registryQuestionIcon).map((item: any) => {
  return {
    text: registryQuestionIcon[item].title,
    label: registryQuestionIcon[item].title,
    value: item,
  };
});
export const nodeSelectQuesOp = Object.keys(nodeQuestionIcon).map((item: any) => {
  return {
    text: nodeQuestionIcon[item].title,
    label: nodeQuestionIcon[item].title,
    value: item,
  };
});
export const deploySelectQuesOp = Object.keys(deployQuestionIcon).map((item: any) => {
  return {
    text: deployQuestionIcon[item].title,
    label: deployQuestionIcon[item].title,
    value: item,
  };
});
export const sannStatus: any = {
  [scanStatus.pending]: {
    style: {
      color: '#AEB4C2',
      background: '#AEB4C2',
    },
    txt: translations.scanner_images_pending,
  },
  [scanStatus.inProgress]: {
    style: {
      color: '#55B6F7',
      background: '#55B6F7',
    },
    txt: translations.scanner_images_running,
  },
  [scanStatus.succeeded]: {
    style: {
      color: '#69C57B',
      background: '#69C57B',
    },
    color: '#69C57B',
    background: '#69C57B',
    txt: translations.scanner_images_success,
  },
  [scanStatus.failed]: {
    style: {
      color: '#E66061',
      background: '#E66061',
    },
    txt: translations.scanner_images_failed,
  },
  [scanStatus.not_scan]: {
    style: {
      color: '#F5983B',
      background: '#F5983B',
    },
    txt: translations.scanner_images_notStarted,
  },
};
export const SannStatusDom: any = (props: { style: React.CSSProperties; txt: React.ReactNode }) => {
  let { style, txt = '-' } = props;
  return (
    <span className="status-case" style={{ width: '100%' }}>
      <span style={style} className="round dom-inline"></span>
      <span style={{ flex: 1, width: 0 }}>{txt}</span>
    </span>
  );
};
export const sannStatusTask: any = {
  [taskStatus.pending]: {
    color: 'rgba(142, 151, 163, 1)',
    bgColor: 'rgba(142, 151, 163, 0.1)',
    txt: translations.waiting,
  },
  [taskStatus.inProgress]: {
    color: 'rgba(33, 119, 209, 1)',
    bgColor: 'rgba(33, 119, 209, 0.05)',
    txt: translations.execution,
  },
  [taskStatus.succeeded]: {
    color: 'rgba(82, 196, 26, 1)',
    bgColor: 'rgba(82, 196, 26, 0.10)',
    txt: translations.completed,
  },
  [taskStatus.failed]: {
    color: 'rgba(255, 196, 35, 1)',
    bgColor: 'rgba(255, 196, 35, 0.10)',
    txt: translations.paused,
  },
  [taskStatus.terminate]: {
    color: 'rgba(233, 84, 84, 1)',
    bgColor: 'rgba(233, 84, 84, 0.10)',
    txt: translations.terminated,
  },
};
export const sannStatusOp = Object.keys(sannStatus).map((item: any) => {
  return {
    text: sannStatus[item].txt,
    value: item,
  };
});
export const selectStrategyId = (selectListOp: SelectItem[]) => {
  let res: any = selectListOp[0] ? selectListOp[0].value : '';
  let ContentText = () => {
    return (
      <div style={{ textAlign: 'left' }}>
        <span>{translations.scanPolicy}</span>
        <div style={{ width: '100%' }}>
          <TzSelect
            placeholder={translations.originalWarning_pleaseSelect + translations.scanningStrategy}
            defaultValue={res}
            onChange={(val) => {
              res = val;
            }}
            options={selectListOp}
          />
        </div>
      </div>
    );
  };
  return new Promise((resolve, reject) => {
    TzConfirm({
      title: <span>{translations.scanPolicy}</span>,
      content: <ContentText />,
      okText: translations.add,
      closable: true,
      onOk: () => {
        if (res.constructor === Array) {
          TzMessageWarning(translations.unStandard.str31);
          return Promise.reject();
        } else {
          resolve(res);
        }
      },
    });
  });
};

export let imageScanTaskFn = (data: { [x: string]: any; imageFromType: tabType }, callback?: () => void) => {
  let userInfo = getUserInformation();
  scanTask({
    creator: userInfo.username,
    ...data,
  }).subscribe((res) => {
    if (res.error) return;
    showSuccessMessage(translations.task_success);
    callback && callback();
  });
};
export const postExportImage = (data: any) => {
  exportImage(data).subscribe((res) => {
    onResult(res);
  });
};
export const selectAndOr = [
  {
    value: 'or',
    label: translations.union,
  },
  {
    value: 'and',
    label: translations.intersection,
  },
];
export const exportFileOptions = [
  { value: 'HTML', label: 'HTML' },
  { value: 'EXCEL', label: 'EXCEL' },
];
let ExportDownForm = (props: {
  type: 'scan_result_export' | 'image_search';
  getFormInstance: (arg0: FormInstance<any>) => any;
}) => {
  const [form] = Form.useForm();
  let userInfo = getUserInformation();
  useEffect(() => {
    props.getFormInstance && props.getFormInstance(form);
  }, [props]);
  return (
    <TzForm
      form={form}
      initialValues={{
        taskType: 'html',
        creator: userInfo.username,
        filename: new Date().getTime() + '_' + props.type,
      }}
    >
      <TzFormItem name="creator" hidden>
        <TzInput />
      </TzFormItem>
      <TzFormItem name="filename" label={translations.scanner_report_inputReportName}>
        <TzInput />
      </TzFormItem>
      <TzFormItem name="taskType" label={translations.please_select_the_report_format}>
        <TzRadioGroup
          options={exportFileOptions.map((item) => {
            item['value'] = item['value'].toLowerCase();
            return item;
          })}
        />
      </TzFormItem>
    </TzForm>
  );
};
export const fetchExportScanTask = (parameter: any, callback?: () => void) => {
  let formInstance: any;
  TzConfirm({
    title: translations.export_report,
    content: (
      <ExportDownForm
        type={'scan_result_export'}
        getFormInstance={(form: any) => {
          return (formInstance = form);
        }}
      />
    ),
    onOk: (e) => {
      return new Promise<void>((resolve, reject) => {
        formInstance?.validateFields().then((value: any) => {
          exportScanTask(merge({ parameter, ...value })).subscribe((res) => {
            if (res.error) {
              onResult(res);
              reject(res);
            } else {
              resolve();
              addFiletToDown(e);
              callback && callback();
              showSuccessMessage(translations.created_successfully);
            }
          });
        }, reject);
      });
    },
  });
};
export const fetchReport = (parameter: any, callback?: () => void) => {
  let formInstance: any;
  TzConfirm({
    title: translations.export_report,
    content: (
      <ExportDownForm
        type={'image_search'}
        getFormInstance={(form: any) => {
          return (formInstance = form);
        }}
      />
    ),
    onOk: (e) => {
      return new Promise<void>((resolve, reject) => {
        formInstance?.validateFields().then((value: any) => {
          exportSearchScanTask(merge({ parameter, ...value })).subscribe((res) => {
            if (res.error) {
              onResult(res);
            } else {
              resolve();
              addFiletToDown(e);
              callback && callback();
              showSuccessMessage(translations.created_successfully);
            }
          });
        }, reject);
      });
    },
  });
};
export const ReportStaric = (props: { fn: any }) => {
  const { fn } = props;
  const [sub, setSub] = useState(true);
  return (
    <>
      <div style={{ overflow: 'hidden' }}>
        {translations.please_select_the_report_format}： <br />
        <TzRadioGroup value={sub}>
          <TzRadio
            value={true}
            className={'mr92'}
            onClick={() => {
              setSub(true);
              fn(1);
            }}
          >
            Excel
          </TzRadio>{' '}
          <TzRadio
            value={false}
            onClick={() => {
              setSub(false);
              fn(2);
            }}
          >
            HTML
          </TzRadio>
        </TzRadioGroup>
      </div>
    </>
  );
};

export let imageAttrOp = [
  {
    text: translations.scanner_images_basisImages,
    label: translations.scanner_images_basisImages,
    value: 'base',
    icon: 'icon-jichujingxiang',
    style: { color: 'rgba(33, 119, 209, 1)' },
  },
  {
    text: translations.scanner_detail_applicationImage,
    label: translations.scanner_detail_applicationImage,
    value: 'app',
    icon: 'icon-yingyongjingxiang',
    style: { color: 'rgba(33, 119, 209, 1)' },
  },
  {
    text: translations.existRepairableVulnerability,
    label: translations.repairable_image_exists,
    value: 'hasFixedVuln',
    icon: 'icon-kexiufujingxiang',
    style: { color: 'rgba(255, 152, 107, 1)' },
  },
];
export let imageAttrTableFilterOp = imageAttrOp.map(({ text, label, value }) => ({
  text,
  label,
  value,
}));
export let imageStatusOp = [
  {
    label: translations.offLine,
    value: 'false',
  },
  {
    label: translations.onLine,
    value: 'true',
  },
];
export let ImageInfoTd = (props: { [x: string]: any; registryName?: any; timeLabel?: string }) => {
  let { imageFromType, timeLabel = translations.last_scan_time_C } = props;
  let name = `${props.fullRepoName}:${props.tag}`;
  let str = `${translations.library}：${props.registryName}(${props.registryUrl})`;
  let safe = props?.safe || 'safe';
  if (imageFromType === tabType.node) {
    name = [props.registryUrl, `${props.fullRepoName}：${props.tag}`].filter((item) => !!item).join('/');
    str = `${translations.host_name}：${props.nodeHostname}`;
  }
  return (
    <>
      <div className={'flex-r-s'} style={{ justifyContent: 'flex-start' }}>
        <div style={{ maxWidth: '80%' }} className="f16">
          <TextHoverCopy text={name} lineClamp={2} style={{ lineHeight: '24px' }} />
        </div>
        <RenderTag type={safe} className={'ml12 middle'} />
      </div>
      <p style={{ maxWidth: '100%', whiteSpace: 'initial' }}>
        {/* https://project.feishu.cn/tensorsecurity/issue/detail/17795648?parentUrl=%2Ftensorsecurity%2FissueView%2FzNne1R9VRz#comment  宽度调整 50%->100% */}
        <TzTag className={'ant-tag-gray small mt8'} style={{ maxWidth: '100%' }}>
          <EllipsisPopover>{`${str}`}</EllipsisPopover>
        </TzTag>
        {imageFromType === tabType.node ? (
          <TzTag className={'ant-tag-gray small mt8'}>{`${
            translations.clusterManage_key
          }：${getClusterName(props.nodeClusterKey)}`}</TzTag>
        ) : null}
      </p>
      <p
        className="mt8"
        style={{
          color: '#8E97A3',
        }}
      >
        {timeLabel}：{getTime(props.lastScanAt)}
      </p>
    </>
  );
};
export let ImageAttrTd = (imageAttr: {
  [x: string]: any;
  imageFromType: tabType;
  hasFixedVuln?: any;
  imageType?: any;
  reinforced?: any;
  trusted?: any;
  imageHasSuggestion?: boolean;
  nodeImageNotLibImage?: boolean;
}) => {
  let { hasFixedVuln, imageType, imageFromType } = imageAttr;
  let arr = [];
  if (imageFromType === tabType.registry || imageFromType === tabType.deploy) {
    if (imageType === ImageType.BASE) {
      arr.push(find(imageAttrOp, (ite) => ite.value === 'base'));
    } else {
      arr.push(find(imageAttrOp, (ite) => ite.value === 'app'));
    }
  }
  if (hasFixedVuln) {
    arr.push(find(imageAttrOp, (ite) => ite.value === 'hasFixedVuln'));
  }
  return (
    <p className={'icon-list flex-r-c'}>
      {arr.length
        ? arr.map((item) => {
            return (
              <TzTooltip title={item?.label}>
                <i className={'iconfont f20 mr10 ' + item?.icon} style={item?.style}></i>
              </TzTooltip>
            );
          })
        : '-'}
    </p>
  );
};
export let SecurityIssueTd = (props: any) => {
  let { securityIssue = [], imageFromType } = props;
  let question =
    imageFromType === tabType.node
      ? nodeQuestionIcon
      : imageFromType === tabType.registry
        ? registryQuestionIcon
        : deployQuestionIcon;
  let securityIssueList = securityIssue.map((item: { value: any }) => item.value);
  return (
    <p>
      {Object.keys(question).map((item) => {
        let { icon, title } = question[item];
        return (
          <TzTooltip title={title}>
            <i
              className={`iconfont f20 mr10 ${icon}`}
              style={merge({
                color: securityIssueList.includes(item) ? '#2177D1' : 'rgba(179, 186, 198, 1)',
              })}
            ></i>
          </TzTooltip>
        );
      })}
    </p>
  );
};
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
export let imageSeverityOp = keys(severityLevel)
  .slice(0, -1)
  .map((item) => {
    return {
      label: severityLevel[item].text,
      value: item,
    };
  });
export let safeAttrOp = [
  {
    label: translations.security,
    value: 'safe',
  },
  {
    label: translations.risk,
    value: 'unsafe',
  },
  {
    label: translations.unknown,
    value: 'unknown',
  },
];
const ImagesScannerDataList = (props: { imageFromType: any }) => {
  let { imageFromType } = props;
  const [filters, setFilters] = useState<any>({});
  let [showPageFooter, setShowPageFooter] = useState(false);
  let [selectedRowKeys, setSelectedRowKeys] = useState<any>([]);
  let [param, setParam] = useState({} as any);
  const imageListComp = useRef(undefined as any);
  const reqFun = useCallback(
    (pagination: TablePaginationConfig) => {
      const { current = 1, pageSize = 10 } = pagination;
      const offset = (current - 1) * pageSize;
      let pageParams = Object.assign({
        pagination: { limit: pageSize, offset },
        uuids: [],
        imageFromType,
        ...filters,
      });
      setParam(pageParams);
      return imagesList(pageParams).pipe(
        map((res: any) => {
          let items = res.getItems();
          return {
            data: items,
            total: res?.data?.totalItems,
          };
        }),
      );
    },
    [props.imageFromType, filters],
  );
  const navigate = useNavigate();
  let imageColumns = useImageColumns({ imageFromType, tableRef: imageListComp });

  let specialImageTypeList = useRegistryProject(tabType.registry);
  let clusterList = useAssetsClusterList();
  let detectPolicyList = useDetectPolicyList(
    tabType.registry === imageFromType
      ? configTypeEnum.regImage
      : tabType.node === imageFromType
        ? configTypeEnum.nodeImage
        : configTypeEnum.deploy,
  );
  const imagesScannerScreenFilter: any = useMemo(() => {
    let arr: any = [
      {
        label: translations.scanner_images_imageName,
        name: 'imageKeyword',
        type: 'input',
        icon: 'icon-jingxiang',
      },
      {
        label: translations.safetyProblem,
        name: 'securityIssue',
        type: 'select',
        icon: 'icon-wenti',
        props: {
          mode: 'multiple',
          options: imageFromType === tabType.registry ? registrySelectQuesOp : nodeSelectQuesOp,
        },
        condition: {
          name: 'issueIntersection',
          props: {
            optionLabelProp: 'optionLabel',
            options: [
              {
                value: 'or',
                optionLabel: <span>&cup;</span>,
                label: (
                  <>
                    <span className="mr8 fw550 f15">&cup;</span>
                    {translations.union}
                  </>
                ),
              },
              {
                value: 'and',
                optionLabel: <span>&cap;</span>,
                label: (
                  <>
                    <span className="mr8 fw550 f15">&cap;</span>
                    {translations.intersection}
                  </>
                ),
              },
            ],
          },
        },
      },
      {
        label: translations.attribute,
        name: 'imageAttr',
        type: 'select',
        icon: 'icon-shuxing_1',
        props: {
          mode: 'multiple',
          options: imageAttrTableFilterOp,
        },
        condition: {
          name: 'attrIntersection',
          props: {
            optionLabelProp: 'optionLabel',
            options: [
              {
                value: 'or',
                optionLabel: <span>&cup;</span>,
                label: (
                  <>
                    <span className="mr8 fw550 f15">&cup;</span>
                    {translations.union}
                  </>
                ),
              },
              {
                value: 'and',
                optionLabel: <span>&cap;</span>,
                label: (
                  <>
                    <span className="mr8 fw550 f15">&cap;</span>
                    {translations.intersection}
                  </>
                ),
              },
            ],
          },
        },
      },
      {
        label: translations.hitPolicy,
        name: 'policyUniqueID',
        type: 'select',
        icon: 'icon-xiangyingzhuangtai',
        props: {
          mode: 'multiple',
          options: detectPolicyList,
        },
        condition: {
          name: 'policyIntersection',
          props: {
            optionLabelProp: 'optionLabel',
            options: [
              {
                value: 'or',
                optionLabel: <span>&cup;</span>,
                label: (
                  <>
                    <span className="mr8 fw550 f15">&cup;</span>
                    {translations.union}
                  </>
                ),
              },
              {
                value: 'and',
                optionLabel: <span>&cap;</span>,
                label: (
                  <>
                    <span className="mr8 fw550 f15">&cap;</span>
                    {translations.intersection}
                  </>
                ),
              },
            ],
          },
        },
      },
      {
        label: translations.compliances_breakdown_status,
        name: 'onlineStr',
        type: 'select',
        icon: 'icon-yunhangzhuangtai',
        props: {
          mode: 'multiple',
          options: imageStatusOp,
        },
      },
      {
        label: translations.vulnerability_statistics,
        name: 'vulnStatic',
        type: 'select',
        icon: 'icon-chengdu',
        props: {
          options: imageSeverityOp,
          mode: 'multiple',
        },
      },
      {
        label: translations.security_status,
        name: 'safeAttr',
        type: 'select',
        icon: 'icon-anquanzhuangtai',
        props: {
          options: safeAttrOp,
          mode: 'multiple',
        },
      },
    ];
    if (tabType.registry === imageFromType) {
      arr.splice(1, 0, {
        label: translations.scanner_report_repo,
        name: 'projects',
        type: 'cascader',
        icon: 'icon-cangku',
        props: {
          multiple: true,
          options: specialImageTypeList,
        },
      });
    } else if (tabType.node === imageFromType) {
      arr.splice(
        1,
        0,
        {
          label: translations.compliances_breakdown_statusName,
          name: 'nodeKeyword',
          type: 'input',
          icon: 'icon-jiedian',
        },
        {
          label: translations.clusterManage_key,
          name: 'clusterKey',
          type: 'select',
          icon: 'icon-jiqun',
          props: {
            mode: 'multiple',
            options: clusterList,
          },
        },
      );
    }
    return arr;
  }, [specialImageTypeList, detectPolicyList]);

  const data = useTzFilter({ initial: imagesScannerScreenFilter });

  const handleChange = useCallback((values: any) => {
    let temp = { ...values };
    setFilters((prev: any) => {
      temp['projects'] = temp['projects']?.map((item: string[]) => [...item].pop());
      return isEqual(values, prev) ? prev : temp;
    });
  }, []);
  let handleRowSelection = (selected: boolean, selectedRows: any[]) => {
    setSelectedRowKeys((pre: any) => {
      selectedRows.forEach(({ id }: any) => {
        if (selected) {
          pre.push(id);
        } else {
          pre.remove(id);
        }
      });
      return [...pre];
    });
  };
  const rowSelection = useMemo(() => {
    if (!showPageFooter) return undefined;
    return {
      columnWidth: '32px',
      selectedRowKeys,
      onSelect: (record: any, selected: any, selectedRows: any, nativeEvent: any) => {
        nativeEvent.stopPropagation();
        handleRowSelection(selected, [record]);
      },
      onSelectAll: (selected: any, selectedRows: any, changeRows: any) => {
        handleRowSelection(selected, changeRows);
      },
    };
  }, [showPageFooter, selectedRowKeys]);
  let l = useLocation();
  let setFooter = useCallback(() => {
    Store.pageFooter.next(
      showPageFooter ? (
        <div>
          <span className="mr16 ml16">{`${translations.selected} ${selectedRowKeys.length} ${translations.items}`}</span>
          <TzButton
            disabled={!selectedRowKeys.length}
            className={'mr20'}
            onClick={() =>
              fetchReport({ imageIds: selectedRowKeys, imageFromType }, () => {
                setShowPageFooter(false);
              })
            }
          >
            {translations.export_report}
          </TzButton>
          <TzButton
            disabled={!selectedRowKeys.length}
            className={'mr20'}
            onClick={() =>
              imageScanTaskFn({ imageIds: selectedRowKeys, imageFromType }, () => {
                setShowPageFooter(false);
              })
            }
          >
            {translations.scanner_scanAll}
          </TzButton>
        </div>
      ) : null,
    );
  }, [showPageFooter, selectedRowKeys, imageFromType, l]);
  useEffect(() => {
    setFooter();
  }, [setFooter]);
  let { jump } = useNavigatereFresh();
  return (
    <div>
      <PageTitle
        title={
          tabType.registry === imageFromType
            ? translations.scanner_report_repoImage
            : tabType.node === imageFromType
              ? translations.scanner_report_nodeImage
              : ''
        }
        extra={
          <>
            <TzButton
              className={'ml16'}
              onClick={() => {
                navigate(`${Routes.SecurityPolicy}?imageFromType=${imageFromType}`);
              }}
              icon={<i className="icon iconfont icon-celveguanli"></i>}
            >
              {translations.security_policy}
            </TzButton>
            <TzButton
              className={'ml16'}
              onClick={() => {
                jump(`${Routes.ImageScanRecord}?imageFromType=${imageFromType}`, 'ImageScanRecord');
              }}
              icon={<i className="icon iconfont icon-saomiaozhuangtai"></i>}
            >
              {translations.scanRecord}
            </TzButton>
          </>
        }
      />
      <div className="mb12 mt16">
        <FilterContext.Provider value={{ ...data }}>
          <div className={'flex-r-c'}>
            <div>
              <TzButton
                onClick={() => {
                  setShowPageFooter((pre) => {
                    if (!pre) {
                      setSelectedRowKeys([]);
                    }
                    return !pre;
                  });
                }}
              >
                {showPageFooter ? translations.cancel_batch_operation : translations.batch_operation}
              </TzButton>
              {!showPageFooter ? (
                <>
                  <TzButton
                    className={'ml16'}
                    onClick={() => {
                      imageScanTaskFn({ ...param, imageFromType }, () => {
                        setShowPageFooter(false);
                      });
                    }}
                  >
                    {translations.customScan}
                  </TzButton>
                  <TzButton
                    className={'ml16'}
                    onClick={(e) => {
                      fetchReport(merge({}, param, { imageFromType }), () => {});
                    }}
                  >
                    {translations.export_report}
                  </TzButton>
                </>
              ) : null}
            </div>
            <TzFilter />
          </div>
          <TzFilterForm onChange={handleChange} />
        </FilterContext.Provider>
      </div>

      <TzTableServerPage
        rowSelection={rowSelection}
        columns={imageColumns}
        rowKey="id"
        reqFun={reqFun}
        defaultPagination={{
          hideOnSinglePage: false,
        }}
        onRow={(record) => {
          return {
            onClick: () => {
              jump(
                `${Routes.RegistryImagesDetailInfo}?imageUniqueID=${record.imageUniqueID}&imageFromType=${imageFromType}`,
                'RegistryImagesDetailInfo',
              );
            },
          };
        }}
        ref={imageListComp}
      />
    </div>
  );
};

export default ImagesScannerDataList;
