import React, { useMemo, useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { userService } from '../services/api'
import PopuModal from '../modals/popuModal'
import './CreateRental.css'

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '')

const emptyRentalItem = {
  equipmentId: '',
  quantity: 1,
}

const getAvailableQuantity = (item) => {
  const quantity = Math.max(Number(item.quantity) || 0, 0)
  return Math.min(Math.max(Number(item.availableQuantity) || 0, 0), quantity)
}

const CreateRental = () => {
  const auth = useSelector(state => state.auth)
  const [equipment, setEquipment] = useState([])
  const [rentalItems, setRentalItems] = useState([{ ...emptyRentalItem }])
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    startDate: '',
    notes: '',
  })
  const [calculatedAmount, setCalculatedAmount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [searchingCustomer, setSearchingCustomer] = useState(false)
  const [equipmentPickerIndex, setEquipmentPickerIndex] = useState(null)
  const [equipmentSearchTerm, setEquipmentSearchTerm] = useState('')
  const [billData, setBillData] = useState(null)
  const [pendingBillData, setPendingBillData] = useState(null)
  const [feedbackModal, setFeedbackModal] = useState({
    isOpen: false,
    variant: 'success',
    title: '',
    message: '',
  })

  useEffect(() => {
    fetchEquipment()
  }, [])

  useEffect(() => {
    calculateAmount()
  }, [rentalItems, equipment])

  const selectedEquipmentIds = useMemo(
    () => rentalItems.map(item => item.equipmentId).filter(Boolean),
    [rentalItems]
  )

  const filteredEquipment = useMemo(() => {
    const search = equipmentSearchTerm.trim().toLowerCase()

    return equipment.filter(item => {
      if (!search) return true

      return [item.name, item.location, item.condition, item.description]
        .filter(Boolean)
        .some(value => String(value).toLowerCase().includes(search))
    })
  }, [equipment, equipmentSearchTerm])

  const fetchEquipment = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${auth.token}` } }
      const res = await axios.get(`${API_BASE}/equipment?limit=all`, config)
      setEquipment(res.data.equipment || [])
    } catch (error) {
      console.error('Error fetching equipment:', error)
    }
  }

  const calculateAmount = () => {
    const amount = rentalItems.reduce((total, item) => {
      const selectedEquip = equipment.find(e => e._id === item.equipmentId)
      if (!selectedEquip) return total

      return total + (selectedEquip.rentPerDay * Number(item.quantity || 0))
    }, 0)

    setCalculatedAmount(amount)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleRentalItemChange = (index, field, value) => {
    setRentalItems(items =>
      items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    )
  }

  const getSelectedEquipment = (equipmentId) =>
    equipment.find(item => item._id === equipmentId)

  const openEquipmentPicker = (index) => {
    setEquipmentPickerIndex(index)
    setEquipmentSearchTerm('')
  }

  const closeEquipmentPicker = () => {
    setEquipmentPickerIndex(null)
    setEquipmentSearchTerm('')
  }

  const handleSelectEquipment = (equipmentId) => {
    if (equipmentPickerIndex === null) return

    handleRentalItemChange(equipmentPickerIndex, 'equipmentId', equipmentId)
    closeEquipmentPicker()
  }

  const handleAddRentalItem = () => {
    setRentalItems(items => [...items, { ...emptyRentalItem }])
  }

  const handleRemoveRentalItem = (index) => {
    setRentalItems(items => items.filter((_, itemIndex) => itemIndex !== index))
  }

  const handlePhoneBlur = async () => {
    const { customerPhone } = formData

    // Validate phone number length
    if (!customerPhone || customerPhone.length < 10) {
      return
    }

    setSearchingCustomer(true)

    try {
      const response = await userService.searchByPhone(customerPhone)
      if (response.data.success && response.data.user) {
        // Auto-fill customer name if found
        setFormData({
          ...formData,
          customerName: response.data.user.name,
        })
      }
    } catch (error) {
      // Customer not found or error - keep field empty for new customer
      console.log('Customer not found in system')
    } finally {
      setSearchingCustomer(false)
    }
  }

  const handlePrintBill = () => {
    if (typeof window !== 'undefined') {
      window.print()
    }
  }

  const handleFeedbackClose = () => {
    setFeedbackModal(current => ({ ...current, isOpen: false }))

    if (!pendingBillData) return

    setBillData(pendingBillData)
    setPendingBillData(null)

    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.print()
      }
    }, 250)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const selectedItems = rentalItems.filter(item => item.equipmentId)
    if (selectedItems.length === 0) {
      setFeedbackModal({
        isOpen: true,
        variant: 'error',
        title: 'Equipment Required',
        message: 'Please select at least one equipment item.',
      })
      return
    }

    const duplicateEquipment = selectedItems.find((item, index) =>
      selectedItems.some((otherItem, otherIndex) =>
        otherIndex !== index && otherItem.equipmentId === item.equipmentId
      )
    )

    if (duplicateEquipment) {
      setFeedbackModal({
        isOpen: true,
        variant: 'error',
        title: 'Duplicate Equipment',
        message: 'Each equipment can only be selected once. Increase the quantity instead.',
      })
      return
    }

    const unavailableItem = selectedItems.find(item => {
      const selectedEquip = equipment.find(e => e._id === item.equipmentId)
      return selectedEquip && Number(item.quantity) > getAvailableQuantity(selectedEquip)
    })

    if (unavailableItem) {
      const selectedEquip = equipment.find(e => e._id === unavailableItem.equipmentId)
      setFeedbackModal({
        isOpen: true,
        variant: 'error',
        title: 'Insufficient Stock',
        message: `Only ${getAvailableQuantity(selectedEquip)} units available for ${selectedEquip.name}.`,
      })
      return
    }

    setLoading(true)

    try {
      const config = { headers: { Authorization: `Bearer ${auth.token}` } }
      await Promise.all(selectedItems.map(item => {
        const payload = {
          equipmentId: item.equipmentId,
          quantity: parseInt(item.quantity, 10),
          customerName: formData.customerName,
          customerPhone: formData.customerPhone,
          startDate: formData.startDate,
          notes: formData.notes,
        }

        return axios.post(`${API_BASE}/bookings`, payload, config)
      }))

      const receiptItems = selectedItems.map(item => {
        const selectedEquip = equipment.find(e => e._id === item.equipmentId)
        const quantity = Number(item.quantity || 0)
        const rate = Number(selectedEquip?.rentPerDay || 0)

        return {
          name: selectedEquip?.name || 'Equipment',
          quantity,
          rate,
          subtotal: rate * quantity,
        }
      })

      setPendingBillData({
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        startDate: formData.startDate,
        notes: formData.notes,
        createdAt: new Date().toISOString(),
        items: receiptItems,
        total: calculatedAmount,
      })

      setFeedbackModal({
        isOpen: true,
        variant: 'success',
        title: 'Rental Created',
        message: selectedItems.length > 1
          ? 'Rentals created successfully.'
          : 'Rental created successfully.',
      })

      // Reset form
      setRentalItems([{ ...emptyRentalItem }])
      setFormData({
        customerName: '',
        customerPhone: '',
        startDate: '',
        notes: '',
      })
      fetchEquipment()
    } catch (error) {
      console.error('Error creating rental:', error)
      setFeedbackModal({
        isOpen: true,
        variant: 'error',
        title: 'Rental Failed',
        message: error.response?.data?.error || 'Failed to create rental',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="create-rental">
      <PopuModal
        isOpen={feedbackModal.isOpen}
        variant={feedbackModal.variant}
        title={feedbackModal.title}
        message={feedbackModal.message}
        onClose={handleFeedbackClose}
      />

      {billData && (
        <div className="bill-modal-backdrop" onClick={() => setBillData(null)} role="presentation">
          <div className="bill-modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
            <div className="bill-modal-header">
              <div>
                <span className="bill-modal-kicker">Rental bill</span>
                <h2>Invoice</h2>
              </div>
              <button type="button" className="bill-modal-close" onClick={() => setBillData(null)}>✕</button>
            </div>

            <div className="bill-paper">
              <div className="bill-topline">
                <div>
                  <strong>Rento</strong>
                  <span>Equipment Rentals</span>
                </div>
                <span className="bill-date">{new Date(billData.createdAt).toLocaleString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}</span>
              </div>

              <div className="bill-customer-block">
                <div>
                  <span>Customer</span>
                  <strong>{billData.customerName}</strong>
                </div>
                <div>
                  <span>Phone</span>
                  <strong>{billData.customerPhone}</strong>
                </div>
                <div>
                  <span>Start Date</span>
                  <strong>{billData.startDate ? new Date(billData.startDate).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  }) : '—'}</strong>
                </div>
              </div>

              <div className="bill-items-header">
                <span>Item</span>
                <span>Qty</span>
                <span>Rate</span>
                <span>Amount</span>
              </div>

              <div className="bill-items-list">
                {billData.items.map((item, index) => (
                  <div className="bill-item-row" key={`${item.name}-${index}`}>
                    <span>{item.name}</span>
                    <span>{item.quantity}</span>
                    <span>₹{Number(item.rate || 0).toLocaleString('en-IN')}</span>
                    <span>₹{Number(item.subtotal || 0).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>

              <div className="bill-summary">
                <div>
                  <span>Notes</span>
                  <strong>{billData.notes || 'No additional notes'}</strong>
                </div>
                <div className="bill-total-box">
                  <span>Total</span>
                  <strong>₹{Number(billData.total || 0).toLocaleString('en-IN')}</strong>
                </div>
              </div>
            </div>

            <div className="bill-modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setBillData(null)}>Close</button>
              <button type="button" className="btn-primary" onClick={handlePrintBill}>Print Bill</button>
            </div>
          </div>
        </div>
      )}

      {equipmentPickerIndex !== null && (
        <div className="equipment-picker-backdrop" onClick={closeEquipmentPicker} role="presentation">
          <div
            className="equipment-picker-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="equipment-picker-title"
          >
            <div className="equipment-picker-header">
              <div>
                <span className="equipment-picker-eyebrow">Choose item</span>
                <h2 id="equipment-picker-title">Select Equipment</h2>
              </div>
              <button type="button" className="equipment-picker-close" onClick={closeEquipmentPicker}>
                x
              </button>
            </div>

            <div className="equipment-picker-search">
              <input
                type="search"
                value={equipmentSearchTerm}
                onChange={(event) => setEquipmentSearchTerm(event.target.value)}
                placeholder="Search by equipment, shop, condition"
                autoFocus
              />
            </div>

            <div className="equipment-picker-list">
              {filteredEquipment.length > 0 ? (
                filteredEquipment.map(item => {
                  const available = getAvailableQuantity(item)
                  const isSelectedElsewhere = selectedEquipmentIds.includes(item._id)
                    && rentalItems[equipmentPickerIndex]?.equipmentId !== item._id
                  const isUnavailable = available <= 0
                  const disabled = isSelectedElsewhere || isUnavailable

                  return (
                    <button
                      type="button"
                      className={`equipment-picker-option ${disabled ? 'disabled' : ''}`}
                      key={item._id}
                      onClick={() => !disabled && handleSelectEquipment(item._id)}
                      disabled={disabled}
                    >
                      <span className="equipment-picker-thumb" aria-hidden="true">
                        {String(item.name || 'EQ').slice(0, 2).toUpperCase()}
                      </span>
                      <span className="equipment-picker-main">
                        <strong>{item.name}</strong>
                        <small>{item.location || 'Unassigned'} · {item.condition || 'Good'}</small>
                      </span>
                      <span className="equipment-picker-meta">
                        <strong>₹{Number(item.rentPerDay || 0).toLocaleString('en-IN')}</strong>
                        <small>{available} available</small>
                      </span>
                      {isSelectedElsewhere && <span className="equipment-picker-status">Selected</span>}
                      {isUnavailable && <span className="equipment-picker-status">Out</span>}
                    </button>
                  )
                })
              ) : (
                <div className="equipment-picker-empty">
                  <h3>No equipment found</h3>
                  <p>Try another search term.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <h1>Create New Rental</h1>

      <form onSubmit={handleSubmit} className="rental-form">
        <div className="form-section">
          <h3>Equipment Details</h3>

          <div className="equipment-items">
            {rentalItems.map((item, index) => (
              <div className="equipment-item-row" key={index}>
                <div className="form-group">
                  <label htmlFor={`equipment-${index}`}>Equipment *</label>
                  <input
                    id={`equipment-${index}`}
                    type="hidden"
                    value={item.equipmentId}
                    required
                    readOnly
                  />
                  <button
                    type="button"
                    className={`equipment-select-button ${item.equipmentId ? 'selected' : ''}`}
                    onClick={() => openEquipmentPicker(index)}
                  >
                    {item.equipmentId ? (
                      <>
                        <span>
                          <strong>{getSelectedEquipment(item.equipmentId)?.name || 'Selected equipment'}</strong>
                          <small>
                            ₹{Number(getSelectedEquipment(item.equipmentId)?.rentPerDay || 0).toLocaleString('en-IN')}/day · {getAvailableQuantity(getSelectedEquipment(item.equipmentId) || {})} available
                          </small>
                        </span>
                        <em>Change</em>
                      </>
                    ) : (
                      <>
                        <span>
                          <strong>Select Equipment</strong>
                        </span>
                        <em>Choose</em>
                      </>
                    )}
                  </button>
                </div>

                <div className="form-group quantity-group">
                  <label htmlFor={`quantity-${index}`}>Quantity *</label>
                  <input
                    type="number"
                    id={`quantity-${index}`}
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleRentalItemChange(index, 'quantity', e.target.value)}
                    required
                  />
                </div>

                {rentalItems.length > 1 && (
                  <button
                    type="button"
                    className="btn-remove-equipment"
                    onClick={() => handleRemoveRentalItem(index)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>

          <button type="button" className="btn-add-equipment" onClick={handleAddRentalItem}>
            Add Equipment
          </button>

          {calculatedAmount > 0 && (
            <div className="amount-summary">
              <div className="summary-item">
                <span>Estimated Daily Total</span>
                <span className="amount">₹{calculatedAmount.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        <div className="form-section">
          <h3>Customer Information</h3>

          <div className="form-group">
            <label htmlFor="customerName">Customer Name *</label>
            <input
              type="text"
              id="customerName"
              name="customerName"
              value={formData.customerName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="customerPhone">Phone Number *</label>
            <input
              type="tel"
              id="customerPhone"
              name="customerPhone"
              value={formData.customerPhone}
              onChange={handleInputChange}
              onBlur={handlePhoneBlur}
              disabled={searchingCustomer}
              required
            />
            {searchingCustomer && <span className="searching-text">🔍 Searching...</span>}
          </div>
        </div>

        <div className="form-section">
          <h3>Rental Dates</h3>

          <div className="form-group">
            <label htmlFor="startDate">Start Date *</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Additional Notes</h3>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Any additional information..."
              rows="3"
            />
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Creating...' : 'Create Rental'}
        </button>
      </form>
    </div>
  )
}

export default CreateRental
