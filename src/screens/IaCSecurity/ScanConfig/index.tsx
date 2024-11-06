import { useMemoizedFn } from 'ahooks';
import Form from 'antd/lib/form';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TzButton } from '../../../components/tz-button';
import { TzCard } from '../../../components/tz-card';
import { TzDrawerFn } from '../../../components/tz-drawer';
import { TzForm, TzFormItem, TzFormItemLabelTip } from '../../../components/tz-form';
import { TzInput } from '../../../components/tz-input';
import { TzMessageSuccess } from '../../../components/tz-mesage';
import { TzSelect } from '../../../components/tz-select';
import { TzSwitch } from '../../../components/tz-switch';
import { TzTable, TzTableServerPage } from '../../../components/tz-table';
import { RenderTag, TzTag } from '../../../components/tz-tag';
import { MaliciousRejectType, WebResponse } from '../../../definitions';
import { deepClone } from '../../../helpers/until';
import {
  dockerfileConfigs,
  dockerfileTemplateSnapshotsDetail,
  putDockerfileConfigs,
} from '../../../services/DataService';
import { translations } from '../../../translations/translations';
import { PageTitle } from '../../ImagesScanner/ImagesCI/CI';
import { TzConfirm } from '../../../components/tz-modal';
import { Tittle } from '../../../components/ComponentsLibrary/Tittle';
import { StrategyAction } from '../../../components/ComponentsLibrary/TzStrategyAction';
import { yamlInitTypesFilters } from '../../ImageReject/ImageNewStrategy';
const actiongDataList = [
  {
    label: translations.imageReject_reject_type_alarm,
    title: translations.imageReject_reject_type_alarm,
    value: MaliciousRejectType.alert,
  },
  {
    label: translations.imageReject_reject_type_reject,
    title: translations.imageReject_reject_type_reject,
    value: MaliciousRejectType.block,
  },
];
export let templateSnapshotsDetailDrawer = async (props: any) => {
  let { template_name = '' } = props;
  let TemplateSnapshotsDetail = (props: any) => {
    let [dataSource, setDataSource] = useState([]);
    let getTemplateSnapshotsDetail = useCallback(() => {
      dockerfileTemplateSnapshotsDetail({ id: props.template_id }).subscribe((res) => {
        if (res.error) return;
        let item = res.getItem();
        setDataSource(item.rules);
      });
    }, []);
    useEffect(() => {
      getTemplateSnapshotsDetail();
    }, []);
    const imageColumns: any = useMemo(() => {
      return [
        {
          title: 'ID',
          dataIndex: 'builtin_id',
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
          width: '120px',
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
    return (
      <>
        <Tittle title={translations.detection_item} />
        <TzTable
          className="nohoverTable"
          tableLayout={'fixed'}
          dataSource={dataSource}
          pagination={false}
          columns={imageColumns}
        ></TzTable>
      </>
    );
  };
  let dw: any = await TzDrawerFn({
    width: '80%',
    title: template_name,
    children: <TemplateSnapshotsDetail {...props} />,
  });
  dw.show();
};
const IacScanInfo = (props: any) => {
  let [configInfo, setConfigInfo] = useState<any>({ white_list: [] });
  const [editBaseInfo, setEditbaseInfo] = useState<any>(false);
  const [formIns] = Form.useForm();
  let getDockerfileConfigs = () => {
    dockerfileConfigs().subscribe((res) => {
      if (res.error) return;
      let item = res.getItem();
      setConfigInfo({ ...item });
      formIns.setFieldsValue(deepClone(item));
    });
  };
  useEffect(() => {
    getDockerfileConfigs();
  }, []);
  let putYamlConfigsFn = useCallback((val, callback?: () => void) => {
    formIns.validateFields().then((val) => {
      putDockerfileConfigs(val).subscribe((res) => {
        if (res.error) {
          return;
        }
        TzMessageSuccess(translations.configuration_update_successful);
        getDockerfileConfigs();
        callback && callback();
      });
    });
  }, []);
  let infirsNotchange = useRef<any>();
  return (
    <div className={'iac-scan-config mlr32 mt4'}>
      <TzCard
        title={<>{translations.dockerfile_rules}</>}
        extra={
          editBaseInfo ? (
            <>
              <TzButton
                size={'small'}
                type={'primary'}
                onClick={async () => {
                  let val = await formIns?.validateFields();
                  putYamlConfigsFn(val, () => {
                    setEditbaseInfo(false);
                  });
                }}
              >
                {translations.save}
              </TzButton>
              <TzButton
                size={'small'}
                className={'ml8'}
                onClick={() => {
                  if (!infirsNotchange.current) {
                    setEditbaseInfo(false);
                  } else {
                    TzConfirm({
                      content: translations.confirm_modal_calcel_edit_content,
                      cancelText: translations.breadcrumb_back,
                      onOk() {
                        formIns.setFieldsValue(configInfo);
                        setTimeout(() => {
                          setEditbaseInfo(false);
                        }, 0);
                      },
                    });
                  }
                }}
              >
                {translations.cancel}
              </TzButton>
            </>
          ) : (
            <TzButton
              size={'small'}
              onClick={() => {
                setEditbaseInfo(true);
              }}
            >
              {translations.edit}
            </TzButton>
          )
        }
        headStyle={{ paddingBottom: 4 }}
        className={'mb20'}
      >
        <TzForm
          form={formIns}
          onValuesChange={() => {
            infirsNotchange.current = true;
          }}
        >
          <TzFormItem name={'id'} hidden>
            <TzInput />
          </TzFormItem>

          {editBaseInfo ? (
            <TzFormItem
              label={translations.imageReject_strategy_action_title}
              name="action"
              initialValue={'alert'}
              style={{ marginBottom: 0 }}
            >
              <StrategyAction data={actiongDataList} type={'rule'} />
            </TzFormItem>
          ) : (
            <p>
              <span style={{ color: '#6c7480' }}>
                {translations.imageReject_strategy_action_title}：
              </span>
              <RenderTag type={configInfo.action} />
            </p>
          )}
          <PageTitle
            title={translations.rule_conditions}
            className={'f14 mt16 mb12'}
            style={{ color: '#3e4653' }}
          />
          <p className={`form-item-value`} style={{ color: '#6c7480' }}>
            {translations.unStandard.str281}
          </p>
          <PageTitle
            title={translations.rule_white_list}
            className={'f14 mt16 mb12'}
            style={{ color: '#3e4653' }}
          />
          {editBaseInfo ? (
            <>
              <TzFormItem
                label={translations.custom_file_path}
                name={['white_list']}
                style={{ marginBottom: 0 }}
                extra={translations.unStandard.str280}
              >
                <TzSelect
                  placeholder={
                    translations.clusterManage_placeholder + translations.custom_file_path
                  }
                  mode="tags"
                  showArrow={false}
                  dropdownStyle={{ display: 'none' }}
                />
              </TzFormItem>
            </>
          ) : (
            <p>
              <span style={{ color: '#6c7480' }}>{translations.custom_file_path}：</span>
              {configInfo['white_list'].length
                ? configInfo['white_list']?.map(
                    (
                      item:
                        | boolean
                        | React.ReactChild
                        | React.ReactFragment
                        | React.ReactPortal
                        | null
                        | undefined,
                    ) => {
                      return <TzTag>{item}</TzTag>;
                    },
                  )
                : '-'}
            </p>
          )}
        </TzForm>
      </TzCard>
    </div>
  );
};

export default IacScanInfo;
