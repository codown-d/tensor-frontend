import React, { useRef } from 'react';
import { translations } from '../../../../translations/translations';
import { WebResponse } from '../../../../definitions';
import { tap } from 'rxjs/operators';
import { EnrollUser, postSuperAdminInit, resetPwd } from '../../../../services/DataService';
import { TzButton } from '../../../../components/tz-button';
import { onSubmitFailed, showSuccessMessage } from '../../../../helpers/response-handlers';
import { TzModal } from '../../../../components/tz-modal';
import ResetPwd, { TResetPwd } from './ResetPwd';
import { isNumber } from 'lodash';

type TRestPwdPopup = TResetPwd & {
  open: boolean;
  hash?: string;
  cycleChangePwdDay?: number;
  onCancel?: () => void;
  hideCancel?: boolean;
  onSuccessCall?: (arg?: any) => void;
};
type TFormValues = {
  pwd: string;
};
const API_CONFIG: Record<string, any> = {
  resetPwd: { api: resetPwd, hasHash: false },
  resetPwdByFirst: { api: postSuperAdminInit, hasHash: true },
  resetPwdByHash: { api: EnrollUser, hasHash: true },
};
const RestPwdPopup = ({
  type = 'resetPwd',
  open,
  onCancel,
  hideCancel,
  onSuccessCall,
  hash,
  cycleChangePwdDay,
  ...rest
}: TRestPwdPopup) => {
  const newPwdRef = useRef<any>();
  return (
    <TzModal
      title={translations.change_password}
      className="update_password-modal"
      onCancel={onCancel}
      closable={!hideCancel}
      open={open}
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
            newPwdRef.current.getFormData().then((formVals: TFormValues) => {
              const { api, hasHash } = API_CONFIG[type] || {};
              let param = type === 'resetPwdByFirst' ? { ...formVals, account: 'SeedAdmin' } : formVals;
              api(hasHash ? { pwd: formVals.pwd, hash_code: hash } : param)
                .pipe(
                  tap((result: WebResponse<any>) => {
                    if (result.error) {
                      return;
                    }
                    showSuccessMessage(
                      type === 'resetPwdByFirst'
                        ? translations.password_successfully_setting
                        : translations.password_successfully_modified,
                    );
                    onSuccessCall ? onSuccessCall(result) : onCancel?.();
                  }),
                )
                .subscribe();
            });
          }}
        >
          {translations.save}
        </TzButton>,
      ]}
    >
      {isNumber(cycleChangePwdDay) && cycleChangePwdDay > -1 ? (
        <div className={'txt-info mt0 mb20'} style={{ display: 'flex' }}>
          <i className={'iconfont icon-xingzhuangjiehe mr8 mt4'}></i>
          {translations.unStandard.str153(cycleChangePwdDay)}
        </div>
      ) : null}
      <ResetPwd ref={newPwdRef} {...rest} type={type} />
    </TzModal>
  );
};
export default RestPwdPopup;
