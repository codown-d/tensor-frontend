import { useEffect, useState } from 'react';
import { TGlobalContext, TLicenseInfo } from './helpers/GlobalContext';
import { useAssetsClusterList } from './helpers/use_fun';
function useInitInfo(): TGlobalContext {
  const [cycleChangePwdDay, setCycleChangePwdDay] = useState<number>(-1);
  const [licenseState, setLicenseInfo] = useState<TLicenseInfo>();
  return { cycleChangePwdDay, setCycleChangePwdDay, licenseState, setLicenseInfo };
}
export default useInitInfo;
