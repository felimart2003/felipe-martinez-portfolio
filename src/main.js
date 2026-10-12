import './style.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const select = (selector) => document.querySelector(selector);
const selectAll = (selector) => [...document.querySelectorAll(selector)];

// Content remains readable without JavaScript or when reduced motion is enabled.
const motion = gsap.matchMedia();

motion.add('(prefers-reduced-motion: no-preference)', () => {
  const hero = gsap.timeline({ defaults: { ease: 'power3.out' } });
  hero
    .from('.hero-eyebrow', { y: 12, opacity: 0, duration: 0.65 })
    .from('.hero-title .line-inner', { yPercent: 110, duration: 1.05, stagger: 0.12 }, '-=0.35')
    .from('.hero-description', { y: 20, opacity: 0, duration: 0.8 }, '-=0.55')
    .from('.hero-actions', { y: 16, opacity: 0, duration: 0.7 }, '-=0.5')
    .from('.hero-art', { y: 24, opacity: 0, duration: 1.2 }, 0.25);

  gsap.to('.orbit-ring', {
    rotation: (index) => (index % 2 ? -360 : 360),
    transformOrigin: '50% 50%',
    duration: (index) => 70 + index * 18,
    ease: 'none',
    repeat: -1,
  });

  selectAll('.floating-label').forEach((label, index) => {
    gsap.to(label, {
      y: index % 2 ? 9 : -9,
      duration: 3.2 + index * 0.45,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
    });
  });

  selectAll('[data-reveal]').forEach((element) => {
    gsap.from(element, {
      y: 32,
      opacity: 0,
      duration: 0.85,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: element,
        start: 'top 92%',
        once: true,
      },
    });
  });

  const progress = select('.scroll-progress');
  if (progress) {
    gsap.fromTo(progress, { scaleX: 0 }, {
      scaleX: 1,
      transformOrigin: 'left center',
      ease: 'none',
      scrollTrigger: {
        trigger: document.documentElement,
        start: 'top top',
        end: () => Math.max(1, document.documentElement.scrollHeight - window.innerHeight),
        scrub: 0.2,
        invalidateOnRefresh: true,
      },
    });
  }
});

motion.add('(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)', () => {
  const cleanup = [];
  const art = select('.hero-art-inner');
  const home = select('#home');

  if (art && home) {
    const moveX = gsap.quickTo(art, 'x', { duration: 1, ease: 'power3.out' });
    const moveY = gsap.quickTo(art, 'y', { duration: 1, ease: 'power3.out' });
    const move = (event) => {
      const bounds = home.getBoundingClientRect();
      moveX(((event.clientX - bounds.left) / bounds.width - 0.5) * 18);
      moveY(((event.clientY - bounds.top) / bounds.height - 0.5) * 18);
    };
    const reset = () => {
      moveX(0);
      moveY(0);
    };
    home.addEventListener('pointermove', move);
    home.addEventListener('pointerleave', reset);
    cleanup.push(() => {
      home.removeEventListener('pointermove', move);
      home.removeEventListener('pointerleave', reset);
      moveX.tween.kill();
      moveY.tween.kill();
      gsap.set(art, { clearProps: 'transform' });
    });
  }

  selectAll('.project-card').forEach((card) => {
    const visual = card.querySelector('.project-visual');
    if (!visual) return;
    const scale = gsap.quickTo(visual, 'scale', { duration: 0.65, ease: 'power3.out' });
    const enter = () => scale(1.025);
    const leave = () => scale(1);
    card.addEventListener('pointerenter', enter);
    card.addEventListener('pointerleave', leave);
    cleanup.push(() => {
      card.removeEventListener('pointerenter', enter);
      card.removeEventListener('pointerleave', leave);
      scale.tween.kill();
      gsap.set(visual, { clearProps: 'transform' });
    });
  });

  return () => cleanup.forEach((dispose) => dispose());
});

const header = select('.site-header');
const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 24);
window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

const menuToggle = select('#menu-toggle');
const mainNav = select('#main-nav');
const setMenuOpen = (open) => {
  document.body.classList.toggle('nav-open', open);
  menuToggle?.setAttribute('aria-expanded', String(open));
  menuToggle?.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
};

menuToggle?.addEventListener('click', () => {
  setMenuOpen(menuToggle.getAttribute('aria-expanded') !== 'true');
});
mainNav?.addEventListener('click', (event) => {
  if (event.target.closest('a')) setMenuOpen(false);
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && document.body.classList.contains('nav-open')) {
    setMenuOpen(false);
    menuToggle?.focus();
  }
});

// These project summaries are static, verified portfolio content.
const projects = {
  fastctx: {
    kicker: 'AI agents / Hackathon winner',
    title: 'FastCTX',
    description: 'A prototype exploring how MCP can give AI coding agents useful context and support ambient, asynchronous work.',
    sections: [
      ['The build', 'Built in under eight hours at the Ottawa AI agent hackathon in July 2025. The project brought MCP into the coding-agent workflow and explored agents working asynchronously.'],
      ['The result', 'Won two first-place awards: Best Implementation of MCP in a Coding Agent and Best Ambient Async Agent.'],
    ],
    tags: ['MCP', 'AI agents', 'Rapid prototyping'],
    url: 'https://devpost.com/software/fastctx',
    link: 'Explore the project',
  },
  drone: {
    kicker: 'Robotics / Blackbird UAV',
    title: 'From pixels to flight.',
    description: 'Software for Blackbird UAV’s AEAC competition drone, connecting camera vision, remote control, and real-world hardware.',
    sections: [
      ['The build', 'Worked with Python, OpenCV, and a Raspberry Pi on camera and servo control for a gimbal. TCP communication over Tailscale connected the hardware with remote controls.'],
      ['Engineering details', 'Implemented disconnect failsafes and HSV-based detection, alongside experiments with AI target detection.'],
    ],
    tags: ['Python', 'OpenCV', 'Raspberry Pi', 'TCP', 'Tailscale'],
    url: 'https://blackbirduav.ca/',
    link: 'Meet Blackbird UAV',
  },
  stocks: {
    kicker: 'Data / Financial analysis',
    title: 'Stock Advisor',
    description: 'A Python project that turns scraped financial data into a repeatable equity-scoring workflow.',
    sections: [
      ['The build', 'Used BeautifulSoup and Requests to collect financial data, then scored equities using factors including price-to-earnings ratio, dividend yield, and debt-to-equity ratio.'],
      ['The result', 'A six-month backtest produced a 15.3% theoretical return under the project’s methodology. This is a historical backtest result, not a live investment return.'],
    ],
    tags: ['Python', 'BeautifulSoup', 'Requests', 'Data analysis'],
    url: 'https://github.com/felimart2003/Stock-advisor',
    link: 'View the source',
  },
  instagram: {
    kicker: 'Automation / Digital wellbeing',
    title: 'Get off Instagram.',
    description: 'A small automated reminder with a simple goal: help people spend a little less time scrolling.',
    sections: [
      ['The build', 'Used Python and Instagrapi to automate daily Instagram reminders. Cron scheduling and GitHub Actions keep the routine running.'],
      ['The idea', 'An everyday friction point became a practical automation project, from the script to its scheduled delivery.'],
    ],
    tags: ['Python', 'Instagrapi', 'Cron', 'GitHub Actions'],
    url: 'https://github.com/felimart2003/Get-off-ig-bot',
    link: 'View the source',
    extraUrl: 'https://www.instagram.com/turnoffig/',
    extraLink: 'See the Instagram account',
  },
  photo: {
    kicker: 'Computer vision / Hack the Hill II',
    title: 'Photo Fitness',
    description: 'A computer-vision fitness prototype created at Hack the Hill II in September 2024.',
    sections: [
      ['The idea', 'Explored the intersection of computer vision and fitness in a hackathon prototype.'],
      ['The context', 'Built during Hack the Hill II, turning a fitness concept into a demonstrable project within the event.'],
    ],
    tags: ['Computer vision', 'Fitness', 'Hackathon'],
    url: 'https://devpost.com/software/photo-fitness',
    link: 'Explore the project',
  },
};

const dialog = select('#project-dialog');
const dialogContent = select('#dialog-content');
const dialogClose = select('#dialog-close');
let dialogTrigger = null;

const openProject = (id, trigger) => {
  const project = projects[id];
  if (!project || !dialog || !dialogContent) return;
  if (typeof dialog.showModal !== 'function') {
    window.location.assign(project.url);
    return;
  }

  dialogContent.innerHTML = `
    <p class="dialog-kicker">${project.kicker}</p>
    <h2 class="dialog-title" id="project-dialog-title">${project.title}</h2>
    <p class="dialog-description">${project.description}</p>
    ${project.sections.map(([title, body]) => `
      <section class="dialog-section"><h3>${title}</h3><p>${body}</p></section>
    `).join('')}
    <ul class="dialog-tags">${project.tags.map((tag) => `<li>${tag}</li>`).join('')}</ul>
    <a class="dialog-link button button-dark" href="${project.url}" target="_blank" rel="noopener noreferrer">${project.link}<span aria-hidden="true"> ↗</span></a>
    ${project.extraUrl ? `<a class="dialog-link" href="${project.extraUrl}" target="_blank" rel="noopener noreferrer">${project.extraLink}<span aria-hidden="true"> ↗</span></a>` : ''}
  `;
  dialog.setAttribute('aria-labelledby', 'project-dialog-title');
  dialogTrigger = trigger;
  setMenuOpen(false);
  dialog.showModal();
  document.body.classList.add('dialog-open');
  dialogClose?.focus();
};

selectAll('[data-project]').forEach((button) => {
  button.addEventListener('click', (event) => {
    event.preventDefault();
    openProject(button.dataset.project, button);
  });
});

dialogClose?.addEventListener('click', () => dialog?.close());
dialog?.addEventListener('click', (event) => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right ||
      event.clientY < bounds.top || event.clientY > bounds.bottom) {
    dialog.close();
  }
});
dialog?.addEventListener('close', () => {
  document.body.classList.remove('dialog-open');
  if (dialogTrigger?.isConnected) dialogTrigger.focus();
  dialogTrigger = null;
});

const copyEmail = select('#copy-email');
const copyStatus = select('#copy-status');
copyEmail?.addEventListener('click', async () => {
  if (copyStatus) copyStatus.textContent = 'Copying email…';
  try {
    await navigator.clipboard.writeText('felimart2003@gmail.com');
    if (copyStatus) copyStatus.textContent = 'Email copied.';
  } catch {
    if (copyStatus) copyStatus.textContent = 'felimart2003@gmail.com — you can also use the email link.';
  }
});

const year = select('#year');
if (year) year.textContent = String(new Date().getFullYear());

window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
