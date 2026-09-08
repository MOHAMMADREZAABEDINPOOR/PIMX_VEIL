/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, CSSProperties } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  ShieldCheck,
  Terminal, 
  Cpu, 
  Database, 
  Languages, 
  Sun, 
  Moon, 
  ExternalLink,
  Lock,
  Compass,
  FileDown,
  FilePlus,
  RefreshCw,
  Info,
  ChevronDown,
  Check,
  Github,
  Mail,
  Send
} from 'lucide-react';

import { AppLanguage, AppTab, AppTheme, CryptoLog } from './types';
import { TRANSLATIONS, RTL_LANGUAGES } from './utils/i18n';
import Splash from './components/Splash';
import Flowchart from './components/Flowchart';
import EncryptPane from './components/EncryptPane';
import DecryptPane from './components/DecryptPane';
import { tracker } from './utils/tracker';
import AdminPanel from './components/AdminPanel';

const LANGUAGE_NAMES: Record<AppLanguage, string> = {
  en: 'English',
  fa: 'فارسی',
  ar: 'العربية',
  de: 'Deutsch',
  fr: 'Français',
  it: 'Italiano',
  zh: '简体中文',
  ru: 'Русский',
  el: 'Ελληνικά',
  la: 'Latina'
};

const LANGUAGE_FONTS: Record<AppLanguage, string> = {
  en: '"Plus Jakarta Sans", sans-serif',
  fa: '"Vazirmatn", sans-serif',
  ar: '"Vazirmatn", sans-serif',
  de: '"Plus Jakarta Sans", sans-serif',
  fr: '"Plus Jakarta Sans", sans-serif',
  it: '"Plus Jakarta Sans", sans-serif',
  zh: '"Plus Jakarta Sans", sans-serif',
  ru: '"Plus Jakarta Sans", sans-serif',
  el: '"Plus Jakarta Sans", sans-serif',
  la: '"Plus Jakarta Sans", sans-serif'
};

const PRIVACY_NOTICES: Record<AppLanguage, { notice: string; desc: string }> = {
  en: {
    notice: "100% Secure & Server-Free Assurance (No Data Stored)",
    desc: "Absolutely none of your information, files, passwords, or activities are ever uploaded, saved, or stored on any host or server. All cryptography runs strictly offline and locally inside your browser's RAM memory."
  },
  fa: {
    notice: "امنیت ۱۰۰٪ تضمین شده؛ هیچ اطلاعاتی از شما ذخیره نمی‌شود",
    desc: "ما هیچ‌گونه اطلاعاتی از شما را در هاست یا سرور ذخیره نمی‌کنیم. تمامی فایل‌ها، پسوردها و فرآیندهای رمزنگاری به صورت کاملاً آفلاین و داخلی درون مرورگر دستگاه خودتان انجام شده و هیچ داده‌ای از محیط دستگاه شما خارج نمی‌شود."
  },
  ar: {
    notice: "أمان محلي ١٠٠٪ وضمان عدم حفظ البيانات",
    desc: "لا يتم رفع أو تخزين أي ملفات أو كلمات مرور أو أنشطة على أي خادم على الإطلاق. تتم جميع العمليات التشفيرية محلياً وأوفلاين بالكامل داخل ذاكرة RAM لمتصفحك."
  },
  de: {
    notice: "100% Offline-Sicherheitsgarantie",
    desc: "Keine Ihrer Dateien, Passwörter oder Aktivitäten werden jemals auf einen Server hochgeladen oder gespeichert. Alle Kryptographie-Prozesse laufen lokal im RAM Ihres Browsers ab."
  },
  fr: {
    notice: "Garantie de Sécurité 100% Côté Client",
    desc: "Aucun de vos fichiers, mots de passe ou activités n'est envoyé ou stocké sur un serveur. Tous les calculs s'effectuent localement dans la mémoire RAM de votre navigateur."
  },
  it: {
    notice: "Garanzia di Sicurezza 100% Lato Client",
    desc: "Nessuno dei tuoi file, password o attività viene caricato o salvato su un server. Tutte le operazioni crittografiche avvengono localmente nella memoria RAM del browser."
  },
  zh: {
    notice: "100% 本地客端纯净安全保证",
    desc: "您的任何文件、密码或行为均绝对不会上传或存储到任何服务器。所有密码学和隐写处理均在您本地浏览器的内存中完全离线运行。"
  },
  ru: {
    notice: "100% Гарантия безопасности на клиенте",
    desc: "Ни один из ваших файлов, паролей или действий никогда не отправляется на сервер и не сохраняется. Все криптографические процессы выполняются локально в оперативной памяти вашего браузера."
  },
  el: {
    notice: "100% Εγγύηση Ασφάλειας & Μηδενικής Αποθήκευσης",
    desc: "Κανένα από τα αρχεία, τους κωδικούς ή τις δραστηριότητές σας δεν μεταφορτώνεται ή αποθηκεύεται σε διακομιστή. Όλη η κρυπτογράφηση εκτελείται τοπικά στη μνήμη RAM του προγράμματος περιήγησής σας."
  },
  la: {
    notice: "Fides 100% Tutelae Localis et Privatae",
    desc: "Nihil ex tuis scriptis, tesseris vel operibus in ullum serverum mittitur aut servatur. Integra cryptographia tantum in tui navigatri RAM memoria offline peragitur."
  }
};

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  
  const [lang, setLang] = useState<AppLanguage>(() => {
    const saved = localStorage.getItem('aegiscrypt_lang') as AppLanguage;
    if (saved && ['en', 'fa', 'ar', 'de', 'fr', 'it', 'zh', 'ru', 'el', 'la'].includes(saved)) {
      return saved;
    }
    return 'en';
  });

  const [theme, setTheme] = useState<AppTheme>(() => {
    const saved = localStorage.getItem('aegiscrypt_theme') as AppTheme;
    if (saved && ['dark', 'light'].includes(saved)) {
      return saved;
    }
    // Default theme based on current user time (light between 6:00 and 18:00)
    const hour = new Date().getHours();
    return (hour >= 6 && hour < 18) ? 'light' : 'dark';
  });

  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [globalLogs, setGlobalLogs] = useState<CryptoLog[]>([]);
  const [currentPath, setCurrentPath] = useState(() => {
    return typeof window !== 'undefined' ? window.location.pathname : '/';
  });

  // Track visit on mount
  useEffect(() => {
    tracker.trackVisit();
  }, []);

  // Sync client-side route popstate changes
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Toggles the dark/light modes on body or outer shell
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.backgroundColor = '#020202';
    } else {
      root.classList.remove('dark');
      root.style.backgroundColor = '#f9f9fb';
    }
    localStorage.setItem('aegiscrypt_theme', theme);
  }, [theme]);

  // Sync lang to localStorage
  useEffect(() => {
    localStorage.setItem('aegiscrypt_lang', lang);
  }, [lang]);

  const t = TRANSLATIONS[lang];
  const isRtl = RTL_LANGUAGES.has(lang);

  // Appends localized system level telemetry
  const appendGlobalLog = (log: CryptoLog) => {
    setGlobalLogs(prev => [log, ...prev].slice(0, 100)); // limit 100 entries
    if (log.type === 'success') {
      tracker.trackTest(); // Log a test run whenever a process succeeds
    }
  };

  const clearGlobalSession = () => {
    setGlobalLogs([]);
    appendGlobalLog({
      timestamp: new Date().toISOString().split('T')[1].substring(0, 8),
      type: 'warning',
      message: 'Secure cache system scrubbed.'
    });
  };

  if (showSplash) {
    return <Splash lang={lang} theme={theme} onComplete={() => setShowSplash(false)} />;
  }

  const dynamicStyle = {
    '--font-sans': lang === 'fa' || lang === 'ar' 
      ? '"Vazirmatn", sans-serif' 
      : '"Plus Jakarta Sans", sans-serif',
    '--font-display': lang === 'fa' || lang === 'ar' 
      ? '"Vazirmatn", sans-serif' 
      : '"Space Grotesk", sans-serif',
  } as CSSProperties;

  return (
    <div 
      dir={isRtl ? 'rtl' : 'ltr'} 
      style={dynamicStyle}
      className={`min-h-screen text-gray-950 dark:text-zinc-100 font-sans transition-colors duration-300 relative ${
        theme === 'dark' ? 'bg-[#030303]' : 'bg-slate-50/50'
      }`}
    >
      {/* Tactical visual scanline pattern grid */}
      {theme === 'dark' && (
        <div className="fixed inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.2)_50%)] bg-[size:100%_4px] pointer-events-none opacity-[0.15] z-40" />
      )}

      {/* Decorative High-Tech glowing backdrop mesh */}
      <div className="absolute top-0 inset-x-0 h-[600px] bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.08),transparent_65%)] pointer-events-none" />

      {/* Main Container Workspace */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 relative z-10">
        
        {/* Sleek Floating Header */}
        <header className="flex flex-row justify-between items-center gap-2 border-b border-zinc-100 dark:border-zinc-900 pb-6 w-full">
          <div className="flex items-center">
            <div>
              <div className="flex flex-wrap items-center">
                <h1 className="text-2xl sm:text-3xl font-black font-display tracking-[0.1em] sm:tracking-[0.28em] text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 dark:from-emerald-400 dark:via-cyan-400 dark:to-emerald-300 uppercase select-none pb-1">
                  {t.appName}
                </h1>
              </div>
            </div>
          </div>

          {/* Quick Utility controls (Language selector & theme switch) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Designed Custom Dynamic Language Selector Dropdown */}
            <div className="relative">
              <button
                id="custom-language-selector-trigger"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-2 bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 px-2.5 sm:px-3 shadow-xs hover:border-zinc-350 dark:hover:border-zinc-700 transition cursor-pointer select-none text-xs font-semibold text-gray-800 dark:text-zinc-200"
                style={{ fontFamily: LANGUAGE_FONTS[lang] }}
              >
                <Languages className="w-4 h-4 text-zinc-400 shrink-0" />
                <span className="hidden sm:inline truncate">{LANGUAGE_NAMES[lang]}</span>
                <span className="inline sm:hidden uppercase font-mono font-bold text-[10px] tracking-wide shrink-0">{lang}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 shrink-0 transition-transform duration-250 ${langDropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
              </button>

              {langDropdownOpen && (
                <div 
                  className="fixed inset-0 z-40 bg-transparent" 
                  onClick={() => setLangDropdownOpen(false)} 
                />
              )}

              <AnimatePresence>
                {langDropdownOpen && (
                  <motion.div
                    key="language-menu-dropdown-floating"
                    initial={{ opacity: 0, scale: 0.95, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 rtl:left-0 mt-2 w-[160px] rounded-xl border border-zinc-200 dark:border-zinc-850 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md p-1.5 shadow-xl z-50 focus:outline-none flex flex-col gap-0.5 select-none"
                  >
                    <div className="px-2 py-1 border-b border-zinc-100 dark:border-zinc-900 mb-0.5">
                      <span className="text-[9px] font-bold tracking-wider font-mono text-zinc-400 dark:text-zinc-500 uppercase">
                        SELECT LANG
                      </span>
                    </div>
                    
                    {Object.entries(LANGUAGE_NAMES).map(([code, name]) => {
                      const isSelected = lang === code;
                      return (
                        <button
                          key={code}
                          onClick={() => {
                            setLang(code as AppLanguage);
                            setLangDropdownOpen(false);
                            appendGlobalLog({
                              timestamp: new Date().toISOString().split('T')[1].substring(0, 8),
                              type: 'info',
                              message: `Language profile switched to ${LANGUAGE_NAMES[code as AppLanguage]}`
                            });
                          }}
                          className={`w-full flex items-center justify-between p-1.5 px-2 rounded-lg text-left rtl:text-right cursor-pointer group transition-all text-xs ${
                            isSelected 
                              ? 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold' 
                              : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900/60'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span 
                              className="text-xs font-medium transition-transform group-hover:scale-102 truncate"
                              style={{ fontFamily: LANGUAGE_FONTS[code as AppLanguage] }}
                            >
                              {name}
                            </span>
                            <span className="text-[8px] font-mono font-medium opacity-40 px-0.5 py-0.2 border border-zinc-250 dark:border-zinc-800 rounded bg-zinc-50 dark:bg-zinc-900 group-hover:opacity-100 transition-opacity">
                              {code.toUpperCase()}
                            </span>
                          </div>
                          {isSelected && (
                            <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Dark & Light toggle */}
            <button
              id="theme-toggler"
              onClick={() => {
                setTheme(theme === 'dark' ? 'light' : 'dark');
                appendGlobalLog({
                  timestamp: new Date().toISOString().split('T')[1].substring(0, 8),
                  type: 'info',
                  message: `Visual theme modified to ${theme === 'dark' ? 'LIGHT_RECON' : 'DARK_OBSIDIAN'}`
                });
              }}
              className="p-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 rounded-xl text-gray-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition cursor-pointer shadow-xs"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-zinc-650" />}
            </button>
          </div>
        </header>

        {/* Unified Application View Flow */}
        {currentPath === '/pimxveiladmin' || currentPath === '/pimxveiladmin/' ? (
          <main className="flex-1 min-h-[500px]">
            <AdminPanel 
              lang={lang} 
              onExit={() => {
                window.history.pushState({}, '', '/');
                setCurrentPath('/');
              }}
            />
          </main>
        ) : (
          <>
            {/* Tactical Interactive Tab Navigator */}
            <div className="flex justify-center select-none">
              <nav className="relative flex p-1.5 bg-zinc-200/50 dark:bg-zinc-900/40 backdrop-blur-md border border-zinc-250 dark:border-zinc-800/80 rounded-2xl w-full max-w-lg shadow-xs">
                {['home', 'encrypt', 'decrypt'].map((tab) => {
                  const isActive = activeTab === tab;
                  const label = tab === 'home' ? t.tabHome : tab === 'encrypt' ? t.tabEncrypt : t.tabDecrypt;
                  
                  return (
                    <button
                      key={tab}
                      id={`tab-${tab}`}
                      onClick={() => {
                        setActiveTab(tab as AppTab);
                        appendGlobalLog({
                          timestamp: new Date().toISOString().split('T')[1].substring(0, 8),
                          type: 'info',
                          message: `Active workspace routed to node: [${tab.toUpperCase()}]`
                        });
                      }}
                      className={`relative flex-1 py-2.5 rounded-xl text-xs font-bold font-display uppercase tracking-wider transition-all duration-300 select-none text-center flex items-center justify-center gap-1.5 z-10 cursor-pointer ${
                        isActive 
                          ? 'text-emerald-900 dark:text-emerald-300 font-black' 
                          : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-350'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeTabPill"
                          className="absolute inset-0 bg-white dark:bg-[#0e0e0f] border border-zinc-300/40 dark:border-zinc-800/80 rounded-xl shadow-xs -z-10"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                      {tab === 'home' && <Compass className="w-4 h-4 shrink-0" />}
                      {tab === 'encrypt' && <FilePlus className="w-4 h-4 shrink-0" />}
                      {tab === 'decrypt' && <FileDown className="w-4 h-4 shrink-0" />}
                      <span>{label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Zero Retention Secure Shield Banner */}
            <div className="my-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent dark:from-emerald-950/20 dark:via-emerald-950/5 dark:to-transparent border border-emerald-500/20 dark:border-emerald-500/10 flex items-start gap-3.5 shadow-2xs">
              <div className="p-2 bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-xs font-bold font-display uppercase tracking-wider text-emerald-800 dark:text-emerald-350">
                    {PRIVACY_NOTICES[lang as AppLanguage]?.notice || PRIVACY_NOTICES['en'].notice}
                  </h4>
                  <span className="text-[9px] font-mono tracking-widest uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/15 px-1.5 py-0.2 rounded font-black select-none">
                    {t.badgePrivate}
                  </span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mt-1 font-medium">
                  {PRIVACY_NOTICES[lang as AppLanguage]?.desc || PRIVACY_NOTICES['en'].desc}
                </p>
              </div>
            </div>

            {/* Main Workspace Dynamic Sub-frame */}
            <main className="flex-1 min-h-[500px]">
              <AnimatePresence mode="wait">
                {activeTab === 'home' && (
                  <motion.div
                    key="home"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="flex flex-col gap-6"
                  >
                    {/* Visual Pipeline flow map */}
                    <div className="bg-white dark:bg-[#080809] rounded-2xl p-6 shadow-xs">
                      <Flowchart t={t} isRtl={isRtl} />
                    </div>

                    {/* Secure Mission Warning Box */}
                    <section className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/2 dark:bg-amber-950/2 backdrop-blur-xs select-text flex flex-col sm:flex-row gap-4.5 items-start sm:items-center">
                      <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-500 border border-amber-500/20 rounded-xl shrink-0">
                        <Info className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold tracking-widest font-mono text-amber-700 dark:text-amber-400 uppercase select-none">
                          {t.secureDeploymentProtocol}
                        </h5>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mt-1">
                          {t.missionStatement}
                        </p>
                      </div>
                    </section>

                    {/* Spec details cards grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Item 1 */}
                      <div className="bg-white dark:bg-[#080809] p-6 rounded-2xl flex flex-col gap-3 transition shadow-xs group">
                        <div className="p-2.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/10 rounded-xl w-fit group-hover:scale-105 transition-transform">
                          <Lock className="w-5 h-5" />
                        </div>
                        <h4 className="text-xs font-bold tracking-widest font-display uppercase text-gray-900 dark:text-zinc-200">
                          {t.card1Title}
                        </h4>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-sans">
                          {t.card1Desc}
                        </p>
                      </div>

                      {/* Item 2 */}
                      <div className="bg-white dark:bg-[#080809] p-6 rounded-2xl flex flex-col gap-3 transition shadow-xs group">
                        <div className="p-2.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/10 rounded-xl w-fit group-hover:scale-105 transition-transform">
                          <Cpu className="w-5 h-5" />
                        </div>
                        <h4 className="text-xs font-bold tracking-widest font-display uppercase text-gray-900 dark:text-zinc-200">
                          {t.card2Title}
                        </h4>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-sans">
                          {t.card2Desc}
                        </p>
                      </div>

                      {/* Item 3 */}
                      <div className="bg-white dark:bg-[#080809] p-6 rounded-2xl flex flex-col gap-3 transition shadow-xs group">
                        <div className="p-2.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/10 rounded-xl w-fit group-hover:scale-105 transition-transform">
                          <Terminal className="w-5 h-5" />
                        </div>
                        <h4 className="text-xs font-bold tracking-widest font-display uppercase text-gray-900 dark:text-zinc-200">
                          {t.card3Title}
                        </h4>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-sans">
                          {t.card3Desc}
                        </p>
                      </div>

                    </div>
                  </motion.div>
                )}

                {activeTab === 'encrypt' && (
                  <motion.div
                    key="encrypt"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.25 }}
                  >
                    <EncryptPane 
                      lang={lang} 
                      onLogged={appendGlobalLog} 
                      onClearSession={clearGlobalSession} 
                    />
                  </motion.div>
                )}

                {activeTab === 'decrypt' && (
                  <motion.div
                    key="decrypt"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.25 }}
                  >
                    <DecryptPane 
                      lang={lang} 
                      onLogged={appendGlobalLog} 
                      onClearSession={clearGlobalSession} 
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </main>
          </>
        )}

         {/* Global Security Node Status footer */}
        <footer className="border-t border-zinc-100 dark:border-zinc-900 pt-6 mt-6 flex flex-col gap-6 select-text text-zinc-500 dark:text-zinc-400 font-mono text-[10px]">
          {/* Top segment: telemetry indicators */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2 text-center md:text-left select-none">
              <span className="flex items-center gap-1.5 justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 block animate-pulse" />
                {t.footerEngine}
              </span>
              <span className="hidden md:inline text-zinc-200 dark:text-zinc-800">|</span>
              <span>{t.footerPersist}</span>
              <span className="hidden md:inline text-zinc-200 dark:text-zinc-800">|</span>
              <span>{t.footerKdf}</span>
            </div>

            <div className="flex items-center gap-1.5 text-zinc-650 dark:text-zinc-500 text-center md:text-right select-none">
              <span>{t.footerDispatch}</span>
              <ExternalLink className="w-3 h-3 opacity-55 hover:opacity-100 transition shrink-0" />
            </div>
          </div>

          {/* Bottom segment: Custom Dynamic Copyright & Owner Credentials */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-t border-zinc-100/50 dark:border-zinc-900/40 pt-4 select-text">
            <div className="flex items-center gap-2 text-zinc-650 dark:text-zinc-400 text-center md:text-left">
              <span 
                className="font-sans text-xs font-semibold text-gray-800 dark:text-zinc-300" 
                dir={['fa', 'ar'].includes(lang) ? 'rtl' : 'ltr'}
              >
                {t.copyright}
              </span>
            </div>

            {/* Social credentials array */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono">
              <a
                href="https://github.com/MOHAMMADREZAABEDINPOOR"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
                title="GitHub Repository"
              >
                <Github className="w-3.5 h-3.5" />
                <span className="text-[10px] font-medium hidden sm:inline">GitHub</span>
              </a>

              <span className="text-zinc-200 dark:text-zinc-800">|</span>

              <a
                href="https://t.me/Pleasechangetheworld"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors animate-pulse"
                title="Telegram Support"
              >
                <Send className="w-3.5 h-3.5 rotate-[-25deg]" />
                <span className="text-[10px] font-medium">@Pleasechangetheworld</span>
              </a>

              <span className="text-zinc-200 dark:text-zinc-800">|</span>

              <a
                href="mailto:mohammadrezaabedinpoor6@gmail.com"
                className="flex items-center gap-1.5 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
                title="Email Address"
              >
                <Mail className="w-3.5 h-3.5" />
                <span className="text-[10px] font-medium lowercase">mohammadrezaabedinpoor6@gmail.com</span>
              </a>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
