import React, { Component } from 'react';
import './ContentCardComponent.scss';

interface IProps {
  children: any;
  title?: string;
  description?: string;
  tableContainer?: boolean;
  customClassName?: string;
  actions?: any;
}

export default class ContentCard extends Component<IProps> {
  render() {
    return (
      <div
        className={
          'content-card ' +
          (this.props.tableContainer ? 'table-wrapper' : '') +
          (this.props.customClassName ? this.props.customClassName : '')
        }
      >
        <div className="content-card-actions">
          {this.props.actions ? this.props.actions : null}
        </div>

        {this.props.title ? <span className="content-title">{this.props.title}</span> : null}
        {this.props.description ? (
          <div className="content-card-description">
            {this.props.description}
          </div>
        ) : null}

        <div className="content-card-content">{this.props.children}</div>
      </div>
    );
  }
}
