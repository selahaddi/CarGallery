import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';

// .env.local dosyasını okuyup parse edelim
const envConfig = dotenv.parse(fs.readFileSync('.env.local'));

const supabaseUrl = envConfig.VITE_SUPABASE_URL;
const supabaseKey = envConfig.VITE_SUPABASE_ANON_KEY;

if(!supabaseUrl || !supabaseKey) {
  console.error("HATA: .env.local içinde kimlik bilgileri eksik!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabase() {
  console.log("Supabase'e bağlanılıyor...");
  console.log("Hedef Tablo: contents");
  
  const { data, error } = await supabase.from('contents').select('*');
  
  if (error) {
    console.error("❌ Veri Çekme Hatası!");
    console.error("Hata Detayı:", error.message);
    console.error("Hata Kodu:", error.code);
  } else {
    console.log("✅ Bağlantı Başarılı!");
    console.log(`Tabloda ${data.length} adet kayıt bulundu.`);
    if (data.length > 0) {
      console.log("\n--- Örnek Gelen Veriler ---");
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.log("Uyarı: Bağlantı kuruldu ama tablonun içi tamamen BOŞ.");
      console.log("Lütfen n8n üzerinden 'Execute Workflow' diyerek veritabanına veri kaydedildiğinden emin olun.");
    }
  }
}

testSupabase();
