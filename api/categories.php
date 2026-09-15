<?php
// api/categories.php — list categories
require_once __DIR__ . '/db.php';
requireAuth();

$stmt = db()->query('SELECT * FROM categories ORDER BY sort');
$rows = $stmt->fetchAll();
json(array_map('catShape', $rows));

function catShape(array $c): array {
  return [
    'id'     => (int)$c['id'],
    'name'   => $c['name'],
    'color'  => $c['color'],
    'tint'   => $c['tint'],
    'border' => $c['border'],
    'budget' => (float)$c['budget'],
    'ws'     => $c['ws'],
  ];
}
