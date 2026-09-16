import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import EquipmentCard from '../components/EquipmentCard'
import { equipmentService } from '../services/api'
import './Browse.css'

function Browse() {
  const navigate = useNavigate()
  const [equipment, setEquipment] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    priceMin: '',
    priceMax: '',
    location: '',
    page: 1,
  })

  useEffect(() => {
    fetchEquipment()
  }, [filters])

  const fetchEquipment = async () => {
    try {
      setLoading(true)
      const response = await equipmentService.getAllEquipment(filters)
      setEquipment(response.data.equipment)
    } catch (error) {
      console.error('Error fetching equipment:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      page: 1,
    }))
  }

  return (
    <div className="browse">
      <div className="browse-container">
        <aside className="filters-sidebar">
          <h3>Filters</h3>
          <div className="filter-group">
            <label>Search</label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search equipment..."
            />
          </div>

          <div className="filter-group">
            <label>Category</label>
            <select name="category" value={filters.category} onChange={handleFilterChange}>
              <option value="">All Categories</option>
              <option value="power-tools">Power Tools</option>
              <option value="party-supplies">Party Supplies</option>
              <option value="camping">Camping</option>
              <option value="sports">Sports</option>
              <option value="photography">Photography</option>
              <option value="gardening">Gardening</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Price Range (per day)</label>
            <input
              type="number"
              name="priceMin"
              value={filters.priceMin}
              onChange={handleFilterChange}
              placeholder="Min"
            />
            <input
              type="number"
              name="priceMax"
              value={filters.priceMax}
              onChange={handleFilterChange}
              placeholder="Max"
            />
          </div>

          <div className="filter-group">
            <label>Location</label>
            <input
              type="text"
              name="location"
              value={filters.location}
              onChange={handleFilterChange}
              placeholder="City or area..."
            />
          </div>
        </aside>

        <main className="browse-content">
          <h2>Browse Equipment</h2>
          {loading ? (
            <p>Loading...</p>
          ) : equipment.length > 0 ? (
            <div className="equipment-grid">
              {equipment.map((item) => (
                <EquipmentCard
                  key={item._id}
                  equipment={item}
                  onViewDetails={(id) => navigate(`/equipment/${id}`)}
                />
              ))}
            </div>
          ) : (
            <p className="no-results">No equipment found. Try adjusting your filters.</p>
          )}
        </main>
      </div>
    </div>
  )
}

export default Browse
