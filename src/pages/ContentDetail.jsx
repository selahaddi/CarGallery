import { useEffect, useState, useRef, useCallback } from 'react';
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
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });
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
      let query = supabase.from('contents').select('*');

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

      // Teklifi Supabase'e kaydet (Satıcı bildirimleri için)
      const { error: insertError } = await supabase.from('offers').insert([{
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        car_id: content.id,
        car_title: content.title,
        price: content.price,
        down_payment: downPayment,
        term_months: termMonths,
        monthly_rate: monthlyRate
      }]);

      if (insertError) {
        console.error("Supabase Insert Error:", insertError);
        // İsteğe bağlı olarak hata yönetimi eklenebilir, şimdilik webhook'a devam etmesine izin veriyoruz
      }

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
      <div className="flex flex-col items-center justify-center min-h-[60vh] pt-20">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="text-secondary font-medium">{t('detail_loading')}</p>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-32 text-center">
        <h2 className="text-2xl font-bold text-primary mb-4">{error || t('detail_not_found')}</h2>
        <Link to="/" className="text-accent-indigo hover:underline flex items-center justify-center font-label-caps">
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
    <>
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="pt-nav-height min-h-screen pb-24 md:pb-0">
        <div className="rail-system min-h-screen">
          <div className="rail-vertical"></div>
          
          {/* Hero Gallery Section */}
          <section className="relative w-full h-[40vh] sm:h-[600px] bg-surface-container overflow-hidden flex items-center justify-center z-10 border-b border-border-subtle">
            <img
              src={mainImage}
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-10 blur-xl scale-110 pointer-events-none z-0"
            />
            <img
              src={mainImage}
              alt={content.title}
              className="relative max-w-full max-h-full object-contain z-10 transition-transform duration-500 drop-shadow-xl p-8"
            />
            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-surface to-transparent z-20 pointer-events-none"></div>
            
            <div className="absolute bottom-6 sm:bottom-12 left-4 sm:left-gutter z-30 max-w-container-max w-full">
              <p className="text-accent-indigo font-label-caps text-label-caps mb-2 tracking-widest">{t('showroom_subtitle').toUpperCase()}</p>
              <h1 className="font-h1-mobile sm:font-h1 text-3xl sm:text-h1 text-primary mb-4 drop-shadow-sm">{content.title}</h1>
              <div className="flex flex-wrap gap-4">
                {content.category && (
                  <div className="glass-panel border-border-subtle px-4 py-2 rounded-lg flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm">category</span>
                    <span className="font-label-caps text-label-caps text-primary">{content.category}</span>
                  </div>
                )}
                {content.features && content.features[0] && (
                  <div className="glass-panel border-border-subtle px-4 py-2 rounded-lg flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm">stars</span>
                    <span className="font-label-caps text-label-caps text-primary">{content.features[0]}</span>
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
                  className={`w-14 h-10 sm:w-20 sm:h-12 rounded border-2 overflow-hidden cursor-pointer transition-all ${idx === activeImageIdx ? 'border-primary opacity-100 shadow-md' : 'border-border-subtle opacity-60 hover:opacity-100 hover:border-primary/50'}`}
                >
                  <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </section>

          {/* Content Grid */}
          <div className="max-w-container-max mx-auto px-4 sm:px-gutter grid grid-cols-1 lg:grid-cols-12 gap-8 py-12 relative z-10">

            {/* Left: Technical Specs (Bento Style) */}
            <div className="lg:col-span-7 space-y-8">
              <Link to="/" className="inline-flex items-center text-secondary hover:text-primary transition-colors font-label-caps text-label-caps mb-2">
                <span className="material-symbols-outlined text-sm mr-2">arrow_back</span>
                {t('detail_back')}
              </Link>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="glass-panel p-6 rounded-2xl flex flex-col justify-center items-center text-center">
                  <span className="material-symbols-outlined text-accent-indigo text-4xl mb-3">calendar_today</span>
                  <p className="text-secondary font-label-caps text-label-caps">{t('detail_first_reg')}</p>
                  <p className="text-h3 font-h3 text-primary mt-1">{content.year || '-'}</p>
                </div>
                <div className="glass-panel p-6 rounded-2xl flex flex-col justify-center items-center text-center">
                  <span className="material-symbols-outlined text-accent-indigo text-4xl mb-3">distance</span>
                  <p className="text-secondary font-label-caps text-label-caps">{t('detail_mileage')}</p>
                  <p className="text-h3 font-h3 text-primary mt-1">{content.mileage ? `${formatNumber(content.mileage)} km` : '-'}</p>
                </div>
                <div className="glass-panel p-6 rounded-2xl flex flex-col justify-center items-center text-center">
                  <span className="material-symbols-outlined text-accent-indigo text-4xl mb-3">settings_input_component</span>
                  <p className="text-secondary font-label-caps text-label-caps">{t('detail_gear')}</p>
                  <p className="text-h3 font-h3 text-primary mt-1">{t('detail_automatic')}</p>
                </div>
              </div>

              <div className="glass-panel p-8 rounded-2xl">
                <h2 className="font-h3 text-h3 text-primary mb-6 flex items-center gap-3">
                  <span className="w-1 h-6 bg-accent-indigo rounded-full"></span>
                  {t('detail_description')}
                </h2>
                <p className="text-body-lg text-secondary leading-relaxed whitespace-pre-wrap">
                  {content.body || content.summary || t('detail_no_desc')}
                </p>

                {content.features && Array.isArray(content.features) && content.features.length > 0 && (
                  <ul className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {content.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-secondary">
                        <span className="material-symbols-outlined text-accent-emerald text-sm">check_circle</span> {feature}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Bildergalerie */}
              {galleryImages.length > 1 && (
                <div className="glass-panel p-8 rounded-2xl mt-6">
                  <h2 className="font-h3 text-h3 text-primary mb-6 flex items-center gap-3">
                    <span className="w-1 h-6 bg-accent-indigo rounded-full"></span>
                    {t('detail_gallery_tr')}
                  </h2>

                  {/* Main Preview Box */}
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-6 bg-surface-container flex items-center justify-center border border-border-subtle">
                    <img
                      src={galleryImages[activeImageIdx]}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover opacity-10 blur-xl scale-110 pointer-events-none z-0"
                    />
                    <img
                      src={galleryImages[activeImageIdx]}
                      className="relative max-w-full max-h-full object-contain z-10 transition-all duration-500 cursor-pointer hover:scale-[1.02]"
                      alt={`${content.title || 'Araç'} ${t('detail_preview')}`}
                      onClick={() => { setLightboxIdx(activeImageIdx); setZoomLevel(1); setPanPosition({ x: 0, y: 0 }); setLightboxOpen(true); }}
                    />
                  </div>

                  {/* Gallery Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {galleryImages.map((img, idx) => (
                      <div
                        key={idx}
                        onClick={() => setActiveImageIdx(idx)}
                        className={`group overflow-hidden rounded-xl cursor-pointer border-2 transition-all ${activeImageIdx === idx ? 'border-primary shadow-sm' : 'border-transparent hover:border-primary/30'}`}
                      >
                        <img
                          src={img}
                          className={`w-full h-24 object-cover transition-all duration-300 group-hover:scale-110 ${(idx > 2 && activeImageIdx !== idx) ? 'opacity-70 group-hover:opacity-100' : ''}`}
                          alt={`Gallery view ${idx + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {content.tags && Array.isArray(content.tags) && content.tags.length > 0 && (
                <div className="glass-panel p-6 rounded-2xl flex flex-wrap gap-2 mt-6">
                  <span className="material-symbols-outlined text-secondary mr-2">tag</span>
                  {content.tags.map((tag, idx) => (
                    <span key={idx} className="bg-surface-container-low text-secondary border border-border-subtle text-sm px-4 py-1.5 rounded-full font-label-caps text-label-caps">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Finanzierungsdetails */}
            <div className="lg:col-span-5">
              <div className="glass-panel p-8 rounded-3xl sticky top-28 shadow-xl shadow-surface-container-low/50">
                <h3 className="font-h3 text-h3 text-primary mb-8">{t('detail_fin_details')}</h3>
                <div className="space-y-6">
                  <div className="flex justify-between items-end border-b border-border-subtle pb-4">
                    <span className="text-secondary font-label-caps text-label-caps">{t('detail_price')}</span>
                    <span className="font-h2 text-h2 text-primary">{content.price ? `${formatNumber(content.price)} €` : '-'}</span>
                  </div>
                  
                  {parseFloat(content.price) > 0 ? (
                    <>
                      {/* Calculator sliders */}
                      <div className="space-y-6 pt-2">
                        <div>
                          <div className="flex justify-between text-label-caps font-label-caps text-secondary mb-3">
                            <span>{t('detail_down_payment')}</span>
                            <span className="text-primary">{formatNumber(downPayment)} €</span>
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={parseFloat(content.price)}
                            step={1000}
                            value={downPayment}
                            onChange={(e) => handleDownPaymentChange(parseFloat(e.target.value))}
                            className="w-full h-2 bg-surface-container rounded-lg appearance-none cursor-pointer accent-accent-indigo"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between text-label-caps font-label-caps text-secondary mb-3">
                            <span>{t('detail_term')}</span>
                            <span className="text-primary">{termMonths} {t('card_months')}</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {[12, 24, 36, 48, 60, 72, 84].map((term) => (
                              <button
                                key={term}
                                onClick={() => handleTermChange(term)}
                                className={`flex-1 min-w-[50px] py-2 rounded-lg text-sm font-label-caps transition-all border ${
                                  termMonths === term
                                    ? 'bg-accent-indigo text-white border-accent-indigo shadow-md shadow-accent-indigo/20'
                                    : 'bg-surface-container text-secondary border-border-subtle hover:border-accent-indigo/50 hover:text-primary'
                                }`}
                              >
                                {term}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Recalculated Monthly Rate Box */}
                      <div className="bg-primary text-on-primary p-8 rounded-2xl shadow-lg relative overflow-hidden">
                        {/* Decorative elements */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
                        
                        <p className="font-label-caps text-label-caps mb-2 text-white/80">{t('detail_monthly_rate')}</p>
                        <div className="flex items-baseline gap-2 relative z-10">
                          <span className="font-h1 text-5xl md:text-6xl text-white tracking-tight">{formatNumber(monthlyRate)}</span>
                          <span className="text-h3 text-white/80">€/{t('card_months')}</span>
                        </div>
                        <div className="flex flex-col justify-between text-white/70 text-sm mt-6 pt-4 border-t border-white/20 gap-2 relative z-10 font-label-caps">
                          <div className="flex justify-between">
                            <span>{t('detail_interest_rate')}: %{content.interest_rate || '3.8'}</span>
                            <span>{t('detail_term')}: {termMonths} {t('card_months')}</span>
                          </div>
                          <div className="flex justify-between border-t border-white/10 pt-2 mt-2">
                            <span>{t('detail_total_interest')}:</span>
                            <span>{formatNumber(Math.max(0, (monthlyRate * termMonths) - (parseFloat(content.price) - downPayment)))} €</span>
                          </div>
                          <div className="flex justify-between">
                            <span>{t('detail_total_cost')}:</span>
                            <span className="font-bold text-white">{formatNumber((monthlyRate * termMonths) + downPayment)} €</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4 mt-8">
                        <button
                          onClick={() => setIsModalOpen(true)}
                          className="w-full bg-accent-indigo hover:bg-accent-indigo/90 text-white py-5 rounded-xl font-label-caps text-label-caps transition-all duration-300 shadow-lg shadow-accent-indigo/20 active:scale-[0.98] text-center"
                        >
                          {t('detail_request_btn')}
                        </button>
                        <p className="text-center text-sm text-secondary font-label-caps">{t('detail_included_services')}</p>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4 mt-8">
                      <div className="bg-surface-container-low p-6 rounded-2xl border border-border-subtle text-center text-secondary">
                        <span className="material-symbols-outlined text-4xl mb-2 opacity-50">request_quote</span>
                        <p className="font-label-caps text-sm">{t('detail_price_on_request')}</p>
                      </div>
                      <button
                        onClick={() => setIsModalOpen(true)}
                        className="w-full bg-accent-indigo hover:bg-accent-indigo/90 text-white py-5 rounded-xl font-label-caps text-label-caps transition-all duration-300 shadow-lg shadow-accent-indigo/20 active:scale-[0.98] text-center"
                      >
                        {t('detail_request_btn')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Mobile Action (Mobile Only) */}
        <div className="md:hidden fixed bottom-0 left-0 w-full p-4 glass-panel border-t border-border-subtle z-40">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-accent-indigo text-white py-4 rounded-xl font-label-caps text-label-caps shadow-lg shadow-accent-indigo/20"
          >
            {parseFloat(content.price) > 0 
              ? `${t('detail_request_btn')} (${monthlyRate ? formatNumber(monthlyRate) : '0'}€/${t('card_months')})`
              : t('detail_request_btn')}
          </button>
        </div>

        {/* Offer Request Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="glass-panel bg-surface max-w-md w-full p-8 rounded-3xl border border-border-subtle shadow-2xl relative">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-surface-container-low text-secondary hover:text-primary hover:bg-surface-container transition-all"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
              <h2 className="font-h2 text-h2 text-primary mb-2">{t('form_title')}</h2>
              <p className="text-secondary text-sm mb-8">{t('form_desc')}</p>

              <form onSubmit={handleRequest} className="space-y-5">
                <div>
                  <label className="block text-secondary font-label-caps text-label-caps mb-2 pl-1">{t('form_name')}</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-surface-container-low border border-border-subtle rounded-xl px-4 py-3.5 text-primary focus:outline-none focus:border-accent-indigo transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-secondary font-label-caps text-label-caps mb-2 pl-1">{t('form_email')}</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-surface-container-low border border-border-subtle rounded-xl px-4 py-3.5 text-primary focus:outline-none focus:border-accent-indigo transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-secondary font-label-caps text-label-caps mb-2 pl-1">{t('form_phone')}</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-surface-container-low border border-border-subtle rounded-xl px-4 py-3.5 text-primary focus:outline-none focus:border-accent-indigo transition-colors"
                  />
                </div>

                <div className="pt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-4 rounded-xl border border-border-subtle text-primary hover:bg-surface-container-low transition-colors font-label-caps text-label-caps"
                  >
                    {t('form_cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-primary text-on-primary px-4 py-4 rounded-xl hover:bg-secondary transition-colors font-label-caps text-label-caps disabled:opacity-50"
                  >
                    {isSubmitting ? t('detail_sending') : t('form_submit')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Image Lightbox / Zoom Modal */}
        {lightboxOpen && (
          <div
            className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            style={{ zIndex: 10000 }}
            onClick={(e) => { if (e.target === e.currentTarget) { setLightboxOpen(false); setZoomLevel(1); setPanPosition({ x: 0, y: 0 }); } }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') { setLightboxOpen(false); setZoomLevel(1); setPanPosition({ x: 0, y: 0 }); }
              if (e.key === 'ArrowRight') { setLightboxIdx(prev => (prev + 1) % galleryImages.length); setZoomLevel(1); setPanPosition({ x: 0, y: 0 }); }
              if (e.key === 'ArrowLeft') { setLightboxIdx(prev => (prev - 1 + galleryImages.length) % galleryImages.length); setZoomLevel(1); setPanPosition({ x: 0, y: 0 }); }
              if (e.key === '+' || e.key === '=') setZoomLevel(prev => Math.min(prev + 0.5, 3));
              if (e.key === '-') setZoomLevel(prev => Math.max(prev - 0.5, 1));
            }}
            tabIndex={0}
            ref={(el) => el && el.focus()}
          >
            {/* Top Controls */}
            <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
              {/* Zoom Controls */}
              <div className="flex items-center gap-1 bg-black/50 backdrop-blur-md rounded-full px-2 py-1 border border-white/10">
                <button
                  onClick={() => { setZoomLevel(prev => Math.max(prev - 0.5, 1)); setPanPosition({ x: 0, y: 0 }); }}
                  className="w-8 h-8 flex items-center justify-center text-white/80 hover:text-white transition-colors rounded-full hover:bg-white/10"
                  title="Zoom Out"
                >
                  <span className="material-symbols-outlined text-lg">remove</span>
                </button>
                <span className="text-white/70 text-xs font-label-caps min-w-[40px] text-center">{Math.round(zoomLevel * 100)}%</span>
                <button
                  onClick={() => setZoomLevel(prev => Math.min(prev + 0.5, 3))}
                  className="w-8 h-8 flex items-center justify-center text-white/80 hover:text-white transition-colors rounded-full hover:bg-white/10"
                  title="Zoom In"
                >
                  <span className="material-symbols-outlined text-lg">add</span>
                </button>
                {zoomLevel > 1 && (
                  <button
                    onClick={() => { setZoomLevel(1); setPanPosition({ x: 0, y: 0 }); }}
                    className="w-8 h-8 flex items-center justify-center text-white/80 hover:text-white transition-colors rounded-full hover:bg-white/10"
                    title="Reset"
                  >
                    <span className="material-symbols-outlined text-lg">fit_screen</span>
                  </button>
                )}
              </div>
              {/* Close */}
              <button
                onClick={() => { setLightboxOpen(false); setZoomLevel(1); setPanPosition({ x: 0, y: 0 }); }}
                className="w-10 h-10 flex items-center justify-center bg-black/50 backdrop-blur-md text-white/80 hover:text-white rounded-full border border-white/10 hover:bg-white/10 transition-all"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Image Counter */}
            <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md rounded-full px-4 py-2 border border-white/10 z-10">
              <span className="text-white/70 text-xs font-label-caps">{lightboxIdx + 1} / {galleryImages.length}</span>
            </div>

            {/* Prev/Next Arrows */}
            {galleryImages.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); setLightboxIdx(prev => (prev - 1 + galleryImages.length) % galleryImages.length); setZoomLevel(1); setPanPosition({ x: 0, y: 0 }); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-black/40 backdrop-blur-md text-white/70 hover:text-white rounded-full border border-white/10 hover:bg-white/10 transition-all z-10"
                >
                  <span className="material-symbols-outlined text-2xl">chevron_left</span>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setLightboxIdx(prev => (prev + 1) % galleryImages.length); setZoomLevel(1); setPanPosition({ x: 0, y: 0 }); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-black/40 backdrop-blur-md text-white/70 hover:text-white rounded-full border border-white/10 hover:bg-white/10 transition-all z-10"
                >
                  <span className="material-symbols-outlined text-2xl">chevron_right</span>
                </button>
              </>
            )}

            {/* Main Image with Zoom & Pan */}
            <div
              className="relative max-w-[90vw] max-h-[85vh] overflow-hidden select-none"
              style={{ cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in' }}
              onClick={(e) => { if (zoomLevel === 1) { e.stopPropagation(); setZoomLevel(2); } }}
              onMouseDown={(e) => {
                if (zoomLevel > 1) {
                  e.preventDefault();
                  setIsDragging(true);
                  dragStart.current = { x: e.clientX, y: e.clientY };
                  panStart.current = { ...panPosition };
                }
              }}
              onMouseMove={(e) => {
                if (isDragging && zoomLevel > 1) {
                  const dx = e.clientX - dragStart.current.x;
                  const dy = e.clientY - dragStart.current.y;
                  setPanPosition({ x: panStart.current.x + dx, y: panStart.current.y + dy });
                }
              }}
              onMouseUp={() => setIsDragging(false)}
              onMouseLeave={() => setIsDragging(false)}
              onWheel={(e) => {
                e.preventDefault();
                const delta = e.deltaY > 0 ? -0.25 : 0.25;
                const newZoom = Math.max(1, Math.min(3, zoomLevel + delta));
                if (newZoom === 1) setPanPosition({ x: 0, y: 0 });
                setZoomLevel(newZoom);
              }}
            >
              <img
                src={galleryImages[lightboxIdx]}
                alt={`${content.title || ''} - ${lightboxIdx + 1}`}
                className="max-w-[90vw] max-h-[85vh] object-contain select-none"
                style={{
                  transform: `scale(${zoomLevel}) translate(${panPosition.x / zoomLevel}px, ${panPosition.y / zoomLevel}px)`,
                  transition: isDragging ? 'none' : 'transform 0.3s ease',
                }}
                draggable={false}
              />
            </div>

            {/* Bottom Thumbnails */}
            {galleryImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/50 backdrop-blur-md rounded-2xl px-3 py-2 border border-white/10 z-10 max-w-[90vw] overflow-x-auto scrollbar-hide">
                {galleryImages.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={(e) => { e.stopPropagation(); setLightboxIdx(idx); setZoomLevel(1); setPanPosition({ x: 0, y: 0 }); }}
                    className={`w-14 h-10 rounded-lg overflow-hidden cursor-pointer transition-all flex-shrink-0 border-2 ${
                      idx === lightboxIdx ? 'border-white opacity-100 shadow-lg' : 'border-transparent opacity-50 hover:opacity-80'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" draggable={false} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
