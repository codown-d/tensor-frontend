import { useEffect, useState } from 'react';
import { map } from 'rxjs/internal/operators/map';
import { TCustomConfigs, TCustomConfigsSetting } from '../../../definitions';
import { customInitConfig } from '../../../services/DataService';
import { useMemoizedFn } from 'ahooks';
import { get, merge } from 'lodash';
type TRuleConfig = {
  ruleCustomConfig: TCustomConfigs[] | undefined;
  configMergeWidthInitByRuleKey: (arg: TCustomConfigsSetting[]) => TCustomConfigs[] | undefined;
};
const useRuleConfig = (): TRuleConfig => {
  const [ruleCustomConfig, setRuleCustomConfig] = useState<TCustomConfigs[] | undefined>();

  useEffect(() => {
    customInitConfig()
      .pipe(map((res: any) => setRuleCustomConfig(res.getItems())))
      .subscribe();
  }, []);

  const configMergeWidthInitByRuleKey = useMemoizedFn((items: TCustomConfigsSetting[]) => {
    const rule = get(items, [0, 'rule', 'key']);
    const customSettingKeys = items?.length
      ? items.map((v) => get(v, ['customSetting', 'key']))
      : [];
    return ruleCustomConfig
      ?.filter((v) => get(v, ['rule', 'key']) === rule)
      .map((v) => {
        const _customSettingKey = get(v, ['customSetting', 'key']);
        const res = items.find((x) => get(x, ['customSetting', 'key']) === _customSettingKey);
        return customSettingKeys?.includes(_customSettingKey) ? merge({}, v, res) : v;
      });
  });

  return { ruleCustomConfig, configMergeWidthInitByRuleKey };
};

export default useRuleConfig;
