import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { translations } from '../src/translations.js';

// Load env variables
const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
const supabaseUrl = envConfig.VITE_SUPABASE_URL;
const supabaseKey = envConfig.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// Ensure the HTML output directory exists
const outputDir = path.resolve('HTML');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function run() {
  console.log("Fetching contents from Supabase...");
  let contents = [];
  try {
    const { data, error } = await supabase.from('contents').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    contents = data || [];
    console.log(`Fetched ${contents.length} contents.`);
  } catch (err) {
    console.error("Error fetching from Supabase, using mock data:", err.message);
    contents = [
      {
        id: 1,
        title: "Porsche 911 Turbo S",
        slug: "porsche-911-turbo-s",
        summary: "Eşsiz performans, zamansız tasarım. 650 beygirlik gücüyle sınırları zorlayan bir sürüş deneyimi.",
        body: "Porsche'nin efsanevi modeli 911 Turbo S, motor sporları teknolojisini günlük kullanıma taşıyor. Aerodinamik geliştirmeleri, gelişmiş çekiş sistemi ve üstün konfor donanımlarıyla lüks spor araç segmentinin zirvesinde yer alıyor. Aracımız tamamen hatasız olup, tüm bakımları Porsche yetkili servisinde yapılmıştır.",
        image_url: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&w=1080",
        category: "Spor",
        status: true,
        tags: ["porsche", "turbo-s", "spor", "supercar"],
        year: 2024,
        mileage: 2400,
        price: 285000,
        down_payment: 85000,
        monthly_rate: 4650,
        interest_rate: 1.89,
        term_months: 48,
        phone: "015737641145",
        features: ["Karbon Seramik Fren", "Sport Chrono", "Burmester Ses Sistemi", "Karbon İç Trim", "Koltuk Soğutma"],
        images: [
          "https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&w=1080",
          "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=1080"
        ]
      },
      {
        id: 2,
        title: "Audi RS7 Sportback",
        slug: "audi-rs7-sportback",
        summary: "600 PS V8 motorun kükreyişi ile zarif sedan konforu bir arada. Dinamik tasarımıyla dikkat çeken Quattro performans canavarı.",
        body: "Araç RS Dinamik Paket Plus donanımına sahiptir. İç mekanda RS logolu Valcona deri spor koltuklar, Alcantara tavan döşemesi ve karbon fiber detaylar kullanılmıştır. Bang & Olufsen 3D Advanced Ses Sistemi, Lazer Matrix LED farlar ve vakumlu kapılar mevcuttur. İlk sahibinden, hatasız ve çiziksizdir.",
        image_url: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=1080",
        category: "Spor Sedan",
        status: true,
        tags: ["audi", "rs7", "quattro", "spor", "sedan"],
        year: 2024,
        mileage: 8500,
        price: 145000,
        down_payment: 40000,
        monthly_rate: 2450,
        interest_rate: 1.85,
        term_months: 48,
        phone: "015737641145",
        features: ["RS Spor Süspansiyon", "Bang & Olufsen Ses Sistemi", "Lazer Matrix Farlar", "Gece Görüş Asistanı", "Vakumlu Kapılar"],
        images: [
          "https://images.unsplash.com/photo-1614200187524-dc4b892acf16?q=80&w=1080",
          "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?q=80&w=1080"
        ]
      }
    ];
  }

  // Generate common head part
  const getHead = (title) => `
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} | Dortmund Fleet Finance</title>
    <link rel="icon" type="image/svg+xml" href="../public/favicon.svg">
    <!-- Google Fonts & Material Symbols -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Sora:wght@600;700;800&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet">
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            colors: {
              "inverse-surface": "#e4e1e6",
              "on-secondary-fixed": "#0d1c2d",
              "tertiary-fixed": "#dbe1ff",
              "on-primary-fixed-variant": "#920028",
              "surface-container-lowest": "#0e0e11",
              "secondary-fixed": "#d4e4fa",
              "text-muted": "#94A3B8",
              "surface-dim": "#131316",
              "on-surface": "#e4e1e6",
              "tertiary-container": "#2f6af2",
              "on-primary-fixed": "#40000c",
              "background-deep": "#000000",
              "surface-bright": "#39393c",
              "on-tertiary-container": "#fdfaff",
              "surface-container-highest": "#353438",
              "on-background": "#e4e1e6",
              "on-tertiary": "#002a78",
              "on-error": "#690005",
              "surface-tint": "#ffb3b6",
              "surface-container-low": "#1b1b1e",
              "tertiary-fixed-dim": "#b4c5ff",
              "inverse-on-surface": "#303033",
              "primary-fixed-dim": "#ffb3b6",
              "on-error-container": "#ffdad6",
              "secondary-container": "#39485a",
              "surface-container-high": "#2a2a2d",
              "on-secondary-fixed-variant": "#39485a",
              "tertiary": "#b4c5ff",
              "on-tertiary-fixed": "#00174b",
              "on-tertiary-fixed-variant": "#003ea8",
              "inverse-primary": "#be0037",
              "outline-variant": "#5c3f40",
              "primary-fixed": "#ffdada",
              "secondary": "#b9c8de",
              "on-secondary": "#233143",
              "surface-zinc": "#18181B",
              "background": "#131316",
              "primary-container": "#e11d48",
              "secondary-fixed-dim": "#b9c8de",
              "on-primary": "#68001a",
              "on-primary-container": "#fffaf9",
              "error": "#ffb4ab",
              "accent-red-bright": "#F43F5E",
              "error-container": "#93000a",
              "surface-variant": "#353438",
              "on-secondary-container": "#a7b6cc",
              "on-surface-variant": "#e5bdbe",
              "surface-container": "#1f1f22",
              "primary": "#ffb3b6",
              "outline": "#ac8889",
              "surface": "#131316"
            },
            borderRadius: {
              "DEFAULT": "0.25rem",
              "lg": "0.5rem",
              "xl": "0.75rem",
              "full": "9999px"
            },
            spacing: {
              "section-gap": "80px",
              "gutter": "24px",
              "margin-mobile": "16px",
              "component-padding": "1.5rem",
              "container-max": "1280px"
            },
            fontFamily: {
              "body-lg": ["Inter", "sans-serif"],
              "label-sm": ["Inter", "sans-serif"],
              "display-hero": ["Sora", "sans-serif"],
              "headline-lg-mobile": ["Sora", "sans-serif"],
              "headline-lg": ["Sora", "sans-serif"],
              "body-md": ["Inter", "sans-serif"],
              "headline-md": ["Sora", "sans-serif"],
              "label-bold": ["Inter", "sans-serif"]
            },
            fontSize: {
              "body-lg": ["18px", {"lineHeight": "1.6", "fontWeight": "400"}],
              "label-sm": ["12px", {"lineHeight": "1.2", "fontWeight": "500"}],
              "display-hero": ["72px", {"lineHeight": "1.1", "letterSpacing": "-0.04em", "fontWeight": "800"}],
              "headline-lg-mobile": ["32px", {"lineHeight": "1.2", "fontWeight": "700"}],
              "headline-lg": ["48px", {"lineHeight": "1.2", "letterSpacing": "-0.02em", "fontWeight": "700"}],
              "body-md": ["16px", {"lineHeight": "1.5", "fontWeight": "400"}],
              "headline-md": ["24px", {"lineHeight": "1.3", "fontWeight": "600"}],
              "label-bold": ["14px", {"lineHeight": "1.2", "letterSpacing": "0.05em", "fontWeight": "600"}]
            }
          }
        }
      }
    </script>
    <style>
      body {
        background-color: #0e0e11;
        color: #e4e1e6;
        font-family: 'Inter', sans-serif;
        min-height: 100vh;
        position: relative;
        overflow-x: hidden;
      }
      body::before {
        content: '';
        position: absolute;
        inset: 0;
        z-index: -10;
        background-image: radial-gradient(#3f3f46 1px, transparent 1px);
        background-size: 16px 16px;
        opacity: 0.3;
        pointer-events: none;
      }
      .glass {
        background: rgba(9, 9, 11, 0.8);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.05);
        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.5);
      }
      .glass-light {
        background: rgba(24, 24, 27, 0.6);
        backdrop-filter: blur(16px);
        border: 1px solid rgba(255, 255, 255, 0.05);
      }
      .glass-card {
        background: rgba(24, 24, 27, 0.7);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(148, 163, 184, 0.1);
      }
      .active-red-glow:hover {
        box-shadow: 0 0 20px rgba(225, 29, 72, 0.4);
      }
      .text-glow {
        text-shadow: 0 0 15px rgba(225, 29, 72, 0.4);
      }
      .text-gradient {
        background: linear-gradient(to right, #ffffff, #ffb3b6);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .hero-gradient {
        background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%);
      }
      .material-symbols-outlined {
        font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
      }
    </style>
  `;

  // Generate translation script and definitions
  const getTranslationScript = () => `
    <script>
      const translations = ${JSON.stringify(translations)};
      
      function translatePage() {
        const lang = localStorage.getItem('lang') || 'tr';
        document.documentElement.lang = lang;
        
        // Update language active indicator
        const langIndicator = document.getElementById('active-lang');
        if (langIndicator) langIndicator.textContent = lang.toUpperCase();
        
        // Translate normal text
        document.querySelectorAll('[data-t]').forEach(el => {
          const key = el.getAttribute('data-t');
          if (translations[lang] && translations[lang][key] !== undefined) {
            el.innerHTML = translations[lang][key];
          }
        });

        // Translate placeholders
        document.querySelectorAll('[data-t-placeholder]').forEach(el => {
          const key = el.getAttribute('data-t-placeholder');
          if (translations[lang] && translations[lang][key] !== undefined) {
            el.setAttribute('placeholder', translations[lang][key]);
          }
        });
      }

      function setLanguage(lang) {
        localStorage.setItem('lang', lang);
        translatePage();
        const dropdown = document.getElementById('lang-dropdown');
        if (dropdown) dropdown.classList.add('hidden');
      }

      function toggleLangDropdown() {
        const dropdown = document.getElementById('lang-dropdown');
        if (dropdown) dropdown.classList.toggle('hidden');
      }

      function toggleSidebar() {
        const sidebar = document.getElementById('sidebar-menu');
        const backdrop = document.getElementById('sidebar-backdrop');
        if (sidebar && backdrop) {
          sidebar.classList.toggle('-translate-x-full');
          backdrop.classList.toggle('hidden');
        }
      }

      window.addEventListener('DOMContentLoaded', () => {
        translatePage();
        
        // Close dropdown when clicking outside
        window.addEventListener('click', (e) => {
          const langBtn = document.getElementById('lang-btn');
          const dropdown = document.getElementById('lang-dropdown');
          if (langBtn && dropdown && !langBtn.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.add('hidden');
          }
        });
      });
    </script>
  `;

  // Generate common layout header & sidebar and footer
  const getCommonLayout = (contentHTML) => `
    <!-- Sidebar Backdrop -->
    <div id="sidebar-backdrop" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 transition-opacity hidden" onclick="toggleSidebar()"></div>
    
    <!-- Sidebar Menu -->
    <aside id="sidebar-menu" class="fixed left-0 top-0 h-full z-40 flex flex-col py-6 bg-surface-zinc w-64 shadow-xl border-r border-outline-variant/10 transition-transform duration-300 ease-in-out -translate-x-full">
      <div class="px-6 mb-10 mt-20 flex justify-between items-start">
        <div class="flex items-center gap-3 mb-8">
          <div class="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center">
            <span class="material-symbols-outlined text-white">person</span>
          </div>
          <div>
            <h3 class="font-headline-md text-label-bold text-on-surface" data-t="side_fleet_manager">Filo Yöneticisi</h3>
            <p class="text-label-sm text-text-muted" data-t="side_company">Dortmund Logistics Gmbh</p>
          </div>
        </div>
        <button onclick="toggleSidebar()" class="material-symbols-outlined text-text-muted hover:text-white mt-2 lg:hidden">close</button>
      </div>
      
      <nav class="flex-1 space-y-1">
        <a href="dashboard.html" class="text-on-surface-variant hover:bg-surface-variant/50 rounded-lg mx-2 my-1 px-4 py-3 flex items-center gap-3 font-label-bold transition-colors">
          <span class="material-symbols-outlined">dashboard</span> <span data-t="side_dashboard">Dashboard</span>
        </a>
        <a href="index.html" class="text-on-surface-variant hover:bg-surface-variant/50 rounded-lg mx-2 my-1 px-4 py-3 flex items-center gap-3 font-label-bold transition-colors">
          <span class="material-symbols-outlined">directions_car</span> <span data-t="side_inventory">Envanter</span>
        </a>
        <a href="#" class="text-on-surface-variant hover:bg-surface-variant/50 rounded-lg mx-2 my-1 px-4 py-3 flex items-center gap-3 font-label-bold transition-colors">
          <span class="material-symbols-outlined">description</span> <span data-t="side_applications">Başvurular</span>
        </a>
        <a href="#" class="text-on-surface-variant hover:bg-surface-variant/50 rounded-lg mx-2 my-1 px-4 py-3 flex items-center gap-3 font-label-bold transition-colors">
          <span class="material-symbols-outlined">history</span> <span data-t="side_history">Geçmiş</span>
        </a>
      </nav>
      
      <div class="px-2 pt-6 border-t border-outline-variant/10">
        <a href="#" class="text-on-surface-variant hover:bg-surface-variant/50 rounded-lg px-4 py-3 flex items-center gap-3 font-label-bold transition-colors">
          <span class="material-symbols-outlined">help</span> <span data-t="side_support">Destek</span>
        </a>
        <button class="w-full text-left text-on-surface-variant hover:bg-surface-variant/50 rounded-lg px-4 py-3 flex items-center gap-3 font-label-bold transition-colors">
          <span class="material-symbols-outlined">logout</span> <span data-t="btn_signout">Çıkış Yap</span>
        </button>
      </div>
    </aside>

    <!-- Top Navigation Bar -->
    <nav class="fixed top-0 w-full z-50 bg-surface/70 backdrop-blur-md border-b border-outline-variant/10 flex justify-between items-center px-6 h-20 max-w-container-max mx-auto left-1/2 -translate-x-1/2">
      <div class="flex items-center gap-8">
        <div class="flex items-center gap-4">
          <button onclick="toggleSidebar()" class="material-symbols-outlined text-on-surface hover:text-primary transition-colors text-2xl">
            menu
          </button>
          <a href="index.html" class="text-headline-md font-headline-md font-black tracking-tighter text-primary hover:opacity-80 transition-opacity hidden sm:block" data-t="brand_name">
            DORTMUND FLEET FINANCE
          </a>
        </div>
        <div class="hidden md:flex gap-6">
          <a href="services.html" class="text-on-surface-variant font-medium hover:text-primary transition-colors duration-200" data-t="services_title">
            Hizmetlerimiz
          </a>
          <a href="index.html" class="text-on-surface-variant font-medium hover:text-primary transition-colors duration-200" data-t="nav_showroom">
            Vitrin
          </a>
          <a href="dashboard.html" class="text-on-surface-variant font-medium hover:text-primary transition-colors duration-200" data-t="nav_panel">
            Panel
          </a>
        </div>
      </div>
      
      <div class="flex items-center gap-4">
        <div class="hidden sm:flex bg-surface-container-high rounded-lg px-4 py-2 items-center gap-2 border border-outline-variant/20">
          <span class="material-symbols-outlined text-text-muted">search</span>
          <input 
            id="search-input-nav"
            class="bg-transparent border-none focus:ring-0 text-label-bold font-label-bold text-on-surface placeholder:text-text-muted w-32 lg:w-48 outline-none" 
            placeholder="Filoda ara..." 
            data-t-placeholder="search_placeholder"
            type="text"
            oninput="if(typeof handleSearch === 'function') handleSearch(this.value)"
          />
        </div>

        <button class="material-symbols-outlined text-on-surface-variant hover:text-primary transition-all hidden md:block">notifications</button>
        <button class="material-symbols-outlined text-on-surface-variant hover:text-primary transition-all hidden md:block">settings</button>

        <!-- Language Switcher -->
        <div class="relative">
          <button 
            id="lang-btn"
            onclick="toggleLangDropdown()"
            class="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container-high/40 border border-outline-variant/15 text-label-bold font-label-bold text-on-surface hover:bg-surface-container-high/70 active:scale-95 transition-all outline-none"
          >
            <span class="material-symbols-outlined text-text-muted text-lg">language</span>
            <span id="active-lang" class="uppercase text-sm">TR</span>
            <span class="material-symbols-outlined text-xs text-text-muted">keyboard_arrow_down</span>
          </button>
          
          <div id="lang-dropdown" class="absolute right-0 mt-2 w-28 rounded-xl bg-surface/90 backdrop-blur-xl border border-outline-variant/20 shadow-xl overflow-hidden z-50 hidden">
            <button onclick="setLanguage('tr')" class="w-full text-left px-4 py-2 text-sm hover:bg-primary-container/20 text-on-surface-variant transition-colors">
              Türkçe
            </button>
            <button onclick="setLanguage('en')" class="w-full text-left px-4 py-2 text-sm hover:bg-primary-container/20 text-on-surface-variant transition-colors">
              English
            </button>
            <button onclick="setLanguage('de')" class="w-full text-left px-4 py-2 text-sm hover:bg-primary-container/20 text-on-surface-variant transition-colors">
              Deutsch
            </button>
          </div>
        </div>

        <a href="login.html" id="nav-login-btn" class="bg-primary-container text-on-primary-container px-6 py-2 rounded-lg font-label-bold text-label-bold hover:opacity-80 active:scale-95 transition-all">
          <span data-t="btn_signin">Giriş</span>
        </a>
      </div>
    </nav>

    <!-- Main Content Area -->
    <div class="min-h-screen flex flex-col">
      <div class="flex-grow pt-20">
        ${contentHTML}
      </div>

      <!-- Footer Section -->
      <footer class="w-full py-12 px-6 flex flex-col md:flex-row justify-between items-center max-w-container-max mx-auto mt-20 border-t border-outline-variant/20 bg-background-deep z-10 relative">
        <div class="mb-8 md:mb-0 text-center md:text-left">
          <div class="text-label-bold font-label-bold text-primary mb-2" data-t="brand_name">
            DORTMUND FLEET FINANCE
          </div>
          <p class="text-text-muted text-xs max-w-xs mx-auto md:mx-0 uppercase" data-t="footer_rights">
            © 2024 DORTMUND FLEET FINANCE. TÜM HAKLARI SAKLIDIR. HASSAS LEASİNG ÇÖZÜMLERİ.
          </p>
        </div>
        
        <div class="flex flex-wrap justify-center gap-6 md:gap-8">
          <a href="#" class="text-text-muted hover:text-primary transition-colors text-label-sm font-label-sm uppercase" data-t="legal_notice">
            Yasal Uyarı
          </a>
          <a href="#" class="text-text-muted hover:text-primary transition-colors text-label-sm font-label-sm uppercase" data-t="privacy_policy">
            Veri Gizliliği
          </a>
          <a href="#" class="text-text-muted hover:text-primary transition-colors text-label-sm font-label-sm uppercase" data-t="terms_of_use">
            Hizmet Şartları
          </a>
          <a href="#" class="text-text-muted hover:text-primary transition-colors text-label-sm font-label-sm uppercase" data-t="imprint">
            Künye
          </a>
        </div>

        <div class="mt-8 md:mt-0 flex gap-4">
          <a href="#" class="w-10 h-10 rounded-full glass-card flex items-center justify-center hover:bg-primary-container transition-all cursor-pointer group">
            <span class="material-symbols-outlined text-text-muted group-hover:text-white transition-colors">language</span>
          </a>
          <a href="#" class="w-10 h-10 rounded-full glass-card flex items-center justify-center hover:bg-primary-container transition-all cursor-pointer group">
            <span class="material-symbols-outlined text-text-muted group-hover:text-white transition-colors">share</span>
          </a>
        </div>
      </footer>
    </div>
  `;

  // ==================== 1. GENERATE INDEX.HTML ====================
  const indexContent = `
    <main class="pt-12 pb-20 px-6 min-h-screen">
      <!-- Header Section -->
      <header class="max-w-container-max mx-auto mb-12">
        <div class="flex flex-col md:flex-row justify-between items-end gap-6">
          <div class="space-y-4">
            <span class="text-primary font-label-bold text-label-bold tracking-widest uppercase" data-t="showroom_subtitle">
              Premium Filo Seçimi
            </span>
            <h1 class="text-display-hero font-display-hero text-on-surface leading-none text-5xl md:text-7xl">
              <span data-t="showroom_title_part1">Dijital</span> <span class="text-primary-container" data-t="showroom_title_part2">Showroom</span>
            </h1>
            <p class="text-body-lg font-body-lg text-text-muted max-w-2xl" data-t="showroom_desc">
              Profesyonel filolar için yüksek performanslı finansman. Agresif oranlar, endüstriyel hassasiyet ve kurumsal ortaklar için anında onay.
            </p>
          </div>
          <div class="flex gap-4">
            <div class="glass-card p-4 rounded-xl text-center min-w-[140px]">
              <p class="text-label-sm text-text-muted uppercase text-xs" data-t="avg_interest">Ort. Faiz</p>
              <p class="text-2xl font-bold text-primary">3.8%</p>
            </div>
            <div class="glass-card p-4 rounded-xl text-center min-w-[140px]">
              <p class="text-label-sm text-text-muted uppercase text-xs" data-t="vehicle_count">Filo Değeri</p>
              <p id="fleet-value-display" class="text-2xl font-bold text-on-surface">€2.400.000</p>
            </div>
          </div>
        </div>
        
        <!-- Filters -->
        <div class="mt-12 flex flex-wrap gap-4 items-center">
          <button onclick="setCategoryFilter('all')" class="category-btn glass-card px-6 py-2 rounded-full border border-primary/50 text-primary font-label-bold text-label-bold text-sm" data-t="all_vehicles">Tüm Araçlar</button>
          <button onclick="setCategoryFilter('EV / Hibrit')" class="category-btn glass-card px-6 py-2 rounded-full text-text-muted hover:text-on-surface transition-all font-label-bold text-label-bold text-sm" data-t="electric_hybrid">EV / Hibrit</button>
          <button onclick="setCategoryFilter('Spor')" class="category-btn glass-card px-6 py-2 rounded-full text-text-muted hover:text-on-surface transition-all font-label-bold text-label-bold text-sm" data-t="performance">Performans</button>
          <button onclick="setCategoryFilter('Lüks SUV')" class="category-btn glass-card px-6 py-2 rounded-full text-text-muted hover:text-on-surface transition-all font-label-bold text-label-bold text-sm" data-t="suv">SUV</button>
          
          <div class="ml-auto glass-card flex items-center rounded-lg px-4 py-2 gap-2">
            <span class="text-label-bold font-label-bold text-text-muted text-sm" data-t="sort_by">Sırala:</span>
            <select id="sort-select" onchange="handleSort(this.value)" class="bg-transparent border-none text-on-surface font-label-bold text-label-bold focus:ring-0 cursor-pointer outline-none text-sm">
              <option value="rate_asc" class="bg-surface" data-t="sort_monthly_asc">Aylık Taksit: Düşükten Yükseğe</option>
              <option value="price_desc" class="bg-surface" data-t="sort_power_desc">Fiyat: Yüksekten Düşüğe</option>
            </select>
          </div>
        </div>
      </header>

      <!-- Inventory Grid -->
      <div class="max-w-container-max mx-auto">
        <div id="inventory-grid" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <!-- Dynamically filled by JS -->
        </div>
      </div>

      <!-- Hizmetlerimiz Section -->
      <section class="max-w-container-max mx-auto mt-24 mb-24">
        <div class="flex flex-col items-center mb-12">
          <span class="text-primary font-label-bold text-label-bold tracking-widest uppercase mb-2" data-t="services_subtitle">Uzmanlığımız</span>
          <h2 class="text-3xl font-bold text-on-surface" data-t="services_title">Hizmetlerimiz</h2>
          <div class="h-1 w-24 bg-primary-container mt-4"></div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="glass-card p-8 rounded-2xl hover:border-primary-container/50 transition-all duration-300 group">
            <div class="w-12 h-12 rounded-lg bg-primary-container/10 flex items-center justify-center mb-6 group-hover:bg-primary transition-colors">
              <span class="material-symbols-outlined text-primary group-hover:text-white">payments</span>
            </div>
            <h3 class="text-xl font-bold text-on-surface mb-3" data-t="srv1_title">Profesyonel Finansman</h3>
            <p class="text-body-md text-text-muted text-sm" data-t="srv1_desc">Hızlandırılmış onay süreçleri ve size özel faiz oranları ile finansal yükünüzü hafifletiyoruz. B2B ve kurumsal çözümler.</p>
          </div>
          
          <div class="glass-card p-8 rounded-2xl hover:border-primary-container/50 transition-all duration-300 group">
            <div class="w-12 h-12 rounded-lg bg-primary-container/10 flex items-center justify-center mb-6 group-hover:bg-primary transition-colors">
              <span class="material-symbols-outlined text-primary group-hover:text-white">verified_user</span>
            </div>
            <h3 class="text-xl font-bold text-on-surface mb-3" data-t="srv5_title">Hazırlık & Garanti</h3>
            <p class="text-body-md text-text-muted text-sm" data-t="srv5_desc">Tüm araçlar 100+ nokta kontrolünden geçer ve güvence altına alınır.</p>
          </div>
          
          <div class="glass-card p-8 rounded-2xl hover:border-primary-container/50 transition-all duration-300 group">
            <div class="w-12 h-12 rounded-lg bg-primary-container/10 flex items-center justify-center mb-6 group-hover:bg-primary transition-colors">
              <span class="material-symbols-outlined text-primary group-hover:text-white">article</span>
            </div>
            <h3 class="text-xl font-bold text-on-surface mb-3" data-t="srv3_title">Teslimat & Kayıt</h3>
            <p class="text-body-md text-text-muted text-sm" data-t="srv3_desc">Türkiye genelinde kapıya teslimat ve tüm tescil işlemlerinin anahtar teslim yönetimi.</p>
          </div>
          
          <div class="glass-card p-8 rounded-2xl hover:border-primary-container/50 transition-all duration-300 group">
            <div class="w-12 h-12 rounded-lg bg-primary-container/10 flex items-center justify-center mb-6 group-hover:bg-primary transition-colors">
              <span class="material-symbols-outlined text-primary group-hover:text-white">shopping_cart</span>
            </div>
            <h3 class="text-xl font-bold text-on-surface mb-3" data-t="srv2_title">Araç Alımı</h3>
            <p class="text-body-md text-text-muted text-sm" data-t="srv2_desc">Mevcut aracınızı en iyi piyasa değerinden takas yapın veya nakit olarak satın.</p>
          </div>
        </div>
      </section>

      <!-- Süreç Section -->
      <section class="max-w-container-max mx-auto mb-24">
        <div class="bg-surface-zinc/50 border border-outline-variant/10 rounded-3xl p-12 overflow-hidden relative">
          <div class="absolute top-0 right-0 w-64 h-64 bg-primary-container/10 blur-[120px] rounded-full"></div>
          <div class="flex flex-col md:flex-row justify-between items-start gap-12 relative z-10">
            <div class="max-w-sm">
              <span class="text-primary font-label-bold text-label-bold tracking-widest uppercase" data-t="process_subtitle">Nasıl Çalışır</span>
              <h2 class="text-3xl font-bold text-on-surface mt-2 mb-6" data-t="process_title">Süreç</h2>
              <p class="text-body-lg text-text-muted text-sm" data-t="process_desc">Sadece 5 adımda hayalinizdeki araca profesyonel finansmanla sahip olun.</p>
              <button class="mt-8 bg-primary-container text-white px-8 py-3 rounded-lg font-label-bold hover:bg-accent-red-bright transition-all" data-t="process_btn">Başvuruyu Başlat</button>
            </div>
            <div class="flex-1 w-full space-y-8">
              <div class="flex gap-6 items-start">
                <div class="flex flex-col items-center">
                  <div class="w-10 h-10 rounded-full border-2 border-primary flex items-center justify-center text-primary font-bold">1</div>
                  <div class="w-0.5 h-12 bg-outline-variant/20"></div>
                </div>
                <div>
                  <h4 class="text-on-surface font-label-bold" data-t="step1_title">Araç Seçimi</h4>
                  <p class="text-sm text-text-muted" data-t="step1_desc">Envanterimizden size en uygun aracı belirleyin.</p>
                </div>
              </div>
              
              <div class="flex gap-6 items-start">
                <div class="flex flex-col items-center">
                  <div class="w-10 h-10 rounded-full border-2 border-primary flex items-center justify-center text-primary font-bold">2</div>
                  <div class="w-0.5 h-12 bg-outline-variant/20"></div>
                </div>
                <div>
                  <h4 class="text-on-surface font-label-bold" data-t="step2_title">Başvuru Formu</h4>
                  <p class="text-sm text-text-muted" data-t="step2_desc">Online başvuru formunu 2 dakikada doldurun.</p>
                </div>
              </div>
              
              <div class="flex gap-6 items-start">
                <div class="flex flex-col items-center">
                  <div class="w-10 h-10 rounded-full border-2 border-primary flex items-center justify-center text-primary font-bold">3</div>
                  <div class="w-0.5 h-12 bg-outline-variant/20"></div>
                </div>
                <div>
                  <h4 class="text-on-surface font-label-bold" data-t="step3_title">Değerlendirme</h4>
                  <p class="text-sm text-text-muted" data-t="step3_desc">Uzman ekibimiz başvurunuzu anında incelesin.</p>
                </div>
              </div>
              
              <div class="flex gap-6 items-start">
                <div class="flex flex-col items-center">
                  <div class="w-10 h-10 rounded-full border-2 border-primary flex items-center justify-center text-primary font-bold">4</div>
                  <div class="w-0.5 h-12 bg-outline-variant/20"></div>
                </div>
                <div>
                  <h4 class="text-on-surface font-label-bold" data-t="step4_title">Evrak Teslimi</h4>
                  <p class="text-sm text-text-muted" data-t="step4_desc">Gerekli belgeleri dijital olarak güvenle gönderin.</p>
                </div>
              </div>
              
              <div class="flex gap-6 items-start">
                <div class="flex flex-col items-center">
                  <div class="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
                    <span class="material-symbols-outlined text-sm">check</span>
                  </div>
                </div>
                <div>
                  <h4 class="text-on-surface font-label-bold" data-t="step5_title">Teslimat</h4>
                  <p class="text-sm text-text-muted" data-t="step5_desc">Tebrikler! Aracınız kullanıma hazır ve teslim ediliyor.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <script>
      const originalVehicles = ${JSON.stringify(contents)};
      let activeCategory = 'all';
      let activeSearch = '';
      let activeSort = 'rate_asc';

      function renderVehicles() {
        const lang = localStorage.getItem('lang') || 'tr';
        const grid = document.getElementById('inventory-grid');
        grid.innerHTML = '';

        // Filter vehicles
        let filtered = originalVehicles.filter(item => {
          if (!item.status) return false;
          if (activeCategory !== 'all') {
            if (activeCategory === 'Spor' && item.category !== 'Spor' && item.category !== 'Spor Sedan' && item.category !== 'Süper SUV') return false;
            if (activeCategory === 'Lüks SUV' && item.category !== 'Lüks SUV' && item.category !== 'Süper SUV') return false;
            if (activeCategory === 'EV / Hibrit' && !item.category?.includes('EV') && !item.category?.includes('Hibrit')) return false;
          }
          if (activeSearch) {
            const query = activeSearch.toLowerCase();
            const matchTitle = item.title?.toLowerCase().includes(query);
            const matchSummary = item.summary?.toLowerCase().includes(query);
            const matchCategory = item.category?.toLowerCase().includes(query);
            if (!matchTitle && !matchSummary && !matchCategory) return false;
          }
          return true;
        });

        // Sort vehicles
        filtered.sort((a, b) => {
          if (activeSort === 'rate_asc') {
            return (a.monthly_rate || 0) - (b.monthly_rate || 0);
          } else if (activeSort === 'price_desc') {
            return (b.price || 0) - (a.price || 0);
          }
          return 0;
        });

        // Calculate Fleet Value
        const totalVal = filtered.reduce((sum, item) => sum + (item.price || 0), 0);
        document.getElementById('fleet-value-display').textContent = '€' + totalVal.toLocaleString('de-DE');

        if (filtered.length === 0) {
          grid.innerHTML = \`
            <div class="col-span-full glass-card rounded-2xl p-12 text-center mt-12">
              <p class="text-text-muted text-lg font-label-bold" data-t="no_vehicles">\${translations[lang]['no_vehicles'] || 'Henüz bir araç bulunmuyor.'}</p>
            </div>
          \`;
          return;
        }

        filtered.forEach(item => {
          const detailUrl = item.slug + '.html';
          const cardHtml = \`
            <div class="glass-card rounded-2xl overflow-hidden border border-outline-variant/10 hover:border-primary-container/40 transition-all duration-300 flex flex-col group h-full">
              <!-- Image Container -->
              <div class="relative aspect-[16/10] overflow-hidden bg-background">
                <img src="\${item.image_url}" alt="\&quot;\${item.title}\&quot;" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700">
                <div class="absolute inset-0 bg-gradient-to-t from-background-deep via-transparent to-transparent opacity-80"></div>
                <div class="absolute top-4 left-4 flex gap-2">
                  <span class="bg-primary-container text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm" data-t="card_promo">PROMO</span>
                  \${item.category ? \`<span class="bg-surface/80 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full border border-white/5">\${item.category}</span>\` : ''}
                </div>
                <div class="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                  <div>
                    <h3 class="text-white text-xl font-bold group-hover:text-primary transition-colors">\${item.title}</h3>
                    <p class="text-xs text-text-muted">\${item.year} | \${item.mileage?.toLocaleString('de-DE')} km</p>
                  </div>
                </div>
              </div>

              <!-- Info Body -->
              <div class="p-6 flex-grow flex flex-col justify-between">
                <p class="text-text-muted text-sm mb-6 line-clamp-2">\${item.summary || item.body || ''}</p>
                
                <div class="space-y-4">
                  <!-- Pricing Info Row -->
                  <div class="grid grid-cols-2 gap-4 border-t border-b border-outline-variant/10 py-4">
                    <div>
                      <p class="text-[10px] text-text-muted uppercase tracking-wider" data-t="card_down">\${translations[lang]['card_down'] || 'Peşinat'}</p>
                      <p class="text-white font-bold">€\${item.down_payment?.toLocaleString('de-DE')}</p>
                    </div>
                    <div>
                      <p class="text-[10px] text-text-muted uppercase tracking-wider" data-t="card_interest">\${translations[lang]['card_interest'] || 'Faiz'}</p>
                      <p class="text-primary font-bold">\${item.interest_rate}%</p>
                    </div>
                  </div>

                  <!-- Monthly Taksit and Button -->
                  <div class="flex items-center justify-between mt-4">
                    <div>
                      <p class="text-[10px] text-text-muted uppercase tracking-wider" data-t="detail_monthly_rate">\${translations[lang]['detail_monthly_rate'] || 'Aylık Taksit'}</p>
                      <div class="flex items-baseline">
                        <span class="text-2xl font-extrabold text-white">€\${item.monthly_rate?.toLocaleString('de-DE')}</span>
                        <span class="text-xs text-text-muted">/Ay</span>
                      </div>
                    </div>
                    <a href="\${detailUrl}" class="bg-primary-container text-white px-5 py-3 rounded-xl font-bold hover:bg-accent-red-bright transition-all active:scale-[0.98] text-sm" data-t="card_configure">
                      \${translations[lang]['card_configure'] || 'Teklifi Yapılandır'}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          \`;
          grid.innerHTML += cardHtml;
        });
      }

      function setCategoryFilter(cat) {
        activeCategory = cat;
        // Update filter buttons
        document.querySelectorAll('.category-btn').forEach(btn => {
          btn.classList.remove('border-primary/50', 'text-primary');
          btn.classList.add('text-text-muted');
        });
        event.currentTarget.classList.add('border-primary/50', 'text-primary');
        event.currentTarget.classList.remove('text-text-muted');
        renderVehicles();
      }

      function handleSearch(val) {
        activeSearch = val;
        renderVehicles();
      }

      function handleSort(val) {
        activeSort = val;
        renderVehicles();
      }

      window.addEventListener('DOMContentLoaded', () => {
        renderVehicles();
        
        // Listen to active language changes
        const originalSetLanguage = window.setLanguage;
        window.setLanguage = (l) => {
          originalSetLanguage(l);
          renderVehicles();
        };
      });
    </script>
  `;

  const indexHTML = getHead("Vitrin") + getCommonLayout(indexContent) + getTranslationScript() + "</html>";
  fs.writeFileSync(path.join(outputDir, 'index.html'), indexHTML);
  console.log("Generated HTML/index.html successfully.");


  // ==================== 2. GENERATE SERVICES.HTML ====================
  const servicesContent = `
    <div class="bg-background text-on-background font-body-md overflow-x-hidden">
      <!-- Hero Section -->
      <section class="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div class="absolute inset-0 z-0">
          <div class="absolute inset-0 bg-gradient-to-b from-background-deep via-transparent to-background-deep z-10"></div>
          <img 
            class="w-full h-full object-cover opacity-40 scale-105 transform hover:scale-100 transition-transform duration-[10000ms]" 
            alt="Hero background" 
            src="https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1920&q=80"
          />
        </div>
        <div class="relative z-20 text-center px-4 max-w-4xl">
          <span class="text-primary font-label-bold uppercase tracking-[0.3em] mb-4 block" data-t="hero_services_subtitle">
            Velocity Performance
          </span>
          <h1 class="font-display-hero text-4xl md:text-6xl mb-6 text-gradient font-extrabold leading-none" data-t="hero_services_title">
            Premium Araç Hizmetleri
          </h1>
          <p class="font-body-lg text-text-muted mb-10 max-w-2xl mx-auto text-sm md:text-base" data-t="hero_services_desc">
            Kurumsal filo yönetimi ve lüks araç leasing çözümlerinde Alman hassasiyeti. Hız, güven ve profesyonel finansman tek bir çatı altında.
          </p>
          <div class="flex flex-wrap justify-center gap-4">
            <a href="index.html" class="bg-primary-container text-white px-8 py-4 rounded-lg font-label-bold active-red-glow hover:bg-red-500 transition-all flex items-center gap-2">
              <span data-t="hero_services_btn1">HEMEN BAŞVUR</span> <span class="material-symbols-outlined">arrow_forward</span>
            </a>
          </div>
        </div>
      </section>

      <!-- Services Grid (Bento Style) -->
      <section class="max-w-container-max mx-auto px-6 py-16">
        <div class="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h2 class="text-3xl font-bold text-white mb-4" data-t="services_title">Hizmetlerimiz</h2>
            <div class="w-24 h-1 bg-primary-container"></div>
          </div>
          <p class="text-text-muted font-body-md max-w-md text-sm" data-t="services_desc">
            Filo yönetiminden bireysel lüks leasing'e kadar, her aşamada en yüksek kalite standartlarını sunuyoruz.
          </p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div class="md:col-span-8 glass-card rounded-xl p-8 group hover:border-primary/50 transition-all relative overflow-hidden h-[400px] flex flex-col justify-end">
            <div class="absolute inset-0 z-0">
              <img 
                class="w-full h-full object-cover opacity-10 group-hover:opacity-20 group-hover:scale-105 transition-all duration-700 grayscale group-hover:grayscale-0" 
                alt="Professional Finance" 
                src="https://images.unsplash.com/photo-1616788494707-ec28f08d05a1?auto=format&fit=crop&w=1200&q=80"
              />
            </div>
            <div class="absolute top-0 right-0 p-8 z-10">
              <span class="material-symbols-outlined text-primary text-5xl">account_balance</span>
            </div>
            <h3 class="text-2xl font-bold text-white mb-2 relative z-10" data-t="srv1_title">Profesyonel Finansman</h3>
            <p class="text-text-muted font-body-md mb-6 relative z-10 text-sm" data-t="srv1_desc">
              Hızlandırılmış onay süreçleri ve size özel faiz oranları ile finansal yükünüzü hafifletiyoruz. B2B ve kurumsal çözümler.
            </p>
            <a href="index.html" class="text-primary font-label-bold flex items-center gap-2 relative z-10 group-hover:gap-4 transition-all cursor-pointer">
              <span data-t="srv_details_link">DETAYLARI GÖR</span> <span class="material-symbols-outlined">trending_flat</span>
            </a>
            <div class="absolute inset-0 bg-gradient-to-t from-background-deep via-transparent to-transparent opacity-60 z-0"></div>
          </div>
          
          <div class="md:col-span-4 glass-card rounded-xl p-8 group hover:border-primary/50 transition-all flex flex-col items-center text-center justify-center border-l-4 border-l-primary-container">
            <span class="material-symbols-outlined text-primary text-6xl mb-4">shopping_cart</span>
            <h3 class="text-xl font-bold text-white mb-2" data-t="srv2_title">Araç Alımı</h3>
            <p class="text-text-muted font-body-md text-sm" data-t="srv2_desc">Mevcut aracınızı en iyi piyasa değerinden takas yapın veya nakit olarak satın.</p>
          </div>
          
          <div class="md:col-span-4 glass-card rounded-xl p-8 group hover:border-primary/50 transition-all flex flex-col justify-between">
            <span class="material-symbols-outlined text-primary text-4xl mb-4">local_shipping</span>
            <div>
              <h3 class="text-xl font-bold text-white mb-2" data-t="srv3_title">Teslimat & Kayıt</h3>
              <p class="text-text-muted font-body-md text-sm" data-t="srv3_desc">Türkiye genelinde kapıya teslimat ve tüm tescil işlemlerinin anahtar teslim yönetimi.</p>
            </div>
          </div>
          
          <div class="md:col-span-4 glass-card overflow-hidden group hover:border-primary/50 transition-all relative rounded-xl h-[240px]">
            <div class="absolute inset-0">
              <img 
                class="w-full h-full object-cover opacity-30 grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" 
                alt="Car wrapping" 
                src="https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80"
              />
            </div>
            <div class="relative z-10 p-8 h-full flex flex-col justify-end bg-gradient-to-t from-background-deep to-transparent">
              <h3 class="text-xl font-bold text-white mb-2" data-t="srv4_title">Araç Kaplama</h3>
              <p class="text-text-muted font-body-md text-sm" data-t="srv4_desc">Boya koruma (PPF) ve estetik değişimler için premium malzeme kalitesi.</p>
            </div>
          </div>
          
          <div class="md:col-span-4 glass-card rounded-xl p-8 group hover:border-primary/50 transition-all flex flex-col justify-between bg-surface-zinc">
            <div class="flex justify-between items-start mb-4">
              <span class="material-symbols-outlined text-primary text-4xl">verified_user</span>
              <span class="material-symbols-outlined text-on-surface-variant/30 text-4xl">auto_fix_high</span>
            </div>
            <div>
              <h3 class="text-xl font-bold text-white mb-2" data-t="srv5_title">Hazırlık & Garanti</h3>
              <p class="text-text-muted font-body-md text-sm" data-t="srv5_desc">Tüm araçlar 100+ nokta kontrolünden geçer ve güvence altına alınır.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Why Us Section -->
      <section class="max-w-container-max mx-auto px-6 py-16 mb-20">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 class="text-3xl font-bold text-white mb-8" data-t="why_us_title">Neden Biz?</h2>
            <div class="space-y-8">
              <div class="flex gap-6 group">
                <div class="flex-shrink-0 w-12 h-12 bg-primary-container/10 border border-primary-container/30 flex items-center justify-center rounded-lg group-hover:bg-primary transition-all">
                  <span class="material-symbols-outlined text-primary group-hover:text-white transition-colors">timer</span>
                </div>
                <div>
                  <h4 class="font-headline-md text-white text-lg mb-1" data-t="why1_title">Maksimum İşlem Süresi</h4>
                  <p class="text-text-muted text-sm" data-t="why1_desc">Evrak tesliminden sonra 48 saat içinde sonuçlanan finansman süreçleri.</p>
                </div>
              </div>
              
              <div class="flex gap-6 group">
                <div class="flex-shrink-0 w-12 h-12 bg-primary-container/10 border border-primary-container/30 flex items-center justify-center rounded-lg group-hover:bg-primary transition-all">
                  <span class="material-symbols-outlined text-primary group-hover:text-white transition-colors">support_agent</span>
                </div>
                <div>
                  <h4 class="font-headline-md text-white text-lg mb-1" data-t="why2_title">Müşteri Odaklı Hizmet</h4>
                  <p class="text-text-muted text-sm" data-t="why2_desc">Her müşteriye atanan özel filo danışmanı ile kişiselleştirilmiş deneyim.</p>
                </div>
              </div>
              
              <div class="flex gap-6 group">
                <div class="flex-shrink-0 w-12 h-12 bg-primary-container/10 border border-primary-container/30 flex items-center justify-center rounded-lg group-hover:bg-primary transition-all">
                  <span class="material-symbols-outlined text-primary group-hover:text-white transition-colors">dashboard_customize</span>
                </div>
                <div>
                  <h4 class="font-headline-md text-white text-lg mb-1" data-t="why3_title">Geniş Araç Seçimi</h4>
                  <p class="text-text-muted text-sm" data-t="why3_desc">Premium markaların en yeni modelleri ve özel donanım paketli araçlar.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-4 pt-12">
              <div class="glass-card aspect-square rounded-2xl flex flex-col items-center justify-center p-6 border-b-4 border-b-primary-container">
                <span class="text-4xl font-extrabold text-primary leading-none mb-2" data-t="stat1_val">12+</span>
                <span class="text-on-surface-variant font-label-bold text-center text-xs" data-t="stat1_lbl">YILLIK DENEYİM</span>
              </div>
              <div class="glass-card aspect-square rounded-2xl flex flex-col items-center justify-center p-6 bg-surface-zinc">
                <span class="text-3xl font-extrabold text-white leading-none mb-2" data-t="stat2_val">500+</span>
                <span class="text-on-surface-variant font-label-bold text-center text-xs" data-t="stat2_lbl">AKTİF FİLO</span>
              </div>
            </div>
            <div class="space-y-4">
              <div class="glass-card aspect-square rounded-2xl flex flex-col items-center justify-center p-6">
                <span class="text-3xl font-extrabold text-white leading-none mb-2" data-t="stat3_val">%98</span>
                <span class="text-on-surface-variant font-label-bold text-center text-xs" data-t="stat3_lbl">MEMNUNİYET</span>
              </div>
              <div class="glass-card aspect-square rounded-2xl flex flex-col items-center justify-center p-6 border-t-4 border-t-primary-container">
                <span class="material-symbols-outlined text-primary text-6xl">public</span>
                <span class="text-on-surface-variant font-label-bold text-center mt-2 text-xs" data-t="stat4_lbl">GLOBAL</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `;

  const servicesHTML = getHead("Hizmetlerimiz") + getCommonLayout(servicesContent) + getTranslationScript() + "</html>";
  fs.writeFileSync(path.join(outputDir, 'services.html'), servicesHTML);
  console.log("Generated HTML/services.html successfully.");


  // ==================== 3. GENERATE LOGIN.HTML ====================
  const loginContent = `
    <div class="flex items-center justify-center py-20 px-4 min-h-[70vh]">
      <div class="max-w-md w-full glass rounded-3xl p-8 space-y-8">
        <div>
          <h2 class="text-center text-3xl font-extrabold text-white" data-t="login_title">
            Admin Girişi
          </h2>
          <p class="mt-2 text-center text-sm text-text-muted" data-t="login_subtitle">
            İçerikleri yönetmek için oturum açın
          </p>
        </div>
        <form class="mt-8 space-y-6" onsubmit="event.preventDefault(); window.location.href='dashboard.html';">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-text-muted mb-1" data-t="login_email_label">
                E-posta Adresi
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span class="material-symbols-outlined text-text-muted">mail</span>
                </div>
                <input
                  required
                  type="email"
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-outline-variant/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-surface/50 text-white sm:text-sm"
                  placeholder="admin@ornek.com"
                />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-text-muted mb-1" data-t="login_password_label">
                Şifre
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span class="material-symbols-outlined text-text-muted">lock</span>
                </div>
                <input
                  required
                  type="password"
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-outline-variant/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-surface/50 text-white sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>
          <div>
            <button
              type="submit"
              class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-primary-container hover:bg-accent-red-bright focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition shadow-lg"
              data-t="login_btn"
            >
              Giriş Yap
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  const loginHTML = getHead("Giriş Yap") + getCommonLayout(loginContent) + getTranslationScript() + "</html>";
  fs.writeFileSync(path.join(outputDir, 'login.html'), loginHTML);
  console.log("Generated HTML/login.html successfully.");


  // ==================== 4. GENERATE DASHBOARD.HTML ====================
  const totalVehicles = contents.length;
  const activePortfolioVal = contents
    .filter(item => item.status)
    .reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
  const activePortfolio = activePortfolioVal >= 1000000 
    ? `${(activePortfolioVal / 1000000).toFixed(1)}M` 
    : `${(activePortfolioVal / 1000).toFixed(0)}K`;

  const dashboardContent = `
    <main class="pt-24 pb-12">
      <div class="max-w-7xl mx-auto px-6">
        {/* Header Stats Panel */}
        <div class="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 class="text-4xl font-sora font-extrabold text-white tracking-tight" data-t="dash_title">Yönetim Paneli</h1>
            <p class="text-text-muted mt-2 max-w-md" data-t="dash_subtitle">Velocity Performance standartlarında araç ve içerik yönetimi.</p>
          </div>
          <div class="flex gap-3">
            <div class="glass-card px-4 py-3 rounded-2xl border-white/5 flex flex-col">
              <span class="text-[10px] text-text-muted uppercase font-bold tracking-widest">Toplam Araç</span>
              <span class="text-xl font-sora font-bold text-white">${totalVehicles}</span>
            </div>
            <div class="glass-card px-4 py-3 rounded-2xl border-white/5 flex flex-col border-l-primary/30">
              <span class="text-[10px] text-text-muted uppercase font-bold tracking-widest">Aktif Portföy</span>
              <span class="text-xl font-sora font-bold text-primary">€${activePortfolio}</span>
            </div>
          </div>
        </div>

        {/* Grid layout */}
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Add / Edit Form Column (lg:col-span-5) */}
          <div class="lg:col-span-5">
            <div class="glass-card rounded-3xl p-8 sticky top-24 border-primary/10">
              <div class="flex items-center gap-3 mb-8">
                <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span class="material-symbols-outlined text-primary">add_circle</span>
                </div>
                <h2 class="text-xl font-sora font-bold text-white" data-t="dash_form_add">Yeni İçerik Ekle</h2>
              </div>

              <form onsubmit="event.preventDefault(); alert('Statik modda ekleme işlemi simüle edildi.');" class="space-y-6">
                {/* Section: Vehicle Details */}
                <div class="space-y-4">
                  <p class="text-xs font-bold text-primary/80 uppercase tracking-widest pb-1 border-b border-white/5">Araç Detayları</p>
                  <div>
                    <label class="label-high-contrast" data-t="dash_label_title">Başlık</label>
                    <input 
                      class="w-full px-4 py-2.5 rounded-xl text-sm bg-zinc-900/50 border border-white/10 text-white focus:border-primary focus:ring-0 transition-all placeholder:text-text-muted" 
                      placeholder="Örn: BMW M8 Competition" 
                      required 
                      type="text"
                    />
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="label-high-contrast" data-t="dash_label_slug">Slug (URL)</label>
                      <input 
                        class="w-full px-4 py-2.5 rounded-xl text-sm bg-zinc-900/50 border border-white/10 text-white focus:border-primary focus:ring-0 transition-all placeholder:text-text-muted" 
                        placeholder="bmw-m8-competition" 
                        type="text"
                      />
                    </div>
                    <div>
                      <label class="label-high-contrast" data-t="dash_label_category">Kategori</label>
                      <input 
                        class="w-full px-4 py-2.5 rounded-xl text-sm bg-zinc-900/50 border border-white/10 text-white focus:border-primary focus:ring-0 transition-all placeholder:text-text-muted" 
                        placeholder="Örn: Spor Sedan, Süper SUV" 
                        type="text"
                      />
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="label-high-contrast" data-t="dash_label_year">Yıl</label>
                      <input 
                        class="w-full px-4 py-2.5 rounded-xl text-sm bg-zinc-900/50 border border-white/10 text-white focus:border-primary focus:ring-0 transition-all placeholder:text-text-muted" 
                        placeholder="2024" 
                        type="number"
                      />
                    </div>
                    <div>
                      <label class="label-high-contrast" data-t="dash_label_mileage">Kilometre (km)</label>
                      <input 
                        class="w-full px-4 py-2.5 rounded-xl text-sm bg-zinc-900/50 border border-white/10 text-white focus:border-primary focus:ring-0 transition-all placeholder:text-text-muted" 
                        placeholder="0" 
                        type="number"
                      />
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="label-high-contrast" data-t="dash_label_features">Araç Özellikleri</label>
                      <input 
                        class="w-full px-4 py-2.5 rounded-xl text-sm bg-zinc-900/50 border border-white/10 text-white focus:border-primary focus:ring-0 transition-all placeholder:text-text-muted" 
                        placeholder="Carbon, Burmester, Panorama" 
                        type="text"
                      />
                    </div>
                    <div>
                      <label class="label-high-contrast" data-t="dash_label_phone">İletişim Tel No</label>
                      <input 
                        class="w-full px-4 py-2.5 rounded-xl text-sm bg-zinc-900/50 border border-white/10 text-white focus:border-primary focus:ring-0 transition-all placeholder:text-text-muted" 
                        placeholder="015737641145" 
                        type="text"
                      />
                    </div>
                  </div>
                </div>

                {/* Section: Pricing */}
                <div class="space-y-4">
                  <p class="text-xs font-bold text-primary/80 uppercase tracking-widest pb-1 border-b border-white/5">Finansal Veriler</p>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="label-high-contrast" data-t="dash_label_price">Liste Fiyatı (€)</label>
                      <input 
                        class="w-full px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-zinc-900/50 border border-white/10 focus:border-primary focus:ring-0 transition-all" 
                        placeholder="0.00" 
                        step="0.01" 
                        type="number"
                      />
                    </div>
                    <div>
                      <label class="label-high-contrast" data-t="dash_label_down">Minimum Peşinat (€)</label>
                      <input 
                        class="w-full px-4 py-2.5 rounded-xl text-sm bg-zinc-900/50 border border-white/10 text-white focus:border-primary focus:ring-0 transition-all" 
                        placeholder="0.00" 
                        step="0.01" 
                        type="number"
                      />
                    </div>
                  </div>
                  <div class="grid grid-cols-3 gap-4">
                    <div>
                      <label class="label-high-contrast" data-t="dash_label_rate">Aylık Taksit</label>
                      <input 
                        class="w-full px-4 py-2.5 rounded-xl text-sm bg-zinc-900/50 border border-white/10 text-white focus:border-primary focus:ring-0 transition-all" 
                        placeholder="299" 
                        type="number"
                      />
                    </div>
                    <div>
                      <label class="label-high-contrast" data-t="dash_label_term">Vade (Ay)</label>
                      <input 
                        class="w-full px-4 py-2.5 rounded-xl text-sm bg-zinc-900/50 border border-white/10 text-white focus:border-primary focus:ring-0 transition-all" 
                        placeholder="48" 
                        type="number"
                      />
                    </div>
                    <div>
                      <label class="label-high-contrast" data-t="dash_label_interest">Faiz (%)</label>
                      <input 
                        class="w-full px-4 py-2.5 rounded-xl text-sm bg-zinc-900/50 border border-white/10 text-white focus:border-primary focus:ring-0 transition-all" 
                        placeholder="2.99" 
                        step="0.01" 
                        type="number"
                      />
                    </div>
                  </div>
                </div>

                {/* Section: Media & Description */}
                <div class="space-y-4">
                  <p class="text-xs font-bold text-primary/80 uppercase tracking-widest pb-1 border-b border-white/5">Medya & Açıklama</p>
                  <div>
                    <label class="label-high-contrast" data-t="dash_label_image">Ana Görsel URL</label>
                    <div class="relative">
                      <input 
                        class="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-zinc-900/50 border border-white/10 text-white focus:border-primary focus:ring-0 transition-all placeholder:text-text-muted" 
                        placeholder="https://images.unsplash.com/..." 
                        type="text"
                      />
                      <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">link</span>
                    </div>
                  </div>

                  <div>
                    <label class="label-high-contrast" data-t="dash_label_gallery">Galeri Resimleri</label>
                    <textarea
                      rows="3"
                      class="w-full px-4 py-2.5 rounded-xl text-sm bg-zinc-900/50 border border-white/10 text-white focus:border-primary focus:ring-0 transition-all placeholder:text-text-muted resize-none font-mono text-xs"
                      placeholder="https://...&#10;https://..."
                    ></textarea>
                  </div>

                  <div>
                    <label class="label-high-contrast" data-t="dash_label_summary">Kısa Özet</label>
                    <textarea 
                      class="w-full px-4 py-2.5 rounded-xl text-sm bg-zinc-900/50 border border-white/10 text-white focus:border-primary focus:ring-0 transition-all placeholder:text-text-muted resize-none" 
                      placeholder="Vitrin kartı için kısa metin..." 
                      rows="2"
                    />
                  </div>

                  <div>
                    <label class="label-high-contrast" data-t="dash_label_body">Açıklama</label>
                    <textarea 
                      class="w-full px-4 py-2.5 rounded-xl text-sm bg-zinc-900/50 border border-white/10 text-white focus:border-primary focus:ring-0 transition-all placeholder:text-text-muted resize-none" 
                      placeholder="Detaylı araç açıklaması..." 
                      rows="4"
                      required
                    />
                  </div>
                </div>

                <button class="w-full bg-primary text-white py-4 px-6 rounded-2xl font-bold transition-all flex justify-center items-center gap-2 shadow-xl shadow-primary/20" type="submit">
                  <span class="material-symbols-outlined">save</span>
                  <span data-t="dash_btn_save">KAYDET VE YAYINLA</span>
                </button>
              </form>
            </div>
          </div>

          {/* List Section Column (lg:col-span-7) */}
          <div class="lg:col-span-7">
            <div class="glass-card rounded-3xl overflow-hidden">
              <div class="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                <h2 class="text-xl font-sora font-bold text-white" data-t="dash_list_title">Mevcut Envanter</h2>
                <div class="flex items-center gap-2">
                  <span class="text-[10px] text-text-muted font-bold">FİLTRELE:</span>
                  <select class="bg-zinc-900/80 border-none text-[10px] rounded-lg px-2.5 py-1 font-bold text-on-surface outline-none cursor-pointer focus:ring-0">
                    <option>En Yeni</option>
                    <option>Fiyat: Azalan</option>
                  </select>
                </div>
              </div>
              
              <div class="divide-y divide-white/5">
                ${contents.map((item) => `
                  <div class="p-6 flex flex-col md:flex-row gap-6 hover:bg-white/[0.03] transition-colors group ${!item.status ? 'opacity-70' : ''}">
                    {/* Image Block */}
                    <div class="w-full md:w-48 h-32 rounded-2xl overflow-hidden relative flex-shrink-0 shadow-lg ${!item.status ? 'grayscale' : ''}">
                      ${item.image_url ? `
                        <img 
                          alt="${item.title}" 
                          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          src="${item.image_url}" 
                        />
                      ` : `
                        <div class="w-full h-full bg-zinc-950 flex items-center justify-center text-[10px] font-bold text-text-muted uppercase">Resim Yok</div>
                      `}
                      ${item.category ? `
                        <div class="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded text-[10px] font-bold text-white border border-white/10 uppercase tracking-widest">
                          ${item.category}
                        </div>
                      ` : ''}
                    </div>

                    {/* Content Details Block */}
                    <div class="flex-grow flex flex-col justify-between">
                      <div>
                        <div class="flex justify-between items-start gap-4">
                          <h3 class="font-sora font-bold text-white text-lg leading-tight group-hover:text-primary transition-colors">${item.title}</h3>
                          ${item.status ? `
                            <span class="px-2 py-1 text-[10px] font-black rounded bg-green-500/10 border border-green-500/30 text-green-400 uppercase tracking-tighter">AKTİF</span>
                          ` : `
                            <span class="px-2 py-1 text-[10px] font-black rounded bg-white/10 border border-white/20 text-white/50 uppercase tracking-tighter">PASİF</span>
                          `}
                        </div>
                        <div class="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-text-muted font-medium">
                          ${item.year ? `
                            <span class="flex items-center gap-1">
                              <span class="material-symbols-outlined text-[14px]">calendar_today</span> 
                              ${item.year}
                            </span>
                          ` : ''}
                          ${item.mileage !== null && item.mileage !== undefined ? `
                            <span class="flex items-center gap-1">
                              <span class="material-symbols-outlined text-[14px]">speed</span> 
                              ${parseFloat(item.mileage).toLocaleString('de-DE')} km
                            </span>
                          ` : ''}
                          ${item.price ? `
                            <span class="flex items-center gap-1 font-bold text-white">
                              €${parseFloat(item.price).toLocaleString('de-DE')}
                            </span>
                          ` : ''}
                        </div>
                      </div>

                      {/* Bottom row actions & finance */}
                      <div class="mt-4 flex items-center justify-between">
                        <div class="flex items-center gap-3">
                          ${item.status ? `
                            ${item.monthly_rate ? `
                              <div class="bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10">
                                <span class="text-[10px] text-primary font-bold">€${parseFloat(item.monthly_rate).toLocaleString('de-DE')} / Ay</span>
                              </div>
                            ` : ''}
                          ` : `
                            <span class="text-[10px] text-text-muted italic">Satıldı / Stokta Yok</span>
                          `}
                        </div>
                        <div class="flex gap-2">
                          <button onclick="alert('Düzenleme modu simüle edildi.')" class="p-2.5 glass rounded-xl text-primary hover:bg-primary hover:text-white transition-all border border-white/5">
                            <span class="material-symbols-outlined text-sm leading-none block">edit</span>
                          </button>
                          <button onclick="alert('Silme işlemi simüle edildi.')" class="p-2.5 glass rounded-xl text-text-muted hover:text-error hover:bg-error/10 transition-all border border-white/5">
                            <span class="material-symbols-outlined text-sm leading-none block">delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                `).join('')}

                ${contents.length === 0 ? `
                  <div class="p-12 text-center text-text-muted italic text-sm">
                    Henüz veri bulunmuyor. Sol taraftan ekleme yapabilirsiniz.
                  </div>
                ` : ''}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  `;

  const dashboardHTML = getHead("Yönetim Paneli") + getCommonLayout(dashboardContent) + getTranslationScript() + "</html>";
  fs.writeFileSync(path.join(outputDir, 'dashboard.html'), dashboardHTML);
  console.log("Generated HTML/dashboard.html successfully.");


  // ==================== 6. GENERATE VEHICLE DETAILS PAGES ====================
  for (const car of contents) {
    const imageUrl = car.image_url || (car.images && car.images.length > 0 ? car.images[0] : 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?q=80&w=1200');
    const galleryImages = (car.images && Array.isArray(car.images) && car.images.length > 0) ? car.images : [imageUrl];

    const carContent = `
      <main class="bg-background-deep text-on-surface font-body-md selection:bg-primary-container pb-20">
        <!-- Hero Gallery Section -->
        <section class="relative w-full h-[60vh] bg-background-deep overflow-hidden group flex items-center justify-center">
          <img 
            id="blur-bg"
            src="${imageUrl}" 
            alt=""
            class="absolute inset-0 w-full h-full object-cover opacity-20 blur-2xl scale-110 pointer-events-none z-0"
          />
          <img 
            id="main-car-img"
            src="${imageUrl}" 
            alt="${car.title}"
            class="relative max-w-full max-h-full object-contain z-10 transition-transform duration-500"
          />
          <div class="absolute inset-0 hero-gradient z-20 pointer-events-none"></div>
          <div class="absolute bottom-12 left-6 z-30">
            <p class="text-primary font-label-bold mb-2 tracking-widest" data-t="showroom_subtitle">PREMIUM FİLO SEÇİMİ</p>
            <h1 class="text-3xl md:text-5xl font-bold text-white mb-4 drop-shadow-md">${car.title}</h1>
            <div class="flex flex-wrap gap-4">
              ${car.category ? `
                <div class="glass-card px-4 py-2 rounded-lg flex items-center gap-2">
                  <span class="material-symbols-outlined text-primary text-sm">category</span>
                  <span class="text-label-bold text-white text-xs">${car.category}</span>
                </div>
              ` : ''}
              ${car.features && car.features[0] ? `
                <div class="glass-card px-4 py-2 rounded-lg flex items-center gap-2">
                  <span class="material-symbols-outlined text-primary text-sm">stars</span>
                  <span class="text-label-bold text-white text-xs">${car.features[0]}</span>
                </div>
              ` : ''}
            </div>
          </div>
          
          <!-- Thumbnail Navigation -->
          <div class="absolute right-6 bottom-12 flex flex-col gap-2 z-30">
            ${galleryImages.slice(0, 4).map((img, idx) => `
              <div 
                onclick="changeActiveImage('${img}', ${idx})"
                class="thumb-item w-20 h-12 rounded border-2 overflow-hidden cursor-pointer transition-all ${idx === 0 ? 'border-primary opacity-100' : 'border-white/20 opacity-60 hover:opacity-100'}"
              >
                <img src="${img}" alt="Gallery ${idx + 1}" class="w-full h-full object-cover" />
              </div>
            `).join('')}
          </div>
        </section>

        <!-- Content Grid -->
        <div class="max-w-container-max mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-6 mt-12">
          
          <!-- Left: Technical Specs -->
          <div class="lg:col-span-7 space-y-6">
            <a href="index.html" class="inline-flex items-center text-text-muted hover:text-primary transition font-medium mb-4">
              <span class="material-symbols-outlined mr-2">arrow_back</span>
              <span data-t="detail_back">Vitrine Dön</span>
            </a>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div class="glass-card p-6 rounded-xl flex flex-col justify-center items-center text-center">
                <span class="material-symbols-outlined text-primary text-4xl mb-2">calendar_today</span>
                <p class="text-text-muted text-xs" data-t="detail_first_reg">İlk Tescil</p>
                <p class="text-xl font-bold text-white mt-1">${car.year || '-'}</p>
              </div>
              <div class="glass-card p-6 rounded-xl flex flex-col justify-center items-center text-center">
                <span class="material-symbols-outlined text-primary text-4xl mb-2">distance</span>
                <p class="text-text-muted text-xs" data-t="detail_mileage">Kilometre</p>
                <p class="text-xl font-bold text-white mt-1">${car.mileage ? `${car.mileage.toLocaleString('de-DE')} km` : '-'}</p>
              </div>
              <div class="glass-card p-6 rounded-xl flex flex-col justify-center items-center text-center">
                <span class="material-symbols-outlined text-primary text-4xl mb-2">settings_input_component</span>
                <p class="text-text-muted text-xs" data-t="detail_gear">Şanzıman</p>
                <p class="text-xl font-bold text-white mt-1" data-t="detail_automatic">Otomatik</p>
              </div>
            </div>
            
            <div class="glass-card p-8 rounded-xl">
              <h2 class="text-xl font-bold text-white mb-6 border-l-4 border-primary pl-4" data-t="detail_description">Araç Açıklaması</h2>
              <p class="text-base text-text-muted leading-relaxed whitespace-pre-wrap">${car.body || car.summary || '-'}</p>
              
              ${car.features && Array.isArray(car.features) && car.features.length > 0 ? `
                <ul class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 border-t border-outline-variant/15 pt-6">
                  ${car.features.map(feature => `
                    <li class="flex items-center gap-2 text-text-muted">
                      <span class="material-symbols-outlined text-primary text-sm">check_circle</span> ${feature}
                    </li>
                  `).join('')}
                </ul>
              ` : ''}
            </div>

            <!-- Bildergalerie -->
            ${galleryImages.length > 1 ? `
              <div class="glass-card p-8 rounded-xl">
                <h2 class="text-xl font-bold text-white mb-6 border-l-4 border-primary pl-4" data-t="detail_gallery_tr">Resim Galerisi</h2>
                <div class="grid grid-cols-2 gap-4">
                  ${galleryImages.map((img, idx) => `
                    <div 
                      onclick="changeActiveImage('${img}', ${idx})"
                      class="group overflow-hidden rounded-lg cursor-pointer border border-outline-variant/10"
                    >
                      <img src="${img}" class="w-full h-32 object-cover transition duration-300 group-hover:scale-105" alt="Gallery View ${idx + 1}" />
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}
          </div>
          
          <!-- Right: Finanzierungsdetails -->
          <div class="lg:col-span-5">
            <div class="glass-card p-8 rounded-xl sticky top-28 space-y-6">
              <h3 class="text-xl font-bold text-white border-b border-outline-variant/20 pb-4" data-t="detail_fin_details">Finansman Detayları</h3>
              <div class="space-y-4">
                <div class="flex justify-between items-end border-b border-outline-variant/20 pb-4">
                  <span class="text-text-muted text-sm font-semibold" data-t="detail_price">Araç Fiyatı</span>
                  <span class="text-2xl font-bold text-white">€${(car.price || 0).toLocaleString('de-DE')}</span>
                </div>
                
                <!-- Calculator sliders for premium dynamic feel! -->
                <div class="space-y-4 pt-2">
                  <div>
                    <div class="flex justify-between text-xs text-text-muted mb-1">
                      <span data-t="detail_down_payment">Peşinat</span>
                      <span id="slider-down-val">€${(car.down_payment || 0).toLocaleString('de-DE')}</span>
                    </div>
                    <input 
                      type="range" 
                      id="down-payment-slider" 
                      min="0" 
                      max="${car.price || 200000}" 
                      step="5000"
                      value="${car.down_payment || 20000}"
                      class="w-full accent-primary-container"
                      oninput="recalculateFinance(${car.price}, ${car.interest_rate})"
                    />
                  </div>

                  <div>
                    <div class="flex justify-between text-xs text-text-muted mb-1">
                      <span data-t="detail_term">Vade</span>
                      <span id="slider-term-val">${car.term_months || 48} Ay</span>
                    </div>
                    <input 
                      type="range" 
                      id="term-slider" 
                      min="12" 
                      max="84" 
                      step="12"
                      value="${car.term_months || 48}"
                      class="w-full accent-primary-container"
                      oninput="recalculateFinance(${car.price}, ${car.interest_rate})"
                    />
                  </div>
                </div>

                <div class="bg-primary-container/10 p-6 rounded-xl border border-primary/20 mt-6">
                  <p class="text-primary font-label-bold text-xs uppercase" data-t="detail_monthly_rate">AYLIK TAKSİT</p>
                  <div class="flex items-baseline mt-1">
                    <span id="monthly-rate-display" class="text-5xl font-extrabold text-white">€${(car.monthly_rate || 0).toLocaleString('de-DE')}</span>
                    <span class="text-sm text-white/70 ml-1">/Ay</span>
                  </div>
                  <p class="text-text-muted text-xs mt-2"><span data-t="detail_interest_rate">Faiz Oranı</span>: %${car.interest_rate}</p>
                </div>

                <button 
                  onclick="openModal()"
                  class="w-full bg-primary-container hover:bg-accent-red-bright text-white py-4 rounded-xl font-bold transition shadow-lg mt-6"
                  data-t="detail_request_btn"
                >
                  Kişisel Teklif Alın
                </button>
                <p class="text-center text-xs text-text-muted" data-t="detail_included_services">GAP Koruması & Ücretsiz Teslimat Dahil</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Request Offer Modal -->
        <div id="offer-modal" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden">
          <div class="glass-card max-w-md w-full p-8 rounded-2xl border-primary border shadow-2xl relative">
            <button onclick="closeModal()" class="absolute top-4 right-4 text-text-muted hover:text-white transition material-symbols-outlined">
              close
            </button>
            <h2 class="text-2xl font-bold text-white mb-2" data-t="form_title">Kişisel Teklifinizi Oluşturun</h2>
            <p class="text-text-muted text-xs mb-6" data-t="form_desc">Bilgilerinizi bırakın, size özel PDF teklifinizi hemen iletelim.</p>
            
            <form onsubmit="event.preventDefault(); handleSubmitOffer();" class="space-y-4">
              <div>
                <label class="block text-xs font-semibold text-text-muted mb-1" data-t="form_name">Adınız Soyadınız</label>
                <input required type="text" class="w-full bg-surface-zinc/50 border border-outline-variant/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary text-sm" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-text-muted mb-1" data-t="form_email">E-posta Adresi</label>
                <input required type="email" class="w-full bg-surface-zinc/50 border border-outline-variant/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary text-sm" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-text-muted mb-1" data-t="form_phone">Telefon Numarası</label>
                <input required type="tel" class="w-full bg-surface-zinc/50 border border-outline-variant/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary text-sm" />
              </div>
              
              <div class="pt-4 flex gap-3">
                <button type="button" onclick="closeModal()" class="flex-1 px-4 py-3 rounded-lg border border-outline-variant/30 text-white hover:bg-surface-variant font-label-bold text-sm" data-t="form_cancel">
                  İptal
                </button>
                <button type="submit" class="flex-1 bg-primary-container text-white px-4 py-3 rounded-lg hover:bg-accent-red-bright transition font-label-bold text-sm" data-t="form_submit">
                  Teklifi İste
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <script>
        function changeActiveImage(url, idx) {
          document.getElementById('main-car-img').src = url;
          document.getElementById('blur-bg').src = url;
          
          document.querySelectorAll('.thumb-item').forEach((item, index) => {
            if (index === idx) {
              item.classList.add('border-primary', 'opacity-100');
              item.classList.remove('border-white/20', 'opacity-60');
            } else {
              item.classList.remove('border-primary', 'opacity-100');
              item.classList.add('border-white/20', 'opacity-60');
            }
          });
        }

        function openModal() {
          document.getElementById('offer-modal').classList.remove('hidden');
        }

        function closeModal() {
          document.getElementById('offer-modal').classList.add('hidden');
        }

        function handleSubmitOffer() {
          const lang = localStorage.getItem('lang') || 'tr';
          alert(translations[lang]['detail_success_alert'] || 'Talebiniz başarıyla iletildi!');
          closeModal();
        }

        // Live calculation logic in slider!
        function recalculateFinance(price, interestRate) {
          const downVal = parseFloat(document.getElementById('down-payment-slider').value);
          const termVal = parseInt(document.getElementById('term-slider').value);
          
          document.getElementById('slider-down-val').textContent = '€' + downVal.toLocaleString('de-DE');
          document.getElementById('slider-term-val').textContent = termVal + ' Ay';
          
          const principal = price - downVal;
          if (principal <= 0) {
            document.getElementById('monthly-rate-display').textContent = '€0';
            return;
          }
          
          // Simple monthly payment formula with interest rate
          const monthlyInt = (interestRate / 100) / 12;
          let payment = 0;
          if (monthlyInt > 0) {
            payment = (principal * monthlyInt * Math.pow(1 + monthlyInt, termVal)) / (Math.pow(1 + monthlyInt, termVal) - 1);
          } else {
            payment = principal / termVal;
          }
          
          document.getElementById('monthly-rate-display').textContent = '€' + Math.round(payment).toLocaleString('de-DE');
        }
      </script>
    `;

    const carHTML = getHead(car.title) + getCommonLayout(carContent) + getTranslationScript() + "</html>";
    fs.writeFileSync(path.join(outputDir, `${car.slug}.html`), carHTML);
    console.log(`Generated HTML/${car.slug}.html successfully.`);
  }

  console.log("All pages have been compiled successfully to passive HTML in /HTML!");
}

run();
