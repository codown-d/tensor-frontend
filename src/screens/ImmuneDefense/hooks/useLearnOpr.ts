import { useMemoizedFn } from 'ahooks';
import {
  enabledBehavioralLearn,
  onekeyEnabledBehavioralLearn,
  onekeyStartBehavioralLearn,
  startBehavioralLearn,
  stopBehavioralLearn,
} from '../../../services/DataService';
import { TzMessageSuccess } from '../../../components/tz-mesage';
import { TzConfirm } from '../../../components/tz-modal';
import { translations } from '../../../translations/translations';
import { isArray } from 'lodash';
export type OprBasicType = 'study' | 'enable' | 'deactivate';
export type OprStopType = 'stop';
export type OprOneKeyType = 'oneKeystudy' | 'oneKeyenable' | 'oneKeydeactivate';
export type OprType = OprBasicType | OprStopType | OprOneKeyType;
const useLearnOpr = () => {
  const studyFn = useMemoizedFn((onOk, learn_status) => {
    if (learn_status === 0) {
      return onOk?.();
    } else {
      TzConfirm({
        content: translations.unStandard.str302,
        width: '520px',
        cancelText: translations.cancel,
        onOk,
      });
    }
  });
  const enableFn = useMemoizedFn((id: number | number[], enabled: boolean, cal: VoidFunction) => {
    const isBatch = isArray(id);
    const sendData = isBatch ? id.map((resource_id) => ({ resource_id, enabled })) : [{ resource_id: id, enabled }];
    enabledBehavioralLearn(sendData).subscribe((res) => {
      cal?.();
      if (res.error) {
        return;
      }
      TzMessageSuccess(
        isBatch
          ? enabled
            ? translations.batch_enablement_successful
            : translations.batch_disable_succeeded
          : enabled
            ? translations.enabled_successfully
            : translations.deactivation_successful,
      );
    });
  });
  const handleOprClick = useMemoizedFn(
    (
      ...arg: [
        {
          type: OprType;
          resource_ids: number | number[];
          learn_status?: number;
        },
        VoidFunction,
        React.MouseEvent<HTMLElement, MouseEvent>,
      ]
    ) => {
      const [{ type, resource_ids: param, learn_status }, cal, e] = arg;
      e.stopPropagation();
      if (type === 'study') {
        studyFn(() => {
          const isBatch = isArray(param);
          const sendData = isBatch ? param : [param];
          startBehavioralLearn(sendData.map((v) => ({ resource_id: v }))).subscribe((res) => {
            cal?.();
            if (res.error) {
              return;
            }
            TzMessageSuccess(
              isBatch ? translations.start_learning_bulk : translations.runtimePolicy_details_startTraining,
            );
          });
        }, learn_status);
        return;
      }
      if (type === 'enable' || type === 'deactivate') {
        enableFn(param, type === 'enable', cal);
        return;
      }
      if (type === 'stop') {
        stopBehavioralLearn({ resource_id: param as number }).subscribe((res) => {
          cal?.();
          if (res.error) {
            return;
          }
          TzMessageSuccess(translations.success_stopped_learning);
        });
        return;
      }
      if (type === 'oneKeystudy') {
        studyFn(() => {
          onekeyStartBehavioralLearn().subscribe((res) => {
            cal?.();
            if (res.error) {
              return;
            }
            TzMessageSuccess(translations.start_learning_bulk);
          });
        }, learn_status);
        return;
      }
      if (type === 'oneKeyenable' || type === 'oneKeydeactivate') {
        onekeyEnabledBehavioralLearn({ enabled: type === 'oneKeyenable' }).subscribe((res) => {
          cal?.();
          if (res.error) {
            return;
          }
          TzMessageSuccess(
            type === 'oneKeyenable' ? translations.batch_enablement_successful : translations.batch_disable_succeeded,
          );
        });
        return;
      }
    },
  );
  return { handleOprClick };
};
export default useLearnOpr;
