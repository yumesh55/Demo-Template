// Utility function to check if JWT token is expired
const isTokenExpired = (token) => {
  try {
    if (!token) return true
    const parts = token.split('.')
    if (parts.length !== 3) return true
    const decoded = JSON.parse(atob(parts[1]))
    const currentTime = Math.floor(Date.now() / 1000)
    return decoded.exp && decoded.exp < currentTime
  } catch (error) {
    return true
  }
}

const storedToken = localStorage.getItem('token')
const storedUser = localStorage.getItem('user')

// Clear auth data if token is expired
const isTokenValid = storedToken && !isTokenExpired(storedToken)
if (storedToken && !isTokenValid) {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

const initialState = {
  user: isTokenValid && storedUser ? JSON.parse(storedUser) : null,
  token: isTokenValid ? storedToken : null,
  isAuthenticated: isTokenValid,
  loading: false,
  error: null,
}

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, loading: true, error: null }
    case 'AUTH_SUCCESS':
      localStorage.setItem('token', action.payload.token)
      localStorage.setItem('user', JSON.stringify(action.payload.user))
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      }
    case 'AUTH_USER_LOADED':
      localStorage.setItem('user', JSON.stringify(action.payload))
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
        error: null,
      }
    case 'AUTH_FAIL':
      return { ...state, error: action.payload, loading: false }
    case 'LOGOUT':
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      return { ...state, user: null, token: null, isAuthenticated: false, loading: false }
    default:
      return state
  }
}

export default authReducer
