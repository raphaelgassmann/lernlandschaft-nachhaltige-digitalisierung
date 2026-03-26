# Architecture – Learning Landscape Sustainable Digitalization

This document describes the final state of the project and serves as a reference for reproduction.

## Concept

Interactive learning landscape as a static website. Learners travel as an avatar through a digital jungle with 4 worlds and 13 learning stations on the topic of sustainable digitalization. Target audience: IT apprentices (Informatiker:innen EFZ) at TBZ Zurich.

## Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript (no framework, no build process)
- **Local persistence:** localStorage / sessionStorage
- **Backend:** Supabase (PostgreSQL) for leaderboard and analytics
- **Deployment:** Vercel (static files)

## Worlds & Stations (Fork Model)

4 worlds with 1 mandatory station + 2 fork stations each (1 must be completed):

| World | ID | Mandatory Station | Fork Station A | Fork Station B |
|-------|----|------------------|----------------|----------------|
| Data Jungle | `jungle` | `geraete-lichtung` | `cloud-quelle` | `code-camp` |
| Data Ocean | `ocean` | `server-riff` | `streaming-strom` | `backup-bucht` |
| Code Cosmos | `cosmos` | `ide-asteroid` | `deploy-stern` | `workflow-nebel` |
| Future Metropolis | `metro` | `ki-kraftwerk` | `open-source-platz` | `digital-ethics-turm` |

Plus: `abschluss-feier` (finale, not a regular station)

### Progression

- Worlds unlock sequentially (Jungle → Ocean → Cosmos → Metro)
- A world counts as "passable" when: mandatory station + at least 1 fork station completed
- Fork stations unlock once the mandatory station of that world is completed
- Finale unlocks when all 4 worlds are passable
- Within a world, stations can be chosen freely

## Gamification

### XP & Levels

- 10 XP per station, 5 XP per challenge = max. 180 XP
- -3 XP on wrong quiz answer (minimum 0)

| Level | Name | Min. XP |
|-------|------|---------|
| 1 | Couch Surfer | 0 |
| 2 | Curious One | 15 |
| 3 | Jungle Expert | 30 |
| 4 | Data Diver | 50 |
| 5 | Code Pilot | 75 |
| 6 | Future Architect | 100 |
| 7 | Sustainability Hero | 130 |
| 8 | Digital Pioneer | 180 |

### Badges (7 total)

- 4 world badges (1 per completed world): 🌿 🐙 🚀 🏗️
- 🏆 Challenge Champion (all challenges)
- 🌍 Sustainability Hero (all stations)
- ⚡ Speedrunner (fast completion)

### Avatar System

3 avatars to choose from: Explorer, Scientist, Hacker. Each avatar has:
- Round profile image (for header)
- Sprite sheet (4-frame walk cycle, 256x64px) for map animation
- Avatar-specific scene images in stations

### Leaderboard

- Supabase-based, globally visible
- Players appear from 10 XP onwards
- Synced on expedition start, station complete, and challenge complete
- Player names checked with profanity filter (DE+EN, leetspeak detection)

## Station Structure

Each station contains in this order:

1. **Header** – Station image (avatar-dependent), title, duration, short description
2. **Microlearning** – Introductory text with comic illustration (ligne claire style), key facts, practical examples
3. **Action / Setting** – Concrete action instruction, note textarea (auto-save)
4. **Reflection** – Question with expandable hint, reflection textarea (auto-save)
5. **Challenge** – Task with required textarea (min. 10 words, word counter), profanity check
6. **Quiz** – 4 multiple-choice questions (4 options, 1 correct)
7. **Complete button** – Locked until quiz passed, then +10 XP, confetti, redirect to map

### Quiz Mechanics

- Wrong answer: -3 XP, correct answer highlighted green
- Penalty timer: 35s (first wrong answer), 20s (subsequent)
- SVG circle countdown, question stays visible
- After timer: same question again
- Timer state persisted in sessionStorage (survives page reload)

## Map Layout (Desktop)

- 5 seamless background panels (DALL-E generated, 1536x1024px) as `background-image` on `.map-panel` divs
- Stations absolutely positioned via CSS custom properties (`--pos-top`, `--pos-left`)
- SVG overlay for paths between stations (S-curves, `viewBox 0 0 100 100`, `non-scaling-stroke`)
- 3 path states: completed (glowing), active (marching ants), locked (dim)
- Path colors per world: Jungle=#5bba7a, Ocean=#4ecdc4, Cosmos=#7c6cff, Metro=#39ff14

### Avatar on the Map

- Sprite sheet with `steps(4)` CSS animation
- Smooth walking animation (1.2s ease-in-out) with direction detection (face-left)
- Idle animation (gentle bob) at rest
- Ground shadow via `::after`

### Particles per World

- Jungle: Fireflies (green/gold, 18)
- Ocean: Bubbles (blue, 16, downward)
- Cosmos: Stars (small, 20)
- Metro: Data particles (neon, 15)
- Mobile: 1/3 of the count

## Map Layout (Mobile)

- Same map as desktop (no separate card layout)
- Scaled elements: station images 72px, avatar 40px, smaller labels
- Panels with `aspect-ratio: 1/1` instead of 1536/1024
- Lightweight world banner WebPs as backgrounds instead of heavy desktop PNGs

## Animations & Effects

- **Confetti:** 20 CSS particles on station completion
- **Level-up:** White flash + badge burst + toast
- **XP count-up:** requestAnimationFrame with ease-out (~800ms)
- **Toast system:** Queued, auto-dismiss 3s, types: success/error/achievement/level-up/world-complete
- **prefers-reduced-motion:** All looping animations disabled

## Additional Features

### i18n (German/English)

- German hardcoded in HTML (fallback)
- English via `i18n/en.json` (~700 keys)
- `data-i18n` attributes on all text elements
- Language switch via button, persisted in localStorage, page reloads

### Notebook

- Modal with 3 tabs: Challenges (🏆), Reflections (💭), Notes (📝)
- Shows all saved entries grouped by station
- Context text per station as heading

### Finale Celebration

- Certificate with name, avatar, level, XP, stations, badges, date
- Challenge submissions listed
- Actions: PDF print (window.print), email (mailto), ICS download (Blob)
- Inline leaderboard

### Cookie/Consent Banner

- Shows on first visit
- Consent for localStorage usage

## Supabase Schema

3 tables:

```sql
-- Leaderboard
highscores (name TEXT PK, xp INT, avatar TEXT, stations INT, updated_at DATE)

-- Player analytics
players (name TEXT PK, avatar TEXT, browser TEXT, os TEXT, screen_width INT, screen_height INT, language TEXT, created_at TIMESTAMPTZ, last_seen_at TIMESTAMPTZ)

-- Station durations
station_times (id SERIAL PK, player_name TEXT, station_id TEXT, duration_seconds INT, completed BOOL, challenge_done BOOL, quiz_passed BOOL, visited_at TIMESTAMPTZ)
-- UNIQUE(player_name, station_id)
```

All tables: RLS enabled, publicly readable/writable (anon key).

## Design System (CSS Custom Properties)

```
Background:     #1a2e1a (dark green)
Text:           #e8e4d8 (light cream)
Primary:        #4a9e6e (jungle green)
Secondary:      #c8a84e (gold)
Accent:         #e07b4c (orange)

World colors:
  Jungle:  #5bba7a / #c8a84e / #e07b4c
  Ocean:   #00b4d8 / #48cae4 / #0096c7
  Cosmos:  #c77dff / #e0aaff / #ff6b9d
  Metro:   #39ff14 / #00e5ff / #7c4dff

Fonts:
  Body:    'Segoe UI', system-ui, sans-serif
  Heading: Georgia, 'Times New Roman', serif
```

## File Structure

```
├── index.html                     # Landing page (avatar selection, map, header, notebook)
├── stations/                      # 13 stations + finale
│   ├── geraete-lichtung.html
│   ├── cloud-quelle.html
│   ├── code-camp.html
│   ├── server-riff.html
│   ├── streaming-strom.html
│   ├── backup-bucht.html
│   ├── ide-asteroid.html
│   ├── deploy-stern.html
│   ├── workflow-nebel.html
│   ├── ki-kraftwerk.html
│   ├── open-source-platz.html
│   ├── digital-ethics-turm.html
│   └── abschluss-feier.html
├── css/
│   ├── main.css                   # Design system, toast styles
│   ├── landscape.css              # Map, avatar, particles, header, mobile
│   └── station.css                # Station pages, quiz, confetti, certificate
├── js/
│   ├── progress.js                # Progress, levels, badges, toasts, localStorage
│   ├── highscore.js               # Supabase API, leaderboard, tracking
│   ├── landscape.js               # Map, avatar selection, notebook, particles
│   ├── station.js                 # Quiz, challenge, confetti, scene images
│   ├── i18n.js                    # Translations, language switching
│   └── profanity-filter.js        # Word filter (DE+EN, leetspeak)
├── assets/
│   ├── avatar-*.png               # 3 avatar images
│   ├── sprites/sprite-*.png       # 3 sprite sheets (4-frame, 256x64)
│   ├── map-panel-0..4.png         # 5 map panels (1536x1024)
│   ├── station-*.png              # 12 station images (1024x1024)
│   ├── comic-*.png                # 12 comic illustrations (1024x1024)
│   ├── scenes/scene-*-*.png       # Avatar-specific scene images
│   ├── icons/                     # Section icons
│   └── mobile/                    # Downsized WebP versions of all images
├── i18n/en.json                   # English translations (~700 keys)
└── docs/
    ├── supabase-setup.sql         # DB schema + seed data
    └── architecture.md            # This document
```
