import { Link } from 'react-router-dom';
import { useLanguage } from '../LanguageContext';

export default function ContentCard({ content }) {
  const { language, t } = useLanguage();
  const imageUrl = content.image_url || (content.images && content.images.length > 0 ? content.images[0] : 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?q=80&w=800&auto=format&fit=crop');
  const itemUrl = `/icerik/${content.slug || content.id}`;

  const formatNumber = (num) => {
    if (num === null || num === undefined) return '';
    const parsed = parseFloat(num);
    if (isNaN(parsed)) return num;
    const localeMap = { tr: 'tr-TR', en: 'en-US', de: 'de-DE' };
    return parsed.toLocaleString(localeMap[language] || 'tr-TR');
  };

  return (
    <div className="glass-card rounded-xl overflow-hidden group hover:-translate-y-2 transition-all duration-300 active-red-glow">
      <div className="relative h-64 overflow-hidden">
        <Link to={itemUrl} className="block w-full h-full">
          <img 
            src={imageUrl} 
            alt={content.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </Link>
        <div className="absolute top-4 right-4 flex flex-col gap-2 pointer-events-none">
          {content.monthly_rate && (
            <div className="bg-primary-container text-white px-4 py-1 rounded-full text-label-bold font-label-bold shadow-lg">
              {t('card_rate')}: {formatNumber(content.monthly_rate)}€ <span className="text-[10px]">/ {t('card_months').toLowerCase()}</span>
            </div>
          )}
          {content.down_payment && (
            <div className="bg-black/80 backdrop-blur-md text-on-surface px-4 py-1 rounded-full text-label-bold font-label-bold border border-outline-variant/20">
              {t('card_down')}: {formatNumber(content.down_payment)}€
            </div>
          )}
        </div>
        {!content.status ? (
          <div className="absolute bottom-4 left-4">
            <span className="bg-red-500/80 backdrop-blur-sm text-white text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded">
              {t('card_sold')}
            </span>
          </div>
        ) : (
          <div className="absolute bottom-4 left-4">
            <span className="bg-white/10 backdrop-blur-sm text-white text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded">
              {t('card_immediate')}
            </span>
          </div>
        )}
      </div>
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-headline-md font-headline-md text-on-surface group-hover:text-primary-container transition-colors line-clamp-1">
              <Link to={itemUrl}>{content.title}</Link>
            </h2>
            <p className="text-label-sm text-text-muted uppercase tracking-wider">
              {content.category} {content.year && `• ${content.year}`} {content.mileage && `• ${formatNumber(content.mileage)} km`}
            </p>
          </div>
          <button className="material-symbols-outlined text-text-muted hover:text-primary-container transition-colors">favorite</button>
        </div>
        
        <div className="grid grid-cols-2 gap-4 py-4 border-y border-outline-variant/10">
          <div>
            <p className="text-[10px] text-text-muted uppercase">{t('card_term')}</p>
            <p className="text-on-surface font-label-bold">{content.term_months ? `${content.term_months} ${t('card_months')}` : t('card_ask')}</p>
          </div>
          <div>
            <p className="text-[10px] text-text-muted uppercase">{t('card_interest')}</p>
            <p className="text-on-surface font-label-bold">{content.interest_rate ? `${formatNumber(content.interest_rate)}% ${t('card_fixed')}` : t('card_ask')}</p>
          </div>
        </div>
        
        <div className="mt-6 flex gap-3">
          <Link to={itemUrl} className="flex-1 bg-primary-container text-white py-3 rounded-lg font-label-bold hover:bg-accent-red-bright transition-colors text-center inline-block">
            {t('card_configure')}
          </Link>
          <div className="w-12 h-12 flex items-center justify-center rounded-lg border border-outline-variant/30 text-on-surface hover:bg-surface-variant transition-colors cursor-pointer group-hover:border-primary-container">
            <span className="material-symbols-outlined">analytics</span>
          </div>
        </div>
      </div>
    </div>
  );
}
