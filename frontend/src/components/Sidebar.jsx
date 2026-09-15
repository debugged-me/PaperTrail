// src/components/Sidebar.jsx — left navigation
export default function Sidebar({ ws, receiptCount, reviewCount }) {
  const STORAGE_USED = 2.4, STORAGE_TOTAL = 5;
  const storagePct = Math.round((STORAGE_USED / STORAGE_TOTAL) * 100);

  const items = [
    { label: 'Dashboard', active: true },
    { label: 'Receipts', count: String(receiptCount).padStart(2, '0') },
    { label: 'Needs review', badge: String(reviewCount) },
    { label: 'Categories' },
    { label: 'Reports' },
    { label: 'Settings' },
  ];

  return (
    <nav style={{ flex: '0 1 226px', minWidth: 190, position: 'sticky', top: 82, display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {items.map(item => (
          <button key={item.label}
            style={{
              flex: '1 1 158px', display: 'flex', alignItems: 'center', gap: 10,
              background: item.active ? '#FFFFFF' : 'transparent',
              color: item.active ? '#14181B' : '#6A7176',
              border: 0, borderRadius: 10, padding: '9px 11px',
              fontSize: '13.5px', fontWeight: item.active ? 600 : 500,
              textAlign: 'left', cursor: 'pointer',
            }}>
            <span style={{ width: 6, height: 6, borderRadius: 2, background: item.active ? '#0B6B57' : 'transparent', flex: 'none' }} />
            {item.label}
            {item.count && <span style={{ marginLeft: 'auto', fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: '#8A9095' }}>{item.count}</span>}
            {item.badge && <span style={{ marginLeft: 'auto', background: reviewCount > 0 ? '#FBF2E0' : '#EDE9E0', color: reviewCount > 0 ? '#8A5209' : '#9AA0A4', borderRadius: 99, padding: '1px 7px', fontFamily: "'IBM Plex Mono', monospace", fontSize: 11 }}>{item.badge}</span>}
          </button>
        ))}
      </div>

      <div style={{ borderTop: '1px solid #E3DED3', paddingTop: 16 }}>
        <div style={{ fontSize: '11.5px', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#8A9095' }}>Filing cabinet</div>
        <div style={{ marginTop: 10, fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: '#4A5258' }}>{STORAGE_USED.toFixed(1)} GB used</div>
        <div style={{ height: 6, borderRadius: 99, background: '#E6E1D6', marginTop: 8, overflow: 'hidden' }}>
          <div style={{ width: storagePct + '%', height: '100%', borderRadius: 99, background: '#0B6B57' }} />
        </div>
        <div style={{ marginTop: 9, fontSize: 12, color: '#8A9095' }}>{(STORAGE_TOTAL - STORAGE_USED).toFixed(1)} GB free of {STORAGE_TOTAL} GB</div>
      </div>
    </nav>
  );
}
