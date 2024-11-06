import { createContext } from 'react';

export type TLicenseInfo = {
  valid: boolean;
  deadlineState: 'willExpire' | 'expired';
  nodeLimitState: 'exceedLimit';
};
export type TGlobalContext = {
  cycleChangePwdDay: number;
  setCycleChangePwdDay: (arg: number) => void;
  licenseState?: TLicenseInfo;
  setLicenseInfo: (arg: TLicenseInfo) => void;
};

export const GlobalContext = createContext<TGlobalContext>({
  cycleChangePwdDay: -1,
  licenseState: undefined,
  setCycleChangePwdDay: () => null,
  setLicenseInfo: () => null,
});
