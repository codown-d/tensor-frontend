import React, { useState } from 'react';
import { TzModal } from '../../components/tz-modal';
import { translations } from '../../translations/translations';
import { copyText } from '../../helpers/until';
import EllipsisPopover from '../../components/ellipsisPopover/ellipsisPopover';
import QrcodePopover from './QrcodePopover';
import { TzInput } from '../../components/tz-input';
import { TzForm, TzFormItem } from '../../components/tz-form';
import { Form } from 'antd';
import './envKeyModal.scss';
import { TzButton } from '../../components/tz-button';
import { TextHoverCopy } from '../../screens/AlertCenter/AlertCenterScreen';

type TEnvKeyModal = {
  envKey?: string;
  title?: string;
  okText?: string;
  hideCancel?: boolean;
  mask?: boolean;
  open: boolean;
  onOk: (values: any) => void;
  onCancel?: () => void;
  type?: 'license' | 'admin';
};
type TFormValues = {
  licenseVal?: string;
  password?: string;
  confirmPwd?: string;
};
const EnvKeyModal = ({ open, onCancel, onOk, envKey, title, okText, hideCancel, mask = true }: TEnvKeyModal) => {
  const [copyTxtMouseIn, setCopyTxtMouseIn] = useState<boolean>(false);
  const [formRef] = Form.useForm();
  return (
    <TzModal
      mask={mask}
      closable={!hideCancel}
      title={title ?? translations.license_licenseRenew}
      className="license-modal"
      wrapClassName="license-modal-wrap"
      onCancel={onCancel}
      visible={open}
      okText={okText ?? translations.save}
      cancelText={translations.confirm_modal_cancel}
      centered={false}
      destroyOnClose={true}
      maskClosable={false}
      footer={[
        hideCancel ? null : (
          <TzButton key="back" onClick={onCancel} className="cancel-btn">
            {translations.cancel}
          </TzButton>
        ),
        <TzButton
          key="submit"
          type="primary"
          onClick={() => {
            formRef.validateFields().then((formValues: TFormValues) => {
              onOk(formValues.licenseVal);
            });
          }}
        >
          {okText ?? translations.save}
        </TzButton>,
      ]}
    >
      <TzForm layout={'inline'} form={formRef} className="env-key-modal">
        <TzFormItem label="Environment key" style={{ width: '100%' }}>
          <p style={{ width: '100%' }}>
            <p className="hover copy-row copy-item">
              <TextHoverCopy text={envKey + ''} lineClamp={1}>
                {envKey}
              </TextHoverCopy>
            </p>
            {envKey && (
              <span>
                <QrcodePopover className="hover" text={envKey} />
              </span>
            )}
          </p>
        </TzFormItem>
        <TzFormItem
          style={{ marginBottom: 24, width: '100%' }}
          rules={[
            {
              required: true,
              message: translations.unStandard.licenseNoEmpty,
            },
          ]}
          label="License"
          name="licenseVal"
          required
          requiredMark={false}
        >
          <TzInput placeholder={translations.license_licenseInpDoc} />
        </TzFormItem>
      </TzForm>
    </TzModal>
  );
};
export default EnvKeyModal;
