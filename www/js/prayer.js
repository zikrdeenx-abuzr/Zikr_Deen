(function () {
  'use strict';
  const ZD = window.ZD, $ = ZD.$, esc = ZD.esc, icon = ZD.icon;
  const KEY = 'zd-prayer-v1';
  const IST = 5.5;
  const CITIES = [['Lucknow', 26.8467, 80.9462], ['Kanpur', 26.4499, 80.3319], ['Varanasi', 25.3176, 82.9739], ['Agra', 27.1767, 78.0081], ['Prayagraj', 25.4358, 81.8463], ['Meerut', 28.9845, 77.7064], ['Ghaziabad', 28.6692, 77.4538], ['Noida', 28.5355, 77.3910], ['Aligarh', 27.8974, 78.0880], ['Bareilly', 28.3670, 79.4304], ['Moradabad', 28.8386, 78.7733], ['Saharanpur', 29.9680, 77.5510], ['Deoband', 29.6930, 77.6770], ['Muzaffarnagar', 29.4727, 77.7085], ['Gorakhpur', 26.7606, 83.3732], ['Ayodhya', 26.7922, 82.1998], ['Jhansi', 25.4484, 78.5685], ['Mathura', 27.4924, 77.6737], ['Firozabad', 27.1591, 78.3957], ['Rampur', 28.8152, 79.0259], ['Sambhal', 28.5904, 78.5718], ['Bijnor', 29.3724, 78.1358], ['Amroha', 28.9033, 78.4670], ['Hapur', 28.7306, 77.7759], ['Bulandshahr', 28.4070, 77.8498], ['Azamgarh', 26.0685, 83.1859], ['Mau', 25.9417, 83.5611], ['Jaunpur', 25.7463, 82.6837], ['Mirzapur', 25.1337, 82.5644], ['Bahraich', 27.5743, 81.5947], ['Sitapur', 27.5680, 80.6820], ['Hardoi', 27.3955, 80.1313], ['Unnao', 26.5393, 80.4878], ['Raebareli', 26.2124, 81.2330], ['Sultanpur', 26.2648, 82.0727], ['Basti', 26.8000, 82.7300], ['Badaun', 28.0333, 79.1167], ['Shahjahanpur', 27.8800, 79.9100], ['Etawah', 26.7856, 79.0215], ['Banda', 25.4760, 80.3360], ['Lakhimpur Kheri', 27.9467, 80.7783]].sort((a, b) => a[0].localeCompare(b[0]));
  const WORLD = [['London', 51.5074, -0.1278, 'Europe/London', 'mwl', 'UK'], ['Birmingham', 52.4862, -1.8904, 'Europe/London', 'mwl', 'UK'], ['Paris', 48.8566, 2.3522, 'Europe/Paris', 'mwl', 'France'], ['Berlin', 52.52, 13.405, 'Europe/Berlin', 'mwl', 'Germany'], ['Oslo', 59.9139, 10.7522, 'Europe/Oslo', 'mwl', 'Norway'], ['Stockholm', 59.3293, 18.0686, 'Europe/Stockholm', 'mwl', 'Sweden'], ['Tromso', 69.6492, 18.9553, 'Europe/Oslo', 'mwl', 'Norway'], ['Reykjavik', 64.1466, -21.9426, 'Atlantic/Reykjavik', 'mwl', 'Iceland'], ['Istanbul', 41.0082, 28.9784, 'Europe/Istanbul', 'turkey', 'Turkey'], ['Ankara', 39.9334, 32.8597, 'Europe/Istanbul', 'turkey', 'Turkey'], ['Cairo', 30.0444, 31.2357, 'Africa/Cairo', 'egypt', 'Egypt'], ['Casablanca', 33.5731, -7.5898, 'Africa/Casablanca', 'mwl', 'Morocco'], ['Makkah', 21.3891, 39.8579, 'Asia/Riyadh', 'makkah', 'Saudi Arabia'], ['Madinah', 24.5247, 39.5692, 'Asia/Riyadh', 'makkah', 'Saudi Arabia'], ['Riyadh', 24.7136, 46.6753, 'Asia/Riyadh', 'makkah', 'Saudi Arabia'], ['Dubai', 25.2048, 55.2708, 'Asia/Dubai', 'gulf', 'UAE'], ['Doha', 25.2854, 51.531, 'Asia/Qatar', 'qatar', 'Qatar'], ['Kuwait City', 29.3759, 47.9774, 'Asia/Kuwait', 'kuwait', 'Kuwait'], ['Karachi', 24.8607, 67.0011, 'Asia/Karachi', 'karachi', 'Pakistan'], ['Lahore', 31.5204, 74.3587, 'Asia/Karachi', 'karachi', 'Pakistan'], ['Dhaka', 23.8103, 90.4125, 'Asia/Dhaka', 'karachi', 'Bangladesh'], ['Kuala Lumpur', 3.139, 101.6869, 'Asia/Kuala_Lumpur', 'jakim', 'Malaysia'], ['Singapore', 1.3521, 103.8198, 'Asia/Singapore', 'singapore', 'Singapore'], ['Jakarta', -6.2088, 106.8456, 'Asia/Jakarta', 'kemenag', 'Indonesia'], ['Tashkent', 41.2995, 69.2401, 'Asia/Tashkent', 'mwl', 'Uzbekistan'], ['Lagos', 6.5244, 3.3792, 'Africa/Lagos', 'mwl', 'Nigeria'], ['Johannesburg', -26.2041, 28.0473, 'Africa/Johannesburg', 'mwl', 'South Africa'], ['New York', 40.7128, -74.006, 'America/New_York', 'isna', 'USA'], ['Chicago', 41.8781, -87.6298, 'America/Chicago', 'isna', 'USA'], ['Los Angeles', 34.0522, -118.2437, 'America/Los_Angeles', 'isna', 'USA'], ['Toronto', 43.6532, -79.3832, 'America/Toronto', 'isna', 'Canada'], ['Sydney', -33.8688, 151.2093, 'Australia/Sydney', 'mwl', 'Australia']];
  const METHODS = { karachi: ['Karachi (Univ. of Islamic Sciences) — common in India', 18, 18], mwl: ['Muslim World League', 18, 17], isna: ['ISNA', 15, 15], egypt: ['Egyptian', 19.5, 17.5], makkah: ['Umm al-Qura (Makkah)', 18.5, '90m'], turkey: ['Diyanet (Turkey)', 18, 17], singapore: ['MUIS (Singapore)', 20, 18], jakim: ['JAKIM (Malaysia)', 20, 18], kemenag: ['Kemenag (Indonesia)', 20, 18], gulf: ['Gulf Region (UAE, Oman, Bahrain)', 19.5, '90m'], qatar: ['Qatar', 18, '90m'], kuwait: ['Kuwait', 18, 17.5] };
  const NAMES = [['fajr', 'Fajr', 'फ़ज्र'], ['sunrise', 'Sunrise', 'सूरज निकलना'], ['dhuhr', 'Zuhr', 'ज़ुहर'], ['asr', 'Asr', 'अस्र'], ['maghrib', 'Maghrib', 'मग़रिब'], ['isha', 'Isha', 'इशा']];
  const FARD = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

  const defaults = () => ({ city: 'Lucknow', lat: 26.8467, lng: 80.9462, tz: IST, tzName: 'Asia/Kolkata', label: 'Lucknow, Uttar Pradesh', method: 'karachi', asr: 2, off: { fajr: 0, sunrise: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 }, alarms: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true }, azan: false, notify: false, last: '' });
  let S = defaults();
  try {
    const r = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (r && typeof r === 'object') {
      S = Object.assign(defaults(), r, { off: Object.assign(defaults().off, r.off || {}), alarms: Object.assign(defaults().alarms, r.alarms || {}) });
    }
  } catch (_) {}
  const save = () => {
    try {
      localStorage.setItem(KEY, JSON.stringify(S));
    } catch (_) {}
  };

  const D = Math.PI / 180, sin = x => Math.sin(x * D), cos = x => Math.cos(x * D), tan = x => Math.tan(x * D);
  const asin = x => Math.asin(x) / D, acos = x => Math.acos(x) / D, acot = x => Math.atan(1 / x) / D, atan2 = (y, x) => Math.atan2(y, x) / D;
  const fix = (a, b) => { a = a - b * Math.floor(a / b); return a < 0 ? a + b : a; };

  function julian(y, m, d) {
    if (m <= 2) { y -= 1; m += 12; }
    const A = Math.floor(y / 100), B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5;
  }

  function sunPos(jd) {
    const d = jd - 2451545.0;
    const g = fix(357.529 + 0.98560028 * d, 360);
    const q = fix(280.459 + 0.98564736 * d, 360);
    const L = fix(q + 1.915 * sin(g) + 0.020 * sin(2 * g), 360);
    const e = 23.439 - 0.00000036 * d;
    const RA = fix(atan2(cos(e) * sin(L), cos(L)) / 15, 24);
    return { decl: asin(sin(e) * sin(L)), eqt: fix(q / 15 - RA + 12, 24) - 12 };
  }

  function compute(y, m, d, lat, lng, tz, method, asrFactor) {
    const jd0 = julian(y, m, d) - lng / (15 * 24), M = METHODS[method] || METHODS.karachi;
    const mid = t => fix(12 - sunPos(jd0 + t).eqt, 24);
    const ang = (a, t, ccw) => {
      const dc = sunPos(jd0 + t).decl, noon = mid(t), x = (-sin(a) - sin(dc) * sin(lat)) / (cos(dc) * cos(lat));
      if (Math.abs(x) > 1) return NaN;
      return noon + (ccw ? -1 : 1) * acos(x) / 15;
    };
    const asrT = (f, t) => {
      const dc = sunPos(jd0 + t).decl;
      return ang(-acot(f + tan(Math.abs(lat - dc))), t, false);
    };
    let t = { fajr: 5 / 24, sunrise: 6 / 24, dhuhr: 0.5, asr: 13 / 24, sunset: 18 / 24, isha: 18 / 24 };
    for (let i = 0; i < 2; i++) {
      const r = { fajr: ang(M[1], t.fajr, true), sunrise: ang(0.833, t.sunrise, true), dhuhr: mid(t.dhuhr), asr: asrT(asrFactor, t.asr), sunset: ang(0.833, t.sunset, false) };
      r.isha = typeof M[2] === 'string' ? r.sunset + parseInt(M[2], 10) / 60 : ang(M[2], t.isha, false);
      Object.keys(r).forEach(k => { t[k] = r[k] / 24; });
      if (i === 1) {
        if (isFinite(r.sunrise) && isFinite(r.sunset)) {
          const night = fix(r.sunrise - r.sunset, 24), pF = night * M[1] / 60;
          if (!isFinite(r.fajr) || fix(r.sunrise - r.fajr, 24) > pF) r.fajr = r.sunrise - pF;
          if (typeof M[2] !== 'string') {
            const pI = night * M[2] / 60;
            if (!isFinite(r.isha) || fix(r.isha - r.sunset, 24) > pI) r.isha = r.sunset + pI;
          } else if (!isFinite(r.isha)) {
            r.isha = r.sunset + parseInt(M[2], 10) / 60;
          }
        }
        const adj = tz - lng / 15, o = {};
        Object.keys(r).forEach(k => { o[k] = r[k] + adj; });
        o.maghrib = o.sunset;
        delete o.sunset;
        return o;
      }
    }
  }

  function offAt(ms, zn) {
    const z = zn === undefined ? S.tzName : zn;
    if (z) {
      try {
        const p = new Intl.DateTimeFormat('en-US', { timeZone: z, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' }).formatToParts(new Date(ms));
        const g = t => +p.find(x => x.type === t).value;
        return (Date.UTC(g('year'), g('month') - 1, g('day'), g('hour'), g('minute'), g('second')) - Math.floor(ms / 1000) * 1000) / 3600000;
      } catch (_) {}
    }
    return S.tz;
  }
  const tzAt = (y, m, d, zn) => offAt(Date.UTC(y, m - 1, d, 12), zn);
  ZD.prayerCalc = { compute, METHODS, WORLD, offAt, tzAt };

  function dayTimes(y, m, d) {
    const tz = tzAt(y, m, d), raw = compute(y, m, d, S.lat, S.lng, tz, S.method, S.asr), out = {};
    NAMES.forEach(([k]) => {
      let h = raw[k];
      if (!isFinite(h)) { out[k] = null; return; }
      h += (S.off[k] || 0) / 60;
      out[k] = { h, date: new Date(Date.UTC(y, m - 1, d) + (h - tz) * 3600000) };
    });
    return out;
  }

  function fmt(h) {
    h = fix(h, 24);
    let m = Math.round(h * 60), hh = Math.floor(m / 60) % 24;
    m %= 60;
    const ap = hh >= 12 ? 'PM' : 'AM', h12 = hh % 12 || 12;
    return h12 + ':' + String(m).padStart(2, '0') + ' ' + ap;
  }

  function placeNow() {
    const n = new Date(Date.now() + offAt(Date.now()) * 3600000);
    return { y: n.getUTCFullYear(), m: n.getUTCMonth() + 1, d: n.getUTCDate() };
  }

  function nextPrayer() {
    const p = placeNow(), now = Date.now(), t = dayTimes(p.y, p.m, p.d);
    for (const k of FARD) {
      if (t[k] && t[k].date.getTime() > now) return { k, date: t[k].date, h: t[k].h };
    }
    const n = new Date(Date.UTC(p.y, p.m - 1, p.d) + 864e5);
    const tt = dayTimes(n.getUTCFullYear(), n.getUTCMonth() + 1, n.getUTCDate());
    return tt.fajr ? { k: 'fajr', date: tt.fajr.date, h: tt.fajr.h } : null;
  }

  function currentPrayer() {
    const p = placeNow(), now = Date.now(), t = dayTimes(p.y, p.m, p.d);
    let cur = null;
    FARD.forEach(k => { if (t[k] && t[k].date.getTime() <= now) cur = k; });
    return cur;
  }

  const nameOf = k => (NAMES.find(n => n[0] === k) || [])[1] || k;
  const hiOf = k => (NAMES.find(n => n[0] === k) || [])[2] || '';
  function left(ms) {
    ms = Math.max(0, ms);
    const s = Math.floor(ms / 1000), h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), sec = s % 60;
    return h ? h + 'h ' + String(m).padStart(2, '0') + 'm' : m + 'm ' + String(sec).padStart(2, '0') + 's';
  }

  const NATIVE = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
  const LN = () => window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications;
  const AA = () => window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AzanAlarm;

  let schedT = 0, schedBusy = false, schedQueued = false;
  let nativeStatus = null;

  async function refreshNativeStatus() {
    const aa = AA();
    if (!NATIVE || !aa || typeof aa.checkStatus !== 'function') return null;
    try {
      nativeStatus = await aa.checkStatus();
      updateStatusUI();
      return nativeStatus;
    } catch (_) {
      return null;
    }
  }

  function updateStatusUI() {
    const box = $('#pzStatusBox');
    const stopBtn = $('#pzStop');
    if (stopBtn && nativeStatus && nativeStatus.playing) stopBtn.hidden = false;
    if (!box || !nativeStatus) return;
    const exOk = nativeStatus.exactAllowed !== false;
    const batOk = nativeStatus.batteryIgnored === true;
    const audOk = nativeStatus.hasAzanAudio !== false;
    let html = '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:10px">';
    html += '<span class="chip" style="border-color:' + (exOk ? '#22c55e' : '#ef4444') + '">' + (exOk ? '✅ Exact Alarm ON' : '⚠️ Exact Alarm बंद है') + '</span>';
    html += '<span class="chip" style="border-color:' + (batOk ? '#22c55e' : '#f59e0b') + '">' + (batOk ? '✅ Battery Unrestricted' : '⚠️ Battery Restricted') + '</span>';
    html += '<span class="chip" style="border-color:' + (audOk ? '#22c55e' : '#ef4444') + '">' + (audOk ? '🔊 Azan Audio Ready' : '⚠️ Azan Audio Missing') + '</span>';
    html += '</div>';
    if (!exOk || !batOk) {
      html += '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">';
      if (!exOk) html += '<button type="button" class="btn sm" id="pzFixExact">Exact Alarm Allow करें</button>';
      if (!batOk) html += '<button type="button" class="btn sm ghost" id="pzFixBat">Battery Unrestricted करें</button>';
      html += '</div>';
    }
    box.innerHTML = html;
    const bx = $('#pzFixExact');
    if (bx) bx.addEventListener('click', async () => {
      const aa = AA();
      if (aa && aa.openExactAlarmSettings) await aa.openExactAlarmSettings();
    });
    const bb = $('#pzFixBat');
    if (bb) bb.addEventListener('click', async () => {
      const aa = AA();
      if (aa && aa.openBatterySettings) await aa.openBatterySettings();
    });
  }

  function buildAlarmList() {
    const p0 = placeNow(), now = Date.now(), list = [];
    for (let off = 0; off < 14; off++) {
      const base = new Date(Date.UTC(p0.y, p0.m - 1, p0.d) + off * 864e5);
      const t = dayTimes(base.getUTCFullYear(), base.getUTCMonth() + 1, base.getUTCDate());
      FARD.forEach((k, i) => {
        if (S.alarms && S.alarms[k] === false) return;
        const x = t[k];
        if (!x || x.date.getTime() <= now + 3000) return;
        list.push({
          id: off * 10 + i + 1,
          timeMs: x.date.getTime(),
          date: x.date,
          prayer: k,
          title: nameOf(k) + ' ka waqt ho gaya',
          body: hiOf(k) + ' · ' + S.label,
          azan: !!S.azan
        });
      });
    }
    return list;
  }

  function scheduleNative(ask) {
    if (!NATIVE) return;
    clearTimeout(schedT);
    schedT = setTimeout(() => doSchedule(!!ask), 500);
  }

  async function cancelLegacyLocalNotifs(ln) {
    if (!ln) return;
    try {
      const pend = await ln.getPending();
      if (pend && pend.notifications && pend.notifications.length) {
        await ln.cancel({ notifications: pend.notifications.map(n => ({ id: n.id })) });
      }
    } catch (_) {}
  }

  async function doSchedule(ask) {
    if (schedBusy) {
      schedQueued = true;
      return;
    }
    schedBusy = true;
    const ln = LN();
    const aa = AA();
    try {
      await cancelLegacyLocalNotifs(ln);

      if (aa && typeof aa.schedule === 'function') {
        if (!S.azan && !S.notify) {
          await aa.cancelAll();
          await refreshNativeStatus();
          return;
        }
        if (ln) {
          try {
            let pm = await ln.checkPermissions();
            if (pm.display !== 'granted' && ask) {
              pm = await ln.requestPermissions();
            }
          } catch (_) {}
        }
        const alarms = buildAlarmList().map(x => ({
          id: x.id,
          timeMs: x.timeMs,
          prayer: x.prayer,
          title: x.title,
          body: x.body,
          azan: x.azan
        }));
        const res = await aa.schedule({ alarms });
        if (ask && res && res.exactAllowed === false) {
          ZD.toast('Exact Alarm की अनुमति चालू करें ताकि स्लीप मोड में समय पर अज़ान बजे');
        }
        await refreshNativeStatus();
        return;
      }

      if (!ln) return;
      if (!S.azan && !S.notify) return;
      let pm = await ln.checkPermissions();
      if (pm.display !== 'granted') {
        if (!ask) return;
        pm = await ln.requestPermissions();
        if (pm.display !== 'granted') {
          ZD.toast('Notification permission allow karein');
          return;
        }
      }
      if (ask) {
        try {
          const ex = await ln.checkExactNotificationSetting();
          if (ex && ex.exact_alarm && ex.exact_alarm !== 'granted') await ln.changeExactNotificationSetting();
        } catch (_) {}
      }
      const ch = S.azan ? 'azan-v2' : 'prayer-v2';
      const cfg = { id: ch, name: S.azan ? 'Azan (namaz ke waqt)' : 'Namaz reminder', description: 'Paanch waqt ki namaz', importance: 5, visibility: 1, vibration: true };
      if (S.azan) cfg.sound = 'azan.mp3';
      try { await ln.createChannel(cfg); } catch (_) {}
      const list = buildAlarmList().map(x => ({
        id: x.id,
        title: x.title,
        body: x.body,
        channelId: ch,
        schedule: { at: x.date, allowWhileIdle: true }
      }));
      if (list.length) await ln.schedule({ notifications: list });
    } catch (e) {
      console.error('schedule', e);
    } finally {
      schedBusy = false;
      if (schedQueued) {
        schedQueued = false;
        scheduleNative(false);
      }
    }
  }

  async function nativeTest() {
    const ln = LN();
    const aa = AA();
    try {
      if (ln) {
        let pm = await ln.checkPermissions();
        if (pm.display !== 'granted') pm = await ln.requestPermissions();
        if (pm.display !== 'granted') {
          ZD.toast('Notification permission allow karein');
          return;
        }
      }
      const useAzan = S.azan || !S.notify;
      if (aa && typeof aa.testAlarm === 'function') {
        const res = await aa.testAlarm({
          delayMs: 10000,
          azan: useAzan,
          title: useAzan ? 'Test: Azan Alarm' : 'Test: Namaz Reminder',
          body: useAzan ? 'बंद स्क्रीन / स्लीप मोड अज़ान अलार्म टेस्ट' : 'यह 10 सेकंड का रिमाइंडर टेस्ट है'
        });
        if (res && res.exactAllowed === false) {
          ZD.toast('10 सेकंड का टेस्ट लगा — सही समय के लिए नीचे Exact Alarm भी Allow करें');
        } else {
          ZD.toast('10 सेकंड में अज़ान अलार्म बजेगा — अभी स्क्रीन बंद (लॉक) करके टेस्ट करें');
        }
        await refreshNativeStatus();
        return;
      }
      if (!ln) return;
      const ch = useAzan ? 'azan-v2' : 'prayer-v2';
      const cfg = { id: ch, name: useAzan ? 'Azan (namaz ke waqt)' : 'Namaz reminder', importance: 5, visibility: 1, vibration: true };
      if (useAzan) cfg.sound = 'azan.mp3';
      try { await ln.createChannel(cfg); } catch (_) {}
      await ln.schedule({ notifications: [{ id: 9999, title: 'Test: azan notification', body: 'Yeh 10 second wali test hai', channelId: ch, schedule: { at: new Date(Date.now() + 10000), allowWhileIdle: true } }] });
      ZD.toast('10 second mein notification aayegi — app band kar ke dekhein');
    } catch (_) {
      ZD.toast('Test nahi ho paya');
    }
  }

  if (NATIVE) {
    setTimeout(() => {
      scheduleNative(false);
      refreshNativeStatus();
    }, 2000);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        scheduleNative(false);
        refreshNativeStatus();
      }
    });
  }

  let audio = null;
  function playAzan() {
    try {
      if (!audio) {
        audio = new Audio('./audio/azan-intro.mp3');
        audio.preload = 'auto';
        audio.addEventListener('ended', () => {
          const b = $('#pzStop');
          if (b && !(nativeStatus && nativeStatus.playing)) b.hidden = true;
        });
      }
      audio.currentTime = 0;
      const pr = audio.play();
      if (pr && pr.catch) pr.catch(() => ZD.toast('Azan baj nahi paya — pehle screen par ek baar tap karein'));
    } catch (_) {}
    const b = $('#pzStop');
    if (b) b.hidden = false;
  }

  function stopAzan() {
    try {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    } catch (_) {}
    const aa = AA();
    if (NATIVE && aa && typeof aa.stopAzan === 'function') {
      aa.stopAzan().then(() => refreshNativeStatus()).catch(() => {});
    }
    const b = $('#pzStop');
    if (b) b.hidden = true;
  }

  window.addEventListener('zd-background', () => {
    if (NATIVE && audio && !audio.paused) {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch (_) {}
    }
  });

  function notify(k) {
    if (!S.notify || typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
    const title = nameOf(k) + ' ka waqt ho gaya', opt = { body: S.label + ' · ' + hiOf(k), icon: './icons/icon-192.png', tag: 'zd-' + k };
    try {
      if (navigator.serviceWorker && navigator.serviceWorker.ready) {
        navigator.serviceWorker.ready.then(r => r.showNotification(title, opt)).catch(() => new Notification(title, opt));
      } else {
        new Notification(title, opt);
      }
    } catch (_) {}
  }

  function tick() {
    const p = placeNow(), t = dayTimes(p.y, p.m, p.d), now = Date.now();
    FARD.forEach(k => {
      const x = t[k];
      if (!x) return;
      const diff = now - x.date.getTime(), id = p.y + '-' + p.m + '-' + p.d + '-' + k;
      if (diff >= 0 && diff < 90000 && S.last !== id) {
        S.last = id;
        save();
        if (!NATIVE && (!S.alarms || S.alarms[k] !== false)) {
          if (S.azan) playAzan();
          notify(k);
        }
        const c = $('#pzCard');
        if (c) c.outerHTML = ZD.prayerHTML();
      }
    });
    const n = nextPrayer();
    ZD.$$('[data-pz-count]').forEach(el => {
      if (n) el.textContent = left(n.date.getTime() - now);
    });
  }
  setInterval(tick, 1000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(); });

  const PICO = { fajr: '🌅', dhuhr: '☀️', asr: '🌤️', maghrib: '🌇', isha: '🌙' };
  ZD.prayerHTML = function () {
    const p = placeNow(), t = dayTimes(p.y, p.m, p.d), n = nextPrayer();
    if (!t.fajr) return '';
    const activeOn = S.azan || S.notify;
    const cells = FARD.map(k => {
      const on = activeOn && S.alarms[k] !== false;
      return '<div class="pz-c' + (n && n.k === k ? ' next' : '') + '"><span>' + nameOf(k) + '</span><b>' + (t[k] ? fmt(t[k].h) : '—') + '</b><em class="pz-bell' + (on ? ' on' : '') + '">' + (on ? '🔔' : '🔕') + '</em></div>';
    }).join('');
    const alarmRows = FARD.map(k => {
      const on = activeOn && S.alarms[k] !== false;
      return '<div class="pa-row"><span class="pa-ico">' + PICO[k] + '</span><div class="pa-mid"><b>' + nameOf(k) + ' <small class="muted">' + hiOf(k) + '</small></b><span>' + (t[k] ? fmt(t[k].h) : '—') + '</span></div><button type="button" class="switch" data-pa="' + k + '" role="switch" aria-checked="' + on + '" aria-label="' + nameOf(k) + ' alarm"></button></div>';
    }).join('');
    return '<section class="block card pz-card" id="pzCard">' +
      '<a class="pz-top" href="#/prayer" style="text-decoration:none;color:inherit"><div><div class="muted small">Agli namaz · ' + esc(S.city) + '</div><div class="pz-next">' + (n ? nameOf(n.k) + ' <small>' + hiOf(n.k) + '</small>' : '') + '</div></div><div class="pz-right"><b>' + (n ? fmt(n.h) : '') + '</b><span class="muted small">baqi <i data-pz-count>' + (n ? left(n.date.getTime() - Date.now()) : '') + '</i></span></div></a>' +
      '<a class="pz-row" href="#/prayer" style="text-decoration:none;color:inherit">' + cells + '</a>' +
      '<details class="pa-box"><summary class="pa-sum"><span>🔔 Prayer Alarm (Fajr, Zuhr, Asr, Maghrib, Isha)</span><span class="pa-pill">' + (activeOn ? FARD.filter(k => S.alarms[k] !== false).length + '/5 ON' : 'OFF') + '</span></summary><div class="pa-list">' + alarmRows + '</div></details>' +
      '</section>';
  };

  document.addEventListener('click', e => {
    const sw = e.target.closest('[data-pa]');
    if (!sw) return;
    e.preventDefault();
    e.stopPropagation();
    const k = sw.dataset.pa;
    const wasMaster = S.azan || S.notify;
    const curOn = wasMaster && S.alarms[k] !== false;
    if (!curOn) {
      if (!wasMaster) {
        S.azan = true;
        S.notify = false;
      }
      S.alarms[k] = true;
    } else {
      S.alarms[k] = false;
      if (FARD.every(x => S.alarms[x] === false)) {
        S.azan = false;
        S.notify = false;
      }
    }
    save();
    scheduleNative(true);
    const on = (S.azan || S.notify) && S.alarms[k] !== false;
    sw.setAttribute('aria-checked', String(on));
    const card = $('#pzCard');
    if (card) {
      const open = !!card.querySelector('.pa-box[open]');
      card.outerHTML = ZD.prayerHTML();
      if (open) {
        const d = $('#pzCard .pa-box');
        if (d) d.open = true;
      }
    }
    ZD.toast(nameOf(k) + ' alarm ' + (on ? 'ON 🔔' : 'OFF 🔕'));
  });

  const sel = (id, opts, val) => '<select id="' + id + '" style="max-width:62%">' + opts.map(o => '<option value="' + esc(o[0]) + '"' + (String(o[0]) === String(val) ? ' selected' : '') + '>' + esc(o[1]) + '</option>').join('') + '</select>';

  ZD.R.prayer = function () {
    const v = $('#view'), p = placeNow(), t = dayTimes(p.y, p.m, p.d), n = nextPrayer(), cur = currentPrayer();
    const dateStr = new Intl.DateTimeFormat('en', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(p.y, p.m - 1, p.d)));
    let hj = '';
    try {
      hj = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(p.y, p.m - 1, p.d, 12)));
    } catch (_) {}
    const rows = NAMES.map(([k, en, hi]) => {
      const x = t[k], isN = n && n.k === k, isC = cur === k;
      return '<tr class="' + (isN ? 'pz-hl' : '') + '"><td><b>' + en + '</b> <span class="muted small">' + hi + '</span>' + (isC ? ' <em class="pz-tag">ab</em>' : '') + (isN ? ' <em class="pz-tag">agli</em>' : '') + '</td><td style="text-align:right;font-weight:600">' + (x ? fmt(x.h) : '—') + '</td></tr>';
    }).join('');
    const offs = NAMES.map(([k, en]) => '<div class="field"><label for="pzo-' + k + '">' + en + ' (minute +/−)</label><input id="pzo-' + k + '" data-off="' + k + '" type="number" min="-30" max="30" value="' + (S.off[k] || 0) + '" style="width:84px"></div>').join('');
    const showStop = !!(audio && !audio.paused) || !!(nativeStatus && nativeStatus.playing);

    v.innerHTML = '<header class="topbar"><button type="button" class="ibtn" data-act="back" aria-label="Back">' + icon('back') + '</button><h1>Namaz Timings<span class="sub">' + esc(dateStr) + (hj ? ' · ' + esc(hj) : '') + '</span></h1></header><main>' +
      '<section class="block card"><div class="muted small">' + esc(S.label) + '</div>' + (n ? '<div class="pz-big">' + nameOf(n.k) + ' <small>' + hiOf(n.k) + '</small></div><div class="muted">' + fmt(n.h) + ' · baqi <b data-pz-count>' + left(n.date.getTime() - Date.now()) + '</b></div>' : '') +
      '<table class="tbl" style="margin-top:12px">' + rows + '</table>' + (t.fajr ? '' : '<p class="muted small">Is jagah par Fajr/Isha ka angle nahi milta (bahut uttar mein). Method badal kar dekhein.</p>') +
      '<p class="muted small" style="margin-bottom:0">Waqt hisaab se nikle hain (location + method). Apni masjid ke timetable se thoda farq ho sakta hai — neeche minute adjust kar sakte hain.</p></section>' +
      '<section class="block card"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><h2 class="h2" style="margin:0">🔔 Prayer Alarms</h2><div style="display:flex;gap:6px"><button type="button" class="btn sm ghost" id="paAllOn">Sab ON</button><button type="button" class="btn sm ghost" id="paAllOff">Sab OFF</button></div></div>' +
      FARD.map(k => {
        const on = (S.azan || S.notify) && S.alarms[k] !== false;
        return '<div class="pa-row"><span class="pa-ico">' + PICO[k] + '</span><div class="pa-mid"><b>' + nameOf(k) + ' <small class="muted">' + hiOf(k) + '</small></b><span>' + (t[k] ? fmt(t[k].h) : '—') + '</span></div><button type="button" class="switch" data-pa-page="' + k + '" role="switch" aria-checked="' + on + '" aria-label="' + nameOf(k) + ' alarm"></button></div>';
      }).join('') +
      '</section>' +
      '<section class="block card"><h2 class="h2">Azan &amp; Sound</h2>' +
      '<div class="field"><label>Namaz ke waqt azan bajao<br><span class="muted small">' + (NATIVE ? 'Phone sleep mode / screen off par bhi alarm ki tarah bajegi' : 'App khula ho tab hi bajta hai') + '</span></label><button type="button" class="switch" id="pzAzan" role="switch" aria-checked="' + S.azan + '" aria-label="Play azan at prayer time"></button></div>' +
      '<div class="field"><label>Notification<br><span class="muted small">' + (NATIVE ? 'Bina azan awaaz ke, sirf yaad dilana' : 'Browser ki permission chahiye') + '</span></label><button type="button" class="switch" id="pzNote" role="switch" aria-checked="' + S.notify + '" aria-label="Prayer notification"></button></div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><button type="button" class="btn sm" id="pzTry">' + icon('play') + ' Azan sunein</button><button type="button" class="btn sm ghost" id="pzStop"' + (showStop ? '' : ' hidden') + '>Azan Rokein</button>' + (NATIVE ? '<button type="button" class="btn sm ghost" id="pzNTest">Test Alarm (10 sec)</button>' : '') + '</div>' +
      (NATIVE ? '<div id="pzStatusBox"></div><p class="muted small" style="margin:12px 0 0">अलार्म वॉल्यूम बढ़ाकर रखें। अगर फ़ोन में बैटरी सेवर चालू हो तो ऊपर दिए बटन से Battery Unrestricted कर दें ताकि स्लीप मोड में भी अज़ान समय पर बजे।</p>' : '') +
      '</section>' +
      '<section class="block card"><h2 class="h2">Jagah &amp; method</h2>' +
      '<div class="field"><label for="pzCity">Shehar / City</label>' + sel('pzCity', CITIES.map(c => [c[0], c[0] + ' (UP, India)']).concat(WORLD.map(c => [c[0], c[0] + ' (' + c[5] + ')'])).concat([['__gps', '📍 Meri location (GPS)']]), S.city === 'GPS' ? '__gps' : S.city) + '</div>' +
      '<div class="field"><label for="pzMeth">Calculation method</label>' + sel('pzMeth', Object.keys(METHODS).map(k => [k, METHODS[k][0]]), S.method) + '</div>' +
      '<div class="field"><label for="pzAsr">Asr</label>' + sel('pzAsr', [[2, 'Hanafi (saya 2×) — UP mein aam'], [1, 'Shafi / Maliki / Hanbali (saya 1×)']], S.asr) + '</div>' +
      '<details style="margin-top:8px"><summary class="muted small" style="min-height:44px;display:flex;align-items:center">Minute adjust (masjid ke hisaab se)</summary>' + offs + '</details></section></main>';

    const redraw = () => {
      save();
      scheduleNative(false);
      ZD.R.prayer();
    };

    ZD.$$('[data-pa-page]').forEach(b => b.addEventListener('click', () => {
      const k = b.dataset.paPage, wasM = S.azan || S.notify, curOn = wasM && S.alarms[k] !== false;
      if (!curOn) {
        if (!wasM) {
          S.azan = true;
          S.notify = false;
        }
        S.alarms[k] = true;
      } else {
        S.alarms[k] = false;
        if (FARD.every(x => S.alarms[x] === false)) {
          S.azan = false;
          S.notify = false;
        }
      }
      save();
      scheduleNative(true);
      ZD.toast(nameOf(k) + ' alarm ' + (!curOn ? 'ON 🔔' : 'OFF 🔕'));
      ZD.R.prayer();
    }));

    $('#paAllOn').addEventListener('click', () => {
      S.azan = true;
      S.notify = false;
      FARD.forEach(k => { S.alarms[k] = true; });
      save();
      scheduleNative(true);
      ZD.toast('Paanchon namaz ke azan alarm ON 🔔');
      ZD.R.prayer();
    });

    $('#paAllOff').addEventListener('click', () => {
      S.azan = false;
      S.notify = false;
      FARD.forEach(k => { S.alarms[k] = false; });
      save();
      scheduleNative(false);
      ZD.toast('Sabhi namaz alarm OFF 🔕');
      ZD.R.prayer();
    });

    $('#pzAzan').addEventListener('click', e => {
      S.azan = !S.azan;
      if (S.azan) {
        S.notify = false;
        if (FARD.every(x => S.alarms[x] === false)) FARD.forEach(k => { S.alarms[k] = true; });
      }
      save();
      e.currentTarget.setAttribute('aria-checked', String(S.azan));
      if (S.azan) ZD.toast(NATIVE ? 'Azan Alarm ON — बंद स्क्रीन पर भी बजेगी' : 'Azan ON — app khula rakhein');
      scheduleNative(true);
      ZD.R.prayer();
    });

    $('#pzNote').addEventListener('click', async e => {
      const b = e.currentTarget;
      if (NATIVE) {
        S.notify = !S.notify;
        if (S.notify) {
          S.azan = false;
          if (FARD.every(x => S.alarms[x] === false)) FARD.forEach(k => { S.alarms[k] = true; });
        }
        save();
        b.setAttribute('aria-checked', String(S.notify));
        scheduleNative(true);
        ZD.R.prayer();
        return;
      }
      if (S.notify) {
        S.notify = false;
        save();
        b.setAttribute('aria-checked', 'false');
        return;
      }
      if (typeof Notification === 'undefined') {
        ZD.toast('Is browser mein notification nahi hai');
        return;
      }
      let pm = Notification.permission;
      if (pm === 'default') {
        try { pm = await Notification.requestPermission(); } catch (_) {}
      }
      if (pm === 'granted') {
        S.notify = true;
        save();
        b.setAttribute('aria-checked', 'true');
        ZD.toast('Notification ON');
      } else {
        ZD.toast('Permission nahi mili — browser settings mein allow karein');
      }
    });

    $('#pzTry').addEventListener('click', playAzan);
    if ($('#pzNTest')) $('#pzNTest').addEventListener('click', nativeTest);
    $('#pzStop').addEventListener('click', stopAzan);
    $('#pzMeth').addEventListener('change', e => { S.method = e.target.value; redraw(); });
    $('#pzAsr').addEventListener('change', e => { S.asr = +e.target.value; redraw(); });
    $('#pzCity').addEventListener('change', e => {
      const val = e.target.value;
      if (val === '__gps') {
        if (!navigator.geolocation) {
          ZD.toast('GPS available nahi hai');
          return;
        }
        ZD.toast('Location dhoondh raha hoon…');
        navigator.geolocation.getCurrentPosition(pos => {
          S.city = 'GPS';
          S.lat = pos.coords.latitude;
          S.lng = pos.coords.longitude;
          S.tz = -new Date().getTimezoneOffset() / 60;
          try { S.tzName = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (_) { S.tzName = ''; }
          S.label = 'Meri location (' + S.lat.toFixed(2) + ', ' + S.lng.toFixed(2) + ')';
          redraw();
        }, () => {
          ZD.toast('Location nahi mili — shehar list se chunein');
          ZD.R.prayer();
        }, { timeout: 15000, maximumAge: 600000 });
        return;
      }
      const w = WORLD.find(x => x[0] === val);
      if (w) {
        S.city = w[0];
        S.lat = w[1];
        S.lng = w[2];
        S.tzName = w[3];
        S.tz = offAt(Date.now());
        S.method = w[4];
        S.label = w[0] + ', ' + w[5];
        ZD.toast('Method suggest hua: ' + METHODS[w[4]][0] + ' (badal sakte hain)');
        redraw();
        return;
      }
      const c = CITIES.find(x => x[0] === val);
      if (c) {
        S.city = c[0];
        S.lat = c[1];
        S.lng = c[2];
        S.tz = IST;
        S.tzName = 'Asia/Kolkata';
        S.label = c[0] + ', Uttar Pradesh';
        redraw();
      }
    });

    ZD.$$('[data-off]').forEach(i => i.addEventListener('change', () => {
      S.off[i.dataset.off] = Math.max(-30, Math.min(30, Math.round(+i.value) || 0));
      redraw();
    }));

    if (NATIVE) refreshNativeStatus();
    window.scrollTo(0, 0);
  };

  ZD.prayerDebug = { compute: dayTimes, fmt, S: () => S };
})();
