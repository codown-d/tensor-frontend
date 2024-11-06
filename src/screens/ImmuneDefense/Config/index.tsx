import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TzCard } from '../../../components/tz-card';
import { TzForm, TzFormItem, TzFormItemDivider, TzFormItemLabelTip } from '../../../components/tz-form';
import { RenderTag } from '../../../components/tz-tag';
import { translations } from '../../../translations/translations';
import { TzSwitch } from '../../../components/tz-switch';
import TzSegmented from '../../../components/ComponentsLibrary/TzSegmented';
import { segmentedOp } from '../Info/components/ModelData';
import { TzTableServerPage } from '../../../components/tz-table';
import { TzButton } from '../../../components/tz-button';
import { TzInputNumber } from '../../../components/tz-input-number';
import {
  globalConfig,
  fetchFileWhitelist,
  fetchCommandWhitelist,
  fetchNetworkWhitelist,
  postGlobalConfig,
  commandWhitelist,
  fileWhitelist,
  networkWhitelist,
} from '../../../services/DataService';
import TzInputSearch from '../../../components/tz-input-search';
import useLayoutMainSearchWid from '../../../helpers/useLayoutMainSearchWid';
import { addBehavior, columnsObj, delBehavior } from '../Info/components/InModelBehavior';
import Form from 'antd/lib/form';
import { TablePaginationConfig } from 'antd';
import { map } from 'rxjs/operators';
import { SegmentedType } from '../Info/useData';
import { showSuccessMessage } from '../../../helpers/response-handlers';
import { TzMessageSuccess } from '../../../components/tz-mesage';
import getTableColumns from '../Info/components/useTableHook';
import { keys } from 'lodash';
export let getPlaceholder = (type: SegmentedType) => {
  let o: any = {
    [SegmentedType.COMMAND]: translations.unStandard.process_path_or_process_command_line,
    [SegmentedType.FILE]: translations.unStandard.str138,
    [SegmentedType.NETWORK]: translations.unStandard.enter_resource_port,
  };
  return o[type];
};
function ImmuneDefenseConfig() {
  const [configInfo, setConfigInfo] = useState<any>({});
  const [editBaseInfo, setEditbaseInfo] = useState<any>(false);
  const [search, setSearch] = useState('');
  let [type, setInType] = useState(SegmentedType.COMMAND);
  let getGlobalConfig = () => {
    globalConfig().subscribe((res) => {
      if (res.error) return;
      let item = res.getItem();
      setConfigInfo(item);
      formInstance.setFieldsValue(item);
    });
  };
  useEffect(() => {
    getGlobalConfig();
  }, []);
  const [form] = Form.useForm();
  const [formInstance] = Form.useForm();
  const fitlerWid = useLayoutMainSearchWid({});
  const listComp = useRef(undefined as any);
  let fetchData = useMemo(() => {
    let obj = {
      [SegmentedType.COMMAND]: commandWhitelist,
      [SegmentedType.FILE]: fileWhitelist,
      [SegmentedType.NETWORK]: networkWhitelist,
    };
    return obj[type];
  }, [type]);
  const reqFun = useCallback(
    (pagination: TablePaginationConfig, filters: any) => {
      const { current = 1, pageSize = 10 } = pagination;
      const offset = (current - 1) * pageSize;
      let obj = keys(filters).reduce((pre: any, item) => {
        pre[item] = filters[item]?.join(',');
        return pre;
      }, {});
      if (type === SegmentedType.FILE) {
        delete obj.stream_direction;
      } else if (type === SegmentedType.NETWORK) {
        delete obj.permission;
      }
      const pageParams = {
        offset,
        limit: pageSize,
        search_str: search,
        ...obj,
      };

      return fetchData(pageParams).pipe(
        map((res: any) => {
          let items = res.getItems();
          return {
            data: items,
            total: res.data?.totalItems || 0,
          };
        }),
      );
    },
    [search, fetchData, type],
  );
  let addBehaviorFn = useCallback(
    (row = {}) => {
      addBehavior(form, { type, from: 'config', ...row }, async (resolve, reject) => {
        let val = await form.validateFields();
        let type = val.type as SegmentedType;
        setInType(type);
        delete val.type;
        let obj = {
          [SegmentedType.FILE]: fetchFileWhitelist,
          [SegmentedType.COMMAND]: fetchCommandWhitelist,
          [SegmentedType.NETWORK]: fetchNetworkWhitelist,
        };
        if (type === SegmentedType.NETWORK) {
          let { fill_resource_id, port } = val;
          let reg = /(?<=\()(.+?)(?=\))/g;
          val['cluster_key'] = fill_resource_id[0];
          val['namespace'] = fill_resource_id[1];
          val['name'] = fill_resource_id[2].split('(')[0];
          val['kind'] = fill_resource_id[2].match(reg).pop();
          val['port'] = Number(port);
          delete val.fill_resource_id;
        }
        obj[type](val).subscribe((res) => {
          if (res.error) {
            reject();
            return;
          }
          listComp.current.refresh();
          resolve(res);
        });
      });
    },
    [type],
  );
  let newColumns = useMemo(() => {
    let columns = getTableColumns(
      SegmentedType.FILE === type ? ['id', 'file_path', 'permission', 'updated_at'] : columnsObj[type + '_true'],
    ).filter((item: any) => {
      return item.dataIndex !== 'container_name';
    });
    return [
      ...columns,
      {
        title: translations.operation,
        dataIndex: 'operation',
        render: (item: any, row: any) => (
          <>
            <TzButton
              type="text"
              className="ml-8 mr4"
              onClick={(event) => {
                let { cluster_key, namespace, resource_name, kind } = row;
                addBehaviorFn({
                  ...row,
                  file_path: row.file_path,
                  fill_resource_id: [cluster_key, namespace, `${resource_name}(${kind})`],
                });
              }}
            >
              {translations.edit}
            </TzButton>
            <TzButton
              type="text"
              className="ml0"
              danger
              onClick={(event) => {
                delBehavior({ type, ...row, from: 'config' }, (res) => {
                  if (!res.error) {
                    listComp.current.refresh();
                    showSuccessMessage(translations.unStandard.str52);
                  }
                });
              }}
            >
              {translations.delete}
            </TzButton>
          </>
        ),
      },
    ];
  }, [type]);
  let placeholder = useMemo(() => {
    return SegmentedType.FILE === type
      ? translations.unStandard.requireTip(translations.scanner_detail_file_path)
      : getPlaceholder(type);
  }, [type]);
  return (
    <div className="ImmuneDefenseConfig mlr32 mt4">
      <TzCard
        title={translations.learn_settings}
        bodyStyle={{ paddingBottom: '4px' }}
        extra={
          editBaseInfo ? (
            <>
              <TzButton
                size={'small'}
                type={'primary'}
                onClick={async () => {
                  postGlobalConfig(formInstance.getFieldsValue()).subscribe((res) => {
                    if (!res.error) {
                      TzMessageSuccess(translations.saveSuccess);
                      setEditbaseInfo(false);
                      getGlobalConfig();
                    }
                  });
                }}
              >
                {translations.save}
              </TzButton>
              <TzButton
                size={'small'}
                className={'ml8'}
                onClick={() => {
                  setEditbaseInfo(false);
                }}
              >
                {translations.cancel}
              </TzButton>
            </>
          ) : (
            <TzButton
              size={'small'}
              onClick={() => {
                setEditbaseInfo(true);
              }}
            >
              {translations.edit}
            </TzButton>
          )
        }
      >
        <TzForm form={formInstance}>
          <TzFormItemDivider />
          <div className={'flex-r-s'}>
            <TzFormItemLabelTip
              label={translations.automatic_learning_adds_resources}
              tip={translations.unStandard.default_learning_time}
              className="mb16"
            />
            {editBaseInfo ? (
              <TzFormItem name="auto_learn_new_res" valuePropName="checked">
                <TzSwitch
                  className={'f-r'}
                  checkedChildren={translations.confirm_modal_isopen}
                  unCheckedChildren={translations.confirm_modal_isclose}
                />
              </TzFormItem>
            ) : (
              <RenderTag type={configInfo['auto_learn_new_res']} className={'mr0 f-r'} />
            )}
          </div>
          <TzFormItemDivider />
          <div className={'flex-r-s'}>
            <TzFormItemLabelTip
              label={translations.resources_not_displayed}
              tip={translations.unStandard.displayed_in_list}
              className="mb16"
            />
            {editBaseInfo ? (
              <TzFormItem name="show_unrelated_res" valuePropName="checked">
                <TzSwitch
                  className={'f-r'}
                  checkedChildren={translations.confirm_modal_isopen}
                  unCheckedChildren={translations.confirm_modal_isclose}
                />
              </TzFormItem>
            ) : (
              <RenderTag type={configInfo['show_unrelated_res']} className={'mr0 f-r'} />
            )}
          </div>
          <TzFormItemDivider />
          <div className={'flex-r-s'}>
            <TzFormItemLabelTip
              label={translations.ignore_known_intrusion_behavior}
              tip={translations.unStandard.behaviors_not_in_model_behavior}
              className="mb16"
            />
            {editBaseInfo ? (
              <TzFormItem name="ignore_known_attack" valuePropName="checked">
                <TzSwitch
                  className={'f-r'}
                  checkedChildren={translations.confirm_modal_isopen}
                  unCheckedChildren={translations.confirm_modal_isclose}
                />
              </TzFormItem>
            ) : (
              <RenderTag type={configInfo['ignore_known_attack']} className={'mr0 f-r'} />
            )}
          </div>
          <TzFormItemDivider />
          <div className={'flex-r-s'}>
            <TzFormItemLabelTip
              label={translations.default_learning_time}
              tip={translations.unStandard.default_duration_setting}
              className="mb16"
            />
            {editBaseInfo ? (
              <TzFormItem name="learn_time" initialValue={1}>
                <TzInputNumber
                  parser={(value: any) => parseInt(value) || 1}
                  min={1}
                  style={{ width: '140px' }}
                  max={30}
                  controls={false}
                  addonAfter={translations.scanner_config_syncTimeUnit}
                />
              </TzFormItem>
            ) : (
              <span>
                {configInfo['learn_time']}&nbsp;
                {translations.scanner_config_syncTimeUnit}
              </span>
            )}
          </div>
        </TzForm>
      </TzCard>
      <TzCard
        className="mt20"
        title={
          <>
            {translations.whitelist_settings}
            <TzSegmented
              value={type}
              className={'ml12'}
              options={segmentedOp}
              onChange={setInType}
              style={{ fontWeight: 'normal', color: 'rgb(108, 116, 128)' }}
            />
          </>
        }
      >
        <div className="flex-r-c">
          <TzButton
            onClick={() => {
              addBehaviorFn({});
            }}
          >
            {translations.newAdd}
          </TzButton>

          <TzInputSearch placeholder={placeholder} style={{ width: fitlerWid }} onSearch={setSearch} />
        </div>
        <TzTableServerPage tableLayout="fixed" columns={newColumns} reqFun={reqFun} ref={listComp} />
      </TzCard>
    </div>
  );
}

export default ImmuneDefenseConfig;
