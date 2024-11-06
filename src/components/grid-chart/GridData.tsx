export const data = {
  nodes: [
    {
      id: 'str1',
      cluster: '0',
      value: { Namespace: 'tens1' },
    },
    {
      id: 'str2',
      cluster: '1',
      value: { Namespace: 'tens2' },
    },
    {
      id: 'str3',
      cluster: '3',
      value: { Namespace: 'tens3' },
    },
    {
      id: 'str4',
      cluster: '3',
      value: { Namespace: 'tens3' },
    },
  ],
  edges: [
    {
      source: 'str1',
      target: 'str2',
    },
    {
      source: 'str1',
      target: 'str3',
    },
    {
      source: 'str1',
      target: 'str4',
    },
    {
      source: 'str3',
      target: 'str1',
    },
    {
      source: 'str2',
      target: 'str3',
    },
  ],
};

export const randomColors = [
  '#F97070',
  '#F3E247',
  '#78E8F6',
  '#729FFF',
  '#6CEAA8',
  '#FF9F61',
  '#F66ACD',
  '#68BDFF',
  '#B6EB46',
  '#96BAE5',
  '#8E86FF',
  '#B79797',
  '#C26FFA',
];

export const strokes = [
  '#5B8FF9',
  '#5AD8A6',
  '#5D7092',
  '#F6BD16',
  '#E8684A',
  '#6DC8EC',
  '#9270CA',
  '#FF9D4D',
  '#269A99',
  '#FF99C3',
];
