const proxy = require('http-proxy-middleware')

const backendServer = 'http://ts.my55.com:8866'

module.exports = function(app) {
  app.use(
    proxy('/api1', {
      target: backendServer,
      // changeOrigin: true, /* 看下这里的效果 */
      ws: true, /* websocket proxy 但是并没有起作用，还是同时借助了package.json下的proxy字段*/
      pathRewrite: {'^/api1' : ''}
    })
  )
}

/* gz: 若还是不想借助package.json下proxy字段，（VoteView.js下）可以用 
`const socket = io('http://127.0.0.55:8866', {transports: ['websocket']})` 解决 ，
BUT： 对于上面这种方式，不确定是因为确定使用 websocket协议的，还是别的原因，移动端的票数不能实时更新
相关自查： 移动端， websocket失效原因 （估计还是反向代理方面）
*/
