import React, { useState, useEffect } from 'react';
import { openAPIToken, managementCenterDocs } from '../../services/DataService';
import { translations, localLang } from '../../translations/translations';
import './index.scss';
import { map } from 'rxjs/operators';
import { TzMessageSuccess, TzMessageWarning } from '../../components/tz-mesage';
import { LinkOutlined, CopyOutlined } from '@ant-design/icons';
import { DealData, renderTableDomTemplate } from '../AlertCenter/AlertRulersScreens';
import { DynamicObject, SupportedLangauges, WebResponse } from '../../definitions';
import EllipsisPopover from '../../components/ellipsisPopover/ellipsisPopover';
const OpenAPI = () => {
  const [openAPIInfo, setOpenAPIInfo] = useState<DealData[]>([]);
  const copyText = () => {
    const text = $('#text').text();
    const input = document.getElementById('input');
    (input as any).value = text;
    (input as any).select();
    if (document.execCommand('copy')) {
      TzMessageSuccess(translations.scanner_detail_toast_copy_succ);
    } else {
      TzMessageWarning(translations.scanner_detail_toast_copy_fail);
    }
  };
  useEffect(() => {
    openAPIToken()
      .pipe(
        map((r: any) => {
          let res = r.data.item;
          res['readAuth'] = translations.allModules;
          let filter: string[] = [];
          let translationStr: DynamicObject = {
            token: translations.token,
            readAuth: translations.readAuth,
            modules: translations.modules,
            guideURL: translations.guideURL,
          };
          const latestWarnInfo: DealData[] = [];
          Object.keys(translationStr).forEach((item: string) => {
            const obj: DealData = {
              title: translationStr[item] || item,
              content: res[item],
            };
            if (item === 'guideURL') {
              obj['render'] = () => {
                return (
                  <a href={res[item]} target="_blank" rel="noopener noreferrer">
                    <LinkOutlined />
                    Open API {translations.guideURL}
                  </a>
                );
              };
            }
            if (item === 'modules') {
              obj['render'] = (item) => {
                if (!res[item]) {
                  return <></>;
                }
                let content = item.content.map((it: any) => {
                  if (localLang === SupportedLangauges.Chinese) {
                    return it.module_name_zh;
                  } else {
                    return it.module_name_en;
                  }
                });
                return <EllipsisPopover>{content.join(',')}</EllipsisPopover>;
              };
            }
            if (item === 'token') {
              obj['render'] = (item) => {
                return (
                  <div>
                    <CopyOutlined onClick={copyText} />
                    &nbsp;&nbsp;
                    <textarea id="input" className="p-a" style={{ right: 0, opacity: 0, zIndex: -10 }}></textarea>
                    <p id="text" style={{ display: 'inline-block' }}>
                      {item.content}
                    </p>
                  </div>
                );
              };
            }
            filter.includes(item) || latestWarnInfo.push(obj);
          });
          managementCenterDocs()
            .pipe(
              map((r: WebResponse<any>) => {
                let items = r.getItems();
                let arr: any = items.map((item) => {
                  return {
                    title: item.description,
                    content: item.path,
                    render: () => {
                      return (
                        <>
                          <a href={`/apiguide/${item.path}?v=${new Date().getTime()}`} target="_blank" rel="noreferrer">
                            <LinkOutlined />
                            {item.description}
                          </a>
                        </>
                      );
                    },
                  };
                });
                setOpenAPIInfo([...latestWarnInfo, ...arr]);
              }),
            )
            .subscribe();
        }),
      )
      .subscribe();
  }, []);
  return (
    <div className="open-api mb40">
      <p className="title">{translations.scanner_detail_tab_base}</p>
      <div className="open-api-info">{renderTableDomTemplate(openAPIInfo, 'details-content-large')}</div>
    </div>
  );
};
export default OpenAPI;
