import copy2board from 'copy-to-clipboard'
import CONSTANT from '../constant'
import {useMemo} from 'react'

// hdCopyUrl(`${CONSTANT.REMOTE_DOMAIN_PORT}/#/vote/${voteInfo.id}`
export default function() {
  return useMemo(() => voteId => evt => {
    copy2board(`${CONSTANT.REMOTE_DOMAIN_PORT}/#/vote/${voteId}`)
    alert('投票链接已复制到粘贴板，立即分享吧！')
  })
}
