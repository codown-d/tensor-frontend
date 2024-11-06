import React, { Component } from 'react';
import { TzTooltip } from '../tz-tooltip';
import './labelInput.scss';

interface IProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onChange: (value: string | any) => void;
  label?: string;
  name?: string;
  type?: string;
  value?: string;
  disabled?: boolean;
  description?: string;
  suffix?: string;
  inputWidth?: number | string;
}

interface IState {
  isOpen: boolean;
}

export default class FormInput extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      isOpen: false,
    };
  }
  changeOpen = (open = false) => {
    this.setState({
      isOpen: !!open,
    });
  };

  render() {
    const isOpen = this.state.isOpen;
    const description = this.props.description;

    return (
      <div className="label-input">
        <div className="form-label-wrapper">
          {this.props.label ? (
            <label className="form-input-label">{this.props.label}:</label>
          ) : (
            ''
          )}
          <span className="input">
            <input
              {...this.props}
              autoComplete={'off'}
              autoFocus={this.props.autoFocus || false}
              type={this.props.type || 'text'}
              id={this.props.id}
              disabled={!!this.props.disabled}
              value={this.props.value}
              placeholder={this.props.placeholder || ''}
              onChange={(el) => {
                return this.props.onChange(el.target.value);
              }}
              style={{ width: this.props.inputWidth || '100%' }}
            />
            {this.props.suffix ? (
              <span style={{ color: '#3E4653' }}>{this.props.suffix}</span>
            ) : (
              ''
            )}
          </span>
        </div>
        {description ? (
          <TzTooltip placement="topLeft" title={this.props.description}>
            <div className="prompt-logo">i</div>
          </TzTooltip>
        ) : null}
      </div>
    );
  }
}
