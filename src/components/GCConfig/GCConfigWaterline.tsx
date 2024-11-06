import React, { PureComponent } from 'react';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';

import { getWaterline, setWaterline } from '../../services/DataService';
import { translations } from '../../translations/translations';
import ContentCard from '../content-card/ContentCardComponent';
import FormInput from '../label-input/LableInput';
import { Skeleton } from '../skeleton/Skeleton';
import { TzButton } from '../tz-button';
import './GCConfig.scss';

interface IProps {
  title?: string;
  description?: string;
  label?: string;
  prefixName?: string;
  lineMark?: boolean;
  type: 'water';
  children?: any;
}

interface IState {
  loading: boolean;
  editMode: boolean;
  valueDay: number;
  temDay: number;
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
    };
  }

  componentWillMount() {
    this.fetchWaterline();
  }

  componentWillUnmount() {}

  fetchWaterline(): void {
    getWaterline()
      .pipe(
        tap((res: any) => {
          const item = res.getItem();
          const waterDay = item.percentage;
          this.setState({
            valueDay: waterDay,
            temDay: waterDay,
            loading: false,
          });
        }),
      )
      .subscribe();
  }

  fetchSetline(value: number): void {
    setWaterline(value)
      .pipe(
        tap((res: any) => {
          if (res.error) {
            return;
          }
          const item = res.getItem();
          const waterDay = item.percentage;
          this.setState({
            valueDay: waterDay,
            temDay: waterDay,
            editMode: !this.state.editMode,
          });
        }),
      )
      .subscribe();
  }

  onSubmit = () => {
    const value = this.state.temDay;
    this.fetchSetline(value);
  };

  toggleEditMode(): void {
    this.setState({
      editMode: !this.state.editMode,
    });
  }

  render() {
    if (this.state.loading) {
      return <Skeleton />;
    }

    const label = translations.waterline_label;
    const isEmpty = !this.state.editMode;
    const value = isEmpty ? this.state.valueDay : this.state.temDay;
    const field = 'waterline';

    return (
      <>
        <ContentCard
          title={this.props.title}
          description={this.props.description}
          customClassName="waterline-config-case"
        >
          <div className="table-case">
            <div className="input-case">
              <FormInput
                name={field}
                type="number"
                label={label}
                disabled={isEmpty}
                onChange={(value: string) => {
                  const _value = Number(value);
                  if (_value < 0 || _value > 100) {
                    return false;
                  }
                  if (isEmpty) {
                    return this.setState({
                      valueDay: _value || 1,
                    });
                  }
                  return this.setState({
                    temDay: _value || 1,
                  });
                }}
                value={'' + value}
                suffix={`% ${translations.waterline_des}`}
                inputWidth={20}
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
                    {translations.save}
                  </TzButton>
                </span>
              ) : (
                <TzButton className="btn btn-normal" onClick={() => this.toggleEditMode()}>
                  {translations.edit}
                </TzButton>
              )}
            </>
          </div>
        </ContentCard>
      </>
    );
  }
}

export default GCConfig;
