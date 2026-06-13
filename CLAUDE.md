# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

The project page for the paper **"Ambient Diffusion Policy: Imitation Learning from Suboptimal Data in Robotics"** (Wei et al., 2026). It is a hand-written **static single-page site** served by GitHub Pages at https://ambient-diffusion-policy.github.io/ from the repo root (no Jekyll, no bundler, no build step). Edit the files and the change is live once pushed.

This repo is a GitHub user/org Pages site: `github.com/ambient-diffusion-policy/ambient-diffusion-policy.github.io`. There is no application code, package manager, lint, or test suite — do not look for or invent them.

## Working on the site

- **Preview locally:** `python3 -m http.server 8000` then open http://localhost:8000. Plain file:// also works, but a server is closer to production (relative paths, video range requests).
- **Hard-refresh after CSS/JS edits.** `index.html` cache-busts assets with manual query strings: `site.css?v=takeaway1`, `site.js?v=mathcaption1`. **Bump the `?v=` token whenever you change `static/css/site.css` or `static/js/site.js`**, or returning visitors will keep the cached version.
- **Deploy:** push to the branch GitHub Pages is configured to serve. Note the working branch here is `adam`, not `main` — confirm which branch Pages publishes before assuming a push goes live.

## Structure

- `index.html` — the entire page. All copy, section markup, the BibTeX block, and the Google Analytics tag (`G-QNH6LGSQF0`) live here. Content is authored directly in HTML; there is no templating.
- `static/css/site.css` — all styling. Design tokens (colors, spacing, radius, shadow) are CSS custom properties under `:root`; prefer reusing those variables over hard-coded values.
- `static/js/site.js` — small vanilla-JS progressive enhancements only (mobile nav toggle, scroll progress bar + active-section highlighting, video playback-speed buttons, expandable figure captions). No framework. The page is fully readable with JS disabled.
- `static/images/` — figures. Many exist as both `.webp` and `.png`; the HTML serves them via `<picture>` with the `.webp` in `<source>` and `.png` as the `<img>` fallback. When adding/replacing a figure, keep both formats in sync. `static/images/method/` holds the per-noise-level method sub-figures; `poster-*.jpg` are video poster frames.
- `static/videos/` — rollout `.mp4`s, paired with a `poster-*.jpg` in `images/`.
- `favicon.svg` — inline SVG favicon.

### Conventions in the markup

- Sections use `<section class="section" id="..." data-section="...">`. The top-nav anchors, the scroll-progress logic in `site.js`, and the `data-section` attribute must stay in sync — if you add/rename/remove a section, update all three (nav `<a href="#...">`, the section `id`, and `data-section`).
- Inline math is hand-written HTML (`<span class="math"><var>...</var><sub>...</sub></span>`), not MathJax/KaTeX. Match that pattern for new math rather than pulling in a library.
- The author list, abstract, results numbers, and BibTeX in `index.html` should track the paper. Keep the `arXiv coming soon` / `Code coming soon` / `YouTube coming soon` pills updated as those links become available.

## Paper source (reference, not in this repo)

The LaTeX source and figures for the paper live **outside this repo** at `../ambient-diffusion-policy-paper/`. Use the **`arXiv-Ambient-Diffusion-Policy-final/`** folder as the canonical reference — it is the final arXiv version. When the website's abstract, results numbers, claims, or figure captions need to match the paper, check that folder:

- `arXiv-Ambient-Diffusion-Policy-final/main.tex` — document skeleton and section ordering.
- `arXiv-Ambient-Diffusion-Policy-final/sections/` — per-section `.tex` (`abstract`, `intro`, `method`, `theory`, `robot_data`, `controlled_experiments`, `oxe_experiments`, etc.). `abstract.tex` is the source of truth for the abstract on the site.
- `arXiv-Ambient-Diffusion-Policy-final/figures/` — source figures; export web assets from here.

Sibling folders in that directory (`arXiv-Ambient-Diffusion-Policy`, `-preclean`, `OLD_VERSION__...`) are older/intermediate versions — prefer `-final`.
