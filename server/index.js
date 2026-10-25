import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import PDFDocument from 'pdfkit';
import db from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const uploadsDir = path.join(rootDir, 'public', 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const JWT_SECRET = process.env.JWT_SECRET || 'galeri_yerel_guvenli_anahtar_2026';
const PORT = process.env.PORT || 5005;

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Yüklenen resimleri statik olarak sunma
app.use('/uploads', express.static(uploadsDir));

// Multer Dosya Yükleme Yapılandırması
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// Realtime SSE İstemcileri
let sseClients = [];
function broadcastNewOffer(offer) {
  const data = JSON.stringify({ event: 'INSERT', table: 'offers', new: offer });
  sseClients.forEach(client => {
    client.res.write(`data: ${data}\n\n`);
  });
}

// Yardımcı Fonksiyon: Content kaydını JSON array'leri parse ederek normalize etme
function formatContent(row) {
  if (!row) return null;
  return {
    ...row,
    status: Boolean(row.status),
    tags: safeJsonParse(row.tags, []),
    features: safeJsonParse(row.features, []),
    images: safeJsonParse(row.images, [])
  };
}

function safeJsonParse(str, fallback) {
  if (!str) return fallback;
  if (typeof str === 'object') return str;
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

// ==========================================
// 1. AUTH (KİMLİK DOĞRULAMA)
// ==========================================
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'E-posta ve şifre gereklidir.' });
    }

    const admin = db.prepare('SELECT * FROM admins WHERE email = ?').get(email.toLowerCase().trim());
    if (!admin) {
      return res.status(400).json({ error: 'Geçersiz kullanıcı adı veya şifre.' });
    }

    const isValid = bcrypt.compareSync(password, admin.password_hash);
    if (!isValid) {
      return res.status(400).json({ error: 'Geçersiz kullanıcı adı veya şifre.' });
    }

    const token = jwt.sign({ id: admin.id, email: admin.email }, JWT_SECRET, { expiresIn: '7d' });
    const user = { id: admin.id, email: admin.email };

    return res.json({
      session: {
        access_token: token,
        user
      },
      user
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Giriş işlemi sırasında sunucu hatası.' });
  }
});

app.get('/api/auth/session', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.json({ session: null });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    return res.json({
      session: {
        access_token: token,
        user: { id: decoded.id, email: decoded.email }
      }
    });
  } catch {
    return res.json({ session: null });
  }
});

// ==========================================
// 2. STORAGE (MEDYA YÜKLEME)
// ==========================================
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Dosya yüklenmedi.' });
    }
    const publicUrl = `/uploads/${req.file.filename}`;
    return res.json({
      publicUrl,
      fileName: req.file.filename
    });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ error: 'Resim yüklenemedi.' });
  }
});

// ==========================================
// 3. CONTENTS (ARAÇLAR & İÇERİKLER)
// ==========================================
app.get('/api/contents', (req, res) => {
  try {
    const { status, category, search } = req.query;
    let query = 'SELECT * FROM contents WHERE 1=1';
    const params = [];

    if (status !== undefined && status !== 'all') {
      const isStatusTrue = status === 'true' || status === '1';
      query += ' AND status = ?';
      params.push(isStatusTrue ? 1 : 0);
    }

    if (category && category !== 'All') {
      query += ' AND LOWER(category) = LOWER(?)';
      params.push(category);
    }

    if (search && search.trim() !== '') {
      query += ' AND (LOWER(title) LIKE ? OR LOWER(summary) LIKE ?)';
      params.push(`%${search.toLowerCase().trim()}%`, `%${search.toLowerCase().trim()}%`);
    }

    query += ' ORDER BY CASE WHEN sort_order IS NOT NULL THEN sort_order ELSE 999999 END ASC, created_at DESC';

    const rows = db.prepare(query).all(...params);
    const data = rows.map(formatContent);
    return res.json(data);
  } catch (err) {
    console.error('Get contents error:', err);
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/contents/:slugOrId', (req, res) => {
  try {
    const { slugOrId } = req.params;
    let row = null;
    if (/^\d+$/.test(slugOrId)) {
      row = db.prepare('SELECT * FROM contents WHERE id = ?').get(Number(slugOrId));
    }
    if (!row) {
      row = db.prepare('SELECT * FROM contents WHERE LOWER(slug) = LOWER(?)').get(slugOrId);
    }

    if (!row) {
      return res.status(404).json({ error: 'İçerik bulunamadı.' });
    }

    return res.json(formatContent(row));
  } catch (err) {
    console.error('Get single content error:', err);
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/contents', (req, res) => {
  try {
    const body = req.body;
    const stmt = db.prepare(`
      INSERT INTO contents (
        title, slug, summary, body, image_url, category, status,
        tags, created_at, year, mileage, price, down_payment,
        monthly_rate, interest_rate, term_months, phone, features,
        images, sort_order
      ) VALUES (
        @title, @slug, @summary, @body, @image_url, @category, @status,
        @tags, @created_at, @year, @mileage, @price, @down_payment,
        @monthly_rate, @interest_rate, @term_months, @phone, @features,
        @images, @sort_order
      )
    `);

    const result = stmt.run({
      title: body.title || '',
      slug: body.slug || (body.title ? body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : `car-${Date.now()}`),
      summary: body.summary || '',
      body: body.body || '',
      image_url: body.image_url || '',
      category: body.category || '',
      status: body.status === false || body.status === 0 ? 0 : 1,
      tags: typeof body.tags === 'object' ? JSON.stringify(body.tags) : (body.tags || '[]'),
      created_at: new Date().toISOString(),
      year: body.year || null,
      mileage: body.mileage || null,
      price: body.price || null,
      down_payment: body.down_payment || null,
      monthly_rate: body.monthly_rate || null,
      interest_rate: body.interest_rate || null,
      term_months: body.term_months || null,
      phone: body.phone || '',
      features: typeof body.features === 'object' ? JSON.stringify(body.features) : (body.features || '[]'),
      images: typeof body.images === 'object' ? JSON.stringify(body.images) : (body.images || '[]'),
      sort_order: body.sort_order ?? 0
    });

    const newRow = db.prepare('SELECT * FROM contents WHERE id = ?').get(result.lastInsertRowid);
    return res.status(201).json(formatContent(newRow));
  } catch (err) {
    console.error('Insert content error:', err);
    return res.status(500).json({ error: err.message });
  }
});

app.put('/api/contents/:id', (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const existing = db.prepare('SELECT * FROM contents WHERE id = ?').get(Number(id));
    if (!existing) {
      return res.status(404).json({ error: 'Kayıt bulunamadı.' });
    }

    const stmt = db.prepare(`
      UPDATE contents SET
        title = @title,
        slug = @slug,
        summary = @summary,
        body = @body,
        image_url = @image_url,
        category = @category,
        status = @status,
        tags = @tags,
        year = @year,
        mileage = @mileage,
        price = @price,
        down_payment = @down_payment,
        monthly_rate = @monthly_rate,
        interest_rate = @interest_rate,
        term_months = @term_months,
        phone = @phone,
        features = @features,
        images = @images,
        sort_order = @sort_order
      WHERE id = @id
    `);

    stmt.run({
      id: Number(id),
      title: body.title !== undefined ? body.title : existing.title,
      slug: body.slug !== undefined ? body.slug : existing.slug,
      summary: body.summary !== undefined ? body.summary : existing.summary,
      body: body.body !== undefined ? body.body : existing.body,
      image_url: body.image_url !== undefined ? body.image_url : existing.image_url,
      category: body.category !== undefined ? body.category : existing.category,
      status: body.status !== undefined ? (body.status ? 1 : 0) : existing.status,
      tags: body.tags !== undefined ? (typeof body.tags === 'object' ? JSON.stringify(body.tags) : body.tags) : existing.tags,
      year: body.year !== undefined ? body.year : existing.year,
      mileage: body.mileage !== undefined ? body.mileage : existing.mileage,
      price: body.price !== undefined ? body.price : existing.price,
      down_payment: body.down_payment !== undefined ? body.down_payment : existing.down_payment,
      monthly_rate: body.monthly_rate !== undefined ? body.monthly_rate : existing.monthly_rate,
      interest_rate: body.interest_rate !== undefined ? body.interest_rate : existing.interest_rate,
      term_months: body.term_months !== undefined ? body.term_months : existing.term_months,
      phone: body.phone !== undefined ? body.phone : existing.phone,
      features: body.features !== undefined ? (typeof body.features === 'object' ? JSON.stringify(body.features) : body.features) : existing.features,
      images: body.images !== undefined ? (typeof body.images === 'object' ? JSON.stringify(body.images) : body.images) : existing.images,
      sort_order: body.sort_order !== undefined ? body.sort_order : existing.sort_order
    });

    const updated = db.prepare('SELECT * FROM contents WHERE id = ?').get(Number(id));
    return res.json(formatContent(updated));
  } catch (err) {
    console.error('Update content error:', err);
    return res.status(500).json({ error: err.message });
  }
});

app.delete('/api/contents/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM contents WHERE id = ?').run(Number(id));
    return res.json({ success: true });
  } catch (err) {
    console.error('Delete content error:', err);
    return res.status(500).json({ error: err.message });
  }
});

app.put('/api/contents-reorder', (req, res) => {
  try {
    const items = req.body; // [{ id, sort_order }]
    if (Array.isArray(items)) {
      const updateStmt = db.prepare('UPDATE contents SET sort_order = ? WHERE id = ?');
      const updateMany = db.transaction((list) => {
        for (const item of list) {
          updateStmt.run(item.sort_order, item.id);
        }
      });
      updateMany(items);
    }
    return res.json({ success: true });
  } catch (err) {
    console.error('Reorder error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. OFFERS (MÜŞTERİ TEKLİFLERİ)
// ==========================================
app.get('/api/offers', (req, res) => {
  try {
    const limit = Number(req.query.limit) || 20;
    const rows = db.prepare('SELECT * FROM offers ORDER BY created_at DESC LIMIT ?').all(limit);
    return res.json(rows);
  } catch (err) {
    console.error('Get offers error:', err);
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/offers', (req, res) => {
  try {
    const body = Array.isArray(req.body) ? req.body[0] : req.body;
    const id = body.id || `offer-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO offers (
        id, customer_name, customer_email, customer_phone, car_id,
        car_title, price, down_payment, term_months, monthly_rate, created_at
      ) VALUES (
        @id, @customer_name, @customer_email, @customer_phone, @car_id,
        @car_title, @price, @down_payment, @term_months, @monthly_rate, @created_at
      )
    `);

    const newOffer = {
      id,
      customer_name: body.customer_name || '',
      customer_email: body.customer_email || '',
      customer_phone: body.customer_phone || '',
      car_id: body.car_id || null,
      car_title: body.car_title || '',
      price: body.price || null,
      down_payment: body.down_payment || null,
      term_months: body.term_months || null,
      monthly_rate: body.monthly_rate || null,
      created_at: now
    };

    stmt.run(newOffer);

    // Canlı bildirim gönder (SSE)
    broadcastNewOffer(newOffer);

    return res.status(201).json(newOffer);
  } catch (err) {
    console.error('Insert offer error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 5. REALTIME (SSE - Server Sent Events)
// ==========================================
app.get('/api/realtime/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const clientId = Date.now();
  const newClient = { id: clientId, res };
  sseClients.push(newClient);

  req.on('close', () => {
    sseClients = sseClients.filter(c => c.id !== clientId);
  });
});

// ==========================================
// 6. GENERATE OFFER (PDF & Kayıt)
// ==========================================
app.post('/api/generate-offer', (req, res) => {
  try {
    const data = req.body;
    const customer = data.customer || {};
    const car = data.car || {};

    const price = parseFloat(car.price || 0);
    const downPayment = parseFloat(car.down_payment || 0);
    const monthlyRate = parseFloat(car.monthly_rate || 0);
    const termMonths = parseInt(car.term_months || 48, 10);

    // Offers tablosuna kaydet
    const offerId = `offer-${Date.now()}`;
    const newOffer = {
      id: offerId,
      customer_name: customer.name || '',
      customer_email: customer.email || '',
      customer_phone: customer.phone || '',
      car_id: car.id || null,
      car_title: car.title || '',
      price: price || null,
      down_payment: downPayment || null,
      term_months: termMonths || null,
      monthly_rate: monthlyRate || null,
      created_at: new Date().toISOString()
    };

    const stmt = db.prepare(`
      INSERT INTO offers (
        id, customer_name, customer_email, customer_phone, car_id,
        car_title, price, down_payment, term_months, monthly_rate, created_at
      ) VALUES (
        @id, @customer_name, @customer_email, @customer_phone, @car_id,
        @car_title, @price, @down_payment, @term_months, @monthly_rate, @created_at
      )
    `);
    stmt.run(newOffer);

    // Canlı bildirim tetikle
    broadcastNewOffer(newOffer);

    return res.status(200).json({
      success: true,
      message: 'Teklif yerel veritabanına başarıyla kaydedildi.',
      offer: newOffer
    });
  } catch (err) {
    console.error('Generate offer error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Sunucuyu Başlat
app.listen(PORT, '127.0.0.1', () => {
  console.log(`🚀 Galeri Yerel API Sunucusu http://127.0.0.1:${PORT} üzerinde çalışıyor.`);
});
