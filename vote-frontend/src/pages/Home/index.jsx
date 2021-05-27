import React from 'react'
import { Link, } from 'react-router-dom'
import { useForceLogin } from '../../hooks'

import { Layout, Button, Divider } from 'antd';
import './Home.scss'

const { Content } = Layout


export default function Home() {
  /* 这里细节： 一开始即登录到Home界面，先做用户是否登陆的判断， 基于App传入的context */
  /* 以下逻辑有：
      ①未登录情况下，会强制从/home 跳到 /login; ② 登录成功后会更新UserContext的userInfo (见Login组件);
      ③若先前登录过（本地cookie存在），那么会尝试直接通过get /api1/account/userinfo 获取用户信息！（这也释疑了为何需要后端userinfo路由的场景） */

  const userInfo = useForceLogin()

  return (
    <React.Fragment>
      <div >
        <div style={{ display: 'flex', flexFlow: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
          <div style={{
            height: '40vh',
            width: '100%',
            display: 'flex', flexFlow: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          >
            <img src='/public/icons/signal.png'  style={{ margin: '20px', height:'122px', width:'157px' }} />
            <Button type="primary" block style={{ width: '80%' }}>
              <Link to="/create">单选投票</Link>
            </Button>
          </div>
          <Divider style={{ backgroundColor: '#f3f4f7', height: '.3rem', margin: 0 }} />
          <div style={{
            height: '40vh',
            width: '100%', display: 'flex', flexFlow: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          >

            <img src='/public/icons/mult.png'  style={{ margin: '20px',height:'122px', width:'157px'}} />
            <Button type="primary" block style={{ width: '80%' }}>
              <Link to="/create?multiSelect">多选投票</Link>
            </Button>
          </div>

        </div>

      </div>
    </React.Fragment>


  )
}
