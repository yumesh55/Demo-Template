import React, { useEffect, useId, useState } from 'react'
import { useSelector } from 'react-redux'
import axios from 'axios'
import {
  ActiveIcon,
  MoneyIcon,
  EquipmentIcon,
  AvailableIcon,
  EyeIcon,
} from '../components/ActiveIcon'
import './Dashboard.css'

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '')

const PERIOD_CONFIG = {
  daily: {
    bucketCount: 7,
    getKey: (date) => date.toISOString().slice(0, 10),
    label: (date) =>
      date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
  },
  monthly: {
    bucketCount: 6,
    getKey: (date) =>
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
    label: (date) =>
      date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
  },
  yearly: {
    bucketCount: 5,
    getKey: (date) => String(date.getFullYear()),
    label: (date) => String(date.getFullYear()),
  },
}

const createTimelineData = (rentals, period) => {
  const config = PERIOD_CONFIG[period]
  const now = new Date()
  const buckets = []

  for (let index = config.bucketCount - 1; index >= 0; index -= 1) {
    const bucketDate = new Date(now)

    if (period === 'daily') {
      bucketDate.setDate(now.getDate() - index)
      bucketDate.setHours(0, 0, 0, 0)
    } else if (period === 'monthly') {
      bucketDate.setMonth(now.getMonth() - index, 1)
      bucketDate.setHours(0, 0, 0, 0)
    } else {
      bucketDate.setFullYear(now.getFullYear() - index, 0, 1)
      bucketDate.setHours(0, 0, 0, 0)
    }

    buckets.push({
      key: config.getKey(bucketDate),
      label: config.label(bucketDate),
      revenue: 0,
      rentals: 0,
    })
  }

  const bucketMap = new Map(buckets.map(bucket => [bucket.key, bucket]))

  rentals.forEach(rental => {
    const rentalDate = new Date(rental.createdAt || rental.startDate)
    const bucket = bucketMap.get(config.getKey(rentalDate))

    if (!bucket) return

    bucket.rentals += 1
    bucket.revenue += Number(rental.totalAmount) || 0
  })

  return buckets
}

const formatCompactNumber = (value) =>
  new Intl.NumberFormat('en-IN', {
    notation: 'compact',
    maximumFractionDigits: value >= 100000 ? 1 : 0,
  }).format(value)

const formatMetricValue = (metric, value) =>
  metric === 'revenue' ? `₹${formatCompactNumber(value)}` : value

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value || 0)

const getStatusClass = (status = '') => status.toLowerCase().replace(/\s+/g, '-')

const getAvailableQuantity = (item) => {
  const quantity = Math.max(0, Number(item.quantity) || 0)
  const available = Math.max(0, Number(item.availableQuantity) || 0)

  return Math.min(quantity, available)
}

const getInventoryHealth = (equipment) => {
  const normalizedEquipment = equipment.map(item => {
    const quantity = Math.max(0, Number(item.quantity) || 0)
    const available = getAvailableQuantity(item)
    const availabilityRate = quantity ? available / quantity : 0

    return {
      ...item,
      quantity,
      available,
      availabilityRate,
    }
  })

  const totalUnits = normalizedEquipment.reduce((sum, item) => sum + item.quantity, 0)
  const availableUnits = normalizedEquipment.reduce((sum, item) => sum + item.available, 0)
  const rentedUnits = Math.max(totalUnits - availableUnits, 0)
  const utilization = totalUnits ? Math.round((rentedUnits / totalUnits) * 100) : 0
  const outOfStock = normalizedEquipment.filter(item => item.available === 0)
  const lowStock = normalizedEquipment.filter(item => item.quantity > 0 && item.available > 0 && item.available / item.quantity <= 0.3)
  const fairCondition = normalizedEquipment.filter(item => String(item.condition || '').toLowerCase() === 'fair')
  const attentionItems = normalizedEquipment
    .map(item => {
      const status = item.available === 0
        ? 'Out'
        : item.availabilityRate <= 0.3
          ? 'Low'
          : String(item.condition || '').toLowerCase() === 'fair'
            ? 'Fair'
            : 'Healthy'

      return {
        ...item,
        status,
      }
    })
    .filter(item => item.status !== 'Healthy')
    .sort((a, b) => a.available - b.available || a.availabilityRate - b.availabilityRate)
    .slice(0, 5)

  return {
    totalUnits,
    availableUnits,
    rentedUnits,
    utilization,
    outOfStock,
    lowStock,
    fairCondition,
    attentionItems,
  }
}

const getHealthScore = (health) => {
  if (!health.totalUnits) return 0

  const availabilityScore = Math.round((health.availableUnits / health.totalUnits) * 100)
  const issuePenalty = Math.min(
    (health.outOfStock.length * 12) + (health.lowStock.length * 7) + (health.fairCondition.length * 4),
    45
  )

  return Math.max(Math.min(availabilityScore - issuePenalty, 100), 0)
}

const getCustomerInsights = (rentals) => {
  const now = new Date()
  const recentCutoff = new Date(now)
  recentCutoff.setDate(now.getDate() - 30)
  const previousCutoff = new Date(now)
  previousCutoff.setDate(now.getDate() - 60)
  const customers = new Map()
  const recentCustomerKeys = new Set()
  const previousCustomerKeys = new Set()

  rentals.forEach(rental => {
    const phone = String(rental.customerPhone || '').trim()
    const name = String(rental.customerName || 'Walk-in customer').trim()
    const key = phone || name.toLowerCase()
    const rentalDate = new Date(rental.createdAt || rental.startDate)
    const amount = Number(rental.totalAmount) || 0

    if (!customers.has(key)) {
      customers.set(key, {
        key,
        name,
        phone,
        bookings: 0,
        revenue: 0,
        active: 0,
        completed: 0,
        lastRentalDate: rentalDate,
      })
    }

    const customer = customers.get(key)
    customer.bookings += 1
    customer.revenue += amount
    customer.lastRentalDate = rentalDate > customer.lastRentalDate ? rentalDate : customer.lastRentalDate

    if (rental.status === 'Active') {
      customer.active += 1
    }

    if (rental.status === 'Completed') {
      customer.completed += 1
    }

    if (rentalDate >= recentCutoff) {
      recentCustomerKeys.add(key)
    } else if (rentalDate >= previousCutoff) {
      previousCustomerKeys.add(key)
    }
  })

  const customerList = Array.from(customers.values())
  const repeatCustomers = customerList.filter(customer => customer.bookings > 1)
  const topCustomers = customerList
    .sort((a, b) => b.revenue - a.revenue || b.bookings - a.bookings || b.lastRentalDate - a.lastRentalDate)
    .slice(0, 5)

  return {
    totalCustomers: customerList.length,
    repeatCustomers: repeatCustomers.length,
    repeatRate: customerList.length ? Math.round((repeatCustomers.length / customerList.length) * 100) : 0,
    newCustomers: Math.max(recentCustomerKeys.size - previousCustomerKeys.size, 0),
    activeCustomers: customerList.filter(customer => customer.active > 0).length,
    topCustomers,
  }
}

const DashboardChart = ({
  title,
  subtitle,
  metric,
  colorClass,
  period,
  onPeriodChange,
  data,
}) => {
  const chartId = useId().replace(/:/g, '')
  const maxValue = Math.max(...data.map(item => item[metric]), 0)
  const values = data.map(item => Number(item[metric]) || 0)
  const total = values.reduce((sum, value) => sum + value, 0)
  const average = values.length ? Math.round(total / values.length) : 0
  const peak = Math.max(...values, 0)
  const latest = values[values.length - 1] || 0
  const paddedMax = maxValue > 0 ? maxValue * 1.15 : 1
  const chartWidth = 640
  const chartHeight = 260
  const padding = { top: 22, right: 22, bottom: 40, left: 46 }
  const plotWidth = chartWidth - padding.left - padding.right
  const plotHeight = chartHeight - padding.top - padding.bottom

  const points = data.map((item, index) => {
    const x = padding.left + (data.length === 1 ? plotWidth / 2 : (index / (data.length - 1)) * plotWidth)
    const y = padding.top + plotHeight - ((Number(item[metric]) || 0) / paddedMax) * plotHeight

    return {
      ...item,
      value: Number(item[metric]) || 0,
      x,
      y,
    }
  })

  const linePath = points.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`

    const previous = points[index - 1]
    const midX = (previous.x + point.x) / 2
    return `${path} C ${midX} ${previous.y}, ${midX} ${point.y}, ${point.x} ${point.y}`
  }, '')

  const areaPath = points.length
    ? `${linePath} L ${points[points.length - 1].x} ${padding.top + plotHeight} L ${points[0].x} ${padding.top + plotHeight} Z`
    : ''
  const yTicks = [1, 0.75, 0.5, 0.25, 0]
  const trendTone = metric === 'revenue' ? 'green' : 'blue'

  return (
    <section className={`chart-card modern-chart ${trendTone}`}>
      <div className="chart-header">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>

        <div className="chart-filters">
          {Object.keys(PERIOD_CONFIG).map(option => (
            <button
              key={option}
              type="button"
              className={period === option ? 'active' : ''}
              onClick={() => onPeriodChange(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="chart-summary">
        <div>
          <span>Latest</span>
          <strong>{formatMetricValue(metric, latest)}</strong>
        </div>
        <div>
          <span>Average</span>
          <strong>{formatMetricValue(metric, average)}</strong>
        </div>
        <div>
          <span>Peak</span>
          <strong>{formatMetricValue(metric, peak)}</strong>
        </div>
      </div>

      <div className="trend-chart" role="img" aria-label={`${title} ${subtitle}`}>
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id={`${chartId}-${colorClass}-area`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" className="area-stop-strong" />
              <stop offset="100%" className="area-stop-soft" />
            </linearGradient>
            <linearGradient id={`${chartId}-${colorClass}-line`} x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" className="line-stop-start" />
              <stop offset="100%" className="line-stop-end" />
            </linearGradient>
          </defs>

          {yTicks.map(tick => {
            const y = padding.top + (1 - tick) * plotHeight
            const tickValue = Math.round(paddedMax * tick)

            return (
              <g key={tick} className="chart-axis">
                <line x1={padding.left} x2={chartWidth - padding.right} y1={y} y2={y} />
                <text x={padding.left - 12} y={y + 4}>
                  {tick === 0 ? '0' : formatMetricValue(metric, tickValue)}
                </text>
              </g>
            )
          })}

          {points.map(point => (
            <g key={`x-${point.key}`} className="chart-x-label">
              <text x={point.x} y={chartHeight - 12}>{point.label}</text>
            </g>
          ))}

          {areaPath && <path className="trend-area" d={areaPath} fill={`url(#${chartId}-${colorClass}-area)`} />}
          {linePath && <path className="trend-line" d={linePath} stroke={`url(#${chartId}-${colorClass}-line)`} />}

          {points.map(point => (
            <g key={point.key} className="trend-point">
              <circle cx={point.x} cy={point.y} r="5" />
              <title>{`${point.label}: ${formatMetricValue(metric, point.value)}`}</title>
            </g>
          ))}
        </svg>

        {maxValue === 0 && (
          <div className="chart-empty-state">
            No activity for this period yet
          </div>
        )}
      </div>
    </section>
  )
}

const Dashboard = () => {
  const auth = useSelector(state => state.auth)
  const [showRevenue, setShowRevenue] = useState(false)
  const isAdmin = auth.user?.role === 'Admin'
  const [rentals, setRentals] = useState([])
  const [equipment, setEquipment] = useState([])
  const [stats, setStats] = useState({
    activeRentals: 0,
    totalRevenue: 0,
    totalEquipment: 0,
    equipmentAvailable: 0,
  })
  const [recentRentals, setRecentRentals] = useState([])
  const [revenuePeriod, setRevenuePeriod] = useState('monthly')
  const [rentalsPeriod, setRentalsPeriod] = useState('monthly')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!auth.token) return

    const fetchDashboardData = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${auth.token}` },
        }

        const [rentalsRes, equipRes] = await Promise.all([
          axios.get(`${API_BASE}/bookings?limit=500`, config),
          axios.get(`${API_BASE}/equipment?limit=all`, config),
        ])

        const rentalList = rentalsRes.data.rentals || []
        const equipmentList = equipRes.data.equipment || []

        setRentals(rentalList)
        setEquipment(equipmentList)
        setRecentRentals(rentalList.slice(0, 5))

        let totalRevenue = 0
        let activeRentals = 0

        rentalList.forEach(rental => {
          totalRevenue += Number(rental.totalAmount) || 0
          if (rental.status === 'Active') {
            activeRentals += 1
          }
        })

        setStats({
          activeRentals,
          totalRevenue,
          totalEquipment: equipmentList.length,
          equipmentAvailable: equipmentList.filter(
            equipment => getAvailableQuantity(equipment) > 0
          ).length,
        })
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [auth.token])

  const revenueData = createTimelineData(rentals, revenuePeriod)
  const rentalCountData = createTimelineData(rentals, rentalsPeriod)
  const completedRentals = rentals.filter(rental => rental.status === 'Completed').length
  const pipelineValue = rentals
    .filter(rental => rental.status === 'Active')
    .reduce((sum, rental) => sum + (Number(rental.totalAmount) || 0), 0)
  const inventoryHealth = getInventoryHealth(equipment)
  const healthScore = getHealthScore(inventoryHealth)
  const customerInsights = getCustomerInsights(rentals)

  if (loading) {
    return (
      <div className="dashboard">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <header className="dashboard-hero">
        <div>
          
          <h1>Welcome back, {auth.user?.name}</h1>
          <p>Track rental revenue, active rentals, equipment readiness, and recent customer activity from one place.</p>
        </div>

        <div className="hero-actions" aria-label="Dashboard quick stats">
          <div>
            <span>Active pipeline</span>
            <strong>{formatCurrency(pipelineValue)}</strong>
          </div>
          <div>
            <span>Closed rentals</span>
            <strong>{completedRentals}</strong>
          </div>
        </div>
      </header>

      <div className="stats-grid">
        <div className="stat-card accent-teal">
          <div className="stat-label">
            <ActiveIcon />
            Active Rentals
          </div>
          <div className="stat-value">{stats.activeRentals}</div>
          <p>Rentals currently in motion</p>
        </div>

        {isAdmin && (
          <div className="stat-card accent-emerald">
            <div className="stat-label revenue-label">
              <div className="revenue-title">
                <MoneyIcon />
                Rental Revenue
              </div>

              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowRevenue(!showRevenue)}
                aria-label={showRevenue ? 'Hide revenue' : 'Show revenue'}
              >
                <EyeIcon closed={showRevenue} />
              </button>
            </div>

            <div className="stat-value">
              {showRevenue
                ? formatCurrency(stats.totalRevenue)
                : "₹•••"}
            </div>
            <p>Total booked rental value</p>
          </div>
        )}

        <div className="stat-card accent-indigo">
          <div className="stat-label">
            <EquipmentIcon />
            Product Inventory
          </div>
          <div className="stat-value">{stats.totalEquipment}</div>
          <p>Assets listed for rental</p>
        </div>

        <div className="stat-card accent-amber">
          <div className="stat-label">
            <AvailableIcon />
            Ready for Rental
          </div>
          <div className="stat-value">{stats.equipmentAvailable}</div>
          <p>Equipment available now</p>
        </div>
      </div>

      {isAdmin && (
        <div className="charts-grid">
          <DashboardChart
            title="Revenue Trend"
            subtitle="Rental sales booked over time"
            metric="revenue"
            colorClass="revenue-bar"
            period={revenuePeriod}
            onPeriodChange={setRevenuePeriod}
            data={revenueData}
          />

          <DashboardChart
            title="Rental Volume"
            subtitle="Bookings created over time"
            metric="rentals"
            colorClass="rentals-bar"
            period={rentalsPeriod}
            onPeriodChange={setRentalsPeriod}
            data={rentalCountData}
          />
        </div>
      )}

      <section className="inventory-health">
        <div className="inventory-health-main">
          <div className="section-header">
            <div>
              <span className="eyebrow">Inventory health</span>
              <h2>
                <AvailableIcon />
                Stock Readiness
              </h2>
            </div>
            <span className={`health-score ${healthScore >= 70 ? 'good' : healthScore >= 40 ? 'watch' : 'risk'}`}>
              {healthScore}% healthy
            </span>
          </div>

          <div className="health-meter" aria-label={`Inventory health score ${healthScore} percent`}>
            <div className="health-meter-fill" style={{ width: `${healthScore}%` }} />
          </div>

          <div className="health-metrics">
            <div>
              <span>Available units</span>
              <strong>{inventoryHealth.availableUnits}/{inventoryHealth.totalUnits}</strong>
            </div>
            <div>
              <span>Utilization</span>
              <strong>{inventoryHealth.utilization}%</strong>
            </div>
            <div>
              <span>Low stock</span>
              <strong>{inventoryHealth.lowStock.length}</strong>
            </div>
            <div>
              <span>Out of stock</span>
              <strong>{inventoryHealth.outOfStock.length}</strong>
            </div>
          </div>
        </div>

        <div className="inventory-watchlist">
          <div className="watchlist-header">
            <h3>Needs attention</h3>
            <span>{inventoryHealth.attentionItems.length} items</span>
          </div>

          {inventoryHealth.attentionItems.length > 0 ? (
            <div className="watchlist-items">
              {inventoryHealth.attentionItems.map(item => (
                <div key={item._id} className="watchlist-item">
                  <div>
                    <strong>{item.name}</strong>
                    <span>{item.location || 'Unassigned'} · {item.available}/{item.quantity} available</span>
                  </div>
                  <span className={`inventory-pill ${item.status.toLowerCase()}`}>{item.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="watchlist-empty">Inventory looks ready across all listed equipment.</p>
          )}
        </div>
      </section>

      <section className="customer-insights">
        <div className="customer-insights-main">
          <div className="section-header">
            <div>
              <span className="eyebrow">Customer insights</span>
              <h2>
                <ActiveIcon />
                Customer Momentum
              </h2>
            </div>
            <span className="section-count">{customerInsights.activeCustomers} active</span>
          </div>

          <div className="customer-metrics">
            <div>
              <span>Total customers</span>
              <strong>{customerInsights.totalCustomers}</strong>
            </div>
            <div>
              <span>Repeat customers</span>
              <strong>{customerInsights.repeatCustomers}</strong>
            </div>
            <div>
              <span>Repeat rate</span>
              <strong>{customerInsights.repeatRate}%</strong>
            </div>
            <div>
              <span>30-day growth</span>
              <strong>+{customerInsights.newCustomers}</strong>
            </div>
          </div>
        </div>

        <div className="top-customers">
          <div className="watchlist-header">
            <h3>Top customers</h3>
            <span>{customerInsights.topCustomers.length} ranked</span>
          </div>

          {customerInsights.topCustomers.length > 0 ? (
            <div className="customer-rankings">
              {customerInsights.topCustomers.map((customer, index) => (
                <div key={customer.key} className="customer-row">
                  <span className="customer-rank">{index + 1}</span>
                  <div>
                    <strong>{customer.name}</strong>
                    <span>{customer.bookings} bookings · {customer.active} active</span>
                  </div>
                  <strong className="customer-value">{formatCurrency(customer.revenue)}</strong>
                </div>
              ))}
            </div>
          ) : (
            <p className="watchlist-empty">Customer insights will appear after rentals are created.</p>
          )}
        </div>
      </section>

      <div className="recent-section">
        <div className="section-header">
          <div>
            <span className="eyebrow">Pipeline activity</span>
            <h2>
              <ActiveIcon />
              Recent Rentals
            </h2>
          </div>
          <span className="section-count">{recentRentals.length} latest</span>
        </div>
        {recentRentals.length > 0 ? (
          <table className="rentals-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Equipment</th>
                <th>Amount</th>
                <th>Days</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentRentals.map((rental) => (
                <tr key={rental._id}>
                  <td>
                    <strong>{rental.customerName}</strong>
                  </td>
                  <td>{rental.equipment?.name}</td>
                  <td>{formatCurrency(rental.totalAmount)}</td>
                  <td>{rental.totalDays}</td>
                  <td>
                    <span className={`status-pill ${getStatusClass(rental.status)}`}>
                      {rental.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No rentals yet</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard
