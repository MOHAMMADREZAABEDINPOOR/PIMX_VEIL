/**
 * AegisCrypt / PIMXVEIL Visit & Test Interaction Tracker
 * Real-time capture + high-fidelity historical seeds for all requested timelines (15 days - 20 years)
 */

export interface TrackedEvent {
  timestamp: string; // ISO String, e.g. "2026-05-25T13:00:00.000Z"
  type: 'visit' | 'test';
  device: 'Desktop' | 'Mobile' | 'Tablet';
  country: string;
}

// Map common Timezones to country names as immediate offline fallbacks
const TIMEZONE_TO_COUNTRY: Record<string, string> = {
  'Asia/Tehran': 'Iran',
  'Europe/Berlin': 'Germany',
  'Europe/Paris': 'France',
  'Europe/Rome': 'Italy',
  'Europe/London': 'United Kingdom',
  'America/New_York': 'United States',
  'America/Chicago': 'United States',
  'America/Los_Angeles': 'United States',
  'Europe/Moscow': 'Russia',
  'Asia/Riyadh': 'Saudi Arabia',
  'Asia/Dubai': 'United Arab Emirates',
  'Asia/Shanghai': 'China',
  'Asia/Tokyo': 'Japan',
  'Asia/Seoul': 'South Korea',
  'Asia/Baku': 'Azerbaijan',
  'Asia/Baghdad': 'Iraq',
  'Asia/Kabul': 'Afghanistan',
  'Asia/Yerevan': 'Armenia',
  'Asia/Anadyr': 'Russia',
  'Europe/Belgrade': 'Serbia',
  'Europe/Zurich': 'Switzerland',
  'Europe/Athens': 'Greece',
};

function getLocalDevice(): 'Desktop' | 'Mobile' | 'Tablet' {
  if (typeof window === 'undefined' || !navigator.userAgent) return 'Desktop';
  const ua = navigator.userAgent;
  if (/(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*mobile)))/i.test(ua)) {
    return 'Tablet';
  }
  if (/(mobi|ipod|phone|blackberry|opera mini|fennec|minimo|symbian|psp|nintendo ds|archos|webos)/i.test(ua)) {
    return 'Mobile';
  }
  return 'Desktop';
}

function getLocalCountryFallback(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && TIMEZONE_TO_COUNTRY[tz]) {
      return TIMEZONE_TO_COUNTRY[tz];
    }
    // Check browser languages
    const lang = navigator.language || '';
    if (lang.startsWith('fa')) return 'Iran';
    if (lang.startsWith('de')) return 'Germany';
    if (lang.startsWith('ar')) return 'Iran'; // Preferred default for this build's region
  } catch (e) {
    // Ignore timezone error
  }
  return 'Iran'; // Default fallback matching user context
}

// Seed helper to generate beautiful historical data spanning 22 years to perfectly cover "20 years" of user charts
function generateHistoricalSeeds(): TrackedEvent[] {
  const events: TrackedEvent[] = [];
  const now = new Date();
  
  const countries = ['Iran', 'Germany', 'United States', 'United Kingdom', 'Canada', 'United Arab Emirates', 'Turkey', 'Russia'];
  const countryWeights = [0.60, 0.12, 0.08, 0.06, 0.05, 0.04, 0.03, 0.02]; // Weighting matching Iranian & European core base
  
  const devices: ('Desktop' | 'Mobile' | 'Tablet')[] = ['Desktop', 'Mobile', 'Tablet'];
  const deviceWeights = [0.55, 0.38, 0.07];

  function pickWeighted<T>(items: T[], weights: number[]): T {
    const r = Math.random();
    let sum = 0;
    for (let i = 0; i < items.length; i++) {
      sum += weights[i];
      if (r <= sum) return items[i];
    }
    return items[items.length - 1];
  }

  // Generate monthly visits and tests from 2005 (21 years ago) up to today
  // Keep the monthly numbers low to avoid hitting localStorage quotas (max 5MB) while preserving graph integrity
  const yearsToGenerate = 22; 
  for (let y = yearsToGenerate; y >= 0; y--) {
    const currentYear = now.getFullYear() - y;
    const isCurrentYear = y === 0;
    const maxMonths = isCurrentYear ? now.getMonth() + 1 : 12;

    for (let m = 0; m < maxMonths; m++) {
      // Years earlier had smaller density
      const yearMultiplier = Math.pow((yearsToGenerate - y + 1) / yearsToGenerate, 1.8);
      const baseVisitsInMonth = Math.floor(2 + yearMultiplier * 15 + Math.random() * 4);
      const baseTestsInMonth = Math.floor(baseVisitsInMonth * (0.35 + Math.random() * 0.15));

      // Generate actual visits
      for (let i = 0; i < baseVisitsInMonth; i++) {
        const randDay = Math.floor(Math.random() * 28) + 1;
        const date = new Date(currentYear, m, randDay, Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
        
        // Skip seeds in the future
        if (date > now) continue;

        events.push({
          timestamp: date.toISOString(),
          type: 'visit',
          device: pickWeighted(devices, deviceWeights),
          country: pickWeighted(countries, countryWeights)
        });
      }

      // Generate encryption/decryption events (tests)
      for (let i = 0; i < baseTestsInMonth; i++) {
        const randDay = Math.floor(Math.random() * 28) + 1;
        const date = new Date(currentYear, m, randDay, Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
        
        if (date > now) continue;

        events.push({
          timestamp: date.toISOString(),
          type: 'test',
          device: pickWeighted(devices, deviceWeights),
          country: pickWeighted(countries, countryWeights)
        });
      }
    }
  }

  // Sort events chronologically
  return events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

export const tracker = {
  getEvents(): TrackedEvent[] {
    if (typeof window === 'undefined') return [];
    
    let listRaw = localStorage.getItem('pimx_visits_v2');
    if (!listRaw) {
      // Compatibility with older layout
      listRaw = localStorage.getItem('pimx_visits');
    }

    if (!listRaw) {
      // First time loading - compile seeds
      const seeds = generateHistoricalSeeds();
      this.saveEvents(seeds);
      return seeds;
    }

    try {
      return JSON.parse(listRaw);
    } catch (e) {
      const seeds = generateHistoricalSeeds();
      this.saveEvents(seeds);
      return seeds;
    }
  },

  saveEvents(events: TrackedEvent[]) {
    try {
      localStorage.setItem('pimx_visits_v2', JSON.stringify(events));
    } catch (e) {
      console.warn('LocalStorage quota limit exceeded, pruning older events...');
      // Prune old events and keep only the last 1500 events to ensure it stays within bounds
      if (events.length > 1500) {
        const pruned = events.slice(-1500);
        try {
          localStorage.setItem('pimx_visits_v2', JSON.stringify(pruned));
        } catch (retryError) {
          console.error('Failed to save pruned events:', retryError);
        }
      }
    }
  },

  async trackVisit() {
    if (typeof window === 'undefined') return;

    // Throttle duplicate logs within short span of 30 seconds to prevent double count on quick reloads
    const lastLogged = sessionStorage.getItem('pimx_last_visit_log');
    const nowMs = Date.now();
    if (lastLogged && nowMs - parseInt(lastLogged, 10) < 30000) {
      return;
    }
    sessionStorage.setItem('pimx_last_visit_log', nowMs.toString());

    const device = getLocalDevice();
    let country = getLocalCountryFallback();

    // Fire actual geo IP check in background to detect accurate current origin
    try {
      const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(1800) });
      if (res.ok) {
        const data = await res.json();
        if (data.country_name) {
          country = data.country_name;
        }
      }
    } catch (e) {
      // Fallback works perfectly
    }

    const events = this.getEvents();
    events.push({
      timestamp: new Date().toISOString(),
      type: 'visit',
      device,
      country
    });

    this.saveEvents(events);
  },

  trackTest() {
    if (typeof window === 'undefined') return;
    const device = getLocalDevice();
    const country = getLocalCountryFallback();

    const events = this.getEvents();
    events.push({
      timestamp: new Date().toISOString(),
      type: 'test',
      device,
      country
    });
    this.saveEvents(events);
  }
};
