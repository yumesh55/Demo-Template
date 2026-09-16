import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { logout } from '../store/actions/authActions'
import PopuModal from '../modals/popuModal'
import './Profile.css'

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '')

const Profile = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const auth = useSelector(state => state.auth)
  const [formData, setFormData] = useState({
    name: auth.user?.name || '',
    phone: auth.user?.phone || '',
  })
  const [loading, setLoading] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [feedbackModal, setFeedbackModal] = useState({
    isOpen: false,
    variant: 'success',
    title: '',
    message: '',
  })

  useEffect(() => {
    setFormData({
      name: auth.user?.name || '',
      phone: auth.user?.phone || '',
    })
  }, [auth.user?.name, auth.user?.phone])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const config = { headers: { Authorization: `Bearer ${auth.token}` } }
      await axios.put(`${API_BASE}/users/profile/update`, formData, config)
      setEditMode(false)
      setFeedbackModal({
        isOpen: true,
        variant: 'success',
        title: 'Profile Updated',
        message: 'Your profile details were saved successfully.',
      })
    } catch (error) {
      console.error('Error updating profile:', error)
      setFeedbackModal({
        isOpen: true,
        variant: 'error',
        title: 'Update Failed',
        message: error.response?.data?.error || 'Failed to update profile',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <div className="profile">
      <PopuModal
        isOpen={feedbackModal.isOpen}
        variant={feedbackModal.variant}
        title={feedbackModal.title}
        message={feedbackModal.message}
        onClose={() =>
          setFeedbackModal((current) => ({
            ...current,
            isOpen: false,
          }))
        }
      />
      <div className="profile-card">
        <div className="profile-hero">
          <div className="profile-avatar" aria-hidden="true">
            {(auth.user?.name || auth.user?.email || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="profile-heading">
            <span className="profile-eyebrow">Account workspace</span>
            <h1>{auth.user?.name || 'User Profile'}</h1>
            <p>{auth.user?.role || 'Team member'} access for Rento operations</p>
          </div>
        </div>

        <div className="profile-info">
          <div className="info-group">
            <label>Name</label>
            <p>{auth.user?.name}</p>
          </div>

          <div className="info-group">
            <label>Email</label>
            <p>{auth.user?.email}</p>
          </div>

          <div className="info-group">
            <label>Role</label>
            <p className="badge">{auth.user?.role}</p>
          </div>

          <div className="info-group">
            <label>Phone</label>
            <p>{auth.user?.phone}</p>
          </div>
        </div>

        {editMode ? (
          <form onSubmit={handleSubmit} className="edit-form">
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-save" disabled={loading}>
                {loading ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setEditMode(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="actions">
            <button
              className="btn-edit"
              onClick={() => setEditMode(true)}
            >
              Edit Profile
            </button>
            <button
              className="btn-logout"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile
