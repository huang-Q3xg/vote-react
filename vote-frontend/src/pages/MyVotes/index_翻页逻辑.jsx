import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import {useForceLogin} from '../../hooks'

export default function MyVotes() {
  const userInfo = useForceLogin()
  const [votes, setVotes] = useState(null)
  const [page, setPage] = useState(1)
  const [maxPage, setMaxPage] = useState(1)

  useEffect(() => {
    (async () => {
      try {
        let { data: {votes,count,pageSize} } = await axios.get(`/vote/mine?page=${page}`)
        console.log(count);
        setMaxPage( Math.ceil(count / pageSize) )
        setVotes(votes)
      } catch (e) {
        setVotes([])
        console.log('MyVotes Comp err:', e);
      }
    })()
  }, [userInfo, page])


  if (!votes) {
    return <div><span>LOADING...</span></div>
  }
  return (
    votes.length ?
    <>
      {votes.map((vote, idx) => (
        <li key={idx}><Link to={'/vote/'+(vote.id)}>{vote.title}</Link></li>
      ))
      }
      <button type='button' onClick={() => setPage(p => p-1 )} disabled={page === 1}>上一页</button>
      <button type='button' onClick={() => setPage(p => p+1)} disabled={page === maxPage}>下一页</button>
    </> :
    <div>还没有发起投票，立即创建吧！</div>
  )
}
