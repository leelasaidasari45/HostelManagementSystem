import React from 'react';
import OwnerHeader from './OwnerHeader';
import MobileOwnerHeader from './MobileOwnerHeader';
import OwnerSidebar from './OwnerSidebar';
import '../../pages/owner/OwnerDashboard.css';

/**
 * Shared owner dashboard shell — desktop sidebar + header,
 * mobile app header + bottom nav (via OwnerSidebar).
 */
const OwnerPageLayout = ({
  title,
  subtitle,
  mobileTitle,
  children,
  hideSidebar = false,
  showMobileTitle,
  layoutStyle,
}) => {
  const displayMobileTitle = showMobileTitle !== false && (mobileTitle || title);

  return (
    <div className="dashboard-layout" style={layoutStyle}>
      {!hideSidebar && <OwnerSidebar />}
      <MobileOwnerHeader />
      <main className="dashboard-content fade-in mobile-pb">
        {(title || subtitle) && (
          <div className="desktop-only-widgets">
            <OwnerHeader title={title} subtitle={subtitle} />
          </div>
        )}
        {displayMobileTitle && (
          <h2 className="mobile-page-title">{mobileTitle || title}</h2>
        )}
        {children}
      </main>
    </div>
  );
};

export default OwnerPageLayout;
