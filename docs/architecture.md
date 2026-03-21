# Architektur – Lernlandschaft Nachhaltige Digitalisierung

Dieses Dokument beschreibt den Endzustand des Projekts und dient als Referenz für die Reproduktion.

## Konzept

Interaktive Lernlandschaft als statische Webseite. Lernende reisen als Avatar durch einen digitalen Dschungel mit 4 Welten und 13 Lernstationen zum Thema nachhaltige Digitalisierung. Zielgruppe: Informatik-Lernende EFZ an der TBZ Zürich.

## Techstack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript (kein Framework, kein Build-Prozess)
- **Persistenz lokal:** localStorage / sessionStorage
- **Backend:** Supabase (PostgreSQL) für Leaderboard und Analytics
- **Deployment:** Vercel (statische Dateien)

## Welten & Stationen (Fork-Modell)

4 Welten mit je 1 Pflichtstation + 2 Wahlstationen (1 davon muss absolviert werden):

| Welt | ID | Pflichtstation | Wahlstation A | Wahlstation B |
|------|----|---------------|---------------|---------------|
| Daten-Dschungel | `jungle` | `geraete-lichtung` | `cloud-quelle` | `code-camp` |
| Daten-Ozean | `ocean` | `server-riff` | `streaming-strom` | `backup-bucht` |
| Code-Kosmos | `cosmos` | `ide-asteroid` | `deploy-stern` | `workflow-nebel` |
| Zukunfts-Metropole | `metro` | `ki-kraftwerk` | `open-source-platz` | `digital-ethics-turm` |

Plus: `abschluss-feier` (Finale, keine reguläre Station)

### Progression

- Welten schalten sich sequentiell frei (Jungle → Ocean → Cosmos → Metro)
- Eine Welt gilt als "passable" wenn: Pflichtstation + mindestens 1 Wahlstation abgeschlossen
- Fork-Stationen werden freigeschaltet sobald die Pflichtstation der Welt abgeschlossen ist
- Finale wird freigeschaltet wenn alle 4 Welten passable sind
- Innerhalb einer Welt sind die Stationen frei wählbar

## Gamification

### XP & Level

- 10 XP pro Station, 5 XP pro Challenge = max. 180 XP
- -3 XP bei falscher Quiz-Antwort (Minimum 0)

| Level | Name | Min. XP |
|-------|------|---------|
| 1 | Sofa-Surfer | 0 |
| 2 | Neugierige:r | 15 |
| 3 | Dschungel-Kenner:in | 30 |
| 4 | Daten-Taucher:in | 50 |
| 5 | Code-Pilot:in | 75 |
| 6 | Zukunfts-Architekt:in | 100 |
| 7 | Nachhaltigkeits-Held:in | 130 |
| 8 | Digitale:r Pionier:in | 180 |

### Badges (7 Stück)

- 4 Welt-Badges (je 1 pro abgeschlossene Welt): 🌿 🐙 🚀 🏗️
- 🏆 Challenge-Champion (alle Challenges)
- 🌍 Nachhaltigkeits-Held (alle Stationen)
- ⚡ Speedrunner (Bedingung: schnelles Abschliessen)

### Avatar-System

3 Avatare zur Auswahl: Explorer, Forscher:in, Hacker:in. Jeder Avatar hat:
- Rundes Profilbild (für Header)
- Sprite Sheet (4-Frame Walk-Cycle, 256x64px) für Map-Animation
- Avatar-spezifische Szenenbilder in den Stationen

### Rangliste

- Supabase-basiert, global sichtbar
- Spieler erscheinen ab 10 XP
- Wird bei Expeditionsstart, Station-Abschluss und Challenge-Abschluss synchronisiert
- Spielernamen werden mit Profanity-Filter geprüft (DE+EN, Leetspeak-Erkennung)

## Aufbau pro Station

Jede Station enthält in dieser Reihenfolge:

1. **Header** – Stationsbild (avatar-abhängig), Titel, Dauer, Kurzbeschreibung
2. **Microlearning** – Einleitungstext mit Comic-Illustration (ligne claire Stil), Key Facts, Praxisbeispiele
3. **Tat / Einstellung** – Konkrete Handlungsanweisung, Notiz-Textarea (Auto-Save)
4. **Reflexion** – Frage mit ausklappbarem Hinweis, Reflexions-Textarea (Auto-Save)
5. **Challenge** – Aufgabe mit Pflicht-Textarea (min. 10 Wörter, Word Counter), Profanity-Check
6. **Quiz** – 4 Multiple-Choice-Fragen (4 Optionen, 1 richtig)
7. **Abschluss-Button** – Gesperrt bis Quiz bestanden, dann +10 XP, Confetti, Redirect zur Karte

### Quiz-Mechanik

- Falsche Antwort: -3 XP, korrekte Antwort wird grün markiert
- Straftimer: 35s (erste falsche Antwort), 20s (weitere)
- SVG-Kreis-Countdown, Frage bleibt sichtbar
- Nach Timer: dieselbe Frage nochmals
- Timer-Zustand wird in sessionStorage persistiert (überlebt Page-Reload)

## Karten-Layout (Desktop)

- 5 nahtlose Hintergrund-Panels (DALL-E generiert, 1536x1024px) als `background-image` auf `.map-panel` Divs
- Stationen absolut positioniert via CSS Custom Properties (`--pos-top`, `--pos-left`)
- SVG-Overlay für Pfade zwischen Stationen (S-Kurven, `viewBox 0 0 100 100`, `non-scaling-stroke`)
- 3 Pfad-Zustände: completed (glühend), active (marching ants), locked (schwach)
- Pfadfarben pro Welt: Jungle=#5bba7a, Ocean=#4ecdc4, Cosmos=#7c6cff, Metro=#39ff14

### Avatar auf der Karte

- Sprite Sheet mit `steps(4)` CSS-Animation
- Smooth Walking-Animation (1.2s ease-in-out) mit Richtungserkennung (face-left)
- Idle-Animation (sanfter Bob) im Ruhezustand
- Bodenschatten via `::after`

### Partikel pro Welt

- Jungle: Glühwürmchen (grün/gold, 18 Stück)
- Ocean: Blasen (blau, 16 Stück, nach unten)
- Cosmos: Sterne (klein, 20 Stück)
- Metro: Daten-Partikel (neon, 15 Stück)
- Mobile: 1/3 der Menge

## Karten-Layout (Mobile)

- Gleiche Karte wie Desktop (kein separates Card-Layout)
- Skalierte Elemente: Stationsbilder 72px, Avatar 40px, kleinere Labels
- Panels mit `aspect-ratio: 1/1` statt 1536/1024
- Leichte Welt-Banner-WebPs als Hintergründe statt schwere Desktop-PNGs

## Animationen & Effekte

- **Confetti:** 20 CSS-Partikel bei Station-Abschluss
- **Level-Up:** Weisser Flash + Badge-Burst + Toast
- **XP Count-Up:** requestAnimationFrame mit ease-out (~800ms)
- **Toast-System:** Queued, auto-dismiss 3s, Typen: success/error/achievement/level-up/world-complete
- **prefers-reduced-motion:** Alle Endlos-Animationen deaktiviert

## Weitere Features

### i18n (Deutsch/Englisch)

- Deutsch hardcoded im HTML (Fallback)
- Englisch via `i18n/en.json` (633 Keys)
- `data-i18n`-Attribute auf allen Textelementen
- Sprachwechsel via Button, persistiert in localStorage, Seite lädt neu

### Notizbuch

- Modal mit 3 Tabs: Challenges (🏆), Reflexionen (💭), Notizen (📝)
- Zeigt alle gespeicherten Einträge gruppiert nach Station
- Kontext-Text pro Station als Überschrift

### Abschluss-Feier

- Zertifikat mit Name, Avatar, Level, XP, Stationen, Badges, Datum
- Challenge-Abgaben werden aufgelistet
- Aktionen: PDF-Druck (window.print), E-Mail (mailto), ICS-Download (Blob)
- Inline-Rangliste

### Cookie-/Consent-Banner

- Zeigt sich beim ersten Besuch
- Consent für localStorage-Nutzung

## Supabase-Schema

3 Tabellen:

```sql
-- Rangliste
highscores (name TEXT PK, xp INT, avatar TEXT, stations INT, updated_at DATE)

-- Spieler-Analytics
players (name TEXT PK, avatar TEXT, browser TEXT, os TEXT, screen_width INT, screen_height INT, language TEXT, created_at TIMESTAMPTZ, last_seen_at TIMESTAMPTZ)

-- Bearbeitungszeiten
station_times (id SERIAL PK, player_name TEXT, station_id TEXT, duration_seconds INT, completed BOOL, challenge_done BOOL, quiz_passed BOOL, visited_at TIMESTAMPTZ)
-- UNIQUE(player_name, station_id)
```

Alle Tabellen: RLS enabled, öffentlich lesbar/schreibbar (Anon Key).

## Design-System (CSS Custom Properties)

```
Hintergrund:    #1a2e1a (dunkelgrün)
Text:           #e8e4d8 (helles Creme)
Primär:         #4a9e6e (Dschungelgrün)
Sekundär:       #c8a84e (Gold)
Akzent:         #e07b4c (Orange)

Welt-Farben:
  Jungle:  #5bba7a / #c8a84e / #e07b4c
  Ocean:   #00b4d8 / #48cae4 / #0096c7
  Cosmos:  #c77dff / #e0aaff / #ff6b9d
  Metro:   #39ff14 / #00e5ff / #7c4dff

Schriften:
  Body:    'Segoe UI', system-ui, sans-serif
  Heading: Georgia, 'Times New Roman', serif
```

## Dateistruktur

```
├── index.html                     # Startseite (Avatar-Wahl, Karte, Header, Notizbuch)
├── stations/                      # 13 Stationen + Finale
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
│   ├── main.css                   # Design-System, Toast-Styles
│   ├── landscape.css              # Karte, Avatar, Partikel, Header, Mobile
│   └── station.css                # Stationsseiten, Quiz, Confetti, Zertifikat
├── js/
│   ├── progress.js                # Fortschritt, Level, Badges, Toast, localStorage
│   ├── highscore.js               # Supabase API, Leaderboard, Tracking
│   ├── landscape.js               # Karte, Avatar-Auswahl, Notizbuch, Partikel
│   ├── station.js                 # Quiz, Challenge, Confetti, Szenenbilder
│   ├── i18n.js                    # Übersetzungen, Sprachwechsel
│   └── profanity-filter.js        # Wortfilter (DE+EN, Leetspeak)
├── assets/
│   ├── avatar-*.png               # 3 Avatar-Bilder
│   ├── sprites/sprite-*.png       # 3 Sprite Sheets (4-Frame, 256x64)
│   ├── map-panel-0..4.png         # 5 Karten-Panels (1536x1024)
│   ├── station-*.png              # 12 Stationsbilder (1024x1024)
│   ├── comic-*.png                # 12 Comic-Illustrationen (1024x1024)
│   ├── scenes/scene-*-*.png       # Avatar-spezifische Szenenbilder
│   ├── icons/                     # Section-Icons
│   └── mobile/                    # Verkleinerte WebP-Versionen aller Bilder
├── i18n/en.json                   # Englische Übersetzungen (633 Keys)
└── docs/
    ├── supabase-setup.sql         # DB-Schema + Seed Data
    └── architecture.md            # Dieses Dokument
```
