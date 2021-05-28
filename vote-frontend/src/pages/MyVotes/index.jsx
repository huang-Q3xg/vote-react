import React, { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useForceLogin, useVoteLink} from '../../hooks'
import { InfiniteLoader, /* AutoSizer,*/ List } from 'react-virtualized'
import 'react-virtualized/styles.css'
import './MyVotes.scss'
import {Layout, Button} from 'antd'
import { CopyOutlined } from '@ant-design/icons'

const {Content} = Layout


// https://github.com/bvaughn/react-virtualized/blob/master/docs/InfiniteLoader.md

export default function MyVotes() {
  const userInfo = useForceLogin()
  const [votes, setVotes] = useState([])
  const [count, setCount] = useState(10)
  const hdVoteLink = useVoteLink()

  function loadMore({ startIndex, stopIndex }) { /* loadMore need return a Promise entity */
    return axios.get(`/vote/mine?startIdx=${startIndex}&stopIdx=${stopIndex+1}`).then(res => {
      setCount(res.data.count)//里面有总条目数
      votes.splice(startIndex, 0, ...res.data.votes)
      setVotes([...votes])
    }).catch(e => {
      console.log(e)
    })
  }

  function rowRenderer({ key, index, style }) {
    if (index >= votes.length) {
      return <div style={style} key={key}>loading now...</div>
    }
    return (
      <div style={style} key={key} className='vote-link-wrapper'>
        <Link className='vote-title' to={"/vote/" + votes[index].id}>{votes[index].title}</Link>
        <CopyOutlined className='link-copy' onClick={hdVoteLink(votes[index].id)}>COPY-LINK</CopyOutlined>
      </div>
    )
  }

  function isRowLoaded({ index }) {
    return !!votes[index]
  }

  useEffect(() => {
    function f(e) {console.log(e);}
    window.addEventListener('scroll', f)
    return window.removeEventListener('scroll', f)
  }, [])

  if (!votes) {
    return <div><span>LOADING NOW...</span></div>
  }

  return (
    count !== 0 ?
      <Content className='my-votes-top-wrp'>
        <div className='virtual-list-wrp'>
          <InfiniteLoader
            isRowLoaded={isRowLoaded}
            loadMoreRows={loadMore}
            rowCount={count}
          >
            {({ onRowsRendered, registerChild }) => {
              return (
                <List
                  onRowsRendered={onRowsRendered}
                  ref={registerChild}
                  width={window.outerWidth}
                  height={window.outerHeight}
                  rowCount={count}
                  rowHeight={50}
                  rowRenderer={rowRenderer}
                />
              )
            }}
          </InfiniteLoader>
        </div>
      </Content>
      : <div>还没有发起投票，立即创建吧！</div>
  )
}
