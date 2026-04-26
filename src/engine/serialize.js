// Encode/decode patient state into a URL-safe string for sharing.
// Stores ONLY non-empty / non-default values to keep URLs short.

// Strip undefined/null/'unknown' values so the URL only carries what's set.
function compact(obj) {
  if (Array.isArray(obj)) return obj;
  if (obj === null || typeof obj !== 'object') return obj;
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null || v === 'unknown') continue;
    if (typeof v === 'object') {
      const sub = compact(v);
      if (sub && Object.keys(sub).length > 0) out[k] = sub;
    } else {
      out[k] = v;
    }
  }
  return out;
}

// URL-safe base64 (no +, /, = chars)
function b64urlEncode(str) {
  // btoa needs Latin-1 only; our payload is JSON ASCII so safe
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function b64urlDecode(str) {
  const pad = (4 - (str.length % 4)) % 4;
  return atob(str.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat(pad));
}

export function serializePatient(patient) {
  const compactPatient = compact(patient);
  if (Object.keys(compactPatient).length === 0) return '';
  return b64urlEncode(JSON.stringify(compactPatient));
}

export function deserializePatient(str, basePatient) {
  if (!str) return basePatient;
  try {
    const parsed = JSON.parse(b64urlDecode(str));
    // Deep-merge into base (so all expected keys exist)
    return mergePatient(basePatient, parsed);
  } catch (err) {
    console.warn('Failed to deserialize patient from URL:', err);
    return basePatient;
  }
}

function mergePatient(base, partial) {
  const out = { ...base };
  for (const [k, v] of Object.entries(partial)) {
    if (v && typeof v === 'object' && !Array.isArray(v) && base[k] && typeof base[k] === 'object') {
      out[k] = { ...base[k], ...v };
    } else {
      out[k] = v;
    }
  }
  return out;
}

// Build a shareable URL for the current patient. Uses the page's own URL so it
// works on localhost in dev and at the deployed GitHub Pages URL in production.
export function buildShareUrl(patient) {
  const encoded = serializePatient(patient);
  const base = window.location.origin + window.location.pathname;
  return encoded ? `${base}?p=${encoded}` : base;
}

// Read patient from current URL on app load.
export function readPatientFromUrl(basePatient) {
  if (typeof window === 'undefined') return basePatient;
  const params = new URLSearchParams(window.location.search);
  const p = params.get('p');
  return p ? deserializePatient(p, basePatient) : basePatient;
}
