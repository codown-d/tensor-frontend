import React, { forwardRef, useState, useImperativeHandle, useEffect, useCallback, useRef } from 'react';
import { tap } from 'rxjs/operators';
import { TzSelectNormal } from '../../../components/tz-select';
import { SelectItem, WebResponse } from '../../../definitions';
import { getListClusters } from '../../../services/DataService';
import { Store } from '../../../services/StoreService';
import { translations } from '../../../translations/translations';
import './MultiOnlineVulnerSelector.less';
import { find } from 'lodash';
const ClusterSelector = (props?: any, ref?: any) => {
  const [value, setValue] = useState('');
  const [options, setOptions] = useState<SelectItem[]>([]);
  const setClusterID = useCallback((val: string, data: any) => {
    setValue(val);
    Store.clusterID.next(val);
    Store.clusterItem.next(data);
    window.localStorage.setItem('clusterID', val + '');
  }, []);
  let sub = useRef<any>();
  useEffect(() => {
    let clusterID = window.localStorage.getItem('clusterID');
    sub.current?.unsubscribe();
    sub.current = getListClusters({ offset: 0, limit: 2500 })
      .pipe(
        tap((res: WebResponse<any>) => {
          const items = res.getItems().map((t: any) => {
            return Object.assign({}, t, {
              value: t.key,
              label: t.name,
            });
          });
          setOptions(items);
          let clusterItem = find(items, (item) => item.value === clusterID) || items[0];
          setClusterID(clusterItem.key, clusterItem);
        }),
      )
      .subscribe();
    return () => {
      sub.current.unsubscribe();
    };
  }, []);

  useImperativeHandle(
    ref,
    () => {
      return {
        getOptions() {
          return options;
        },
      };
    },
    [options],
  );

  return (
    <div
      style={{
        fontSize: '14px',
        color: '#3E4653',
        display: 'inline-block',
        verticalAlign: 'middle',
        fontWeight: 'normal',
        marginLeft: '16px',
        lineHeight: '36px',
        height: '36px',
      }}
    >
      <span style={{ float: 'left' }}>{`${translations.compliances_cronjobs_selectCluster}: `}</span>
      <span style={{ display: 'inline-block' }}>
        <TzSelectNormal
          showSearch
          options={options}
          className={'cluster-selector'}
          style={{ maxWidth: '480px', minWidth: '100px' }}
          value={value}
          onChange={setClusterID}
          dropdownStyle={{ marginTop: '-12px', maxWidth: '480px', minWidth: '180px' }}
          bordered={false}
          filterOption={(input, option) => {
            return (option?.label + '').toLowerCase().indexOf(input.toLowerCase()) >= 0;
          }}
        />
      </span>
    </div>
  );
};

export default forwardRef(ClusterSelector);
