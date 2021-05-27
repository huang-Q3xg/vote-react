import React, {createContext, useContext} from 'react'

export const UserContext = createContext()
UserContext.displayName = 'UserContext'


/* TODO 这里建立useUserInfo-hook 的好处.... */
export function useUserInfo() {
  const userCtx = useContext(UserContext)
  return userCtx.userInfo
}
