// src/components/StatsCards.jsx — dashboard summary cards
export default function StatsCards({ stats, ws, reviewCount, onReview }) {
  const hasReview = reviewCount > 0;
  return (
    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
      {/* Monthly total + budget */}
      <div style={{ flex: '1 1 280px', background: '#FFFFFF', border: '1px solid #E3DED3', borderRadius: 14, padding: 18 }}>
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#6A7176' }}>This month</div>
        <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: '-0.03em', marginTop: 4 }}>{stats.total}</div>
        <div style={{ fontSize: 13, color: stats.deltaColor, marginTop: 2 }}>{stats.delta} · {stats.count} receipts</div>
        <div style={{ marginTop: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6A7176', marginBottom: 6 }}>
            <span>Budget {stats.budgetPct}%</span><span>{stats.budgetCap} cap</span>
          </div>
          <div style={{ height: 8, borderRadius: 99, background: '#F1EEE7', overflow: 'hidden' }}>
            <div style={{ width: stats.budgetWidth, height: '100%', borderRadius: 99, background: stats.budgetColor }} />
          </div>
          <div style={{ fontSize: 12, color: '#6A7176', marginTop: 6 }}>{stats.budgetNote}</div>
        </div>
      </div>

      {/* Deductible */}
      <div style={{ flex: '1 1 200px', background: '#FFFFFF', border: '1px solid #E3DED3', borderRadius: 14, padding: 18 }}>
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#6A7176' }}>Deductible</div>
        <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: '-0.03em', marginTop: 4, color: '#0B6B57' }}>{stats.deductible}</div>
        <div style={{ fontSize: 13, color: '#6A7176', marginTop: 2 }}>{stats.deductibleCount} receipts marked deductible</div>
        <div style={{ height: 6, borderRadius: 99, background: '#E6F0EC', marginTop: 12, overflow: 'hidden' }}>
          <div style={{ width: stats.deductibleWidth, height: '100%', borderRadius: 99, background: '#0B6B57' }} />
        </div>
      </div>

      {/* Needs review */}
      <button onClick={onReview} style={{
        flex: '1 1 200px', textAlign: 'left', cursor: 'pointer',
        background: hasReview ? '#FBF2E0' : '#FFFFFF',
        border: `1px solid ${hasReview ? '#EFD9AC' : '#E3DED3'}`,
        borderRadius: 14, padding: 18,
      }}>
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: hasReview ? '#8A5209' : '#6A7176' }}>Needs review</div>
        <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: '-0.03em', marginTop: 4, color: hasReview ? '#8A5209' : '#14181B' }}>{reviewCount}</div>
        <div style={{ fontSize: 13, color: hasReview ? '#8A5209' : '#6A7176', marginTop: 2 }}>
          {hasReview ? 'receipts have no category yet' : 'everything is categorised'}
        </div>
        <div style={{ marginTop: 12, display: 'inline-block', padding: '6px 12px', borderRadius: 8, fontSize: 13, fontWeight: 600,
          border: `1px solid ${hasReview ? '#E0BE7E' : '#E3DED3'}`, color: hasReview ? '#6B3F07' : '#6A7176' }}>
          {hasReview ? 'Review now' : 'All clear'}
        </div>
      </button>

      {/* Category breakdown */}
      <div style={{ flex: '1 1 100%', background: '#FFFFFF', border: '1px solid #E3DED3', borderRadius: 14, padding: 18 }}>
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#6A7176', marginBottom: 12 }}>By category</div>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          {stats.categories.map(c => (
            <div key={c.name} style={{ flex: '1 1 140px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                <span style={{ fontWeight: 500 }}>{c.name}</span>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: c.over ? '#B3261E' : '#7B8288' }}>{c.spent} / {c.budget}</span>
              </div>
              <div style={{ height: 6, borderRadius: 99, background: '#F1EEE7', overflow: 'hidden' }}>
                <div style={{ width: c.width, height: '100%', borderRadius: 99, background: c.over ? '#B3261E' : c.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
