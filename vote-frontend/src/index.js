import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { HashRouter as Router } from 'react-router-dom' /* TODO hashRouter、 browserRouter 的选择 */
import store from './redux/store'
import { Provider } from 'react-redux'
import 'antd/dist/antd.css'

document.documentElement.style.fontSize = window.innerWidth * 100 / 720 + 'px'
window.onresize = function() {
  document.documentElement.style.fontSize = window.innerWidth * 100 / 720 + 'px'
}

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Provider store={store}>
        <App />
      </Provider>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);
