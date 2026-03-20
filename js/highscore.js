/* ========================================
   HIGHSCORE.JS – Leaderboard (Supabase)
   ======================================== */

var SUPABASE_URL = 'https://krzbzlxxycodagmhodrr.supabase.co';
var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtyemJ6bHh4eWNvZGFnbWhvZHJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMDk5NTYsImV4cCI6MjA4OTU4NTk1Nn0.DSydLkumxwcFruYNiTGwya7eVbfHIXv5qbXo-KKZwfQ';

// Local cache to avoid blocking UI while fetching
var _highscoreCache = [];

function supabaseFetch(path, options) {
  var url = SUPABASE_URL + '/rest/v1' + path;
  var defaults = {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_KEY,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    }
  };
  var opts = Object.assign({}, defaults, options);
  if (options && options.headers) {
    opts.headers = Object.assign({}, defaults.headers, options.headers);
  }
  return fetch(url, opts);
}

/**
 * Loads all highscores from Supabase.
 * Returns a Promise that resolves to sorted array (highest XP first).
 */
function loadHighscores() {
  return supabaseFetch('/highscores?order=xp.desc')
    .then(function (res) { return res.json(); })
    .then(function (scores) {
      _highscoreCache = scores || [];
      return _highscoreCache;
    })
    .catch(function () {
      return _highscoreCache;
    });
}

/**
 * Upserts a highscore entry to Supabase (insert or update on name conflict).
 */
function submitHighscore(name, xp, avatar, stations) {
  var entry = {
    name: name,
    xp: xp,
    avatar: avatar || 'explorer',
    stations: stations || 0,
    updated_at: new Date().toISOString().split('T')[0]
  };

  return supabaseFetch('/highscores', {
    method: 'POST',
    headers: { 'Prefer': 'return=representation,resolution=merge-duplicates' },
    body: JSON.stringify(entry)
  })
    .then(function (res) { return res.json(); })
    .then(function () { return loadHighscores(); })
    .catch(function () { return _highscoreCache; });
}

/**
 * Returns the rank of a player among all scores.
 */
function getPlayerRank(xp, allScores) {
  var rank = 1;
  for (var i = 0; i < allScores.length; i++) {
    if (allScores[i].xp > xp) rank++;
  }
  return rank;
}

/**
 * Auto-saves current player to leaderboard.
 * Returns a Promise.
 */
function syncCurrentPlayer() {
  var name = getPlayerName();
  if (!name) return Promise.resolve();
  var xp = getPoints();
  var avatar = getAvatarChoice() || 'explorer';
  var stations = getCompletionCount();
  return submitHighscore(name, xp, avatar, stations).then(function (result) {
    // Update last_seen_at in players table
    _updateLastSeen(name);
    return result;
  });
}

/* ========================================
   PLAYER INFO TRACKING (Supabase)
   ======================================== */

function _parseBrowser(ua) {
  if (/Edg\//i.test(ua)) return 'Edge';
  if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) return 'Chrome';
  if (/Firefox\//i.test(ua)) return 'Firefox';
  if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) return 'Safari';
  return 'Other';
}

function _parseOS(ua) {
  if (/Windows/i.test(ua)) return 'Windows';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS';
  if (/Macintosh|Mac OS/i.test(ua)) return 'macOS';
  if (/Android/i.test(ua)) return 'Android';
  if (/Linux/i.test(ua)) return 'Linux';
  return 'Other';
}

/**
 * Upserts player info (browser, OS, screen size, language) to the players table.
 */
function syncPlayerInfo() {
  var name = getPlayerName();
  if (!name) return Promise.resolve();

  var ua = navigator.userAgent || '';
  var entry = {
    name: name,
    avatar: getAvatarChoice() || 'explorer',
    browser: _parseBrowser(ua),
    os: _parseOS(ua),
    screen_width: screen.width,
    screen_height: screen.height,
    language: navigator.language || 'unknown',
    last_seen_at: new Date().toISOString()
  };

  return supabaseFetch('/players', {
    method: 'POST',
    headers: { 'Prefer': 'return=representation,resolution=merge-duplicates' },
    body: JSON.stringify(entry)
  }).then(function (res) { return res.json(); })
    .catch(function () { /* silent */ });
}

function _updateLastSeen(name) {
  if (!name) return;
  supabaseFetch('/players?name=eq.' + encodeURIComponent(name), {
    method: 'PATCH',
    body: JSON.stringify({ last_seen_at: new Date().toISOString() })
  }).catch(function () { /* silent */ });
}

/* ========================================
   STATION TIME TRACKING (Supabase)
   ======================================== */

/**
 * Records station enter time in sessionStorage.
 */
function trackStationEnter(stationId) {
  try {
    sessionStorage.setItem('station-enter-' + stationId, String(Date.now()));
  } catch (e) { /* silent */ }
}

/**
 * Calculates duration since enter and upserts to station_times.
 */
function trackStationLeave(stationId) {
  var name = getPlayerName();
  if (!name) return;

  var enterKey = 'station-enter-' + stationId;
  var enterTime;
  try {
    enterTime = parseInt(sessionStorage.getItem(enterKey));
  } catch (e) { return; }
  if (!enterTime || isNaN(enterTime)) return;

  var durationSeconds = Math.round((Date.now() - enterTime) / 1000);
  if (durationSeconds < 1) return;

  var entry = {
    player_name: name,
    station_id: stationId,
    duration_seconds: durationSeconds,
    completed: isStationComplete(stationId),
    challenge_done: isChallengeComplete(stationId),
    quiz_passed: typeof isQuizPassed === 'function' && isQuizPassed(stationId)
  };

  supabaseFetch('/station_times', {
    method: 'POST',
    headers: { 'Prefer': 'return=representation,resolution=merge-duplicates' },
    body: JSON.stringify(entry)
  }).catch(function () { /* silent */ });
}

/**
 * Updates status fields for a station_times entry.
 */
function syncStationStatus(stationId, completed, challengeDone, quizPassed) {
  var name = getPlayerName();
  if (!name) return;

  var params = 'player_name=eq.' + encodeURIComponent(name) +
    '&station_id=eq.' + encodeURIComponent(stationId);

  supabaseFetch('/station_times?' + params, {
    method: 'PATCH',
    body: JSON.stringify({
      completed: !!completed,
      challenge_done: !!challengeDone,
      quiz_passed: !!quizPassed
    })
  }).catch(function () { /* silent */ });
}

/**
 * Opens the highscore modal popup.
 */
function openHighscoreModal() {
  // Sync current progress first, then show
  syncCurrentPlayer().then(function () {
    return loadHighscores();
  }).then(function (scores) {
    _renderHighscoreModal(scores);
  });
}

function _renderHighscoreModal(scores) {
  var playerName = getPlayerName();
  var playerXp = getPoints();
  var playerLevel = getLevel(playerXp);

  var existing = document.getElementById('highscore-modal');
  if (existing) existing.remove();

  var modal = document.createElement('div');
  modal.id = 'highscore-modal';
  modal.className = 'highscore-modal';

  var card = document.createElement('div');
  card.className = 'highscore-card';

  // Header
  var header = document.createElement('div');
  header.className = 'highscore-card__header';
  header.innerHTML = '<span class="highscore-card__icon">&#x1F3C6;</span>' +
    '<h2 class="highscore-card__title">' + I18N.t('highscore.title', 'Expeditions-Rangliste') + '</h2>' +
    '<p class="highscore-card__subtitle">' + I18N.t('highscore.subtitle', 'Alle Entdecker:innen') + '</p>';
  card.appendChild(header);

  // Player highlight card
  if (playerName) {
    var highlight = document.createElement('div');
    highlight.className = 'highscore-player-highlight';
    var rank = getPlayerRank(playerXp, scores);
    highlight.innerHTML =
      '<div class="highscore-player-highlight__avatar">' +
        '<img src="' + getAvatarImage() + '" alt="" />' +
      '</div>' +
      '<div class="highscore-player-highlight__info">' +
        '<span class="highscore-player-highlight__name">' + playerName + '</span>' +
        '<span class="highscore-player-highlight__stats">' +
          'Lv. ' + playerLevel.level + ' &middot; ' + playerXp + ' XP &middot; ' +
          getCompletionCount() + '/' + getTotalStations() + ' ' + I18N.t('highscore.stations', 'Stationen') +
        '</span>' +
      '</div>' +
      '<div class="highscore-player-highlight__rank">#' + rank + '</div>';
    card.appendChild(highlight);
  }

  // List
  var list = document.createElement('div');
  list.className = 'highscore-list';

  if (scores.length === 0) {
    list.innerHTML = '<p class="highscore-empty">' +
      I18N.t('highscore.empty', 'Noch keine Einträge. Starte die Expedition!') + '</p>';
  } else {
    scores.forEach(function (score, index) {
      var isSelf = score.name === playerName;
      var row = document.createElement('div');
      row.className = 'highscore-row' + (isSelf ? ' highscore-row--self' : '');

      var rankSpan = document.createElement('span');
      rankSpan.className = 'highscore-row__rank';
      if (index === 0) rankSpan.innerHTML = '&#x1F947;';
      else if (index === 1) rankSpan.innerHTML = '&#x1F948;';
      else if (index === 2) rankSpan.innerHTML = '&#x1F949;';
      else rankSpan.textContent = (index + 1) + '.';

      var nameSpan = document.createElement('span');
      nameSpan.className = 'highscore-row__name';
      nameSpan.textContent = score.name;

      var xpSpan = document.createElement('span');
      xpSpan.className = 'highscore-row__xp';
      xpSpan.textContent = score.xp + ' XP';

      var stationsSpan = document.createElement('span');
      stationsSpan.className = 'highscore-row__stations';
      stationsSpan.textContent = (score.stations || 0) + '/' + getTotalStations();

      row.appendChild(rankSpan);
      row.appendChild(nameSpan);
      row.appendChild(stationsSpan);
      row.appendChild(xpSpan);
      list.appendChild(row);
    });
  }

  card.appendChild(list);

  // Close button
  var closeBtn = document.createElement('button');
  closeBtn.className = 'highscore-card__close';
  closeBtn.textContent = I18N.t('highscore.close', 'Schliessen');
  closeBtn.addEventListener('click', function () {
    modal.classList.remove('is-visible');
    setTimeout(function () { modal.remove(); }, 300);
  });
  card.appendChild(closeBtn);

  modal.appendChild(card);
  document.body.appendChild(modal);

  // Backdrop click closes
  modal.addEventListener('click', function (e) {
    if (e.target === modal) {
      modal.classList.remove('is-visible');
      setTimeout(function () { modal.remove(); }, 300);
    }
  });

  // Animate in
  requestAnimationFrame(function () {
    modal.classList.add('is-visible');
  });
}

/**
 * Renders ranking inline (for finale page).
 */
function renderRankingInline(container) {
  if (!container) return;
  syncCurrentPlayer().then(function () {
    return loadHighscores();
  }).then(function (scores) {
    _renderRankingContent(container, scores);
  });
}

function _renderRankingContent(container, scores) {
  var playerName = getPlayerName();
  var playerXp = getPoints();
  var html = '';

  if (scores.length === 0) {
    html = '<p style="color: var(--color-text-muted); font-style: italic;">' +
      I18N.t('highscore.empty', 'Noch keine Einträge.') + '</p>';
  } else {
    var playerRank = getPlayerRank(playerXp, scores);
    html += '<p class="ranking-your-rank">' + I18N.t('highscore.your_rank', 'Dein Rang') +
      ': <strong>#' + playerRank + '</strong> ' + I18N.t('highscore.with', 'mit') +
      ' <strong>' + playerXp + ' XP</strong></p>';
    html += '<div class="highscore-list highscore-list--inline">';

    scores.forEach(function (score, index) {
      var isSelf = score.name === playerName;
      html += '<div class="highscore-row' + (isSelf ? ' highscore-row--self' : '') + '">';
      if (index === 0) html += '<span class="highscore-row__rank">&#x1F947;</span>';
      else if (index === 1) html += '<span class="highscore-row__rank">&#x1F948;</span>';
      else if (index === 2) html += '<span class="highscore-row__rank">&#x1F949;</span>';
      else html += '<span class="highscore-row__rank">' + (index + 1) + '.</span>';
      html += '<span class="highscore-row__name">' + score.name + '</span>';
      html += '<span class="highscore-row__stations">' + (score.stations || 0) + '/' + getTotalStations() + '</span>';
      html += '<span class="highscore-row__xp">' + score.xp + ' XP</span>';
      html += '</div>';
    });
    html += '</div>';
  }

  container.innerHTML = html;
}
