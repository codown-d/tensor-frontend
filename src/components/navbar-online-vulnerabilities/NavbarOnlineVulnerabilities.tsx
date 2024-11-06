import React, { useState } from 'react';
import './NavbarOnlineVulnerabilities.scss';
import { translations } from '../../translations/translations';
import { Store } from '../../services/StoreService';
import { TzCheckbox } from '../tz-checkbox';

function NavbarOnlineVulnerabilities() {
  const [dynamicUpdate, setDynamicUpdate] = useState(false);

  const updateDynamic = (value: boolean) => {
    Store.onlineVulnerabilityDynamicUpdates.next(value);
    setDynamicUpdate(value);
  };

  return (
    <TzCheckbox
      checked={dynamicUpdate}
      style={{ width: '150px', marginLeft: '12px' }}
      onChange={(e) => {
        updateDynamic(e.target.checked);
      }}
    >
      <span style={{ color: '#3E4653', fontWeight: '400' }}>
        {translations.onlineVulnerability_dynamicUpdate}
      </span>
    </TzCheckbox>
  );
}

export default NavbarOnlineVulnerabilities;
