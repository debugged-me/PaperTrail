# 🧾 PaperTrail

> *Welcome to **PaperTrail**! Say goodbye to faded ink and wallets stuffed with crumpled paper. This app is designed to scan, extract, and safely store your receipts in a searchable format. It is the ultimate digital filing cabinet for your daily expenses.*

---

## ✨ Features

- **📸 Seamless Scanning:** Quickly capture high-quality images of physical receipts.
- **🔍 Data Extraction (OCR):** Automatically pull key data like the total amount, date, and merchant name directly from the image.
- **🗄️ Secure Storage:** Safely store and archive digital copies so you never lose track of an expense.
- **🔎 Search & Retrieval:** Find past expenses instantly using keywords, dates, or custom categories.
- **📊 Export & Share:** Easily export your receipt data for tax season, personal budgeting, or business expense reporting.

## 🛠️ Tech Stack

- **Frontend:** React 18 (Vite dev server, production build to `dist/`)
- **Backend:** PHP 8.5 REST API (`/api`) served by XAMPP Apache
- **Database:** MariaDB / MySQL via PhpMyAdmin (`papertrail` database)
- **OCR Engine:** Pluggable — simulated by default, Google Cloud Vision optional (`OCR_MODE=gcv` + `GCV_API_KEY`), Tesseract.js browser-side ready

## 🚀 Getting Started

### Prerequisites
- XAMPP (Apache + MariaDB) running
- Node.js 18+ for the frontend dev server

### 1. Database
```bash
/Applications/XAMPP/xamppfiles/bin/mysql -u root < db/schema.sql
```
Seeds a demo user: `maya@papertrail.app` / `papertrail`

### 2. Backend (PHP API)
Already in place under `api/`. Apache serves it at `http://localhost/PaperTrail/api/`.
Make `uploads/` writable by the Apache user:
```bash
chmod 777 uploads
```

### 3. Frontend (React)
```bash
cd frontend
npm install
npm run dev
```
Opens at `http://localhost:5173` (proxies `/PaperTrail/api` to Apache on port 80).

### 4. Production build
```bash
cd frontend && npm run build   # outputs to ../dist/
```
Serve `dist/` from Apache, or keep using Vite for dev.

## 📁 Project Structure

```
PaperTrail/
├── api/                  PHP REST endpoints
│   ├── config.php        DB / CORS / OCR config
│   ├── db.php            PDO + auth + helpers
│   ├── auth.php          login / logout / me
│   ├── receipts.php      CRUD for receipts
│   ├── categories.php    list categories
│   ├── stats.php         dashboard summary
│   ├── upload.php        file upload + OCR
│   └── export.php       CSV export
├── db/
│   └── schema.sql        MySQL schema + seed data
├── frontend/             React SPA (Vite)
│   └── src/
│       ├── api.js        fetch wrapper
│       ├── constants.js  design tokens + helpers
│       ├── App.jsx       auth gate
│       └── components/   Dashboard, Header, Sidebar,
│                         StatsCards, ReceiptTable,
│                         UploadModal, ReceiptDetail, Toast
├── uploads/              receipt images (writable by Apache)
├── PaperTrail Dashboard.dc.html   original Claude Design source
├── PaperTrail Dashboard.html      bundled design artifact
├── dc-runtime.js         Claude Design runtime (extracted)
└── support.js            nav helpers for the .dc.html design
```
