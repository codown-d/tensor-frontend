import React, { useRef } from 'react';
import { TzInputPassword } from '../../../../components/tz-input-password';
import { translations } from '../../../../translations/translations';
import { useMemoizedFn } from 'ahooks';

type TPasswordControll = {
  onChange?: (val: string) => void;
  value?: string;
};
function PasswordControll({ onChange, value }: TPasswordControll) {
  const inputRef = useRef<boolean>();

  const handleChange = useMemoizedFn((e) => {
    const val = e.target.value;
    if (!val.length) {
      onChange?.(val);
      return;
    }
    let _val: string[] = [];
    val.split('').forEach((element: string) => {
      if (/[a-zA-Z]|[\d]|[~!@$%^&*.]/.test(element)) {
        _val.push(element);
      }
    });
    onChange?.(_val.join(''));
  });
  return (
    <TzInputPassword
      allowClear
      value={value}
      onChange={(e) => {
        inputRef.current = true;
        handleChange(e);
      }}
      placeholder={translations.unStandard.requireTip(translations.superAdmin_resetPwd_newpwd)}
    />
  );
}

export default PasswordControll;
