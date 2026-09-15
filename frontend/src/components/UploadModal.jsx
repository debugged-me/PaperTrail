// src/components/UploadModal.jsx — file upload + OCR extraction flow
import { useState, useRef, useEffect } from 'react';
import { api } from '../api.js';
import { EXTRACT_STEPS } from '../constants.js';

export default function UploadModal({ ws, onClose, onExtracted }) {
  const [mode, setMode] = useState('drop');     // drop | camera
  const [extracting, setExtracting] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const fileRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => () => { clearInterval(timerRef.current); }, []);

  const startExtract = async (file) => {
    setExtracting(true); setStep(0); setError('');
    // Simulate the OCR steps visually while the upload happens
    timerRef.current = setInterval(() => {
      setStep(s => Math.min(s + 1, 4));
    }, 750);
    try {
      const res = await api.upload(file);
      // Wait for visual steps to finish
      setTimeout(() => {
        clearInterval(timerRef.current);
        onExtracted(res.extracted, { file: res.file, fileMime: res.fileMime, fileSize: res.fileSize });
      }, 600);
    } catch (e) {
      clearInterval(timerRef.current);
      setExtracting(false); setError(e.message);
    }
  };

  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (file) startExtract(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) startExtract(file);
  };

  const isBiz = ws === 'business';

  return (
    <div onClick={onClose} style={S.overlay}>
      <div onClick={e => e.stopPropagation()} style={S.modal}>
        <div style={S.header}>
          <h2 style={S.title}>{extracting ? 'Extracting data…' : 'Scan a receipt'}</h2>
          <button onClick={onClose} style={S.closeBtn}>✕</button>
        </div>
        <p style={S.subtitle}>
          {extracting ? 'Hold tight — this takes a few seconds' : isBiz ? 'Filed to Business · tagged deductible by default' : 'Filed to Personal'}
        </p>

        {error && <div style={S.error}>{error}</div>}

        {extracting ? (
          <div style={{ marginTop: 20 }}>
            <div style={{ height: 6, borderRadius: 99, background: '#F1EEE7', overflow: 'hidden', marginBottom: 20 }}>
              <div style={{ width: Math.min(100, (step / 4) * 100 + 8) + '%', height: '100%', borderRadius: 99, background: '#0B6B57', transition: 'width .5s' }} />
            </div>
            {EXTRACT_STEPS.map((label, i) => {
              const done = step > i, active = step === i;
              return (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 600,
                    background: done ? '#0B6B57' : active ? '#CFE3DB' : '#F1EEE7',
                    color: done ? '#FFFFFF' : 'transparent', border: 'none' }}>
                    {done ? '✓' : ''}
                  </div>
                  <span style={{ fontSize: 14, color: done ? '#14181B' : active ? '#4A5258' : '#9AA0A4', fontWeight: active ? 500 : 400 }}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 4, padding: 3, background: '#EDE9E0', border: '1px solid #E3DED3', borderRadius: 10, marginBottom: 16, width: 'fit-content' }}>
              {[['drop', 'Upload'], ['camera', 'Camera']].map(([key, label]) => (
                <button key={key} onClick={() => setMode(key)}
                  style={{ background: mode === key ? '#FFFFFF' : 'transparent', boxShadow: mode === key ? '0 1px 2px rgba(20,24,27,.14)' : 'none', color: mode === key ? '#14181B' : '#6A7176', border: 0, borderRadius: 8, padding: '7px 14px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                  {label}
                </button>
              ))}
            </div>

            {mode === 'drop' ? (
              <div onDrop={onDrop} onDragOver={e => e.preventDefault()} onClick={() => fileRef.current?.click()}
                style={{ border: '2px dashed #C9C2B4', borderRadius: 14, padding: 48, textAlign: 'center', cursor: 'pointer', background: '#FBFAF7' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9AA0A4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 12px' }}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v15"/>
                </svg>
                <div style={{ fontSize: 15, fontWeight: 500, color: '#4A5258' }}>Drag a receipt here or click to browse</div>
                <div style={{ fontSize: 13, color: '#9AA0A4', marginTop: 4 }}>JPG, PNG, WEBP, HEIC · up to 10 MB</div>
                <input ref={fileRef} type="file" accept="image/*" onChange={onFile} style={{ display: 'none' }} />
              </div>
            ) : (
              <div onClick={() => fileRef.current?.click()} style={{ border: '2px dashed #C9C2B4', borderRadius: 14, padding: 48, textAlign: 'center', cursor: 'pointer', background: '#FBFAF7' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9AA0A4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 12px' }}>
                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>
                </svg>
                <div style={{ fontSize: 15, fontWeight: 500, color: '#4A5258' }}>Take a photo of your receipt</div>
                <div style={{ fontSize: 13, color: '#9AA0A4', marginTop: 4 }}>Click to open camera</div>
                <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={onFile} style={{ display: 'none' }} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const S = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(20,24,27,0.4)', backdropFilter: 'blur(4px)', display: 'grid', placeItems: 'center', zIndex: 100 },
  modal: { width: 440, maxWidth: '90vw', background: '#FFFFFF', borderRadius: 16, padding: 24, boxShadow: '0 20px 60px rgba(20,24,27,.3)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 600, margin: 0, letterSpacing: '-0.02em' },
  closeBtn: { border: 0, background: 'transparent', fontSize: 18, cursor: 'pointer', color: '#9AA0A4', padding: '4px 8px' },
  subtitle: { fontSize: 14, color: '#6A7176', marginTop: 4 },
  error: { background: '#FBEFEE', color: '#B3261E', border: '1px solid #E9D5D3', borderRadius: 8, padding: '10px 12px', fontSize: 13, marginTop: 12 },
};
