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
  renderBadgeBar();
  initResetButton();
  initHighscoreButton();
});

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
  } else if (hasAvatar && hasName) {
    if (avatarSelect) avatarSelect.classList.add('is-hidden');
    if (startZone) startZone.classList.remove('is-hidden');
    updateStartAvatarImage();
    updateStartName();
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
      if (!name || !getAvatarChoice()) return;

      // Profanity check
      if (typeof containsProfanity === 'function' && containsProfanity(name)) {
        showToast('Bitte wähle einen anderen Namen.', 'success');
        return;
      }

      setPlayerName(name);
      document.getElementById('avatar-select').classList.add('is-hidden');
      document.getElementById('start-zone').classList.remove('is-hidden');
      updateStartAvatarImage();
      updateStartName();
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

      // Avatar starts at sofa, then walks to first station
      positionAvatarAt('sofa');
      setTimeout(function () {
        var target = findAvatarStation();
        animateAvatarTo(target);
      }, 600);

      if (mapContainer && window.innerWidth > 600) {
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
    metro:  { top: 63, left: 50 }
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
  if (xpFill) xpFill.style.width = (levelInfo.progressToNext * 100) + '%';

  var xpText = document.getElementById('xp-text');
  if (xpText) animateXpText(xpText, points);

  var stat = document.getElementById('stat-stations');
  if (stat) stat.textContent = count + '/' + total;

  var avatarImg = document.getElementById('header-avatar');
  if (avatarImg) avatarImg.src = getAvatarImage();

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
    el.textContent = targetXp + ' XP';
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
    el.textContent = value + ' XP';
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
  var worlds = document.querySelectorAll('.mobile-world[data-world]');
  worlds.forEach(function (section) {
    var worldId = section.dataset.world;
    var wp = getWorldProgress(worldId);
    var percentage = Math.round((wp.completed / wp.total) * 100);

    var fill = section.querySelector('.mobile-world__fill');
    var text = section.querySelector('.mobile-world__text');
    if (fill) fill.style.width = percentage + '%';
    if (text) text.textContent = wp.completed + ' / ' + wp.total;

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
  if (window.innerWidth < 600) return;

  PARTICLE_REGIONS.forEach(function (region) {
    for (var i = 0; i < region.count; i++) {
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
