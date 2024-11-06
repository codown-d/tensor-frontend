import React, { PureComponent } from 'react';
import { ServerAlert } from '../../definitions';
import './AlertDetailsScreen.scss';
import { translations } from '../../translations/translations';
import { renderTableDomTemplate } from './AlertRulersScreens';
import { setTemp, tampTit } from './AlertCenterScreen';

interface IProps {
  children?: any;
  data: ServerAlert<any>;
  mark?: string;
}
interface IState {
  isShowMore: boolean;
}

interface DealData {
  title: string;
  content: any;
}

const ruleData = [
  {
    title: translations.notificationCenter_details_name,
    content: undefined,
    kind: 'name',
    CKind: 'Name',
  },
  {
    title: translations.notificationCenter_details_description,
    content: undefined,
    kind: 'description',
    CKind: 'Description',
  },
  {
    title: translations.notificationCenter_details_severity,
    content: undefined,
    kind: 'severity',
    CKind: 'Severity',
  },
];

const fileData = [
  {
    title: translations.notificationCenter_details_podName,
    content: undefined,
    kind: 'podName',
  },
  {
    title: translations.notificationCenter_details_category,
    content: undefined,
    kind: 'category',
  },
  {
    title: translations.notificationCenter_details_namespace,
    content: undefined,
    kind: 'namespace',
  },
  {
    title: translations.notificationCenter_details_podUid,
    content: undefined,
    kind: 'podUid',
  },
];

type ruleDataType = (typeof ruleData)[number];
type fileDataType = (typeof fileData)[number];

const dealData = (mark: string, data: any) => {
  if (mark === 'rule') {
    const newRuleData: DealData[] = ruleData.map((t: ruleDataType, key: number) => {
      let obj: any = {
        title: t.title,
        content: data?.rule?.[t.kind] || data?.rule?.[t.CKind],
      };
      if ('severity' === t.kind) {
        let type = setTemp(obj.content);
        let str = tampTit[type];
        obj['render'] = (row: any) => {
          return <span className={`btn-state btn-${type.toLowerCase()}`}>{str}</span>;
        };
      }
      return obj;
    });
    const { rule } = data;
    if (rule && rule.customKV) {
      const newCustomKVData = Object.keys(rule.customKV).map((t) => {
        return {
          title: t,
          content: rule.customKV[t],
        };
      });
      return [...newRuleData, ...newCustomKVData];
    }
    return newRuleData;
  }
  if (mark === 'file' || mark === 'default') {
    const histories = data.history?.slice(0);
    const lastHistoryItem = histories?.pop();
    const newFileData: DealData[] = fileData.map((t: fileDataType, key: number) => {
      const newCont = lastHistoryItem ? lastHistoryItem[t.kind] : undefined;
      return {
        title: t.title,
        content: data.rule[t.kind] || data[t.kind] || newCont,
      };
    });
    if (lastHistoryItem && lastHistoryItem.customKV) {
      const newCustomKVData = Object.keys(lastHistoryItem.customKV).map((t) => {
        return {
          title: t,
          content: lastHistoryItem.customKV[t],
        };
      });
      return [...newFileData, ...newCustomKVData];
    }
    return newFileData;
  }
};
export default class AlertDetails extends PureComponent<IProps, IState> {
  componentDidMount() {}
  componentDidUpdate() {}

  render() {
    const mark = this.props.mark || 'default';
    const data = dealData(mark, this.props.data) || [];
    return (
      <>
        {mark === 'rule' ? (
          <div>
            <p className={'mb16'}>
              <i className={'icon iconfont icon-jianceguize1 mr6'}></i>
              <span className="details-case-item family-s">
                {translations.notificationCenter_details_rule}
              </span>
            </p>
            {renderTableDomTemplate(data)}
          </div>
        ) : null}
      </>
    );
  }
}
