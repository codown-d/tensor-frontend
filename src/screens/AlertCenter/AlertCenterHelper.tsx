import { Colors, ScanSeverity, ServerAlert } from '../../definitions';

export const conditionalCellStyles = [
  {
    when: (row: ServerAlert<any>) => row.severity === ScanSeverity.Critical,
    style: {
      color: Colors.Red,
    },
  },
  {
    when: (row: ServerAlert<any>) => row.severity === ScanSeverity.High,
    style: {
      color: Colors.Orange,
    },
  },
  {
    when: (row: ServerAlert<any>) => row.severity === ScanSeverity.Low,
    style: {
      color: Colors.Yellow,
    },
  },
  {
    when: (row: ServerAlert<any>) => row.severity === ScanSeverity.Negligible,
    style: {
      color: Colors.Green,
    },
  },
];
