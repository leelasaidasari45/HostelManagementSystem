import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Building2, MessageSquare, Plus, History, ChevronRight, CreditCard } from 'lucide-react';

const navItems = [
  { to: '/owner/dashboard', icon: <LayoutDashboard size={20} />, label: 'Home' },
  { to: '/owner/tenants', icon: <Users size={20} />, label: 'Tenants' },
  { to: '/owner/rooms', icon: <Building2 size={20} />, label: 'Rooms' },
  { to: '/owner/complaints', icon: <MessageSquare size={20} />, label: 'Issues' },
  { to: '/owner/past-tenants', icon: <History size={20} />, label: 'Vacated' },
  { to: '/owner/billing', icon: <CreditCard size={20} />, label: 'Billing' },
];

const OwnerSidebar = () => {
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);
  const isActive = (path) => location.pathname === path;

  return (
    <aside className={`sidebar ${expanded ? 'sidebar-exp' : ''}`}>
      {/* Logo */}
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="logo-wrap" title="easyPG">
          <img src="/logo.png" alt="easyPG" style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: 6 }} />
        </div>
      </Link>

      <div className="sidebar-divider" />

      <nav className="sidebar-nav">
        {navItems.map(({ to, icon, label }) => (
          <Link
            key={to}
            to={to}
            className={`nav-item ${isActive(to) ? 'active' : ''}`}
            title={!expanded ? label : undefined}
          >
            {icon}
            <span className="nav-label">{label}</span>
          </Link>
        ))}
        <div className="sidebar-divider" />
        <Link
          to="/owner/create-hostel"
          className={`nav-item nav-item-create ${isActive('/owner/create-hostel') ? 'active' : ''}`}
          title={!expanded ? 'Add Hostel' : undefined}
        >
          <Plus size={20} />
          <span className="nav-label">Add Hostel</span>
        </Link>
      </nav>

      {/* Expand toggle — desktop only */}
      <button
        onClick={() => setExpanded(p => !p)}
        className="sidebar-toggle"
        title={expanded ? 'Collapse' : 'Expand'}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 28, height: 28, borderRadius: '50%', border: '1px solid var(--border-subtle)',
          background: 'var(--bg-elevated)', color: 'var(--text-dim)', cursor: 'pointer',
          transition: 'all 200ms', marginTop: 'auto', flexShrink: 0,
          transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
        }}
      >
        <ChevronRight size={14} />
      </button>
    </aside>
  );
};

export default OwnerSidebar;
