import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';

console.log(document.getElementById('root'))
// 我是注释，我还在吗
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);