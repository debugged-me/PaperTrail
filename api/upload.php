<?php
// api/upload.php — file upload + OCR extraction
require_once __DIR__ . '/db.php';
$uid = requireAuth();

if (method() !== 'POST') error('Method not allowed', 405);

if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK)
  error('No file uploaded', 422);

$file = $_FILES['file'];
if ($file['size'] > UPLOAD_MAX_BYTES) error('File too large (max 10 MB)', 413);

$mime = $file['type'] ?: mime_content_type($file['tmp_name']);
$ext = match (true) {
  str_contains($mime, 'jpeg') || str_contains($mime, 'jpg') => 'jpg',
  str_contains($mime, 'png')  => 'png',
  str_contains($mime, 'webp') => 'webp',
  str_contains($mime, 'heic') => 'heic',
  default => 'img',
};
$name = date('Ymd-His') . '-' . bin2hex(random_bytes(4)) . '.' . $ext;
if (!is_dir(UPLOAD_DIR)) mkdir(UPLOAD_DIR, 0775, true);
if (!move_uploaded_file($file['tmp_name'], UPLOAD_DIR . $name))
  error('Failed to save file', 500);

// ── OCR ──
$ocr = match (OCR_MODE) {
  'gcv'        => ocrGcv(UPLOAD_DIR . $name, $mime),
  'simulated'  => ocrSimulated(),
  default      => ocrSimulated(),
};

json([
  'file'      => UPLOAD_URL_PREFIX . $name,
  'fileMime'  => $mime,
  'fileSize'  => $file['size'],
  'extracted' => $ocr,
]);

// ───────────────────────── Simulated OCR ─────────────────────────
// Returns a plausible receipt shape so the verify-detail flow works
// end-to-end without a real OCR engine. Mirrors the dashboard's PENDING.
function ocrSimulated(): array {
  return [
    'merchant' => 'Tartine Bakery',
    'date'     => date('Y-m-d'),
    'amount'   => '31.85',
    'tax'      => '2.63',
    'cat'      => '',
    'pay'      => 'Visa ·· 4417',
    'addr'     => '600 Guerrero St, San Francisco CA',
    'note'     => '',
    'conf'     => ['merchant' => 'low', 'cat' => 'low', 'total' => 'ok', 'date' => 'ok'],
    'items'    => [
      ['Country loaf', '12.00'],
      ['Morning bun x2', '11.00'],
      ['Latte', '6.22'],
    ],
  ];
}

// ───────────────────────── Google Cloud Vision OCR ─────────────────────────
function ocrGcv(string $path, string $mime): array {
  if (!GCV_API_KEY) return ocrSimulated();
  $image = base64_encode(file_get_contents($path));
  $body = json_encode([
    'requests' => [[
      'image'    => ['content' => $image],
      'features' => [['type' => 'DOCUMENT_TEXT_DETECTION', 'maxResults' => 1]],
    ]],
  ]);
  $ch = curl_init("https://vision.googleapis.com/v1/images:annotate?key=" . GCV_API_KEY);
  curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
    CURLOPT_POSTFIELDS => $body,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 30,
  ]);
  $res = curl_exec($ch);
  curl_close($ch);
  $data = json_decode($res ?: '', true);
  $text = $data['responses'][0]['fullTextAnnotation']['text'] ?? '';
  return parseReceiptText($text);
}

// ───────────────────────── Heuristic text → receipt ─────────────────────────
// Very rough line-based parser for GCV output. Real production would
// use an LLM or a dedicated receipt parser; this covers the basics.
function parseReceiptText(string $text): array {
  $lines = array_filter(array_map('trim', explode("\n", $text)));
  $merchant = $lines[0] ?? 'Unknown merchant';
  $total = 0.0; $tax = 0.0; $date = date('m-d-Y');
  $items = [];
  foreach ($lines as $ln) {
    if (preg_match('/total/i', $ln) && preg_match('/(\d+\.\d{2})/', $ln, $m)) $total = (float)$m[1];
    elseif (preg_match('/tax/i', $ln) && preg_match('/(\d+\.\d{2})/', $ln, $m)) $tax = (float)$m[1];
    elseif (preg_match('/(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/', $ln, $m)) $date = str_replace('/', '-', $m[1]);
    elseif (preg_match('/^(.+?)\s+\$?(\d+\.\d{2})$/', $ln, $m)) $items[] = [$m[1], $m[2]];
  }
  if (!$total && $items) $total = array_sum(array_map(fn($i) => (float)$i[1], $items));
  return [
    'merchant' => $merchant, 'date' => $date, 'amount' => number_format($total, 2, '.', ''),
    'tax' => number_format($tax, 2, '.', ''), 'cat' => '', 'pay' => '', 'addr' => '',
    'note' => '', 'conf' => [], 'items' => array_slice($items, 0, 8),
  ];
}
