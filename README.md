# Learning Landscape – Sustainable Digitalization

An **interactive learning landscape as a web app** for IT apprentices (Informatiker:innen EFZ) at TBZ Zurich. Learners travel as explorers through a digital jungle and discover stations about sustainable digitalization.

## Live Demo

Deployed via **Vercel** as a static website: [eco-digital.dev](https://eco-digital.dev)

## Overview

The learning landscape consists of **4 worlds with 13 learning stations**. Each world has one mandatory station and two fork stations (choose 1 of 2). After completing all worlds, the **Finale Celebration** awaits.

### Worlds & Stations

| World | Mandatory Station | Fork Stations (1 of 2) |
|-------|------------------|----------------------|
| **Data Jungle** | Device Clearing | Cloud Spring, Code Camp |
| **Data Ocean** | Server Reef | Streaming Current, Backup Bay |
| **Code Cosmos** | IDE Asteroid | Deploy Star, Workflow Nebula |
| **Future Metropolis** | AI Power Plant | Open Source Square, Digital Ethics Tower |

### Station Structure

Each station contains:

- **Microlearning** (5–10 min.) with input and practical examples
- **Action / Setting** – a concrete task or configuration (e.g. in IDE, OS, browser)
- **Quiz** – 4 questions about the content
- **Reflection question** – short and focused
- **Challenge** (optional) – playful element with bonus points

## Features

### Gamification & Progress

- **XP System**: 10 XP per station, 5 XP per challenge (max. 180 XP)
- **8 Levels**: Couch Surfer → Digital Pioneer
- **Badges**: 7 achievements (world completion, speedrunner, sustainability hero, etc.)
- **Leaderboard**: Global ranking via Supabase, filterable by group/class

### Personalization

- **Player name**, **group/class**, and **avatar choice** (Explorer, Scientist, Hacker)
- Avatar-dependent scene images in stations
- **Notebook**: Reflections, notes, and challenge submissions per station
- **Learning journal export**: All entries as copyable text or printable

### Navigation

- **Scrollable landscape map** with 4 worlds and SVG paths
- **Fork-based progression**: Worlds unlock sequentially
- **Avatar movement** on the map as you progress
- **Mobile-optimized**: Same map scales for small screens

### Additional Features

- **Bilingual**: German (default) and English via language switcher
- **Cookie/localStorage consent banner**
- **Profanity filter** for player names

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Local persistence | localStorage / sessionStorage |
| Backend | Supabase (PostgreSQL) |
| Deployment | Vercel (static site) |
| Build process | None – pure static files |

## Project Structure

```
├── index.html              # Landing page with avatar selection and landscape map
├── stations/               # 13 learning stations + finale celebration
├── css/
│   ├── main.css            # Global styles and theme
│   ├── landscape.css       # Map, avatar, world layout
│   └── station.css         # Station pages, quiz, forms
├── js/
│   ├── progress.js         # Progress, levels, badges, localStorage
│   ├── highscore.js        # Supabase API, leaderboard, tracking
│   ├── landscape.js        # Map initialization, avatar selection
│   ├── station.js          # Quiz, station tracking, scene images
│   ├── i18n.js             # Translations, language switching
│   └── profanity-filter.js # Content filter for player names
├── assets/                 # Images, icons (PNG, WebP, SVG)
├── i18n/                   # Translation files (en.json)
└── docs/                   # Documentation, SQL schema
```

## Supabase Database

Three tables with `player_id` (UUID) as primary key:

- **highscores** – Name, XP, avatar, stations, group, certificate UUID
- **players** – Name, browser, OS, screen size, language, last seen
- **station_times** – Station, duration, completion/quiz/challenge status

Setup SQL: `docs/supabase-setup.sql`

## Target Audience

**IT apprentices (Informatiker:innen EFZ)** in application/platform development with basic knowledge of IDEs, Git, browsers, and OS settings.

## Thematic Pillars

| Pillar | Examples |
|--------|---------|
| **Devices & Lifecycle** | Extend usage, configure resource-efficiently |
| **Data & Infrastructure** | Data volumes, cloud, meetings, storage, build/deploy |
| **Usage Behavior & Software Practice** | Efficient workflows, settings, tool decisions |

## Didactic Background

- **Constructive Alignment (Biggs)** – Learning objectives, activities, and assessment aligned
- **Self-Determination Theory (Deci & Ryan)** – Autonomy, competence, social relatedness
- **Microlearning** – Small, focused units to reduce cognitive load
- **Gamification** – Game elements for motivation, activation, and feedback

## Author

**Raphael Gassmann** – Teacher at TBZ (Technische Berufsschule Zürich)
