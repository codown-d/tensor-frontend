import React, { PureComponent } from 'react';
import { catchError, finalize, tap } from 'rxjs/operators';
import { Hierarchy, OnlineVulnerabilitiesFilterOptions, RiskExplorerOverall, WebResponse } from '../../../definitions';
import { getGraphOverall } from '../../../services/DataService';
import './OnlineVulnerabilitiesScreen.scss';
import BubbleChart from '../../../components/bubble-chart/BubbleChartComponent';
// import ChartTooltip from '../../../components/ComponentsLibrary/ChartTooltip';
import {
  convertRiskExplorerOverallToHireachy,
  convertRiskExplorerOverallToHireachyGroupZoom,
  getThreshold,
} from './OnlineVulnerabilitiesHelper';
import { Subscription, throwError, timer } from 'rxjs';
// import { OnlineVulnerabilitiesBackground } from './OnlineVulnerabilitiesBackground';
import {
  vulnerabilitiesFilter,
  vulnerabilitiesImageNum,
  vulnerabilitiesSearch,
} from '../OnlineVulnerabilitiesGraphList/OnlineFilterHelper';
import { Store } from '../../../services/StoreService';
import { isEqual, cloneDeep } from 'lodash';
import OnlineVulnerabilitiesFilters, {
  EventTypesDef,
} from '../OnlineVulnerabilitiesFilters/OnlineVulnerabilitiesFilters';
// import { Routes } from '../../../Routes';
// import { escapeString } from '../../MultiClusterRiskExplorer/GraphResFilterHelper';
import OnlineVulnerabilitiesDrawer from '../OnlineVulnerabilitiesFilters/OnlineVulnerabilitiesDrawer';
// import { TzButton } from '../../../components/tz-button';
import ChartInfoLoad from '../../../components/ComponentsLibrary/ChartTooltip/ChartInfoLoad';
import ChartNumGroup from '../../../components/ComponentsLibrary/ChartTooltip/ChartNumGroup';
import TzInputSearch from '../../../components/tz-input-search';
import OnlineVulnerabilitiesSearchPopup from '../OnlineVulnerabilitiesFilters/OnlineVulnerabilitiesSearchPopup';
import { translations } from '../../../translations/translations';
import ChartNSInfo from '../../../components/ComponentsLibrary/ChartTooltip/ChartNSInfo';

interface IProps {
  children: any;
  history: any;
  match: any;
}

interface IState {
  res?: WebResponse<RiskExplorerOverall>;
  loading: boolean;
  selectedNode?: any;
  size: number;
  filters?: OnlineVulnerabilitiesFilterOptions;
  bubbleChartData?: Hierarchy;
  bubbleChartDataGroup?: Hierarchy;
  clusterID: string | undefined;
  expandObjKey: any;
  ratio: number;
  mouseNode: any;
  bubbleChartWidth: number;
  bubbleChartHeight: number;
  selectedTestNode?: any;
  searchKeyword: string;
  omittedMark: boolean;
  popupNodeID: string;
  popupNodeNS: string;
  licenseMark: boolean;
  containerWid: number;
  containerH: number;
}

let nodeBasicExternalInfo: any = {};
// 当前应该是展示什么操作的高亮节点
let typePrivateShowNode: 'drawer' | 'search' | 'null' | 'all' = 'null';
let operation = {
  search: false,
  drawer: false,
};

let omittedMarkPrivate = false;
let clusterIDCache = '';
let clientH = 0;
class OnlineVulnerabilitiesScreenV2 extends PureComponent<IProps, IState> {
  private timer: Subscription;

  private tooltipRef: any = React.createRef();
  private detailRef: any = React.createRef();
  private chart: any = React.createRef();
  private searchPopup: any = React.createRef();
  private fetchStoreClusterIDSub: any;
  private licenseToastSub: any;
  private onlineVulnerabilityDynamicUpdatesSub: any;
  private layoutMainContentSizeSub: any;
  state = {
    res: undefined,
    loading: true,
    selectedNode: undefined,
    size: 0.5,
    filters: undefined,
    filteredData: undefined,
    clusterID: undefined,
    expandObjKey: undefined,
    ratio: 1,
    mouseNode: null,
    bubbleChartWidth: 0,
    bubbleChartHeight: 0,
    selectedTestNode: undefined,
    searchKeyword: '',
    omittedMark: omittedMarkPrivate,
    popupNodeID: '',
    popupNodeNS: '',
    licenseMark: false,
    containerWid: 0,
    containerH: 0,
  } as IState;

  componentDidMount() {
    // setTimeout(() => {
    //   this.getDomWNumber();
    // }, 500);

    // if (Store.menuCacheItem.value === 'OnlineVulnerabilities') {
    //   clusterIDCache = '';
    // }
    clusterIDCache = '';
    this.storeGetClusterID();
    this.fetchTimerFrom();
    this.fetchLicenseMark();
    // this.fetchFromServer();
    if (!this.state.bubbleChartWidth || !this.state.bubbleChartHeight) {
      this.getDomWNumber();
    }

    this.layoutMainContentSizeSub = Store.layoutMainContentSize.subscribe((val) => {
      this.setState({
        containerWid: val?.width || 0,
        containerH: val?.height || 0,
      });
    });
  }

  componentWillUnmount() {
    Store.onlineVulnerabilityDynamicUpdates.next(false);
    this.timer && this.timer.unsubscribe();
    this.fetchStoreClusterIDSub?.unsubscribe();
    this.licenseToastSub?.unsubscribe();
    this.onlineVulnerabilityDynamicUpdatesSub?.unsubscribe();
    this.layoutMainContentSizeSub?.unsubscribe();
    nodeBasicExternalInfo = {};
    typePrivateShowNode = 'null';
    operation = {
      search: false,
      drawer: false,
    };
  }

  private getDomWNumber = () => {
    let d: any = document.querySelector('.layout-main-container .layout-content #chartContainer');
    // 可能有bug，当后期更改页面布局的时候，这个计算width会不准确
    let sidebarWidth = ($(window).width() as number) < 1280 ? 80 : 220;
    // 渲染后高度固定，使用变量记住，解决再次渲染高度计算不准问题
    clientH = clientH || d?.offsetHeight || $(document).height();

    this.setState({
      bubbleChartWidth: d?.offsetWidth || ($(document).width() as number) - 240 - sidebarWidth,
      bubbleChartHeight: clientH,
    });
  };

  // 切换集群
  storeGetClusterID(): void {
    this.fetchStoreClusterIDSub = Store.clusterID
      .pipe(
        tap((clusterID: string) => {
          if (clusterID && clusterIDCache !== clusterID) {
            clusterIDCache = clusterID;
            this.setState({ clusterID: clusterID, expandObjKey: undefined }, () => {
              this.fetchFromServer();
              this.temExpandObj = {};
              typePrivateShowNode = 'null';
              operation = {
                search: false,
                drawer: false,
              };
              nodeBasicExternalInfo = {};

              this.onCloseDrawer();
              this.chart && this.chart.current.initSearch();
              this.searchPopup && this.searchPopup.current.close();
              this.setState({
                searchKeyword: '',
                omittedMark: false,
              });
            });
          }
        }),
      )
      .subscribe();
  }

  // 动态刷新
  fetchTimerFrom(): void {
    this.onlineVulnerabilityDynamicUpdatesSub = Store.onlineVulnerabilityDynamicUpdates
      .pipe(
        tap((res) => {
          if (res) {
            this.timer = timer(0, 60 * 1000)
              .pipe(
                tap(() => {
                  this.fetchFromServer();
                }),
              )
              .subscribe();
          } else {
            this.timer && this.timer.unsubscribe();
          }
        }),
      )
      .subscribe();
  }

  fetchLicenseMark(): void {
    this.licenseToastSub = Store.licenseToast
      .pipe(
        tap((res) => {
          this.setState({
            licenseMark: res,
          });
        }),
      )
      .subscribe();
  }

  fetchFromServer(): void {
    const clusterID = this.state.clusterID;
    getGraphOverall({ clusterID: clusterID || '', apptype: '' })
      .pipe(
        tap((res: WebResponse<RiskExplorerOverall>) => {
          if (!isEqual(res.data, this.state.res?.data)) {
            this.setState({ res });
          }
        }),
        catchError((error) => {
          return throwError(error);
        }),
        // finalize(() => {
        //   this.setState({ loading: false });
        // })
      )
      .subscribe();
  }

  private onContainerSelect = (node: any) => {
    const { resourceName, namespace } = node.data.original;
    typePrivateShowNode = 'drawer';
    if (operation?.search) {
      typePrivateShowNode = 'all';
    }
    operation['drawer'] = true;

    this.setState(
      {
        selectedNode: node.data,
        selectedTestNode: node.data,
      },
      () => {
        this.detailRef.current && this.detailRef.current.show();
      },
    );
  };

  private temExpandObj: any = {};

  private expand = (nsID: string, type: string) => {
    this.temExpandObj[nsID] || (this.temExpandObj[nsID] = {});
    this.temExpandObj[nsID][type] || (this.temExpandObj[nsID][type] = 'open');
    const data = cloneDeep(this.temExpandObj);
    this.setState({
      expandObjKey: data,
    });
  };

  private rChange = (ratio: number) => {
    // this.setState({
    //   ratio,
    // });
  };

  private omitChange = (val: boolean) => {
    this.setState({
      omittedMark: val,
    });
  };

  private tTop: number = 0;
  private tleft: number = 0;
  private aTop: number = 0;
  private aleft: number = 0;
  private tName: string = '';
  private tr: number = 0;
  private tRatio: number = 1;

  private threshold: number = 0;

  private showTooltip = (mouseNode: any, view: any, { zX, zY }: any, ratio: any) => {
    if (!mouseNode) {
      this.setState({
        mouseNode: null,
      });
      return;
    }
    this.tName = mouseNode.data.id;
    // 7.8是每个字符的宽度，这里没有换行，高度默认为40。如果要换行的话，使用 ref 获取宽和高，再计算位置
    const tLength = (this.tName.length * 7.8) / 2;
    const k = 1;

    this.tRatio = k * ratio;
    let topGap = 100 + 50 * ratio;
    if (topGap > 160) {
      topGap = 160;
    }
    if (topGap < 140) {
      topGap = 140;
    }

    this.tleft = (mouseNode.x - view[0]) * k * ratio + this.state.bubbleChartWidth / 2 + zX - tLength;

    if (this.tleft + tLength * 2 > this.state.bubbleChartWidth) {
      this.tleft = this.state.bubbleChartWidth - tLength * 2 - mouseNode.r / 2;
    }
    console.log(mouseNode, view, k, ratio, this.state.bubbleChartHeight, topGap);
    this.tTop =
      (mouseNode.y - view[1]) * k * ratio + this.state.bubbleChartHeight / 2 + zY - topGap - (mouseNode.r / 2) * ratio;

    this.aleft = (mouseNode.x - view[0]) * k * ratio + this.state.bubbleChartWidth / 2 + zX - 5;

    this.aTop =
      (mouseNode.y - view[1]) * k * ratio +
      this.state.bubbleChartHeight / 2 +
      zY -
      (topGap - 34) -
      (mouseNode.r / 2) * ratio;

    this.tr = mouseNode.r * ratio;

    this.setState({
      mouseNode,
    });
  };

  private eventTypes: any = {};

  private onFiltersChange = (filters: OnlineVulnerabilitiesFilterOptions, eventType?: EventTypesDef) => {
    this.setState({
      filters,
    });
    this.eventTypes = Object.assign(this.eventTypes, eventType);
    this.chart?.current && this.chart.current?.initCenter();
  };

  private get filterData() {
    return vulnerabilitiesFilter(
      this.state.res?.getItems() || [],
      this.state.searchKeyword,
      this.state.filters,
      this.eventTypes,
    );
  }

  private get searchDataItems() {
    return vulnerabilitiesSearch(this.state.res?.getItems() || [], this.state.searchKeyword);
  }

  private get searchItemsNum() {
    return vulnerabilitiesImageNum(this.searchDataItems || [], nodeBasicExternalInfo);
  }

  componentDidUpdate(preProps: IProps, preState: IState) {
    if (
      !isEqual(this.state.filters, preState.filters) ||
      !isEqual(this.state.res?.data, preState.res?.data) ||
      !isEqual(this.state.expandObjKey, preState.expandObjKey) ||
      // !isEqual(this.state.ratio, preState.ratio) ||
      !isEqual(this.state.searchKeyword, preState.searchKeyword) ||
      !isEqual(this.state.selectedTestNode, preState.selectedTestNode)
    ) {
      // We convert the raw data from server into an specific structure to be used for charts and visualisation
      const hierarchyStrucutre = convertRiskExplorerOverallToHireachy(
        this.filterData,
        this.state.selectedTestNode,
        this.state.bubbleChartWidth,
      );

      this.threshold = getThreshold(this.filterData);
      const hierarchyStrucutreGroup = convertRiskExplorerOverallToHireachyGroupZoom(
        this.filterData,
        // this.state.ratio,
        this.state.expandObjKey,
      );
      this.setState({
        bubbleChartData: hierarchyStrucutre,
        bubbleChartDataGroup: hierarchyStrucutreGroup,
      });
    }
  }

  // 关闭在用
  onCloseDrawer = (data?: any) => {
    typePrivateShowNode = 'null';
    if (operation?.search) {
      typePrivateShowNode = 'search';
    }
    operation['drawer'] = false;

    this.setState({
      popupNodeID: '',
      popupNodeNS: '',
      selectedTestNode: data,
    });
  };

  onPopupSelect = (id?: any, ns?: any) => {
    this.setState({
      popupNodeID: id,
      popupNodeNS: ns,
    });
  };

  writeNumDataFn = (data?: any, node?: any) => {
    const k = node.data.id;
    nodeBasicExternalInfo[k] || (nodeBasicExternalInfo[k] = data);
  };
  // 关于明亮模式和黑暗模式
  private bright = true;

  render() {
    // if (this.state.loading) {
    //   // return <OnlineVulnerabilitiesBackground />;
    //   return <></>;
    // }

    const { containerWid, containerH, searchKeyword, res } = this.state;

    return (
      <div style={{ display: 'flex', background: '#fff', position: 'relative' }}>
        <TzInputSearch
          className="chart-search-group"
          style={{
            top: this.state.licenseMark ? '54px' : '20px',
            width: `${containerWid ? (containerWid - 64) * 0.33 : 320}px`,
          }}
          allowClear
          placeholder={translations.chart_search}
          value={this.state.searchKeyword}
          onMouseEnter={() => this.searchPopup && this.searchPopup.current.searchOver()}
          onMouseLeave={() => this.searchPopup && this.searchPopup.current.searchOut()}
          onChange={(e) => {
            typePrivateShowNode = 'null';
            if (operation?.drawer) {
              typePrivateShowNode = 'drawer';
            }
            operation['search'] = false;
            if (!e) {
              this.chart && this.chart.current.initSearch();
              this.searchPopup && this.searchPopup.current.close();
              this.setState({ searchKeyword: '' });
            }
          }}
          onSearch={(val) => {
            typePrivateShowNode = 'search';
            if (operation?.drawer) {
              typePrivateShowNode = 'all';
            }
            operation['search'] = true;
            this.chart && this.chart.current.initSearch();
            if (!this.state.omittedMark) {
              this.setState({ omittedMark: true });
            }
            this.setState({ searchKeyword: val || '' });
          }}
        />
        <div
          id="chartContainer"
          style={{
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {this.state.mouseNode ? (
            this.state.mouseNode?.data?.type ? (
              <>
                <ChartNumGroup
                  tStyle={{ top: this.tTop + 100, left: this.tleft }}
                  aStyle={{ top: this.aTop + 92, left: this.aleft }}
                  node={this.state.mouseNode}
                />
              </>
            ) : this.state.mouseNode?.depth === 1 ? (
              <ChartNSInfo
                tStyle={{ top: this.tTop + 100, left: this.tleft - 20 }}
                aStyle={{ top: this.aTop + 100, left: this.aleft }}
                ratio={this.tRatio}
                node={this.state.mouseNode}
              />
            ) : (
              <>
                <ChartInfoLoad
                  tStyle={{ top: this.tTop, left: this.tleft }}
                  aStyle={{ top: this.aTop + 90, left: this.aleft }}
                  text={this.tName}
                  tr={this.tr}
                  ratio={this.tRatio}
                  node={this.state.mouseNode}
                  numData={nodeBasicExternalInfo?.[this.state.mouseNode.data.id]}
                  countFn={this.writeNumDataFn}
                />
              </>
            )
          ) : null}
          <BubbleChart
            ref={this.chart}
            data={this.state.omittedMark ? this.state.bubbleChartData : this.state.bubbleChartDataGroup}
            width={this.state.bubbleChartWidth}
            height={this.state.bubbleChartHeight}
            select={this.onContainerSelect}
            expandCircle={this.expand}
            threshold={this.threshold}
            ratioChange={this.rChange}
            omitChange={this.omitChange}
            showTooltip={this.showTooltip}
            onCloseDrawer={this.onCloseDrawer}
            popupNodeID={this.state.popupNodeID}
            popupNodeNS={this.state.popupNodeNS}
            isbright={this.bright}
            showType={typePrivateShowNode}
            omittedMark={this.state.omittedMark}
          />
        </div>

        <OnlineVulnerabilitiesDrawer
          setNodeFn={this.onCloseDrawer}
          ref={this.detailRef}
          data={this.state.selectedTestNode}
        />
        <OnlineVulnerabilitiesFilters
          comFn={this.getDomWNumber}
          onChange={this.onFiltersChange}
          // 判断明亮（col）或者黑暗模式（row）
          isCol={this.bright}
          allData={this.state.res?.getItems()}
        />
        <OnlineVulnerabilitiesSearchPopup
          items={this.state.bubbleChartData?.children || []}
          // items={this.searchDataItems}
          // pNumData={this.searchItemsNum}
          searchKey={this.state.searchKeyword}
          popupSelect={this.onPopupSelect}
          ref={this.searchPopup}
        />
      </div>
    );
  }
}

export default OnlineVulnerabilitiesScreenV2;
