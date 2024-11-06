import React, { useCallback, useEffect, useMemo } from 'react';
import { HashRouter, Route, Routes, useBeforeUnload, useLocation } from 'react-router-dom';
import './App.scss';
import './helpers/compatible';
import { IS_MICRO_FRONT_IFRAME } from './helpers/config';
import LayoutComponent from './components/layout/LayoutComponent';
import { SupportedLangauges } from './definitions';
import routers, { publicRouter } from './Router';
import { localLang } from './translations/translations';
import zh_CN from 'antd/lib/locale/zh_CN';
import en_US from 'antd/lib/locale/en_US';
import ConfigProvider from 'antd/lib/config-provider';
import './translations/momentConfig';
import notification from 'antd/lib/notification';
import NonePage from './screens/NonePage/NonePage';
import { GlobalContext } from './helpers/GlobalContext';
import useInitInfo from './useInitInfo';
function App() {
  useEffect(() => {
    document.body.classList.add(process.env.REACT_APP_SUBJECT || '');
    notification.config({
      closeIcon: <i className={'icon iconfont icon-close f24'} style={{ color: 'rgba(179, 186, 198, 1)' }}></i>,
      duration: 3,
    });
  }, []);
  const globalConfig = useInitInfo();
  return (
    <ConfigProvider locale={localLang === SupportedLangauges.English ? en_US : zh_CN} autoInsertSpaceInButton={true}>
      <GlobalContext.Provider value={{ ...globalConfig }}>
        <HashRouter window={window}>
          <Routes>
            {IS_MICRO_FRONT_IFRAME
              ? null
              : publicRouter.map((item, index) => {
                  let { path, element: Element } = item;
                  return <Route key={item.path} path={path} element={<Element />} />;
                })}
            <Route path="/" element={<LayoutComponent hideMenu={IS_MICRO_FRONT_IFRAME} />}>
              {[...routers].map((item, index) => {
                let { breadcrumb, path, element: Element } = item;
                return (
                  <Route
                    key={index}
                    path={`${path}`}
                    element={
                      <React.Suspense fallback={333}>
                        <Element breadcrumb={breadcrumb} />
                      </React.Suspense>
                    }
                  />
                );
              })}
            </Route>
            <Route path="/*" element={<NonePage />} />
          </Routes>
        </HashRouter>
      </GlobalContext.Provider>
    </ConfigProvider>
  );
}

export default App;
