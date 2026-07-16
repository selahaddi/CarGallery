import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useLanguage } from '../LanguageContext';

export default function Navbar() {
  const [session, setSession] = useState(null);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const langDropdownRef = useRef(null);
  const lastScrollY = useRef(0);

  // Scroll event removed as navbar is always visible

  // Close language dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target)) {
        setLangDropdownOpen(false);
      }
    };
    if (langDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [langDropdownOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

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
    <nav 
      className="fixed top-4 md:top-8 left-1/2 -translate-x-1/2 w-[95%] md:w-[90%] max-w-6xl liquid-glass-nav rounded-full transition-all duration-300 ease-in-out translate-y-0 opacity-100 backdrop-blur-lg bg-white/30 shadow-sm"
      style={{ zIndex: 9999 }}
    >
      <div className="flex justify-between items-center px-4 md:px-10 py-2.5 md:py-4 w-full">
        <div className="flex items-center gap-12">
          <Link to="/" className="font-h3 text-h3 tracking-tighter text-primary flex items-center gap-2">
            <span className="w-2 h-2 bg-primary rounded-full hidden sm:block"></span>
            <span className="hidden sm:block">AutoRaten</span>
            <span className="sm:hidden">AR</span>
          </Link>
          <div className="hidden md:flex gap-8">
            <Link 
              to="/" 
              className={`font-body-md text-body-md transition-colors ${isActive('/') ? 'text-primary font-bold border-b border-primary pb-1' : 'text-secondary hover:text-primary'}`}
            >
              {t('nav_showroom')}
            </Link>
            <Link 
              to="/services" 
              className={`font-body-md text-body-md transition-colors ${isActive('/services') ? 'text-primary font-bold border-b border-primary pb-1' : 'text-secondary hover:text-primary'}`}
            >
              {t('nav_services')}
            </Link>
            <Link 
              to="/dashboard" 
              className={`font-body-md text-body-md transition-colors ${isActive('/dashboard') ? 'text-primary font-bold border-b border-primary pb-1' : 'text-secondary hover:text-primary'}`}
            >
              {t('nav_panel')}
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4 sm:gap-6">
          <button className="material-symbols-outlined text-secondary hover:text-primary transition-colors hidden sm:block">search</button>
          
          {/* Language Switcher */}
          <div className="relative" ref={langDropdownRef}>
            <button 
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-border-subtle hover:bg-surface-container-low transition-colors outline-none"
            >
              <span className="material-symbols-outlined text-secondary text-sm">language</span>
              <span className="uppercase text-xs font-label-caps text-label-caps text-primary">{language}</span>
            </button>
            
            {langDropdownOpen && (
              <div className="absolute right-0 mt-2 w-28 rounded-xl bg-surface/90 backdrop-blur-xl border border-border-subtle shadow-xl overflow-hidden z-50">
                <button 
                  onClick={() => { setLanguage('tr'); setLangDropdownOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-sm font-body-md transition-colors ${language === 'tr' ? 'text-primary font-bold bg-surface-container-low' : 'text-secondary hover:bg-surface-container-low'}`}
                >
                  Türkçe
                </button>
                <button 
                  onClick={() => { setLanguage('en'); setLangDropdownOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-sm font-body-md transition-colors ${language === 'en' ? 'text-primary font-bold bg-surface-container-low' : 'text-secondary hover:bg-surface-container-low'}`}
                >
                  English
                </button>
                <button 
                  onClick={() => { setLanguage('de'); setLangDropdownOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-sm font-body-md transition-colors ${language === 'de' ? 'text-primary font-bold bg-surface-container-low' : 'text-secondary hover:bg-surface-container-low'}`}
                >
                  Deutsch
                </button>
              </div>
            )}
          </div>

          {session ? (
            <button onClick={handleSignOut} className="hidden sm:block bg-surface-container-low border border-border-subtle text-primary px-4 py-2 rounded-full font-label-caps text-label-caps hover:bg-surface-container-high active:scale-95 transition-all">
              {t('btn_signout')}
            </button>
          ) : (
            <Link to="/login" className="hidden sm:block">
              <button className="bg-primary text-on-primary px-6 py-2 rounded-full font-label-caps text-label-caps active:scale-95 transition-all hover:bg-secondary">
                {t('btn_signin')}
              </button>
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button 
            className="md:hidden flex items-center justify-center p-2 text-primary focus:outline-none" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="material-symbols-outlined text-2xl">{mobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu with animation */}
      <div 
        className={`md:hidden absolute top-full mt-2 left-0 w-full bg-surface/95 backdrop-blur-xl border border-border-subtle shadow-lg rounded-2xl px-6 flex flex-col gap-6 z-40 overflow-hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? 'max-h-96 py-6 opacity-100' : 'max-h-0 py-0 opacity-0 border-transparent'
        }`}
      >
        <Link 
          to="/" 
          onClick={() => setMobileMenuOpen(false)}
          className={`font-body-md text-lg transition-colors ${isActive('/') ? 'text-primary font-bold' : 'text-secondary'}`}
        >
          {t('nav_showroom')}
        </Link>
        <Link 
          to="/services" 
          onClick={() => setMobileMenuOpen(false)}
          className={`font-body-md text-lg transition-colors ${isActive('/services') ? 'text-primary font-bold' : 'text-secondary'}`}
        >
          {t('nav_services')}
        </Link>
        <Link 
          to="/dashboard" 
          onClick={() => setMobileMenuOpen(false)}
          className={`font-body-md text-lg transition-colors ${isActive('/dashboard') ? 'text-primary font-bold' : 'text-secondary'}`}
        >
          {t('nav_panel')}
        </Link>
        <hr className="border-border-subtle" />
        {session ? (
           <button onClick={() => { handleSignOut(); setMobileMenuOpen(false); }} className="text-left font-body-md text-lg text-primary transition-colors">
             {t('btn_signout')}
           </button>
        ) : (
           <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="font-body-md text-lg text-primary font-bold transition-colors">
             {t('btn_signin')}
           </Link>
        )}
      </div>
    </nav>
  );
}
