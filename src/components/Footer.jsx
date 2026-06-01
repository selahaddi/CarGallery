import React from 'react';
import { useLanguage } from '../LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-panel-bg border-t border-border-subtle">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 py-12 px-gutter max-w-container-max mx-auto">
        <div className="md:col-span-4">
          <div className="font-h3 text-h3 text-primary mb-4">Dortmund Fleet Finance</div>
          <p className="font-label-caps text-label-caps text-secondary">© 2024 Dortmund Fleet Finance. Technical precision in mobility.</p>
        </div>
        <div className="md:col-span-8 flex flex-wrap gap-8 md:justify-end mt-8 md:mt-0">
          <a href="#" className="font-label-caps text-label-caps text-secondary hover:text-primary transition-opacity">
            {t('terms_of_use')}
          </a>
          <a href="#" className="font-label-caps text-label-caps text-secondary hover:text-primary transition-opacity">
            {t('privacy_policy')}
          </a>
          <a href="#" className="font-label-caps text-label-caps text-secondary hover:text-primary transition-opacity">
            {t('legal_notice')}
          </a>
          <a href="#" className="font-label-caps text-label-caps text-secondary hover:text-primary transition-opacity font-bold">
            {t('imprint')}
          </a>
        </div>
      </div>
    </footer>
  );
}
