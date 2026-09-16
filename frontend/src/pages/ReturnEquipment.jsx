import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import axios from 'axios'
import PopuModal from '../modals/popuModal'
import './ReturnEquipment.css'

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '')

const getRentalGroupKey = (rental) => [
  rental.customerPhone,
  rental.customerName,
  new Date(rental.startDate).toISOString().split('T')[0],
  rental.status,
  rental.notes || '',
].join('|')

const buildRentalGroups = (rentals) => {
  const groups = rentals.reduce((acc, rental) => {
    const key = getRentalGroupKey(rental)

    if (!acc[key]) {
      acc[key] = {
        ...rental,
        _id: key,
        rentals: [],
      }
    }

    acc[key].rentals.push(rental)
    return acc
  }, {})

  return Object.values(groups).map(group => ({
    ...group,
    totalQuantity: group.rentals.reduce((total, rental) => total + rental.quantity, 0),
  }))
}

const formatDate = (date) => new Date(date).toLocaleDateString('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

const ReturnEquipment = ({ isModal = false, onClose = null }) => {
  const auth = useSelector(state => state.auth)
  const [activeRentals, setActiveRentals] = useState([])
  const [selectedRental, setSelectedRental] = useState(null)
  const [selectedReturnIds, setSelectedReturnIds] = useState([])
  const [endDate, setEndDate] = useState('')
  const [calculatedAmount, setCalculatedAmount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showTrackingModal, setShowTrackingModal] = useState(false)
  const [showReturnModal, setShowReturnModal] = useState(false)
  const [feedbackModal, setFeedbackModal] = useState({
    isOpen: false,
    variant: 'success',
    title: '',
    message: '',
  })
  const [cancelTarget, setCancelTarget] = useState(null)

  useEffect(() => {
    fetchActiveRentals()
  }, [])

  useEffect(() => {
    if (selectedRental && endDate) {
      calculateAmount()
    } else {
      setCalculatedAmount(0)
    }
  }, [selectedRental, endDate, selectedReturnIds])

  useEffect(() => {
    if (selectedRental) {
      setSelectedReturnIds(selectedRental.rentals.map(item => item._id))
    } else {
      setSelectedReturnIds([])
    }
  }, [selectedRental])

  const fetchActiveRentals = async () => {
    try {
      setLoading(true)
      const config = { headers: { Authorization: `Bearer ${auth.token}` } }
      const res = await axios.get(`${API_BASE}/bookings?status=Active`, config)
      setActiveRentals(res.data.rentals || [])
    } catch (error) {
      console.error('Error fetching rentals:', error)
    } finally {
      setLoading(false)
    }
  }

  const activeRentalGroups = buildRentalGroups(activeRentals)

  const calculateAmount = () => {
    if (!selectedRental || !endDate) {
      setCalculatedAmount(0)
      return
    }

    const start = new Date(selectedRental.startDate)
    const end = new Date(endDate)
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
    const selectedRentals = selectedRental.rentals.filter(item => selectedReturnIds.includes(item._id))

    const amount = selectedRentals.reduce((total, rental) => {
      const rentPerDay = rental.equipment?.rentPerDay || rental.rentPerDay || 0
      return total + (days * rentPerDay * rental.quantity)
    }, 0)
    setCalculatedAmount(amount)
  }

  const handleCancelReturn = () => {
    setShowReturnModal(false)
    setEndDate('')
    setSelectedReturnIds([])
    setCalculatedAmount(0)
    if (onClose && isModal) {
      onClose()
    }
  }

  const closeTrackingModal = () => {
    setShowTrackingModal(false)
    setSelectedRental(null)
    setSelectedReturnIds([])
    setEndDate('')
    setCalculatedAmount(0)
  }

  const handleCancelInitiate = () => {
    if (!selectedRental) return
    setCancelTarget(selectedRental)
  }

  const handleCancelRental = async () => {
    if (!cancelTarget) return

    try {
      const config = { headers: { Authorization: `Bearer ${auth.token}` } }
      await Promise.all(cancelTarget.rentals.map(rental =>
        axios.put(`${API_BASE}/bookings/${rental._id}/cancel`, {}, config)
      ))

      setFeedbackModal({
        isOpen: true,
        variant: 'success',
        title: 'Rental Cancelled',
        message: 'The rental was cancelled successfully.',
      })
      setCancelTarget(null)
      setSelectedRental(null)
      setSelectedReturnIds([])
      setEndDate('')
      setCalculatedAmount(0)
      fetchActiveRentals()
    } catch (error) {
      console.error('Error cancelling rental:', error)
      setFeedbackModal({
        isOpen: true,
        variant: 'error',
        title: 'Cancel Failed',
        message: error.response?.data?.error || 'Failed to cancel rental',
      })
      setCancelTarget(null)
    }
  }

  const handleReturnEquipment = async () => {
    if (!selectedRental) {
      setFeedbackModal({
        isOpen: true,
        variant: 'error',
        title: 'Rental Required',
        message: 'Please select a rental before returning equipment.',
      })
      return
    }

    if (!endDate || endDate.trim() === '') {
      setFeedbackModal({
        isOpen: true,
        variant: 'error',
        title: 'Return Date Required',
        message: 'Please enter a return date before confirming the return.',
      })
      return
    }

    const selectedRentals = selectedRental.rentals.filter(item => selectedReturnIds.includes(item._id))

    if (!selectedRentals.length) {
      setFeedbackModal({
        isOpen: true,
        variant: 'error',
        title: 'No Items Selected',
        message: 'Please select at least one equipment item to return.',
      })
      return
    }

    try {
      const config = { headers: { Authorization: `Bearer ${auth.token}` } }
      const payload = {
        endDate: new Date(endDate).toISOString(),
      }

      await Promise.all(selectedRentals.map(rental =>
        axios.put(`${API_BASE}/bookings/${rental._id}/return`, payload, config)
      ))
      setFeedbackModal({
        isOpen: true,
        variant: 'success',
        title: 'Equipment Returned',
        message: 'Selected equipment items were returned successfully.',
      })
      setShowReturnModal(false)
      fetchActiveRentals()
      setSelectedRental(null)
      setSelectedReturnIds([])
      setEndDate('')
      setCalculatedAmount(0)
    } catch (error) {
      console.error('Error returning equipment:', error)
      setFeedbackModal({
        isOpen: true,
        variant: 'error',
        title: 'Return Failed',
        message: error.response?.data?.error || 'Failed to return equipment',
      })
    }
  }

  if (loading) return <div className="return-equipment"><p>Loading...</p></div>

  const content = (
    <>
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
        title="Cancel Rental?"
        message="This rental will be marked as cancelled and removed from the active queue."
        confirmLabel="Yes, Cancel"
        cancelLabel="Keep Rental"
        onConfirm={handleCancelRental}
        onClose={() => setCancelTarget(null)}
      />
      <div className="returns-header">
        <div>
          <p className="page-kicker">Equipment tracking</p>
          <h1>Return Equipment</h1>
        </div>
        <div className="returns-summary">
          <span>{activeRentalGroups.length}</span>
          <small>active rental{activeRentalGroups.length === 1 ? '' : 's'}</small>
        </div>
      </div>

      <div className="return-container single-column-return">
        <div className="rentals-section">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Queue</p>
              <h2>Active Rentals</h2>
            </div>
          </div>
          {activeRentalGroups.length > 0 ? (
            <div className="rentals-list">
              {activeRentalGroups.map(rental => (
                <div
                  key={rental._id}
                  className={`rental-item ${selectedRental?._id === rental._id ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedRental(rental)
                    setEndDate('')
                    setCalculatedAmount(0)
                    setShowTrackingModal(true)
                  }}
                >
                  <div className="rental-info">
                    <div className="rental-card-topline">
                      <h4>{rental.customerName}</h4>
                      <span>{rental.rentals.length} item{rental.rentals.length === 1 ? '' : 's'}</span>
                    </div>
                    <p className="rental-date">Started {formatDate(rental.startDate)}</p>
                    <div className="equipment-list compact-equipment-list">
                      {rental.rentals.map(item => (
                        <div className="equipment-list-item" key={item._id}>
                          <span>{item.equipment?.name}</span>
                          <span>Qty {item.quantity}</span>
                        </div>
                      ))}
                    </div>
                    <div className="contact-chip">
                      <span>Mobile</span>
                      <strong>{rental.customerPhone}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No active rentals</p>
          )}
        </div>
      </div>

      {showTrackingModal && selectedRental && (
        <div className="modal-overlay tracking-modal-overlay" onClick={closeTrackingModal}>
          <div className="modal-content tracking-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Tracking</h2>
              <button className="modal-close" type="button" onClick={closeTrackingModal}>✕</button>
            </div>

            <div className="modal-body tracking-modal-body">
              <div className="details-hero tracking-hero">
                <div>
                  <p className="section-kicker">Tracking</p>
                  <h2>{selectedRental.customerName}</h2>
                  <div className="contact-chip hero-contact">
                    <span>Mobile</span>
                    <strong>{selectedRental.customerPhone}</strong>
                  </div>
                </div>
                <span className="tracking-pill">Active</span>
              </div>

              <div className="tracking-steps">
                <div className="tracking-step complete">
                  <span className="step-dot"></span>
                  <div>
                    <strong>Rental started</strong>
                    <p>{formatDate(selectedRental.startDate)}</p>
                  </div>
                </div>
                <div className="tracking-step active">
                  <span className="step-dot"></span>
                  <div>
                    <strong>Equipment out</strong>
                    <p>{selectedRental.totalQuantity} unit{selectedRental.totalQuantity === 1 ? '' : 's'} with customer</p>
                  </div>
                </div>
                <div className="tracking-step">
                  <span className="step-dot"></span>
                  <div>
                    <strong>Return pending</strong>
                    <p>Select a return date to close this rental</p>
                  </div>
                </div>
              </div>

              <div className="detail-grid">
                <div className="metric-tile">
                  <span>Total items</span>
                  <strong>{selectedRental.rentals.length}</strong>
                </div>
                <div className="metric-tile">
                  <span>Total quantity</span>
                  <strong>{selectedRental.totalQuantity}</strong>
                </div>
                <div className="metric-tile">
                  <span>Start date</span>
                  <strong>{formatDate(selectedRental.startDate)}</strong>
                </div>
                <div className="metric-tile contact-metric">
                  <span>Customer mobile</span>
                  <strong>{selectedRental.customerPhone}</strong>
                </div>
              </div>

              <div className="equipment-panel">
                <div className="panel-heading">
                  <h3>Equipment List</h3>
                  <span>{selectedRental.totalQuantity} total</span>
                </div>
                <div className="equipment-list">
                  {selectedRental.rentals.map(item => (
                    <div className="equipment-list-item" key={item._id}>
                      <span>{item.equipment?.name}</span>
                      <span>Qty {item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedRental.notes && (
                <div className="notes-panel">
                  <span>Notes</span>
                  <p>{selectedRental.notes}</p>
                </div>
              )}
            </div>

            <div className="modal-footer tracking-modal-footer">
              <button className="btn-cancel" type="button" onClick={handleCancelInitiate}>Cancel Rental</button>
              <button className="btn-return" type="button" onClick={() => {
                setShowTrackingModal(false)
                setShowReturnModal(true)
              }}>Start Return</button>
            </div>
          </div>
        </div>
      )}

      {showReturnModal ? (
        <div className="modal-overlay" onClick={handleCancelReturn}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirm Return</h2>
              <button
                className="modal-close"
                type="button"
                onClick={handleCancelReturn}
              >
                ✕
              </button>
            </div>

            {selectedRental ? (
              <div className="modal-body">
                <div className="modal-detail">
                  <label>Customer</label>
                  <div className="modal-customer-card">
                    <strong>{selectedRental.customerName}</strong>
                    <span>{selectedRental.customerPhone}</span>
                  </div>
                </div>

                <div className="modal-detail">
                  <label>Select items to return</label>
                  <div className="return-selection-summary">
                    <span>{selectedReturnIds.length} selected</span>
                    <small>Choose the equipment rows you want to return now.</small>
                  </div>
                  <div className="equipment-list">
                    {selectedRental.rentals.map(item => {
                      const isSelected = selectedReturnIds.includes(item._id)

                      return (
                        <label
                          className={`equipment-list-item return-item-row ${isSelected ? 'selected-return-item' : ''}`}
                          key={item._id}
                        >
                          <div className="return-item-main">
                            <span className="checkbox-shell">
                              <input
                                type="checkbox"
                                className="return-checkbox"
                                checked={isSelected}
                                onChange={() => {
                                  setSelectedReturnIds(current =>
                                    current.includes(item._id)
                                      ? current.filter(id => id !== item._id)
                                      : [...current, item._id]
                                  )
                                }}
                              />
                              <span className="checkbox-mark" aria-hidden="true" />
                            </span>
                            <div className="item-copy">
                              <strong>{item.equipment?.name}</strong>
                              <span>Return this item separately</span>
                            </div>
                          </div>
                          <span className="return-item-badge">Qty {item.quantity}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>

                <div className="modal-detail">
                  <label htmlFor="modalEndDate">Return Date *</label>
                  <input
                    type="date"
                    id="modalEndDate"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={new Date(selectedRental.startDate).toISOString().split('T')[0]}
                    required
                  />
                </div>

                {calculatedAmount > 0 && (
                  <div className="amount-card">
                    <span>Selected return amount</span>
                    <strong>₹{calculatedAmount.toLocaleString()}</strong>
                  </div>
                )}
              </div>
            ) : null}

            <div className="modal-footer">
              <button
                className="btn-confirm"
                type="button"
                onClick={handleReturnEquipment}
                disabled={!endDate || selectedReturnIds.length === 0}
              >
                Confirm Return
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )

  if (isModal) {
    return (
      <div className="modal-overlay return-equipment-modal-overlay" onClick={handleCancelReturn}>
        <div className="return-equipment return-equipment-modal" onClick={(event) => event.stopPropagation()}>
          {content}
        </div>
      </div>
    )
  }

  return <div className="return-equipment">{content}</div>
}

export default ReturnEquipment
