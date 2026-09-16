import React from 'react'
import './EquipmentCard.css'

function EquipmentCard({ equipment, onViewDetails }) {
  return (
    <div className="equipment-card">
      <div className="card-image">
        <img src={equipment.images?.[0] || '/placeholder.jpg'} alt={equipment.title} />
      </div>
      <div className="card-content">
        <h3>{equipment.title}</h3>
        <p className="category">{equipment.category}</p>
        <div className="rating">
          <span>⭐ {equipment.rating?.toFixed(1) || 0}</span>
          <span>({equipment.totalReviews} reviews)</span>
        </div>
        <p className="price">${equipment.pricePerDay}/day</p>
        <p className="location">📍 {equipment.location?.city}</p>
        <button className="btn-primary" onClick={() => onViewDetails(equipment._id)}>
          View Details
        </button>
      </div>
    </div>
  )
}

export default EquipmentCard
