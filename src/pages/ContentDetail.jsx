import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

export default function ContentDetail() {
  const { slug } = useParams();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const { language, t } = useLanguage();

  const formatNumber = (num) => {
    if (num === null || num === undefined) return '';
    const parsed = parseFloat(num);
    if (isNaN(parsed)) return num;
    const localeMap = { tr: 'tr-TR', en: 'en-US', de: 'de-DE' };
    return parsed.toLocaleString(localeMap[language] || 'tr-TR');
  };

  const [downPayment, setDownPayment] = useState(0);
  const [termMonths, setTermMonths] = useState(48);
  const [monthlyRate, setMonthlyRate] = useState(0);

  useEffect(() => {
    if (content) {
      setDownPayment(content.down_payment || 0);
      setTermMonths(content.term_months || 48);
      setMonthlyRate(content.monthly_rate || 0);
    }
  }, [content]);

  const calculateMonthlyRate = (downVal, termVal) => {
    if (!content) return 0;
    const price = parseFloat(content.price || 0);
    const interestRate = parseFloat(content.interest_rate || 3.8);
    const principal = price - downVal;
    if (principal <= 0) return 0;

    const monthlyInt = (interestRate / 100) / 12;
    let payment = 0;
    if (monthlyInt > 0) {
      payment = (principal * monthlyInt * Math.pow(1 + monthlyInt, termVal)) / (Math.pow(1 + monthlyInt, termVal) - 1);
    } else {
      payment = principal / termVal;
    }
    return Math.round(payment);
  };

  const handleDownPaymentChange = (val) => {
    setDownPayment(val);
    setMonthlyRate(calculateMonthlyRate(val, termMonths));
  };

  const handleTermChange = (val) => {
    setTermMonths(val);
    setMonthlyRate(calculateMonthlyRate(downPayment, val));
  };

  useEffect(() => {
    setActiveImageIdx(0);
    fetchContent();
  }, [slug]);

  const fetchContent = async () => {
    if (!slug) {
      setError(t('detail_invalid_link'));
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      // Slug ile arama yap (eğer slug yoksa, fallback olarak id de gelmiş olabilir)
      let query = supabase.from('contents').select('*');

      // Eğer slug bir UUID ise veya sadece rakamlardan oluşuyorsa (integer ID) id olarak kullanıldıysa fallback için
      if (typeof slug === 'string' && (slug.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) || /^\d+$/.test(slug))) {
        query = query.eq('id', slug);
      } else {
        query = query.eq('slug', slug);
      }

      const { data, error: fetchError } = await query.single();

      if (fetchError) throw fetchError;
      setContent(data);
    } catch (err) {
      console.error(err);
      setError(t('detail_not_found'));
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        customer: formData,
        car: {
          ...content,
          down_payment: downPayment,
          term_months: termMonths,
          monthly_rate: monthlyRate
        }
      };

      // Webhook isteği
      // Ortam değişkeninden (env) URL al, yoksa varsayılanı kullan
      const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/generate-offer';
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Webhook Error:", response.status, errorText);
        throw new Error(`Webhook failed: ${response.status}`);
      }

      alert(t('detail_success_alert'));
      setIsModalOpen(false);
      setFormData({ name: '', email: '', phone: '' });
    } catch (e) {
      console.error("Form Submit Error:", e);
      alert(t('detail_error_alert') + " Lütfen konsolu (F12) kontrol edin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="text-text-muted font-medium">{t('detail_loading')}</p>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-on-surface mb-4">{error || t('detail_not_found')}</h2>
        <Link to="/" className="text-primary hover:underline flex items-center justify-center">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('detail_back')}
        </Link>
      </div>
    );
  }

  const imageUrl = content.image_url || (content.images && content.images.length > 0 ? content.images[0] : 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?q=80&w=1200&auto=format&fit=crop');
  const galleryImages = (content.images && Array.isArray(content.images) && content.images.length > 0) ? content.images : [imageUrl].filter(Boolean);
  const mainImage = galleryImages[activeImageIdx] || imageUrl;

  return (
    <main className="pt-20 pb-24 md:pb-0 bg-background-deep text-on-surface font-body-md selection:bg-primary-container">
      {/* Hero Gallery Section */}
      <section className="relative w-full h-[40vh] sm:h-[716px] bg-background-deep overflow-hidden group flex items-center justify-center">
        {/* Arkada bulanık arka plan görseli (boşlukları doldurmak için) */}
        <img
          src={mainImage}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-20 blur-2xl scale-110 pointer-events-none z-0"
        />
        {/* Önde orijinal oranlarında sıkıştırılmamış net görsel */}
        <img
          src={mainImage}
          alt={content.title}
          className="relative max-w-full max-h-full object-contain z-10 transition-transform duration-500"
        />
        <div className="absolute inset-0 hero-gradient z-20 pointer-events-none"></div>
        <div className="absolute bottom-6 sm:bottom-12 left-4 sm:left-gutter z-30">
          <p className="text-primary font-label-bold mb-2 tracking-widest">{t('showroom_subtitle').toUpperCase()}</p>
          <h1 className="font-headline-lg text-2xl sm:text-headline-lg text-white mb-4 drop-shadow-md">{content.title}</h1>
          <div className="flex flex-wrap gap-4">
            {content.category && (
              <div className="glass-card px-4 py-2 rounded-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">category</span>
                <span className="text-label-bold text-white">{content.category}</span>
              </div>
            )}
            {content.features && content.features[0] && (
              <div className="glass-card px-4 py-2 rounded-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">stars</span>
                <span className="text-label-bold text-white">{content.features[0]}</span>
              </div>
            )}
          </div>
        </div>

        {/* Thumbnail Navigation */}
        <div className="absolute right-4 sm:right-gutter bottom-6 sm:bottom-12 flex flex-row sm:flex-col gap-2 z-30">
          {galleryImages.slice(0, 4).map((img, idx) => (
            <div
              key={idx}
              onClick={() => setActiveImageIdx(idx)}
              className={`w-14 h-10 sm:w-20 sm:h-12 rounded border-2 overflow-hidden cursor-pointer transition-all ${idx === activeImageIdx ? 'border-primary opacity-100' : 'border-white/20 opacity-60 hover:opacity-100'}`}
            >
              <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </section>

      {/* Content Grid */}
      <div className="max-w-container-max mx-auto px-4 sm:px-gutter grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-gutter py-12 sm:py-section-gap">

        {/* Left: Technical Specs (Bento Style) */}
        <div className="lg:col-span-7 space-y-gutter">
          <Link to="/" className="inline-flex items-center text-text-muted hover:text-primary transition font-medium mb-4">
            <span className="material-symbols-outlined mr-2">arrow_back</span>
            {t('detail_back')}
          </Link>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="glass-card p-6 rounded-xl flex flex-col justify-center items-center text-center">
              <span className="material-symbols-outlined text-primary text-4xl mb-2">calendar_today</span>
              <p className="text-text-muted text-label-sm">{t('detail_first_reg')}</p>
              <p className="text-headline-md font-headline-md">{content.year || '-'}</p>
            </div>
            <div className="glass-card p-6 rounded-xl flex flex-col justify-center items-center text-center">
              <span className="material-symbols-outlined text-primary text-4xl mb-2">distance</span>
              <p className="text-text-muted text-label-sm">{t('detail_mileage')}</p>
              <p className="text-headline-md font-headline-md">{content.mileage ? `${formatNumber(content.mileage)} km` : '-'}</p>
            </div>
            <div className="glass-card p-6 rounded-xl flex flex-col justify-center items-center text-center">
              <span className="material-symbols-outlined text-primary text-4xl mb-2">settings_input_component</span>
              <p className="text-text-muted text-label-sm">{t('detail_gear')}</p>
              <p className="text-headline-md font-headline-md">{t('detail_automatic')}</p>
            </div>
          </div>

          <div className="glass-card p-8 rounded-xl">
            <h2 className="font-headline-md text-headline-md mb-6 border-l-4 border-primary pl-4">{t('detail_description')}</h2>
            <p className="text-body-lg text-on-surface-variant leading-relaxed whitespace-pre-wrap">
              {content.body || content.summary || t('detail_no_desc')}
            </p>

            {content.features && Array.isArray(content.features) && content.features.length > 0 && (
              <ul className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                {content.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-primary text-sm">check_circle</span> {feature}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Bildergalerie */}
          {galleryImages.length > 1 && (
            <div className="glass-card p-8 rounded-xl mt-6">
              <h2 className="font-headline-md text-headline-md mb-6 border-l-4 border-primary pl-4">{t('detail_gallery_tr')}</h2>

              {/* Main Preview Box */}
              <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-6 glass-card border-outline-variant/30 flex items-center justify-center bg-background-deep">
                {/* Arkada bulanık arka plan görseli */}
                <img
                  src={galleryImages[activeImageIdx]}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover opacity-20 blur-2xl scale-110 pointer-events-none z-0"
                />
                {/* Önde orijinal oranında net görsel */}
                <img
                  src={galleryImages[activeImageIdx]}
                  className="relative max-w-full max-h-full object-contain z-10 transition-all duration-500"
                  alt={`${content.title || 'Araç'} ${t('detail_preview')}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background-deep/40 to-transparent pointer-events-none z-20"></div>
              </div>

              {/* Gallery Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {galleryImages.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`group overflow-hidden rounded-lg cursor-pointer border-2 transition-all ${activeImageIdx === idx ? 'border-primary' : 'border-transparent'}`}
                  >
                    <img
                      src={img}
                      className={`w-full h-24 object-cover transition-all duration-300 group-hover:scale-110 group-hover:brightness-110 ${(idx > 2 && activeImageIdx !== idx) ? 'opacity-70' : ''}`}
                      alt={`Gallery view ${idx + 1}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {content.tags && Array.isArray(content.tags) && content.tags.length > 0 && (
            <div className="glass-card p-6 rounded-xl flex flex-wrap gap-2 mt-6">
              <span className="material-symbols-outlined text-text-muted mr-2">tag</span>
              {content.tags.map((tag, idx) => (
                <span key={idx} className="bg-surface-variant text-on-surface-variant text-sm px-3 py-1 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right: Finanzierungsdetails */}
        <div className="lg:col-span-5">
          <div className="glass-card p-8 rounded-xl sticky top-28">
            <h3 className="font-headline-md text-headline-md mb-8">{t('detail_fin_details')}</h3>
            <div className="space-y-6">
              <div className="flex justify-between items-end border-b border-outline-variant/20 pb-4">
                <span className="text-on-surface-variant font-label-bold">{t('detail_price')}</span>
                <span className="font-headline-md text-headline-md text-white">{content.price ? `${formatNumber(content.price)} €` : '-'}</span>
              </div>
              {/* Calculator sliders for premium dynamic feel! */}
              <div className="space-y-4 pt-2">
                <div>
                  <div className="flex justify-between text-label-sm text-text-muted mb-2">
                    <span className="font-label-bold">{t('detail_down_payment')}</span>
                    <span className="text-white font-bold">{formatNumber(downPayment)} €</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={parseFloat(content.price) || 200000}
                    step={1000}
                    value={downPayment}
                    onChange={(e) => handleDownPaymentChange(parseFloat(e.target.value))}
                    className="w-full accent-primary-container h-1 bg-surface-variant rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-label-sm text-text-muted mb-2">
                    <span className="font-label-bold">{t('detail_term')}</span>
                    <span className="text-white font-bold">{termMonths} {t('card_months')}</span>
                  </div>
                  <input
                    type="range"
                    min={12}
                    max={84}
                    step={12}
                    value={termMonths}
                    onChange={(e) => handleTermChange(parseInt(e.target.value))}
                    className="w-full accent-primary-container h-1 bg-surface-variant rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Recalculated Monthly Rate Box */}
              <div className="bg-primary-container/10 p-6 rounded-xl border border-primary/20">
                <p className="text-primary font-label-bold mb-1 uppercase tracking-tighter">{t('detail_monthly_rate')}</p>
                <div className="flex items-baseline gap-1">
                  <span className="font-display-hero text-3xl sm:text-4xl md:text-6xl text-white">{formatNumber(monthlyRate)}</span>
                  <span className="text-headline-md text-white/70">€/{t('card_months')}</span>
                </div>
                <div className="flex flex-col sm:flex-row justify-between text-text-muted text-label-sm mt-3 pt-3 border-t border-outline-variant/10 gap-1">
                  <span>{t('detail_interest_rate')}: %{content.interest_rate || '3.8'}</span>
                  <span>{t('detail_term')}: {termMonths} {t('card_months')}</span>
                </div>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full bg-primary-container hover:bg-accent-red-bright text-on-primary-container py-5 rounded-lg font-headline-md transition-all duration-300 shadow-lg shadow-primary-container/20 active:scale-[0.98] text-center"
                >
                  {t('detail_request_btn')}
                </button>
                <p className="text-center text-label-sm text-text-muted">{t('detail_included_services')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Mobile Action (Mobile Only) */}
      <div className="md:hidden fixed bottom-0 left-0 w-full p-4 glass-card z-40 border-t border-outline-variant/30">
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full bg-primary-container text-on-primary-container py-4 rounded-lg font-label-bold"
        >
          {`${t('detail_request_btn')} (${content.monthly_rate ? formatNumber(content.monthly_rate) : '0'}€/${t('card_months')})`}
        </button>
      </div>

      {/* Offer Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-8 rounded-2xl border-primary-container/30 border shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-text-muted hover:text-white transition-colors material-symbols-outlined"
            >
              close
            </button>
            <h2 className="text-2xl font-headline-md text-white mb-2">{t('form_title')}</h2>
            <p className="text-text-muted text-sm mb-6">{t('form_desc')}</p>

            <form onSubmit={handleRequest} className="space-y-4">
              <div>
                <label className="block text-label-sm font-label-bold text-text-muted mb-1">{t('form_name')}</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-surface-zinc/50 border border-outline-variant/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-container transition-colors"
                />
              </div>
              <div>
                <label className="block text-label-sm font-label-bold text-text-muted mb-1">{t('form_email')}</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-surface-zinc/50 border border-outline-variant/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-container transition-colors"
                />
              </div>
              <div>
                <label className="block text-label-sm font-label-bold text-text-muted mb-1">{t('form_phone')}</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-surface-zinc/50 border border-outline-variant/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-container transition-colors"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-lg border border-outline-variant/30 text-on-surface hover:bg-surface-variant transition-colors font-label-bold"
                >
                  {t('form_cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-primary-container text-white px-4 py-3 rounded-lg hover:bg-accent-red-bright transition-colors font-label-bold disabled:opacity-50"
                >
                  {isSubmitting ? t('detail_sending') : t('form_submit')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
