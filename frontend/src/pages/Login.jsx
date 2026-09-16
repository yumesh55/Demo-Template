import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { loginUser } from '../store/actions/authActions'
import './Auth.css'

const Login = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const auth = useSelector(state => state.auth)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (auth.isAuthenticated && auth.token) {
      navigate('/', { replace: true })
    }
  }, [auth.isAuthenticated, auth.token, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await dispatch(loginUser(formData))
      if (result.success) {
        // Navigate will be triggered by useEffect when auth state updates
        navigate('/')
      } else {
        setError(result.error || 'Failed to login')
      }
    } catch (err) {
      setError(err.message || 'Failed to login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page login-page">
      <div className="auth-container login-card">
        <div className="login-brand">
          <div>
            <p className="brand-kicker">RENTO workspace</p>
            <h1>Welcome back</h1>
          </div>
        </div>
        <p className="subtitle">Sign in to manage rentals, returns, customers, and equipment availability.</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <div className="input-shell">
              <span className="input-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M20 21a8 8 0 0 0-16 0" />
                  <path d="M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" />
                </svg>
              </span>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter username"
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-shell">
              <span className="input-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M7 11V8a5 5 0 0 1 10 0v3" />
                  <path d="M6 11h12v10H6V11Z" />
                  <path d="M12 15v2" />
                </svg>
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-login">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="help-text">
          Don&apos;t have an account? Please contact your administrator to create one.
        </p>
      </div>
      <div className="side-bg login-showcase">
        <div className="showcase-panel">
          <div className="showcase-icon-row" aria-hidden="true">
            <span>
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M4 17h16" />
                <path d="M6 17 8 7h8l2 10" />
                <path d="M9 7V4h6v3" />
              </svg>
            </span>
            <span>
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M8 6h13" />
                <path d="M8 12h13" />
                <path d="M8 18h13" />
                <path d="M3 6h.01" />
                <path d="M3 12h.01" />
                <path d="M3 18h.01" />
              </svg>
            </span>
            <span>
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M20 7 9 18l-5-5" />
              </svg>
            </span>
          </div>
          <h2>Track rentals from checkout to return.</h2>
          <p>Monitor active customers, equipment movement, return dates, and availability in one calm workspace.</p>
        </div>

        <div className="showcase-visual-card visual-card-equipment" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M4 15h9" />
            <path d="M5 15 7 7h8l2 8" />
            <path d="M8 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
            <path d="M17 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
            <path d="M10 7V4h4v3" />
          </svg>
        </div>

        <div className="showcase-visual-card visual-card-check" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
      </div>
    </div>
  )
}
export default Login
