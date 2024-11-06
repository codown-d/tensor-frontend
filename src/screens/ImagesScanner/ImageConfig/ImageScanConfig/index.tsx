import Form from 'antd/lib/form';
import { TablePaginationConfig } from 'antd/lib/table';
import { get, isEqual, merge } from 'lodash';
import moment from 'moment';
import React, { useCallback, useEffect, useMemo, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { map, tap } from 'rxjs/operators';
import { TzFilter, TzFilterForm, TzTimePicker } from '../../../../components/ComponentsLibrary';
import ArtTemplateDataInfo from '../../../../components/ComponentsLibrary/ArtTemplateDataInfo';
import useTzFilter, { FilterContext } from '../../../../components/ComponentsLibrary/TzFilter/useTzFilter';
import { FilterFormParam } from '../../../../components/ComponentsLibrary/TzFilterForm/filterInterface';
import EllipsisPopover from '../../../../components/ellipsisPopover/ellipsisPopover';
import { TzButton } from '../../../../components/tz-button';
import { TzCard } from '../../../../components/tz-card';
import { TzCheckbox } from '../../../../components/tz-checkbox';
import { TzDrawer } from '../../../../components/tz-drawer';
import { TzForm, TzFormItem, MyFormItem, TzFormItemLabelTip, TzFormItemDivider } from '../../../../components/tz-form';
import { TzInput } from '../../../../components/tz-input';
import { TzInputNumber } from '../../../../components/tz-input-number';
import { TzInputPassword } from '../../../../components/tz-input-password';
import { TzInputTextArea } from '../../../../components/tz-input-textarea';
import { TzMessageSuccess } from '../../../../components/tz-mesage';
import { TzConfirm } from '../../../../components/tz-modal';
import { TzRow, TzCol } from '../../../../components/tz-row-col';
import { TzSelect } from '../../../../components/tz-select';
import { TzSwitch } from '../../../../components/tz-switch';
import { TzTableServerPage } from '../../../../components/tz-table';
import { RenderTag } from '../../../../components/tz-tag';
import { SelectItem, WebResponse } from '../../../../definitions';
import { onSubmitFailed, showSuccessMessage } from '../../../../helpers/response-handlers';
import { Routes } from '../../../../Routes';
import { getUserInformation } from '../../../../services/AccountService';
import { startSync, getSyncStatus, putScanImage, scanImage } from '../../../../services/DataService';
import { translations } from '../../../../translations/translations';
import { DealData } from '../../../AlertCenter/AlertRulersScreens';
import { week, monthDay, yearDay } from '../../../MultiClusterRiskExplorer/ListComponent/NodeMirroringConfig';
import { useAssetsClusterList, useScannerInfoList } from '../../../../helpers/use_fun';
import { useGetLibrary } from '../../../../services/ServiceHook';

export enum configTypeEnum {
  regImage = 'regImage',
  nodeImage = 'nodeImage',
  deploy = 'deploy',
}
export const policyType: any = {
  node: 'nodeImage',
  registry: 'regImage',
  deploy: 'deploy',
};
const TIME_FORMAT = 'HH:mm:ss';
export const ImageScanConfig = () => {
  let [repositoryRegEdit, setRepositoryRegEdit] = useState(false);
  let [repositoryNodeEdit, setRepositoryNodeEdit] = useState(false);
  let [repositoryRegScanEdit, setRepositoryRegScanEdit] = useState(false);
  let [repositoryNodeSacnEdit, setRepositoryNodeSacnEdit] = useState(false);
  let clusterList = useAssetsClusterList();
  const libraryList = useGetLibrary();
  const [scanCycleNodeInfo, setScanCycleNodeInfo] = useState<any>({});
  const [scanCycleRegInfo, setScanCycleRegInfo] = useState<any>({});
  const [formInsReg] = Form.useForm();
  const [formInsNode] = Form.useForm();
  let allReg = Form.useWatch(['scanCycle', 'allReg'], formInsReg);
  let allCluster = Form.useWatch(['scanCycle', 'allCluster'], formInsNode);
  const typeReg = Form.useWatch(['scanCycle', 'cycleType'], formInsReg);
  const typeNode = Form.useWatch(['scanCycle', 'cycleType'], formInsNode);
  let getConfigScanImage = () => {
    scanImage({ configType: configTypeEnum.regImage }).subscribe((res) => {
      if (res.error) return;
      let item = res.getItem();
      let newItem = merge({}, item, {
        scanCycle: { scanTime: moment(item.scanCycle.scanTime, 'HH:mm:ss') },
      });
      setScanCycleRegInfo(newItem);
      formInsReg.setFieldsValue(newItem);
    });
    scanImage({ configType: configTypeEnum.nodeImage }).subscribe((res) => {
      if (res.error) return;
      let item = res.getItem();
      let newItem = merge({}, item, {
        scanCycle: { scanTime: moment(item.scanCycle.scanTime, 'HH:mm:ss') },
      });
      setScanCycleNodeInfo(newItem);
      formInsNode.setFieldsValue(newItem);
    });
  };
  useEffect(() => {
    getConfigScanImage();
  }, []);

  let getDate = useCallback((type) => {
    let dateList = [
      { label: translations.compliances_cronjobs_presets_daily, value: 'day' },
      { label: translations.compliances_cronjobs_presets_weekly, value: 'weekday' },
      { label: translations.compliances_cronjobs_presets_monthly, value: 'month' },
      { label: translations.compliances_cronjobs_presets_yearly, value: 5 },
    ].slice(0, -1);
    let optionList: any = [];
    switch (type) {
      case 'day':
        optionList = [];
        break;
      case 'weekday':
        optionList = week.map((item, index) => {
          return {
            value: index,
            label: item,
          };
        });
        break;
      case 'month':
        optionList = monthDay;
        break;
      case 'year':
        optionList = yearDay;
        break;
    }
    return [optionList, dateList];
  }, []);
  let [optionListReg, dateList] = useMemo(() => {
    return getDate(typeReg);
  }, [typeReg]);
  let [optionListNode] = useMemo(() => {
    return getDate(typeNode);
  }, [typeNode]);
  let getScanCycleInfoList = useCallback(
    (data, type) => {
      let dataInfo: DealData[] = [];
      let str: any = {
        scanCycle: translations.scanningCycle + '：',
        scanObjects: translations.scanning_object + '：',
      };
      if (!data) return [];
      Object.keys(str).map((item) => {
        let obj: DealData = {
          title: str[item] || item,
          content: data[item] || '-',
        };
        let { cycleType, scanTime, weekday, day, clusterKey = [], regIds = [] } = data;
        let time = moment(scanTime).format('HH:mm:ss');
        if ('scanCycle' === item) {
          obj['render'] = (row: any) => {
            let format = '';
            switch (cycleType) {
              case 'day':
                format = `${translations.every_day} ${time}`;
                break;
              case 'weekday':
                format = `${translations.compliances_cronjobs_presets_weekly} ${weekday
                  .map((item: any) => {
                    return week[item];
                  })
                  .join('，')} (${time})`;
                break;
              case 'month':
                format = `${translations.compliances_cronjobs_presets_monthly} ${day
                  .map((item: any) => {
                    return monthDay[item - 1].label;
                  })
                  .join('，')} (${time})`;
                break;
              default:
                format = time;
                break;
            }
            return <p>{format}</p>;
          };
        }
        if ('scanObjects' === item) {
          obj['render'] = (row: any) => {
            if (type === configTypeEnum.regImage) {
              return (
                <p>
                  {data['allReg']
                    ? translations.all_warehouses
                    : libraryList
                        .filter((item: { value: any }) => {
                          return regIds.includes(item.value);
                        })
                        .map((item: { label: any }) => item.label)
                        .join(' , ') || '-'}
                </p>
              );
            } else {
              return (
                <p>
                  {data['allCluster']
                    ? translations.all_clusters
                    : clusterList
                        .filter((item) => {
                          return clusterKey.includes(item.value);
                        })
                        .map((item) => item.label)
                        .join(' , ') || '-'}
                </p>
              );
            }
          };
        }
        dataInfo.push(obj);
      });
      return dataInfo;
    },
    [clusterList, libraryList],
  );
  let scanCycleInfoListNode: DealData[] = useMemo(() => {
    return getScanCycleInfoList(scanCycleNodeInfo?.scanCycle, configTypeEnum.nodeImage);
  }, [scanCycleNodeInfo, getScanCycleInfoList]);

  let scanCycleInfoListReg: DealData[] = useMemo(() => {
    return getScanCycleInfoList(scanCycleRegInfo?.scanCycle, configTypeEnum.regImage);
  }, [scanCycleRegInfo, getScanCycleInfoList]);
  let putScanImageFn = useCallback(
    async (configType) => {
      let ct = configType == configTypeEnum.regImage;
      let value = ct ? await formInsReg?.validateFields() : await formInsNode?.validateFields();
      let obj = ct ? scanCycleRegInfo : scanCycleNodeInfo;
      let p = Object.assign({}, obj, value, { configType, updater: getUserInformation().username });
      p['scanCycle']['scanTime'] = moment(p['scanCycle']['scanTime']).format(TIME_FORMAT);
      putScanImage(p).subscribe((res) => {
        if (res.error) return;
        getConfigScanImage();
        if (ct && value['scanCycle']) {
          setRepositoryRegEdit(false);
        } else if (!ct && value['scanCycle']) {
          setRepositoryNodeEdit(false);
        } else if (ct && !value['scanCycle']) {
          setRepositoryRegScanEdit(false);
        } else if (!ct && !value['scanCycle']) {
          setRepositoryNodeSacnEdit(false);
        }
      });
    },
    [scanCycleNodeInfo, scanCycleRegInfo],
  );
  return (
    <>
      <TzCard
        extra={
          repositoryRegEdit ? (
            <>
              <TzButton size={'small'} type={'primary'} onClick={() => putScanImageFn(configTypeEnum.regImage)}>
                {translations.save}
              </TzButton>
              <TzButton
                size={'small'}
                className={'ml8'}
                onClick={() => {
                  setRepositoryRegEdit(false);
                  formInsReg.setFieldsValue(scanCycleRegInfo);
                }}
              >
                {translations.cancel}
              </TzButton>
            </>
          ) : (
            <TzButton
              size={'small'}
              onClick={() => {
                setRepositoryRegEdit(true);
              }}
            >
              {translations.edit}
            </TzButton>
          )
        }
        title={
          <>
            {translations.Warehouse_image_cycle_scanning_configuration}
            {repositoryRegEdit ? null : <RenderTag type={scanCycleRegInfo?.scanCycle?.enable + ''} className={'ml8'} />}
          </>
        }
        className={'mt20 mb20'}
        bodyStyle={{ paddingBottom: '4px' }}
      >
        {repositoryRegEdit ? (
          <TzForm form={formInsReg}>
            <TzFormItem label={translations.functionSwitch} name={['scanCycle', 'enable']} valuePropName="checked">
              <TzSwitch
                checkedChildren={translations.confirm_modal_isopen}
                unCheckedChildren={translations.confirm_modal_isclose}
              />
            </TzFormItem>
            <TzRow>
              <TzCol flex={'144px'}>
                <TzFormItem label={translations.compliances_breakdown_runduring} name={['scanCycle', 'cycleType']}>
                  <TzSelect options={dateList} placeholder={translations.unStandard.str218} />
                </TzFormItem>
              </TzCol>
              {typeReg === 'weekday' ? (
                <TzCol flex={'438px'} style={{ marginLeft: '12px', paddingTop: '26px' }}>
                  <TzFormItem name={['scanCycle', 'weekday']} noStyle={true}>
                    <TzSelect
                      allowClear
                      options={optionListReg}
                      mode={'multiple'}
                      maxTagCount="responsive"
                      placeholder={translations.originalWarning_pleaseSelect + translations.weekly}
                    />
                  </TzFormItem>
                </TzCol>
              ) : typeReg === 'month' ? (
                <TzCol flex={'438px'} style={{ marginLeft: '12px', paddingTop: '26px' }}>
                  <TzFormItem name={['scanCycle', 'day']} noStyle={true}>
                    <TzSelect
                      allowClear
                      options={optionListReg}
                      mode={'multiple'}
                      maxTagCount="responsive"
                      placeholder={translations.originalWarning_pleaseSelect + translations.monthly}
                    />
                  </TzFormItem>
                </TzCol>
              ) : null}
              <TzCol flex={'144px'} style={{ marginLeft: '12px', paddingTop: '26px' }}>
                <TzFormItem name={['scanCycle', 'scanTime']} noStyle={true}>
                  <TzTimePicker />
                </TzFormItem>
              </TzCol>
            </TzRow>
            <TzFormItem
              label={translations.scanning_object}
              name={['scanCycle', 'allReg']}
              valuePropName="checked"
              style={{ marginBottom: '4px' }}
            >
              <TzCheckbox>{translations.all_warehouses}</TzCheckbox>
            </TzFormItem>
            <TzFormItem name={['scanCycle', 'regIds']}>
              <TzSelect
                mode="multiple"
                options={libraryList}
                disabled={allReg}
                filterOption={(input, option: any) => option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                showSearch
                placeholder={translations.scanner_config_chooseRepo}
              />
            </TzFormItem>
          </TzForm>
        ) : (
          <ArtTemplateDataInfo className="mt4" rowProps={{ gutter: [0, 0] }} data={scanCycleInfoListReg} span={1} />
        )}
      </TzCard>
      <TzCard
        extra={
          repositoryNodeEdit ? (
            <>
              <TzButton size={'small'} type={'primary'} onClick={() => putScanImageFn(configTypeEnum.nodeImage)}>
                {translations.save}
              </TzButton>
              <TzButton
                size={'small'}
                className={'ml8'}
                onClick={() => {
                  setRepositoryNodeEdit(false);
                  formInsNode.setFieldsValue(scanCycleNodeInfo);
                }}
              >
                {translations.cancel}
              </TzButton>
            </>
          ) : (
            <TzButton
              size={'small'}
              onClick={() => {
                setRepositoryNodeEdit(true);
              }}
            >
              {translations.edit}
            </TzButton>
          )
        }
        title={
          <>
            {translations.node_mirroring_periodic_scan_configuration}
            {repositoryNodeEdit ? null : (
              <RenderTag type={scanCycleNodeInfo?.scanCycle?.enable + ''} className={'ml8'} />
            )}
          </>
        }
        className={'mt20 mb20'}
        bodyStyle={{ paddingBottom: '4px' }}
      >
        {repositoryNodeEdit ? (
          <TzForm form={formInsNode}>
            <TzFormItem label={translations.functionSwitch} name={['scanCycle', 'enable']} valuePropName="checked">
              <TzSwitch
                checkedChildren={translations.confirm_modal_isopen}
                unCheckedChildren={translations.confirm_modal_isclose}
              />
            </TzFormItem>
            <TzRow>
              <TzCol flex={'144px'}>
                <TzFormItem label={translations.compliances_breakdown_runduring} name={['scanCycle', 'cycleType']}>
                  <TzSelect options={dateList} placeholder={translations.unStandard.str218} />
                </TzFormItem>
              </TzCol>
              {typeNode === 'weekday' ? (
                <TzCol flex={'438px'} style={{ marginLeft: '12px', paddingTop: '26px' }}>
                  <TzFormItem name={['scanCycle', 'weekday']} noStyle={true}>
                    <TzSelect
                      allowClear
                      options={optionListNode}
                      mode={'multiple'}
                      maxTagCount="responsive"
                      placeholder={translations.originalWarning_pleaseSelect + translations.weekly}
                    />
                  </TzFormItem>
                </TzCol>
              ) : typeNode === 'month' ? (
                <TzCol flex={'438px'} style={{ marginLeft: '12px', paddingTop: '26px' }}>
                  <TzFormItem name={['scanCycle', 'day']} noStyle={true}>
                    <TzSelect
                      allowClear
                      options={optionListNode}
                      mode={'multiple'}
                      maxTagCount="responsive"
                      placeholder={translations.originalWarning_pleaseSelect + translations.monthly}
                    />
                  </TzFormItem>
                </TzCol>
              ) : null}
              <TzCol flex={'144px'} style={{ marginLeft: '12px', paddingTop: '26px' }}>
                <TzFormItem name={['scanCycle', 'scanTime']} noStyle={true}>
                  <TzTimePicker />
                </TzFormItem>
              </TzCol>
            </TzRow>
            <TzFormItem
              label={translations.scanning_object}
              name={['scanCycle', 'allCluster']}
              valuePropName="checked"
              style={{ marginBottom: '4px' }}
            >
              <TzCheckbox>{translations.all_clusters}</TzCheckbox>
            </TzFormItem>
            <TzFormItem name={['scanCycle', 'clusterKey']}>
              <TzSelect
                options={clusterList}
                mode="multiple"
                disabled={allCluster}
                filterOption={(input, option: any) => option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                placeholder={translations.activeDefense_clusterPla}
              />
            </TzFormItem>
          </TzForm>
        ) : (
          <ArtTemplateDataInfo className="mt4" rowProps={{ gutter: [0, 0] }} data={scanCycleInfoListNode} span={1} />
        )}
      </TzCard>
      <TzCard
        extra={
          repositoryRegScanEdit ? (
            <>
              <TzButton size={'small'} type={'primary'} onClick={() => putScanImageFn(configTypeEnum.regImage)}>
                {translations.save}
              </TzButton>
              <TzButton
                size={'small'}
                className={'ml8'}
                onClick={() => {
                  setRepositoryRegScanEdit(false);
                  formInsReg.setFieldsValue(scanCycleRegInfo);
                }}
              >
                {translations.cancel}
              </TzButton>
            </>
          ) : (
            <TzButton
              size={'small'}
              onClick={() => {
                setRepositoryRegScanEdit(true);
              }}
            >
              {translations.edit}
            </TzButton>
          )
        }
        title={translations.repository_image_scanning_configuration}
        className={'mt20 mb20'}
        bodyStyle={{ paddingBottom: 0 }}
      >
        <TzForm form={formInsReg} layout={'horizontal'} colon={false}>
          <TzFormItemDivider />
          <div className={'flex-r-s'}>
            <TzFormItemLabelTip
              label={translations.vulnerabilityLUTFC}
              tip={translations.unStandard.str224}
              className="mb16"
            />
            {repositoryRegScanEdit ? (
              <TzFormItem name="vulnFlush" valuePropName="checked">
                <TzSwitch
                  className={'f-r'}
                  checkedChildren={translations.confirm_modal_isopen}
                  unCheckedChildren={translations.confirm_modal_isclose}
                />
              </TzFormItem>
            ) : (
              <RenderTag type={scanCycleRegInfo['vulnFlush']} className={'mr0 f-r'} />
            )}
          </div>
          {false && (
            <>
              <TzFormItemDivider />
              <div className={'flex-r-s'}>
                <TzFormItemLabelTip
                  label={translations.virusLUTFC}
                  tip={translations.unStandard.str225}
                  className="mb16"
                />
                {repositoryRegScanEdit ? (
                  <TzFormItem name="malwareFlush" valuePropName="checked">
                    <TzSwitch
                      className={'f-r'}
                      checkedChildren={translations.confirm_modal_isopen}
                      unCheckedChildren={translations.confirm_modal_isclose}
                    />
                  </TzFormItem>
                ) : (
                  <RenderTag type={scanCycleRegInfo['malwareFlush']} className={'mr0 f-r'} />
                )}
              </div>
            </>
          )}
          <TzFormItemDivider />
          <div className={'flex-r-s'}>
            <TzFormItemLabelTip
              label={translations.unStandard.str232}
              tip={translations.unStandard.str226}
              className="mb16"
            />
            {repositoryRegScanEdit ? (
              <TzFormItem name="sensitiveFlush" valuePropName="checked">
                <TzSwitch
                  className={'f-r'}
                  checkedChildren={translations.confirm_modal_isopen}
                  unCheckedChildren={translations.confirm_modal_isclose}
                />
              </TzFormItem>
            ) : (
              <RenderTag type={scanCycleRegInfo['sensitiveFlush']} className={'mr0 f-r'} />
            )}
          </div>
          <TzFormItemDivider />
          <div className={'flex-r-s'}>
            <TzFormItemLabelTip
              label={translations.unStandard.str292}
              tip={translations.unStandard.str283}
              className="mb16"
            />
            {repositoryRegScanEdit ? (
              <TzFormItem name="autoScanAdded" valuePropName="checked">
                <TzSwitch
                  className={'f-r'}
                  checkedChildren={translations.confirm_modal_isopen}
                  unCheckedChildren={translations.confirm_modal_isclose}
                />
              </TzFormItem>
            ) : (
              <RenderTag type={scanCycleRegInfo['autoScanAdded']} className={'mr0 f-r'} />
            )}
          </div>
          <TzFormItemDivider />
          <div className={'flex-r-s'}>
            <TzFormItemLabelTip
              label={translations.turn_deep_scan}
              tip={translations.unStandard.str284}
              className="mb16"
            />
            {repositoryRegScanEdit ? (
              <TzFormItem name="deepScan" valuePropName="checked">
                <TzSwitch
                  className={'f-r'}
                  checkedChildren={translations.confirm_modal_isopen}
                  unCheckedChildren={translations.confirm_modal_isclose}
                />
              </TzFormItem>
            ) : (
              <RenderTag type={scanCycleRegInfo['deepScan']} className={'mr0 f-r'} />
            )}
          </div>
          {false && (
            <>
              <TzFormItemDivider />
              <div className={'flex-r-s'}>
                <TzFormItemLabelTip
                  label={translations.unStandard.str285}
                  tip={translations.unStandard.str286}
                  className="mb16"
                />
                {repositoryRegScanEdit ? (
                  <TzFormItem name="oldImage" initialValue={30}>
                    <TzInputNumber
                      style={{ width: '140px' }}
                      parser={(value: any) => parseInt(value) || 1}
                      min={1}
                      max={9999}
                      controls={false}
                      addonAfter={translations.dayC}
                    />
                  </TzFormItem>
                ) : (
                  <span>
                    {scanCycleRegInfo?.oldImage}&nbsp;{translations.dayC}
                  </span>
                )}
              </div>
            </>
          )}
          <TzFormItemDivider />
          <div className={'flex-r-s'}>
            <TzFormItemLabelTip
              label={translations.unStandard.str287}
              tip={translations.unStandard.str288}
              className="mb16"
            />
            {repositoryRegScanEdit ? (
              <TzFormItem name="scanTimeout" initialValue={1}>
                <TzInputNumber
                  parser={(value: any) => parseInt(value) || 1}
                  min={1}
                  style={{ width: '140px' }}
                  max={9999}
                  controls={false}
                  addonAfter={translations.scanner_config_syncTimeUnit}
                />
              </TzFormItem>
            ) : (
              <span>
                {scanCycleRegInfo?.scanTimeout}&nbsp;{translations.scanner_config_syncTimeUnit}
              </span>
            )}
          </div>
          {false && (
            <>
              <TzFormItemDivider />
              <div className={'flex-r-s'}>
                <TzFormItemLabelTip
                  label={translations.unStandard.str289}
                  tip={translations.unStandard.str290}
                  className="mb20"
                />
                {repositoryRegScanEdit ? (
                  <TzFormItem name="clearInterval" initialValue={1}>
                    <TzInputNumber
                      parser={(value: any) => parseInt(value) || 1}
                      min={1}
                      style={{ width: '140px' }}
                      max={9999}
                      controls={false}
                      addonAfter={translations.dayC}
                    />
                  </TzFormItem>
                ) : (
                  <span>
                    {scanCycleRegInfo?.clearInterval}&nbsp;{translations.dayC}
                  </span>
                )}
              </div>
            </>
          )}
        </TzForm>
      </TzCard>
      <TzCard
        extra={
          repositoryNodeSacnEdit ? (
            <>
              <TzButton size={'small'} type={'primary'} onClick={() => putScanImageFn(configTypeEnum.nodeImage)}>
                {translations.save}
              </TzButton>
              <TzButton
                size={'small'}
                className={'ml8'}
                onClick={() => {
                  setRepositoryNodeSacnEdit(false);
                  formInsNode.setFieldsValue(scanCycleNodeInfo);
                }}
              >
                {translations.cancel}
              </TzButton>
            </>
          ) : (
            <TzButton
              size={'small'}
              onClick={() => {
                setRepositoryNodeSacnEdit(true);
              }}
            >
              {translations.edit}
            </TzButton>
          )
        }
        title={translations.node_image_scan_configuration}
        className={'mt20 mb40'}
        bodyStyle={{ paddingBottom: 0 }}
      >
        <TzForm form={formInsNode} layout={'horizontal'} colon={false}>
          <TzFormItemDivider />
          <div className={'flex-r-s'}>
            <TzFormItemLabelTip
              label={translations.vulnerabilityLUTFC}
              tip={translations.unStandard.str224}
              className="mb16"
            />
            {repositoryNodeSacnEdit ? (
              <TzFormItem name="vulnFlush" valuePropName="checked">
                <TzSwitch
                  className={'f-r'}
                  checkedChildren={translations.confirm_modal_isopen}
                  unCheckedChildren={translations.confirm_modal_isclose}
                />
              </TzFormItem>
            ) : (
              <RenderTag type={scanCycleNodeInfo['vulnFlush']} className={'mr0 f-r'} />
            )}
          </div>
          {false && (
            <>
              <TzFormItemDivider />
              <div className={'flex-r-s'}>
                <TzFormItemLabelTip
                  label={translations.virusLUTFC}
                  tip={translations.unStandard.str225}
                  className="mb16"
                />
                {repositoryNodeSacnEdit ? (
                  <TzFormItem name="malwareFlush" valuePropName="checked">
                    <TzSwitch
                      className={'f-r'}
                      checkedChildren={translations.confirm_modal_isopen}
                      unCheckedChildren={translations.confirm_modal_isclose}
                    />
                  </TzFormItem>
                ) : (
                  <RenderTag type={scanCycleNodeInfo['malwareFlush']} className={'mr0 f-r'} />
                )}
              </div>
            </>
          )}
          <TzFormItemDivider />
          <div className={'flex-r-s'}>
            <TzFormItemLabelTip
              label={translations.unStandard.str232}
              tip={translations.unStandard.str226}
              className="mb16"
            />
            {repositoryNodeSacnEdit ? (
              <TzFormItem name="sensitiveFlush" valuePropName="checked">
                <TzSwitch
                  className={'f-r'}
                  checkedChildren={translations.confirm_modal_isopen}
                  unCheckedChildren={translations.confirm_modal_isclose}
                />
              </TzFormItem>
            ) : (
              <RenderTag type={scanCycleNodeInfo['sensitiveFlush']} className={'mr0 f-r'} />
            )}
          </div>
          <TzFormItemDivider />
          <div className={'flex-r-s'}>
            <TzFormItemLabelTip
              label={translations.unStandard.str233}
              tip={translations.unStandard.str227}
              className="mb16"
            />
            {repositoryNodeSacnEdit ? (
              <TzFormItem name="autoScanAdded" valuePropName="checked">
                <TzSwitch
                  className={'f-r'}
                  checkedChildren={translations.confirm_modal_isopen}
                  unCheckedChildren={translations.confirm_modal_isclose}
                />
              </TzFormItem>
            ) : (
              <RenderTag type={scanCycleNodeInfo['autoScanAdded']} className={'mr0 f-r'} />
            )}
          </div>
          {false && (
            <>
              <TzFormItemDivider />
              <div className={'flex-r-s'}>
                <TzFormItemLabelTip
                  label={translations.turn_deep_scan}
                  tip={translations.unStandard.str228}
                  className="mb16"
                />
                {repositoryNodeSacnEdit ? (
                  <TzFormItem name="deepScan" valuePropName="checked">
                    <TzSwitch
                      className={'f-r'}
                      checkedChildren={translations.confirm_modal_isopen}
                      unCheckedChildren={translations.confirm_modal_isclose}
                    />
                  </TzFormItem>
                ) : (
                  <RenderTag type={scanCycleNodeInfo['deepScan']} className={'mr0 f-r'} />
                )}
              </div>
            </>
          )}
          <TzFormItemDivider />
          <div className={'flex-r-s'}>
            <TzFormItemLabelTip
              label={translations.node_image_synchronization_time_settings}
              tip={translations.unStandard.str229}
              className="mb16"
            />
            {repositoryNodeSacnEdit ? (
              <TzFormItem name="syncInterval" initialValue={1}>
                <TzInputNumber
                  parser={(value: any) => parseInt(value) || 1}
                  min={10}
                  style={{ width: '140px' }}
                  max={9999}
                  controls={false}
                  addonAfter={translations.scanner_config_syncTimeUnit}
                />
              </TzFormItem>
            ) : (
              <span>
                {scanCycleNodeInfo?.syncInterval}&nbsp;{translations.scanner_config_syncTimeUnit}
              </span>
            )}
          </div>
          <TzFormItemDivider />
          <div className={'flex-r-s'}>
            <TzFormItemLabelTip
              label={translations.unStandard.str234}
              tip={translations.unStandard.str230}
              className="mb16"
            />
            {repositoryNodeSacnEdit ? (
              <TzFormItem name="scanTimeout" initialValue={1}>
                <TzInputNumber
                  parser={(value: any) => parseInt(value) || 1}
                  min={1}
                  style={{ width: '140px' }}
                  max={9999}
                  controls={false}
                  addonAfter={translations.scanner_config_syncTimeUnit}
                />
              </TzFormItem>
            ) : (
              <span>
                {scanCycleNodeInfo?.scanTimeout}&nbsp;{translations.scanner_config_syncTimeUnit}
              </span>
            )}
          </div>
          <TzFormItemDivider />
          <div className={'flex-r-s'}>
            <TzFormItemLabelTip
              label={translations.unStandard.str235}
              tip={translations.unStandard.str231}
              className="mb20"
            />
            {repositoryNodeSacnEdit ? (
              <TzFormItem name="clearInterval" initialValue={1}>
                <TzInputNumber
                  parser={(value: any) => parseInt(value) || 1}
                  min={1}
                  style={{ width: '140px' }}
                  max={9999}
                  controls={false}
                  addonAfter={translations.dayC}
                />
              </TzFormItem>
            ) : (
              <span>
                {scanCycleNodeInfo?.clearInterval}&nbsp;{translations.dayC}
              </span>
            )}
          </div>
        </TzForm>
      </TzCard>
    </>
  );
};
