import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import ContentCard from '../components/ContentCard';
import { Loader2, Search } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import ScrollVideoTest from '../components/ScrollVideoTest';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  
  // New States for SaaS features
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  
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
        .eq('status', true); // only fetch active items

      if (error) {
        console.error('Veri çekme hatası:', error);
        setFetchError(`Supabase Hatası (${error.code}): ${error.message}`);
      } else {
        setContents(data || []);
      }
    } catch (err) {
      console.error('Beklenmeyen hata:', err);
      setFetchError(`Sistem Hatası: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort logic
  const filteredContents = useMemo(() => {
    let result = [...contents];

    // Filter by Category
    if (selectedCategory !== 'All') {
      result = result.filter(item => 
        item.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filter by Search Term
    if (searchTerm.trim() !== '') {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(item => 
        item.title?.toLowerCase().includes(lowerSearch) ||
        item.summary?.toLowerCase().includes(lowerSearch) ||
        (item.tags && item.tags.some(tag => tag.toLowerCase().includes(lowerSearch)))
      );
    }

    // Sort
    result.sort((a, b) => {
      // First sort by priority order if exists
      const orderA = a.sort_order ?? 999999;
      const orderB = b.sort_order ?? 999999;
      
      if (orderA !== orderB) {
        return orderA - orderB;
      }

      // Then by selected sort option
      if (sortOption === 'newest') {
        return new Date(b.created_at) - new Date(a.created_at);
      } else if (sortOption === 'oldest') {
        return new Date(a.created_at) - new Date(b.created_at);
      } else if (sortOption === 'az') {
        return (a.title || '').localeCompare(b.title || '');
      } else if (sortOption === 'za') {
        return (b.title || '').localeCompare(a.title || '');
      }
      return 0;
    });

    return result;
  }, [contents, selectedCategory, searchTerm, sortOption]);

  const categories = ['All', 'SUV', 'Sedan', 'Electric', 'Performance'];

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

  return (
    <>
      <ScrollVideoTest />
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="pt-nav-height min-h-screen">
        <div className="rail-system min-h-screen">
          <div className="rail-vertical"></div>

          <div className="px-gutter max-w-container-max mx-auto py-20 relative z-10">
            <header className="mb-16">
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
            </header>

            {/* Advanced Filters & Search */}
            <div className="glass-panel p-6 rounded-2xl mb-12 flex flex-col xl:flex-row gap-6 justify-between items-center z-20 relative">
              
              <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
                <div className="relative w-full sm:w-64">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-secondary" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-border-subtle rounded-xl leading-5 bg-surface-container-low text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-accent-emerald focus:border-accent-emerald transition-colors"
                    placeholder="Search vehicles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-6 py-2 rounded-xl font-label-caps text-label-caps transition-colors whitespace-nowrap border ${
                        selectedCategory === cat 
                          ? 'bg-primary text-on-primary border-primary' 
                          : 'bg-surface-container-low text-secondary border-border-subtle hover:bg-surface-container'
                      }`}
                    >
                      {cat === 'All' ? t('all_vehicles') : cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 w-full xl:w-auto justify-end">
                <span className="font-label-caps text-label-caps text-secondary uppercase">{t('sort_by')}</span>
                <select 
                  className="bg-surface-container-low border border-border-subtle rounded-xl px-4 py-2 font-label-caps text-label-caps text-primary outline-none focus:ring-2 focus:ring-accent-emerald"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                >
                  <option value="newest">En Yeni (Newest)</option>
                  <option value="oldest">En Eski (Oldest)</option>
                  <option value="az">A-Z</option>
                  <option value="za">Z-A</option>
                </select>
              </div>
            </div>

            {filteredContents.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel rounded-2xl p-16 text-center mt-12 flex flex-col items-center justify-center gap-4"
              >
                <Search className="w-12 h-12 text-secondary/50" />
                <p className="text-secondary text-lg font-label-caps uppercase">Arama kriterlerine uygun araç bulunamadı.</p>
                <button 
                  onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
                  className="text-accent-emerald hover:underline font-medium"
                >
                  Filtreleri Temizle
                </button>
              </motion.div>
            ) : (
              <motion.div 
                layout
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
              >
                <AnimatePresence>
                  {filteredContents.map((content) => (
                    <motion.div
                      key={content.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ContentCard content={content} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
