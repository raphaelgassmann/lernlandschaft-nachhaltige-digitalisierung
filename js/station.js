/* ========================================
   STATION.JS – Stations-Interaktivität
   ======================================== */

document.addEventListener('DOMContentLoaded', function () {
  initSession();
  updateSceneImage();
  initCompleteButton();
  initRevealButtons();
  initChallengeButton();
  initTextareas();
  initQuiz();
  hidePageLoader();
});

function hidePageLoader() {
  var loader = document.getElementById('page-loader');
  if (!loader) return;
  window.addEventListener('load', function () {
    loader.classList.add('is-hidden');
    setTimeout(function () { loader.remove(); }, 500);
  });
  // Fallback: hide after 4s even if load hasn't fired
  setTimeout(function () {
    if (loader.parentNode) {
      loader.classList.add('is-hidden');
      setTimeout(function () { if (loader.parentNode) loader.remove(); }, 500);
    }
  }, 4000);
}

/* ========================================
   SCENE IMAGE – Avatar-dependent header scene
   ======================================== */

function updateSceneImage() {
  var sceneImg = document.getElementById('station-scene');
  if (!sceneImg) return;
  var station = sceneImg.getAttribute('data-station');
  var avatar = getProgress().avatarChoice || 'explorer';
  sceneImg.src = '../assets/scenes/scene-' + station + '-' + avatar + '.png';
}

/* ========================================
   QUIZ DATA – 4 Fragen pro Station
   ======================================== */

var QUIZ_DATA = {
  'geraete-lichtung': [
    { q: 'Wie viel CO\u2082 verursacht die Herstellung eines Laptops?', o: ['50\u2013100 kg', '300\u2013400 kg', '1\u2019000 kg', '10 kg'], a: 1 },
    { q: 'Was ist der gr\u00f6sste \u00f6kologische Hebel bei Ger\u00e4ten?', o: ['Stromsparmodus nutzen', 'Lebensdauer verl\u00e4ngern', 'Recycling', 'Kleinere Ger\u00e4te kaufen'], a: 1 },
    { q: 'Wie viel E-Waste produziert die Schweiz pro Kopf j\u00e4hrlich?', o: ['5 kg', '12 kg', '23 kg', '40 kg'], a: 2 },
    { q: 'Was kann die Lebensdauer eines Laptops verl\u00e4ngern?', o: ['Neues Betriebssystem kaufen', 'SSD-Upgrade und L\u00fcfter reinigen', 'Mehr Cloud nutzen', 'Bildschirmhelligkeit erh\u00f6hen'], a: 1 }
  ],
  'cloud-quelle': [
    { q: 'Wie viel Prozent des globalen Stroms verbrauchen Rechenzentren?', o: ['0.1%', '1\u20131.5%', '10%', '25%'], a: 1 },
    { q: 'Wie werden Cloud-Daten typischerweise gespeichert?', o: ['1-fach lokal', '2-fach gespiegelt', '3-fach redundant', '5-fach verteilt'], a: 2 },
    { q: 'Deine 10 GB in der Cloud entsprechen real wie viel Speicher?', o: ['10 GB', '20 GB', '30 GB', '50 GB'], a: 2 },
    { q: 'Wie viel CO\u2082 verursacht eine E-Mail mit 5 MB Anhang?', o: ['5 g', '20 g', '50 g', '200 g'], a: 2 }
  ],
  'code-camp': [
    { q: 'Wie viel RAM kann VS Code mit 30+ Extensions belegen?', o: ['100\u2013200 MB', '500 MB', '1\u20132 GB', '4 GB'], a: 2 },
    { q: 'Wie viel Energie sparen Dark Themes auf OLED-Displays?', o: ['5%', '20%', 'Bis zu 60%', 'Keinen Unterschied'], a: 2 },
    { q: 'Was l\u00f6st Auto-Save mit kurzem Intervall aus?', o: ['Schnelleres Laden', 'St\u00e4ndige Disk-Writes und Extension-Neuauswertungen', 'Weniger Bugs', 'Bessere Versionierung'], a: 1 },
    { q: 'Was ist die bessere Strategie f\u00fcr IDE-Extensions?', o: ['Alle installieren', 'Bewusst aktivieren statt immer-an', 'Nur kostenpflichtige nutzen', 'Keine Extensions nutzen'], a: 1 }
  ],
  'server-riff': [
    { q: 'Was bedeutet PUE 1.0?', o: ['Sehr schlecht', 'Perfekt \u2013 alle Energie geht in Rechenleistung', 'Durchschnittlich', 'Nur K\u00fchlung'], a: 1 },
    { q: 'Was ist der durchschnittliche PUE der Branche?', o: ['1.0', '1.2', '1.6', '2.5'], a: 2 },
    { q: 'Warum stehen viele Rechenzentren in Skandinavien?', o: ['Billigere Arbeitskr\u00e4fte', 'K\u00fchles Klima senkt K\u00fchlbedarf', 'Mehr Platz', 'Weniger Gesetze'], a: 1 },
    { q: 'Wie viel Energie geht in einem typischen Rechenzentrum f\u00fcr K\u00fchlung drauf?', o: ['5%', '10%', 'Bis zu 40%', '70%'], a: 2 }
  ],
  'streaming-strom': [
    { q: 'Wie viel CO\u2082 verursacht 1 Stunde HD-Streaming?', o: ['5 g', '36 g', '200 g', '1 kg'], a: 1 },
    { q: 'Was verbraucht beim Streaming am meisten Energie?', o: ['Dein Bildschirm', 'Die Server + Netzwerkinfrastruktur', 'Der Router', 'Die App'], a: 1 },
    { q: 'Welche Verbindung ist energieeffizienter?', o: ['4G Mobilfunk', 'WLAN', 'Bluetooth', 'Satellit'], a: 1 },
    { q: 'Was spart am meisten Energie beim Video-Streaming?', o: ['Anderer Browser', 'Niedrigere Aufl\u00f6sung w\u00e4hlen', 'Kopfh\u00f6rer nutzen', 'Im Dunkeln schauen'], a: 1 }
  ],
  'backup-bucht': [
    { q: 'Was ist \u00abDark Data\u00bb?', o: ['Verschl\u00fcsselte Daten', 'Daten die gespeichert aber nie genutzt werden', 'Gel\u00f6schte Dateien', 'Daten im Darknet'], a: 1 },
    { q: 'Wie lautet die empfohlene Backup-Regel?', o: ['1-1-1 Regel', '2-1-1 Regel', '3-2-1 Regel', '5-3-2 Regel'], a: 2 },
    { q: 'Wie viel Prozent der gespeicherten Unternehmensdaten sind Dark Data?', o: ['10%', '30%', '\u00dcber 50%', '5%'], a: 2 },
    { q: 'Was ist eine nachhaltige Backup-Strategie?', o: ['Alles doppelt sichern', 'Bewusst entscheiden was gesichert wird', 'Nur lokal speichern', 'T\u00e4glich alles neu sichern'], a: 1 }
  ],
  'ide-asteroid': [
    { q: 'Was ist ein Hauptgrund f\u00fcr hohen RAM-Verbrauch bei IDEs?', o: ['Syntax Highlighting', 'Zu viele aktive Extensions/Language Server', 'Die Dateigr\u00f6sse', 'Das Betriebssystem'], a: 1 },
    { q: 'Was ist Electron (bei VS Code, Slack etc.)?', o: ['Ein Compiler', 'Ein Framework das einen ganzen Browser mitliefert', 'Ein Plugin-System', 'Eine Programmiersprache'], a: 1 },
    { q: 'Was reduziert den Ressourcenverbrauch einer IDE?', o: ['Mehr Tabs offen halten', 'Nicht ben\u00f6tigte Extensions deaktivieren', 'Gr\u00f6sseren Monitor nutzen', 'Mehr RAM kaufen'], a: 1 },
    { q: 'Was sendet Telemetrie in IDEs?', o: ['Deinen Quellcode', 'Nutzungsstatistiken an den Hersteller', 'Fehlermeldungen an dein Team', 'Nichts Relevantes'], a: 1 }
  ],
  'deploy-stern': [
    { q: 'Was ist ein effizienter Weg, CI/CD-Pipelines zu optimieren?', o: ['Mehr Runner kaufen', 'Dependency Caching nutzen', 'Jeden Commit deployen', 'Tests \u00fcberspringen'], a: 1 },
    { q: 'Was macht Docker Layer Caching?', o: ['Verschl\u00fcsselt Container', 'Vermeidet Neubauen unge\u00e4nderter Schichten', 'Beschleunigt Downloads', 'Komprimiert Images'], a: 1 },
    { q: 'Wann sollte ein Build NICHT laufen?', o: ['Bei jedem Push', 'Bei README-\u00c4nderungen', 'Bei Code-\u00c4nderungen', 'Bei Merges'], a: 1 },
    { q: 'Was spart pnpm gegen\u00fcber npm?', o: ['Ladezeit', 'Speicherplatz durch Hardlinks', 'Sicherheit', 'Kompatibilit\u00e4t'], a: 1 }
  ],
  'workflow-nebel': [
    { q: 'Wie viel RAM verbraucht ein einzelner Browser-Tab durchschnittlich?', o: ['5\u201310 MB', '50\u2013300 MB', '1 GB', '10 KB'], a: 1 },
    { q: 'Welcher Browser ist generell am RAM-sparsamsten?', o: ['Chrome', 'Firefox', 'Edge', 'Opera'], a: 1 },
    { q: 'Was spart Energie bei Video-Calls?', o: ['Bessere Kamera', 'Kamera ausschalten wenn m\u00f6glich', 'Hintergrundbild nutzen', 'Lautere Lautsprecher'], a: 1 },
    { q: 'Was ist \u00abE-Mail-Hoarding\u00bb?', o: ['Viele E-Mails senden', 'Alte E-Mails nie l\u00f6schen und endlos speichern', 'E-Mails verschl\u00fcsseln', 'Mehrere E-Mail-Konten haben'], a: 1 }
  ],
  'ki-kraftwerk': [
    { q: 'Wie viel mehr Energie braucht eine ChatGPT-Anfrage vs. eine Google-Suche?', o: ['Gleich viel', '3\u201310x mehr', '100x mehr', 'Weniger'], a: 1 },
    { q: 'Was verbraucht bei KI am meisten Energie?', o: ['Inference (Nutzung)', 'Training der Modelle', 'Datenspeicherung', 'Updates'], a: 1 },
    { q: 'Was ist \u00abEdge AI\u00bb?', o: ['KI am Rand des Internets', 'KI die lokal auf dem Ger\u00e4t l\u00e4uft', 'KI f\u00fcr Randgruppen', 'Experimentelle KI'], a: 1 },
    { q: 'Wie viel Wasser verbraucht das Training eines grossen KI-Modells?', o: ['100 Liter', '1\u2019000 Liter', 'Mehrere Millionen Liter', 'Kein Wasser'], a: 2 }
  ],
  'open-source-platz': [
    { q: 'Warum ist Open Source nachhaltiger als propriet\u00e4re Software?', o: ['Ist immer schneller', 'Code wird geteilt statt doppelt entwickelt', 'Braucht kein Internet', 'Hat weniger Bugs'], a: 1 },
    { q: 'Was verhindert Open Source?', o: ['Innovation', 'Vendor Lock-in', 'Sicherheit', 'Updates'], a: 1 },
    { q: 'Wie viele Entwickler:innen tragen zum Linux-Kernel bei?', o: ['50', '500', '\u00dcber 15\u2019000', '1 Million'], a: 2 },
    { q: 'Was ist ein Vorteil von Open Source f\u00fcr die Umwelt?', o: ['Weniger Serverkosten', 'Vermeidung redundanter Entwicklung', 'Schnelleres Internet', 'Weniger Bildschirmzeit'], a: 1 }
  ],
  'digital-ethics-turm': [
    { q: 'Was ist \u00abPlanned Obsolescence\u00bb?', o: ['Geplante Innovation', 'Geplante Veralterung von Produkten', 'Automatische Updates', 'Recycling-Programm'], a: 1 },
    { q: 'Was fordert das \u00abRight to Repair\u00bb?', o: ['Gratis Reparaturen', 'Recht auf Reparierbarkeit und Ersatzteile', 'Nur Markenreparaturen', 'Reparatur-Versicherung'], a: 1 },
    { q: 'Wohin wird ein Grossteil des E-Waste verschifft?', o: ['Zur\u00fcck an Hersteller', 'In Entwicklungsl\u00e4nder', 'Ins Meer', 'In Recycling-Anlagen in Europa'], a: 1 },
    { q: 'Was bedeutet \u00abnachhaltige Softwarearchitektur\u00bb?', o: ['Viel Code schreiben', 'Effiziente, ressourcenschonende Software designen', 'Nur Python nutzen', 'Open Source vermeiden'], a: 1 }
  ]
};

/* ========================================
   COMPLETE BUTTON + CELEBRATION
   ======================================== */

function initCompleteButton() {
  var btn = document.getElementById('complete-btn');
  if (!btn) return;

  var stationId = btn.dataset.station;

  if (isStationComplete(stationId)) {
    btn.classList.add('is-completed');
    btn.textContent = I18N.t('ui.station_completed', 'Station abgeschlossen \u2714');
  } else if (!isQuizPassed(stationId)) {
    btn.disabled = true;
    btn.classList.add('is-quiz-locked');
    btn.textContent = I18N.t('ui.answer_quiz_first', 'Beantworte zuerst die Kontrollfrage');
  }

  btn.addEventListener('click', function () {
    if (isStationComplete(stationId)) return;
    if (!isQuizPassed(stationId)) return;

    var progress = markStationComplete(stationId);
    setLastAvatarPosition(stationId);

    btn.classList.add('is-celebrating');
    spawnConfetti(btn);

    showToast(I18N.t('toast.station_complete', 'Station abgeschlossen! +' + POINTS_PER_STATION + ' Punkte').replace('{points}', POINTS_PER_STATION), 'success');

    // Redirect back to map after celebration
    setTimeout(function () {
      window.location.href = '../index.html';
    }, 1800);
  });
}

/* ========================================
   CONFETTI BURST
   ======================================== */

function spawnConfetti(anchor) {
  var container = document.createElement('div');
  container.className = 'confetti-container';
  anchor.parentElement.style.position = 'relative';
  anchor.parentElement.appendChild(container);

  var colors = ['#c8a84e', '#5bba7a', '#e07b4c', '#4a9ec2', '#c77dff', '#39ff14'];
  for (var i = 0; i < 20; i++) {
    var particle = document.createElement('span');
    particle.className = 'confetti-particle';
    particle.style.setProperty('--x', (Math.random() * 200 - 100) + 'px');
    particle.style.setProperty('--y', (Math.random() * -150 - 50) + 'px');
    particle.style.setProperty('--r', (Math.random() * 720 - 360) + 'deg');
    particle.style.setProperty('--delay', (Math.random() * 0.3) + 's');
    particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    container.appendChild(particle);
  }

  setTimeout(function () { container.remove(); }, 2000);
}

/* ========================================
   REVEAL BUTTONS
   ======================================== */

function initRevealButtons() {
  var buttons = document.querySelectorAll('.reveal-btn');
  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var targetId = btn.dataset.target;
      var content = document.getElementById(targetId);
      if (!content) return;

      var isActive = btn.classList.contains('is-active');
      if (isActive) {
        content.classList.remove('is-visible');
        btn.classList.remove('is-active');
        btn.textContent = I18N.t('ui.show_hint', 'Denkanstoss anzeigen');
      } else {
        content.classList.add('is-visible');
        btn.classList.add('is-active');
        btn.textContent = I18N.t('ui.hide_hint', 'Denkanstoss ausblenden');
      }
    });
  });
}

/* ========================================
   CHALLENGE BUTTON
   ======================================== */

var MIN_CHALLENGE_WORDS = 10;

function countWords(text) {
  var trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

function createWordCounter(textarea) {
  var counter = document.createElement('div');
  counter.className = 'challenge-word-counter';
  textarea.parentNode.insertBefore(counter, textarea.nextSibling);
  return counter;
}

function updateWordCounter(counter, wordCount) {
  var met = wordCount >= MIN_CHALLENGE_WORDS;
  counter.textContent = wordCount + ' / ' + MIN_CHALLENGE_WORDS + ' Wörter';
  counter.classList.toggle('is-met', met);
  return met;
}

function initChallengeButton() {
  var btn = document.querySelector('.challenge-btn');
  if (!btn) return;

  var stationId = btn.dataset.station;
  var textarea = document.querySelector('.challenge-response');

  if (isChallengeComplete(stationId)) {
    btn.classList.add('is-accepted');
    btn.textContent = I18N.t('ui.challenge_submitted', 'Challenge abgegeben \u2714');
    if (textarea) {
      textarea.value = getChallengeResponse(stationId);
      textarea.disabled = true;
      var counter = createWordCounter(textarea);
      updateWordCounter(counter, countWords(textarea.value));
    }
  } else if (textarea) {
    var counter = createWordCounter(textarea);
    var checkMin = function () {
      var met = updateWordCounter(counter, countWords(textarea.value));
      btn.disabled = !met;
    };
    checkMin();
    textarea.addEventListener('input', checkMin);
  }

  btn.addEventListener('click', function () {
    if (isChallengeComplete(stationId)) return;
    if (textarea && countWords(textarea.value) < MIN_CHALLENGE_WORDS) return;

    if (textarea) {
      saveChallengeResponse(stationId, textarea.value.trim());
      textarea.disabled = true;
    }

    markChallengeComplete(stationId);
    btn.classList.add('is-accepted');
    btn.textContent = I18N.t('ui.challenge_submitted', 'Challenge abgegeben \u2714');

    showToast(I18N.t('toast.challenge_submitted', 'Challenge abgegeben! +' + POINTS_PER_CHALLENGE + ' Punkte').replace('{points}', POINTS_PER_CHALLENGE), 'success');

    setTimeout(function () {
      var newBadges = checkBadges();
      newBadges.forEach(function (badge, i) {
        setTimeout(function () {
          showToast(I18N.t('toast.badge_unlocked', 'Achievement unlocked: ' + badge.name + '! ' + badge.icon).replace('{name}', getBadgeName(badge)).replace('{icon}', badge.icon), 'achievement');
        }, i * 1200);
      });
    }, 500);
  });
}

/* ========================================
   TEXTAREAS – Reflexion & Notizen
   ======================================== */

function initTextareas() {
  var areas = document.querySelectorAll('.station-textarea');
  areas.forEach(function (ta) {
    var stationId = ta.dataset.station;
    var type = ta.dataset.type;
    if (!stationId || !type) return;

    // Load saved value
    if (type === 'reflection') {
      ta.value = getReflection(stationId);
    } else if (type === 'note') {
      ta.value = getNote(stationId);
    }

    // Auto-save on input
    var saveTimer = null;
    ta.addEventListener('input', function () {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(function () {
        if (type === 'reflection') {
          saveReflection(stationId, ta.value);
        } else if (type === 'note') {
          saveNote(stationId, ta.value);
        }
      }, 500);
    });
  });
}

/* ========================================
   QUIZ SYSTEM
   ======================================== */

function initQuiz() {
  var container = document.getElementById('station-quiz');
  if (!container) return;

  var stationId = container.dataset.station;
  if (!stationId || !QUIZ_DATA[stationId]) return;

  // Already passed
  if (isQuizPassed(stationId)) {
    container.innerHTML = '<p class="quiz-passed">' + I18N.t('ui.quiz_passed', '\u2714 Kontrollfrage bestanden!') + '</p>';
    return;
  }

  var questions = QUIZ_DATA[stationId].slice();
  var usedIndexes = [];
  var quizState = { needsBonus: false, bonusShown: false, timerInterval: null, wrongCount: 0 };

  // Check for active penalty timer from page reload
  var timerKey = 'quizTimer_' + stationId;
  var savedEnd = sessionStorage.getItem(timerKey);
  if (savedEnd) {
    var remaining = Math.ceil((parseInt(savedEnd) - Date.now()) / 1000);
    if (remaining > 0) {
      quizState.needsBonus = true;
      // On reload we don't have the original question – show timer-only view
      container.innerHTML = '<p class="quiz-feedback is-wrong">' + I18N.t('ui.quiz_wrong', 'Leider falsch \u2013 lies den Inhalt nochmals durch.') + '</p>';
      showPenaltyTimer(container, stationId, questions, usedIndexes, quizState, remaining);
      return;
    } else {
      sessionStorage.removeItem(timerKey);
      quizState.needsBonus = true;
    }
  }

  showNextQuestion(container, stationId, questions, usedIndexes, quizState);
}

function showQuestionByIndex(container, stationId, questions, usedIndexes, quizState, idx) {
  var q = questions[idx];
  renderQuestion(container, stationId, questions, usedIndexes, quizState, idx, q);
}

function showNextQuestion(container, stationId, questions, usedIndexes, quizState) {
  // Pick a random unused question
  var available = [];
  for (var i = 0; i < questions.length; i++) {
    if (usedIndexes.indexOf(i) === -1) available.push(i);
  }

  if (available.length === 0) {
    usedIndexes.length = 0;
    for (var j = 0; j < questions.length; j++) available.push(j);
  }

  var idx = available[Math.floor(Math.random() * available.length)];
  usedIndexes.push(idx);
  var q = questions[idx];
  renderQuestion(container, stationId, questions, usedIndexes, quizState, idx, q);
}

function renderQuestion(container, stationId, questions, usedIndexes, quizState, idx, q) {

  var html = '';
  if (quizState.bonusShown) {
    html += '<span class="quiz-bonus-label">' + I18N.t('ui.quiz_bonus_label', 'Bonusfrage') + '</span>';
  }
  var qKey = 'quiz.' + stationId + '.' + idx + '.q';
  html += '<p class="quiz-question">' + I18N.t(qKey, q.q) + '</p>';
  html += '<div class="quiz-options">';
  for (var k = 0; k < q.o.length; k++) {
    var oKey = 'quiz.' + stationId + '.' + idx + '.o' + k;
    html += '<button class="quiz-option" data-index="' + k + '">' + I18N.t(oKey, q.o[k]) + '</button>';
  }
  html += '</div>';
  html += '<p class="quiz-feedback" id="quiz-feedback"></p>';

  container.innerHTML = html;

  var options = container.querySelectorAll('.quiz-option');
  options.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var chosen = parseInt(btn.dataset.index);
      var feedback = document.getElementById('quiz-feedback');

      if (chosen === q.a) {
        btn.classList.add('is-correct');
        feedback.textContent = I18N.t('ui.quiz_correct', 'Richtig!');
        feedback.className = 'quiz-feedback is-correct';

        if (quizState.needsBonus && !quizState.bonusShown) {
          // Correct after penalty – show bonus question
          quizState.bonusShown = true;
          options.forEach(function (b) { b.disabled = true; });
          setTimeout(function () {
            showNextQuestion(container, stationId, questions, usedIndexes, quizState);
          }, 1200);
        } else {
          // First attempt correct OR bonus question correct → pass
          markQuizPassed(stationId);

          var completeBtn = document.getElementById('complete-btn');
          if (completeBtn && !isStationComplete(stationId)) {
            completeBtn.disabled = false;
            completeBtn.classList.remove('is-quiz-locked');
            completeBtn.textContent = I18N.t('ui.complete_station', 'Station abschliessen \u2714');
          }

          setTimeout(function () {
            container.innerHTML = '<p class="quiz-passed">' + I18N.t('ui.quiz_passed', '\u2714 Kontrollfrage bestanden!') + '</p>';
          }, 1200);
        }
      } else {
        // Wrong
        btn.classList.add('is-wrong');
        deductPoints(3);
        showToast(I18N.t('toast.wrong_answer', '-3 Punkte \u2013 falsche Antwort'), 'error');
        feedback.textContent = I18N.t('ui.quiz_wrong', 'Leider falsch \u2013 lies den Inhalt nochmals durch.');
        feedback.className = 'quiz-feedback is-wrong';

        options.forEach(function (b) { b.disabled = true; });

        quizState.wrongCount++;
        quizState.needsBonus = true;
        quizState.bonusShown = false;

        var penaltySeconds = quizState.wrongCount === 1 ? 35 : 20;
        setTimeout(function () {
          showPenaltyTimer(container, stationId, questions, usedIndexes, quizState, penaltySeconds, idx);
        }, 500);
      }
    });
  });
}

function showPenaltyTimer(container, stationId, questions, usedIndexes, quizState, seconds, repeatIdx) {
  var timerKey = 'quizTimer_' + stationId;
  var circumference = 2 * Math.PI * 50;
  var remaining = seconds;

  // Persist end time for page reload
  if (!sessionStorage.getItem(timerKey)) {
    sessionStorage.setItem(timerKey, String(Date.now() + remaining * 1000));
  }

  // Remove any existing timer (e.g. from page reload)
  var existingTimer = container.querySelector('.quiz-timer');
  if (existingTimer) existingTimer.remove();

  // Build timer element and append below the question
  var timerDiv = document.createElement('div');
  timerDiv.className = 'quiz-timer';

  var totalSeconds = seconds;
  var progress = remaining / totalSeconds;
  var offset = circumference * (1 - progress);

  timerDiv.innerHTML =
    '<p class="quiz-timer__message">' + I18N.t('ui.quiz_timer_message', 'Lies den Lerninhalt oben nochmals durch und korrigiere deine Antwort!') + '</p>' +
    '<div class="quiz-timer__circle">' +
      '<svg viewBox="0 0 120 120">' +
        '<circle class="quiz-timer__track" cx="60" cy="60" r="50"/>' +
        '<circle class="quiz-timer__progress" cx="60" cy="60" r="50"' +
          ' stroke-dasharray="' + circumference + '"' +
          ' stroke-dashoffset="' + offset + '"' +
          ' transform="rotate(-90 60 60)"/>' +
      '</svg>' +
      '<span class="quiz-timer__seconds">' + remaining + '</span>' +
    '</div>' +
    '<p class="quiz-timer__countdown-text">' + I18N.t('ui.quiz_timer_countdown', 'Erneuter Versuch in ' + remaining + ' Sekunden').replace('{seconds}', remaining) + '</p>';

  container.appendChild(timerDiv);

  quizState.timerInterval = setInterval(function () {
    remaining--;
    if (remaining <= 0) {
      clearInterval(quizState.timerInterval);
      quizState.timerInterval = null;
      sessionStorage.removeItem(timerKey);
      if (typeof repeatIdx === 'number') {
        showQuestionByIndex(container, stationId, questions, usedIndexes, quizState, repeatIdx);
      } else {
        showNextQuestion(container, stationId, questions, usedIndexes, quizState);
      }
    } else {
      var secondsEl = timerDiv.querySelector('.quiz-timer__seconds');
      var textEl = timerDiv.querySelector('.quiz-timer__countdown-text');
      var progressEl = timerDiv.querySelector('.quiz-timer__progress');
      if (secondsEl) secondsEl.textContent = remaining;
      if (textEl) textEl.textContent = I18N.t('ui.quiz_timer_countdown', 'Erneuter Versuch in ' + remaining + ' Sekunden').replace('{seconds}', remaining);
      if (progressEl) {
        var o = circumference * (1 - remaining / totalSeconds);
        progressEl.setAttribute('stroke-dashoffset', o);
      }
    }
  }, 1000);
}
