import React, { useEffect, useState } from 'react';
import { TzCard } from '../../../../components/tz-card';
import { TzButton } from '../../../../components/tz-button';
import { MyFormItem, TzForm, TzFormItem } from '../../../../components/tz-form';
import { TzInputNumber } from '../../../../components/tz-input-number';
import { TzProgress } from '../../../../components/tz-progress';
import ClearData from './ClearData';
import { getManagementData, setManagementData } from '../../../../services/DataService';
import { TDataManagement, TView } from '../../../../definitions';
import { get } from 'lodash';
import { TzMessageSuccess } from '../../../../components/tz-mesage';
import { Form } from 'antd';
import { translations } from '../../../../translations/translations';
import { useMemoizedFn } from 'ahooks';
type TConfig = {
  label: string;
  name: string;
  description: string;
  available?: string;
  viewName?: string;
  max?: number;
  min?: number;
  unit: string;
  dataType: 'cold' | 'hotLogic' | 'hotOffline' | 'waterline';
};
function getPercent(item: TView) {
  if (!item) {
    return 0;
  }
  if (item.used && item.total && item.used > item.total) {
    return 100.0;
  }
  return Math.round((item.used / item.total) * 10000) / 100;
}

function getSpaceInGB(item: TView) {
  if (!item) {
    return 0;
  }
  if (item.used && item.total && item.used > item.total) {
    return 0;
  }
  return Math.round(((item.total - item.used) / Math.pow(1024, 3)) * 100) / 100;
}
const config: TConfig[] = [
  {
    dataType: 'cold',
    label: translations.unStandard.coldTTLDays,
    name: 'coldTTLDays',
    viewName: 'coldView',
    description: translations.unStandard.coldTTLDescription,
    available: translations.unStandard.coldTTLAvailable,
    unit: translations.dayC,
  },
  {
    dataType: 'hotLogic',
    label: translations.unStandard.hotLogicTTLDays,
    name: 'hotLogicTTLDays',
    viewName: 'hotLogicView',
    description: translations.unStandard.hotLogicTTLDescription,
    available: translations.unStandard.hotLogicTTLAvailable,
    unit: translations.dayC,
  },
  {
    dataType: 'hotOffline',
    label: translations.unStandard.hotOfflineTTLDays,
    name: 'hotOfflineTTLDays',
    viewName: 'hotOfflineView',
    description: translations.unStandard.hotOfflineTTLDescription,
    available: translations.unStandard.hotOfflineAvailable,
    unit: translations.dayC,
  },
  {
    dataType: 'waterline',
    label: translations.unStandard.waterlineData,
    name: 'waterlineData',
    description: translations.unStandard.waterlineDescription,
    unit: '%',
    max: 100,
    min: 0,
  },
];

function DataManagement() {
  const [isEdit, setIsEdit] = useState<boolean>();
  const [data, setData] = useState<TDataManagement>();
  const [form] = Form.useForm();

  const getData = useMemoizedFn(() => {
    getManagementData().subscribe((res) => {
      if (res.error) {
        return;
      }
      const _resData = res.getItem() ?? undefined;
      setData(_resData);
      form.setFieldsValue(_resData);
    });
  });
  useEffect(() => {
    getData();
  }, []);

  return (
    <TzCard
      title={translations.data_management_config}
      className="data-management mlr32"
      extra={
        isEdit ? (
          [
            <TzButton
              size="small"
              type="primary"
              onClick={() => {
                setManagementData(form.getFieldsValue()).subscribe((res) => {
                  if (res.error) {
                    return;
                  }
                  TzMessageSuccess(translations.saveSuccess);
                  setIsEdit(false);
                  getData();
                });
              }}
            >
              {translations.save}
            </TzButton>,
            <TzButton
              className="ml8"
              size="small"
              onClick={() => {
                setIsEdit(false);
              }}
            >
              {translations.cancel}
            </TzButton>,
          ]
        ) : (
          <TzButton
            size="small"
            type="primary"
            onClick={() => {
              setIsEdit(true);
            }}
          >
            {translations.edit}
          </TzButton>
        )
      }
      bodyStyle={{ paddingBottom: '8px' }}
    >
      <p className="data-item-tit sub-txt">
        {translations.unStandard.dataManagementConfigDescription}
      </p>
      <TzForm colon={false} layout="horizontal" form={form}>
        {config.map(
          ({ label, name, description, available, unit, max, min, viewName = '', dataType }) => (
            <div className="data-item">
              {isEdit ? (
                <MyFormItem
                  className="data-item-edit"
                  label={label}
                  name={name}
                  render={(children) => (
                    <div className={'my-form-item-children'}>
                      {children}
                      <span style={{ paddingRight: '11px' }}>{unit}</span>
                    </div>
                  )}
                >
                  <TzInputNumber
                    parser={(value: any) => parseInt(value) || 90}
                    bordered={false}
                    min={min ?? 1}
                    max={max ?? 9999}
                    controls={false}
                    defaultValue={90}
                  />
                </MyFormItem>
              ) : (
                <TzFormItem className="data-item-edit read" label={label}>
                  <span className="ant-form-text">{get(data, name) ?? '-'}</span>
                  {unit}
                </TzFormItem>
              )}

              <p className="setting-tip sub-txt">{description}</p>
              {!!available && (
                <div className="used-data sub-txt">
                  <div className="used-data-bar">
                    <div className="used-data-txt">
                      <div>
                        {available}: {getSpaceInGB(get(data, viewName))}GB
                      </div>
                      <div className="ml20">
                        {translations.auditConfig_used}:&nbsp;{getPercent(get(data, viewName))}%
                      </div>
                    </div>
                    <div className="used-data-bar">
                      <TzProgress percent={getPercent(get(data, viewName))} showInfo={false} />
                    </div>
                  </div>
                  <div className="used-data-opr">
                    <ClearData name={dataType} clearData={get(data, name)} call={getData} />
                  </div>
                </div>
              )}
            </div>
          ),
        )}
      </TzForm>
    </TzCard>
  );
}

export default DataManagement;
