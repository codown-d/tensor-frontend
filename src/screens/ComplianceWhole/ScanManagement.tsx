import React, { useState, useEffect } from 'react';
import { TzButton } from '../../components/tz-button';
import { translations } from '../../translations/translations';
import { TzConfirm } from '../../components/tz-modal';
import { TzCard } from '../../components/tz-card';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Store } from '../../services/StoreService';
import { DefaultOptionType } from 'antd/lib/cascader';
import Form from 'antd/lib/form';
import ScanConfiguration from '../CalicoTenants/components/ScanConfiguration';
import ScanRecord from '../CalicoTenants/ScanRecord';
import { useMemoizedFn } from 'ahooks';
// import { useActivate } from 'react-activation';
export const filter = (inputValue: string, path: DefaultOptionType[]) =>
  path.some((option) => (option.label + '').toLowerCase().indexOf(inputValue.toLowerCase()) > -1);
let ScanManagement = () => {
  const navigate = useNavigate();
  const l = useLocation();
  const [result] = useSearchParams();
  let [query] = useState({ scapType: result.get('scapType') || 'kube' });
  const [edit, setEdit] = useState(false);
  const [formSecretKey] = Form.useForm();

  const setHeader = useMemoizedFn(() => {
    Store.header.next({
      title: translations.scanManagement,
      onBack: () => {
        navigate(-1);
      },
    });
  });
  useEffect(setHeader, [l]);
  // useActivate(setHeader);
  useEffect(() => {
    Store.pageFooter.next(
      edit ? (
        <div className={'flex-r-c'} style={{ justifyContent: 'flex-end', height: '100%', width: '100%' }}>
          <TzButton
            onClick={() => {
              TzConfirm({
                content: translations.unStandard.str44,
                cancelText: translations.breadcrumb_back,
                onOk: () => {
                  setEdit(false);
                },
              });
            }}
          >
            {translations.cancel}
          </TzButton>
          <TzButton
            className={'ml16'}
            type={'primary'}
            onClick={() => {
              formSecretKey.submit();
            }}
          >
            {translations.save}
          </TzButton>
        </div>
      ) : null,
    );
  }, [edit, l]);
  return (
    <div className={'mlr32'}>
      <TzCard
        title={
          <>
            {translations.periodic_scan_configuration}
            {!edit ? (
              <TzButton
                className={'f-r'}
                onClick={() => {
                  setEdit(true);
                }}
              >
                {translations.edit}
              </TzButton>
            ) : null}
          </>
        }
        bodyStyle={{ padding: '4px 0 0 0' }}
      >
        <ScanConfiguration edit={edit} setEdit={setEdit} formSecretKey={formSecretKey} query={query} />
      </TzCard>
      {edit ? null : <ScanRecord query={query} />}
    </div>
  );
};
export default ScanManagement;
