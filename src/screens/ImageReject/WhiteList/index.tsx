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
import { useNavigate } from 'react-router-dom';
import './index.scss';
import { TzButton } from '../../../components/tz-button';
import { TzTableServerPage } from '../../../components/tz-table';
import { TablePaginationConfig } from 'antd/lib/table';
import {
  deleteCIWhitelist,
  getCiWhitelist,
  imagerejectImageWhite,
  imagerejectRemoveWhite,
} from '../../../services/DataService';
import { map } from 'rxjs/operators';
import moment from 'moment';
import { TzTag } from '../../../components/tz-tag';
import { TzInputSearch } from '../../../components/tz-input-search';
import { TzConfirm, TzModal, TzSuccess } from '../../../components/tz-modal';
import { WebResponse } from '../../../definitions';
import { MyFormItem, TzForm, TzFormItem } from '../../../components/tz-form';
import { TzDatePicker } from '../../../components/tz-date-picker';
import { TzSelect } from '../../../components/tz-select';
import { Form } from 'antd';
import { FormInstance } from 'antd/lib/form';
import { onSubmitFailed, showSuccessMessage } from '../../../helpers/response-handlers';
import { Store } from '../../../services/StoreService';
import { TzRangePicker } from '../../../components/tz-range-picker';
import { TzInput } from '../../../components/tz-input';
import EllipsisPopover from '../../../components/ellipsisPopover/ellipsisPopover';
import { translations } from '../../../translations/translations';
import { setWhiteList } from '..';
import { keys, cloneDeep, set } from 'lodash';
import { TzFilter, TzFilterForm } from '../../../components/ComponentsLibrary';
import useTzFilter, {
  FilterContext,
} from '../../../components/ComponentsLibrary/TzFilter/useTzFilter';
import { FilterFormParam } from '../../../components/ComponentsLibrary/TzFilterForm/filterInterface';
import { getTime } from '../../../helpers/until';

export const deleteWhiteList = (row: any, callback?: (arg0: WebResponse<any>) => void) => {
  let { id, name, imageName } = row;
  TzConfirm({
    content: translations.unStandard.str49(name || imageName),
    okText: translations.delete,
    okButtonProps: { danger: true },
    cancelButtonProps: {},
    cancelText: translations.cancel,
    onOk() {
      imagerejectRemoveWhite({ id }).subscribe((res) => {
        if (!res.error) {
          showSuccessMessage(translations.unStandard.str52);
          !callback || callback(res);
        }
      });
    },
  });
};
const WhiteList = (props: any) => {
  const listComp = useRef<any>(null);
  const navigate = useNavigate();
  const [filters, setFilters] = useState<any>({});
  const whiteListColumns: any = useMemo(() => {
    return [
      {
        title: translations.image,
        dataIndex: 'imageName',
        width: '38%',
        render: (imageName: any, row: any) => (
          <EllipsisPopover lineClamp={2}>{imageName}</EllipsisPopover>
        ),
      },
      {
        title: translations.valid_until,
        dataIndex: 'expirationAt',
        render: (expirationAt: any, row: any) => getTime(expirationAt),
      },
      {
        title: translations.notificationCenter_placeEvent_updateTime,
        dataIndex: 'updatedAt',
        render: (updatedAt: any, row: any) => getTime(updatedAt),
      },
      {
        width: '140px',
        title: translations.operation,
        render: (text: any, row: any) => {
          return (
            <>
              <TzButton
                type="text"
                className="ml-8 mr4"
                onClick={(event) => {
                  setWhiteList({ type: 'edit', ...row, imageName: [row.imageName] }, () => {
                    listComp.current.refresh();
                  });
                }}
              >
                {translations.edit}
              </TzButton>
              <TzButton
                type="text"
                danger
                onClick={(event) => {
                  deleteWhiteList(row, (res) => {
                    listComp.current.refresh();
                  });
                }}
              >
                {translations.delete}
              </TzButton>
            </>
          );
        },
      },
    ];
  }, []);
  const reqFun = useCallback(
    (pagination: TablePaginationConfig) => {
      const { current = 1, pageSize = 10 } = pagination;
      const offset = (current - 1) * pageSize;
      let pageParams = {
        offset,
        limit: pageSize,
        ...filters,
      };
      return imagerejectImageWhite(pageParams).pipe(
        map(({ data }: any) => {
          let { items = [], totalItems = 0 } = data || {};
          return {
            data: items,
            total: totalItems,
          };
        }),
      );
    },
    [filters],
  );
  const imagesScannerScreenFilter: FilterFormParam[] = useMemo(
    () => [
      {
        label: translations.mirror_expression,
        name: 'imageName',
        type: 'input',
        icon: 'icon-jingxiang',
      },
      {
        label: translations.expiration_date,
        name: 'updatedAt',
        type: 'rangePickerCt',
        icon: 'icon-shijian',
        props: {
          showTime: true,
          format: 'YYYY/MM/DD HH:mm:ss',
        },
      },
    ],
    [],
  );
  const data = useTzFilter({ initial: imagesScannerScreenFilter });
  const handleChange = useCallback((values: any) => {
    const temp = {};
    keys(values).forEach((key) => {
      let _val = cloneDeep(values[key]);
      if (key === 'updatedAt') {
        _val[0] && set(temp, 'startTime', _val[0]?.valueOf());
        _val[1] && set(temp, 'endTime', _val[1]?.valueOf());
        return;
      }
      set(temp, [key], _val);
    });
    setFilters(temp);
  }, []);
  return (
    <>
      <div className="image-reject-white-list mlr32 mt4">
        <div className="mb12">
          <FilterContext.Provider value={{ ...data }}>
            <div className={'flex-r-c'}>
              <TzButton
                type={'primary'}
                onClick={() => {
                  setWhiteList({ type: 'newAdd', imageName: [] }, () => {
                    listComp.current.refresh();
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
          columns={whiteListColumns}
          className={'nohoverTable'}
          tableLayout={'fixed'}
          rowKey={'id'}
          ref={listComp}
          reqFun={reqFun}
        />
      </div>
    </>
  );
};
export default WhiteList;
