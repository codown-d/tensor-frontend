import { useMemo } from 'react';
import { useAuth } from './useAuth';

const AuthWrapper: React.FC<{ auth: string | string[]; children: unknown }> = ({
  auth,
  children,
}) => {
  const { hasAuth } = useAuth();
  const authorized = useMemo(() => hasAuth(auth), [hasAuth]);
  if (typeof children === 'function') {
    return children(authorized);
  }
  return authorized ? children : null;
};

export default AuthWrapper;
