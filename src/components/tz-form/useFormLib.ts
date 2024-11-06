import Form, { FormInstance } from 'antd/lib/form';
import { find } from 'lodash';
import { useState, useEffect } from 'react';

type FormValidateFieldsReturn = {
  formValidateFields: (callback: (p: any) => void) => void;
  formValidateChangeFields: (callback: (p: any) => void, formItemkey: string[]) => void;
};
export let useFormValidateFields = (form: FormInstance<any>): FormValidateFieldsReturn => {
  let getErrorFieldsResult = (errorFields: any[]) => {
    return errorFields?.reduce(
      (pre: any, item: { name: string[]; errors: string[]; warnings: any }) => {
        let { name, errors, warnings } = item;
        pre[name.join('.')] = [...errors].shift();
        return pre;
      },
      {},
    );
  };
  return {
    formValidateFields: (callback) => {
      return form.validateFields().catch(({ errorFields }) => {
        callback(getErrorFieldsResult(errorFields));
      });
    },
    formValidateChangeFields: (callback, formItemkey) => {
      return form.validateFields([formItemkey]).catch(({ errorFields }) => {
        if (errorFields.length) {
          callback(getErrorFieldsResult(errorFields));
        } else {
          callback({
            [formItemkey?.join('.')]: undefined,
          });
        }
      });
    },
  };
};
export let useFormErrorInfo = (errorFields: any, fields: (string | string[])[]) => {
  let [errorInfo, setErrorInfo] = useState();
  useEffect(() => {
    let newFields = fields.map((item) => {
      return typeof item === 'string' ? item : item.join('.');
    });
    let field: any = find(newFields, (item) => {
      return errorFields[item];
    });
    if (field && errorFields[field]) {
      setErrorInfo((pre) => {
        return errorFields[field];
      });
    } else {
      setErrorInfo(undefined);
    }
  }, [errorFields]);
  return { errorInfo };
};
