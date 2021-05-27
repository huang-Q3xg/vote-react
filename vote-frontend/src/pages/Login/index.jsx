import React, {  useCallback } from 'react'

import {useInput} from '../../hooks'
import { useHistory, Link } from 'react-router-dom'
import { Form, Input, Button } from 'antd'
import axios from 'axios'
import {useDispatch} from 'react-redux'
import actType from '../../constant/ACTION-TYPE'


export default function Login() { //路由组件，可接受
  const dispatch = useDispatch()
  const emailInp = useInput()
  const pwdInp = useInput() /* 实际这里可不依赖受控组件 */
  const history = useHistory()

  /* gz: 关于为何弃用了下面的方法：首先我们这里用redux同时练习下saga的使用，但是一般状态管理也是管理那种持久状态的数据，而如这样的登录状态的数据，可能涉及请求、异步，如下的
  在dispatch触发的“登录动作”真的登录之前，就已经执行到history.push()了，且并不会因为加了await 就坐等待，saga设计如此。
  * 见v-4 */

  const validateMessages = {
    required: '${label}为必填项',
    types: {
      email: '不是有效${label}地址!',
    },
  };

  const hdLogin = useCallback( async ({fd_user}) => {
    try {
      const {data: user}= await axios.post('/account/login', {...fd_user })
      dispatch({type: actType.USER_INFO, user})
      history.push('/home')
    } catch(e) {
      alert(e.response.data.msg);
    }
  }, [emailInp, pwdInp])

  return (
    <Form name="nest-messages" className="login-register-form" onFinish={hdLogin} validateMessages={validateMessages}>
      <Form.Item name={['fd_user', 'email']} label="邮箱" rules={[{ type: 'email', required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item
        label="密码"
        name={['fd_user', 'password']}
        rules={[{ required: true, message: '请输入密码' }]}
      >
        <Input.Password />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" block>
          登录
        </Button>
        Or <Link to='/register'>立即注册！</Link>
      </Form.Item>
    </Form>
  )
}
