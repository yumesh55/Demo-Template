import { authService } from '../../services/api'

export const loadCurrentUser = () => async (dispatch, getState) => {
  const token = getState().auth.token || localStorage.getItem('token')

  if (!token) {
    return { success: false, error: 'No token found' }
  }

  dispatch({ type: 'AUTH_START' })

  try {
    const response = await authService.getProfile(token)
    dispatch({
      type: 'AUTH_USER_LOADED',
      payload: response.data,
    })
    return { success: true, user: response.data }
  } catch (error) {
    dispatch({ type: 'LOGOUT' })
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to load user profile',
    }
  }
}

export const loginUser = (formData) => async (dispatch) => {
  dispatch({ type: 'AUTH_START' })
  try {
    const response = await authService.login(formData)
    dispatch({
      type: 'AUTH_SUCCESS',
      payload: response.data,
    })
    return { success: true }
  } catch (error) {
    const errorMsg = error.response?.data?.error || 'Login failed'
    dispatch({
      type: 'AUTH_FAIL',
      payload: errorMsg,
    })
    return { success: false, error: errorMsg }
  }
}

export const registerUser = (formData) => async (dispatch) => {
  dispatch({ type: 'AUTH_START' })
  try {
    const response = await authService.register(formData)
    dispatch({
      type: 'AUTH_SUCCESS',
      payload: response.data,
    })
    return { success: true }
  } catch (error) {
    const errorMsg = error.response?.data?.error || 'Registration failed'
    dispatch({
      type: 'AUTH_FAIL',
      payload: errorMsg,
    })
    return { success: false, error: errorMsg }
  }
}

export const logout = () => (dispatch) => {
  dispatch({ type: 'LOGOUT' })
}
