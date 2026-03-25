/* ========================================
   LANDSCAPE.JS – Scrollable Map + Fork Model
   ======================================== */

var _previousLevel = null;

document.addEventListener('DOMContentLoaded', function () {
  _previousLevel = getLevel(getPoints()).level;

  initSession();
  applyInitialState();
  initAvatarSelect();
  initStartZone();
  initStartSparkles();
  updateGameHeader();
  initResetButton();
  initHighscoreButton();
  initNotebookButton();
  initMiniGameNodes();
  initMiniGameToggle();

  // Populate group suggestions dropdown
  if (typeof populateGroupDatalist === 'function') {
    populateGroupDatalist('group-suggestions');
  }

  // Show explorer count on landing page
  _loadExplorerCount();

  // Auto-sync XP to Supabase when returning to map
  if (isExpeditionStarted() && typeof syncCurrentPlayer === 'function') {
    syncCurrentPlayer();
  }
});

function _loadExplorerCount() {
  var el = document.getElementById('explorer-count');
  if (!el || typeof supabaseFetch !== 'function') return;
  supabaseFetch('/highscores?select=player_id', { method: 'HEAD', headers: { 'Prefer': 'count=exact' } })
    .then(function (res) {
      var range = res.headers.get('content-range');
      if (range) {
        var total = range.split('/')[1];
        if (total && parseInt(total) > 0) {
          el.innerHTML = '<svg class="landing-hero__icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> ' + total + ' Entdecker:innen haben die Welt bereits erkundet';
        }
      }
    })
    .catch(function () { /* silent */ });
}

/* ========================================
   INITIAL STATE – show correct section
   ======================================== */

function applyInitialState() {
  var hasAvatar = getAvatarChoice() !== null;
  var hasName = getPlayerName() !== '';
  var started = isExpeditionStarted();

  var avatarSelect = document.getElementById('avatar-select');
  var startZone = document.getElementById('start-zone');
  var mapContainer = document.getElementById('map-container');
  var mobileLandscape = document.getElementById('mobile-landscape');
  var header = document.getElementById('game-header');

  if (started) {
    if (avatarSelect) avatarSelect.classList.add('is-hidden');
    if (startZone) startZone.classList.add('is-hidden');
    if (mapContainer) mapContainer.classList.add('is-active');
    if (mobileLandscape) mobileLandscape.classList.add('is-active');
    if (header) header.classList.add('is-active');
    initMapView();

    // Scroll to avatar position when returning from a station
    var returningFromStation = sessionStorage.getItem('xp-before') !== null;
    if (returningFromStation) {
      setTimeout(function () {
        var avatar = document.getElementById('map-avatar');
        if (avatar) {
          avatar.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 200);
    }
  } else if (hasAvatar && hasName) {
    // Skip start-zone, go directly to expedition
    if (avatarSelect) avatarSelect.classList.add('is-hidden');
    if (startZone) startZone.classList.add('is-hidden');
    startExpedition();
    if (mapContainer) mapContainer.classList.add('is-active');
    if (mobileLandscape) mobileLandscape.classList.add('is-active');
    if (header) header.classList.add('is-active');
    updateGameHeader();
    initMapView();
    positionAvatarAt('sofa');
  } else {
    if (startZone) startZone.classList.add('is-hidden');
  }
}

/* ========================================
   AVATAR SELECTION + NAME INPUT
   ======================================== */

function initAvatarSelect() {
  var buttons = document.querySelectorAll('.avatar-option');
  var confirmBtn = document.getElementById('avatar-confirm-btn');
  var nameInput = document.getElementById('player-name-input');

  // Select avatar
  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var choice = btn.dataset.avatar;
      setAvatarChoice(choice);
      buttons.forEach(function (b) { b.classList.remove('is-selected'); });
      btn.classList.add('is-selected');
      checkAvatarConfirmReady();
    });
  });

  // Name input
  if (nameInput) {
    nameInput.addEventListener('input', function () {
      checkAvatarConfirmReady();
    });
  }

  // Confirm button
  if (confirmBtn) {
    confirmBtn.addEventListener('click', function () {
      var name = nameInput ? nameInput.value.trim() : '';
      var groupInput = document.getElementById('player-group-input');
      var group = groupInput ? groupInput.value.trim() : '';
      if (!name || !getAvatarChoice()) return;

      // Profanity check
      if (typeof containsProfanity === 'function' && containsProfanity(name)) {
        showToast('Bitte wähle einen anderen Namen.', 'success');
        return;
      }
      if (group && typeof containsProfanity === 'function' && containsProfanity(group)) {
        showToast('Bitte wähle einen anderen Gruppennamen.', 'success');
        return;
      }

      setPlayerName(name);
      if (typeof setPlayerGroup === 'function') setPlayerGroup(group);
      document.getElementById('avatar-select').classList.add('is-hidden');

      // Skip start-zone (sofa), go directly to expedition
      startExpedition();
      var mapContainer = document.getElementById('map-container');
      var mobileLandscape = document.getElementById('mobile-landscape');
      var header = document.getElementById('game-header');
      if (mapContainer) mapContainer.classList.add('is-active');
      if (mobileLandscape) mobileLandscape.classList.add('is-active');
      if (header) header.classList.add('is-active');
      updateGameHeader();
      initMapView();
      positionAvatarAt('sofa');
    });
  }
}

function checkAvatarConfirmReady() {
  var confirmBtn = document.getElementById('avatar-confirm-btn');
  var nameInput = document.getElementById('player-name-input');
  if (!confirmBtn) return;
  var hasChoice = getAvatarChoice() !== null;
  var hasName = nameInput && nameInput.value.trim().length > 0;
  confirmBtn.disabled = !(hasChoice && hasName);
}

function updateStartAvatarImage() {
  var choice = getAvatarChoice();
  if (!choice) return;
  var avatar = AVATAR_CHOICES[choice];
  if (!avatar) return;
  var startAvatar = document.getElementById('start-avatar');
  if (startAvatar) startAvatar.src = avatar.image;
}

function updateStartName() {
  var name = getPlayerName();
  var el = document.getElementById('start-player-name');
  if (el && name) el.textContent = name;
}

/* ========================================
   START ZONE (Sofa -> Expedition)
   ======================================== */

function initStartZone() {
  var btn = document.getElementById('start-expedition-btn');
  if (!btn) return;

  btn.addEventListener('click', function () {
    startExpedition();

    var content = document.getElementById('start-content');
    var avatar = document.getElementById('start-avatar');

    if (content) content.classList.add('is-shaking');
    if (avatar) spawnSparkBurst(avatar);

    setTimeout(function () {
      if (avatar) avatar.classList.add('is-leaving');
    }, 200);

    setTimeout(function () {
      var startZone = document.getElementById('start-zone');
      var mapContainer = document.getElementById('map-container');
      var mobileLandscape = document.getElementById('mobile-landscape');
      var header = document.getElementById('game-header');

      if (startZone) startZone.classList.add('is-hidden');
      if (mapContainer) mapContainer.classList.add('is-active');
      if (mobileLandscape) mobileLandscape.classList.add('is-active');
      if (header) header.classList.add('is-active');

      updateGameHeader();
      initMapView();

      // Avatar stays at sofa until user clicks a station
      positionAvatarAt('sofa');

      if (mapContainer) {
        mapContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      showToast(I18N.t('toast.expedition_started', 'Expedition gestartet! Wähle deine erste Station.'), 'achievement');
    }, 800);
  });
}

function spawnSparkBurst(element) {
  var rect = element.getBoundingClientRect();
  var cx = rect.left + rect.width / 2;
  var cy = rect.top + rect.height / 2;
  var count = 10;

  for (var i = 0; i < count; i++) {
    var spark = document.createElement('span');
    spark.className = 'spark';
    var angle = (Math.PI * 2 / count) * i + (Math.random() * 0.5);
    var dist = 40 + Math.random() * 60;
    var dx = Math.cos(angle) * dist;
    var dy = Math.sin(angle) * dist;
    var dur = 0.4 + Math.random() * 0.3;

    spark.style.cssText = 'left:' + cx + 'px;top:' + cy + 'px;position:fixed;--dx:' + dx + ';--dy:' + dy + ';--duration:' + dur + 's;z-index:9999;';
    document.body.appendChild(spark);

    setTimeout(function (el) {
      el.remove();
    }.bind(null, spark), dur * 1000 + 100);
  }
}

function initStartSparkles() {
  var container = document.getElementById('start-sparkles');
  if (!container) return;

  var count = window.innerWidth < 600 ? 6 : 12;
  for (var i = 0; i < count; i++) {
    var span = document.createElement('span');
    span.className = 'particle particle--sparkle';
    span.style.cssText =
      '--x:' + (Math.random() * 100) +
      ';--y:' + (Math.random() * 100) +
      ';--dx:' + (Math.random() * 30 - 15) +
      ';--dy:' + (Math.random() * 30 - 15) +
      ';--size:' + (3 + Math.random() * 5) +
      ';--duration:' + (3 + Math.random() * 4) + 's' +
      ';--delay:' + (Math.random() * 3) + 's';
    container.appendChild(span);
  }
}

/* ========================================
   MAP VIEW INITIALIZATION
   ======================================== */

function initMapView() {
  positionStations();
  applyStationStates();
  positionWorldLabels();
  initMapPaths();
  positionMapAvatar();
  initStationClicks();
  initMapParticles();
  updateMobileWorld();
  _refreshMiniGameNodes();
  initLazyPanels();
  initFinaleMarker();
}

/* ========================================
   SVG PATH LINES between stations
   ======================================== */

function initMapPaths() {
  var svg = document.getElementById('map-paths');
  if (!svg || svg.querySelectorAll('path').length > 0) return;

  PATH_SEGMENTS.forEach(function (seg) {
    var fromPos = getPositionFor(seg.from);
    var toPos = getPositionFor(seg.to);
    if (!fromPos || !toPos) return;

    var d = generateCurve(fromPos, toPos);

    var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    path.setAttribute('class', 'map-path map-path--' + seg.world);
    path.setAttribute('data-from', seg.from);
    path.setAttribute('data-to', seg.to);
    path.setAttribute('vector-effect', 'non-scaling-stroke');

    // Determine path state
    var fromDone = seg.from === 'sofa' || isStationComplete(seg.from);
    var toDone = seg.to === 'abschluss-feier' ? isFinaleUnlocked() : isStationComplete(seg.to);

    if (fromDone && toDone) {
      path.classList.add('is-completed');
    } else if (fromDone) {
      path.classList.add('is-active');
    } else {
      path.classList.add('is-locked');
    }

    svg.appendChild(path);
  });
}

function generateCurve(from, to) {
  var x1 = from.left, y1 = from.top;
  var x2 = to.left, y2 = to.top;
  var midY = (y1 + y2) / 2;
  // S-curve: start vertical, then horizontal
  return 'M ' + x1 + ' ' + y1 +
    ' C ' + x1 + ' ' + midY + ', ' + x2 + ' ' + midY + ', ' + x2 + ' ' + y2;
}

/* ========================================
   STATION POSITIONING
   ======================================== */

function positionStations() {
  var stations = document.querySelectorAll('.map-station');
  stations.forEach(function (el) {
    var stationId = el.dataset.station;
    var pos = STATION_POSITIONS[stationId];
    if (!pos) return;
    el.style.setProperty('--pos-top', pos.top + '%');
    el.style.setProperty('--pos-left', pos.left + '%');
  });

  // Position minigame nodes on the path between the 3rd station and next world's 1st
  _positionMiniGameNodes();
}

function _positionMiniGameNodes() {
  var mgNodes = document.querySelectorAll('.map-minigame');
  mgNodes.forEach(function (el) {
    var transition = null;
    for (var i = 0; i < WORLD_TRANSITIONS.length; i++) {
      if (WORLD_TRANSITIONS[i].id === el.dataset.transition) { transition = WORLD_TRANSITIONS[i]; break; }
    }
    if (!transition) return;

    var world = WORLDS[transition.from];
    if (!world) return;

    // Find the "3rd station" – the fork that was done last or not done yet
    var progress = getProgress();
    var fork0Done = progress.completedStations.includes(world.fork[0]);
    var fork1Done = progress.completedStations.includes(world.fork[1]);
    var thirdStation;
    if (!fork0Done && !fork1Done) {
      thirdStation = world.fork[0]; // default to first fork
    } else if (fork0Done && !fork1Done) {
      thirdStation = world.fork[1]; // the undone one
    } else if (!fork0Done && fork1Done) {
      thirdStation = world.fork[0]; // the undone one
    } else {
      // Both done – pick the one completed later (last in array)
      var idx0 = progress.completedStations.indexOf(world.fork[0]);
      var idx1 = progress.completedStations.indexOf(world.fork[1]);
      thirdStation = idx1 > idx0 ? world.fork[1] : world.fork[0];
    }

    var fromPos = STATION_POSITIONS[thirdStation];
    var nextWorld = transition.to ? WORLDS[transition.to] : null;
    var toPos = nextWorld ? STATION_POSITIONS[nextWorld.mandatory] : STATION_POSITIONS['abschluss-feier'];
    if (!fromPos || !toPos) return;

    // Slightly above midpoint of the S-curve between the two stations
    // Position on the S-curve at t=0.4 (slightly closer to fork station)
    // S-curve: P0=(x1,y1) P1=(x1,midY) P2=(x2,midY) P3=(x2,y2)
    var x1 = fromPos.left, y1 = fromPos.top;
    var x2 = toPos.left, y2 = toPos.top;
    var midY = (y1 + y2) / 2;
    var t = 0.5;
    var mt = 1 - t;
    // Cubic bezier: B(t) = mt³·P0 + 3·mt²·t·P1 + 3·mt·t²·P2 + t³·P3
    var bx = mt*mt*mt*x1 + 3*mt*mt*t*x1 + 3*mt*t*t*x2 + t*t*t*x2;
    var by = mt*mt*mt*y1 + 3*mt*mt*t*midY + 3*mt*t*t*midY + t*t*t*y2;
    el.style.top = by + '%';
    el.style.left = bx + '%';
    el.style.left = ((fromPos.left + toPos.left) / 2) + '%';
  });
}

/* ========================================
   STATION STATES (completed/locked/accessible)
   ======================================== */

function applyStationStates() {
  var stations = document.querySelectorAll('.map-station');
  stations.forEach(function (el) {
    var stationId = el.dataset.station;
    var worldId = el.dataset.world;
    if (!stationId || !worldId) return;

    el.classList.remove('is-completed', 'is-locked', 'is-fork-locked');

    if (isStationComplete(stationId)) {
      el.classList.add('is-completed');
    } else if (!isWorldUnlocked(worldId)) {
      el.classList.add('is-locked');
    } else {
      var world = WORLDS[worldId];
      if (world && world.fork.includes(stationId) && !isForkUnlocked(worldId)) {
        el.classList.add('is-fork-locked');
      }
    }
  });
}

/* ========================================
   WORLD LABELS POSITIONING
   ======================================== */

function positionWorldLabels() {
  var labelPositions = {
    jungle: { top: 1, left: 50 },
    ocean:  { top: 21, left: 50 },
    cosmos: { top: 41, left: 50 },
    metro:  { top: 61.5, left: 50 }
  };

  var labels = document.querySelectorAll('.map-world-label');
  labels.forEach(function (label) {
    var worldId = label.dataset.world;
    var pos = labelPositions[worldId];
    if (!pos) return;
    label.style.top = pos.top + '%';
    label.style.left = pos.left + '%';
    label.style.transform = 'translateX(-50%)';

    if (!isWorldUnlocked(worldId)) {
      label.classList.add('is-locked');
    } else {
      label.classList.remove('is-locked');
    }
  });
}

/* ========================================
   MAP AVATAR – position & animate
   ======================================== */

function positionMapAvatar() {
  var avatar = document.getElementById('map-avatar');
  var avatarImg = document.getElementById('map-avatar-img');
  var avatarName = document.getElementById('map-avatar-name');
  if (!avatar) return;

  if (avatarImg) avatarImg.src = getAvatarImage();
  if (avatarName) avatarName.textContent = getPlayerName();

  // Position at last known location (no animation)
  var lastPos = getLastAvatarPosition();
  positionAvatarAt(lastPos);
}

function positionAvatarAt(posId) {
  var avatar = document.getElementById('map-avatar');
  if (!avatar) return;

  var pos = getPositionFor(posId);
  if (!pos) pos = SOFA_POSITION;

  avatar.style.transition = 'none';
  avatar.style.top = pos.top + '%';
  avatar.style.left = pos.left + '%';
  avatar.style.display = 'flex';
}

function animateAvatarTo(posId, callback) {
  var avatar = document.getElementById('map-avatar');
  if (!avatar) return;

  var pos = getPositionFor(posId);
  if (!pos) return;

  avatar.style.transition = 'top 1.2s ease-in-out, left 1.2s ease-in-out';
  avatar.style.top = pos.top + '%';
  avatar.style.left = pos.left + '%';

  setTimeout(function () {
    if (callback) callback();
  }, 1300);
}

function findAvatarStation() {
  var progress = getProgress();

  for (var i = WORLD_ORDER.length - 1; i >= 0; i--) {
    var worldId = WORLD_ORDER[i];
    if (!isWorldUnlocked(worldId)) continue;

    var all = getAllStations(worldId);
    for (var s = 0; s < all.length; s++) {
      if (!progress.completedStations.includes(all[s])) {
        return all[s];
      }
    }
  }

  var lastWorld = WORLD_ORDER[WORLD_ORDER.length - 1];
  var lastStations = getAllStations(lastWorld);
  return lastStations[lastStations.length - 1];
}

/* ========================================
   STATION CLICK – animate avatar, then navigate
   ======================================== */

function initStationClicks() {
  var stations = document.querySelectorAll('.map-station');
  stations.forEach(function (el) {
    el.addEventListener('click', function (e) {
      var stationId = el.dataset.station;

      if (el.classList.contains('is-locked') || el.classList.contains('is-fork-locked')) {
        e.preventDefault();
        showToast(I18N.t('ui.station_locked', 'Diese Station ist noch gesperrt.'), 'success');
        return;
      }

      // Already completed – just navigate
      if (isStationComplete(stationId)) return;

      e.preventDefault();
      var href = el.getAttribute('href');

      setLastAvatarPosition(stationId);
      animateAvatarTo(stationId, function () {
        window.location.href = href;
      });
    });
  });

  // Mobile: prevent locked station clicks
  var mobileCards = document.querySelectorAll('.mobile-station-card');
  mobileCards.forEach(function (card) {
    card.addEventListener('click', function (e) {
      if (card.classList.contains('is-fork-locked') ||
          card.closest('.mobile-world.is-locked')) {
        e.preventDefault();
        showToast(I18N.t('ui.station_locked', 'Diese Station ist noch gesperrt.'), 'success');
      }
    });
  });
}

/* ========================================
   MINI-GAME TRIGGER
   ======================================== */

var WORLD_TRANSITIONS = [
  { from: 'jungle', to: 'ocean', id: 'jungle-to-ocean' },
  { from: 'ocean', to: 'cosmos', id: 'ocean-to-cosmos' },
  { from: 'cosmos', to: 'metro', id: 'cosmos-to-metro' },
  { from: 'metro', to: null, id: 'metro-to-finale' }
];

function initMiniGameNodes() {
  // Initialize both mobile-landscape nodes and map-container nodes
  var allNodes = document.querySelectorAll('.mobile-minigame, .map-minigame');
  allNodes.forEach(function (node) {
    var transitionId = node.dataset.transition;
    _applyMiniGameState(node, transitionId);
  });
}

function _applyMiniGameState(node, transitionId) {
  // Find matching transition
  var transition = null;
  for (var i = 0; i < WORLD_TRANSITIONS.length; i++) {
    if (WORLD_TRANSITIONS[i].id === transitionId) { transition = WORLD_TRANSITIONS[i]; break; }
  }
  if (!transition) return;

  var worldFullyDone = typeof isWorldComplete === 'function' && isWorldComplete(transition.from);
  var completed = typeof isMiniGameComplete === 'function' && isMiniGameComplete(transitionId);

  // For mobile-landscape nodes
  var btn = node.querySelector('.mobile-minigame__btn');
  var statusEl = node.querySelector('.mobile-minigame__status');
  var hintEl = node.querySelector('.mobile-minigame__lock-hint');

  // For map-container nodes (the node itself is the button)
  var isMapNode = node.classList.contains('map-minigame');

  if (completed) {
    node.classList.remove('is-locked');
    node.classList.add('is-completed');
    if (statusEl) statusEl.textContent = '\u2714';
    if (hintEl) hintEl.style.display = 'none';
    if (btn) btn.disabled = true;
    if (isMapNode) node.disabled = true;
  } else if (!worldFullyDone) {
    node.classList.add('is-locked');
    if (btn) btn.disabled = true;
    if (isMapNode) node.disabled = true;
  } else {
    // Playable
    node.classList.remove('is-locked');
    if (hintEl) hintEl.style.display = 'none';
    var clickTarget = isMapNode ? node : btn;
    if (clickTarget && !clickTarget.dataset.bound) {
      clickTarget.dataset.bound = '1';
      clickTarget.addEventListener('click', function () {
        if (isMapNode) {
          // Animate avatar to the minigame node position, then show game
          var mgPos = { top: parseFloat(node.style.top), left: parseFloat(node.style.left) };
          var avatar = document.getElementById('map-avatar');
          if (avatar) {
            avatar.style.transition = 'top 1.2s ease-in-out, left 1.2s ease-in-out';
            avatar.style.top = mgPos.top + '%';
            avatar.style.left = mgPos.left + '%';
          }
          setTimeout(function () {
            _showMiniGame(transition);
          }, 1300);
        } else {
          _showMiniGame(transition);
        }
      });
    }
  }
}

var _minigameLoaded = false;
function _loadMiniGameAssets(callback) {
  if (_minigameLoaded) { callback(); return; }
  // Load CSS
  var link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'css/minigame.css';
  document.head.appendChild(link);
  // Load JS
  var script = document.createElement('script');
  script.src = 'js/minigame.js';
  script.onload = function () { _minigameLoaded = true; callback(); };
  document.head.appendChild(script);
}

function _showMiniGame(transition) {
  _loadMiniGameAssets(function () { _showMiniGameReady(transition); });
}

function _showMiniGameReady(transition) {
  var overlay = document.getElementById('minigame-overlay');
  var titleEl = document.getElementById('minigame-title');
  var startScreen = document.getElementById('minigame-start');
  var endScreen = document.getElementById('minigame-end');
  var startBtn = document.getElementById('minigame-start-btn');
  var skipBtn = document.getElementById('minigame-skip-btn');
  var continueBtn = document.getElementById('minigame-continue-btn');
  var resultEl = document.getElementById('minigame-result');

  if (!overlay) return;

  var themeData = MiniGame.THEMES[transition.id];
  if (titleEl) titleEl.textContent = themeData ? themeData.name : 'Bonus-Minispiel';

  // Reset visibility
  startScreen.style.display = '';
  endScreen.style.display = 'none';
  overlay.style.display = '';

  var avatarSrc = typeof getAvatarImage === 'function' ? getAvatarImage() : 'assets/avatar-explorer.png';
  MiniGame.init('minigame-canvas', transition.id, avatarSrc, function (collected) {
    // Game finished
    startScreen.style.display = 'none';
    endScreen.style.display = '';
    if (resultEl) {
      resultEl.textContent = '+' + collected + ' Bonus-XP!';
    }
    markMiniGameComplete(transition.id, collected);
  });

  requestAnimationFrame(function () {
    overlay.classList.add('is-visible');
  });

  // Start button + spacebar
  var _started = false;
  var _startHandler = function () {
    if (_started) return;
    _started = true;
    startScreen.style.display = 'none';
    MiniGame.start();
    startBtn.removeEventListener('click', _startHandler);
    document.removeEventListener('keydown', _spaceStartHandler);
  };
  var _spaceStartHandler = function (e) {
    if (e.code === 'Space') {
      e.preventDefault();
      _startHandler();
    }
  };
  startBtn.addEventListener('click', _startHandler);
  document.addEventListener('keydown', _spaceStartHandler);

  // Skip button
  var _skipHandler = function () {
    MiniGame.cleanup();
    markMiniGameComplete(transition.id, 0);
    _closeMiniGame();
    skipBtn.removeEventListener('click', _skipHandler);
  };
  skipBtn.addEventListener('click', _skipHandler);

  // Continue button (after game ends)
  var _continueHandler = function () {
    MiniGame.cleanup();
    _closeMiniGame();
    continueBtn.removeEventListener('click', _continueHandler);
  };
  continueBtn.addEventListener('click', _continueHandler);
}

function _closeMiniGame() {
  var overlay = document.getElementById('minigame-overlay');
  if (!overlay) return;
  overlay.classList.remove('is-visible');
  setTimeout(function () {
    overlay.style.display = 'none';
  }, 400);
  // Refresh header and minigame nodes
  updateGameHeader();
  _refreshMiniGameNodes();
}

function _refreshMiniGameNodes() {
  _positionMiniGameNodes(); // Recalculate position (animates via CSS transition)
  var allNodes = document.querySelectorAll('.mobile-minigame, .map-minigame');
  allNodes.forEach(function (node) {
    _applyMiniGameState(node, node.dataset.transition);
  });
}

/* ========================================
   MINIGAME TOGGLE
   ======================================== */

function initMiniGameToggle() {
  var btn = document.getElementById('minigame-toggle');
  if (!btn) return;

  var stored = localStorage.getItem('minigamesVisible');
  var visible = stored === null ? true : stored === 'true';
  btn.setAttribute('aria-pressed', String(visible));
  _setMiniGamesVisible(visible);

  btn.addEventListener('click', function () {
    var next = btn.getAttribute('aria-pressed') !== 'true';
    localStorage.setItem('minigamesVisible', String(next));
    btn.setAttribute('aria-pressed', String(next));
    _setMiniGamesVisible(next);
  });
}

function _setMiniGamesVisible(visible) {
  var nodes = document.querySelectorAll('.map-minigame, .mobile-minigame');
  nodes.forEach(function (node) {
    node.classList.toggle('minigame-hidden', !visible);
  });
}

/* ========================================
   GAME HEADER (Level, XP, Avatar, Name)
   ======================================== */

function updateGameHeader() {
  var points = getPoints();
  var levelInfo = getLevel(points);
  var count = getCompletionCount();
  var total = getTotalStations();

  var badge = document.getElementById('level-badge');
  if (badge) badge.textContent = 'Lv. ' + levelInfo.level;

  var name = document.getElementById('level-name');
  if (name) name.textContent = getLevelName(levelInfo);

  var playerNameEl = document.getElementById('header-player-name');
  if (playerNameEl) playerNameEl.textContent = getPlayerName();

  var xpFill = document.getElementById('xp-fill');
  var xpText = document.getElementById('xp-text');
  var stat = document.getElementById('stat-stations');

  // Check if we're returning from a station completion → animate from old values
  var xpBefore = null;
  var stationsBefore = null;
  try {
    xpBefore = sessionStorage.getItem('xp-before');
    stationsBefore = sessionStorage.getItem('stations-before');
    sessionStorage.removeItem('xp-before');
    sessionStorage.removeItem('stations-before');
  } catch (e) { /* ignore */ }

  var xpPercent = Math.min(1, points / MAX_POINTS) * 100;

  if (xpBefore !== null && xpFill) {
    // Start at old value (no transition), then animate to new value
    var oldPoints = parseInt(xpBefore) || 0;
    var oldPercent = Math.min(1, oldPoints / MAX_POINTS) * 100;
    xpFill.style.transition = 'none';
    xpFill.style.width = oldPercent + '%';
    if (xpText) xpText.textContent = oldPoints + ' / ' + MAX_POINTS + ' XP';
    if (stat) stat.textContent = (parseInt(stationsBefore) || 0) + '/' + total;

    // Force reflow, then animate to new value
    void xpFill.offsetWidth;
    xpFill.style.transition = '';
    setTimeout(function () {
      xpFill.style.width = xpPercent + '%';
      if (xpText) animateXpText(xpText, points);
      if (stat) stat.textContent = count + '/' + total;
    }, 400);
  } else {
    if (xpFill) xpFill.style.width = xpPercent + '%';
    if (xpText) animateXpText(xpText, points);
    if (stat) stat.textContent = count + '/' + total;
  }

  var avatarImg = document.getElementById('header-avatar');
  if (avatarImg) avatarImg.src = getAvatarImage();

  // Update ability indicator
  var abilityEl = document.getElementById('ability-indicator');
  if (abilityEl && typeof getAbility === 'function') {
    var ability = getAbility();
    if (ability) {
      var used = typeof isAbilityUsed === 'function' && isAbilityUsed();
      abilityEl.textContent = ability.icon;
      abilityEl.title = ability.name + (used ? ' (verbraucht)' : '');
      abilityEl.classList.toggle('is-used', used);
    }
  }

  if (_previousLevel !== null && levelInfo.level > _previousLevel) {
    triggerLevelUp(levelInfo);
  }
  _previousLevel = levelInfo.level;
}

/* ========================================
   XP COUNT-UP ANIMATION
   ======================================== */

var _xpAnimFrame = null;

function animateXpText(el, targetXp) {
  var currentText = el.textContent || '0 XP';
  var currentXp = parseInt(currentText) || 0;

  if (currentXp === targetXp) {
    el.textContent = targetXp + ' / ' + MAX_POINTS + ' XP';
    return;
  }

  if (_xpAnimFrame) cancelAnimationFrame(_xpAnimFrame);

  var startTime = null;
  var duration = 800;

  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    var progress = Math.min((timestamp - startTime) / duration, 1);
    var eased = 1 - Math.pow(1 - progress, 3);
    var value = Math.round(currentXp + (targetXp - currentXp) * eased);
    el.textContent = value + ' / ' + MAX_POINTS + ' XP';
    if (progress < 1) {
      _xpAnimFrame = requestAnimationFrame(step);
    }
  }

  _xpAnimFrame = requestAnimationFrame(step);
}

/* ========================================
   LEVEL-UP EFFECTS
   ======================================== */

function triggerLevelUp(levelInfo) {
  var flash = document.getElementById('level-up-flash');
  if (flash) {
    flash.classList.remove('is-active');
    void flash.offsetWidth;
    flash.classList.add('is-active');
    setTimeout(function () { flash.classList.remove('is-active'); }, 700);
  }

  var badge = document.getElementById('level-badge');
  if (badge) {
    badge.classList.remove('is-leveling-up');
    void badge.offsetWidth;
    badge.classList.add('is-leveling-up');
    setTimeout(function () { badge.classList.remove('is-leveling-up'); }, 1100);
  }

  showToast(I18N.t('toast.level_up', 'Level Up! Du bist jetzt Lv. ' + levelInfo.level + ' \u2013 ' + levelInfo.name + '!').replace('{level}', levelInfo.level).replace('{name}', getLevelName(levelInfo)), 'level-up');
}

/* ========================================
   MOBILE WORLD UPDATES
   ======================================== */

function updateMobileWorld() {
  // Check if we're returning from a station completion
  var completedWorld = null;
  var worldBefore = null;
  try {
    completedWorld = sessionStorage.getItem('world-completed');
    worldBefore = sessionStorage.getItem('world-before');
    sessionStorage.removeItem('world-completed');
    sessionStorage.removeItem('world-before');
  } catch (e) { /* ignore */ }

  var worlds = document.querySelectorAll('.mobile-world[data-world]');
  worlds.forEach(function (section) {
    var worldId = section.dataset.world;
    var wp = getWorldProgress(worldId);
    var percentage = Math.round((wp.completed / wp.total) * 100);

    var fill = section.querySelector('.mobile-world__fill');
    var text = section.querySelector('.mobile-world__text');

    // Animate from old value if this is the world we just completed a station in
    if (completedWorld === worldId && worldBefore !== null && fill) {
      var oldPct = Math.round((parseInt(worldBefore) / wp.total) * 100);
      fill.style.transition = 'none';
      fill.style.width = oldPct + '%';
      if (text) text.textContent = parseInt(worldBefore) + ' / ' + wp.total;
      void fill.offsetWidth;
      fill.style.transition = '';
      setTimeout(function () {
        fill.style.width = percentage + '%';
        if (text) text.textContent = wp.completed + ' / ' + wp.total;
      }, 400);
    } else {
      if (fill) fill.style.width = percentage + '%';
      if (text) text.textContent = wp.completed + ' / ' + wp.total;
    }

    if (!isWorldUnlocked(worldId)) {
      section.classList.add('is-locked');
      var lockMsg = section.querySelector('.mobile-world__lock-msg');
      if (lockMsg) {
        lockMsg.textContent = getWorldUnlockMessageI18n(worldId);
        lockMsg.style.display = 'block';
      }
    } else {
      section.classList.remove('is-locked');
      var lockMsg2 = section.querySelector('.mobile-world__lock-msg');
      if (lockMsg2) lockMsg2.style.display = 'none';
    }

    var forkLocked = !isForkUnlocked(worldId);
    var forkCards = section.querySelectorAll('.mobile-station-card--fork');
    var forkIndicator = section.querySelector('.mobile-fork-indicator');

    forkCards.forEach(function (card) {
      if (forkLocked) {
        card.classList.add('is-fork-locked');
      } else {
        card.classList.remove('is-fork-locked');
      }
    });

    if (forkIndicator) {
      forkIndicator.style.opacity = forkLocked ? '0.4' : '1';
    }

    var cards = section.querySelectorAll('.mobile-station-card');
    cards.forEach(function (card) {
      var stationId = card.dataset.station;
      if (stationId && isStationComplete(stationId)) {
        card.classList.add('is-completed');
        var status = card.querySelector('.mobile-station-card__status');
        if (status) status.textContent = '\u2714';
      }
    });
  });
}

/* ========================================
   MAP PARTICLES (region-based)
   ======================================== */

var PARTICLE_REGIONS = [
  { worldId: 'jungle', cls: 'particle--jungle', yStart: 0, yEnd: 25, count: 18 },
  { worldId: 'ocean', cls: 'particle--ocean', yStart: 20, yEnd: 50, count: 16 },
  { worldId: 'cosmos', cls: 'particle--cosmos', yStart: 45, yEnd: 70, count: 20 },
  { worldId: 'metro', cls: 'particle--metro', yStart: 65, yEnd: 100, count: 15 }
];

function initMapParticles() {
  var container = document.getElementById('map-particles');
  if (!container || container.children.length > 0) return;

  var isMobile = window.innerWidth < 600;

  PARTICLE_REGIONS.forEach(function (region) {
    var count = isMobile ? Math.floor(region.count / 3) : region.count;
    for (var i = 0; i < count; i++) {
      var span = document.createElement('span');
      span.className = 'particle ' + region.cls;

      var x = Math.random() * 100;
      var y = region.yStart + Math.random() * (region.yEnd - region.yStart);
      var dx = Math.random() * 40 - 20;
      var dy = region.worldId === 'ocean' ? (20 + Math.random() * 40) : (Math.random() * 40 - 20);
      var size = region.worldId === 'cosmos' ? (2 + Math.random() * 4) : (4 + Math.random() * 6);
      var duration = 4 + Math.random() * 6;
      var delay = Math.random() * 5;

      span.style.cssText =
        '--x:' + x + ';--y:' + y + ';--dx:' + dx + ';--dy:' + dy +
        ';--size:' + size + ';--duration:' + duration + 's;--delay:' + delay + 's';

      container.appendChild(span);
    }
  });
}

/* ========================================
   LAZY LOADING PANELS
   ======================================== */

function initLazyPanels() {
  if (!('IntersectionObserver' in window)) return;

  var panels = document.querySelectorAll('.map-panel');
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) entry.target.classList.add('is-visible');
    });
  }, { rootMargin: '200px' });

  panels.forEach(function (panel) { observer.observe(panel); });
}

/* ========================================
   BADGE BAR
   ======================================== */

function renderBadgeBar() {
  var container = document.getElementById('badge-bar');
  if (!container) return;

  var earned = getEarnedBadges();
  var earnedIds = earned.map(function (b) { return b.id; });

  container.innerHTML = '';
  BADGES.forEach(function (badge) {
    var span = document.createElement('span');
    span.className = 'badge';
    span.setAttribute('title', getBadgeName(badge));
    span.textContent = badge.icon;
    if (earnedIds.includes(badge.id)) span.classList.add('is-earned');
    container.appendChild(span);
  });
}

/* ========================================
   RESET BUTTON
   ======================================== */

function initResetButton() {
  var ids = ['reset-btn', 'reset-link-avatar', 'reset-link-start'];
  ids.forEach(function (id) {
    var btn = document.getElementById(id);
    if (!btn) return;
    btn.addEventListener('click', function () {
      if (confirm(I18N.t('ui.reset_confirm', 'Willst du wirklich deinen gesamten Fortschritt zurücksetzen?'))) {
        resetProgress();
        location.reload();
      }
    });
  });
}

/* ========================================
   HIGHSCORE BUTTON
   ======================================== */

function initHighscoreButton() {
  var btn = document.getElementById('highscore-btn');
  if (!btn) return;
  btn.addEventListener('click', function () {
    if (typeof openHighscoreModal === 'function') {
      openHighscoreModal();
    }
  });
}

/* ========================================
   NOTEBOOK MODAL
   ======================================== */

var STATION_LABELS = {
  'geraete-lichtung': 'Die Geräte-Lichtung',
  'cloud-quelle': 'Die Cloud-Quelle',
  'code-camp': 'Das Code-Camp',
  'server-riff': 'Das Server-Riff',
  'streaming-strom': 'Der Streaming-Strom',
  'backup-bucht': 'Die Backup-Bucht',
  'ide-asteroid': 'Der IDE-Asteroid',
  'deploy-stern': 'Der Deploy-Stern',
  'workflow-nebel': 'Der Workflow-Nebel',
  'ki-kraftwerk': 'Das KI-Kraftwerk',
  'open-source-platz': 'Der Open-Source-Platz',
  'digital-ethics-turm': 'Der Digital-Ethics-Turm'
};

var NOTEBOOK_CONTEXT = {
  challenges: {
    'geraete-lichtung': 'So kannst du dein ältestes Gerät aufrüsten oder weiterverwenden:',
    'cloud-quelle': 'Das hast du über die Nachhaltigkeit deines Cloud-Anbieters herausgefunden:',
    'code-camp': 'Dein Lean vs. Full IDE-Profil – Erfahrungsbericht:',
    'server-riff': 'Dein Nachhaltigkeits-Vergleich zweier Cloud-Provider:',
    'streaming-strom': 'Dein monatlicher Streaming-CO₂-Fussabdruck und Sparpotenzial:',
    'backup-bucht': 'Dein 4-Wochen Daten-Aufräum-Plan:',
    'ide-asteroid': 'RAM-Verbrauch deiner IDE – vorher vs. nachher:',
    'deploy-stern': 'Deine CI/CD-Pipeline-Optimierungen und Build-Zeiten:',
    'workflow-nebel': 'Dein Digital Detox Day – was hat sich verändert:',
    'ki-kraftwerk': 'Ein Tag ohne KI – was du gelernt hast:',
    'open-source-platz': 'Dein erster Open-Source-Beitrag:',
    'digital-ethics-turm': 'Dein persönlicher Digital Sustainability Pledge:'
  },
  reflections: {
    'geraete-lichtung': 'Was beeinflusst deine Kaufentscheidung bei neuen Geräten wirklich?',
    'cloud-quelle': 'Was kostenloser Cloud-Speicher über Nachhaltigkeit verrät:',
    'code-camp': 'Wo liegt die Grenze zwischen Produktivität und Ressourcenverbrauch?',
    'server-riff': 'Braucht es ein Nachhaltigkeits-Label für Cloud-Dienste?',
    'streaming-strom': 'Ab wann wird Bequemlichkeit zur Verschwendung?',
    'backup-bucht': 'Was wäre, wenn Speicherplatz teurer wäre?',
    'ide-asteroid': 'Brauchen wir wirklich eine IDE, die wie ein Browser läuft?',
    'deploy-stern': 'Schnell und oft deployen – oder seltener und bewusster?',
    'workflow-nebel': 'Welche digitalen Gewohnheiten sind nachhaltig – und welche nicht?',
    'ki-kraftwerk': 'Ab wann lohnt sich der KI-Einsatz trotz CO₂-Kosten wirklich?',
    'open-source-platz': 'Was hat Open Source mit Nachhaltigkeit zu tun?',
    'digital-ethics-turm': 'Wer trägt die Verantwortung für nachhaltiges Handeln in der IT?'
  },
  notes: {
    'geraete-lichtung': 'Beobachtungen zu Gerätelebensdauer und Ressourcenschonung:',
    'cloud-quelle': 'Cloud-Speicher aufräumen und Synchronisierungen prüfen:',
    'code-camp': 'IDE-Setup Optimierungen, Extensions und Einstellungen:',
    'server-riff': 'Recherche zu Cloud-Providern, PUE-Werten und Standorten:',
    'streaming-strom': 'Streaming-Einstellungen optimieren (Video, Audio, Calls):',
    'backup-bucht': 'Speicherplatz-Aufräumung und Dark Data Bewusstsein:',
    'ide-asteroid': 'IDE RAM-Verbrauch, Extensions und Telemetrie-Einstellungen:',
    'deploy-stern': 'GitHub Actions, Caching und Pipeline-Optimierungen:',
    'workflow-nebel': 'Browser-RAM, E-Mail-Aufräumen und Video-Call-Einstellungen:',
    'ki-kraftwerk': 'Sinnvolle vs. unnötige Situationen für KI-Tools:',
    'open-source-platz': 'Open-Source-Projekte, Lizenzen und Community-Beteiligung:',
    'digital-ethics-turm': 'Konsumentenrechte, Right-to-Repair und digitale Gerechtigkeit:'
  }
};

function getNotebookContext(stationId, tabName) {
  var tab = NOTEBOOK_CONTEXT[tabName];
  return (tab && tab[stationId]) || '';
}

function getStationLabel(stationId) {
  if (typeof I18N !== 'undefined') {
    return I18N.t('station.' + stationId + '.title', STATION_LABELS[stationId] || stationId);
  }
  return STATION_LABELS[stationId] || stationId;
}

function initNotebookButton() {
  var btn = document.getElementById('notebook-btn');
  var modal = document.getElementById('notebook-modal');
  var closeBtn = document.getElementById('notebook-close');
  if (!btn || !modal) return;

  btn.addEventListener('click', function () {
    renderNotebookContent('challenges');
    modal.classList.add('is-visible');
    modal.setAttribute('aria-hidden', 'false');
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', function () {
      modal.classList.remove('is-visible');
      modal.setAttribute('aria-hidden', 'true');
    });
  }

  modal.addEventListener('click', function (e) {
    if (e.target === modal) {
      modal.classList.remove('is-visible');
      modal.setAttribute('aria-hidden', 'true');
    }
  });

  var tabs = modal.querySelectorAll('.notebook-tab');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) { t.classList.remove('is-active'); });
      tab.classList.add('is-active');
      renderNotebookContent(tab.dataset.tab);
    });
  });

  var exportBtn = document.getElementById('notebook-export');
  if (exportBtn) {
    exportBtn.addEventListener('click', function () {
      openNotebookExport();
    });
  }
}

function renderNotebookContent(tabName) {
  var container = document.getElementById('notebook-content');
  if (!container) return;

  var entries = {};
  if (tabName === 'challenges') {
    entries = getAllChallengeResponses();
  } else if (tabName === 'reflections') {
    entries = getAllReflections();
  } else if (tabName === 'notes') {
    entries = getAllNotes();
  }

  var keys = Object.keys(entries).filter(function (k) { return entries[k] && entries[k].trim(); });

  if (keys.length === 0) {
    var emptyMsg = tabName === 'challenges' ? 'Noch keine Challenge-Abgaben vorhanden.'
                 : tabName === 'reflections' ? 'Noch keine Reflexionen geschrieben.'
                 : 'Noch keine Notizen vorhanden.';
    container.innerHTML = '<p class="notebook-empty">' + emptyMsg + '</p>';
    return;
  }

  var tabIcons = { challenges: '🏆', reflections: '💭', notes: '📝' };
  var icon = tabIcons[tabName] || '';

  var html = '';
  keys.forEach(function (stationId) {
    var text = entries[stationId];
    var context = getNotebookContext(stationId, tabName);
    var heading = context || getStationLabel(stationId);
    html += '<div class="notebook-entry notebook-entry--' + tabName + '">' +
      '<div class="notebook-entry__context">' + icon + ' ' + escapeHtml(heading) + '</div>' +
      '<div class="notebook-entry__text">' + escapeHtml(text) + '</div>' +
    '</div>';
  });

  container.innerHTML = html;
}

function escapeHtml(str) {
  var div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/* ========================================
   NOTEBOOK EXPORT – Lernjournal
   ======================================== */

function _buildExportText() {
  var challenges = getAllChallengeResponses();
  var reflections = getAllReflections();
  var notes = getAllNotes();

  // Collect all station IDs that have any entry
  var seen = {};
  var stationIds = [];
  [challenges, reflections, notes].forEach(function (obj) {
    Object.keys(obj).forEach(function (id) {
      if (obj[id] && obj[id].trim() && !seen[id]) {
        seen[id] = true;
        stationIds.push(id);
      }
    });
  });

  if (stationIds.length === 0) return '';

  // Sort by STATION_LABELS order
  var labelKeys = Object.keys(STATION_LABELS);
  stationIds.sort(function (a, b) {
    return labelKeys.indexOf(a) - labelKeys.indexOf(b);
  });

  var playerName = getPlayerName() || 'Unbekannt';
  var today = new Date().toLocaleDateString('de-CH');

  var lines = [];
  lines.push('LERNJOURNAL-EXPORT \u2013 Lernlandschaft Nachhaltige Digitalisierung');
  lines.push('Name: ' + playerName + ' | Datum: ' + today);
  lines.push('\u2550'.repeat(50));

  stationIds.forEach(function (id) {
    lines.push('');
    lines.push('\uD83D\uDCCD ' + (getStationLabel(id) || id));
    lines.push('\u2500'.repeat(40));

    if (challenges[id] && challenges[id].trim()) {
      var ctx = getNotebookContext(id, 'challenges');
      lines.push('\uD83C\uDFC6 Challenge: ' + (ctx || 'Challenge'));
      lines.push(challenges[id].trim());
      lines.push('');
    }
    if (reflections[id] && reflections[id].trim()) {
      var ctx = getNotebookContext(id, 'reflections');
      lines.push('\uD83D\uDCAD Reflexion: ' + (ctx || 'Reflexion'));
      lines.push(reflections[id].trim());
      lines.push('');
    }
    if (notes[id] && notes[id].trim()) {
      var ctx = getNotebookContext(id, 'notes');
      lines.push('\uD83D\uDCDD Notiz: ' + (ctx || 'Notiz'));
      lines.push(notes[id].trim());
      lines.push('');
    }
  });

  return lines.join('\n');
}

function openNotebookExport() {
  var text = _buildExportText();

  var existing = document.getElementById('notebook-export-modal');
  if (existing) existing.remove();

  var modal = document.createElement('div');
  modal.id = 'notebook-export-modal';
  modal.className = 'notebook-export-modal';

  var card = document.createElement('div');
  card.className = 'notebook-export-card';

  // Header
  var header = document.createElement('div');
  header.className = 'notebook-export-card__header';
  header.innerHTML = '<h2 class="notebook-export-card__title">\uD83D\uDCCB Lernjournal-Export</h2>' +
    '<p class="notebook-export-card__subtitle">Kopiere den Text und f\u00fcge ihn in dein Lernjournal ein.</p>';
  card.appendChild(header);

  // Content
  var content = document.createElement('div');
  content.className = 'notebook-export-card__content';

  if (!text) {
    content.innerHTML = '<p class="notebook-empty">Noch keine Eintr\u00e4ge vorhanden. Bearbeite zuerst einige Stationen!</p>';
  } else {
    var pre = document.createElement('pre');
    pre.className = 'notebook-export-card__text';
    pre.textContent = text;
    content.appendChild(pre);
  }
  card.appendChild(content);

  // Actions
  var actions = document.createElement('div');
  actions.className = 'notebook-export-card__actions';

  if (text) {
    var copyBtn = document.createElement('button');
    copyBtn.className = 'notebook-export-card__btn notebook-export-card__btn--copy';
    copyBtn.textContent = 'Alles kopieren';
    copyBtn.addEventListener('click', function () {
      navigator.clipboard.writeText(text).then(function () {
        copyBtn.textContent = 'Kopiert \u2713';
        setTimeout(function () { copyBtn.textContent = 'Alles kopieren'; }, 2000);
      });
    });
    actions.appendChild(copyBtn);

    var printBtn = document.createElement('button');
    printBtn.className = 'notebook-export-card__btn notebook-export-card__btn--print';
    printBtn.textContent = 'Drucken';
    printBtn.addEventListener('click', function () {
      document.body.classList.add('is-printing-export');
      window.print();
      document.body.classList.remove('is-printing-export');
    });
    actions.appendChild(printBtn);
  }

  var closeBtn = document.createElement('button');
  closeBtn.className = 'notebook-export-card__btn notebook-export-card__btn--close';
  closeBtn.textContent = 'Schliessen';
  closeBtn.addEventListener('click', function () {
    modal.classList.remove('is-visible');
    setTimeout(function () { modal.remove(); }, 300);
  });
  actions.appendChild(closeBtn);

  card.appendChild(actions);
  modal.appendChild(card);
  document.body.appendChild(modal);

  // Backdrop close
  modal.addEventListener('click', function (e) {
    if (e.target === modal) {
      modal.classList.remove('is-visible');
      setTimeout(function () { modal.remove(); }, 300);
    }
  });

  requestAnimationFrame(function () {
    modal.classList.add('is-visible');
  });
}

/* ========================================
   FINALE MARKER – unlocks when all worlds passable
   ======================================== */

function initFinaleMarker() {
  var marker = document.getElementById('finale-marker');
  var mobileFinale = document.getElementById('mobile-finale');
  var unlocked = isFinaleUnlocked();

  // Desktop marker
  if (marker) {
    var pos = STATION_POSITIONS['abschluss-feier'];
    if (pos) {
      marker.style.setProperty('--pos-top', pos.top + '%');
      marker.style.setProperty('--pos-left', pos.left + '%');
    }

    if (unlocked) {
      marker.classList.remove('is-locked');
      marker.addEventListener('click', function (e) {
        e.preventDefault();
        var href = marker.getAttribute('href');
        setLastAvatarPosition('abschluss-feier');
        animateAvatarTo('abschluss-feier', function () {
          window.location.href = href;
        });
      });
    } else {
      marker.classList.add('is-locked');
      marker.addEventListener('click', function (e) {
        e.preventDefault();
        showToast(I18N.t('ui.finale_locked', 'Schliesse zuerst alle 4 Welten ab, um die Abschluss-Feier freizuschalten.'), 'success');
      });
    }
  }

  // Mobile finale
  if (mobileFinale) {
    if (unlocked) {
      mobileFinale.style.display = 'block';
    } else {
      mobileFinale.style.display = 'none';
    }
  }
}
