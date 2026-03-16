# CLAUDE.md

## Projekt

Interaktive Lernlandschaft (Webseite) für nachhaltige Digitalisierung, entwickelt für Lernende Informatiker:innen EFZ an der TBZ (Technische Berufsschule Zürich). Erstellt von Raphael Gassmann als Lehrperson.

## Sprache

- **Projektsprache:** Deutsch (Schweizer Hochdeutsch)
- **Code:** Englisch (Variablen, Funktionen, Commits)
- **Commit-Messages:** Englisch
- **UI-Texte und Inhalte:** Deutsch, in Lernendensprache (du-Form, praxisnah)

## Techstack

- HTML, CSS, JavaScript (vanilla oder leichtgewichtiges Framework)
- Statische Webseite, deploybar via GitHub Pages
- Kein Backend erforderlich – alle Inhalte clientseitig

## Struktur

```
/                       # Projektwurzel
├── CLAUDE.md           # Diese Datei
├── README.md           # Projektbeschreibung
├── index.html          # Startseite / Lernlandschaft-Übersicht
├── stations/           # Einzelne Lernstationen
│   └── *.html
├── css/                # Stylesheets
├── js/                 # Scripts
└── assets/             # Bilder, Icons, etc.
```

## Konventionen

- Semantisches HTML, barrierefreie Struktur
- Mobile-first, responsive Design
- Einfache, wartbare CSS-Struktur (kein Utility-Framework nötig)
- Keine unnötigen Dependencies – so leichtgewichtig wie möglich
- Dateinamen: kebab-case (`station-cloud-daten.html`)

## Inhaltsstruktur pro Station

Jede Station enthält:
1. **Microlearning** (5–10 Min.) – kurzer Input mit Praxisbeispielen
2. **Tat / Einstellung** – konkrete Handlung (z. B. IDE-Setting ändern)
3. **Reflexionsfrage** – zum Nachdenken und Verknüpfen
4. **Challenge** (optional) – spielerisches Element (Punkte, Badge, Quest)

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

## Zwingende Tasks bei jeder Session

1. **Aktivitätsprotokoll pflegen:** Zu Beginn und Ende jeder Session `docs/claude-activity-log.md` aktualisieren mit: Datum, Prompts, durchgeführte Aktionen, Entscheidungen und erstellte/geänderte Dateien.
