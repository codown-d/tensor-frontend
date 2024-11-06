import { cloneDeep } from 'lodash';
export const dealData = (data: {
  nodes: any[];
  edges: { source: string; target: string }[] | [];
}) => {
  const nodes = data?.nodes;
  nodes.forEach((node: any) => {
    if (!node.style) node.style = {};
    // if (!node.labelCfg) node.labelCfg = { style: { fill: '' } };
    node.style.fill = 'rgba(154, 200, 249, 1)';
    node.style.stroke = '#fff';
    node.style.shadowColor = 'rgba(154, 200, 249, 0.25)';
    node.style.shadowBlur = 12;
    node.style.lineWidth = 1;
    node.size = 24;
    if (node?.deep) {
      node.size = 20;
      node.stateStyles = {
        selected: {
          r: 11,
          size: 22,
          lineWidth: 2,
          fill: 'rgba(33, 119, 209, 1)',
          stroke: '#fff',
          shadowBlur: 30,
          shadowColor: 'rgb(154, 200, 249)',
        },
        disable: {
          size: 20,
          lineWidth: 2,
          fill: 'rgba(212, 233, 255, 1)',
          stroke: '#fff',
          shadowBlur: 0,
          shadowColor: 'rgb(154, 200, 249)',
        },
      };
    }
  });
  return data;
};

export const addItems = (
  root: { nodes: any[]; edges: any[] },
  aNodes: any[],
  aEdges: any[]
) => {
  const { nodes = [], edges = [] } = root;
  const objNodes: any = {};
  nodes.map((p) => {
    objNodes[p.id] = p;
    return p;
  });

  const dealANodes = aNodes.filter((f) => !objNodes[f.id]);
  let objEdges: any[] = [];
  objEdges = edges.map((p) => {
    return p.source + '-' + p.target;
  });

  const dealAEdges = aEdges.filter(
    (f) => !objEdges.includes(`${f.source}-${f.target}`)
  );

  nodes.push(...dealANodes);
  edges.push(...dealAEdges);
  const fromEdges = Array.from(new Set(edges));
  return cloneDeep({ nodes, edges: fromEdges });
};

export const deleteItems = (
  root: { nodes: any[]; edges: any[] },
  delIDArr: any[],
  lines: string[]
) => {
  const { nodes, edges } = root;
  root.nodes = nodes.filter((t) => !delIDArr.includes(t.id));
  root.edges = edges.filter((t) => {
    const idKey = t.source + '&' + t.target;
    return !lines.includes(idKey);
  });
  return cloneDeep(root);
};
