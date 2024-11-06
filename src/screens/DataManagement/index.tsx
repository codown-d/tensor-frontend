import React from 'react';
import './index.scss';
import Backup from './components/Backup';
import DataManagement from './components/DataManagement';
import { useUpdate } from 'ahooks';
const DataManagementScreen = () => {
  const refresh = useUpdate();
  return (
    <div className="data-management-box">
      <DataManagement key={+new Date()} />
      <Backup refresh={refresh} />
    </div>
  );
};

export default DataManagementScreen;
