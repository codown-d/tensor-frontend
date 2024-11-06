import React, { PureComponent } from 'react';
import { Subscription, throwError } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { GCItem, HotStorageView, WebResponse } from '../../definitions';
import { getGC, getStorage, getTtlDays, setTtlDays, startGC } from '../../services/DataService';
import { translations } from '../../translations/translations';
import ContentCard from '../content-card/ContentCardComponent';
import FormInput from '../label-input/LableInput';
import { Skeleton } from '../skeleton/Skeleton';
import { Line } from 'rc-progress';
import './GCConfig.scss';
import { TzButton } from '../tz-button';
import { showFailedMessage, showSuccessMessage } from '../../helpers/response-handlers';
import { TzModal } from '../../components/tz-modal';
import { TzInputNumber } from '../tz-input-number';

interface IProps {
  title?: string;
  description?: string;
  label?: string;
  available?: string;
  prefixName?: string;
  lineMark?: boolean;
  type: 'cold' | 'hotLogic' | 'hotOffline';
  children?: any;
  labelDes?: string;
}

interface IState {
  loading: boolean;
  editMode: boolean;
  valueDay: number;
  temDay: number;
  clearnItem: any;
  clearLoading: boolean;
  strongItem: any;
  spaceGB: number | undefined;
  percent: number | undefined;
  visible: boolean;
  value: string;
  inputValue: string;
}

class GCConfig extends PureComponent<IProps, IState> {
  private auditSubscription: Subscription;
  constructor(props: IProps) {
    super(props);
    this.state = {
      loading: true,
      editMode: false,
      valueDay: 0,
      temDay: 0,
      clearnItem: undefined,
      clearLoading: false,
      strongItem: undefined,
      spaceGB: undefined,
      percent: undefined,
      visible: false,
      value: '',
      inputValue: '',
    };
  }

  componentWillMount() {
    this.fetchSorageData();
    this.fetchTtlDay();
    const daysData = window.localStorage.getItem('clearDays');
    if (daysData) {
      const type = this.props.type;
      const id = JSON.parse(daysData)[type];
      id && this.fetchGetGC(id);
    }
  }

  componentWillUnmount() {
    this.auditSubscription && this.auditSubscription.unsubscribe();
  }

  getPercent(item: HotStorageView) {
    if (item.used && item.total && item.used > item.total) {
      return 100.0;
    }
    return Math.round((item.used / item.total) * 10000) / 100;
  }

  getSpaceInGB(item: HotStorageView) {
    if (item.used && item.total && item.used > item.total) {
      return 0;
    }
    return Math.round(((item.total - item.used) / Math.pow(1024, 3)) * 100) / 100;
  }

  fetchStartGC(value: string): void {
    const type = this.props.type;
    const data = {
      dataType: type,
      daysOffset: Number(value),
    };
    startGC(data)
      .pipe(
        tap((res: WebResponse<GCItem>) => {
          if (res.error) {
            return;
          }
          const item = res.getItem();
          if (item) {
            const type = this.props.type;
            const dataDay = window.localStorage.getItem('clearDays') || '{}';
            const clearDays = Object.assign({}, JSON.parse(dataDay), {
              [type]: item?.id,
            });
            window.localStorage.setItem('clearDays', JSON.stringify(clearDays));
            this.setState(
              {
                clearnItem: item,
                visible: false,
                clearLoading: true,
              },
              () => this.fetchGetGC(),
            );
          }
        }),
      )
      .subscribe();
  }

  fetchGetGC(lid = ''): void {
    const item = this.state.clearnItem;
    if ((item && item.status === 'inprogress') || lid) {
      const id = lid || item?.id;
      this.auditSubscription = getGC(id).subscribe((res: WebResponse<any>) => {
        if (res.getItem()?.status === 'inprogress') {
          this.setState({
            clearLoading: true,
          });
        }
        if (res.getItem()?.status === 'completed') {
          const type = this.props.type;
          const dataDay = window.localStorage.getItem('clearDays') || '{}';
          const clearDays = Object.assign({}, JSON.parse(dataDay), {
            [type]: null,
          });
          window.localStorage.setItem('clearDays', JSON.stringify(clearDays));
          this.auditSubscription.unsubscribe();
          this.setState({
            clearLoading: false,
          });
        }
        if (res.error && res.error.code === '401') {
          this.auditSubscription.unsubscribe();
        }
      });
    }
  }

  fetchSorageData(): void {
    const type = this.props.type;
    getStorage(type)
      .pipe(
        tap((res: WebResponse<HotStorageView>) => {
          const item = res.getItem();
          if (item) {
            const percent = this.getPercent(item);
            const spaceGB = this.getSpaceInGB(item);
            this.setState({
              percent: percent,
              spaceGB: spaceGB,
            });
          }
        }),
        finalize(() => {
          this.setState({
            loading: false,
          });
        }),
      )
      .subscribe();
  }

  fetchTtlDay(): void {
    const type = this.props.type;
    getTtlDays(type)
      .pipe(
        tap(
          (
            res: WebResponse<{
              ttlDays: number;
            }>,
          ) => {
            const item = res.getItem();
            if (item) {
              const valueDay = item.ttlDays;
              const type = this.props.type;
              if (type === 'cold') {
                const data = { cold: valueDay };
                window.localStorage.setItem('cold', JSON.stringify(data));
              }
              this.setState({
                valueDay: valueDay,
                temDay: valueDay,
              });
            }
          },
        ),
      )
      .subscribe();
  }

  fetchSetTtlDay(): void {
    const type = this.props.type;
    const data = {
      dataType: type,
      ttlDays: this.state.temDay,
    };
    setTtlDays(data)
      .pipe(
        tap((res: any) => {
          const item = res.getItem();
          if (item) {
            const valueDay = item.ttlDays;
            showSuccessMessage(`${translations.saveSuccess}`);
            this.setState({
              temDay: valueDay,
              valueDay: valueDay,
              editMode: !this.state.editMode,
            });
          }
        }),
        catchError((error) => {
          showFailedMessage(`${translations.saveFailed}`, '500');
          return throwError(error);
        }),
      )
      .subscribe();
  }

  onSubmit = () => {
    this.fetchSetTtlDay();
  };

  toggleEditMode(): void {
    this.setState({
      editMode: !this.state.editMode,
    });
  }

  onChangeDays = (value: string) => {
    const _value = Number(value);
    if (_value < 0) {
      return false;
    }
    const isEmpty = !this.state.editMode;
    const type = this.props.type;
    if (type === 'hotLogic') {
      const coldDay = window.localStorage.getItem('cold') || '{}';
      const coldNum = JSON.parse(coldDay)['cold'];
      if (coldNum && coldNum < _value) {
        return false;
      }
    }
    if (isEmpty) {
      return this.setState({
        valueDay: _value || 1,
      });
    }
    return this.setState({
      temDay: _value || 1,
    });
  };

  showVisible = (visible = false) => {
    this.setState({
      visible: visible,
    });
  };

  render() {
    if (this.state.loading) {
      return <Skeleton />;
    }

    const label = this.props.label;
    const des = this.props.labelDes;
    const available = this.props.available;
    const isEmpty = !this.state.editMode;
    const value = isEmpty ? this.state.valueDay : this.state.temDay;
    const field = this.props.type + 'gc';
    const percent = this.state.percent;
    const spaceGB = this.state.spaceGB;
    const loading = this.state.clearLoading;
    return (
      <>
        <ContentCard
          title={this.props.title}
          description={this.props.description}
          customClassName="audit-config-case mb40"
        >
          <div className="table-case">
            <div className="input-case">
              <FormInput
                name={field}
                type="number"
                label={label}
                disabled={isEmpty}
                description={des}
                onChange={(value: string) => this.onChangeDays(value)}
                value={'' + value}
              />
            </div>
            <>
              {this.state.editMode ? (
                <span>
                  <TzButton className="btn btn-cancel" onClick={() => this.toggleEditMode()}>
                    {translations.cancel}
                  </TzButton>
                  <TzButton
                    className="btn btn-save"
                    onClick={() => this.onSubmit()}
                    style={{ marginLeft: '10px' }}
                  >
                    {translations.auditConfig_saveConfiguration}
                  </TzButton>
                </span>
              ) : (
                <TzButton className="btn btn-normal" onClick={() => this.toggleEditMode()}>
                  {translations.edit}
                </TzButton>
              )}
            </>
          </div>
          {this.props.lineMark ? (
            <div>
              <div className="line-mark">
                <span>
                  {available}:{typeof spaceGB !== 'undefined' && spaceGB >= 0 ? spaceGB : 0}
                  GB&nbsp;&nbsp;&nbsp;
                  {translations.auditConfig_used}: {percent}%{' '}
                </span>
                <TzButton
                  className="btn btn-normal"
                  onClick={() => !loading && this.showVisible(true)}
                  loading={loading}
                  // style={{ minWidth: loading ? 150 : 80 }}
                >
                  {loading ? translations.auditConfig_gc_run : translations.auditConfig_gc_started}
                </TzButton>
              </div>
              <div className="line-case">
                <Line
                  style={{
                    height: '8px',
                    width: '100%',
                    borderRadius: 6,
                    background: '#DFE1E6',
                  }}
                  percent={percent || 0}
                  strokeWidth={1}
                  strokeColor="#2177D1"
                />
              </div>
            </div>
          ) : null}
        </ContentCard>
        <TzModal
          okText={translations.auditConfig_btnDel}
          okType="danger"
          open={this.state.visible}
          closable={false}
          title={translations.auditConfig_gc_started}
          onCancel={() => this.showVisible()}
          onOk={() => this.fetchStartGC(this.state.inputValue || String(value))}
          className="gc-model"
          centered
        >
          <TzInputNumber
            className="model-input"
            min={0}
            max={value}
            value={this.state.inputValue || value}
            onChange={(val) => this.setState({ inputValue: String(val || value) })}
          />
        </TzModal>
      </>
    );
  }
}

export default GCConfig;
