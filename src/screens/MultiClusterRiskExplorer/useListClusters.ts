import { useEffect, useState } from 'react';
import { WebResponse } from '../../definitions';
import { getListClusters } from '../../services/DataService';
import { map, tap } from 'rxjs/operators';
import { DefaultOptionType } from 'antd/lib/select';
import { Routes } from '../../Routes';
import { useNavigate } from 'react-router-dom';

export type TClusterKeyToName = Record<string, string>;
const useListClusters = (): {
  clusterList: DefaultOptionType[];
  clusterKeyToName: TClusterKeyToName;
} => {
  const [clusterList, setClusterList] = useState<DefaultOptionType[]>([]);
  const [clusterKeyToName, setClusterKeyToName] = useState<TClusterKeyToName>({});
  useEffect(() => {
    getListClusters({ offset: 0, limit: 1000 })
      .pipe(
        tap((res: WebResponse<any>) => {
          const items = res.getItems();
          let objs: TClusterKeyToName = {};
          const list = items.map(({ name, key }) => {
            objs[key] = name;
            return { label: name, value: key };
          });
          setClusterKeyToName((pre) => objs);
          setClusterList((pre) => list);
        }),
      )
      .subscribe();
  }, []);
  return { clusterList, clusterKeyToName };
};

export default useListClusters;
