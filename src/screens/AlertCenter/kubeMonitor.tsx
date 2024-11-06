import React from 'react';
import EventData from './EventData';
const KubeMonitor = (props: any) => {
  return (
    <div className="mlr32 k8s-monitor">
      <EventData formType={'kubeMonitor'} />
    </div>
  );
};
export default KubeMonitor;
