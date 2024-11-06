import React from 'react';
import './newUser.scss';
import { translations } from '../../../translations/translations';
import { Resources } from '../../../Resources';
import { Routes } from '../../../Routes';
import CountDown from '../../SuperAdmin/ResetPwd/Countdown';
import { useNavigate } from 'react-router-dom';
import { TzButton } from '../../../components/tz-button';

const GotoLogin = () => {
  const navigate = useNavigate();
  return (
    <>
      <div className="resetOK-case">
        <img src={Resources.pwd_suc} alt="OK" />
        <span className="title">{translations.superAdmin_resetPwd_title}</span>
        <span className="content">
          {translations.superAdmin_resetPwd_content}
          <CountDown
            time="3"
            customClassName="clock"
            complyFn={() => navigate(Routes.LoginScreen)}
          />
          {translations.superAdmin_resetPwd_seconds}
        </span>
        <TzButton type="primary" onClick={() => navigate(Routes.LoginScreen)}>
          {translations.login}
        </TzButton>
      </div>
    </>
  );
};

export default GotoLogin;
