# Reproduktions-Prompts

Diese Prompts reproduzieren die Lernlandschaft via Vibe-Coding mit Claude Code (oder vergleichbarem AI-Coding-Tool). Max. 5 Prompts pro Tag, chronologisch aufgebaut.

**Voraussetzungen:**
- Lies zuerst `docs/architecture.md` für den Gesamtüberblick
- Bildgenerierung benötigt DALL-E / gpt-image-1 (MCP oder manuell)
- Die generierten Bilder werden nie identisch sein – Positionen auf der Karte müssen an die Bilder angepasst werden
- Supabase-Projekt muss manuell erstellt werden, Schema in `docs/supabase-setup.sql`

---

## Tag 1 – Grundgerüst & Prototyp

### Prompt 1: Projekt-Setup

```
Erstelle ein statisches Webprojekt für eine interaktive Lernlandschaft zum Thema "nachhaltige Digitalisierung". Zielgruppe: Informatik-Lernende EFZ. Thema: "Daten-Dschungel" – Lernende reisen als Entdecker:innen durch einen digitalen Dschungel.

Erstelle folgende Dateien:
- index.html (Startseite)
- css/main.css (Design-System mit Dschungel-Farbpalette: Dunkelgrün #1a2e1a, Creme #e8e4d8, Primär #4a9e6e, Gold #c8a84e, Akzent #e07b4c)
- css/landscape.css (Karten-Layout)
- css/station.css (Stationsseiten)
- js/progress.js (localStorage-basierter Fortschritt)
- js/landscape.js (Startseiten-Interaktivität)
- js/station.js (Stations-Interaktivität)

Techstack: Vanilla HTML/CSS/JS, kein Framework, kein Build-Tool, mobile-first.
Sprache UI: Deutsch (du-Form, praxisnah). Code: Englisch.
```

### Prompt 2: Stationen erstellen

```
Erstelle 12 Lernstationen als HTML-Dateien im Ordner stations/. Die Stationen sind auf 4 Welten verteilt:

1. Daten-Dschungel: geraete-lichtung (Geräte-Lebenszyklus), cloud-quelle (Cloud & Daten), code-camp (IDE-Ressourcen)
2. Daten-Ozean: server-riff (Rechenzentren & PUE), streaming-strom (Streaming & Datenübertragung), backup-bucht (Datenspeicherung & Backups)
3. Code-Kosmos: ide-asteroid (IDE-Konfiguration), deploy-stern (Build & Deploy Pipelines), workflow-nebel (Digitale Arbeitsweisen)
4. Zukunfts-Metropole: ki-kraftwerk (KI & Energieverbrauch), open-source-platz (Open Source), digital-ethics-turm (Digitale Ethik)

Jede Station hat exakt diese Sektionen:
1. Header mit Stationsbild, Titel, Dauer (5-10 Min.), Kurzbeschreibung
2. Microlearning – Einleitungstext, Key Facts, Praxisbeispiele (Platzhalter für Comic-Illustration)
3. Tat/Einstellung – Konkrete Handlungsanweisung mit Notiz-Textarea (Auto-Save in localStorage)
4. Reflexion – Frage mit ausklappbarem Hinweis (Reveal-Button), Reflexions-Textarea (Auto-Save)
5. Challenge – Aufgabe mit Pflicht-Textarea (min. 10 Wörter, Word Counter), Submit-Button
6. Quiz – 4 Multiple-Choice-Fragen pro Station (4 Optionen, 1 richtig), definiert in QUIZ_DATA in station.js
7. Abschluss-Button – gesperrt bis Quiz bestanden

Inhalt: Verständlich, praxisnah, auf Informatik-Alltag bezogen (IDEs, Git, Browser, Cloud, CI/CD etc.)
```

### Prompt 3: Fortschrittssystem & Karte

```
Implementiere das Fortschrittssystem in progress.js:

Fork-Modell: Pro Welt 1 Pflichtstation + 2 Wahlstationen. Eine Welt ist "passable" wenn Pflichtstation + mindestens 1 Wahlstation abgeschlossen. Welten schalten sequentiell frei (Jungle → Ocean → Cosmos → Metro).

XP-System: 10 XP pro Station, 5 XP pro Challenge, -3 XP bei falscher Quiz-Antwort (min. 0). Max. 180 XP.

8 Level: Sofa-Surfer (0), Neugierige:r (15), Dschungel-Kenner:in (30), Daten-Taucher:in (50), Code-Pilot:in (75), Zukunfts-Architekt:in (100), Nachhaltigkeits-Held:in (130), Digitale:r Pionier:in (180).

7 Badges: 4 Welt-Badges (🌿🐙🚀🏗️), Challenge-Champion (🏆), Nachhaltigkeits-Held (🌍), Speedrunner (⚡).

Toast-System: Queued notifications (success/error/achievement/level-up/world-complete), auto-dismiss 3s.

Für die Startseite (index.html):
- Durchgehend scrollbare Karte mit 5 Hintergrund-Panels (Platzhalter-Farben pro Welt)
- Stationen absolut positioniert via CSS Custom Properties (--pos-top, --pos-left)
- SVG-Overlay für Pfade zwischen Stationen (S-Kurven, 3 Zustände: completed/active/locked)
- Pfadfarben: Jungle=#5bba7a, Ocean=#4ecdc4, Cosmos=#7c6cff, Metro=#39ff14
- Sticky Game-Header mit: Avatar, Level-Badge, Spielername, XP-Bar (0-180), Stations-Counter, Badge-Leiste
```

### Prompt 4: Avatar-System & Quiz-Mechanik

```
Avatar-System:
- 3 Avatare: Explorer (Entdecker:in), Scientist (Forscher:in), Hacker (Hacker:in)
- Avatar-Auswahl-Screen vor Expedition: Spielername-Input + 3 Avatar-Karten + Confirm-Button (disabled bis beides ausgefüllt)
- Spielername in Header und auf Karte anzeigen
- Avatar-Bild als Sprite auf der Karte mit Walking-Animation (CSS steps(4) für 4-Frame Sprite Sheet)
- Avatar bewegt sich per CSS transition (1.2s ease-in-out) zur nächsten Station mit Richtungserkennung
- Idle-Animation (sanfter Bob) im Ruhezustand

Quiz-Mechanik in station.js erweitern:
- Falsche Antwort: -3 XP, korrekte Antwort wird grün markiert, SVG-Kreis-Countdown-Timer
- Erster Timer: 35 Sekunden, weitere: 20 Sekunden
- Frage bleibt während Timer sichtbar, Timer wird per appendChild darunter gehängt
- Nach Timer: dieselbe Frage nochmals stellen (nicht eine neue)
- Timer-Zustand in sessionStorage persistieren (überlebt Page-Reload)

Station-Abschluss: Confetti-Animation (20 Partikel), +10 XP Toast, automatischer Redirect zur Karte nach 1.8s mit animierter Progressbar (XP und Welt-Bars animieren von alt nach neu).
```

### Prompt 5: Partikel, Animationen & Mobile

```
Animationen:
- Floating-Partikel pro Welt-Region: Jungle=Glühwürmchen (grün/gold, 18 Stück), Ocean=Blasen (blau, 16, nach unten), Cosmos=Sterne (klein, 20), Metro=Daten-Partikel (neon, 15). CSS-only, keine JS-Animation-Loops.
- Marching-Ants-Animation auf aktiven SVG-Pfaden (stroke-dashoffset)
- Stationsmarker: translateY bob-Animation (6px, 3s, gestaffelt)
- XP Count-Up: requestAnimationFrame mit ease-out (~800ms)
- Level-Up: Weisser Flash-Overlay + Badge-Burst (scale 1→1.4→1) + Toast
- prefers-reduced-motion: Alle Endlos-Animationen deaktivieren

Mobile:
- Gleiche Karte wie Desktop zeigen (nicht Card-Layout)
- Skaliert: Stationsbilder 72px, Avatar 40px, kleinere Labels, dünnere Pfade
- Panels mit aspect-ratio: 1/1 statt 1536/1024
- Partikel: 1/3 der Desktop-Menge
- Breakpoint 400px für extra-kleine Screens
```

---

## Tag 2 – Bilder generieren

### Prompt 1: Karten-Panels

```
Generiere 5 nahtlose Karten-Panels (1536x1024) als zusammenhängende Landschaft. Stil: painterly digital illustration, dark atmospheric mood, digital-organic hybrid, circular vignette. Die Panels sollen nahtlos ineinander übergehen:

Panel 0: Tropischer Dschungel mit Sofa/Komfortzone am Anfang, Y-Gabelung (Fork) im Weg, Lichtungen
Panel 1: Dschungel geht über in Strand und dann Unterwasser-Ozean mit Korallenriffen
Panel 2: Tiefsee-Ozean geht über in Weltraum/Kosmos mit Asteroiden und Nebeln
Panel 3: Kosmos geht über in Neon-beleuchtete Cyberpunk-Metropole
Panel 4: Metropole mit finaler Feier-Zone, goldener Tempel/Podium am Ende

Speichere als assets/map-panel-0.png bis map-panel-4.png. Integriere sie als background-image auf den .map-panel Divs mit CSS mask-image für fliessende Übergänge (erste Welt kein Top-Fade, letzte kein Bottom-Fade).
```

### Prompt 2: Stationsbilder & Comics

```
Generiere für jede der 12 Stationen:

1. Stationsbild (1024x1024) – Runde Marker für die Karte, gleicher Stil wie Karten-Panels (painterly, dark mood, digital-organic)
2. Comic-Illustration (1024x1024) – European comic (ligne claire), flat color, clean linework, third-person perspective, no text/speech bubbles. Zeigt eine Person die das Stationsthema entdeckt.

Stationen und Motive:
- geraete-lichtung: Explorer entdeckt Laptop auf Baumstumpf
- cloud-quelle: Coder an leuchtender Quelle mit Datenwolken
- code-camp: Developer am Lagerfeuer mit Code-Checkmarks
- server-riff: Taucher an Server-Korallenriff
- streaming-strom: Explorer im U-Boot in Datenströmung
- backup-bucht: Segler versenkt Datentruhen in Bucht
- ide-asteroid: Astronaut auf Asteroid mit IDE-Fenstern
- deploy-stern: Ingenieur startet Rakete mit Pipeline-Schweif
- workflow-nebel: Explorer im Nebel mit Workflow-Icons
- ki-kraftwerk: Techworker vor KI-Kraftwerk
- open-source-platz: Developer auf Platz mit offenen Türen
- digital-ethics-turm: Denkerin vor Turm mit Waage

Speichere als assets/station-{id}.png und assets/comic-{id}.png. Integriere die Comics als Flex-Layout neben dem Microlearning-Intro (Desktop: 200px rechts, Mobile: unter Text, 280px zentriert).
```

### Prompt 3: Avatare & Sprites

```
Generiere für die 3 Avatare:

1. Profilbilder (1024x1024, gleicher Stil): Explorer (Entdecker:in mit Hut/Rucksack), Scientist (Forscher:in mit Laborkittel/Brille), Hacker (Hacker:in mit Hoodie/Laptop)

2. Sprite Sheets (256x64, pixel art style): Jeweils 4 Frames nebeneinander für einen Walk-Cycle. Figur schaut nach rechts, pixelated, klare Silhouette auf transparentem Hintergrund.

Speichere als:
- assets/avatar-explorer.png, assets/avatar-scientist.png, assets/avatar-hacker.png
- assets/sprites/sprite-explorer.png, assets/sprites/sprite-scientist.png, assets/sprites/sprite-hacker.png

Passe die Karte an: Stationspositionen (--pos-top, --pos-left in progress.js STATION_POSITIONS) müssen auf die generierten Panel-Bilder kalibriert werden. Teste visuell und korrigiere die Koordinaten.
```

### Prompt 4: Mobile-Optimierung

```
Erstelle optimierte Bildversionen für Mobile:

1. Verkleinere alle Bilder für Mobile: Avatare 256px, Comics 400px, Stationsbilder 512px, Hintergründe 768px
2. Konvertiere alle Mobile-Bilder zu WebP (Qualität 80)
3. Speichere in assets/mobile/ mit gleichen Dateinamen aber .webp Endung
4. Ersetze in allen 12 Stationen die <img> Tags durch <picture> Elemente mit WebP-Source für Mobile (<768px)
5. Füge srcset/sizes auf Avatar-Bilder in index.html hinzu
6. Erstelle getMobileAssetPath() Hilfsfunktion in progress.js für JS-gesteuerte Bildpfade
7. Generiere 4 Welt-Banner (600px breit, landscape) als Mobile-Hintergründe für die Karte
```

---

## Tag 3 – Features & Polish

### Prompt 1: Highscore, Profanity-Filter & Supabase

```
Implementiere ein Supabase-basiertes Leaderboard:

Supabase-Tabellen (Schema siehe docs/supabase-setup.sql):
- highscores: name (PK), xp, avatar, stations, updated_at
- players: name (PK), avatar, browser, os, screen_width, screen_height, language, last_seen_at
- station_times: player_name + station_id (unique), duration_seconds, completed, challenge_done, quiz_passed

In js/highscore.js:
- supabaseFetch() Helper für REST API Calls mit Anon Key
- loadHighscores(): Nur Spieler mit >= 10 XP laden, sortiert nach XP desc
- submitHighscore(): Upsert via merge-duplicates
- syncCurrentPlayer(): Aufrufen bei Expeditionsstart, Station-Complete und Challenge-Complete
- syncPlayerInfo(): Browser/OS aus User-Agent parsen, Screen-Size loggen
- trackStationEnter/Leave(): Bearbeitungszeit in sessionStorage messen, bei Leave nach Supabase
- openHighscoreModal(): Dynamisches Modal mit Spieler-Highlight und Rangliste
- renderRankingInline(): Für Abschluss-Seite

Profanity-Filter in js/profanity-filter.js:
- ~100 Begriffe DE + ~100 EN
- Leetspeak-Normalisierung (@→a, 4→a, 3→e, 1→i, 5→s, $→s, 7→t, +→t, 8→b)
- Zeichenwiederholungen normalisieren, Trennzeichen entfernen, Umlaut-Varianten
- containsProfanity(text) als einzige exportierte Funktion
- Einbinden bei: Avatar-Namenswahl, Challenge-Submit, Reflexion/Notizen-Autosave
```

### Prompt 2: i18n (Deutsch/Englisch)

```
Implementiere Sprachumschaltung DE/EN:

js/i18n.js:
- Deutsch bleibt hardcoded im HTML (progressive enhancement, Fallback)
- Englisch via i18n/en.json mit ~630 Keys
- data-i18n Attribute auf allen Textelementen in allen 14 HTML-Dateien
- I18N.t(key, fallback) Funktion für dynamische Texte in JS
- Sprachwechsel-Button (EN/DE) im Header jeder Seite
- Sprache in localStorage persistieren, bei Wechsel Seite neu laden
- Quiz-Übersetzung: Dynamische Keys quiz.{station}.{idx}.q/o{n} mit Fallback auf QUIZ_DATA

Erstelle i18n/en.json mit allen Übersetzungen:
- Alle UI-Texte (Buttons, Labels, Toasts, Modals)
- Alle Stations-Inhalte (Microlearning, Aufgaben, Reflexionen, Challenges, Quiz-Fragen)
- Level-Namen, Badge-Namen, Welt-Namen
```

### Prompt 3: Abschluss-Station & Notizbuch

```
Erstelle stations/abschluss-feier.html als Finale:
- Wird freigeschaltet wenn alle 4 Welten passable sind
- Goldener Trophy-Marker auf der Karte mit Glow-Animation
- Zertifikat-Card mit: Name, Avatar, Level, XP, abgeschlossene Stationen, Badges, Datum
- Alle Challenge-Abgaben werden aufgelistet
- Aktionen: PDF-Druck (window.print mit @media print Stylesheet), E-Mail (mailto), ICS-Download (Blob)
- Inline-Rangliste (renderRankingInline)

Notizbuch-Feature:
- Button im Game-Header öffnet Modal
- 3 Tabs: Challenges (🏆), Reflexionen (💭), Notizen (📝)
- Zeigt alle gespeicherten Einträge gruppiert nach Station
- Kontext-Text (was die Aufgabe war) als Überschrift pro Eintrag, nicht nur Stationsname
- Farbige Border-left pro Typ (gold/lila/grün), Emoji-Icons
```

### Prompt 4: Consent-Banner & Feinschliff

```
Implementiere:

1. Cookie-/localStorage-Consent-Banner beim ersten Besuch
2. Favicon: Lucide trees SVG Icon als Inline-SVG Favicon in allen HTML-Seiten
3. Reset-Button im Footer: Löscht allen localStorage-Fortschritt mit Bestätigungs-Dialog

Feinschliff:
- Stationsseiten: Lade-Spinner der nach 500ms ausfadet
- XP-Bar im Header zeigt Gesamtfortschritt 0-180 XP (nicht Level-Fortschritt)
- Station-Complete → Redirect zur Karte: XP-Bar und Welt-Progressbars animieren von vorherigem Stand zum neuen
- Avatar-Szenenbilder: Pro Station ein Header-Bild das zum gewählten Avatar passt (scenes/scene-{station}-{avatar}.png)
- Reveal-Animation für Hinweise: CSS max-height Transition statt hidden-Attribut, rotierender Caret (▼)
```

---

## Hinweise zur Reproduktion

### Was nicht 1:1 reproduzierbar ist

1. **Bilder:** DALL-E generiert nie identische Bilder. Die Stationspositionen auf der Karte müssen an die tatsächlich generierten Panels angepasst werden.
2. **Stationsinhalte:** Die Microlearning-Texte, Quiz-Fragen und Challenge-Aufgaben sind inhaltlich komplex. Claude wird ähnliche aber nicht identische Inhalte generieren.
3. **CSS-Feintuning:** Pixel-genaue Positionierung, Animationstiming und responsive Breakpoints erfordern iteratives Anpassen.
4. **i18n:** 633 Übersetzungs-Keys werden ähnlich aber nicht identisch generiert.

### Was identisch reproduzierbar ist

1. **Architektur:** Fork-Modell, Welten, Stationsstruktur, Progressionssystem
2. **Gamification-Regeln:** XP, Level, Badges, Quiz-Mechanik
3. **Tech-Entscheidungen:** localStorage, Supabase-Schema, Vanilla JS
4. **Design-System:** Farbpalette, Typografie, Layout-Prinzipien

### Empfehlung

Nutze `docs/architecture.md` als ständige Referenz bei jedem Prompt. Die Prompts oben setzen voraus, dass das Architektur-Dokument als Kontext mitgegeben wird (z.B. via CLAUDE.md oder als Datei im Projekt).
