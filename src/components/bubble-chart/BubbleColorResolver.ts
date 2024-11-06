import { ScanSeverity } from '../../definitions';

const dictionary: any = {
  [ScanSeverity.Negligible]: {
    parent: '#366e75',
    child: '#6a7895',
    stroke: '#465471',
  },
  [ScanSeverity.Critical]: {
    parent: '#4e3448',
    child: '#8d3530',
    stroke: '#553749',
  },
  [ScanSeverity.Low]: {
    parent: '#f5db88',
    child: '#daa753',
    stroke: '#7b6d51',
  },
  [ScanSeverity.Medium]: {
    parent: '#6f5d3d',
    child: '#dc7a2d',
    stroke: '#855f4c',
  },
  [ScanSeverity.High]: {
    parent: '#6f4a3b',
    child: '#c6544c',
    stroke: '#6a3c54',
  },
  [ScanSeverity.Safe]: {
    parent: '#366e75',
    child: '#4dbb9e',
    stroke: '#2c7777',
  },
};

const brightDictionary: any = {
  [ScanSeverity.Critical]: {
    childOld: '#E29393',
    child: '#f0e2e5',
    stroke: '#9E0000',
  },
  [ScanSeverity.High]: {
    childOld: '#FFB5B5',
    child: '#f6e9ec',
    stroke: '#E95454',
  },
  [ScanSeverity.Medium]: {
    childOld: '#FFD9BE',
    child: '#f6f0ee',
    stroke: '#FF8A34',
  },
  [ScanSeverity.Low]: {
    childOld: '#FFEEBE',
    child: '#f6f4ee',
    stroke: '#FFC423',
  },
  [ScanSeverity.Negligible]: {
    childOld: '#F7FAFF',
    child: '#f3f5fb',
    stroke: '#ABBAD1',
  },
  [ScanSeverity.Unknown]: {
    childOld: '#F7FAFF',
    child: '#f3f5fb',
    stroke: '#ABBAD1',
  },
  [ScanSeverity.Safe]: {
    childOld: '#4dbb9e',
    child: '#f5f7fb',
    stroke: '#2c7777',
  },
};

const selectFillColor: any = {
  [ScanSeverity.Critical]: {
    stroke: '#D76D6D',
  },
  [ScanSeverity.High]: {
    stroke: '#FF9898',
  },
  [ScanSeverity.Medium]: {
    stroke: '#FFCBA6',
  },
  [ScanSeverity.Low]: {
    stroke: '#FFE499',
  },
  [ScanSeverity.Negligible]: {
    stroke: '#DBE5F5',
  },
  [ScanSeverity.Unknown]: {
    stroke: '#CED9EB',
  },
  [ScanSeverity.Safe]: {
    stroke: '#DBE5F5',
  },
};

export function getColor(nodeData: any, status?: string): string {
  const {
    depth,
    data: { children },
  } = nodeData;
  const severity: ScanSeverity = nodeData.data.severity;
  const color = brightDictionary;
  if (depth === 1) {
    return '#F4F6FA';
  }
  if (color[severity]) {
    if (depth === 2) {
      return status !== '1' ? color[severity].childOld : color[severity].child;
    }
    if (depth === 3) {
      return status !== '1' ? color[severity].childOld : color[severity].child;
    }
  }
  if (depth === 2 && children.length) {
    return 'rgba(214, 220, 230, 1)';
  }
  return 'rgba(247, 250, 255, 1)';
}
export function getStrokeColor(nodeData: any, isbright?: boolean): string {
  const { depth } = nodeData;
  const severity: ScanSeverity = nodeData.data.severity;
  const color = isbright ? brightDictionary : dictionary;
  if (depth === 1) {
    return isbright ? 'rgba(0, 0, 0, 0.1)' : '#536798';
  }
  if (color[severity]) {
    return color[severity].stroke;
  }
  return isbright ? '#ABBAD1' : '#ABBAD1';
}

export function getSelectColor(nodeData: any): string {
  const { depth } = nodeData;
  const severity: ScanSeverity = nodeData.data.severity;
  const color = selectFillColor;
  if (depth === 1) {
    return 'rgba(0, 0, 0, 0.1)';
  }
  if (color[severity]) {
    return color[severity].stroke;
  }
  return '#DBE5F5';
}
