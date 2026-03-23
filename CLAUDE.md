# CLAUDE.md

## Projekt

Interaktive Lernlandschaft (Webseite) für nachhaltige Digitalisierung, entwickelt für Lernende Informatiker:innen EFZ an der TBZ (Technische Berufsschule Zürich). Erstellt von Raphael Gassmann als Lehrperson.

## Sprache

- **Projektsprache:** Deutsch (Schweizer Hochdeutsch)
- **Code:** Englisch (Variablen, Funktionen, Commits)
- **Commit-Messages:** Englisch
- **UI-Texte und Inhalte:** Deutsch, in Lernendensprache (du-Form, praxisnah)

## Techstack

- HTML, CSS, JavaScript (vanilla, keine Frameworks)
- Supabase (PostgreSQL) für Rangliste, Spieler-Tracking und Stationszeiten
- Deployment via Vercel als statische Webseite
- Zweisprachig: Deutsch (Standard) + Englisch via `i18n/en.json`

## Struktur

```
/                       # Projektwurzel
├── CLAUDE.md           # Diese Datei
├── README.md           # Projektbeschreibung
├── index.html          # Startseite mit Avatar-Wahl und Landschaftskarte
├── stations/           # 13 Lernstationen + Abschluss-Feier
│   └── *.html
├── css/
│   ├── main.css        # Globale Styles und Theme
│   ├── landscape.css   # Karte, Avatar, Welten-Layout, Modals
│   └── station.css     # Stationsseiten, Quiz, Formulare
├── js/
│   ├── progress.js     # Fortschritt, Level, Badges, localStorage
│   ├── highscore.js    # Supabase-API, Leaderboard, Tracking
│   ├── landscape.js    # Karten-Initialisierung, Avatar, Notizbuch
│   ├── station.js      # Quiz, Challenges, Szenenbilder
│   ├── i18n.js         # Übersetzungssystem, Sprachwechsel
│   └── profanity-filter.js # Inhaltsfilter für Spielernamen
├── assets/             # Bilder, Icons (PNG, WebP, SVG)
├── i18n/               # Übersetzungsdateien (en.json)
└── docs/               # Dokumentation, SQL-Schema, Prompts
```

## Konventionen

- Semantisches HTML, barrierefreie Struktur
- Mobile-first, responsive Design
- Einfache, wartbare CSS-Struktur (kein Utility-Framework nötig)
- Keine unnötigen Dependencies – so leichtgewichtig wie möglich
- Dateinamen: kebab-case (`cloud-quelle.html`)

## Inhaltsstruktur pro Station

Jede Station enthält:
1. **Microlearning** (5–10 Min.) – kurzer Input mit Praxisbeispielen
2. **Tat / Einstellung** – konkrete Handlung (z. B. IDE-Setting ändern)
3. **Quiz** – 4 Multiple-Choice-Fragen mit Strafzeit bei Fehlern
4. **Reflexionsfrage** – zum Nachdenken und Verknüpfen
5. **Challenge** (optional) – spielerisches Element mit 5 Bonus-XP

## Vier Welten

| Welt | Pflichtstation | Wahlstationen (1 von 2) |
|------|---------------|------------------------|
| Daten-Dschungel | Geräte-Lichtung | Cloud-Quelle, Code-Camp |
| Daten-Ozean | Server-Riff | Streaming-Strom, Backup-Bucht |
| Code-Kosmos | IDE-Asteroid | Deploy-Stern, Workflow-Nebel |
| Zukunfts-Metropole | KI-Kraftwerk | Open-Source-Platz, Digital-Ethics-Turm |

## Drei thematische Säulen

1. **Geräte & Lebenszyklus** – Nutzung verlängern, ressourcenschonend konfigurieren
2. **Daten & Infrastruktur** – Datenmengen, Cloud, Meetings, Storage, Build/Deploy
3. **Nutzungsverhalten & Software-Praxis** – Workflows, Einstellungen, Tool-Entscheidungen

## Zielgruppe

Lernende Informatiker:innen EFZ mit Grundkenntnissen in IDEs, Git, Browsern und OS. Texte sollen verständlich, praxisnah und motivierend sein – keine akademische Sprache.

## Thema & Design

- **Daten-Dschungel** – Lernende reisen als Entdecker:innen durch einen digitalen Dschungel
- Farbpalette: Grüntöne, Erdfarben, tropische Akzente (Smaragdgrün, Moos, Gold)
- SVG-Grafiken inline im HTML für die Dschungelkarte und Dekorelemente
- Stationen als Orte: Lichtungen, Quellen, Camps

## Supabase-Datenbank

Drei Tabellen mit `player_id` (UUID) als Primary Key:

- **highscores** – player_id, Name, XP, Avatar, Stationen, Gruppe, cert_uuid
- **players** – player_id, Name, Browser, OS, Bildschirmgrösse, Sprache, last_seen
- **station_times** – player_id, Station, Dauer, Abschluss-Status

Setup-SQL: `docs/supabase-setup.sql`
