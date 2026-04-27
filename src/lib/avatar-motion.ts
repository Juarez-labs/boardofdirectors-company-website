/**
 * Avatar Motion Runtime — Team Page Character-Select System
 *
 * Implementation of the MotionDesigner spec (BOAA-368) for BOAA-369.
 *
 * Builds:
 *   - Card entrance stagger (grid drop, ScrollTrigger-gated)
 *   - Per-card hover / focus pre-select (spring lift + glow)
 *   - Selected state (others dim, working timeline takes over)
 *   - Per-agent idle + working timelines (paused until in viewport)
 *   - prefers-reduced-motion fallback (static state, hover scale only)
 *
 * Companion config: avatar-motion-tokens.ts
 * Spec: docs/design/avatar-motion-spec.md
 *
 * GSAP `nullTargetWarn: false` is set in src/utils/gsap.ts — feature
 * selectors that don't match any element silently no-op, so this code
 * works even when an avatar SVG is simplified relative to the full spec.
 *
 * Client-side only.
 */

import { gsap, ScrollTrigger, prefersReducedMotion } from '@utils/gsap';
import {
  type AgentKey,
  avatarMotionConfig,
  cardEntranceConfig,
  cardHoverIn,
  cardHoverOut,
  cardSelectExpand,
  cardDeselect,
  cardRestore,
  glowHoverIn,
  glowHoverOut,
  hoverIdleSpeedMultiplier,
  reducedMotionStaticStates,
} from './avatar-motion-tokens';

interface CardTimelines {
  idle: gsap.core.Timeline;
  working: gsap.core.Timeline | null;
  scrollTrigger: globalThis.ScrollTrigger | null;
}

const cardTimelines = new WeakMap<HTMLElement, CardTimelines>();
let selectedCard: HTMLElement | null = null;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isAgentKey(value: string | null | undefined): value is AgentKey {
  return !!value && value in avatarMotionConfig;
}

function $each(
  card: HTMLElement,
  selector: string,
  fn: (el: Element) => void,
): void {
  card.querySelectorAll(selector).forEach(fn);
}

// ---------------------------------------------------------------------------
// Idle timeline builder
// ---------------------------------------------------------------------------

/**
 * Builds a single GSAP timeline that owns all idle motion for one card.
 * The timeline starts paused and is played by ScrollTrigger when in view.
 */
function buildIdleTimeline(card: HTMLElement, agentKey: AgentKey): gsap.core.Timeline {
  const cfg = avatarMotionConfig[agentKey];
  const tl = gsap.timeline({ paused: true });

  // Universal: body float (Y oscillation, yoyo)
  if (cfg.idle.floatY > 0) {
    tl.to(
      card.querySelectorAll(cfg.selectors.body),
      {
        y: -cfg.idle.floatY,
        duration: cfg.idle.floatDuration,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      },
      0,
    );
  }

  // Universal: glow pulse (opacity)
  tl.to(
    card.querySelectorAll(cfg.selectors.glow),
    {
      opacity: cfg.working.glowIntensity * 0.85, // idle ~85% of working brightness
      duration: cfg.idle.glowDuration,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    },
    0,
  );

  // ---------------- Per-agent character motion ----------------

  switch (agentKey) {
    case 'qcagent': {
      // Eye pulse (slow), core lines (slower), scan sweep (every 4s)
      tl.to(
        card.querySelectorAll('.spark-eyes'),
        { opacity: 1, duration: 2.0, ease: 'sine.inOut', yoyo: true, repeat: -1 },
        0.8,
      );
      tl.to(
        card.querySelectorAll('.spark-scan'),
        {
          scaleX: 1,
          duration: 1.8,
          ease: 'power2.inOut',
          transformOrigin: 'left center',
          yoyo: true,
          repeat: -1,
          repeatDelay: 2.2,
        },
        0,
      );
      break;
    }

    case 'docops': {
      // Tentacle stagger drift, ink-sac breathing
      tl.to(
        card.querySelectorAll('.docops-tentacle'),
        {
          rotation: 8,
          duration: 3.5,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          stagger: { each: 0.4, from: 'random' },
          transformOrigin: '50% 100%',
        },
        0,
      );
      tl.to(
        card.querySelectorAll('.docops-ink-sac'),
        { scale: 1.04, duration: 5, ease: 'sine.inOut', yoyo: true, repeat: -1, transformOrigin: '50% 50%' },
        0,
      );
      break;
    }

    case 'securityengineer': {
      // Continuous sensor sweep (linear), wrist LED
      tl.to(
        card.querySelectorAll('.axis-sensor-array'),
        { rotation: 360, duration: 12, ease: 'none', repeat: -1, transformOrigin: '50% 50%' },
        0,
      );
      tl.to(
        card.querySelectorAll('.axis-wrist-led'),
        { opacity: 1, duration: 1.2, ease: 'sine.inOut', yoyo: true, repeat: -1 },
        0,
      );
      break;
    }

    case 'designsystemseng': {
      // Antenna sway (counterpoint L/R), circuit trace
      tl.to(
        card.querySelectorAll('.dse-antenna-left'),
        { rotation: 6, duration: 4, ease: 'sine.inOut', yoyo: true, repeat: -1, transformOrigin: '50% 100%' },
        0,
      );
      tl.to(
        card.querySelectorAll('.dse-antenna-right'),
        { rotation: -6, duration: 4, ease: 'sine.inOut', yoyo: true, repeat: -1, transformOrigin: '50% 100%' },
        0.7,
      );
      tl.fromTo(
        card.querySelectorAll('.dse-glow-line'),
        { strokeDashoffset: 200 },
        { strokeDashoffset: 0, duration: 6, ease: 'none', repeat: -1 },
        0,
      );
      break;
    }

    case 'motiondesigner': {
      // AURA — most expressive idle. Three tendrils, three particles.
      const tendrils = ['.aura-tendril-1', '.aura-tendril-2', '.aura-tendril-3'];
      const tendrilDur = [4.0, 4.0, 3.5];
      const tendrilDelay = [0, -1.2, 0.6];
      tendrils.forEach((sel, i) => {
        tl.to(
          card.querySelectorAll(sel),
          {
            rotation: i % 2 === 0 ? 18 : -18,
            duration: tendrilDur[i],
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
            transformOrigin: '50% 100%',
          },
          tendrilDelay[i],
        );
      });
      tl.to(
        card.querySelectorAll('.aura-core'),
        { scale: 1.05, duration: 3, ease: 'sine.inOut', yoyo: true, repeat: -1, transformOrigin: '50% 50%' },
        0,
      );
      const orbitDur = [8, 12, 16];
      ['.aura-particle-1', '.aura-particle-2', '.aura-particle-3'].forEach((sel, i) => {
        tl.to(
          card.querySelectorAll(sel),
          { rotation: 360, duration: orbitDur[i], ease: 'none', repeat: -1, transformOrigin: '50% 50%' },
          0,
        );
      });
      break;
    }

    case 'icengineer': {
      // Code stream scroll (seamless), form cohesion, body sway, sparse char flicker
      tl.to(
        card.querySelectorAll('.ic-code-columns'),
        {
          y: 40,
          duration: 6,
          ease: 'none',
          repeat: -1,
          modifiers: { y: gsap.utils.unitize((y: string) => parseFloat(y) % 40) },
        },
        0,
      );
      tl.to(
        card.querySelectorAll('.ic-body'),
        { x: 3, duration: 7, ease: 'sine.inOut', yoyo: true, repeat: -1 },
        0,
      );
      // Random character flicker — handled separately via interval (cleaned on kill)
      const chars = card.querySelectorAll<HTMLElement>('.ic-char');
      if (chars.length > 0) {
        const intervalId = window.setInterval(() => {
          const target = chars[Math.floor(Math.random() * chars.length)];
          gsap.fromTo(
            target,
            { opacity: 0 },
            { opacity: 1, duration: 0.15, yoyo: true, repeat: 1 },
          );
        }, 220);
        // Cleanup hook: tag the timeline so it can clear the interval on kill
        tl.eventCallback('onComplete', () => window.clearInterval(intervalId));
        // Also clear when the card is removed
        const cleanup = () => window.clearInterval(intervalId);
        card.addEventListener('avatar:teardown', cleanup, { once: true });
      }
      break;
    }

    case 'cmo': {
      // Palette swatch orbit + counter-rotation; glow scale
      tl.to(
        card.querySelectorAll('.cmo-orbit-container'),
        { rotation: 360, duration: 10, ease: 'none', repeat: -1, transformOrigin: '50% 50%' },
        0,
      );
      tl.to(
        card.querySelectorAll('.cmo-swatch'),
        { rotation: -360, duration: 10, ease: 'none', repeat: -1, transformOrigin: '50% 50%' },
        0,
      );
      tl.to(
        card.querySelectorAll('.cmo-radial-glow'),
        { scale: 1.06, duration: 3.5, ease: 'sine.inOut', yoyo: true, repeat: -1, transformOrigin: '50% 50%' },
        0,
      );
      tl.to(
        card.querySelectorAll('.cmo-brand-mark'),
        { y: -3, duration: 4.5, ease: 'sine.inOut', yoyo: true, repeat: -1 },
        0,
      );
      break;
    }

    case 'cto': {
      // Holographic display scroll, HUD eyes, circuit pulse
      tl.to(
        card.querySelectorAll('.cto-holo-content'),
        {
          y: -60,
          duration: 8,
          ease: 'none',
          repeat: -1,
          modifiers: { y: gsap.utils.unitize((y: string) => parseFloat(y) % -60) },
        },
        0,
      );
      tl.to(
        card.querySelectorAll('.cto-hud-eyes'),
        { opacity: 1, duration: 2, ease: 'sine.inOut', yoyo: true, repeat: -1 },
        0,
      );
      tl.to(
        card.querySelectorAll('.cto-circuits'),
        { opacity: 0.75, duration: 4, ease: 'sine.inOut', yoyo: true, repeat: -1 },
        0,
      );
      break;
    }

    case 'ceo': {
      // Crown rotation, halo counter-rotation, visor pulse, sequential crown points
      tl.to(
        card.querySelectorAll('.ceo-crown-inner'),
        { rotation: 360, duration: 16, ease: 'none', repeat: -1, transformOrigin: '50% 50%' },
        0,
      );
      tl.to(
        card.querySelectorAll('.ceo-halo-ring'),
        { rotation: -360, duration: 24, ease: 'none', repeat: -1, transformOrigin: '50% 50%' },
        0,
      );
      tl.to(
        card.querySelectorAll('.ceo-visor'),
        { opacity: 1, duration: 3.5, ease: 'sine.inOut', yoyo: true, repeat: -1 },
        0,
      );
      tl.to(
        card.querySelectorAll('.ceo-crown-point'),
        {
          opacity: 1,
          scale: 1.1,
          duration: 0.8,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          stagger: { each: 0.15, from: 'start' },
          transformOrigin: '50% 50%',
        },
        0,
      );
      break;
    }

    case 'uxdesigner': {
      // Eye perception cycle, sensor hand tip pulse
      const eyes = card.querySelectorAll<HTMLElement>('.ux-eye .iris');
      if (eyes.length > 0) {
        const eyeTl = gsap.timeline({ repeat: -1, repeatDelay: 2 });
        eyes.forEach((eye, i) => {
          eyeTl.fromTo(
            eye,
            { scaleY: 0 },
            { scaleY: 1, duration: 0.5, ease: 'back.out(2)', transformOrigin: '50% 50%' },
            i * 0.25,
          );
        });
        eyeTl.to(eyes, { scaleY: 0, duration: 0.3, ease: 'power2.in', stagger: 0.15 }, '+=1.5');
        tl.add(eyeTl, 0);
      }
      tl.to(
        card.querySelectorAll('.ux-sensor-hands'),
        { opacity: 0.95, duration: 1.5, ease: 'sine.inOut', yoyo: true, repeat: -1 },
        0,
      );
      break;
    }

    case 'branddesigner': {
      // Hue rotation (placeholder hue band — final stops pending BrandDesigner sign-off)
      // and geometric form rearrangement.
      tl.to(
        card.querySelectorAll('.brand-body'),
        { filter: 'hue-rotate(360deg)', duration: 14, ease: 'none', repeat: -1 },
        0,
      );
      tl.to(
        card.querySelectorAll('.brand-form-a'),
        { rotation: 45, duration: 5, ease: 'sine.inOut', yoyo: true, repeat: -1, transformOrigin: '50% 50%' },
        0,
      );
      tl.to(
        card.querySelectorAll('.brand-form-b'),
        { rotation: -30, duration: 7, ease: 'sine.inOut', yoyo: true, repeat: -1, transformOrigin: '50% 50%' },
        -2,
      );
      break;
    }
  }

  return tl;
}

// ---------------------------------------------------------------------------
// Working timeline builder (built lazily on first selection)
// ---------------------------------------------------------------------------

function buildWorkingTimeline(card: HTMLElement, agentKey: AgentKey): gsap.core.Timeline {
  const cfg = avatarMotionConfig[agentKey];
  const tl = gsap.timeline({ paused: true });

  // Glow goes to full intensity for everyone
  tl.to(
    card.querySelectorAll(cfg.selectors.glow),
    { opacity: cfg.working.glowIntensity, scale: 1.08, duration: 0.4, ease: 'power2.out', transformOrigin: '50% 50%' },
    0,
  );

  // Per-agent working accents (only the ones with elements that exist; others no-op)
  switch (agentKey) {
    case 'qcagent':
      tl.to(card.querySelectorAll('.spark-scan'), {
        scaleX: 1,
        duration: 0.6,
        ease: 'power2.inOut',
        transformOrigin: 'left center',
        yoyo: true,
        repeat: -1,
      }, 0);
      break;
    case 'securityengineer':
      tl.to(card.querySelectorAll('.axis-sensor-array'), { timeScale: 4, duration: 0.4 }, 0);
      tl.to(card.querySelectorAll('.axis-head'), { rotateY: 15, duration: 0.8, ease: 'power2.inOut', yoyo: true, repeat: -1 }, 0);
      break;
    case 'docops':
      tl.to(card.querySelectorAll('.docops-tentacle:nth-child(odd)'), {
        scaleY: 1.3,
        rotation: 20,
        duration: 0.6,
        ease: 'expo.out',
        stagger: 0.12,
        transformOrigin: '50% 100%',
      }, 0);
      break;
    case 'motiondesigner':
      tl.to(card.querySelectorAll('.aura-tendril-1, .aura-tendril-2, .aura-tendril-3'), {
        scaleY: 1.4,
        duration: 0.7,
        ease: 'expo.out',
        transformOrigin: '50% 100%',
      }, 0);
      break;
    case 'icengineer':
      tl.to(card.querySelectorAll('.ic-code-columns'), {
        timeScale: 3,
        duration: 0.4,
      }, 0);
      tl.to(card.querySelectorAll('.ic-body'), { opacity: 1, duration: 0.4 }, 0);
      break;
    case 'cmo':
      tl.to(card.querySelectorAll('.cmo-orbit-container'), { timeScale: 2, duration: 0.4 }, 0);
      break;
    case 'cto':
      tl.to(card.querySelectorAll('.cto-holo-content'), { timeScale: 3, duration: 0.4 }, 0);
      tl.to(card.querySelectorAll('.cto-hud-eyes'), { opacity: 1, duration: 0.1, yoyo: true, repeat: -1 }, 0);
      break;
    case 'ceo':
      tl.to(card.querySelectorAll('.ceo-crown-inner'), { timeScale: 1.5, duration: 0.4 }, 0);
      tl.to(card.querySelectorAll('.ceo-crown-point'), { opacity: 1, scale: 1.15, duration: 0.4 }, 0);
      break;
    case 'uxdesigner':
      tl.to(card.querySelectorAll('.ux-eye .iris'), { scaleY: 1, duration: 0.3, ease: 'back.out(2)' }, 0);
      tl.to(card.querySelectorAll('.ux-lens'), { scale: 1.2, duration: 0.4, transformOrigin: '50% 50%' }, 0);
      break;
    case 'branddesigner':
      tl.to(card.querySelectorAll('.brand-body'), { filter: 'hue-rotate(360deg) saturate(2)', duration: 7, ease: 'none', repeat: -1 }, 0);
      break;
  }

  return tl;
}

// ---------------------------------------------------------------------------
// State machine — hover, select, deselect
// ---------------------------------------------------------------------------

function applyHoverIn(card: HTMLElement): void {
  if (prefersReducedMotion) {
    // Permitted under reduced-motion: short, user-initiated transform only
    gsap.to(card, { scale: 1.02, duration: 0.15 });
    return;
  }
  gsap.to(card, cardHoverIn);
  const glow = card.querySelector<HTMLElement>('.card-glow');
  if (glow) gsap.to(glow, glowHoverIn);
  const tls = cardTimelines.get(card);
  if (tls?.idle) tls.idle.timeScale(hoverIdleSpeedMultiplier);
}

function applyHoverOut(card: HTMLElement): void {
  if (prefersReducedMotion) {
    gsap.to(card, { scale: 1, duration: 0.15 });
    return;
  }
  gsap.to(card, cardHoverOut);
  const glow = card.querySelector<HTMLElement>('.card-glow');
  if (glow) gsap.to(glow, glowHoverOut);
  const tls = cardTimelines.get(card);
  if (tls?.idle) tls.idle.timeScale(1);
}

function selectCard(card: HTMLElement, allCards: HTMLElement[]): void {
  if (selectedCard === card) {
    deselectCard(allCards);
    return;
  }
  selectedCard = card;
  card.dataset.state = 'working';

  if (prefersReducedMotion) {
    // Reduced-motion: just toggle border accent + dim siblings via opacity, no transforms
    allCards.forEach((c) => {
      gsap.set(c.querySelector('.card-border'), {
        borderColor: c === card ? avatarMotionConfigOf(c)?.accentColor : 'var(--color-border)',
      });
    });
    return;
  }

  const others = allCards.filter((c) => c !== card);
  gsap.to(others, cardDeselect);
  others.forEach((c) => (c.dataset.state = 'idle-dimmed'));

  gsap.to(card, cardSelectExpand);
  const border = card.querySelector<HTMLElement>('.card-border');
  const cfg = avatarMotionConfigOf(card);
  if (border && cfg) {
    gsap.to(border, { borderColor: cfg.accentColor, duration: 0.2 });
  }

  const tls = cardTimelines.get(card);
  const agentKey = (card.dataset.agent as AgentKey | undefined) ?? null;
  if (tls && agentKey && isAgentKey(agentKey)) {
    tls.idle.pause();
    if (!tls.working) tls.working = buildWorkingTimeline(card, agentKey);
    tls.working.restart();
  }
}

function deselectCard(allCards: HTMLElement[]): void {
  if (!selectedCard) return;
  const card = selectedCard;
  selectedCard = null;
  card.dataset.state = 'idle';

  if (!prefersReducedMotion) {
    gsap.to(allCards, cardRestore);
    allCards.forEach((c) => (c.dataset.state = 'idle'));

    const border = card.querySelector<HTMLElement>('.card-border');
    if (border) gsap.to(border, { borderColor: 'var(--color-border)', duration: 0.25 });
  }

  const tls = cardTimelines.get(card);
  if (tls?.working) {
    tls.working.pause(0);
  }
  if (tls?.idle) tls.idle.play();
}

function avatarMotionConfigOf(card: HTMLElement) {
  const key = card.dataset.agent;
  return isAgentKey(key) ? avatarMotionConfig[key] : null;
}

// ---------------------------------------------------------------------------
// Public initializer
// ---------------------------------------------------------------------------

/**
 * Initialize the character-select avatar system on the team page.
 *
 * @param gridSelector - CSS selector for the grid container (e.g. '#agent-grid')
 */
export function initAvatarMotionSystem(gridSelector: string): void {
  const grid = document.querySelector<HTMLElement>(gridSelector);
  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll<HTMLElement>('.agent-card'));
  if (cards.length === 0) return;

  // ---------- Reduced-motion: static state ----------
  if (prefersReducedMotion) {
    cards.forEach((card) => {
      const key = card.dataset.agent;
      if (isAgentKey(key)) {
        gsap.set(card, reducedMotionStaticStates[key]);
      } else {
        gsap.set(card, { opacity: 1, y: 0, scale: 1 });
      }
      // Hover spring is still permitted (short, user-initiated)
      card.addEventListener('mouseenter', () => applyHoverIn(card));
      card.addEventListener('mouseleave', () => applyHoverOut(card));
      card.addEventListener('focusin', () => applyHoverIn(card));
      card.addEventListener('focusout', () => applyHoverOut(card));
      card.addEventListener('click', () => selectCard(card, cards));
      card.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectCard(card, cards);
        }
      });
    });
    return;
  }

  // ---------- Card entrance — staggered grid drop ----------
  gsap.fromTo(
    cards,
    cardEntranceConfig.from,
    {
      ...cardEntranceConfig.to,
      scrollTrigger: { trigger: grid, ...cardEntranceConfig.scrollTrigger },
    },
  );

  // ---------- Build per-card timelines + interactions ----------
  cards.forEach((card) => {
    const key = card.dataset.agent;
    if (!isAgentKey(key)) return;

    const idle = buildIdleTimeline(card, key);

    // ScrollTrigger gates the idle loop — only animate when in viewport
    const st = ScrollTrigger.create({
      trigger: card,
      start: 'top 90%',
      end: 'bottom 10%',
      onEnter: () => {
        if (!selectedCard || selectedCard === card) idle.play();
      },
      onEnterBack: () => {
        if (!selectedCard || selectedCard === card) idle.play();
      },
      onLeave: () => idle.pause(),
      onLeaveBack: () => idle.pause(),
    });

    cardTimelines.set(card, { idle, working: null, scrollTrigger: st });

    // Hover / focus
    card.addEventListener('mouseenter', () => applyHoverIn(card));
    card.addEventListener('mouseleave', () => applyHoverOut(card));
    card.addEventListener('focusin', () => applyHoverIn(card));
    card.addEventListener('focusout', () => applyHoverOut(card));

    // Click / Enter / Space — select
    card.addEventListener('click', () => selectCard(card, cards));
    card.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectCard(card, cards);
      }
    });
  });

  // Click outside any card → deselect
  document.addEventListener('click', (e) => {
    if (!selectedCard) return;
    const target = e.target as Node;
    if (!grid.contains(target)) {
      deselectCard(cards);
    } else {
      // Check if click was inside a non-selected card (handled by select), or empty grid space
      const clickedCard = (e.target as Element).closest<HTMLElement>('.agent-card');
      if (!clickedCard) deselectCard(cards);
    }
  });

  // Esc deselects
  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape' && selectedCard) deselectCard(cards);
  });
}
