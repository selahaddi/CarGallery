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
    <Link to={itemUrl} className="block group cursor-pointer">
      <div className="glass-panel rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl relative border border-border-subtle group-hover:border-primary/20">
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          {content.status ? (
            <div className="bg-surface/80 backdrop-blur-md px-3 py-1 rounded-full border border-border-subtle text-label-caps font-label-caps text-primary shadow-sm uppercase">
              {t('card_immediate')}
            </div>
          ) : (
            <div className="bg-error/90 backdrop-blur-md px-3 py-1 rounded-full border border-error text-label-caps font-label-caps text-on-error shadow-sm uppercase">
              {t('card_sold')}
            </div>
          )}
        </div>
        <div className="aspect-[4/3] bg-surface-container-low relative overflow-hidden">
          <img 
            alt={content.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
            src={imageUrl} 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
            <button className="w-full bg-white text-primary py-3 rounded-lg font-label-caps text-label-caps hover:bg-surface-container transition-colors uppercase">
              {t('card_configure')}
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-h3 text-2xl sm:text-h3 text-primary mb-1 line-clamp-1">{content.title}</h3>
              <p className="font-body-md text-body-md text-secondary truncate">
                {content.year || ''} {content.year && content.mileage ? '•' : ''} {content.mileage ? `${formatNumber(content.mileage)} km` : ''} {content.category ? `• ${content.category}` : ''}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 py-4 border-y border-border-subtle">
            <div>
              <p className="font-label-caps text-label-caps text-secondary mb-1 uppercase">{t('card_rate')}</p>
              <p className="font-h3 text-2xl text-primary">{content.monthly_rate ? `€${formatNumber(content.monthly_rate)}` : '-'}</p>
            </div>
            <div>
              <p className="font-label-caps text-label-caps text-secondary mb-1 uppercase">{t('card_down')}</p>
              <p className="font-h3 text-2xl text-primary">{content.down_payment ? `€${formatNumber(content.down_payment)}` : '-'}</p>
            </div>
          </div>
          <div className="mt-4 flex justify-between items-center">
            <p className="font-label-caps text-label-caps text-secondary uppercase">
              {t('card_term')}: {content.term_months ? `${content.term_months} ${t('card_months')}` : t('card_ask')}
            </p>
            <div className="flex items-center gap-1 text-primary">
              <span className="font-label-caps text-label-caps uppercase">{t('card_configure')}</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
