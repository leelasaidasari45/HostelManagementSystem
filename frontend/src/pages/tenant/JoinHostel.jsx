import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  QrCode, FileText, CheckCircle2, RefreshCw, XCircle, Camera,
  ChevronRight, User, Phone, Home, Hash, Car, Calendar,
  Upload, ArrowLeft, IndianRupee, CreditCard, ShieldCheck, Sparkles
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import toast from 'react-hot-toast';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import PageSkeleton from '../../components/ui/SkeletonLoader';
import './JoinHostel.css';

const CF_ENV = import.meta.env.VITE_CASHFREE_ENV || 'sandbox';

// Load Cashfree JS SDK dynamically
const loadCashfreeSDK = () => new Promise((resolve, reject) => {
  if (window.Cashfree) { resolve(window.Cashfree); return; }
  const script = document.createElement('script');
  script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
  script.onload = () => resolve(window.Cashfree);
  script.onerror = () => reject(new Error('Failed to load Cashfree SDK'));
  document.body.appendChild(script);
});


const JoinHostel = () => {
  const navigate    = useNavigate();
  const location    = useLocation();
  // steps: 1 = enter code/scan, 1.5 = payment, 2 = join form, 3 = pending
  const [step, setStep]               = useState(null);
  const [hostelCode, setHostelCode]   = useState('');
  const [hostelName, setHostelName]   = useState('');
  const [hostelData, setHostelData]   = useState(null);
  const [loadingCode, setLoadingCode] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [roomRent, setRoomRent]       = useState(null); // { room_number, rent_amount }
  const [isScanning, setIsScanning]   = useState(false);
  const scannerRef = useRef(null);
  const { user, logoutContext }       = useAuth();

  // The admission payment amount
  const [admissionAmount, setAdmissionAmount] = useState('');
  const [showUpiModal, setShowUpiModal]       = useState(false);
  const [selectedUpiApp, setSelectedUpiApp]   = useState(null);
  const [upiId, setUpiId]                     = useState('');
  const [payTab, setPayTab]                   = useState('upi'); // 'upi' | 'card'
  const [cardData, setCardData]               = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [confirmingPay, setConfirmingPay]     = useState(false);

  const [formData, setFormData] = useState({
    tenantName:    user?.name || '',
    fatherName:    '',
    address:       '',
    mobile:        '',
    roomNumber:    '',
    vehicleNumber: '',
    admissionDate: new Date().toISOString().split('T')[0],
    aadhaarFile:   null,
  });

  // URL code auto-fill + status check — runs ONCE on mount only
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) setHostelCode(code.toUpperCase());

    const check = async () => {
      try {
        const res = await api.get('/api/tenant/dashboard');
        const tenant = res.data?.tenant;
        if (!tenant) { code ? autoVerifyCode(code.toUpperCase()) : setStep(1); return; }

        const st = tenant.status;

        if (st === 'active' || st === 'vacating') {
          // Already joined & approved — send to dashboard, replace history so back button doesn't loop
          navigate('/tenant/dashboard', { replace: true });
          return;
        }
        if (st === 'pending') {
          setStep(3); // Show "waiting for approval" step
          return;
        }
        // new / vacated / rejected — show join flow
        if (code) await autoVerifyCode(code.toUpperCase());
        else setStep(1);
      } catch {
        // API error — just show the join flow
        if (code) autoVerifyCode(code.toUpperCase());
        else setStep(1);
      }
    };
    check();

    return () => { if (scannerRef.current) scannerRef.current.stop().catch(console.error); };
  }, []); // ← empty array: run once only, never re-trigger


  // Auto-verify code from URL (go straight to payment step)
  const autoVerifyCode = async (code) => {
    try {
      const res = await api.get(`/api/tenant/verify-hostel/${code}`);
      setHostelName(res.data.name);
      setHostelData(res.data);
      setStep(1.5); // Go directly to payment step
    } catch {
      setStep(1);
    }
  };

  // QR scanner lifecycle
  useEffect(() => {
    let html5QrCode = null;
    if (!isScanning) return;
    const timer = setTimeout(async () => {
      try {
        const el = document.getElementById('reader');
        if (!el) { setIsScanning(false); return; }
        html5QrCode = new Html5Qrcode('reader');
        scannerRef.current = html5QrCode;
        await html5QrCode.start(
          { facingMode: 'environment' },
          { fps: 15, qrbox: { width: 240, height: 240 } },
          (decoded) => {
            let code = decoded;
            if (decoded.includes('code=')) {
              try { code = new URL(decoded).searchParams.get('code') || decoded; } catch {}
            }
            const upper = code.toUpperCase();
            setHostelCode(upper);
            stopScanner();
            handleVerifyCode(null, upper);
          },
          () => {}
        );
      } catch {
        toast.error('Camera error. Check permissions.');
        setIsScanning(false);
      }
    }, 500);
    return () => {
      clearTimeout(timer);
      if (html5QrCode?.isScanning) html5QrCode.stop().catch(console.error);
    };
  }, [isScanning]);

  const stopScanner = async () => {
    if (scannerRef.current) {
      try { await scannerRef.current.stop(); scannerRef.current = null; } catch {}
    }
    setIsScanning(false);
  };

  const handleVerifyCode = async (e, directCode = null) => {
    if (e) e.preventDefault();
    const code = directCode || hostelCode;
    if (!code || code.trim().length < 4) { if (!directCode) toast.error('Enter a valid hostel code'); return; }
    setLoadingCode(true);
    try {
      const res = await api.get(`/api/tenant/verify-hostel/${code}`);
      setHostelName(res.data.name);
      setHostelData(res.data);
      toast.success(`Found: ${res.data.name}`);
      setStep(1.5); // → Payment step
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid hostel code');
    } finally { setLoadingCode(false); }
  };

  // Auto-fetch room rent when room number changes in the form
  const handleRoomNumberChange = async (roomNo) => {
    setFormData(prev => ({ ...prev, roomNumber: roomNo }));
    setRoomRent(null);
    if (roomNo.length >= 2 && hostelCode) {
      try {
        const res = await api.get(`/api/tenant/room-rent/${hostelCode}/${roomNo}`);
        setRoomRent(res.data);
      } catch {
        // Room not found yet, that's fine — user might still be typing
      }
    }
  };

  // Launch real Cashfree checkout
  const handlePayment = async () => {
    if (!admissionAmount || parseFloat(admissionAmount) <= 0) {
      return toast.error('Please enter a valid amount');
    }
    setLoadingPayment(true);
    try {
      // Step 1: Create order on backend
      const res = await api.post('/api/cashfree/create-order', {
        amount: parseFloat(admissionAmount),
        month:  new Date().toLocaleString('default', { month: 'long' }),
        year:   new Date().getFullYear(),
        type:   'admission',
      });
      const { payment_session_id, order_id, environment } = res.data;

      // Step 2: Load Cashfree SDK — mode from backend response to guarantee match
      await loadCashfreeSDK();
      const cashfree = await window.Cashfree({ mode: environment || 'production' });

      // Step 3: Launch drop-in checkout (shows UPI, cards, netbanking)
      const result = await cashfree.checkout({
        paymentSessionId: payment_session_id,
        redirectTarget:   '_modal',  // opens as overlay modal
      });

      // Only skip if user explicitly cancelled
      const cancelled = result?.error?.code === 'PAYMENT_CANCELLED_BY_USER' ||
                        result?.error?.type === 'user_cancelled';
      if (cancelled) {
        toast('Payment cancelled.', { icon: 'ℹ️' });
        setLoadingPayment(false);
        return;
      }

      // Always verify with backend — SDK result varies by payment method
      toast.loading('Verifying payment...', { id: 'verify' });
      try {
        const verifyRes = await api.post('/api/cashfree/verify', {
          order_id,
          amount: parseFloat(admissionAmount),
          month:  new Date().toLocaleString('default', { month: 'long' }),
          year:   new Date().getFullYear(),
        });
        toast.dismiss('verify');
        if (verifyRes.data.success) {
          toast.success('Payment successful! 🎉');
          setStep(2);
        } else {
          toast.error('Payment verification failed. Contact support.');
        }
      } catch {
        toast.dismiss('verify');
        toast.error('Verification error. If payment was deducted, contact support.');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Payment failed. Try again.');
    } finally {
      setLoadingPayment(false);
    }
  };

  // confirmPayment is no longer used (Cashfree handles it natively)
  const confirmPayment = async () => {};


  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries({
      hostelCode,
      tenantName:    formData.tenantName,
      fatherName:    formData.fatherName,
      address:       formData.address,
      mobile:        formData.mobile,
      roomNumber:    formData.roomNumber,
      vehicleNumber: formData.vehicleNumber,
      admissionDate: formData.admissionDate,
    }).forEach(([k, v]) => data.append(k, v));
    if (formData.aadhaarFile) data.append('aadhaar', formData.aadhaarFile);

    setLoadingSubmit(true);
    try {
      const res = await api.post('/api/tenant/join', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success(res.data.message);
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    } finally { setLoadingSubmit(false); }
  };

  if (step === null) return (
    <div className="join-page">
      <div className="join-card" style={{ maxWidth: 480, width: '100%', padding: '2rem' }}>
        <PageSkeleton type="join-hostel" />
      </div>
    </div>
  );

  // Step labels for progress bar
  const stepLabels = ['Hostel Code', 'Payment', 'Your Details', 'Done'];
  const currentStepIndex = step === 1 ? 0 : step === 1.5 ? 1 : step === 2 ? 2 : 3;

  return (
    <div className="join-page">
      <div className="join-orb join-orb-1" />
      <div className="join-orb join-orb-2" />

      <div className="join-card">
        {/* Header */}
        <div className="join-header">
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <img src="/logo.png" alt="easyPG" style={{ height: 36, width: 'auto', objectFit: 'contain' }} />
          </Link>
          {(step === 1.5 || step === 2) && (
            <button onClick={() => setStep(step === 2 ? 1.5 : 1)} className="join-back-btn">
              <ArrowLeft size={16} /> Back
            </button>
          )}
        </div>

        {/* Step indicators */}
        <div className="join-steps">
          {stepLabels.map((label, i) => (
            <div key={i} className={`join-step ${currentStepIndex >= i ? 'active' : ''}`}>
              <div className="join-step-dot">{currentStepIndex > i ? '✓' : i + 1}</div>
              <span>{label}</span>
            </div>
          ))}
          <div className="join-step-line" />
        </div>

        {/* ───── STEP 1: Enter Code / Scan ───── */}
        {step === 1 && (
          <div className="join-body slide-up">
            <div className="join-icon-wrap">
              <QrCode size={28} style={{ color: 'var(--aurora-1)' }} />
            </div>
            <h2>Join Your Hostel</h2>
            <p className="join-subtitle">Enter the code your owner shared, or scan the QR code posted in the hostel.</p>

            <form onSubmit={handleVerifyCode}>
              <div className="code-input-wrap">
                <input
                  type="text"
                  className="code-input"
                  placeholder="e.g.  HST-8821"
                  value={hostelCode}
                  onChange={(e) => setHostelCode(e.target.value.toUpperCase())}
                  maxLength={10}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loadingCode}>
                {loadingCode ? (
                  <span className="pulse-opacity">
                    Verifying
                    <span className="pulsing-dot-container">
                      <span className="pulsing-dot"></span>
                      <span className="pulsing-dot"></span>
                      <span className="pulsing-dot"></span>
                    </span>
                  </span>
                ) : (<><ChevronRight size={18} /> Verify Code</>)}
              </button>
            </form>

            <div className="join-divider"><span>or</span></div>

            <button className="btn btn-secondary w-full" onClick={() => setIsScanning(true)}>
              <Camera size={18} /> Scan QR Code
            </button>
          </div>
        )}

        {/* ───── STEP 1.5: Payment Page ───── */}
        {step === 1.5 && (
          <div className="join-body slide-up" style={{ padding: 0 }}>

            {/* Header banner */}
            <div className="pay-hostel-banner">
              <div className="pay-hostel-avatar">
                {hostelName?.[0] || 'H'}
              </div>
              <div className="pay-hostel-info">
                <span className="pay-hostel-label">Paying to</span>
                <span className="pay-hostel-name">{hostelName}</span>
              </div>
              <div className="pay-hostel-check">✓</div>
            </div>

            <div className="pay-body">
              {/* Amount Card */}
              <div className="pay-amount-card">
                <div className="pay-amount-label">Admission Amount (₹)</div>
                <div className="pay-amount-input-wrap">
                  <span className="pay-rupee-sym">₹</span>
                  <input
                    type="number"
                    className="pay-amount-input"
                    placeholder="0"
                    value={admissionAmount}
                    onChange={e => setAdmissionAmount(e.target.value)}
                    min="1"
                    inputMode="numeric"
                  />
                </div>
                <p className="pay-amount-hint">Ask your hostel owner for the exact amount</p>
              </div>

              {/* What you get */}
              <div className="pay-features">
                <div className="pay-feature-row">
                  <div className="pay-feature-icon pay-feature-green">✓</div>
                  <div>
                    <div className="pay-feature-title">Instant Confirmation</div>
                    <div className="pay-feature-sub">Receipt sent immediately after payment</div>
                  </div>
                </div>
                <div className="pay-feature-row">
                  <div className="pay-feature-icon pay-feature-amber">🔒</div>
                  <div>
                    <div className="pay-feature-title">Secured by Cashfree</div>
                    <div className="pay-feature-sub">UPI · Cards · Net Banking accepted</div>
                  </div>
                </div>
                <div className="pay-feature-row">
                  <div className="pay-feature-icon pay-feature-purple">→</div>
                  <div>
                    <div className="pay-feature-title">Fill Details Next</div>
                    <div className="pay-feature-sub">Complete your profile after payment</div>
                  </div>
                </div>
              </div>

              {/* Pay Button */}
              <button
                className="pay-now-btn"
                onClick={handlePayment}
                disabled={loadingPayment || !admissionAmount || parseFloat(admissionAmount) <= 0}
                id="pay-now-btn"
              >
                {loadingPayment ? (
                  <span className="pay-btn-loading">
                    <span className="pay-spinner" />
                    Processing Payment...
                  </span>
                ) : (
                  <>
                    <span className="pay-btn-icon">💳</span>
                    Pay ₹{admissionAmount || '0'} Now
                  </>
                )}
              </button>

              <p className="pay-footer-note">
                After payment, you'll fill your details and submit the application.
              </p>
            </div>
          </div>
        )}

        {/* ───── STEP 2: Application Form ───── */}
        {step === 2 && (
          <div className="join-body slide-up">
            <div className="hostel-found-banner" style={{ background: 'rgba(52,211,153,0.1)', borderColor: 'rgba(52,211,153,0.2)' }}>
              <Sparkles size={18} style={{ color: '#34d399', flexShrink: 0 }} />
              <span>Payment done! Now joining <strong>{hostelName}</strong></span>
            </div>

            <h2 style={{ marginBottom: '.3rem' }}>Your Details</h2>
            <p className="join-subtitle">This info is shared with your hostel owner for approval.</p>

            <form onSubmit={handleSubmit}>
              {[
                { icon: <User size={16} />, label: 'Full Name',      key: 'tenantName',  type: 'text', placeholder: 'John Doe',         required: true },
                { icon: <Phone size={16} />, label: 'Phone Number',  key: 'mobile',      type: 'tel',  placeholder: '+91 9876543210',    required: true },
                { icon: <User size={16} />, label: "Father's Name",  key: 'fatherName',  type: 'text', placeholder: "Father's full name", required: true },
              ].map(({ icon, label, key, type, placeholder, required }) => (
                <div className="form-group" key={key}>
                  <label className="form-label">{icon}&nbsp;{label}</label>
                  <input type={type} className="form-control" placeholder={placeholder}
                    value={formData[key]} onChange={e => setFormData({ ...formData, [key]: e.target.value })} required={required} />
                </div>
              ))}

              <div className="form-group">
                <label className="form-label"><Home size={16} />&nbsp;Permanent Address</label>
                <textarea className="form-control" rows="2" placeholder="Street, City, State"
                  value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} required />
              </div>

              {/* Room number with auto rent lookup */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label"><Hash size={16} />&nbsp;Room No.</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 101"
                    value={formData.roomNumber}
                    onChange={e => handleRoomNumberChange(e.target.value)}
                    required
                  />
                  {/* Rent auto-display */}
                  {roomRent && (
                    <div style={{ marginTop: '.4rem', padding: '.4rem .7rem', background: 'rgba(124, 58, 237,0.1)', borderRadius: '8px', border: '1px solid rgba(124, 58, 237,0.2)', display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                      <IndianRupee size={13} style={{ color: 'var(--aurora-1)' }} />
                      <span style={{ fontSize: '.82rem', color: 'var(--aurora-1)', fontWeight: 700 }}>
                        Monthly Rent: ₹{roomRent.rent_amount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label"><Car size={16} />&nbsp;Vehicle (opt.)</label>
                  <input type="text" className="form-control" placeholder="KA01AB1234"
                    value={formData.vehicleNumber} onChange={e => setFormData({ ...formData, vehicleNumber: e.target.value })} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label"><Calendar size={16} />&nbsp;Expected Joining Date</label>
                <input type="date" className="form-control"
                  value={formData.admissionDate} onChange={e => setFormData({ ...formData, admissionDate: e.target.value })} required />
                {formData.admissionDate && (
                  <p style={{ fontSize: '.75rem', color: 'var(--text-ghost)', marginTop: '.3rem' }}>
                    💡 Your rent will be due on the <strong>{new Date(formData.admissionDate).getDate()}</strong> of every month.
                  </p>
                )}
              </div>

              {/* Aadhaar upload */}
              <div className="form-group">
                <label className="form-label"><Upload size={16} />&nbsp;Aadhaar Card (PDF / Image)</label>
                <label className="file-upload-zone">
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setFormData({ ...formData, aadhaarFile: e.target.files[0] })} required style={{ display: 'none' }} />
                  {formData.aadhaarFile ? (
                    <span style={{ color: 'var(--success)', fontWeight: 600 }}>✓ {formData.aadhaarFile.name}</span>
                  ) : (
                    <>
                      <Upload size={22} style={{ color: 'var(--text-dim)', marginBottom: '.4rem' }} />
                      <span style={{ fontSize: '.85rem', color: 'var(--text-dim)' }}>Tap to upload Aadhaar</span>
                      <span style={{ fontSize: '.75rem', color: 'var(--text-ghost)' }}>PDF, JPG, PNG supported</span>
                    </>
                  )}
                </label>
              </div>

              <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loadingSubmit} style={{ marginTop: '.5rem' }}>
                {loadingSubmit ? (
                  <span className="pulse-opacity">
                    Submitting
                    <span className="pulsing-dot-container">
                      <span className="pulsing-dot"></span>
                      <span className="pulsing-dot"></span>
                      <span className="pulsing-dot"></span>
                    </span>
                  </span>
                ) : (<><FileText size={18} /> Submit Application</>)}
              </button>
            </form>
          </div>
        )}

        {/* ───── STEP 3: Pending ───── */}
        {step === 3 && (
          <div className="join-body text-center slide-up" style={{ paddingTop: '1rem' }}>
            <div className="pending-icon-wrap">
              <CheckCircle2 size={44} style={{ color: 'var(--success)' }} />
            </div>
            <h2 style={{ color: 'var(--success)', marginBottom: '.5rem' }}>Application Submitted!</h2>
            <p style={{ color: 'var(--text-dim)', marginBottom: '2rem', fontSize: '.92rem', lineHeight: 1.6 }}>
              Your details have been sent to the owner.<br />
              You'll get access once they approve your application.
            </p>

            <div style={{ background: 'rgba(5,150,105,0.08)', border: '1px solid rgba(5,150,105,0.2)', borderRadius: 'var(--r-lg)', padding: '1.25rem', marginBottom: '2rem', textAlign: 'left' }}>
              <p style={{ fontSize: '.85rem', color: 'var(--text-dim)', marginBottom: '.5rem' }}>⏳ What happens next?</p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                {['Owner reviews your application', 'You get notified on approval', 'Dashboard unlocks automatically'].map((t, i) => (
                  <li key={i} style={{ fontSize: '.85rem', color: 'var(--text-bright)', display: 'flex', gap: '.5rem' }}>
                    <span style={{ color: 'var(--success)' }}>✓</span> {t}
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ display: 'flex', gap: '.75rem' }}>
              <button className="btn btn-primary flex-1" onClick={async () => {
                const loadingToast = toast.loading("Checking status...");
                try {
                  const res = await api.get('/api/tenant/dashboard');
                  const st = res.data?.tenant?.status;
                  if (st === 'active' || st === 'vacating') {
                    toast.success("Application approved!", { id: loadingToast });
                    navigate('/tenant/dashboard', { replace: true });
                  } else if (st === 'pending') {
                    toast.success("Still waiting for owner's approval.", { id: loadingToast });
                  } else {
                    toast.error("Application not found or rejected.", { id: loadingToast });
                    setStep(1);
                  }
                } catch {
                  toast.error("Failed to check status.", { id: loadingToast });
                }
              }}>
                <RefreshCw size={15} /> Check Status
              </button>
              <button className="btn btn-ghost flex-1" onClick={logoutContext} style={{ color: 'var(--danger)', borderColor: 'rgba(220,38,38,0.25)', border: '1px solid' }}>
                Logout
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ───── QR Scanner Modal ───── */}
      {isScanning && (
        <div className="modal-backdrop fade-in" onClick={stopScanner}>
          <div className="modal-card slide-up" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <button onClick={stopScanner} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
              <XCircle size={22} />
            </button>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.4rem' }}>
              <Camera size={20} style={{ color: 'var(--aurora-1)' }} /> Scan Hostel QR
            </h3>
            <p style={{ color: 'var(--text-dim)', fontSize: '.85rem', marginBottom: '1.25rem' }}>
              Point your camera at the hostel QR code.
            </p>
            <div id="reader" style={{ width: '100%', overflow: 'hidden', borderRadius: 'var(--r-md)', background: '#000', minHeight: 260 }} />
            <button className="btn btn-secondary w-full" style={{ marginTop: '1rem' }} onClick={stopScanner}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ───── UPI Payment Modal ───── */}
      {showUpiModal && (
        <div className="modal-backdrop fade-in" onClick={() => setShowUpiModal(false)}>
          <div className="modal-card slide-up" onClick={e => e.stopPropagation()}
            style={{ maxWidth: 440, padding: '1.75rem', borderRadius: 20 }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <p style={{ fontSize: '.78rem', color: 'var(--text-ghost)', marginBottom: '.2rem' }}>Paying to</p>
                <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{hostelName}</h3>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '.78rem', color: 'var(--text-ghost)', marginBottom: '.2rem' }}>Amount</p>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--aurora-1)' }}>₹{parseFloat(admissionAmount).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Tab switcher */}
            <div style={{ display: 'flex', background: 'var(--bg-elevated)', borderRadius: 12, padding: 4, marginBottom: '1.25rem', gap: 4 }}>
              {[['upi', '📱 UPI'], ['card', '💳 Card']].map(([tab, label]) => (
                <button key={tab} onClick={() => setPayTab(tab)} style={{
                  flex: 1, padding: '.55rem', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: '.88rem', fontWeight: 600,
                  background: payTab === tab ? 'var(--bg-surface)' : 'transparent',
                  color: payTab === tab ? 'var(--text-bright)' : 'var(--text-ghost)',
                  boxShadow: payTab === tab ? '0 1px 4px rgba(0,0,0,0.15)' : 'none',
                  transition: 'all 180ms',
                }}>{label}</button>
              ))}
            </div>

            {/* UPI Tab */}
            {payTab === 'upi' && (
              <div>
                {/* UPI App Icons */}
                <p style={{ fontSize: '.8rem', color: 'var(--text-dim)', marginBottom: '.75rem', fontWeight: 600 }}>
                  Select UPI App
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '.6rem', marginBottom: '1.25rem' }}>
                  {[
                    { id: 'phonepe', label: 'PhonePe', bg: '#5f259f', emoji: '📲', short: 'PP' },
                    { id: 'gpay',    label: 'GPay',    bg: '#1a73e8', emoji: '🔵', short: 'G' },
                    { id: 'paytm',   label: 'Paytm',   bg: '#00b9f1', emoji: '💠', short: 'PT' },
                    { id: 'bhim',    label: 'BHIM',    bg: '#ff6b00', emoji: '🟠', short: 'BI' },
                    { id: 'amazon',  label: 'Amazon',  bg: '#ff9900', emoji: '🟡', short: 'AP' },
                  ].map(app => (
                    <button key={app.id} onClick={() => { setSelectedUpiApp(app.id); setUpiId(''); }}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.35rem',
                        padding: '.6rem .3rem', borderRadius: 14, border: `2px solid ${selectedUpiApp === app.id ? app.bg : 'var(--border-muted)'}`,
                        background: selectedUpiApp === app.id ? `${app.bg}18` : 'var(--bg-elevated)',
                        cursor: 'pointer', transition: 'all 180ms',
                      }}>
                      {/* App circle icon */}
                      <div style={{
                        width: 40, height: 40, borderRadius: '50%', background: app.bg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '.75rem', fontWeight: 800, color: '#fff', letterSpacing: '-.02em',
                        boxShadow: selectedUpiApp === app.id ? `0 4px 12px ${app.bg}66` : 'none',
                        transition: 'box-shadow 180ms',
                      }}>{app.short}</div>
                      <span style={{ fontSize: '.68rem', color: 'var(--text-dim)', fontWeight: 600 }}>{app.label}</span>
                    </button>
                  ))}
                </div>

                {/* Divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', margin: '1rem 0' }}>
                  <div style={{ flex: 1, height: 1, background: 'var(--border-muted)' }} />
                  <span style={{ fontSize: '.78rem', color: 'var(--text-ghost)' }}>or enter UPI ID</span>
                  <div style={{ flex: 1, height: 1, background: 'var(--border-muted)' }} />
                </div>

                <div style={{ position: 'relative' }}>
                  <input
                    className="form-control"
                    placeholder="yourname@upi"
                    value={upiId}
                    onChange={e => { setUpiId(e.target.value); setSelectedUpiApp(null); }}
                    style={{ paddingRight: '3.5rem' }}
                  />
                  <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', fontSize: '.75rem', color: 'var(--text-ghost)' }}>@upi</span>
                </div>
              </div>
            )}

            {/* Card Tab */}
            {payTab === 'card' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.9rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '.8rem' }}>Card Number</label>
                  <input className="form-control" placeholder="1234 5678 9012 3456" maxLength={19}
                    value={cardData.number}
                    onChange={e => {
                      const v = e.target.value.replace(/\D/g, '').slice(0, 16);
                      setCardData(d => ({ ...d, number: v.replace(/(.{4})/g, '$1 ').trim() }));
                    }}
                    style={{ letterSpacing: '0.1em', fontFamily: 'monospace', fontSize: '.95rem' }}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '.8rem' }}>Name on Card</label>
                  <input className="form-control" placeholder="JOHN DOE"
                    value={cardData.name}
                    onChange={e => setCardData(d => ({ ...d, name: e.target.value.toUpperCase() }))}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '.8rem' }}>Expiry</label>
                    <input className="form-control" placeholder="MM/YY" maxLength={5}
                      value={cardData.expiry}
                      onChange={e => {
                        let v = e.target.value.replace(/\D/g, '').slice(0, 4);
                        if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2);
                        setCardData(d => ({ ...d, expiry: v }));
                      }}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '.8rem' }}>CVV</label>
                    <input className="form-control" placeholder="•••" maxLength={4} type="password"
                      value={cardData.cvv}
                      onChange={e => setCardData(d => ({ ...d, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Pay Now button */}
            <button
              className="btn btn-primary w-full btn-lg"
              style={{ marginTop: '1.5rem', fontSize: '1rem' }}
              onClick={confirmPayment}
              disabled={confirmingPay}
              id="confirm-pay-btn"
            >
              {confirmingPay ? (
                <span className="pulse-opacity">
                  Processing
                  <span className="pulsing-dot-container">
                    <span className="pulsing-dot"></span>
                    <span className="pulsing-dot"></span>
                    <span className="pulsing-dot"></span>
                  </span>
                </span>
              ) : (
                <>
                    <ShieldCheck size={18} />
                    Pay ₹{parseFloat(admissionAmount || 0).toLocaleString('en-IN')} Securely
                  </>
              )}
            </button>

            {/* Secure notice */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.4rem', marginTop: '.85rem' }}>
              <ShieldCheck size={13} style={{ color: '#34d399' }} />
              <span style={{ fontSize: '.74rem', color: 'var(--text-ghost)' }}>256-bit SSL Encrypted · PCI DSS Compliant</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JoinHostel;
