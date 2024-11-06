import { IS_MICRO_FRONT_IFRAME } from '../../helpers/config';
import React, { useEffect } from 'react';
import { getUserToken, setUserInformation } from '../../services/AccountService';
import { getProfile } from '../../services/DataService';
import NoAuth from '../../components/noData/NoAuth';

export default () => {
  return (
    <div style={{ padding: 50 }}>
      <NoAuth />
    </div>
  );
};
