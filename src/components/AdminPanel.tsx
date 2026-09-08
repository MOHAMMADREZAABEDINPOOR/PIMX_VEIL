import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Shield, 
  Lock, 
  User, 
  Calendar, 
  ChevronDown, 
  Laptop, 
  Smartphone, 
  Tablet, 
  Globe, 
  ArrowLeft, 
  Eye, 
  TrendingUp, 
  Key, 
  FileCheck2,
  CheckCircle,
  Database
} from 'lucide-react';
import { tracker, TrackedEvent } from '../utils/tracker';

interface AdminPanelProps {
  lang: 'en' | 'fa' | 'ar' | string;
  onExit: () => void;
}

interface ChartPoint {
  label: string;
  visits: number;
  tests: number;
}

export default function AdminPanel({ lang, onExit }: AdminPanelProps) {
  // Login / Authentication State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('pimx_admin_session') === 'active';
  });

  // Time Range Selection State
  // Dropdown list requested: 15d, 20d, 1m, 3m, 5m, 7m, 9m, 11m, 1y, 3y, 5y, 7y, 8y, 10y, 12y, 15y, 20y
  const [timeRange, setTimeRange] = useState('7d');
  const [rangeDropdownOpen, setRangeDropdownOpen] = useState(false);

  const isRtl = lang === 'fa' || lang === 'ar';

  const RANGE_OPTIONS = [
    { value: '2h', en: '2 Hours', fa: '۲ ساعته' },
    { value: '5h', en: '5 Hours', fa: '۵ ساعته' },
    { value: '10h', en: '10 Hours', fa: '۱۰ ساعته' },
    { value: '18h', en: '18 Hours', fa: '۱۸ ساعته' },
    { value: '1d', en: '1 Day', fa: '۱ روزه' },
    { value: '3d', en: '3 Days', fa: '۳ روزه' },
    { value: '5d', en: '5 Days', fa: '۵ روزه' },
    { value: '7d', en: '7 Days', fa: '۷ روزه' },
    { value: '9d', en: '9 Days', fa: '۹ روزه' },
    { value: '15d', en: '15 Days', fa: '۱۵ روزه' },
    { value: '20d', en: '20 Days', fa: '۲۰ روزه' },
    { value: '1m', en: '1 Month', fa: '۱ ماهه' },
    { value: '3m', en: '3 Months', fa: '۳ ماهه' },
    { value: '5m', en: '5 Months', fa: '۵ ماهه' },
    { value: '7m', en: '7 Months', fa: '۷ ماهه' },
    { value: '9m', en: '9 Months', fa: '۹ ماهه' },
    { value: '11m', en: '11 Months', fa: '۱۱ ماهه' },
    { value: '1y', en: '1 Year', fa: '۱ ساله' },
    { value: '3y', en: '3 Years', fa: '۳ ساله' },
    { value: '5y', en: '5 Years', fa: '۵ ساله' },
    { value: '7y', en: '7 Years', fa: '۷ ساله' },
    { value: '8y', en: '8 Years', fa: '۸ ساله' },
    { value: '10y', en: '10 Years', fa: '۱۰ ساله' },
    { value: '12y', en: '12 Years', fa: '۱۲ ساله' },
    { value: '15y', en: '15 Years', fa: '۱۵ ساله' },
    { value: '20y', en: '20 Years', fa: '۲۰ ساله' },
  ];

  const currentRangeLabel = useMemo(() => {
    const found = RANGE_OPTIONS.find(o => o.value === timeRange);
    return isRtl ? (found?.fa || found?.en) : (found?.en || found?.en);
  }, [timeRange, isRtl]);

  // Handle credentials check
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'pimxveil' && password === '123456789PIMX_VEIl@#$%^&') {
      setIsAuthenticated(true);
      sessionStorage.setItem('pimx_admin_session', 'active');
      setError('');
    } else {
      setError(isRtl ? 'مشخصات ورود نامعتبر است' : 'Invalid administrator credentials');
    }
  };

  // Log Out admin securely
  const handleLogout = () => {
    sessionStorage.removeItem('pimx_admin_session');
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
  };

  // Get filtered operations data depending on selection
  const events = useMemo(() => {
    const all = tracker.getEvents();
    const now = new Date();
    const cutoff = new Date();

    switch (timeRange) {
      case '2h': cutoff.setHours(now.getHours() - 2); break;
      case '5h': cutoff.setHours(now.getHours() - 5); break;
      case '10h': cutoff.setHours(now.getHours() - 10); break;
      case '18h': cutoff.setHours(now.getHours() - 18); break;
      case '1d': cutoff.setDate(now.getDate() - 1); break;
      case '3d': cutoff.setDate(now.getDate() - 3); break;
      case '5d': cutoff.setDate(now.getDate() - 5); break;
      case '7d': cutoff.setDate(now.getDate() - 7); break;
      case '9d': cutoff.setDate(now.getDate() - 9); break;
      case '15d': cutoff.setDate(now.getDate() - 15); break;
      case '20d': cutoff.setDate(now.getDate() - 20); break;
      case '1m': cutoff.setMonth(now.getMonth() - 1); break;
      case '3m': cutoff.setMonth(now.getMonth() - 3); break;
      case '5m': cutoff.setMonth(now.getMonth() - 5); break;
      case '7m': cutoff.setMonth(now.getMonth() - 7); break;
      case '9m': cutoff.setMonth(now.getMonth() - 9); break;
      case '11m': cutoff.setMonth(now.getMonth() - 11); break;
      case '1y': cutoff.setFullYear(now.getFullYear() - 1); break;
      case '3y': cutoff.setFullYear(now.getFullYear() - 3); break;
      case '5y': cutoff.setFullYear(now.getFullYear() - 5); break;
      case '7y': cutoff.setFullYear(now.getFullYear() - 7); break;
      case '8y': cutoff.setFullYear(now.getFullYear() - 8); break;
      case '10y': cutoff.setFullYear(now.getFullYear() - 10); break;
      case '12y': cutoff.setFullYear(now.getFullYear() - 12); break;
      case '15y': cutoff.setFullYear(now.getFullYear() - 15); break;
      case '20y': cutoff.setFullYear(now.getFullYear() - 20); break;
      default: cutoff.setDate(now.getDate() - 7);
    }

    return all.filter(e => new Date(e.timestamp) >= cutoff);
  }, [timeRange]);

  // Aggregate metrics summaries
  const stats = useMemo(() => {
    let visits = 0;
    let tests = 0;
    const devices = { Desktop: 0, Mobile: 0, Tablet: 0 };
    const countryCount: Record<string, number> = {};

    events.forEach(e => {
      // General logs count
      if (e.type === 'visit') {
        visits++;
      } else {
        tests++;
      }

      // Device grouping
      if (e.device) {
        devices[e.device] = (devices[e.device] || 0) + 1;
      }

      // Country grouping
      if (e.country) {
        countryCount[e.country] = (countryCount[e.country] || 0) + 1;
      }
    });

    // Formatting countries sorted by frequency
    const countries = Object.entries(countryCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalVisits: visits,
      totalTests: tests,
      devices,
      countries
    };
  }, [events]);

  // Compile coordinates to draw interactive SVG chart curves representing the timeline
  const chartPoints = useMemo<ChartPoint[]>(() => {
    if (events.length === 0) return [];

    const now = new Date();
    const cutoff = new Date();

    switch (timeRange) {
      case '2h': cutoff.setHours(now.getHours() - 2); break;
      case '5h': cutoff.setHours(now.getHours() - 5); break;
      case '10h': cutoff.setHours(now.getHours() - 10); break;
      case '18h': cutoff.setHours(now.getHours() - 18); break;
      case '1d': cutoff.setDate(now.getDate() - 1); break;
      case '3d': cutoff.setDate(now.getDate() - 3); break;
      case '5d': cutoff.setDate(now.getDate() - 5); break;
      case '7d': cutoff.setDate(now.getDate() - 7); break;
      case '9d': cutoff.setDate(now.getDate() - 9); break;
      case '15d': cutoff.setDate(now.getDate() - 15); break;
      case '20d': cutoff.setDate(now.getDate() - 20); break;
      case '1m': cutoff.setMonth(now.getMonth() - 1); break;
      case '3m': cutoff.setMonth(now.getMonth() - 3); break;
      case '5m': cutoff.setMonth(now.getMonth() - 5); break;
      case '7m': cutoff.setMonth(now.getMonth() - 7); break;
      case '9m': cutoff.setMonth(now.getMonth() - 9); break;
      case '11m': cutoff.setMonth(now.getMonth() - 11); break;
      case '1y': cutoff.setFullYear(now.getFullYear() - 1); break;
      case '3y': cutoff.setFullYear(now.getFullYear() - 3); break;
      case '5y': cutoff.setFullYear(now.getFullYear() - 5); break;
      case '7y': cutoff.setFullYear(now.getFullYear() - 7); break;
      case '8y': cutoff.setFullYear(now.getFullYear() - 8); break;
      case '10y': cutoff.setFullYear(now.getFullYear() - 10); break;
      case '12y': cutoff.setFullYear(now.getFullYear() - 12); break;
      case '15y': cutoff.setFullYear(now.getFullYear() - 15); break;
      case '20y': cutoff.setFullYear(now.getFullYear() - 20); break;
    }

    const startMs = cutoff.getTime();
    const endMs = now.getTime();
    const spanMs = endMs - startMs;
    const segments = 10; // Number of graph peaks/nodes to map

    const segmentsMap = Array.from({ length: segments }).map((_, i) => {
      const stepStart = startMs + i * (spanMs / segments);
      const stepEnd = startMs + (i + 1) * (spanMs / segments);
      
      let visitsInside = 0;
      let testsInside = 0;

      events.forEach(e => {
        const time = new Date(e.timestamp).getTime();
        if (time >= stepStart && time < stepEnd) {
          if (e.type === 'visit') visitsInside++;
          else testsInside++;
        }
      });

      // Format elegant label nicely in English or Farsi
      const stepDate = new Date(stepStart + (spanMs / segments) / 2);
      let label = '';
      
      const isShortTime = ['15d', '20d', '1m'].includes(timeRange);
      const isMediumTime = ['3m', '5m', '7m', '9m', '11m', '1y'].includes(timeRange);

      if (isShortTime) {
        label = stepDate.toLocaleDateString(lang === 'fa' ? 'fa-IR' : 'en-US', {
          month: 'short',
          day: 'numeric'
        });
      } else if (isMediumTime) {
        label = stepDate.toLocaleDateString(lang === 'fa' ? 'fa-IR' : 'en-US', {
          month: 'short',
          year: '2-digit'
        });
      } else {
        label = stepDate.toLocaleDateString(lang === 'fa' ? 'fa-IR' : 'en-US', {
          year: 'numeric'
        });
      }

      return {
        label,
        visits: visitsInside,
        tests: testsInside
      };
    });

    return segmentsMap;
  }, [events, timeRange, lang]);

  // Compute SVG Points coordinates
  const svgMetrics = useMemo(() => {
    if (chartPoints.length === 0) return { visitsPath: '', testsPath: '', points: [] };
    
    // Find maximal points to scale vector properly
    const maxVal = Math.max(...chartPoints.map(p => Math.max(p.visits, p.tests, 10))) * 1.15;
    
    const height = 140;
    const width = 500;
    const padding = 20;

    const coords = chartPoints.map((p, i) => {
      const x = padding + (i / (chartPoints.length - 1)) * (width - padding * 2);
      const yVisits = height - padding - (p.visits / maxVal) * (height - padding * 2);
      const yTests = height - padding - (p.tests / maxVal) * (height - padding * 2);
      return { x, yVisits, yTests, label: p.label };
    });

    const visitsPath = coords.reduce((acc, c, i) => {
      return i === 0 ? `M ${c.x} ${c.yVisits}` : `${acc} L ${c.x} ${c.yVisits}`;
    }, '');

    const testsPath = coords.reduce((acc, c, i) => {
      return i === 0 ? `M ${c.x} ${c.yTests}` : `${acc} L ${c.x} ${c.yTests}`;
    }, '');

    return { visitsPath, testsPath, coords, height, width };
  }, [chartPoints]);

  if (!isAuthenticated) {
    return (
      <div 
        dir={isRtl ? 'rtl' : 'ltr'} 
        className="min-h-[500px] flex items-center justify-center p-4 selection:bg-emerald-500/30"
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
          className="bg-white dark:bg-[#080809] border border-zinc-200 dark:border-zinc-850 px-6 py-8 rounded-2xl shadow-xl w-full max-w-md flex flex-col gap-6 relative overflow-hidden"
        >
          {/* Top glowing bar */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-500" />
          
          <div className="flex flex-col items-center text-center gap-3">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-lg font-black font-display tracking-tight text-gray-900 dark:text-zinc-100">
                {isRtl ? 'احراز هویت مدیریت PIMXVEIL' : 'PIMXVEIL Administrator Portal'}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono mt-1">
                {isRtl ? 'جهت بارگذاری داشبورد عملیاتی، مشخصات ارشد را تایید کنید' : 'Authenticate credentials to access tactical metadata systems'}
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-xl text-center font-semibold font-display">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-gray-800 dark:text-zinc-300 uppercase tracking-widest font-mono flex items-center gap-1.5 justify-start">
                <User className="w-3.5 h-3.5 text-zinc-400" />
                {isRtl ? 'نام کاربری' : 'Username'}
              </label>
              <div className="relative">
                <input 
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="e.g. admin"
                  className="w-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-850 rounded-xl p-3 text-xs outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-gray-800 dark:text-zinc-300 uppercase tracking-widest font-mono flex items-center gap-1.5 justify-start">
                <Key className="w-3.5 h-3.5 text-zinc-400" />
                {isRtl ? 'رمز عبور مقتدر' : 'Master Password'}
              </label>
              <input 
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••••"
                className="w-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-850 rounded-xl p-3 text-xs outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold font-display text-xs rounded-xl shadow-md shadow-emerald-500/10 cursor-pointer hover:shadow-lg transition-all text-center flex items-center justify-center gap-2 mt-2 uppercase tracking-wider"
            >
              <Lock className="w-4 h-4" />
              <span>{isRtl ? 'ورود به داشبورد' : 'Authenticate Node'}</span>
            </button>
          </form>

          <button
            onClick={onExit}
            className="flex items-center justify-center gap-2 text-[11px] text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:underline cursor-pointer font-mono"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isRtl ? 'انصراف' : 'Cancel and Return'}</span>
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div 
      dir={isRtl ? 'rtl' : 'ltr'} 
      className="flex flex-col gap-6 selection:bg-emerald-500/30"
    >
      {/* Upper Tactical Actions Hub */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-900 pb-4 select-none">
        
        {/* Title */}
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/15 text-emerald-500 rounded-lg">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-gray-900 dark:text-emerald-400 font-display uppercase">
              {isRtl ? 'داشبورد نظارت و ترافیک PIMXVEIL' : 'PIMXVEIL METADATA MONITOR'}
            </h3>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
              {isRtl ? 'سیستم یکپارچه آمار کلیک، دستگاه‌ها و جغرافیای کاربران' : 'Unified tracking logs, country breakdown and active telemetry statistics'}
            </span>
          </div>
        </div>

        {/* Floating Controls with dropdown range selector */}
        <div className="flex items-center gap-2.5 relative">
          <button
            onClick={() => setRangeDropdownOpen(!rangeDropdownOpen)}
            className="flex items-center gap-2 bg-white dark:bg-zinc-900/40 border border-zinc-250 dark:border-zinc-800/80 rounded-xl p-2 px-3.5 shadow-xs hover:border-zinc-350 dark:hover:border-zinc-700 transition cursor-pointer select-none text-xs font-bold text-gray-800 dark:text-zinc-200"
          >
            <Calendar className="w-4 h-4 text-zinc-400 shrink-0" />
            <span>{isRtl ? 'محدوده زمانی:' : 'Time Range:'} <span className="text-emerald-500 font-black">{currentRangeLabel}</span></span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          </button>

          {rangeDropdownOpen && (
            <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setRangeDropdownOpen(false)} />
          )}

          {rangeDropdownOpen && (
            <div className="absolute right-0 top-11 rtl:left-0 rounded-xl border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 p-1.5 shadow-xl z-50 flex flex-col gap-0.5 select-none w-48 max-h-[280px] overflow-y-auto">
              {RANGE_OPTIONS.map(opt => {
                const isSel = opt.value === timeRange;
                return (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setTimeRange(opt.value);
                      setRangeDropdownOpen(false);
                    }}
                    className={`w-full text-left rtl:text-right p-2 text-xs rounded-lg cursor-pointer transition ${
                      isSel 
                        ? 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500 font-bold' 
                        : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900/40'
                    }`}
                  >
                    {isRtl ? opt.fa : opt.en}
                  </button>
                );
              })}
            </div>
          )}

          <button
            onClick={handleLogout}
            className="p-2 border border-zinc-250 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 hover:bg-zinc-50 dark:hover:bg-red-500/10 hover:border-red-500/20 text-red-500 dark:text-red-400 rounded-xl text-xs font-bold cursor-pointer transition shadow-xs"
          >
            {isRtl ? 'خروج' : 'Log Out'}
          </button>
        </div>
      </div>

      {/*** MAIN CARDS ROW ***/}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Total Visits Card */}
        <div className="bg-white dark:bg-[#080809] border border-zinc-150 dark:border-zinc-900/60 rounded-2xl p-5 shadow-xs flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-mono">
              {isRtl ? 'کل بازدیدهای فایل (ها)' : 'TOTAL SYSTEM VISITS'}
            </span>
            <span id="visit-count" className="text-3xl font-black font-display tracking-tight text-gray-900 dark:text-zinc-100">
              {stats.totalVisits.toLocaleString()}
            </span>
            <span className="text-[10px] text-emerald-500 font-mono font-medium">
              ● {isRtl ? 'در زمان انتخابی' : 'active monitoring logs'}
            </span>
          </div>
          <div className="p-4 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl">
            <Eye className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        {/* Cryptographic Actions performed in RAM */}
        <div className="bg-white dark:bg-[#080809] border border-zinc-150 dark:border-zinc-900/60 rounded-2xl p-5 shadow-xs flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-mono">
              {isRtl ? 'عملیات رمزنگاری / استخراج ها' : 'CRYPTOGRAPHIC TEST CYCLES'}
            </span>
            <span id="test-count" className="text-3xl font-black font-display tracking-tight text-gray-900 dark:text-zinc-100">
              {stats.totalTests.toLocaleString()}
            </span>
            <span className="text-[10px] text-cyan-500 font-mono font-medium">
              ◆ {isRtl ? 'بارگذاری ها و تست لودها' : 'active carrier iterations'}
            </span>
          </div>
          <div className="p-4 bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 rounded-xl">
            <FileCheck2 className="w-6 h-6" />
          </div>
        </div>

        {/* Active Node status info */}
        <div className="bg-white dark:bg-[#080809] border border-zinc-150 dark:border-zinc-900/60 rounded-2xl p-5 shadow-xs flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-mono">
              {isRtl ? 'وضعیت ردیاب دیجیتال' : 'METADATA CAPTURE AGENT'}
            </span>
            <span className="text-xl font-bold font-display text-emerald-500 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>{isRtl ? 'برخط و فعال' : 'OPERATIONAL'}</span>
            </span>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono leading-relaxed mt-1">
              {isRtl ? 'سیستم فاقد هرگونه دیتابیس متمرکز مخرب است' : 'No backend db connection needed. Edge metrics compiled safely.'}
            </span>
          </div>
        </div>

      </div>

      {/*** DOUBLE PANEL COMPONENT ROW (CHART & DEVICES) ***/}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Chart Frame */}
        <div className="lg:col-span-8 bg-white dark:bg-[#080809] border border-zinc-150 dark:border-zinc-900/60 rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex justify-between items-center select-none">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-black uppercase text-gray-800 dark:text-zinc-300 tracking-wider font-mono">
                {isRtl ? 'روند آمار ترافیک و پردازش سیستم' : 'SYSTEM OVERVIEW METRIC TRENDS'}
              </span>
            </div>
            
            <div className="flex items-center gap-4 text-[10px] font-mono">
              <span className="flex items-center gap-1.5 text-emerald-500 font-bold">
                <span className="w-2.5 h-1 bg-emerald-500 block rounded" />
                {isRtl ? 'بازدید' : 'Visits'}
              </span>
              <span className="flex items-center gap-1.5 text-cyan-500 font-bold">
                <span className="w-2.5 h-1 bg-cyan-500 block rounded" />
                {isRtl ? 'تست رمزنگاری' : 'Crypto' }
              </span>
            </div>
          </div>

          {/* Render Vector Graph */}
          {chartPoints.length > 0 ? (
            <div className="relative w-full overflow-hidden flex flex-col gap-2 mt-2">
              <svg 
                viewBox={`0 0 ${svgMetrics.width} ${svgMetrics.height}`}
                className="w-full h-[180px] drop-shadow-md overflow-visible"
              >
                {/* Horizontal reference grids */}
                <line x1="20" y1="20" x2="480" y2="20" stroke="rgba(120, 120, 120, 0.08)" strokeDasharray="3 3" />
                <line x1="20" y1="70" x2="480" y2="70" stroke="rgba(120, 120, 120, 0.08)" strokeDasharray="3 3" />
                <line x1="20" y1="120" x2="480" y2="120" stroke="rgba(120, 120, 120, 0.08)" strokeDasharray="3 3" />

                {/* Draw Areas fills (gradient backdrops for the lines) */}
                {svgMetrics.coords.length > 0 && (
                  <>
                    <path
                      d={`${svgMetrics.visitsPath} L ${svgMetrics.coords[svgMetrics.coords.length - 1].x} ${svgMetrics.height - 20} L ${svgMetrics.coords[0].x} ${svgMetrics.height - 20} Z`}
                      fill="url(#visits-gradient)"
                    />
                    <path
                      d={`${svgMetrics.testsPath} L ${svgMetrics.coords[svgMetrics.coords.length - 1].x} ${svgMetrics.height - 20} L ${svgMetrics.coords[0].x} ${svgMetrics.height - 20} Z`}
                      fill="url(#tests-gradient)"
                    />
                  </>
                )}

                {/* SVG Definitions */}
                <defs>
                  <linearGradient id="visits-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="tests-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* SVG Line pathing vectors */}
                <path 
                  d={svgMetrics.visitsPath}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path 
                  d={svgMetrics.testsPath}
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="2"
                  strokeLinecap="round"
                />

                {/* Circular hover elements showing coordinates peaks */}
                {svgMetrics.coords.map((c, i) => (
                  <g key={i}>
                    {/* Visits Circle point */}
                    <circle 
                      cx={c.x} 
                      cy={c.yVisits} 
                      r="3.5" 
                      className="fill-white dark:fill-[#080809] stroke-emerald-500 hover:scale-125 transition-transform cursor-crosshair" 
                      strokeWidth="2"
                    />
                    {/* Diagnostic numerical label for high-level operations */}
                    {chartPoints.length < 15 && i % 2 === 0 && (
                      <text 
                        x={c.x} 
                        y={c.yVisits - 8} 
                        className="text-[8px] fill-zinc-400 dark:fill-zinc-500 font-mono text-center select-none" 
                        textAnchor="middle"
                      >
                        {chartPoints[i].visits}
                      </text>
                    )}
                  </g>
                ))}
              </svg>

              {/* Bottom Labeling for steps */}
              <div className="flex justify-between px-3 text-[10px] text-zinc-400 dark:text-zinc-500 font-mono select-none">
                {chartPoints.map((p, i) => (
                  <span key={i} className="text-center truncate max-w-[50px]">
                    {p.label}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-xs text-zinc-400 font-mono select-none">
              {isRtl ? 'داده آماری برای محدوده انتخابی موجود نیست' : 'No metric timeline found.'}
            </div>
          )}
        </div>

        {/* Device breakdown Panel */}
        <div className="lg:col-span-4 bg-white dark:bg-[#080809] border border-zinc-150 dark:border-zinc-900/60 rounded-2xl p-5 flex flex-col gap-4">
          <span className="text-xs font-black uppercase text-gray-800 dark:text-zinc-300 tracking-wider font-mono flex items-center gap-1.5 select-none">
            <Smartphone className="w-4 h-4 text-indigo-500" />
            {isRtl ? 'درصد و سهم مرورگرها / دیوایس ها' : 'DEVICE VISITATION SEGMENT'}
          </span>

          <div className="flex flex-col gap-4.5 mt-2.5">
            {/* Compute device shares */}
            {(() => {
              const total = (stats.devices.Desktop + stats.devices.Mobile + stats.devices.Tablet) || 1;
              const dkPct = Math.round((stats.devices.Desktop / total) * 100);
              const mbPct = Math.round((stats.devices.Mobile / total) * 100);
              const tbPct = Math.round((stats.devices.Tablet / total) * 100);

              return (
                <>
                  {/* Desktop */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                      <span className="flex items-center gap-1.5">
                        <Laptop className="w-4 h-4 text-zinc-400" />
                        <span>{isRtl ? 'رایانه‌ها (دسکتاپ)' : 'Desktop PCs'}</span>
                      </span>
                      <span className="font-semibold font-mono">{dkPct}% ({stats.devices.Desktop})</span>
                    </div>
                    <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-950 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${dkPct}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className="h-full bg-emerald-500 rounded-full"
                      />
                    </div>
                  </div>

                  {/* Mobile phones */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                      <span className="flex items-center gap-1.5">
                        <Smartphone className="w-4 h-4 text-zinc-400" />
                        <span>{isRtl ? 'گوشی‌های همراه' : 'Mobile Phones'}</span>
                      </span>
                      <span className="font-semibold font-mono">{mbPct}% ({stats.devices.Mobile})</span>
                    </div>
                    <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-950 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${mbPct}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className="h-full bg-indigo-500 rounded-full"
                      />
                    </div>
                  </div>

                  {/* Tablets */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                      <span className="flex items-center gap-1.5">
                        <Tablet className="w-4 h-4 text-zinc-400" />
                        <span>{isRtl ? 'تبلت‌ها' : 'Tablets'}</span>
                      </span>
                      <span className="font-semibold font-mono">{tbPct}% ({stats.devices.Tablet})</span>
                    </div>
                    <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-950 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${tbPct}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className="h-full bg-amber-500 rounded-full"
                      />
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>

      </div>

      {/*** GEOLOCATIONS BREAKDOWN LIST ***/}
      <div className="bg-white dark:bg-[#080809] border border-zinc-150 dark:border-zinc-900/60 rounded-2xl p-5 flex flex-col gap-4">
        <span className="text-xs font-black uppercase text-gray-800 dark:text-zinc-300 tracking-wider font-mono flex items-center gap-1.5 select-none">
          <Globe className="w-4 h-4 text-cyan-500" />
          {isRtl ? 'تفکیک جغرافیای بازدیدکنندگان بر حسب کشورها' : 'USER COUNTRIES BREAKDOWN'}
        </span>

        {stats.countries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            {stats.countries.slice(0, 16).map((country, idx) => {
              const totalVisitsCount = stats.totalVisits + stats.totalTests;
              const percentage = Math.round((country.count / (totalVisitsCount || 1)) * 100);
              
              return (
                <div 
                  key={country.name}
                  className="p-3 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-150 dark:border-zinc-900/50 rounded-xl flex flex-col gap-2"
                >
                  <div className="flex justify-between text-xs font-medium">
                    <span className="flex items-center gap-1.5 text-gray-800 dark:text-zinc-200">
                      <span className="opacity-50 text-[10px] font-mono">#{idx + 1}</span>
                      <span className="font-semibold">{country.name}</span>
                    </span>
                    <span className="font-mono text-zinc-500 font-semibold">{percentage}% ({country.count})</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-zinc-400 font-mono">
            {isRtl ? 'موقعیت مکانی یافت نشد' : 'No geographic metric mapped.'}
          </div>
        )}
      </div>

      {/* Cancel btn to leave admin dashboard */}
      <div className="flex justify-center mt-2.5 select-none">
        <button
          onClick={onExit}
          className="flex items-center gap-2 p-2 px-5 border border-zinc-200 dark:border-zinc-850 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl text-xs text-zinc-600 dark:text-zinc-300 font-bold transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{isRtl ? 'بازگشت به برنامه اصلی' : 'Exit Admin View'}</span>
        </button>
      </div>
    </div>
  );
}
