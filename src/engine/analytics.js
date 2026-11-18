// Lightweight wrapper around the analytics provider.
// Currently uses GoatCounter (https://goatcounter.com): free, no cookies,
// custom events, GDPR/HIPAA-defensible. The script tag is added in index.html.
//
// To swap providers later (e.g., Umami, Cloudflare Web Analytics): replace
// the `track*` function bodies below — call sites in components stay the same.

function isAvailable() {
  return typeof window !== 'undefined' && typeof window.goatcounter?.count === 'function';
}

// Track a generic event. GoatCounter records these as virtual pageviews
// keyed by `path`, with `title` and `event: true` markers in the dashboard.
function trackEvent(path, title) {
  if (!isAvailable()) return;
  try {
    window.goatcounter.count({
      path,
      title,
      event: true,
    });
  } catch (err) {
    // Never let analytics break the app
    console.warn('analytics:', err);
  }
}

// ── Public API ─────────────────────────────────────────────────────────────

// Fired when a user expands a trial card to see its criteria, race breakdown,
// and key results. The most clinically meaningful engagement signal.
export function trackTrialOpened(trialId, trialName) {
  trackEvent(`trial-opened/${trialId}`, `Trial opened: ${trialName}`);
}

// Fired when the user switches between Heart failure / Atrial fibrillation
// (and future topics). Tells us which clinical domains drive interest.
export function trackTopicSwitched(topicId) {
  trackEvent(`topic-switched/${topicId}`, `Topic switched: ${topicId}`);
}

// Fired when the user copies the site URL to clipboard via the Share button.
// Indicates real teaching / discussion use of the tool. Patient inputs are
// never included in the shared URL.
export function trackSiteShared() {
  trackEvent('site-shared', 'Site URL shared');
}

// Fired when a user expands the evidence card ("How was this trial built?").
// Logs the trial id only, never patient inputs.
export function trackEvidenceOpened(trialId, trialName) {
  trackEvent(`evidence-opened/${trialId}`, `Evidence card opened: ${trialName}`);
}

// Fired when a user opens "Why this matters" on one evidence check.
export function trackWhyOpened(trialId, checkId) {
  trackEvent(`evidence-why/${trialId}/${checkId}`, `Evidence why opened: ${checkId}`);
}

// Fired when a user inserts the evidence-check summary into the worksheet.
export function trackEvidenceInserted(count) {
  trackEvent('evidence-inserted', `Evidence summary inserted (${count} trials)`);
}
