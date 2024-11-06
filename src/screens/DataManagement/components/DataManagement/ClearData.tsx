import React, { useEffect, useRef, useState } from 'react';
import { translations } from '../../../../translations/translations';
import { TzButton } from '../../../../components/tz-button';
import { TzModal } from '../../../../components/tz-modal';
import { TzInputNumber } from '../../../../components/tz-input-number';
import { fetchGC, startGC } from '../../../../services/DataService';
import { tap } from 'rxjs/operators';
import { useMemoizedFn, useTimeout, useUpdateEffect } from 'ahooks';
import { DaysOffset, GCItem, GarbaceCollectionTask, WebResponse } from '../../../../definitions';
import './index.scss';
import { TzMessageSuccess } from '../../../../components/tz-mesage';

const DETAUL_DELAY = 1000;
export type TClearData = { name: DaysOffset['dataType']; clearData: number; call: () => void };
function ClearData({ name, clearData, call }: TClearData) {
  const [loading, setLoading] = useState<boolean>();
  const [visible, setVisible] = useState<boolean>();
  const [inputValue, setInputValue] = useState<number>(clearData);
  const [delay, setDelay] = useState<number>();
  const startId = useRef<string>();

  useUpdateEffect(() => {
    setInputValue(clearData);
  }, [clearData]);

  const endPoll = useMemoizedFn(() => {
    setLoading(false);
    startId.current = undefined;
    clear();
    return;
  });
  const clear = useTimeout(() => {
    startId.current &&
      fetchGC(startId.current).subscribe((res: WebResponse<GarbaceCollectionTask>) => {
        setDelay(undefined);
        if (res.error) {
          endPoll();
          return;
        }
        const { status } = res.getItem() || {};
        if (status === 'completed') {
          TzMessageSuccess(translations.auditConfig_gc_suc);
          endPoll();
          call();
          return;
        }
        setTimeout(() => {
          setDelay(DETAUL_DELAY);
        });
      });
  }, delay);

  const handleClear = (): void => {
    setLoading(true);
    startGC({
      dataType: name,
      daysOffset: inputValue,
    })
      .pipe(
        tap((res: WebResponse<GCItem>) => {
          if (res.error) {
            setLoading(false);
            return;
          }
          const { status, id } = res.getItem() || {};
          setVisible(false);
          if (status === 'inprogress') {
            startId.current = id;
            setDelay(DETAUL_DELAY);
          }
        }),
      )
      .subscribe();
  };
  return (
    <div>
      <TzButton onClick={() => !loading && setVisible(true)} loading={loading}>
        {loading ? translations.auditConfig_gc_run : translations.auditConfig_gc_started}
      </TzButton>
      <TzModal
        okText={translations.auditConfig_btnDel}
        okType="danger"
        open={visible}
        closable={false}
        title={translations.auditConfig_gc_started}
        onCancel={() => setVisible(false)}
        onOk={handleClear}
        className="gc-model"
        centered
      >
        <TzInputNumber
          style={{ width: '100%' }}
          className="model-input"
          min={name === 'cold' ? 0 : clearData}
          max={name === 'cold' ? clearData : undefined}
          value={inputValue}
          onChange={(val) => setInputValue((val || clearData) as number)}
        />
      </TzModal>
    </div>
  );
}

export default ClearData;
