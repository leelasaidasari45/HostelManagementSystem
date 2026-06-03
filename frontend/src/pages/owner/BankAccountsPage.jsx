import React, { useState, useEffect } from 'react';
import { Shield, Plus, Eye, EyeOff, Trash2, Check, Star, AlertCircle, Building2, X, Lock, ChevronRight, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api';
import MobileBottomNav from '../../components/owner/MobileBottomNav';
import MobileOwnerHeader from '../../components/owner/MobileOwnerHeader';
import './BankAccountsPage.css';

const maskAccount = (num) => {
  if (!num || num.length < 5) return num;
  return '•••• •••• •••• ' + num.slice(-4);
};

const BankCard = ({ account, index, onSetPrimary, onDelete }) => {
  const [showNumber, setShowNumber] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
    <div className={`ba-card ${account.is_primary ? 'ba-card--primary' : ''}`}>
      <div className="ba-card-top">
        <div className="ba-card-bank-info">
          <div className="ba-card-icon">
            <Building2 size={18} />
          </div>
          <div>
            <div className="ba-card-bank-name">{account.bank_name || 'Bank Account'}</div>
            {account.is_primary && (
              <div className="ba-card-primary-label">
                <span className="ba-primary-dot" /> Primary · Receiving rent
              </div>
            )}
          </div>
        </div>
        <button className="ba-card-eye-btn" onClick={() => setShowNumber(v => !v)}>
          {showNumber ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      <div className="ba-card-number">
        {showNumber ? account.account_number : maskAccount(account.account_number)}
      </div>

      <div className="ba-card-details">
        <div className="ba-card-detail-row">
          <span className="ba-detail-label">Account Holder</span>
          <span className="ba-detail-value">{account.account_holder_name}</span>
        </div>
        <div className="ba-card-detail-row">
          <span className="ba-detail-label">IFSC</span>
          <span className="ba-detail-value">{account.ifsc}</span>
        </div>
      </div>

      {!account.is_primary && (
        <div className="ba-card-actions">
          <button className="ba-action-set-primary" onClick={() => onSetPrimary(account.id)}>
            <Check size={14} /> Set as Primary
          </button>
          <button className="ba-action-delete" onClick={handleDelete} disabled={deleting}>
            <Trash2 size={14} />
          </button>
        </div>
      )}
      {account.is_primary && (
        <div className="ba-card-actions">
          <div className="ba-primary-active">
            <Check size={14} /> Active for receiving payments
          </div>
          <button className="ba-action-delete" onClick={handleDelete} disabled={deleting}>
            <Trash2 size={14} />
          </button>
        </div>
      )}
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

        <div className="ba-modal-header">
          <h3>Add Bank Account</h3>
          <button className="ba-modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="ba-modal-secure">
          <Lock size={12} />
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
              <input
                type={showAcc ? 'text' : 'password'}
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
            <input type="text" placeholder="Re-enter account number"
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
            {loading ? 'Saving...' : 'Add Account'}
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

        {/* Header */}
        <div className="ba-header-section">
          <div className="ba-wallet-icon"><Wallet size={22} /></div>
          <div>
            <h1 className="ba-title">Payment Accounts</h1>
            <p className="ba-subtitle">Rent goes directly to your primary account</p>
          </div>
        </div>

        {/* Primary account strip */}
        {primary && (
          <div className="ba-primary-strip">
            <div className="ba-primary-strip-dot" />
            <span>Receiving to <strong>••••{primary.account_number?.slice(-4)}</strong> — {primary.account_holder_name}</span>
            <ChevronRight size={14} className="ba-strip-arrow" />
          </div>
        )}

        {/* List */}
        {loading ? (
          <>
            <div className="ba-skeleton" />
            <div className="ba-skeleton" style={{ opacity: 0.5 }} />
          </>
        ) : accounts.length === 0 ? (
          <div className="ba-empty">
            <Building2 size={36} />
            <h3>No accounts yet</h3>
            <p>Add your bank account to receive rent from tenants</p>
          </div>
        ) : (
          <div className="ba-list">
            {accounts.map((acc, i) => (
              <BankCard key={acc.id} account={acc} index={i}
                onSetPrimary={handleSetPrimary} onDelete={handleDelete} />
            ))}
          </div>
        )}

        {/* Add button */}
        <button className="ba-add-btn" onClick={() => setShowModal(true)}>
          <Plus size={17} /> Add Bank Account
        </button>

        <p className="ba-footer-note">
          <Lock size={11} /> Your details are encrypted and never shared
        </p>
      </div>

      <MobileBottomNav />
      {showModal && <AddAccountModal onClose={() => setShowModal(false)} onAdded={handleAdded} />}
    </div>
  );
};

export default BankAccountsPage;
