import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';
import './index.less';
import './main.scss';

// const App1 = loadable(() => import('./app'), {
//   fallback: <div>Loading...</div>,
// });

// const App = () => (<h1>444</h1>);

ReactDOM.render(<App/>, document.getElementById('root'));
