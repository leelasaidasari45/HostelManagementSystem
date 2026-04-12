import React from 'react';
import './MobileSplash.css';

const MobileSplash = () => {
    return (
        <div className="mobile-splash-container">
            <div className="splash-content overflow-hidden">
                <div className="splash-logo-wrapper blur-in">
                    <img 
                      src="https://i.pinimg.com/736x/1d/31/58/1d315807fbdbf074612825fcdaa7c9b8.jpg" 
                      alt="easyPG Logo" 
                      className="splash-logo scale-up"
                    />
                </div>
                <h1 className="splash-title fade-up">easyPG</h1>
                <div className="splash-loader mt-4">
                    <div className="loader-bar"></div>
                </div>
            </div>
            <div className="splash-footer fade-in">
                <p>Premium Hostel Management</p>
            </div>
        </div>
    );
};

export default MobileSplash;
