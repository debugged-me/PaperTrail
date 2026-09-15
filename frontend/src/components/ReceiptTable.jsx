// src/components/ReceiptTable.jsx — receipts table/grid view
import { cat, money } from '../constants.js';

export default function ReceiptTable({ rows, view, sortKey, sortDir, sortBy, onOpen, onDelete }) {
  const arrow = (k) => sortKey === k ? (sortDir === 'asc' ? ' ↑' : ' ↓') : '';

  if (view === 'grid') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
        {rows.map(r => {
          const c = cat(r.cat);
          return (
            <div key={r.id} onClick={() => onOpen(r)} style={{ background: '#FFFFFF', border: '1px solid #E3DED3', borderRadius: 12, padding: 14, cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ fontSize: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '-0.01em' }}>{r.merchant}</div>
                <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: c.tint, color: c.color, border: `1px solid ${c.border}` }}>
                  {r.cat || 'Uncategorised'}
                </span>
              </div>
              <div style={{ fontSize: 12, color: '#6A7176', marginTop: 6 }}>{r.pay}{r.ded ? ' · deductible' : ''}</div>
              <div style={{ fontSize: 13, color: '#4A5258', marginTop: 8, fontFamily: "'IBM Plex Mono', monospace" }}>
                {r.items[0] ? `${r.items[0][0]} ${r.items[0][1]}` : ''}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                <span style={{ fontSize: 12, color: '#9AA0A4' }}>{r.date}</span>
                <span style={{ fontSize: 16, fontWeight: 600 }}>{money(r.amount)}</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #E3DED3', borderRadius: 12, overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #E3DED3' }}>
            {[['merchant', 'Merchant'], ['date', 'Date'], ['cat', 'Category'], ['amount', 'Amount']].map(([key, label]) => (
              <th key={key} onClick={() => sortBy(key)} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#6A7176', cursor: 'pointer' }}>
                {label}{arrow(key)}
              </th>
            ))}
            <th style={{ width: 40 }} />
          </tr>
        </thead>
        <tbody>
          {rows.map(r => {
            const c = cat(r.cat);
            return (
              <tr key={r.id} onClick={() => onOpen(r)} style={{ borderBottom: '1px solid #F1EEE7', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = '#FBFAF7'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '-0.01em', fontSize: 13.5 }}>{r.merchant}</div>
                  <div style={{ fontSize: 12, color: '#6A7176', marginTop: 2 }}>{r.pay}{r.ded ? ' · deductible' : ''}</div>
                </td>
                <td style={{ padding: '14px 16px', fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: '#4A5258' }}>{r.date}</td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 99, background: c.tint, color: c.color, border: `1px solid ${c.border}` }}>
                    {r.cat || 'Uncategorised'}
                  </span>
                </td>
                <td style={{ padding: '14px 16px', fontWeight: 600, fontSize: 14.5, textAlign: 'right' }}>{money(r.amount)}</td>
                <td style={{ padding: '14px 12px' }}>
                  <button onClick={(e) => { e.stopPropagation(); onDelete(r); }} title="Delete"
                    style={{ border: 0, background: 'transparent', cursor: 'pointer', color: '#9AA0A4', padding: 6, borderRadius: 6 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
