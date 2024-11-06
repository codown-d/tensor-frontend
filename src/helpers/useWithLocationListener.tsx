import Modal from 'antd/lib/modal';
import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { TzDrawer } from '../components/tz-drawer';
type LocationTrans = {
  from: any;
  to: any;
};

export const LocationContext = createContext<React.MutableRefObject<LocationTrans>>({
  current: { from: null, to: null },
});

export function WithLocationListener(props: { children: React.ReactNode }) {
  const location = useLocation();

  const locationState = useRef<LocationTrans>({
    from: null,
    to: null,
  });

  useEffect(() => {
    locationState.current.from = locationState.current.to;
    locationState.current.to = location;
    Modal.destroyAll();
    TzDrawer.destroyAll();
  }, [location]);

  return (
    <LocationContext.Provider value={locationState}>{props.children}</LocationContext.Provider>
  );
}

export function useLocationConsumer(): LocationTrans {
  const ref = useContext(LocationContext);
  return ref.current;
}
