import React, {
  forwardRef,
  PureComponent,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import './index.scss';
import { TzButton } from '../../../components/tz-button';
import { addSecurityPolicy, putSecurityPolicy, securityPolicyDetail } from '../../../services/DataService';
import { Form } from 'antd';
import { TzFormItem, TzForm, MyFormItem } from '../../../components/tz-form';
import { TzInput } from '../../../components/tz-input';
import { getUserInformation } from '../../../services/AccountService';
import { showFailedMessage, showSuccessMessage } from '../../../helpers/response-handlers';
import { Routes } from '../../../Routes';
import { TzConfirm, TzModal } from '../../../components/tz-modal';
import { translations } from '../../../translations/translations';
import { Store } from '../../../services/StoreService';
import EllipsisPopover from '../../../components/ellipsisPopover/ellipsisPopover';
import { isArray, isObject, merge, mergeWith, reject, trim, get, keys, toLower, uniq } from 'lodash';
import TzAnchor, { useAnchorItem } from '../../../components/ComponentsLibrary/TzAnchor';
import BaseInfo from './component/BaseInfo';
import VulnerabilityRules from './component/VulnerabilityRules';
import SensitiveFileRules from './component/SensitiveFileRules';
import TrojanVirusRules from './component/TrojanVirusRules';
import WebShellRules from './component/WebShellRules';
import RiskPackageRules from './component/RiskPackageRules';
import ROSLRules from './component/ROSLRules';
import AEVRules from './component/AEVRules';
import RUSRules from './component/RUSRules';
import NWMRules from './component/NWMRules';
import { useMemoizedFn, useSetState } from 'ahooks';
import { useFormValidateFields } from '../../../components/tz-form/useFormLib';
import { tabType } from '../ImagesScannerScreen';
import RiskLicenseRules from './component/RiskLicenseRules';
import ExistInReg from './component/ExistInReg';
import { configTypeEnum, policyType } from '../ImageConfig/ImageScanConfig';
import { TzInputNumber } from '../../../components/tz-input-number';
import BaseImageRules from './component/BaseImageRules';
import { FormInstance } from 'rc-field-form/lib/interface';
import { objectKeyPath } from '../../../helpers/until';
import { flushSync } from 'react-dom';

export let getNewComponentItems = (query: { [x: string]: any; imageFromType: tabType | any }) => {
  const componentItems = [
    {
      component: BaseInfo,
      title: 'policy_info',
      anchorTitle: 'policy_info',
    },
    {
      component: VulnerabilityRules,
      title: 'imageReject_vulnerabilityRules_tab_title',
      anchorTitle: 'scanner_images_vulnerabilities',
    },
    {
      component: SensitiveFileRules,
      title: 'policy_sensitive_file',
      anchorTitle: 'scanner_images_sensitive',
    },
    {
      component: TrojanVirusRules,
      title: 'policy_trojan_virus',
      anchorTitle: 'virus',
    },
    {
      component: WebShellRules,
      title: 'policy_web_shell',
      anchorTitle: 'scanner_overview_webshell',
    },
    {
      component: RiskPackageRules,
      title: 'policy_risk_package',
      anchorTitle: 'risk_packages',
    },
    {
      component: ROSLRules,
      title: 'disallowed_software_licensing_rules',
      anchorTitle: 'disallowedOpen',
    },

    {
      component: RiskLicenseRules,
      title: 'risk_license_rules',
      anchorTitle: 'risk_license_file',
    },
    {
      component: AEVRules,
      title: 'policy_abnormal_environment_variable',
      anchorTitle: 'scanner_overview_envs',
    },

    {
      component: NWMRules,
      title: 'imageReject_trustedImageRule',
      anchorTitle: 'trustedImage',
    },
    {
      component: RUSRules,
      title: 'policy_root_user_startup',
      anchorTitle: 'started_root_user',
    },
  ];
  if (query.imageFromType === tabType.node) {
    componentItems.splice(-2, 1, {
      component: ExistInReg,
      title: 'policy_root_warehouse_mirror_rules',
      anchorTitle: 'non_warehouse_images',
    });
  } else if (query.imageFromType === tabType.deploy) {
    componentItems.splice(-2, 0, {
      component: BaseImageRules,
      title: 'imageReject_baseimage_tab_title',
      anchorTitle: 'scanner_images_basisImages',
    });
  }
  return componentItems;
};
export let securityPolicyValidator = (
  formInstance: FormInstance<any>,
  setErrorFields: (reg: any) => void,
  scopeType?: string,
) => {
  let { getFieldsValue } = formInstance;
  if (scopeType === 'scope') {
    let { scope } = getFieldsValue([
      ['scope', 'scopeType'],
      ['scope', 'allReg'],
      ['scope', 'regIds'],
      ['scope', 'allCluster'],
      ['scope', 'clusterKey'],
      ['scope', 'imageRegexp'],
    ]);
    if (
      ((scope.imageRegexp?.length === 0 || !scope.imageRegexp) && scope.scopeType === 'image') ||
      (!scope.allReg && scope.regIds?.length === 0 && scope.scopeType === 'registry') ||
      (!scope.allCluster && scope.clusterKey?.length === 0 && scope.scopeType === 'cluster')
    ) {
      setErrorFields((pre: any) => {
        if (scope.scopeType === 'registry') {
          pre['scope.allReg'] = translations.unStandard.str255;
        } else if (scope.scopeType === 'cluster') {
          pre['scope.allCluster'] = translations.unStandard.str255;
        } else {
          pre['scope.imageRegexp'] = translations.unStandard.str255;
        }
        return { ...pre };
      });
      return Promise.reject(translations.unStandard.str255);
    } else {
      setErrorFields({
        'scope.allReg': undefined,
        'scope.regIds': undefined,
        'scope.allCluster': undefined,
        'scope.clusterKey': undefined,
        'scope.imageRegexp': undefined,
      });
    }
  } else if (scopeType === 'vuln') {
    let { vuln } = getFieldsValue([
      ['vuln', 'enable'],
      ['vuln', 'severity'],
      ['vuln', 'hasFixedVuln'],
      ['vuln', 'black'],
    ]);
    if (vuln.enable && !vuln.severity && !vuln.hasFixedVuln && vuln.black?.length === 0) {
      setErrorFields((pre: any) => {
        pre['vuln.hasFixedVuln'] = translations.unStandard.securityPolicyVulnTip;
        return { ...pre };
      });
      return Promise.reject(new Error(translations.unStandard.securityPolicyVulnTip));
    } else {
      setErrorFields({
        'vuln.severity': undefined,
        'vuln.hasFixedVuln': undefined,
        'vuln.black': undefined,
      });
    }
  } else if (scopeType === 'sensitive') {
    let { sensitive } = getFieldsValue([
      ['sensitive', 'enable'],
      ['sensitive', 'allBlack'],
      ['sensitive', 'black'],
    ]);
    if (sensitive.enable && !sensitive.allBlack && sensitive.black?.length === 0) {
      return Promise.reject(translations.customizeSensitiveFiles);
    } else {
      setErrorFields({
        'sensitive.enable': undefined,
        'sensitive.allBlack': undefined,
        'sensitive.black': undefined,
      });
    }
  } else if (scopeType === 'webshell') {
    let { webshell } = getFieldsValue([
      ['webshell', 'enable'],
      ['webshell', 'riskLevel'],
    ]);
    if (webshell.enable && webshell.riskLevel?.length === 0) {
      setErrorFields({
        'webshell.riskLevel': translations.unStandard.notEmptyTip(translations.risk_level),
      });
      return Promise.reject(translations.unStandard.notEmptyTip(translations.risk_level));
    } else {
      setErrorFields({
        'webshell.riskLevel': undefined,
      });
    }
  } else if (scopeType === 'pkgLicense') {
    let { pkgLicense } = getFieldsValue([
      ['pkgLicense', 'enable'],
      ['pkgLicense', 'black'],
    ]);
    if (pkgLicense.enable && !pkgLicense.black?.length) {
      setErrorFields({
        'pkgLicense.black': translations.unStandard.notEmptyTip(translations.disallowedOpen),
      });
      return Promise.reject(new Error(translations.unStandard.notEmptyTip(translations.disallowedOpen)));
    } else {
      setErrorFields({
        'pkgLicense.black': undefined,
      });
    }
  } else if (scopeType === 'license') {
    let { license } = getFieldsValue([
      ['license', 'enable'],
      ['license', 'black'],
    ]);
    if (license.enable && license.black?.length === 0) {
      setErrorFields({
        'license.black': translations.unStandard.notEmptyTip(translations.risk_license_file_reference),
      });
      return Promise.reject(translations.unStandard.notEmptyTip(translations.risk_license_file_reference));
    } else {
      setErrorFields({
        'license.black': undefined,
      });
    }
  } else if (scopeType === 'env') {
    let { env } = getFieldsValue([
      ['env', 'enable'],
      ['env', 'checkPassword'],
      ['env', 'black'],
    ]);
    if (env.enable && !env.checkPassword && !env.black?.length) {
      setErrorFields({
        'env.checkPassword': translations.unStandard.abnormalEnvVarTip,
      });
      return Promise.reject(new Error(translations.unStandard.abnormalEnvVarTip));
    } else {
      setErrorFields({
        'env.checkPassword': undefined,
        'env.black': undefined,
      });
    }
  }
  return Promise.resolve(undefined);
};
const SecurityPolicyEdit = (props: any) => {
  const navigate = useNavigate();
  const l = useLocation();
  const [result] = useSearchParams();
  const [form] = Form.useForm();
  let userName = getUserInformation().username;
  let [errorFields, setErrorFields] = useSetState<any>({});
  // const { refresh, getCachingNodes, drop, refreshScope, dropScope, clear } = useAliveController();
  let [query] = useState({
    id: result.get('id'),
    imageFromType: result.get('imageFromType') || tabType.registry,
    copyId: result.get('copyId'),
  });
  const fieldsChangeRef = useRef<boolean>();
  const onOk = useCallback(() => {
    form
      .validateFields()
      .then((value) => {
        let id = value.id ? Number(value.id) : null;
        const API = id ? putSecurityPolicy : addSecurityPolicy;
        API(
          merge({}, query, value, {
            id,
            updater: userName,
            creator: id ? value.creator : userName,
          }),
        ).subscribe((res: any) => {
          if (res.error) {
            showFailedMessage(res.error.message);
          } else {
            showSuccessMessage(
              !query.id ? translations.activeDefense_successTip : translations.activeDefense_updateSuccessTip,
            );

            navigate(-1);
            flushSync(() => {
              navigate(`${Routes.SecurityPolicy}?tab=${tabType.registry}`, {
                replace: true,
                state: { keepAlive: true },
              });
            });
          }
        });
      })
      .catch((res) => {
        formValidateFields(setErrorFields);
      });
  }, [query]);
  const onBack = useCallback(() => {
    if (fieldsChangeRef.current) {
      TzConfirm({
        content: translations.deflectDefense_cancelTip,
        okText: translations.superAdmin_confirm,
        cancelText: translations.breadcrumb_back,
        onOk: () => {
          navigate(-1);
        },
      });
    } else {
      navigate(-1);
    }
  }, []);

  const setFooter = useCallback(() => {
    Store.pageFooter.next(
      <div className="flex-r djfe dff1">
        <TzButton onClick={onBack} className="mr16">
          {translations.cancel}
        </TzButton>
        <TzButton onClick={onOk} type="primary">
          {!query.id ? translations.newAdd : translations.save}
        </TzButton>
      </div>,
    );
  }, [onOk, onBack, query.id, l]);
  useEffect(() => {
    setFooter();
  }, [setFooter]);

  let { formValidateFields, formValidateChangeFields } = useFormValidateFields(form);
  useEffect(() => {
    let { imageFromType, id, copyId } = query;
    if (id || copyId) {
      securityPolicyDetail(merge({}, query, { id: id || copyId })).subscribe((res) => {
        if (res.error) return;
        let item = res.getItem();
        let newItem = merge({}, item, {
          policyType: policyType[imageFromType],
          vuln: { severity: item.vuln.severity || undefined },
        });
        form.setFieldsValue(newItem);
      });
    }
  }, [query]);
  let setHeader = useMemoizedFn(() => {
    Store.header.next({
      title: query.id ? translations.imageReject_edit_rule_title : translations.imageReject_create_new_rule,
      onBack: () => {
        if (tabType.deploy === query.imageFromType) {
        }
        navigate(-1);
      },
    });
  });
  useEffect(setHeader, [query, l]);
  useEffect(() => {
    if (!query.imageFromType) return;
    Store.breadcrumb.next([
      {
        children: translations.mirror_lifecycle,
        href: Routes.ImagesCILifeCycle,
      },
      {
        children:
          query.imageFromType === tabType.registry
            ? translations.scanner_report_repoImage
            : query.imageFromType === tabType.node
              ? translations.scanner_report_nodeImage
              : translations.imageReject_toonline,
        href: `${Routes.ImagesCILifeCycle}?tab=${query.imageFromType}`,
      },
      {
        children:
          query.imageFromType === tabType.deploy ? translations.policy_management : translations.security_policy,
        href:
          query.imageFromType === tabType.deploy
            ? `${Routes.imageRejectPolicyManagement}?imageFromType=${query.imageFromType}`
            : `${Routes.SecurityPolicy}?imageFromType=${query.imageFromType}`,
      },
      {
        children: query.id ? translations.imageReject_edit_rule_title : translations.runtimePolicy_addpolicy,
      },
    ]);
  }, [query.imageFromType]);
  let newComponentItems = useMemo(() => {
    return getNewComponentItems(query);
  }, [query]);
  let { pageKey } = useAnchorItem();
  return (
    <div className="security-policy-edit mlr32 pt4 ">
      <div className="flex-r">
        <div className="flex-c" style={{ flex: 1 }}>
          <TzForm
            className="form-global-check"
            scrollToFirstError
            form={form}
            onValuesChange={(changedValues) => {
              fieldsChangeRef.current = true;
              let keyPath = objectKeyPath(changedValues);
              formValidateChangeFields((obj) => {
                setErrorFields((pre: any) => {
                  return Object.assign({}, pre, obj);
                });
              }, keyPath);
            }}
          >
            <TzFormItem name="id" hidden>
              <TzInputNumber />
            </TzFormItem>
            {query.id ? (
              <TzFormItem name="updater" hidden initialValue={userName}>
                <TzInput />
              </TzFormItem>
            ) : (
              <TzFormItem name="creator" hidden initialValue={userName}>
                <TzInput />
              </TzFormItem>
            )}
            <TzFormItem
              name="policyType"
              hidden
              initialValue={
                query.imageFromType === tabType.registry
                  ? configTypeEnum.regImage
                  : query.imageFromType === tabType.node
                    ? configTypeEnum.nodeImage
                    : configTypeEnum.deploy
              }
            >
              <TzInput />
            </TzFormItem>
            {newComponentItems.map(({ title, component: Component }: any) => {
              const props = {
                title: get(translations, title),
                id: `${pageKey}_${title}`,
                form,
                errorFields,
                setErrorFields,
                imageFromType: query.imageFromType,
              };
              return <Component {...props} />;
            })}
          </TzForm>
        </div>
        <TzAnchor
          items={newComponentItems.map(({ title, anchorTitle }) => ({
            title: <EllipsisPopover>{get(translations, anchorTitle || title)}</EllipsisPopover>,
            href: `#${title}`,
          }))}
          offsetBottom={60}
        />
      </div>
    </div>
  );
};
export default SecurityPolicyEdit;
