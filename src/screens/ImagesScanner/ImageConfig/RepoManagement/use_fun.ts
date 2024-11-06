import { useCallback, useEffect, useState } from 'react';
import { getRepoTypes } from '../../../../services/DataService';

export const useRepoTypes = () => {
  const [res, setres] = useState<any>([]);
  const fetchRepoTypes = useCallback(() => {
    getRepoTypes().subscribe((res) => {
      if (res.error) return;
      let items = res.getItems();
      setres(items);
    });
  }, []);
  useEffect(() => {
    fetchRepoTypes();
  }, []);
  return res;
};
