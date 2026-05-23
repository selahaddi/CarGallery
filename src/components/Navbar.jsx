import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useEffect, useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { useSidebar } from '../SidebarContext';

export default function Navbar() {
  const [session, setSession] = useState(null);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { toggleSidebar } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 w-full z-50 bg-surface/70 backdrop-blur-md dark:bg-surface/70 border-b border-outline-variant/10 flex justify-between items-center px-gutter h-20 max-w-container-max mx-auto left-1/2 -translate-x-1/2">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-4">
          <button onClick={toggleSidebar} className="material-symbols-outlined text-on-surface hover:text-primary transition-colors text-2xl">
            menu
          </button>
          <Link to="/" className="text-headline-md font-headline-md font-black tracking-tighter text-primary dark:text-primary hover:opacity-80 transition-opacity hidden sm:block">
            {t('brand_name')}
          </Link>
        </div>
        <div className="hidden md:flex gap-6">
          <Link to="/services" className={`${isActive('/services') ? 'text-primary font-bold border-b-2 border-primary pb-1' : 'text-on-surface-variant font-medium hover:text-primary transition-colors duration-200'}`}>
            {t('services_title')}
          </Link>
          <Link to="/" className={`${isActive('/') ? 'text-primary font-bold border-b-2 border-primary pb-1' : 'text-on-surface-variant font-medium hover:text-primary transition-colors duration-200'}`}>
            {t('nav_showroom')}
          </Link>
          <Link to="/dashboard" className={`${isActive('/dashboard') ? 'text-primary font-bold border-b-2 border-primary pb-1' : 'text-on-surface-variant font-medium hover:text-primary transition-colors duration-200'}`}>
            {t('nav_panel')}
          </Link>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex bg-surface-container-high rounded-lg px-4 py-2 items-center gap-2 border border-outline-variant/20">
          <span className="material-symbols-outlined text-text-muted">search</span>
          <input 
            className="bg-transparent border-none focus:ring-0 text-label-bold font-label-bold text-on-surface placeholder:text-text-muted w-32 lg:w-48 outline-none" 
            placeholder={t('search_placeholder')} 
            type="text"
          />
        </div>

        <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-all hidden md:block">notifications</button>
        <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-all hidden md:block">settings</button>

        {/* Language Switcher */}
        <div className="relative">
          <button 
            onClick={() => setLangDropdownOpen(!langDropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container-high/40 border border-outline-variant/15 text-label-bold font-label-bold text-on-surface hover:bg-surface-container-high/70 active:scale-95 transition-all outline-none"
          >
            <span className="material-symbols-outlined text-text-muted text-lg">language</span>
            <span className="uppercase text-sm">{language}</span>
            <span className="material-symbols-outlined text-xs text-text-muted">keyboard_arrow_down</span>
          </button>
          
          {langDropdownOpen && (
            <div className="absolute right-0 mt-2 w-28 rounded-xl bg-surface/90 backdrop-blur-xl border border-outline-variant/20 shadow-xl overflow-hidden z-50">
              <button 
                onClick={() => { setLanguage('tr'); setLangDropdownOpen(false); }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-primary-container/20 transition-colors ${language === 'tr' ? 'text-primary font-bold' : 'text-on-surface-variant'}`}
              >
                Türkçe
              </button>
              <button 
                onClick={() => { setLanguage('en'); setLangDropdownOpen(false); }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-primary-container/20 transition-colors ${language === 'en' ? 'text-primary font-bold' : 'text-on-surface-variant'}`}
              >
                English
              </button>
              <button 
                onClick={() => { setLanguage('de'); setLangDropdownOpen(false); }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-primary-container/20 transition-colors ${language === 'de' ? 'text-primary font-bold' : 'text-on-surface-variant'}`}
              >
                Deutsch
              </button>
            </div>
          )}
        </div>

        {session ? (
          <button onClick={handleSignOut} className="bg-surface-variant text-on-surface-variant px-6 py-2 rounded-lg font-label-bold text-label-bold hover:opacity-80 active:scale-95 transition-all">
            {t('btn_signout')}
          </button>
        ) : (
          <Link to="/login">
            <button className="bg-primary-container text-on-primary-container px-6 py-2 rounded-lg font-label-bold text-label-bold hover:opacity-80 active:scale-95 transition-all">
              {t('btn_signin')}
            </button>
          </Link>
        )}
      </div>
    </nav>
  );
}
