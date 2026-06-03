import React, { useState, useEffect } from 'react';
import { Shield, Plus, Eye, EyeOff, Trash2, Check, Star, AlertCircle, Building, X, ChevronRight, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api';
import MobileBottomNav from '../../components/owner/MobileBottomNav';
import MobileOwnerHeader from '../../components/owner/MobileOwnerHeader';
import './BankAccountsPage.css';

const bankColors = [
  'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
  'linear-gradient(135deg, #0f3460 0%, #16213e 100%)',
  'linear-gradient(135deg, #2d1b69 0%, #11998e 100%)',
  'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
  'linear-gradient(135deg, #4a00e0 0%, #8e2de2 100%)',
];

const maskAccount = (num) => {
  if (!num || num.length < 5) return num;
  return '•••• •••• ' + num.slice(-4);
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
    <div className={`bank-card ${account.is_primary ? 'bank-card-primary' : ''}`} style={{ background: bankColors[index % bankColors.length] }}>
      {account.is_primary && (
        <div className="bank-card-badge">
          <Star size={10} fill="currentColor" /> Primary
        </div>
      )}
      
      <div className="bank-card-chip">
        <div className="chip-line" /><div className="chip-line" />
        <div className="chip-line" /><div className="chip-line" />
      </div>

      <div className="bank-card-number">
        <span>{showNumber ? account.account_number : maskAccount(account.account_number)}</span>
        <button className="bank-card-eye" onClick={() => setShowNumber(v => !v)}>
          {showNumber ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>

      <div className="bank-card-footer">
        <div>
          <div className="bank-card-label">Account Holder</div>
          <div className="bank-card-value">{account.account_holder_name}</div>
        </div>
        <div>
          <div className="bank-card-label">IFSC</div>
          <div className="bank-card-value">{account.ifsc}</div>
        </div>
        {account.bank_name && (
          <div>
            <div className="bank-card-label">Bank</div>
            <div className="bank-card-value">{account.bank_name}</div>
          </div>
        )}
      </div>

      <div className="bank-card-actions">
        {!account.is_primary && (
          <button className="bank-action-btn bank-action-primary" onClick={() => onSetPrimary(account.id)}>
            <Check size={13} /> Set as Primary
          </button>
        )}
        <button className="bank-action-btn bank-action-delete" onClick={handleDelete} disabled={deleting}>
          <Trash2 size={13} /> {deleting ? 'Removing...' : 'Remove'}
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.account_number !== form.confirm_account_number) {
      return toast.error('Account numbers do not match!');
    }
    if (form.account_number.length < 8) {
      return toast.error('Please enter a valid account number');
    }
    if (form.ifsc.length !== 11) {
      return toast.error('IFSC code must be 11 characters');
    }
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
    <div className="modal-backdrop" onClick={onClose}>
      <div className="add-account-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>Add Bank Account</h3>
            <p>Your details are encrypted & secure</p>
          </div>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal-security-badge">
          <Lock size={14} />
          <span>256-bit encrypted · PCI-DSS compliant</span>
        </div>

        <form onSubmit={handleSubmit} className="add-account-form">
          <div className="form-field">
            <label>Account Holder Name</label>
            <input
              type="text"
              placeholder="As printed on passbook"
              value={form.account_holder_name}
              onChange={e => setForm({ ...form, account_holder_name: e.target.value })}
              required
            />
          </div>
          <div className="form-field">
            <label>Bank Name <span className="optional">(optional)</span></label>
            <input
              type="text"
              placeholder="e.g. State Bank of India"
              value={form.bank_name}
              onChange={e => setForm({ ...form, bank_name: e.target.value })}
            />
          </div>
          <div className="form-field">
            <label>Account Number</label>
            <input
              type="password"
              placeholder="Enter account number"
              value={form.account_number}
              onChange={e => setForm({ ...form, account_number: e.target.value.replace(/\D/g, '') })}
              required
              autoComplete="off"
            />
          </div>
          <div className="form-field">
            <label>Confirm Account Number</label>
            <input
              type="text"
              placeholder="Re-enter account number"
              value={form.confirm_account_number}
              onChange={e => setForm({ ...form, confirm_account_number: e.target.value.replace(/\D/g, '') })}
              required
              autoComplete="off"
            />
            {form.confirm_account_number && form.account_number !== form.confirm_account_number && (
              <span className="field-error"><AlertCircle size={12} /> Account numbers don't match</span>
            )}
          </div>
          <div className="form-field">
            <label>IFSC Code</label>
            <input
              type="text"
              placeholder="e.g. SBIN0001234"
              value={form.ifsc}
              onChange={e => setForm({ ...form, ifsc: e.target.value.toUpperCase() })}
              maxLength={11}
              required
            />
          </div>

          <button type="submit" className="btn-add-account" disabled={loading}>
            {loading ? 'Adding Account...' : 'Add Account'}
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

  const fetchAccounts = async () => {
    try {
      const { data } = await api.get('/api/owner/bank-accounts');
      setAccounts(data || []);
    } catch {
      toast.error('Failed to load bank accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAccounts(); }, []);

  const handleSetPrimary = async (id) => {
    try {
      await api.put(`/api/owner/bank-accounts/${id}/set-primary`);
      setAccounts(prev => prev.map(a => ({ ...a, is_primary: a.id === id })));
      toast.success('Primary account updated!');
    } catch {
      toast.error('Failed to update');
    }
  };

  const handleDelete = (id) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
  };

  const handleAdded = (newAccount) => {
    setAccounts(prev => {
      // If this is the first, mark it primary in local state
      const updated = [...prev, newAccount];
      return updated;
    });
  };

  const primaryAccount = accounts.find(a => a.is_primary);

  return (
    <div className="bank-page">
      <MobileOwnerHeader title="Bank Accounts" />

      <div className="bank-page-content">
        {/* Security header */}
        <div className="bank-security-header">
          <div className="bank-security-icon">
            <Shield size={24} />
          </div>
          <div>
            <h2>Payment Accounts</h2>
            <p>Rent from tenants goes directly to your primary account</p>
          </div>
        </div>

        {/* Primary account info strip */}
        {primaryAccount && (
          <div className="primary-info-strip">
            <Building size={16} />
            <span>Receiving rent to: <strong>••••{primaryAccount.account_number?.slice(-4)}</strong> ({primaryAccount.account_holder_name})</span>
            <ChevronRight size={14} />
          </div>
        )}

        {/* Accounts list */}
        {loading ? (
          <div className="bank-loading">
            <div className="bank-loading-card" />
            <div className="bank-loading-card" />
          </div>
        ) : accounts.length === 0 ? (
          <div className="bank-empty">
            <div className="bank-empty-icon"><Building size={40} /></div>
            <h3>No accounts added yet</h3>
            <p>Add your bank account to start receiving rent payments from tenants directly.</p>
          </div>
        ) : (
          <div className="bank-cards-list">
            {accounts.map((account, i) => (
              <BankCard
                key={account.id}
                account={account}
                index={i}
                onSetPrimary={handleSetPrimary}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Add account button */}
        <button className="btn-add-new-account" onClick={() => setShowModal(true)}>
          <Plus size={18} />
          Add Bank Account
        </button>

        <div className="bank-disclaimer">
          <Lock size={12} />
          Your banking details are encrypted and never shared with third parties.
        </div>
      </div>

      <MobileBottomNav />
      {showModal && <AddAccountModal onClose={() => setShowModal(false)} onAdded={handleAdded} />}
    </div>
  );
};

export default BankAccountsPage;
