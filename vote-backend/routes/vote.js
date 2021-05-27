const { Router } = require('express')

const { Vote, Option, User } = require('../data/db')
const { io } = require('../socket-io-helper')
const { IO_EMIT } = require('../constant')
const ErrNum = require('../constant/errNum')
const router = Router()

/* 后端也应做死线判断！防绕过前端页面直接发出请求 */

/* socket.io room 概念？ */ /* 广播时机：有人投票，即向在这个房间的连接广播相关数据(投票最新状态)（io.to(ROOM).emit(EVENT, data)） */
io.on('connection', socket => { /* conn/socket 表征 socket.io封装的连接对象, 也可用变量名socket */
  console.log('[someone comes]');
  socket.on('error', e => console.log('[io err]', e))
  socket.on(IO_EMIT.SEL_ROOM, id => { /* 数据由前端 VoteView.jsx 发来 */
    console.log(`[join] room_vote_${id} ...`);
    socket.join(`room_vote_${id}`) /* TODO 前端加入“房间”如何体现？(前端并不需要此概念) */
  })
})

router.get('/:id', async (req, res, next) => {
  console.log('parms.id', req.params.id);
  if (req.params.id == 'mine') {
    next() /* 当然可以把这个放在 router.get('/mine')的后面，就可以不用这个判断了 */
    return
  }
  try {
    // const vote = await Vote.findByPk(req.params.id, { include: Option }) /* 这里用include语句，前提 Vote.hasMany(Option) */
    /* 上面的为旧有写法，现在将vote 下的options 抽离出来，并附上 投票用户信息 */
    const vote = await Vote.findByPk(req.params.id)
    if (!vote) return res/* .status(404) */.json({ title: '你查询的投票不存在，或已被删除', msg: '无此编号的投票E' })
    let options = null
    if (vote.anonymous) {
      options = await vote.getOptions({
        include: [{ model: User, attributes: ['id'] }]
      })
    } else {
      options = await vote.getOptions({
        include: [{
          model: User,
          attributes: ['name', 'avatar', 'email', 'gender', 'id']
        }]
      })
    }
    // const options = await Option.findAll({
    //   where: { voteId: vote.id},
    //   include: [{
    //     model: User,
    //     attributes: ['name', 'avatar', 'email', 'gender', 'id']
    //   }]
    // })
    res.status(200).json({
      // vote: vote.toJSON(),
      // options: options.map(opt => opt.toJSON()) /* TODO 这里xr的并没有JSON化处理，不过自己通过node-brk 看到: json后可只携带必要信息; BUT, 如果只传options 感觉也能过滤一些信息 */
      /* 经验证这里可以不调用表对象的toJSON方法，猜想可能在 res.json()下有自己隐式调用toJSON方法 */
      vote, options
    })
  } catch (e) { /* 这里的错误捕获一般是 toJSON not exists in Null */
    console.log(e);
    res.status(404).json({
      msg: '无此编号的投票X'
    })
  }
})

/* ★ 判断登陆状态的，登陆了才允许进行后续操作 */
router.use((req, res, next) => {
  if (req.user) {
    next()
  } else {
    res.status(401).json({
      code: ErrNum.UNAUTHORIZED,
      msg: '用户未登录，拒绝相关操作'
    })
  }
})

/* create a vote [title,description,deadline,multiSelect,anonymous,restricted] */
/* 而约定前端请求体结构为 [title, descrip, deadline, [剩余3项...可选，数据库处理默认为false], 以及表征选项的字符串] */
router.post('/', async (req, res, next) => {
  const { options, ...body } = req.body
  try {
    const vote = await Vote.create(body)
    vote.setUser(req.user) /* TODO 这里如果是脱敏的req.user, 是否能关联vote & user? - YES, 也就需要用户ID那一项 */
    const ary = await Promise.all(
      options.map(optStr => Option.create({
        content: optStr
      }))
    )
    vote.addOptions(ary)
    res.status(200).json(vote.toJSON())
  } catch (e) {
    console.log('/vote-post/ catched err:', e)
    res.status(400).json({
      msg: '投票创建失败'
    })
  }

})

router.put('/', (req, res, next) => {

})

router.delete('/', (req, res, next) => {

})

/* 投票 选项处理; 
TODO 这里也不期望req.body 携带什么信息，是否可以改为get请求即可？BUT: get请求语义上更强调期望服务端返回什么 
实际 修改的操作也允许加入到post请求里来*/
/* 对上面认识的更正： 一般来说，对于POST、PUT请求，新建一条记录的话就用post，更新一条记录的话就用put. 而下面是会在user-votes数据表中新建条目的。*/
router.post('/up/:optionId', async (req, res, next) => {
  const option = await Option.findByPk(req.params.optionId, { include: [{ model: Vote, attributes: ['id', 'multiSelect', 'deadline'] }] })

  if (option) {
    if (option.vote.deadline.getTime() > Date.now()) {
      if (option.vote.multiSelect) {
        await option.addUser(req.user) /* 这里应该会自动匹配Id, 而无所谓入参是否是通过查表所得完整对象 */
      } else {
        const curVoteOptions = await Option.findAll({ /* 找出该选项所在投票的所有选项 */
          where: {
            voteId: option.vote.id
          }
        })
        await req.user.removeOptions(curVoteOptions)
        await req.user.addOption(option)
      }
      io.in(`room_vote_${option.voteId}`).emit(
        /* 实时刷新支持 */ /* #emit('eventName', data) */
        /* 给所有在这个房间的连接广播这个投票的最新状态 */
        /* 📌 期望这里返回给客户端的是什么数据呢？ —— 投票下的选项，以及该选项下投票的多个用户(信息脱敏)*/
        /* 以下返回的数据主要是为了 通过组件的VoteView.js/setOptionsInfo实时 更新相关  */
        IO_EMIT.VOTING_INFO,

        await Option.findAll({
          where: { voteId: option.voteId },
          include: [{
            model: User,
            attributes: ['name', 'avatar', 'email', 'gender', 'id']
          }]
        })
      )
    } else {
      res.json({
        msg: '选项已过期无效'
      })
    }
    res.end()
  } else {
    res.status(404).json({
      code: ErrNum.NOTFOUND,
      msg: '选项不存在'
    })
  }
})
/* 取消投票功能 */
router.post('/cancel/:optionId', async (req, res, next) => {
  const option = await Option.findByPk(req.params.optionId, { include: [{ model: Vote, attributes: ['id', 'deadline'] }] })

  if (option) {
    if (option.vote.deadline.getTime() > Date.now()) {
      await option.removeUser(req.user)
      io.in(`room_vote_${option.voteId}`).emit(
        IO_EMIT.VOTING_INFO,

        await Option.findAll({
          where: { voteId: option.voteId },
          include: [{
            model: User,
            attributes: ['name', 'avatar', 'email', 'gender', 'id']
          }]
        })
      )
    }
    res.end()
  } else {
    res.status(404).json({
      code: ErrNum.NOTFOUND,
      msg: '选项不存在'
    })
  }
})

// url: /vote/mine?page=3
// router.get('/mine', async (req, res, next) => {
//   const pageSize = 5
//   const page = (Number(req.query.page) || 1) - 1
//   const { count, rows: votesCurUser } = await Vote.findAndCountAll({
//     limit: pageSize,
//     offset: page * pageSize,
//     where: {
//       userId: req.user.id
//     },
//     attributes: ['title', 'id']
//   })
//   res.json({
//     votes: votesCurUser,
//     count,
//     pageSize,
//   })
// })

// url: /vote/mine?startIdx=5&stopIdx=20
router.get('/mine', async (req, res, next) => {
  const { startIdx, stopIdx } = req.query
  let data = null
  if (req.user.name === 'admin') {
    data = await Vote.findAndCountAll({
      limit: (stopIdx - startIdx) || 1,
      offset: startIdx,
      attributes: ['title', 'id']
    })
  } else {
    data = await Vote.findAndCountAll({
      limit: (stopIdx - startIdx) || 1,
      offset: startIdx,
      where: {
        userId: req.user.id
      },
      attributes: ['title', 'id']
    })
  }
  const {count, rows: votesCurUser} = data
  res.json({
    votes: votesCurUser,
    count,
  })
})



module.exports = router
