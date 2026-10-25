import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';
import db from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const uploadsDir = path.join(rootDir, 'public', 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      const fileStream = fs.createWriteStream(destPath);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve(true);
      });
      fileStream.on('error', reject);
    }).on('error', reject);
  });
}

async function migrateImages() {
  console.log('🔄 Supabase Storage resimleri yerel uploads klasörüne indiriliyor...');
  const rows = db.prepare('SELECT id, image_url, images FROM contents').all();

  const updateStmt = db.prepare('UPDATE contents SET image_url = ?, images = ? WHERE id = ?');

  for (const row of rows) {
    let changed = false;
    let mainImg = row.image_url;

    // Ana görsel Supabase ise
    if (mainImg && mainImg.includes('supabase.co')) {
      try {
        const ext = path.extname(new URL(mainImg).pathname) || '.jpg';
        const localFileName = `car-${row.id}-main${ext}`;
        const localFilePath = path.join(uploadsDir, localFileName);
        
        console.log(`[İndiriliyor] Araç #${row.id} Ana Resim: ${mainImg}`);
        await downloadFile(mainImg, localFilePath);
        mainImg = `/uploads/${localFileName}`;
        changed = true;
      } catch (err) {
        console.warn(`[Uyarı] Resim indirilemedi: ${mainImg}`, err.message);
      }
    }

    // Galeri görselleri Supabase ise
    let gallery = [];
    try {
      gallery = typeof row.images === 'string' ? JSON.parse(row.images) : (row.images || []);
    } catch {
      gallery = [];
    }

    const newGallery = [];
    let galIdx = 1;
    for (const gUrl of gallery) {
      if (typeof gUrl === 'string' && gUrl.includes('supabase.co')) {
        try {
          const ext = path.extname(new URL(gUrl).pathname) || '.jpg';
          const localFileName = `car-${row.id}-gallery-${galIdx}${ext}`;
          const localFilePath = path.join(uploadsDir, localFileName);

          console.log(`[İndiriliyor] Araç #${row.id} Galeri #${galIdx}: ${gUrl}`);
          await downloadFile(gUrl, localFilePath);
          newGallery.push(`/uploads/${localFileName}`);
          changed = true;
          galIdx++;
        } catch (err) {
          console.warn(`[Uyarı] Galeri resmi indirilemedi: ${gUrl}`, err.message);
          newGallery.push(gUrl);
        }
      } else {
        newGallery.push(gUrl);
      }
    }

    if (changed) {
      updateStmt.run(mainImg, JSON.stringify(newGallery), row.id);
      console.log(`✅ Araç #${row.id} görsel URL'leri yerel olarak güncellendi.`);
    }
  }

  console.log('🎉 Tüm Supabase görsellerinin yerelleştirilmesi tamamlandı!');
}

migrateImages().catch(err => {
  console.error('Hata:', err);
});
