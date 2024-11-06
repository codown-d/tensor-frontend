import React, { useState } from 'react';
import { TzButton } from '../../../../components/tz-button';
import { TzCard } from '../../../../components/tz-card';
import BackupPopup from './BackupPopup';
import RecoverPopup from './RecoverPopup';
import { translations } from '../../../../translations/translations';
import { useUpdate } from 'ahooks';

type BackupProps = {
  refresh: () => void;
};
function Backup({ refresh }: BackupProps) {
  const [backupVisible, setBackupVisible] = useState<boolean>(false);
  const [recoverVisible, setRecoverVisible] = useState<boolean>(false);

  return (
    <>
      <TzCard
        title={translations.backup_and_recovery}
        className="data-management mlr32 mt20 mb32"
        bodyStyle={{ paddingBottom: '20px' }}
      >
        <p className="data-item-tit sub-txt">{translations.unStandard.backupsDescription}</p>
        <div>
          <TzButton onClick={() => setBackupVisible(true)} className="mr16">
            {translations.backups}
          </TzButton>
          <TzButton onClick={() => setRecoverVisible(true)}>{translations.recover}</TzButton>
        </div>
      </TzCard>
      {backupVisible && (
        <BackupPopup open={backupVisible} onCancel={() => setBackupVisible(false)} />
      )}
      {recoverVisible && (
        <RecoverPopup
          open={recoverVisible}
          refresh={refresh}
          onCancel={() => setRecoverVisible(false)}
        />
      )}
    </>
  );
}

export default Backup;
