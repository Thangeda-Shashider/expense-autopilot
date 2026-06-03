import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';

const CATEGORY_COLORS = {
  Food: '#f59e0b',
  Transport: '#3b82f6',
  Shopping: '#ec4899',
  Entertainment: '#8b5cf6',
  Health: '#22c55e',
  Utilities: '#06b6d4',
  Other: '#94a3b8',
};

function getCategoryColor(name) {
  if (!name) return '#94a3b8';
  return CATEGORY_COLORS[name] || '#6366f1';
}

export default function ExpenseTable({ expenses, loading, onDelete, compact = false }) {
  if (loading) {
    return (
      <div>
        {[...Array(5)].map((_, i) => (
          <div key={i} style={{ display: 'flex', gap: '12px', padding: '14px 0', borderBottom: '1px solid #1e293b' }}>
            <div className="skeleton" style={{ width: '36px', height: '36px', borderRadius: '10px' }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div className="skeleton" style={{ height: '12px', width: '45%' }} />
              <div className="skeleton" style={{ height: '10px', width: '25%' }} />
            </div>
            <div className="skeleton" style={{ height: '16px', width: '60px', borderRadius: '6px' }} />
          </div>
        ))}
      </div>
    );
  }

  if (!expenses || expenses.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 24px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
        <div style={{ fontSize: '16px', fontWeight: 600, color: '#f1f5f9', marginBottom: '8px' }}>
          No expenses found
        </div>
        <div style={{ fontSize: '14px', color: '#64748b' }}>
          Start logging expenses via your Telegram bot or add one manually.
        </div>
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {['Description', 'Category', 'Date', 'Source', 'Amount', ...(onDelete ? [''] : [])].map(h => (
              <th key={h} style={{
                padding: compact ? '8px 12px' : '12px 16px',
                textAlign: h === 'Amount' ? 'right' : 'left',
                fontSize: '11px', fontWeight: 600,
                color: '#64748b', textTransform: 'uppercase',
                letterSpacing: '0.06em',
                borderBottom: '1px solid #334155',
                whiteSpace: 'nowrap',
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {expenses.map((exp, i) => {
            const catName = exp.category_name || exp.category || 'Other';
            const color = getCategoryColor(catName);
            return (
              <tr
                key={exp.id || i}
                style={{ transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {/* Description */}
                <td style={{ padding: compact ? '10px 12px' : '14px 16px', borderBottom: '1px solid #1e293b' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '34px', height: '34px', borderRadius: '10px',
                      background: `${color}20`, border: `1px solid ${color}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '15px', flexShrink: 0,
                    }}>
                      {exp.icon || getCategoryEmoji(catName)}
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 500, color: '#f1f5f9' }}>
                      {exp.description || '—'}
                    </span>
                  </div>
                </td>
                {/* Category */}
                <td style={{ padding: compact ? '10px 12px' : '14px 16px', borderBottom: '1px solid #1e293b' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center',
                    padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 500,
                    color: color, background: `${color}15`, border: `1px solid ${color}30`,
                  }}>
                    {catName}
                  </span>
                </td>
                {/* Date */}
                <td style={{ padding: compact ? '10px 12px' : '14px 16px', borderBottom: '1px solid #1e293b', fontSize: '13px', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                  {exp.expense_date ? format(new Date(exp.expense_date), 'MMM d, yyyy') : '—'}
                </td>
                {/* Source */}
                <td style={{ padding: compact ? '10px 12px' : '14px 16px', borderBottom: '1px solid #1e293b' }}>
                  <span style={{
                    fontSize: '12px', fontWeight: 500,
                    color: exp.source === 'telegram' ? '#3b82f6' : '#94a3b8',
                    background: exp.source === 'telegram' ? 'rgba(59,130,246,0.1)' : 'rgba(148,163,184,0.1)',
                    padding: '2px 8px', borderRadius: '6px',
                  }}>
                    {exp.source || 'manual'}
                  </span>
                </td>
                {/* Amount */}
                <td style={{ padding: compact ? '10px 12px' : '14px 16px', borderBottom: '1px solid #1e293b', textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: '#f1f5f9' }}>
                    ₹{parseFloat(exp.amount || 0).toFixed(2)}
                  </span>
                </td>
                {/* Delete */}
                {onDelete && (
                  <td style={{ padding: compact ? '10px 12px' : '14px 16px', borderBottom: '1px solid #1e293b', textAlign: 'center' }}>
                    <button
                      className="btn-danger"
                      onClick={() => onDelete(exp.id)}
                      title="Delete expense"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function getCategoryEmoji(name) {
  const map = {
    Food: '🍔', Transport: '🚗', Shopping: '🛍️',
    Entertainment: '🎮', Health: '💊', Utilities: '💡',
    Travel: '✈️', Education: '📚',
  };
  return map[name] || '💰';
}
