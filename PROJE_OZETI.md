# 🚗 GaleriApp - Proje Özeti & Entegrasyon Kılavuzu

Bu proje; **React (Vite)**, **Tailwind CSS**, **Supabase (Veritabanı & Yetkilendirme)** ve **n8n (İş Akışı Otomasyonu)** teknolojilerinin entegrasyonuyla geliştirilmiş modern ve yüksek performanslı bir **Araba Galerisi ve İçerik Yönetim Platformudur**.

Uygulama, estetik bir kullanıcı deneyimi sunmak adına **Glassmorphism (cam efekti)** tasarım dili ve mikro-animasyonlar ile donatılmıştır.

---

## 🛠️ Teknolojik Altyapı (Tech Stack)

*   **Frontend Framework:** React (Vite tabanlı, HMR destekli)
*   **Styling:** Tailwind CSS & PostCSS (Özel Cam Efekt Sınıfları ile)
*   **Database & Auth:** Supabase (`@supabase/supabase-js`)
*   **Automation/Backend:** n8n İş Akışı Otomasyonu (Webhook tabanlı tetikleme)
*   **İkon Seti:** Lucide React (`lucide-react`)
*   **Yönlendirme:** React Router DOM v7 (`react-router-dom`)

---

## 📂 Dosya ve Klasör Yapısı

```text
Araba_Galerisi/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx          # Dinamik oturum kontrolü sunan navigasyon menüsü
│   │   └── ContentCard.jsx     # Ana sayfadaki şık vitrin kartları (resim, etiketler, aktif/pasif durum)
│   ├── pages/
│   │   ├── Home.jsx            # Vitrin/Listeleme sayfası (Supabase'den gerçek zamanlı okuma)
│   │   ├── ContentDetail.jsx   # Detay sayfası (slug veya ID tabanlı yönlendirme ve dinamik tasarım)
│   │   ├── Login.jsx           # Supabase Auth kullanan güvenli Admin giriş arayüzü
│   │   ├── Dashboard.jsx       # Yönetici paneli (CRUD - İçerik Ekleme, Silme ve Düzenleme işlemleri)
│   │   └── N8nPanel.jsx        # n8n Webhook tetikleyici arayüzü (POST Payload gönderimi)
│   ├── assets/                 # Statik görsel ve varlıklar
│   ├── supabaseClient.js       # Supabase istemci yapılandırması
│   ├── index.css               # Temel CSS kuralları ve Tailwind Glassmorphism sınıfları
│   ├── main.jsx                # React başlangıç noktası
│   └── App.jsx                 # Sayfa yönlendirici (Router) konfigürasyonu
├── .env.local                  # Supabase URL ve Anon Key bilgileri (Yerel Çevre Değişkenleri)
├── N8N_workflow.json           # n8n için hazır içe aktarılabilir iş akışı (Webhook -> Supabase)
├── test-supabase.js            # Supabase veritabanı bağlantısını doğrulamak için test betiği
├── baslat.bat                  # Projeyi tek tıklamayla yerel sunucuda (`npm run dev`) başlatan script
├── n8n-paneli-ac.bat           # Projeyi başlatıp doğrudan n8n paneline (`/n8n-panel`) yönlendiren script
└── README.md                   # Standart Vite şablon kılavuzu
```

---

## 💻 Uygulama Sayfaları ve İşlevleri

### 1. Ana Sayfa (`Home.jsx` / `/`)
*   Supabase üzerindeki `contents` tablosundaki verileri **oluşturulma tarihine göre en yeniden eskiye doğru** sıralayarak listeler.
*   Bağlantı hatası durumunda kullanıcıyı bilgilendiren detaylı hata kartları sunar.
*   Hiç veri bulunmaması durumunda n8n'den tetikleme yapılması gerektiğini hatırlatan yönlendirmeler içerir.

### 2. Detay Sayfası (`ContentDetail.jsx` / `/icerik/:slug`)
*   Seçilen araba veya makalenin detaylarını tam ekran görsel, başlık, kategori ve etiketlerle birlikte sunar.
*   Yönlendirmede hem benzersiz **slug** değerlerini hem de fallback olarak veritabanı **ID (UUID)** değerlerini destekler.

### 3. Admin Girişi (`Login.jsx` / `/login`)
*   Supabase Yetkilendirme sistemini kullanır.
*   Güvenli bir biçimde kullanıcı adı (e-posta) ve şifre doğrulaması yaparak yöneticiyi `/dashboard` sayfasına yönlendirir.

### 4. Yönetim Paneli (`Dashboard.jsx` / `/dashboard`)
*   Yalnızca oturum açmış kullanıcıların erişebildiği tam teşekküllü bir içerik yönetim (CRUD) panelidir.
*   Yeni kayıt ekleyebilir, mevcut kayıtları güncelleyebilir veya silebilirsiniz.
*   Tüm veri işlemleri doğrudan Supabase veritabanına yansıtılır.

### 5. n8n Entegrasyon Paneli (`N8nPanel.jsx` / `/n8n-panel`)
*   n8n üzerindeki Webhook tetikleyicisinin URL'sini kaydeder (tarayıcı yerel belleğinde saklanır).
*   Form aracılığıyla girilen verileri JSON payload olarak n8n Webhook adresine POST eder.
*   CORS uyumludur, başarılı gönderimlerden sonra kullanıcıya anlık bildirim verir.

---

## 🗄️ Veritabanı Yapısı (Supabase `contents` Tablosu)

Supabase veritabanında kullanılan `contents` tablosunun sütun yapılandırması şu şekildedir:

| Kolon Adı | Veri Tipi | Açıklama |
| :--- | :--- | :--- |
| `id` | `uuid` | Benzersiz kayıt ID'si (Otomatik oluşturulur) |
| `created_at` | `timestamptz` | Kayıt tarihi (Otomatik oluşturulur) |
| `title` | `text` | Araç veya içerik başlığı |
| `slug` | `text` | SEO uyumlu URL yapısı (Örn: `bmw-320i-2023`) |
| `summary` | `text` | Liste görünümleri için kısa özet metni |
| `body` | `text` | Detaylı açıklama metni |
| `image_url` | `text` | Araç veya içerik görselinin web adresi |
| `category` | `text` | İçerik kategorisi (Örn: `Sedan`, `SUV`, `Teknoloji`) |
| `tags` | `array (text)`| Etiket dizisi (Örn: `["bmw", "ikinciel", "sahibinden"]`) |
| `status` | `boolean` | İçeriğin yayında (aktif) veya taslak (pasif) olma durumu |

---

## 🔄 n8n Otomasyon Entegrasyonu

Projede yer alan `N8N_workflow.json` dosyası, n8n platformunda doğrudan içe aktarılabilir (**Import**) yapıdadır. İş akışı şu adımlardan oluşur:

1.  **Webhook Node (POST):** Dış dünyadan veya uygulamadaki `n8n-panel` sayfasından gelen POST isteklerini yakalar.
2.  **Supabase Node (Insert):** Webhook ile gelen JSON verilerini otomatik olarak Supabase'deki `contents` tablosuna kaydeder.
3.  **Respond to Webhook Node:** İşlem tamamlandığında istemciye başarılı yanıt (HTTP 200) gönderir.

---

## ⚡ Hızlı Çalıştırma ve Test

### 1. Yerel Geliştirme Sunucusu:
Projeyi yerel makinenizde başlatmak için kök dizindeki toplu iş dosyasını çalıştırın:
```bash
baslat.bat
```
*Alternatif olarak terminalden `npm run dev` komutunu verebilirsiniz.*

### 2. n8n Entegrasyon Testi:
Projeyi başlatıp doğrudan n8n Webhook gönderim paneline gitmek için:
```bash
n8n-paneli-ac.bat
```
*Alternatif olarak terminalden `npm run n8n` komutunu verebilirsiniz.*

### 3. Bağlantı Testi:
Supabase istemcisinin yerel ayarlarınızla çalışıp çalışmadığını konsoldan doğrulamak için:
```bash
node test-supabase.js
```

---

## 🚀 Önerilen Gelecek Geliştirmeler

Projeyi daha da ileriye taşımak için yapılabilecek bazı geliştirmeler:

1.  **Gelişmiş Araç Özellikleri:** Tabloya `price` (fiyat), `year` (yıl), `mileage` (kilometre), `fuel_type` (yakıt) ve `gear_type` (vites) gibi araca özel alanlar ekleyerek ilan kartlarını zenginleştirmek.
2.  **Filtreleme & Arama:** Vitrin sayfasında marka, model, fiyat aralığı ve vites tipine göre anlık çalışan dinamik filtreleme sistemi geliştirmek.
3.  **Müşteri Teklif / İletişim Entegrasyonu:** Detay sayfalarına "Teklif Al" butonu ekleyerek n8n üzerinden yöneticiye e-posta veya Telegram bildirimleri göndermek.
