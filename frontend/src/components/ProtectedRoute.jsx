import React, { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { loadCurrentUser } from '../store/actions/authActions'

const ProtectedRoute = ({ children, allowedRoles }) => {
  const dispatch = useDispatch()
  const auth = useSelector(state => state.auth)

  useEffect(() => {
    if (auth.token && !auth.user && !auth.loading) {
      dispatch(loadCurrentUser())
    }
  }, [auth.token, auth.user, auth.loading, dispatch])

  if (!auth.isAuthenticated || !auth.token) {
    return <Navigate to="/login" replace />
  }

  if (auth.token && !auth.user) {
    return null
  }

  if (allowedRoles && !allowedRoles.includes(auth.user?.role)) {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute
