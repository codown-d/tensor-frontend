import React, {
  forwardRef,
  PureComponent,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import './index.scss';
import { translations } from '../../../translations/translations';
import { MaliciousRejectType } from '../../../definitions';
import { getNewComponentItems } from './SecurityPolicyEdit';
import { find, get, keys, toLower, uniq } from 'lodash';
import TzAnchor, { useAnchorItem } from '../../../components/ComponentsLibrary/TzAnchor';
import EllipsisPopover from '../../../components/ellipsisPopover/ellipsisPopover';
import { securityPolicyDetail } from '../../../services/DataService';
import { tabType } from '../ImagesScannerScreen';
import { useMemoizedFn } from 'ahooks';
import { Store } from '../../../services/StoreService';
import { TzButton } from '../../../components/tz-button';
import { Routes } from '../../../Routes';
import { deleteStrategy } from '.';
import { RenderTag } from '../../../components/tz-tag';
import { enableOp } from '../../ImageReject/PolicyManagement';
import { flushSync } from 'react-dom';

export const newActiongDataList = [
  {
    label: translations.imageReject_reject_type_alarm,
    title: translations.imageReject_reject_type_alarm,
    value: MaliciousRejectType.alert,
  },
  {
    label: translations.imageReject_reject_type_reject,
    title: translations.imageReject_reject_type_reject,
    value: MaliciousRejectType.block,
  },
];

const SecurityPolicyInfo = (props: any) => {
  const [result] = useSearchParams();
  let [data, setData] = useState<any>();
  const navigate = useNavigate();
  let [query] = useState({
    id: result.get('id'),
    imageFromType: result.get('imageFromType'),
  });
  let getSecurityPolicyDetail = useCallback(() => {
    securityPolicyDetail(query).subscribe((res) => {
      if (res.error) return;
      setData(res.getItem());
    });
  }, [query]);
  useEffect(() => {
    getSecurityPolicyDetail();
  }, [query]);

  let newComponentItems = useMemo(() => {
    return getNewComponentItems(query);
  }, [query]);
  let setHeader = useMemoizedFn(() => {
    let node = find(enableOp, (ite) => ite.value === data?.enable + '')?.label;
    Store.header.next({
      title: (
        <div className="flex-r-c">
          {data?.name}
          {query.imageFromType === tabType.deploy ? (
            <RenderTag type={data?.enable ? 'not_disable' : 'disable'} title={node} className="ml12" />
          ) : null}
        </div>
      ),
      extra: (
        <>
          <TzButton
            className="mr16"
            onClick={() => {
              navigate(`${Routes.SecurityPolicyEdit}?imageFromType=${query.imageFromType}&copyId=${query.id}`, {
                replace: true,
              });
            }}
          >
            {translations.create_a_copy}
          </TzButton>
          {data?.isDefault ? null : (
            <>
              <TzButton
                className="mr16"
                onClick={() => {
                  navigate(Routes.SecurityPolicyEdit + `?id=${query.id}&imageFromType=${query.imageFromType}`, {
                    replace: true,
                  });
                }}
              >
                {translations.edit}
              </TzButton>

              <TzButton
                danger
                onClick={(e) => {
                  deleteStrategy({ id: data?.id, name: data?.name }, () => {
                    navigate(-1);
                    flushSync(() => {
                      navigate(`${Routes.SecurityPolicy}?imageFromType=${query.imageFromType}`, {
                        replace: true,
                        state: { keepAlive: true },
                      });
                    });
                  });
                }}
              >
                {translations.delete}
              </TzButton>
            </>
          )}
        </>
      ),
      onBack: () => {
        navigate(-1);
      },
      // footer: <TzTabs onChange={(val: any) => {}} items={[]} />,
    });
  });
  const l = useLocation();
  useEffect(setHeader, [data, l]);
  useEffect(() => {
    if (!query.imageFromType) return;
    Store.breadcrumb.next([
      {
        children: translations.mirror_lifecycle,
        href: Routes.ImagesCILifeCycle,
      },
      {
        children:
          query.imageFromType === tabType.registry
            ? translations.scanner_report_repoImage
            : query.imageFromType === tabType.node
              ? translations.scanner_report_nodeImage
              : translations.imageReject_toonline,
        href: `${Routes.ImagesCILifeCycle}?tab=${query.imageFromType}`,
      },
      {
        children:
          query.imageFromType === tabType.deploy ? translations.policy_management : translations.security_policy,
        href:
          query.imageFromType === tabType.deploy
            ? `${Routes.imageRejectPolicyManagement}?imageFromType=${query.imageFromType}`
            : `${Routes.SecurityPolicy}?imageFromType=${query.imageFromType}`,
      },
    ]);
  }, [query.imageFromType]);
  let { pageKey } = useAnchorItem();
  return (
    <div className="security-policy-info mlr32 mb20 pt4 flex-r">
      <div className="flex-c" style={{ flex: 1 }}>
        {data &&
          newComponentItems.map(({ title, component: Component }: any) => {
            const props = {
              data,
              title: get(translations, title),
              id: `${pageKey}_${title}`,
              imageFromType: query.imageFromType,
            };
            return <Component.Detail {...props} />;
          })}
      </div>
      <TzAnchor
        items={newComponentItems.map(({ title, anchorTitle }) => ({
          title: <EllipsisPopover>{get(translations, anchorTitle || title)}</EllipsisPopover>,
          href: `#${title}`,
        }))}
        offsetBottom={60}
      />
    </div>
  );
};
export default SecurityPolicyInfo;
