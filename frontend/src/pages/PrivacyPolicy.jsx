import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft, Mail, MapPin, Phone } from 'lucide-react';

const Section = ({ title, children }) => (
  <div style={{ marginBottom: '2.5rem' }}>
    <h2 style={{
      fontSize: '1.2rem', fontWeight: 700,
      color: 'var(--text-bright)',
      borderLeft: '3px solid var(--aurora-1)',
      paddingLeft: '0.75rem',
      marginBottom: '1rem',
    }}>{title}</h2>
    <div style={{ color: 'var(--text-dim)', lineHeight: 1.8, fontSize: '0.95rem' }}>
      {children}
    </div>
  </div>
);

const PrivacyPolicy = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-base)',
      color: 'var(--text-bright)',
      fontFamily: "'Inter', sans-serif",
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(79,70,229,0.08) 100%)',
        borderBottom: '1px solid var(--border-muted)',
        padding: '1.5rem 2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
      }}>
        <Link to="/" style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          color: 'var(--text-dim)', textDecoration: 'none',
          fontSize: '0.9rem', fontWeight: 500,
          transition: 'color 0.2s',
        }}>
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </div>

      <div style={{ maxWidth: 820, margin: '0 auto', padding: '3rem 2rem 5rem' }}>

        {/* Title Block */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.4rem 1rem',
            background: 'rgba(124,58,237,0.1)',
            border: '1px solid rgba(124,58,237,0.2)',
            borderRadius: 99, fontSize: '0.8rem', fontWeight: 600,
            color: 'var(--aurora-1)', marginBottom: '1.25rem',
          }}>
            <Shield size={14} /> Legal Document
          </div>
          <h1 style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 800,
            margin: '0 0 0.75rem 0',
          }}>Privacy Policy</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.95rem' }}>
            Last updated: June 17, 2025 &nbsp;·&nbsp; Effective immediately
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-muted)',
          borderRadius: 20, padding: '2.5rem',
          boxShadow: 'var(--shadow-md)',
        }}>

          <Section title="1. Introduction">
            <p>
              Welcome to <strong>easyPG</strong> ("we", "our", "us"). easyPG is a hostel management platform
              operated by <strong>easyPG Technologies</strong>. We are committed to protecting your personal
              information and your right to privacy. This Privacy Policy explains how we collect, use, disclose,
              and safeguard your information when you use our web application and mobile application.
            </p>
            <p style={{ marginTop: '0.75rem' }}>
              Please read this policy carefully. If you disagree with its terms, please discontinue use of our platform.
            </p>
          </Section>

          <Section title="2. Information We Collect">
            <p>We collect the following types of information:</p>
            <ul style={{ paddingLeft: '1.25rem', marginTop: '0.75rem' }}>
              <li style={{ marginBottom: '0.5rem' }}><strong>Personal Information:</strong> Name, email address, phone number, Aadhaar/ID details provided during registration.</li>
              <li style={{ marginBottom: '0.5rem' }}><strong>Account Data:</strong> Login credentials, role (owner/tenant), subscription status.</li>
              <li style={{ marginBottom: '0.5rem' }}><strong>Payment Information:</strong> Transaction IDs, payment status (we do NOT store card numbers or UPI PINs — these are handled by PhonePe's secure gateway).</li>
              <li style={{ marginBottom: '0.5rem' }}><strong>Hostel Data:</strong> Property details, room configurations, rent amounts, occupancy data.</li>
              <li style={{ marginBottom: '0.5rem' }}><strong>Usage Data:</strong> Pages visited, features used, timestamps, IP address, device type.</li>
              <li style={{ marginBottom: '0.5rem' }}><strong>Communications:</strong> Complaints raised, messages sent within the platform.</li>
            </ul>
          </Section>

          <Section title="3. How We Use Your Information">
            <ul style={{ paddingLeft: '1.25rem' }}>
              <li style={{ marginBottom: '0.5rem' }}>To create and manage your account</li>
              <li style={{ marginBottom: '0.5rem' }}>To process rent payments and subscriptions</li>
              <li style={{ marginBottom: '0.5rem' }}>To send payment receipts and notifications</li>
              <li style={{ marginBottom: '0.5rem' }}>To enable communication between owners and tenants</li>
              <li style={{ marginBottom: '0.5rem' }}>To improve our platform features and performance</li>
              <li style={{ marginBottom: '0.5rem' }}>To comply with legal obligations</li>
              <li style={{ marginBottom: '0.5rem' }}>To detect and prevent fraud or misuse</li>
            </ul>
          </Section>

          <Section title="4. Payment Processing">
            <p>
              easyPG uses <strong>PhonePe Payment Gateway</strong> for processing all payments. When you make
              a payment, you are directed to PhonePe's secure platform. We do not store your card details,
              bank account credentials, or UPI PIN. All financial transactions are encrypted using
              industry-standard SSL/TLS protocols.
            </p>
            <p style={{ marginTop: '0.75rem' }}>
              Transaction reference IDs are stored in our database solely for payment verification and record-keeping purposes.
            </p>
          </Section>

          <Section title="5. Sharing of Information">
            <p>We do not sell, trade, or rent your personal information. We may share data with:</p>
            <ul style={{ paddingLeft: '1.25rem', marginTop: '0.75rem' }}>
              <li style={{ marginBottom: '0.5rem' }}><strong>Service Providers:</strong> Supabase (database), PhonePe (payments), Render (backend hosting), Vercel (frontend hosting).</li>
              <li style={{ marginBottom: '0.5rem' }}><strong>Legal Authorities:</strong> If required by law, court order, or government regulation.</li>
              <li style={{ marginBottom: '0.5rem' }}><strong>Between Owner & Tenant:</strong> Basic profile information (name, phone) is shared between a hostel owner and their respective tenants for operational purposes.</li>
            </ul>
          </Section>

          <Section title="6. Data Security">
            <p>
              We implement appropriate technical and organizational security measures including:
            </p>
            <ul style={{ paddingLeft: '1.25rem', marginTop: '0.75rem' }}>
              <li style={{ marginBottom: '0.5rem' }}>256-bit SSL/TLS encryption for all data in transit</li>
              <li style={{ marginBottom: '0.5rem' }}>Secure password hashing (bcrypt)</li>
              <li style={{ marginBottom: '0.5rem' }}>Row-level security on our database</li>
              <li style={{ marginBottom: '0.5rem' }}>JWT-based authentication with expiry</li>
              <li style={{ marginBottom: '0.5rem' }}>Regular security audits</li>
            </ul>
          </Section>

          <Section title="7. Data Retention">
            <p>
              We retain your personal data for as long as your account is active or as needed to provide services.
              You may request deletion of your account and associated data by contacting us at{' '}
              <a href="mailto:support@easypg.in" style={{ color: 'var(--aurora-1)' }}>support@easypg.in</a>.
              Some data may be retained for legal compliance for up to 7 years.
            </p>
          </Section>

          <Section title="8. Cookies">
            <p>
              We use minimal cookies for session management and authentication. We do not use cookies for
              advertising or third-party tracking. You may disable cookies in your browser settings, though
              this may affect platform functionality.
            </p>
          </Section>

          <Section title="9. Your Rights">
            <p>You have the right to:</p>
            <ul style={{ paddingLeft: '1.25rem', marginTop: '0.75rem' }}>
              <li style={{ marginBottom: '0.5rem' }}>Access the personal data we hold about you</li>
              <li style={{ marginBottom: '0.5rem' }}>Correct inaccurate or incomplete data</li>
              <li style={{ marginBottom: '0.5rem' }}>Request deletion of your account and data</li>
              <li style={{ marginBottom: '0.5rem' }}>Opt out of non-essential communications</li>
              <li style={{ marginBottom: '0.5rem' }}>Lodge a complaint with a data protection authority</li>
            </ul>
          </Section>

          <Section title="10. Children's Privacy">
            <p>
              easyPG is not intended for use by individuals under the age of 18. We do not knowingly collect
              personal data from minors. If you believe a minor has provided us with their data, please contact us immediately.
            </p>
          </Section>

          <Section title="11. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. We will notify users of significant changes
              via email or an in-app notification. Continued use of the platform after changes constitutes
              your acceptance of the updated policy.
            </p>
          </Section>

          <Section title="12. Contact Us">
            <p>For any privacy-related queries or requests, contact us at:</p>
            <div style={{
              marginTop: '1rem',
              padding: '1.25rem',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 12,
              display: 'flex', flexDirection: 'column', gap: '0.6rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem' }}>
                <Mail size={15} style={{ color: 'var(--aurora-1)' }} />
                <a href="mailto:support@easypg.in" style={{ color: 'var(--aurora-1)', textDecoration: 'none' }}>support@easypg.in</a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem' }}>
                <Phone size={15} style={{ color: 'var(--aurora-1)' }} />
                <span>+91 75696 21094</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem' }}>
                <MapPin size={15} style={{ color: 'var(--aurora-1)' }} />
                <span>easyPG Technologies, Hyderabad, Telangana, India</span>
              </div>
            </div>
          </Section>

        </div>

        {/* Footer links */}
        <div style={{
          marginTop: '2rem', textAlign: 'center',
          display: 'flex', justifyContent: 'center', gap: '2rem',
          fontSize: '0.875rem',
        }}>
          <Link to="/terms" style={{ color: 'var(--aurora-1)', textDecoration: 'none' }}>Terms &amp; Conditions</Link>
          <Link to="/refund-policy" style={{ color: 'var(--aurora-1)', textDecoration: 'none' }}>Refund Policy</Link>
          <Link to="/" style={{ color: 'var(--text-dim)', textDecoration: 'none' }}>Home</Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
