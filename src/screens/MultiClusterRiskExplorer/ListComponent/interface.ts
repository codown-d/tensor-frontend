import { TzSelectProps } from "../../../components/tz-select";

export type TEditRowData = {
    Managers?: string[] | undefined;
    managers?: string[] | undefined;
    alias?: string | undefined;
    Alias?: string | undefined;
  };

  export type TListComponentProps = {
    clusterList?:TzSelectProps['options'];
    clusterKeyToName?:Record<string, string>;
    hideLabel?: boolean;
    pageSize?: number;
    containerIds?: string;
    rowKey?: string;
  }
