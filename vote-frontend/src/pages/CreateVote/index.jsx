import React, { useCallback } from 'react'
import axios from 'axios'
import { Form, Input, Button, DatePicker, Switch, Divider, Row, Col } from 'antd'
import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons'
import moment from 'moment'

import { useForceLogin, useQuery } from '../../hooks'
import { useHistory } from 'react-router-dom'
import './CreateVote.scss'
import { NavBar, Icon } from 'antd-mobile'


export default function CreateVote() {
  const history = useHistory()
  const query = useQuery()
  const user = useForceLogin()

  const hdCreateVote = useCallback(async (voteInfo) => {
    console.log(voteInfo);
    const { data: vote_data_backend } = await axios.post('/vote', {
      ...voteInfo,
      multiSelect: query.has('multiSelect'),
    })
    history.push(`/vote/${vote_data_backend.id}`)
  }, [])

  return (
    <div className="crete-vote-wrp">
      <div className='icon-back-wrp' onClick={() => { history.go(-1) }}>
        <i className='iconfont back'></i>
        <span>创建{query.has('multiSelect') ? '多选' : '单选'}投票</span>
      </div>
      <Form name="basic" initialValues={{ remember: true }} onFinish={hdCreateVote}
        className='create-vote'
        labelCol={{ span: 4, }}
        wrapperCol={{ span: 14, }}>
        <Row justify="space-around">
          <Col span={1}></Col>
          <Col span={23}>
            <Form.Item name="title" rules={[{ required: true, message: '题目不能为空' }]}
              style={{ margin: 0 }} >
              <Input placeholder="投票标题" autoComplete='off' style={{ fontSize: '0.44rem', fontWeight: 'bolder' }} bordered={false} />
            </Form.Item>
          </Col>
        </Row>
        <Divider style={{ margin: '.1rem 0 .1rem 0' }} />
        <Row justify="space-around">
          <Col span={1}></Col>
          <Col span={23}>
            <Form.Item name="description"
              style={{ margin: 0 }}>
              <Input placeholder="补充描述(选填)" autoComplete='off' style={{ fontSize: '0.32rem'}} bordered={false} />
            </Form.Item>
          </Col>
        </Row>

        <Divider style={{ margin: '.1rem 0 .2rem 0' }} />

        <Form.List
          name="options"
          initialValue={['', '']}
        >
          {(fields, { add, remove }, { errors }) => (
            <>
              {fields.map((field, index) => (
                <Row justify="space-around">
                  <Col span={1}></Col>
                  <Col span={1}>
                    <Form.Item key={field.key}
                      style={{ marginBottom: '.1rem' }}>
                      <MinusCircleOutlined
                        style={{ color: 'white', backgroundColor: 'orangered', borderRadius: 9999 }}
                        className="dynamic-delete-button"
                        onClick={() => fields.length > 2 && remove(field.name)}
                      />
                      {' '}
                    </Form.Item>
                  </Col>
                  <Col span={1}></Col>
                  <Col span={21}>
                    <Form.Item {...field} style={{ marginBottom: 0 }} rules={[{ required: true, message: '选项内容不能为空' }]}>
                      <Input
                        placeholder="选项"
                        style={{ width: '90%', padding: 0, fontSize: '.24rem' }}
                        bordered={false}
                        autoComplete='off'
                        className='option-input'
                      />
                    </Form.Item>
                  </Col>
                  <Divider style={{ margin: '.1rem 0' }} />
                </Row>
              ))}
              <Row justify="space-around" className='add-option'>
                <Col span={1}></Col>
                <Col span={1}>
                  <Form.Item>
                    <PlusCircleOutlined onClick={() => add()} style={{ color: 'white', backgroundColor: '#1890ff', borderRadius: 9999 }} />
                  </Form.Item>
                </Col>
                <Col span={1}></Col>
                <Col span={21}>
                  <Form.Item>
                    <Button type="link" onClick={() => add()} style={{ padding: 0, width: '90%', textAlign: 'left', color: '#1890ff', fontSize: '.28rem' }} >
                      增加选项
                  </Button>
                  </Form.Item>
                </Col>
              </Row>
            </>
          )}
        </Form.List>

        <Divider style={{ backgroundColor: '#f3f4f7', height: '.4rem', margin: 0 }} />

        <Row justify="space-around" align="middle">
          <Col span="4" style={{ whiteSpace: 'nowrap', fontSize: '.28rem' }}>截至时间</Col>
          <Col span="1"></Col>
          <Col span="1"></Col>
          <Col span="12">
            <Form.Item name="deadline" initialValue={moment().add(1, 'days')} style={{ margin: 0 }}>
              <DatePicker className='deadlineInput' format="YYYY-MM-DD HH:mm" showTime={{ format: 'HH:mm' }} bordered={false} allowClear={false} inputReadOnly />
            </Form.Item>
          </Col>
        </Row>
        <Divider style={{ margin: '.06rem' }} />
        <Row justify="space-around" align="middle">
          <Col span="4" style={{ whiteSpace: 'nowrap', fontSize: '.28rem' }}>匿名投票</Col>
          <Col span="4"></Col>
          <Col span="6"></Col>
          <Col span="4" >
            <Form.Item name="anonymous" style={{ margin: 0 }}>
              <Switch />
            </Form.Item>
          </Col>
        </Row>
        <Divider style={{ margin: '.06rem' }} />
        <Row justify="space-around" align="middle">
          <Col span="4" style={{ whiteSpace: 'nowrap', fontSize: '.28rem' }}>限制传播</Col>
          <Col span="4"></Col>
          <Col span="6"></Col>
          <Col span="4" lg={{ span: 6, offset: 2 }}>
            <Form.Item name="restricted" style={{ margin: 0 }}>
              <Switch />
            </Form.Item>
          </Col>
        </Row>

        <Divider style={{ backgroundColor: '#f3f4f7', height: '.4rem', margin: 0 }} />

        <Form.Item className='submit-btn'>
          <Button type="primary" htmlType="submit" style={{ width: '90%', height: '.65rem', backgroundColor:'#256df3'}}>
            完成
        </Button>
        </Form.Item>

      </Form>
    </div>

  )

}
