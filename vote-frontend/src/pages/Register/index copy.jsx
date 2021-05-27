import React, { useCallback, useState, useRef } from 'react'
import axios from 'axios'
import { Form, Input, InputNumber, Button, Upload, Radio, Avatar } from 'antd'
import { UploadOutlined, InboxOutlined, UserOutlined } from '@ant-design/icons';
import { useInput } from '../../hooks'
import { useHistory } from 'react-router-dom'



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
    number: {
      range: '${label} must be between ${min} and ${max}',
    },
  };

  const normFile = (e) => {
    console.log('Upload event:', e);

    if (Array.isArray(e)) {
      return e;
    }

    return e && e.fileList;
  };

  const hdRegister = useCallback(async (evt) => {
    evt.preventDefault()
    try {
      const { data: registerInfo } = await axios.post('/account/register', {
        email: emailInp.value,
        password: pwdInp.value,
        name: nameInp.value, /* TODO 后期可优化：  */
        gender,
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
  }, [emailInp, pwdInp, nameInp, gender])

  const hdGender = useCallback((evt) => {
    const genderVal = evt.target.value
    setGender(genderVal)
    if (genderVal == 'f') {
      setAvatarSrc('/uploads/default-f.png')
    } else {
      setAvatarSrc('/uploads/default.png')
    }
  }, [])

  const hdUploadAvatar = useCallback(async (evt) => {
    const fileOne = evt.target.files[0]
    if (fileOne.size > 2 * 1024 * 1024) {
      alert('仅支持2M以内头像上传，请重试')
      evt.target.files = null
      return
    }
    const fd = new FormData()
    fd.set('file', fileOne)
    try {
      const { data } = await axios.post('/upload', fd)
      setAvatarSrc(data.url)
    } catch (e) {
      console.dir(e)
    }
  }, [])



  const onFinish = useCallback((user) => {
    console.log(user);
  })

  return (
    <Form name="nest-messages" onFinish={onFinish} validateMessages={validateMessages}>
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
        name="upload"
        label="头像(2M以内)"
        valuePropName="fileList"
        getValueFromEvent={normFile}
      >
        <Input type="file" name="avatar" id="avatar" onChange={hdUploadAvatar} />
        <Avatar size={64} icon={<UserOutlined />} src={avatarSrc}/>
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" block>
          注册
        </Button>
      </Form.Item>
    </Form>
  )

  return (
    <React.Fragment>
      <form onSubmit={hdRegister}>
        邮箱： <input type="email" name="email" id="email" required {...emailInp} /><br />
        密码： <input type="password" name="password" id="password" required {...pwdInp} /><br />
        昵称： <input type="text" name="name" id="name" required {...nameInp} /><br />

        <div>
          性别：<label htmlFor="male"> 男<input type="radio" name="gender" id="male" value='m' checked={gender === 'm'} onChange={hdGender} /></label>
          <label htmlFor="female"> 女<input type="radio" name="gender" id="female" value='f' checked={gender === 'f'} onChange={hdGender} /></label>
        </div>
        <div><input type="file" name="avatar" id="avatar" onChange={hdUploadAvatar} />选择头像（2M以内）</div>
        <div><img src={avatarSrc} style={{ width: 50, height: 50 }} /></div>
        <button type='submit'>注册</button>
      </form>
    </React.Fragment>
  )
}
