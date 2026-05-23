# 🚗 Dortmund Fleet Finance - Sıfırdan Kurulum ve Canlıya Alma Kılavuzu

Bu kılavuz, platformu başka bir sunucuya taşımak veya sıfırdan yeni bir veritabanı/otomasyon altyapısıyla kurmak istediğinizde uygulamanız gereken tüm adımları detaylıca açıklamaktadır.

---

## 📂 1. Dosya ve Klasör Yapısı Referansı

Yedekleme veya kurulum yaparken aşağıdaki kritik dosyaların yerinde olduğundan emin olun:
- **`src/`**: React uygulamasının tüm arayüz, sayfa, dil ayarları ve Supabase istemci kodları.
- **`scripts/api_server.py`**: n8n ile haberleşen yerel Flask API sunucusu.
- **`scripts/generate_pdf.py`**: CLI üzerinden çalışan PDF üretici script.
- **`scripts/Montserrat-Bold.ttf` & `Montserrat-Regular.ttf`**: PDF üreticinin ihtiyaç duyduğu kurumsal font dosyaları.
- **`pdf_sunucusu_baslat.bat`**: Python sunucusunu otomatik kütüphane kontrolü ile başlatan toplu iş dosyası.
- **`baslat.bat`**: Vite yerel arayüz sunucusunu başlatan dosya.
- **`.env.local`**: Supabase bağlantı anahtarlarını barındıran yerel gizli dosya.

---

## 🗄️ 2. Supabase Kurulumu ve Yapılandırması

Supabase, uygulamanın veritabanı, üyelik sistemi ve medya depolama (storage) altyapısını sağlar.

### A. Yeni Proje Oluşturma
1. [supabase.com](https://supabase.com) adresine gidin, giriş yapın ve **New Project** butonuna tıklayarak yeni bir proje oluşturun.
2. Proje ismini ve veritabanı şifrenizi belirleyip sunucu lokasyonunu seçin (Avrupa lokasyonları tavsiye edilir).

### B. SQL ile `contents` Tablosunu Oluşturma
Supabase panelinizde sol menüdeki **SQL Editor** kısmına gelin, **New Query** diyerek aşağıdaki SQL kodunu yapıştırın ve **Run** butonuna tıklayın. Bu kod, araç ilanlarınızın tüm detaylarını, fiyat hesaplamalarını ve resim galerilerini barındıracak tabloyu ve güvenlik kurallarını (RLS) otomatik oluşturur:

```sql
-- 1. contents tablosunu oluştur
create table public.contents (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    title text not null,
    slug text,
    summary text,
    body text,
    image_url text,
    category text,
    tags text[] default '{}'::text[],
    status boolean default true,
    year integer,
    mileage integer,
    price numeric,
    down_payment numeric,
    monthly_rate numeric,
    interest_rate numeric,
    term_months integer,
    phone text,
    images text[] default '{}'::text[]
);

-- 2. Satır Seviyesi Güvenliği (RLS) aktifleştir
alter table public.contents enable row level security;

-- 3. Herkesin araçları görüntüleyebilmesi için Okuma İzni (Select Policy) tanımla
create policy "Herkes araçları okuyabilir" on public.contents
    for select using (true);

-- 4. Sadece giriş yapmış adminlerin veri ekleyip silebilmesi için Tam Yetki İzni tanımla
create policy "Sadece adminler düzenleyebilir" on public.contents
    for all using (auth.role() = 'authenticated');
```

### C. Supabase Medya Deposunu (Storage) Kurma
Araç resimlerinin yüklenebilmesi ve görüntülenebilmesi için:
1. Supabase panelinde sol menüden **Storage** sekmesine gelin.
2. **New Bucket** butonuna tıklayın.
3. Kupa (bucket) ismini **`images`** yapın.
4. Alt kısımdaki **Public** seçeneğini mutlaka **Aktif (Açık)** hale getirin (Böylece resim linkleri dışarıdan erişilebilir olur).

### D. Admin Kullanıcısı Tanımlama (Dashboard Erişimi İçin)
1. Supabase panelinde sol menüden **Authentication** (Kimlik Doğrulama) sekmesine gelin.
2. **Add User** -> **Create User** seçeneğine tıklayın.
3. Bir yönetici e-posta adresi ve şifresi belirleyip kaydedin.
4. Artık sitenizin `/login` sayfasından bu e-posta ve şifreyle giriş yaparak Dashboard paneline (İlan Ekleme/Düzenleme/Silme) erişebilirsiniz.

### E. Bağlantı Bilgilerini React Projesine Tanımlama
1. Supabase panelinde **Project Settings** (Ayarlar) -> **API** sekmesine gidin.
2. **Project URL** ve **anon public key** değerlerini kopyalayın.
3. React projenizin ana dizininde **`.env.local`** adında bir dosya oluşturun ve bilgileri şu şekilde girin:
   ```env
   VITE_SUPABASE_URL=https://proje-id.supabase.co
   VITE_SUPABASE_ANON_KEY=buraya-anon-key-gelecek
   ```

---

## 💻 3. React Frontend Uygulaması Kurulumu

1. Bilgisayarınızda **Node.js** yüklü olduğundan emin olun.
2. Proje ana dizininde terminali açıp bağımlılıkları yükleyin:
   ```bash
   npm install
   ```
3. Yerel sunucuyu başlatmak için:
   ```bash
   npm run dev
   ```
   *(Veya doğrudan kök dizindeki **`baslat.bat`** dosyasına çift tıklayabilirsiniz.)*
4. Canlı sunucuya (Vercel, Netlify vb.) yüklemek amacıyla optimize edilmiş üretim dosyalarını oluşturmak için:
   ```bash
   npm run build
   ```

---

## 🐍 4. Python PDF API Sunucusu Yapılandırması

Siteniz üzerinden teklif isteği gönderildiğinde Pillow kütüphanesiyle yüksek kaliteli, çok sayfalı PDF teklif belgesi hazırlayan API sunucusunun kurulumudur.

### A. Python Gereksinimleri
- Bilgisayarınızda **Python 3.8** veya üzeri bir sürümün yüklü olması gerekir.
- Python kurulumu sırasında **"Add Python to PATH"** seçeneğini işaretlediğinizden emin olun.

### B. Otomatik Kütüphane Kurulumu ve Başlatma
1. Projenin ana dizininde yer alan **`pdf_sunucusu_baslat.bat`** dosyasına çift tıklayın.
2. Bu batch script, bilgisayarınızdaki Python ortamını denetler, **Flask** ve **Pillow** kütüphaneleri eksikse `pip` üzerinden otomatik olarak kurar ve API sunucusunu port `8000` üzerinde ayağa kaldırır.

### C. Önemli Tasarım Varlıkları (Fontlar)
- PDF şablonunun agresif kırmızı/koyu tema tasarımını doğru yansıtması için `scripts/` klasörünün içerisinde **`Montserrat-Bold.ttf`** ve **`Montserrat-Regular.ttf`** yazı tipi dosyalarının bulunduğundan kesinlikle emin olun.

---

## 🔄 5. n8n İş Akışları (Workflows) Yapılandırması

React formunun gönderilmesi, Python sunucusuna PDF ürettirilmesi ve müşteriye e-posta atılması n8n üzerindeki iş akışıyla yönetilir.

### Web Formu Tetikleyici ve E-Posta Akışı (Önerilen)
n8n arayüzünde yeni bir Workflow oluşturup aşağıdaki düğümleri (nodes) sırasıyla bağlayın:

#### Düğüm 1: Webhook (Giriş Noktası)
*   **HTTP Method:** `POST`
*   **Path:** `generate-offer`
*   **Authentication:** `None`
*   **Respond:** `Immediately` (HTTP Status Code: `200`)
*   *Bu düğüm aktifleştiğinde size bir Webhook URL'si verecektir (`http://localhost:5678/webhook/generate-offer`).*

#### Düğüm 2: HTTP Request (Python Sunucu Bağlantısı)
*   **Method:** `POST`
*   **URL:** 
    *   *n8n Docker üzerinde çalışıyorsa:* `http://host.docker.internal:8000/webhook/generate-pdf`
    *   *n8n yerel Windows üzerinde çalışıyorsa:* `http://localhost:8000/webhook/generate-pdf`
*   **Send Body:** `True`
*   **Content Type:** `JSON`
*   **Specify Body:** `Using JSON`
*   **JSON:**
    ```json
    {
      "customer": "={{ $json.body.customer }}",
      "car": "={{ $json.body.car }}"
    }
    ```
*   **Response Format:** `File` *(Bu ayar hayati önem taşır; Python API'den dönen ham PDF dosya akışını n8n'in bir dosya eki olarak algılamasını sağlar).*

#### Düğüm 3: Gmail / Outlook veya SMTP (Müşteriye Gönderim)
*   **To (Alıcı):** `{{ $json.body.customer.email }}`
*   **Subject (Konu):** `Ihr persönliches Finanzierungsangebot - Dortmund Fleet Finance`
*   **Email Body (İçerik - HTML):**
    ```html
    <p>Sehr geehrte(r) <strong>{{ $json.body.customer.name }}</strong>,</p>
    <p>vielen Dank für Ihr Vertrauen in Dortmund Fleet Finance. Im Anhang dieser E-Mail finden Sie Ihr gewünschtes Finanzierungsangebot für den <strong>{{ $json.body.car.title }}</strong>.</p>
    <p>Für Rückfragen stehen wir Ihnen jederzeit gerne zur Verfügung.</p>
    <br>
    <p>Mit freundlichen Grüßen,<br>Dortmund Fleet Finance Team</p>
    ```
*   **Attachments (Ekler):** İkinci adımdan (HTTP Request) gelen binary PDF dosyasını ek olarak seçin.

---

## 💡 6. Karşılaşabileceğiniz Olası Sorunlar ve Çözümleri

### 1. CORS Engeli (Cross-Origin Resource Sharing)
- **Sorun:** Formu gönderdiğinizde tarayıcı konsolunda kırmızı renkli "CORS" veya "Network Error" hatası görebilirsiniz.
- **Çözüm:** n8n yerel Docker ortamında çalışırken tarayıcılardan gelen istekleri reddedebilir. n8n'i başlatırken ortam değişkenlerine (environment variables) veya `.env` dosyasına şu satırı ekleyin:
  ```env
  N8N_ENFORCE_SETTINGS_FILE_FOR_USERS=true
  ```

### 2. Docker n8n'in Python API'sine Bağlanamaması
- **Sorun:** n8n Docker içinden Python API'sine bağlanırken `Connection Refused` hatası veriyor.
- **Sebep:** Docker container'ları kendi içerisindeki `localhost`'u arar ve ana bilgisayarı bulamazlar.
- **Çözüm:** n8n düğümündeki URL alanına `localhost:8000` değil, mutlaka **`host.docker.internal:8000`** yazmalısınız.

### 3. PDF'in Boş veya "N/A" Olarak Üretilmesi
- **Sorun:** PDF üretiliyor ancak içerisindeki müşteri adı veya araç fiyatı gibi alanlar "N/A" (Bilgi yok) yazıyor.
- **Çözüm:** n8n Webhook düğümünün verileri aktarırken `body` nesnesini doğru aktardığından emin olun. Python kodumuz hem direkt gelen gövdeleri hem de n8n'in otomatik oluşturduğu sarmalanmış `body` nesnelerini çözümleyebilecek yapıdadır; ancak n8n HTTP Request düğümünde JSON parametresini yukarıdaki şablona göre doğru bağladığınızdan emin olun.

### 4. PDF'te Türkçe Karakter veya Bozuk Font Hatası
- **Sorun:** Harfler kutucuk şeklinde çıkıyor veya tasarım kaymış görünüyor.
- **Çözüm:** `Montserrat-Bold.ttf` ve `Montserrat-Regular.ttf` dosyalarının `scripts/` klasöründe yer aldığını ve okuma izinlerinin bulunduğunu teyit edin. Python'ın bu fontları yükleyememesi durumunda varsayılan sistem fontlarına döneceğini unutmayın.
