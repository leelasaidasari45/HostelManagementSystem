import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import './NotFoundPage.css';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1 className="not-found-title">404</h1>
        <h2 className="not-found-subtitle">Page Not Found</h2>
        <p className="not-found-text">
          Oops! The page you are looking for doesn't exist or has been moved.
        </p>
        <button className="btn btn-primary not-found-btn" onClick={() => navigate('/')}>
          <Home size={18} />
          <span>Back to Home</span>
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
