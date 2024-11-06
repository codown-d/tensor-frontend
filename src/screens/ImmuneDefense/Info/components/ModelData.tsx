import React, { useContext, useEffect, useMemo, useState } from 'react';
import { TzCard } from '../../../../components/tz-card';
import { BasicCardProps } from '../../type';
import MultiSelectWithAll, { MultiSelectWithAllValProps } from '../../../../components/MultiSelectWithAll';
import { translations } from '../../../../translations/translations';
import { ImmuneDefenseContext } from '../context';
import TzSegmented from '../../../../components/ComponentsLibrary/TzSegmented';
import useLayoutMainSearchWid from '../../../../helpers/useLayoutMainSearchWid';
import TzInputSearch from '../../../../components/tz-input-search';
import { LearnStatus, SegmentedType } from '../useData';
import { getPlaceholder } from '../../Config';
import { TzTabs } from '../../../../components/tz-tabs';
import OutModelBehavior from './OutModelBehavior';
import InModelBehavior from './InModelBehavior';

export let segmentedOp = [
  {
    label: translations.command_execution,
    value: SegmentedType.COMMAND,
  },
  {
    label: translations.file_reads_writes,
    value: SegmentedType.FILE,
  },
  {
    label: translations.network_events,
    value: SegmentedType.NETWORK,
  },
];
export default function Inde(props: BasicCardProps) {
  const [containerVal, setContainerVal] = useState<MultiSelectWithAllValProps>({
    checkValue: true,
    selectValue: [],
  });
  const { baseInfo } = useContext(ImmuneDefenseContext) ?? {};
  let [inType, setInType] = useState(SegmentedType.COMMAND);
  let [outType, setOutType] = useState(SegmentedType.COMMAND);
  const [inSearch, setInSearch] = useState('');
  const [outSearch, setOutSearch] = useState('');
  const fitlerWid = useLayoutMainSearchWid({});
  return (
    <TzCard {...props}>
      {baseInfo?.learn_status !== LearnStatus.not_learned ? (
        <MultiSelectWithAll
          className="mb20"
          onChange={setContainerVal}
          value={containerVal}
          options={baseInfo?.containers?.map((item: { name: any; container_id: any }) => ({
            label: item.name,
            value: item.name,
          }))}
          label={translations.defense_containers}
          checkboxLabel={translations.all_containers}
          placeholder={translations.unStandard.requireSelectTip(translations.defense_containers)}
          checkboxOp={{ disabled: baseInfo?.learn_status === LearnStatus.learning }}
        />
      ) : null}
      <div>
        <div className="mb20 flex-r-c">
          <span>
            {translations.in_model_behavior}
            <TzSegmented
              value={inType}
              className={'ml12'}
              options={segmentedOp}
              onChange={(val: React.SetStateAction<SegmentedType>) => {
                setInType(val);
                setInSearch('');
              }}
            />
          </span>
          <TzInputSearch
            value={inSearch}
            placeholder={((inType) => {
              return getPlaceholder(inType);
            })(inType)}
            style={{ width: fitlerWid }}
            onSearch={setInSearch}
            disabled={baseInfo?.learn_status === LearnStatus.learning}
          />
        </div>
        <TzTabs
          activeKey={inType}
          tabBarStyle={{ display: 'none' }}
          destroyInactiveTabPane={true}
          items={[
            {
              label: '',
              key: SegmentedType.COMMAND,
              children: (
                <InModelBehavior
                  type={SegmentedType.COMMAND}
                  resource_id={baseInfo?.resource_id}
                  learn_status={baseInfo?.learn_status}
                  search_str={inSearch}
                  is_in_model={true}
                  all_container={!!containerVal?.checkValue}
                  cname={containerVal?.selectValue}
                  setInType={setInType}
                />
              ),
            },
            {
              label: '',
              key: SegmentedType.FILE,
              children: (
                <InModelBehavior
                  type={SegmentedType.FILE}
                  resource_id={baseInfo?.resource_id}
                  learn_status={baseInfo?.learn_status}
                  search_str={inSearch}
                  is_in_model={true}
                  all_container={!!containerVal?.checkValue}
                  cname={containerVal?.selectValue}
                  setInType={setInType}
                />
              ),
            },
            {
              label: '',
              key: SegmentedType.NETWORK,
              children: (
                <InModelBehavior
                  type={SegmentedType.NETWORK}
                  resource_id={baseInfo?.resource_id}
                  learn_status={baseInfo?.learn_status}
                  search_str={inSearch}
                  is_in_model={true}
                  all_container={!!containerVal?.checkValue}
                  cname={containerVal?.selectValue}
                  setInType={setInType}
                />
              ),
            },
          ]}
        />
      </div>
      <div className="mt20">
        <div className="flex-r-c mb20 ">
          <span>
            {translations.out_model_behavior}
            <TzSegmented
              value={outType}
              className={'ml12'}
              options={segmentedOp}
              onChange={(val: React.SetStateAction<SegmentedType>) => {
                setOutType(val);
                setOutSearch('');
              }}
            />
          </span>

          <TzInputSearch
            value={outSearch}
            placeholder={((outType) => {
              return getPlaceholder(outType);
            })(outType)}
            style={{ width: fitlerWid }}
            onSearch={setOutSearch}
          />
        </div>
        <TzTabs
          activeKey={outType}
          tabBarStyle={{ display: 'none' }}
          destroyInactiveTabPane={true}
          items={[
            {
              label: '',
              key: SegmentedType.COMMAND,
              children: (
                <OutModelBehavior
                  type={SegmentedType.COMMAND}
                  search_str={outSearch}
                  resource_id={baseInfo?.resource_id}
                  learn_status={baseInfo?.learn_status}
                  all_container={!!containerVal?.checkValue}
                  cname={containerVal?.selectValue}
                  changeType={setInType}
                />
              ),
            },
            {
              label: '',
              key: SegmentedType.FILE,
              children: (
                <OutModelBehavior
                  type={SegmentedType.FILE}
                  resource_id={baseInfo?.resource_id}
                  learn_status={baseInfo?.learn_status}
                  search_str={outSearch}
                  all_container={!!containerVal?.checkValue}
                  cname={containerVal?.selectValue}
                  changeType={setInType}
                />
              ),
            },
            {
              label: '',
              key: SegmentedType.NETWORK,
              children: (
                <OutModelBehavior
                  type={SegmentedType.NETWORK}
                  resource_id={baseInfo?.resource_id}
                  learn_status={baseInfo?.learn_status}
                  search_str={outSearch}
                  all_container={!!containerVal?.checkValue}
                  cname={containerVal?.selectValue}
                  changeType={setInType}
                />
              ),
            },
          ]}
        />
      </div>
    </TzCard>
  );
}
