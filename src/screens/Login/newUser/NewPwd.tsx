import React, { useCallback, useRef, useState } from 'react';
import './newUser.scss';
import { translations } from '../../../translations/translations';
import { WebResponse } from '../../../definitions';
import { tap } from 'rxjs/operators';
import { EnrollUser } from '../../../services/DataService';
import { TzButton } from '../../../components/tz-button';
import { onSubmitFailed, showSuccessMessage } from '../../../helpers/response-handlers';
import { onLoginSuccessed } from '../../../helpers/until';
import ResetPwd, { TFormValues } from '../component/ResetPwd/ResetPwd';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Routes } from '../../../Routes';
import useNewSearchParams from '../../../helpers/useNewSearchParams';

type TNewPwd = {
  hash: string;
};
const NewPwd = ({ hash }: TNewPwd) => {
  const newPwdRef = useRef<any>();
  const [loading, setLoading] = useState<boolean>();
  const navigate = useNavigate();
  const onOk = useCallback(() => {
    newPwdRef.current.getFormData().then(({ pwd }: TFormValues) => {
      setLoading(true);
      EnrollUser({ pwd, hash_code: hash })
        .pipe(
          tap((result: WebResponse<any>) => {
            setLoading(false);
            if (result.error) {
              return;
            }
            let { status } = result.getItem();
            if (status) {
              showSuccessMessage(translations.password_successfully_modified);
              navigate(Routes.SendEmail.replace('/:type/:hash', `/Login/success`));
            }
          }),
        )
        .subscribe();
    });
  }, [hash]);
  return (
    <div style={{ width: 360 }}>
      <ResetPwd ref={newPwdRef} type="resetPwdByHash" />
      <TzButton loading={loading} className="mt4" type="primary" onClick={onOk}>
        {translations.submit}
      </TzButton>
    </div>
  );
};
export default NewPwd;
