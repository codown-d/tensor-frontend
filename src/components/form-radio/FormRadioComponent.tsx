import React, { Component } from 'react';
import { ServerAlertKind } from '../../definitions';
import './FormRadioComponent.scss';

interface IProps {
  onChange: (value: string) => void;
  label: string;
  items: any[];
  name: string;
  type?: string;
  value?: string;
}

export default class FormRadio extends Component<IProps> {
  render() {
    return (
      <div className="form-radio">
        {this.props.items.map((t) => {
          return (
            <React.Fragment key={t.value}>
              <div
                className={
                  'circle ' + (this.props.value === t.value ? 'active' : '')
                }
                onClick={() => this.props.onChange(t.value)}
              >
                <span className="title">{t.label}</span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    );
  }
}
