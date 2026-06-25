import React, { useState, useEffect } from 'react';
import { X, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import toast from 'react-hot-toast';
import './ReviewPopup.css';

const ReviewPopup = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [quote, setQuote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;

    const hasReviewed = localStorage.getItem(`hasReviewed_${user.id}`);
    if (hasReviewed === 'true') return;

    const lastPromptDateStr = localStorage.getItem(`lastReviewPrompt_${user.id}`);
    const now = new Date();

    if (lastPromptDateStr) {
      const lastPromptDate = new Date(lastPromptDateStr);
      const diffTime = Math.abs(now - lastPromptDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      
      if (diffDays >= 3) {
        // Show immediately after 3 days have passed since last prompt
        setIsOpen(true);
        localStorage.setItem(`lastReviewPrompt_${user.id}`, now.toISOString());
      }
    } else {
      // First time prompt
      const timer = setTimeout(() => {
        setIsOpen(true);
        localStorage.setItem(`lastReviewPrompt_${user.id}`, now.toISOString());
      }, 7000); // 7 seconds after they load the dash
      return () => clearTimeout(timer);
    }
  }, [user]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!quote.trim()) return toast.error('Please write a brief review');

    setIsSubmitting(true);
    try {
      await api.post('/reviews', {
        user_id: user.id,
        name: user.name,
        role: user.role === 'owner' ? 'Owner' : 'Tenant',
        pg_name: user.role === 'owner' ? 'Hostel Owner' : 'Verified Tenant',
        rating,
        quote
      });
      toast.success('Thank you for your review!');
      localStorage.setItem(`hasReviewed_${user.id}`, 'true');
      setIsOpen(false);
    } catch (error) {
      toast.error('Failed to submit review');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="review-popup-overlay">
      <div className="review-popup-content glass-panel">
        <button className="close-btn" onClick={() => setIsOpen(false)}>
          <X size={20} />
        </button>
        
        <h2>How are you liking easyPG?</h2>
        <p className="subtitle">Your feedback helps us improve and grow.</p>
        
        <form onSubmit={handleSubmit}>
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={36}
                fill={(hoverRating || rating) >= star ? '#fbbf24' : 'transparent'}
                color={(hoverRating || rating) >= star ? '#fbbf24' : 'var(--border-strong)'}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="star-icon"
              />
            ))}
          </div>

          <textarea
            placeholder="Tell us what you love or what could be better..."
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
            rows={4}
            required
            className="input-field"
          />

          <button type="submit" className="btn btn-primary submit-review-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
          
          <button type="button" className="btn btn-secondary later-btn" onClick={() => setIsOpen(false)}>
            Remind me later
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReviewPopup;
