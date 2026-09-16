import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { bookingService } from '../services/api'
import PopuModal from '../modals/popuModal'
import './MyBookings.css'

function MyBookings() {
  const navigate = useNavigate()
  const { isAuthenticated, token } = useSelector((state) => state.auth)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [cancelTarget, setCancelTarget] = useState(null)
  const [cancelReason, setCancelReason] = useState('')
  const [feedbackModal, setFeedbackModal] = useState({
    isOpen: false,
    variant: 'success',
    title: '',
    message: '',
  })

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    fetchBookings()
  }, [isAuthenticated])

  const fetchBookings = async () => {
    try {
      const response = await bookingService.getBookings(token)
      setBookings(response.data)
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelBooking = async (bookingId, reason) => {
    if (!reason.trim()) {
      setFeedbackModal({
        isOpen: true,
        variant: 'error',
        title: 'Reason Required',
        message: 'Please enter a cancellation reason before cancelling the booking.',
      })
      return
    }

    try {
      await bookingService.cancelBooking(bookingId, reason, token)
      setFeedbackModal({
        isOpen: true,
        variant: 'success',
        title: 'Booking Cancelled',
        message: 'Booking cancelled successfully.',
      })
      setCancelTarget(null)
      setCancelReason('')
      fetchBookings()
    } catch (error) {
      console.error('Error cancelling booking:', error)
      setFeedbackModal({
        isOpen: true,
        variant: 'error',
        title: 'Cancel Failed',
        message: 'Failed to cancel booking',
      })
    }
  }

  const filteredBookings =
    filterStatus === 'all' ? bookings : bookings.filter((b) => b.status === filterStatus)

  if (loading) return <div className="loading">Loading...</div>

  return (
    <div className="bookings-page">
      <PopuModal
        isOpen={feedbackModal.isOpen}
        variant={feedbackModal.variant}
        title={feedbackModal.title}
        message={feedbackModal.message}
        onClose={() => setFeedbackModal(current => ({ ...current, isOpen: false }))}
      />
      <PopuModal
        isOpen={!!cancelTarget}
        variant="confirm"
        title="Cancel Booking?"
        message="Add a short reason for cancelling this booking."
        confirmLabel="Cancel Booking"
        input={{
          label: 'Cancellation reason',
          value: cancelReason,
          onChange: setCancelReason,
          placeholder: 'Enter reason',
          autoFocus: true,
        }}
        onConfirm={() => handleCancelBooking(cancelTarget._id, cancelReason)}
        onClose={() => {
          setCancelTarget(null)
          setCancelReason('')
        }}
      />
      <div className="bookings-container">
        <h1>My Bookings</h1>

        <div className="filter-tabs">
          <button
            className={`tab ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            All
          </button>
          <button
            className={`tab ${filterStatus === 'pending' ? 'active' : ''}`}
            onClick={() => setFilterStatus('pending')}
          >
            Pending
          </button>
          <button
            className={`tab ${filterStatus === 'approved' ? 'active' : ''}`}
            onClick={() => setFilterStatus('approved')}
          >
            Approved
          </button>
          <button
            className={`tab ${filterStatus === 'ongoing' ? 'active' : ''}`}
            onClick={() => setFilterStatus('ongoing')}
          >
            Ongoing
          </button>
          <button
            className={`tab ${filterStatus === 'completed' ? 'active' : ''}`}
            onClick={() => setFilterStatus('completed')}
          >
            Completed
          </button>
        </div>

        {filteredBookings.length > 0 ? (
          <div className="bookings-list">
            {filteredBookings.map((booking) => (
              <div key={booking._id} className="booking-card">
                <div className="booking-header">
                  <h3>{booking.equipment?.title}</h3>
                  <span className={`status status-${booking.status}`}>{booking.status.toUpperCase()}</span>
                </div>

                <div className="booking-details">
                  <div className="detail-row">
                    <span className="label">Owner:</span>
                    <span>{booking.owner?.name}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Start Date:</span>
                    <span>{new Date(booking.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">End Date:</span>
                    <span>{new Date(booking.endDate).toLocaleDateString()}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Total Days:</span>
                    <span>{booking.totalDays}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Price Per Day:</span>
                    <span>${booking.pricePerDay}</span>
                  </div>
                  <div className="detail-row price-row">
                    <span className="label">Total Price:</span>
                    <span className="price">${booking.totalPrice}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Payment Status:</span>
                    <span className={`payment-status ${booking.paymentStatus}`}>
                      {booking.paymentStatus.toUpperCase()}
                    </span>
                  </div>
                </div>

                {booking.notes && (
                  <div className="notes">
                    <strong>Notes:</strong> {booking.notes}
                  </div>
                )}

                <div className="booking-actions">
                  {booking.status === 'pending' && (
                    <button
                      className="btn-cancel"
                      onClick={() => {
                        setCancelTarget(booking)
                        setCancelReason('')
                      }}
                    >
                      Cancel Booking
                    </button>
                  )}
                  <button
                    className="btn-view"
                    onClick={() => navigate(`/equipment/${booking.equipment?._id}`)}
                  >
                    View Equipment
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-bookings">
            <p>No bookings found</p>
            <button className="btn-browse" onClick={() => navigate('/browse')}>
              Browse Equipment
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default MyBookings
