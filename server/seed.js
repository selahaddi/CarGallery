import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import db from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const yedekDir = path.join(rootDir, 'yedekler');

async function seed() {
  console.log('🔄 Yerel SQLite veritabanı tohumlama (seed) başlatılıyor...');

  // 1. Contents (Araçlar)
  const contentsPath = path.join(yedekDir, 'contents.json');
  if (fs.existsSync(contentsPath)) {
    const raw = fs.readFileSync(contentsPath, 'utf8');
    const contents = JSON.parse(raw);
    
    const insertContent = db.prepare(`
      INSERT OR REPLACE INTO contents (
        id, title, slug, summary, body, image_url, category, status,
        tags, created_at, year, mileage, price, down_payment,
        monthly_rate, interest_rate, term_months, phone, features,
        images, sort_order
      ) VALUES (
        @id, @title, @slug, @summary, @body, @image_url, @category, @status,
        @tags, @created_at, @year, @mileage, @price, @down_payment,
        @monthly_rate, @interest_rate, @term_months, @phone, @features,
        @images, @sort_order
      )
    `);

    const insertMany = db.transaction((items) => {
      for (const item of items) {
        insertContent.run({
          id: item.id,
          title: item.title || '',
          slug: item.slug || '',
          summary: item.summary || '',
          body: item.body || '',
          image_url: item.image_url || '',
          category: item.category || '',
          status: item.status ? 1 : 0,
          tags: typeof item.tags === 'object' ? JSON.stringify(item.tags) : (item.tags || '[]'),
          created_at: item.created_at || new Date().toISOString(),
          year: item.year || null,
          mileage: item.mileage || null,
          price: item.price || null,
          down_payment: item.down_payment || null,
          monthly_rate: item.monthly_rate || null,
          interest_rate: item.interest_rate || null,
          term_months: item.term_months || null,
          phone: item.phone || '',
          features: typeof item.features === 'object' ? JSON.stringify(item.features) : (item.features || '[]'),
          images: typeof item.images === 'object' ? JSON.stringify(item.images) : (item.images || '[]'),
          sort_order: item.sort_order ?? 0
        });
      }
    });

    insertMany(contents);
    console.log(`✅ ${contents.length} araç kaydı başarıyla aktarıldı.`);
  }

  // 2. Offers (Teklifler)
  const offersPath = path.join(yedekDir, 'offers.json');
  if (fs.existsSync(offersPath)) {
    const raw = fs.readFileSync(offersPath, 'utf8');
    const offers = JSON.parse(raw);

    const insertOffer = db.prepare(`
      INSERT OR REPLACE INTO offers (
        id, customer_name, customer_email, customer_phone, car_id,
        car_title, price, down_payment, term_months, monthly_rate, created_at
      ) VALUES (
        @id, @customer_name, @customer_email, @customer_phone, @car_id,
        @car_title, @price, @down_payment, @term_months, @monthly_rate, @created_at
      )
    `);

    const insertManyOffers = db.transaction((items) => {
      for (const item of items) {
        insertOffer.run({
          id: item.id,
          customer_name: item.customer_name || '',
          customer_email: item.customer_email || '',
          customer_phone: item.customer_phone || '',
          car_id: item.car_id || null,
          car_title: item.car_title || '',
          price: item.price || null,
          down_payment: item.down_payment || null,
          term_months: item.term_months || null,
          monthly_rate: item.monthly_rate || null,
          created_at: item.created_at || new Date().toISOString()
        });
      }
    });

    insertManyOffers(offers);
    console.log(`✅ ${offers.length} teklif kaydı başarıyla aktarıldı.`);
  }

  // 3. Bekleyen Teklifler
  const bekleyenPath = path.join(yedekDir, 'bekleyen_teklifler.json');
  if (fs.existsSync(bekleyenPath)) {
    const raw = fs.readFileSync(bekleyenPath, 'utf8');
    const bekleyen = JSON.parse(raw);

    const insertBekleyen = db.prepare(`
      INSERT OR REPLACE INTO bekleyen_teklifler (
        id, firma_adi, talep_edilen_urun, adet, iletisim_email, telefon,
        durum, teklif_gonderim_tarihi, created_at
      ) VALUES (
        @id, @firma_adi, @talep_edilen_urun, @adet, @iletisim_email, @telefon,
        @durum, @teklif_gonderim_tarihi, @created_at
      )
    `);

    const insertManyBekleyen = db.transaction((items) => {
      for (const item of items) {
        insertBekleyen.run({
          id: item.id,
          firma_adi: item.firma_adi || '',
          talep_edilen_urun: item.talep_edilen_urun || '',
          adet: item.adet || 1,
          iletisim_email: item.iletisim_email || '',
          telefon: item.telefon || '',
          durum: item.durum || '',
          teklif_gonderim_tarihi: item.teklif_gonderim_tarihi || '',
          created_at: item.created_at || new Date().toISOString()
        });
      }
    });

    insertManyBekleyen(bekleyen);
    console.log(`✅ ${bekleyen.length} bekleyen teklif kaydı aktarıldı.`);
  }

  // 4. Varsayılan Admin Kullanıcısı
  const defaultPassword = 'admin'; // Şifre: admin
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(defaultPassword, salt);

  const insertAdmin = db.prepare(`
    INSERT OR REPLACE INTO admins (id, email, password_hash, created_at)
    VALUES (
      1,
      'admin@galeri.com',
      @hash,
      datetime('now')
    )
  `);
  insertAdmin.run({ hash });

  // İkinci admin kullanıcısı (kullanıcının e-postası)
  const insertUserAdmin = db.prepare(`
    INSERT OR REPLACE INTO admins (id, email, password_hash, created_at)
    VALUES (
      2,
      'serttas2001@gmail.com',
      @hash,
      datetime('now')
    )
  `);
  insertUserAdmin.run({ hash });

  console.log('✅ Admin hesapları oluşturuldu:');
  console.log('   - admin@galeri.com / Şifre: admin');
  console.log('   - serttas2001@gmail.com / Şifre: admin');
  console.log('🎉 Veritabanı aktarımı başarıyla tamamlandı!');
}

seed().catch(err => {
  console.error('❌ Hata oluştu:', err);
  process.exit(1);
});
