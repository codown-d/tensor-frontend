import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import './index.scss';
import { policySnapshot } from '../../../services/DataService';
import { localLang, translations } from '../../../translations/translations';
import { tabType } from '../ImagesScannerScreen';
import { BaseInfoDetailDom, deployModOp } from '../SecurityPolicy/component/BaseInfo';
import { VulnDetailDom } from '../SecurityPolicy/component/VulnerabilityRules';
import { RenderTag, TzTag } from '../../../components/tz-tag';
import {
  RiskPackageDetailDom,
  riskPackageColumns,
} from '../SecurityPolicy/component/RiskPackageRules';
import { Tittle } from '../../../components/ComponentsLibrary/Tittle';
import {
  SensitiveDetailDom,
  useSensitiveFileDataInfo,
} from '../SecurityPolicy/component/SensitiveFileRules';
import { MalwareDetailDom } from '../SecurityPolicy/component/TrojanVirusRules';
import { WebShellDetailDom } from '../SecurityPolicy/component/WebShellRules';
import { PkgLicenseDetailDom } from '../SecurityPolicy/component/ROSLRules';
import { LicenseDetailDom } from '../SecurityPolicy/component/RiskLicenseRules';
import { EnvDetailDom } from '../SecurityPolicy/component/AEVRules';
import { TrustImageDetailDom } from '../SecurityPolicy/component/NWMRules';
import { RootBootDetailDom } from '../SecurityPolicy/component/RUSRules';
import { BaseImageDetailDom } from '../SecurityPolicy/component/BaseImageRules';
import { ExistInRegDetailDom } from '../SecurityPolicy/component/ExistInReg';
export let PolicySnapshot = (props: any) => {
  let { imageFromType } = props;
  let [data, setInfo] = useState<any>({});
  let [query] = useState(props);
  useEffect(() => {
    policySnapshot(query).subscribe((res) => {
      if (res.error) return;
      let item = res.getItem();
      setInfo(item);
    });
  }, [props]);
  let {
    vuln,
    sensitive,
    malware,
    webshell,
    pkg,
    license,
    pkgLicense,
    env,
    baseImage,
    trustImage,
    existInReg,
    rootBoot,
  } = useMemo(() => {
    return {
      vuln: data.vuln,
      sensitive: data.sensitive,
      malware: data.malware,
      webshell: data.webshell,
      pkg: data.pkg,
      license: data.license,
      pkgLicense: data.pkgLicense,
      env: data.env,
      baseImage: data.baseImage,
      trustImage: data.trustImage,
      existInReg: data.existInReg,
      rootBoot: data.rootBoot,
    };
  }, [data]);
  return (
    <div className={'images-detail-policy-info'}>
      <Tittle title={translations.compliances_breakdown_taskbaseinfo} className="mb16" />
      <BaseInfoDetailDom data={data} imageFromType={imageFromType} from="snapshot" />
      <Tittle
        className="mb16 mt12"
        title={
          <div className="flex-r-c">
            {translations.imageReject_vulnerabilityRules_tab_title}
            <RenderTag className="ml12" type={vuln?.enable + ''} />
          </div>
        }
      />
      <VulnDetailDom data={vuln} imageFromType={imageFromType} from="snapshot" />
      <Tittle
        className="mb16 mt32"
        title={
          <div className="flex-r-c">
            {translations.imageReject_sensitiveRules_tab_title}
            <RenderTag className="ml12" type={sensitive?.enable + ''} />
          </div>
        }
      />
      <SensitiveDetailDom sensitive={sensitive} imageFromType={imageFromType} />

      <Tittle
        className="mb16 mt12"
        title={
          <div className="flex-r-c">
            {translations.policy_trojan_virus}
            <RenderTag className="ml12" type={malware?.enable + ''} />
          </div>
        }
      />
      <MalwareDetailDom data={malware} imageFromType={imageFromType} />

      <Tittle
        className="mb16 mt12"
        title={
          <div className="flex-r-c">
            {translations.policy_web_shell}
            <RenderTag className="ml12" type={webshell?.enable + ''} />
          </div>
        }
      />
      <WebShellDetailDom data={webshell} imageFromType={imageFromType} />

      <Tittle
        className="mb16 mt12"
        title={
          <div className="flex-r-c">
            {translations.policy_risk_package}
            <RenderTag className="ml12" type={pkg?.enable + ''} />
          </div>
        }
      />
      <RiskPackageDetailDom data={pkg} imageFromType={imageFromType} from="snapshot" />

      <Tittle
        className="mb16 mt32"
        title={
          <div className="flex-r-c">
            {translations.disallowed_software_licensing_rules}
            <RenderTag className="ml12" type={pkgLicense?.enable + ''} />
          </div>
        }
      />
      <PkgLicenseDetailDom data={pkgLicense} imageFromType={imageFromType} />

      <Tittle
        className="mb16 mt12"
        title={
          <div className="flex-r-c">
            {translations.risky_licensing_file_rules}
            <RenderTag className="ml12" type={license?.enable + ''} />
          </div>
        }
      />
      <LicenseDetailDom data={license} imageFromType={imageFromType} />

      <Tittle
        className="mb16 mt12"
        title={
          <div className="flex-r-c">
            {translations.policy_abnormal_environment_variable}
            <RenderTag className="ml12" type={env?.enable + ''} />
          </div>
        }
      />
      <EnvDetailDom data={env} imageFromType={imageFromType} />

      {imageFromType === tabType.registry || imageFromType === tabType.node ? null : (
        <>
          <Tittle
            className="mb16 mt12"
            title={
              <div className="flex-r-c">
                {translations.imageReject_baseimage_tab_title}
                <RenderTag className="ml12" type={baseImage?.enable + ''} />
              </div>
            }
          />
          <BaseImageDetailDom data={baseImage} imageFromType={imageFromType} />
        </>
      )}
      {imageFromType === tabType.node ? null : (
        <>
          <Tittle
            className="mb16 mt12"
            title={
              <div className="flex-r-c">
                {translations.imageReject_trustedImageRule}
                <RenderTag className="ml12" type={trustImage?.enable + ''} />
              </div>
            }
          />
          <TrustImageDetailDom data={trustImage} imageFromType={imageFromType} />
        </>
      )}
      {imageFromType === tabType.node ? (
        <>
          <Tittle
            className="mb16 mt12"
            title={
              <div className="flex-r-c">
                {translations.policy_root_warehouse_mirror_rules}
                <RenderTag className="ml12" type={existInReg?.enable + ''} />
              </div>
            }
          />
          <ExistInRegDetailDom data={existInReg} imageFromType={imageFromType} />
        </>
      ) : null}
      <Tittle
        className="mb16 mt12"
        title={
          <div className="flex-r-c">
            {translations.policy_root_user_startup}
            <RenderTag className="ml12" type={rootBoot?.enable + ''} />
          </div>
        }
      />
      <RootBootDetailDom data={rootBoot} imageFromType={imageFromType} />
    </div>
  );
};
