const express = require('express')
const cookieParser = require('cookie-parser')
const path = require('path')
const {httpServer, io} = require('./socket-io-helper')
/* 配置跨域相关 */
const cors = require('cors')

const app = express()
app.set('x-powered-by', false)

/* constant */
const { PORT, IPv4, CORS_MAX_AGE } = require('./constant')

const { User } = require('./data/db')

/* routes */
const {accountRouter, voteRouter, avatarUploadRouter} = require('./routes')

/* 开发阶段： 跨域资源设置,便于从任意界面来作后台api数据返回测试 / 之后若于前台开启了反向代理，则可取消此 (对于websocket 应也是如此)*/
// app.use(cors({
//   origin: true,
//   maxAge: CORS_MAX_AGE,
//   credentials: true,
// }))

app.use(express.urlencoded({ extended: true }))
app.use(express.json()) /* TODO: 本项目主要就用到json发往服务端让其解析，所以下一行可不要. (那些场景说明客户端发出的是JSON数据) */
app.use(cookieParser('secret for cookie'))

/* 静态文件声明 */
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
app.use('/public/icons', express.static(path.join(__dirname, 'public/icons')))

app.use((req, res, next) => {
  console.log('------------------▼▼▼---------------------');
  console.log(`[req]signedCookies:`, req.signedCookies);
  console.log('[req]method:', req.method, '; url:', req.url, '; host:', req.get('HOST'));
  req.method === 'POST' ? console.log(`---[req]body:`, req.body) : null
  next()
})

/* 预先通过cookie 查询用户是否登录，并挂载到req.user */
app.use(async (req, res, next) => {
  if (req.signedCookies.user) {
    req.user = await User.findOne({
      /* 若不通过attributes:则数据库user的所有字段都挂到req.user上。这里脱敏处理 */
      attributes: ['name', 'avatar', 'email', 'gender', 'id'], /* TODO 或许这里暂时先不脱敏处理 */
      where: { email: req.signedCookies.user }
    })
  } else {
    req.user = null
  }
  next()
})


app.use('/', express.static(path.join(__dirname, 'build'))) /* 前端打包所得 */
app.use('/account', accountRouter)
app.use('/vote', voteRouter)
app.use('/upload', avatarUploadRouter)



//#region VER1 expressServer -> httpServer -> ioServer
httpServer.on('request', app)
/* 为了吻合 expressServer -> httpServer -> socketIOServer 的顺序，所以在这里再声明IOserver 依附的httpserver对象， 而不是在、seokcet-io-helper.js处即如 io = SocketIO(httpServer) */
/* TODO -待测试`serveClient: false`可能表征向前端提供 client.js文件相关，但是前端已经引入了socket.io-client，所以这里不需要了；同时io表示的服务端也只处理 ws协议的连接，其余的一般请求还是交由expressApp处理 */
io.attach(httpServer, {serveClient: false}) 

httpServer.listen(PORT, IPv4, () => {
  console.log(`-->listening --> http://${IPv4}:${PORT}`);
})


//#region VER2 expressServer -> httpServer -> ioServer
// https://stackoverflow.com/questions/35713682/socket-io-gives-cors-error-even-if-i-allowed-cors-it-on-server
// const server = app.listen(PORT, IPv4, () => {
//   const { address, port } = server.address()
//   console.log(`LLlistening --> http://${address}:${port}`);
// })

// io.attach(server, {serveClient: false})
