import React, {
  forwardRef,
  PureComponent,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import './index.scss';
import { TzButton } from '../../../components/tz-button';
import { TzTableServerPage } from '../../../components/tz-table';
import { TablePaginationConfig } from 'antd/lib/table';
import {
  getHistory,
  malwareDetail,
  malwareFile,
  relatedImage,
  sensitiveDetail,
  sensitiveFile,
  webshellContent,
  webshellDetail,
  webshellFile,
} from '../../../services/DataService';
import { map } from 'rxjs/operators';
import { TzInputSearch } from '../../../components/tz-input-search';
import { WebResponse } from '../../../definitions';
import { Store } from '../../../services/StoreService';
import EllipsisPopover from '../../../components/ellipsisPopover/ellipsisPopover';
import { translations } from '../../../translations/translations';
import { Observable } from 'rxjs';
import { TzCard } from '../../../components/tz-card';
import ArtTemplateDataInfo from '../../../components/ComponentsLibrary/ArtTemplateDataInfo';
import { questionEnum } from '../components/ImagesScannerDataList';
import { TextHoverCopy } from '../../AlertCenter/AlertCenterScreen';
import { downloadFile, getTime } from '../../../helpers/until';
import { JumpImageDetail } from '../../MultiClusterRiskExplorer/components';
import { Routes } from '../../../Routes';
import { tabType } from '../ImagesScannerScreen';
import TzAceEditor from '../../IaCSecurity/YamlIacRisk/TzAceEditor';
import { chunk, find } from 'lodash';
const ImageFileInfo = (props: any) => {
  const { type } = useParams();
  const [result] = useSearchParams();
  let [query] = useState({
    uniqueID: result.get('uniqueID'),
    imageFromType: result.get('imageFromType'),
    deployRecordID: result.get('deployRecordID'),
    imageUniqueID: result.get('imageUniqueID'),
  });
  let [webshellContentCode, setWebshellContentCode] = useState<any[]>([]);
  const [info, setInfo] = useState<any>();
  let [searchRelatedImage, setSearchRelatedImage] = useState<any>('');
  const listComp = useRef<any>(null);
  const navigate = useNavigate();
  const columns: any = useMemo(() => {
    return [
      {
        title: translations.scanner_images_imageName,
        dataIndex: 'image',
        width: '25%',
        render: (image: any, row: any) => {
          return <JumpImageDetail imageUniqueID={row.imageUniqueID} imageFromType={query.imageFromType} name={image} />;
        },
      },
      {
        title: translations.scanner_report_repo,
        dataIndex: 'registry',
        width: '25%',
        render: (item: any[], row: any) => {
          return item.length ? (
            <EllipsisPopover lineClamp={2}>
              {item.map((ite: { name: any; url: any }) => `${ite.name}(${ite.url})`).join(' ，')}
            </EllipsisPopover>
          ) : (
            '-'
          );
        },
      },
      {
        title: translations.compliances_breakdown_statusName,
        dataIndex: 'node',
        width: '25%',
        render: (node: any, row: any) => {
          return node.length ? (
            <EllipsisPopover lineClamp={2}>
              {node.map((ite: { hostname: any }) => ite.hostname).join(' ，')}
            </EllipsisPopover>
          ) : (
            '-'
          );
        },
      },
      {
        title: translations.scanner_detail_line_container,
        dataIndex: 'container',
        render: (container: string[], row: any) => {
          return container.length ? <EllipsisPopover lineClamp={2}>{container.join(' ，')}</EllipsisPopover> : '-';
        },
      },
    ];
  }, [query]);

  let getwebshellContent = useCallback(() => {
    webshellContent(query).subscribe((res) => {
      let items = res.getItems().map((item, index) => {
        item['index'] = index;
        return item;
      });
      setWebshellContentCode(items);
    });
  }, [query]);
  let getDetailData = useCallback(() => {
    if (!(type && query.uniqueID)) return;
    let fnObj: { [x: string]: Observable<WebResponse<any>> } = {
      [questionEnum.exceptionSensitive]: sensitiveDetail(query),
      [questionEnum.exceptionMalware]: malwareDetail(query),
      [questionEnum.exceptionWebshell]: webshellDetail(query),
    };
    type &&
      fnObj[type].subscribe((res) => {
        if (res.error) return;
        setInfo(res.getItem());
      });
    if (questionEnum.exceptionWebshell === type) {
      getwebshellContent();
    }
  }, [type, query]);
  useEffect(() => {
    getDetailData();
  }, [getDetailData]);
  const l = useLocation();
  let init = useCallback(() => {
    let href =
      query.imageFromType === tabType.registry || query.imageFromType === tabType.node
        ? `${Routes.RegistryImagesDetailInfo}?imageUniqueID=${query.imageUniqueID}&imageFromType=${query?.imageFromType}`
        : `${Routes.DeployImageInfo}?deployRecordID=${query?.deployRecordID}`;
    Store.breadcrumb.next([
      {
        children: translations.mirror_lifecycle,
        href: Routes.ImagesCILifeCycle,
      },
      {
        children:
          query.imageFromType === tabType.registry
            ? translations.scanner_report_repoImage
            : query.imageFromType === tabType.node
              ? translations.scanner_report_nodeImage
              : translations.imageReject_toonline,
        href: `${Routes.ImagesCILifeCycle}?tab=${query.imageFromType}`,
      },
      {
        children: translations.scanner_detail_title,
        href,
      },
      {
        children:
          type === questionEnum.exceptionSensitive
            ? translations.sensitive_file_details
            : type === questionEnum.exceptionMalware
              ? translations.trojan_virus_details
              : type === questionEnum.exceptionWebshell
                ? translations.webshell_details
                : '-',
      },
    ]);
    Store.header.next({
      title:
        type === questionEnum.exceptionSensitive
          ? info?.filename
          : type === questionEnum.exceptionMalware
            ? info?.name
            : info?.filename,
      extra: (
        <TzButton
          onClick={(e) => {
            e.stopPropagation();
            downloadFile(
              { ...query, downloadFilename: info.downloadFilename },
              questionEnum.exceptionSensitive === type
                ? sensitiveFile
                : questionEnum.exceptionMalware === type
                  ? malwareFile
                  : webshellFile,
              e,
            );
          }}
        >
          {translations.scanner_report_download}
        </TzButton>
      ),
      onBack: () => {
        navigate(-1);
      },
    });
  }, [info, type, query, l]);
  useEffect(() => {
    init();
  }, [init]);
  let reqFunRelatedImage = useCallback(
    (pagination: TablePaginationConfig) => {
      if (!info) {
        return getHistory().pipe(
          map(() => {
            return {
              data: [],
              total: [].length,
            };
          }),
        );
      }
      const { current = 1, pageSize = 10 } = pagination;
      const offset = (current - 1) * pageSize;
      let o = {};
      if (type === questionEnum.exceptionSensitive) {
        o = { sensitiveMd5: info.md5 };
      } else if (type === questionEnum.exceptionMalware) {
        o = { malwareMd5: info.md5 };
      } else if (type === questionEnum.exceptionWebshell) {
        o = { webshellMd5: info.md5 };
      }
      return relatedImage({
        offset,
        limit: pageSize,
        imageKeyword: searchRelatedImage,
        ...o,
      }).pipe(
        map((res) => {
          let items = res.getItems();
          return {
            data: items,
            total: res?.data?.totalItems,
          };
        }),
      );
    },
    [info, searchRelatedImage],
  );
  let dataInfoLists = useMemo(() => {
    if (!info || !type) return [];
    const obj: any = {
      [questionEnum.exceptionSensitive]: {
        filepath: translations.scanner_detail_file_path + '：',
        md5: 'MD5' + '：',
      },
      [questionEnum.exceptionMalware]: {
        filename: translations.scanner_detail_file_name + '：',
        filepath: translations.scanner_detail_file_path + '：',
        md5: 'MD5' + '：',
      },
      [questionEnum.exceptionWebshell]: {
        filepath: translations.scanner_detail_file_path + '：',
        filetype: translations.scanner_detail_file_type + '：',
        mod: translations.file_right + '：',
        os: translations.oS_version + '：',
        md5: 'MD5' + '：',
        updatedAt: translations.lastUpdated + '：',
        riskDetail: translations.risk_details + '：',
        recommend: translations.disposal_suggestions + '：',
      },
    };
    return Object.keys(obj[type]).map((item) => {
      let o: any = {
        title: obj[type][item] || '-',
        content: info[item],
      };
      if ('filepath' === item || 'filename' === item) {
        o['render'] = (row: any) => {
          return <TextHoverCopy text={info[item]} />;
        };
      }
      if ('mod' === item) {
        o['render'] = () => {
          return info[item].perm || '-';
        };
      }
      if ('updatedAt' === item) {
        o['render'] = () => {
          return getTime(info[item]);
        };
      }
      return o;
    });
  }, [info]);
  const codeRef = useRef<any>(null);
  let { code, errCode, markers, contentCode } = useMemo(() => {
    let errCode: any = {};
    let markers: any[] = [];
    let code = webshellContentCode
      ?.reduce((pre, item: any, index: number) => {
        let { line, problem = [] } = item;
        pre.push(line);
        if (problem.length != 0) {
          errCode[index] = [...problem];
          problem.forEach((ite: string) => {
            markers.push({
              startRow: index,
              endRow: index,
              className: 'error-webshell',
              type: 'text',
              startCol: line.indexOf(ite),
              endCol: line.indexOf(ite) + ite.length,
            });
          });
        }
        return pre;
      }, [])
      .join('\r\n');
    let contentCode = chunk(webshellContentCode, 20);
    return { code, errCode, markers, contentCode };
  }, [webshellContentCode]);
  return (
    <div className={`image-file-info ${type} mlr32`}>
      <TzCard
        title={translations.compliances_breakdown_taskbaseinfo}
        className="mb20"
        bodyStyle={{ paddingBottom: '0px' }}
      >
        <ArtTemplateDataInfo data={dataInfoLists} span={2} rowProps={{ gutter: [0, 0] }} />
      </TzCard>
      <TzCard
        className="mb20"
        title={translations.clusterGraphList_navImage}
        extra={
          <TzInputSearch
            placeholder={translations.enter_image_repository_information}
            onChange={setSearchRelatedImage}
          />
        }
      >
        <TzTableServerPage
          tableLayout={'fixed'}
          columns={columns}
          className={'nohoverTable'}
          reqFun={reqFunRelatedImage}
          loading={false}
          defaultPagination={{ showQuickJumper: false }}
          ref={listComp}
        />
      </TzCard>
      {type === questionEnum.exceptionWebshell ? (
        <TzCard title={translations.problem_code_snippet} className="mb40">
          <div
            style={{
              alignItems: 'flex-start',
              display: 'table',
              width: '100%',
              maxHeight: '640px',
              background: '#f4f6fa',
              padding: '12px 0',
            }}
          >
            <div className="err-line-webshell">
              <div style={{ overflow: 'hidden', maxHeight: '600px' }}>
                {contentCode.map((item) => {
                  let node =
                    find(item, (ite) => {
                      return ite.problem?.length;
                    }) || item[0];
                  let index = node.index;
                  return (
                    <p
                      className={`code-line ${errCode[index] ? 'err' : ''}`}
                      onClick={() => {
                        if (errCode[index]) {
                          codeRef?.current?.gotoLine(index);
                        }
                      }}
                    ></p>
                  );
                })}
              </div>
            </div>
            <div
              style={{
                display: 'table-cell',
              }}
            >
              <TzAceEditor
                key={Math.random()}
                ref={codeRef}
                setOptions={{}}
                mode={'text'}
                markers={markers}
                value={code}
                readOnly={true}
              />
            </div>
          </div>
        </TzCard>
      ) : null}
    </div>
  );
};
export default ImageFileInfo;
