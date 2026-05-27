import React, { useEffect } from 'react';
import { useLanguage } from '../LanguageContext';

export default function Services() {
  const { t } = useLanguage();

  useEffect(() => {
    const handleMouseMove = (e) => {
      const cards = document.querySelectorAll('.glass-card-hover');
      cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="bg-background text-on-background font-body-md overflow-x-hidden pt-16 sm:pt-20">
      {/* Hero Section */}
      <section className="relative h-[50vh] sm:h-[calc(100vh-80px)] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-background-deep via-transparent to-background-deep z-10"></div>
          <img 
            className="w-full h-full object-cover opacity-40 scale-105 transform hover:scale-100 transition-transform duration-10000" 
            alt="Hero background" 
            src="https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1920&q=80"
          />
        </div>
        <div className="relative z-20 text-center px-4 max-w-4xl w-full">
          <span className="text-primary font-label-bold uppercase tracking-[0.3em] mb-4 block">
            {t('hero_services_subtitle')}
          </span>
          <h1 className="font-display-hero text-headline-lg-mobile md:text-display-hero mb-6 text-gradient leading-none break-words">
            {t('hero_services_title')}
          </h1>
          <p className="font-body-lg text-text-muted mb-10 max-w-2xl mx-auto">
            {t('hero_services_desc')}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="bg-primary-container text-on-primary-container px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-label-bold active-red-glow hover:bg-red-500 transition-all flex items-center justify-center gap-2">
              {t('hero_services_btn1')} <span className="material-symbols-outlined">arrow_forward</span>
            </button>
            <button className="glass-card text-white border border-outline-variant/30 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-label-bold hover:bg-surface-variant transition-all">
              {t('hero_services_btn2')}
            </button>
          </div>
        </div>
      </section>

      {/* Services Grid (Bento Style) */}
      <section className="max-w-container-max mx-auto px-4 sm:px-gutter py-12 sm:py-section-gap">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h2 className="font-headline-lg text-2xl sm:text-headline-lg text-white mb-4">{t('services_title')}</h2>
            <div className="w-24 h-1 bg-primary-container"></div>
          </div>
          <p className="text-text-muted font-body-md max-w-md">
            {t('services_desc')}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-8 glass-card glass-card-hover rounded-xl p-6 sm:p-8 group hover:border-primary/50 transition-all relative overflow-hidden h-[240px] sm:h-[400px] flex flex-col justify-end">
            <div className="absolute inset-0 z-0">
              <img 
                className="w-full h-full object-cover opacity-10 group-hover:opacity-20 group-hover:scale-105 transition-all duration-700 grayscale group-hover:grayscale-0" 
                alt="Professional Finance" 
                src="https://images.unsplash.com/photo-1616788494707-ec28f08d05a1?auto=format&fit=crop&w=1200&q=80"
              />
            </div>
            <div className="absolute top-0 right-0 p-8 z-10">
              <span className="material-symbols-outlined text-primary text-5xl">account_balance</span>
            </div>
            <h3 className="font-headline-md text-white mb-2 relative z-10">{t('srv1_title')}</h3>
            <p className="text-text-muted font-body-md mb-6 relative z-10">
              {t('srv1_desc')}
            </p>
            <a className="text-primary font-label-bold flex items-center gap-2 relative z-10 group-hover:gap-4 transition-all cursor-pointer">
              {t('srv_details_link')} <span className="material-symbols-outlined">trending_flat</span>
            </a>
            <div className="absolute inset-0 bg-gradient-to-t from-background-deep via-transparent to-transparent opacity-60 z-0"></div>
          </div>
          
          <div className="md:col-span-4 glass-card glass-card-hover rounded-xl p-6 sm:p-8 group hover:border-primary/50 transition-all flex flex-col items-center text-center justify-center border-l-4 border-l-primary-container min-h-[200px]">
            <span className="material-symbols-outlined text-primary text-6xl mb-4">shopping_cart</span>
            <h3 className="font-headline-md text-white mb-2">{t('srv2_title')}</h3>
            <p className="text-text-muted font-body-md">{t('srv2_desc')}</p>
          </div>
          
          <div className="md:col-span-4 glass-card glass-card-hover rounded-xl p-6 sm:p-8 group hover:border-primary/50 transition-all flex flex-col justify-between min-h-[200px]">
            <span className="material-symbols-outlined text-primary text-4xl">local_shipping</span>
            <div>
              <h3 className="font-headline-md text-white mb-2">{t('srv3_title')}</h3>
              <p className="text-text-muted font-body-md">{t('srv3_desc')}</p>
            </div>
          </div>
          
          <div className="md:col-span-4 glass-card glass-card-hover rounded-xl overflow-hidden group hover:border-primary/50 transition-all relative min-h-[200px]">
            <div className="absolute inset-0">
              <img 
                className="w-full h-full object-cover opacity-30 grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" 
                alt="Car wrapping" 
                src="https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80"
              />
            </div>
            <div className="relative z-10 p-8 h-full flex flex-col justify-end bg-gradient-to-t from-background-deep to-transparent">
              <h3 className="font-headline-md text-white mb-2">{t('srv4_title')}</h3>
              <p className="text-text-muted font-body-md">{t('srv4_desc')}</p>
            </div>
          </div>
          
          <div className="md:col-span-4 glass-card glass-card-hover rounded-xl p-6 sm:p-8 group hover:border-primary/50 transition-all flex flex-col justify-between bg-surface-zinc min-h-[200px]">
            <div className="flex justify-between items-start">
              <span className="material-symbols-outlined text-primary text-4xl">verified_user</span>
              <span className="material-symbols-outlined text-on-surface-variant/30 text-4xl">auto_fix_high</span>
            </div>
            <div>
              <h3 className="font-headline-md text-white mb-2">{t('srv5_title')}</h3>
              <p className="text-text-muted font-body-md">{t('srv5_desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works (Süreç) */}
      <section className="bg-surface-container-low py-12 sm:py-section-gap relative overflow-hidden">
        <div className="max-w-container-max mx-auto px-4 sm:px-gutter relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-headline-lg text-2xl sm:text-headline-lg text-white mb-4">{t('process_title')}</h2>
            <p className="text-text-muted font-body-md max-w-xl mx-auto">{t('process_desc')}</p>
          </div>
          
          <div className="relative">
            <div className="hidden lg:block absolute top-1/2 left-0 w-full h-1 bg-outline-variant/20 -translate-y-1/2"></div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              <div className="relative group">
                <div className="w-16 h-16 rounded-full bg-surface-zinc border-4 border-outline-variant/30 flex items-center justify-center mb-6 mx-auto relative z-10 group-hover:border-primary-container transition-all">
                  <span className="text-white font-headline-md">1</span>
                </div>
                <div className="text-center">
                  <h4 className="font-headline-md text-white mb-2 text-sm md:text-xl">{t('step1_title')}</h4>
                  <p className="text-text-muted text-sm">{t('step1_desc')}</p>
                </div>
              </div>
              
              <div className="relative group">
                <div className="w-16 h-16 rounded-full bg-surface-zinc border-4 border-outline-variant/30 flex items-center justify-center mb-6 mx-auto relative z-10 group-hover:border-primary-container transition-all">
                  <span className="text-white font-headline-md">2</span>
                </div>
                <div className="text-center">
                  <h4 className="font-headline-md text-white mb-2 text-sm md:text-xl">{t('step2_title')}</h4>
                  <p className="text-text-muted text-sm">{t('step2_desc')}</p>
                </div>
              </div>
              
              <div className="relative group">
                <div className="w-16 h-16 rounded-full bg-primary-container border-4 border-primary-container flex items-center justify-center mb-6 mx-auto relative z-10 shadow-[0_0_15px_rgba(225,29,72,0.5)]">
                  <span className="text-white font-headline-md">3</span>
                </div>
                <div className="text-center">
                  <h4 className="font-headline-md text-white mb-2 text-sm md:text-xl">{t('step3_title')}</h4>
                  <p className="text-text-muted text-sm">{t('step3_desc')}</p>
                </div>
              </div>
              
              <div className="relative group">
                <div className="w-16 h-16 rounded-full bg-surface-zinc border-4 border-outline-variant/30 flex items-center justify-center mb-6 mx-auto relative z-10 group-hover:border-primary-container transition-all">
                  <span className="text-white font-headline-md">4</span>
                </div>
                <div className="text-center">
                  <h4 className="font-headline-md text-white mb-2 text-sm md:text-xl">{t('step4_title')}</h4>
                  <p className="text-text-muted text-sm">{t('step4_desc')}</p>
                </div>
              </div>
              
              <div className="relative group">
                <div className="w-16 h-16 rounded-full bg-surface-zinc border-4 border-outline-variant/30 flex items-center justify-center mb-6 mx-auto relative z-10 group-hover:border-primary-container transition-all">
                  <span className="material-symbols-outlined text-white text-3xl">done_all</span>
                </div>
                <div className="text-center">
                  <h4 className="font-headline-md text-white mb-2 text-sm md:text-xl">{t('step5_title')}</h4>
                  <p className="text-text-muted text-sm">{t('step5_desc')}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-20 flex justify-center">
            <div className="glass-card rounded-2xl p-4 flex flex-col md:flex-row items-center gap-6 max-w-2xl border-primary-container/20">
              <img 
                className="w-24 h-24 rounded-lg object-cover" 
                alt="Track progress" 
                src="https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=600&q=80"
              />
              <div className="text-center md:text-left">
                <p className="text-white font-label-bold">{t('track_status_title')}</p>
                <p className="text-text-muted text-sm">{t('track_status_desc')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Us Section */}
      <section className="max-w-container-max mx-auto px-4 sm:px-gutter py-12 sm:py-section-gap mb-10 sm:mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1">
            <h2 className="font-headline-lg text-2xl sm:text-headline-lg text-white mb-8">{t('why_us_title')}</h2>
            <div className="space-y-8">
              <div className="flex gap-6 group">
                <div className="flex-shrink-0 w-12 h-12 bg-primary-container/10 border border-primary-container/30 flex items-center justify-center rounded-lg group-hover:bg-primary-container transition-all">
                  <span className="material-symbols-outlined text-primary group-hover:text-white transition-colors">timer</span>
                </div>
                <div>
                  <h4 className="font-headline-md text-white text-lg mb-1">{t('why1_title')}</h4>
                  <p className="text-text-muted">{t('why1_desc')}</p>
                </div>
              </div>
              
              <div className="flex gap-6 group">
                <div className="flex-shrink-0 w-12 h-12 bg-primary-container/10 border border-primary-container/30 flex items-center justify-center rounded-lg group-hover:bg-primary-container transition-all">
                  <span className="material-symbols-outlined text-primary group-hover:text-white transition-colors">support_agent</span>
                </div>
                <div>
                  <h4 className="font-headline-md text-white text-lg mb-1">{t('why2_title')}</h4>
                  <p className="text-text-muted">{t('why2_desc')}</p>
                </div>
              </div>
              
              <div className="flex gap-6 group">
                <div className="flex-shrink-0 w-12 h-12 bg-primary-container/10 border border-primary-container/30 flex items-center justify-center rounded-lg group-hover:bg-primary-container transition-all">
                  <span className="material-symbols-outlined text-primary group-hover:text-white transition-colors">dashboard_customize</span>
                </div>
                <div>
                  <h4 className="font-headline-md text-white text-lg mb-1">{t('why3_title')}</h4>
                  <p className="text-text-muted">{t('why3_desc')}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="order-1 lg:order-2 grid grid-cols-2 gap-4">
            <div className="space-y-4 pt-12">
              <div className="glass-card aspect-auto sm:aspect-square rounded-2xl flex flex-col items-center justify-center p-6 border-b-4 border-b-primary-container">
                <span className="text-3xl sm:text-4xl md:text-display-hero text-primary leading-none mb-2">{t('stat1_val')}</span>
                <span className="text-on-surface-variant font-label-bold text-center">{t('stat1_lbl')}</span>
              </div>
              <div className="glass-card aspect-auto sm:aspect-square rounded-2xl flex flex-col items-center justify-center p-6 bg-surface-zinc">
                <span className="text-headline-lg text-white leading-none mb-2">{t('stat2_val')}</span>
                <span className="text-on-surface-variant font-label-bold text-center">{t('stat2_lbl')}</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="glass-card aspect-auto sm:aspect-square rounded-2xl flex flex-col items-center justify-center p-6">
                <span className="text-headline-lg text-white leading-none mb-2">{t('stat3_val')}</span>
                <span className="text-on-surface-variant font-label-bold text-center">{t('stat3_lbl')}</span>
              </div>
              <div className="glass-card aspect-auto sm:aspect-square rounded-2xl flex flex-col items-center justify-center p-6 border-t-4 border-t-primary-container">
                <span className="material-symbols-outlined text-primary text-6xl">public</span>
                <span className="text-on-surface-variant font-label-bold text-center mt-2">{t('stat4_lbl')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
