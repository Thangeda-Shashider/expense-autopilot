import { useState, useEffect, useCallback } from 'react';
import { Plus, X, Loader2, Tag, Trash2 } from 'lucide-react';
import api from '../api/axios';

const EMOJI_OPTIONS = ['🍔', '🚗', '🛍️', '🎮', '💊', '💡', '✈️', '📚', '🏠', '💰', '🎬', '☕', '🏋️', '💅', '🐾'];

const CAT_COLORS = {
  '🍔': '#f59e0b', '🚗': '#3b82f6', '🛍️': '#ec4899', '🎮': '#8b5cf6',
  '💊': '#22c55e', '💡': '#06b6d4', '✈️': '#0ea5e9', '📚': '#f97316',
  '🏠': '#94a3b8', '💰': '#6366f1',
};

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ name: '', icon: '💰' });

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/categories');
      setCategories(data?.data || data || []);
    } catch (err) {
      console.error('Category fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  async function handleAdd(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const { data } = await api.post('/api/categories', {
        name: form.name.trim(),
        icon: form.icon,
      });
      const newCat = data.data || data;
      setCategories(prev => [...prev, newCat]);
      setForm({ name: '', icon: '💰' });
      setShowForm(false);
      setSuccess('Category created!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create category.');
    } finally {
      setSubmitting(false);
    }
  }

  const catList = Array.isArray(categories) ? categories : [];

  return (
    <div style={{ padding: '32px 32px 48px', maxWidth: '1400px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#f1f5f9' }}>Categories</h1>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
            Organise your expenses into categories
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(s => !s)}>
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? 'Cancel' : 'New Category'}
        </button>
      </div>

      {/* Toasts */}
      {success && (
        <div style={{
          padding: '12px 16px', borderRadius: '10px', marginBottom: '16px',
          background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
          color: '#22c55e', fontSize: '14px',
        }}>✓ {success}</div>
      )}
      {error && (
        <div style={{
          padding: '12px 16px', borderRadius: '10px', marginBottom: '16px',
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          color: '#ef4444', fontSize: '14px',
        }}>✕ {error}</div>
      )}

      {/* Add form */}
      {showForm && (
        <div className="card fade-in" style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#f1f5f9', marginBottom: '20px' }}>
            New Category
          </h2>
          <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="label">Name *</label>
              <input
                className="input"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Groceries"
                required
              />
            </div>
            <div>
              <label className="label">Icon</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                {EMOJI_OPTIONS.map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, icon: emoji }))}
                    style={{
                      width: '44px', height: '44px', borderRadius: '10px',
                      fontSize: '20px', cursor: 'pointer',
                      background: form.icon === emoji ? 'rgba(99,102,241,0.2)' : '#0f172a',
                      border: form.icon === emoji ? '2px solid #6366f1' : '1px solid #334155',
                      transition: 'all 0.15s',
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? (
                  <><Loader2 size={15} style={{ animation: 'spin 0.7s linear infinite' }} /> Saving...</>
                ) : (
                  <><Plus size={15} /> Create</>
                )}
              </button>
              <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Category grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: '100px', borderRadius: '16px' }} />
          ))}
        </div>
      ) : catList.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '64px 24px' }}>
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>🏷️</div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#f1f5f9', marginBottom: '8px' }}>
            No categories yet
          </div>
          <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>
            Create categories to organise your expenses.
          </div>
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={16} /> Create your first category
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
          {catList.map((cat) => {
            const color = CAT_COLORS[cat.icon] || '#6366f1';
            return (
              <div
                key={cat.id}
                className="card fade-in"
                style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '20px', transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'default',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  width: '50px', height: '50px', borderRadius: '14px',
                  background: `${color}20`, border: `1px solid ${color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '24px', flexShrink: 0,
                }}>
                  {cat.icon || '💰'}
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {cat.name}
                  </div>
                  {cat.is_default && (
                    <span style={{
                      fontSize: '11px', color: '#6366f1',
                      background: 'rgba(99,102,241,0.1)',
                      padding: '2px 8px', borderRadius: '20px',
                      display: 'inline-block', marginTop: '4px',
                    }}>
                      Default
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {/* Add new card */}
          <button
            onClick={() => setShowForm(true)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: '10px',
              padding: '20px', borderRadius: '16px',
              background: 'transparent',
              border: '2px dashed #334155', cursor: 'pointer',
              transition: 'all 0.2s', minHeight: '90px',
              color: '#64748b',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#6366f1';
              e.currentTarget.style.color = '#6366f1';
              e.currentTarget.style.background = 'rgba(99,102,241,0.05)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#334155';
              e.currentTarget.style.color = '#64748b';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <Plus size={22} />
            <span style={{ fontSize: '13px', fontWeight: 500 }}>Add Category</span>
          </button>
        </div>
      )}
    </div>
  );
}
