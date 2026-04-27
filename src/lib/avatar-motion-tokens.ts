/**
 * Avatar Motion Tokens — Agent Character Animations
 *
 * Source: MotionDesigner spec (BOAA-368)
 * Version: 1.0 — 2026-04-27
 *
 * GSAP config objects for all 11 agent avatar idle + working states.
 * Used exclusively for team page character-select animations.
 *
 * DO NOT import in SSR/server code. Client-side only.
 * Companion file: docs/design/avatar-motion-spec.md
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AgentKey =
  | 'ceo'
  | 'cto'
  | 'cmo'
  | 'uxdesigner'
  | 'motiondesigner'
  | 'icengineer'
  | 'branddesigner'
  | 'designsystemseng'
  | 'docops'
  | 'securityengineer'
  | 'qcagent';

export interface AvatarMotionConfig {
  /** Character display name */
  name: string;
  /** Character avatar alias */
  character: string;
  /** Character accent color (reference only — from BrandDesigner palette) */
  accentColor: string;
  /** Idle animation durations in seconds */
  idle: {
    floatY: number;         // Y oscillation amplitude in px
    floatDuration: number;  // loop duration in seconds
    glowDuration: number;   // glow pulse loop duration
    primaryFeatureDuration: number; // main character feature loop
  };
  /** Working animation multipliers relative to idle */
  working: {
    speedMultiplier: number; // how much faster working state loops
    glowIntensity: number;   // opacity target (0–1)
  };
  /** CSS selector fragments for element targeting */
  selectors: {
    body: string;
    glow: string;
    features: string[];
  };
}

// ---------------------------------------------------------------------------
// Per-agent config
// ---------------------------------------------------------------------------

export const avatarMotionConfig: Record<AgentKey, AvatarMotionConfig> = {

  qcagent: {
    name: 'QC Agent',
    character: 'UNIT 73-A: SPARK',
    accentColor: '#EAB308',
    idle: {
      floatY: 2,
      floatDuration: 3.5,
      glowDuration: 2.0,
      primaryFeatureDuration: 1.8,
    },
    working: {
      speedMultiplier: 2.5,
      glowIntensity: 1.0,
    },
    selectors: {
      body: '.spark-body',
      glow: '.spark-core-lines',
      features: ['.spark-eyes', '.spark-scan'],
    },
  },

  docops: {
    name: 'DocOps',
    character: 'Processing Unit 07',
    accentColor: '#38BDF8',
    idle: {
      floatY: 4,
      floatDuration: 6.0,
      glowDuration: 4.0,
      primaryFeatureDuration: 3.5,
    },
    working: {
      speedMultiplier: 2.0,
      glowIntensity: 1.0,
    },
    selectors: {
      body: '.docops-body',
      glow: '.docops-glow',
      features: ['.docops-tentacle', '.docops-ink-sac'],
    },
  },

  securityengineer: {
    name: 'Security Engineer',
    character: 'AXIS-H',
    accentColor: '#F97316',
    idle: {
      floatY: 3,
      floatDuration: 3.5,
      glowDuration: 1.8,
      primaryFeatureDuration: 12.0, // sensor array rotation
    },
    working: {
      speedMultiplier: 4.0, // sensor array speeds up dramatically
      glowIntensity: 1.0,
    },
    selectors: {
      body: '.axis-body',
      glow: '.axis-magpads',
      features: ['.axis-sensor-array', '.axis-wrist-led', '.axis-head'],
    },
  },

  designsystemseng: {
    name: 'Design Systems Eng',
    character: 'Crustacean AI',
    accentColor: '#67E8F9',
    idle: {
      floatY: 1.5,
      floatDuration: 4.5,
      glowDuration: 3.2,
      primaryFeatureDuration: 4.0, // antenna sway
    },
    working: {
      speedMultiplier: 2.0,
      glowIntensity: 1.0,
    },
    selectors: {
      body: '.dse-body',
      glow: '.dse-glow-line',
      features: ['.dse-antenna-left', '.dse-antenna-right', '.dse-segments'],
    },
  },

  motiondesigner: {
    name: 'Motion Designer',
    character: 'AURA',
    accentColor: '#2DD4BF',
    idle: {
      floatY: 10,            // most expressive float — she IS motion
      floatDuration: 5.5,
      glowDuration: 2.5,
      primaryFeatureDuration: 4.0, // tendril wave
    },
    working: {
      speedMultiplier: 1.5,
      glowIntensity: 1.0,
    },
    selectors: {
      body: '.aura-body',
      glow: '.aura-core',
      features: ['.aura-tendril-1', '.aura-tendril-2', '.aura-tendril-3', '.aura-particle-1', '.aura-particle-2', '.aura-particle-3'],
    },
  },

  icengineer: {
    name: 'IC Engineer',
    character: 'Binary Entity',
    accentColor: '#22C55E',
    idle: {
      floatY: 3,
      floatDuration: 7.0,   // slow sway — like a data stream
      glowDuration: 4.0,
      primaryFeatureDuration: 6.0, // code stream scroll
    },
    working: {
      speedMultiplier: 3.0, // code stream ×3
      glowIntensity: 1.0,
    },
    selectors: {
      body: '.ic-body',
      glow: '.ic-code-columns',
      features: ['.ic-char', '.ic-extra-columns'],
    },
  },

  cmo: {
    name: 'CMO',
    character: 'Portrait — coral glow',
    accentColor: '#F43F5E',
    idle: {
      floatY: 3,              // brand mark float
      floatDuration: 4.5,
      glowDuration: 3.5,
      primaryFeatureDuration: 10.0, // palette swatch orbit
    },
    working: {
      speedMultiplier: 2.0,
      glowIntensity: 0.9,
    },
    selectors: {
      body: '.cmo-portrait',
      glow: '.cmo-radial-glow',
      features: ['.cmo-orbit-container', '.cmo-swatch', '.cmo-brand-mark'],
    },
  },

  cto: {
    name: 'CTO',
    character: 'Portrait — cyan glow',
    accentColor: '#06B6D4',
    idle: {
      floatY: 0,              // portrait — no float, display motion instead
      floatDuration: 8.0,     // holo content scroll speed
      glowDuration: 3.0,
      primaryFeatureDuration: 8.0, // holo display scroll
    },
    working: {
      speedMultiplier: 3.0,
      glowIntensity: 0.8,
    },
    selectors: {
      body: '.cto-portrait',
      glow: '.cto-radial-glow',
      features: ['.cto-holo-display', '.cto-holo-content', '.cto-circuits', '.cto-hud-eyes'],
    },
  },

  ceo: {
    name: 'CEO',
    character: 'Portrait — gold glow',
    accentColor: '#F59E0B',
    idle: {
      floatY: 0,              // portrait — authoritative stillness
      floatDuration: 16.0,    // crown rotation — slowest, most majestic
      glowDuration: 6.0,      // slowest glow — commanding presence
      primaryFeatureDuration: 16.0,
    },
    working: {
      speedMultiplier: 1.5,
      glowIntensity: 0.95,
    },
    selectors: {
      body: '.ceo-portrait',
      glow: '.ceo-radial-glow',
      features: ['.ceo-crown-inner', '.ceo-halo-ring', '.ceo-visor', '.ceo-crown-point', '.ceo-circuits'],
    },
  },

  uxdesigner: {
    name: 'UX Designer',
    character: 'Perceptive Observer',
    accentColor: '#8B5CF6',
    idle: {
      floatY: 7,
      floatDuration: 5.0,
      glowDuration: 4.0,      // lens glow stagger cycle
      primaryFeatureDuration: 3.0, // eye perception cycle
    },
    working: {
      speedMultiplier: 1.8,
      glowIntensity: 1.0,
    },
    selectors: {
      body: '.ux-body',
      glow: '.ux-lens',
      features: ['.ux-eye', '.ux-sensor-hands'],
    },
  },

  branddesigner: {
    name: 'Brand Designer',
    character: 'Chromatic Entity',
    accentColor: 'hsl(300deg, 85%, 65%)', // shifts with hue rotation
    idle: {
      floatY: 0,              // hue rotation is the primary motion
      floatDuration: 14.0,    // full hue cycle
      glowDuration: 4.0,
      primaryFeatureDuration: 5.0, // geometric form rearrangement
    },
    working: {
      speedMultiplier: 2.0,  // hue cycle ×2
      glowIntensity: 1.0,
    },
    selectors: {
      body: '.brand-body',
      glow: '.brand-glow',
      features: ['.brand-form-a', '.brand-form-b', '.brand-burst'],
    },
  },

};

// ---------------------------------------------------------------------------
// Character-select card system tokens
// ---------------------------------------------------------------------------

/** Card entrance stagger — grid drop, radiating from top-left */
export const cardEntranceConfig = {
  from: { opacity: 0, y: 48, scale: 0.94 },
  to: {
    opacity: 1,
    y: 0,
    scale: 1,
    duration: 0.55,
    ease: 'expo.out',
    stagger: { amount: 0.9, from: 'start' as const, grid: 'auto' as const, ease: 'power2.out' },
  },
  scrollTrigger: { start: 'top 80%' },
} as const;

/** Hover lift — spring-feel, per card */
export const cardHoverIn = {
  scale: 1.03,
  y: -6,
  duration: 0.22,
  ease: 'back.out(1.4)',
} as const;

export const cardHoverOut = {
  scale: 1,
  y: 0,
  duration: 0.3,
  ease: 'power3.out',
} as const;

/** Glow overlay — fades in on hover */
export const glowHoverIn = {
  opacity: 1,
  duration: 0.18,
  ease: 'power2.out',
} as const;

export const glowHoverOut = {
  opacity: 0,
  duration: 0.25,
  ease: 'power2.out',
} as const;

/** Selection state — selected card expands, others dim */
export const cardSelectExpand = {
  scale: 1.04,
  duration: 0.25,
  ease: 'back.out(1.2)',
} as const;

export const cardDeselect = {
  opacity: 0.45,
  scale: 0.97,
  duration: 0.3,
  ease: 'power2.out',
} as const;

export const cardRestore = {
  opacity: 1,
  scale: 1,
  duration: 0.3,
  ease: 'power2.out',
} as const;

/** Avatar idle speed multiplier on hover */
export const hoverIdleSpeedMultiplier = 1.6;

// ---------------------------------------------------------------------------
// Idle timeline builders — ready-to-use GSAP configs
// ---------------------------------------------------------------------------

/**
 * Returns the primary idle float config for an agent.
 * Use with gsap.timeline({ repeat: -1, yoyo: true }).to(bodyEl, floatConfig)
 */
export function getIdleFloatConfig(agentKey: AgentKey): gsap.TweenVars {
  const cfg = avatarMotionConfig[agentKey];
  return {
    y: -cfg.idle.floatY,
    duration: cfg.idle.floatDuration,
    ease: 'sine.inOut',
  };
}

/**
 * Returns glow pulse config for an agent.
 * Use with gsap.to(glowEl, { ...glowConfig, yoyo: true, repeat: -1 })
 */
export function getIdleGlowConfig(agentKey: AgentKey): gsap.TweenVars {
  const cfg = avatarMotionConfig[agentKey];
  return {
    opacity: 1,
    duration: cfg.idle.glowDuration,
    ease: 'sine.inOut',
  };
}

// ---------------------------------------------------------------------------
// Scroll activation — ScrollTrigger config for avatar idle start
// ---------------------------------------------------------------------------

/**
 * Avatars only animate when in viewport.
 * Pass each cardEl to this with its idle timeline to pause/resume automatically.
 */
export const avatarScrollActivation = {
  start: 'top 80%',
  toggleActions: 'play pause resume pause',
} as const;

// ---------------------------------------------------------------------------
// Reduced-motion export
// ---------------------------------------------------------------------------

/**
 * When prefersReducedMotion is true, apply these static states instead
 * of building animation timelines.
 */
export const reducedMotionStaticStates: Record<AgentKey, gsap.TweenVars> = {
  qcagent:          { opacity: 1, y: 0, scale: 1 },
  docops:           { opacity: 1, y: 0, scale: 1 },
  securityengineer: { opacity: 1, y: 0, scale: 1 },
  designsystemseng: { opacity: 1, y: 0, scale: 1 },
  motiondesigner:   { opacity: 1, y: 0, scale: 1 },
  icengineer:       { opacity: 0.85, y: 0, scale: 1 },  // slightly translucent — binary entity
  cmo:              { opacity: 1, y: 0, scale: 1 },
  cto:              { opacity: 1, y: 0, scale: 1 },
  ceo:              { opacity: 1, y: 0, scale: 1 },
  uxdesigner:       { opacity: 1, y: 0, scale: 1 },
  branddesigner:    { opacity: 1, y: 0, scale: 1, filter: 'saturate(1.0)' },
};
