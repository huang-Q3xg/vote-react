import { createStore, applyMiddleware } from 'redux'
import CreateSagaMid from 'redux-saga'
import { put, takeEvery } from 'redux-saga/effects'
import axios from 'axios'
import * as immer from 'immer'

import actType from '../constant/ACTION-TYPE'
const sagaMiddleware = CreateSagaMid()


/* ------------------saga“拦截”------------------ */
function* rootSaga() {
  yield takeEvery(actType.LOGIN, login)
  yield takeEvery(actType.LOGOUT, logout)
  yield takeEvery(actType.GET_USERINFO, getUserInfo)
}



function* getUserInfo(action) {
  try {
    const { data: user } = yield axios.get('/account/userinfo')
    yield put({ type: actType.USER_INFO, user })
  } catch (e) {
    console.dir(e);
    console.log('getUserInfo err msg:', e.response.data.msg); /* TODO */
    // throw e /* 这里扔，也不是在组件处被捕获, 或者说无法基于此实现在调用dispatch处做处理 */
    yield put({ type: actType.NO_LOGIN_OR_LOGIN_FAILED })
  }
}

function* login(action) {
  const { email, password } = action
  try {
    const { data: user } = yield axios.post('/account/login', { email, password })
    yield put({ type: actType.USER_INFO, user })
  } catch (e) {
    console.dir(e);
    console.log('login err msg', e.response.data.msg);
    yield put({ type: actType.NO_LOGIN_OR_LOGIN_FAILED })
  }
}

function* logout(action) {
  yield axios.get('/account/logout')
  yield put({ type: actType.REMOVE_USER_INFO })
}



/* ------------------reducer-------------------- */
const initState = {
  user: null,
  triedLogin: false /* 判断用户未登录或登录失败的，若如此为真 */
}

const modAction = {
  /* immer 处理的风格 */
  [actType.USER_INFO](state, action) {
    state.user = action.user
  },
  [actType.REMOVE_USER_INFO](state, action) {
    state.user = null
  },
  [actType.NO_LOGIN_OR_LOGIN_FAILED](state, action) {
    state.triedLogin = true
  }
}

for (let key in modAction) {
  modAction[key] = immer.produce(modAction[key])
}

function reducer(preState = initState, action) {
  const mutator = modAction[action.type]
  if (mutator) {
    return mutator(preState, action)
  }
  return preState
}


/* --------------------store-------------------- */
export default createStore(reducer, applyMiddleware(sagaMiddleware))
sagaMiddleware.run(rootSaga)
