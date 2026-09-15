// src/components/Login.jsx — login screen
import { useState } from 'react';
import { api } from '../api.js';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('maya@papertrail.app');
  const [password, setPassword] = useState('papertrail');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr('');
    try {
      const u = await api.login(email, password);
      onLogin(u);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={S.wrap}>
      <form onSubmit={submit} style={S.card}>
        <div style={S.logo}>
          <div style={S.logoIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/>
              <path d="M8 7h8"/><path d="M8 11h8"/><path d="M8 15h5"/>
            </svg>
          </div>
          <div>
            <div style={S.logoTitle}>PaperTrail</div>
            <div style={S.logoSub}>Digital filing cabinet</div>
          </div>
        </div>
        <h1 style={S.h1}>Welcome back</h1>
        <p style={S.sub}>Sign in to your receipt filing cabinet.</p>
        {err && <div style={S.err}>{err}</div>}
        <label style={S.label}>Email
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={S.input} required />
        </label>
        <label style={S.label}>Password
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={S.input} required />
        </label>
        <button type="submit" disabled={busy} style={S.btn}>{busy ? 'Signing in…' : 'Sign in'}</button>
        <p style={S.hint}>Demo: maya@papertrail.app · papertrail</p>
      </form>
    </div>
  );
}

const S = {
  wrap: { minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#F6F4EF', fontFamily: "'Instrument Sans', system-ui, sans-serif" },
  card: { width: 380, background: '#FFFFFF', border: '1px solid #E3DED3', borderRadius: 16, padding: 32, display: 'flex', flexDirection: 'column', gap: 14 },
  logo: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 },
  logoIcon: { width: 36, height: 36, borderRadius: 10, background: '#0B6B57', display: 'grid', placeItems: 'center' },
  logoTitle: { fontSize: 18, fontWeight: 600, letterSpacing: '-0.03em' },
  logoSub: { fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: '#7B8288', letterSpacing: '0.06em', textTransform: 'uppercase' },
  h1: { fontSize: 22, fontWeight: 600, margin: 0, letterSpacing: '-0.02em' },
  sub: { fontSize: 14, color: '#6A7176', margin: '0 0 8px' },
  label: { display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600, color: '#4A5258' },
  input: { marginTop: 2, padding: '10px 12px', border: '1px solid #E3DED3', borderRadius: 10, fontSize: 14, outline: 'none', fontFamily: 'inherit' },
  btn: { marginTop: 8, background: '#0B6B57', color: '#FFFFFF', border: 0, borderRadius: 10, padding: '12px 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  err: { background: '#FBEFEE', color: '#B3261E', border: '1px solid #E9D5D3', borderRadius: 8, padding: '10px 12px', fontSize: 13 },
  hint: { fontSize: 12, color: '#9AA0A4', textAlign: 'center', margin: '4px 0 0', fontFamily: "'IBM Plex Mono', monospace" },
};
