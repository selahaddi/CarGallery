import React from 'react';
import { useLanguage } from '../LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="w-full py-12 px-gutter flex flex-col md:flex-row justify-between items-center max-w-container-max mx-auto mt-section-gap border-t border-outline-variant/20 bg-background-deep z-10 relative">
      <div className="mb-8 md:mb-0 text-center md:text-left">
        <div className="text-label-bold font-label-bold text-primary mb-2">
          {t('brand_name')}
        </div>
        <p className="text-text-muted text-xs max-w-xs mx-auto md:mx-0 uppercase">
          {t('footer_rights')}
        </p>
      </div>
      
      <div className="flex flex-wrap justify-center gap-6 md:gap-8">
        <a href="#" className="text-text-muted hover:text-primary transition-colors text-label-sm font-label-sm uppercase">
          {t('legal_notice')}
        </a>
        <a href="#" className="text-text-muted hover:text-primary transition-colors text-label-sm font-label-sm uppercase">
          {t('privacy_policy')}
        </a>
        <a href="#" className="text-text-muted hover:text-primary transition-colors text-label-sm font-label-sm uppercase">
          {t('terms_of_use')}
        </a>
        <a href="#" className="text-text-muted hover:text-primary transition-colors text-label-sm font-label-sm uppercase">
          {t('imprint')}
        </a>
      </div>

      <div className="mt-8 md:mt-0 flex gap-4">
        <a href="#" className="w-10 h-10 rounded-full glass-card flex items-center justify-center hover:bg-primary-container transition-all cursor-pointer group">
          <span className="material-symbols-outlined text-text-muted group-hover:text-white transition-colors">language</span>
        </a>
        <a href="#" className="w-10 h-10 rounded-full glass-card flex items-center justify-center hover:bg-primary-container transition-all cursor-pointer group">
          <span className="material-symbols-outlined text-text-muted group-hover:text-white transition-colors">share</span>
        </a>
      </div>
    </footer>
  );
}
