import { useState, useEffect, useCallback } from 'react';
import { Plus, X, Filter, Loader2, Calendar, Tag } from 'lucide-react';
import { format } from 'date-fns';
import api from '../api/axios';
import ExpenseTable from '../components/ExpenseTable';

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters
  const [filterCat, setFilterCat] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');

  // New expense form
  const [form, setForm] = useState({
    amount: '', category_id: '', description: '',
    expense_date: format(new Date(), 'yyyy-MM-dd'), source: 'manual',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [expRes, catRes] = await Promise.all([
        api.get('/api/expenses'),
        api.get('/api/categories'),
      ]);
      setExpenses(expRes.data?.data || expRes.data || []);
      setCategories(catRes.data?.data || catRes.data || []);
    } catch (err) {
      console.error('Expenses fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Filter logic
  const allExpenses = Array.isArray(expenses) ? expenses : [];
  const filtered = allExpenses.filter(e => {
    if (filterCat && String(e.category_id) !== String(filterCat)) return false;
    if (filterFrom && e.expense_date && e.expense_date < filterFrom) return false;
    if (filterTo && e.expense_date && e.expense_date > filterTo) return false;
    return true;
  });

  async function handleDelete(id) {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await api.delete(`/api/expenses/${id}`);
      setExpenses(prev => prev.filter(e => e.id !== id));
      setSuccess('Expense deleted.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete expense.');
      setTimeout(() => setError(''), 3000);
    }
  }

  function handleFormChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleAddExpense(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const { data } = await api.post('/api/expenses', {
        amount: parseFloat(form.amount),
        category_id: form.category_id || null,
        description: form.description,
        expense_date: form.expense_date,
        source: form.source,
      });
      const newExp = data.data || data;
      setExpenses(prev => [newExp, ...prev]);
      setShowForm(false);
      setForm({ amount: '', category_id: '', description: '', expense_date: format(new Date(), 'yyyy-MM-dd'), source: 'manual' });
      setSuccess('Expense added successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add expense.');
    } finally {
      setSubmitting(false);
    }
  }

  const hasFilters = filterCat || filterFrom || filterTo;

  return (
    <div style={{ padding: '32px 32px 48px', maxWidth: '1400px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#f1f5f9' }}>Expenses</h1>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
            Manage and track all your transactions
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(s => !s)}>
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? 'Cancel' : 'Add Expense'}
        </button>
      </div>

      {/* Toasts */}
      {success && (
        <div style={{
          padding: '12px 16px', borderRadius: '10px', marginBottom: '16px',
          background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
          color: '#22c55e', fontSize: '14px',
        }}>
          ✓ {success}
        </div>
      )}
      {error && (
        <div style={{
          padding: '12px 16px', borderRadius: '10px', marginBottom: '16px',
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          color: '#ef4444', fontSize: '14px',
        }}>
          ✕ {error}
        </div>
      )}

      {/* Add Expense Form */}
      {showForm && (
        <div className="card fade-in" style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#f1f5f9', marginBottom: '20px' }}>
            New Expense
          </h2>
          <form onSubmit={handleAddExpense}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label className="label">Amount (₹) *</label>
                <input
                  className="input" name="amount" type="number" step="0.01" min="0"
                  value={form.amount} onChange={handleFormChange} placeholder="0.00" required
                />
              </div>
              <div>
                <label className="label">Category</label>
                <select className="input" name="category_id" value={form.category_id} onChange={handleFormChange}>
                  <option value="">— Select —</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.icon ? `${c.icon} ` : ''}{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Date</label>
                <input
                  className="input" name="expense_date" type="date"
                  value={form.expense_date} onChange={handleFormChange}
                />
              </div>
              <div>
                <label className="label">Source</label>
                <select className="input" name="source" value={form.source} onChange={handleFormChange}>
                  <option value="manual">Manual</option>
                  <option value="telegram">Telegram</option>
                  <option value="import">Import</option>
                </select>
              </div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label className="label">Description</label>
              <input
                className="input" name="description"
                value={form.description} onChange={handleFormChange}
                placeholder="e.g. Lunch at Subway"
              />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 size={15} style={{ animation: 'spin 0.7s linear infinite' }} />
                    Saving...
                  </>
                ) : (
                  <>
                    <Plus size={15} />
                    Add Expense
                  </>
                )}
              </button>
              <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '13px', fontWeight: 500 }}>
            <Filter size={15} />
            Filters
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Tag size={14} color="#64748b" />
            <select
              className="input"
              value={filterCat}
              onChange={e => setFilterCat(e.target.value)}
              style={{ width: '160px', padding: '7px 10px' }}
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={14} color="#64748b" />
            <input
              className="input" type="date" value={filterFrom}
              onChange={e => setFilterFrom(e.target.value)}
              style={{ width: '150px', padding: '7px 10px' }}
            />
            <span style={{ color: '#64748b', fontSize: '13px' }}>to</span>
            <input
              className="input" type="date" value={filterTo}
              onChange={e => setFilterTo(e.target.value)}
              style={{ width: '150px', padding: '7px 10px' }}
            />
          </div>

          {hasFilters && (
            <button
              onClick={() => { setFilterCat(''); setFilterFrom(''); setFilterTo(''); }}
              style={{
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                color: '#ef4444', padding: '6px 12px', borderRadius: '8px',
                fontSize: '12px', fontWeight: 500, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}
            >
              <X size={12} /> Clear
            </button>
          )}

          <div style={{ marginLeft: 'auto', fontSize: '13px', color: '#64748b' }}>
            <span style={{ color: '#f1f5f9', fontWeight: 600 }}>{filtered.length}</span> of {allExpenses.length} expenses
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card fade-in">
        <ExpenseTable
          expenses={filtered}
          loading={loading}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
