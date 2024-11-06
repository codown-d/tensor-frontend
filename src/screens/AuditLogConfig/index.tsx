import React from 'react';
import { getNaviAuditConfigSyslog, postNaviAuditConfigSyslog } from '../../services/DataService';
import SysLog from '../AlertCenter/SysLog';
const AuditLogConfig = () => {
  return (
    <div className="mlr32 mt4 audit-log">
      <SysLog postApi={postNaviAuditConfigSyslog} getApi={getNaviAuditConfigSyslog} type={'audit'} />
    </div>
  );
};

export default AuditLogConfig;
