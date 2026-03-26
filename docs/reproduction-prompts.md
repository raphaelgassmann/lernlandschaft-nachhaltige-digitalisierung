# Reproduction Prompts

These prompts reproduce the learning landscape via vibe-coding with Claude Code (or a comparable AI coding tool). Max. 5 prompts per day, in chronological order.

**Prerequisites:**
- Read `docs/architecture.md` first for the overall overview
- Image generation requires DALL-E / gpt-image-1 (MCP or manual)
- Generated images will never be identical – positions on the map must be adjusted to match the images
- Supabase project must be created manually, schema in `docs/supabase-setup.sql`

---

## Day 1 – Foundation & Prototype

### Prompt 1: Project Setup

```
Create a static web project for an interactive learning landscape on the topic of "sustainable digitalization". Target audience: IT apprentices. Theme: "Data Jungle" – learners travel as explorers through a digital jungle.

Create the following files:
- index.html (landing page)
- css/main.css (design system with jungle color palette: dark green #1a2e1a, cream #e8e4d8, primary #4a9e6e, gold #c8a84e, accent #e07b4c)
- css/landscape.css (map layout)
- css/station.css (station pages)
- js/progress.js (localStorage-based progress)
- js/landscape.js (landing page interactivity)
- js/station.js (station interactivity)

Tech stack: Vanilla HTML/CSS/JS, no framework, no build tool, mobile-first.
UI language: German (informal "du" form, practical). Code: English.
```

### Prompt 2: Create Stations

```
Create 12 learning stations as HTML files in the stations/ folder. The stations are distributed across 4 worlds:

1. Data Jungle: geraete-lichtung (device lifecycle), cloud-quelle (cloud & data), code-camp (IDE resources)
2. Data Ocean: server-riff (data centers & PUE), streaming-strom (streaming & data transfer), backup-bucht (data storage & backups)
3. Code Cosmos: ide-asteroid (IDE configuration), deploy-stern (build & deploy pipelines), workflow-nebel (digital workflows)
4. Future Metropolis: ki-kraftwerk (AI & energy consumption), open-source-platz (open source), digital-ethics-turm (digital ethics)

Each station has exactly these sections:
1. Header with station image, title, duration (5-10 min.), short description
2. Microlearning – introductory text, key facts, practical examples (placeholder for comic illustration)
3. Action/Setting – concrete action instruction with note textarea (auto-save in localStorage)
4. Reflection – question with expandable hint (reveal button), reflection textarea (auto-save)
5. Challenge – task with required textarea (min. 10 words, word counter), submit button
6. Quiz – 4 multiple-choice questions per station (4 options, 1 correct), defined in QUIZ_DATA in station.js
7. Complete button – locked until quiz passed

Content: Understandable, practical, related to everyday IT work (IDEs, Git, browser, cloud, CI/CD, etc.)
```

### Prompt 3: Progress System & Map

```
Implement the progress system in progress.js:

Fork model: Per world, 1 mandatory station + 2 fork stations. A world is "passable" when mandatory station + at least 1 fork station completed. Worlds unlock sequentially (Jungle → Ocean → Cosmos → Metro).

XP system: 10 XP per station, 5 XP per challenge, -3 XP on wrong quiz answer (min. 0). Max. 180 XP.

8 levels: Couch Surfer (0), Curious One (15), Jungle Expert (30), Data Diver (50), Code Pilot (75), Future Architect (100), Sustainability Hero (130), Digital Pioneer (180).

7 badges: 4 world badges (🌿🐙🚀🏗️), Challenge Champion (🏆), Sustainability Hero (🌍), Speedrunner (⚡).

Toast system: Queued notifications (success/error/achievement/level-up/world-complete), auto-dismiss 3s.

For the landing page (index.html):
- Continuously scrollable map with 5 background panels (placeholder colors per world)
- Stations absolutely positioned via CSS custom properties (--pos-top, --pos-left)
- SVG overlay for paths between stations (S-curves, 3 states: completed/active/locked)
- Path colors: Jungle=#5bba7a, Ocean=#4ecdc4, Cosmos=#7c6cff, Metro=#39ff14
- Sticky game header with: avatar, level badge, player name, XP bar (0-180), station counter, badge row
```

### Prompt 4: Avatar System & Quiz Mechanics

```
Avatar system:
- 3 avatars: Explorer, Scientist, Hacker
- Avatar selection screen before expedition: player name input + 3 avatar cards + confirm button (disabled until both filled)
- Show player name in header and on map
- Avatar image as sprite on the map with walking animation (CSS steps(4) for 4-frame sprite sheet)
- Avatar moves via CSS transition (1.2s ease-in-out) to next station with direction detection
- Idle animation (gentle bob) at rest

Extend quiz mechanics in station.js:
- Wrong answer: -3 XP, correct answer highlighted green, SVG circle countdown timer
- First timer: 35 seconds, subsequent: 20 seconds
- Question stays visible during timer, timer appended below via appendChild
- After timer: same question again (not a new one)
- Timer state persisted in sessionStorage (survives page reload)

Station completion: Confetti animation (20 particles), +10 XP toast, automatic redirect to map after 1.8s with animated progress bar (XP and world bars animate from old to new values).
```

### Prompt 5: Particles, Animations & Mobile

```
Animations:
- Floating particles per world region: Jungle=fireflies (green/gold, 18), Ocean=bubbles (blue, 16, downward), Cosmos=stars (small, 20), Metro=data particles (neon, 15). CSS-only, no JS animation loops.
- Marching ants animation on active SVG paths (stroke-dashoffset)
- Station markers: translateY bob animation (6px, 3s, staggered)
- XP count-up: requestAnimationFrame with ease-out (~800ms)
- Level-up: White flash overlay + badge burst (scale 1→1.4→1) + toast
- prefers-reduced-motion: Disable all looping animations

Mobile:
- Show same map as desktop (not card layout)
- Scaled: station images 72px, avatar 40px, smaller labels, thinner paths
- Panels with aspect-ratio: 1/1 instead of 1536/1024
- Particles: 1/3 of desktop count
- Breakpoint 400px for extra-small screens
```

---

## Day 2 – Generate Images

### Prompt 1: Map Panels

```
Generate 5 seamless map panels (1536x1024) as a continuous landscape. Style: painterly digital illustration, dark atmospheric mood, digital-organic hybrid, circular vignette. Panels should transition seamlessly into each other:

Panel 0: Tropical jungle with couch/comfort zone at the start, Y-fork in the path, clearings
Panel 1: Jungle transitions into beach then underwater ocean with coral reefs
Panel 2: Deep sea ocean transitions into outer space/cosmos with asteroids and nebulas
Panel 3: Cosmos transitions into neon-lit cyberpunk metropolis
Panel 4: Metropolis with final celebration zone, golden temple/podium at the end

Save as assets/map-panel-0.png through map-panel-4.png. Integrate as background-image on .map-panel divs with CSS mask-image for smooth transitions (first world no top fade, last no bottom fade).
```

### Prompt 2: Station Images & Comics

```
Generate for each of the 12 stations:

1. Station image (1024x1024) – Round markers for the map, same style as map panels (painterly, dark mood, digital-organic)
2. Comic illustration (1024x1024) – European comic (ligne claire), flat color, clean linework, third-person perspective, no text/speech bubbles. Shows a person discovering the station theme.

Stations and motifs:
- geraete-lichtung: Explorer discovers laptop on tree stump
- cloud-quelle: Coder at glowing spring with data clouds
- code-camp: Developer at campfire with code checkmarks
- server-riff: Diver at server coral reef
- streaming-strom: Explorer in submarine in data stream
- backup-bucht: Sailor sinking data treasure chests in bay
- ide-asteroid: Astronaut on asteroid with IDE windows
- deploy-stern: Engineer launching rocket with pipeline trail
- workflow-nebel: Explorer in fog with workflow icons
- ki-kraftwerk: Tech worker in front of AI power plant
- open-source-platz: Developer on square with open doors
- digital-ethics-turm: Thinker in front of tower with scales

Save as assets/station-{id}.png and assets/comic-{id}.png. Integrate comics as flex layout next to microlearning intro (desktop: 200px right, mobile: below text, 280px centered).
```

### Prompt 3: Avatars & Sprites

```
Generate for the 3 avatars:

1. Profile images (1024x1024, same style): Explorer (with hat/backpack), Scientist (with lab coat/glasses), Hacker (with hoodie/laptop)

2. Sprite sheets (256x64, pixel art style): 4 frames side by side for a walk cycle. Character facing right, pixelated, clear silhouette on transparent background.

Save as:
- assets/avatar-explorer.png, assets/avatar-scientist.png, assets/avatar-hacker.png
- assets/sprites/sprite-explorer.png, assets/sprites/sprite-scientist.png, assets/sprites/sprite-hacker.png

Adjust the map: Station positions (--pos-top, --pos-left in progress.js STATION_POSITIONS) must be calibrated to the generated panel images. Test visually and correct coordinates.
```

### Prompt 4: Mobile Optimization

```
Create optimized image versions for mobile:

1. Downsize all images for mobile: Avatars 256px, comics 400px, station images 512px, backgrounds 768px
2. Convert all mobile images to WebP (quality 80)
3. Save in assets/mobile/ with same filenames but .webp extension
4. Replace <img> tags in all 12 stations with <picture> elements with WebP source for mobile (<768px)
5. Add srcset/sizes to avatar images in index.html
6. Create getMobileAssetPath() helper function in progress.js for JS-controlled image paths
7. Generate 4 world banners (600px wide, landscape) as mobile backgrounds for the map
```

---

## Day 3 – Features & Polish

### Prompt 1: Highscore, Profanity Filter & Supabase

```
Implement a Supabase-based leaderboard:

Supabase tables (schema see docs/supabase-setup.sql):
- highscores: name (PK), xp, avatar, stations, updated_at
- players: name (PK), avatar, browser, os, screen_width, screen_height, language, last_seen_at
- station_times: player_name + station_id (unique), duration_seconds, completed, challenge_done, quiz_passed

In js/highscore.js:
- supabaseFetch() helper for REST API calls with anon key
- loadHighscores(): Only load players with >= 10 XP, sorted by XP desc
- submitHighscore(): Upsert via merge-duplicates
- syncCurrentPlayer(): Call on expedition start, station complete, and challenge complete
- syncPlayerInfo(): Parse browser/OS from user agent, log screen size
- trackStationEnter/Leave(): Measure time in sessionStorage, send to Supabase on leave
- openHighscoreModal(): Dynamic modal with player highlight and ranking
- renderRankingInline(): For finale page

Profanity filter in js/profanity-filter.js:
- ~100 terms DE + ~100 EN
- Leetspeak normalization (@→a, 4→a, 3→e, 1→i, 5→s, $→s, 7→t, +→t, 8→b)
- Normalize character repetitions, remove separators, handle umlaut variants
- containsProfanity(text) as the only exported function
- Integrate at: avatar name selection, challenge submit, reflection/notes autosave
```

### Prompt 2: i18n (German/English)

```
Implement language switching DE/EN:

js/i18n.js:
- German stays hardcoded in HTML (progressive enhancement, fallback)
- English via i18n/en.json with ~700 keys
- data-i18n attributes on all text elements in all 14 HTML files
- I18N.t(key, fallback) function for dynamic texts in JS
- Language switch button (EN/DE) in header of every page
- Language persisted in localStorage, page reloads on switch
- Quiz translation: Dynamic keys quiz.{station}.{idx}.q/o{n} with fallback to QUIZ_DATA

Create i18n/en.json with all translations:
- All UI texts (buttons, labels, toasts, modals)
- All station content (microlearning, tasks, reflections, challenges, quiz questions)
- Level names, badge names, world names
```

### Prompt 3: Finale Station & Notebook

```
Create stations/abschluss-feier.html as the finale:
- Unlocks when all 4 worlds are passable
- Golden trophy marker on the map with glow animation
- Certificate card with: name, avatar, level, XP, completed stations, badges, date
- All challenge submissions listed
- Actions: PDF print (window.print with @media print stylesheet), email (mailto), ICS download (Blob)
- Inline leaderboard (renderRankingInline)

Notebook feature:
- Button in game header opens modal
- 3 tabs: Challenges (🏆), Reflections (💭), Notes (📝)
- Shows all saved entries grouped by station
- Context text (what the task was) as heading per entry, not just station name
- Colored border-left per type (gold/purple/green), emoji icons
```

### Prompt 4: Consent Banner & Polish

```
Implement:

1. Cookie/localStorage consent banner on first visit
2. Favicon: Lucide trees SVG icon as inline SVG favicon in all HTML pages
3. Reset button in footer: Deletes all localStorage progress with confirmation dialog

Polish:
- Station pages: Loading spinner that fades out after 500ms
- XP bar in header shows total progress 0-180 XP (not level progress)
- Station complete → redirect to map: XP bar and world progress bars animate from previous to new values
- Avatar scene images: Per station a header image matching the chosen avatar (scenes/scene-{station}-{avatar}.png)
- Reveal animation for hints: CSS max-height transition instead of hidden attribute, rotating caret (▼)
```

---

## Notes on Reproduction

### What Cannot Be Reproduced 1:1

1. **Images:** DALL-E never generates identical images. Station positions on the map must be adjusted to match the actually generated panels.
2. **Station content:** The microlearning texts, quiz questions, and challenge tasks are complex. Claude will generate similar but not identical content.
3. **CSS fine-tuning:** Pixel-perfect positioning, animation timing, and responsive breakpoints require iterative adjustment.
4. **i18n:** ~700 translation keys will be generated similarly but not identically.

### What Is Identically Reproducible

1. **Architecture:** Fork model, worlds, station structure, progression system
2. **Gamification rules:** XP, levels, badges, quiz mechanics
3. **Tech decisions:** localStorage, Supabase schema, Vanilla JS
4. **Design system:** Color palette, typography, layout principles

### Recommendation

Use `docs/architecture.md` as a constant reference with every prompt. The prompts above assume the architecture document is provided as context (e.g. via CLAUDE.md or as a file in the project).
