import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import ContentCard from '../components/ContentCard';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import ScrollVideoTest from '../components/ScrollVideoTest';

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
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="text-secondary font-medium">{t('loading_vehicles')}</p>
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

  const fleetValue = contents.reduce((acc, val) => acc + (val.price || 0), 0);
  const formattedFleetValue = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(fleetValue || 2400000);

  return (
    <>
      <ScrollVideoTest />
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="pt-nav-height min-h-screen">
        <div className="rail-system min-h-screen">
          <div className="rail-vertical"></div>

          <div className="px-gutter max-w-container-max mx-auto py-20 relative z-10">
            <header className="mb-24">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-low border border-border-subtle mb-6">
                <span className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse"></span>
                <span className="font-label-caps text-label-caps text-secondary uppercase">{t('showroom_subtitle')}</span>
              </div>
              <h1 className="font-h1-mobile md:font-h1 text-h1-mobile md:text-h1 text-primary max-w-4xl mb-6 leading-none">
                {t('showroom_title_part1')} <br/><span className="text-secondary">{t('showroom_title_part2')}</span>
              </h1>
              <p className="font-body-lg text-body-lg text-secondary max-w-2xl mb-10">
                {t('showroom_desc')}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl">
                <div className="glass-panel p-6 rounded-2xl">
                  <p className="font-label-caps text-label-caps text-secondary mb-2 uppercase">{t('vehicle_count')}</p>
                  <p className="font-h2 text-h2 text-primary">{formattedFleetValue}</p>
                </div>
                <div className="glass-panel p-6 rounded-2xl">
                  <p className="font-label-caps text-label-caps text-secondary mb-2 uppercase">{t('avg_interest')}</p>
                  <p className="font-h2 text-h2 text-primary">3.8%</p>
                </div>
              </div>
            </header>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto scrollbar-hide">
                <button className="bg-primary text-on-primary px-6 py-2 rounded-full font-label-caps text-label-caps whitespace-nowrap">{t('all_vehicles')}</button>
                <button className="bg-surface-container-low text-secondary border border-border-subtle px-6 py-2 rounded-full font-label-caps text-label-caps hover:bg-surface-container transition-colors whitespace-nowrap">{t('electric_hybrid')}</button>
                <button className="bg-surface-container-low text-secondary border border-border-subtle px-6 py-2 rounded-full font-label-caps text-label-caps hover:bg-surface-container transition-colors whitespace-nowrap">{t('performance')}</button>
                <button className="bg-surface-container-low text-secondary border border-border-subtle px-6 py-2 rounded-full font-label-caps text-label-caps hover:bg-surface-container transition-colors whitespace-nowrap">{t('suv')}</button>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-label-caps text-label-caps text-secondary uppercase">{t('sort_by')}</span>
                <select className="bg-surface-container-low border border-border-subtle rounded-lg px-4 py-2 font-label-caps text-label-caps text-primary outline-none">
                  <option>{t('sort_monthly_asc')}</option>
                  <option>{t('sort_power_desc')}</option>
                  <option>{t('sort_availability')}</option>
                </select>
              </div>
            </div>

            {contents.length === 0 ? (
              <div className="glass-panel rounded-2xl p-12 text-center mt-12">
                <p className="text-secondary text-lg font-label-caps uppercase">{t('no_vehicles')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {contents.map((content) => (
                  <ContentCard key={content.id} content={content} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
