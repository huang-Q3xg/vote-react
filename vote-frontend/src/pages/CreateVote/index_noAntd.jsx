import React, { useCallback, useEffect, useState } from 'react'
import { nanoid } from 'nanoid'
import * as immer from 'immer'
import axios from 'axios'

import { useInput, useQuery } from '../../hooks'
import { useHistory } from 'react-router-dom'

const layout = {
  labelCol: {
    span: 8,
  },
  wrapperCol: {
    span: 16,
  },
};
const tailLayout = {
  wrapperCol: {
    offset: 8,
    span: 16,
  },
};

export default function CreateVote() {
  const history = useHistory()
  const titleInp = useInput()
  const descInp = useInput()
  const deadlineInp = useInput(new Date(Date.now() + 86400000 + 28800000).toISOString().slice(0, 16))
  const anonymousInp = useInput(false)
  const restrictedInp = useInput(false)
  const query = useQuery()

  // const [options, setOptions] = useState(['', '']) /* 约定为字符串类型的 */
  const [options, setOptions] = useState([{ content: '', id: nanoid() }, { content: '', id: nanoid() }]) /* 约定为字符串类型的 */

  const hdAddOption = useCallback((evt) => {
    setOptions(immer.produce(draft => {
      draft.push({ content: '', id: nanoid() })
    }))
  }, [options])

  const hdDelOption = useCallback((idx) => {
    /* 约定只剩最后两项时，拒绝删除 */
    return (evt) => {
      if (options.length == 2) return
      setOptions(immer.produce(draft => {
        draft.splice(idx, 1)
      }))
    }
  }, [options])

  const hdEditOption = useCallback((idx) => {
    return (evt) => {
      setOptions(immer.produce(draft => {
        draft[idx].content = evt.target.value
      }))
    }
  }, [options])

  const hdCreateVote = useCallback(async (evt) => {
    evt.preventDefault()
    // evt.preventDefault()
    /* 传入后端时 options 的id是为了前端框架Key稳定服务的，不传给后端 */
    const { data: vote_data_backend } = await axios.post('/vote', {

      title: titleInp.value,
      description: descInp.value,
      deadline: deadlineInp.value,
      multiSelect: query.has('multiselect'),
      anonymous: anonymousInp.checked,
      restricted: restrictedInp.checked,
      options: options.map(opt => opt.content)
    })
    history.push(`/vote/${vote_data_backend.id}`)

  }, [titleInp, descInp, deadlineInp, query, anonymousInp, options])

  return (
    <React.Fragment>
      <form onSubmit={hdCreateVote}>
        <div>投票标题 <input type="text" name="title" id="title" {...titleInp} required /></div>
        <div>补充描述（选填）<input type="text" name="desc" id="desc" {...descInp} required /> </div>
        {
          options.map((opt, idx) => (
            // TODO ✔ 使分配过得key就尽量稳定而不再变化了)【key值不同，则react先销毁该组件，再重新创建】
            <div key={opt.id} data-key={opt.id}>
              <button type='button' onClick={hdDelOption(idx)}>- 删除</button>
              选项 <input type="text" name="option" value={opt.content} onChange={hdEditOption(idx)} required />
            </div>
          ))
        }
        <button type='button' onClick={hdAddOption}>+ 添加选项</button>

        <hr />
        <div>截止日期 <input type="datetime-local" name="deadline" id="deadline" {...deadlineInp} /></div>
        <div>匿名投票 <input type="checkbox" name="anonymous" id="anonymous" {...anonymousInp} /> </div>
        <div>限制传播 <input type="checkbox" name="restricted" id="restricted" {...restrictedInp} /> </div>
        <button type='submit'>创建</button>
      </form>
    </React.Fragment>
  )
}
