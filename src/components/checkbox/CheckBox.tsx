import React, { PureComponent } from 'react';
import classNames from 'classnames';
import './CheckBox.scss';
import './AnimatedCheckbox.scss';

interface IProps {
  onChange: (value: boolean) => void;
  checked: boolean;
  noPreAnimate?: boolean;
  label: string;
  disabled?: boolean;
  extraClass?: string[];
}

interface IState {}

class CheckBox extends PureComponent<IProps, IState> {
  render() {
    const { checked, onChange, label, extraClass, disabled, noPreAnimate } =
      this.props;

    return (
      <label
        className={classNames(
          'checkbox',
          extraClass || [],
          checked && 'active',
          disabled && 'disabled'
        )}
      >
        <input
          className={classNames([noPreAnimate ? 'no-pre-animate' : null])}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="checkbox-material">
          <span className="check"></span>
        </span>{' '}
        <span className="checkbox-label" title={label}>
          {label}
        </span>
      </label>
    );
  }
}

export default CheckBox;
