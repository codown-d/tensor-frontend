import React, { FormEvent, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { TzInput } from '../../tz-input';
import { TzSelectProps, TzSelectNormal } from '../../tz-select';
import { FilterContext } from './useTzFilter';
import { ReactComponent as SearchIcon } from '../../../assets/icons/search.svg';
import { InputRef } from 'antd';
import { translations } from '../../../translations/translations';
import useLayoutMainSearchWid from '../../../helpers/useLayoutMainSearchWid';
import { trim } from 'lodash';

const InputFilter = ({ inputStyle }: { inputStyle?: any }) => {
  const context = useContext(FilterContext);
  const { addFilter: onChange, inputFilterData: data } = context;
  const selectedFieldRef = useRef(data[0]?.name);
  const inputRef = useRef<InputRef>(null);

  const optionData = useMemo(() => {
    if (!data?.length) {
      return undefined;
    }
    if (data.length === 1) {
      return undefined;
    }
    return data;
  }, [data]);

  const [value, setValue] = useState<any>();
  const [selected, setSelected] = useState<TzSelectProps['value']>(optionData?.[0]?.name);

  const placeholder = useMemo(() => {
    const item = data.find((t) => t.name === selected);
    if (item?.props?.isTag) {
      return translations.separated_by_commas;
    }
    const str = data.length === 1 ? data[0].label : '';
    return `${translations.clusterManage_placeholder}${str}`;
  }, [data, selected]);

  const onBlur = useCallback(() => {
    if (value) {
      const item = data.find((t) => t.name === selectedFieldRef.current);
      item && onChange({ ...item, value });
      setValue(undefined);
    }
  }, [value]);

  const handleSelectedChange = useCallback((val) => {
    selectedFieldRef.current = val;
    setSelected(val);
    setValue(undefined);
  }, []);

  const fitlerWid = useLayoutMainSearchWid({ min: 320 });

  return data?.length ? (
    <TzInput
      ref={inputRef}
      placeholder={placeholder}
      className="tz-input-fitler"
      style={{
        width: `${fitlerWid}px`,
        ...inputStyle,
      }}
      value={value}
      onChange={(e: FormEvent<HTMLInputElement>) => setValue(trim(e.currentTarget.value))}
      onPressEnter={() => inputRef.current?.blur()}
      onBlur={onBlur}
      prefix={<SearchIcon className="tz-icon tz-search" />}
      addonBefore={
        optionData?.length ? (
          <TzSelectNormal
            popupClassName="tz-input-fitler-select-dropdown"
            value={selected}
            onChange={handleSelectedChange}
            className="select-after"
            dropdownMatchSelectWidth={false}
            options={optionData.map((v) => ({ ...v, value: v.name }))}
          />
        ) : null
      }
    />
  ) : null;
};

export default InputFilter;
