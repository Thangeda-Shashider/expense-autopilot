export default function StatCard({ title, value, icon: Icon, color = '#6366f1', subtitle, trend, loading }) {
  if (loading) {
    return (
      <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="skeleton" style={{ height: '12px', width: '60%', marginBottom: '16px' }} />
        <div className="skeleton" style={{ height: '36px', width: '80%', marginBottom: '8px' }} />
        <div className="skeleton" style={{ height: '12px', width: '40%' }} />
      </div>
    );
  }

  return (
    <div
      className="card fade-in"
      style={{
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'default',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = `0 12px 30px rgba(0,0,0,0.3)`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Gradient orb */}
      <div style={{
        position: 'absolute', top: '-30px', right: '-30px',
        width: '100px', height: '100px',
        background: `radial-gradient(circle, ${color}30 0%, transparent 70%)`,
        borderRadius: '50%',
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <span style={{ fontSize: '13px', fontWeight: 500, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {title}
        </span>
        {Icon && (
          <div style={{
            width: '40px', height: '40px', borderRadius: '10px',
            background: `${color}20`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `1px solid ${color}30`,
          }}>
            <Icon size={18} color={color} />
          </div>
        )}
      </div>

      <div style={{ fontSize: '32px', fontWeight: 800, color: '#f1f5f9', marginBottom: '8px', letterSpacing: '-0.02em' }}>
        {value ?? '—'}
      </div>

      {(subtitle || trend !== undefined) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {trend !== undefined && (
            <span style={{
              fontSize: '12px', fontWeight: 600,
              color: trend >= 0 ? '#22c55e' : '#ef4444',
              background: trend >= 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
              padding: '2px 6px', borderRadius: '6px',
            }}>
              {trend >= 0 ? '+' : ''}{trend}%
            </span>
          )}
          {subtitle && (
            <span style={{ fontSize: '12px', color: '#64748b' }}>{subtitle}</span>
          )}
        </div>
      )}
    </div>
  );
}
