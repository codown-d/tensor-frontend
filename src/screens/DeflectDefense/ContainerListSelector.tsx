import React, {
  forwardRef,
  useState,
  useImperativeHandle,
  useEffect,
  useCallback,
} from 'react';
import { tap } from 'rxjs/operators';
import { TzSelectNormal } from '../../components/tz-select';
import { SelectItem, WebResponse } from '../../definitions';
import { getListClusters } from '../../services/DataService';
import { Store } from '../../services/StoreService';
import { translations } from '../../translations/translations';
import { getDetail } from './service';

const ContainerSelector = (props?: any, ref?: any) => {
  const { policyId } = props;
  const [value, setValue] = useState(``);
  const [options, setOptions] = useState<SelectItem[]>([]);

  const selectID = useCallback((val: string, data: any) => {
    setValue(val);
    // 发送数据
    Store.defenseContainerID.next(val);
  }, []);

  useEffect(() => {
    if (!policyId) return;
    const pageParams = {
      policy_id: policyId,
      offset: 0,
      limit: 1000,
    };
    getDetail(pageParams)
      .pipe(
        tap((res: WebResponse<any>) => {
          const items = res.getItems();
          let cid = items[0]?.container_full_names.join(',');
          const getKeyOptions = items.map((t: any) => {
            return Object.assign({}, t, {
              value: t.container_full_names.join(','),
              label: t.container_name,
            });
          });
          setOptions(getKeyOptions);
          setValue(cid);
          Store.defenseContainerID.next(cid);
        })
      )
      .subscribe();
  }, [policyId]);

  useImperativeHandle(
    ref,
    () => {
      return {
        getOptions() {
          return options;
        },
      };
    },
    [options]
  );

  return (
    <p
      style={{
        fontSize: '14px',
        color: '#3E4653',
        fontWeight: 'normal',
        marginLeft: '16px',
        lineHeight: '36px',
        height: '36px',
      }}
    >
      <span
        style={{ float: 'left' }}
      >{`${translations.commonpro_Container}: `}</span>
      <span style={{ display: 'inline-block' }}>
        <TzSelectNormal
          showSearch
          options={options}
          className={'cluster-selector'}
          style={{ maxWidth: '480px', minWidth: '100px' }}
          value={value}
          onChange={selectID}
          dropdownStyle={{
            marginTop: '-12px',
            maxWidth: '480px',
            minWidth: '180px',
          }}
          bordered={false}
          filterOption={(input, option) => {
            return (
              (option?.label + '').toLowerCase().indexOf(input.toLowerCase()) >=
              0
            );
          }}
        />
      </span>
    </p>
  );
};

export default forwardRef(ContainerSelector);
