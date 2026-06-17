import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowLeft, Mail, MapPin, Phone } from 'lucide-react';

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

const TermsAndConditions = () => {
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
            <FileText size={14} /> Legal Document
          </div>
          <h1 style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 800,
            margin: '0 0 0.75rem 0',
          }}>Terms &amp; Conditions</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.95rem' }}>
            Last updated: June 17, 2025 &nbsp;·&nbsp; Please read carefully before using easyPG
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-muted)',
          borderRadius: 20, padding: '2.5rem',
          boxShadow: 'var(--shadow-md)',
        }}>

          <Section title="1. Acceptance of Terms">
            <p>
              By accessing or using <strong>easyPG</strong> (the "Platform"), you agree to be bound by these
              Terms &amp; Conditions. If you do not agree with any part of these terms, you must not use the
              Platform. These terms apply to all users, including hostel owners, tenants, and visitors.
            </p>
          </Section>

          <Section title="2. Description of Service">
            <p>
              easyPG is a Software-as-a-Service (SaaS) hostel management platform that enables:
            </p>
            <ul style={{ paddingLeft: '1.25rem', marginTop: '0.75rem' }}>
              <li style={{ marginBottom: '0.5rem' }}><strong>Hostel Owners:</strong> To manage properties, rooms, tenants, rent collection, complaints, and analytics.</li>
              <li style={{ marginBottom: '0.5rem' }}><strong>Tenants:</strong> To pay rent online, raise complaints, and communicate with their hostel management.</li>
            </ul>
          </Section>

          <Section title="3. User Accounts & Registration">
            <ul style={{ paddingLeft: '1.25rem' }}>
              <li style={{ marginBottom: '0.5rem' }}>You must be at least 18 years of age to create an account.</li>
              <li style={{ marginBottom: '0.5rem' }}>You agree to provide accurate, current, and complete information during registration.</li>
              <li style={{ marginBottom: '0.5rem' }}>You are responsible for maintaining the confidentiality of your account credentials.</li>
              <li style={{ marginBottom: '0.5rem' }}>You must notify us immediately at <a href="mailto:support@easypg.in" style={{ color: 'var(--aurora-1)' }}>support@easypg.in</a> of any unauthorized use of your account.</li>
              <li style={{ marginBottom: '0.5rem' }}>We reserve the right to suspend or terminate accounts that violate these terms.</li>
            </ul>
          </Section>

          <Section title="4. Subscription Plans & Billing">
            <ul style={{ paddingLeft: '1.25rem' }}>
              <li style={{ marginBottom: '0.5rem' }}>Hostel owners are provided a <strong>free trial period</strong> of 7 days upon registration.</li>
              <li style={{ marginBottom: '0.5rem' }}>After the trial, continued access requires an <strong>Annual Pro subscription at ₹40,000/year</strong>.</li>
              <li style={{ marginBottom: '0.5rem' }}>All subscription payments are processed securely via <strong>PhonePe Payment Gateway</strong>.</li>
              <li style={{ marginBottom: '0.5rem' }}>Subscription fees are non-refundable except as described in our <Link to="/refund-policy" style={{ color: 'var(--aurora-1)' }}>Refund Policy</Link>.</li>
              <li style={{ marginBottom: '0.5rem' }}>We reserve the right to modify pricing with 30 days' notice to existing subscribers.</li>
            </ul>
          </Section>

          <Section title="5. Tenant Rent Payments">
            <ul style={{ paddingLeft: '1.25rem' }}>
              <li style={{ marginBottom: '0.5rem' }}>Tenants can pay monthly rent through the easyPG platform using PhonePe.</li>
              <li style={{ marginBottom: '0.5rem' }}>easyPG acts as a facilitator; it is not a party to the rental agreement between owner and tenant.</li>
              <li style={{ marginBottom: '0.5rem' }}>Disputes regarding rent amounts must be resolved directly between the owner and tenant.</li>
              <li style={{ marginBottom: '0.5rem' }}>Payment confirmations are generated automatically upon successful transaction verification.</li>
            </ul>
          </Section>

          <Section title="6. Prohibited Activities">
            <p>You agree not to:</p>
            <ul style={{ paddingLeft: '1.25rem', marginTop: '0.75rem' }}>
              <li style={{ marginBottom: '0.5rem' }}>Use the platform for any illegal purpose or in violation of any regulations</li>
              <li style={{ marginBottom: '0.5rem' }}>Attempt to hack, reverse engineer, or compromise the platform's security</li>
              <li style={{ marginBottom: '0.5rem' }}>Create multiple accounts to circumvent subscription requirements</li>
              <li style={{ marginBottom: '0.5rem' }}>Upload false, misleading, or fraudulent information</li>
              <li style={{ marginBottom: '0.5rem' }}>Harass, abuse, or harm other users of the platform</li>
              <li style={{ marginBottom: '0.5rem' }}>Use automated bots or scrapers to extract data from the platform</li>
            </ul>
          </Section>

          <Section title="7. Intellectual Property">
            <p>
              All content on the easyPG platform including the logo, design, code, features, and documentation
              is the intellectual property of easyPG Technologies. You may not copy, reproduce, distribute,
              or create derivative works without prior written consent.
            </p>
          </Section>

          <Section title="8. Disclaimer of Warranties">
            <p>
              The platform is provided on an "AS IS" and "AS AVAILABLE" basis without any warranties of any kind,
              either express or implied. We do not warrant that the platform will be uninterrupted, error-free,
              or free of viruses or other harmful components.
            </p>
          </Section>

          <Section title="9. Limitation of Liability">
            <p>
              To the maximum extent permitted by applicable law, easyPG Technologies shall not be liable for
              any indirect, incidental, special, consequential, or punitive damages arising from your use
              of or inability to use the platform. Our total liability shall not exceed the amount paid by
              you in the 3 months preceding the claim.
            </p>
          </Section>

          <Section title="10. Governing Law & Jurisdiction">
            <p>
              These Terms shall be governed by and construed in accordance with the laws of <strong>India</strong>.
              Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the
              courts in <strong>Hyderabad, Telangana, India</strong>.
            </p>
          </Section>

          <Section title="11. Modifications to Terms">
            <p>
              We reserve the right to modify these Terms at any time. Significant changes will be communicated
              via email or in-app notification. Your continued use of the platform after any modification
              constitutes acceptance of the updated terms.
            </p>
          </Section>

          <Section title="12. Contact">
            <p>For any questions about these Terms, contact us at:</p>
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
          <Link to="/privacy-policy" style={{ color: 'var(--aurora-1)', textDecoration: 'none' }}>Privacy Policy</Link>
          <Link to="/refund-policy" style={{ color: 'var(--aurora-1)', textDecoration: 'none' }}>Refund Policy</Link>
          <Link to="/" style={{ color: 'var(--text-dim)', textDecoration: 'none' }}>Home</Link>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
