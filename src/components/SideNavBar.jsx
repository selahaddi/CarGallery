import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../LanguageContext';
import { useSidebar } from '../SidebarContext';

export default function SideNavBar() {
  const { t } = useLanguage();
  const location = useLocation();
  const { isSidebarOpen, setIsSidebarOpen } = useSidebar();

  const isActive = (path) => location.pathname === path;

  // Lock body scroll when sidebar is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isSidebarOpen]);

  // Close sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <aside className={`fixed left-0 top-0 h-full z-40 flex flex-col py-6 bg-surface-zinc dark:bg-surface-zinc w-64 shadow-xl border-r border-outline-variant/10 transition-transform duration-300 ease-in-out overflow-y-auto overscroll-contain ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="px-6 mb-10 mt-20 flex justify-between items-start">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-white">person</span>
            </div>
            <div>
              <h3 className="font-headline-md text-label-bold text-on-surface">{t('side_fleet_manager')}</h3>
              <p className="text-label-sm text-text-muted">{t('side_company')}</p>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="material-symbols-outlined text-text-muted hover:text-white mt-2 lg:hidden">close</button>
        </div>
        {/* 'Yeni Başvuru' button removed as requested by user */}
        
        <nav className="flex-1 space-y-1">
        <Link 
          to="/dashboard" 
          className={`${isActive('/dashboard') ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:bg-surface-variant/50'} rounded-lg mx-2 my-1 px-4 py-3 flex items-center gap-3 font-label-bold transition-colors`}
        >
          <span className="material-symbols-outlined">dashboard</span> {t('side_dashboard')}
        </Link>
        <Link 
          to="/" 
          className={`${isActive('/') ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:bg-surface-variant/50'} rounded-lg mx-2 my-1 px-4 py-3 flex items-center gap-3 font-label-bold transition-colors`}
        >
          <span className="material-symbols-outlined">directions_car</span> {t('side_inventory')}
        </Link>
        
        {/* 'Hesaplayıcılar' link removed as requested by user */}
        
        <Link 
          to="#" 
          className="text-on-surface-variant hover:bg-surface-variant/50 rounded-lg mx-2 my-1 px-4 py-3 flex items-center gap-3 font-label-bold transition-colors"
        >
          <span className="material-symbols-outlined">description</span> {t('side_applications')}
        </Link>
        <Link 
          to="#" 
          className="text-on-surface-variant hover:bg-surface-variant/50 rounded-lg mx-2 my-1 px-4 py-3 flex items-center gap-3 font-label-bold transition-colors"
        >
          <span className="material-symbols-outlined">history</span> {t('side_history')}
        </Link>
      </nav>
      
      <div className="px-2 pt-6 border-t border-outline-variant/10">
        <Link 
          to="#" 
          className="text-on-surface-variant hover:bg-surface-variant/50 rounded-lg px-4 py-3 flex items-center gap-3 font-label-bold transition-colors"
        >
          <span className="material-symbols-outlined">help</span> {t('side_support')}
        </Link>
        <button 
          className="w-full text-left text-on-surface-variant hover:bg-surface-variant/50 rounded-lg px-4 py-3 flex items-center gap-3 font-label-bold transition-colors"
        >
          <span className="material-symbols-outlined">logout</span> {t('btn_signout')}
        </button>
      </div>
    </aside>
    </>
  );
}
