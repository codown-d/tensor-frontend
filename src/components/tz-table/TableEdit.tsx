import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import './TableEdit.scss';
import * as lodash from 'lodash';
import { useDynamicList, useMemoizedFn, useSetState, useUpdateEffect } from 'ahooks';
import { TzTable } from '.';
import { translations } from '../../translations/translations';
import TzPopconfirm from '../ComponentsLibrary/TzPopconfirm';
import { TzButton } from '../tz-button';
import { TzFormItem, TzForm } from '../tz-form';
import { TzInput } from '../tz-input';
import { TzInputNumber } from '../tz-input-number';
import Form from 'antd/lib/form';
export enum TypeMap {
  NEW = 'new',
  WRITE = 'write',
  READ = 'read',
}
export interface Item {
  [x: string]: any;
}
export interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  dataIndex: string;
  rowIndex: number;
  title: any;
  inputType: 'number' | 'text';
  record: Item;
  children: React.ReactNode;
}
const TableEdit = (
  props: {
    columns: any;
    value?: any[];
    dataSource?: any[];
    onChange?: (Item: any[]) => void;
  },
  ref: any,
) => {
  const [form] = Form.useForm();
  let { value, dataSource = [], columns, onChange } = props;
  const { list, remove, getKey, push, replace, resetList } = useDynamicList<any[]>(
    (value || dataSource).map((ite) => ({
      ...ite,
      rowType: TypeMap.READ,
    })),
  );
  useUpdateEffect(() => {
    onChange?.(
      list.map((item: any) => {
        let { rowType, ...otherItem } = item;
        return otherItem;
      }),
    );
  }, [JSON.stringify(list)]);

  let isEditing = (record: any) => record && record.rowType !== TypeMap.READ;

  const save = (index: number) => {
    const key = getKey(index);
    form
      .validateFields([
        [key, 'pkgName'],
        [key, 'pkgVersion'],
      ])
      .then((values) => {
        const row = lodash.get(values, [key]);
        replace(index, { ...row, rowType: TypeMap.READ });
      })
      .catch();
  };
  const EditableCell: React.FC<EditableCellProps> = ({
    dataIndex,
    rowIndex,
    title,
    inputType,
    placeholder,
    record,
    children,
    ...restProps
  }) => {
    const inputNode =
      inputType === 'text' ? <TzInput placeholder={placeholder} /> : <TzInputNumber placeholder={placeholder} />;
    let editing = isEditing(record);
    return (
      <td {...restProps}>
        {editing ? (
          <TzFormItem
            name={[getKey(rowIndex), dataIndex]}
            style={{ margin: 0 }}
            rules={[
              {
                required: true,
                message: `${translations.unStandard.str252(title)}!`,
              },
            ]}
            initialValue={record[dataIndex]}
          >
            {inputNode}
          </TzFormItem>
        ) : (
          children
        )}
      </td>
    );
  };
  let newColumns = [
    ...columns,
    {
      title: translations.operation,
      dataIndex: 'operation',
      width: '16%',
      render: (_: any, record: any, rowIndex: number) => {
        const editable = isEditing(record);
        return editable ? (
          <>
            <TzButton type={'text'} className="mr8" onClick={() => save(rowIndex)}>
              {translations.save}
            </TzButton>
            <TzPopconfirm
              title={translations.unStandard.str22}
              okText={translations.superAdmin_confirm}
              okButtonProps={{ danger: true }}
              cancelText={translations.cancel}
              onConfirm={() => {
                if (record.rowType === TypeMap.NEW) {
                  remove(rowIndex);
                } else {
                  replace(rowIndex, { ...record, rowType: TypeMap.READ });
                }
              }}
            >
              <TzButton type={'text'}>{translations.cancel}</TzButton>
            </TzPopconfirm>
          </>
        ) : (
          <>
            <TzButton
              type={'text'}
              className="mr8"
              onClick={() => replace(rowIndex, { ...record, rowType: TypeMap.WRITE })}
            >
              {translations.edit}
            </TzButton>
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
          </>
        );
      },
    },
  ];
  const mergedColumns = newColumns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: Item, rowIndex: number) => ({
        record,
        inputType: col.inputType || 'text',
        dataIndex: col.dataIndex,
        placeholder: col.placeholder || translations.unStandard.str252(col.title),
        title: col.title,
        rowIndex,
      }),
    };
  });
  useImperativeHandle(ref, () => {
    return {
      push(val: any) {
        push({ ...val, rowType: TypeMap.NEW });
      },
    };
  }, []);
  return (
    <TzForm form={form} component={false}>
      <TzTable
        components={{
          body: {
            cell: EditableCell,
          },
        }}
        rowKey={(record) => lodash.values(record).join('_') + Math.random()}
        dataSource={list}
        columns={mergedColumns}
        pagination={false}
      />
    </TzForm>
  );
};
export default forwardRef(TableEdit);
