const { Router } = require('express')
const { User } = require('../data/db')

const ErrNum = require('../constant/errNum')
const router = Router()
// [name, email, password, avatar, gender]
router.post('/register', async (req, res, next) => {
  try {
    const user = await User.create({
      ...req.body
    })
    res.status(200).json(user.toJSON())
  } catch (e) {
    /* 统一视作客户端错误，返回400 */
    res.status(400).json({
      err: e,
      msg: '用户名或邮箱已存在',
      code: ErrNum.REGISTERFAILED,
    })
    /* 进一步的，具体到错误类型（err.code），和错误状态，如用户已存在等原因， 并告知客户端 */
  }
})

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body /* 设计为通过邮箱登录 */
    const user = await User.findOne({ /* 基于ORM-sequelize的， 若找不到，user为null */
      attributes: ['name', 'avatar', 'email', 'gender', 'id'],
      where: {
        email,
        password,
      }
    })
    if (user == null) {throw new Error('用户名或密码错误~')}
    res.cookie('user', email, {
      signed: true,
      // httpOnly: true,
    })
    // console.log('/account.js/: user', user); 
    res.status(200).json(user.toJSON()) 
  } catch (e) { /* 先前上面没有手动抛错，那么这里实际报错相关：/account/login TypeError: Cannot read property 'toJSON' of null*/
    res.status(400).json({
      code: ErrNum.UNAUTHORIZED,
      msg: e.message,
    })
  }
})

/* 场景： 需要获取用户信息的 */
router.get('/userinfo', async (req, res, next) => {
  if (req.user) {
    res.status(200).json(req.user) /* TODO 这里xr写法为了保证相关，重查了user表对象 */
  } else {
    res.status(401).json({
      code: ErrNum.UNAUTHORIZED,
      msg: '用户未登录'
    })
  }
})

router.get('/logout', (req, res, next) => {
  res.clearCookie('user')
  res.end()
})
module.exports = router
