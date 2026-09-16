import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { equipmentService } from '../services/api'
import './ListEquipment.css'

function ListEquipment() {
  const navigate = useNavigate()
  const { isAuthenticated, token } = useSelector((state) => state.auth)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    pricePerDay: '',
    pricePerWeek: '',
    pricePerMonth: '',
    depositRequired: '',
    location: {
      address: '',
      city: '',
      state: '',
      zipCode: '',
    },
    condition: 'good',
    images: [],
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  if (!isAuthenticated) {
    navigate('/login')
    return null
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name.includes('location.')) {
      const field = name.split('.')[1]
      setFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          [field]: value,
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      await equipmentService.createEquipment(formData, token)
      setMessage('Equipment listed successfully!')
      setFormData({
        title: '',
        description: '',
        category: '',
        pricePerDay: '',
        pricePerWeek: '',
        pricePerMonth: '',
        depositRequired: '',
        location: {
          address: '',
          city: '',
          state: '',
          zipCode: '',
        },
        condition: 'good',
        images: [],
      })
      setTimeout(() => navigate('/browse'), 1500)
    } catch (error) {
      setMessage('Error listing equipment: ' + (error.response?.data?.error || error.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="list-equipment-page">
      <div className="form-container">
        <h1>List Your Equipment</h1>
        {message && (
          <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <h2>Basic Information</h2>

          <div className="form-group">
            <label>Equipment Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="e.g., Power Drill, Party Tent"
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="5"
              placeholder="Describe your equipment in detail..."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category *</label>
              <select name="category" value={formData.category} onChange={handleChange} required>
                <option value="">Select a category</option>
                <option value="power-tools">Power Tools</option>
                <option value="party-supplies">Party Supplies</option>
                <option value="camping">Camping</option>
                <option value="sports">Sports</option>
                <option value="photography">Photography</option>
                <option value="gardening">Gardening</option>
              </select>
            </div>

            <div className="form-group">
              <label>Condition *</label>
              <select name="condition" value={formData.condition} onChange={handleChange}>
                <option value="like-new">Like New</option>
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
              </select>
            </div>
          </div>

          {/* Pricing */}
          <h2>Pricing</h2>

          <div className="form-row">
            <div className="form-group">
              <label>Price per Day *</label>
              <input
                type="number"
                name="pricePerDay"
                value={formData.pricePerDay}
                onChange={handleChange}
                required
                step="0.01"
                placeholder="0.00"
              />
            </div>

            <div className="form-group">
              <label>Price per Week</label>
              <input
                type="number"
                name="pricePerWeek"
                value={formData.pricePerWeek}
                onChange={handleChange}
                step="0.01"
                placeholder="0.00"
              />
            </div>

            <div className="form-group">
              <label>Price per Month</label>
              <input
                type="number"
                name="pricePerMonth"
                value={formData.pricePerMonth}
                onChange={handleChange}
                step="0.01"
                placeholder="0.00"
              />
            </div>

            <div className="form-group">
              <label>Deposit Required</label>
              <input
                type="number"
                name="depositRequired"
                value={formData.depositRequired}
                onChange={handleChange}
                step="0.01"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Location */}
          <h2>Location</h2>

          <div className="form-group">
            <label>Street Address</label>
            <input
              type="text"
              name="location.address"
              value={formData.location.address}
              onChange={handleChange}
              placeholder="Street address"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                name="location.city"
                value={formData.location.city}
                onChange={handleChange}
                placeholder="City"
              />
            </div>

            <div className="form-group">
              <label>State</label>
              <input
                type="text"
                name="location.state"
                value={formData.location.state}
                onChange={handleChange}
                placeholder="State"
              />
            </div>

            <div className="form-group">
              <label>Zip Code</label>
              <input
                type="text"
                name="location.zipCode"
                value={formData.location.zipCode}
                onChange={handleChange}
                placeholder="Zip code"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? 'Listing...' : 'List Equipment'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ListEquipment
