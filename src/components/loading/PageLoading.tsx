import React, { useMemo } from 'react';
import { Resources } from '../../Resources';
import './PageLoading.scss';
import loadableComponent from '@loadable/component';

interface Iprops {
  style?: any;
}

export const LoadingPageIcon = (props: Iprops) => {
  const realProps = useMemo(() => {
    return {
      style: props.style,
    };
  }, []);
  return <img src={Resources.Loading} alt="loading" {...realProps} />;
};

// ==============
interface ILoadableParam {
  loader: () => Promise<any>;
  loading: () => JSX.Element;
}

export const loadable = (param: ILoadableParam) => {
  const Loading = param.loading;
  return loadableComponent(param.loader, {
    fallback: <Loading />,
  });
};

const PageLoading = () => {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      ···
    </div>
  );
};

export default PageLoading;
