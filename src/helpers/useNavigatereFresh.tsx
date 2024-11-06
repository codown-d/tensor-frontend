import { useDebounceFn } from 'ahooks';
import { NavigateOptions, useLocation, useNavigate } from 'react-router-dom';

export const useNavigatereFresh = () => {
  const navigate = useNavigate();
  const { run: jump } = useDebounceFn(
    (url: string, keepalive?: string, op?: NavigateOptions) => {
      navigate(url, op);
    },
    {
      wait: 100,
    },
  );
  return { jump };
};
