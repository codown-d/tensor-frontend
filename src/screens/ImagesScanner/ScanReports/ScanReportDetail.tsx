import Form from 'antd/lib/form';
import moment from 'moment';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { map } from 'rxjs/operators';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { translations } from '../../../translations/translations';
import { sannStatusTask } from '../components/ImagesScannerDataList';
import { nodeImageImagesList } from '../../../services/DataService';
import { WebResponse } from '../../../definitions';
import { TzForm, TzFormItem } from '../../../components/tz-form';
import { TzInput } from '../../../components/tz-input';
import { TzCheckboxGroup } from '../../../components/tz-checkbox';
import TzTextArea from '../../../components/ComponentsLibrary/TzTextArea';
import { TzTableServerPage } from '../../../components/tz-table';
import { Store } from '../../../services/StoreService';
import ArtTemplateDataInfo from '../../../components/ComponentsLibrary/ArtTemplateDataInfo';
export const exportFileOptions = [
  {
    label: 'HTML',
    value: 'HTML',
  },
  {
    label: 'Excel',
    value: 'Excel',
  },
];
const ScanReportDetail = (props: any) => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<any>({});
  const tablelistRef = useRef<any>(undefined);
  const [info, setInfo] = useState<any>(null);
  const [form] = Form.useForm();
  const { type = '' } = useParams();
  const edit = type == 'info' ? true : false;
  const columns = useMemo(() => {
    return [
      {
        title: translations.taskCreationTime,
        key: 'registryUrl',
        render: (item: any, row: any) => {
          return moment().format('YYYY-MM-DD HH:mm:ss');
        },
      },
      {
        title: translations.scanType,
        dataIndex: 'imageAttr',
        key: 'imageAttr',
        filters: [
          {
            text: translations.periodic_scanning,
            value: 'week',
          },
          {
            text: translations.mirrorSynchronization,
            value: 'month',
          },
          {
            text: translations.vuln_library_updates,
            value: 'vuln',
          },
        ],
      },
      {
        title: translations.scanSuccessRate,
        dataIndex: 'vulnStatic',
        key: 'vulnStatic',
      },
      {
        title: translations.scanTime,
        key: 'online',
        dataIndex: 'online',
      },
      {
        title: translations.creator,
        dataIndex: 'bootUser',
        key: 'bootUser',
      },
      {
        title: translations.taskStatus,
        key: 'scanStatus',
        dataIndex: 'scanStatus',
        filters: Object.keys(sannStatusTask).map((item: any) => {
          return {
            text: sannStatusTask[item].txt,
            value: item,
          };
        }),
        render: (item: any, row: any) => {
          return item;
        },
      },
      {
        title: translations.clusterManage_operate,
        width: '6%',
      },
    ];
  }, []);
  const reqFun = useCallback(
    (pagination, filter) => {
      const { current = 1, pageSize = 10 } = pagination;
      const offset = (current - 1) * pageSize;
      const params = {
        offset,
        limit: pageSize,
        imageFromType: 'node',
        ...filters,
      };
      return nodeImageImagesList(params).pipe(
        map((res: WebResponse<any>) => {
          const items = res.getItems();
          return {
            data: items,
            total: res?.data?.totalItems || 0,
          };
        }),
      );
    },
    [filters],
  );
  const dataInfoList = useMemo(() => {
    const obj: any = {
      sound: translations.sound_notification + '：',
      mail: translations.mailNotification + '：',
      severity: translations.event_severity + '：',
      emails: translations.scanner_report_receiveEmail + '：',
    };
    if (!info) {
      return [];
    }
    return Object.keys(obj).map((item) => {
      let o: any = {
        title: obj[item] || '-',
        content: '',
      };
      return o;
    });
  }, [edit, info]);
  const l = useLocation();
  useEffect(() => {
    Store.header.next({
      title: translations.scanner_report_addReport,
      onBack: () => {
        navigate(-1);
      },
    });
  }, [l]);
  return (
    <div className={'mlr32 scan-report-detail'}>
      {edit ? (
        <TzForm form={form} validateTrigger={'onChange'}>
          <TzFormItem
            name="name"
            label={translations.scanner_report_reportName}
            rules={[{ required: true, message: translations.scanner_report_inputReportName }]}
          >
            <TzInput placeholder={translations.scanner_report_inputReportName} />
          </TzFormItem>
          <TzFormItem
            name="content_types"
            label={translations.report_format}
            rules={[
              {
                required: true,
                message: translations.please_select_the_report_format,
              },
            ]}
          >
            <TzCheckboxGroup options={exportFileOptions} />
          </TzFormItem>
          <TzFormItem
            name="content_types"
            label={translations.report_format}
            rules={[
              {
                required: true,
                message: translations.please_select_the_report_format,
              },
            ]}
          >
            <TzCheckboxGroup options={exportFileOptions} />
          </TzFormItem>
          <TzFormItem
            name="content_types"
            label={translations.report_format}
            rules={[
              {
                required: true,
                message: translations.please_select_the_report_format,
              },
            ]}
          >
            <TzCheckboxGroup options={exportFileOptions} />
          </TzFormItem>
          <TzFormItem
            name="objectName"
            label={translations.scanner_report_reportRange}
            rules={[
              { required: true, message: translations.scanner_report_reportRangePlaceholder },
            ]}
          >
            <TzInput placeholder={translations.scanner_report_reportRangePlaceholder} />
          </TzFormItem>
          <TzFormItem
            name="content_types"
            label={translations.scanner_report_reportContent}
            rules={[
              {
                required: true,
                message: translations.scanner_report_reportContentPlaceholder,
              },
            ]}
          >
            <TzCheckboxGroup options={exportFileOptions} />
          </TzFormItem>
          <TzFormItem
            name="objectName"
            label={translations.scanner_report_receiveEmail}
            rules={[
              { required: true, message: translations.scanner_report_receiveEmailPlaceholder },
            ]}
          >
            <TzInput placeholder={translations.scanner_report_emailRequired} />
          </TzFormItem>
          <TzFormItem
            name="objectName"
            label={translations.imageReject_comment_title}
            rules={[{ required: true, message: translations.unStandard.str77 }]}
          >
            <TzTextArea placeholder={translations.unStandard.str77} maxLength={100} />
          </TzFormItem>
        </TzForm>
      ) : (
        <>
          <ArtTemplateDataInfo data={dataInfoList.slice(0, -1)} span={2} />
          <TzTableServerPage columns={columns} rowKey={'id'} reqFun={reqFun} ref={tablelistRef} />
        </>
      )}
    </div>
  );
};
export default ScanReportDetail;
