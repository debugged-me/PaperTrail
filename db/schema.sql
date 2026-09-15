-- PaperTrail — digital receipt filing cabinet
-- Run: /Applications/XAMPP/xamppfiles/bin/mysql -u root < db/schema.sql

CREATE DATABASE IF NOT EXISTS papertrail
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE papertrail;

-- ───────────────────────── Users ─────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  email         VARCHAR(255) NOT NULL UNIQUE,
  name          VARCHAR(120) NOT NULL,
  initials      VARCHAR(4)   NOT NULL DEFAULT 'MR',
  password_hash VARCHAR(255) NOT NULL,
  monthly_budget DECIMAL(10,2) NOT NULL DEFAULT 3000.00,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ───────────────────────── Categories ─────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id      INT AUTO_INCREMENT PRIMARY KEY,
  name    VARCHAR(40) NOT NULL UNIQUE,
  color   VARCHAR(7)  NOT NULL,           -- hex, e.g. #B4690E
  tint    VARCHAR(7)  NOT NULL,
  border  VARCHAR(7)  NOT NULL,
  budget  DECIMAL(10,2) NOT NULL DEFAULT 0,
  ws      ENUM('personal','business','both') NOT NULL DEFAULT 'both',
  sort    INT NOT NULL DEFAULT 0
) ENGINE=InnoDB;

-- ───────────────────────── Receipts ─────────────────────────
CREATE TABLE IF NOT EXISTS receipts (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  merchant    VARCHAR(200) NOT NULL,
  date        DATE NOT NULL,
  amount      DECIMAL(10,2) NOT NULL,
  tax         DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  category_id INT NULL,
  workspace   ENUM('personal','business') NOT NULL DEFAULT 'personal',
  payment     VARCHAR(60) NOT NULL DEFAULT '',
  address     VARCHAR(255) NOT NULL DEFAULT '',
  note        TEXT,
  deductible   TINYINT(1) NOT NULL DEFAULT 0,
  confidence   JSON NULL,                 -- {merchant:"low",date:"ok",...}
  file_path   VARCHAR(255) NOT NULL DEFAULT '',
  file_mime   VARCHAR(80)  NOT NULL DEFAULT '',
  file_size   INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_receipt_user     FOREIGN KEY (user_id)     REFERENCES users(id)     ON DELETE CASCADE,
  CONSTRAINT fk_receipt_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  INDEX idx_receipt_user_date (user_id, date),
  INDEX idx_receipt_ws (workspace),
  INDEX idx_receipt_cat (category_id)
) ENGINE=InnoDB;

-- ───────────────────────── Line items ─────────────────────────
CREATE TABLE IF NOT EXISTS receipt_items (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  receipt_id INT NOT NULL,
  name       VARCHAR(200) NOT NULL,
  price      DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  sort       INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_item_receipt FOREIGN KEY (receipt_id) REFERENCES receipts(id) ON DELETE CASCADE,
  INDEX idx_item_receipt (receipt_id)
) ENGINE=InnoDB;

-- ───────────────────────── Seed data ─────────────────────────

-- Demo user (password: "papertrail" — bcrypt hash)
INSERT INTO users (email, name, initials, password_hash, monthly_budget)
VALUES (
  'maya@papertrail.app',
  'Maya Reyes',
  'MR',
  '$2y$10$wK8m3qZ9rV2xT6nL4hJ8oO3qF5sC7uB9wY1aD3eG6iK0mN2pR4sT',
  3000.00
) ON DUPLICATE KEY UPDATE name = name;

-- Categories
INSERT INTO categories (name, color, tint, border, budget, ws, sort) VALUES
  ('Meals',   '#B4690E', '#FBF2E0', '#F0DCB4', 520.00,  'both', 1),
  ('Expense', '#0B6B57', '#E6F0EC', '#C6DED7', 1400.00, 'both', 2),
  ('Travel',  '#2A5C8A', '#E7EEF5', '#C7D8E8', 900.00,  'both', 3),
  ('Hygiene', '#7A4B8F', '#F1EAF4', '#DFCDE6', 180.00,  'both', 4)
ON DUPLICATE KEY UPDATE name = name;

-- Seed receipts for the demo user (id=1)
INSERT INTO receipts (user_id, merchant, date, amount, tax, category_id, workspace, payment, address, deductible, confidence, file_path) VALUES
  (1, 'Sightglass Coffee',     '2026-09-12',  18.40,  1.52, (SELECT id FROM categories WHERE name='Meals'),   'personal', 'Visa ·· 4417', '270 7th St, San Francisco CA', 0, '{"merchant":"ok","date":"ok","total":"ok","cat":"ok"}', ''),
  (1, 'Alaska Airlines',       '2026-09-11', 412.60, 31.20, (SELECT id FROM categories WHERE name='Travel'),  'business',  'Amex ·· 1009', 'Confirmation QJ4T2M',         1, '{}', ''),
  (1, 'Walgreens #2841',       '2026-09-10',  34.17,  2.82, (SELECT id FROM categories WHERE name='Hygiene'), 'personal', 'Visa ·· 4417', '1372 Market St, San Francisco CA', 0, '{}', ''),
  (1, 'Kinkos Print & Ship',   '2026-09-09',  96.85,  7.98, NULL,                                            'business',  'Amex ·· 1009', '1967 Market St, San Francisco CA', 1, '{"merchant":"low","cat":"low"}', ''),
  (1, 'Nopa',                  '2026-09-08', 142.90, 12.66, (SELECT id FROM categories WHERE name='Meals'),   'business',  'Amex ·· 1009', '560 Divisadero St, San Francisco CA', 1, '{}', ''),
  (1, 'Uber',                  '2026-09-07',  27.35,  0.00, (SELECT id FROM categories WHERE name='Travel'),  'business',  'Amex ·· 1009', 'Trip 8f21c',                   1, '{"date":"low"}', ''),
  (1, 'Whole Foods Market',    '2026-09-06',  88.12,  4.20, (SELECT id FROM categories WHERE name='Meals'),   'personal', 'Visa ·· 4417', '399 4th St, San Francisco CA', 0, '{}', ''),
  (1, 'Figma',                 '2026-09-05',  45.00,  0.00, (SELECT id FROM categories WHERE name='Expense'), 'business',  'Amex ·· 1009', 'Invoice FIG-88421',            1, '{}', ''),
  (1, 'Chevron',               '2026-09-04',  61.24,  0.00, (SELECT id FROM categories WHERE name='Travel'),  'personal', 'Visa ·· 4417', '1500 Bryant St, San Francisco CA', 0, '{}', ''),
  (1, 'Rainbow Grocery',       '2026-09-02',  23.86,  1.06, (SELECT id FROM categories WHERE name='Hygiene'), 'personal', 'Cash',         '1745 Folsom St, San Francisco CA', 0, '{"total":"low"}', ''),
  (1, 'Notion Labs',           '2026-09-01', 120.00,  0.00, (SELECT id FROM categories WHERE name='Expense'), 'business', 'Amex ·· 1009', 'Invoice NTN-20946',            1, '{}', ''),
  (1, 'Blue Bottle Coffee',    '2026-08-29',  12.75,  1.05, (SELECT id FROM categories WHERE name='Meals'),   'personal', 'Visa ·· 4417', '66 Mint St, San Francisco CA', 0, '{}', ''),
  (1, 'Office Depot',          '2026-08-27', 158.43, 13.06, (SELECT id FROM categories WHERE name='Expense'), 'business', 'Amex ·· 1009', '55 Chestnut St, San Francisco CA', 1, '{}', ''),
  (1, 'Hotel Kabuki',          '2026-08-24', 384.00, 52.10, NULL,                                            'business',  'Amex ·· 1009', '1625 Post St, San Francisco CA', 1, '{"cat":"low","merchant":"low"}', '')
ON DUPLICATE KEY UPDATE merchant = merchant;

-- Line items for each seeded receipt
INSERT INTO receipt_items (receipt_id, name, price, sort) VALUES
  ((SELECT id FROM receipts WHERE merchant='Sightglass Coffee'    AND user_id=1 LIMIT 1), 'Cortado x2',       9.00, 0),
  ((SELECT id FROM receipts WHERE merchant='Sightglass Coffee'    AND user_id=1 LIMIT 1), 'Almond croissant', 6.50, 1),
  ((SELECT id FROM receipts WHERE merchant='Sightglass Coffee'    AND user_id=1 LIMIT 1), 'Tip',              1.38, 2),
  ((SELECT id FROM receipts WHERE merchant='Alaska Airlines'       AND user_id=1 LIMIT 1), 'SFO-SEA 09/18',  286.00, 0),
  ((SELECT id FROM receipts WHERE merchant='Alaska Airlines'       AND user_id=1 LIMIT 1), 'Seat 12A',        45.00, 1),
  ((SELECT id FROM receipts WHERE merchant='Alaska Airlines'       AND user_id=1 LIMIT 1), 'Bag fee',         50.40, 2),
  ((SELECT id FROM receipts WHERE merchant='Walgreens #2841'       AND user_id=1 LIMIT 1), 'Toothpaste 2pk',   8.99, 0),
  ((SELECT id FROM receipts WHERE merchant='Walgreens #2841'       AND user_id=1 LIMIT 1), 'Shampoo',        12.49, 1),
  ((SELECT id FROM receipts WHERE merchant='Walgreens #2841'       AND user_id=1 LIMIT 1), 'Razor cartridges', 9.87, 2),
  ((SELECT id FROM receipts WHERE merchant='Kinkos Print & Ship'   AND user_id=1 LIMIT 1), 'Color prints 240pp', 62.40, 0),
  ((SELECT id FROM receipts WHERE merchant='Kinkos Print & Ship'   AND user_id=1 LIMIT 1), 'Binding x3',      18.00, 1),
  ((SELECT id FROM receipts WHERE merchant='Kinkos Print & Ship'   AND user_id=1 LIMIT 1), 'Shipping',         8.47, 2),
  ((SELECT id FROM receipts WHERE merchant='Nopa'                  AND user_id=1 LIMIT 1), 'Client dinner x3', 118.00, 0),
  ((SELECT id FROM receipts WHERE merchant='Nopa'                  AND user_id=1 LIMIT 1), 'Wine',            18.00, 1),
  ((SELECT id FROM receipts WHERE merchant='Nopa'                  AND user_id=1 LIMIT 1), 'Service',          6.90, 2),
  ((SELECT id FROM receipts WHERE merchant='Uber'                  AND user_id=1 LIMIT 1), 'UberX 6.2mi',     23.10, 0),
  ((SELECT id FROM receipts WHERE merchant='Uber'                  AND user_id=1 LIMIT 1), 'Booking fee',      2.75, 1),
  ((SELECT id FROM receipts WHERE merchant='Uber'                  AND user_id=1 LIMIT 1), 'Tip',              1.50, 2),
  ((SELECT id FROM receipts WHERE merchant='Whole Foods Market'    AND user_id=1 LIMIT 1), 'Produce',         31.44, 0),
  ((SELECT id FROM receipts WHERE merchant='Whole Foods Market'    AND user_id=1 LIMIT 1), 'Coffee beans',   17.99, 1),
  ((SELECT id FROM receipts WHERE merchant='Whole Foods Market'    AND user_id=1 LIMIT 1), 'Pantry',         34.49, 2),
  ((SELECT id FROM receipts WHERE merchant='Figma'                 AND user_id=1 LIMIT 1), 'Professional seat', 45.00, 0),
  ((SELECT id FROM receipts WHERE merchant='Chevron'               AND user_id=1 LIMIT 1), 'Regular 13.8gal', 61.24, 0),
  ((SELECT id FROM receipts WHERE merchant='Rainbow Grocery'       AND user_id=1 LIMIT 1), 'Castile soap',    11.50, 0),
  ((SELECT id FROM receipts WHERE merchant='Rainbow Grocery'       AND user_id=1 LIMIT 1), 'Bar soap x3',      7.30, 1),
  ((SELECT id FROM receipts WHERE merchant='Rainbow Grocery'       AND user_id=1 LIMIT 1), 'Cotton rounds',   4.00, 2),
  ((SELECT id FROM receipts WHERE merchant='Notion Labs'           AND user_id=1 LIMIT 1), 'Team plan 8 seats', 120.00, 0),
  ((SELECT id FROM receipts WHERE merchant='Blue Bottle Coffee'    AND user_id=1 LIMIT 1), 'Drip x2',          8.50, 0),
  ((SELECT id FROM receipts WHERE merchant='Blue Bottle Coffee'    AND user_id=1 LIMIT 1), 'Pastry',           4.25, 1),
  ((SELECT id FROM receipts WHERE merchant='Office Depot'          AND user_id=1 LIMIT 1), 'Desk chair mat',  79.99, 0),
  ((SELECT id FROM receipts WHERE merchant='Office Depot'          AND user_id=1 LIMIT 1), 'Label printer',  58.00, 1),
  ((SELECT id FROM receipts WHERE merchant='Office Depot'          AND user_id=1 LIMIT 1), 'Paper 5rm',       20.44, 2),
  ((SELECT id FROM receipts WHERE merchant='Hotel Kabuki'          AND user_id=1 LIMIT 1), 'Room 2 nights',  300.00, 0),
  ((SELECT id FROM receipts WHERE merchant='Hotel Kabuki'          AND user_id=1 LIMIT 1), 'City tax',        31.90, 1),
  ((SELECT id FROM receipts WHERE merchant='Hotel Kabuki'          AND user_id=1 LIMIT 1), 'Parking',        52.10, 2);
