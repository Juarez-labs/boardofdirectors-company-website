/**
 * GSAP + ScrollTrigger setup utility
 *
 * Import this in client-side scripts that need GSAP.
 * ScrollTrigger is registered globally so it only needs to happen once.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Configure defaults
gsap.config({
  force3D: true,
  nullTargetWarn: false,
});

// Respect prefers-reduced-motion
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
  gsap.globalTimeline.timeScale(1000); // Effectively instant
  ScrollTrigger.config({ limitCallbacks: true });
}

export { gsap, ScrollTrigger, prefersReducedMotion };
