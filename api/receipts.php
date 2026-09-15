<?php
// api/receipts.php — CRUD for receipts
require_once __DIR__ . '/db.php';
$uid = requireAuth();

$pdo = db();
$id   = isset($_GET['id'])   ? (int)$_GET['id']   : null;
$path = $_GET['action'] ?? '';

// Normalize date: accept MM-DD-YYYY or YYYY-MM-DD, always store as YYYY-MM-DD
function normDate(?string $d): string {
  if (!$d) return date('Y-m-d');
  $d = trim($d);
  if (preg_match('#^\d{4}-\d{2}-\d{2}$#', $d)) return $d;       // already YYYY-MM-DD
  if (preg_match('#^(\d{2})[-/](\d{2})[-/](\d{4})$#', $d, $m)) return "$m[3]-$m[1]-$m[2]"; // MM-DD-YYYY
  if (preg_match('#^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$#', $d, $m)) return sprintf('%s-%02d-%02d', $m[3], $m[1], $m[2]);
  return date('Y-m-d');
}

switch (method()) {
  case 'GET':    $id ? getOne($pdo, $uid, $id) : listAll($pdo, $uid); break;
  case 'POST':   create($pdo, $uid);   break;
  case 'PUT':    update($pdo, $uid, $id); break;
  case 'DELETE': delete($pdo, $uid, $id); break;
  default:       error('Method not allowed', 405);
}

// ───────────────────────── GET /api/receipts ─────────────────────────
function listAll(PDO $pdo, int $uid): void {
  $ws     = $_GET['ws']     ?? null;   // personal | business
  $filter = $_GET['filter'] ?? 'All';  // All | <category> | Needs review
  $q      = trim($_GET['q'] ?? '');
  $sort   = $_GET['sort']   ?? 'date';
  $dir    = strtolower($_GET['dir'] ?? 'desc');

  $sql = 'SELECT r.*, c.name AS cat_name, c.color, c.tint, c.border
          FROM receipts r LEFT JOIN categories c ON r.category_id = c.id
          WHERE r.user_id = ?';
  $args = [$uid];

  if ($ws === 'personal' || $ws === 'business') {
    $sql .= ' AND r.workspace = ?'; $args[] = $ws;
  }
  if ($filter === 'Needs review') {
    $sql .= ' AND r.category_id IS NULL';
  } elseif ($filter !== 'All') {
    $sql .= ' AND c.name = ?'; $args[] = $filter;
  }
  if ($q !== '') {
    $sql .= ' AND (r.merchant LIKE ? OR r.payment LIKE ? OR r.address LIKE ? OR r.note LIKE ?)';
    $like = "%$q%"; array_push($args, $like, $like, $like, $like);
  }

  $allowed = ['date' => 'r.date', 'amount' => 'r.amount', 'merchant' => 'r.merchant', 'cat' => 'c.name'];
  $sortCol = $allowed[$sort] ?? 'r.date';
  $sortDir = $dir === 'asc' ? 'ASC' : 'DESC';
  $sql .= " ORDER BY $sortCol $sortDir";

  $rows = $pdo->prepare($sql); $rows->execute($args); $receipts = $rows->fetchAll();
  $ids = array_column($receipts, 'id');
  $items = $ids ? fetchItems($pdo, $ids) : [];

  json(array_map(fn($r) => receiptShape($r, $items[$r['id']] ?? []), $receipts));
}

// ───────────────────────── GET /api/receipts?id=N ─────────────────────────
function getOne(PDO $pdo, int $uid, int $id): void {
  $stmt = $pdo->prepare('SELECT r.*, c.name AS cat_name, c.color, c.tint, c.border
                         FROM receipts r LEFT JOIN categories c ON r.category_id = c.id
                         WHERE r.id = ? AND r.user_id = ?');
  $stmt->execute([$id, $uid]);
  $r = $stmt->fetch();
  if (!$r) error('Receipt not found', 404);
  $items = fetchItems($pdo, [$id]);
  json(receiptShape($r, $items[$id] ?? []));
}

// ───────────────────────── POST /api/receipts ─────────────────────────
function create(PDO $pdo, int $uid): void {
  $b = body();
  $catId = resolveCategory($pdo, $b['cat'] ?? null);
  $stmt = $pdo->prepare(
    'INSERT INTO receipts (user_id, merchant, date, amount, tax, category_id, workspace, payment, address, note, deductible, confidence, file_path, file_mime, file_size)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)');
  $stmt->execute([
    $uid, $b['merchant'] ?? '', normDate($b['date'] ?? null),
    (float)($b['amount'] ?? 0), (float)($b['tax'] ?? 0), $catId,
    $b['ws'] ?? 'personal', $b['pay'] ?? '', $b['addr'] ?? '',
    $b['note'] ?? '', !empty($b['ded']) ? 1 : 0,
    json_encode($b['conf'] ?? new stdClass),
    $b['file_path'] ?? '', $b['file_mime'] ?? '', (int)($b['file_size'] ?? 0),
  ]);
  $id = (int)$pdo->lastInsertId();
  if (!empty($b['items']) && is_array($b['items'])) insertItems($pdo, $id, $b['items']);
  getOne($pdo, $uid, $id);
}

// ───────────────────────── PUT /api/receipts?id=N ─────────────────────────
function update(PDO $pdo, int $uid, ?int $id): void {
  if (!$id) error('Receipt id required', 422);
  $b = body();
  $catId = resolveCategory($pdo, $b['cat'] ?? null);
  $stmt = $pdo->prepare(
    'UPDATE receipts SET merchant=?, date=?, amount=?, tax=?, category_id=?, workspace=?, payment=?, address=?, note=?, deductible=?, confidence=? WHERE id=? AND user_id=?');
  $stmt->execute([
    $b['merchant'] ?? '', normDate($b['date'] ?? null),
    (float)($b['amount'] ?? 0), (float)($b['tax'] ?? 0), $catId,
    $b['ws'] ?? 'personal', $b['pay'] ?? '', $b['addr'] ?? '',
    $b['note'] ?? '', !empty($b['ded']) ? 1 : 0,
    json_encode($b['conf'] ?? new stdClass), $id, $uid,
  ]);
  if (array_key_exists('items', $b)) {
    $pdo->prepare('DELETE FROM receipt_items WHERE receipt_id = ?')->execute([$id]);
    if (is_array($b['items']) && !empty($b['items'])) insertItems($pdo, $id, $b['items']);
  }
  getOne($pdo, $uid, $id);
}

// ───────────────────────── DELETE /api/receipts?id=N ─────────────────────────
function delete(PDO $pdo, int $uid, ?int $id): void {
  if (!$id) error('Receipt id required', 422);
  $stmt = $pdo->prepare('SELECT file_path FROM receipts WHERE id = ? AND user_id = ?');
  $stmt->execute([$id, $uid]);
  $row = $stmt->fetch();
  if (!$row) error('Receipt not found', 404);
  if ($row['file_path'] && is_file(UPLOAD_DIR . $row['file_path'])) {
    @unlink(UPLOAD_DIR . $row['file_path']);
  }
  $pdo->prepare('DELETE FROM receipts WHERE id = ? AND user_id = ?')->execute([$id, $uid]);
  json(['ok' => true, 'id' => $id]);
}

// ───────────────────────── Helpers ─────────────────────────
function resolveCategory(PDO $pdo, $name): ?int {
  if (!$name) return null;
  $stmt = $pdo->prepare('SELECT id FROM categories WHERE name = ?');
  $stmt->execute([$name]);
  $row = $stmt->fetch();
  return $row ? (int)$row['id'] : null;
}

function fetchItems(PDO $pdo, array $ids): array {
  $in = implode(',', array_fill(0, count($ids), '?'));
  $stmt = $pdo->prepare("SELECT * FROM receipt_items WHERE receipt_id IN ($in) ORDER BY sort");
  $stmt->execute($ids);
  $out = [];
  foreach ($stmt->fetchAll() as $it) $out[(int)$it['receipt_id']][] = $it;
  return $out;
}

function insertItems(PDO $pdo, int $rid, array $items): void {
  $stmt = $pdo->prepare('INSERT INTO receipt_items (receipt_id, name, price, sort) VALUES (?,?,?,?)');
  foreach ($items as $i => $it) {
    $row = is_array($it) ? $it : [$it, '0.00'];
    $stmt->execute([$rid, $row[0] ?? $row['name'] ?? '', (float)($row[1] ?? $row['price'] ?? 0), $i]);
  }
}

function receiptShape(array $r, array $items): array {
  return [
    'id'        => (int)$r['id'],
    'merchant'  => $r['merchant'],
    'date'      => $r['date'],
    'amount'    => (float)$r['amount'],
    'tax'       => (float)$r['tax'],
    'cat'       => $r['cat_name'] ?? '',
    'catColor'  => $r['color']  ?? '#6A7176',
    'tint'      => $r['tint']    ?? '#F1EEE7',
    'tintBorder'=> $r['border']  ?? '#E3DED3',
    'ws'        => $r['workspace'],
    'pay'       => $r['payment'],
    'addr'      => $r['address'],
    'note'      => $r['note'],
    'ded'       => (bool)$r['deductible'],
    'conf'      => json_decode($r['confidence'] ?: '{}', true) ?: [],
    'file'      => $r['file_path'] ? UPLOAD_URL_PREFIX . $r['file_path'] : '',
    'fileMime'  => $r['file_mime'],
    'fileSize'  => (int)$r['file_size'],
    'items'     => array_map(fn($it) => [$it['name'], $it['price']], $items),
  ];
}
