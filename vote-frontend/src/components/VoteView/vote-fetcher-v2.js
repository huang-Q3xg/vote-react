import axios from 'axios'

const voteCache = new Map()

async function getVote(id) {
  const {data} =  await axios.get('/vote/' + id)
  voteCache.set(id, data)
  return data /* async 函数的返回值特别 */
}


export const voteFetcher = {
  readById(id) {
    if (voteCache.has(id)) {
      return voteCache.get(id)
    }
    let voteOne = null
    throw getVote(id).then(data => voteOne = data)
  }
}
