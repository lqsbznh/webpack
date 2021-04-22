import * as React from 'react';
import * as ReactDOM from "react-dom";

import App from './App';
import "./styles.scss";

// 我是注释，我还在吗
const mountNode = document.getElementById("root");
ReactDOM.render(<App name="Jane" />, mountNode);