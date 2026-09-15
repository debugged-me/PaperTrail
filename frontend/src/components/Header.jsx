// src/components/Header.jsx — sticky top header
export default function Header({ user, ws, setWs, onUpload, onLogout }) {
  const isBiz = ws === 'business';
  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 30, background: 'rgba(246,244,239,0.88)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #E3DED3' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '14px clamp(14px, 3vw, 32px)', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 'auto' }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: '#0B6B57', display: 'grid', placeItems: 'center', boxShadow: '0 1px 2px rgba(11,107,87,.35)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/>
              <path d="M8 7h8"/><path d="M8 11h8"/><path d="M8 15h5"/>
            </svg>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.05 }}>
            <span style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.03em' }}>PaperTrail</span>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: '#7B8288', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Digital filing cabinet</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 4, padding: 3, background: '#EDE9E0', border: '1px solid #E3DED3', borderRadius: 10 }}>
          {[['personal', 'Personal'], ['business', 'Business']].map(([key, label]) => {
            const on = ws === key;
            return (
              <button key={key} onClick={() => setWs(key)}
                style={{ background: on ? '#FFFFFF' : 'transparent', boxShadow: on ? '0 1px 2px rgba(20,24,27,.14)' : 'none', color: on ? '#14181B' : '#6A7176', border: 0, borderRadius: 8, padding: '7px 14px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                {label}
              </button>
            );
          })}
        </div>

        <button onClick={onUpload} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#0B6B57', color: '#FFFFFF', border: 0, borderRadius: 10, padding: '10px 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer', boxShadow: '0 1px 2px rgba(11,107,87,.4), inset 0 1px 0 rgba(255,255,255,.12)' }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v15"/>
          </svg>
          Quick Scan
        </button>

        <button onClick={onLogout} title="Sign out" style={{ width: 38, height: 38, borderRadius: 10, border: '1px solid #E3DED3', background: '#FFFFFF', display: 'grid', placeItems: 'center', color: '#4A5258', cursor: 'pointer' }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>
          </svg>
        </button>

        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#14181B', color: '#F6F4EF', display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 600 }}>
          {user.initials}
        </div>
      </div>
    </header>
  );
}
