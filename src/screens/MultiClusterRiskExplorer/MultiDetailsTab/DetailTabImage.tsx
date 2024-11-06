import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import AssetTopAction from '../../../components/AssetModule/TopActionBar';
import { TzCard } from '../../../components/tz-card';
import { DynamicObject, ImageScanSummaryResult, scanStatus, WebResponse } from '../../../definitions';

import { map, merge, tap } from 'rxjs/operators';
import { translations } from '../../../translations/translations';
import { ImageType } from '../../ImagesScanner/definition';
import moment from 'moment';
import LoadingIcon from '../../../components/loading/LoadingIcon';
import './DetailTabImage.scss';
import { SearchObj } from '../GraphResFilterHelper';
import { TzInputSearch } from '../../../components/tz-input-search';
import { TzTableServerPage } from '../../../components/tz-table';
import { TzTooltip } from '../../../components/tz-tooltip';
import { copyText, getUrlQuery } from '../../../helpers/until';
import classNames from 'classnames';
import { TzConfirm } from '../../../components/tz-modal';
import { onSubmitFailed, showSuccessMessage } from '../../../helpers/response-handlers';
import { TzDropdown } from '../../../components/tz-dropdown';
import { TablePaginationConfig } from 'antd';
import {
  addBaseImage,
  assetsImage,
  getHistory,
  getImagesScanResultList,
  getRiskImagesListInfo,
  getRiskImagesUUidCount,
  getRiskImagesUUidVerifyExistence,
  imagesList,
} from '../../../services/DataService';
import { LoadingOutlined } from '@ant-design/icons';
import { Routes } from '../../../Routes';
import { useNavigate } from 'react-router-dom';
// import { useAliveController } from 'react-activation';
import { Store } from '../../../services/StoreService';
import { tabType } from '../../ImagesScanner/ImagesScannerScreen';
import {
  SecurityIssueTd,
  sannStatusOp,
  sannStatus,
  SannStatusDom,
  getText,
  registrySelectQuesOp,
  imageAttrOp,
  ImageAttrTd,
  imageAttrTableFilterOp,
  fetchReport,
  imageScanTaskFn,
  imageSeverityOp,
  imageStatusOp,
  nodeSelectQuesOp,
  safeAttrOp,
} from '../../ImagesScanner/components/ImagesScannerDataList';
import { setBaseImageType } from '../../ImagesScanner/components/Image-scanner-detail/ImagesScannerDetail';
// import { useNavigatereFresh } from '../../../helpers/useNavigatereFresh';
import useImageColumns from '../../ImagesScanner/components/ImagesScannerDataList/useImageColumns';
import { TzFilter, TzFilterForm } from '../../../components/ComponentsLibrary';
import useTzFilter, { FilterContext } from '../../../components/ComponentsLibrary/TzFilter/useTzFilter';
import { data } from '../../../components/grid-chart/GridData';
import { TzButton } from '../../../components/tz-button';
import { isBoolean, isEqual } from 'lodash';
import { useRegistryProject, useDetectPolicyList } from '../../../services/ServiceHook';
import { configTypeEnum } from '../../ImagesScanner/ImageConfig/ImageScanConfig';
import { useAssetsClusterList } from '../../../helpers/use_fun';
interface IProps {
  children?: any;
  history?: any;
  paramData?: any;
  paramObj: SearchObj;
  initFatch?: () => void;
}
interface Filters {
  online?: any[];
  kind?: any[];
  scan_status?: any[];
  attribute?: any[];
}

let timer: any;

const defPagination = {
  current: 1,
  pageSize: 10,
  hideOnSinglePage: false,
};

const DetailTabImage = (props: IProps) => {
  const {
    paramData: { resourceKind = '', resourceName = '', namespace = '-' },
    paramObj: { type, ClusterID: clusterID = '' },
  } = props;
  let imageFromType = tabType.registry;
  let urlQuery: any = getUrlQuery();

  const listComp = useRef<any>(undefined);
  const [filters, setFilters] = useState<Filters>({
    online: [],
    kind: [],
    scan_status: [],
    attribute: [],
  });

  const [imagesUUid, setImagesUUid] = useState<any>([]);
  const [param, setParam] = useState<any>([]);
  const [imagesUUidObj, setImagesUUidObj] = useState<any>([]);
  const [imagesVerify, setImagesVerify] = useState<any>({});
  const [imagesCount, setImagesCount] = useState<any>({ all: 0, exit: 0 });

  const fetchImagesUUid = useCallback(() => {
    const data = {
      resourceKind,
      resourceName,
      cluster_key: clusterID,
      namespace,
    };
    getRiskImagesListInfo(data)
      .pipe(
        tap((res: WebResponse<any>) => {
          const items = res.getItems();
          const uuids = items.map((t) => {
            return t.uuid;
          });
          setImagesUUidObj(items);
          setImagesUUid(uuids);
        }),
      )
      .subscribe();
  }, [clusterID, namespace, resourceKind, resourceName]);

  useEffect(() => {
    fetchImagesUUid();
  }, []);

  useEffect(() => {
    if (!imagesUUid || !imagesUUid.length) {
      return;
    }
    const data = {
      uuids: imagesUUid.join(),
    };
    getRiskImagesUUidCount(data)
      .pipe(
        tap((res: WebResponse<any>) => {
          if (res.error) {
            return;
          }
          const item = res.getItem();
          setImagesCount(item);
        }),
      )
      .subscribe();
  }, [imagesUUid]);

  useEffect(() => {
    if (!imagesUUid || !imagesUUid.length) {
      return;
    }
    const data = {
      uuids: imagesUUid.join(),
    };
    getRiskImagesUUidVerifyExistence(data)
      .pipe(
        tap((res: WebResponse<any>) => {
          if (res.error) {
            return;
          }
          const item = res.getItem();
          setImagesVerify(item?.verifyExistence);
        }),
      )
      .subscribe();
  }, [imagesUUid]);

  const fetchFromServer = useCallback(
    (pagination: TablePaginationConfig, filters: any) => {
      // if (!imagesUUid?.length || !Object.keys(imagesVerify).length) {
      //   return getHistory().pipe(
      //     map(() => {
      //       return {
      //         data: [],
      //         total: [].length,
      //       };
      //     }),
      //   );
      // }
      const { current = 1, pageSize = 10 } = pagination;
      const offset = (current - 1) * pageSize;
      let pageParams = Object.assign({
        pagination: { limit: pageSize, offset },
        uuids: [],
        ...filters,
        assetImage: imagesUUidObj,
      });
      setParam(pageParams);
      return assetsImage(pageParams).pipe(
        map((res: any) => {
          let items = res.getItems().map((item: any) => {
            let o = Object.assign({ ...item, ...item.Image });
            delete o.Image;
            return o;
          });
          return {
            data: items,
            total: res?.data?.totalItems,
          };
        }),
      );
    },
    [filters, imagesUUidObj],
  );
  let imageColumns = useImageColumns({ imageFromType: tabType.registry, tableRef: listComp });
  let specialImageTypeList = useRegistryProject(tabType.registry);
  let clusterList = useAssetsClusterList();
  let detectPolicyList = useDetectPolicyList(
    tabType.registry === imageFromType
      ? configTypeEnum.regImage
      : tabType.node === imageFromType
        ? configTypeEnum.nodeImage
        : configTypeEnum.deploy,
  );
  const imagesScannerScreenFilter: any = useMemo(() => {
    let arr: any = [
      {
        label: translations.scanner_images_imageName,
        name: 'imageKeyword',
        type: 'input',
        icon: 'icon-jingxiang',
      },
      {
        label: translations.safetyProblem,
        name: 'securityIssue',
        type: 'select',
        icon: 'icon-wenti',
        props: {
          mode: 'multiple',
          options: imageFromType === tabType.registry ? registrySelectQuesOp : nodeSelectQuesOp,
        },
        condition: {
          name: 'issueIntersection',
          props: {
            optionLabelProp: 'optionLabel',
            options: [
              {
                value: 'or',
                optionLabel: <span>&cup;</span>,
                label: (
                  <>
                    <span className="mr8 fw550 f15">&cup;</span>
                    {translations.union}
                  </>
                ),
              },
              {
                value: 'and',
                optionLabel: <span>&cap;</span>,
                label: (
                  <>
                    <span className="mr8 fw550 f15">&cap;</span>
                    {translations.intersection}
                  </>
                ),
              },
            ],
          },
        },
      },
      {
        label: translations.attribute,
        name: 'imageAttr',
        type: 'select',
        icon: 'icon-shuxing_1',
        props: {
          mode: 'multiple',
          options: imageAttrTableFilterOp,
        },
        condition: {
          name: 'attrIntersection',
          props: {
            optionLabelProp: 'optionLabel',
            options: [
              {
                value: 'or',
                optionLabel: <span>&cup;</span>,
                label: (
                  <>
                    <span className="mr8 fw550 f15">&cup;</span>
                    {translations.union}
                  </>
                ),
              },
              {
                value: 'and',
                optionLabel: <span>&cap;</span>,
                label: (
                  <>
                    <span className="mr8 fw550 f15">&cap;</span>
                    {translations.intersection}
                  </>
                ),
              },
            ],
          },
        },
      },
      {
        label: translations.hitPolicy,
        name: 'policyUniqueID',
        type: 'select',
        icon: 'icon-xiangyingzhuangtai',
        props: {
          mode: 'multiple',
          options: detectPolicyList,
        },
        condition: {
          name: 'policyIntersection',
          props: {
            optionLabelProp: 'optionLabel',
            options: [
              {
                value: 'or',
                optionLabel: <span>&cup;</span>,
                label: (
                  <>
                    <span className="mr8 fw550 f15">&cup;</span>
                    {translations.union}
                  </>
                ),
              },
              {
                value: 'and',
                optionLabel: <span>&cap;</span>,
                label: (
                  <>
                    <span className="mr8 fw550 f15">&cap;</span>
                    {translations.intersection}
                  </>
                ),
              },
            ],
          },
        },
      },
      {
        label: translations.compliances_breakdown_status,
        name: 'onlineStr',
        type: 'select',
        icon: 'icon-yunhangzhuangtai',
        props: {
          mode: 'multiple',
          options: imageStatusOp,
        },
      },
      {
        label: translations.vulnerability_statistics,
        name: 'vulnStatic',
        type: 'select',
        icon: 'icon-chengdu',
        props: {
          options: imageSeverityOp,
          mode: 'multiple',
        },
      },
      {
        label: translations.security_status,
        name: 'safeAttr',
        type: 'select',
        icon: 'icon-anquanzhuangtai',
        props: {
          options: safeAttrOp,
          mode: 'multiple',
        },
      },
    ];
    if (tabType.registry === imageFromType) {
      arr.splice(1, 0, {
        label: translations.scanner_report_repo,
        name: 'projects',
        type: 'cascader',
        icon: 'icon-cangku',
        props: {
          multiple: true,
          options: specialImageTypeList,
        },
      });
    } else if (tabType.node === imageFromType) {
      arr.splice(
        1,
        0,
        {
          label: translations.compliances_breakdown_statusName,
          name: 'nodeKeyword',
          type: 'input',
          icon: 'icon-jiedian',
        },
        {
          label: translations.clusterManage_key,
          name: 'clusterKey',
          type: 'select',
          icon: 'icon-jiqun',
          props: {
            mode: 'multiple',
            options: clusterList,
          },
        },
      );
    }
    return arr;
  }, [specialImageTypeList, detectPolicyList]);

  const navigate = useNavigate();

  const data = useTzFilter({ initial: imagesScannerScreenFilter });
  const handleChange = useCallback((values: any) => {
    let temp = { ...values };
    setFilters((prev: any) => {
      temp['projects'] = temp['projects']?.map((item: string[]) => [...item].pop());
      return isEqual(values, prev) ? prev : temp;
    });
  }, []);
  // let { jump } = useNavigatereFresh();
  return (
    <div className="details-content-case">
      <TzCard
        bordered={false}
        headStyle={{ padding: 0 }}
        bodyStyle={{ paddingLeft: 0, paddingRight: 0 }}
        className="detail-info-card initCard"
      >
        {imagesCount.all && imagesCount.all !== imagesCount.exit ? (
          <div className="info-case">
            <p className={'info-description'}>
              <i className={'icon iconfont icon-xingzhuangjiehe mr8 ml10'} style={{ verticalAlign: 'initial' }}></i>
              {translations.unStandard.str81}
            </p>
          </div>
        ) : null}

        <div className="mb12">
          <FilterContext.Provider value={{ ...data }}>
            <div className={'flex-r-c'}>
              <div></div>
              <TzFilter />
            </div>
            <TzFilterForm onChange={handleChange} />
          </FilterContext.Provider>
        </div>
        <TzTableServerPage
          columns={imageColumns.slice(0, -1)}
          defaultPagination={defPagination}
          rowKey="uuid"
          rowClassName={(record, index) => {
            return !record?.exit && isBoolean(record?.exit) ? 'noHoverS' : '';
          }}
          onChange={(pagination, filters: any) => {
            setFilters((pre: any) => {
              pre = filters;
              return { ...pre };
            });
          }}
          onRow={(record) => {
            return {
              onClick: (e: any) => {
                if (!record?.exit && isBoolean(record?.exit)) return;
                navigate(
                  `${Routes.RegistryImagesDetailInfo}?imageUniqueID=${record.imageUniqueID}&imageFromType=${record.imageFromType}`,
                );
                // jump(
                //   `${Routes.RegistryImagesDetailInfo}?imageUniqueID=${record.imageUniqueID}&imageFromType=${record.imageFromType}`,
                //   'RegistryImagesDetailInfo',
                // );
              },
            };
          }}
          reqFun={fetchFromServer}
          ref={listComp}
        />
      </TzCard>
    </div>
  );
};

export default DetailTabImage;
