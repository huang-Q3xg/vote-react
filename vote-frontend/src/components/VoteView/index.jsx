import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { useParams, useHistory/* useRouteMatch */ } from 'react-router-dom'
import io from 'socket.io-client'
import axios from 'axios'
import moment from 'moment'
// import uniqBy from 'lodash/uniqBy'
/* 卡壳点 数据的获取 voteFetcher */
import { voteFetcher } from './vote-fetcher'
import { IO_EMIT } from '../../constant/IO_EMIT'
import { useSelector } from 'react-redux'
import { Layout, Progress, Spin, Avatar, Image } from 'antd'
import { CopyOutlined } from '@ant-design/icons'
import { LoadingOutlined, CheckOutlined } from '@ant-design/icons';

import './VoteView.css'
import { useVoteLink } from '../../hooks'

const { Content } = Layout

// 访问地址如： /vote/:id
export default function VoteView() {
  const history = useHistory()
  const userInfo = useSelector(storeSt => storeSt.user)
  const params = useParams()
  const hdVoteLink = useVoteLink()
  /* gz: 不要陷入 useState 一定要使用的心障，如下所示。其实 向使用useState也是每次函数调用，也有缓存的思想。而这个 readById已经具有了这个功能 */
  // const [fetchData] = useState(voteFetcher.readById(params.id))

  const { vote: voteInfo, options } = voteFetcher.readById(params.id) /* 因为用了缓存结构，所以重复调用也是可以接受的; 另，“抛”出promise对象，抛即理解为错误，那么该函数组件的后面即不走了（或尝试再走一遍）；同时suspense处理，错误边界相关 */

  const [optionsInfo, setOptionsInfo] = useState(options)
  // console.log('#voteInfo', voteInfo); console.log('#optionsInfo', optionsInfo);

  useEffect(() => {
    setOptionsInfo(options)
  }, [options])

  useEffect(() => {
    console.log('[PARAMS ID]', params.id);
    /* 随组件挂载上， 通过是否过死线 确定是否引入基于ws的实时刷新 */
    if (!voteInfo || voteInfo.deadline < new Date().toISOString()) {
      return null
    }
    const socket = io({ transports: ['polling'] }) /* 这里的socket表征socketIO封装的连接对象，用conn命名也可 */

    // const socket = io({transports: ['websocket']}) /* 有时不可行原因可能也和浏览器相关，如火狐是可以的，用ws协议有效果。为了稳定，统一使用longPolling 方案 */

    /* socket io room 概念？ */
    socket.emit(IO_EMIT.SEL_ROOM, params.id)
    socket.on(IO_EMIT.VOTING_INFO, info => {
      setOptionsInfo(info)
    })
    return () => socket.disconnect()
  }, [params.id])

  const hdUpOption = useCallback((optId, selected) => async (evt) => {
    if (!userInfo) {
      history.push('/login')
      return
    }
    if (voteInfo.deadline < new Date().toISOString()) { //已过期，则无动作
      return
    }
    if (!selected) {
      await axios.post('/vote/up/' + optId)
    } else {
      await axios.post('/vote/cancel/' + optId)
    }
  }, [userInfo])

  /* 百分比计算， 获取当前vote下所有投票用户 */
  const voteAllUsers = useMemo(() => {
    if (!optionsInfo) return
    let users = optionsInfo.reduce((acc, opt) => acc.concat(...opt.users), [])
    // return uniqBy(users, 'id') /* 此百分比和腾讯投票的计算方式有不同，这里是按不重复的人头算，而官方是按票数算 */
    return users
  }, [optionsInfo])

  /* TODO  */
  const getRate = useCallback((optUsersLen) => {
    if (optUsersLen == 0) return 0
    let res = (optUsersLen / voteAllUsers.length) * 100
    return res.toFixed(2)
  }, [voteAllUsers])

  return (
    <Content>
      {
        !voteInfo ?
          <div className="VVBody"><h3 style={{ fontWeight: 'bolder', fontSize: '.55rem' }}>🧐你查询的投票不存在，或已被删除</h3></div> :
          <div className="VVBody">
            {/* <Link  to={"/Myvote"} ><div>返回</div></Link> */}
            <h3 style={{ fontWeight: 'bolder', fontSize: '.65rem' }}>{voteInfo.title}</h3>
            <p>{voteInfo.description} <span style={{ color: '#256df3' }}>[{voteInfo.multiSelect ? '多选' : '单选'}]{voteInfo.anonymous ? '[匿名]' : ''}{voteInfo.deadline < new Date().toISOString() ? '(已过期)' : ''}</span> </p>
            <CopyOutlined className='vv-link-copy' onClick={hdVoteLink(voteInfo.id)}></CopyOutlined>

            {optionsInfo.map((option, idx) => {
              var selected = option.users.some(user => userInfo && user.id == userInfo.id)
              return (
                <div className="warp" key={idx}>
                  <div className="optionsWrap" onClick={hdUpOption(option.id, selected)}>
                    <span>{option.content}</span>
                    <span className="checkWrap">{selected ?
                      <span className="checked">
                        <CheckOutlined className="CheckOutlined" style={{ color: "rgb(37,109,242)", fontSize: 20 }} />
                        <Spin className="spin" /* spinning={spinLoading} */ indicator={<LoadingOutlined style={{ fontSize: 20 }} spin />} style={{ color: "rgba(0,0,0,0)" }} />
                      </span> :
                      null}
                    </span>
                    <span>({option.users.length}票)</span>
                    <span>({getRate(option.users.length)+'%'})</span>
                    <Progress percent={getRate(option.users.length)}
                      strokeLinecap="square" showInfo={false} trailColor="rgba(0,0,0,0)" strokeColor="#256df2" strokeWidth="0.02rem" />
                  </div>
                  {
                    !voteInfo.anonymous && userInfo.avatar &&
                    <div>
                      {option.users.map((user, idx) => {
                        return <Avatar
                          src={<Image
                            src={user.avatar}
                            fallback="data:image/png;base64,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"
                            preview={false}
                          />}
                        />
                      })}
                    </div>
                  }

                </div>
              )
            })
            }
            <div className="time"><span>投票截至：{moment(voteInfo.deadline).format('YYYY-MM-DD HH:mm')}</span></div>
          </div>

        //   
      }
    </Content>
  )
}
