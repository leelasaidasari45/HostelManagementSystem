import React from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, ArrowLeft, Mail, Phone, MapPin, CheckCircle2, XCircle } from 'lucide-react';

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

const RefundPolicy = () => {
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
      }}>
        <Link to="/" style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          color: 'var(--text-dim)', textDecoration: 'none',
          fontSize: '0.9rem', fontWeight: 500, width: 'fit-content',
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
            <RefreshCw size={14} /> Legal Document
          </div>
          <h1 style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 800,
            margin: '0 0 0.75rem 0',
          }}>Refund &amp; Cancellation Policy</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.95rem' }}>
            Last updated: June 17, 2025 &nbsp;·&nbsp; Applies to all easyPG transactions
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-muted)',
          borderRadius: 20, padding: '2.5rem',
          boxShadow: 'var(--shadow-md)',
        }}>

          <Section title="1. Overview">
            <p>
              At <strong>easyPG</strong>, we strive to provide the best possible experience for both hostel
              owners and tenants. This Refund &amp; Cancellation Policy outlines the conditions under which
              refunds are applicable for payments made through our platform.
            </p>
            <p style={{ marginTop: '0.75rem' }}>
              All payments on easyPG are processed via <strong>PhonePe Payment Gateway</strong>.
              Refunds, where applicable, will be credited back to the original payment method.
            </p>
          </Section>

          <Section title="2. Owner Subscription — Annual Pro Plan">

            {/* Eligible Box */}
            <div style={{
              background: 'rgba(52,211,153,0.08)',
              border: '1px solid rgba(52,211,153,0.2)',
              borderRadius: 12, padding: '1.25rem', marginBottom: '1rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontWeight: 700, color: '#34d399' }}>
                <CheckCircle2 size={16} /> Eligible for Refund
              </div>
              <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
                <li style={{ marginBottom: '0.4rem' }}>If you request a refund within <strong>7 days</strong> of your first subscription payment and have not used the platform features beyond the trial period.</li>
                <li style={{ marginBottom: '0.4rem' }}>If there is a technical failure causing a <strong>duplicate payment</strong> — the duplicate amount will be fully refunded.</li>
                <li style={{ marginBottom: '0.4rem' }}>If a payment is deducted but the subscription is <strong>not activated</strong> due to a system error — full refund will be issued.</li>
              </ul>
            </div>

            {/* Not Eligible Box */}
            <div style={{
              background: 'rgba(248,113,113,0.08)',
              border: '1px solid rgba(248,113,113,0.2)',
              borderRadius: 12, padding: '1.25rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontWeight: 700, color: '#f87171' }}>
                <XCircle size={16} /> Not Eligible for Refund
              </div>
              <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
                <li style={{ marginBottom: '0.4rem' }}>Refund requests made after 7 days of the subscription purchase date.</li>
                <li style={{ marginBottom: '0.4rem' }}>Subscriptions cancelled mid-year — no partial/pro-rata refunds are provided.</li>
                <li style={{ marginBottom: '0.4rem' }}>Change of mind after activation of the subscription.</li>
                <li style={{ marginBottom: '0.4rem' }}>Accounts suspended due to violation of our Terms &amp; Conditions.</li>
              </ul>
            </div>
          </Section>

          <Section title="3. Tenant Rent Payments">

            <div style={{
              background: 'rgba(52,211,153,0.08)',
              border: '1px solid rgba(52,211,153,0.2)',
              borderRadius: 12, padding: '1.25rem', marginBottom: '1rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontWeight: 700, color: '#34d399' }}>
                <CheckCircle2 size={16} /> Eligible for Refund
              </div>
              <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
                <li style={{ marginBottom: '0.4rem' }}>Payment deducted but <strong>not recorded</strong> in the system due to a technical error — full refund will be issued.</li>
                <li style={{ marginBottom: '0.4rem' }}><strong>Duplicate payments</strong> for the same month — the extra amount will be refunded.</li>
                <li style={{ marginBottom: '0.4rem' }}>Payment made to a <strong>wrong hostel</strong> due to a platform error — full refund will be issued after investigation.</li>
              </ul>
            </div>

            <div style={{
              background: 'rgba(248,113,113,0.08)',
              border: '1px solid rgba(248,113,113,0.2)',
              borderRadius: 12, padding: '1.25rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontWeight: 700, color: '#f87171' }}>
                <XCircle size={16} /> Not Eligible for Refund
              </div>
              <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
                <li style={{ marginBottom: '0.4rem' }}>Rent payments successfully made and confirmed — these are final as they represent a contractual obligation between tenant and owner.</li>
                <li style={{ marginBottom: '0.4rem' }}>Disputes between tenant and hostel owner regarding rent amounts or services — these must be resolved directly between the parties.</li>
                <li style={{ marginBottom: '0.4rem' }}>Payments made after the tenant's own request to vacate the hostel.</li>
              </ul>
            </div>
          </Section>

          <Section title="4. Refund Processing Timeline">
            <p>Once a refund is approved:</p>
            <ul style={{ paddingLeft: '1.25rem', marginTop: '0.75rem' }}>
              <li style={{ marginBottom: '0.5rem' }}>Refunds to <strong>UPI / Net Banking / Debit Card</strong>: 5–7 business days</li>
              <li style={{ marginBottom: '0.5rem' }}>Refunds to <strong>Credit Card</strong>: 7–10 business days</li>
              <li style={{ marginBottom: '0.5rem' }}>Refunds to <strong>PhonePe Wallet</strong>: 1–3 business days</li>
            </ul>
            <p style={{ marginTop: '0.75rem' }}>
              Timelines are subject to bank processing times and may vary. easyPG will initiate the refund
              within <strong>3 business days</strong> of approval.
            </p>
          </Section>

          <Section title="5. How to Request a Refund">
            <p>To request a refund, please contact us with the following details:</p>
            <ul style={{ paddingLeft: '1.25rem', marginTop: '0.75rem' }}>
              <li style={{ marginBottom: '0.5rem' }}>Your registered email address</li>
              <li style={{ marginBottom: '0.5rem' }}>Transaction ID or Order ID</li>
              <li style={{ marginBottom: '0.5rem' }}>Amount paid and date of payment</li>
              <li style={{ marginBottom: '0.5rem' }}>Reason for refund request</li>
              <li style={{ marginBottom: '0.5rem' }}>Screenshot of the payment confirmation (if available)</li>
            </ul>
            <p style={{ marginTop: '0.75rem' }}>
              Send your refund request to{' '}
              <a href="mailto:support@easypg.in" style={{ color: 'var(--aurora-1)' }}>support@easypg.in</a>{' '}
              with the subject line: <strong>"Refund Request - [Your Transaction ID]"</strong>
            </p>
          </Section>

          <Section title="6. Cancellation Policy">
            <p><strong>For Owners (Annual Pro Subscription):</strong></p>
            <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem', marginBottom: '1rem' }}>
              <li style={{ marginBottom: '0.5rem' }}>You may cancel your subscription at any time from the Billing section of your dashboard.</li>
              <li style={{ marginBottom: '0.5rem' }}>Upon cancellation, your access will remain active until the end of your current billing period.</li>
              <li style={{ marginBottom: '0.5rem' }}>No refunds are provided for the remaining period after cancellation.</li>
            </ul>
            <p><strong>For Tenants:</strong></p>
            <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem' }}>
              <li style={{ marginBottom: '0.5rem' }}>Tenants may submit a vacate notice through the platform, subject to the hostel's notice period policy.</li>
              <li style={{ marginBottom: '0.5rem' }}>Rent payments already made are non-refundable once confirmed.</li>
            </ul>
          </Section>

          <Section title="7. Payment Failures">
            <p>
              If your payment fails but your bank account is debited, the amount will typically be
              auto-reversed by your bank within 5–7 business days. If the amount is not reversed,
              please contact us with your transaction details and we will coordinate with PhonePe
              to resolve the issue.
            </p>
          </Section>

          <Section title="8. Contact Us">
            <p>For refund or cancellation queries, reach out to us:</p>
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
            <p style={{ marginTop: '0.75rem', fontSize: '0.88rem', color: 'var(--text-ghost)' }}>
              Our support team responds within <strong>24–48 business hours</strong>.
            </p>
          </Section>

        </div>

        {/* Footer links */}
        <div style={{
          marginTop: '2rem', textAlign: 'center',
          display: 'flex', justifyContent: 'center', gap: '2rem',
          fontSize: '0.875rem',
        }}>
          <Link to="/privacy-policy" style={{ color: 'var(--aurora-1)', textDecoration: 'none' }}>Privacy Policy</Link>
          <Link to="/terms" style={{ color: 'var(--aurora-1)', textDecoration: 'none' }}>Terms &amp; Conditions</Link>
          <Link to="/" style={{ color: 'var(--text-dim)', textDecoration: 'none' }}>Home</Link>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;
