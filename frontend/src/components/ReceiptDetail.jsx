// src/components/ReceiptDetail.jsx — receipt detail / verify modal
import { CAT_NAMES, cat, money } from '../constants.js';

export default function ReceiptDetail({ draft, draftId, categories, setDraft, onClose, onSave, onDelete }) {
  const d = draft;
  const dAmount = Number(String(d.amount).replace(/[^0-9.]/g, '')) || 0;
  const dTax = Number(String(d.tax).replace(/[^0-9.]/g, '')) || 0;
  const flags = true;

  const conf = (field) => {
    const low = flags && d.conf && d.conf[field] === 'low';
    return {
      border: low ? '#EFD9AC' : '#E3DED3',
      label: low ? 'check' : '92%',
      color: low ? '#8A5209' : '#6A7176',
      bg: low ? '#FBF2E0' : '#F1EEE7',
    };
  };
  const cm = conf('merchant'), ct = conf('total'), cd = conf('date'), cc = conf('cat');
  const lowCount = d.conf ? Object.values(d.conf).filter(v => v === 'low').length : 0;

  const patch = (k, v) => setDraft({ ...d, [k]: v });

  return (
    <div onClick={onClose} style={S.overlay}>
      <div onClick={e => e.stopPropagation()} style={S.modal}>
        <div style={S.header}>
          <div>
            <h2 style={S.title}>{draftId ? 'Receipt detail' : 'Verify extracted data'}</h2>
            <p style={S.subtitle}>{draftId ? 'Edit any field — changes save to your filing cabinet.' : 'We filled these in from the scan. Check the flagged fields before saving.'}</p>
          </div>
          <button onClick={onClose} style={S.closeBtn}>✕</button>
        </div>

        {lowCount > 0 && (
          <div style={{ marginTop: 12, background: '#FBF2E0', border: '1px solid #EFD9AC', borderRadius: 10, padding: '12px 14px' }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: '#8A5209' }}>{lowCount} {lowCount === 1 ? 'field needs' : 'fields need'} a second look</div>
            <div style={{ fontSize: 12.5, color: '#8A5209', marginTop: 2 }}>The scan was blurry in places. Fields marked "check" came back below 80% confidence.</div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 16 }}>
          <Field label="Merchant" conf={cm}>
            <input value={d.merchant} onChange={e => patch('merchant', e.target.value)} style={S.input} />
          </Field>
          <Field label="Date" conf={cd}>
            <input value={d.date} onChange={e => patch('date', e.target.value)} style={S.input} />
          </Field>
          <Field label="Amount" conf={ct}>
            <input value={d.amount} onChange={e => patch('amount', e.target.value)} style={S.input} />
          </Field>
          <Field label="Tax" conf={{...ct, label: '92%'}}>
            <input value={d.tax} onChange={e => patch('tax', e.target.value)} style={S.input} />
          </Field>
          <Field label="Payment method" conf={{...cm, label: '92%'}}>
            <input value={d.pay} onChange={e => patch('pay', e.target.value)} style={S.input} />
          </Field>
          <div>
            <span style={S.fieldLabel}>Category {d.cat ? '' : <span style={{ color: '#B3261E', fontSize: 11, fontWeight: 600 }}>{cc.label}</span>}</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 7 }}>
              {CAT_NAMES.map(name => {
                const active = d.cat === name;
                const c = cat(name);
                return (
                  <button key={name} onClick={() => patch('cat', name)}
                    style={{ background: active ? c.tint : '#FFFFFF', color: active ? c.color : '#4A5258', border: `1px solid ${active ? c.border : '#E3DED3'}`, borderRadius: 8, padding: '7px 12px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                    {name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Line items */}
        {d.items && d.items.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <span style={S.fieldLabel}>Line items</span>
            <div style={{ marginTop: 8, background: '#FBFAF7', border: '1px solid #E3DED3', borderRadius: 10, padding: 12 }}>
              {d.items.map((it, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontFamily: "'IBM Plex Mono', monospace", fontSize: 13 }}>
                  <span>{it[0]}</span><span>${it[1]}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px dashed #E3DED3', marginTop: 8, paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 600 }}>
                <span>Subtotal</span><span>{money(dAmount - dTax)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: '#6A7176' }}>
                <span>Tax</span><span>{money(dTax)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'IBM Plex Mono', monospace", fontSize: 14, fontWeight: 600, marginTop: 4 }}>
                <span>Total</span><span>{money(dAmount)}</span>
              </div>
            </div>
            <div style={{ fontSize: 12, color: '#9AA0A4', marginTop: 8, fontFamily: "'IBM Plex Mono', monospace" }}>
              {d.addr && <>DATE {d.date}  TIME 18:42<br />{d.addr}<br /></>}
              PAID {d.pay}<br />{typeof d.file === 'string' ? d.file : 'IMG_2049.HEIC · 2.4 MB'}
            </div>
          </div>
        )}

        {/* Note */}
        <label style={{ display: 'block', marginTop: 16 }}>
          <span style={S.fieldLabel}>Note</span>
          <input value={d.note} onChange={e => patch('note', e.target.value)} placeholder="What was this for?" style={{ ...S.input, marginTop: 7, width: '100%' }} />
        </label>

        {/* Deductible toggle */}
        <button onClick={() => patch('ded', !d.ded)} style={{ marginTop: 16, width: '100%', display: 'flex', alignItems: 'center', gap: 12, background: d.ded ? '#E6F0EC' : '#FBFAF7', border: `1px solid ${d.ded ? '#C6DED7' : '#E3DED3'}`, borderRadius: 12, padding: '12px 14px', textAlign: 'left', cursor: 'pointer' }}>
          <span style={{ width: 40, height: 23, borderRadius: 99, background: d.ded ? '#0B6B57' : '#C9C2B4', flex: 'none', padding: 3, display: 'flex', justifyContent: d.ded ? 'flex-end' : 'flex-start' }}>
            <span style={{ width: 17, height: 17, borderRadius: '50%', background: '#FFFFFF', boxShadow: '0 1px 2px rgba(20,24,27,.25)' }} />
          </span>
          <span>
            <span style={{ display: 'block', fontSize: 13.5, fontWeight: 600 }}>Tax-deductible</span>
            <span style={{ display: 'block', fontSize: 12.5, color: '#6A7176', marginTop: 1 }}>{d.ded ? 'Counts toward your deductible total' : 'Personal spending — not claimed'}</span>
          </span>
        </button>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 9, marginTop: 20, flexWrap: 'wrap' }}>
          <button onClick={onSave} style={{ flex: '2 1 160px', background: '#0B6B57', color: '#FFFFFF', border: 0, borderRadius: 11, padding: '12px 16px', fontSize: 14.5, fontWeight: 600, cursor: 'pointer' }}>
            {draftId ? 'Save changes' : 'Looks right — file it'}
          </button>
          <button onClick={onClose} style={{ flex: '1 1 100px', background: '#FFFFFF', border: '1px solid #E3DED3', borderRadius: 11, padding: '12px 16px', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
          {onDelete && (
            <button onClick={onDelete} style={{ flex: 'none', background: '#FFFFFF', border: '1px solid #E9D5D3', color: '#B3261E', borderRadius: 11, padding: 12, cursor: 'pointer' }} aria-label="Delete receipt">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, conf, children }) {
  return (
    <label style={{ display: 'block' }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase', color: conf.color }}>
        {label}
        <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 4, background: conf.bg, color: conf.color, border: `1px solid ${conf.border}` }}>{conf.label}</span>
      </span>
      <div style={{ marginTop: 7 }}>{children}</div>
    </label>
  );
}

const S = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(20,24,27,0.4)', backdropFilter: 'blur(4px)', display: 'grid', placeItems: 'center', zIndex: 100, overflow: 'auto' },
  modal: { width: 560, maxWidth: '95vw', maxHeight: '92vh', overflow: 'auto', background: '#FFFFFF', borderRadius: 16, padding: 24, boxShadow: '0 20px 60px rgba(20,24,27,.3)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  title: { fontSize: 20, fontWeight: 600, margin: 0, letterSpacing: '-0.02em' },
  subtitle: { fontSize: 14, color: '#6A7176', marginTop: 4 },
  closeBtn: { border: 0, background: 'transparent', fontSize: 18, cursor: 'pointer', color: '#9AA0A4', padding: '4px 8px' },
  fieldLabel: { display: 'block', fontSize: 12, fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase', color: '#6A7176' },
  input: { width: '100%', padding: '10px 12px', border: '1px solid #E3DED3', borderRadius: 10, background: '#FBFAF7', fontSize: 14, outline: 'none', fontFamily: 'inherit' },
};
