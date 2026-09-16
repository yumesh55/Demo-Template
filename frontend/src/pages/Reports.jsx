import React, { useState, useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'
import axios from 'axios'
import './Reports.css'

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '')

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value || 0)

const Reports = () => {
  const auth = useSelector(state => state.auth)
  const [stats, setStats] = useState({
    totalRentals: 0,
    completedRentals: 0,
    totalRevenue: 0,
    averageRental: 0,
  })
  const [rentals, setRentals] = useState([])
  const [loading, setLoading] = useState(true)

  const reportInsights = useMemo(() => {
    const activeRentals = rentals.filter(rental => rental.status === 'Active').length
    const completionRate = stats.totalRentals
      ? Math.round((stats.completedRentals / stats.totalRentals) * 100)
      : 0
    const latestRentalDate = rentals.length
      ? new Date(
          Math.max(...rentals.map(rental => new Date(rental.createdAt || rental.startDate).getTime()))
        )
      : null

    return {
      activeRentals,
      completionRate,
      latestRentalDate,
    }
  }, [rentals, stats.completedRentals, stats.totalRentals])

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${auth.token}` } }
      
      const [activeRes, completedRes] = await Promise.all([
        axios.get(`${API_BASE}/bookings?status=Active&limit=100`, config),
        axios.get(`${API_BASE}/bookings?status=Completed&limit=100`, config),
      ])

      const allRentals = [...(activeRes.data.rentals || []), ...(completedRes.data.rentals || [])]
      
      let totalRevenue = 0
      allRentals.forEach(r => totalRevenue += Number(r.totalAmount) || 0)

      setStats({
        totalRentals: allRentals.length,
        completedRentals: completedRes.data.rentals?.length || 0,
        totalRevenue,
        averageRental: allRentals.length > 0 ? Math.round(totalRevenue / allRentals.length) : 0,
      })

      setRentals(allRentals)
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="reports"><p>Loading...</p></div>

  return (
    <div className="reports">
      <header className="reports-hero">
        <div>
          <span className="reports-eyebrow">Revenue intelligence</span>
          <h1>Business Reports</h1>
          <p>Review rental performance, closed work, average order value, and recent customer activity.</p>
        </div>

        <div className="reports-hero-panel">
          <span>Completion rate</span>
          <strong>{reportInsights.completionRate}%</strong>
          <p>
            {reportInsights.latestRentalDate
              ? `Latest rental ${reportInsights.latestRentalDate.toLocaleDateString('en-IN')}`
              : 'No rentals recorded yet'}
          </p>
        </div>
      </header>

      <div className="report-cards">
        <div className="report-card accent-blue">
          <h3>Total Rentals</h3>
          <div className="card-value">{stats.totalRentals}</div>
          <p>Active and completed rentals</p>
        </div>

        <div className="report-card accent-green">
          <h3>Completed Rentals</h3>
          <div className="card-value">{stats.completedRentals}</div>
          <p>Closed customer orders</p>
        </div>

        <div className="report-card accent-purple">
          <h3>Active Rentals</h3>
          <div className="card-value">{reportInsights.activeRentals}</div>
          <p>Currently in the pipeline</p>
        </div>

        <div className="report-card accent-amber">
          <h3>Total Revenue</h3>
          <div className="card-value">{formatCurrency(stats.totalRevenue)}</div>
          <p>Booked rental value</p>
        </div>

        <div className="report-card accent-slate">
          <h3>Average Rental Value</h3>
          <div className="card-value">{formatCurrency(stats.averageRental)}</div>
          <p>Revenue per rental</p>
        </div>
      </div>

      <div className="rental-history">
        <div className="rental-history-header">
          <div>
            <span className="reports-eyebrow">Activity ledger</span>
            <h2>Rental History</h2>
          </div>
          <span className="history-count">{Math.min(rentals.length, 20)} shown</span>
        </div>
        <table className="history-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Equipment</th>
              <th>Days</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {rentals.slice(0, 20).map(rental => (
              <tr key={rental._id}>
                <td>
                  <strong>{rental.customerName}</strong>
                </td>
                <td>{rental.equipment?.name}</td>
                <td>{rental.totalDays}</td>
                <td>{formatCurrency(rental.totalAmount)}</td>
                <td>
                  <span className={`status ${rental.status.toLowerCase()}`}>{rental.status}</span>
                </td>
                <td>{new Date(rental.createdAt || rental.startDate).toLocaleDateString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Reports
