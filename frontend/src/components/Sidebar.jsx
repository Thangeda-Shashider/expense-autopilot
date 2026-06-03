import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  Tag,
  LogOut,
  TrendingUp,
  Wallet,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/expenses', icon: Receipt, label: 'Expenses' },
  { to: '/categories', icon: Tag, label: 'Categories' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  }

  return (
    <aside style={{
      width: '256px',
      minHeight: '100vh',
      background: '#1e293b',
      borderRight: '1px solid #334155',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      position: 'sticky',
      top: 0,
      height: '100vh',
    }}>
      {/* Logo */}
      <div style={{ padding: '28px 24px 24px', borderBottom: '1px solid #334155' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px', height: '40px',
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Wallet size={20} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '15px', color: '#f1f5f9' }}>
              Expense
            </div>
            <div style={{ fontWeight: 700, fontSize: '15px', color: '#6366f1' }}>
              Autopilot
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '8px 12px', marginBottom: '4px' }}>
          Menu
        </div>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 12px',
              borderRadius: '10px',
              textDecoration: 'none',
              fontWeight: 500,
              fontSize: '14px',
              transition: 'all 0.15s ease',
              color: isActive ? '#f1f5f9' : '#94a3b8',
              background: isActive ? 'rgba(99,102,241,0.15)' : 'transparent',
              border: isActive ? '1px solid rgba(99,102,241,0.25)' : '1px solid transparent',
            })}
          >
            {({ isActive }) => (
              <>
                <Icon size={18} color={isActive ? '#6366f1' : '#64748b'} />
                <span style={{ flex: 1 }}>{label}</span>
                {isActive && <ChevronRight size={14} color="#6366f1" />}
              </>
            )}
          </NavLink>
        ))}

        {/* Divider */}
        <div style={{ margin: '16px 0', borderTop: '1px solid #334155' }} />

        <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '8px 12px', marginBottom: '4px' }}>
          Insights
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '10px 12px', borderRadius: '10px',
          background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)',
        }}>
          <TrendingUp size={18} color="#22c55e" />
          <span style={{ fontSize: '13px', color: '#94a3b8' }}>
            Autopilot <span style={{ color: '#22c55e', fontWeight: 600 }}>Active</span>
          </span>
        </div>
      </nav>

      {/* User section */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid #334155' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '12px', borderRadius: '12px',
          background: '#0f172a', marginBottom: '8px',
        }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', fontWeight: 700, color: 'white', flexShrink: 0,
          }}>
            {(user.name || user.email || 'U').charAt(0).toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.name || 'User'}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.email || ''}
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 12px', borderRadius: '10px',
            background: 'transparent', border: '1px solid #334155',
            color: '#94a3b8', cursor: 'pointer', fontSize: '13px',
            fontWeight: 500, transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(239,68,68,0.08)';
            e.currentTarget.style.color = '#ef4444';
            e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#94a3b8';
            e.currentTarget.style.borderColor = '#334155';
          }}
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
