import React, { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import axios from 'axios'
import PopuModal from '../modals/popuModal'
import './Equipment.css'

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '')

const DEFAULT_SHOPS = []

const formatShopLabel = (shop) => {
  if (!shop) return 'Unassigned'

  return shop
    .replace(/([a-zA-Z])(\d+)/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim()
}

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString('en-IN')}`

const getAvailabilityRate = (item) => {
  const quantity = Number(item.quantity) || 0
  const available = Math.min(Number(item.availableQuantity) || 0, quantity)

  return quantity ? Math.min(Math.max((available / quantity) * 100, 0), 100) : 0
}

const getAvailableQuantity = (item) => {
  const quantity = Math.max(Number(item.quantity) || 0, 0)
  return Math.min(Math.max(Number(item.availableQuantity) || 0, 0), quantity)
}

const getPerformanceLabel = (item) => {
  const rate = getAvailabilityRate(item)
  const condition = String(item.condition || 'Good').toLowerCase()

  if (condition === 'excellent' && rate >= 40) return 'Excellent'
  if (condition === 'fair' || rate <= 20) return 'Watch'
  return 'Good'
}

const createEmptyFormData = (location = '') => ({
  name: '',
  rentPerDay: '',
  quantity: '',
  location,
  description: '',
  condition: 'Good',
})

const PerformanceGauge = ({ value }) => {
  const safeValue = Math.min(Math.max(Number(value) || 0, 0), 100)
  const radius = 34
  const circumference = Math.PI * radius
  const dashOffset = circumference - (safeValue / 100) * circumference

  return (
    <svg className="performance-gauge" viewBox="0 0 84 46" aria-hidden="true">
      <path
        className="performance-gauge-track"
        d="M 8 38 A 34 34 0 0 1 76 38"
        pathLength={circumference}
      />
      <path
        className="performance-gauge-fill"
        d="M 8 38 A 34 34 0 0 1 76 38"
        pathLength={circumference}
        style={{
          strokeDasharray: circumference,
          strokeDashoffset: dashOffset,
        }}
      />
    </svg>
  )
}

const Equipment = () => {
  const auth = useSelector((state) => state.auth)
  const [equipment, setEquipment] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingEquipment, setEditingEquipment] = useState(null)
  const [activeShop, setActiveShop] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortMode, setSortMode] = useState('name')
  const [formData, setFormData] = useState(createEmptyFormData())
  const [feedbackModal, setFeedbackModal] = useState({
    isOpen: false,
    variant: 'success',
    title: '',
    message: '',
  })
  const [deleteTargetId, setDeleteTargetId] = useState(null)

  useEffect(() => {
    fetchEquipment()
  }, [])

  useEffect(() => {
    if (activeShop !== 'all' && !equipment.some((item) => item.location === activeShop)) {
      setActiveShop('all')
    }
  }, [activeShop, equipment])

  const shopOptions = useMemo(() => {
    const shops = new Set(DEFAULT_SHOPS)

    equipment.forEach((item) => {
      if (item.location) {
        shops.add(item.location)
      }
    })

    if (formData.location.trim()) {
      shops.add(formData.location.trim())
    }

    return Array.from(shops).sort((a, b) => a.localeCompare(b))
  }, [equipment, formData.location])

  const equipmentByShop = useMemo(() => {
    return equipment.reduce((groups, item) => {
      const shop = item.location || 'Unassigned'

      if (!groups[shop]) {
        groups[shop] = []
      }

      groups[shop].push(item)
      return groups
    }, {})
  }, [equipment])

  const visibleEquipment = useMemo(() => {
    const shopFiltered = activeShop === 'all' ? equipment : equipmentByShop[activeShop] || []
    const search = searchTerm.trim().toLowerCase()
    const searched = search
      ? shopFiltered.filter(item =>
        [item.name, item.location, item.condition, item.description]
          .filter(Boolean)
          .some(value => String(value).toLowerCase().includes(search))
      )
      : shopFiltered

    return [...searched].sort((a, b) => {
      if (sortMode === 'stock-low') {
        return (Number(a.availableQuantity) || 0) - (Number(b.availableQuantity) || 0)
      }

      if (sortMode === 'price-high') {
        return (Number(b.rentPerDay) || 0) - (Number(a.rentPerDay) || 0)
      }

      if (sortMode === 'price-low') {
        return (Number(a.rentPerDay) || 0) - (Number(b.rentPerDay) || 0)
      }

      return String(a.name || '').localeCompare(String(b.name || ''))
    })
  }, [activeShop, equipment, equipmentByShop, searchTerm, sortMode])

  const inventoryStats = useMemo(() => {
    const totalQuantity = equipment.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)
    const availableQuantity = equipment.reduce((sum, item) => sum + getAvailableQuantity(item), 0)
    const rentedQuantity = Math.max(totalQuantity - availableQuantity, 0)
    const lowStockCount = equipment.filter((item) => {
      const quantity = Number(item.quantity) || 0
      const available = getAvailableQuantity(item)
      return quantity > 0 && available / quantity <= 0.3
    }).length
    const averageRent = equipment.length
      ? equipment.reduce((sum, item) => sum + (Number(item.rentPerDay) || 0), 0) / equipment.length
      : 0

    return {
      totalQuantity,
      availableQuantity,
      rentedQuantity,
      lowStockCount,
      shopCount: Object.keys(equipmentByShop).length,
      averageRent,
    }
  }, [equipment, equipmentByShop])

  const fetchEquipment = async () => {
    try {
      setLoading(true)
      const config = { headers: { Authorization: `Bearer ${auth.token}` } }
      const res = await axios.get(`${API_BASE}/equipment?limit=all`, config)
      setEquipment(res.data.equipment || [])
    } catch (error) {
      console.error('Error fetching equipment:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const resetForm = (location = '') => {
    setFormData(createEmptyFormData(location))
    setEditingEquipment(null)
  }

  const handleAddClick = () => {
    if (showForm && !editingEquipment) {
      setShowForm(false)
      resetForm(activeShop === 'all' ? '' : activeShop)
      return
    }

    setShowForm(true)
    resetForm(activeShop === 'all' ? '' : activeShop)
  }

  const handleCancelForm = () => {
    setShowForm(false)
    resetForm(activeShop === 'all' ? '' : activeShop)
  }

  const handleEditClick = (item) => {
    setEditingEquipment(item)
    setFormData({
      name: item.name || '',
      rentPerDay: item.rentPerDay ?? '',
      quantity: item.quantity ?? '',
      location: item.location || '',
      description: item.description || '',
      condition: item.condition || 'Good',
    })
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const location = formData.location.trim()

    if (!location) {
      setFeedbackModal({
        isOpen: true,
        variant: 'error',
        title: 'Shop Required',
        message: 'Please enter a shop name before adding equipment.',
      })
      return
    }

    try {
      const isEditing = Boolean(editingEquipment)
      const config = { headers: { Authorization: `Bearer ${auth.token}` } }
      const quantity = parseInt(formData.quantity, 10)
      const payload = {
        ...formData,
        location,
        rentPerDay: parseFloat(formData.rentPerDay),
        quantity,
      }

      if (isEditing) {
        await axios.put(`${API_BASE}/equipment/${editingEquipment._id}`, payload, config)
      } else {
        await axios.post(`${API_BASE}/equipment`, payload, config)
      }

      await fetchEquipment()
      setActiveShop(location)
      setShowForm(false)
      resetForm(location)
      setFeedbackModal({
        isOpen: true,
        variant: 'success',
        title: isEditing ? 'Equipment Updated' : 'Equipment Added',
        message: `${payload.name} was ${isEditing ? 'updated' : 'added'} successfully.`,
      })
    } catch (error) {
      console.error('Error saving equipment:', error)
      setFeedbackModal({
        isOpen: true,
        variant: 'error',
        title: editingEquipment ? 'Unable to Update Equipment' : 'Unable to Add Equipment',
        message: error.response?.data?.error || `Failed to ${editingEquipment ? 'update' : 'add'} equipment`,
      })
    }
  }

  const handleDelete = async (id) => {
    try {
      const config = { headers: { Authorization: `Bearer ${auth.token}` } }
      await axios.delete(`${API_BASE}/equipment/${id}`, config)
      await fetchEquipment()
      setDeleteTargetId(null)
      setFeedbackModal({
        isOpen: true,
        variant: 'success',
        title: 'Equipment Deleted',
        message: 'The equipment item was removed successfully.',
      })
    } catch (error) {
      console.error('Error deleting equipment:', error)
      setDeleteTargetId(null)
      setFeedbackModal({
        isOpen: true,
        variant: 'error',
        title: 'Unable to Delete Equipment',
        message: error.response?.data?.error || 'Failed to delete equipment',
      })
    }
  }

  if (loading) return <div className="equipment"><p>Loading...</p></div>

  return (
    <div className="equipment">
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
        title="Delete Equipment?"
        message="This equipment item will be removed from the inventory list."
        confirmLabel="Delete"
        onConfirm={() => handleDelete(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
      />
      <div className="equipment-shell-top">
        <div>
          <span className="equipment-eyebrow">Inventory workspace</span>
          <h1>All Equipment List</h1>
          <p className="equipment-subtitle">
            Monitor stock levels, rental readiness, shop coverage, and pricing for every item.
          </p>
        </div>
        {auth.user?.role === 'Admin' && (
          <button
            className="btn-add"
            onClick={handleAddClick}
          >
            {showForm && !editingEquipment ? 'Cancel' : '+ Add Equipment'}
          </button>
        )}
      </div>

      {showForm && auth.user?.role === 'Admin' && (
        <form onSubmit={handleSubmit} className="equipment-form">
          <div className="equipment-form-header">
            <span className="equipment-eyebrow">{editingEquipment ? 'Edit asset' : 'New asset'}</span>
            <h2>{editingEquipment ? 'Edit Equipment' : 'Add Equipment'}</h2>
            <p>
              {editingEquipment
                ? 'Update pricing, quantity, shop placement, condition, and notes for this inventory item.'
                : 'Capture the essentials for pricing, quantity, shop placement, and rental readiness.'}
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="rentPerDay">Rent Per Day (₹) *</label>
              <input
                type="number"
                id="rentPerDay"
                name="rentPerDay"
                step="0.01"
                value={formData.rentPerDay}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="quantity">Quantity *</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                min="1"
                value={formData.quantity}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="location">Shop *</label>
              <input
                id="location"
                name="location"
                list="shop-options"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Enter shop name, e.g. Shop3"
                required
              />
              <datalist id="shop-options">
                {shopOptions.map((shop) => (
                  <option key={shop} value={shop}>
                    {formatShopLabel(shop)}
                  </option>
                ))}
              </datalist>
            </div>

            <div className="form-group">
              <label htmlFor="condition">Condition</label>
              <select
                id="condition"
                name="condition"
                value={formData.condition}
                onChange={handleInputChange}
              >
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
            />
          </div>

          <div className="equipment-form-actions">
            <button type="submit" className="btn-primary">
              {editingEquipment ? 'Save Changes' : 'Add Equipment'}
            </button>
            <button type="button" className="btn-secondary" onClick={handleCancelForm}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="inventory-dashboard">
        <aside className="inventory-sidebar">
          <div className="sidebar-brand">
            <span className="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24" role="img">
                <path d="M3.75 7.2 12 2.75l8.25 4.45v9.55L12 21.25l-8.25-4.5V7.2Z" />
                <path d="m3.95 7.45 8.05 4.4 8.05-4.4" />
                <path d="M12 11.85v9.1" />
                <path d="m8.1 5.1 8.15 4.45" />
              </svg>
            </span>
            <div>
              <strong>Inventory</strong>
              <span>{inventoryStats.shopCount || 0} shops active</span>
            </div>
          </div>

          <div className="sidebar-section">
            <span className="sidebar-label">Product</span>
            <button
              type="button"
              className={`shop-filter-button ${activeShop === 'all' ? 'active' : ''}`}
              onClick={() => setActiveShop('all')}
            >
              All Equipment
              <span>{equipment.length}</span>
            </button>
          </div>

          <div className="sidebar-section">
            <span className="sidebar-label">My shops</span>
            {Object.entries(equipmentByShop).map(([shop, items]) => (
              <button
                key={shop}
                type="button"
                className={`shop-filter-button ${activeShop === shop ? 'active' : ''}`}
                onClick={() => setActiveShop(shop)}
              >
                {formatShopLabel(shop)}
                <span>{items.length}</span>
              </button>
            ))}
          </div>
        </aside>

        <section className="inventory-main">
          <div className="inventory-toolbar">
            <div>
              <h2>Equipment Statistic</h2>
              <p>
                {activeShop === 'all'
                  ? `${equipment.length} items across ${Object.keys(equipmentByShop).length || 0} shops`
                  : `${visibleEquipment.length} items in ${formatShopLabel(activeShop)}`}
              </p>
            </div>

            <div className="inventory-controls">
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search equipment"
              />
              <select value={sortMode} onChange={(event) => setSortMode(event.target.value)}>
                <option value="name">Sort by name</option>
                <option value="stock-low">Lowest stock</option>
                <option value="price-high">Highest price</option>
                <option value="price-low">Lowest price</option>
              </select>
            </div>
          </div>

          <div className="equipment-summary-grid">
            <div className="equipment-summary-card">
              <span>Active Product</span>
              <strong>{equipment.length}</strong>
              <p>{inventoryStats.totalQuantity} total units</p>
            </div>
            <div className="equipment-summary-card">
              <span>Available Stock</span>
              <strong>{inventoryStats.availableQuantity}</strong>
              <p>{inventoryStats.rentedQuantity} currently rented</p>
            </div>
            <div className="equipment-summary-card">
              <span>Average Rate</span>
              <strong>{formatCurrency(Math.round(inventoryStats.averageRent))}</strong>
              <p>Daily rental average</p>
            </div>
            <div className="equipment-summary-card">
              <span>Stock Watch</span>
              <strong>{inventoryStats.lowStockCount}</strong>
              <p>Low or empty items</p>
            </div>
          </div>

          <div className="product-list-card">
            <div className="product-list-header">
              <span>Product</span>
              <span>Performance</span>
              <span>Stock</span>
              <span>Product Price</span>
              {auth.user?.role === 'Admin' && <span>Action</span>}
            </div>

            {visibleEquipment.length > 0 ? (
              <div className="product-list">
                {visibleEquipment.map((eq) => {
                  const availabilityRate = getAvailabilityRate(eq)
                  const performanceLabel = getPerformanceLabel(eq)

                  return (
                    <article key={eq._id} className="product-row">
                      <div className="product-info">
                        <div className="product-thumb" aria-hidden="true">
                          {String(eq.name || 'E').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h3>{eq.name}</h3>
                          <p>{formatShopLabel(eq.location)} · {eq.condition || 'Good'}</p>
                        </div>
                      </div>

                      <div className="performance-cell">
                        <span>Performance <strong>{performanceLabel}</strong></span>
                        <PerformanceGauge value={availabilityRate} />
                      </div>

                      <div className="stock-cell">
                        <strong>{getAvailableQuantity(eq)}</strong>
                        <span>of {eq.quantity || 0} units</span>
                        <div className="stock-track">
                          <div style={{ width: `${availabilityRate}%` }} />
                        </div>
                      </div>

                      <div className="price-cell">
                        <strong>{formatCurrency(eq.rentPerDay)}</strong>
                        <span>per day</span>
                      </div>

                      {auth.user?.role === 'Admin' && (
                        <div className="product-actions">
                          <button
                            className="btn-edit"
                            onClick={() => handleEditClick(eq)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn-delete"
                            onClick={() => setDeleteTargetId(eq._id)}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </article>
                  )
                })}
              </div>
            ) : (
              <div className="empty-shop-state">
                <h3>No equipment found</h3>
                <p>
                  {activeShop === 'all'
                    ? 'Add your first equipment item to start building inventory.'
                    : `Add equipment to ${formatShopLabel(activeShop)} or adjust your search.`}
                </p>
                {auth.user?.role === 'Admin' && (
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => setShowForm(true)}
                  >
                    Add Equipment
                  </button>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

export default Equipment
