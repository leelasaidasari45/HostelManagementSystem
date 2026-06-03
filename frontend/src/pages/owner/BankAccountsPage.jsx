import React, { useState, useEffect } from 'react';
import { Plus, Eye, EyeOff, Trash2, Check, AlertCircle, X, Lock, IndianRupee, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api';
import MobileBottomNav from '../../components/owner/MobileBottomNav';
import MobileOwnerHeader from '../../components/owner/MobileOwnerHeader';
import './BankAccountsPage.css';

// Color themes for each card — warm, earthy, vibrant (no blue)
const CARD_THEMES = [
  { bg: 'linear-gradient(135deg, #1a1a1a 0%, #2d1f0a 100%)', accent: '#f59e0b', light: 'rgba(245,158,11,0.15)' },
  { bg: 'linear-gradient(135deg, #0d1f0d 0%, #1a2e1a 100%)', accent: '#34d399', light: 'rgba(52,211,153,0.15)' },
  { bg: 'linear-gradient(135deg, #1f0d1a 0%, #2e1a28 100%)', accent: '#e879f9', light: 'rgba(232,121,249,0.15)' },
  { bg: 'linear-gradient(135deg, #1f0f0a 0%, #2e1f12 100%)', accent: '#fb923c', light: 'rgba(251,146,60,0.15)' },
  { bg: 'linear-gradient(135deg, #0f1a1f 0%, #122e2e 100%)', accent: '#2dd4bf', light: 'rgba(45,212,191,0.15)' },
];

// Bank initials avatar
const BankAvatar = ({ name, accent }) => {
  const initials = (name || 'BA').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className="ba-avatar" style={{ background: accent + '22', border: `1.5px solid ${accent}44`, color: accent }}>
      {initials}
    </div>
  );
};

const maskAccount = (num) => {
  if (!num || num.length < 5) return num;
  return '•••• •••• ' + num.slice(-4);
};

const BankCard = ({ account, index, onSetPrimary, onDelete }) => {
  const [showNumber, setShowNumber] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const theme = CARD_THEMES[index % CARD_THEMES.length];

  const handleDelete = async () => {
    if (!window.confirm('Remove this bank account?')) return;
    setDeleting(true);
    try {
      await api.delete(`/api/owner/bank-accounts/${account.id}`);
      toast.success('Account removed');
      onDelete(account.id);
    } catch {
      toast.error('Failed to remove account');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="ba-card" style={{ background: theme.bg }}>
      {/* Card Top Row */}
      <div className="ba-card-row">
        <BankAvatar name={account.bank_name || account.account_holder_name} accent={theme.accent} />
        <div className="ba-card-meta">
          <span className="ba-card-bank" style={{ color: '#fff' }}>
            {account.bank_name || 'Bank Account'}
          </span>
          {account.is_primary && (
            <span className="ba-primary-tag" style={{ color: theme.accent, background: theme.light }}>
              ✦ Primary
            </span>
          )}
        </div>
        <button className="ba-eye-btn" onClick={() => setShowNumber(v => !v)}
          style={{ color: theme.accent, background: theme.light }}>
          {showNumber ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>

      {/* Account Number */}
      <div className="ba-num-row" style={{ borderColor: theme.accent + '30' }}>
        <IndianRupee size={13} style={{ color: theme.accent, flexShrink: 0 }} />
        <span className="ba-num-text">
          {showNumber ? account.account_number : maskAccount(account.account_number)}
        </span>
      </div>

      {/* Details */}
      <div className="ba-info-row">
        <div className="ba-info-cell">
          <span className="ba-info-label">Holder</span>
          <span className="ba-info-value">{account.account_holder_name}</span>
        </div>
        <div className="ba-info-divider" style={{ background: theme.accent + '25' }} />
        <div className="ba-info-cell">
          <span className="ba-info-label">IFSC</span>
          <span className="ba-info-value">{account.ifsc}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="ba-card-footer" style={{ borderColor: theme.accent + '20' }}>
        {account.is_primary ? (
          <div className="ba-active-badge" style={{ color: theme.accent }}>
            <Check size={13} /> Active · Receiving rent
          </div>
        ) : (
          <button className="ba-set-primary-btn" onClick={() => onSetPrimary(account.id)}
            style={{ color: theme.accent, background: theme.light }}>
            <Check size={13} /> Set Primary
          </button>
        )}
        <button className="ba-delete-btn" onClick={handleDelete} disabled={deleting}>
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

const AddAccountModal = ({ onClose, onAdded }) => {
  const [form, setForm] = useState({
    account_holder_name: '',
    bank_name: '',
    account_number: '',
    confirm_account_number: '',
    ifsc: '',
  });
  const [loading, setLoading] = useState(false);
  const [showAcc, setShowAcc] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.account_number !== form.confirm_account_number) return toast.error('Account numbers do not match!');
    if (form.account_number.length < 8) return toast.error('Please enter a valid account number');
    if (form.ifsc.length !== 11) return toast.error('IFSC code must be 11 characters');
    setLoading(true);
    try {
      const { data } = await api.post('/api/owner/bank-accounts', {
        account_holder_name: form.account_holder_name,
        bank_name: form.bank_name,
        account_number: form.account_number,
        ifsc: form.ifsc.toUpperCase(),
      });
      toast.success('Bank account added!');
      onAdded(data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ba-backdrop" onClick={onClose}>
      <div className="ba-modal" onClick={e => e.stopPropagation()}>
        <div className="ba-modal-handle" />

        <div className="ba-modal-top">
          <div className="ba-modal-title-wrap">
            <div className="ba-modal-icon"><IndianRupee size={18} /></div>
            <div>
              <h3>Add Bank Account</h3>
              <p>Rent payments will be routed here</p>
            </div>
          </div>
          <button className="ba-modal-close" onClick={onClose}><X size={17} /></button>
        </div>

        <div className="ba-modal-secure">
          <ShieldCheck size={13} />
          <span>256-bit encrypted · Secured by Cashfree</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="ba-field">
            <label>Account Holder Name</label>
            <input type="text" placeholder="As per bank records"
              value={form.account_holder_name}
              onChange={e => setForm({ ...form, account_holder_name: e.target.value })}
              required />
          </div>

          <div className="ba-field">
            <label>Bank Name <span className="ba-optional">(optional)</span></label>
            <input type="text" placeholder="e.g. State Bank of India"
              value={form.bank_name}
              onChange={e => setForm({ ...form, bank_name: e.target.value })} />
          </div>

          <div className="ba-field">
            <label>Account Number</label>
            <div className="ba-input-wrap">
              <input type={showAcc ? 'text' : 'password'}
                placeholder="Enter account number"
                value={form.account_number}
                onChange={e => setForm({ ...form, account_number: e.target.value.replace(/\D/g, '') })}
                required autoComplete="off" />
              <button type="button" className="ba-eye-inner" onClick={() => setShowAcc(v => !v)}>
                {showAcc ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div className="ba-field">
            <label>Confirm Account Number</label>
            <input type="text" placeholder="Re-enter to confirm"
              value={form.confirm_account_number}
              onChange={e => setForm({ ...form, confirm_account_number: e.target.value.replace(/\D/g, '') })}
              required autoComplete="off" />
            {form.confirm_account_number && form.account_number !== form.confirm_account_number && (
              <p className="ba-field-error"><AlertCircle size={12} /> Numbers don't match</p>
            )}
          </div>

          <div className="ba-field">
            <label>IFSC Code</label>
            <input type="text" placeholder="e.g. SBIN0001234"
              value={form.ifsc}
              onChange={e => setForm({ ...form, ifsc: e.target.value.toUpperCase() })}
              maxLength={11} required />
          </div>

          <button type="submit" className="ba-submit-btn" disabled={loading}>
            {loading ? 'Saving...' : 'Save Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

const BankAccountsPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    api.get('/api/owner/bank-accounts')
      .then(r => setAccounts(r.data || []))
      .catch(() => toast.error('Failed to load accounts'))
      .finally(() => setLoading(false));
  }, []);

  const handleSetPrimary = async (id) => {
    try {
      await api.put(`/api/owner/bank-accounts/${id}/set-primary`);
      setAccounts(prev => prev.map(a => ({ ...a, is_primary: a.id === id })));
      toast.success('Primary account updated');
    } catch { toast.error('Failed to update'); }
  };

  const handleDelete = (id) => setAccounts(prev => prev.filter(a => a.id !== id));
  const handleAdded = (acc) => setAccounts(prev => [...prev, acc]);

  const primary = accounts.find(a => a.is_primary);

  return (
    <div className="ba-page">
      <MobileOwnerHeader title="Bank Accounts" />

      <div className="ba-content">

        {/* Hero strip */}
        <div className="ba-hero">
          <div className="ba-hero-left">
            <div className="ba-hero-icon">
              <IndianRupee size={20} />
            </div>
            <div>
              <h1 className="ba-page-title">Payment Accounts</h1>
              <p className="ba-page-sub">
                {primary
                  ? `Receiving to ••••${primary.account_number?.slice(-4)}`
                  : 'Add an account to receive rent'}
              </p>
            </div>
          </div>
          {primary && <span className="ba-hero-live"><span className="ba-live-dot" />Live</span>}
        </div>

        {/* Accounts */}
        {loading ? (
          <>
            <div className="ba-skeleton" />
            <div className="ba-skeleton" style={{ opacity: 0.4 }} />
          </>
        ) : accounts.length === 0 ? (
          <div className="ba-empty">
            <div className="ba-empty-icon">🏦</div>
            <h3>No accounts added</h3>
            <p>Add a bank account below to start receiving rent directly from tenants</p>
          </div>
        ) : (
          <div className="ba-list">
            {accounts.map((acc, i) => (
              <BankCard key={acc.id} account={acc} index={i}
                onSetPrimary={handleSetPrimary} onDelete={handleDelete} />
            ))}
          </div>
        )}

        <button className="ba-add-btn" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add New Account
        </button>

        <div className="ba-secure-note">
          <Lock size={11} /> Bank-grade encryption · Data never shared
        </div>
      </div>

      <MobileBottomNav />
      {showModal && <AddAccountModal onClose={() => setShowModal(false)} onAdded={handleAdded} />}
    </div>
  );
};

export default BankAccountsPage;
