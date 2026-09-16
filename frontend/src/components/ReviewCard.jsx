import React from 'react'
import './ReviewCard.css'

function ReviewCard({ review }) {
  const renderStars = (rating) => {
    return '⭐'.repeat(rating)
  }

  return (
    <div className="review-card">
      <div className="review-header">
        <div className="reviewer-info">
          <img src={review.renter?.profileImage || '/default-avatar.jpg'} alt={review.renter?.name} />
          <div>
            <h4>{review.renter?.name}</h4>
            <p className="review-date">{new Date(review.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="rating">{renderStars(review.rating)}</div>
      </div>
      <p className="review-comment">{review.comment}</p>
      {review.images && review.images.length > 0 && (
        <div className="review-images">
          {review.images.map((img, idx) => (
            <img key={idx} src={img} alt={`review-${idx}`} />
          ))}
        </div>
      )}
      <div className="review-helpful">
        <button>👍 Helpful ({review.helpful})</button>
      </div>
    </div>
  )
}

export default ReviewCard
