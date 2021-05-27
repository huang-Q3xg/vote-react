import axios from 'axios'

/* 此函数 是方便 VoteView调用的 */

/* TODO 引入缓存的必要性 */
const voteCache = new Map()

function getVote(id) {
  return axios.get('/vote/' + id)
}

/* TODO 如果请求的是个不存在的vote/:ID的情况, 
  【期望能处理服务端返回404的情况，but: 不过客户端一直重复请求？ （暂未实现，而是 在后端vote.js - get /:id 处理为： 
  `res.json({title: '你查询的投票不存在，或已被删除'})`）】
  期望有提示： 你查询的投票不存在，或已被删除。 */
export const voteFetcher = {
  isExist(id) {
    /* TODO */
  },

  /* 约定后端吐出的数据为 {vote, options(且含投票用户信息)} */

  readById(id) {
    /* 原先写法： 缓存是“固化的” */
    if (voteCache.has(id)) {
      return voteCache.get(id)
    }
    /* TODO 不存在，即抛出一个promise对象。【throw 的动作， 如何理解其能够为调用处返回 一个voteInfo对象？？—— 也可能是调用处的函数组件刷新了两次】 */
    throw getVote(id)
      .then(response => voteCache.set(id, response.data))
      .catch(err => console.log('[HERE ERR]:', err.message, err.response.data))
  }
}




/* 或如下， 以闭包的形式维护一份cache */
/* BUT async 函数的返回值是一个promise ... */
export function voteFetcher_ori() {
  const voteCache = new Map()

  return async (id) => {
    if (voteCache.has(id)) {
      return voteCache.get(id)
    }
    try {
      const { data: voteOne } = await axios.get('/vote/' + id)
      voteCache.set(id, voteOne)
      return voteOne
    } catch (e) {
      console.log('voteFetcher catched err:', e);
    }
  }
}
