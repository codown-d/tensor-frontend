import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Resources } from '../../Resources';
import './VSelect.scss';
import { isEqual } from 'lodash';
import { TzCheckbox } from '../tz-checkbox';
export interface VSelectOptionProps {
  label: string;
  value: string;
  disable: boolean;
  data: any;
}
export interface VSelectProps {
  className?: string;
  defaultValue?: VSelectOptionProps | VSelectOptionProps[];
  options?: VSelectOptionProps[];
  onChange?: (
    value?: VSelectOptionProps | VSelectOptionProps[],
    options?: VSelectOptionProps[]
  ) => any;
  isMulti?: boolean;
  placeholder?: string;
  value?: VSelectOptionProps | VSelectOptionProps[];
  isSearchable?: boolean;
  fixed?: boolean;
  optionItem?: any;
  optionShift?: number;
}

const getRealVal = (val?: VSelectOptionProps | VSelectOptionProps[]) => {
  if (!val) {
    return undefined;
  }
  if (Array.isArray(val)) {
    return val.map((item) => item.value);
  }
  return [val.value];
};

const VSelect = (props: VSelectProps) => {
  const {
    className,
    defaultValue,
    options,
    onChange,
    isMulti,
    placeholder = '',
    value,
    fixed = true,
    optionShift = 10,
    // isSearchable,
    // optionItem,
  } = props;
  const hasValueProp = useRef(props.hasOwnProperty('value'));
  const _value = useRef(value);
  const _options = useRef(options);

  const [innerVal, setInnerVal] = useState(getRealVal(defaultValue));
  const [innerOptions, setInnerOptions] = useState(options);

  useEffect(() => {
    if (!hasValueProp) {
      return;
    }
    const isSame = isEqual(value, _value.current);
    if (isSame) {
      return;
    }
    _value.current = value;
    setInnerVal(getRealVal(value));
  }, [value]);
  useEffect(() => {
    const isSame = isEqual(options, _options.current);
    if (isSame) {
      return;
    }
    _options.current = options;
    setInnerOptions(options);
  }, [options]);

  const [showOption, setShowOption] = useState(false);

  useEffect(() => {
    if (!onChange || !innerOptions) {
      return;
    }
    const innerValToVal = (
      options: VSelectOptionProps[],
      innerVal?: string[]
    ) => {
      if (innerVal === undefined || innerVal.length === 0) {
        return undefined;
      }
      const res = options.filter((item) =>
        innerVal.some((iitem) => iitem === item.value)
      );
      if (res.length === 0) {
        return undefined;
      }
      return res;
    };
    const _innerVal = innerValToVal(innerOptions, innerVal);
    if (isMulti) {
      const tempVal = _innerVal;
      if (hasValueProp.current) {
        const isSame = isEqual(_value.current, tempVal);
        if (isSame) {
          return;
        }
        onChange(tempVal, _options.current);
      } else {
        onChange(tempVal, _options.current);
      }
    } else {
      const tempVal = _innerVal ? _innerVal[0] : undefined;
      if (hasValueProp.current) {
        const isSame = isEqual(_value.current, tempVal);
        if (isSame) {
          return;
        }
        onChange(tempVal, _options.current);
      } else {
        onChange(tempVal, _options.current);
      }
    }
  }, [innerVal, onChange, isMulti, innerOptions]);

  const changeInnerVal = useCallback(
    (val: string) => {
      if (innerVal === undefined) {
        setInnerVal([val]);
        if (!isMulti) {
          setShowOption(false);
        }
      } else {
        if (isMulti) {
          const newVal = innerVal.slice(0);
          if (innerVal.includes(val)) {
            const delValIndex = innerVal.findIndex((item) => item === val);
            newVal.splice(delValIndex, 1);
            setInnerVal(newVal);
          } else {
            setInnerVal(newVal.concat(val));
          }
        } else {
          if (innerVal[0] !== val) {
            setInnerVal([val]);
          }
          setShowOption(false);
        }
      }
    },
    [innerVal, isMulti]
  );

  const optionComps = useMemo(() => {
    if (innerOptions === undefined) {
      return undefined;
    }
    return innerOptions.map((item) => {
      const { label, value, disable } = item;
      const active = innerVal ? innerVal.includes(value) : false;
      return (
        <div
          className={`v_select_option_item ${active ? 'active' : ''}`}
          key={value}
          onClick={(event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            event.stopPropagation();
            disable || changeInnerVal(value);
          }}
        >
          <TzCheckbox checked={active}>
            {label}
          </TzCheckbox>

        </div>
      );
    });
  }, [innerOptions, changeInnerVal, innerVal, isMulti]);

  const toggleShowOption = useCallback(
    (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      event.stopPropagation();
      setShowOption(!showOption);
    },
    [showOption]
  );

  const displayLabel = useMemo(() => {
    const labels = innerVal?.map((iitem) => {
      return innerOptions?.find((item) => item.value === iitem)!.label;
    });
    const labelsStr = labels?.join(',');
    return labels && labels.length > 0 ? labelsStr : placeholder;
  }, [innerOptions, innerVal, placeholder]);

  useEffect(() => {
    const hidOption = () => {
      if (showOption) {
        setShowOption(false);
      }
    };

    window.addEventListener('click', hidOption, false);

    const scrollEl = document.querySelector('.layout-main-container') || window;
    if (fixed) {
      scrollEl.addEventListener('scroll', hidOption, false);
    }
    return () => {
      window.removeEventListener('click', hidOption);
      fixed && scrollEl.removeEventListener('scroll', hidOption);
    };
  }, [fixed, showOption]);

  const selectDisplayEl = useRef(null as null | HTMLDivElement);
  const opEl = useRef(null as null | HTMLDivElement);

  const [optionDirection, setOptionDirection] = useState(
    'normal' as 'bottom' | 'top' | 'normal'
  );
  const [optionFixedStyle, setOptionFixedStyle] = useState({} as any);
  useEffect(() => {
    if (!showOption) {
      setOptionFixedStyle({});
      return;
    }
    const el = selectDisplayEl.current!;
    const chartClientRect = el.getBoundingClientRect();
    const diffTop = chartClientRect.top;
    const clientHeight = window.innerHeight || document.body.clientHeight;
    const elStyle = window.getComputedStyle(el);
    const elHeight = Number(elStyle.height.replace('px', ''));
    const elWidth = elStyle.width;
    const diffLeft = chartClientRect.left;

    if (diffTop + elHeight / 2 > clientHeight - diffTop - elHeight / 2) {
      if (fixed) {
        const optionEl = opEl.current!;
        const opelStyle = window.getComputedStyle(optionEl);
        const opHeight = Number(opelStyle.height.replace('px', ''));
        const style = {
          left: `${diffLeft}px`,
          top: `${diffTop - opHeight - optionShift}px`,
          width: elWidth,
          transform: `scaleY(1)`,
        };
        setOptionFixedStyle(style);
      } else {
        setOptionDirection('top');
      }
    } else {
      if (fixed) {
        const style = {
          left: `${diffLeft}px`,
          top: `${diffTop + elHeight + optionShift}px`,
          width: elWidth,
          transform: `scaleY(1)`,
        };
        setOptionFixedStyle(style);
      } else {
        setOptionDirection('bottom');
      }
    }
  }, [showOption, fixed, optionShift]);

  return (
    <div
      className={`victor-select ${showOption ? 'focus' : ''
        } ${`dir_${optionDirection}`} ${fixed ? 'fixed' : ''} ${className || ''}`}
      ref={selectDisplayEl}
    >
      <div
        className="v_select_display"
        onClick={toggleShowOption}
        title={displayLabel}
      >
        {displayLabel}
      </div>
      <div className="v_select_options" style={optionFixedStyle} ref={opEl}>
        {optionComps}
      </div>
    </div>
  );
};

export default VSelect;
