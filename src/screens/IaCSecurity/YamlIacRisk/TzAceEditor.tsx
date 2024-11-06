import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import './TzAceEditor.scss';
import AceEditor, { IAceEditorProps, IEditorProps } from 'react-ace';
import 'ace-builds/src-noconflict/ace';
import 'ace-builds/src-noconflict/mode-text';
import 'ace-builds/src-noconflict/mode-dockerfile';
import 'ace-builds/src-noconflict/mode-yaml';
import NoData from '../../../components/noData/noData';
import { merge } from 'lodash';

interface TzAceEditorProps extends IAceEditorProps {
  onScroll?: (editor: IEditorProps, isFirst?: boolean) => void;
}

let TzAceEditor = forwardRef((props: TzAceEditorProps, ref?: any) => {
  let { markers = [], ...otherProps } = props;
  let [newMarkers, setmarkers] = useState<any[]>(markers);
  const codeRef = useRef<any>(null);
  useImperativeHandle(
    ref,
    () => {
      return {
        editor: codeRef?.current?.editor,
        gotoLine(lineNumber: number) {
          codeRef.current.editor.gotoLine(lineNumber);
        },
        setmarkers: (val: any) => {
          setmarkers([
            {
              className: 'error-marker',
              type: 'text',
              startCol: 0,
              endCol: 9999,
              ...val,
            },
          ]);
        },
      };
    },
    [codeRef],
  );
  const realProps = useMemo(() => {
    return merge(
      {
        placeholder: '',
        width: '100%',
        style: { paddingLeft: 20 },
        name: 'blah2',
        fontSize: 14,
        showPrintMargin: false,
        showGutter: true,
        markers: newMarkers,
        maxLines: 40,
        minLines: 40,
        wrap: true,
        autoScrollEditorIntoView: true,
        editorProps: { $blockScrolling: Infinity },
        setOptions: {
          highlightActiveLine: false,
          showLineNumbers: true,
          showInvisibles: false,
          useWorker: false,
        },
      },
      otherProps,
    );
  }, [otherProps, newMarkers]);
  return !props.value && realProps.readOnly && props.height ? (
    <NoData />
  ) : (
    <AceEditor {...realProps} ref={codeRef} />
  );
});
export default TzAceEditor;
