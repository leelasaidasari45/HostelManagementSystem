import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Phone, Building2, ChevronLeft, Image as ImageIcon, Home } from 'lucide-react';
import api from '../../api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const SearchHostels = () => {
  const { user } = useAuth();
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchHostels();
  }, []);

  const fetchHostels = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/tenant/hostels/search');
      setHostels(res.data || []);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to load hostels';
      toast.error(msg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredHostels = hostels.filter(h => 
    h.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    h.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard-layout" style={{ background: 'var(--bg-base)', minHeight: '100vh', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Find a Hostel</h1>
            <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: '0.9rem' }}>Browse verified properties</p>
          </div>
        </div>
        
        {user?.role === 'tenant' && (
          <Link to="/tenant/dashboard" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
            <Home size={16} /> Back to Present Hostel
          </Link>
        )}
      </header>

      {/* Search Bar */}
      <div style={{ position: 'relative', marginBottom: '2rem' }}>
        <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
        <input 
          type="text" 
          placeholder="Search by name or location..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '1rem 1rem 1rem 3rem',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 16,
            color: 'var(--text-bright)',
            fontSize: '1rem',
            boxShadow: 'var(--shadow-sm)',
            outline: 'none'
          }}
        />
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', paddingBottom: '3rem' }}>
        {loading ? (
          <p style={{ color: 'var(--text-dim)' }}>Loading hostels...</p>
        ) : filteredHostels.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', background: 'var(--bg-surface)', borderRadius: 16, border: '1px solid var(--border-muted)' }}>
            <Building2 size={48} style={{ color: 'var(--text-ghost)', margin: '0 auto 1rem' }} />
            <h3 style={{ margin: '0 0 0.5rem', color: 'var(--text-bright)' }}>No hostels found</h3>
            <p style={{ margin: 0, color: 'var(--text-dim)' }}>Try adjusting your search criteria</p>
          </div>
        ) : (
          filteredHostels.map(hostel => (
            <div key={hostel.id} className="slide-up" style={{ 
              background: 'var(--bg-surface)', 
              borderRadius: 16, 
              border: '1px solid var(--border-muted)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--shadow-sm)'
            }}>
              {/* Photo Area */}
              <div style={{ width: '100%', height: 180, background: 'var(--bg-elevated)', position: 'relative', borderBottom: '1px solid var(--border-subtle)' }}>
                {hostel.photo_url ? (
                  <img src={hostel.photo_url.startsWith('http') ? hostel.photo_url : `/${hostel.photo_url}`} alt={hostel.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-ghost)' }}>
                    <ImageIcon size={32} />
                  </div>
                )}
                <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', color: '#fff', padding: '4px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600 }}>
                  Code: {hostel.pg_code}
                </div>
              </div>

              {/* Content Area */}
              <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', color: 'var(--text-bright)' }}>{hostel.name}</h3>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-dim)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  <MapPin size={14} color="var(--danger)" />
                  <span>{hostel.location}</span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-dim)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                  <Phone size={14} color="var(--aurora-1)" />
                  <span>{hostel.owner_phone}</span>
                </div>

                <div style={{ marginTop: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <a href={`tel:${hostel.owner_phone}`} style={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', 
                    padding: '0.6rem', borderRadius: 8, background: 'var(--bg-elevated)', 
                    color: 'var(--text-bright)', textDecoration: 'none', border: '1px solid var(--border-subtle)',
                    fontSize: '0.85rem', fontWeight: 600
                  }}>
                    <Phone size={14} /> Call
                  </a>
                  <Link to={`/tenant/join?code=${hostel.pg_code}`} style={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', 
                    padding: '0.6rem', borderRadius: 8, background: 'var(--aurora-1)', 
                    color: '#fff', textDecoration: 'none', border: 'none',
                    fontSize: '0.85rem', fontWeight: 600
                  }}>
                    Join Now
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SearchHostels;
