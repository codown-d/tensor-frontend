export function getSegmentStrokeColor(nodeData: any): string {
  const { depth } = nodeData;

  if (depth === 1) {
    return 'rgba(42, 164, 245, 0.2)';
  }

  return 'rgba(42, 164, 245, 0.2)';
}

export function getSegmentColor(nodeData: any): string {
  const { depth } = nodeData;

  const { type } = nodeData.data;

  if (depth === 1) {
    if (type === 'resource') {
      return 'rgba(33,119,209, 0.36)';
    }
    return 'rgba(221, 240, 253, 1)';
  }
  if (depth === 2) {
    return 'rgba(33,119,209, 0.36)';
  }
  return 'rgba(33,119,209, 0.44)';
}
