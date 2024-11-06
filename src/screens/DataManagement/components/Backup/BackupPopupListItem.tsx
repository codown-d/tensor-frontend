import { useSelections } from 'ahooks';
import React, { useEffect } from 'react';
import { TzCol, TzRow } from '../../../../components/tz-row-col';
import { TzCheckbox } from '../../../../components/tz-checkbox';

export type TListItem = {
  name: string;
  title: string;
};
type TBackupPopupListItem = {
  list: TListItem[];
  category: string;
  isAll: boolean;
  onChange: (arg: string[]) => void;
};
function BackupPopupListItem({ list, category, onChange, isAll }: TBackupPopupListItem) {
  const {
    selected,
    allSelected,
    isSelected,
    toggle,
    toggleAll,
    partiallySelected,
    selectAll,
    unSelectAll,
  } = useSelections(list.map(({ name }) => name));

  useEffect(() => {
    onChange(selected);
  }, [selected]);
  useEffect(() => {
    isAll ? selectAll() : unSelectAll();
  }, [isAll]);

  return (
    <TzRow justify="space-around" align="middle">
      <TzCol className="backup-popup-label" span={6}>
        <TzCheckbox checked={allSelected} onClick={toggleAll} indeterminate={partiallySelected}>
          {category}
        </TzCheckbox>
      </TzCol>
      <TzCol span={18}>
        <TzRow className="backup-popup-sec-row">
          {list.map((item) => (
            <TzCol className="backup-popup-value" span={24} key={item.name}>
              <TzCheckbox checked={isSelected(item.name)} onClick={() => toggle(item.name)}>
                {item.title}
              </TzCheckbox>
            </TzCol>
          ))}
        </TzRow>
      </TzCol>
    </TzRow>
  );
}

export default BackupPopupListItem;
