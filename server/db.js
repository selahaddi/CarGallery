import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'data', 'galeri.sqlite');
const db = new Database(dbPath);

// Performans ve veri güvenliği için WAL modu
db.pragma('journal_mode = WAL');

// Tabloları oluştur
db.exec(`
  CREATE TABLE IF NOT EXISTS contents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    slug TEXT UNIQUE,
    summary TEXT,
    body TEXT,
    image_url TEXT,
    category TEXT,
    status INTEGER DEFAULT 1,
    tags TEXT,
    created_at TEXT,
    year INTEGER,
    mileage INTEGER,
    price REAL,
    down_payment REAL,
    monthly_rate REAL,
    interest_rate REAL,
    term_months INTEGER,
    phone TEXT,
    features TEXT,
    images TEXT,
    sort_order INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS offers (
    id TEXT PRIMARY KEY,
    customer_name TEXT,
    customer_email TEXT,
    customer_phone TEXT,
    car_id INTEGER,
    car_title TEXT,
    price REAL,
    down_payment REAL,
    term_months INTEGER,
    monthly_rate REAL,
    created_at TEXT
  );

  CREATE TABLE IF NOT EXISTS bekleyen_teklifler (
    id TEXT PRIMARY KEY,
    firma_adi TEXT,
    talep_edilen_urun TEXT,
    adet INTEGER,
    iletisim_email TEXT,
    telefon TEXT,
    durum TEXT,
    teklif_gonderim_tarihi TEXT,
    created_at TEXT
  );

  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password_hash TEXT,
    created_at TEXT
  );
`);

export default db;
