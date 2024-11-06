import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from 'react';
import { useSearchParams } from 'react-router-dom';
import AddKeyManagement from './Edit';
const RepoManagementInfo = (props: any, ref?: any) => {
  const [result] = useSearchParams();
  let id = result.get('id');
  return <AddKeyManagement.Detail id={id} />;
};
export default RepoManagementInfo;
