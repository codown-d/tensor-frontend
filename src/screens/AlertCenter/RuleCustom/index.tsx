import { TablePaginationConfig } from 'antd';
import { get, isEqual, uniqWith } from 'lodash';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { map } from 'rxjs/operators';
import EllipsisPopover from '../../../components/ellipsisPopover/ellipsisPopover';
import { TzButton } from '../../../components/tz-button';
import TzInputSearch from '../../../components/tz-input-search';
import { TzConfirm } from '../../../components/tz-modal';
import { TzTableServerPage } from '../../../components/tz-table';
import {
  customConfigAppend,
  customConfigs,
  customConfigsDelete,
  ruleConfigsEdit,
} from '../../../services/DataService';
import { Store } from '../../../services/StoreService';
import { translations } from '../../../translations/translations';
import RuleCustomEdit from './Edit';
import './index.scss';
import { ColumnsType } from 'antd/lib/table';
import { TCustomConfigs, TCustomConfigsList } from '../../../definitions';
import { TzTag } from '../../../components/tz-tag';
import useRuleConfig from '../hooks/useRuleConfig';
import { TzMessageSuccess } from '../../../components/tz-mesage';
import { onSubmitFailed, showFailedMessage } from '../../../helpers/response-handlers';
import moment from 'moment';
import useLayoutMainSearchWid from '../../../helpers/useLayoutMainSearchWid';
import { useLocation, useNavigate } from 'react-router-dom';

const wrapTag = (content: string, keyword: string) => {
  if (!keyword || !content) {
    return content;
  }
  const _content = content.toLowerCase?.();
  const _keyword = keyword.toLowerCase?.();
  if (!_keyword || !_content) {
    return content;
  }
  const indexof = _content.indexOf(_keyword);
  const _start = indexof;
  const highlight = content.substring(_start, _keyword.length + _start);
  const val = highlight ? `<span class="highlight">${highlight}</span>` : '';
  return content.replace(new RegExp(keyword, 'gi'), val);
};

const RuleCustom = () => {
  const listComp = useRef(undefined as any);
  const [search, setSearch] = useState<any>('');
  let [ruleConfig, setRuleConfig] = useState<TCustomConfigs[] | undefined>(undefined);
  const fitlerWid = useLayoutMainSearchWid({});
  const navigate = useNavigate();

  const l = useLocation();
  useEffect(() => {
    Store.header.next({
      title: (
        <span style={{ padding: '4px 0', display: 'inline-block' }}>
          {translations.rule_custom}
        </span>
      ),
      onBack: () => {
        navigate(-1);
      },
    });
  }, [l]);

  const { ruleCustomConfig, configMergeWidthInitByRuleKey } = useRuleConfig();

  const reqFun = useCallback(
    (pagination: TablePaginationConfig, filters: any) => {
      const ruleCategory = get(filters, 'rule.category')?.join(',') ?? '';
      const customKey = get(filters, 'customSetting.name')?.join(',') ?? '';

      const { current = 1, pageSize = 10 } = pagination;
      const offset = (current - 1) * pageSize;
      const pageParams = {
        offset,
        query: search,
        limit: pageSize,
        ruleCategory,
        customKey,
      };

      return customConfigs(pageParams).pipe(
        map((res: any) => {
          let items = res.getItems();
          return {
            data: items,
            total: res.data?.totalItems || 0,
          };
        }),
      );
    },
    [search],
  );

  const deleteRule = (id: number) => {
    TzConfirm({
      content: translations.rule_custom_delTip,
      onOk() {
        customConfigsDelete(id).subscribe(({ error }: any) => {
          if (error) {
            error.message
              ? onSubmitFailed(error)
              : showFailedMessage(translations.delete_failed_tip);
            return;
          } else {
            TzMessageSuccess(translations.delete_success_tip);
            listComp.current.refresh();
          }
        });
      },
      okButtonProps: {
        type: 'primary',
        danger: true,
      },
      okText: translations.delete,
    });
  };

  let columns = [
    {
      title: translations.rule_information,
      dataIndex: ['rule', 'name'],
      width: '25%',
      render: (_: any, record: TCustomConfigsList) => {
        const {
          rule: { name },
          effect,
        } = record;

        return (
          <>
            <p className="rule-name">
              <EllipsisPopover
                overlayClassName="rule-custom-tooltip-overlay"
                lineHeight={24}
                lineClamp={2}
                key={`${search}${name}`}
              >
                <i
                  className="rule-custom-highlight-txt"
                  dangerouslySetInnerHTML={{
                    __html: name ? wrapTag(name, search) : '-',
                  }}
                />
              </EllipsisPopover>
            </p>
            {effect ? (
              <TzTag className="small effect-tag">
                <EllipsisPopover key={`${search}${effect}`}>
                  {translations.effect}：{effect ?? '-'}
                </EllipsisPopover>
              </TzTag>
            ) : null}
          </>
        );
      },
    },
    {
      title: translations.rule_category,
      dataIndex: ['rule', 'category'],
      width: '12%',
      filters: uniqWith(
        ruleCustomConfig?.map((t) => ({
          text: get(t, ['rule', 'category']),
          value: get(t, ['rule', 'categoryKey']),
        })),
        isEqual,
      ),
      render: (text: string) => (
        <EllipsisPopover key={`${search}${text}`} lineClamp={2}>
          {text ? text : '-'}
        </EllipsisPopover>
      ),
    },
    {
      title: translations.rule_condition_type,
      dataIndex: ['customSetting', 'name'],
      width: '12%',
      filters: uniqWith(
        ruleCustomConfig?.map((t) => ({
          text: get(t, ['customSetting', 'name']),
          value: get(t, ['customSetting', 'key']),
        })),
        isEqual,
      ),
      render: (text: string) => (
        <EllipsisPopover key={`${search}${text}`} lineClamp={2}>
          {text ? text : '-'}
        </EllipsisPopover>
      ),
    },
    {
      title: translations.actual_conditions,
      dataIndex: ['customSetting', 'value'],
      render: (text: string[]) => (
        <EllipsisPopover
          key={`${search}${text.join(' , ')}`}
          overlayClassName="rule-custom-tooltip-overlay"
          lineClamp={2}
        >
          <i
            className="rule-custom-highlight-txt"
            dangerouslySetInnerHTML={{
              __html: wrapTag(text.join(' , '), search),
            }}
          />
        </EllipsisPopover>
      ),
    },
    {
      title: `${translations.updated_by}/${translations.time}`,
      dataIndex: 'description',
      width: '17%',
      ellipsis: {
        showTitle: false,
      },

      render: (_: any, record: TCustomConfigsList) => {
        const { updater, updatedAt } = record;
        return (
          <>
            <EllipsisPopover
              style={{ verticalAlign: 'middle' }}
              key={`${search}${updater?.username}`}
            >
              {updater?.account ?? '-'}
            </EllipsisPopover>
            <p className="update-time">{moment.unix(updatedAt).format('YYYY-MM-DD HH:mm:ss')}</p>
          </>
        );
      },
    },
    {
      title: translations.tensorSelect_operations,
      dataIndex: 'enabled',
      width: 126,
      render: (_: any, record: TCustomConfigsList) => {
        return (
          <div>
            <TzButton
              type="text"
              className={'mr4'}
              onClick={() => {
                handleEitBtn(record.id);
              }}
            >
              {translations.edit}
            </TzButton>
            <TzButton
              type="text"
              danger
              onClick={() => {
                deleteRule(record.id);
              }}
            >
              {translations.delete}
            </TzButton>
          </div>
        );
      },
    },
  ];

  const handleRuleCustomEdit = useCallback(
    (values) => {
      const isEdit = !!get(ruleConfig, [0, 'id']);
      const Api = isEdit ? ruleConfigsEdit : customConfigAppend;
      Api(values).subscribe(({ error }) => {
        if (error) {
          error.message
            ? onSubmitFailed(error)
            : showFailedMessage(
                isEdit ? `${translations.saveFailed}` : `${translations.add_failed_tip}`,
              );
        } else {
          TzMessageSuccess(
            isEdit ? `${translations.saveSuccess}` : `${translations.activeDefense_successTip}`,
          );
          listComp.current.refresh();
          setRuleConfig(undefined);
        }
      });
    },
    [ruleConfig],
  );

  const handleAddBtn = useCallback(() => setRuleConfig(ruleCustomConfig), [ruleCustomConfig]);

  const handleEitBtn = useCallback(
    (id: number) =>
      customConfigs({ id })
        .pipe(
          map((res: any) => {
            const items = res.getItems();
            if (!items?.length) {
              showFailedMessage(translations.rules_not_exist);
              listComp.current.refresh();
              return;
            }
            const _ruleCustomConfig = configMergeWidthInitByRuleKey(items);
            setRuleConfig(_ruleCustomConfig);
          }),
        )
        .subscribe(),
    [ruleCustomConfig],
  );

  return (
    <div className="rule-custom-configuration mlr32 mt4">
      <div className={'mb12'}>
        <TzButton type="primary" onClick={handleAddBtn}>
          {translations.newAdd}
        </TzButton>
        <TzInputSearch
          allowClear
          className={'f-r'}
          placeholder={translations.unStandard.strRule1}
          style={{
            width: `${fitlerWid}px`,
          }}
          onChange={(val) => {
            setSearch(val);
          }}
        />
      </div>

      <TzTableServerPage
        className="nohoverTable"
        tableLayout="fixed"
        columns={columns as ColumnsType<TCustomConfigsList>}
        rowKey="name"
        reqFun={reqFun}
        ref={listComp}
      />

      {ruleConfig ? (
        <RuleCustomEdit
          open={!!ruleConfig}
          onOk={handleRuleCustomEdit}
          onCancel={() => setRuleConfig(undefined)}
          ruleConfig={ruleConfig}
        />
      ) : null}
    </div>
  );
};

export default RuleCustom;
