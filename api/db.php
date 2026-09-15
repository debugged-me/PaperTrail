<?php
// api/db.php — PDO connection + helpers shared by all endpoints

require_once __DIR__ . '/config.php';

// ── CORS ──
header('Access-Control-Allow-Origin: ' . CORS_ORIGIN);
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

// ── Session ──
session_name(SESSION_NAME);
session_set_cookie_params([
  'lifetime' => SESSION_LIFETIME,
  'path'     => '/',
  'httponly'  => true,
  'samesite'  => 'Lax',
]);
session_start();

// ── PDO ──
function db(): PDO {
  static $pdo = null;
  if ($pdo === null) {
    $dsn = sprintf('mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4',
      DB_HOST, DB_PORT, DB_NAME);
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
      PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
      PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
      PDO::ATTR_EMULATE_PREPARES   => false,
    ]);
  }
  return $pdo;
}

// ── Response helpers ──
function json($data, int $code = 200): void {
  http_response_code($code);
  echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  exit;
}
function error(string $msg, int $code = 400): void {
  json(['error' => $msg], $code);
}

// ── Request parsing ──
function body(): array {
  $raw = file_get_contents('php://input');
  $data = json_decode($raw, true);
  return is_array($data) ? $data : $_POST;
}
function method(): string { return $_SERVER['REQUEST_METHOD']; }

// ── Auth ──
function userId(): ?int {
  return $_SESSION['user_id'] ?? null;
}
function requireAuth(): int {
  $id = userId();
  if (!$id) error('Not authenticated', 401);
  return $id;
}

// ── Money formatting (matches the dashboard's money()) ──
function money($n): string {
  return '$' . number_format((float)$n, 2, '.', ',');
}
function moneyShort($n): string {
  return '$' . number_format(round((float)$n), 0, '.', ',');
}
