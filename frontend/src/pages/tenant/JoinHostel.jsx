import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { QrCode, FileText, CheckCircle, Loader2, Home, XCircle, Camera } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import toast from 'react-hot-toast';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import './TenantDashboard.css';

const JoinHostel = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(null); // null = checking status (shows spinner)
  const [hostelCode, setHostelCode] = useState('');
  const [hostelName, setHostelName] = useState('');
  const [loadingCode, setLoadingCode] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  // QR Scanner States
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef(null);
  const { user, logoutContext } = useAuth();
  const [formData, setFormData] = useState({
    tenantName: user?.name || '',
    fatherName: '',
    address: '',
    mobile: '',
    roomNumber: '',
    vehicleNumber: '',
    admissionDate: new Date().toISOString().split('T')[0],
    aadhaarFile: null
  });

  useEffect(() => {
    // Check for auto-fill from URL
    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    if (code) {
      setHostelCode(code.toUpperCase());
      toast.success("Hostel Code Applied!");
    }

    const checkExistingApplication = async () => {
      try {
        const res = await api.get('/api/tenant/dashboard');
        if (res.data?.tenant) {
           if (res.data.tenant.status === 'vacated' || res.data.tenant.status === 'new' || res.data.tenant.status === 'rejected') {
               setStep(1); // Show step 1 to join a new hostel
           } else if (res.data.tenant.status === 'pending') {
               setStep(3); // Show pending approval UI
           } else {
               navigate('/tenant/dashboard'); // Active/vacating → go to dashboard
               return; // Don't call setStep, we're navigating away
           }
        } else {
          setStep(1);
        }
      } catch (err) {
        // Normal if they haven't applied yet (404)
        setStep(1);
      }
    };
    checkExistingApplication();

    // Cleanup scanner on unmount
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [navigate, location.search]);

  const startScanner = async () => {
    setIsScanning(true);
    // Modal will render, and inside the modal logic we will handle the start
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
      } catch (err) {
        console.error("Stop failed", err);
      }
    }
    setIsScanning(false);
  };

  // Dedicated effect to handle scanner lifecycle when isScanning changes
  useEffect(() => {
    let html5QrCode = null;

    if (isScanning) {
      // Small delay to ensure the "reader" div is rendered in the DOM
      const timer = setTimeout(async () => {
        try {
          const element = document.getElementById("reader");
          if (!element) {
            console.error("Reader element not found");
            setIsScanning(false);
            return;
          }

          html5QrCode = new Html5Qrcode("reader");
          scannerRef.current = html5QrCode;

          await html5QrCode.start(
            { facingMode: "environment" },
            { fps: 15, qrbox: { width: 250, height: 250 } },
            (decodedText) => {
              let finalCode = decodedText;
              if (decodedText.includes('code=')) {
                try {
                  const url = new URL(decodedText);
                  finalCode = url.searchParams.get('code') || decodedText;
                } catch (e) {
                  // Not a URL, use raw
                }
              }
              const uppercaseScanned = finalCode.toUpperCase();
              setHostelCode(uppercaseScanned);
              stopScanner();
              handleVerifyCode(null, uppercaseScanned);
            },
            (errorMessage) => { /* quiet scanning */ }
          );
        } catch (err) {
          console.error("Scanner start error:", err);
          toast.error("Camera error: Please ensure camera permissions are granted.");
          setIsScanning(false);
        }
      }, 500); // Increased delay for safety

      return () => {
        clearTimeout(timer);
        if (html5QrCode && html5QrCode.isScanning) {
          html5QrCode.stop().catch(console.error);
        }
      };
    }
  }, [isScanning]);

  const handleVerifyCode = async (e, directCode = null) => {
    if (e) e.preventDefault();
    const codeToVerify = directCode || hostelCode;

    if(!codeToVerify || codeToVerify.trim().length < 4) {
      if (!directCode) toast.error("Invalid Hostel Code");
      return;
    }

    setLoadingCode(true);
    try {
      const res = await api.get(`/api/tenant/verify-hostel/${codeToVerify}`);
      setHostelName(res.data.name);
      toast.success(`Hostel Found: ${res.data.name}`);
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid Hostel Code or Not Found");
    } finally {
      setLoadingCode(false);
    }
  };

  const handleFileChange = (e) => {
    setFormData({...formData, aadhaarFile: e.target.files[0]});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Instead of actual multipart/form-data for the mock frontend,
    // we'll simulate the successful submission.
    
    const submitData = new FormData();
    submitData.append('hostelCode', hostelCode);
    submitData.append('tenantName', formData.tenantName);
    submitData.append('fatherName', formData.fatherName);
    submitData.append('address', formData.address);
    submitData.append('mobile', formData.mobile);
    submitData.append('roomNumber', formData.roomNumber);
    submitData.append('vehicleNumber', formData.vehicleNumber);
    submitData.append('admissionDate', formData.admissionDate);
    if(formData.aadhaarFile) {
        submitData.append('aadhaar', formData.aadhaarFile);
    }

    setLoadingSubmit(true);
    try {
      const res = await api.post('/api/tenant/join', submitData, {
          headers: { 
              'Content-Type': 'multipart/form-data'
          }
      });
      
      toast.success(res.data.message);
      setStep(3);

    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit details");
    } finally {
      setLoadingSubmit(false);
    }
  };

  // While checking status, show full-screen spinner to prevent flash
  if (step === null) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 size={48} className="animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="app-container" style={{alignItems: 'center', justifyContent: 'center'}}>
      <div className="glass-panel p-8" style={{width: '100%', maxWidth: '500px'}}>
        {/* Logo link at the top */}
        <Link to="/" className="flex items-center gap-3 mb-6" style={{textDecoration: 'none'}}>
          <img src="https://i.pinimg.com/736x/1d/31/58/1d315807fbdbf074612825fcdaa7c9b8.jpg" alt="easyPG Logo" style={{ height: '30px', borderRadius: '4px' }} />
          <span className="text-gradient" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.2rem' }}>easyPG</span>
        </Link>
        
        {step === 1 && (
          <div className="slide-up text-center">
            <div className="icon-wrapper mx-auto mb-4" style={{width: '64px', height: '64px'}}>
              <QrCode size={32} />
            </div>
            <h2>Join Hostel</h2>
            <p className="text-muted mb-6">Enter the Code provided by your owner or scan the QR Code.</p>
            
            <form onSubmit={handleVerifyCode}>
              <div className="form-group">
                <input 
                  type="text" 
                  className="form-control text-center" 
                  placeholder="e.g. HST-8821"
                  value={hostelCode}
                  onChange={(e) => setHostelCode(e.target.value.toUpperCase())}
                  style={{fontSize: '1.5rem', letterSpacing: '2px'}}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary w-full btn-lg mt-4" disabled={loadingCode}>
                {loadingCode ? <Loader2 size={18} className="animate-spin" /> : "Verify Code"}
              </button>
              
              <div className="mt-4 text-muted">OR</div>
              
              <button type="button" className="btn btn-secondary w-full mt-4" onClick={startScanner}>
                <QrCode size={18} /> Scan QR Code
              </button>
            </form>
          </div>
        )}

        {/* QR Scanner Modal Overlay */}
        {isScanning && (
          <div className="flex items-center justify-center p-4 fade-in" style={{ background: 'rgba(0,0,0,0.9)', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}>
            <div className="glass-panel p-6 w-full max-w-md slide-up text-center" style={{ position: 'relative', background: 'var(--bg-secondary)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <button
                onClick={stopScanner}
                style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', zIndex: 10 }}
              >
                <XCircle size={28} />
              </button>

              <h3 className="mb-2 flex items-center justify-center gap-2">
                <Camera size={20} className="text-accent" /> Scan Hostel QR
              </h3>
              <p className="text-muted mb-6 text-sm">Align the QR code within the frame to scan.</p>
              
              <div id="reader" style={{ width: '100%', overflow: 'hidden', borderRadius: '12px', background: '#000' }}></div>
              
              <button className="btn w-full mt-6" onClick={stopScanner}>
                Cancel Scanning
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="slide-up">
            <h2 className="mb-2">Join {hostelName}</h2>
            <p className="text-muted mb-6">Fill in your details for admin approval.</p>
            
            <form onSubmit={handleSubmit} className="auth-form flex-col gap-4">
              <div className="grid gap-4" style={{gridTemplateColumns: '1fr 1fr'}}>
                <div className="form-group mb-0">
                  <label className="form-label">Full Name</label>
                  <input type="text" className="form-control" value={formData.tenantName} onChange={e => setFormData({...formData, tenantName: e.target.value})} required/>
                </div>
                <div className="form-group mb-0">
                  <label className="form-label">Phone Number</label>
                  <input type="tel" className="form-control" onChange={e => setFormData({...formData, mobile: e.target.value})} required/>
                </div>
              </div>
              
              <div className="form-group mb-0">
                <label className="form-label">Father's Name</label>
                <input type="text" className="form-control" onChange={e => setFormData({...formData, fatherName: e.target.value})} required/>
              </div>
              
              <div className="form-group mb-0">
                <label className="form-label">Permanent Address</label>
                <textarea className="form-control" rows="2" onChange={e => setFormData({...formData, address: e.target.value})} required></textarea>
              </div>

              <div className="grid gap-4" style={{gridTemplateColumns: '1fr 1fr'}}>
                <div className="form-group mb-0">
                  <label className="form-label">Allotted Room</label>
                  <input type="text" className="form-control" placeholder="e.g. 101" onChange={e => setFormData({...formData, roomNumber: e.target.value})} required/>
                </div>
                <div className="form-group mb-0">
                 <label className="form-label">Vehicle No (optional)</label>
                  <input type="text" className="form-control" onChange={e => setFormData({...formData, vehicleNumber: e.target.value})}/>
                </div>
              </div>

              <div className="form-group mb-0 mt-2">
                 <label className="form-label">Expected Joining Date</label>
                 <input 
                    type="date" 
                    className="form-control" 
                    value={formData.admissionDate}
                    onChange={e => setFormData({...formData, admissionDate: e.target.value})} 
                    required
                 />
              </div>

              <div className="form-group mb-0 mt-2">
                <label className="form-label">Upload Aadhaar (PDF/JPG)</label>
                <input 
                  type="file" 
                  className="form-control" 
                  style={{padding: '0.5rem'}}
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary w-full mt-4" disabled={loadingSubmit}>
                {loadingSubmit ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />} 
                {loadingSubmit ? 'Submitting...' : 'Submit Application'}
              </button>
            </form>
          </div>
        )}

        {step === 3 && (
          <div className="slide-up text-center py-6">
            <CheckCircle size={64} color="var(--success)" className="mx-auto mb-4" />
            <h2 style={{color: 'var(--success)'}}>Pending Approval</h2>
            <p className="text-muted mt-2">
              Your details have been submitted. You will gain dashboard access once the owner approves your application.
            </p>
            <div className="flex gap-4 mt-8">
                <button 
                  className="btn btn-primary flex-1" 
                  onClick={() => window.location.reload()}
                >
                  Refresh Status
                </button>
                <button 
                  className="btn btn-secondary flex-1 text-danger" 
                  style={{border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--danger)'}}
                  onClick={logoutContext}
                >
                  Logout
                </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default JoinHostel;


