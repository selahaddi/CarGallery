import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Loader2 } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <>
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="pt-nav-height min-h-screen flex items-center justify-center relative z-10 px-4">
        <div className="w-full max-w-md">
          <div className="glass-panel p-10 sm:p-12 rounded-3xl border-border-subtle shadow-2xl relative overflow-hidden">
            {/* Decorative background glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-indigo/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
            
            <div className="relative z-10">
              <div className="text-center mb-10">
                <div className="w-16 h-16 bg-surface-container-low border border-border-subtle rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <Lock className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-h2 font-h2 text-primary mb-2">
                  {t('login_title')}
                </h2>
                <p className="text-secondary font-label-caps text-label-caps tracking-wide">
                  {t('login_subtitle')}
                </p>
              </div>
              
              <form className="space-y-6" onSubmit={handleLogin}>
                {errorMsg && (
                  <div className="bg-error/10 text-error p-4 rounded-xl text-sm text-center border border-error/20 font-medium">
                    {errorMsg}
                  </div>
                )}
                
                <div className="space-y-5">
                  <div>
                    <label className="block font-label-caps text-label-caps text-secondary mb-2 pl-1" htmlFor="email">
                      {t('login_email_label')}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-secondary/50" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full pl-12 pr-4 py-3.5 border border-border-subtle rounded-xl focus:outline-none focus:border-accent-indigo sm:text-sm bg-surface-container-low text-primary placeholder:text-secondary/40 transition-colors"
                        placeholder="admin@ornek.com"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block font-label-caps text-label-caps text-secondary mb-2 pl-1" htmlFor="password">
                      {t('login_password_label')}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-secondary/50" />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full pl-12 pr-4 py-3.5 border border-border-subtle rounded-xl focus:outline-none focus:border-accent-indigo sm:text-sm bg-surface-container-low text-primary placeholder:text-secondary/40 transition-colors"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl text-on-primary bg-primary hover:bg-secondary focus:outline-none transition-all shadow-lg font-label-caps text-label-caps disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      t('login_btn')
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
