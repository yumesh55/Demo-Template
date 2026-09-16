import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import axios from 'axios'
import PopuModal from '../modals/popuModal'
import './RentalsList.css'

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '')

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value || 0)

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }) : 'Not returned'

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
    totalAmount: group.rentals.some(rental => rental.totalAmount !== null && rental.totalAmount !== undefined)
      ? group.rentals.reduce((total, rental) => total + Number(rental.totalAmount || 0), 0)
      : null,
    totalDays: group.rentals[0]?.totalDays,
    endDate: group.rentals[0]?.endDate,
  }))
}

const RentalsList = () => {
  const auth = useSelector(state => state.auth)
  const [rentals, setRentals] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('Completed')
  const [returnModalData, setReturnModalData] = useState({ show: false, rental: null })
  const [returnEndDate, setReturnEndDate] = useState('')
  const [calculatedAmount, setCalculatedAmount] = useState(0)
  const [feedbackModal, setFeedbackModal] = useState({
    isOpen: false,
    variant: 'success',
    title: '',
    message: '',
  })
  const [cancelTarget, setCancelTarget] = useState(null)
  const [completedSearch, setCompletedSearch] = useState('')
  const [cancelledSearch, setCancelledSearch] = useState('')

  useEffect(() => {
    fetchRentals()
  }, [filter])

  const rentalGroups = buildRentalGroups(rentals)
  const completedSearchTerm = completedSearch.trim().toLowerCase()
  const completedRentalGroups = completedSearchTerm
    ? rentalGroups.filter(rental => {
        const searchable = [
          rental.customerName,
          rental.customerPhone,
          rental.totalAmount,
          rental.totalDays,
          ...rental.rentals.map(item => item.equipment?.name),
        ].filter(Boolean).join(' ').toLowerCase()

        return searchable.includes(completedSearchTerm)
      })
    : rentalGroups
  const cancelledSearchTerm = cancelledSearch.trim().toLowerCase()
  const cancelledRentalGroups = cancelledSearchTerm
    ? rentalGroups.filter(rental => {
        const searchable = [
          rental.customerName,
          rental.customerPhone,
          rental.totalAmount,
          rental.totalDays,
          rental.startDate,
          rental.notes,
          ...rental.rentals.map(item => item.equipment?.name),
        ].filter(Boolean).join(' ').toLowerCase()

        return searchable.includes(cancelledSearchTerm)
      })
    : rentalGroups

  const fetchRentals = async () => {
    try {
      setLoading(true)
      const config = { headers: { Authorization: `Bearer ${auth.token}` } }
      const res = await axios.get(`${API_BASE}/bookings?status=${filter}`, config)
      setRentals(res.data.rentals || [])
    } catch (error) {
      console.error('Error fetching rentals:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReturn = async (rentalGroup) => {
    // Open return date modal
    setReturnModalData({
      show: true,
      rental: rentalGroup
    })
    setReturnEndDate('')
    setCalculatedAmount(0)
  }

  const calculateAmount = (endDate, rentalGroup) => {
    if (!endDate || !rentalGroup) {
      setCalculatedAmount(0)
      return
    }

    const start = new Date(rentalGroup.startDate)
    const end = new Date(endDate)
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1

    const amount = rentalGroup.rentals.reduce((total, rental) => {
      const rentPerDay = rental.equipment?.rentPerDay || rental.rentPerDay || 0
      return total + (days * rentPerDay * rental.quantity)
    }, 0)
    setCalculatedAmount(amount)
  }

  const handleReturnDateChange = (e) => {
    const date = e.target.value
    setReturnEndDate(date)
    calculateAmount(date, returnModalData.rental)
  }

  const handleConfirmReturn = async (endDate) => {
    if (!endDate) {
      setFeedbackModal({
        isOpen: true,
        variant: 'error',
        title: 'Return Date Required',
        message: 'Please select a return date before confirming the return.',
      })
      return
    }

    try {
      const config = { headers: { Authorization: `Bearer ${auth.token}` } }
      const payload = {
        endDate: new Date(endDate).toISOString()
      }

      await Promise.all(returnModalData.rental.rentals.map(rental =>
        axios.put(`${API_BASE}/bookings/${rental._id}/return`, payload, config)
      ))
      fetchRentals()
      setFeedbackModal({
        isOpen: true,
        variant: 'success',
        title: 'Equipment Returned',
        message: 'Equipment returned successfully.',
      })
      setReturnModalData({ show: false, rental: null })
      setReturnEndDate('')
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

  const handleCancel = async () => {
    if (!cancelTarget) return
    try {
      const config = { headers: { Authorization: `Bearer ${auth.token}` } }
      await Promise.all(cancelTarget.rentals.map(rental =>
        axios.put(`${API_BASE}/bookings/${rental._id}/cancel`, {}, config)
      ))
      fetchRentals()
      setFeedbackModal({
        isOpen: true,
        variant: 'success',
        title: 'Rental Cancelled',
        message: 'Rental cancelled successfully.',
      })
    } catch (error) {
      console.error('Error cancelling rental:', error)
      setFeedbackModal({
        isOpen: true,
        variant: 'error',
        title: 'Cancel Failed',
        message: error.response?.data?.error || 'Failed to cancel rental',
      })
    } finally {
      setCancelTarget(null)
    }
  }

  if (loading) return <div className="rentals-list"><p>Loading...</p></div>

  return (
    <div className="rentals-list">
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
        confirmLabel="Cancel Rental"
        onConfirm={handleCancel}
        onClose={() => setCancelTarget(null)}
      />
      <h1>Rentals</h1>

      <div className="filter-tabs">
        <button
          className={`tab ${filter === 'Completed' ? 'active' : ''}`}
          onClick={() => setFilter('Completed')}
        >
          Completed
        </button>
        <button
          className={`tab ${filter === 'Cancelled' ? 'active' : ''}`}
          onClick={() => setFilter('Cancelled')}
        >
          Cancelled
        </button>
      </div>

      {filter === 'Completed' && rentalGroups.length > 0 ? (
        <section className="completed-rentals-view">
          <div className="completed-ledger">
            <div className="completed-ledger-header">
              <div>
                <span className="rentals-eyebrow">Completed rentals</span>
                <h2>Return Ledger</h2>
              </div>
              <div className="ledger-actions">
                <label className="completed-search">
                  <span>Search</span>
                  <input
                    type="search"
                    value={completedSearch}
                    onChange={(e) => setCompletedSearch(e.target.value)}
                    placeholder="Customer, phone, equipment"
                  />
                </label>
                <span className="ledger-count">
                  {completedRentalGroups.length}
                  {completedRentalGroups.length === 1 ? ' record' : ' records'}
                </span>
              </div>
            </div>

            <div className="completed-records">
              {completedRentalGroups.length > 0 ? completedRentalGroups.map(rental => (
                <article className="completed-record" key={rental._id}>
                  <div className="record-customer">
                    <span className="record-avatar">
                      <span className="customer-glyph" aria-hidden="true" />
                    </span>
                    <div>
                      <span className="record-label">Customer Details</span>
                      <h3>{rental.customerName}</h3>
                      <p className="record-phone">{rental.customerPhone}</p>
                    </div>
                  </div>

                  <div className="record-equipment">
                    <div className="record-section-title">
                      <span>Equipment</span>
                      <strong>{rental.totalQuantity} unit{rental.totalQuantity === 1 ? '' : 's'}</strong>
                    </div>
                    <div className="record-equipment-list">
                      {rental.rentals.map(item => (
                        <span className="record-equipment-chip" key={item._id}>
                          {item.equipment?.name || 'Equipment'} <small>Qty {item.quantity}</small>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="record-period">
                    <div>
                      <span>Start</span>
                      <strong>{formatDate(rental.startDate)}</strong>
                    </div>
                    <span className="period-line" aria-hidden="true" />
                    <div>
                      <span>Return</span>
                      <strong>{formatDate(rental.endDate)}</strong>
                    </div>
                    <span className="record-days">{rental.totalDays ? `${rental.totalDays} days` : '-'}</span>
                  </div>

                  <div className="record-total">
                    <span>Amount</span>
                    <strong>{rental.totalAmount !== null ? formatCurrency(rental.totalAmount) : 'Pending'}</strong>
                    <span className={`status ${rental.status.toLowerCase()}`}>{rental.status}</span>
                  </div>
                </article>
              )) : (
                <p className="no-data">No completed rentals match your search</p>
              )}
            </div>
          </div>
        </section>
      ) : filter === 'Cancelled' && rentalGroups.length > 0 ? (
        <section className="cancelled-rentals-view">
          <div className="cancelled-ledger">
            <div className="cancelled-ledger-header">
              <div>
                <span className="rentals-eyebrow danger">Cancelled rentals</span>
                <h2>Cancellation Log</h2>
              </div>
              <div className="ledger-actions">
                <label className="completed-search cancelled-search">
                  <span>Search</span>
                  <input
                    type="search"
                    value={cancelledSearch}
                    onChange={(e) => setCancelledSearch(e.target.value)}
                    placeholder="Customer, phone, equipment"
                  />
                </label>
                <span className="ledger-count danger">
                  {cancelledRentalGroups.length}
                  {cancelledRentalGroups.length === 1 ? ' record' : ' records'}
                </span>
              </div>
            </div>

            <div className="cancelled-records">
              {cancelledRentalGroups.length > 0 ? cancelledRentalGroups.map(rental => (
                <article className="cancelled-record" key={rental._id}>
                  <div className="cancelled-customer">
                    <span className="cancelled-avatar">
                      <span className="cancelled-glyph" aria-hidden="true" />
                    </span>
                    <div>
                      <span className="record-label">Cancelled Customer</span>
                      <h3>{rental.customerName}</h3>
                      <p className="record-phone cancelled-phone">{rental.customerPhone}</p>
                    </div>
                  </div>

                  <div className="cancelled-equipment">
                    <div className="record-section-title cancelled-title">
                      <span>Equipment Removed</span>
                      <strong>{rental.totalQuantity} unit{rental.totalQuantity === 1 ? '' : 's'}</strong>
                    </div>
                    <div className="record-equipment-list">
                      {rental.rentals.map(item => (
                        <span className="cancelled-equipment-chip" key={item._id}>
                          {item.equipment?.name || 'Equipment'} <small>Qty {item.quantity}</small>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="cancelled-meta">
                    <div>
                      <span>Booked For</span>
                      <strong>{formatDate(rental.startDate)}</strong>
                    </div>
                    <div>
                      <span>Expected Return</span>
                      <strong>{formatDate(rental.endDate)}</strong>
                    </div>
                  </div>

                  <div className="cancelled-state">
                    <span className={`status ${rental.status.toLowerCase()}`}>{rental.status}</span>
                    <p>{rental.notes || 'Rental was cancelled before completion.'}</p>
                  </div>
                </article>
              )) : (
                <p className="no-data">No cancelled rentals match your search</p>
              )}
            </div>
          </div>
        </section>
      ) : (
        <p className="no-data">No {filter.toLowerCase()} rentals found</p>
      )}

      {/* Return Date Modal */}
      {returnModalData.show && returnModalData.rental && (
        <div className="modal-overlay" onClick={() => {
          setReturnModalData({ show: false, rental: null })
          setReturnEndDate('')
          setCalculatedAmount(0)
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Return Equipment</h2>
              <button
                className="modal-close"
                type="button"
                onClick={() => {
                  setReturnModalData({ show: false, rental: null })
                  setReturnEndDate('')
                  setCalculatedAmount(0)
                }}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-detail">
                <label>Customer:</label>
                <p>{returnModalData.rental.customerName}</p>
              </div>

              <div className="modal-detail">
                <label>Equipment:</label>
                <div className="equipment-list modal-equipment-list">
                  {returnModalData.rental.rentals.map(item => (
                    <div className="equipment-list-item" key={item._id}>
                      <span>{item.equipment?.name}</span>
                      <span>Qty {item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-detail">
                <label htmlFor="returnDate">Return Date *</label>
                <input
                  type="date"
                  id="returnDate"
                  value={returnEndDate}
                  onChange={handleReturnDateChange}
                  min={new Date(returnModalData.rental.startDate).toISOString().split('T')[0]}
                  required
                />
              </div>

              {calculatedAmount > 0 && (
                <div className="modal-detail">
                  <label>Rental Amount:</label>
                  <p className="amount-display">{formatCurrency(calculatedAmount)}</p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="btn-cancel"
                type="button"
                onClick={() => {
                  setReturnModalData({ show: false, rental: null })
                  setReturnEndDate('')
                  setCalculatedAmount(0)
                }}
              >
                Cancel
              </button>
              <button
                className="btn-confirm"
                type="button"
                onClick={() => handleConfirmReturn(returnEndDate)}
                disabled={!returnEndDate}
              >
                Confirm Return
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RentalsList
