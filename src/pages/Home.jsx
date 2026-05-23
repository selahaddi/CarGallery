import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import ContentCard from '../components/ContentCard';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

export default function Home() {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const { t } = useLanguage();

  useEffect(() => {
    fetchContents();
  }, []);

  const fetchContents = async () => {
    try {
      setLoading(true);
      setFetchError(null);
      const { data, error } = await supabase
        .from('contents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Veri çekme hatası:', error);
        setFetchError(`Supabase Hatası (${error.code}): ${error.message}`);
      } else {
        const sortedData = (data || []).sort((a, b) => {
          const orderA = a.sort_order !== null && a.sort_order !== undefined ? a.sort_order : 999999;
          const orderB = b.sort_order !== null && b.sort_order !== undefined ? b.sort_order : 999999;
          if (orderA !== orderB) {
            return orderA - orderB;
          }
          return new Date(b.created_at) - new Date(a.created_at);
        });
        setContents(sortedData);
      }
    } catch (err) {
      console.error('Beklenmeyen hata:', err);
      setFetchError(`Sistem Hatası: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen pt-20">
        <Loader2 className="w-12 h-12 animate-spin text-primary-container mb-4" />
        <p className="text-text-muted font-medium">{t('loading_vehicles')}</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="max-w-container-max mx-auto px-gutter pt-32 pb-20">
        <div className="bg-error-container/20 border border-error p-6 rounded-xl shadow-sm">
          <h3 className="text-error font-bold text-lg mb-2">{t('supabase_failed')}</h3>
          <p className="text-error/80 font-mono text-sm break-all">{fetchError}</p>
        </div>
      </div>
    );
  }

  // Calculate fleet value (dummy logic based on price for demo)
  const fleetValue = contents.reduce((acc, val) => acc + (val.price || 0), 0);
  const formattedFleetValue = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(fleetValue || 2400000);

  return (
    <>
      <main className="pt-32 pb-20 px-gutter min-h-screen">
        {/* Header Section */}
        <header className="max-w-container-max mx-auto mb-12">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div className="space-y-4">
              <span className="text-primary-container font-label-bold text-label-bold tracking-widest uppercase">
                {t('showroom_subtitle')}
              </span>
              <h1 className="text-display-hero font-display-hero text-on-surface">
                {t('showroom_title_part1')} <span className="text-primary-container">{t('showroom_title_part2')}</span>
              </h1>
              <p className="text-body-lg font-body-lg text-text-muted max-w-2xl">
                {t('showroom_desc')}
              </p>
            </div>
            <div className="flex gap-4">
              <div className="glass-card p-4 rounded-xl text-center min-w-[140px]">
                <p className="text-label-sm text-text-muted uppercase">{t('avg_interest')}</p>
                <p className="text-headline-md font-headline-md text-primary-container">3.8%</p>
              </div>
              <div className="glass-card p-4 rounded-xl text-center min-w-[140px]">
                <p className="text-label-sm text-text-muted uppercase">{t('vehicle_count')}</p>
                <p className="text-headline-md font-headline-md text-on-surface">{formattedFleetValue}</p>
              </div>
            </div>
          </div>
          
          {/* Filters */}
          <div className="mt-12 flex flex-wrap gap-4 items-center">
            <button className="glass-card px-6 py-2 rounded-full border border-primary-container/50 text-primary-container font-label-bold text-label-bold">{t('all_vehicles')}</button>
            <button className="glass-card px-6 py-2 rounded-full text-text-muted hover:text-on-surface transition-all font-label-bold text-label-bold">{t('electric_hybrid')}</button>
            <button className="glass-card px-6 py-2 rounded-full text-text-muted hover:text-on-surface transition-all font-label-bold text-label-bold">{t('performance')}</button>
            <button className="glass-card px-6 py-2 rounded-full text-text-muted hover:text-on-surface transition-all font-label-bold text-label-bold">{t('suv')}</button>
            <button className="glass-card px-6 py-2 rounded-full text-text-muted hover:text-on-surface transition-all font-label-bold text-label-bold">{t('logistics')}</button>
            
            <div className="ml-auto glass-card flex items-center rounded-lg px-4 py-2 gap-2">
              <span className="text-label-bold font-label-bold text-text-muted">{t('sort_by')}</span>
              <select className="bg-transparent border-none text-on-surface font-label-bold text-label-bold focus:ring-0 cursor-pointer outline-none">
                <option className="bg-surface">{t('sort_monthly_asc')}</option>
                <option className="bg-surface">{t('sort_power_desc')}</option>
                <option className="bg-surface">{t('sort_availability')}</option>
              </select>
            </div>
          </div>
        </header>

        {/* Inventory Grid */}
        <div className="max-w-container-max mx-auto">
          {contents.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center mt-12">
              <p className="text-text-muted text-lg font-label-bold">{t('no_vehicles')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-gutter">
              {contents.map((content) => (
                <ContentCard key={content.id} content={content} />
              ))}
            </div>
          )}
        </div>

        {/* Hizmetlerimiz Section */}
        <section className="max-w-container-max mx-auto mt-24 mb-24">
          <div className="flex flex-col items-center mb-12">
            <span className="text-primary-container font-label-bold text-label-bold tracking-widest uppercase mb-2">{t('services_subtitle')}</span>
            <h2 className="text-headline-lg font-headline-lg text-on-surface">{t('services_title')}</h2>
            <div className="h-1 w-24 bg-primary-container mt-4"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-card p-8 rounded-2xl hover:border-primary-container/50 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-lg bg-primary-container/10 flex items-center justify-center mb-6 group-hover:bg-primary-container transition-colors">
                <span className="material-symbols-outlined text-primary-container group-hover:text-white">payments</span>
              </div>
              <h3 className="text-headline-md font-headline-md text-on-surface mb-3">{t('srv1_title')}</h3>
              <p className="text-body-md text-text-muted">{t('srv1_desc')}</p>
            </div>
            
            <div className="glass-card p-8 rounded-2xl hover:border-primary-container/50 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-lg bg-primary-container/10 flex items-center justify-center mb-6 group-hover:bg-primary-container transition-colors">
                <span className="material-symbols-outlined text-primary-container group-hover:text-white">verified_user</span>
              </div>
              <h3 className="text-headline-md font-headline-md text-on-surface mb-3">{t('srv5_title')}</h3>
              <p className="text-body-md text-text-muted">{t('srv5_desc')}</p>
            </div>
            
            <div className="glass-card p-8 rounded-2xl hover:border-primary-container/50 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-lg bg-primary-container/10 flex items-center justify-center mb-6 group-hover:bg-primary-container transition-colors">
                <span className="material-symbols-outlined text-primary-container group-hover:text-white">article</span>
              </div>
              <h3 className="text-headline-md font-headline-md text-on-surface mb-3">{t('srv3_title')}</h3>
              <p className="text-body-md text-text-muted">{t('srv3_desc')}</p>
            </div>
            
            <div className="glass-card p-8 rounded-2xl hover:border-primary-container/50 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-lg bg-primary-container/10 flex items-center justify-center mb-6 group-hover:bg-primary-container transition-colors">
                <span className="material-symbols-outlined text-primary-container group-hover:text-white">shopping_cart</span>
              </div>
              <h3 className="text-headline-md font-headline-md text-on-surface mb-3">{t('srv2_title')}</h3>
              <p className="text-body-md text-text-muted">{t('srv2_desc')}</p>
            </div>
          </div>
        </section>

        {/* Süreç Section */}
        <section className="max-w-container-max mx-auto mb-24">
          <div className="bg-surface-zinc/50 border border-outline-variant/10 rounded-3xl p-12 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container/10 blur-[120px] rounded-full"></div>
            <div className="flex flex-col md:flex-row justify-between items-start gap-12 relative z-10">
              <div className="max-w-sm">
                <span className="text-primary-container font-label-bold text-label-bold tracking-widest uppercase">{t('process_subtitle')}</span>
                <h2 className="text-headline-lg font-headline-lg text-on-surface mt-2 mb-6">{t('process_title')}</h2>
                <p className="text-body-lg text-text-muted">{t('process_desc')}</p>
                <button className="mt-8 bg-primary-container text-white px-8 py-3 rounded-lg font-label-bold hover:bg-accent-red-bright transition-all">{t('process_btn')}</button>
              </div>
              <div className="flex-1 w-full space-y-8">
                <div className="flex gap-6 items-start">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full border-2 border-primary-container flex items-center justify-center text-primary-container font-bold">1</div>
                    <div className="w-0.5 h-12 bg-outline-variant/20"></div>
                  </div>
                  <div>
                    <h4 className="text-on-surface font-label-bold">{t('step1_title')}</h4>
                    <p className="text-label-sm text-text-muted">{t('step1_desc')}</p>
                  </div>
                </div>
                
                <div className="flex gap-6 items-start">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full border-2 border-primary-container flex items-center justify-center text-primary-container font-bold">2</div>
                    <div className="w-0.5 h-12 bg-outline-variant/20"></div>
                  </div>
                  <div>
                    <h4 className="text-on-surface font-label-bold">{t('step2_title')}</h4>
                    <p className="text-label-sm text-text-muted">{t('step2_desc')}</p>
                  </div>
                </div>
                
                <div className="flex gap-6 items-start">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full border-2 border-primary-container flex items-center justify-center text-primary-container font-bold">3</div>
                    <div className="w-0.5 h-12 bg-outline-variant/20"></div>
                  </div>
                  <div>
                    <h4 className="text-on-surface font-label-bold">{t('step3_title')}</h4>
                    <p className="text-label-sm text-text-muted">{t('step3_desc')}</p>
                  </div>
                </div>
                
                <div className="flex gap-6 items-start">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full border-2 border-primary-container flex items-center justify-center text-primary-container font-bold">4</div>
                    <div className="w-0.5 h-12 bg-outline-variant/20"></div>
                  </div>
                  <div>
                    <h4 className="text-on-surface font-label-bold">{t('step4_title')}</h4>
                    <p className="text-label-sm text-text-muted">{t('step4_desc')}</p>
                  </div>
                </div>
                
                <div className="flex gap-6 items-start">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-white">
                      <span className="material-symbols-outlined text-sm">check</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-on-surface font-label-bold">{t('step5_title')}</h4>
                    <p className="text-label-sm text-text-muted">{t('step5_desc')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pagination */}
        <div className="max-w-container-max mx-auto mt-16 flex justify-center gap-2">
          <button className="w-10 h-10 flex items-center justify-center rounded-lg glass-card text-on-surface hover:bg-primary-container hover:text-white transition-all">1</button>
          <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary-container text-white font-bold">2</button>
          <button className="w-10 h-10 flex items-center justify-center rounded-lg glass-card text-on-surface hover:bg-primary-container hover:text-white transition-all">3</button>
          <span className="text-text-muted flex items-center px-2">...</span>
          <button className="w-10 h-10 flex items-center justify-center rounded-lg glass-card text-on-surface hover:bg-primary-container hover:text-white transition-all">12</button>
        </div>
      </main>
    </>
  );
}
