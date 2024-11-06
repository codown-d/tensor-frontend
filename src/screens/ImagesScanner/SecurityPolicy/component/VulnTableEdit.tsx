import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import './VulnTableEdit.scss';
import { TzForm, TzFormItem } from '../../../../components/tz-form';
import { TzInput } from '../../../../components/tz-input';
import { TzTable, TzTableProps } from '../../../../components/tz-table';
import { translations } from '../../../../translations/translations';
import Form, { FormInstance } from 'antd/lib/form';
import { TzButton } from '../../../../components/tz-button';
import TzPopconfirm from '../../../../components/ComponentsLibrary/TzPopconfirm';
import { useDynamicList, useUpdateEffect } from 'ahooks';
import { GetRowKey, TableLocale } from 'antd/lib/table/interface';
const VulnTableEdit = (
  props: {
    locale?: TableLocale;
    columns: any;
    value?: any[];
    onChange?: (item: any[]) => void;
  },
  ref: any,
) => {
  let [form] = Form.useForm();
  let { value = [], columns = [], onChange, ...otherProps } = props;
  const { list, remove, getKey, push, replace, resetList, getIndex } = useDynamicList<any[]>(value);
  useUpdateEffect(() => {
    resetList([...value]);
  }, [props.value]);
  useUpdateEffect(() => {
    onChange?.(list);
  }, [JSON.stringify(list)]);

  const mergedColumns = useMemo(
    () =>
      [
        ...columns,
        {
          title: translations.operation,
          dataIndex: 'operation',
          width: '16%',
          render: (_: any, record: any, rowIndex: number) => {
            return list.length <= 1 ? (
              '-'
            ) : (
              <TzPopconfirm
                title={translations.unStandard.str39}
                cancelButtonProps={{ type: 'text', danger: true }}
                okButtonProps={{ danger: true }}
                onConfirm={() => remove(rowIndex)}
                okText={translations.delete}
                cancelText={translations.cancel}
              >
                <TzButton type={'text'} danger>
                  {translations.delete}
                </TzButton>
              </TzPopconfirm>
            );
          },
        },
      ].map((col) => {
        let { editable, dataIndex, title, placeholder } = col;
        if (!editable) {
          return col;
        }
        return {
          ...col,
          render: (text: any, row: any, index: number) => {
            return (
              <TzFormItem
                name={[getKey(index), dataIndex]}
                initialValue={text}
                style={{ margin: 0 }}
                rules={[
                  {
                    required: true,
                    whitespace: true,
                    message: `${translations.unStandard.str252(title)}!`,
                  },
                ]}
              >
                <TzInput
                  placeholder={placeholder || translations.unStandard.str252(title)}
                  onBlur={(e) => replace(index, { ...row, [dataIndex]: e.target.value })}
                />
              </TzFormItem>
            );
          },
        };
      }),
    [props.columns, list],
  );
  useImperativeHandle(ref, () => {
    return {
      push(val: any) {
        push({ ...val });
      },
      form,
    };
  }, [form]);
  return (
    <TzForm form={form} component={false}>
      <TzTable
        className="edit-table"
        rowKey={((r: any, index: number) => getKey(index)) as GetRowKey<string>}
        dataSource={list}
        columns={mergedColumns}
        pagination={false}
        {...otherProps}
      />
    </TzForm>
  );
};
export default forwardRef(VulnTableEdit);
