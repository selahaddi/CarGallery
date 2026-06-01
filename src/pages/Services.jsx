import React, { useEffect } from 'react';
import { useLanguage } from '../LanguageContext';

export default function Services() {
  const { t } = useLanguage();

  return (
    <>
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="pt-nav-height min-h-screen">
        <div className="rail-system min-h-screen">
          <div className="rail-vertical"></div>

          <div className="px-gutter max-w-container-max mx-auto py-20 relative z-10">
            {/* Hero Section */}
            <header className="mb-24 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-low border border-border-subtle mb-6 mx-auto">
                <span className="w-2 h-2 rounded-full bg-accent-indigo animate-pulse"></span>
                <span className="font-label-caps text-label-caps text-secondary uppercase">{t('hero_services_subtitle')}</span>
              </div>
              <h1 className="font-h1-mobile md:font-h1 text-h1-mobile md:text-h1 text-primary max-w-4xl mx-auto mb-6 leading-none">
                {t('hero_services_title')}
              </h1>
              <p className="font-body-lg text-body-lg text-secondary max-w-2xl mx-auto mb-10">
                {t('hero_services_desc')}
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button className="bg-primary text-on-primary px-8 py-4 rounded-full font-label-caps text-label-caps hover:bg-secondary active:scale-95 transition-all flex items-center justify-center gap-2">
                  {t('hero_services_btn1')} <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
                <button className="bg-surface-container-low text-secondary border border-border-subtle px-8 py-4 rounded-full font-label-caps text-label-caps hover:bg-surface-container transition-all">
                  {t('hero_services_btn2')}
                </button>
              </div>
            </header>

            {/* Services Grid (Bento Style) */}
            <section className="mb-24">
              <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                <div>
                  <h2 className="font-h2 text-3xl sm:text-h2 text-primary mb-4">{t('services_title')}</h2>
                  <div className="w-24 h-1 bg-primary"></div>
                </div>
                <p className="text-secondary font-body-md max-w-md">
                  {t('services_desc')}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-8 glass-panel rounded-2xl p-6 sm:p-8 group hover:border-primary/50 transition-all relative overflow-hidden h-[240px] sm:h-[400px] flex flex-col justify-end">
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
                  <h3 className="font-h3 text-primary mb-2 relative z-10">{t('srv1_title')}</h3>
                  <p className="text-secondary font-body-md mb-6 relative z-10 max-w-md">
                    {t('srv1_desc')}
                  </p>
                  <a className="text-primary font-label-caps text-label-caps flex items-center gap-2 relative z-10 group-hover:gap-4 transition-all cursor-pointer">
                    {t('srv_details_link')} <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </a>
                  <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-60 z-0"></div>
                </div>
                
                <div className="md:col-span-4 glass-panel rounded-2xl p-6 sm:p-8 group hover:border-primary/50 transition-all flex flex-col items-center text-center justify-center border-t-4 border-t-accent-indigo min-h-[200px]">
                  <span className="material-symbols-outlined text-accent-indigo text-6xl mb-4">shopping_cart</span>
                  <h3 className="font-h3 text-primary mb-2">{t('srv2_title')}</h3>
                  <p className="text-secondary font-body-md">{t('srv2_desc')}</p>
                </div>
                
                <div className="md:col-span-4 glass-panel rounded-2xl p-6 sm:p-8 group hover:border-primary/50 transition-all flex flex-col justify-between min-h-[200px]">
                  <span className="material-symbols-outlined text-primary text-4xl mb-4">local_shipping</span>
                  <div>
                    <h3 className="font-h3 text-primary mb-2">{t('srv3_title')}</h3>
                    <p className="text-secondary font-body-md">{t('srv3_desc')}</p>
                  </div>
                </div>
                
                <div className="md:col-span-4 glass-panel rounded-2xl overflow-hidden group hover:border-primary/50 transition-all relative min-h-[200px]">
                  <div className="absolute inset-0 z-0">
                    <img 
                      className="w-full h-full object-cover opacity-30 grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" 
                      alt="Car wrapping" 
                      src="https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80"
                    />
                  </div>
                  <div className="relative z-10 p-6 sm:p-8 h-full flex flex-col justify-end bg-gradient-to-t from-surface to-transparent">
                    <h3 className="font-h3 text-primary mb-2">{t('srv4_title')}</h3>
                    <p className="text-secondary font-body-md">{t('srv4_desc')}</p>
                  </div>
                </div>
                
                <div className="md:col-span-4 glass-panel rounded-2xl p-6 sm:p-8 group hover:border-primary/50 transition-all flex flex-col justify-between bg-surface-container min-h-[200px]">
                  <div className="flex justify-between items-start mb-4">
                    <span className="material-symbols-outlined text-primary text-4xl">verified_user</span>
                    <span className="material-symbols-outlined text-secondary/30 text-4xl">auto_fix_high</span>
                  </div>
                  <div>
                    <h3 className="font-h3 text-primary mb-2">{t('srv5_title')}</h3>
                    <p className="text-secondary font-body-md">{t('srv5_desc')}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* How it Works (Süreç) */}
            <section className="mb-24 relative overflow-hidden">
              <div className="glass-panel p-8 sm:p-12 rounded-3xl relative z-10 border-border-subtle">
                <div className="text-center mb-16">
                  <h2 className="font-h2 text-3xl sm:text-h2 text-primary mb-4">{t('process_title')}</h2>
                  <p className="text-secondary font-body-md max-w-xl mx-auto">{t('process_desc')}</p>
                </div>
                
                <div className="relative">
                  <div className="hidden lg:block absolute top-1/2 left-0 w-full h-[1px] bg-border-subtle -translate-y-1/2"></div>
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    <div className="relative group">
                      <div className="w-16 h-16 rounded-full bg-surface-container-low border border-border-subtle flex items-center justify-center mb-6 mx-auto relative z-10 group-hover:border-primary transition-all">
                        <span className="text-primary font-h3">1</span>
                      </div>
                      <div className="text-center">
                        <h4 className="font-label-caps text-label-caps text-primary mb-2">{t('step1_title')}</h4>
                        <p className="text-secondary text-sm">{t('step1_desc')}</p>
                      </div>
                    </div>
                    
                    <div className="relative group">
                      <div className="w-16 h-16 rounded-full bg-surface-container-low border border-border-subtle flex items-center justify-center mb-6 mx-auto relative z-10 group-hover:border-primary transition-all">
                        <span className="text-primary font-h3">2</span>
                      </div>
                      <div className="text-center">
                        <h4 className="font-label-caps text-label-caps text-primary mb-2">{t('step2_title')}</h4>
                        <p className="text-secondary text-sm">{t('step2_desc')}</p>
                      </div>
                    </div>
                    
                    <div className="relative group">
                      <div className="w-16 h-16 rounded-full bg-primary border border-primary flex items-center justify-center mb-6 mx-auto relative z-10 shadow-lg shadow-primary/20">
                        <span className="text-white font-h3">3</span>
                      </div>
                      <div className="text-center">
                        <h4 className="font-label-caps text-label-caps text-primary mb-2">{t('step3_title')}</h4>
                        <p className="text-secondary text-sm">{t('step3_desc')}</p>
                      </div>
                    </div>
                    
                    <div className="relative group">
                      <div className="w-16 h-16 rounded-full bg-surface-container-low border border-border-subtle flex items-center justify-center mb-6 mx-auto relative z-10 group-hover:border-primary transition-all">
                        <span className="text-primary font-h3">4</span>
                      </div>
                      <div className="text-center">
                        <h4 className="font-label-caps text-label-caps text-primary mb-2">{t('step4_title')}</h4>
                        <p className="text-secondary text-sm">{t('step4_desc')}</p>
                      </div>
                    </div>
                    
                    <div className="relative group">
                      <div className="w-16 h-16 rounded-full bg-surface-container-low border border-border-subtle flex items-center justify-center mb-6 mx-auto relative z-10 group-hover:border-primary transition-all">
                        <span className="material-symbols-outlined text-primary text-3xl">done_all</span>
                      </div>
                      <div className="text-center">
                        <h4 className="font-label-caps text-label-caps text-primary mb-2">{t('step5_title')}</h4>
                        <p className="text-secondary text-sm">{t('step5_desc')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Why Us Section */}
            <section className="mb-10 sm:mb-20">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div className="order-2 lg:order-1">
                  <h2 className="font-h2 text-3xl sm:text-h2 text-primary mb-8">{t('why_us_title')}</h2>
                  <div className="space-y-8">
                    <div className="flex gap-6 group">
                      <div className="flex-shrink-0 w-12 h-12 bg-surface-container-low border border-border-subtle flex items-center justify-center rounded-lg group-hover:bg-primary transition-all">
                        <span className="material-symbols-outlined text-primary group-hover:text-white transition-colors">timer</span>
                      </div>
                      <div>
                        <h4 className="font-label-caps text-label-caps text-primary mb-2">{t('why1_title')}</h4>
                        <p className="text-secondary">{t('why1_desc')}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-6 group">
                      <div className="flex-shrink-0 w-12 h-12 bg-surface-container-low border border-border-subtle flex items-center justify-center rounded-lg group-hover:bg-primary transition-all">
                        <span className="material-symbols-outlined text-primary group-hover:text-white transition-colors">support_agent</span>
                      </div>
                      <div>
                        <h4 className="font-label-caps text-label-caps text-primary mb-2">{t('why2_title')}</h4>
                        <p className="text-secondary">{t('why2_desc')}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-6 group">
                      <div className="flex-shrink-0 w-12 h-12 bg-surface-container-low border border-border-subtle flex items-center justify-center rounded-lg group-hover:bg-primary transition-all">
                        <span className="material-symbols-outlined text-primary group-hover:text-white transition-colors">dashboard_customize</span>
                      </div>
                      <div>
                        <h4 className="font-label-caps text-label-caps text-primary mb-2">{t('why3_title')}</h4>
                        <p className="text-secondary">{t('why3_desc')}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="order-1 lg:order-2 grid grid-cols-2 gap-4">
                  <div className="space-y-4 pt-12">
                    <div className="glass-panel aspect-auto sm:aspect-square rounded-2xl flex flex-col items-center justify-center p-6 border-b-4 border-b-accent-indigo">
                      <span className="text-3xl sm:text-h1 text-primary leading-none mb-2">{t('stat1_val')}</span>
                      <span className="text-secondary font-label-caps text-label-caps text-center">{t('stat1_lbl')}</span>
                    </div>
                    <div className="glass-panel aspect-auto sm:aspect-square rounded-2xl flex flex-col items-center justify-center p-6 bg-surface-container">
                      <span className="text-h2 text-primary leading-none mb-2">{t('stat2_val')}</span>
                      <span className="text-secondary font-label-caps text-label-caps text-center">{t('stat2_lbl')}</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="glass-panel aspect-auto sm:aspect-square rounded-2xl flex flex-col items-center justify-center p-6">
                      <span className="text-h2 text-primary leading-none mb-2">{t('stat3_val')}</span>
                      <span className="text-secondary font-label-caps text-label-caps text-center">{t('stat3_lbl')}</span>
                    </div>
                    <div className="glass-panel aspect-auto sm:aspect-square rounded-2xl flex flex-col items-center justify-center p-6 border-t-4 border-t-accent-emerald">
                      <span className="material-symbols-outlined text-primary text-6xl">public</span>
                      <span className="text-secondary font-label-caps text-label-caps text-center mt-2">{t('stat4_lbl')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </>
  );
}
