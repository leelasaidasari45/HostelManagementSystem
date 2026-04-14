import React, { useState } from 'react';
import { Home, CreditCard, MessageSquare, IndianRupee, CheckCircle2, LayoutDashboard, LogOut, ArrowRightCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../../components/ThemeToggle';
import './TenantDashboard.css';

const TenantDashboard = () => {
  const navigate = useNavigate();
  const [isPaying, setIsPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [amount] = useState(5000); // Mock rent amount
  const month = "April 2026";

  const [activeTab, _setActiveTab] = useState(() => sessionStorage.getItem('tenantActiveTab') || 'dashboard');
  const setActiveTab = (tab) => {
      _setActiveTab(tab);
      sessionStorage.setItem('tenantActiveTab', tab);
  };
  const [complaintText, setComplaintText] = useState('');
  const [complaintName, setComplaintName] = useState('');
  const [complaintRoom, setComplaintRoom] = useState('');
  
  const [vacateDate, setVacateDate] = useState('');
  const [vacateReason, setVacateReason] = useState('');

  const [loadingComplaint, setLoadingComplaint] = useState(false);
  const [loadingVacate, setLoadingVacate] = useState(false);

  const [dashData, setDashData] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const { logoutContext } = useAuth();

  // Check for Paytm callback result in URL params on load
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');
    if (paymentStatus === 'success') {
      const txn = params.get('txn');
      toast.success(`Payment successful! Txn ID: ${txn}`);
      setPaymentSuccess(true);
      // Clean URL without reload
      window.history.replaceState({}, '', '/tenant/dashboard');
    } else if (paymentStatus === 'failed') {
      const msg = params.get('msg') || 'Payment failed';
      toast.error(msg);
      window.history.replaceState({}, '', '/tenant/dashboard');
    } else if (paymentStatus === 'error') {
      toast.error('Payment encountered an error. Please try again.');
      window.history.replaceState({}, '', '/tenant/dashboard');
    }
  }, []);

  React.useEffect(() => {
    const fetchDash = async () => {
       try {
           const res = await api.get('/api/tenant/dashboard');
           
           if (res.data.tenant.status === 'pending') {
               navigate('/tenant/join'); // Send them back to pending screen
               return;
           }
           if (res.data.tenant.status === 'new') {
               navigate('/tenant/join'); // Send entirely new tenants to join without strange vacated toasts
               return;
           }
           if (res.data.tenant.status === 'vacated' || res.data.tenant.status === 'rejected') {
               const isRejected = res.data.tenant.status === 'rejected';
               toast(isRejected ? 'Your application was not approved. You can try joining another hostel.' : 'Your previous stay has ended. You can now join a new hostel.', {
                   icon: isRejected ? '❌' : 'ℹ️',
                   style: { background: 'var(--bg-glass)', border: '1px solid var(--accent-primary)', color: '#fff' }
               });
               navigate('/tenant/join');
               return;
           }
           
           setDashData(res.data);
       } catch (err) {
           console.error("Failed to load dashboard info");
           if (err.response?.status === 404) {
               // Record was deleted or hard-evicted, redirect to join new hostel
               navigate('/tenant/join');
           }
       } finally {
           setLoadingConfig(false);
       }
    };
    fetchDash();
  }, [navigate]);

  const handlePayment = async () => {
    setIsPaying(true);
    try {
      // Step 1: Get txnToken from our backend
      const res = await api.post('/api/paytm/initiate', { amount, month });
      const { txnToken, orderId, mid } = res.data;

      // Step 2: Load Paytm JS checkout script dynamically
      const script = document.createElement('script');
      script.src = `https://securegw-stage.paytm.in/merchantpgpui/checkoutjs/merchants/${mid}.js`;
      script.crossOrigin = 'anonymous';
      script.type = 'application/javascript';

      script.onload = () => {
        const config = {
          root: '',
          style: { bodyBackgroundColor: '#f8fafc', bodyColor: '#0f172a', themeBackgroundColor: '#4f46e5', themeColor: '#ffffff', headerBackgroundColor: '#4f46e5', headerColor: '#ffffff', errorColor: '#ef4444', successColor: '#10b981' },
          data: { orderId, token: txnToken, tokenType: 'TXN_TOKEN', amount: String(amount) },
          payMode: { labels: {}, savedCardsAndWallets: true, order: ['CC', 'DC', 'NB', 'UPI', 'PPBL', 'PPI', 'BALANCE'] },
          website: 'WEBSTAGING',
          flow: 'DEFAULT',
          merchant: { mid, redirect: true },
          handler: {
            notifyMerchant: (eventName, data) => {
              if (eventName === 'APP_CLOSED') setIsPaying(false);
            }
          }
        };
        if (window.Paytm && window.Paytm.CheckoutJS) {
          window.Paytm.CheckoutJS.onLoad(() => {
            window.Paytm.CheckoutJS.init(config).then(() => {
              window.Paytm.CheckoutJS.invoke();
            }).catch(err => {
              toast.error('Paytm checkout failed to initialize.');
              setIsPaying(false);
            });
          });
        }
      };

      script.onerror = () => {
        toast.error('Failed to load payment gateway. Check your internet connection.');
        setIsPaying(false);
      };

      document.body.appendChild(script);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to initiate payment');
      setIsPaying(false);
    }
  };

  const submitComplaint = async (e) => {
    e.preventDefault();
    if (!complaintText) return;
    
    setLoadingComplaint(true);
    try {
        await api.post('/api/tenant/complaints', {
          issue: complaintText,
          tenantName: complaintName || dashData?.tenant?.name,
          roomNumber: complaintRoom || dashData?.tenant?.roomNumber,
        });
        toast.success('Complaint submitted to owner!');
        setComplaintText('');
        setComplaintName('');
        setComplaintRoom('');
    } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to submit complaint');
    } finally {
        setLoadingComplaint(false);
    }
  };

  const submitVacate = async (e) => {
    e.preventDefault();
    if(!vacateDate || !vacateReason) return;

    setLoadingVacate(true);
    try {
      await api.post('/api/tenant/vacate', { vacateDate, vacateReason });
      toast.success('Vacate notice submitted securely.');
      // Refresh context naturally
      const res = await api.get('/api/tenant/dashboard');
      setDashData(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit vacate notice');
    } finally {
      setLoadingVacate(false);
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar glass-panel slide-up">
        <Link to="/" className="logo flex items-center gap-3 mb-10" style={{ textDecoration: 'none' }}>
          <img src="https://i.pinimg.com/736x/1d/31/58/1d315807fbdbf074612825fcdaa7c9b8.jpg" alt="easyPG Logo" style={{ height: '36px', borderRadius: '4px' }} />
          <h2 className="logo-text" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>easyPG</h2>
        </Link>
        
        <nav className="sidebar-nav flex-col gap-2">
          <button onClick={() => setActiveTab('dashboard')} className={`nav-item ${activeTab === 'dashboard' ? 'active':''}`} style={{border:'none', background:'transparent', width:'100%', textAlign:'left', fontFamily:'inherit', fontSize:'1rem'}}><LayoutDashboard size={20} /> Home</button>
          <button onClick={() => setActiveTab('rent')} className={`nav-item ${activeTab === 'rent' ? 'active':''}`} style={{border:'none', background:'transparent', width:'100%', textAlign:'left', fontFamily:'inherit', fontSize:'1rem'}}><CreditCard size={20} /> Rent</button>
          <button onClick={() => setActiveTab('complaints')} className={`nav-item ${activeTab === 'complaints' ? 'active':''}`} style={{border:'none', background:'transparent', width:'100%', textAlign:'left', fontFamily:'inherit', fontSize:'1rem'}}><MessageSquare size={20} /> Issue</button>
          <button onClick={() => setActiveTab('vacate')} className={`nav-item ${activeTab === 'vacate' ? 'active':''}`} style={{border:'none', background:'transparent', width:'100%', textAlign:'left', fontFamily:'inherit', fontSize:'1rem'}}><ArrowRightCircle size={20} /> Vacate</button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="dashboard-content fade-in">
        <header className="dashboard-header flex items-center justify-between glass-panel mb-8">
          <div>
            <h1>{activeTab === 'dashboard' ? 'Overview' : activeTab === 'rent' ? 'Rent & Dues' : activeTab === 'complaints' ? 'Help & Support' : 'Notice to Vacate'}</h1>
            <p className="text-muted">
              {activeTab === 'dashboard' ? (
                <>Welcome to <span className="font-bold text-accent" style={{color: 'var(--accent-primary)'}}>{dashData?.hostelName || 'your hostel'}</span></>
              ) : activeTab === 'rent' ? (
                'Manage your monthly payments securely'
              ) : activeTab === 'complaints' ? (
                'Submit issues directly to the owner'
              ) : (
                'Submit your formal exit notice to the owner'
              )}
            </p>
          </div>
          <div className="header-actions flex items-center gap-3">
            <ThemeToggle />
            <button onClick={logoutContext} className="header-logout-btn">
              <LogOut size={18} /> Logout
            </button>
          </div>
        </header>

        {loadingConfig ? (
           <div className="flex justify-center items-center h-64">
             <Loader2 size={48} className="animate-spin" style={{color: 'var(--accent-primary)'}} />
           </div>
        ) : activeTab === 'dashboard' ? (
           <div className="grid gap-6 slide-up" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'}}>
               <div className="glass-panel p-6">
                   <h3 className="mb-4">Notice Board</h3>
                    {dashData?.notices?.length > 0 ? (
                        <ul className="flex flex-col gap-4">
                            {dashData.notices.map(n => (
                                <li key={n._id} className="p-4 rounded-lg slide-up" style={{ 
                                  background: 'rgba(255,255,255,0.03)',
                                  border: '1px solid rgba(255,255,255,0.05)',
                                  borderLeft: '4px solid var(--accent-primary)'
                                }}>
                                    <h4 className="font-bold mb-2 text-accent" style={{ color: 'var(--accent-primary)', fontSize: '1rem' }}>{n.title}</h4>
                                    <p className="text-sm text-muted" style={{ lineHeight: '1.5' }}>{n.message}</p>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-muted">No active notices.</p>}
               </div>
               
               <div className="glass-panel p-6">
                   <h3 className="mb-4">Today's Menu ({dashData?.menu?.day || 'N/A'})</h3>
                   {dashData?.menu ? (
                       <div className="grid gap-2">
                           <div className="p-2 border-b border-glass"><strong className="text-muted w-24 inline-block">Breakfast:</strong> {dashData.menu.breakfast}</div>
                           <div className="p-2 border-b border-glass"><strong className="text-muted w-24 inline-block">Lunch:</strong> {dashData.menu.lunch}</div>
                           <div className="p-2 border-b border-glass"><strong className="text-muted w-24 inline-block">Snacks:</strong> {dashData.menu.snacks}</div>
                           <div className="p-2"><strong className="text-muted w-24 inline-block">Dinner:</strong> {dashData.menu.dinner}</div>
                       </div>
                   ) : <p className="text-muted">Menu not updated for today.</p>}
               </div>

               <div className="glass-panel p-6 mt-6">
                   <Link to="/" className="flex items-center gap-3 mb-6" style={{textDecoration: 'none'}}>
                     <img src="https://i.pinimg.com/736x/1d/31/58/1d315807fbdbf074612825fcdaa7c9b8.jpg" alt="easyPG Logo" style={{ height: '30px', borderRadius: '4px' }} />
                     <span className="text-gradient" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.2rem' }}>easyPG</span>
                   </Link>
                   <ul className="flex flex-col gap-4 text-sm text-muted">
                       <li className="flex gap-3 items-start">
                         <span className="text-accent">•</span> 
                         <span><strong>Rent Payment:</strong> Must be paid by the 5th of every month to avoid late fees.</span>
                       </li>
                       <li className="flex gap-3 items-start">
                         <span className="text-accent">•</span> 
                         <span><strong>Notice Period:</strong> A minimum 10-day notice is required before vacating.</span>
                       </li>
                       <li className="flex gap-3 items-start">
                         <span className="text-accent">•</span> 
                         <span><strong>Cleanliness:</strong> Keep common areas tidy and dispose of waste in designated bins.</span>
                       </li>
                       <li className="flex gap-3 items-start">
                         <span className="text-accent">•</span> 
                         <span><strong>Quiet Hours:</strong> Respect silence between 10:00 PM and 7:00 AM.</span>
                       </li>
                       <li className="flex gap-3 items-start">
                         <span className="text-accent">•</span> 
                         <span><strong>Power Saving:</strong> Turn off lights and fans when leaving your room.</span>
                       </li>
                       <li className="flex gap-3 items-start">
                         <span className="text-accent">•</span> 
                         <span><strong>Safety:</strong> Illegal substances and smoking are strictly prohibited.</span>
                       </li>
                   </ul>
               </div>
           </div>
        ) : activeTab === 'rent' ? (
        <div className="payment-module glass-panel flex-col items-center justify-center p-8 text-center" style={{maxWidth: '500px', margin: '0 auto'}}>
          <div className="icon-wrapper mb-4" style={{width: '64px', height: '64px'}}>
            <IndianRupee size={32} />
          </div>
          
          <h2 className="mb-2">Due Rent: {month}</h2>
          
          {paymentSuccess ? (
            <div className="success-state slide-up mt-4">
              <CheckCircle2 size={48} color="var(--success)" className="mb-4 mx-auto" />
              <h3 style={{color: 'var(--success)'}}>Payment Completed</h3>
              <p className="text-muted">Receipt sent to your registered WhatsApp.</p>
            </div>
          ) : (
            <>
              <h1 className="payment-amount text-gradient my-4">₹ {amount}</h1>
              <p className="text-muted mb-6">Payment is securely processed via <strong>Paytm</strong>.</p>
              
              <button 
                className="btn btn-primary w-full btn-lg" 
                onClick={handlePayment}
                disabled={isPaying}
              >
                {isPaying ? <Loader2 size={18} className="animate-spin inline mr-2" /> : null}
                {isPaying ? 'Processing...' : `Pay ₹ ${amount} Now`}
              </button>
            </>
          )}
        </div>
        ) : activeTab === 'complaints' ? (
          <div className="glass-panel p-8 slide-up" style={{maxWidth: '600px'}}>
             <h3 className="mb-4">Log an Issue</h3>
             <form onSubmit={submitComplaint}>
                <div className="grid gap-3" style={{gridTemplateColumns: '1fr 1fr', marginBottom: '0.75rem'}}>
                  <div className="form-group" style={{marginBottom: 0}}>
                    <label className="form-label">Your Name</label>
                    <input
                      className="form-control"
                      placeholder={dashData?.tenant?.name || 'Full name'}
                      value={complaintName}
                      onChange={(e) => setComplaintName(e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{marginBottom: 0}}>
                    <label className="form-label">Room Number</label>
                    <input
                      className="form-control"
                      placeholder={dashData?.tenant?.roomNumber || 'e.g. 101'}
                      value={complaintRoom}
                      onChange={(e) => setComplaintRoom(e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-group">
                   <label className="form-label">Description of Issue</label>
                   <textarea 
                     className="form-control" 
                     rows="5" 
                     placeholder="e.g. AC is not cooling properly in Room 101."
                     value={complaintText}
                     onChange={(e) => setComplaintText(e.target.value)}
                     required
                   ></textarea>
                </div>
                <button type="submit" className="btn btn-danger w-full mt-2" disabled={loadingComplaint}>
                  {loadingComplaint ? <Loader2 size={18} className="animate-spin inline mr-2" /> : null}
                  {loadingComplaint ? "Submitting..." : "Submit Complaint"}
                </button>
             </form>
          </div>
        ) : (
          <div className="glass-panel p-8 slide-up" style={{maxWidth: '600px'}}>
             {dashData?.tenant?.status === 'vacating' ? (
                <div className="text-center py-6">
                   <CheckCircle2 size={64} className="mx-auto mb-4" style={{color: 'var(--warning)'}} />
                   <h2 style={{color: 'var(--warning)'}}>Vacate Notice Active</h2>
                   <p className="text-muted mt-2">
                     You have securely scheduled to vacate on <strong>{new Date(dashData.tenant.vacateDate).toLocaleDateString()}</strong>.
                   </p>
                   <p className="text-sm mt-4 text-muted">Reason: "{dashData.tenant.vacateReason}"</p>
                </div>
             ) : (
                <>
                   <h3 className="mb-4">Initiate Move Out</h3>
                   <div style={{borderLeft: '4px solid var(--warning)', paddingLeft: '1rem', marginBottom: '2rem'}}>
                      <p className="text-sm text-muted">Please note: A minimum 10 day notice period is typically required. Modifying this notice after submission requires contacting the owner directly.</p>
                   </div>
                   <form onSubmit={submitVacate}>
                      <div className="form-group">
                         <label className="form-label">Expected Vacate Date</label>
                         <input 
                           type="date" 
                           className="form-control" 
                           value={vacateDate}
                           onChange={(e) => setVacateDate(e.target.value)}
                           required
                         />
                      </div>
                      <div className="form-group">
                         <label className="form-label">Reason for Leaving</label>
                         <textarea 
                           className="form-control" 
                           rows="3" 
                           placeholder="Relocating, graduated, etc."
                           value={vacateReason}
                           onChange={(e) => setVacateReason(e.target.value)}
                           required
                         ></textarea>
                      </div>
                      <button type="submit" className="btn w-full mt-2 flex items-center justify-center gap-2" style={{backgroundColor: 'var(--warning)', color: '#000', fontWeight: '600'}} disabled={loadingVacate}>
                        {loadingVacate ? <Loader2 size={18} className="animate-spin" /> : null}
                        {loadingVacate ? "Submitting Notice..." : "Submit Notice"}
                      </button>
                   </form>
                </>
             )}
          </div>
        )}
      </main>
    </div>
  );
};

export default TenantDashboard;


