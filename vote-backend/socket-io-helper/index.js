/* 将httpServer 和 ioServer 单独抽离出来，只是方便别处引用 */
const http = require('http')
const SocketIO = require('socket.io')

/* httpServer 为node原生的服务端对象 */
const httpServer = http.createServer() /* 在app.js 引用处，再传入express框架表征的服务端对象 */

// const io = SocketIO(httpServer) /* TODO (✔ 这里先不依附)暂不确定这里“依附” httpServer 是否会有相关冲突 */
/* 这里暂不声明依附httpServer原因： 我们的请求处理基于express框架表征的服务端对象，而为了顺序，在app.js 处才作 `httpServer.on('request', app)`,之后才关联 httpServer和io */




/* ---------https实现相关---------- */





const io = SocketIO()
module.exports = {httpServer, io}
