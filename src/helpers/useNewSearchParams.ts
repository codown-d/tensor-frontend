import { useMemoizedFn } from 'ahooks';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export type TSearchParams = Record<string, string>;
function useNewSearchParams(): {
  allSearchParams: any;
  addSearchParams: (obj: TSearchParams) => void;
} {
  const [searchParams, setSearchParams] = useSearchParams();
  const allSearchParams = useMemo((): TSearchParams => {
    const params: any = {};
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    for (let [key, value] of searchParams.entries()) {
      params[key] = value;
    }
    return params;
  }, [searchParams]);

  const addSearchParams = useMemoizedFn((obj: TSearchParams) => {
    setSearchParams({ ...allSearchParams, ...obj });
  });
  return { allSearchParams, addSearchParams };
}

export default useNewSearchParams;
