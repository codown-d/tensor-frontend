import { useMemoizedFn } from 'ahooks';
import Form, { FormInstance } from 'antd/lib/form';
import { TablePaginationConfig } from 'antd/lib/table';
import classNames from 'classnames';
import { isArray, isEqual, merge } from 'lodash';
import moment from 'moment';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import ArtTemplateDataInfo from '../../../components/ComponentsLibrary/ArtTemplateDataInfo';
import TzTextArea from '../../../components/ComponentsLibrary/TzTextArea';
import { TzButton } from '../../../components/tz-button';
import { TzCard, TzCardHeaderState } from '../../../components/tz-card';
import { TzForm, TzFormItem } from '../../../components/tz-form';
import { TzInput } from '../../../components/tz-input';
import TzInputSearch from '../../../components/tz-input-search';
import { TzConfirm } from '../../../components/tz-modal';
import { TzSelect } from '../../../components/tz-select';
import { TzTable } from '../../../components/tz-table';
import { showSuccessMessage } from '../../../helpers/response-handlers';
import useLayoutMainSearchWid from '../../../helpers/useLayoutMainSearchWid';
import { Routes } from '../../../Routes';
import {
  dockerfileRules,
  dockerfiletemplatesDetail,
  postDockerfileTemplates,
  postYamlTemplates,
  putDockerfileTemplates,
  putYamlTemplates,
  yamlRules,
  yamlTemplatesDetail,
} from '../../../services/DataService';
import { Store } from '../../../services/StoreService';
import { translations } from '../../../translations/translations';
import { yamlInitTypesFilters } from '../../ImageReject/ImageNewStrategy';
import { RenderTag } from '../../../components/tz-tag';
import { useFormValidateFields } from '../../../components/tz-form/useFormLib';
import { objectKeyPath } from '../../../helpers/until';
import { flushSync } from 'react-dom';
export const BaselineManagementInfo = (props: any) => {
  const [result] = useSearchParams();
  let [query] = useState<any>({
    id: result.get('id') || '',
    copyId: result.get('copyId'),
  });
  const [info, setInfo] = useState<any>(null);
  const [search, setSearch] = useState('');
  let [selectedRowKeys, setSelectedRowKeys] = useState<any>([]);
  let [errorFields, setErrorFields] = useState<any>({});
  const [dataSource, setDataSource] = useState<any>([]);
  const listComp = useRef(undefined as any);
  const [formIns] = Form.useForm();
  const navigate = useNavigate();
  const fieldsChangeRef = useRef<boolean>();
  let breadcrumb = useMemo(() => {
    return [
      {
        children: translations.iac_security,
        href: Routes.IaCSecurity,
      },
      {
        children: translations.baseline_management,
        href: Routes.IaCSecurityBaselineManagement,
      },
      {
        children: query.id ? translations.edit_baseline : translations.new_baseline,
      },
    ];
  }, [query]);
  useEffect(() => {
    Store.breadcrumb.next(breadcrumb);
  }, [breadcrumb]);
  let setHeader = useMemoizedFn(() => {
    Store.header.next({
      title: query.id ? translations.edit_baseline : translations.new_baseline,
    });
  });
  let l = useLocation();
  useEffect(setHeader, [query, l]);
  const onBack = useCallback(() => {
    if (fieldsChangeRef.current) {
      TzConfirm({
        content: translations.deflectDefense_cancelTip,
        okText: translations.superAdmin_confirm,
        cancelText: translations.breadcrumb_back,
        onOk() {
          navigate(-1);
        },
      });
    } else {
      navigate(-1);
    }
  }, [fieldsChangeRef]);
  let { formValidateFields, formValidateChangeFields } = useFormValidateFields(formIns);
  const onOk = useCallback(() => {
    formIns
      .validateFields()
      .then((value) => {
        let fn = query.id ? putDockerfileTemplates : postDockerfileTemplates;
        fn(merge({}, value, { id: Number(value.id) })).subscribe((res: any) => {
          if (res.error) {
            return;
          }
          showSuccessMessage(
            query.id
              ? translations.activeDefense_updateSuccessTip
              : translations.activeDefense_successTip,
          );
          navigate(-1);
          flushSync(() => {
            navigate(Routes.IaCSecurityBaselineManagement, {
              replace: true,
              state: { keepAlive: true },
            });
          });
        });
      })
      .catch((res) => {
        formValidateFields(setErrorFields);
      });
  }, [query.id]);
  const setFooter = useCallback(() => {
    Store.pageFooter.next(
      <div className="flex-r djfe dff1">
        <TzButton onClick={onBack} className="cancel-btn mr16">
          {translations.cancel}
        </TzButton>
        <TzButton onClick={onOk} type="primary">
          {query.id ? translations.save : translations.newAdd}
        </TzButton>
      </div>,
    );
  }, [query.id, l]);
  let getyamlTemplatesDetail = useCallback(() => {
    if (query.copyId || query.id) {
      dockerfiletemplatesDetail(
        merge({}, query, {
          id: query.id || query.copyId,
        }),
      ).subscribe((res) => {
        if (res.error) return;
        let item = res.getItem();
        let obj = merge(item, {
          rules: item.rules.map((item: { builtin_id: any }) => {
            return item.builtin_id;
          }),
          id: query.id ? query.id : '',
        });
        setInfo(obj);
        setSelectedRowKeys(obj.rules);
        formIns.setFieldsValue(obj);
      });
    }
  }, [query]);
  useEffect(() => {
    getyamlTemplatesDetail();
  }, [getyamlTemplatesDetail]);
  const getYamlRules = useCallback((pagination?: TablePaginationConfig) => {
    const { current = 1, pageSize = 10000 } = pagination || {};
    const offset = (current - 1) * pageSize;
    const pageParams = {
      offset,
      limit: pageSize,
    };
    dockerfileRules(pageParams).subscribe((res: any) => {
      let items = res.getItems();
      setDataSource(items);
    });
  }, []);
  useEffect(() => {
    getYamlRules();
  }, []);
  useEffect(() => {
    setFooter();
  }, [setFooter]);
  let handleRowSelection = (selected: boolean, selectedRows: any[]) => {
    setSelectedRowKeys((pre: any) => {
      selectedRows.forEach(({ builtin_id }: any) => {
        if (selected) {
          pre.push(builtin_id);
        } else {
          pre.remove(builtin_id);
        }
      });

      formIns.setFields([
        {
          name: 'rules',
          value: [...pre],
          validating: true,
          touched: true,
          errors: [],
        },
      ]);
      fieldsChangeRef.current = true;
      formValidateChangeFields(
        (obj) => {
          setErrorFields((pre: any) => {
            return Object.assign({}, pre, obj);
          });
        },
        ['rules'],
      );
      return [...pre];
    });
  };
  const rowSelection = useMemo(() => {
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
  }, [selectedRowKeys]);
  const imageColumns: any = useMemo(() => {
    return [
      {
        title: 'ID',
        dataIndex: 'builtin_id',
        ellipsis: true,
        width: '20%',
      },
      {
        title: translations.notificationCenter_details_name,
        dataIndex: 'name',
        width: '30%',
      },
      {
        title: translations.notificationCenter_columns_description,
        dataIndex: 'description',
      },
      {
        title: translations.scanner_detail_severity,
        dataIndex: 'severity',
        className: 'th-center',
        align: 'center',
        width: '10%',
        filters: yamlInitTypesFilters,
        onFilter: (value: string, record: any) => {
          return value.indexOf(record.severity) != -1;
        },
        render(item: string) {
          return <RenderTag type={item.toLocaleUpperCase() || 'CRITICAL'} className={'t-c'} />;
        },
      },
    ];
  }, []);
  let getDataSource = useMemo(() => {
    return dataSource.filter(
      (item: any) => item.name.toLowerCase().indexOf(search.toLowerCase()) != -1,
    );
  }, [dataSource, info, search]);
  const fitlerWid = useLayoutMainSearchWid({});
  return (
    <div className={'dockerfile-baseline-management-edit mlr32 mt4'}>
      <TzCard
        title={
          <TzCardHeaderState
            title={translations.runtimePolicy_detail_info_title}
            errorInfo={errorFields['name']}
          />
        }
        className={`mb20 ${classNames({ 'has-error': errorFields['name'] })}`}
        bodyStyle={{ paddingLeft: '25px', paddingRight: '25px' }}
      >
        <TzForm
          form={formIns}
          onValuesChange={(changedValues) => {
            fieldsChangeRef.current = true;
            let keyPath = objectKeyPath(changedValues);
            formValidateChangeFields((obj) => {
              setErrorFields((pre: any) => {
                return Object.assign({}, pre, obj);
              });
            }, keyPath);
          }}
        >
          <TzFormItem name={'id'} hidden>
            <TzInput />
          </TzFormItem>
          <TzFormItem
            name={'name'}
            label={translations.baseline_name}
            rules={[
              {
                required: true,
                message: translations.clusterManage_placeholder + translations.baseline_name,
              },
            ]}
          >
            <TzInput maxLength={50} placeholder={translations.unStandard.str282} />
          </TzFormItem>
          <TzFormItem
            label={translations.imageReject_comment_title}
            name={'description'}
            style={{ marginBottom: '0px' }}
          >
            <TzTextArea maxLength={100} placeholder={translations.unStandard.str77} />
          </TzFormItem>
          <TzFormItem
            name={'rules'}
            hidden
            rules={[
              {
                required: true,
                message: translations.unStandard.str279,
              },
            ]}
          >
            <TzSelect />
          </TzFormItem>
        </TzForm>
      </TzCard>
      <TzCard
        className={`mb20 ${classNames({ 'has-error': errorFields['rules'] })}`}
        title={
          <div className={'flex-r-c'}>
            <TzCardHeaderState
              title={translations.detection_item}
              errorInfo={errorFields['rules']}
              subText={translations.unStandard.str264(selectedRowKeys.length, dataSource.length)}
            />
            <TzInputSearch
              allowClear
              className={'f-r'}
              placeholder={translations.unStandard.str244}
              style={{
                width: `${fitlerWid}px`,
              }}
              onChange={(value: any) => setSearch(value)}
            />
          </div>
        }
      >
        <TzTable
          className={'nohoverTable'}
          rowSelection={rowSelection}
          columns={imageColumns}
          tableLayout={'fixed'}
          pagination={false}
          rowKey="builtin_id"
          dataSource={getDataSource}
          ref={listComp}
        />
      </TzCard>
    </div>
  );
};

export default BaselineManagementInfo;
