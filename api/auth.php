<?php
// api/auth.php — login / logout / me
require_once __DIR__ . '/db.php';

switch (method()) {
  case 'POST':   // login
    $b = body();
    $email = trim($b['email'] ?? '');
    $pass  = $b['password'] ?? '';
    if (!$email || !$pass) error('Email and password required', 422);

    $stmt = db()->prepare('SELECT * FROM users WHERE email = ?');
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    if (!$user || !password_verify($pass, $user['password_hash']))
      error('Invalid credentials', 401);

    $_SESSION['user_id'] = (int)$user['id'];
    json(userShape($user));
    break;

  case 'DELETE': // logout
    session_destroy();
    json(['ok' => true]);
    break;

  case 'GET':    // current user
    $id = requireAuth();
    $stmt = db()->prepare('SELECT * FROM users WHERE id = ?');
    $stmt->execute([$id]);
    $user = $stmt->fetch();
    if (!$user) error('User not found', 404);
    json(userShape($user));
    break;

  default:
    error('Method not allowed', 405);
}

function userShape(array $u): array {
  return [
    'id'            => (int)$u['id'],
    'email'         => $u['email'],
    'name'          => $u['name'],
    'initials'      => $u['initials'],
    'monthlyBudget' => (float)$u['monthly_budget'],
  ];
}
