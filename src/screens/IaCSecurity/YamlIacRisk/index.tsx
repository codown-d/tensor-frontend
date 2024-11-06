import { cloneDeep, find, isArray, isEqual, isNumber, keys, merge, random, set } from 'lodash';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import ReactDOM, { createPortal } from 'react-dom';
import { HashRouter } from 'react-router-dom';
import { TzFilter, TzFilterForm } from '../../../components/ComponentsLibrary';
import ArtTemplateDataInfo from '../../../components/ComponentsLibrary/ArtTemplateDataInfo';
import useTzFilter, {
  FilterContext,
} from '../../../components/ComponentsLibrary/TzFilter/useTzFilter';
import { FilterFormParam } from '../../../components/ComponentsLibrary/TzFilterForm/filterInterface';
import EllipsisPopover from '../../../components/ellipsisPopover/ellipsisPopover';
import NoData from '../../../components/noData/noData';
import { TzCard } from '../../../components/tz-card';
import { TzTooltip } from '../../../components/tz-tooltip';
import useLayoutMainSearchWid from '../../../helpers/useLayoutMainSearchWid';
import { translations } from '../../../translations/translations';
import { SeverityIconTag } from '../../ImagesScanner/components/Image-scanner-detail/ImagesScannerDetail';
import { yamlOptionsKind } from '../../YamlScan/YamlScanInfo';
import './index.scss';
import TzMoreBtn from '../../../components/ComponentsLibrary/TzMoreBtn';
import TzAceEditor from './TzAceEditor';
import { IAceEditorProps } from 'react-ace';
import { RenderTag } from '../../../components/tz-tag';
let YamlIacRisk = (props: { option: IAceEditorProps; result: any[]; result_count: any }) => {
  let { result = [], result_count, option } = props;
  const [filters, setFilters] = useState<any>({});
  const [openIndex, setOpenIndex] = useState<any>(null);
  const [height, setHeight] = useState(600);
  const codeRef = useRef<any>(null);
  const fitlerWid = useLayoutMainSearchWid();
  let yamlInfoResult = useMemo(() => {
    return [...result]?.filter((item: any, index: any) => {
      return keys(filters).every((ite) => {
        if (isArray(filters[ite])) {
          return filters[ite].includes(item[ite]);
        } else {
          return item[ite].toLowerCase().indexOf(filters[ite].toLowerCase()) != -1;
        }
      });
    });
  }, [props.result, filters]);
  const imagesScannerScreenFilter: FilterFormParam[] = useMemo(
    () => [
      {
        label: translations.notificationCenter_details_name,
        name: 'rule_name',
        type: 'input',
        icon: 'icon-leixing',
      },
      {
        label: translations.risk_level_yaml,
        name: 'severity',
        type: 'select',
        icon: 'icon-chengdu ',
        props: {
          mode: 'multiple',
          options: yamlOptionsKind,
        },
      },
    ],
    [],
  );
  const data = useTzFilter({ initial: imagesScannerScreenFilter });
  const handleChange = useCallback((values: any) => {
    setFilters(values);
  }, []);
  let renderErrLine = useCallback((errLine, node: any) => {
    let num = $(node).text();
    if (errLine?.[num]) {
      let { type, arr } = errLine[num];
      let contents = $(node).contents();
      ReactDOM.render(
        <div
          className="err-line"
          ref={(node) => {
            $(node).parent().append(contents);
          }}
        >
          {type === 'continuous' ? (
            <div className={'len-yaml'}>
              {arr.shift()}
              {arr.length ? `-${arr.pop()}` : null}
            </div>
          ) : (
            <>
              <div className={'len-yaml'}>{arr.shift()}</div>
              {arr.length ? (
                <div className={'len-yaml'} style={{ padding: '0 2px' }}>
                  <TzTooltip title={arr.join(',')}>
                    <i className={'icon iconfont icon-a-1 f12'} style={{ lineHeight: '18px' }}></i>
                  </TzTooltip>
                </div>
              ) : null}
            </>
          )}
        </div>,
        $(node)[0],
      );
    }
  }, []);
  let getTzAceEditor = useMemo(() => {
    if (!props.option.value) return null;
    let obj = yamlInfoResult?.reduce((pre: any, item: { seq_no: any; location: any }) => {
      let { seq_no, location } = item;
      let { start_line } = location;
      if (pre[start_line]) {
        pre[start_line].arr.push(seq_no);
        let node_0 = seq_no - pre[start_line].arr[0] + 1;
        let len = pre[start_line].arr.length;
        if (len !== node_0) {
          pre[start_line].type = 'discontinuous';
        }
      } else {
        pre[start_line] = { arr: [seq_no], type: 'continuous' };
      }
      return pre;
    }, {});
    return (
      <TzAceEditor
        key={Math.random()}
        ref={codeRef}
        setOptions={{ showFoldWidgets: false }}
        {...option}
        maxLines={Infinity}
        onLoad={(editor) => {
          setTimeout(() => {
            let childNodes = $(editor.container)
              .find('.ace_gutter .ace_layer')
              .children('.ace_gutter-cell');
            $.each(childNodes, (index: any, item: any) => {
              renderErrLine(obj, item);
            });
          }, 1000);
        }}
      />
    );
  }, [yamlInfoResult, props.option]);
  let dispose = (seq_no: number) => {
    let node: any = result[seq_no - 1];
    $('.tz-ace-editor').animate({ scrollTop: (node?.location.start_line - 1) * 17 }, 300);
    setOpenIndex((pre: number) => {
      let i = pre == seq_no ? null : seq_no;
      let data: any = { startRow: undefined, endRow: undefined };
      if (isNumber(i)) {
        data = {
          startRow: node?.location.start_line - 1,
          endRow: node?.location.end_line - 1,
        };
        codeRef?.current?.gotoLine(node?.location.start_line);
      }
      codeRef?.current?.setmarkers(data);
      return i;
    });
  };
  return (
    <TzCard
      headStyle={{ display: 'none' }}
      bodyStyle={{
        paddingTop: 20,
        paddingLeft: 0,
        paddingRight: 0,
      }}
      className="yaml-iac-yisk"
    >
      <div className={'mb12'} style={{ padding: '0 20px' }}>
        <FilterContext.Provider value={{ ...data }}>
          <div className={'flex-r-c'} style={{ width: '100%' }}>
            <div
              className={'flex-r-c'}
              style={{ width: '100%', justifyContent: 'space-between', paddingRight: 12 }}
            >
              <div className="f16 fw550">
                <span style={{ color: '#3E4653' }} className="f14 fw550">
                  {translations.risk_items}
                </span>
                <span className={'f14 fw400'} style={{ fontWeight: 400, color: '#3E4653' }}>
                  {translations.unStandard.str148(result?.length)}
                </span>
              </div>
              <div>
                <SeverityIconTag data={result_count} />
              </div>
            </div>
            <TzFilter />
          </div>
          <TzFilterForm onChange={handleChange} />
        </FilterContext.Provider>
      </div>
      <div className={'flex-r'}>
        <div
          className="tz-ace-editor"
          style={{
            height: height + 'px',
            flex: 1,
            overflow: 'auto',
            position: 'relative',
          }}
          ref={(node) => {
            setTimeout(() => {
              node && setHeight(0.7 * $(node).width());
            }, 0);
          }}
        >
          {getTzAceEditor}
        </div>
        <div
          style={{
            width: fitlerWid + 8 + 36 + 20 + 10 + 'px',
            padding: '0 10px',
            paddingRight: '20px',
            height: height + 'px',
            overflow: 'auto',
            marginLeft: '10px',
          }}
        >
          {yamlInfoResult?.length ? (
            yamlInfoResult?.map((item: any, index: any) => {
              let { seq_no, rule_name, rule_description, description, resolution, severity } = item;
              return (
                <TzCard
                  title={
                    <>
                      {`${seq_no} ${rule_name}`}
                      <RenderTag type={severity} className={'middle ml8'} />
                    </>
                  }
                  className={'yaml-info-card'}
                  bordered={false}
                  onClick={() => {
                    dispose(seq_no);
                  }}
                  headStyle={{ paddingLeft: 16 }}
                  bodyStyle={{
                    padding: '0px 16px 22px',
                    position: 'relative',
                    borderBottom: '1px solid #F4F6FA',
                  }}
                >
                  {openIndex != seq_no ? (
                    <p className="mb8">
                      <EllipsisPopover lineClamp={2}>
                        <span style={{ color: '#3E4653' }}>{rule_description}</span>
                      </EllipsisPopover>
                    </p>
                  ) : (
                    <ArtTemplateDataInfo
                      className={'item-mb8'}
                      rowProps={{ gutter: [0, 0] }}
                      span={1}
                      data={[
                        {
                          title: translations.notificationCenter_columns_description + '：',
                          content: rule_description,
                          render: () => {
                            return rule_description;
                          },
                        },
                        {
                          title: translations.description_problem + '：',
                          content: description,
                          render: () => {
                            return description || '-';
                          },
                        },
                        {
                          title: translations.repair_scenarios + '：',
                          content: resolution,
                          render: () => {
                            return resolution;
                          },
                        },
                      ]}
                    />
                  )}
                  <TzMoreBtn
                    className="more-btn"
                    onClick={function (v?: any): void {
                      dispose(seq_no);
                      //   setOpenIndex((pre) => {
                      //     return pre == seq_no ? null : seq_no;
                      //   });
                    }}
                    expand={openIndex == seq_no}
                  />
                </TzCard>
              );
            })
          ) : (
            <NoData />
          )}
        </div>
      </div>
    </TzCard>
  );
};
export default YamlIacRisk;
