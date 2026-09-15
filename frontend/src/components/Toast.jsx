// src/components/Toast.jsx — toast notification
export default function Toast({ text, canUndo, onUndo, onDismiss }) {
  return (
    <div style={S.wrap}>
      <div style={S.toast}>
        <span style={S.text}>{text}</span>
        {canUndo && <button onClick={onUndo} style={S.undo}>Undo</button>}
        <button onClick={onDismiss} style={S.close}>✕</button>
      </div>
    </div>
  );
}

const S = {
  wrap: { position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 200 },
  toast: { display: 'flex', alignItems: 'center', gap: 12, background: '#14181B', color: '#FFFFFF', borderRadius: 12, padding: '12px 16px', boxShadow: '0 8px 24px rgba(20,24,27,.3)' },
  text: { fontSize: 14, fontWeight: 500 },
  undo: { background: 'transparent', color: '#7BD4C0', border: 0, fontSize: 14, fontWeight: 600, cursor: 'pointer', padding: 0 },
  close: { background: 'transparent', color: '#9AA0A4', border: 0, fontSize: 14, cursor: 'pointer', padding: 0 },
};
