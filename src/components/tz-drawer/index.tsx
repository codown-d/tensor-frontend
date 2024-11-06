import React, { useMemo, useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { Fn, SupportedLangauges } from '../../definitions';
import './index.scss';
import zh_CN from 'antd/lib/locale/zh_CN';
import en_US from 'antd/lib/locale/en_US';
import { Drawer, DrawerProps } from 'antd';
import ConfigProvider from 'antd/lib/config-provider';
import { localLang } from '../../translations/translations';
import { getUid } from '../../helpers/until';
import { Store } from '../../services/StoreService';
import { HashRouter } from 'react-router-dom';
import { merge } from 'lodash';
interface TzDrawerProps extends DrawerProps {
  children?: any;
  el?: any;
  rootEl?: Element | undefined;
  onCloseCallBack?: Fn;
}
Store.drawerIdList.subscribe({
  next: (v) => {
    let arr = v.slice(1);
    arr.forEach((item) => {
      $(`#${item} .tz-drawer`).css('transform', 'translateX(-180px)');
    });
    if (v.length !== 0) {
      $(`#${v[0]} .tz-drawer`).css('transform', 'translateX(0px)');
    }
  },
});
let timer: boolean | NodeJS.Timeout;
export const TzDrawerFn = (props: TzDrawerProps) => {
  const { onCloseCallBack, rootEl } = props;
  let id: string = getUid();
  let div = document.createElement('div');
  div.setAttribute('id', id);
  let storeInstance = (visible: boolean) => {
    let idList = Store.drawerIdList.getValue();
    if (visible) {
      Store.drawerIdList.next([id, ...idList]);
    } else {
      idList.remove(id);
      Store.drawerIdList.next([...idList]);
    }
  };
  let node = {
    show: () => {},
    hiden: () => {},
  };
  let NewTzDrawer = () => {
    let [visible, setVisible] = React.useState(false);
    node.show = () => {
      setVisible(true);
      storeInstance(true);
    };
    node.hiden = () => {
      setVisible(false);
      !onCloseCallBack || onCloseCallBack();
      setTimeout(() => {
        $('#' + id).remove();
      }, 800);
      storeInstance(false);
    };
    return <TzDrawer {...props} open={visible} getContainer={false} destroyOnClose={true} onClose={node.hiden} />;
  };
  if (timer) return node;
  return new Promise((resolve, reject) => {
    ReactDOM.render(
      React.createElement(
        ConfigProvider,
        { locale: localLang === SupportedLangauges.Chinese ? zh_CN : en_US },
        <HashRouter>
          <NewTzDrawer />
        </HashRouter>,
      ),
      rootEl || document.body.appendChild(div),
    );
    timer = true;
    setTimeout(() => {
      resolve(node);
      timer = false;
    }, 0);
  });
};
export const TzDrawer = (props: TzDrawerProps) => {
  const { children, ...otherProps } = props;
  let [open, setOpen] = useState(props.open || props.visible);
  useEffect(() => {
    setOpen(props.open || props.visible);
  }, [props.visible, props.open]);
  let onClose = useCallback(
    (e: any) => {
      props.onClose && props.onClose(e);
    },
    [props, open],
  );
  const realProps = useMemo(() => {
    return {
      ...otherProps,
      closeIcon: (
        <i
          className={'icon iconfont icon-lansexiaocuohao f24 cursor-p drawer-close-icon'}
          style={{ lineHeight: '24px' }}
        ></i>
      ),
      className: `tz-drawer ${otherProps.className || ''}`,
      width: otherProps.width || '39.8%',
      onClose,
    };
  }, [otherProps]);
  delete realProps.visible;
  return (
    <Drawer placement="right" {...realProps} open={open}>
      {children}
    </Drawer>
  );
};
TzDrawer.destroyAll = () => {
  let idList = Store.drawerIdList.getValue();
  idList.forEach((id) => {
    $('#' + id).remove();
  });
};
export const TzDrawerFullScreenFn = (props: TzDrawerProps) => {
  const { onCloseCallBack, rootEl } = props;
  let id: string = getUid();
  let div = document.createElement('div');
  div.setAttribute('id', id);
  let storeInstance = (visible: boolean) => {
    let idList = Store.drawerFullIdList.getValue();
    if (visible) {
      Store.drawerFullIdList.next([id, ...idList]);
    } else {
      idList.remove(id);
      Store.drawerFullIdList.next([...idList]);
    }
  };
  let node = {
    show: () => {},
    hiden: () => {},
  };
  let NewTzDrawer = () => {
    let [visible, setVisible] = React.useState(false);
    node.show = () => {
      setVisible(true);
      storeInstance(true);
    };
    node.hiden = () => {
      setVisible(false);
      !onCloseCallBack || onCloseCallBack();
      setTimeout(() => {
        $('#' + id).remove();
      }, 800);
      storeInstance(false);
    };
    let realProps = useMemo(() => {
      return merge({}, props, {
        className: `tz-drawer-full-screen ${props.className || ''}`,
        width: '100%',
        headerStyle: { display: 'none' },
        contentWrapperStyle: { marginTop: '64px' },
        mask: false,
        zIndex: 997,
        bodyStyle: { padding: 0 },
      });
    }, [props]);
    return (
      <TzDrawer
        key={Math.random()}
        {...realProps}
        open={visible}
        getContainer={false}
        destroyOnClose={true}
        onClose={node.hiden}
      />
    );
  };
  if (timer) return node;
  return new Promise((resolve, reject) => {
    ReactDOM.render(
      React.createElement(
        ConfigProvider,
        { locale: localLang === SupportedLangauges.Chinese ? zh_CN : en_US },
        <HashRouter>
          <NewTzDrawer />
        </HashRouter>,
      ),
      rootEl || document.body.appendChild(div),
    );
    timer = true;
    setTimeout(() => {
      resolve(node);
      timer = false;
    }, 0);
  });
};
