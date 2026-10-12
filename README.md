# Felipe Martinez — Portfolio

A responsive computer science portfolio built with Vite, native HTML/CSS, and GSAP + ScrollTrigger. Includes dark mode by default, a persistent light/dark switch, pointer-following cursor effects, scroll-to-top navigation, motion-aware animations, project detail dialogs, a mobile menu, downloadable résumé, and clipboard email action.

## Run locally

```sh
npm install
npm run dev
```

## Production

```sh
npm run build
npm run preview
```

The production output is `dist/`. Deploy to Vercel as a Vite project with build command `npm run build` and output directory `dist`. The project can also publish through Sites using `.openai/hosting.json`.

## Update content

Page content is in `index.html`, project details and core animations in `src/main.js`, and styling in `src/style.css`. Theme, cursor, and scroll controls are in `src/enhancements.js`, with pointer styling in `src/effects.css`. Replace `public/Felipe-Martinez-Resume.pdf` to update the résumé. Portraits are retained from the previous portfolio. Font assets are self-hosted. Reduced-motion preferences disable animation and cursor effects and keep every section visible. Theme choice is stored locally; a first visit always defaults to dark.

All professional facts come from the supplied résumé; personal interests and portraits come from the existing portfolio. Stock Advisor figures describe a theoretical six-month backtest, not live investment performance.
