import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import EquipmentCard from '../components/EquipmentCard'
import { equipmentService } from '../services/api'
import './Home.css'

function Home() {
  const navigate = useNavigate()
  const [featuredEquipment, setFeaturedEquipment] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedEquipment()
  }, [])

  const fetchFeaturedEquipment = async () => {
    try {
      const response = await equipmentService.getAllEquipment({ limit: 6 })
      setFeaturedEquipment(response.data.equipment)
    } catch (error) {
      console.error('Error fetching equipment:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>Rent Equipment Easily</h1>
          <p>Find and rent tools, equipment, and gear from your neighbors</p>
          <button className="btn-large" onClick={() => navigate('/browse')}>
            Start Exploring
          </button>
        </div>
      </section>

      <section className="featured-section">
        <h2>Featured Equipment</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="equipment-grid">
            {featuredEquipment.map((item) => (
              <EquipmentCard
                key={item._id}
                equipment={item}
                onViewDetails={(id) => navigate(`/equipment/${id}`)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="features">
        <h2>Why Choose Us?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3>Easy Discovery</h3>
            <p>Browse thousands of equipment listings in your area</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <h3>Affordable</h3>
            <p>Save money by renting instead of buying</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">✅</div>
            <h3>Verified Owners</h3>
            <p>Trust our community with ratings and reviews</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🚀</div>
            <h3>Quick Bookings</h3>
            <p>Book equipment in minutes, not hours</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
