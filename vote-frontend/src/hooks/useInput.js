
import {useRef, useState, useCallback} from 'react'

// 让useInput 适用于 input:text /  input:checkbox
export default function useInput(init='') {
  const [value, setVal] = useState(init)
  const [checked, setChecked] = useState(init)


  const onChange = useCallback( (evt) => {
      setVal(evt.target.value)
      setChecked(evt.target.checked)
    },[],
  )
  return {onChange, value, checked}
}
