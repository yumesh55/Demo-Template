import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { bookingService, equipmentService } from '../services/api'
import PopuModal from '../modals/popuModal'
import './AdminDashboard.css'

function AdminDashboard() {
  const navigate = useNavigate()
  const { isAuthenticated, user, token } = useSelector((state) => state.auth)
  const [bookings, setBookings] = useState([])
  const [equipment, setEquipment] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    totalRevenue: 0,
    totalRivenueThisMonth: 0,
  })
  const [loading, setLoading] = useState(true)
  const [equipmentByLocation, setEquipmentByLocation] = useState({})
  const [feedbackModal, setFeedbackModal] = useState({
    isOpen: false,
    variant: 'success',
    title: '',
    message: '',
  })

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/')
      return
    }
    fetchAdminData()
  }, [isAuthenticated])

  const fetchAdminData = async () => {
    try {
      const [bookingsRes, equipmentRes] = await Promise.all([
        bookingService.getBookings(token),
        equipmentService.getAllEquipment({ limit: 'all' }),
      ])

      setBookings(bookingsRes.data)
      setEquipment(equipmentRes.data.equipment || equipmentRes.data)

      // Group equipment by location
      const grouped = {}
      equipmentRes.data?.forEach((item) => {
        const location = item.location?.city || item.location?.address || 'Unknown Location'
        if (!grouped[location]) {
          grouped[location] = []
        }
        grouped[location].push(item)
      })
      setEquipmentByLocation(grouped)

      // Calculate stats
      const active = bookingsRes.data.filter((b) => b.status === 'ongoing')
      const completed = bookingsRes.data.filter((b) => b.status === 'completed')
      const pending = bookingsRes.data.filter((b) => b.status === 'pending')
      const revenue = completed.reduce((sum, b) => sum + b.totalPrice, 0)

      // Calculate revenue for current month
      const now = new Date()
      const currentMonth = now.getMonth()
      const currentYear = now.getFullYear()
      const monthRevenue = completed
        .filter((b) => {
          const bookingDate = new Date(b.createdAt || b.startDate)
          return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear
        })
        .reduce((sum, b) => sum + b.totalPrice, 0)

      setStats({
        totalBookings: bookingsRes.data.length,
        activeBookings: active.length,
        pendingBookings: pending.length,
        completedBookings: completed.length,
        totalRevenue: revenue,
        totalRivenueThisMonth: monthRevenue,
      })
    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveBooking = async (bookingId) => {
    try {
      await bookingService.updateBookingStatus(bookingId, 'approved', token)
      setFeedbackModal({
        isOpen: true,
        variant: 'success',
        title: 'Booking Approved',
        message: 'Booking approved successfully.',
      })
      fetchAdminData()
    } catch (error) {
      console.error('Error approving booking:', error)
      setFeedbackModal({
        isOpen: true,
        variant: 'error',
        title: 'Approval Failed',
        message: 'Failed to approve booking',
      })
    }
  }

  const calculateAvailableCount = (equip) => {
    if (!equip.availability) return 0
    return equip.availability.filter((a) => a.status === 'available').length
  }

  if (loading) return <div className="loading">Loading Dashboard...</div>

  return (
    <div className="admin-dashboard">
      <PopuModal
        isOpen={feedbackModal.isOpen}
        variant={feedbackModal.variant}
        title={feedbackModal.title}
        message={feedbackModal.message}
        onClose={() => setFeedbackModal(current => ({ ...current, isOpen: false }))}
      />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>📊 Equipment Dashboard</h1>
          <p>Manage your equipment inventory and track rental activity</p>
        </div>

        <div className="tabs">
          <button
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`tab-button ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => setActiveTab('inventory')}
          >
            Inventory by Location
          </button>
          <button
            className={`tab-button ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            Rental Analytics
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📈</div>
                <div className="stat-value">{stats.totalBookings}</div>
                <div className="stat-label">Total Bookings</div>
              </div>
              <div className="stat-card highlight">
                <div className="stat-icon">🔄</div>
                <div className="stat-value">{stats.activeBookings}</div>
                <div className="stat-label">Active Rentals</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⏳</div>
                <div className="stat-value">{stats.pendingBookings}</div>
                <div className="stat-label">Pending Approvals</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-value">{stats.completedBookings}</div>
                <div className="stat-label">Completed</div>
              </div>
              <div className="stat-card accent">
                <div className="stat-icon">💰</div>
                <div className="stat-value">${stats.totalRevenue.toFixed(0)}</div>
                <div className="stat-label">Total Revenue</div>
              </div>
              <div className="stat-card accent">
                <div className="stat-icon">📅</div>
                <div className="stat-value">${stats.totalRivenueThisMonth.toFixed(0)}</div>
                <div className="stat-label">This Month</div>
              </div>
            </div>
          </>
        )}

        {/* Inventory by Location Tab */}
        {activeTab === 'inventory' && (
          <div className="inventory-section">
            <h2>Available Equipment by Location</h2>
            {Object.keys(equipmentByLocation).length > 0 ? (
              Object.entries(equipmentByLocation).map(([location, items]) => (
                <div key={location} className="location-group">
                  <h3>📍 {location}</h3>
                  <div className="equipment-grid">
                    {items.map((item) => (
                      <div key={item._id} className="equipment-item">
                        <div className="equipment-header">
                          <h4>{item.title}</h4>
                          <span className={`status status-${item.status}`}>
                            {item.status || 'available'}
                          </span>
                        </div>
                        <div className="equipment-category">{item.category}</div>
                        <div className="equipment-details">
                          <p>
                            <strong>Price/Day:</strong> ${item.pricePerDay}
                          </p>
                          <p>
                            <strong>Price/Week:</strong> ${item.pricePerWeek || '-'}
                          </p>
                          <p>
                            <strong>Price/Month:</strong> ${item.pricePerMonth || '-'}
                          </p>
                        </div>
                        <div className="equipment-owner">
                          <strong>Owner:</strong> {item.owner?.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p>No equipment available</p>
            )}
          </div>
        )}

        {/* Rental Analytics Tab */}
        {activeTab === 'bookings' && (
          <div className="bookings-section">
            <h2>Detailed Rental Analytics</h2>
            {bookings.length > 0 ? (
              <>
                <div className="analytics-summary">
                  <div className="summary-card">
                    <h3>Revenue Breakdown</h3>
                    <div className="breakdown">
                      {(() => {
                        const byStatus = {}
                        bookings.forEach((b) => {
                          byStatus[b.status] = (byStatus[b.status] || 0) + b.totalPrice
                        })
                        return Object.entries(byStatus).map(([status, amount]) => (
                          <div key={status} className="breakdown-item">
                            <span>{status.toUpperCase()}</span>
                            <span className="amount">${amount.toFixed(2)}</span>
                          </div>
                        ))
                      })()}
                    </div>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="bookings-table">
                    <thead>
                      <tr>
                        <th>Equipment</th>
                        <th>Renter Name</th>
                        <th>Owner Name</th>
                        <th>Rental Period</th>
                        <th>Days</th>
                        <th>Price/Day</th>
                        <th>Total Amount</th>
                        <th>Deposit</th>
                        <th>Status</th>
                        <th>Payment</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking) => {
                        const startDate = new Date(booking.startDate).toLocaleDateString()
                        const endDate = new Date(booking.endDate).toLocaleDateString()
                        return (
                          <tr key={booking._id} className={`booking-row status-${booking.status}`}>
                            <td className="equipment-name">
                              <strong>{booking.equipment?.title}</strong>
                            </td>
                            <td>{booking.renter?.name}</td>
                            <td>{booking.owner?.name}</td>
                            <td className="date-range">
                              {startDate} → {endDate}
                            </td>
                            <td className="center">{booking.totalDays}</td>
                            <td className="price">${booking.pricePerDay}</td>
                            <td className="price highlight">
                              <strong>${booking.totalPrice}</strong>
                            </td>
                            <td className="price">${booking.depositAmount || '0'}</td>
                            <td>
                              <span className={`status status-${booking.status}`}>
                                {booking.status}
                              </span>
                            </td>
                            <td>
                              <span className={`payment status-${booking.paymentStatus}`}>
                                {booking.paymentStatus}
                              </span>
                            </td>
                            <td>
                              {booking.status === 'pending' && (
                                <button
                                  className="btn-approve"
                                  onClick={() => handleApproveBooking(booking._id)}
                                >
                                  ✓ Approve
                                </button>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <p>No bookings yet</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
