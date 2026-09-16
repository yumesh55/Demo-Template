import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import axios from 'axios'
import PopuModal from '../modals/popuModal'
import './StaffManagement.css'

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '')
const normalizeEmail = (value = '') => value.trim().toLowerCase()

const StaffManagement = () => {
  const auth = useSelector(state => state.auth)
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'Staff',
  })
  const [feedbackModal, setFeedbackModal] = useState({
    isOpen: false,
    variant: 'success',
    title: '',
    message: '',
  })
  const [deleteTargetId, setDeleteTargetId] = useState(null)
  const [passwordResetTarget, setPasswordResetTarget] = useState(null)
  const [newPassword, setNewPassword] = useState('')

  useEffect(() => {
    if (auth.user?.role !== 'Admin') {
      setFeedbackModal({
        isOpen: true,
        variant: 'error',
        title: 'Access Denied',
        message: 'Only Admin can access this page.',
      })
      return
    }
    fetchStaff()
  }, [])

  const fetchStaff = async () => {
    try {
      setLoading(true)
      const config = { headers: { Authorization: `Bearer ${auth.token}` } }
      const res = await axios.get(`${API_BASE}/users?limit=500`, config)
      setStaff(res.data.users || [])
    } catch (error) {
      console.error('Error fetching staff:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: name === 'email' ? normalizeEmail(value) : value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const config = { headers: { Authorization: `Bearer ${auth.token}` } }
      const payload = {
        ...formData,
        email: normalizeEmail(formData.email),
      }
      await axios.post(`${API_BASE}/users`, payload, config)
      fetchStaff()
      setShowForm(false)
      setFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'Staff',
      })
      setFeedbackModal({
        isOpen: true,
        variant: 'success',
        title: 'Staff Added',
        message: 'Staff member added successfully.',
      })
    } catch (error) {
      console.error('Error adding staff:', error)
      setFeedbackModal({
        isOpen: true,
        variant: 'error',
        title: 'Unable to Add Staff',
        message: error.response?.data?.error || 'Failed to add staff member',
      })
    }
  }

  const handleDelete = async (id) => {
    try {
      const config = { headers: { Authorization: `Bearer ${auth.token}` } }
      await axios.delete(`${API_BASE}/users/${id}`, config)
      fetchStaff()
      setDeleteTargetId(null)
      setFeedbackModal({
        isOpen: true,
        variant: 'success',
        title: 'Staff Deleted',
        message: 'Staff member deleted successfully.',
      })
    } catch (error) {
      console.error('Error deleting staff:', error)
      setDeleteTargetId(null)
      setFeedbackModal({
        isOpen: true,
        variant: 'error',
        title: 'Unable to Delete Staff',
        message: error.response?.data?.error || 'Failed to delete staff member',
      })
    }
  }

  const handleResetPassword = async () => {
    if (!passwordResetTarget) return

    if (!newPassword || newPassword.length < 6) {
      setFeedbackModal({
        isOpen: true,
        variant: 'error',
        title: 'Password Too Short',
        message: 'New password must be at least 6 characters long.',
      })
      return
    }

    try {
      const config = { headers: { Authorization: `Bearer ${auth.token}` } }
      await axios.put(
        `${API_BASE}/users/${passwordResetTarget._id}/password`,
        { password: newPassword },
        config
      )

      setFeedbackModal({
        isOpen: true,
        variant: 'success',
        title: 'Password Reset',
        message: `${passwordResetTarget.name}'s password was reset successfully.`,
      })
      setPasswordResetTarget(null)
      setNewPassword('')
    } catch (error) {
      console.error('Error resetting password:', error)
      setFeedbackModal({
        isOpen: true,
        variant: 'error',
        title: 'Reset Failed',
        message: error.response?.data?.error || 'Failed to reset password',
      })
    }
  }

  if (auth.user?.role !== 'Admin') {
    return <div className="staff-management"><p>Access Denied</p></div>
  }

  if (loading) return <div className="staff-management"><p>Loading...</p></div>

  return (
    <div className="staff-management">
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
      <PopuModal
        isOpen={!!deleteTargetId}
        variant="confirm"
        title="Delete Staff Member?"
        message="This user will be removed from the staff list."
        confirmLabel="Delete"
        onConfirm={() => handleDelete(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
      />
      <PopuModal
        isOpen={!!passwordResetTarget}
        variant="confirm"
        title="Reset Password?"
        message={passwordResetTarget ? `Set a new password for ${passwordResetTarget.name}.` : ''}
        confirmLabel="Reset Password"
        input={{
          label: 'New password',
          type: 'password',
          value: newPassword,
          onChange: setNewPassword,
          placeholder: 'Enter new password',
          minLength: 6,
          autoFocus: true,
        }}
        onConfirm={handleResetPassword}
        onClose={() => {
          setPasswordResetTarget(null)
          setNewPassword('')
        }}
      />
      <div className="header">
        <h1>Staff Management</h1>
        <button 
          className="btn-add"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : '+ Add Staff'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="staff-form">
          <div className="form-group">
            <label>Username *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter username"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                required
              />
            </div>

            <div className="form-group">
              <label>Phone *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Password *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
              >
                <option value="Staff">Staff</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn-primary">
            Add Staff Member
          </button>
        </form>
      )}

      <div className="staff-table-container">
        <table className="staff-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.map(member => (
              <tr key={member._id}>
                <td>{member.name}</td>
                <td>{member.email}</td>
                <td>{member.phone}</td>
                <td>{member.role}</td>
                <td>
                  <button
                    className="btn-reset-small"
                    onClick={() => {
                      setPasswordResetTarget(member)
                      setNewPassword('')
                    }}
                  >
                    Reset Password
                  </button>
                  <button
                    className="btn-delete-small"
                    onClick={() => setDeleteTargetId(member._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default StaffManagement
