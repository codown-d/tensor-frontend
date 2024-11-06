import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate, useMatch, useLocation } from 'react-router-dom';
import { useActivate } from 'react-activation';
import { Form } from 'antd';
import { useMemoizedFn } from 'ahooks';
import { Routes } from '../../../Routes';
import { Store } from '../../../services/StoreService';
import { translations } from '../../../translations';
import { TzInputTextArea } from '../../../components/tz-input-textarea';
import { TzCard } from '../../../components/tz-card';
import { TzForm, TzFormItem } from '../../../components/tz-form';
import { TzInput } from '../../../components/tz-input';
import { TzCheckbox } from '../../../components/tz-checkbox';
import { TzButton } from '../../../components/tz-button';
import { TzMenu } from '../../../components/tz-menu';
import { useAssetsModule } from '../../../components/AssetModule/GraphListNavi';
import { BatchLabelProvider, useBatchLabelContext, ISelectedItem, NewAssetTag } from '../../../components/label-col';
import { getAssetsLabelInfo, saveAssetsLabelInfo } from '../../../services/DataService';
import { TzMessageSuccess, TzMessageWarning } from '../../../components/tz-mesage';
import { useNavigatereFresh } from '../../../helpers/useNavigatereFresh';
import NoData from '../../../components/noData/noData';
import './index.scss';
import { flushSync } from 'react-dom';

const styles = {
  p1: {
    margin: '0 9px 0 12px',
    fontSize: '12px',
    fontFamily: 'Inter, Inter',
    fontWeight: 400,
    color: '#B3BAC6',
  },
  p2: {
    color: '#3E4653',
    fontWeight: 400,
  },
};

const SideItemLabel = (props: { label: string; num?: number }) => {
  const { label, num } = props;
  return (
    <div className="flex-r" style={{ alignItems: 'center' }}>
      {label}
      {num && <span className="blue-bell">{num}</span>}
    </div>
  );
};

interface IForm {
  name: string;
  note: string;
}

interface IRelCount {
  ObjType: string;
  Count: number;
  ObjIds: string[];
}

// 新增或编辑页面
function CreateOrEditLabel() {
  const navigate = useNavigate();
  const { jump } = useNavigatereFresh();
  const [formIns] = Form.useForm();
  // url query
  const labelId = useSearchParams()[0].get('id') || '';
  const isCreatePage = !!useMatch(Routes.LabelManagCreate);

  // 批量操作context
  const [
    { selectedItems, onlyShowSelect },
    { setRowKey, setAssetType, setOnlyShowSelect, setSelectedItems, setAssetTopTag },
  ] = useBatchLabelContext();

  // 编辑模式下获取接口数据
  useEffect(() => {
    if (!isCreatePage) {
      getAssetsLabelInfo(labelId).subscribe((res) => {
        if (res.error) return;
        const { Tag, RelCounts } = res.getItem();
        const relAssets: IRelCount[] = (RelCounts || []).filter((_item: IRelCount) => _item.Count > 0);
        setAssetTopTag({
          id: Tag.id,
          label: Tag.name,
          type: Tag.type,
          relateAssets: relAssets,
        });
        if (relAssets.length) {
          const selectedAssets = relAssets.reduce((acc: any[], _item: IRelCount) => {
            return acc.concat(_item.ObjIds.map((_id) => ({ id: tryToNumber(_id), objType: _item.ObjType })));
          }, []);
          setSelectedItems(selectedAssets);
        }
        formIns.setFieldsValue({ name: Tag.name, note: Tag.desc });
      });
    } else {
      setAssetTopTag(NewAssetTag);
    }
  }, []);

  // 已选中的数量统计
  const selectedCount = useMemo(() => {
    const countMap: Record<string, number> = {};
    selectedItems.forEach((item: ISelectedItem) => {
      countMap[item.objType] ? countMap[item.objType]++ : (countMap[item.objType] = 1);
    });
    return countMap;
  }, [selectedItems]);

  // 侧边栏资产列表
  const { moduleList: assetMap } = useAssetsModule();
  const assetSets = useMemo(() => {
    const keys = Object.getOwnPropertyNames(assetMap).filter((k) => {
      if (onlyShowSelect) {
        return k !== 'label' && selectedCount[assetMap[k].assetType] > 0;
      }
      return k !== 'label';
    });
    return keys.map((k) => {
      const asseetItem = assetMap[k];
      return {
        key: k,
        label: <SideItemLabel label={asseetItem.txt} num={selectedCount[asseetItem.assetType]} />,
      };
    });
  }, [assetMap, selectedCount, onlyShowSelect]);

  const [activeAssetSide, setAssetSide] = useState(assetSets[0]?.key || 'cluster');
  useEffect(() => {
    if (assetSets.findIndex((_item) => _item.key === activeAssetSide) === -1) {
      assetSets[0]?.key && onClickSide(assetSets[0].key);
    }
  }, [onlyShowSelect]);

  const selectedNum = selectedItems.length;

  const onClickSide = useCallback(
    (k: string) => {
      setRowKey(assetMap[k]?.serveId);
      setAssetType(assetMap[k]?.assetType);
      setAssetSide(k as string);
    },
    [assetMap],
  );

  useEffect(() => onClickSide(activeAssetSide), []);

  const RightContent = useMemo(() => {
    return assetMap[activeAssetSide].children;
  }, [activeAssetSide]);

  // 资产集合侧边栏
  const TitleNode = (
    <div className="flex-r-c" style={{ justifyContent: 'flex-start' }}>
      <span>{translations.asset_collection}</span>
      <span style={styles.p1}>{translations.unStandard.selected_num_assets(selectedNum || 0)}</span>
      <TzCheckbox style={styles.p2} checked={onlyShowSelect} onChange={() => setOnlyShowSelect(!onlyShowSelect)}>
        {translations.unStandard.only_see_selected_asset}
      </TzCheckbox>
    </div>
  );

  // 创建或保存
  const onSave = useMemoizedFn(async () => {
    try {
      const formVal = await formIns.validateFields();
      // const formVal = formIns.getFieldsValue();
      if (formVal.name === translations.all_assets) {
        TzMessageWarning(translations.unStandard.not_allow_all_asset_name);
        return;
      }
      const tag = {
        name: formVal.name,
        desc: formVal.note,
      };
      const relsMap: Record<string, string[]> = {};
      selectedItems.forEach((item: ISelectedItem) => {
        relsMap[item.objType] ? relsMap[item.objType].push(`${item.id}`) : (relsMap[item.objType] = [`${item.id}`]);
      });
      const rels: any = Object.keys(relsMap).map((k) => ({ objType: k, objIds: relsMap[k] }));
      const req: any = { tag, rels };
      if (!isCreatePage) {
        req.tag.id = labelId;
      }
      saveAssetsLabelInfo(req).subscribe((res) => {
        if (res.error) return;
        const msg = isCreatePage ? translations.add_success_tip : translations.saveSuccess;
        TzMessageSuccess(msg);
        navigate(-1);
        flushSync(() => {
          navigate(Routes.LabelManag, {
            replace: true,
            state: { keepAlive: true },
          });
        });

        // setTimeout(() => {
        //   jump(Routes.LabelManag, isCreatePage ? 'LabelManag' : '');
        // });
      });
    } catch (_) {}
  });

  const l = useLocation();
  // 设置header
  const headerTitle = isCreatePage ? translations.create_tag : translations.edit_tag;
  useEffect(() => {
    Store.header.next({ title: headerTitle });
  }, [headerTitle, l]);

  // 设置Footer
  const setFooter = useMemoizedFn(() => {
    Store.pageFooter.next(
      <div className="flex-r-c" style={{ justifyContent: 'flex-end', width: '100%' }}>
        <TzButton className={'mr20'} onClick={() => navigate(-1)}>
          {translations.cancel}
        </TzButton>
        <TzButton className={'mr20'} onClick={onSave}>
          {isCreatePage ? translations.newAdd : translations.save}
        </TzButton>
      </div>,
    );
  });
  useEffect(() => setFooter(), [l]);
  useActivate(setFooter);

  return (
    <div className="mlr32 mt4">
      <TzCard
        className="t-bottom12"
        title={translations.activeDefense_baseInfo}
        style={{ marginTop: '12px' }}
        bordered
        bodyStyle={{ paddingTop: '0px' }}
        id="baseinfo"
      >
        <TzForm form={formIns}>
          <TzFormItem
            style={{ width: '564px' }}
            name="name"
            label={translations.tag_name}
            rules={[
              {
                required: true,
                whitespace: true,
                message: translations.unStandard.inputMaxLenTip(translations.tag_name, 15),
              },
              {
                pattern: /^[\u4e00-\u9fa5\w\-]+$/,
                message: translations.unStandard.label_name_illegal,
              },
              () => ({
                validator(_, value) {
                  if (value === translations.all_assets) {
                    return Promise.reject(translations.unStandard.not_allow_all_asset_name);
                  }
                  return Promise.resolve();
                },
              }),
              {
                type: 'string',
                max: 15,
                message: translations.unStandard.max_length_tip(15),
              },
            ]}
          >
            <TzInput placeholder={translations.unStandard.input_tag_name_tip} maxLength={15} />
          </TzFormItem>
          <TzFormItem
            name="note"
            label={translations.tag_note}
            style={{ marginBottom: 0 }}
            rules={[
              {
                type: 'string',
                max: 100,
                message: translations.unStandard.max_length_tip(100),
              },
            ]}
          >
            <TzInputTextArea maxLength={100} rows={4} placeholder={translations.unStandard.input_tag_note_tip} />
          </TzFormItem>
        </TzForm>
      </TzCard>
      <TzCard
        className="t-bottom12"
        title={TitleNode}
        style={{ marginTop: '20px' }}
        bordered
        bodyStyle={{ paddingTop: '0px' }}
        id="assets"
      >
        {assetSets.length ? (
          <div className="content_asset_set">
            <div className="cover_k1"></div>
            <TzMenu
              className="content_asset_left menu-side noScrollbar"
              inlineCollapsed={false}
              mode="inline"
              inlineIndent={14}
              items={assetSets}
              selectedKeys={[activeAssetSide]}
              onSelect={(e: any) => onClickSide(e.key)}
            />
            <div className="cover_k2"></div>
            <div className="content_asset_r">{RightContent}</div>
          </div>
        ) : (
          <NoData small />
        )}
      </TzCard>
    </div>
  );
}

export default () => {
  return (
    <BatchLabelProvider>
      <CreateOrEditLabel />
    </BatchLabelProvider>
  );
};

// 能转number就用number
function tryToNumber(val: number | string) {
  const num = Number(val);
  return Number.isNaN(num) ? val : num;
}
