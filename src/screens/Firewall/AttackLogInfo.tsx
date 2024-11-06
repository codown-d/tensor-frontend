import { merge } from 'lodash';
import React, { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ArtTemplateDataInfo from '../../components/ComponentsLibrary/ArtTemplateDataInfo';
import TzSegmented from '../../components/ComponentsLibrary/TzSegmented';
import { attackLogDetails, logRspPkg } from '../../services/DataService';
import { translations } from '../../translations/translations';
import './AttackLogInfo.scss';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import { TzButton } from '../../components/tz-button';
import { TzTabs } from '../../components/tz-tabs';
import moment from 'moment';
import { Tittle } from '../../components/ComponentsLibrary/Tittle';

let segmentedOp = [
  {
    label: translations.request_message,
    value: 'request',
  },
  { label: translations.response_packets, value: 'response' },
];
const AttackLogInfo = (props: any) => {
  const [info, setInfo] = useState<any>(null);
  const [rspPkgData, setRspPkgData] = useState<any>(null);
  const [segmentedVal, setSegmentedVal] = useState<any>('request');

  const dataInfoList = useMemo(() => {
    if (!info) {
      return [];
    }
    const obj: any = {
      attack_ip: translations.attack_IP + '：',
      attacked_app: translations.the_attacked_app + '：',
      attack_load: translations.payload + '：',
      rule_name: translations.protection_rules + '：',
      attack_time: translations.attack_time + '：',
    };
    return Object.keys(obj).map((item) => {
      let o: any = {
        title: obj[item] || '-',
        content: info[item] || '-',
      };
      if ('attack_time' === item) {
        o['render'] = () => {
          return moment(info[item]).format('YYYY-MM-DD HH:mm:ss');
        };
      }
      return o;
    });
  }, [info]);
  let getAttackLogDetails = useCallback(() => {
    attackLogDetails(merge({}, props)).subscribe((res) => {
      if (res.error) return;
      let item = res.getItem();
      setInfo(item);
    });
  }, [props]);
  let getLogRspPkg = useCallback(
    (length = 2000) => {
      logRspPkg(merge({ length }, props)).subscribe((res) => {
        if (res.error) return;
        let item = res.getItem();
        setRspPkgData(item);
      });
    },
    [props, info?.action],
  );
  useEffect(() => {
    getAttackLogDetails();
    getLogRspPkg();
  }, []);
  let setHljsDom = (node: HTMLElement, content: string, language: string, action?: 'warn' | 'drop' | 'block') => {
    if (action == 'drop' || action == 'block') {
      $(node).addClass('hljs').empty().append(translations.unStandard.str258);
    } else {
      let html = hljs.highlight(content, { language }).value;
      $(node).addClass('hljs').empty().append(html);
    }
  };
  let items = useMemo(
    () => [
      {
        label: '',
        key: 'request',
        children: (
          <pre className={`http-code`}>
            <code
              className="language-http"
              ref={(node: any) => {
                info?.req_pkg && setHljsDom(node, info?.req_pkg || '-', 'http');
              }}
            ></code>
          </pre>
        ),
      },
      {
        label: '',
        key: 'response',
        children: (
          <pre className={`html-code`}>
            <code
              className="language"
              ref={(node: any) => {
                let language = ((content_type) => {
                  let obj: any = {
                    'text/html': 'html',
                    'text/plain': 'plain',
                    'text/xml': 'xml',
                    'image/gif': 'gif',
                    'image/jpeg': 'jpeg',
                    'image/png': 'png',
                  };
                  let key =
                    Object.keys(obj).find((item) => {
                      return content_type.indexOf(item) != -1;
                    }) || 'html';
                  return obj[key];
                })(rspPkgData?.content_type);
                setHljsDom(node, rspPkgData?.rspPkg, language, info.action);
              }}
            ></code>
            {/* intact 为false 不完整要展示显示更多报文 */}
            {rspPkgData?.intact ? null : (
              <TzButton
                className={'more-message'}
                onClick={() => {
                  getLogRspPkg(0);
                }}
              >
                {translations.expand_message}
              </TzButton>
            )}
          </pre>
        ),
      },
    ],
    [info, rspPkgData],
  );
  return (
    <div className="attack-log-info mt4">
      <Tittle title={translations.compliances_breakdown_taskbaseinfo} className={'mb16'} />
      <img alt="" src={info?.action === 'drop' ? '/images/lj.png' : '/images/gj.png'} className={'action'} />
      <ArtTemplateDataInfo data={dataInfoList} span={2} rowProps={{ gutter: [0, 0] }} />
      <TzSegmented
        className={'mb12 mt12'}
        options={segmentedOp}
        onChange={(value: any) => {
          setSegmentedVal(value);
        }}
      />
      <TzTabs items={items} tabBarStyle={{ display: 'none' }} activeKey={segmentedVal} />
    </div>
  );
};
export default AttackLogInfo;
