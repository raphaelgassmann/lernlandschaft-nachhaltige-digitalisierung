# Midjourney Prompts – Daten-Dschungel Lernlandschaft

## Stil-Suffix (für alle Prompts verwenden)

Alle Prompts enden mit dem gleichen Stil-Suffix für konsistente Ergebnisse:

```
--style raw --s 200
```

**Gemeinsamer Stil-Anhang** (an jeden Prompt anhängen):

```
digital illustration, concept art style, lush tropical atmosphere, dark emerald green and gold color palette, glowing bioluminescent accents, technology meets nature aesthetic, matte painting quality
```

---

## 1. Haupthintergrund – Dschungelkarte

### 1a. Kartenansicht von oben (Top-Down Map)

```
A top-down illustrated map of a mysterious digital jungle, dark emerald green forest canopy seen from above, three glowing clearings connected by winding paths, bioluminescent vines and data-stream rivers flowing between trees, ancient circuit board patterns visible through the foliage, warm golden light emanating from the clearings, hand-drawn treasure map aesthetic mixed with futuristic elements, dark background #1a2e1a, digital illustration, concept art style, lush tropical atmosphere, dark emerald green and gold color palette, glowing bioluminescent accents, technology meets nature aesthetic, matte painting quality --ar 16:9 --style raw --s 200
```

### 1b. Panorama-Landschaft (perspektivisch)

```
A panoramic view of an enchanted digital jungle landscape at twilight, massive tropical trees with glowing circuit-pattern bark, three distinct areas visible: a sunlit clearing on a hill, a shimmering blue spring in a valley, and an orange campfire glow in the distance, data particles floating like fireflies, hanging vines made of fiber optic cables, lush ferns and moss covering ancient technology ruins, volumetric fog, dark emerald green base tones with gold and teal accents, digital illustration, concept art style, lush tropical atmosphere, dark emerald green and gold color palette, glowing bioluminescent accents, technology meets nature aesthetic, matte painting quality --ar 16:9 --style raw --s 200
```

### 1c. Hintergrund-Textur (subtiler, als CSS-Background)

```
Seamless dark jungle canopy texture seen from above, dense tropical leaves and ferns, very dark emerald green #1a2e1a, subtle bioluminescent veins in the leaves, faint circuit board patterns in the foliage, moody and atmospheric, minimal contrast, suitable as a dark website background, digital illustration, concept art style, lush tropical atmosphere, dark emerald green and gold color palette, glowing bioluminescent accents, technology meets nature aesthetic, matte painting quality --ar 16:9 --tile --style raw --s 200
```

---

## 2. Station-Illustrationen

### 2a. Die Geräte-Lichtung (Säule 1: Geräte & Lebenszyklus)

```
A sunlit jungle clearing with an old laptop covered in moss and small ferns growing from its keyboard, warm golden sunlight filtering through the canopy, fresh green color accent #5bba7a, the laptop screen faintly glowing with a green heartbeat line, tiny mushrooms and flowers growing around scattered electronic components, a sense of nature reclaiming technology, peaceful and contemplative mood, circular vignette composition on dark background, digital illustration, concept art style, lush tropical atmosphere, dark emerald green and gold color palette, glowing bioluminescent accents, technology meets nature aesthetic, matte painting quality --ar 3:2 --style raw --s 200
```

### 2b. Die Cloud-Quelle (Säule 2: Daten & Infrastruktur)

```
A mystical glowing spring deep in a digital jungle, water made of flowing blue data streams and binary code, the spring pool reflecting server rack silhouettes, blue-teal color accent #4a9ec2, tiny holographic clouds hovering above the water surface, bioluminescent aquatic plants around the edges, water droplets containing miniature data centers, ethereal and mysterious atmosphere, circular vignette composition on dark background, digital illustration, concept art style, lush tropical atmosphere, dark emerald green and gold color palette, glowing bioluminescent accents, technology meets nature aesthetic, matte painting quality --ar 3:2 --style raw --s 200
```

### 2c. Das Code-Camp (Säule 3: Nutzungsverhalten & Software-Praxis)

```
A cozy campfire in a jungle clearing at night, the flames made of orange code snippets and curly braces floating upward, warm orange glow #c27a3a, logs arranged as a semicircle with small screens and keyboards resting against them, sparks rising that look like syntax-highlighted code characters, a tent in the background made of woven cables, jungle trees surrounding the scene with glowing IDE-colored leaves, warm and inviting atmosphere, circular vignette composition on dark background, digital illustration, concept art style, lush tropical atmosphere, dark emerald green and gold color palette, glowing bioluminescent accents, technology meets nature aesthetic, matte painting quality --ar 3:2 --style raw --s 200
```

---

## 3. Dekorative Section-Icons

### 3a. Microlearning-Icon (Glühbirne/Wissen)

```
A single glowing lightbulb icon wrapped in jungle vines and small ferns, the bulb emitting warm golden light with tiny data particles, simple clean design on solid dark background #1a2e1a, flat icon style with subtle depth, emerald green and gold colors, digital illustration, icon design --ar 1:1 --style raw --s 200
```

### 3b. Tat/Einstellung-Icon (Werkzeug/Schraubenschlüssel)

```
A single wrench tool icon intertwined with a growing vine, the metal surface has subtle circuit patterns, tropical orange accent glow, simple clean design on solid dark background #1a2e1a, flat icon style with subtle depth, emerald green and orange colors, digital illustration, icon design --ar 1:1 --style raw --s 200
```

### 3c. Reflexion-Icon (Gedankenblase/Spiegel)

```
A single thought bubble icon made of translucent water from a jungle spring, blue-teal bioluminescent glow, tiny leaves floating inside the bubble, simple clean design on solid dark background #1a2e1a, flat icon style with subtle depth, emerald green and teal colors, digital illustration, icon design --ar 1:1 --style raw --s 200
```

### 3d. Challenge-Icon (Stern/Trophäe)

```
A single golden star icon wrapped in a jungle flower crown, the star glowing with warm light, tiny sparkles around it, adventure trophy aesthetic, simple clean design on solid dark background #1a2e1a, flat icon style with subtle depth, emerald green and gold colors, digital illustration, icon design --ar 1:1 --style raw --s 200
```

---

## 4. Optionale Deko-Elemente

### 4a. Horizontaler Trenner (Ranken-Divider)

```
A horizontal decorative divider made of intertwined jungle vines and fiber optic cables, small glowing flowers and data nodes at intervals, seamless left-to-right design, on transparent background, emerald green with gold accents, digital illustration, decorative border design --ar 8:1 --style raw --s 200
```

### 4b. Dschungel-Rahmen (für Cards)

```
A decorative frame border made of tropical leaves, vines, and subtle circuit patterns, open center for content, dark emerald green tones with gold accent corners, digital illustration, frame design, on dark background #1a2e1a --ar 4:3 --style raw --s 200
```

---

## Hinweise zur Verwendung

### Nach dem Generieren
1. **Hintergrund (1a/1b/1c):** Als `background-image` in CSS verwenden, ggf. mit Overlay für Lesbarkeit
2. **Station-Bilder (2a/2b/2c):** Als Header-Bild in den `.station-header` Bereich einsetzen
3. **Icons (3a-3d):** Auf ca. 64x64px oder 128x128px skalieren, als `<img>` in die Section-Header
4. **Deko (4a/4b):** Als CSS-Background oder als Bild-Element einbinden

### Empfohlene Dateibenennung
```
assets/bg-jungle-map.webp
assets/bg-jungle-texture.webp
assets/station-geraete-lichtung.webp
assets/station-cloud-quelle.webp
assets/station-code-camp.webp
assets/icons/icon-microlearning.webp
assets/icons/icon-action.webp
assets/icons/icon-reflection.webp
assets/icons/icon-challenge.webp
assets/deco-divider.webp
assets/deco-frame.webp
```

### Bildoptimierung
- Alle Bilder als **WebP** exportieren (beste Kompression für Web)
- Hintergrund: max. 1920x1080px, Qualität 80%
- Station-Header: max. 1200x800px, Qualität 85%
- Icons: 256x256px, Qualität 90%
- Deko: nach Bedarf, Qualität 80%
