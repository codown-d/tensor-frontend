import React from 'react';
import { TzModal } from '../../components/tz-modal';
import { translations } from '../../translations/translations';
import { TzInput } from '../../components/tz-input';
import { Form } from 'antd';
import { TzForm, TzFormItem } from '../../components/tz-form';
import { useMemoizedFn } from 'ahooks';

type TDynamicPwdPopup = {
  open: boolean;
  onOk: (values: string) => void;
};
const DynamicPwdPopup = ({ open, onOk }: TDynamicPwdPopup) => {
  const [form] = Form.useForm();
  const onSubmit = useMemoizedFn(() => {
    form.validateFields().then(({ value }) => {
      onOk(value ?? '');
    });
  });
  return (
    <TzModal
      className="login-challenge-case"
      wrapClassName="login-challenge-case-wrap"
      closable={false}
      open={open}
      title={translations.loginScreen_dynPwd}
      cancelText={translations.cancel}
      okText={translations.login}
      onOk={onSubmit}
      centered
      destroyOnClose={true}
    >
      <TzForm form={form}>
        <TzFormItem
          label={translations.loginScreen_inputPwd}
          name="value"
          className="mb24"
          rules={[
            {
              required: true,
              whitespace: true,
              message: translations.unStandard.secretTips,
            },
          ]}
        >
          <TzInput
            allowClear
            placeholder={translations.loginScreen_dynPwd}
            onPressEnter={onSubmit}
          />
        </TzFormItem>
      </TzForm>
      <div></div>
    </TzModal>
  );
};
export default DynamicPwdPopup;
