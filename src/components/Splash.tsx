/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, Shield, Cpu, Lock } from 'lucide-react';
import { AppLanguage, AppTheme } from '../types';

interface SplashProps {
  onComplete: () => void;
  lang: AppLanguage;
  theme: AppTheme;
}

interface LocalizationSplash {
  header: string;
  status: string;
  title: string;
  compliance: string;
  sandbox: string;
  version: string;
  logs: string[];
}

const SPLASH_TRANSLATIONS: Record<AppLanguage, LocalizationSplash> = {
  en: {
    header: "PIMXVEIL // SEC_VAULT_NODE",
    status: "ONLINE",
    title: "SYNTHESIZING MATRIX BUFFERS...",
    compliance: "FIPS 140-3 COMPLIANT",
    sandbox: "RAM ISOLATED SANDBOX [VOLATILE]",
    version: "VER 2.5_PRO",
    logs: [
      'INITIALIZING PIMXVEIL CORE VAULT ENGINE...',
      'ISOLATING VOLATILE BROWSER RAM...',
      'LOADING HIGH-ENTROPY CRYPTOGRAPHIC PROVIDERS...',
      'CHECKING WEB CRYPTO API CAPABILITIES... [OK]',
      'ENFORCING ZERO-KNOWLEDGE RAM RETENTION POLICIES: ENFORCED',
      'PREPARING EOF-PADDING UNIVERSAL BINARY PARSER...',
      'INJECTING PBKDF2 DERIVATIVE STRETCHERS (600,000 ROUNDS)...',
      'SECURING INGRESS PORT CHANNELS...',
      'PIMXVEIL HYBRID STEGO TERMINAL OPERATIONAL.'
    ]
  },
  fa: {
    header: "PIMXVEIL // گره_صندوق_امن",
    status: "آماده به کار",
    title: "درحال ترکیب بافرهای حافظه...",
    compliance: "سازگار با FIPS 140-3",
    sandbox: "محیط موقت ایزوله شده RAM [فرار]",
    version: "نسخه 2.5_PRO",
    logs: [
      'درحال راه‌اندازی هسته مرکزی PIMXVEIL...',
      'ایزوله‌سازی حافظه فرار RAM مرورگر...',
      'بارگذاری توابع رمزنگاری با آنتروپی بالا...',
      'بررسی قابلیت‌های مرورگر Web Crypto API... [تایید]',
      'اعمال سیاست نگهداری حافظه دانش‌صفر: فعال شد',
      'آماده‌سازی تجزیه‌کننده باینری جهانی EOF-Padding...',
      'تزریق توابع افزایش طول کلید PBKDF2 (۶۰۰,۰۰۰ دور)...',
      'ایمن‌سازی کانال‌های ورودی مخفی...',
      'پایانه استگانوگرافی هیبریدی PIMXVEIL شروع به کار کرد.'
    ]
  },
  ar: {
    header: "PIMXVEIL // عقدة_الخزنة_الآمنة",
    status: "نشط",
    title: "جاري تركيب مخازن الذاكرة...",
    compliance: "متوافق مع FIPS 140-3",
    sandbox: "بيئة RAM معزولة مؤقتة [متطايرة]",
    version: "إصدار 2.5_PRO",
    logs: [
      'جاري تهيئة محرك الخزنة الرئيسي لـ PIMXVEIL...',
      'عزل ذاكرة مرور RAM المتطايرة...',
      'تحميل مزودي التشفير ذوي الإنتروبيا العالية...',
      'التحقق من قدرات واجهة تشفير الويب... [موافق]',
      'فرض سياسة الاحتفاظ بالذاكرة ذات المعرفة الصفرية...',
      'تجهيز محلل الثنائي العالمي للحشو بطريقة EOF...',
      'حقن مستخرجات اشتقاق PBKDF2 (600,000 دورة)...',
      'تأمين قنوات الإدخال السرية...',
      'محطة إخفاء المعلومات الهجينة لـ PIMXVEIL جاهزة للعمل.'
    ]
  },
  de: {
    header: "PIMXVEIL // SICHERHEITS_TRESOR",
    status: "AKTIV",
    title: "SYNTHETISIERE MATRIX-PUFFER...",
    compliance: "FIPS 140-3 KONFORM",
    sandbox: "RAM-ISOLIERTE SANDBOX [FLÜCHTIG]",
    version: "VER 2.5_PRO",
    logs: [
      'INITIALISIERE PIMXVEIL-KERN-TRESOR...',
      'ISOLIERE FLÜCHTIGEN BROWSER-RAM...',
      'LADE KRYPTOGRAPHISCHE HOCH-ENTROPIE-ANBIETER...',
      'PRÜFE WEB CRYPTO API FÄHIGKEITEN... [OK]',
      'ERZWINGE ZERO-KNOWLEDGE-RAM-SPEICHERUNG: AKTIV',
      'BEREITE EOF-PADDING BINÄRPARSER VOR...',
      'INJIZIERE PBKDF2-STRECKER (600.000 RUNDEN)...',
      'SICHERE INGRESS-KANÄLE...',
      'PIMXVEIL HYBRIDES STEGO-TERMINAL BETRIEBSBEREIT.'
    ]
  },
  fr: {
    header: "PIMXVEIL // NOEUD_DE_COFFRE",
    status: "ACTIF",
    title: "SYNTHÈSE DES TAMPONS MÉMOIRE...",
    compliance: "CONFORME FIPS 140-3",
    sandbox: "BAC À SABLE RAM ISOLÉ [VOLATILE]",
    version: "VER 2.5_PRO",
    logs: [
      'INITIALISATION DU MOTEUR DE COFFRE PIMXVEIL...',
      'ISOLATION DE LA RAM VOLATILE DU NAVIGATEUR...',
      'CHARGEMENT DES FOURNISSEURS CRYPTOGRAPHIQUES HAUTE ENTROPIE...',
      'VÉRIFICATION DES CAPACITÉS DE L\'API WEB CRYPTO... [OK]',
      'APPLICATION DE LA RÉTENTION RAM ZÉRO-CONNAISSANCE: ACTIVER',
      'PRÉPARATION DU PARSEUR BINAIRE UNIVERSEL EOF-PADDING...',
      'INJECTION DES ÉTIREURS PBKDF2 (600 000 ITERATIONS)...',
      'SÉCURISATION DES CANAUX D\'ENTRÉE...',
      'TERMINAL STEGO HYBRIDE PIMXVEIL OPÉRATIONNEL.'
    ]
  },
  it: {
    header: "PIMXVEIL // NODO_CASSAFORTE",
    status: "ATTIVO",
    title: "SINTESI DEI BUFFER DI MEMORIA...",
    compliance: "CONFORME FIPS 140-3",
    sandbox: "SANDBOX RAM ISOLATA [VOLATILE]",
    version: "VER 2.5_PRO",
    logs: [
      'INIZIALIZZAZIONE DEL MOTORE DI CASSAFORTE PIMXVEIL...',
      'ISOLAMENTO DELLA RAM VOLATILE DEL BROWSER...',
      'CARICAMENTO DEI PROVIDER CRITTOGRAFICI AD ALTA ENTROPIA...',
      'VERIFICA DELLE CAPACITÀ DELL\'API WEB CRYPTO... [OK]',
      'APPLICAZIONE RITENZIONE RAM ZERO-KNOWLEDGE: ATTIVA',
      'PREPARAZIONE DEL PARSER BINARIO UNIVERSALE EOF-PADDING...',
      'INIEZIONE DEGLI STRETCHER PBKDF2 (600.000 GIRI)...',
      'MESSA IN SINO SICUREZZA DEI CANALI DI INGRESSO...',
      'TERMINALE STEGO IBRIDO PIMXVEIL OPERATIVO.'
    ]
  },
  zh: {
    header: "PIMXVEIL // 安全金库节点",
    status: "在线",
    title: "合成矩阵缓冲区...",
    compliance: "符合 FIPS 140-3 标准",
    sandbox: "RAM 隔离沙箱 [易失性]",
    version: "版本 2.5_PRO",
    logs: [
      '正在电控化 PIMXVEIL 核心存储库引擎...',
      '正在隔离易失性浏览器内存...',
      '正在加载高熵密码学提供商...',
      '正在检查 WEB CRYPTO API 支持能力... [正常]',
      '强制执行零知识 RAM 保留策略：已启用',
      '正在准备 EOF-PADDING 通用二进制解析器...',
      '正在注入 PBKDF2 密钥派生拉伸算法 (600,000次迭代)...',
      '正在保护隐蔽注入信道...',
      'PIMXVEIL 混合隐写终端已准备就绪。'
    ]
  },
  ru: {
    header: "PIMXVEIL // УЗЕЛ_СЕЙФА",
    status: "ОНЛАЙН",
    title: "СИНТЕЗ БУФЕРОВ МАТРИЦЫ...",
    compliance: "СООТВЕТСТВИЕ FIPS 140-3",
    sandbox: "ИЗОЛИРОВАННАЯ RAM-ПЕСОЧНИЦА [ЛЕТУЧАЯ]",
    version: "ВЕРСИЯ 2.5_PRO",
    logs: [
      'ИНИЦИАЛИЗАЦИЯ ЯДРА СЕЙФА PIMXVEIL...',
      'ИЗОЛЯЦИЯ ЛЕТУЧЕЙ ПАМЯТИ БРАУЗЕРА...',
      'ЗАГРУЗКА КРИПТОГРАФИЧЕСКИХ ПРОВАЙДЕРОВ С ВЫСОКОЙ ЭНТРОПИЕЙ...',
      'ПРОВЕРКА ВОЗМОЖНОСТЕЙ WEB CRYPTO API... [OK]',
      'ПРИМЕНЕНИЕ ПОЛИТИКИ ХРАНЕНИЯ С НУЛЕВЫМ РАЗГЛАШЕНИЕМ: АКТИВИРОВАНО',
      'ПОДГОТОВКА УНИВЕРСАЛЬНОГО БИНАРНОГО ПАРСЕРА EOF-PADDING...',
      'ВНЕДРЕНИЕ КЛЮЧЕВЫХ СТРЕТЧЕРОВ PBKDF2 (600 000 ЦИКЛОВ)...',
      'ЗАЩИТА ВХОДНЫХ СКРЫТЫХ КАНАЛОВ...',
      'ГИБРИДНЫЙ СТЕГО-ТЕРМИНАЛ PIMXVEIL РАБОТАЕТ.'
    ]
  },
  el: {
    header: "PIMXVEIL // ΚΟΜΒΟΣ_ΑΣΦΑΛΕΙΑΣ",
    status: "ΕΝΕΡΓΟ",
    title: "ΣΥΝΘΕΣΗ BUFFER ΜΝΗΜΗΣ MATRIX...",
    compliance: "ΣΥΜΜΟΡΦΩΣΗ FIPS 140-3",
    sandbox: "ΑΠΟΜΟΝΩΜΕΝΟ RAM SANDBOX [ΠΤΗΤΙΚΟ]",
    version: "ΕΚΔΟΣΗ 2.5_PRO",
    logs: [
      'ΑΡΧΙΚΟΠΟΙΗΣΗ ΚΕΝΤΡΙΚΗΣ ΜΗΧΑΝΗΣ PIMXVEIL CORE VAULT...',
      'ΑΠΟΜΟΝΩΣΗ ΠΤΗΤΙΚΗΣ ΜΝΗΜΗΣ BROWSER RAM...',
      'ΦΟΡΤΩΣΗ ΠΑΡΟΧΩΝ ΚΡΥΠΤΟΓΡΑΦΙΑΣ ΥΨΗΛΗΣ ΕΝΤΡΟΠΙΑΣ...',
      'ΕΛΕΓΧΟΣ ΔΥΝΑΤΟΤΗΤΩΝ WEB CRYPTO API... [OK]',
      'ΕΠΙΒΟΛΗ ΠΟΛΙΤΙΚΩΝ ΔΙΑΤΗΡΗΣΗΣ ΜΝΗΜΗΣ ZERO-KNOWLEDGE: ΕΠΙΒΛΗΘΗΚΕ',
      'ΠΡΟΕΤΟΙΜΑΣΙΑ UNIVERSAL BINARY PARSER ΜΕ EOF-PADDING...',
      'ΕΙΣΑΓΩΓΗ PBKDF2 DERIVATIVE STRETCHERS (600,000 ROUNDS)...',
      'ΔΙΑΣΦΑΛΙΣΗ ΚΑΝΑΛΙΩΝ ΕΙΣΟΔΟΥ...',
      'ΥΒΡΙΔΙΚΟΣ ΣΤΕΓΑΝΟΓΡΑΦΙΚΟΣ ΤΕΡΜΑΤΙΚΟΣ ΣΤΑΘΜΟΣ PIMXVEIL ΣΕ ΛΕΙΤΟΥΡΓΙΑ.'
    ]
  },
  la: {
    header: "PIMXVEIL // ARCA_SECRETA_NODUS",
    status: "IN_LINEA",
    title: "MATRICIS BUFFERES COMPONENTES...",
    compliance: "FIPS 140-3 COMPATIBILIS",
    sandbox: "RAM SECLUSUS LOCUS [VOLATILIS]",
    version: "VERSIO 2.5_PRO",
    logs: [
      'SYSTEMA PIMXVEIL INCIPIENS...',
      'VOLATILEM MEMORIAM NAVIGATRI SECLUDENS...',
      'ALTISSIMAE ENTROPIAE ELEMENTA KRYPTO GRAPHICA ONERANS...',
      'FACULTATEM WEB CRYPTO API EXAMINANS... [VALE]',
      'REGULAM RETENTIONIS RAM NULLIUS COGNITIONIS ENFORCANS...',
      'EOF-PADDING BINARIUM INTERPRETATOREM PARANS...',
      'PBKDF2 EXTRACTIONES (DC MILIA ITERATIONES) INIICIENS...',
      'INGRESSUS CANALES RECON SECURANS...',
      'SYSTEMA HYBRIDUM STEGANOGRAPHICUM PIMXVEIL PARATUM EST.'
    ]
  }
};

export default function Splash({ onComplete, lang, theme }: SplashProps) {
  const [progress, setProgress] = useState(0);
  const [logIndex, setLogIndex] = useState(0);

  const activeLocalization = SPLASH_TRANSLATIONS[lang] || SPLASH_TRANSLATIONS.en;
  const logs = activeLocalization.logs;

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => onComplete(), 550);
          return 100;
        }
        // Random incremental hops to simulate true loading
        const step = Math.floor(Math.random() * 15) + 5;
        return Math.min(prev + step, 100);
      });
    }, 120);

    const logInterval = setInterval(() => {
      setLogIndex(prev => {
        if (prev < logs.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 180);

    return () => {
      clearInterval(progressInterval);
      clearInterval(logInterval);
    };
  }, [onComplete, logs.length]);

  const isDark = theme === 'dark';
  const isRtl = lang === 'fa' || lang === 'ar';

  return (
    <div 
      dir={isRtl ? 'rtl' : 'ltr'}
      className={`fixed inset-0 font-mono flex flex-col items-center justify-center p-6 z-50 overflow-hidden transition-colors duration-300 ${
      isDark ? 'bg-[#020202] text-emerald-400' : 'bg-slate-50 text-emerald-800'
    }`}>
      {/* Dynamic scanline overlay */}
      <div className={`absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,6px_100%] pointer-events-none ${
        isDark ? 'opacity-40' : 'opacity-15'
      }`} />

      {/* Cyber pulse ambient background */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none ${
        isDark ? 'bg-emerald-500/5' : 'bg-emerald-500/10'
      }`} />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        className={`w-full max-w-2xl border backdrop-blur-md rounded-lg shadow-2xl p-6 relative flex flex-col gap-6 transition-colors duration-300 ${
          isDark ? 'border-emerald-500/20 bg-black/60' : 'border-zinc-200/80 bg-white/95'
        }`}
      >
        {/* Card Header decoration */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500/50 via-cyan-500/50 to-emerald-500/50" />
        <div className={`flex justify-between items-center border-b pb-4 ${
          isDark ? 'border-emerald-500/20' : 'border-zinc-200'
        }`}>
          <div className="flex items-center gap-2">
            <Shield className={`w-5 h-5 animate-pulse ${isDark ? 'text-emerald-500' : 'text-emerald-700'}`} />
            <span className={`font-semibold tracking-wider text-sm select-none ${
              isDark ? 'text-emerald-500' : 'text-emerald-800'
            }`}>{activeLocalization.header}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full animate-ping ${isDark ? 'bg-emerald-500' : 'bg-emerald-600'}`} />
            <span className={`text-[10px] uppercase ${isDark ? 'text-emerald-500/60' : 'text-emerald-800/60'}`}>{activeLocalization.status}</span>
          </div>
        </div>

        {/* Decorative Grid */}
        <div className={`h-44 border rounded p-4 flex flex-col justify-end gap-1.5 overflow-hidden font-mono text-xs select-none transition-colors duration-300 ${
          isDark ? 'bg-emerald-950/10 border-emerald-500/10' : 'bg-zinc-50 border-zinc-200'
        }`}>
          <AnimatePresence mode="popLayout">
            {logs.slice(0, logIndex + 1).map((log, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: isRtl ? 10 : -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className={`flex gap-2 items-start ${
                  i === logIndex 
                    ? (isDark ? 'text-emerald-300 font-bold' : 'text-emerald-950 font-bold') 
                    : (isDark ? 'text-emerald-500/60' : 'text-zinc-400')
                }`}
              >
                <span className={`text-[10px] px-1 py-0.5 rounded select-none ${
                  isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-200/65 text-emerald-800'
                }`}>
                  {`[${(i + 1).toString().padStart(2, '0')}]`}
                </span>
                <span className="break-all">{log}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Progress bar controller */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs select-none">
            <span className={`flex items-center gap-1.5 ${isDark ? 'text-emerald-500/80' : 'text-emerald-800'}`}>
              <Cpu className="w-3.5 h-3.5 animate-spin" />
              {activeLocalization.title}
            </span>
            <span className={`font-bold tracking-widest ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>{progress}%</span>
          </div>
          <div className={`w-full h-3 rounded-full border overflow-hidden p-0.5 ${
            isDark ? 'bg-[#0c130d] border-emerald-500/20' : 'bg-zinc-100 border-zinc-200'
          }`}>
            <motion.div
              className={`h-full rounded-full ${
                isDark ? 'bg-gradient-to-r from-emerald-500 via-cyan-400 to-emerald-400' : 'bg-gradient-to-r from-emerald-600 to-teal-500'
              }`}
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Digital Grid Footer stats */}
        <div className={`flex justify-between items-center text-[10px] select-none border-t pt-4 ${
          isDark ? 'text-emerald-500/40 border-emerald-500/10' : 'text-zinc-400 border-zinc-200'
        }`}>
          <span className="flex items-center gap-1">
            <Lock className={`w-3 h-3 ${isDark ? 'text-emerald-500/40' : 'text-emerald-600'}`} /> 
            {activeLocalization.compliance}
          </span>
          <span>{activeLocalization.sandbox}</span>
          <span className="flex items-center gap-1">
            <Terminal className={`w-3 h-3 ${isDark ? 'text-emerald-500/40' : 'text-emerald-600'}`} /> 
            {activeLocalization.version}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
