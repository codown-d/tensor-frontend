import React, { PureComponent } from 'react';
import classNames from 'classnames';
import './OnlineVulnerabilitiesFilters.scss';
import { translations } from '../../../translations/translations';
import { of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import {
  OnlineVulnerabilitiesFilterCount,
  OnlineVulnerabilitiesFilterOptions,
  RiskExplorerOverall,
} from '../../../definitions';
import { Resources } from '../../../Resources';
import { TensorCheckBoxGroup } from '../../../components/checkbox-group/CheckboxGroup';
import {
  addNewTyprFilter,
  calculateStatsForFilter,
  dealRepeatArray,
} from '../OnlineVulnerabilities/OnlineVulnerabilitiesHelper';
import { vulnerabilitiesFilter } from '../OnlineVulnerabilitiesGraphList/OnlineFilterHelper';
import { TzTooltip } from '../../../components/tz-tooltip';
import { Store } from '../../../services/StoreService';

interface IProps {
  children?: any;
  collapsed?: boolean;
  onChange?: (data: any) => void;
  isCol?: boolean;
  allData?: RiskExplorerOverall[];
  comFn: () => void;
}

enum ButtonState {
  Present = 'present',
  Leaving = 'leaving',
  Hidden = 'hidden',
}

enum FilterSectionName {
  event = 'event',
  node = 'node',
  level = 'level',
}

interface FilterRecord {
  [FilterSectionName.event]?: {
    index: number;
    val?: string[];
  };
  [FilterSectionName.node]?: {
    index: number;
    val?: string[];
  };
  [FilterSectionName.level]?: {
    index: number;
    val?: string[];
  };
}

interface IState {
  selectButtonState: ButtonState;
  deselectButtonState: ButtonState;
  collapsed: boolean;
  form: OnlineVulnerabilitiesFilterOptions;
  filterList: FilterRecord;
  hidefiltrecord: FilterSectionName[];
  collapsedTime?: number;
  floatMark: boolean;
  licenseMark: boolean;
}

function negateObjectShallow(obj: any, val: boolean): any {
  if (typeof obj !== 'object') {
    return obj;
  }

  const newObject: any = {};
  const keys = Object.keys(obj);
  for (const key of keys) {
    newObject[key] = val;
  }

  return newObject;
}

let clusterIDCache = '';
export let eventTypes = {
  // imageVulnerabilities: false,
  // applicationVulnerabilities: false,
  // runtimeThreats: false,
  noThreats: false,
};
export interface EventTypesDef {
  applicationVulnerabilities: boolean;
  noThreats: boolean;
  imageVulnerabilities: boolean;
  runtimeThreats: boolean;
  [x: string]: boolean;
}

export const nodeTypes = {
  edgeService: false,
  internalService: false,
};

export const levelTypes = {
  criticalLevel: false,
  highLevel: false,
  mediumLevel: false,
  lowLevel: false,
  negligibleLevel: false,
  unknownLevel: false,
};

export let initialFilters = {
  ...levelTypes,
  ...nodeTypes,
  ...eventTypes,
};

const levelTypesData = [
  {
    field: 'criticalLevel',
    label: translations.onlineVulnerability_filters_criticalLevel,
  },
  {
    field: 'highLevel',
    label: translations.onlineVulnerability_filters_highLevel,
  },
  {
    field: 'mediumLevel',
    label: translations.onlineVulnerability_filters_mediumLevel,
  },
  {
    field: 'lowLevel',
    label: translations.onlineVulnerability_filters_lowLevel,
  },
  {
    field: 'negligibleLevel',
    label: translations.onlineVulnerability_filters_negligibleLevel,
  },
  {
    field: 'unknownLevel',
    label: translations.onlineVulnerability_filters_unknownLevel,
  },
];
const nodeTypesData = [
  {
    field: 'edgeService',
    label: translations.onlineVulnerability_filters_edgeService,
  },
  {
    field: 'internalService',
    label: translations.onlineVulnerability_filters_internalService,
  },
];
let eventTypesData = [
  // {
  //   field: 'imageVulnerabilities',
  //   label: translations.onlineVulnerability_filters_imageVulnerabilities,
  // },
  // {
  //   field: 'applicationVulnerabilities',
  //   label: translations.onlineVulnerability_filters_applicationVulnerabilities,
  // },
  // {
  //   field: 'runtimeThreats',
  //   label: translations.onlineVulnerability_filters_runtimeThreats,
  // },
  {
    field: 'noThreats',
    label: translations.onlineVulnerability_filters_unknownLevel,
  },
];

const termCollapsed = true;

class OnlineVulnerabilitiesFilters extends PureComponent<IProps, IState> {
  state = {
    collapsed: termCollapsed,
    // selectButtonState: ButtonState.Hidden,
    // deselectButtonState: ButtonState.Present,
    selectButtonState: ButtonState.Present,
    deselectButtonState: ButtonState.Hidden,
    form: initialFilters,
    filterList: {} as FilterRecord,
    hidefiltrecord: [] as FilterSectionName[],
    collapsedTime: undefined,
    floatMark: !termCollapsed,
    licenseMark: false,
  };

  prefiler: FilterSectionName[];

  componentDidMount() {
    this.prefiler = [];
    if (this.props.collapsed === false) {
      this.setState({ collapsed: this.props.collapsed });
    }
    // window.addEventListener('click', this.closeFiler, false);
    // 切换集群，重置筛选项
    this.storeGetClusterID();
    this.fetchLicenseMark();
  }

  fetchLicenseMark(): void {
    Store.licenseToast
      .pipe(
        tap((res) => {
          this.setState({
            licenseMark: res,
          });
        }),
      )
      .subscribe();
  }

  private get statsLen() {
    const allData = this.props.allData || [];
    const fl = { ...this.state.filterList } as any;
    const allcount = calculateStatsForFilter(allData);

    // 获取接口中新加入的风险类型
    const { newEventType, newEventTypeData = [] } = addNewTyprFilter(allData);

    eventTypesData = dealRepeatArray(eventTypesData, newEventTypeData);
    eventTypes = Object.assign(eventTypes, newEventType);
    initialFilters = Object.assign(initialFilters, newEventType);

    if (Object.keys(fl).length === 0) {
      return allcount;
    }
    if (!fl[FilterSectionName.event]) {
      fl[FilterSectionName.event] = {
        index: Infinity,
        val: Object.keys(eventTypes),
      };
    }
    if (!fl[FilterSectionName.node]) {
      fl[FilterSectionName.node] = {
        index: Infinity,
        val: Object.keys(nodeTypes),
      };
    }
    if (!fl[FilterSectionName.level]) {
      fl[FilterSectionName.level] = {
        index: Infinity,
        val: Object.keys(levelTypes),
      };
    }
    const flkeys = Object.keys(fl);
    const flsort = flkeys
      .map((k) => {
        const item = fl[k];
        return {
          index: item.index,
          val: item.val || [],
          key: k,
        };
      })
      .sort((a, b) => {
        return a.index - b.index;
      });

    const countarr = [] as any[];
    countarr.push(allcount);

    let prefilerobj = {} as any;
    flsort.forEach((item) => {
      const vals = item.val as string[];
      const filerobj = vals.reduce((v, k) => {
        v[k] = true;
        return v;
      }, {} as any);
      prefilerobj = Object.assign({}, prefilerobj, filerobj);
      const fata = vulnerabilitiesFilter(allData, '', prefilerobj);
      const _count = calculateStatsForFilter(fata);
      countarr.push(_count);
    });

    const rescount = {} as any;
    flsort.forEach((item, index) => {
      const k = item.key;
      const rolcount = countarr[index] || {};
      if (k === FilterSectionName.event) {
        Object.keys(eventTypes).forEach((kk) => {
          rescount[kk] = rolcount[kk];
        });
      } else if (k === FilterSectionName.node) {
        Object.keys(nodeTypes).forEach((kk) => {
          rescount[kk] = rolcount[kk];
        });
      } else if (k === FilterSectionName.level) {
        Object.keys(levelTypes).forEach((kk) => {
          rescount[kk] = rolcount[kk];
        });
      }
    });

    return rescount as OnlineVulnerabilitiesFilterCount;
  }

  private setField(field: string[], value: any, secname: FilterSectionName): void {
    const _form = this.state.form as any;
    const newData = {
      ..._form,
    };

    let _isEqual = true;
    field.forEach((k, index) => {
      const nval = !!value[index];
      if (!_form[k] || !!_form[k] !== nval) {
        newData[k] = !!value[index];
        _isEqual = false;
      }
    });
    if (_isEqual) {
      return;
    }
    // if (newData.noThreats) {
    //   if (
    //     (newData.criticalLevel ||
    //       newData.highLevel ||
    //       newData.mediumLevel ||
    //       newData.lowLevel ||
    //       newData.negligibleLevel) &&
    //     !newData.unknownLevel
    //   ) {
    //     newData.noThreats = false;
    //   }
    // }

    if (this.props.onChange) {
      this.props.onChange(newData);
    }

    const isAllSelected = Object.values(newData).every((t) => t === true);
    const isAllDeselected = Object.values(newData).every((t) => t === false);

    const fl = { ...this.state.filterList } as any;

    const thisAction = (() => {
      if (secname === FilterSectionName.event) {
        return Object.keys(eventTypes).filter((k) => newData[k]);
      } else if (secname === FilterSectionName.node) {
        return Object.keys(nodeTypes).filter((k) => newData[k]);
      } else if (secname === FilterSectionName.level) {
        return Object.keys(levelTypes).filter((k) => newData[k]);
      }
    })();
    const isEmpty = !thisAction || thisAction.length === 0;
    if (isEmpty) {
      delete fl[secname];
    } else {
      const maxindex = Object.keys(fl).reduce((v, k: any) => {
        const cindex = fl[k]!.index;
        if (v < cindex) {
          return cindex;
        }
        return v;
      }, -1);
      fl[secname] = { index: maxindex + 1, val: thisAction };
    }

    const hidefiltrecord = this.state.hidefiltrecord.slice(0);

    if (isAllDeselected) {
      this.prefiler = [];
    }

    if (isEmpty) {
      const _index = this.prefiler.findIndex((item) => item === secname);
      if (_index !== -1) {
        const tempprefiler = this.prefiler.slice(0);
        this.prefiler.splice(_index, 1);
        const pre = tempprefiler[_index - 1];
        if (pre) {
          const cindex = hidefiltrecord.findIndex((item) => item === pre);
          if (cindex !== -1) {
            hidefiltrecord.splice(cindex, 1);
          }
        }
      }
      const cindex = hidefiltrecord.findIndex((item) => item === secname);
      if (cindex !== -1) {
        hidefiltrecord.splice(cindex, 1);
      }
    } else {
      if (this.prefiler.length === 0) {
        this.prefiler.push(secname);
      } else {
        if (!this.prefiler.includes(secname)) {
          hidefiltrecord.push(this.prefiler[this.prefiler.length - 1]);
          this.prefiler.push(secname);
        }
      }
    }

    this.setState({
      deselectButtonState: !isAllDeselected ? ButtonState.Present : ButtonState.Hidden,
      selectButtonState: !isAllSelected ? ButtonState.Present : ButtonState.Hidden,
      form: newData,
      filterList: fl,
      hidefiltrecord,
      collapsedTime: undefined,
    });
  }

  private renderCheckBoxList(
    title: string,
    valueType: any,
    vlaueTypeData: any,
    tensorCheckBoxList: any,
    secname: FilterSectionName,
  ) {
    return (
      <div className="mt20 plr20 minw240" style={{ paddingRight: '32px' }}>
        <span className="subtitle">{title}</span>
        <div>
          <TensorCheckBoxGroup
            className="check_list"
            name="riskLevelFilter"
            value={Object.keys(valueType).filter((k) => !!(this.state.form as any)[k])}
            onChange={(val) => {
              const ndata = vlaueTypeData.reduce(
                (v: any, i: any) => {
                  v[0].push(i.field);
                  v[1].push(val.includes(i.field));
                  return v;
                },
                [[], []] as any,
              );
              this.setField(ndata[0], ndata[1], secname);
            }}
            tensorCheckBoxList={tensorCheckBoxList}
          />
        </div>
      </div>
    );
  }

  private get levelCheckBoxList() {
    return levelTypesData
      .filter((item) => item.field !== 'negligibleLevel')
      .map((item) => {
        let finalLabel = item.label;
        const count = (this.statsLen as any)[item.field];
        if (count || count === 0) {
          finalLabel = `${finalLabel} (${count})`;
        }
        return {
          label: finalLabel,
          value: item.field,
          otherProps: { className: item.field },
        };
      });
  }
  private riskLevelFilter() {
    return this.renderCheckBoxList(
      translations.onlineVulnerability_filters_riskLevelFilter,
      levelTypes,
      levelTypesData,
      this.levelCheckBoxList,
      FilterSectionName.level,
    );
  }

  private get nodeCheckBoxList() {
    return nodeTypesData.map((item) => {
      let finalLabel = item.label;
      const count = (this.statsLen as any)[item.field];
      if (count || count === 0) {
        finalLabel = `${finalLabel} (${count})`;
      }
      return {
        label: finalLabel,
        value: item.field,
      };
    });
  }
  private nodeTypeFilter() {
    return this.renderCheckBoxList(
      translations.onlineVulnerability_filters_nodeType,
      nodeTypes,
      nodeTypesData,
      this.nodeCheckBoxList,
      FilterSectionName.node,
    );
  }

  private get eventCheckBoxList() {
    const statsLen = this.statsLen;
    return eventTypesData.map((item) => {
      let finalLabel = item.label;
      const count = (statsLen as any)[item.field];
      if (count || count === 0) {
        finalLabel = `${finalLabel} (${count})`;
      }
      return {
        label: finalLabel,
        value: item.field,
      };
    });
  }
  private eventTypeFilter() {
    const eventCheckBoxList = this.eventCheckBoxList;
    return this.renderCheckBoxList(
      translations.onlineVulnerability_filters_eventsType,
      eventTypes,
      eventTypesData,
      eventCheckBoxList,
      FilterSectionName.event,
    );
  }

  storeGetClusterID(): void {
    Store.clusterID
      .pipe(
        tap((clusterID: string) => {
          if (clusterID && clusterIDCache !== clusterID) {
            clusterIDCache = clusterID;
            this.clearAll();
          }
        }),
      )
      .subscribe();
  }

  clearAll() {
    of(null)
      .pipe(
        tap(() => {
          this.prefiler = [];
          this.setState({
            deselectButtonState: ButtonState.Leaving,
            form: negateObjectShallow(initialFilters, false),
            filterList: {},
            hidefiltrecord: [],
            collapsedTime: undefined,
          });
        }),
        delay(300),
        tap(() => {
          this.setState({
            deselectButtonState: ButtonState.Hidden,
            selectButtonState: ButtonState.Present,
          });
          if (this.props.onChange) {
            this.props.onChange({ ...this.state.form });
          }
        }),
      )
      .subscribe();
  }

  selectAll() {
    of(null)
      .pipe(
        tap(() => {
          this.prefiler = [];
          this.setState({
            selectButtonState: ButtonState.Leaving,
            form: negateObjectShallow(initialFilters, true),
            filterList: {
              [FilterSectionName.event]: {
                index: 0,
                val: Object.keys(eventTypes),
              },
              [FilterSectionName.node]: {
                index: 1,
                val: Object.keys(nodeTypes),
              },
              [FilterSectionName.level]: {
                index: 2,
                val: Object.keys(levelTypes),
              },
            },
            hidefiltrecord: [],
            collapsedTime: undefined,
          });
        }),
        delay(300),
        tap(() => {
          this.setState({
            selectButtonState: ButtonState.Hidden,
            deselectButtonState: ButtonState.Present,
          });
          if (this.props.onChange) {
            this.props.onChange({ ...this.state.form });
          }
        }),
      )
      .subscribe();
  }

  private toggleFilters(nval?: boolean) {
    setTimeout(() => {
      this.props.comFn && this.props.comFn();
    }, 300);

    this.setState(
      Object.assign(
        {
          collapsed: nval !== undefined ? nval : !this.state.collapsed,
        },
        !this.state.collapsed
          ? {
              collapsedTime: new Date().getTime(),
            }
          : undefined,
      ),
    );
    let t = !this.state.collapsed ? 300 : 0;
    setTimeout(() => {
      this.setState({ floatMark: !this.state.collapsed });
    }, t);
  }

  private closeFiler = () => {
    this.toggleFilters(true);
  };
  private stopPropagation(e: any) {
    e && e.stopPropagation && e.stopPropagation();
  }

  componentWillUnmount() {
    // window.removeEventListener('click', this.closeFiler);
  }
  private typesResTextArr(fullData: any, typeSection: any, typesData: any) {
    return Object.keys(typeSection).reduce((v: any, k) => {
      const ck = fullData[k];
      if (ck) {
        const label = typesData.find((item: any) => item.field === k)?.label || '';
        v.push(label);
      }
      return v;
    }, []);
  }
  private clearSectionType = (typesResTextArr: any, typesData: any, secname: FilterSectionName) => {
    const arr: any[] = [];
    typesResTextArr.forEach((label: any) => {
      const field = typesData.find((item: any) => item.label === label)?.field;
      if (field) {
        arr.push(field);
      }
    });
    if (arr.length > 0) {
      this.setField(arr, [], secname);
    }
  };
  private resultList = () => {
    const data = this.state.form as any;

    const eventTypesRes = this.typesResTextArr(data, eventTypes, eventTypesData);
    const nodeTypesRes = this.typesResTextArr(data, nodeTypes, nodeTypesData);
    const levelTypesRes = this.typesResTextArr(data, levelTypes, levelTypesData);

    const clearLevel = () =>
      this.clearSectionType(levelTypesRes, levelTypesData, FilterSectionName.level);
    const clearNode = () =>
      this.clearSectionType(nodeTypesRes, nodeTypesData, FilterSectionName.node);
    const clearEvent = () =>
      this.clearSectionType(eventTypesRes, eventTypesData, FilterSectionName.event);

    const allTxt = 'All';

    const fl = { ...this.state.filterList } as any;
    const flkeys = Object.keys(fl);
    const flsort = flkeys
      .map((k) => {
        const item = fl[k];
        let val = item.val || [];
        let isAll = false;
        let title = '';
        let fun: any;
        if (k === FilterSectionName.event) {
          isAll = val.length === Object.keys(eventTypes).length;
          title = translations.onlineVulnerability_filters_eventsType;
          fun = clearEvent;
          val = val.map((v: any) => {
            return eventTypesData.find((item) => item.field === v)!.label;
          });
        } else if (k === FilterSectionName.node) {
          isAll = val.length === Object.keys(nodeTypes).length;
          title = translations.onlineVulnerability_filters_nodeType;
          fun = clearNode;
          val = val.map((v: any) => {
            return nodeTypesData.find((item) => item.field === v)!.label;
          });
        } else if (k === FilterSectionName.level) {
          isAll = val.length === Object.keys(levelTypes).length;
          title = translations.onlineVulnerability_filters_riskLevelFilter;
          fun = clearLevel;
          val = val.map((v: any) => {
            return levelTypesData.find((item) => item.field === v)!.label;
          });
        }

        return {
          index: item.index,
          val: val.length > 0 ? (val as string[]) : undefined,
          key: k,
          isAll,
          title,
          fun,
        };
      })
      .sort((a, b) => {
        return a.index - b.index;
      });

    return (
      <div className="filter_result">
        {flsort.map((item) => {
          const valstr = item.val ? item.val.join(',') : '';
          return (
            <div title={valstr} onClick={item.fun} key={item.key}>
              <h5>{item.title}&nbsp;:&nbsp;</h5>
              <span>{item.isAll ? allTxt : valstr}</span>
            </div>
          );
        })}
      </div>
    );
  };

  render() {
    return (
      <div
        className={classNames(
          'online-vulnerabilities-filters filter-group',
          this.state.collapsed ? 'show' : 'close',
        )}
        style={{ top: this.state.licenseMark ? '122px' : '88px' }}
        onClick={this.stopPropagation}
      >
        <>
          <div className={'btn-title-case df dfac dfjb plr20 pt16 minw240'}>
            <div className="df dfac w100p">
              {translations.onlineVulnerability_filters_title}&nbsp;
              <span className="icon-case">
                <TzTooltip title={translations.reset_filter}>
                  <i
                    className={'icon iconfont icon-refresh f16'}
                    onClick={() => this.clearAll()}
                  ></i>
                </TzTooltip>
              </span>
            </div>
            <span
              className={classNames('icon-case', {
                'float-close-btn': this.state.floatMark,
              })}
              style={{ top: this.state.licenseMark ? '122px' : '88px' }}
            >
              <TzTooltip
                placement="left"
                title={
                  this.state.floatMark ? translations.expand_filter : translations.collapse_filter
                }
              >
                <i
                  className={'icon iconfont icon-arrow-double f20'}
                  onClick={() => this.toggleFilters()}
                ></i>
              </TzTooltip>
            </span>
          </div>
          <>
            {/* {!this.state.hidefiltrecord.includes(FilterSectionName.node) &&
                (!exitOne ||
                  (exitOne && this.state.collapsedTime === undefined)) &&
                this.nodeTypeFilter()}
              {!this.state.hidefiltrecord.includes(FilterSectionName.event) &&
                (!exitOne ||
                  (exitOne && this.state.collapsedTime === undefined)) &&
                this.eventTypeFilter()}
              {!this.state.hidefiltrecord.includes(FilterSectionName.level) &&
                (!exitOne ||
                  (exitOne && this.state.collapsedTime === undefined)) &&
                this.riskLevelFilter()} */}
            {/* { this.nodeTypeFilter()} */}
            {this.eventTypeFilter()}
            {this.riskLevelFilter()}
            {/* {this.resultList()} */}
            {/* <div className={'bgCase'}>
                {this.state.deselectButtonState !== ButtonState.Hidden && (
                  <span
                    className={classNames(
                      'sub-action fade-in scale-in-center',
                      this.state.deselectButtonState === ButtonState.Leaving &&
                        'fade-out'
                    )}
                    onClick={() => this.clearAll()}
                  >
                    {translations.onlineVulnerability_filters_clearAll}
                  </span>
                )}
                {this.state.selectButtonState !== ButtonState.Hidden && (
                  <span
                    className={classNames(
                      'sub-action fade-in scale-in-center',
                      this.state.selectButtonState === ButtonState.Leaving &&
                        'fade-out'
                    )}
                    onClick={() => this.selectAll()}
                  >
                    {translations.onlineVulnerability_filters_selectAll}
                  </span>
                )}
              </div> */}
          </>
        </>
      </div>
    );
  }
}

export default OnlineVulnerabilitiesFilters;
