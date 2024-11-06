import React, { useMemo, useState } from 'react';
import './newUser.scss';
import Steps from './StepsHelper';
import SendEMail from './SendEMail';
import NewPwd from './NewPwd';
import GotoLogin from './GotoLogin';
import TzToast from './TzToast';
import { useParams } from 'react-router-dom';

const typeSteps: Record<string, number> = {
  email: 1,
  password: 2,
  Login: 3,
};
const NewUser = () => {
  const [toastActive, setToastActive] = useState<boolean>(false);

  const { type = 'email', hash } = useParams();

  const tabScreens = useMemo(() => {
    switch (type) {
      case 'email':
        return <SendEMail toastClose={() => setToastActive(true)} />;
      case 'password':
        return <NewPwd hash={hash as string} />;
      case 'Login':
        return <GotoLogin />;
      default:
        return null;
    }
  }, [type, hash]);

  return (
    <div className="layout-case">
      {/* <img src={Resources.Logo} alt="领航" className="logo" /> */}
      <div className="users-case">
        <Steps customClassName="stepGroup" active={typeSteps[type]} />
        <div className="TZ-toast">
          <TzToast active={toastActive} onClose={setToastActive}></TzToast>
        </div>
        <div className="tab-case">{tabScreens}</div>
      </div>
      <div className="layout-footer dfc">COPYRIGHT @ 2020-2022 All rights Reserved</div>
    </div>
  );
};

export default NewUser;
