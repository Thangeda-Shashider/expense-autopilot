import { useState, useEffect } from 'react';
import { Link2, RefreshCw, CheckCircle, Copy, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

// Generates a random 8-character alphanumeric code
function generateCode() {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

export default function Settings({ session }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      const { data } = await supabase
        .from('profiles')
        .select('telegram_chat_id, link_code, link_code_expires_at')
        .eq('id', session.user.id)
        .single();
      setProfile(data);
      setLoading(false);
    }
    if (session?.user?.id) fetchProfile();
  }, [session]);

  async function handleGenerateCode() {
    setGenerating(true);
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 min

    const { data, error } = await supabase
      .from('profiles')
      .update({ link_code: code, link_code_expires_at: expiresAt })
      .eq('id', session.user.id)
      .select('telegram_chat_id, link_code, link_code_expires_at')
      .single();

    if (!error) setProfile(data);
    setGenerating(false);
  }

  async function handleCopy(text) {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/login');
  }

  const isLinked = !!profile?.telegram_chat_id;
  const codeExpired = profile?.link_code_expires_at && new Date(profile.link_code_expires_at) < new Date();
  const hasActiveCode = profile?.link_code && !codeExpired;

  return (
    <div style={{ padding: '32px 32px 48px', maxWidth: '720px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#f1f5f9' }}>Settings</h1>
        <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
          Manage your account and integrations
        </p>
      </div>

      {/* Account */}
      <div className="card" style={{ marginBottom: '20px', padding: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#f1f5f9', marginBottom: '16px' }}>Account</h2>
        <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '20px' }}>
          Signed in as <span style={{ color: '#f1f5f9', fontWeight: 600 }}>{session?.user?.email}</span>
        </p>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '9px 16px', borderRadius: '10px',
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
            color: '#ef4444', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
          }}
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>

      {/* Telegram */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#f1f5f9' }}>Connect Telegram</h2>
          {isLinked && (
            <span style={{
              fontSize: '11px', fontWeight: 600, color: '#22c55e',
              background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)',
              padding: '2px 10px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '4px',
            }}>
              <CheckCircle size={11} /> Linked
            </span>
          )}
        </div>
        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>
          {isLinked
            ? `Your Telegram is connected (chat ID: ${profile.telegram_chat_id}). You can log expenses by messaging the bot.`
            : 'Link your Telegram account to log expenses by just sending a message to the bot.'}
        </p>

        {loading ? (
          <div style={{ fontSize: '13px', color: '#64748b' }}>Loading...</div>
        ) : (
          <>
            {/* How it works */}
            <div style={{
              background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.15)',
              borderRadius: '12px', padding: '16px', marginBottom: '20px',
              fontSize: '13px', color: '#94a3b8', lineHeight: '1.7',
            }}>
              <strong style={{ color: '#c7d2fe' }}>How to connect:</strong><br />
              1. Click <em>Generate Code</em> below<br />
              2. Open <strong style={{ color: '#f1f5f9' }}>@YourExpenseBot</strong> on Telegram<br />
              3. Send: <code style={{ color: '#a5b4fc' }}>/connect YOUR_CODE</code><br />
              The code expires in 15 minutes.
            </div>

            {hasActiveCode && (
              <div style={{
                background: '#0f172a', border: '1px solid #334155',
                borderRadius: '12px', padding: '16px', marginBottom: '20px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px', fontWeight: 500 }}>YOUR CODE</div>
                  <div style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '4px', color: '#a5b4fc', fontFamily: 'monospace' }}>
                    {profile.link_code}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                    Expires {new Date(profile.link_code_expires_at).toLocaleTimeString()}
                  </div>
                </div>
                <button
                  onClick={() => handleCopy(`/connect ${profile.link_code}`)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 14px', borderRadius: '8px',
                    background: copied ? 'rgba(34,197,94,0.1)' : 'rgba(99,102,241,0.1)',
                    border: copied ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(99,102,241,0.25)',
                    color: copied ? '#22c55e' : '#a5b4fc', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  {copied ? <CheckCircle size={13} /> : <Copy size={13} />}
                  {copied ? 'Copied!' : 'Copy command'}
                </button>
              </div>
            )}

            <button
              onClick={handleGenerateCode}
              disabled={generating}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 18px', borderRadius: '10px',
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                border: 'none', color: 'white', fontSize: '13px',
                fontWeight: 600, cursor: generating ? 'not-allowed' : 'pointer',
                opacity: generating ? 0.7 : 1,
              }}
            >
              <RefreshCw size={14} style={{ animation: generating ? 'spin 0.7s linear infinite' : 'none' }} />
              {hasActiveCode ? 'Regenerate Code' : 'Generate Code'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
