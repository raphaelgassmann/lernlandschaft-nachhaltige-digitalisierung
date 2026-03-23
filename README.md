# Lernlandschaft Nachhaltige Digitalisierung

Eine **interaktive Lernlandschaft als Webseite** für Lernende Informatiker:innen EFZ an der TBZ. Die Lernenden reisen als Entdecker:innen durch einen digitalen Dschungel und entdecken selbstgesteuert Stationen rund um nachhaltige Digitalisierung.

## Live-Demo

Deployed via **Vercel** als statische Webseite.

## Übersicht

Die Lernlandschaft umfasst **4 Welten mit 13 Lernstationen**. Pro Welt gibt es eine Pflichtstation und zwei Wahlstationen (Fork), von denen eine absolviert werden muss. Am Ende wartet die **Abschluss-Feier**.

### Welten & Stationen

| Welt | Pflichtstation | Wahlstationen (1 von 2) |
|------|---------------|------------------------|
| **Daten-Dschungel** | Geräte-Lichtung | Cloud-Quelle, Code-Camp |
| **Daten-Ozean** | Server-Riff | Streaming-Strom, Backup-Bucht |
| **Code-Kosmos** | IDE-Asteroid | Deploy-Stern, Workflow-Nebel |
| **Zukunfts-Metropole** | KI-Kraftwerk | Open-Source-Platz, Digital-Ethics-Turm |

### Aufbau pro Station

Jede Station enthält:

- **Microlearning** (5–10 Min.) mit Input und Praxisbeispielen
- **Handlungsorientierte Aufgabe** – eine konkrete Tat oder Einstellung (z. B. in IDE, OS, Browser)
- **Quiz** – 4 Fragen zum Gelernten
- **Reflexionsfrage** – kurz und zielgerichtet
- **Challenge** (optional) – spielerisches Element mit Bonuspunkten

## Features

### Gamification & Fortschritt

- **XP-System**: 10 XP pro Station, 5 XP pro Challenge (max. 180 XP)
- **8 Level**: Sofa-Surfer → Digitale:r Pionier:in
- **Badges**: 7 Abzeichen (Welt-Abschluss, Speedrunner, Sustainability Hero etc.)
- **Rangliste**: Globales Leaderboard via Supabase, filterbar nach Gruppe/Klasse

### Personalisierung

- **Spielername**, **Gruppe/Klasse** und **Avatar-Wahl** (Explorer, Scientist, Hacker)
- Avatar-abhängige Szenenbilder in den Stationen
- **Notizbuch**: Reflexionen, Notizen und Challenge-Abgaben pro Station
- **Lernjournal-Export**: Alle Einträge als kopierbarer Text oder druckbar

### Navigation

- **Scrollbare Landschaftskarte** mit 4 Welten und SVG-Pfaden
- **Fork-basierte Progression**: Welten schalten sich nacheinander frei
- **Avatar-Bewegung** auf der Karte bei Fortschritt
- **Mobile-optimiert**: Kartenansicht als Cards auf kleinen Bildschirmen

### Weitere Features

- **Zweisprachig**: Deutsch (Standard) und Englisch via Sprachumschalter
- **Cookie-/localStorage-Consent-Banner**
- **Profanity-Filter** für Spielernamen

## Techstack

| Komponente | Technologie |
|-----------|-------------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Persistenz (lokal) | localStorage / sessionStorage |
| Backend | Supabase (PostgreSQL) |
| Deployment | Vercel (statische Seite) |
| Build-Prozess | Keiner – pure statische Dateien |

## Projektstruktur

```
├── index.html              # Startseite mit Avatar-Wahl und Landschaftskarte
├── stations/               # 13 Lernstationen + Abschluss-Feier
├── css/
│   ├── main.css            # Globale Styles und Theme
│   ├── landscape.css       # Karte, Avatar, Welten-Layout
│   └── station.css         # Stationsseiten, Quiz, Formulare
├── js/
│   ├── progress.js         # Fortschritt, Level, Badges, localStorage
│   ├── highscore.js        # Supabase-API, Leaderboard, Tracking
│   ├── landscape.js        # Karten-Initialisierung, Avatar-Auswahl
│   ├── station.js          # Quiz, Station-Tracking, Szenenbilder
│   ├── i18n.js             # Übersetzungen, Sprachwechsel
│   └── profanity-filter.js # Inhaltsfilter für Spielernamen
├── assets/                 # Bilder, Icons (PNG, WebP, SVG)
├── i18n/                   # Übersetzungsdateien (en.json)
└── docs/                   # Dokumentation, SQL-Schema
```

## Supabase-Datenbank

Drei Tabellen mit `player_id` (UUID) als Primary Key:

- **highscores** – Name, XP, Avatar, Stationen, Gruppe, Zertifikats-UUID
- **players** – Name, Browser, OS, Bildschirmgrösse, Sprache, letzter Besuch
- **station_times** – Station, Bearbeitungszeit, Abschluss-/Quiz-/Challenge-Status

Setup-SQL: `docs/supabase-setup.sql`

## Zielgruppe

**Lernende Informatiker:innen EFZ** (Applikations-/Plattformentwicklung) mit Grundkenntnissen in IDEs, Git, Browsern und OS-Einstellungen.

## Thematische Säulen

| Säule | Beispiele |
|-------|-----------|
| **Geräte & Lebenszyklus** | Nutzung verlängern, ressourcenschonend konfigurieren |
| **Daten & Infrastruktur** | Datenmengen, Cloud, Meetings, Storage, Build/Deploy |
| **Nutzungsverhalten & Software-Praxis** | Effiziente Workflows, Einstellungen, Tool-Entscheidungen |

## Didaktischer Hintergrund

- **Constructive Alignment (Biggs)** – Lernziele, Aktivitäten und Überprüfung aufeinander abgestimmt
- **Selbstbestimmungstheorie (Deci & Ryan)** – Autonomie, Kompetenzerleben, soziale Einbindung
- **Microlearning** – Kleine, fokussierte Einheiten zur Reduktion kognitiver Belastung
- **Gamification** – Spielerische Elemente für Motivation, Aktivierung und Rückmeldung

## Autor

**Raphael Gassmann** – Lehrperson an der TBZ (Technische Berufsschule Zürich)
