import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, X, Check, CheckCheck, AlertTriangle, CreditCard, Utensils, Megaphone, DoorOpen, Info } from 'lucide-react';
import api from '../api';
import './NotificationBell.css';

const TYPE_ICON = {
  notice:    { icon: Megaphone,     color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
  menu:      { icon: Utensils,      color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  complaint: { icon: AlertTriangle, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  payment:   { icon: CreditCard,    color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  vacate:    { icon: DoorOpen,      color: '#ef4444', bg: 'rgba(239,68,68,0.12)'  },
  general:   { icon: Info,          color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${d}d ago`;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/notifications');
      const data = res.data || [];
      setNotifications(data);
      setUnread(data.filter(n => !n.is_read).length);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount and every 30 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const markRead = async (id) => {
    try {
      await api.put(`/api/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnread(prev => Math.max(0, prev - 1));
    } catch (err) {}
  };

  const markAllRead = async () => {
    try {
      await api.put('/api/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnread(0);
    } catch (err) {}
  };

  return (
    <div className="notif-bell-wrapper" ref={panelRef}>
      {/* Bell Button */}
      <button
        className={`notif-bell-btn ${open ? 'active' : ''}`}
        onClick={() => { setOpen(o => !o); if (!open) fetchNotifications(); }}
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unread > 0 && (
          <span className="notif-badge">{unread > 99 ? '99+' : unread}</span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="notif-panel">
          <div className="notif-panel-header">
            <div className="notif-panel-title">
              <Bell size={16} />
              <span>Notifications</span>
              {unread > 0 && <span className="notif-unread-chip">{unread} new</span>}
            </div>
            <div className="notif-panel-actions">
              {unread > 0 && (
                <button className="notif-mark-all" onClick={markAllRead} title="Mark all as read">
                  <CheckCheck size={15} /> Mark all read
                </button>
              )}
              <button className="notif-close-btn" onClick={() => setOpen(false)}>
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="notif-list">
            {loading && notifications.length === 0 ? (
              <div className="notif-empty">
                <div className="notif-loading-dots">
                  <span /><span /><span />
                </div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="notif-empty">
                <Bell size={36} style={{ opacity: 0.25 }} />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map(n => {
                const typeConfig = TYPE_ICON[n.type] || TYPE_ICON.general;
                const IconComp = typeConfig.icon;
                return (
                  <div
                    key={n.id}
                    className={`notif-item ${!n.is_read ? 'unread' : ''}`}
                    onClick={() => !n.is_read && markRead(n.id)}
                  >
                    <div className="notif-item-icon" style={{ background: typeConfig.bg, color: typeConfig.color }}>
                      <IconComp size={16} />
                    </div>
                    <div className="notif-item-body">
                      <div className="notif-item-title">{n.title}</div>
                      <div className="notif-item-msg">{n.message}</div>
                      <div className="notif-item-time">{timeAgo(n.created_at)}</div>
                    </div>
                    {!n.is_read && <div className="notif-item-dot" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
