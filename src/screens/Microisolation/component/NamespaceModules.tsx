import React, { useCallback, useMemo, useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { translations } from '../../../translations';
import { TzCascader } from '../../../components/ComponentsLibrary';
import {
  clusterAssetsNamespaces,
  deleteNsgrps,
  deleteSegments,
  microsegNamespacesCount,
  microsegNsgrps,
  microsegSegments,
  nsgrpsInnertrust,
  postNsgrps,
  postSegments,
  resourcesCount,
  segmentsInnertrust,
} from '../../../services/DataService';
import { useAssetsClusterList } from '../../../helpers/use_fun';
import { TzCascaderOptionProps } from '../../../components/ComponentsLibrary/TzCascader/interface';
import { filter } from '../../ComplianceWhole/ScanManagement';
import { CaretDownOutlined } from '@ant-design/icons';
import TzInputSearch from '../../../components/tz-input-search';
import { TzCheckbox, TzCheckboxGroup } from '../../../components/tz-checkbox';
import { useBoolean, useMemoizedFn, useSetState, useUpdateEffect } from 'ahooks';
import { TzConfirm, TzConfirmDelete } from '../../../components/tz-modal';
import Form from 'antd/lib/form';
import { TzForm, TzFormItem } from '../../../components/tz-form';
import { TzInput } from '../../../components/tz-input';
import { TzRadioGroup } from '../../../components/tz-radio';
import { TzSelect } from '../../../components/tz-select';
import { TzButton } from '../../../components/tz-button';
import EllipsisPopover from '../../../components/ellipsisPopover/ellipsisPopover';
import { find, trim } from 'lodash';
import { showSuccessMessage } from '../../../helpers/response-handlers';
import { resourceGroupRadioOp } from './BaseInfo';
import { RenderTag, TzTag } from '../../../components/tz-tag';
let TzFormDomm = (props: any) => {
  const { formInstance, type } = props;
  let clusterList = useAssetsClusterList();
  let [namespaceOp, setNamespaceOp] = useState<any>([]);
  let cluster = Form.useWatch('cluster', formInstance);
  useEffect(() => {
    if (!cluster) return;
    formInstance.setFieldsValue({ namespace: undefined });
    clusterAssetsNamespaces({ clusterID: cluster }).subscribe((res) => {
      let nsList = res.getItems().map((ite) => {
        return {
          value: ite.Name,
          label: ite.Name,
        };
      });
      setNamespaceOp(nsList);
    });
    return () => {
      formInstance.resetFields();
    };
  }, [cluster]);
  return (
    <TzForm
      form={formInstance}
      initialValues={{
        timestamp: new Date().getTime(),
      }}
    >
      <TzFormItem
        name={'cluster'}
        label={translations.clusterManage_key}
        rules={[
          {
            required: true,
            message: translations.unStandard.notEmptyTip(translations.clusterManage_key),
          },
        ]}
      >
        <TzSelect
          showSearch
          filterOption={(input, option) => {
            return (option?.label as string).toLowerCase()?.indexOf(input.toLowerCase()) >= 0;
          }}
          options={clusterList}
          placeholder={translations.unStandard.requireSelectTip(translations.clusterManage_key)}
        />
      </TzFormItem>
      {type === 'resourceGroup' ? (
        <TzFormItem
          name={'namespace'}
          label={translations.onlineVulnerability_outerShapeMeaning}
          rules={[
            {
              required: true,
              message: translations.unStandard.notEmptyTip(translations.onlineVulnerability_outerShapeMeaning),
            },
          ]}
        >
          <TzSelect
            showSearch
            filterOption={(input, option) => {
              return (option?.label as string).toLowerCase()?.indexOf(input.toLowerCase()) >= 0;
            }}
            options={namespaceOp}
            placeholder={translations.unStandard.requireSelectTip(translations.onlineVulnerability_outerShapeMeaning)}
          />
        </TzFormItem>
      ) : null}
      <TzFormItem
        name={'name'}
        label={translations.compliances_policyDetails_name}
        rules={[
          {
            required: true,
            whitespace: true,
            message: translations.unStandard.notEmptyTip(translations.compliances_policyDetails_name),
          },
          {
            whitespace: true,
            validator: (val, value) => {
              return new Promise(function (resolve, reject) {
                let fn = type === 'resourceGroup' ? microsegSegments : microsegNsgrps;
                fn().subscribe((res) => {
                  if (res.error) return;
                  let items = res.getItems().map((item) => item.name);
                  if (items.includes(trim(value))) {
                    return reject(
                      type === 'resourceGroup'
                        ? translations.microseg_segments_segment_name_equal_tip
                        : translations.namespace_group_name_duplicated,
                    );
                  } else {
                    resolve(3);
                  }
                });
              });
            },
          },
        ]}
      >
        <TzInput
          placeholder={translations.unStandard.requireTip(translations.compliances_policyDetails_name)}
          maxLength={50}
        />
      </TzFormItem>
      <TzFormItem label={translations.whether_mutual_trust} name={'innerTrust'} initialValue={true}>
        <TzRadioGroup options={resourceGroupRadioOp} />
      </TzFormItem>
    </TzForm>
  );
};
interface groupList {
  name: string;
  id: number;
  innerTrust: boolean;
  resourceNumber?: number;
  namespaceNumber?: number;
  cluster: string;
  namespace?: string;
}
interface NamespaceModulesProps {
  type: 'namespaceGroup' | 'resourceGroup';
  onGroupChange: (arg: any) => void;
  onChangeClusterNS: (arg: any) => void;
  changeGroupInfo: (arg: any) => void;
  onChange: () => void;
}
const NamespaceModules = (props: NamespaceModulesProps, ref: any) => {
  let { onGroupChange, onChangeClusterNS, type, changeGroupInfo, onChange } = props;
  let [actGroupId, setActGroupId] = useState<any>('all');
  let [groupInfo, setGroupInfo] = useState<any>();
  const [resourceList, setOptions] = useState<TzCascaderOptionProps[]>([]);
  const [name, setSearch] = useState('');
  const [value, setValue] = useState<any>();
  const [indeterminate, setIndeterminate] = useState(false);
  const [checkboxList, setCheckedList] = useState<number[]>([]);
  const [checkAll, setCheckAll] = useState(false);
  const [groupList, setGroupList] = useState<groupList[]>([]);
  let clusters = useAssetsClusterList();
  useEffect(() => {
    if (type === 'resourceGroup') {
      clusters.length &&
        Promise.all(
          clusters.map((item: any) => {
            return new Promise((resolve) => {
              clusterAssetsNamespaces({ clusterID: item.value }).subscribe((res) => {
                let nsList = res.getItems().map((ite) => {
                  return {
                    value: ite.Name,
                    label: ite.Name,
                    namespace: ite.Name,
                    clusterID: ite.ClusterKey,
                    isLeaf: true,
                  };
                });
                item['children'] = nsList;
                item['isLeaf'] = !nsList.length;
                resolve(nsList);
              });
            });
          }),
        ).then((res) => {
          setOptions([...clusters]);
        });
    } else {
      setOptions(clusters);
    }
  }, [clusters]);
  const onCheckAllChange = useMemoizedFn((e) => {
    setCheckedList(e.target.checked ? groupList?.map((item) => item.id) : []);
    setIndeterminate(false);
    setCheckAll(e.target.checked);
  });
  const onChangeCheckbox = useMemoizedFn((list) => {
    setCheckedList(list);
    setIndeterminate(!!list.length && list.length < groupList.length);
    setCheckAll(list.length === groupList.length);
  });
  let delNamespaceGroup = useCallback((ids, name: any) => {
    TzConfirmDelete({
      content: translations.unStandard.deletion_policy,
      onOk: () => {
        return new Promise((resolve, reject) => {
          let fn = type === 'resourceGroup' ? deleteSegments : deleteNsgrps;
          fn({ ids }).subscribe((res) => {
            if (res.error) {
              reject();
              return;
            }
            getmicrclusterNamespaceSegments();
            showSuccessMessage('删除成功！');
            setCheckedList([]);
            setIndeterminate(false);
            setCheckAll(false);
            resolve(res);
          });
        });
      },
    });
  }, []);
  const [formInstance] = Form.useForm();
  let addNamespaceGroup = useCallback((type) => {
    TzConfirm({
      title: type === 'resourceGroup' ? translations.new_resource_groups : translations.new_namespace_groups,
      okText: translations.newAdd,
      width: 560,
      content: <TzFormDomm formInstance={formInstance} type={type} />,
      cancelText: translations.cancel,
      onOk() {
        return new Promise((resolve, reject) => {
          formInstance?.validateFields().then((value: any) => {
            let fn = type === 'resourceGroup' ? postSegments : postNsgrps;
            fn(value).subscribe((res: any) => {
              if (res.error) {
                reject();
                return;
              }
              resolve(res);
              refresh();
            });
          }, reject);
        });
      },
      onCancel() {
        formInstance.resetFields();
      },
    });
  }, []);
  let getResourcesCount = useMemoizedFn(() => {
    let [cluster, namespace] = value || [];
    let fn = type === 'resourceGroup' ? resourcesCount : microsegNamespacesCount;
    fn({ cluster, namespace }).subscribe((res) => {
      if (res.error) return;
      let item = res.getItem();
      setGroupInfo(item);
    });
  });
  let getmicrclusterNamespaceSegments = useMemoizedFn(() => {
    let [cluster, namespace = undefined] = value || [];
    let fn = type === 'resourceGroup' ? microsegSegments : microsegNsgrps;
    fn({ cluster, namespace, name }).subscribe((res) => {
      if (res.error) return;
      let items = res.getItems();
      setGroupList(items);
    });
  });
  useEffect(() => {
    getmicrclusterNamespaceSegments();
  }, [value, name]);
  let refresh = useMemoizedFn(() => {
    getmicrclusterNamespaceSegments();
    getResourcesCount();
  });
  useEffect(() => {
    onChangeClusterNS(value);
    getResourcesCount();
  }, [value]);
  const [state, { toggle }] = useBoolean(false);
  let changeGroupId = useMemoizedFn((val) => {
    onGroupChange(val);
    setActGroupId(val);
  });
  let setSegmentsInnertrust = useMemoizedFn((data) => {
    let fn = type === 'resourceGroup' ? segmentsInnertrust : nsgrpsInnertrust;
    fn(data).subscribe((res) => {
      if (res.error) return;
      getmicrclusterNamespaceSegments();
      showSuccessMessage(translations.scanner_images_addSuccess);
      setCheckedList([]);
      setIndeterminate(false);
      setCheckAll(false);
      onChange();
    });
  });
  useImperativeHandle(ref, () => {
    return { refresh };
  }, []);
  return (
    <div
      className="namespace-modules"
      style={{
        position: 'relative',
      }}
    >
      <span className="title mt4">
        {type === 'resourceGroup' ? translations.scanner_detail_namespace : translations.clusterManage_key}：
      </span>
      <TzCascader
        value={value}
        onChange={setValue}
        className="mb10"
        placeholder={translations.originalWarning_pleaseSelect}
        options={resourceList}
        showSearch={{ filter }}
      />
      <div style={{ borderTop: '1px solid #F4F6FA' }}>
        <div
          className={`namespace-m-item namespace-group mt8 ${actGroupId === 'all' ? 'act-group' : ''}`}
          onClick={() => {
            changeGroupId('all');
          }}
        >
          {`${translations.scanner_images_all}（${groupInfo?.TotalNumber || 0}）`}
        </div>
        <div
          className={`namespace-m-item namespace-group mt8 ${actGroupId === 'wfz' ? 'act-group' : ''}`}
          onClick={() => {
            changeGroupId('wfz');
          }}
        >
          {`${translations.not_grouped} (${groupInfo?.TotalUnSegmentNumber || 0})`}
        </div>
        <div className="namespace-m-item flex-r-c">
          <span onClick={toggle} style={{ flex: 1 }}>
            <CaretDownOutlined className="mr4" style={{ transform: state ? 'rotate(-90deg)' : 'rotate(0deg)' }} />
            {type === 'resourceGroup'
              ? translations.microseg_segments_segment_title
              : translations.microseg_namespace_sidetitle}
          </span>
          <i
            className="icon iconfont icon-tianjia f16 cursor-p"
            onClick={() => {
              addNamespaceGroup(type);
            }}
          ></i>
        </div>
        <div
          style={{
            height: state ? '0px' : 'auto',
            overflow: state ? 'hidden' : 'initial',
            transition: 'all 0.3s ease 0s',
          }}
        >
          <TzInputSearch
            style={{ width: '100%', minWidth: 'initial', background: '#fff' }}
            placeholder={translations.search_content}
            onChange={(value: any) => setSearch(value)}
          />
          <div className="flex-r-c namespace-m-item">
            <TzCheckbox indeterminate={indeterminate} onChange={onCheckAllChange} checked={checkAll}>
              {translations.onlineVulnerability_filters_selectAll}
            </TzCheckbox>
            {checkboxList.length ? (
              <span
                style={{ color: '#B3BAC6' }}
                className="f12"
              >{`${translations.selected}${checkboxList.length}${translations.items}`}</span>
            ) : null}
          </div>
          <div
            style={{
              maxHeight: `calc(100vh - ${checkboxList.length ? 640 : 490}px)`,
              marginLeft: '-8px',
              overflow: 'hidden',
              overflowY: 'auto',
            }}
          >
            <TzCheckboxGroup onChange={onChangeCheckbox} value={checkboxList} style={{ width: '100%' }}>
              {groupList?.map((item) => {
                let { id, name, innerTrust, resourceNumber, namespaceNumber } = item;
                let node = find(resourceGroupRadioOp, (item) => item.value === innerTrust);
                return (
                  <div
                    className={`namespace-group namespace-m-item flex-r-c ${actGroupId === id ? 'act-group' : ''}`}
                    style={{ margin: 0, marginBottom: '4px' }}
                    key={id}
                    onClick={() => {
                      let arr = [item.cluster];
                      if (type === 'resourceGroup' && item['namespace']) {
                        arr.push(item.namespace);
                      }
                      changeGroupId(id);
                      changeGroupInfo(item);
                    }}
                  >
                    <div className="flex-r-c" style={{ justifyContent: 'flex-start', overflow: 'hidden' }}>
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <TzCheckbox value={id} className="mr8"></TzCheckbox>
                      </span>
                      {node?.value ? <RenderTag type={'allow'} className="small" title={'互信'} /> : null}
                      <span
                        style={{ display: 'inline-block', maxWidth: innerTrust ? '50%' : '70%', overflow: 'hidden' }}
                      >
                        <EllipsisPopover>{name}</EllipsisPopover>
                      </span>
                      &nbsp;&nbsp;({resourceNumber || namespaceNumber || 0})
                    </div>
                    <i
                      className="icon iconfont icon-lajitong cursor-p"
                      onClick={(e) => {
                        e.stopPropagation();
                        delNamespaceGroup(item.id, item.name);
                      }}
                    />
                  </div>
                );
              })}
            </TzCheckboxGroup>
          </div>
        </div>
      </div>

      {checkboxList.length ? (
        <div
          className="flex-c-c mt16"
          style={{ paddingTop: '16px', borderTop: '1px solid #F4F6FA', bottom: '0', width: '100%' }}
        >
          {resourceGroupRadioOp.map((item) => {
            return (
              <TzButton
                style={{ width: '100%' }}
                className="mb8"
                onClick={() => {
                  let obj: any = { segmentIDs: checkboxList, innerTrust: item.value };
                  if (type === 'namespaceGroup') {
                    obj['nsgroupIDs'] = checkboxList;
                    delete obj.segmentIDs;
                  }
                  setSegmentsInnertrust(obj);
                }}
              >
                {item.labelGroup}
              </TzButton>
            );
          })}
          <TzButton
            style={{ width: '100%' }}
            danger
            onClick={() => {
              delNamespaceGroup(
                checkboxList.join(','),
                groupList
                  .filter((item) => checkboxList.includes(item.id))
                  .map((item) => item.name)
                  .join('，'),
              );
            }}
          >
            {translations.delete}
          </TzButton>
        </div>
      ) : null}
    </div>
  );
};
export default forwardRef(NamespaceModules);
