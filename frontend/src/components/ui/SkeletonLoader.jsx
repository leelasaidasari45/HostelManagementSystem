import React from 'react';

// Helper atomic skeleton shapes
export const SkeletonLine = ({ className = '', style = {}, height = '14px', width = '100%', marginBottom = '0.5rem' }) => (
  <div 
    className={`skeleton skeleton-text ${className}`} 
    style={{ height, width, marginBottom, ...style }} 
  />
);

export const SkeletonTitle = ({ className = '', style = {}, width = '45%', marginBottom = '1rem' }) => (
  <div 
    className={`skeleton skeleton-title ${className}`} 
    style={{ width, marginBottom, ...style }} 
  />
);

export const SkeletonCircle = ({ size = '40px', className = '', style = {}, marginRight = '0px' }) => (
  <div 
    className={`skeleton skeleton-avatar ${className}`} 
    style={{ width: size, height: size, marginRight, ...style }} 
  />
);

export const SkeletonRect = ({ className = '', style = {}, height = '100px', width = '100%', borderRadius = 'var(--r-md)', marginBottom = '1rem' }) => (
  <div 
    className={`skeleton ${className}`} 
    style={{ height, width, borderRadius, marginBottom, ...style }} 
  />
);

// High-fidelity page layout presets
export const PageSkeleton = ({ type = 'dashboard' }) => {
  switch (type) {
    case 'dashboard':
      return (
        <div style={{ padding: '0 0.5rem' }}>
          {/* KPI Cards Row */}
          <div className="stats-grid" style={{ marginBottom: '2rem' }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton-card-bg shimmer-overlay" style={{ minHeight: '130px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <SkeletonLine width="50%" height="16px" marginBottom="0" />
                  <SkeletonCircle size="20px" />
                </div>
                <SkeletonLine width="75%" height="32px" marginBottom="0.75rem" />
                <SkeletonLine width="40%" height="14px" marginBottom="0" />
              </div>
            ))}
          </div>

          {/* Widgets Grid */}
          <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))' }}>
            {/* Notice Board Card */}
            <div className="skeleton-card-bg shimmer-overlay" style={{ minHeight: '300px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <SkeletonCircle size="32px" />
                <SkeletonLine width="40%" height="18px" marginBottom="0" />
              </div>
              <SkeletonLine height="40px" marginBottom="1.25rem" />
              <SkeletonRect height="80px" marginBottom="1.25rem" />
              <SkeletonRect height="44px" marginBottom="0" />
            </div>

            {/* Mess Menu Card */}
            <div className="skeleton-card-bg shimmer-overlay" style={{ minHeight: '300px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <SkeletonCircle size="32px" />
                <SkeletonLine width="40%" height="18px" marginBottom="0" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <SkeletonCircle size="44px" />
                    <div style={{ flex: 1 }}>
                      <SkeletonLine width="30%" height="14px" marginBottom="0.4rem" />
                      <SkeletonLine width="80%" height="14px" marginBottom="0" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );

    case 'rooms':
      return (
        <div style={{ padding: '0 0.5rem' }}>
          {/* Top filter/actions bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <SkeletonLine width="280px" height="42px" marginBottom="0" />
            <SkeletonLine width="150px" height="42px" marginBottom="0" />
          </div>

          {/* Rooms Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {Array.from({ length: 2 }).map((_, floorIdx) => (
              <div key={floorIdx} className="floor-section" style={{ border: 'none', background: 'transparent' }}>
                {/* Floor Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <SkeletonLine width="120px" height="24px" marginBottom="0" />
                  <SkeletonLine width="80px" height="20px" marginBottom="0" style={{ borderRadius: '99px' }} />
                </div>

                {/* Rooms cards inside the floor */}
                <div className="rooms-grid">
                  {Array.from({ length: 4 }).map((_, rIdx) => (
                    <div key={rIdx} className="skeleton-card-bg shimmer-overlay" style={{ minHeight: '120px', padding: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <SkeletonLine width="30%" height="22px" marginBottom="0" />
                        <SkeletonLine width="50px" height="18px" marginBottom="0" style={{ borderRadius: '99px' }} />
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <SkeletonCircle size="16px" />
                        <SkeletonLine width="60%" height="14px" marginBottom="0" />
                      </div>
                      <SkeletonRect height="8px" marginBottom="0" borderRadius="99px" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'tenants':
      return (
        <div style={{ padding: '0 0.5rem' }}>
          {/* Search container placeholder */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
            <SkeletonLine width="100%" height="45px" marginBottom="0" style={{ maxWidth: '600px', borderRadius: 'var(--r-xl)' }} />
          </div>

          {/* List of tenant card rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="skeleton-card-bg shimmer-overlay" style={{ padding: '1.25rem', display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <SkeletonCircle size="48px" />
                <div style={{ flex: '1 1 200px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <SkeletonLine width="150px" height="18px" marginBottom="0" />
                    <SkeletonLine width="60px" height="16px" marginBottom="0" style={{ borderRadius: '99px' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <SkeletonLine width="100px" height="14px" marginBottom="0" />
                    <SkeletonLine width="120px" height="14px" marginBottom="0" />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
                  <SkeletonLine width="80px" height="36px" marginBottom="0" style={{ borderRadius: '8px' }} />
                  <SkeletonLine width="80px" height="36px" marginBottom="0" style={{ borderRadius: '8px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'complaints':
      return (
        <div style={{ padding: '0 0.5rem' }}>
          {/* Search and control row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <SkeletonLine width="100%" height="45px" marginBottom="0" style={{ maxWidth: '400px' }} />
            <SkeletonLine width="120px" height="42px" marginBottom="0" />
          </div>

          {/* Complaint cards grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="skeleton-card-bg shimmer-overlay" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <SkeletonCircle size="36px" />
                    <div>
                      <SkeletonLine width="120px" height="16px" marginBottom="0.25rem" />
                      <SkeletonLine width="80px" height="13px" marginBottom="0" />
                    </div>
                  </div>
                  <SkeletonLine width="70px" height="20px" marginBottom="0" style={{ borderRadius: '99px' }} />
                </div>
                <SkeletonRect height="48px" marginBottom="1rem" />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <SkeletonLine width="100px" height="14px" marginBottom="0" />
                  <SkeletonLine width="90px" height="32px" marginBottom="0" style={{ borderRadius: '8px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'billing':
      return (
        <div style={{ padding: '0 0.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Subscription details block */}
          <div className="skeleton-card-bg shimmer-overlay" style={{ padding: '2rem' }}>
            <SkeletonLine width="150px" height="22px" marginBottom="1.25rem" />
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <SkeletonCircle size="44px" />
              <div>
                <SkeletonLine width="200px" height="24px" marginBottom="0.4rem" />
                <SkeletonLine width="130px" height="14px" marginBottom="0" />
              </div>
              <SkeletonLine width="120px" height="40px" marginBottom="0" style={{ marginLeft: 'auto', borderRadius: '10px' }} />
            </div>
            <SkeletonRect height="8px" marginBottom="0" borderRadius="99px" />
          </div>

          {/* Pricing options mock grid */}
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {Array.from({ length: 2 }).map((_, idx) => (
              <div key={idx} className="skeleton-card-bg shimmer-overlay" style={{ flex: '1 1 300px', maxWidth: '400px', padding: '2rem', minHeight: '300px' }}>
                <SkeletonLine width="40%" height="16px" marginBottom="1rem" />
                <SkeletonLine width="60%" height="36px" marginBottom="1.25rem" />
                <SkeletonRect height="60px" marginBottom="1.5rem" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                  <SkeletonLine width="80%" height="14px" />
                  <SkeletonLine width="75%" height="14px" />
                  <SkeletonLine width="90%" height="14px" />
                </div>
                <SkeletonRect height="44px" marginBottom="0" style={{ borderRadius: '12px' }} />
              </div>
            ))}
          </div>
        </div>
      );

    case 'tenant-dashboard':
      return (
        <div style={{ padding: '0 0.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Welcome Banner */}
          <div className="skeleton-card-bg shimmer-overlay" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.25rem', minHeight: '140px' }}>
            <div style={{ flex: 1 }}>
              <SkeletonLine width="60%" height="26px" marginBottom="0.6rem" />
              <SkeletonLine width="40%" height="15px" marginBottom="0" />
            </div>
            <SkeletonCircle size="60px" />
          </div>

          {/* Active section mock grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Rent Dues widget */}
            <div className="skeleton-card-bg shimmer-overlay" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <SkeletonLine width="30%" height="18px" marginBottom="0" />
                <SkeletonLine width="80px" height="18px" marginBottom="0" style={{ borderRadius: '99px' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                  <SkeletonLine width="120px" height="36px" marginBottom="0.4rem" />
                  <SkeletonLine width="160px" height="14px" marginBottom="0" />
                </div>
                <SkeletonRect height="42px" width="120px" marginBottom="0" style={{ borderRadius: '10px' }} />
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem' }}>
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="skeleton-card-bg shimmer-overlay" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', minHeight: '100px' }}>
                  <SkeletonCircle size="24px" />
                  <SkeletonLine width="60%" height="14px" marginBottom="0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    case 'join-hostel':
      return (
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
          <SkeletonCircle size="54px" />
          <SkeletonLine width="60%" height="24px" marginBottom="0.4rem" style={{ alignSelf: 'center' }} />
          <SkeletonLine width="80%" height="14px" marginBottom="1.5rem" style={{ alignSelf: 'center' }} />
          
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <SkeletonRect height="46px" marginBottom="0" style={{ borderRadius: '10px' }} />
            <SkeletonRect height="46px" marginBottom="0" style={{ borderRadius: '10px' }} />
            <SkeletonRect height="60px" marginBottom="0" style={{ borderRadius: '10px' }} />
            <SkeletonRect height="42px" marginBottom="0" style={{ borderRadius: '10px', marginTop: '1rem' }} />
          </div>
        </div>
      );

    default:
      return (
        <div style={{ padding: '1rem' }}>
          <SkeletonTitle />
          <SkeletonLine />
          <SkeletonLine />
          <SkeletonLine width="80%" />
        </div>
      );
  }
};

export default PageSkeleton;
