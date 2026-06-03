import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Wallet, Loader2 } from 'lucide-react';
import api from '../api/axios';

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '', telegram_chat_id: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'login') {
        const { data } = await api.post('/api/auth/login', {
          email: form.email,
          password: form.password,
        });
        localStorage.setItem('token', data.token || data.data?.token);
        localStorage.setItem('user', JSON.stringify(data.user || data.data?.user || { email: form.email }));
        navigate('/');
      } else {
        const { data } = await api.post('/api/auth/register', {
          name: form.name,
          email: form.email,
          password: form.password,
          telegram_chat_id: form.telegram_chat_id || null,
        });
        localStorage.setItem('token', data.token || data.data?.token);
        localStorage.setItem('user', JSON.stringify(data.user || data.data?.user || { name: form.name, email: form.email }));
        navigate('/');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f172a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background effects */}
      <div style={{
        position: 'absolute', top: '-200px', left: '-200px',
        width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-200px', right: '-200px',
        width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      <div className="fade-in" style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '64px', height: '64px', borderRadius: '20px',
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            marginBottom: '16px',
            boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
          }}>
            <Wallet size={28} color="white" />
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#f1f5f9', marginBottom: '6px' }}>
            Expense Autopilot
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b' }}>
            {mode === 'login' ? 'Welcome back! Sign in to your dashboard.' : 'Create your account to get started.'}
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '32px' }}>
          {/* Tab switcher */}
          <div style={{
            display: 'flex', background: '#0f172a', borderRadius: '12px',
            padding: '4px', marginBottom: '28px', gap: '4px',
          }}>
            {['login', 'register'].map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                style={{
                  flex: 1, padding: '8px', borderRadius: '8px', border: 'none',
                  fontWeight: 600, fontSize: '13px', cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: mode === m ? '#1e293b' : 'transparent',
                  color: mode === m ? '#f1f5f9' : '#64748b',
                  boxShadow: mode === m ? '0 1px 3px rgba(0,0,0,0.3)' : 'none',
                }}
              >
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {mode === 'register' && (
              <div>
                <label className="label">Full Name</label>
                <input
                  className="input"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                />
              </div>
            )}

            <div>
              <label className="label">Email</label>
              <input
                className="input"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="input"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  style={{ paddingRight: '42px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%',
                    transform: 'translateY(-50%)', background: 'none',
                    border: 'none', color: '#64748b', cursor: 'pointer',
                    display: 'flex', alignItems: 'center',
                  }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="label">
                  Telegram Chat ID{' '}
                  <span style={{ color: '#64748b', fontWeight: 400 }}>(optional)</span>
                </label>
                <input
                  className="input"
                  name="telegram_chat_id"
                  value={form.telegram_chat_id}
                  onChange={handleChange}
                  placeholder="e.g. 123456789"
                />
                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
                  Link your Telegram account to log expenses via bot.
                </p>
              </div>
            )}

            {error && (
              <div style={{
                padding: '12px 14px', borderRadius: '10px',
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                fontSize: '13px', color: '#ef4444',
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '4px' }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} style={{ animation: 'spin 0.7s linear infinite' }} />
                  {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                mode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#64748b' }}>
          Your data is secured with end-to-end encryption. 🔒
        </p>
      </div>
    </div>
  );
}
