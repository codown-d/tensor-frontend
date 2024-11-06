import React, { Component } from 'react';
import { Prompt } from '../../../definitions';
import './AlertCenterNews.scss';
import { Subscription, timer } from 'rxjs';
import { tap } from 'rxjs/operators';
import { translations } from '../../../translations/translations';
import { Resources } from '../../../Resources';

interface IProps {
  data?: Prompt;
  cursorID: string;
  onFatchNews: Function;
}

interface IState {
  showTime?: boolean;
  newsRes?: Prompt | undefined;
}

class AlertCenterNews extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      showTime: false,
    };
  }
  private updateID: string;
  private newUpdateID: string;
  private subscription: Subscription;
  componentDidMount() {
    this.subscription = timer(0, 5000).subscribe(() => {
      this.fetchAlertData();
    });
  }
  componentDidUpdate() {}

  fetchAlertData(): void {
    this.updateID = this.props.cursorID || '0';
    !this.newUpdateID && (this.newUpdateID = this.updateID);
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  getAlertNews = () => {
    this.updateID = this.newUpdateID;
    window.localStorage.setItem('cursorID', String(this.updateID));
    this.setState({
      showTime: false,
    });
    this.props.onFatchNews();
  };
  render() {
    return (
      <>
        {this.state.newsRes?.updatesNumStr &&
        this.state.showTime &&
        this.state.newsRes?.updatesNumStr !== '0' ? (
          <div onClick={this.getAlertNews} className="news-case">
            <img src={Resources.BlueLow} alt="Info icon" />
            {translations.notificationCenter_news_have}
            <span className="refTxt">
              &nbsp;
              {this.state.newsRes?.updatesNumStr}&nbsp;
            </span>
            {translations.notificationCenter_news_newInfo}
            <span className="refTxt">
              {translations.notificationCenter_news_refresh}
            </span>
            {translations.notificationCenter_news_lookover}
          </div>
        ) : null}
      </>
    );
  }
}

export default AlertCenterNews;
