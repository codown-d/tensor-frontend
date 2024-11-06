import React from 'react';
import GridLoading from '../grid-loading/grid-loading';
import MainCardLoading from '../main-card-loading/main-card-loading';

export function Skeleton(props: { hideGrid?: boolean }) {
  return (
    <>
      <MainCardLoading />
      {props.hideGrid ? null : <GridLoading />}
    </>
  );
}
