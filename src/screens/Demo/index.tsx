import React, { ReactNode } from 'react';
import { getContainerGraphList, getEventsCenter } from '../../services/DataService';
import { map } from 'rxjs/operators';
import { WebResponse } from '../../definitions';
import TzSelect from '../../components/ComponentsLibrary/tzSelect';
import { Select } from 'antd';
import { TzTooltip } from '../../components/tz-tooltip';
const { Option } = Select;
const options: any = [];

for (let i = 0; i < 1000; i++) {
  const value = `${i.toString(36)}${i}`;
  options.push({
    // label: value,
    // value,
    id: value,
    disabled: i === 10,
  });
}
const Demo = () => {
  return (
    <div className="open-api mb40">
      <h2>服务器加载</h2>
      <TzSelect
        allowClear
        // itemRenderWithCheckbox
        maxTagCount="responsive"
        maxTagTextLength={5}
        isShowAll
        // disabled
        defaultValue={['61483461512290822']}
        style={{ width: 300 }}
        mode="multiple"
        fieldNames={{ value: 'id' }}
        labelFormat={(node: ReactNode, row: any) => <TzTooltip title={row.label}>{node}</TzTooltip>}
        loadOptions={(data: any) => {
          const { page, searchValue, ids } = data;
          return getEventsCenter({
            page,
            query: { id: searchValue, ids },
          }).pipe(
            map((res: WebResponse<any>) => ({
              list: res.getItems().map(({ id }, index) => ({
                id,
                label: id,
                disabled: index === 2,
              })),
              nextId: res.data?.pageToken,
              total: res.data?.totalItems,
            })),
          );
        }}
      />
      <TzSelect
        allowClear
        // itemRenderWithCheckbox
        maxTagCount="responsive"
        maxTagTextLength={5}
        isShowAll
        // disabled
        defaultValue={['00a0483b0b1c679dd2f75edf56d55e9d0a3058c8f27ed5d2accf2fa5f3aea295']}
        style={{ width: 300 }}
        mode="multiple"
        fieldNames={{ value: 'id' }}
        loadOptionsType="offset"
        loadOptions={(data: any) => {
          const { page, keyword } = data;
          return getContainerGraphList({
            ...page,
            container_name: keyword,
          }).pipe(
            map((res: WebResponse<any>) => ({
              list: res.getItems().map(({ id }, index) => ({
                id,
                label: id,
                disabled: index === 2,
              })),
              total: res.data?.totalItems,
            })),
          );
        }}
      />
      <br />
      <br />
      <h2>全选</h2>
      <TzSelect
        defaultActiveFirstOption
        allowClear
        maxTagCount="responsive"
        maxTagTextLength={5}
        options={options}
        fieldNames={{ label: 'id', value: 'id' }}
        isShowAll
        style={{ width: 300 }}
        mode="multiple"
      />
      <br />
      <br />
      <TzSelect style={{ width: 300 }} mode="tags" showArrow={false} dropdownStyle={{ display: 'none' }} />
      <br />
      <br />
      <h2>普通使用</h2>
      多选：
      <TzSelect
        allowClear
        isShowAll={false}
        labelFormat={(node: ReactNode, row: any) => <TzTooltip title={row.id}>{node}</TzTooltip>}
        defaultValue={['a10']}
        maxTagCount="responsive"
        fieldNames={{ value: 'id', label: 'id' }}
        options={options}
        style={{ width: 300 }}
        mode="multiple"
      />
      单选：
      <TzSelect
        // defaultValue={'33'}
        options={[
          {
            label: 'Manager',
            options: [
              { label: 'Jack', value: 'jack' },
              { label: 'Lucy', value: 'lucy' },
            ],
          },
          {
            label: 'Engineer',
            options: [{ label: 'yiminghe', value: 'Yiminghe' }],
          },
        ]}
        style={{ width: 300 }}
      />
      <br />
      children多选：
      <TzSelect label="guojia" maxTagCount="responsive" style={{ width: 300 }} mode="multiple">
        <Option value="china" label="China">
          <div className="demo-option-label-item">
            <span role="img" aria-label="China">
              🇨🇳
            </span>
            China (中国)
          </div>
        </Option>
        <Option value="usa" label="USA">
          <div className="demo-option-label-item">
            <span role="img" aria-label="USA">
              🇺🇸
            </span>
            USA (美国)
          </div>
        </Option>
        <Option value="japan" label="Japan">
          <div className="demo-option-label-item">
            <span role="img" aria-label="Japan">
              🇯🇵
            </span>
            Japan (日本)
          </div>
        </Option>
        <Option value="korea" label="Korea">
          <div className="demo-option-label-item">
            <span role="img" aria-label="Korea">
              🇰🇷
            </span>
            Korea (韩国)
          </div>
        </Option>
      </TzSelect>
    </div>
  );
};
export default Demo;
