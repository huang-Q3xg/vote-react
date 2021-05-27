/* 业务层面的hook */
import {useEffect} from 'react'
import {useHistory} from 'react-router-dom'
import {useDispatch, useSelector} from 'react-redux'
import actType from '../constant/ACTION-TYPE'

export function useForceLogin() {
  const history = useHistory()
  const userInfo = useSelector(storeSt => storeSt.user)
  const tried = useSelector(storeSt => storeSt.triedLogin)
  const dispatch = useDispatch()
  useEffect(() => {
    if (userInfo) return
    if (tried) { 
      history.push('/login')
    }
    if (!userInfo) {
      dispatch({type: actType.GET_USERINFO}) /* 此解决直接在/home页面(创建投票页面)的刷新问题 */
    }
  },[userInfo, tried])

  return userInfo
}
