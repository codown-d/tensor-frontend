import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { isEmpty, merge } from 'lodash';
import { Routes } from '../../../Routes';
import { TzButton } from '../../../components/tz-button';
import { parseGetMethodParams } from '../../../helpers/until';
import EllipsisPopover from '../../../components/ellipsisPopover/ellipsisPopover';
import { useNavigatereFresh } from '../../../helpers/useNavigatereFresh';
import { TzMessageWarning } from '../../../components/tz-mesage';
import { translations } from '../../../translations/translations';
import { useMemoizedFn, useSize } from 'ahooks';
import { TzDrawer } from '../../../components/tz-drawer';
import './EllipsisMoreDrawer.scss';
import { getResources } from '../../../services/DataService';
import { showFailedMessage } from '../../../helpers/response-handlers';

interface JumpResourceProps {
  [x: string]: any;
  title?: any;
  resource_id?: string | number;
  name: string;
  namespace: any;
  clusterKey: any;
  kind: string;
}
export const useJumpResourceFn = () => {
  const navigate = useNavigate();
  let jumpResourceFn = useMemoizedFn((props: JumpResourceProps) => {
    let { namespace, clusterKey, resource_id, kind, name } = props;
    let obj = {
      type: 'resource',
      NSName: namespace,
      ClusterID: clusterKey,
      kind,
      name,
      resource_id,
    };
    if (resource_id) {
      navigate(Routes.ClustersOnlineVulnerabilitiesDetails + `${parseGetMethodParams(obj)}`);
    } else {
      getResources({
        cluster_key: clusterKey,
        namespace: namespace,
        kind,
        name,
      }).subscribe((res) => {
        let item = res.getItem();
        if (res.error || !item || Object.values(item).length == 0) {
          return showFailedMessage(`${obj.name} ${translations.resources} ${translations.not_exist}`);
        }
        obj['resource_id'] = item.resource_id;
        navigate(Routes.ClustersOnlineVulnerabilitiesDetails + `${parseGetMethodParams(obj)}`);
      });
    }
  });
  return { jumpResourceFn };
};
export const JumpResource = (props: JumpResourceProps) => {
  let { jumpResourceFn } = useJumpResourceFn();
  let { title, ...otherProps } = props;
  return Object.keys(otherProps).some((item) => isEmpty(otherProps[item])) ? (
    <>-</>
  ) : (
    <TzButton
      className="f-l"
      type={'text'}
      style={{ maxWidth: '100%' }}
      onClick={(e) => {
        e.stopPropagation();
        jumpResourceFn(otherProps);
      }}
    >
      <EllipsisPopover>{title || props.name}</EllipsisPopover>
    </TzButton>
  );
};
export const JumpNamespace = (obj: { [x: string]: any; namespace: any; clusterKey: any; title: any }) => {
  let { type = 'namespace', namespace, clusterKey, title } = obj;
  const navigate = useNavigate();
  return Object.keys(obj).some((item) => isEmpty(obj[item])) ? (
    <>-</>
  ) : (
    <TzButton
      className="f-l"
      type={'text'}
      style={{ maxWidth: '100%' }}
      onClick={(e) => {
        e.stopPropagation();
        navigate(
          `${Routes.ClustersOnlineVulnerabilitiesDetails}?type=${type}&NSName=${namespace}&ClusterID=${clusterKey}`,
        );
      }}
    >
      <EllipsisPopover>{title}</EllipsisPopover>
    </TzButton>
  );
};
export const JumpNode = (obj: { [x: string]: any; namespace: any; clusterKey: any; title: any; type?: any }) => {
  let { type = 'node', namespace, clusterKey, title } = obj;
  const navigate = useNavigate();
  return Object.keys(obj).some((item) => isEmpty(obj[item])) ? (
    <>-</>
  ) : (
    <TzButton
      className="f-l"
      type={'text'}
      style={{ maxWidth: '100%' }}
      onClick={(e) => {
        e.stopPropagation();
        navigate(
          `${Routes.ClustersOnlineVulnerabilitiesDetails}?type=${type}&NSName=${namespace}&ClusterID=${clusterKey}`,
        );
      }}
    >
      <EllipsisPopover>{title}</EllipsisPopover>
    </TzButton>
  );
};

export const JumpPod = (obj: { [x: string]: any; PodName: any; namespace: any; clusterKey: any; title: any }) => {
  let { PodName, namespace, clusterKey, title } = obj;
  const navigate = useNavigate();
  return Object.keys(obj).some((item) => isEmpty(obj[item])) ? (
    <>-</>
  ) : (
    <TzButton
      className="f-l"
      type={'text'}
      style={{ maxWidth: '100%' }}
      onClick={(e) => {
        e.stopPropagation();
        navigate(`${Routes.RiskGraphListPodDetail}?namespace=${namespace}&PodName=${PodName}&ClusterID=${clusterKey}`);
      }}
    >
      <EllipsisPopover>{title}</EllipsisPopover>
    </TzButton>
  );
};
export const JumpService = (obj: {
  [x: string]: any;
  service_name: any;
  namespace: any;
  clusterKey: any;
  title: any;
}) => {
  let { service_name, namespace, clusterKey, title } = obj;
  let { jump } = useNavigatereFresh();
  return Object.keys(obj).some((item) => isEmpty(obj[item])) ? (
    <>-</>
  ) : (
    <TzButton
      type={'text'}
      style={{ maxWidth: '100%' }}
      onClick={(e) => {
        e.stopPropagation();
        jump(
          `${Routes.AssetsServiceInfo}?service_name=${service_name}&namespace=${namespace}&cluster_key=${clusterKey}`,
          'AssetsServiceInfo',
        );
      }}
    >
      <EllipsisPopover>{title}</EllipsisPopover>
    </TzButton>
  );
};

export const JumpEndpoint = (obj: { [x: string]: any; clusterKey: any; namespace: any; name: any }) => {
  let { jump } = useNavigatereFresh();
  return Object.keys(obj).some((item) => isEmpty(obj[item])) ? (
    <>-</>
  ) : (
    <TzButton
      type={'text'}
      style={{ maxWidth: '100%' }}
      onClick={(e) => {
        e.stopPropagation();
        let o = {
          cluster_key: obj.clusterKey,
          namespace: obj.namespace,
          endpoints_name: obj.name,
        };
        jump(Routes.AssetsEndpointsInfo + `${parseGetMethodParams(o)}`, 'AssetsEndpointsInfo');
      }}
    >
      <EllipsisPopover>{obj.name}</EllipsisPopover>
    </TzButton>
  );
};
export const JumpImageDetail = (obj: {
  [x: string]: any;
  name: any;
  imageUniqueID: number;
  imageFromType: any;
  imageCleared?: boolean;
}) => {
  let { imageUniqueID, imageFromType, name, imageCleared = false } = obj;
  let { jump } = useNavigatereFresh();
  return ['imageUniqueID', 'imageFromType', 'name'].some((item) => isEmpty(obj[item])) ? (
    <>{name}</>
  ) : (
    <TzButton
      type={'text'}
      style={{ maxWidth: '100%', textAlign: 'left' }}
      onClick={(e) => {
        if (imageCleared) return TzMessageWarning(translations.image_cleaned);
        e.stopPropagation();
        jump(
          `${Routes.RegistryImagesDetailInfo}?imageUniqueID=${imageUniqueID}&imageFromType=${imageFromType}`,
          'RegistryImagesDetailInfo',
        );
      }}
    >
      <EllipsisPopover>{name}</EllipsisPopover>
    </TzButton>
  );
};

export const JumpContainer = (obj: {
  [x: string]: any;
  Cluster: any;
  containerid: any;
  name: any;
  imageCleared?: any;
}) => {
  let { Cluster, containerid, name, imageCleared = false } = obj;
  let { jump } = useNavigatereFresh();
  return ['Cluster', 'containerid', 'name'].some((item) => isEmpty(obj[item])) ? (
    <>{name}</>
  ) : (
    <TzButton
      type={'text'}
      style={{ maxWidth: '100%', textAlign: 'left' }}
      onClick={(e) => {
        if (imageCleared) return TzMessageWarning(translations.image_cleaned);
        e.stopPropagation();
        jump(
          `${Routes.RiskGraphListContainerDetail}?containerID=${containerid}&ClusterID=${Cluster}`,
          'RiskGraphListContainerDetail',
        );
      }}
    >
      <EllipsisPopover>{name}</EllipsisPopover>
    </TzButton>
  );
};

export interface IEllipsisMoreDrawerProps {
  title: string;
  content: string;
}
export const EllipsisMoreDrawer = (props: IEllipsisMoreDrawerProps) => {
  const { content, title } = props;
  const rowBoxRef = useRef<HTMLDivElement>(null);
  const rowTxtRef = useRef<HTMLDivElement>(null);
  const [showMore, setShowMore] = useState(false);
  const { width: rowBoxW = 0 } = useSize(rowBoxRef) ?? {};
  const { width: rowTxtW = 0 } = useSize(rowTxtRef) ?? {};
  const [showVariate, setShowVariate] = useState(false);

  useEffect(() => {
    setShowMore(rowTxtW - rowBoxW > 1);
  }, [rowBoxW, rowTxtW]);

  return (
    <>
      <div ref={rowBoxRef} className="EllipsisMoreDrawer-Wrap flex-r">
        <div className="contxt-a9">{content || '-'}</div>
        <div className="contxt-a9 hide" ref={rowTxtRef}>
          {content}
        </div>
        {showMore && (
          <span
            className="more-btn hoverBtn ml16"
            onClick={() => {
              setShowVariate(true);
            }}
          >
            {translations.clusterGraphList_detailContainer_seeMore}
          </span>
        )}
      </div>
      <TzDrawer
        title={title}
        open={showVariate}
        width={560}
        destroyOnClose={true}
        onClose={() => {
          setShowVariate(false);
        }}
      >
        <div style={{ wordBreak: 'break-all' }}>{content}</div>
      </TzDrawer>
    </>
  );
};
