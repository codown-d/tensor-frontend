import { BreadcrumbItemProps } from 'antd/lib/breadcrumb/BreadcrumbItem';
import { BehaviorSubject } from 'rxjs';
import { CalicoRelation, Cluster, ServerAlert } from '../definitions';
import { IAssetTopTag } from 'components/label-col/context';

export interface StatsObj {
  anchor?: number;
  timer?: number;
}
export interface AssetsParamsObj {
  assetType?: string;
  assetTopTag?: IAssetTopTag;
}

export type TSize =
  | {
      width: number;
      height: number;
    }
  | undefined;

export const Store = {
  clusters: new BehaviorSubject<Cluster[]>([]),
  onlineVulnerabilityDynamicUpdates: new BehaviorSubject<boolean>(false),
  calicoRelation: new BehaviorSubject<CalicoRelation[]>([]),
  navbarSelected: new BehaviorSubject<string>(''),
  setNavbarType: new BehaviorSubject<string>(''),
  clusterID: new BehaviorSubject<string>(window.localStorage.getItem('clusterID') + ''),
  clusterItem: new BehaviorSubject<any>({}),
  btnEdit: new BehaviorSubject<boolean>(true),
  drawerIdList: new BehaviorSubject<string[]>([]),
  drawerFullIdList: new BehaviorSubject<string[]>([]),
  keepAliveRoute: new BehaviorSubject<boolean | string>(false),
  menuWidth: new BehaviorSubject<number>(208),
  header: new BehaviorSubject<{
    title?: React.ReactNode;
    extra?: React.ReactNode;
    onBack?: () => void;
    footer?: React.ReactNode;
  } | null>(null),
  breadcrumb: new BehaviorSubject<BreadcrumbItemProps[]>([]),
  pageFooter: new BehaviorSubject<React.ReactNode>(null),
  policyDetail: new BehaviorSubject<any>({}),
  notifications: new BehaviorSubject<ServerAlert<any>[]>([]),
  eventsCenter: new BehaviorSubject<StatsObj>({}),
  eventsSound: new BehaviorSubject<boolean>(false),
  defenseContainerID: new BehaviorSubject<any>(null),
  licenseToast: new BehaviorSubject<boolean>(false),
  eventoverview: new BehaviorSubject<any>({}),
  palaceTaskPrevStatus: new BehaviorSubject<any>(''),
  onRefreshEventsList: new BehaviorSubject<any>(() => {}),
  layoutMainContentSize: new BehaviorSubject<TSize>(undefined),
  pageHeaderSize: new BehaviorSubject<TSize>(undefined),
  menuCacheItem: new BehaviorSubject<string>(''),
  homePath: new BehaviorSubject<string>(''),
  imagesCILifeCycleTag: new BehaviorSubject<string>(''),
  assetsParams: new BehaviorSubject<AssetsParamsObj>({}),
  micrPolicyCreate: new BehaviorSubject<any>(null),
};
