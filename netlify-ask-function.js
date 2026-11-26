// OPTIONAL (zyada safe): isse API key APK me nahi, Netlify server par rehti hai.
// 1) Apni Netlify site ke repo me ye file rakhein:  netlify/functions/ask.js
// 2) Netlify > Site settings > Environment variables:
//      GEMINI_API_KEY = aapki key
//      ALLOWED_ORIGINS = https://localhost,capacitor://localhost,https://APKI-SITE.netlify.app   (comma se alag)
//      ASK_PER_MIN = 12   (optional, har IP ke liye)
//      ASK_DAILY_TOTAL = 3000   (optional, poori site ke liye)
// 3) www/js/ask-config.js me proxy:'https://APKI-SITE.netlify.app/.netlify/functions/ask' likhein
// NOTE: yeh counters ek function instance ki memory me hain (best-effort). Pakka limit ke liye Google AI Studio me key par budget limit bhi lagayein.
const hits = new Map();
let day = '', dayCount = 0;
const MODEL_OK = /^(gemini-[a-z0-9.\-]+)$/;
exports.handler = async (event) => {
  const origin = (event.headers && (event.headers.origin || event.headers.Origin)) || '';
  const allowed = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  const originOk = !allowed.length || allowed.includes(origin);
  const cors = { 'Access-Control-Allow-Origin': originOk && origin ? origin : (allowed[0] || '*'), 'Vary': 'Origin', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
  const err = (code, msg) => ({ statusCode: code, headers: { ...cors, 'Content-Type': 'application/json' }, body: JSON.stringify({ error: { message: msg } }) });
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: cors, body: '' };
  if (!originOk) return err(403, 'origin not allowed');
  if ((event.body || '').length > 200000) return err(413, 'request too large');
  const ip = (event.headers && (event.headers['x-nf-client-connection-ip'] || event.headers['x-forwarded-for'] || '')).split(',')[0].trim() || 'unknown';
  const now = Date.now(), perMin = Number(process.env.ASK_PER_MIN || 12);
  const arr = (hits.get(ip) || []).filter(t => now - t < 60000);
  if (arr.length >= perMin) return err(429, 'too many requests, thodi der baad try karein');
  arr.push(now); hits.set(ip, arr);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some(t => now - t < 60000)) hits.delete(k);
  const today = new Date().toISOString().slice(0, 10);
  if (day !== today) { day = today; dayCount = 0; }
  if (++dayCount > Number(process.env.ASK_DAILY_TOTAL || 3000)) return err(429, 'daily limit reached');
  try {
    const body = JSON.parse(event.body || '{}');
    const model = String(body.model || 'gemini-flash-latest').replace(/[^a-zA-Z0-9.\-]/g, '');
    if (!MODEL_OK.test(model)) return err(400, 'bad model');
    delete body.model;
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
      body: JSON.stringify(body)
    });
    return { statusCode: r.status, headers: { ...cors, 'Content-Type': 'application/json' }, body: await r.text() };
  } catch (e) {
    return err(500, String(e));
  }
};
