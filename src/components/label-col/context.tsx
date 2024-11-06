import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
  forwardRef,
  type PropsWithChildren,
  useImperativeHandle,
} from 'react';
import { useMemoizedFn } from 'ahooks';
import { useLocation, useMatch } from 'react-router-dom';
import { uniqWith, uniq, keys } from 'lodash';
import { Routes } from '../../Routes';
import { Store } from '../../services/StoreService';
import {
  addOrDelLabelFromAsset,
  getCustomLabels,
  superAdminUserList,
  updataClusterNamespaces,
  updataResource,
} from '../../services/DataService';
import { showSuccessMessage } from '../../helpers/response-handlers';
import { TzConfirm } from '../tz-modal';
import { translations, localLang } from '../../translations';
import { TzButton } from '../tz-button';
import { TzSelect, TzSelectNormal, TzSelectNormalProps } from '../tz-select';
import { TzFormItem, TzForm } from '../tz-form';
import { Form } from 'antd';

interface IModalProps {
  options: TzSelectNormalProps['options'];
  isAddLabel: boolean;
  inAll: boolean;
  onChange: any;
}
export const ContentModal = forwardRef((props: IModalProps, ref) => {
  const { options, isAddLabel, onChange, inAll } = props;
  const [selectVal, updateSelectVal] = useState([]);
  const [errMsg, setError] = useState('');

  useImperativeHandle(ref, () => {
    return {
      setError: (val: string) => setError(val),
    };
  }, []);

  const placeholder = isAddLabel
    ? translations.unStandard.select_asset_tag_add_tip
    : translations.unStandard.select_asset_tag_del_tip;
  const onUpdate = useMemoizedFn((val) => {
    onChange(val);
    updateSelectVal(val);
    setError('');
  });

  if (!isAddLabel && !inAll) {
    return <p>{translations.unStandard.is_remove_tag_from_select_assets(options![0]?.label)}</p>;
  }
  const formItemProps: any = errMsg
    ? {
        validateStatus: 'error',
        help: errMsg,
      }
    : undefined;

  return (
    <TzForm>
      <TzFormItem {...formItemProps}>
        <TzSelectNormal
          placeholder={placeholder}
          mode="multiple"
          maxTagCount={2}
          showSearch
          allowClear
          options={options}
          value={selectVal}
          filterOption={(input, option: any) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
          onChange={onUpdate}
        />
      </TzFormItem>
    </TzForm>
  );
});
export interface ISelectedItem {
  objType: string;
  id: string | number;
  labels: any[];
  cluster_key: string;
  namespace: string;
  name: string;
  kind: string;
}
export const ContentConfigHead = forwardRef((props: any, ref) => {
  let [formIns] = Form.useForm();
  let [managersOp, setManagersOp] = useState<any[]>([]);
  useEffect(() => {
    // formIns.setFieldsValue(props);
    superAdminUserList({
      offset: 0,
      limit: 1000,
    }).subscribe((res) => {
      if (res.error) return;
      const items = res.getItems().map((t) => {
        return {
          label: t.account,
          value: t.userName,
        };
      });
      setManagersOp(items);
    });
  }, []);
  useImperativeHandle(ref, () => {
    return {
      formIns: formIns,
    };
  }, []);
  return (
    <TzForm form={formIns}>
      <TzFormItem
        name={'managers'}
        label={translations.clusterGraphList_managers}
        rules={[
          {
            required: true,
            message: translations.superAdmin_loginLdapConfig_selectPlaPrefix + translations.clusterGraphList_managers,
          },
        ]}
      >
        <TzSelect
          mode="multiple"
          maxTagCount={2}
          placeholder={translations.please_select_person_charge}
          filterOption={(input, option: any) => option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0}
          showSearch
          options={managersOp}
        />
      </TzFormItem>
    </TzForm>
  );
});

// 顶部标签
interface IRelAsset {
  ObjType: string;
  Count: number;
  ObjIds: string[];
}
export interface IAssetTopTag {
  id: string;
  type: number; // 0 表示自定义标签
  label: string;
  relateAssets?: IRelAsset[]; // 关联资产
}
export type IUseBatchAction = [
  {
    assetTopTag: IAssetTopTag;
    assetType: string;
    tagRelateAssetIds: string;
    activeBatchBtn: boolean;
    rowSelection: any;
    isInLabelPage: boolean;
    onlyShowSelect: boolean;
    selectedItems: ISelectedItem[];
    // selectRows: any[];
    refreshTable: any;
  },
  {
    setAssetTopTag: (tag: IAssetTopTag) => void;
    setActiveBatchBtn: (...args: any[]) => void;
    setSelectedItems: (...args: any[]) => void;
    setRowKey: (k: string) => void;
    setAssetType: (k: string) => void;
    setOnlyShowSelect: (k: boolean) => void;
    reset: () => void;
    setRefreshTable: (cb: () => void) => void;
    setRefreshCards: (cb: (tagId: string, refreashTable?: boolean) => void) => void;
  },
];

// 全部标签
export const AllAssetTag = {
  label: translations.all_assets,
  value: 'allAssets',
  id: 'allAssets',
  // 自定义标签type
  type: 0,
};
// 新建标签
export const NewAssetTag = {
  label: '',
  value: 'new-label',
  id: '',
  type: 0,
};

function useBatchAction(): IUseBatchAction {
  const assP = useMemo(() => Store?.assetsParams?.getValue?.(), []);
  // 资产类型顶部label
  const [assetTopTag, setAssetTopTag] = useState<IAssetTopTag>(assP.assetTopTag ?? AllAssetTag);
  // 资产类型 objType
  const [assetType, setAssetType] = useState(assP.assetType ?? '');
  // 资产列表项rowKey
  const [rowKey, setRowKey] = useState('');
  // 是否激活批量操作按钮
  const [activeBatchBtn, setActiveBatchBtn] = useState(false);
  // 只显示已选项
  const [onlyShowSelect, setOnlyShowSelect] = useState<boolean>(false);
  const [selectedItems, setSelectedItems] = useState<ISelectedItem[]>([]);
  const l = useLocation();
  // 存储所有已选数据项
  // const selectAssetMap = useRef<Record<string, any[]>>({});

  // 是否在标签管理页面的资产合集中
  const isInLabelPage = !!useMatch(Routes.LabelManagCreate) || !!useMatch(Routes.LabelManagEdit);

  // 资产发现卡片列表刷新
  const refreshCards = useRef<any>(null);
  const setRefreshCards = useMemoizedFn((cb: any) => {
    refreshCards.current = cb;
  });

  // 资产发现列表刷新refresh
  const refreshTable = useRef<any>(null);
  const setRefreshTable = useMemoizedFn((cb: any) => {
    refreshTable.current = cb;
  });

  const inAllTag = assetTopTag.id === AllAssetTag.id;

  // 当前标签下关联的当前资产的id列表
  const tagRelateAssetIds: string = useMemo(() => {
    if (inAllTag) {
      // 全选
      return '';
    }
    // 标签详情页中使用当前选中的数据
    if (isInLabelPage) {
      const _selectIds = selectedItems.filter((_obj) => _obj.objType === assetType).map((_obj) => _obj.id);
      return _selectIds.join(',');
    }
    // 资产发现列表中使用当前标签关联的资产
    const _relates = assetTopTag.relateAssets || [];
    const idx = !_relates.length ? -1 : _relates.findIndex((_item) => _item.ObjType === assetType);
    return idx !== -1 ? (_relates[idx].ObjIds || []).join(',') : '';
  }, [isInLabelPage, assetTopTag, assetType, selectedItems]);

  const selectedRowKeys = useMemo(
    () => selectedItems.filter((item) => item.objType === assetType).map((item) => item.id),
    [selectedItems, assetType],
  );
  const selectedNum = selectedItems.length;

  const handleRowSelection = useMemoizedFn((selected: boolean, selectedRows: any[]) => {
    if (selectedRows && selectedRows.length && [undefined, null].includes(selectedRows[0][rowKey])) {
      throw new Error(`rowKey: ${rowKey} 属性在数据项中不存在`);
    }
    const items = selectedRows.map((_item) => ({
      objType: assetType,
      id: _item[rowKey],
      labels: _item.Tags || _item.tags || [],
      cluster_key: _item.cluster || _item.ClusterKey,
      name: _item.name || _item.Name,
      namespace: _item.namespace,
      kind: _item.kind,
    }));
    const ids = items.map((_item) => _item.id);
    setSelectedItems((preVal: ISelectedItem[]) => {
      let newVal = selected
        ? [...preVal, ...items]
        : preVal.filter((_item) => !(_item.objType === assetType && ids.includes(_item.id)));
      newVal = uniqWith(newVal, (arrVal, othVal) => arrVal.objType === othVal.objType && arrVal.id === othVal.id);
      return newVal;
    });
  });

  const rowSelection = useMemo(() => {
    if (isInLabelPage || activeBatchBtn) {
      return {
        columnWidth: '32px',
        selectedRowKeys,
        onSelect: (record: any, selected: boolean, selectedRows: any, nativeEvent: any) => {
          nativeEvent.stopPropagation();
          handleRowSelection(selected, [record]);
        },
        onSelectAll: (selected: any, selectedRows: any, changeRows: any) => {
          handleRowSelection(selected, changeRows);
        },
      };
    }
    return undefined;
  }, [activeBatchBtn, selectedRowKeys, isInLabelPage]);

  // 页面底部批量操作按钮
  const modalRef = useRef<any>(null);
  const modalHeadRef = useRef<any>(null);

  let showConfigHead = useMemoizedFn(() => {
    assetType;
    TzConfirm({
      title: translations.scanner_images_setting,
      content: <ContentConfigHead ref={modalHeadRef} />,
      width: '560px',
      okText: translations.save,
      cancelText: translations.cancel,
      onOk() {
        return new Promise((resolve, reject) => {
          modalHeadRef.current.formIns
            .validateFields()
            .then((values) => {
              let obj: any = {};
              if (assetType == 'namespace') {
                obj['ns_list'] = selectedItems.map(({ cluster_key, kind, name, namespace }) => ({ cluster_key, name }));
              } else if (assetType == 'resource') {
                obj['resource_list'] = selectedItems.map(({ cluster_key, kind, name, namespace }) => ({
                  cluster_key,
                  kind,
                  name,
                  namespace,
                }));
              }
              let fn = assetType == 'namespace' ? updataClusterNamespaces : updataResource;
              fn({ ...obj, ...values, alias: '', authority: '' }).subscribe((res) => {
                if (res.error) return reject();
                showSuccessMessage(translations.microseg_namespace_operateSuccess);
                refreshTable?.current?.();
                resolve('');
                reset();
              });
            })
            .catch(reject);
        });
      },
    });
  });
  const setFooter = useCallback(() => {
    if (isInLabelPage) return;

    // 内置标签不可移除
    const disableRemoveBtn = !selectedNum || assetTopTag.type !== 0;

    const showLabelModal = async (isAdd: boolean) => {
      const title = isAdd ? translations.add_tag : translations.remove_tag;
      let _options: any = [];
      const response = await getCustomLabels().toPromise();
      const customLabels = (response?.data?.items ?? []).map((s) => ({
        label: s.name,
        value: s.id,
      }));
      let selectLabelIds: any[] = [];
      const onUpdateSelect = (val: any[]) => {
        selectLabelIds = val;
      };

      let refreshTagRelCount = false;
      if (isAdd) {
        _options = customLabels;
      } else if (inAllTag) {
        const selectTagNames = uniq(
          selectedItems.reduce((acc: string[], cur: ISelectedItem) => acc.concat(cur.labels), []),
        );
        // 排除内置标签，添加id属性
        _options = customLabels.filter((_tagItem) => selectTagNames.includes(_tagItem.label));
      } else {
        refreshTagRelCount = true;
        _options = [{ ...assetTopTag, value: assetTopTag.id }];
        selectLabelIds = [assetTopTag.id];
      }

      const onOk = () => {
        return new Promise((resolve, reject) => {
          if (!selectLabelIds.length) {
            const tip = isAdd
              ? translations.unStandard.select_asset_tag_add_tip
              : translations.unStandard.select_asset_tag_del_tip;
            // TzMessageWarning(tip);
            modalRef.current.setError(tip);
            reject(false);
            return;
          }
          const reqArgs: any = {
            action: isAdd ? 'add' : 'delete',
            tagIds: selectLabelIds,
            objs: {
              objType: assetType,
              objIds: selectedItems.map((_item) => String(_item.id)),
            },
          };
          addOrDelLabelFromAsset(reqArgs).subscribe((res) => {
            resolve(true);
            if (res.error) return;
            showSuccessMessage(translations.microseg_namespace_operateSuccess);
            // 从某个标签中移除关联资产
            if (refreshTagRelCount) {
              const newRelateAssets = assetTopTag.relateAssets || [];
              const relAssetInd = newRelateAssets.findIndex((_obj) => _obj.ObjType === assetType);
              let newObjIds = newRelateAssets[relAssetInd].ObjIds;
              newObjIds = newObjIds.filter((_id) => !reqArgs.objs.objIds.includes(_id));
              newRelateAssets[relAssetInd].ObjIds = newObjIds;
              setAssetTopTag({
                ...assetTopTag,
                relateAssets: newRelateAssets,
              });
            }
            // 更新卡片、及卡片对应的table
            refreshCards.current && refreshCards.current(assetTopTag.id, true);
            //   refreshTable?.current?.();
            setActiveBatchBtn(false);
          });
        });
      };

      TzConfirm({
        title,
        content: (
          <ContentModal
            ref={modalRef}
            inAll={inAllTag}
            options={_options}
            isAddLabel={isAdd}
            onChange={onUpdateSelect}
          />
        ),
        width: '520px',
        okText: translations.sure,
        cancelText: translations.cancel,
        onOk,
      });
    };
    Store.pageFooter.next(
      activeBatchBtn ? (
        <div>
          <span className="mr16 ml16">{`${translations.selected} ${selectedNum} ${translations.items}`}</span>
          {'resource' === assetType || 'namespace' === assetType ? (
            <TzButton className={'mr20'} disabled={!selectedNum} onClick={() => showConfigHead()}>
              {translations.scanner_images_setting}
            </TzButton>
          ) : null}
          <TzButton className={'mr20'} disabled={!selectedNum} onClick={() => showLabelModal(true)}>
            {translations.add_tag}
          </TzButton>
          <TzButton className={'mr20'} disabled={disableRemoveBtn} onClick={() => showLabelModal(false)}>
            {translations.remove_tag}
          </TzButton>
        </div>
      ) : null,
    );
  }, [activeBatchBtn, isInLabelPage, selectedItems, assetTopTag, assetType]);
  useEffect(() => setFooter(), [setFooter, l]);

  const reset = useMemoizedFn(() => {
    setActiveBatchBtn(false);
    setSelectedItems([]);
  });

  return [
    {
      assetTopTag,
      tagRelateAssetIds,
      assetType,
      activeBatchBtn,
      rowSelection,
      isInLabelPage,
      selectedItems,
      onlyShowSelect,
      // selectRows: selectAssetMap.current[assetType] || [],
      refreshTable,
    },
    {
      setActiveBatchBtn,
      setSelectedItems,
      setRowKey,
      setAssetType,
      setAssetTopTag,
      setOnlyShowSelect,
      reset,
      setRefreshTable,
      setRefreshCards,
    },
  ];
}

// 批量操作的Context
export const BatchLabelContext = createContext<IUseBatchAction>([] as any);

export function BatchLabelProvider({ children }: PropsWithChildren<any>) {
  const [cfg, dispatch] = useBatchAction();

  return <BatchLabelContext.Provider value={[cfg, dispatch]}>{children}</BatchLabelContext.Provider>;
}

export function useBatchLabelContext(): IUseBatchAction {
  return useContext(BatchLabelContext);
}

// 内置标签名翻译
const BuildInTagTranslate: Record<string, string> = {
  'K8s assets': 'K8s资产',
  'Node assets': '节点资产',
  'App assets': '应用资产',
};
export function translateBuildInTag(tag: string) {
  if (localLang === 'en') return tag;
  return BuildInTagTranslate[tag] || tag;
}
