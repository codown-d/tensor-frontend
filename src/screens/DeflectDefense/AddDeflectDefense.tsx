import React, { ReactNode, forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { Cascader, Form } from 'antd';
import { Store } from '../../services/StoreService';
import { getAssetsClustersList } from '../../services/DataService';
import { addPost, getNS, getResource } from './service';
import { TzForm, TzFormItem } from '../../components/tz-form';
import { TzMessageSuccess } from '../../components/tz-mesage';
import { translations } from '../../translations/translations';
import { TzTooltip } from '../../components/tz-tooltip';
import { TzSwitch } from '../../components/tz-switch';
import { TzButton } from '../../components/tz-button';
import { TzModal } from '../../components/tz-modal';
import { isEqual } from 'lodash';
import './AddDeflectDefense.scss';
import { TzCascader } from '../../components/ComponentsLibrary';
import { filter } from '../ComplianceWhole/ScanManagement';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { forkJoin } from 'rxjs';
import { TreeNode } from '../../components/ComponentsLibrary/TzCascader/interface';
import { newActiongDataList } from '../ImagesScanner/SecurityPolicy/SecurityPolicyInfo';
import { StrategyAction } from '../../components/ComponentsLibrary/TzStrategyAction';
import { flushSync } from 'react-dom';
import { Routes } from '../../Routes';

let isEmptyObj = {
  enable: false,
  mode: 'alert',
  resources: [],
};

const osLists: string[] = [
  'ubuntu-22.04',
  'ubuntu-20.04',
  'ubuntu-18.04',
  'ubuntu-16.04',
  'debian-11',
  'debian-10',
  'debian-9',
  'centos-8',
  'centos-7',
  'rhel-8.5',
  'rhel-8.4',
  'rhel-6.5',
  'photon-4.0',
  'photon-3.0',
  'photon-2.0',
  'photon-1.0',
  'opensuse-42.3',
];

const AddDeflectDefense = forwardRef((props?: any, ref?: any) => {
  const navigate = useNavigate();
  const l = useLocation();
  useEffect(() => {
    Store.header.next({
      title: translations.deflectDefense_newStrategy,
      extra: null,
      onBack: () => {
        navigate(-1);
      },
    });
  }, [l]);
  const [result] = useSearchParams();
  const ckey = useMemo(() => {
    return result.get('ck');
  }, []);

  const [clusters, setClusters] = useState<any>([]);
  const [formIns] = Form.useForm();
  const [modalVisible, setModalVisible] = useState<any>(false);
  const [namespaces, setNamespaces] = useState<any>([]);
  const [nsReList, setNsReList] = useState<any>([]);
  const [resources, setResources] = useState<any>({});

  const getClusters = useCallback(() => {
    getAssetsClustersList().subscribe((result) => {
      setClusters(result.map((item: any) => ({ label: item.name, value: item.key })));
    });
  }, []);

  useEffect(() => {
    getClusters();
  }, []);

  const emptyFormValue = useCallback(() => {
    if (formIns) formIns.resetFields();
    navigate(Routes.DeflectDefense, {
      replace: true,
    });
  }, []);

  const cancel = useCallback(() => {
    const emptyFlag = isEqual(formIns.getFieldsValue(), isEmptyObj);
    emptyFlag ? emptyFormValue() : setModalVisible(true);
  }, [formIns]);

  const getNs = useCallback((cluster: any) => {
    if (cluster)
      getNS(cluster).subscribe((result) => {
        setNamespaces(result.getItems().map((item: any) => ({ label: item.Name, value: item.Name })));
      });
  }, []);

  useEffect(() => {
    getNs(ckey);
  }, [ckey]);

  useEffect(() => {
    if (!namespaces || namespaces.length === 0 || !ckey) {
      return;
    }
    const sub = forkJoin(
      namespaces.map((item: { value: string }) => {
        return getResource(ckey, item.value);
      }),
    ).subscribe((resarr) => {
      let nsItems: any = [];
      let allResourceList: any = {};
      resarr.map((t: any, k) => {
        let nsobj: any = {};
        let ress = t?.data?.items;
        // .filter((t: any) => !!t?.is_support_drift)
        // .filter((t: any) => !t?.is_exist);
        if (!nsobj['value']) {
          nsobj = {
            key: namespaces[k].value,
            value: namespaces[k].value,
            label: namespaces[k].value,
          };
        }
        // 禁用
        let allDised = ress.length;
        let count = 0;
        if (!!ress.length) {
          ress = ress.map((r: any) => {
            let applyMark = false;
            let explainTxt = '';
            if (!!r?.is_exist) {
              applyMark = true;
              explainTxt = translations.policy_exist;
            }
            if (!r?.is_support_drift) {
              applyMark = true;
              if (r?.reason == 'noRunningContainers') {
                explainTxt = translations.no_running_containers;
              } else {
                if (r?.reason && !osLists.includes(r?.reason)) {
                  explainTxt = `${translations.unknown_start_version} ${r?.reason}${translations.unknown_end_version}`;
                } else {
                  explainTxt = translations.unknown_OS_version;
                }
              }
            }
            if (applyMark) {
              count += 1;
            }
            return {
              kind: r.kind,
              name: r.name,
              cluster: r.cluster,
              namespace: r.namespace,
              key: r.name,
              value: r.name + '_' + r.kind,
              label: `${r.name}(${r.kind})`,
              disabled: applyMark,
              explain: explainTxt,
            };
          });
        }
        if (allDised === count) {
          nsobj['disabled'] = true;
          if (!count) {
            nsobj['explain'] = translations.not_resource;
          }
        }
        nsobj['children'] = ress;
        allResourceList[nsobj.value] = ress;
        nsItems.push(nsobj);
      });
      setNsReList(nsItems);
      setResources(allResourceList);
    });

    return () => {
      sub?.unsubscribe();
    };
  }, [namespaces, ckey]);

  const resourceList = useMemo(() => {
    if (!clusters.length || !nsReList.length || !ckey) {
      return [];
    }
    let items = clusters
      .filter((t: any) => t.value === ckey)
      .map((p: any) => {
        return {
          key: p.value,
          value: p.value,
          label: p.label,
          children: nsReList,
        };
      });
    return items;
  }, [ckey, nsReList, clusters]);

  const postPolicyCreate = useCallback(
    (data: any) => {
      let items: any = [];
      const { enable, mode } = data;
      (data?.resources || []).map((t: any) => {
        let ims: any = [];
        if (t?.length === 1) {
          Object.values(resources).map((m: any) => {
            let mm = m.filter((f: any) => !f?.disabled);
            ims.push(...mm);
            return m;
          });
          ims = ims.map((m: any) => {
            return {
              cluster_key: m.cluster,
              enable: !!enable ? 1 : 0,
              mode: mode,
              namespace: m.namespace,
              resource: m.name,
              resource_kind: m.kind,
            };
          });
          items.push(...ims);
          return t;
        }
        if (t?.length === 2) {
          resources[t[1]].map((m: any) => {
            let obj = {
              cluster_key: m.cluster,
              enable: !!enable ? 1 : 0,
              mode: mode,
              namespace: m.namespace,
              resource: m.name,
              resource_kind: m.kind,
            };
            if (!m?.disabled) {
              items.push(obj);
            }
            return m;
          });
          return t;
        }
        resources[t[1]]
          .filter((f: any) => f.value === t[2])
          .map((m: any) => {
            let obj = {
              cluster_key: m.cluster,
              enable: !!enable ? 1 : 0,
              mode: mode,
              namespace: m.namespace,
              resource: m.name,
              resource_kind: m.kind,
            };
            if (!m?.disabled) {
              items.push(obj);
            }
            return m;
          });
        return t;
      });
      // 多余代码
      if (!items?.length) {
        return;
      }
      addPost(items).subscribe((res) => {
        if (res.error) {
          return;
        }
        emptyFormValue();
        TzMessageSuccess(translations.activeDefense_successTip);
      });
    },
    [formIns, resources],
  );

  useEffect(() => {
    Store.pageFooter.next(
      <div style={{ width: '100%' }}>
        <div className={'f-r'}>
          <TzButton onClick={cancel} className={'mr16'}>
            {translations.cancel}
          </TzButton>
          <TzButton onClick={() => formIns.submit()} type="primary">
            {translations.newAdd}
          </TzButton>
        </div>
      </div>,
    );
  }, [cancel, postPolicyCreate, formIns, l]);

  useImperativeHandle(
    ref,
    () => {
      return {
        show() {},
      };
    },
    [],
  );

  return (
    <div className="deflect-defense-add-group">
      <div
        className="color-b radius8"
        style={{
          padding: '16px 24px',
          background: 'rgba(33,119,209,0.05)',
        }}
      >
        <i className={'icon iconfont icon-tishi mr8'}></i>{' '}
        <span style={{ lineHeight: '28px' }}>{translations.unStandard.str55}：</span> <br />
        {`"ubuntu-22.04","ubuntu-20.04","ubuntu-18.04","ubuntu-16.04",
        "debian-11","debian-10","debian-9", "centos-8","centos-7", "rhel-8.5","rhel-8.4","rhel-6.5",
        "photon-4.0", "photon-3.0","photon-2.0","photon-1.0", "opensuse-42.3"`}
      </div>
      <div className="form-group">
        <TzForm
          form={formIns}
          initialValues={{
            resources: [],
            enable: false,
            mode: 'alert',
          }}
          onFinish={(values) => {
            postPolicyCreate(values);
          }}
        >
          <TzFormItem
            name="resources"
            label={translations.resources + '：'}
            rules={[
              {
                required: true,
                message: translations.runtimePolicy_policy_res_place,
              },
            ]}
          >
            <TzCascader
              placeholder={translations.runtimePolicy_policy_res_place}
              options={resourceList}
              showCheckedStrategy={Cascader.SHOW_CHILD}
              multiple
              popupClassName="pri-defense-cascade-popup"
              showSearch={{ filter }}
              labelFormat={(node: ReactNode, row: TreeNode): ReactNode => {
                const isShowTip = row?.disabled && row?.explain;
                return isShowTip ? (
                  <>
                    <TzTooltip placement="topLeft" className="db" title={row?.explain || row?.label}>
                      {node}
                    </TzTooltip>
                  </>
                ) : (
                  <>{node}</>
                );
              }}
            />
          </TzFormItem>
          <TzFormItem
            name="enable"
            valuePropName="checked"
            label={translations.deflectDefense_status + '：'}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <TzSwitch
              checkedChildren={translations.deflectDefense_enabled}
              unCheckedChildren={translations.deflectDefense_disabled}
            />
          </TzFormItem>
          <TzFormItem
            name="mode"
            label={translations.deflectDefense_defenseMode + '：'}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <StrategyAction data={newActiongDataList} />
          </TzFormItem>
        </TzForm>
      </div>
      <TzModal
        className="addCancelModel"
        open={modalVisible}
        onOk={() => {
          setModalVisible(false);
          emptyFormValue();
        }}
        onCancel={() => {
          setModalVisible(false);
        }}
        title=" "
        okType="primary"
        centered={true}
        destroyOnClose={true}
      >
        <span className="content">{translations.deflectDefense_cancelTip}</span>
      </TzModal>
    </div>
  );
});

export default AddDeflectDefense;
