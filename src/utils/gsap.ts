/**
 * GSAP + ScrollTrigger setup utility
 *
 * Import this in client-side scripts that need GSAP.
 * ScrollTrigger is registered globally so it only needs to happen once.
 *
 * Applies motion token defaults from MotionDesigner spec (BOAA-341).
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { duration, ease, scrollThreshold } from '@/lib/motion-tokens';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Core GSAP config
gsap.config({
  force3D: true,
  nullTargetWarn: false,
});

// Apply motion token defaults (BOAA-341)
gsap.defaults({
  ease: ease.outExpo,
  duration: duration.moderate,
});

// ScrollTrigger global defaults
ScrollTrigger.defaults({
  toggleActions: 'play none none reverse',
  ...scrollThreshold.standard,
});

// Respect prefers-reduced-motion
export const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
  gsap.globalTimeline.timeScale(1000); // effectively instant
  ScrollTrigger.config({ limitCallbacks: true });
}

export { gsap, ScrollTrigger };
