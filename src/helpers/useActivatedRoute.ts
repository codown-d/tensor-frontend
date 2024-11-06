import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { RouteTypes } from '../definitions';
import routers from '../Router';
const matchPath = (routePath: string, locatPath: string) => {
  const routePathArray = routePath.split('/');
  const locatPathArray = locatPath.split('/');
  if (routePathArray.length !== locatPathArray.length) {
    return false;
  }
  let isSame = true;
  routePathArray.map((t, key) => {
    if (t.slice(0, 1) === ':') {
      return t;
    }
    if (t !== locatPathArray[key]) {
      isSame = false;
    }
    return t;
  });
  return isSame;
};
export function useActivatedRoute() {
  const location = useLocation();
  const [activatedRoute, setActivateRoute] = useState<RouteTypes>();
  setTimeout(() => {
    if ($('#layoutMain').scrollTop() === 0) {
      $('.header-content').removeClass('header-shadow');
    }
    $('.ant-tooltip').remove();
    $('#layoutMain')
      .off('scroll')
      .on('scroll', function (event: any) {
        if ($('#layoutMain').scrollTop()) {
          $('.header-content').addClass('header-shadow');
        } else {
          $('.header-content').removeClass('header-shadow');
        }
      });
  }, 0);
  useEffect(() => {
    const route = routers.find((route) => {
      return matchPath(route.path, location.pathname);
    });
    const routeNew = Object.assign({}, route);
    setActivateRoute(routeNew);
  }, [location.pathname]);

  return activatedRoute;
}
