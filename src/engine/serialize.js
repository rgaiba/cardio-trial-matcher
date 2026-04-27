// Privacy: this module previously serialized patient state into a URL parameter
// for case-sharing. That feature was removed because clinical variables in a
// shareable URL is inappropriate even when no PHI is transmitted. The Share
// button now copies the bare site URL only; patient data never leaves the
// user's browser.

const SITE_URL = 'https://cardiologytrialmatch.org';

// Returns the canonical site URL for the Share button to copy.
// Uses the live origin in development so localhost previews don't break.
export function getShareUrl() {
  if (typeof window === 'undefined') return SITE_URL;
  const { origin, pathname } = window.location;
  // In production the origin is https://cardiologytrialmatch.org with pathname '/'
  // In dev it's http://localhost:5173/ — copy whatever the user is viewing
  if (origin.includes('cardiologytrialmatch.org')) return SITE_URL;
  return origin + pathname;
}
