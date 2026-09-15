// src/components/Dashboard.jsx — main dashboard
import { useState, useEffect, useCallback } from 'react';
import { api } from '../api.js';
import { CAT_NAMES, cat, money, moneyShort, EXTRACT_STEPS } from '../constants.js';
import Header from './Header.jsx';
import Sidebar from './Sidebar.jsx';
import StatsCards from './StatsCards.jsx';
import ReceiptTable from './ReceiptTable.jsx';
import UploadModal from './UploadModal.jsx';
import ReceiptDetail from './ReceiptDetail.jsx';
import Toast from './Toast.jsx';

export default function Dashboard({ user, onLogout }) {
  const [receipts, setReceipts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [ws, setWs] = useState('personal');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [view, setView] = useState('table');
  const [sortKey, setSortKey] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [draft, setDraft] = useState(null);
  const [draftId, setDraftId] = useState(null);
  const [toast, setToast] = useState('');
  const [canUndo, setCanUndo] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [rs, cats, st] = await Promise.all([
        api.receipts({ ws, sort: sortKey, dir: sortDir }),
        api.categories(),
        api.stats(ws),
      ]);
      setReceipts(rs);
      setCategories(cats);
      setStats(st);
    } catch (e) {
      showToast(e.message);
    } finally {
      setLoading(false);
    }
  }, [ws, sortKey, sortDir]);

  useEffect(() => { load(); }, [load]);

  const showToast = (text, undo = false) => {
    setToast(text); setCanUndo(undo);
    setTimeout(() => { setToast(''); setCanUndo(false); setPendingDelete(null); }, 6000);
  };

  // ── Filtering (client-side on top of API's ws filter) ──
  const q = query.trim().toLowerCase();
  let rows = receipts.filter(r => {
    if (filter === 'Needs review' && r.cat) return false;
    if (filter !== 'All' && filter !== 'Needs review' && r.cat !== filter) return false;
    if (!q) return true;
    return (r.merchant + ' ' + r.cat + ' ' + r.date + ' ' + r.amount.toFixed(2) + ' ' + r.pay).toLowerCase().includes(q);
  });

  const sortBy = (key) => {
    const same = sortKey === key;
    setSortKey(key);
    setSortDir(same ? (sortDir === 'asc' ? 'desc' : 'asc') : (key === 'merchant' || key === 'cat' ? 'asc' : 'desc'));
  };

  const openReceipt = (r) => {
    setDraftId(r.id);
    setDraft({
      merchant: r.merchant, date: r.date, amount: r.amount.toFixed(2),
      tax: r.tax.toFixed(2), cat: r.cat, pay: r.pay, ded: r.ded,
      note: r.note || '', conf: r.conf || {}, items: r.items,
      addr: r.addr, file: r.file || ('receipt-' + r.id + '.jpg · stored ' + r.date),
    });
    setDetailOpen(true);
  };

  const saveDraft = async () => {
    if (!draft) return;
    const data = {
      merchant: draft.merchant, date: draft.date,
      amount: Number(String(draft.amount).replace(/[^0-9.]/g, '')) || 0,
      tax: Number(String(draft.tax).replace(/[^0-9.]/g, '')) || 0,
      cat: draft.cat, ws, pay: draft.pay, ded: draft.ded,
      note: draft.note, conf: draft.conf, items: draft.items, addr: draft.addr,
    };
    try {
      if (draftId) {
        await api.update(draftId, data);
        showToast('Changes saved to ' + draft.merchant);
      } else {
        await api.create(data);
        showToast(draft.merchant + ' filed · ' + money(data.amount));
      }
      setDetailOpen(false); setDraft(null); setDraftId(null);
      load();
    } catch (e) { showToast(e.message); }
  };

  const removeReceipt = async (r) => {
    setPendingDelete(r);
    setReceipts(receipts.filter(x => x.id !== r.id));
    try { await api.delete(r.id); }
    catch (e) { /* undo will re-create anyway */ }
    showToast('Deleted ' + r.merchant + ' · ' + money(r.amount), true);
  };

  const undoDelete = async () => {
    const r = pendingDelete;
    if (!r) return;
    setReceipts([r, ...receipts]);
    setPendingDelete(null);
    // Re-create in DB since we deleted it
    try {
      await api.create({
        merchant: r.merchant, date: r.date, amount: r.amount, tax: r.tax,
        cat: r.cat, ws: r.ws, pay: r.pay, addr: r.addr, ded: r.ded,
        note: r.note || '', conf: r.conf || {}, items: r.items || [],
      });
      showToast('Restored ' + r.merchant);
      load(); // reload to get the new ID
    } catch (e) { showToast(e.message); }
  };

  const onExtracted = (extracted, fileInfo) => {
    setDraft({
      ...extracted,
      file: fileInfo.file, fileMime: fileInfo.fileMime, fileSize: fileInfo.fileSize,
    });
    setDetailOpen(true);
    setUploadOpen(false);
  };

  const isBiz = ws === 'business';
  const missing = receipts.filter(r => !r.cat);

  return (
    <div style={{ minHeight: '100vh', background: '#F6F4EF', fontFamily: "'Instrument Sans', system-ui, sans-serif", color: '#14181B', letterSpacing: '-0.006em' }}>
      <Header user={user} ws={ws} setWs={(w) => { setWs(w); setFilter('All'); setQuery(''); }} onUpload={() => setUploadOpen(true)} onLogout={onLogout} />
      <main style={{ maxWidth: 1400, margin: '0 auto', padding: 'clamp(16px, 3vw, 28px) clamp(14px, 3vw, 32px) 64px', display: 'flex', gap: 'clamp(14px, 2vw, 24px)', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <Sidebar ws={ws} receiptCount={receipts.length} reviewCount={missing.length} />
        <div style={{ flex: '1 1 620px', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 18 }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.03em', margin: 0 }}>
                {isBiz ? 'Business expenses' : 'Good evening, ' + user.name.split(' ')[0]}
              </h1>
              <p style={{ fontSize: 14.5, color: '#6A7176', marginTop: 4, maxWidth: 480 }}>
                {isBiz ? 'Employee and company receipts, filed and ready for the accountant.'
                       : 'Every receipt you\'ve scanned, searchable down to the line item.'}
              </p>
            </div>
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search receipts…"
              style={{ flex: '0 1 280px', padding: '10px 14px', border: '1px solid #E3DED3', borderRadius: 10, background: '#FFFFFF', fontSize: 14, outline: 'none' }} />
          </div>

          {stats && <StatsCards stats={stats} ws={ws} reviewCount={missing.length} onReview={() => { setFilter('Needs review'); setQuery(''); }} />}

          {/* Filter chips */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '20px 0 14px' }}>
            {['All', ...CAT_NAMES, 'Needs review'].map(name => {
              const active = filter === name;
              const c = cat(name);
              const accent = name === 'Needs review' ? { color: '#8A5209', tint: '#FBF2E0', border: '#EFD9AC' } : c;
              return (
                <button key={name} onClick={() => setFilter(name)}
                  style={{
                    background: active ? (accent ? accent.tint : '#14181B') : '#FFFFFF',
                    color: active ? (accent ? accent.color : '#FFFFFF') : '#4A5258',
                    border: `1px solid ${active ? (accent ? accent.border : '#14181B') : '#E3DED3'}`,
                    borderRadius: 99, padding: '7px 14px', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  }}>
                  {name === 'Needs review' ? 'Needs review · ' + missing.length : name}
                </button>
              );
            })}
          </div>

          {/* View toggle + result count */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: '#6A7176' }}>
              {rows.length} {rows.length === 1 ? 'receipt' : 'receipts'} · {money(rows.reduce((t, r) => t + r.amount, 0))}
            </span>
            <div style={{ display: 'flex', gap: 4, padding: 3, background: '#EDE9E0', border: '1px solid #E3DED3', borderRadius: 10 }}>
              {['table', 'grid'].map(v => (
                <button key={v} onClick={() => setView(v)}
                  style={{
                    background: view === v ? '#FFFFFF' : 'transparent', color: view === v ? '#14181B' : '#6A7176',
                    border: 0, borderRadius: 8, padding: '6px 12px', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                    boxShadow: view === v ? '0 1px 2px rgba(20,24,27,.14)' : 'none',
                  }}>
                  {v === 'table' ? 'Table' : 'Grid'}
                </button>
              ))}
            </div>
          </div>

          {loading ? <div style={{ padding: 40, textAlign: 'center', color: '#9AA0A4' }}>Loading…</div> :
           rows.length === 0 ? (
             <div style={{ padding: 40, textAlign: 'center', background: '#FFFFFF', border: '1px solid #E3DED3', borderRadius: 12 }}>
               <p style={{ color: '#6A7176' }}>No receipts match your filters.</p>
               <button onClick={() => { setQuery(''); setFilter('All'); }} style={{ marginTop: 10, color: '#0B6B57', background: 'none', border: 0, cursor: 'pointer', fontWeight: 500 }}>Clear filters</button>
             </div>
           ) : (
             <ReceiptTable rows={rows} view={view} sortKey={sortKey} sortDir={sortDir}
               sortBy={sortBy} onOpen={openReceipt} onDelete={removeReceipt} />
           )}

          {/* Export */}
          <div style={{ marginTop: 20, padding: 16, background: '#FFFFFF', border: '1px solid #E3DED3', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <span style={{ fontSize: 13.5, color: '#4A5258' }}>
              {stats?.deductibleCount || 0} deductible receipts this month ({stats?.deductible || '$0.00'}). Export a CSV for your accountant or a PDF pack with the images attached.
            </span>
            <a href={api.exportUrl(ws)} style={{ background: '#0B6B57', color: '#FFFFFF', textDecoration: 'none', borderRadius: 10, padding: '10px 16px', fontSize: 14, fontWeight: 600 }}>
              Export CSV
            </a>
          </div>
        </div>
      </main>

      {uploadOpen && <UploadModal ws={ws} onClose={() => setUploadOpen(false)} onExtracted={onExtracted} />}
      {detailOpen && draft && (
        <ReceiptDetail draft={draft} draftId={draftId} categories={categories}
          setDraft={setDraft} onClose={() => { setDetailOpen(false); setDraft(null); setDraftId(null); }}
          onSave={saveDraft} onDelete={draftId ? () => {
            const r = receipts.find(x => x.id === draftId);
            setDetailOpen(false); setDraft(null); setDraftId(null);
            if (r) removeReceipt(r);
          } : null} />
      )}
      {toast && <Toast text={toast} canUndo={canUndo} onUndo={undoDelete} onDismiss={() => setToast('')} />}
    </div>
  );
}
