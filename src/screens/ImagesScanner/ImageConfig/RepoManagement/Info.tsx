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
import AddRepoManagement from './Edit';
const RepoManagementInfo = (props: any, ref?: any) => {
  const [result] = useSearchParams();
  let id = result.get('id');
  return <AddRepoManagement.Detail id={id} />;
};
export default RepoManagementInfo;
