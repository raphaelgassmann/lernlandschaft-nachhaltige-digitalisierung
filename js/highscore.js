/* ========================================
   HIGHSCORE.JS – Leaderboard (localStorage)
   ======================================== */

var HIGHSCORE_KEY = 'lernlandschaft-highscores';

/**
 * Loads all highscores from localStorage.
 * @returns {Array} Sorted list (highest first)
 */
function loadHighscores() {
  try {
    var data = localStorage.getItem(HIGHSCORE_KEY);
    if (data) {
      var scores = JSON.parse(data);
      scores.sort(function (a, b) { return b.xp - a.xp; });
      return scores;
    }
  } catch (e) {}
  return [];
}

/**
 * Saves a highscore entry to localStorage.
 */
function submitHighscore(name, xp, avatar, stations) {
  var scores = loadHighscores();
  var entry = {
    name: name,
    xp: xp,
    avatar: avatar || 'explorer',
    stations: stations || 0,
    date: new Date().toISOString().split('T')[0],
    id: Date.now()
  };

  // Update existing entry for this name or add new
  var found = false;
  for (var i = 0; i < scores.length; i++) {
    if (scores[i].name === name) {
      if (xp >= scores[i].xp) {
        scores[i] = entry;
      }
      found = true;
      break;
    }
  }
  if (!found) scores.push(entry);

  scores.sort(function (a, b) { return b.xp - a.xp; });

  try {
    localStorage.setItem(HIGHSCORE_KEY, JSON.stringify(scores));
  } catch (e) {}

  return scores;
}

function hasAlreadySubmitted() {
  try {
    return localStorage.getItem('highscore-submitted') === 'true';
  } catch (e) {
    return false;
  }
}

function markHighscoreSubmitted() {
  try {
    localStorage.setItem('highscore-submitted', 'true');
  } catch (e) {}
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
 */
function syncCurrentPlayer() {
  var name = getPlayerName();
  if (!name) return;
  var xp = getPoints();
  var avatar = getAvatarChoice() || 'explorer';
  var stations = getCompletionCount();
  submitHighscore(name, xp, avatar, stations);
}

/**
 * Opens the highscore modal popup.
 */
function openHighscoreModal() {
  // Sync current progress first
  syncCurrentPlayer();

  var scores = loadHighscores();
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
  syncCurrentPlayer();

  var scores = loadHighscores();
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
