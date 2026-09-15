<?php
// api/export.php — CSV export of receipts
require_once __DIR__ . '/db.php';
$uid = requireAuth();

if (method() !== 'GET') error('Method not allowed', 405);

$ws = $_GET['ws'] ?? 'personal';
$stmt = db()->prepare(
  'SELECT r.*, c.name AS cat_name FROM receipts r
   LEFT JOIN categories c ON r.category_id = c.id
   WHERE r.user_id = ? AND r.workspace = ?
   ORDER BY r.date DESC');
$stmt->execute([$uid, $ws]);
$rows = $stmt->fetchAll();

header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename="papertrail-' . $ws . '-' . date('Y-m-d') . '.csv"');
header('Access-Control-Allow-Origin: ' . CORS_ORIGIN);
header('Access-Control-Allow-Credentials: true');

$out = fopen('php://output', 'w');
fputcsv($out, ['ID','Merchant','Date','Amount','Tax','Category','Workspace','Payment','Address','Deductible','Note']);

foreach ($rows as $r) {
  fputcsv($out, [
    $r['id'], $r['merchant'], $r['date'],
    number_format((float)$r['amount'], 2, '.', ''),
    number_format((float)$r['tax'], 2, '.', ''),
    $r['cat_name'] ?? '',
    $r['workspace'], $r['payment'], $r['address'],
    $r['deductible'] ? 'Yes' : 'No', $r['note'] ?? '',
  ]);
}
fclose($out);
