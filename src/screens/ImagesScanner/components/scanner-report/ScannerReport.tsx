import React, { useCallback, useMemo, useRef, useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import { catchError, finalize, tap, map } from 'rxjs/operators';
import { Subscription, throwError } from 'rxjs';
import { WebResponse , SupportedLangauges } from '../../../../definitions';

import { translations, localLang } from '../../../../translations/translations';
import { TzButton } from '../../../../components/tz-button';
import { TzInput } from '../../../../components/tz-input';
import { TzInputSearch } from '../../../../components/tz-input-search';
import { TzConfirm } from '../../../../components/tz-modal';
import './ScannerReport.scss';
import { TzForm, TzFormItem } from '../../../../components/tz-form';
import { TzSelect } from '../../../../components/tz-select';
import { onSubmitFailed, showSuccessMessage } from '../../../../helpers/response-handlers';
import { debounce, isEmpty, isEqual } from 'lodash';
import { TzTableServerPage } from '../../../../components/tz-table';
import { TzInputTextArea } from '../../../../components/tz-input-textarea';
import { TablePaginationConfig, Form, TimePicker } from 'antd';
import { TzTooltip } from '../../../../components/tz-tooltip';
import { TzDrawer } from '../../../../components/tz-drawer';
import { TzCol, TzRow } from '../../../../components/tz-row-col';
import { TzTag } from '../../../../components/tz-tag';
import { TzRadioGroup } from '../../../../components/tz-radio';
import { TzCheckboxGroup } from '../../../../components/tz-checkbox';
import ReportTemplate from '../report-template/ReportTemplate';
import ReactDOM from 'react-dom';
import moment from 'moment';
import {
  addReport,
  deleteReport,
  geneReport,
  getAllProjects,
  getAllRepos,
  getAssetsClustersList,
  getReportData,
  getReportDetail,
  getReportList,
  getReportRecord,
  updateReport,
} from '../../../../services/DataService';
import { TzDatePicker } from '../../../../components/tz-date-picker';
import { getUrlQuery } from '../../../../helpers/until';
import TzTimePicker from '../../../../components/ComponentsLibrary/TzTimePicker';
import { Tittle } from '../../../../components/ComponentsLibrary/Tittle';

const reportType = {
  [SupportedLangauges.Chinese]: [
    {
      label: translations.scanner_report_weeklyReport,
      value: 1,
    },
    {
      label: translations.scanner_report_monthlyReport,
      value: 2,
    },
    {
      label: translations.scanner_report_customReport,
      value: 3,
    },
  ],
  [SupportedLangauges.English]: [
    {
      label: 'Weak',
      value: 1,
    },
    {
      label: 'Month',
      value: 2,
    },
    {
      label: 'Custom',
      value: 3,
    },
  ],
};
const reportWeekOpts = {
  [SupportedLangauges.Chinese]: [
    translations.monday,
    translations.tuesday,
    translations.wednesday,
    translations.thursday,
    translations.friday,
    translations.saturday,
    translations.sunday,
  ].map((item, index) => ({ label: item, value: index + 1 })),
  [SupportedLangauges.English]: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((item, index) => ({
    label: item,
    value: index + 1,
  })),
};
const reportDateOpts = new Array(31).fill(0).map((_, index) => ({ label: String(index + 1), value: index + 1 }));

const reportContentOpts = {
  [SupportedLangauges.Chinese]: [
    {
      label: translations.scanner_report_riskInfoStatis,
      value: 1,
    },
    {
      label: translations.scanner_report_imageLeakList,
      value: 2,
    },
    {
      label: translations.scanner_report_virusList,
      value: 3,
    },
    {
      label: translations.scanner_report_imageFixAdvise,
      value: 4,
    },
  ],
  [SupportedLangauges.English]: [
    {
      label: 'Risk information overview',
      value: 1,
    },
    {
      label: 'Image vulnerabilities list',
      value: 2,
    },
    {
      label: 'Trojan virus list',
      value: 3,
    },
    {
      label: 'Image fix advice',
      value: 4,
    },
  ],
};
const reportRangeOpts = [
  {
    label: translations.scanner_report_repoImage,
    value: 1,
  },
];
const repoOpts = {
  [SupportedLangauges.Chinese]: [
    {
      label: '项目',
      value: 1,
    },
    {
      label: translations.library,
      value: 2,
    },
  ],
  [SupportedLangauges.English]: [
    {
      label: 'project',
      value: 1,
    },
    {
      label: 'repository',
      value: 2,
    },
  ],
};

const ReportManagement = () => {
  const listRef = useRef<any>(null);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const reportOperateRef = useRef<any>(undefined);
  const reportDetailRef = useRef<any>(null);
  const [clusters, setClusters] = useState<any>([]);

  const getClusters = useCallback(() => {
    getAssetsClustersList().subscribe((result: any) => {
      if (result.error && result.error.message) {
        onSubmitFailed(result.error);
      } else {
        setClusters(result.map((item: any) => ({ name: item.name, key: item.key })));
      }
    });
  }, []);

  const fetchReportList = useCallback(
    (pagination?: TablePaginationConfig, filters?: any) => {
      const { current = 1, pageSize = 10 } = pagination || {};
      const offset = (current - 1) * pageSize;
      const type = filters?.reportType?.join(',') || '';
      const pageParams = {
        offset,
        key_word: searchKeyword,
        limit: pageSize,
        type,
      };
      if (pageParams.key_word || type) pageParams.offset = 0;
      return getReportList(pageParams).pipe(
        map((resp: WebResponse<any>) => {
          return {
            data: resp.data?.items,
            total: resp.data?.totalItems,
          };
        }),
        catchError((error) => {
          return throwError(error);
        }),
      );
    },
    [searchKeyword],
  );

  const onSearch = useCallback((value: string) => {
    setSearchKeyword((value && value.trim()) || '');
  }, []);

  const onRemoveReport = useCallback((id) => {
    deleteReport(id).subscribe((res) => {
      if (res.error && res.error.message) {
        onSubmitFailed(res.error);
      } else {
        showSuccessMessage(translations.scanner_report_operateSuccess);
        listRef.current.refresh();
      }
    });
  }, []);
  const refreshList = useCallback(() => listRef?.current?.refresh(), [listRef]);
  const editReport = useCallback((data) => {
    reportOperateRef?.current.show(data, true);
  }, []);

  const repoColumns: any = useMemo(
    () => [
      {
        title: translations.scanner_report_reportName,
        key: 'name',
        ellipsis: {
          showTitle: false,
        },
        render: (row: any) => {
          return (
            <span className={'color-b'} onClick={() => reportDetailRef?.current.show(row)}>
              <TzTooltip title={row.name} placement="topLeft">
                {row.name}
              </TzTooltip>
            </span>
          );
        },
      },
      {
        title: translations.scanner_report_reportType,
        key: 'reportType',
        ellipsis: {
          showTitle: false,
        },
        filters: reportType[localLang]?.map((item: any) => {
          return {
            text: item.label,
            value: item.value,
          };
        }),
        render: (row: any) => {
          return <span>{(reportType[localLang].find((item: any) => item.value === row.type) || {}).label}</span>;
        },
      },
      {
        title: translations.scanner_report_receiveEmail,
        key: 'receiveEmail',
        ellipsis: {
          showTitle: false,
        },
        render: (row: any) => {
          return (
            <span>
              <TzTooltip title={(row.emails || []).join(',')} placement="topLeft">
                {(row.emails || []).join(',')}
              </TzTooltip>
            </span>
          );
        },
      },
      {
        title: translations.scanner_report_createTime,
        key: 'createTime',
        width: '14%',
        render: (time: any) => moment(time).format('YYYY-MM-DD HH:mm:ss'),
      },
      {
        title: translations.scanner_report_lastUpdateTime,
        key: 'lastUpdateTime',
        width: '14%',
        render: (time: any) => moment(time).format('YYYY-MM-DD HH:mm:ss'),
      },
      {
        title: translations.scanner_report_operate,
        key: 'operate',
        dataIndex: '',
        width: 124,
        render: (_: any, row: any) => {
          return (
            <>
              {row.type != 3 && (
                <TzButton type="text" onClick={() => editReport(row)}>
                  {translations.edit}
                </TzButton>
              )}

              <TzButton
                type="text"
                danger
                onClick={() => {
                  TzConfirm({
                    content: `${translations.scanner_report_delTitle} ${row.name} ?`,
                    okText: translations.confirm_modal_sure,
                    okButtonProps: { className: 'delete-btn' },
                    cancelText: translations.cancel,
                    onOk() {
                      onRemoveReport(row.id);
                    },
                  });
                }}
              >
                {translations.delete}
              </TzButton>
            </>
          );
        },
      },
    ],
    [],
  );

  useEffect(() => {
    getClusters();
    const urlQuery: any = getUrlQuery();
    if (urlQuery.reportId) {
      getReportDetail(urlQuery.reportId).subscribe((result: any) => {
        if (result.error && result.error.message) {
          onSubmitFailed(result.error);
        } else {
          reportDetailRef?.current.show(result.getItem());
        }
      });
    }
  }, []);

  return (
    <div>
      <Tittle title={translations.scanner_report_reportList} />
      <div className="search-container">
        <TzInputSearch
          style={{ width: '360px' }}
          placeholder={translations.scanner_report_reportNamePlaceholder}
          enterButton={translations.scanner_detail_serach}
          onSearch={onSearch}
          allowClear
        />
        <TzButton onClick={() => reportOperateRef?.current?.show()}>{translations.scanner_report_add}</TzButton>
      </div>
      <TzTableServerPage columns={repoColumns as any} rowKey="id" reqFun={fetchReportList as any} ref={listRef} />
      <ReportOperate ref={reportOperateRef} fetchReportList={refreshList} clusters={clusters} />
      <ReportDetail ref={reportDetailRef} fetchReportList={refreshList} editReport={editReport} clusters={clusters} />
    </div>
  );
};

const ReportOperate = forwardRef((props: any, ref?: any) => {
  const { fetchReportList, clusters } = props;
  const [editing, setEditing] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);
  const [disableSaveBtn, setDisableSaveBtn] = useState<boolean>(true);
  const [formVal, setFormVal] = useState<any>({});
  const initFormVal = useRef<any>(null);
  const [formIns] = Form.useForm();
  const [loading, setLoading] = useState<any>(null);

  const [repoImages, setRepoImages] = useState<any>(null);
  const repoImagesRef = useRef<any>(null);

  useImperativeHandle(
    ref,
    () => {
      return {
        show(data: any, editing = false) {
          setVisible(true);
          if (editing) {
            setEditing(true);
            let start, end;
            const {
              id,
              name,
              type,
              content_types,
              emails,
              comment,
              cycle_day,
              start_timestamp,
              end_timestamp,
              registry_image_type,
              registry_image_objects,
              node_image_objects,
              image_types,
            } = data;
            if (type === 1 || type === 2) {
              start = cycle_day;
              end = moment(moment().startOf('day').valueOf() + end_timestamp);
            }
            if (type === 3) {
              start = moment(start_timestamp);
              end = moment(end_timestamp);
            }
            const initValue: any = {
              name,
              type,
              content_types,
              emails,
              comment,
              registry_image_type:
                registry_image_type == 1 || registry_image_type == 2 ? registry_image_type : undefined,
              registry_image_objects,
              node_image_objects,
              image_types,
              start,
              end,
            };
            setFormVal(initValue);
            initFormVal.current = {
              id,
              ...initValue,
              content_types: new Set(content_types),
              emails: new Set(emails),
              image_types: new Set(image_types),
              node_image_objects: new Set(node_image_objects),
              registry_image_objects: new Set(registry_image_objects),
              registry_image_type,
            };
            formIns.setFieldsValue({ ...initValue, emails: '' });
          } else {
            setEditing(false);
            setFormVal({});
            initFormVal.current = {};
            formIns.resetFields();
          }
        },
      };
    },
    [],
  );

  const fetchData = useCallback((val?) => {
    repoImagesRef?.current && repoImagesRef.current.unsubscribe();
    const fetchDataFunc = val === 1 || !val ? getAllProjects : getAllRepos;
    setLoading(true);
    repoImagesRef.current = fetchDataFunc()
      .pipe(
        tap((resp: WebResponse<any>) => {
          setLoading(false);
          setRepoImages(resp.getItems());
        }),
        catchError((error) => {
          return throwError(error);
        }),
      )
      .subscribe();
  }, []);

  const repoImageOpts = useMemo(() => {
    return repoImages?.map((item: any) => {
      return {
        value: item.name ? item.name : item,
        label: item.name ? item.name : item,
      };
    });
  }, [repoImages]);

  const nodeImageOpts = useMemo(() => {
    return clusters?.map((item: any) => {
      return {
        value: item.key,
        label: item.name,
      };
    });
  }, [clusters]);

  const emptyFormValue = useCallback(() => {
    setVisible(false);
    setFormVal({});
    formIns.resetFields();
  }, []);

  const cancel = useCallback(async () => {
    const values = formIns.getFieldsValue(true);
    let emptyFlag = Object.values(values).every(isEmpty);
    if (editing) {
      const result: any = await setSaveBtnStatus();
      if (result && result.equal) emptyFlag = true;
    }
    emptyFlag
      ? emptyFormValue()
      : TzConfirm({
          title: '',
          content: editing ? translations.scanner_report_editPrompt : translations.scanner_report_createPrompt,
          okText: translations.confirm_modal_sure,
          cancelText: translations.breadcrumb_back,
          onOk() {
            emptyFormValue();
            fetchReportList();
          },
        });
  }, [editing]);

  const operate = useCallback(async () => {
    const values = await formIns.validateFields();
    const {
      start,
      end,
      type,
      name,
      content_types,
      comment,
      registry_image_type,
      registry_image_objects,
      node_image_objects,
      image_types,
    } = values;
    const { emails } = formVal;
    const payload: any = {
      type,
      name,
      content_types,
      emails,
      comment,
      registry_image_type,
      registry_image_objects,
      node_image_objects,
      image_types,
    };
    if (type === 1 || type === 2) {
      payload.cycle_day = start;
      payload.end_timestamp = moment(end).valueOf() - moment().startOf('day').valueOf();
    }
    if (type === 3) {
      payload.start_timestamp = moment(start).valueOf();
      payload.end_timestamp = moment(end).valueOf();
    }
    payload.emails = emails;
    editing
      ? updateReport(initFormVal.current.id, payload).subscribe((result) => {
          if (result.error && result.error.message) {
            onSubmitFailed(result.error);
          } else {
            showSuccessMessage(translations.scanner_report_operateSuccess);
            emptyFormValue();
            fetchReportList();
          }
        })
      : addReport(payload).subscribe((result) => {
          if (result.error && result.error.message) {
            onSubmitFailed(result.error);
          } else {
            showSuccessMessage(translations.scanner_report_operateSuccess);
            emptyFormValue();
            fetchReportList();
          }
        });
  }, [initFormVal.current, formVal]);

  const setSaveBtnStatus = useCallback(async () => {
    if (editing) {
      try {
        await formIns.validateFields();
        const values = formIns.getFieldsValue();
        const { emails } = formVal;
        let equal = true;
        const currentConfig = {
          id: initFormVal.current.id,
          ...values,
          content_types: new Set(values.content_types),
          emails: new Set(emails),
          image_types: new Set(values.image_types),
          node_image_objects: new Set(values.node_image_objects),
          registry_image_objects: new Set(values.registry_image_objects),
          registry_image_type: values.registry_image_type,
        };
        const keys = Object.keys(initFormVal.current);
        for (const key of keys) {
          if (!isEqual(initFormVal.current[key], currentConfig[key])) {
            equal = false;
            break;
          }
        }
        equal ? setDisableSaveBtn(true) : setDisableSaveBtn(false);
        return { equal };
      } catch (_) {
        setDisableSaveBtn(true);
      }
    } else {
      try {
        const {
          name,
          type,
          content_types,
          registry_image_type,
          registry_image_objects,
          node_image_objects,
          image_types,
          start,
          end,
        } = formIns.getFieldsValue();
        const result = {
          emails: formVal.emails,
          name,
          type,
          content_types,
          start,
          end,
          image_types,
        };
        let isCorrect = Object.values(result).every((item: any) => {
          return Array.isArray(item) ? item.length > 0 : !!item === true;
        });
        if (isCorrect) {
          if (image_types.includes(1)) isCorrect = registry_image_type && registry_image_objects.length;
          if (image_types.includes(2)) isCorrect = !!node_image_objects.length;
        }
        isCorrect ? setDisableSaveBtn(false) : setDisableSaveBtn(true);
      } catch (_) {
        setDisableSaveBtn(true);
      }
    }
  }, [editing, formVal, initFormVal.current]);

  const handleChange = useCallback(
    async (key, val) => {
      let newFormVal = { ...formVal, [key]: val };
      if (key === 'type') {
        newFormVal = { ...newFormVal, start: undefined, end: undefined };
        formIns.setFieldsValue({ start: undefined, end: undefined });
      }
      if (key === 'registry_image_type') {
        newFormVal = { ...newFormVal, registry_image_objects: undefined };
        formIns.setFieldsValue({ registry_image_objects: undefined });
      }
      if (key === 'image_types') {
        if (formVal.image_types && formVal.image_types.includes(1) && !val.includes(1)) {
          newFormVal = {
            ...newFormVal,
            registry_image_type: undefined,
            registry_image_objects: undefined,
          };
          formIns.setFieldsValue({
            registry_image_type: undefined,
            registry_image_objects: undefined,
          });
        }
        if (formVal.image_types && formVal.image_types.includes(2) && !val.includes(2)) {
          newFormVal = { ...newFormVal, node_image_objects: undefined };
          formIns.setFieldsValue({ node_image_objects: undefined });
        }
      }
      setFormVal(newFormVal);
    },
    [formVal],
  );

  useMemo(async () => await setSaveBtnStatus(), [formVal]);

  const receiveEmailTags = useMemo(
    () => (
      <TzRow>
        <TzCol flex={1}>
          {(formVal.emails || []).map((item: any) => (
            <TzTag
              key={item}
              closable
              style={{ marginTop: 5 }}
              onClose={async () => {
                const emails = formVal.emails.filter((ns: any) => item !== ns);
                setFormVal({ ...formVal, emails });
              }}
            >
              {item}
            </TzTag>
          ))}
        </TzCol>
      </TzRow>
    ),
    [formVal],
  );

  const reportTime = useMemo(() => {
    if (formVal.type === 1 || formVal.type === 2)
      return (
        <TzFormItem
          name=""
          label={translations.scanner_report_reportTime}
          style={{ marginBottom: '0px' }}
          rules={[
            {
              required: true,
              message: '',
              validator: (_) => Promise.resolve(),
            },
          ]}
        >
          <TzFormItem
            name="start"
            style={{
              display: 'inline-block',
              width: 180,
              marginRight: 20,
              marginBottom: '0px',
            }}
            rules={[
              {
                required: true,
                message: translations.scanner_report_reportDatePlaceholder,
              },
            ]}
          >
            {formVal.type === 1 ? (
              <TzSelect
                suffixIcon={<></>}
                placeholder={translations.scanner_report_reportDatePlaceholder}
                options={reportWeekOpts[localLang]}
                onChange={(val) => handleChange('start', val)}
              />
            ) : (
              <TzSelect
                suffixIcon={<></>}
                placeholder={translations.scanner_report_reportDatePlaceholder}
                options={reportDateOpts}
                onChange={(val) => handleChange('start', val)}
              />
            )}
          </TzFormItem>
          <TzFormItem
            name="end"
            style={{ display: 'inline-block', width: 180 }}
            rules={[
              {
                required: true,
                message: translations.scanner_report_reportTimePlaceholder,
              },
            ]}
          >
            <TzTimePicker
              onChange={(val) => handleChange('end', moment(val).valueOf() - moment().startOf('day').valueOf())}
            />
          </TzFormItem>
        </TzFormItem>
      );

    if (formVal.type === 3)
      return (
        <TzFormItem
          name=""
          label={translations.scanner_report_reportTime}
          style={{ marginBottom: '0px' }}
          rules={[
            {
              required: true,
              message: '',
              validator: (_) => Promise.resolve(),
            },
          ]}
        >
          <TzFormItem
            name="start"
            style={{ display: 'inline-block', width: 180, marginRight: 20 }}
            rules={[
              {
                required: true,
                message: translations.scanner_report_reportStartTime,
              },
            ]}
          >
            <TzDatePicker showTime onChange={(val: any) => handleChange('start', moment(val).valueOf())} />
          </TzFormItem>
          <TzFormItem
            name="end"
            style={{ display: 'inline-block', width: 180 }}
            rules={[
              {
                required: true,
                message: translations.scanner_report_reportEndTime,
              },
            ]}
          >
            <TzDatePicker
              showTime
              disabledDate={(current: any) => current <= moment(formVal.start)}
              onChange={(val: any) => handleChange('end', moment(val).valueOf())}
            />
          </TzFormItem>
        </TzFormItem>
      );
  }, [formVal]);

  const repoImage = useMemo(() => {
    if (formVal.image_types && formVal.image_types.includes(1)) {
      return (
        <>
          <TzFormItem
            name=""
            label={translations.scanner_report_repoImage}
            rules={[
              {
                required: true,
                message: '',
                validator: (_) => Promise.resolve(),
              },
            ]}
          >
            <TzRow gutter={[8, 0]}>
              <TzCol span={10}>
                <TzFormItem
                  name="registry_image_type"
                  noStyle
                  rules={[
                    {
                      required: true,
                      message: translations.scanner_report_reportImagePlaceholder,
                    },
                  ]}
                >
                  <TzSelect
                    suffixIcon={<></>}
                    placeholder={translations.scanner_report_repoImagePlaceholder}
                    options={repoOpts[localLang]}
                    onChange={(val) => {
                      handleChange('registry_image_type', val);
                      fetchData(val);
                    }}
                  />
                </TzFormItem>
              </TzCol>
              <TzCol span={10}>
                <TzFormItem
                  noStyle
                  name="registry_image_objects"
                  rules={[
                    {
                      required: true,
                      message: translations.scanner_report_reportObjPlaceholder,
                    },
                  ]}
                >
                  <TzSelect
                    loading={loading}
                    placeholder={translations.scanner_report_reportObjPlaceholder}
                    mode="multiple"
                    options={repoImageOpts}
                    filterOption={(input, option) => {
                      return (option?.label as string)?.toLowerCase()?.indexOf(input.toLowerCase()) >= 0;
                    }}
                    onChange={(val) => handleChange('registry_image_objects', val)}
                  />
                </TzFormItem>
              </TzCol>
            </TzRow>
          </TzFormItem>
        </>
      );
    }
    return null;
  }, [formVal, repoOpts, repoImageOpts]);

  const onEnter = useCallback(
    async (e) => {
      const email = /^\w+((.\w+)|(-\w+))@[A-Za-z0-9]+((.|-)[A-Za-z0-9]+).[A-Za-z0-9]+$/;
      if (e.keyCode === 13 && email.test(formIns.getFieldValue('emails'))) {
        setFormVal({
          ...formVal,
          emails: Array.from(new Set([...(formVal?.emails || []), formIns.getFieldValue('emails')])),
        });
        formIns.setFieldsValue({ emails: '' });
      }
    },
    [formVal],
  );
  const onMouseLeave = useCallback(
    async (e) => {
      const email = /^\w+((.\w+)|(-\w+))@[A-Za-z0-9]+((.|-)[A-Za-z0-9]+).[A-Za-z0-9]+$/;
      if (email.test(formIns.getFieldValue('emails'))) {
        setFormVal({
          ...formVal,
          emails: Array.from(new Set([...(formVal?.emails || []), formIns.getFieldValue('emails')])),
        });
        formIns.setFieldsValue({ emails: '' });
      }
    },
    [formVal],
  );

  useEffect(() => fetchData(initFormVal?.current?.registry_image_type), [initFormVal?.current]);

  return (
    <TzDrawer
      onClose={cancel}
      visible={visible}
      closable={false}
      width={560}
      className={'drawer-body0'}
      title={
        <DrawerTitle
          title={editing ? translations.scanner_report_editReport : translations.scanner_report_addReport}
          okFunc={operate}
          cancelFunc={cancel}
          disableSaveBtn={disableSaveBtn}
          saveBtnTitle={editing ? translations.save : translations.scanner_report_add}
        />
      }
      destroyOnClose={true}
    >
      <TzForm form={formIns} initialValues={formVal}>
        <TzFormItem
          name="name"
          label={translations.scanner_report_reportName}
          rules={[
            {
              required: true,
              whitespace: true,
              message: translations.scanner_report_inputReportName,
            },
          ]}
        >
          <TzInput
            placeholder={translations.scanner_report_inputReportName}
            onChange={(e) => handleChange('name', (e.target.value && e.target.value.trim()) || '')}
            maxLength={50}
          />
        </TzFormItem>
        <TzFormItem
          name="type"
          label={translations.scanner_report_reportType}
          rules={[
            {
              required: true,
              message: translations.scanner_report_reportTypePlaceholder,
            },
          ]}
        >
          <TzRadioGroup
            className={'report-radio-Group'}
            options={
              editing ? reportType[localLang].filter((item: any) => item.value === formVal.type) : reportType[localLang]
            }
            onChange={(e) => handleChange('type', e.target.value)}
          />
        </TzFormItem>
        {reportTime}
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
          <TzCheckboxGroup
            className={'report-Group'}
            options={reportContentOpts[localLang]}
            onChange={(val) => handleChange('content_types', val)}
          />
        </TzFormItem>
        <TzFormItem
          name="image_types"
          label={translations.scanner_report_reportRange}
          rules={[
            {
              required: true,
              message: translations.scanner_report_reportRangePlaceholder,
            },
          ]}
        >
          <TzCheckboxGroup
            className={'report-checkbox-range'}
            options={reportRangeOpts}
            onChange={(val) => handleChange('image_types', val)}
          />
        </TzFormItem>
        {repoImage}
        <TzFormItem
          name="emails"
          style={{ marginBottom: 0 }}
          label={translations.scanner_report_receiveEmail}
          rules={[
            {
              type: 'email',
              message: translations.scanner_report_emailCheck,
            },
            {
              required: true,
              message: translations.scanner_report_emailRequired,
              validator: (_) =>
                formVal?.emails && formVal?.emails.length
                  ? Promise.resolve()
                  : Promise.reject(new Error('email is required')),
              validateTrigger: 'onEnter',
            },
          ]}
        >
          <TzInput
            placeholder={translations.scanner_report_receiveEmailPlaceholder}
            onKeyUp={onEnter}
            onMouseLeave={onMouseLeave}
          />
        </TzFormItem>
        {receiveEmailTags}

        <TzFormItem name="comment" label={translations.scanner_report_reportDesc} style={{ marginTop: 24 }}>
          <TzInputTextArea
            placeholder={translations.repoDesc}
            style={{ height: '140px' }}
            onChange={(val) => handleChange('comment', val)}
            maxLength={500}
          />
        </TzFormItem>
      </TzForm>
    </TzDrawer>
  );
});

const DrawerTitle = (props: {
  okFunc: () => void;
  cancelFunc: () => void;
  disableSaveBtn: boolean;
  title: string;
  saveBtnTitle: string;
}) => {
  const { okFunc, cancelFunc, disableSaveBtn, title, saveBtnTitle } = props;
  const RightOper = () => {
    return (
      <span>
        <TzButton disabled={disableSaveBtn} onClick={okFunc}>
          {saveBtnTitle}
        </TzButton>
        <TzButton onClick={cancelFunc} className={'ml16 cancel-btn'}>
          {translations.cancel}
        </TzButton>
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span>{title}</span>
      <RightOper />
    </div>
  );
};

const DetailDrawerTitle = (props: {
  delFunc: () => void;
  editFunc: () => void;
  createFunc: () => void;
  title: string;
  data: any;
}) => {
  const { delFunc, editFunc, title, createFunc, data } = props;
  const RightOper = () => {
    return (
      <span>
        {data.type !== 3 && (
          <>
            {/* <TzButton onClick={createFunc}>
              {translations.scanner_report_createNow}
            </TzButton> */}
            <TzButton onClick={editFunc} className={'mr16 ml16'}>
              {translations.edit}
            </TzButton>
          </>
        )}

        <TzButton danger onClick={delFunc} className={'mr16'}>
          {translations.delete}
        </TzButton>
      </span>
    );
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      {title}
      <RightOper />
    </div>
  );
};

const ReportDetail = forwardRef((props: any, ref?: any) => {
  const { fetchReportList, editReport, clusters } = props;
  const [visible, setVisible] = useState<boolean>(false);
  const [data, setData] = useState<any>({});
  const sub = useRef<Subscription | null>(null);
  const recordRef = useRef<any>(null);

  useImperativeHandle(
    ref,
    () => {
      return {
        show(data: any) {
          setData(data);
          setVisible(true);
        },
      };
    },
    [],
  );
  const fetchReportRecord = useCallback(
    (pagination?: TablePaginationConfig) => {
      const { current = 1, pageSize = 10 } = pagination || {};
      const offset = (current - 1) * pageSize;
      const pageParams = {
        offset,
        limit: pageSize,
      };
      return getReportRecord(data.id, pageParams).pipe(
        map((resp: WebResponse<any>) => {
          return {
            data: resp.data?.items,
            total: resp.data?.totalItems,
          };
        }),
        catchError((error) => {
          return throwError(error);
        }),
      );
    },
    [data],
  );

  const getReportTime = useCallback(() => {
    let date, time;
    if (data.type === 1) {
      date = (reportWeekOpts[localLang].find((item: any) => item.value === data.cycle_day) || {}).label;
    }
    if (data.type === 2) {
      date = (reportDateOpts.find((item: any) => item.value === data.cycle_day) || {}).label;
    }
    if (data.type === 1 || data.type === 2) {
      const hour = parseInt((data.end_timestamp / (60 * 60 * 1000)).toString());
      const minute = parseInt(((data.end_timestamp - hour * 60 * 60 * 1000) / (60 * 1000)).toString());
      const second = parseInt(((data.end_timestamp - hour * 60 * 60 * 1000 - minute * 60 * 1000) / 1000).toString());
      time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second
        .toString()
        .padStart(2, '0')}`;
    }
    if (data.type === 3) {
      date = moment(data.start_timestamp).format('YYYY-MM-DD HH:mm:ss');
      time = moment(data.end_timestamp).format('YYYY-MM-DD HH:mm:ss');
    }
    return data.type === 3
      ? `${date} - ${time}`
      : data.type === 1
        ? `${translations.scanner_report_reportCircleUnit}${date}${time}`
        : `${translations.scanner_report_reportCircleUnit}${translations.scanner_report_month}${date}${translations.scanner_report_monthDay} ${time}`;
  }, [localLang, data]);

  const reportInfo = useMemo(() => {
    const reportCategory = (reportType[localLang].find((item: any) => item.value === data.type) || {}).label;
    const reportContent = (data.content_types || [])
      .map((val: string) => (reportContentOpts[localLang].find((item: any) => item.value === val) || {}).label)
      .filter((id: any) => id);
    const nodeImages = (data.node_image_objects || [])
      .map((val: string) => (clusters.find((item: any) => item.key === val) || {}).name)
      .filter((id: any) => id);

    const arr = [
      {
        name: translations.scanner_report_reportName,
        value: data.name,
      },
      {
        name: translations.scanner_report_reportType,
        value: reportCategory,
      },
      {
        name: translations.scanner_report_reportTime,
        value: getReportTime(),
      },
      {
        name: translations.scanner_report_reportContent,
        value: reportContent.join(','),
      },
      {
        name: translations.scanner_report_receiveEmail,
        value: (data.emails || []).map((v: any) => (
          <TzTooltip title={v} placement="topLeft">
            <TzTag className="title-ellipsis">{v}</TzTag>
          </TzTooltip>
        )),
        tag: true,
      },
    ];
    if (data.registry_image_type === 1)
      arr.push({
        name: `${translations.scanner_report_repoImage}(${translations.scanner_report_project})`,
        value: (data.registry_image_objects || []).map((v: any) => (
          <TzTooltip title={v} placement="topLeft">
            <TzTag className="title-ellipsis">{v}</TzTag>
          </TzTooltip>
        )),
        tag: true,
      });
    if (data.registry_image_type === 2)
      arr.push({
        name: `${translations.scanner_report_repoImage}(${translations.scanner_report_repo})`,
        value: (data.registry_image_objects || []).map((v: any) => (
          <TzTooltip title={v} placement="topLeft">
            <TzTag className="title-ellipsis">{v}</TzTag>
          </TzTooltip>
        )),
        tag: true,
      });
    if (data.image_types && data.image_types.includes(2))
      arr.push({
        name: translations.nodeMirroring,
        value: (nodeImages || []).map((v: any) => (
          <TzTooltip title={v} placement="topLeft">
            <TzTag className="title-ellipsis">{v}</TzTag>
          </TzTooltip>
        )),
        tag: true,
      });
    arr.push({
      name: translations.scanner_report_reportDesc,
      value: data.comment,
    });

    return arr;
  }, [data, localLang, clusters]);

  const showEditReport = useCallback(() => {
    setVisible(false);
    editReport(data);
  }, [data]);
  const getDetailReportData = useCallback(() => {
    sub?.current && sub.current.unsubscribe();
    if (!data.id) return;
    sub.current = getReportDetail(data.id)
      .pipe(
        tap((resp: WebResponse<any>) => {
          setData(resp.getItem());
        }),
        catchError((error) => {
          return throwError(error);
        }),
      )
      .subscribe();
  }, [data]);

  const delReport = useCallback(() => {
    TzConfirm({
      title: '',
      content: `${translations.scanner_report_delTitle} ${data.name} ?`,
      okText: translations.confirm_modal_sure,
      cancelText: translations.cancel,
      onOk() {
        deleteReport(data.id).subscribe((res) => {
          if (res.error && res.error.message) {
            onSubmitFailed(res.error);
          } else {
            showSuccessMessage(translations.scanner_report_operateSuccess);
            setVisible(false);
            fetchReportList();
          }
        });
      },
    });
  }, [data]);

  const generateReport = useCallback(() => {
    geneReport(data.id).subscribe((res) => {
      if (res.error && res.error.message) {
        onSubmitFailed(res.error);
      } else {
        showSuccessMessage(translations.scanner_report_operateSuccess);
        setVisible(false);
        getDetailReportData();
      }
    });
  }, [data]);

  const downloadReport = useCallback((reportId: number, subTaskId: number) => {
    getReportData(reportId, subTaskId).subscribe((res) => {
      if (res.error && res.error.message) {
        onSubmitFailed(res.error);
      } else {
        const div = document.createElement('div');
        const data = res.getItem();
        ReactDOM.render(<ReportTemplate data={data} lang={localLang} />, div);
        const blob = new Blob([div.innerHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${
          data.type === 1
            ? translations.scanner_report_weeklyReport
            : data.type === 2
              ? translations.scanner_report_monthlyReport
              : translations.scanner_report_customReport
        }_${data.name}_${moment(data.start_timestamp).format('YYYY-MM-DD HH:mm:ss')} - ${moment(
          data.end_timestamp,
        ).format('YYYY-MM-DD HH:mm:ss')}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setVisible(false);
      }
    });
  }, []);

  const columns = useMemo(
    () => [
      {
        title: translations.scanner_report_reportCircle,
        key: 'timeRange',
        ellipsis: {
          showTitle: false,
        },
        render: (row: any) => {
          return (
            <span>
              <TzTooltip
                title={
                  `${moment(row.start_timestamp).format('YYYY-MM-DD HH:mm:ss')} - ${moment(row.end_timestamp).format(
                    'YYYY-MM-DD HH:mm:ss',
                  )}` || '-'
                }
                placement="topLeft"
              >
                {`${moment(row.start_timestamp).format('YYYY-MM-DD HH:mm:ss')} - ${moment(row.end_timestamp).format(
                  'YYYY-MM-DD HH:mm:ss',
                )}` || '-'}
              </TzTooltip>
            </span>
          );
        },
      },
      {
        title: translations.scanner_report_operate,
        key: 'operate',
        width: 100,
        ellipsis: {
          showTitle: false,
        },
        render: (_: any, row: any) => {
          return (
            <TzButton type="link" style={{ paddingLeft: 0 }} onClick={() => downloadReport(data.id, row.id)}>
              {translations.scanner_report_download}
            </TzButton>
          );
        },
      },
    ],
    [data],
  );

  return (
    <TzDrawer
      onClose={() => setVisible(false)}
      visible={visible}
      className={'drawer-body0'}
      title={
        <DetailDrawerTitle
          title={translations.scanner_report_reportDetail}
          delFunc={delReport}
          editFunc={showEditReport}
          createFunc={generateReport}
          data={data}
        />
      }
      destroyOnClose={true}
      width={560}
    >
      <>
        <Tittle title={translations.scanner_report_reportInfo} />
        <div className="report-info-container">
          {reportInfo.map((item: any) => (
            <div className="info-item-container">
              <span className="info-title">{item.name}</span>
              {item.tag ? (
                <span className="info-content">{item.value}</span>
              ) : (
                <span className="info-content">
                  <TzTooltip title={item.value} placement="topLeft">
                    {item.value}
                  </TzTooltip>
                </span>
              )}
            </div>
          ))}
        </div>
        <Tittle title={translations.scanner_report_reportRecord} className={'mb16'} />
        <TzTableServerPage
          columns={columns as any}
          rowKey="id"
          defaultPagination={{
            current: 1,
            pageSize: 5,
            hideOnSinglePage: true,
          }}
          ref={recordRef}
          reqFun={fetchReportRecord as any}
        />
      </>
    </TzDrawer>
  );
});

export default ReportManagement;
