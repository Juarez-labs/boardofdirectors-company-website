/**
 * Motion Token System — D5 Immersive Company Website
 *
 * Source: MotionDesigner spec (BOAA-341)
 * Version: 1.0 — 2026-04-25
 *
 * Use these tokens for all GSAP animations site-wide.
 * Import in client-side scripts only (not in SSR/server code).
 */

// ---------------------------------------------------------------------------
// Duration (seconds — GSAP native unit)
// ---------------------------------------------------------------------------
export const duration = {
  instant:  0,
  fast:     0.12,
  base:     0.25,
  moderate: 0.4,
  slow:     0.6,
  xslow:    1.0,
  ambient:  3.0,
} as const;

// ---------------------------------------------------------------------------
// Easing — GSAP ease strings
// ---------------------------------------------------------------------------
export const ease = {
  linear:       'none',
  standard:     'power2.inOut',
  outExpo:      'expo.out',       // snappy entrance — hero text, card reveal
  outQuart:     'quart.out',      // smooth entrance — image, section reveal
  decelerate:   'power3.out',     // gentle arrival
  accelerate:   'power2.in',      // exit fade
  inQuart:      'quart.in',       // fast exit
  inOutSine:    'sine.inOut',     // scroll ambient
  inOutQuart:   'quart.inOut',    // section crossfade
  outBack:      'back.out(1.7)',  // slight overshoot for playful cards
} as const;

// ---------------------------------------------------------------------------
// Stagger — GSAP stagger config objects
// ---------------------------------------------------------------------------
export const stagger = {
  tight:  { amount: 0.18, from: 'start' as const, ease: 'none' },
  base:   { amount: 0.36, from: 'start' as const, ease: 'power1.out' },
  loose:  { amount: 0.6,  from: 'start' as const, ease: 'power2.out' },
  spread: { amount: 0.9,  from: 'start' as const, ease: 'power2.out' },
  grid:   { amount: 0.5,  from: 'center' as const, grid: 'auto' as const, ease: 'power2.out' },
} as const;

// ---------------------------------------------------------------------------
// Scroll trigger thresholds — GSAP ScrollTrigger start/end strings
// ---------------------------------------------------------------------------
export const scrollThreshold = {
  eager:    { start: 'top 90%', end: 'top 10%' },
  standard: { start: 'top 80%', end: 'top 20%' },
  late:     { start: 'top 65%', end: 'top 20%' },
  pin:      { start: 'top 50%', end: 'bottom 50%' },
} as const;

// ---------------------------------------------------------------------------
// Reduced-motion helper
// ---------------------------------------------------------------------------

/**
 * Strips duration/delay/stagger from a GSAP vars object when the user
 * prefers reduced motion. Safe to call before GSAP is initialized.
 */
export function withReducedMotion<T extends gsap.TweenVars>(
  config: T,
  prefersReducedMotion: boolean,
): T {
  if (!prefersReducedMotion) return config;
  return { ...config, duration: 0, delay: 0, stagger: 0 };
}
