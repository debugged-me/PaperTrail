<?php
// api/stats.php — dashboard summary (monthly totals, budget, deductible)
require_once __DIR__ . '/db.php';
$uid = requireAuth();

if (method() !== 'GET') error('Method not allowed', 405);

$ws = $_GET['ws'] ?? 'personal';
$pdo = db();

// This month (September 2026) and last month totals
$thisMonth = $pdo->prepare(
  'SELECT COALESCE(SUM(amount),0) AS total, COUNT(*) AS count
   FROM receipts WHERE user_id = ? AND workspace = ? AND DATE_FORMAT(date, "%Y-%m") = "2026-09"');
$thisMonth->execute([$uid, $ws]); $tm = $thisMonth->fetch();

$lastMonth = $pdo->prepare(
  'SELECT COALESCE(SUM(amount),0) AS total
   FROM receipts WHERE user_id = ? AND workspace = ? AND DATE_FORMAT(date, "%Y-%m") = "2026-08"');
$lastMonth->execute([$uid, $ws]); $lm = $lastMonth->fetch();

// Deductible this month
$ded = $pdo->prepare(
  'SELECT COALESCE(SUM(amount),0) AS total, COUNT(*) AS count
   FROM receipts WHERE user_id = ? AND workspace = ? AND deductible = 1 AND DATE_FORMAT(date, "%Y-%m") = "2026-09"');
$ded->execute([$uid, $ws]); $d = $ded->fetch();

// Needs review (no category)
$review = $pdo->prepare(
  'SELECT COUNT(*) AS count FROM receipts WHERE user_id = ? AND workspace = ? AND category_id IS NULL');
$review->execute([$uid, $ws]); $rv = $review->fetch();

// Per-category spend this month
$catSpend = $pdo->prepare(
  'SELECT c.name, c.color, c.tint, c.border, c.budget,
          COALESCE(SUM(r.amount),0) AS spent
   FROM categories c LEFT JOIN receipts r
     ON r.category_id = c.id AND r.user_id = ? AND r.workspace = ?
     AND DATE_FORMAT(r.date, "%Y-%m") = "2026-09"
   WHERE c.ws IN ("both", ?)
   GROUP BY c.id ORDER BY c.sort');
$catSpend->execute([$uid, $ws, $ws]); $cats = $catSpend->fetchAll();

// Monthly history (last 6 months)
$hist = $pdo->prepare(
  'SELECT DATE_FORMAT(date, "%b") AS label,
          DATE_FORMAT(date, "%Y-%m") AS ym,
          COALESCE(SUM(amount),0) AS total
   FROM receipts WHERE user_id = ? AND workspace = ?
   AND date >= DATE_SUB("2026-09-30", INTERVAL 5 MONTH)
   GROUP BY ym ORDER BY ym');
$hist->execute([$uid, $ws]); $history = $hist->fetchAll();

$monthTotal = (float)$tm['total'];
$lastTotal  = (float)$lm['total'];
$delta     = $lastTotal ? (($monthTotal - $lastTotal) / $lastTotal) * 100 : 0;

// User budget
$user = $pdo->prepare('SELECT monthly_budget FROM users WHERE id = ?');
$user->execute([$uid]); $budget = (float)$user->fetchColumn();
$pct = $budget ? round(($monthTotal / $budget) * 100) : 0;

json([
  'total'          => money($monthTotal),
  'totalRaw'        => $monthTotal,
  'count'           => (int)$tm['count'],
  'delta'           => ($delta >= 0 ? '+' : '') . round($delta) . '% vs August',
  'deltaColor'      => $delta > 0 ? '#B4690E' : '#0B6B57',
  'budgetPct'       => $pct,
  'budgetCap'       => moneyShort($budget),
  'budgetWidth'     => min(100, $pct) . '%',
  'budgetColor'     => $pct > 100 ? '#B3261E' : ($pct > 80 ? '#B4690E' : '#0B6B57'),
  'budgetNote'      => $pct > 100 ? money($monthTotal - $budget) . ' over cap' : money($budget - $monthTotal) . ' left this month',
  'deductible'      => money((float)$d['total']),
  'deductibleRaw'   => (float)$d['total'],
  'deductibleCount' => (int)$d['count'],
  'deductibleWidth' => ($monthTotal ? min(100, ((float)$d['total'] / $monthTotal) * 100) : 0) . '%',
  'reviewCount'      => (int)$rv['count'],
  'categories'      => array_map(fn($c) => [
    'name' => $c['name'], 'color' => $c['color'],
    'spent' => moneyShort((float)$c['spent']),
    'budget' => moneyShort((float)$c['budget'] * ($ws === 'business' ? 1.6 : 1)),
    'width' => min(100, ((float)$c['spent'] / max(1, (float)$c['budget'] * ($ws === 'business' ? 1.6 : 1))) * 100) . '%',
    'over' => (float)$c['spent'] > (float)$c['budget'] * ($ws === 'business' ? 1.6 : 1),
  ], $cats),
  'history' => array_map(fn($h) => [
    'label' => strtoupper($h['label']),
    'short' => '$' . (round((float)$h['total'] / 100) / 10) . 'k',
    'total' => (float)$h['total'],
    'current' => $h['ym'] === '2026-09',
  ], $history),
]);
