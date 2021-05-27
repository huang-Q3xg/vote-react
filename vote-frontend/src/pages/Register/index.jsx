import React, { useCallback, useState, useRef } from 'react'
import axios from 'axios'
import { Form, Input, Button, Upload, Radio, Avatar, message } from 'antd'
import { UserOutlined } from '@ant-design/icons';
import { useInput } from '../../hooks'
import { useHistory, Link } from 'react-router-dom'
import './Register.scss'

function beforeUpload(file) {
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error('仅支持2M以内头像上传，请重试!');
  }
}

export default function Register() {
  const history = useHistory()
  const emailInp = useInput()
  const pwdInp = useInput()
  const nameInp = useInput()
  const [avatarSrc, setAvatarSrc] = useState('/uploads/default.png')
  const [gender, setGender] = useState('m')


  const validateMessages = {
    required: '${label}为必填项',
    types: {
      email: '不是有效${label}地址!',
    },
  };

  const hdRegister = useCallback(async ({user}) => {
    console.log(user);
    try {
      const { data: registerInfo } = await axios.post('/account/register', {
        ...user,
        avatar: avatarSrc,
      })
      console.log(registerInfo);
      alert('注册成功')
      history.push('/login')
    } catch (err) {
      console.dir(err)
      if (err.response.data.name = 'SequelizeUniqueConstraintError') {
        alert(err.response.data.msg)
      }
    }
  }, [avatarSrc])

  const hdGender = useCallback((evt) => {
    const genderVal = evt.target.value
    setGender(genderVal)
    if (genderVal == 'f') {
      setAvatarSrc('/uploads/default-f.png')
    } else {
      setAvatarSrc('/uploads/default.png')
    }
  }, [])


  const hdUploadAvatar = useCallback(async info => {
    const fd = new FormData()
    fd.set('file', info.file.originFileObj)
    try {
      const { data } = await axios.post('/upload', fd)
      setAvatarSrc(data.url)
    } catch (e) {
      console.dir(e)
    }
  }, []);

  return (
    <Form name="nest-messages" className="login-register-form" onFinish={hdRegister} validateMessages={validateMessages}>
      <Form.Item name={['user', 'email']} label="邮箱" rules={[{ type: 'email', required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item
        label="密码"
        name={['user', 'password']}
        rules={[{ required: true, message: '请输入密码' }]}
      >
        <Input.Password />
      </Form.Item>
      <Form.Item name={['user', 'name']} label="昵称" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name={['user', 'gender']} label="性别" rules={[{ required: true }]}>
        <Radio.Group onChange={hdGender} value={gender}>
          <Radio value={'m'}>男</Radio>
          <Radio value={'f'}>女</Radio>
        </Radio.Group>
      </Form.Item>
      <Form.Item
        label="头像(2M以内)"
        valuePropName="fileList"
      >
        <Upload
          name="avatar"
          listType="picture-card"
          className="avatar-uploader"
          showUploadList={false}
          beforeUpload={beforeUpload}
          onChange={hdUploadAvatar}
        >
          <Avatar size={64} shape='square' icon={<UserOutlined />} src={avatarSrc} />
        </Upload>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" block>
          注册
        </Button>
        Or <Link to='/login'>已有账号，立即登录!</Link>
      </Form.Item>
    </Form>
  )
}
