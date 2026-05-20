import React from 'react';
import { Link } from 'react-router-dom';
import { Users, DoorOpen, Bell, Utensils, MessageSquare, QrCode, TrendingUp, Smartphone, ShieldCheck, Zap, ChevronDown, Coins, ClipboardList } from 'lucide-react';
import './MobileDashboardSections.css';

const MobileDashboardSections = ({ analytics }) => {
  const currentMonth = new Date().toLocaleString('default', { month: 'short' });

  return (
    <div className="mobile-only-sections">
      
      {/* Summary Section */}
      <section className="dashboard-section summary-section">
        <div className="summary-header">
          <h2 className="summary-title">{currentMonth} Collection Status</h2>
          <div className="summary-dropdown">
            <span>All Properties</span>
            <ChevronDown size={14} />
          </div>
        </div>
        
        <div className="summary-cards-scroll">
          <div className="summary-card">
            <div className="sc-top">
              <span className="sc-value green">₹0</span>
            </div>
            <div className="sc-bottom">
              <span className="sc-label">Today's<br/>Collection</span>
              <Coins size={14} className="sc-icon green" />
            </div>
          </div>

          <div className="summary-card">
            <div className="sc-top">
              <span className="sc-value green">₹{analytics?.metrics?.totalCollection?.toLocaleString() || 0}</span>
            </div>
            <div className="sc-bottom">
              <span className="sc-label">{currentMonth}'s<br/>Collection</span>
              <Coins size={14} className="sc-icon green" />
            </div>
          </div>

          <div className="summary-card">
            <div className="sc-top">
              <span className="sc-value red">₹0</span>
            </div>
            <div className="sc-bottom">
              <span className="sc-label">{currentMonth}'s<br/>Dues</span>
              <ClipboardList size={14} className="sc-icon red" />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="dashboard-section mt-4">
        <h2 className="section-title">Quick Links</h2>
        <div className="quick-actions-scroll">
          <Link to="/owner/tenants" className="qa-item">
            <div className="qa-icon" style={{ color: '#8b5cf6' }}>
              <Users size={24} />
            </div>
            <span>Tenants</span>
          </Link>
          <Link to="/owner/rooms" className="qa-item">
            <div className="qa-icon" style={{ color: '#10b981' }}>
              <DoorOpen size={24} />
            </div>
            <span>Rooms</span>
          </Link>
          <div className="qa-item" onClick={() => document.getElementById('notice-form')?.scrollIntoView({ behavior: 'smooth' })}>
            <div className="qa-icon" style={{ color: '#f59e0b' }}>
              <Bell size={24} />
            </div>
            <span>Notice</span>
          </div>
          <div className="qa-item" onClick={() => document.getElementById('menu-form')?.scrollIntoView({ behavior: 'smooth' })}>
            <div className="qa-icon" style={{ color: '#8b5cf6' }}>
              <Utensils size={24} />
            </div>
            <span>Add Menu</span>
          </div>
          <Link to="/owner/complaints" className="qa-item">
            <div className="qa-icon" style={{ color: '#ef4444' }}>
              <MessageSquare size={24} />
            </div>
            <span>Complaints</span>
          </Link>
        </div>
      </section>

      {/* New Features */}
      <section className="dashboard-section">
        <h2 className="section-title">What's New</h2>
        <div className="features-carousel">
          <div className="feature-banner banner-purple">
            <div className="feature-badge" style={{ color: '#4338ca', background: '#fff' }}>
              <span className="dot" style={{ background: '#10b981' }}></span> New Feature
            </div>
            <h3>Never Miss Tenants With<br/><span style={{ background: '#4f46e5', color: '#fff', padding: '2px 8px', borderRadius: '8px' }}>QR Onboarding</span></h3>
            <p>Tenants scan and join instantly without manual entry.</p>
          </div>
          <div className="feature-banner banner-green">
            <div className="feature-badge" style={{ color: '#047857', background: '#fff' }}>
              <span className="dot" style={{ background: '#10b981' }}></span> Now Live
            </div>
            <h3>Smart<br/><span style={{ background: '#059669', color: '#fff', padding: '2px 8px', borderRadius: '8px' }}>Tenant Tracking</span></h3>
            <p>Track all dues and collections automatically.</p>
          </div>
        </div>
      </section>

      {/* Join Community */}
      <section className="dashboard-section">
        <h2 className="section-title">Owner Community</h2>
        <a href="https://wa.me/917569621094" target="_blank" rel="noopener noreferrer" className="community-banner">
          <div className="community-content">
            <div className="live-badge"><span className="dot"></span> Now Live!</div>
            <h3>PG/Hostel Owners</h3>
            <div className="wa-channel-badge">
              <MessageSquare size={16} /> WhatsApp Channel
            </div>
            <p>Stay updated with Smart property Management Insights</p>
          </div>
          <div className="wa-icon-large">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.663-2.06-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
          </div>
        </a>
      </section>

      {/* Smart Property */}
      <section className="dashboard-section pb-8">
        <h2 className="section-title">Smart Automations</h2>
        <div className="smart-automations-scroll">
          <div className="smart-item">
            <div className="smart-icon-wrapper bg-purple">
              <Smartphone size={24} />
            </div>
            <span>Tenant App</span>
          </div>
          <div className="smart-item">
            <div className="smart-icon-wrapper bg-orange">
              <QrCode size={24} />
            </div>
            <span>QR Onboard</span>
          </div>
          <div className="smart-item">
            <div className="smart-icon-wrapper bg-green">
              <Zap size={24} />
            </div>
            <span>Auto Billing</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MobileDashboardSections;
