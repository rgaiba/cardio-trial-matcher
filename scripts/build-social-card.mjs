// Build script: regenerates public/social-card.svg from current trial data.
// Runs automatically via the `prebuild` npm script before every Vite build.
// Therefore the social-preview image stays in sync with TOPICS and TRIALS
// without any manual edits when new trials, groups, or topics are added.
//
// Usage:
//   node scripts/build-social-card.mjs            (manual one-off)
//   npm run build                                 (runs automatically)

import { writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { TOPICS, TRIALS } from '../src/data/trials.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT = join(__dirname, '..', 'public', 'social-card.svg');
const PNG_OUTPUT = join(__dirname, '..', 'public', 'social-card.png');

// ── Compute current snapshot from data ─────────────────────────────────────
const totalTrials = TRIALS.length;
// Active topics = those that actually have at least one trial encoded
const activeTopics = TOPICS.filter((t) =>
  TRIALS.some((tr) => tr.topicId === t.id)
);
const topicLabels = activeTopics.map((t) => t.label).join(' · ');
const bodyLine = `criteria of ${totalTrials} landmark cardiology trials.`;

// Per-topic trial count for the chip row
const topicChipData = activeTopics.map((t) => ({
  label: t.label,
  count: TRIALS.filter((tr) => tr.topicId === t.id).length,
}));

// ── SVG template ───────────────────────────────────────────────────────────
// Card design: dark slate background, brand mark on left, title + tagline
// + body line on right, auto-generated topic chips below, URL footer.
// Standard OG image dimensions: 1200x630.

function chipPills(chips) {
  // Lay out chips left-to-right starting at x=0, with 20px gap.
  // Each chip width = label length * 13 + 80 (rough heuristic that fits the
  // current chip designs). Caps at 5 chips before truncating.
  const pad = 20;
  let xOffset = 0;
  const visible = chips.slice(0, 5);
  return visible
    .map((chip, i) => {
      const labelWidth = chip.label.length * 13 + 80;
      const fillFirst = i === 0; // first chip uses the brand accent
      const x = xOffset;
      xOffset += labelWidth + pad;
      return `
    <g transform="translate(${x}, 0)">
      <rect width="${labelWidth}" height="64" rx="32"
            fill="${fillFirst ? '#dc2626' : 'none'}"
            stroke="${fillFirst ? '#dc2626' : '#475569'}" stroke-width="${fillFirst ? 0 : 1.5}"/>
      <text x="34" y="42" font-size="22" font-weight="500"
            fill="${fillFirst ? '#ffffff' : '#cbd5e1'}">${chip.label}</text>
      <rect x="${labelWidth - 90}" y="20" width="56" height="24" rx="12"
            fill="${fillFirst ? 'rgba(255,255,255,0.22)' : 'rgba(203,213,225,0.18)'}"/>
      <text x="${labelWidth - 62}" y="38" font-size="14" font-weight="600"
            fill="${fillFirst ? '#ffffff' : '#cbd5e1'}" text-anchor="middle">${chip.count}</text>
    </g>`;
    })
    .join('');
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="pulse" x1="0" y1="0" x2="320" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#fb7185"/>
      <stop offset="60%" stop-color="#ef4444"/>
      <stop offset="100%" stop-color="#dc2626"/>
    </linearGradient>
    <clipPath id="lensclip">
      <circle cx="200" cy="150" r="65"/>
    </clipPath>
  </defs>

  <rect width="1200" height="630" fill="#0f172a"/>
  <circle cx="1200" cy="630" r="480" fill="#dc2626" opacity="0.08"/>

  <g transform="translate(80, 80)">
    <rect width="240" height="240" rx="42" fill="#0b1428" stroke="#1e293b" stroke-width="2"/>
    <g transform="translate(40, 40) scale(5)">
      <path d="M 2 16 H 7 L 9 12 L 11 21 L 14 16 H 18 L 20 11 L 22 22 L 25 16 H 30"
            stroke="url(#pulse)" stroke-width="1.5" fill="none"
            stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/>
      <circle cx="20" cy="15" r="6.5" fill="#0b1428" opacity="0.55"/>
      <g clip-path="url(#lensclip)">
        <path d="M 8 15 L 14 15 L 18 5 L 22 27 L 26 15 L 32 15"
              stroke="url(#pulse)" stroke-width="2.4" fill="none"
              stroke-linecap="round" stroke-linejoin="round"/>
      </g>
      <circle cx="20" cy="15" r="6.5" fill="none" stroke="#cbd5e1" stroke-width="1.4"/>
      <line x1="24.6" y1="19.6" x2="28.5" y2="23.5" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round"/>
    </g>
  </g>

  <g font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" fill="#ffffff">
    <text x="370" y="170" font-size="64" font-weight="700" letter-spacing="-1">Cardiology Trial Match</text>
    <text x="370" y="220" font-size="28" font-weight="400" fill="#cbd5e1">Landmark Cardiology Trials | EBM Education Tool</text>
    <text x="370" y="310" font-size="26" font-weight="400" fill="#e2e8f0">
      Match patient profiles to inclusion and exclusion
    </text>
    <text x="370" y="346" font-size="26" font-weight="400" fill="#e2e8f0">${bodyLine}</text>
  </g>

  <g transform="translate(80, 440)" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">${chipPills(topicChipData)}
  </g>

  <g font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">
    <text x="80" y="570" font-size="22" font-weight="500" fill="#94a3b8">cardiologytrialmatch.org</text>
    <text x="1120" y="570" font-size="18" font-weight="400" fill="#64748b" text-anchor="end">Open source · MIT licensed · DOI 10.5281/zenodo.19803459</text>
  </g>
</svg>
`;

writeFileSync(OUTPUT, svg);
console.log(
  `✓ social-card.svg regenerated → ${activeTopics.length} topics (${topicLabels}), ${totalTrials} trials`
);

// Try to also generate a PNG version for better social-platform compatibility.
// Facebook, LinkedIn, X/Twitter, and iMessage prefer PNG over SVG. The PNG is
// generated via rsvg-convert (librsvg2-bin), which is installed in the GitHub
// Actions deploy workflow. If unavailable locally, SVG-only is fine.
try {
  execSync(`rsvg-convert "${OUTPUT}" -o "${PNG_OUTPUT}" -w 1200 -h 630`, {
    stdio: 'pipe',
  });
  console.log('✓ social-card.png generated via rsvg-convert (1200×630)');
} catch {
  console.log('  rsvg-convert not available; SVG-only generated.');
  console.log('  (PNG will be generated on push by the GitHub Actions workflow.)');
}
