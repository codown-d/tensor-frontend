import { useEventListener, useMemoizedFn } from 'ahooks';
import React, { useEffect, useMemo, useState } from 'react';
import { TzModal } from '../../../../components/tz-modal';
import { TzCol, TzRow } from '../../../../components/tz-row-col';
import { TzCheckbox } from '../../../../components/tz-checkbox';
import BackupPopupListItem from './BackupPopupListItem';
import './BackupPopup.scss';
import { difference, union } from 'lodash';
import { translations } from '../../../../translations/translations';
import { configsExport, getConfigsOperatorList } from '../../../../services/DataService';
import { TConfigsOperator } from '../../../../definitions';
import { message } from 'antd';
import { downFile } from '../../../../helpers/until';
import { tap } from 'rxjs/internal/operators/tap';
import { finalize } from 'rxjs/internal/operators/finalize';
import moment from 'moment';

type TBackupPopup = {
  open: boolean;
  onCancel: () => void;
};

function BackupPopup({ open, onCancel }: TBackupPopup) {
  const [values, setValues] = useState<string[]>([]);
  const [all, setAll] = useState<boolean>(false);
  const [list, setList] = useState<TConfigsOperator[]>();
  const [loading, setLoading] = useState<boolean>(false);
  const [partiallySelected, setPartiallySelected] = useState<boolean>(false);

  useEffect(() => {
    getConfigsOperatorList().subscribe((res) => {
      if (!res.error) {
        setList(res.getItems());
      }
    });
  }, []);

  useEventListener('beforeunload', (e) => {
    e.preventDefault();
    e.returnValue = '';
  });

  const listLen = useMemo(() => {
    return list?.reduce((t, v) => {
      t += v?.child?.length ?? 0;
      return t;
    }, 0);
  }, [list]);

  const onChange = useMemoizedFn((val: string[], name: string) => {
    setValues((prev) => {
      const getItemByName = list?.find((v) => v.Key === name)?.child.map((v) => v.Key) ?? [];
      const newV = difference(prev, getItemByName);
      return union([...newV, ...val]);
    });
  });
  useEffect(() => {
    if (!values?.length) {
      setAll(false);
      setPartiallySelected(false);
    } else if (values?.length === listLen) {
      setAll(true);
      setPartiallySelected(false);
    } else {
      setPartiallySelected(true);
    }
  }, [values, listLen]);
  const onOk = useMemoizedFn(() => {
    if (!values?.length) {
      message.error(translations.unStandard.checkBackupsTips);
      return;
    }
    setLoading(true);
    configsExport({ config: values })
      .pipe(
        tap((res: any) => {
          try {
            downFile(res, `export_${moment(new Date()).format('YYYYMMDDHHmmss')}.conf`);
          } catch (error) {}
        }),
        finalize(() => {
          setLoading(false);
        }),
      )
      .subscribe();
  });
  return (
    <TzModal
      okText={translations.backups}
      okType="primary"
      open={open}
      title={translations.backups}
      onCancel={onCancel}
      onOk={onOk}
      okButtonProps={{ loading }}
      wrapClassName="backup-popup"
      centered
      width={800}
      bodyStyle={{ maxHeight: 600, overflow: 'auto' }}
    >
      <div className="backup-popup-box">
        <TzRow className="backup-popup-row-tit" justify="space-around" align="middle">
          <TzCol span={6}>
            <TzCheckbox
              checked={all}
              onClick={() => setAll((prev) => !prev)}
              indeterminate={partiallySelected}
            >
              {translations.backups_moudel}
            </TzCheckbox>
          </TzCol>
          <TzCol span={18}>{translations.backups_content}</TzCol>
        </TzRow>
        {list?.map(({ Key, Name, child }) => (
          <BackupPopupListItem
            isAll={all}
            onChange={(val) => onChange(val, Key)}
            category={Name}
            list={child.map((v) => ({ name: v.Key, title: v.Name }))}
          />
        ))}
      </div>
    </TzModal>
  );
}

export default BackupPopup;
