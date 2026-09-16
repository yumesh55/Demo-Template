import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import ReviewCard from '../components/ReviewCard'
import { equipmentService, reviewService, userService, bookingService } from '../services/api'
import PopuModal from '../modals/popuModal'
import './EquipmentDetail.css'

function EquipmentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, token } = useSelector((state) => state.auth)
  const [equipment, setEquipment] = useState(null)
  const [reviews, setReviews] = useState([])
  const [isSaved, setIsSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [bookingForm, setBookingForm] = useState({
    startDate: '',
    endDate: '',
  })
  const [feedbackModal, setFeedbackModal] = useState({
    isOpen: false,
    variant: 'success',
    title: '',
    message: '',
  })
  const [redirectAfterModal, setRedirectAfterModal] = useState(false)

  useEffect(() => {
    fetchEquipmentDetails()
  }, [id])

  const fetchEquipmentDetails = async () => {
    try {
      const equipRes = await equipmentService.getEquipmentById(id)
      setEquipment(equipRes.data)

      const reviewRes = await reviewService.getEquipmentReviews(id)
      setReviews(reviewRes.data)
    } catch (error) {
      console.error('Error fetching details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveEquipment = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    try {
      await userService.saveEquipment(id, token)
      setIsSaved(!isSaved)
    } catch (error) {
      console.error('Error saving equipment:', error)
    }
  }

  const handleBooking = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    try {
      await bookingService.createBooking(
        {
          equipmentId: id,
          startDate: bookingForm.startDate,
          endDate: bookingForm.endDate,
        },
        token
      )
      setFeedbackModal({
        isOpen: true,
        variant: 'success',
        title: 'Booking Created',
        message: 'Booking created successfully.',
      })
      setBookingForm({ startDate: '', endDate: '' })
      setRedirectAfterModal(true)
    } catch (error) {
      console.error('Error creating booking:', error)
      setFeedbackModal({
        isOpen: true,
        variant: 'error',
        title: 'Booking Failed',
        message: 'Failed to create booking',
      })
    }
  }

  if (loading) return <div className="loading">Loading...</div>
  if (!equipment) return <div className="error">Equipment not found</div>

  return (
    <div className="equipment-detail">
      <PopuModal
        isOpen={feedbackModal.isOpen}
        variant={feedbackModal.variant}
        title={feedbackModal.title}
        message={feedbackModal.message}
        onClose={() => {
          setFeedbackModal(current => ({ ...current, isOpen: false }))
          if (redirectAfterModal) {
            setRedirectAfterModal(false)
            navigate('/bookings')
          }
        }}
      />
      <div className="detail-container">
        <div className="detail-images">
          <div className="main-image">
            <img src={equipment.images?.[0] || '/placeholder.jpg'} alt={equipment.title} />
          </div>
          {equipment.images && equipment.images.length > 1 && (
            <div className="thumbnail-images">
              {equipment.images.map((img, idx) => (
                <img key={idx} src={img} alt={`thumb-${idx}`} />
              ))}
            </div>
          )}
        </div>

        <div className="detail-info">
          <div className="detail-header">
            <h1>{equipment.title}</h1>
            <button className={`btn-save ${isSaved ? 'saved' : ''}`} onClick={handleSaveEquipment}>
              {isSaved ? '❤️ Saved' : '🤍 Save'}
            </button>
          </div>

          <div className="owner-info">
            <img src={equipment.owner?.profileImage || '/default-avatar.jpg'} alt={equipment.owner?.name} />
            <div>
              <h3>{equipment.owner?.name}</h3>
              <p>⭐ {equipment.owner?.rating?.toFixed(1) || 0} ({equipment.owner?.totalReviews} reviews)</p>
            </div>
          </div>

          <div className="equipment-stats">
            <div className="stat">
              <span>Rating</span>
              <p>⭐ {equipment.rating?.toFixed(1) || 0}</p>
            </div>
            <div className="stat">
              <span>Reviews</span>
              <p>{equipment.totalReviews}</p>
            </div>
            <div className="stat">
              <span>Views</span>
              <p>{equipment.views}</p>
            </div>
          </div>

          <p className="description">{equipment.description}</p>

          <div className="pricing">
            <div className="price-option">
              <h4>Per Day</h4>
              <p>${equipment.pricePerDay}</p>
            </div>
            {equipment.pricePerWeek && (
              <div className="price-option">
                <h4>Per Week</h4>
                <p>${equipment.pricePerWeek}</p>
              </div>
            )}
            {equipment.pricePerMonth && (
              <div className="price-option">
                <h4>Per Month</h4>
                <p>${equipment.pricePerMonth}</p>
              </div>
            )}
          </div>

          <form className="booking-form" onSubmit={handleBooking}>
            <h3>Book This Equipment</h3>
            <div className="form-group">
              <label>Start Date</label>
              <input
                type="date"
                value={bookingForm.startDate}
                onChange={(e) => setBookingForm({ ...bookingForm, startDate: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input
                type="date"
                value={bookingForm.endDate}
                onChange={(e) => setBookingForm({ ...bookingForm, endDate: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="btn-book">
              Book Now
            </button>
          </form>
        </div>
      </div>

      <div className="reviews-section">
        <h2>Reviews ({reviews.length})</h2>
        {reviews.length > 0 ? (
          reviews.map((review) => <ReviewCard key={review._id} review={review} />)
        ) : (
          <p>No reviews yet</p>
        )}
      </div>
    </div>
  )
}

export default EquipmentDetail
