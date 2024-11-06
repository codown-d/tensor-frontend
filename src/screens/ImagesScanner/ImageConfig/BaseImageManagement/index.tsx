import Form, { FormItemProps } from 'antd/lib/form';
import { TablePaginationConfig } from 'antd/lib/table';
import { cloneDeep, debounce, isEqual, keys, merge, set } from 'lodash';
import moment from 'moment';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { catchError, map, tap } from 'rxjs/operators';
import { TzFilter, TzFilterForm } from '../../../../components/ComponentsLibrary';
import useTzFilter, {
  FilterContext,
} from '../../../../components/ComponentsLibrary/TzFilter/useTzFilter';
import { FilterFormParam } from '../../../../components/ComponentsLibrary/TzFilterForm/filterInterface';
import EllipsisPopover from '../../../../components/ellipsisPopover/ellipsisPopover';
import { TzButton } from '../../../../components/tz-button';
import { TzForm, TzFormItem, MyFormItem } from '../../../../components/tz-form';
import { TzConfirm } from '../../../../components/tz-modal';
import { TzSelect } from '../../../../components/tz-select';
import { TzTableServerPage } from '../../../../components/tz-table';
import { RenderTag } from '../../../../components/tz-tag';
import { SelectItem, WebResponse, scanStatus } from '../../../../definitions';
import { onSubmitFailed, showSuccessMessage } from '../../../../helpers/response-handlers';
import { Routes } from '../../../../Routes';
import {
  startSync,
  getSyncStatus,
  removeRepo,
  getRepoList,
  getBaseImageList,
  addBaseImage,
  imagesList,
  getCiImages,
} from '../../../../services/DataService';
import { translations } from '../../../../translations/translations';
import { useRepoTypes } from '../RepoManagement/use_fun';
import {
  ImageAttrTd,
  ImageInfoTd,
  SecurityIssueTd,
  imageAttrOp,
  imageAttrTableFilterOp,
  imageSeverityOp,
  imageStatusOp,
  registrySelectQuesOp,
  safeAttrOp,
} from '../../components/ImagesScannerDataList';
import { Subscription, throwError } from 'rxjs';
import { tabType } from '../../ImagesScannerScreen';
import { Histogram } from '../../ImagesCI/CI';
import { FormInstance } from 'antd/es/form/Form';
import { useDetectPolicyList, useRegistryProject } from '../../../../services/ServiceHook';
import { setBaseImageType } from '../../components/Image-scanner-detail/ImagesScannerDetail';
import { configTypeEnum } from '../ImageScanConfig';
import { useDebounceFn } from 'ahooks';
import { useNavigatereFresh } from '../../../../helpers/useNavigatereFresh';

const AddBaseImageModel = (props: { formIns: FormInstance; data: any }) => {
  let { formIns, data } = props;
  const [repos, setRepos] = useState<SelectItem[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [pageNum, setPageNum] = useState<number>(0);
  const [pageEnd, setPageEnd] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const imageSub = useRef<Subscription | null>(null);
  const fetchRepoList = useCallback(() => {
    getRepoList({ limit: Number.MAX_SAFE_INTEGER }).subscribe((resp) => {
      let items = resp.getItems();
      setRepos(
        items.map((item) => {
          return {
            value: item.id,
            label: item.url,
          };
        }),
      );
    });
  }, []);
  useEffect(() => {
    formIns.setFieldsValue(data);
    fetchRepoList();
    return () => {
      formIns.resetFields();
    };
  }, []);
  let registry_ids = Form.useWatch('registry_ids', formIns);
  const fetchData = useCallback(
    (imageKeyword) => {
      if (!registry_ids) return;
      imageSub?.current && imageSub.current.unsubscribe();
      setLoading(true);
      imageSub.current = imagesList({
        imageFromType: tabType.registry,
        imageKeyword,
        projects: [registry_ids + ''],
        pagination: { limit: 10, offset: pageNum * 10 },
      })
        .pipe(
          tap((resp: WebResponse<any>) => {
            let items = resp.getItems().map((ite) => {
              return {
                label: `${ite.fullRepoName}${ite.tag}`,
                value: ite.imageUniqueID,
              };
            });
            setImages((pre) => pre.concat(items));
            if (items.length === 10) {
              setPageNum((pre) => pre + 1);
            } else {
              setPageEnd(true);
            }
            setLoading(false);
          }),
          catchError((error) => {
            return throwError(error);
          }),
        )
        .subscribe();
    },
    [pageNum, registry_ids],
  );
  const { run: debounceFetch } = useDebounceFn((val) => fetchData(val), {
    wait: 500,
  });
  let initFetchData = (val?: string) => {
    setImages([]);
    setPageNum(0);
    setSearch('');
    setPageEnd(false);
    debounceFetch(val || '');
  };
  useEffect(() => {
    initFetchData();
  }, [registry_ids]);

  return (
    <TzForm form={formIns}>
      <TzFormItem
        label={translations.library}
        name="registry_ids"
        rules={[
          {
            required: true,
            message: translations.originalWarning_pleaseSelect + translations.library,
          },
        ]}
      >
        <TzSelect
          showSearch
          optionFilterProp="children"
          placeholder={translations.scanner_config_chooseRepo}
          options={repos}
        />
      </TzFormItem>

      <TzFormItem
        label={translations.image}
        name="imageIds"
        rules={[
          {
            required: true,
            message: translations.originalWarning_pleaseSelect + translations.image,
          },
        ]}
      >
        <TzSelect
          loading={loading}
          mode="multiple"
          maxTagCount={1}
          virtual={false}
          placeholder={translations.scanner_config_chooseImage}
          filterOption={false}
          options={images}
          onSearch={(search) => {
            initFetchData(search);
          }}
          onPopupScroll={function (e) {
            e.persist();
            const { target }: any = e;
            if (target.scrollTop + target.offsetHeight === target.scrollHeight) {
              if (loading || pageEnd) return;
              debounceFetch(search);
            }
          }}
        />
      </TzFormItem>
    </TzForm>
  );
};
export const BaseImageManagement = (props: any) => {
  const imageListComp = useRef(undefined as any);
  let repoTypes = useRepoTypes();
  const [filters, setFilters] = useState<any>({});
  const reqFun = useCallback(
    (pagination: TablePaginationConfig) => {
      const { current = 1, pageSize = 10 } = pagination;
      const offset = (current - 1) * pageSize;
      let newFilters = merge({}, filters, { imageAttr: ['base'] });
      let pageParams = Object.assign({
        pagination: { limit: pageSize, offset },
        uuids: [],
        imageFromType: tabType.registry,
        ...newFilters,
      });
      return imagesList(pageParams).pipe(
        map((res: any) => {
          let items = res.getItems();
          return {
            data: items,
            total: res?.data?.totalItems,
          };
        }),
      );
    },
    [props.imageFromType, filters],
  );
  const imageColumns = useMemo(() => {
    return [
      {
        title: translations.microseg_namespace_baseInfo,
        dataIndex: 'fullRepoName',
        ellipsis: { showTitle: false },
        render: (description: any, row: any) => {
          return <ImageInfoTd imageFromType={tabType.registry} {...row} />;
        },
      },
      {
        title: translations.attribute,
        dataIndex: 'imageAttr',
        width: '8.5%',
        render: (imageAttr: any) => {
          return <ImageAttrTd {...imageAttr} imageFromType={tabType.registry} />;
        },
      },
      {
        title: translations.vulnerability_statistics,
        width: '18%',
        dataIndex: 'vulnStatic',
        key: 'vulnStatic',
        render: (vulnStatic: any) => {
          return <Histogram severityHistogram={vulnStatic} />;
        },
      },
      {
        title: translations.compliances_breakdown_status,
        dataIndex: 'online',
        width: '9%',
        render: (online: any, row: any) => {
          return <RenderTag type={online ? 'online' : 'offline'} />;
        },
      },
      {
        title: translations.safetyProblem,
        dataIndex: 'securityIssue',
        width: '14%',
        render: (securityIssue: any, row: any) => {
          return <SecurityIssueTd securityIssue={securityIssue} imageFromType={tabType.registry} />;
        },
      },
      {
        title: translations.hitPolicy,
        width: '12%',
        dataIndex: 'riskPolicy',
        key: 'riskPolicy',
        render: (riskPolicyName: any[], row: any) => {
          return (
            <EllipsisPopover lineClamp={2}>
              {riskPolicyName.map((item) => item.name).join(' , ')}
            </EllipsisPopover>
          );
        },
      },
      {
        title: translations.scanner_report_operate,
        key: 'operate',
        width: '8%',
        render: (_: any, row: any) => {
          let { imageUniqueID } = row;
          let imageType = row.imageAttr.imageType;
          return (
            <>
              {false && (
                <TzButton
                  type="text"
                  onClick={() => {
                    editBaseImage(row, () => {
                      imageListComp.current.refresh();
                    });
                  }}
                >
                  {translations.edit}
                </TzButton>
              )}
              <TzButton
                type="text"
                className={'ml4'}
                danger
                onClick={(e) => {
                  e.stopPropagation();
                  setBaseImageType({ imageUniqueID, imageType }, (d: any) => {
                    imageListComp.current.refresh();
                  });
                }}
              >
                {translations.scanner_config_delete}
              </TzButton>
            </>
          );
        },
      },
    ];
  }, []);
  let specialImageTypeList = useRegistryProject(tabType.registry);
  let detectPolicyList = useDetectPolicyList(configTypeEnum.regImage);
  const imagesScannerScreenFilter: any = useMemo(() => {
    let arr: any = [
      {
        label: translations.scanner_images_imageName,
        name: 'imageKeyword',
        type: 'input',
        icon: 'icon-jingxiang',
      },
      {
        label: translations.scanner_report_repo,
        name: 'projects',
        type: 'cascader',
        icon: 'icon-cangku',
        props: {
          multiple: true,
          options: specialImageTypeList,
        },
      },
      {
        label: translations.safetyProblem,
        name: 'securityIssue',
        type: 'select',
        icon: 'icon-wenti',
        props: {
          mode: 'multiple',
          options: registrySelectQuesOp,
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
    return arr;
  }, [specialImageTypeList, detectPolicyList]);
  const data = useTzFilter({ initial: imagesScannerScreenFilter });
  const handleChange = useCallback((values: any) => {
    let temp = { ...values };
    setFilters((prev: any) => {
      temp['projects'] = temp['projects']?.map((item: string[]) => [...item].pop());
      return isEqual(values, prev) ? prev : temp;
    });
  }, []);
  const [formIns] = Form.useForm();
  const editBaseImage = useCallback((row: any, callback?: () => void) => {
    let { id, name } = row;
    TzConfirm({
      title: id ? translations.edit_base_image : translations.scanner_config_addBaseImage,
      content: <AddBaseImageModel data={row} formIns={formIns} />,
      width: '520px',
      okText: id ? translations.save : translations.scanner_config_confirm,
      cancelText: translations.cancel,
      onOk() {
        return formIns.validateFields().then((val) => {
          addBaseImage(
            merge({}, val, {
              imageFromType: tabType.registry,
            }),
          ).subscribe((res) => {
            callback && callback();
          });
        });
      },
    });
  }, []);
  let { jump } = useNavigatereFresh();
  return (
    <div className="image-setting">
      <div className="mb12">
        <FilterContext.Provider value={{ ...data }}>
          <div className={'flex-r-c'}>
            <TzButton
              type={'primary'}
              onClick={() => {
                editBaseImage({}, () => {
                  imageListComp.current.refresh();
                });
              }}
            >
              {translations.scanner_config_confirm}
            </TzButton>
            <TzFilter />
          </div>
          <TzFilterForm onChange={handleChange} />
        </FilterContext.Provider>
      </div>
      <TzTableServerPage
        columns={imageColumns}
        rowKey="id"
        reqFun={reqFun}
        ref={imageListComp}
        onRow={(record) => {
          return {
            onClick: () => {
              jump(
                `${Routes.RegistryImagesDetailInfo}?imageUniqueID=${record.imageUniqueID}&imageFromType=${tabType.registry}`,
                'RegistryImagesDetailInfo',
              );
            },
          };
        }}
      />
    </div>
  );
};
