import { createContext, useContext, useState, useCallback } from 'react'
import { getItem, setItem, removeItem } from '../utils/storage'
import { getUserById } from '../utils/db'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getItem('dsa_auth_session'))

  const login = useCallback((u) => {
    setItem('dsa_auth_session', u)
    setUser(u)
  }, [])

  const logout = useCallback(() => {
    removeItem('dsa_auth_session')
    setUser(null)
  }, [])

  const refreshUser = useCallback(() => {
    if (user) {
      const fresh = getUserById(user.id)
      if (fresh) { setItem('dsa_auth_session', fresh); setUser(fresh) }
    }
  }, [user])

  return (
    <AuthCtx.Provider value={{
      currentUser: user,
      login,
      logout,
      refreshUser,
      isAdmin: user?.role === 'admin',
    }}>
      {children}
    </AuthCtx.Provider>
  )
}

export const useAuth = () => useContext(AuthCtx)
