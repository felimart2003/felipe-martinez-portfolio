import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import './effects.css';

gsap.registerPlugin(ScrollToPlugin);

const root = document.documentElement;
const themeToggle = document.querySelector('#theme-toggle');
const updateTheme = (theme, save = false) => {
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#121611' : '#f5f4ed';
  const label = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
  themeToggle.setAttribute('aria-label', label);
  themeToggle.setAttribute('title', label);
  themeToggle.setAttribute('aria-pressed', String(theme === 'light'));
  if (save) {
    try { localStorage.setItem('portfolio-theme', theme); } catch {}
  }
};
updateTheme(root.dataset.theme === 'light' ? 'light' : 'dark');
themeToggle.addEventListener('click', () => updateTheme(root.dataset.theme === 'dark' ? 'light' : 'dark', true));
window.addEventListener('storage', (event) => {
  if (event.key === 'portfolio-theme') updateTheme(event.newValue === 'light' ? 'light' : 'dark');
});

const scrollTop = document.querySelector('#scroll-top');
const updateTopButton = () => {
  const visible = window.scrollY > 500;
  scrollTop.classList.toggle('is-visible', visible);
  scrollTop.tabIndex = visible ? 0 : -1;
};
window.addEventListener('scroll', updateTopButton, { passive: true });
updateTopButton();
let topTween;
scrollTop.addEventListener('click', () => {
  topTween?.kill();
  const focusHome = () => document.querySelector('.site-header .wordmark').focus({ preventScroll: true });
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.scrollTo({ top: 0, behavior: 'instant' });
    focusHome();
  } else {
    // Native CSS smoothing must not compete with the GSAP scroll animation.
    const previousScrollBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    const restoreScrollBehavior = () => { root.style.scrollBehavior = previousScrollBehavior; };
    topTween = gsap.to(window, {
      scrollTo: { y: 0, autoKill: true },
      duration: 1,
      ease: 'power3.inOut',
      onInterrupt: restoreScrollBehavior,
      onComplete: () => { restoreScrollBehavior(); focusHome(); },
    });
  }
});

// Pointer effects are decorative and only run for a mouse with motion enabled.
const pointerMotion = gsap.matchMedia();
pointerMotion.add('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  const ringX = gsap.quickTo(ring, 'x', { duration: 0.35, ease: 'power3.out' });
  const ringY = gsap.quickTo(ring, 'y', { duration: 0.35, ease: 'power3.out' });
  const ringSize = gsap.quickTo(ring, 'scale', { duration: 0.3, ease: 'power3.out' });
  const surfaces = [...document.querySelectorAll('.hero-art, .project-visual')];
  let seenPointer = false;

  const hide = () => {
    document.body.classList.remove('cursor-visible');
    seenPointer = false;
  };
  const move = (event) => {
    if (event.pointerType !== 'mouse' || document.querySelector('dialog[open]')) { hide(); return; }
    if (!seenPointer) {
      gsap.set(ring, { x: event.clientX, y: event.clientY });
      seenPointer = true;
    }
    document.body.classList.add('cursor-visible');
    gsap.set(dot, { x: event.clientX, y: event.clientY });
    ringX(event.clientX);
    ringY(event.clientY);
  };
  const hover = (event) => {
    const interactive = event.target.closest('a, button');
    document.body.classList.toggle('cursor-interactive', Boolean(interactive));
    ringSize(interactive ? 1.65 : 1);
  };
  const onVisibility = () => { if (document.hidden) hide(); };
  document.addEventListener('pointermove', move, { passive: true });
  document.addEventListener('pointerover', hover, { passive: true });
  document.documentElement.addEventListener('pointerleave', hide);
  window.addEventListener('blur', hide);
  document.addEventListener('visibilitychange', onVisibility);

  const surfaceHandlers = surfaces.map((surface) => {
    const glowMove = (event) => {
      const bounds = surface.getBoundingClientRect();
      surface.style.setProperty('--pointer-x', `${event.clientX - bounds.left}px`);
      surface.style.setProperty('--pointer-y', `${event.clientY - bounds.top}px`);
      surface.classList.add('pointer-lit');
    };
    const glowLeave = () => surface.classList.remove('pointer-lit');
    surface.addEventListener('pointermove', glowMove, { passive: true });
    surface.addEventListener('pointerleave', glowLeave);
    return () => {
      surface.removeEventListener('pointermove', glowMove);
      surface.removeEventListener('pointerleave', glowLeave);
      glowLeave();
      surface.style.removeProperty('--pointer-x');
      surface.style.removeProperty('--pointer-y');
    };
  });

  return () => {
    document.removeEventListener('pointermove', move);
    document.removeEventListener('pointerover', hover);
    document.documentElement.removeEventListener('pointerleave', hide);
    window.removeEventListener('blur', hide);
    document.removeEventListener('visibilitychange', onVisibility);
    [ringX, ringY, ringSize].forEach(tween => tween.tween.kill());
    surfaceHandlers.forEach(dispose => dispose());
    document.body.classList.remove('cursor-visible', 'cursor-interactive');
    gsap.set([dot, ring], { clearProps: 'transform' });
  };
});
