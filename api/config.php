<?php
// api/config.php — PaperTrail configuration

// ── Database (XAMPP MariaDB defaults: root, no password) ──
define('DB_HOST', '127.0.0.1');
define('DB_PORT', 3306);
define('DB_NAME', 'papertrail');
define('DB_USER', 'root');
define('DB_PASS', '');

// ── Uploads ──
define('UPLOAD_DIR', __DIR__ . '/../uploads/');
define('UPLOAD_MAX_BYTES', 10 * 1024 * 1024);   // 10 MB
define('UPLOAD_URL_PREFIX', '/PaperTrail/uploads/');

// ── OCR ──
// 'simulated' | 'tesseract' (browser-side) | 'gcv' (Google Cloud Vision)
// The browser always has the option to run Tesseract.js; this controls the
// server-side fallback / GCV path.
define('OCR_MODE', getenv('OCR_MODE') ?: 'simulated');
define('GCV_API_KEY', getenv('GCV_API_KEY') ?: '');

// ── CORS (dev: allow Vite origin; prod: same-origin) ──
define('CORS_ORIGIN', getenv('CORS_ORIGIN') ?: 'http://localhost:5173');

// ── Session ──
define('SESSION_NAME', 'papertrail');
define('SESSION_LIFETIME', 60 * 60 * 24 * 7);   // 7 days
