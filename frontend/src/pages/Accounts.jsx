import { useState, useEffect } from 'react';
import { getAccounts, createAccount, updateAccount, deleteAccount } from '../api/endpoints';
import { Plus, Pencil, Trash2, Landmark, CreditCard, Wallet, Banknote } from 'lucide-react';
import Modal from '../components/Modal';
import { useToast } from '../context/ToastContext';
import { useCurrency } from '../context/CurrencyContext';
import { formatCurrency } from '../utils/currency';

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const { addToast } = useToast();
  const { fc } = useCurrency();

  const [form, setForm] = useState({
    name: '', account_type: 'checking', balance: '', currency: 'INR', description: ''
  });

  useEffect(() => { loadAccounts(); }, []);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const res = await getAccounts();
      setAccounts(res.data?.results || res.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', account_type: 'checking', balance: '', currency: 'INR', description: '' });
    setShowModal(true);
  };

  const openEdit = (acc) => {
    setEditing(acc);
    setForm({
      name: acc.name,
      account_type: acc.account_type,
      balance: acc.balance,
      currency: acc.currency || 'INR',
      description: acc.description || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, balance: parseFloat(form.balance) || 0 };
      if (editing) {
        await updateAccount(editing.id, payload);
        addToast('Account updated');
      } else {
        await createAccount(payload);
        addToast('Account created');
      }
      setShowModal(false);
      loadAccounts();
    } catch (err) {
      const data = err.response?.data;
      const msg = typeof data === 'object' ? Object.values(data).flat().join(', ') : 'Failed to save account';
      addToast(msg, 'error');
    }
  };

  const handleDelete = async (acc) => {
    if (!window.confirm(`Delete "${acc.name}"? Transactions associated with this account may also be affected.`)) return;
    try {
      await deleteAccount(acc.id);
      addToast('Account deleted');
      loadAccounts();
    } catch { addToast('Failed to delete account', 'error'); }
  };

  const getAccountIcon = (type) => {
    switch (type) {
      case 'checking':
      case 'savings': return <Landmark size={20} className="text-primary" />;
      case 'credit_card': return <CreditCard size={20} className="text-danger" />;
      case 'cash': return <Banknote size={20} className="text-success" />;
      default: return <Wallet size={20} className="text-gray" />;
    }
  };

  const formatAccountType = (type) => {
    return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <h1>Accounts</h1>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> New Account</button>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
        {accounts.map(acc => (
          <div key={acc.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="card-body" style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ padding: 10, background: 'var(--bg-color)', borderRadius: '50%' }}>
                    {getAccountIcon(acc.account_type)}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 16 }}>{acc.name}</h3>
                    <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>{formatAccountType(acc.account_type)}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button className="btn btn-icon btn-sm" onClick={() => openEdit(acc)} title="Edit">
                    <Pencil size={14} />
                  </button>
                  <button className="btn btn-icon btn-sm text-danger" onClick={() => handleDelete(acc)} title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              
              <div style={{ marginTop: 'auto' }}>
                <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>Current Balance</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: acc.balance < 0 ? 'var(--danger)' : 'var(--text-color)' }}>
                  {formatCurrency(acc.balance, acc.currency)}
                </div>
              </div>
              {acc.description && (
                <div style={{ marginTop: 12, fontSize: 13, color: 'var(--gray-500)' }}>
                  {acc.description}
                </div>
              )}
            </div>
          </div>
        ))}
        {accounts.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 48, background: 'var(--card-bg)', borderRadius: 16, border: '1px dashed var(--border-color)' }}>
            <Landmark size={48} style={{ color: 'var(--gray-400)', marginBottom: 16 }} />
            <h3 style={{ marginBottom: 8 }}>No Accounts Yet</h3>
            <p style={{ color: 'var(--gray-500)', marginBottom: 16 }}>Create your first account to start tracking your finances.</p>
            <button className="btn btn-primary" onClick={openCreate}>Create Account</button>
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Account' : 'New Account'}>
        <form onSubmit={handleSubmit} className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label>Account Name</label>
            <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Chase Checking" />
          </div>
          
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <label>Account Type</label>
              <select value={form.account_type} onChange={e => setForm({ ...form, account_type: e.target.value })}>
                <option value="checking">Checking</option>
                <option value="savings">Savings</option>
                <option value="credit_card">Credit Card</option>
                <option value="cash">Cash</option>
                <option value="investment">Investment</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label>Currency</label>
              <select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })}>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
                <option value="CAD">CAD (C$)</option>
                <option value="AUD">AUD (A$)</option>
              </select>
            </div>
          </div>

          <div>
            <label>Current Balance</label>
            <input type="number" step="0.01" required value={form.balance} onChange={e => setForm({ ...form, balance: e.target.value })} placeholder="0.00" />
          </div>

          <div>
            <label>Description (Optional)</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} placeholder="Brief details..." />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">{editing ? 'Save Changes' : 'Create Account'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
