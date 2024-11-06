import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { translations } from '../../../translations';
import './index.scss';
import { merge, mergeWith } from 'lodash';
import { batchpolicies, microsegPolicy, microsegPolicyId } from '../../../services/DataService';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useDebounceFn, useMemoizedFn } from 'ahooks';
import { Store } from '../../../services/StoreService';
import { TzTabs } from '../../../components/tz-tabs';
import Manual from './Manual';
import Automatic from './Automatic';
import { TzButton } from '../../../components/tz-button';
import { TzConfirm, TzModal, TzModalInfo, TzSuccess } from '../../../components/tz-modal';
import { TzMessageSuccess, TzMessageWarning } from '../../../components/tz-mesage';
import Form from 'antd/lib/form';
import { TzCheckbox } from '../../../components/tz-checkbox';
import { TrafficType } from '../VisualizeChart';
import { getUid } from '../../../helpers/until';
const MicroisolationPolicy = () => {
  const { id } = useParams();
  let [activeKey, setActiveKey] = useState('manual');
  let [checkValue, setCheckValue] = useState(false);
  let [loading, setLoading] = useState(false);
  const [manualFormIns] = Form.useForm();
  const [automaticFormIns] = Form.useForm();
  let navigate = useNavigate();
  const l = useLocation();
  let automaticRef = useRef<any>();
  let items = [
    {
      label: translations.add_manually,
      key: 'manual',
      children: <Manual formIns={manualFormIns} id={id} />,
    },
    {
      label: translations.auto_recommend,
      key: 'automatic',
      children: <Automatic formIns={automaticFormIns} ref={automaticRef} />,
    },
  ];
  let setHeader = useMemoizedFn(() => {
    Store.header.next({
      title: id ? translations.imageReject_edit_rule_title : translations.imageReject_create_new_rule,
      footer: id ? null : (
        <TzTabs
          activeKey={activeKey}
          onChange={setActiveKey}
          items={items.map((item) => merge({}, item, { children: null }))}
          className="mb20"
        />
      ),
      onBack: () => {
        navigate(-1);
      },
    });
  });
  let postData = useMemoizedFn(() => {
    if (activeKey === 'manual') {
      setLoading(true);
      manualFormIns
        .validateFields()
        .then((val) => {
          let newValue = JSON.parse(JSON.stringify(val));
          let newVal = merge({}, newValue, {
            dstId: newValue.dstId.pop ? newValue.dstId.pop() : newValue.dstId,
            srcId: newValue.srcId.pop ? newValue.srcId.pop() : newValue.srcId,
          });
          microsegPolicy(newVal, val.id ? 'PUT' : 'POST').subscribe((res) => {
            setLoading(false);
            if (res.error) return;
            TzMessageSuccess(id ? translations.edit_succeeded : translations.add_success_tip);
            if (!checkValue) {
              history.go(-1);
            } else {
              manualFormIns.setFieldsValue({
                cluster: newVal.cluster,
                dstType: newVal.dstType,
                dstId: undefined,
                srcId: undefined,
                protocol: 'TCP',
                portList: undefined,
                enable: newVal.enable,
                srcType: newVal.srcType,
              });
            }
          });
        })
        .catch(() => {
          setLoading(false);
        });
    } else {
      automaticFormIns.validateFields().then((val) => {
        let { rules } = val;
        if (!rules) {
          TzMessageWarning(translations.recommended_cannot_empty + '!');
          return;
        }
        if (rules.some((item: any) => item.srcType === TrafficType.Unknown || item.dstType === TrafficType.Unknown)) {
          TzMessageWarning(translations.not_create_addresses + '!');
          return;
        }
        let newRules: any[] = rules?.map((item: any) => {
          let { dstId, srcId } = item;
          return merge(item, {
            dstId: Array.prototype.isPrototypeOf(dstId) ? dstId.pop() : dstId,
            srcId: Array.prototype.isPrototypeOf(srcId) ? srcId.pop() : srcId,
          });
        });
        let taskID = getUid();
        Store.micrPolicyCreate.next({
          taskID,
          rules,
          callback: (failed_id = []) => {
            batchpolicies({
              taskID: getUid(),
              rules: newRules.filter((item: any) => {
                return failed_id.includes(item._id);
              }),
            }).subscribe((res) => {});
          },
        });
        batchpolicies({ taskID, rules: newRules }).subscribe((res) => {
          if (res.error) return;
          if (!checkValue) {
            history.go(-1);
          } else {
            automaticRef.current?.resetFields();
          }
        });
      });
    }
  });
  const { run } = useDebounceFn(postData, {
    wait: 500,
  });
  let setFooter = useMemoizedFn(() => {
    Store.pageFooter.next(
      <div style={{ width: '100%', textAlign: 'right' }}>
        {!id ? (
          <TzCheckbox
            className={'mr16'}
            checked={checkValue}
            onChange={(e) => {
              setCheckValue(e.target.checked);
            }}
          >
            <span style={{ color: '#3e4653' }}>{translations.continuously_added}</span>
          </TzCheckbox>
        ) : null}

        <TzButton
          className={'mr16'}
          onClick={() => {
            if (0) {
              TzConfirm({
                content: translations.deflectDefense_cancelTip,
                okText: translations.superAdmin_confirm,
                cancelText: translations.breadcrumb_back,
                onOk() {
                  navigate(-1);
                },
              });
            } else {
              navigate(-1);
            }
          }}
        >
          {translations.cancel}
        </TzButton>
        {id ? (
          <TzButton type={'primary'} onClick={run} disabled={loading} loading={loading}>
            {translations.save}
          </TzButton>
        ) : (
          <TzButton type={'primary'} onClick={run}>
            {translations.newAdd}
          </TzButton>
        )}
      </div>,
    );
  });
  useEffect(() => {
    setFooter();
  }, [l, activeKey, checkValue, loading]);
  let getMicrosegPolicyInfo = useMemoizedFn(() => {
    if (!id) {
      return;
    }
    microsegPolicyId({ id }).subscribe((res) => {
      if (res.error) return;
      let item = res.getItem();
      let srcId = [item.srcId];
      let dstId = [item.dstId];
      item['portList'] = !item.portList || item.portList.length == 0 ? undefined : item.portList;
      if (item.srcType === 'Resource' || item.srcType === 'Segment') {
        srcId.unshift(item.srcDetail?.namespace);
      }
      if (item.dstType === 'Resource' || item.dstType === 'Segment') {
        dstId.unshift(item.dstDetail?.namespace);
      }
      manualFormIns.setFieldsValue(merge(item, { dstId, srcId }));
    });
  });
  useEffect(() => {
    getMicrosegPolicyInfo();
  }, [id]);
  useEffect(() => {
    setHeader();
  }, [l, activeKey]);
  return (
    <div className="policy-info mlr32">
      <TzTabs activeKey={activeKey} items={items} tabBarStyle={{ display: 'none' }} />
    </div>
  );
};

export default MicroisolationPolicy;
