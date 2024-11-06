import React, { useCallback, useMemo, useRef, useState, useEffect, useLayoutEffect } from 'react';
import { translations } from '../../../../translations';
import { TzForm, TzFormItem } from '../../../../components/tz-form';
import { TzRadioGroup } from '../../../../components/tz-radio';
import { TzInput } from '../../../../components/tz-input';
import Form from 'antd/lib/form';
import './index.scss';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAssetsClusterList, useFromValueChange } from '../../../../helpers/use_fun';
import {
  clusterAssetsNamespaces,
  microsegNamespaces,
  microsegResources,
  microsegSegmentsId,
  postSegments,
  putMicrclusterNamespaceSegmentsById,
} from '../../../../services/DataService';
import { useFullscreen, useMemoizedFn, useSize } from 'ahooks';
import { TzButton } from '../../../../components/tz-button';
import { Store } from '../../../../services/StoreService';
import { showSuccessMessage } from '../../../../helpers/response-handlers';
import { Routes } from '../../../../Routes';
import VisualizeChart from '../../../../screens/Microisolation/component/VisualizeChart';
import { find, groupBy, isUndefined, keys, merge, remove } from 'lodash';
import TzSelect, { filterOption } from '../../../../components/ComponentsLibrary/tzSelect';
import { TzTag } from '../../../../components/tz-tag';
import { TzSelectNormal } from '../../../../components/tz-select';
import { deepClone } from '../../../../helpers/until';
export const innerTrustOp = [
  {
    value: true,
    label: translations.yes,
  },
  {
    value: false,
    label: translations.no,
  },
];
export const strategicPatternOp = [
  {
    value: 'warning',
    label: translations.warningMode,
  },
  {
    value: 'protecting',
    label: translations.protectingMode,
  },
];
const ResourceGroup = (props: any) => {
  const { id } = useParams();
  return <ResourceGroup.Edit id={id} />;
};
ResourceGroup.Detail = (props: any) => {
  return <div className="mlr32"></div>;
};
ResourceGroup.Edit = (props: any) => {
  let { id } = props;
  let [namespaceOp, setNamespaceOp] = useState<any>([]);
  const [resourcesList, setResourcesList] = useState<any[]>([]);
  let [chartHierarchy, setChartHierarchy] = useState<any>();
  let [linkData, setLinkData] = useState<any>([]);

  const [formInstance] = Form.useForm();
  let clusters = useAssetsClusterList();
  const ref = useRef(null);
  const size = useSize(ref);
  const chartRef = useRef<any>();
  const valueChange = useRef(false);
  const [isFullscreen, { toggleFullscreen }] = useFullscreen(ref);
  let cluster = Form.useWatch('cluster', formInstance);
  let namespace = Form.useWatch('namespace', formInstance);
  let name = Form.useWatch('name', formInstance);
  let resources = Form.useWatch('resources', formInstance);
  useEffect(() => {
    if (!cluster) return;
    microsegNamespaces({ cluster: cluster }).subscribe((res) => {
      let nsList = res
        .getItems()
        .sort((a, b) => b?.resourceNumber - a?.resourceNumber)
        .map((ite) => {
          return {
            value: ite.Name || ite.name,
            label: ite.Name || ite.name,
            //   disabled: ite?.hasResource,

            disabled: ite?.resourceNumber == 0,
          };
        });
      setNamespaceOp(nsList);
    });
  }, [cluster]);
  useEffect(() => {
    if (!namespace || !cluster) return;
    microsegResources({ namespace, cluster }).subscribe((res) => {
      if (res.error) return;
      let items = res.getItems().map((item) => ({
        ...item,
        type: 'node',
        originalSegmentName: item.segmentName,
        originalSegmentID: item.segmentID,
        label: `${item.name}(${item.kind})`,
        value: item.id,
        children: (
          <span className="flex-r-c" style={{ justifyContent: 'flex-start' }}>
            {item.name}({item.kind})
            {item.segmentName && item.segmentID != 0 ? (
              <TzTag className="small ant-tag-gray ml4">
                {translations.microseg_segments_segment_title}：{item.segmentName}
              </TzTag>
            ) : null}
          </span>
        ),
      }));
      setResourcesList(items);
    });
  }, [namespace, cluster]);

  const navigate = useNavigate();
  let postData = useMemoizedFn(() => {
    formInstance.validateFields().then((value) => {
      let { id } = value;
      let fn = id ? putMicrclusterNamespaceSegmentsById : postSegments;
      fn(value).subscribe((res) => {
        if (res.error) return;
        showSuccessMessage(!id ? '新增资源组成功' : '编辑资源组成功');
        navigate(Routes.MicroisolationObjectManagement);
      });
    });
  });
  let { valueChangeFn } = useFromValueChange();
  let setFooter = useMemoizedFn(() => {
    Store.pageFooter.next(
      <div className={'flex-r-c'} style={{ justifyContent: 'flex-end', height: '100%', width: '100%' }}>
        <TzButton
          className={'mr20'}
          onClick={() => {
            valueChangeFn(valueChange.current);
          }}
        >
          {translations.confirm_modal_cancel}
        </TzButton>
        <TzButton type={'primary'} onClick={postData}>
          {id ? translations.save : translations.activeDefense_add}
        </TzButton>
      </div>,
    );
  });
  let l = useLocation();
  useEffect(() => {
    setFooter();
  }, [l, id]);
  useEffect(() => {
    if (id) {
      microsegSegmentsId({ segmentId: id }).subscribe((res) => {
        let item = res.getItem();
        formInstance.setFieldsValue(item);
      });
    }
  }, [id]);
  let initChartData = useMemoizedFn((items: any[], key: string, name: string) => {
    let itemsKeyObj = groupBy(items, (item) => `${item[key]}`);
    let unGroup = itemsKeyObj?.['0'] || [];
    let arr = keys(itemsKeyObj)
      .filter((keyObj: any) => keyObj != '0')
      .map((item) => {
        let node = itemsKeyObj[item][0];
        return {
          name: node[name],
          id: item,
          type: 'group',
          isAct: item == id || 'new_segment' == item,
          children: itemsKeyObj[item],
        };
      });
    let obj = {
      name: 'environment',
      id: 'root',
      children: [...unGroup, ...arr],
    };
    return obj;
  });
  let calculateChartData = useMemoizedFn(() => {
    let arr = [...resourcesList].map((item) => {
      item['value'] = 1;
      if (resources?.includes(item.id)) {
        return merge({}, item, { segmentName: name, segmentID: id || 'new_segment' });
      } else {
        return merge({}, item, {
          segmentName: item.originalSegmentName == id ? '' : item.originalSegmentName,
          segmentID: item.originalSegmentID == id ? 0 : item.originalSegmentID,
        });
      }
    });
    let nodes = arr.filter((item) => {
      return linkData?.includes(item.id);
    });
    let newArr = nodes.map((item) => {
      return merge({}, item, {
        segmentName: item.originalSegmentName,
        segmentID: item.originalSegmentID,
        id: item.id + '_old',
      });
    });
    let data = initChartData([...arr, ...newArr], 'segmentID', 'segmentName');
    setChartHierarchy(data);
    setTimeout(() => {
      chartRef.current?.setActivateNode(id || 'new_segment');
    }, 0);
  });
  useLayoutEffect(() => {
    calculateChartData();
  }, [resourcesList, resources, name, id]);

  let resourcesSegmentID = useMemo(() => {
    return resourcesList.reduce((pre, item) => {
      pre[item.id] = item.segmentID;
      return pre;
    }, {});
  }, [resourcesList]);

  return (
    <div className="mlr32">
      <div className="flex-r-c" style={{ alignItems: 'flex-start' }}>
        <div style={{ width: '50%', marginTop: '4px' }}>
          <TzForm
            form={formInstance}
            wrapperCol={{ span: 24 }}
            onValuesChange={(value) => {
              valueChange.current = true;
            }}
          >
            <TzFormItem name="id" hidden>
              <TzInput />
            </TzFormItem>
            <TzFormItem
              label={translations.compliances_policyDetails_name}
              name="name"
              rules={[
                {
                  required: true,
                  message: translations.unStandard.notEmptyTip(translations.compliances_policyDetails_name),
                },
                {
                  pattern: /^[\u4e00-\u9fa5\w\-]+$/,
                  message: translations.unStandard.label_name_illegal,
                },
              ]}
            >
              <TzInput
                placeholder={translations.unStandard.requireTip(translations.compliances_policyDetails_name)}
                maxLength={50}
              />
            </TzFormItem>
            <TzFormItem label={translations.internal_mutual_trust} name="innerTrust" initialValue={true}>
              <TzRadioGroup options={innerTrustOp} />
            </TzFormItem>
            <TzFormItem label={translations.microseg_namespace_strategyMode} name="mode" initialValue={'warning'}>
              <TzRadioGroup options={strategicPatternOp} />
            </TzFormItem>
            <TzFormItem
              label={translations.clusterManage_key}
              name="cluster"
              rules={[
                {
                  required: true,
                  message: `${translations.unStandard.notEmptyTip(translations.clusterManage_key)}`,
                },
              ]}
            >
              <TzSelect
                disabled={id}
                showSearch
                filterOption={filterOption}
                options={clusters}
                onChange={() => {
                  formInstance.setFieldsValue({ namespace: undefined });
                }}
                placeholder={translations.activeDefense_clusterPla}
              />
            </TzFormItem>
            <TzFormItem
              label={translations.onlineVulnerability_outerShapeMeaning}
              name="namespace"
              rules={[
                {
                  required: true,
                  message: translations.unStandard.notEmptyTip(translations.onlineVulnerability_outerShapeMeaning),
                },
              ]}
            >
              <TzSelect
                onChange={(val) => {
                  formInstance.setFieldsValue({ resources: undefined });
                }}
                showSearch
                disabled={id}
                filterOption={filterOption}
                options={namespaceOp}
                placeholder={translations.unStandard.requireSelectTip(
                  translations.onlineVulnerability_outerShapeMeaning,
                )}
              />
            </TzFormItem>
            <TzFormItem
              label={translations.resources_in_group}
              name="resources"
              rules={[
                {
                  required: true,
                  message: `${translations.unStandard.notEmptyTip(translations.resources_in_group)}`,
                },
              ]}
            >
              <TzSelectNormal
                options={resourcesList}
                maxTagCount={3}
                onDeselect={(val) => {
                  setLinkData((pre) => {
                    if (resourcesSegmentID[val] != id && resourcesSegmentID[val] != 0) {
                      remove(pre, (it) => it == val);
                    }
                    return [...pre];
                  });
                }}
                onSelect={(val, option) => {
                  setLinkData((pre) => {
                    if (resourcesSegmentID[val] != id && resourcesSegmentID[val] != 0) {
                      return [...pre, val];
                    } else {
                      return [...pre];
                    }
                  });
                }}
                mode="multiple"
                filterOption={(input, option: any) => option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                showSearch
                placeholder={translations.unStandard.requireSelectTip(translations.resources_in_group)}
              />
            </TzFormItem>
          </TzForm>
        </div>
        {namespace ? (
          <div
            style={{
              width: 0,
              flex: 1,
              background: 'rgb(244,249,255)',
              border: '1px solid #F4F6FA',
              height: `${(size?.width || 900) * 0.9}px`,
              position: 'relative',
            }}
            className="ml24 br8hidden"
            ref={ref}
          >
            <div
              className="flex-r-c p-a"
              style={{
                justifyContent: 'space-between',
                width: '100%',
                padding: '16px 16px 0px 20px',
              }}
            >
              <div style={{ color: '#3E4653' }} className="fw500">
                {translations.group_overview}
              </div>
              <i
                onClick={toggleFullscreen}
                style={{ color: '#B3BAC6' }}
                className={`icon iconfont hover-icon f16 ${isFullscreen ? 'icon-quxiaoquanping' : 'icon-quanping'}`}
              ></i>
            </div>
            <VisualizeChart
              width={size?.width || 900}
              height={(size?.width || 900) * 0.9}
              data={chartHierarchy}
              linkData={linkData.map((item: any) => item + '_old')}
              ref={chartRef}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
};
export default ResourceGroup;
