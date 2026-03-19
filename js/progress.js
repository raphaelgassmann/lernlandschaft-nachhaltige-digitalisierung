/* ========================================
   PROGRESS.JS – Expeditions-Fortschritt
   localStorage-basierte Persistenz
   ======================================== */

var STORAGE_KEY = 'lernlandschaft-progress';
var POINTS_PER_STATION = 10;
var POINTS_PER_CHALLENGE = 5;

/* ========================================
   WORLDS – Fork-Modell: 1 Pflicht + 2 Fork
   ======================================== */

var WORLDS = {
  jungle: {
    name: 'Daten-Dschungel',
    mandatory: 'geraete-lichtung',
    fork: ['cloud-quelle', 'code-camp'],
    requiredForkCount: 1
  },
  ocean: {
    name: 'Daten-Ozean',
    mandatory: 'server-riff',
    fork: ['streaming-strom', 'backup-bucht'],
    requiredForkCount: 1
  },
  cosmos: {
    name: 'Code-Kosmos',
    mandatory: 'ide-asteroid',
    fork: ['deploy-stern', 'workflow-nebel'],
    requiredForkCount: 1
  },
  metro: {
    name: 'Zukunfts-Metropole',
    mandatory: 'ki-kraftwerk',
    fork: ['open-source-platz', 'digital-ethics-turm'],
    requiredForkCount: 1
  }
};

var WORLD_ORDER = ['jungle', 'ocean', 'cosmos', 'metro'];

var TOTAL_STATIONS = Object.values(WORLDS).reduce(function (sum, w) {
  return sum + 1 + w.fork.length;
}, 0);

/* ========================================
   STATION POSITIONS (% of map-container)
   Calibrated to match background panel images
   ======================================== */

var SOFA_POSITION = { top: 3.5, left: 28 };

var STATION_POSITIONS = {
  'abschluss-feier':     { top: 90, left: 50 },
  // Panel 0 (0-20%): Jungle – sofa, door, Y-fork path
  'geraete-lichtung':    { top: 11, left: 50 },
  'cloud-quelle':        { top: 16.5, left: 32 },
  'code-camp':           { top: 16.5, left: 68 },

  // Panel 1 (20-40%): Beach -> Ocean – sand path, coral reefs
  'server-riff':         { top: 26, left: 42 },
  'streaming-strom':     { top: 33, left: 28 },
  'backup-bucht':        { top: 33, left: 70 },

  // Panel 2 (40-60%): Ocean -> Cosmos – blue stream, asteroids
  'ide-asteroid':        { top: 46, left: 50 },
  'deploy-stern':        { top: 54, left: 28 },
  'workflow-nebel':      { top: 54, left: 72 },

  // Panel 3-4 (60-100%): Cosmos -> Metro – convergence, city grid
  'ki-kraftwerk':        { top: 71, left: 50 },
  'open-source-platz':   { top: 77, left: 32 },
  'digital-ethics-turm': { top: 77, left: 68 }
};

/* ========================================
   PATH SEGMENTS – connections between stations
   ======================================== */

var PATH_SEGMENTS = [
  { from: 'sofa', to: 'geraete-lichtung', world: 'jungle' },
  { from: 'geraete-lichtung', to: 'cloud-quelle', world: 'jungle' },
  { from: 'geraete-lichtung', to: 'code-camp', world: 'jungle' },
  { from: 'cloud-quelle', to: 'server-riff', world: 'ocean' },
  { from: 'code-camp', to: 'server-riff', world: 'ocean' },
  { from: 'server-riff', to: 'streaming-strom', world: 'ocean' },
  { from: 'server-riff', to: 'backup-bucht', world: 'ocean' },
  { from: 'streaming-strom', to: 'ide-asteroid', world: 'cosmos' },
  { from: 'backup-bucht', to: 'ide-asteroid', world: 'cosmos' },
  { from: 'ide-asteroid', to: 'deploy-stern', world: 'cosmos' },
  { from: 'ide-asteroid', to: 'workflow-nebel', world: 'cosmos' },
  { from: 'deploy-stern', to: 'ki-kraftwerk', world: 'metro' },
  { from: 'workflow-nebel', to: 'ki-kraftwerk', world: 'metro' },
  { from: 'ki-kraftwerk', to: 'open-source-platz', world: 'metro' },
  { from: 'ki-kraftwerk', to: 'digital-ethics-turm', world: 'metro' },
  { from: 'open-source-platz', to: 'abschluss-feier', world: 'metro' },
  { from: 'digital-ethics-turm', to: 'abschluss-feier', world: 'metro' }
];

function getPositionFor(id) {
  if (id === 'sofa') return SOFA_POSITION;
  return STATION_POSITIONS[id] || null;
}

function isFinaleUnlocked() {
  return WORLD_ORDER.every(function (worldId) {
    return isWorldPassable(worldId);
  });
}

function getLastAvatarPosition() {
  return getProgress().lastAvatarPosition || 'sofa';
}

function setLastAvatarPosition(posId) {
  var progress = getProgress();
  progress.lastAvatarPosition = posId;
  saveProgress(progress);
}

/* ========================================
   MOBILE ASSET HELPER
   ======================================== */

function getMobileAssetPath(path) {
  if (window.innerWidth <= 600) {
    return path.replace('assets/', 'assets/mobile/').replace(/\.png$/, '.webp');
  }
  return path;
}

/* ========================================
   AVATAR CHOICES
   ======================================== */

var AVATAR_CHOICES = {
  explorer: { name: 'Entdecker:in', image: 'assets/avatar-explorer.png', sprite: 'assets/sprites/sprite-explorer.png' },
  scientist: { name: 'Forscher:in', image: 'assets/avatar-scientist.png', sprite: 'assets/sprites/sprite-scientist.png' },
  hacker: { name: 'Hacker:in', image: 'assets/avatar-hacker.png', sprite: 'assets/sprites/sprite-hacker.png' }
};

function setPlayerName(name) {
  var progress = getProgress();
  progress.playerName = name;
  saveProgress(progress);
}

function getPlayerName() {
  return getProgress().playerName || '';
}

/* ========================================
   BADGES
   ======================================== */

var BADGES = [
  { id: 'jungle-explorer', name: 'Dschungel-Entdecker', icon: '\u{1F33F}', condition: 'world', world: 'jungle' },
  { id: 'ocean-diver', name: 'Ozean-Taucher', icon: '\u{1F419}', condition: 'world', world: 'ocean' },
  { id: 'cosmos-astronaut', name: 'Kosmos-Astronaut', icon: '\u{1F680}', condition: 'world', world: 'cosmos' },
  { id: 'metro-architect', name: 'Metropolen-Architekt', icon: '\u{1F3D9}\uFE0F', condition: 'world', world: 'metro' },
  { id: 'challenge-champion', name: 'Challenge-Champion', icon: '\u{1F3C6}', condition: 'all-challenges' },
  { id: 'sustainability-hero', name: 'Nachhaltigkeits-Held', icon: '\u{1F30D}', condition: 'all-stations' },
  { id: 'speedrunner', name: 'Speedrunner', icon: '\u26A1', condition: 'speedrun' }
];

/* ========================================
   LEVEL SYSTEM
   ======================================== */

var LEVELS = [
  { level: 1, name: 'Sofa-Surfer', minPoints: 0 },
  { level: 2, name: 'Neugierige:r', minPoints: 15 },
  { level: 3, name: 'Dschungel-Kenner:in', minPoints: 30 },
  { level: 4, name: 'Daten-Taucher:in', minPoints: 50 },
  { level: 5, name: 'Code-Pilot:in', minPoints: 75 },
  { level: 6, name: 'Zukunfts-Architekt:in', minPoints: 100 },
  { level: 7, name: 'Nachhaltigkeits-Held:in', minPoints: 130 },
  { level: 8, name: 'Digitale:r Pionier:in', minPoints: 180 }
];

function getLevel(points) {
  var current = LEVELS[0];
  for (var i = LEVELS.length - 1; i >= 0; i--) {
    if (points >= LEVELS[i].minPoints) {
      current = LEVELS[i];
      break;
    }
  }
  var next = LEVELS[current.level] || null;
  var progressToNext = 0;
  if (next) {
    var range = next.minPoints - current.minPoints;
    progressToNext = Math.min(1, (points - current.minPoints) / range);
  } else {
    progressToNext = 1;
  }
  return { level: current.level, name: current.name, next: next, progressToNext: progressToNext };
}

/* ========================================
   HELPER: Get all stations for a world
   ======================================== */

function getAllStations(worldId) {
  var world = WORLDS[worldId];
  if (!world) return [];
  return [world.mandatory].concat(world.fork);
}

/* ========================================
   AVATAR STATE
   ======================================== */

function getAvatarState() {
  var progress = getProgress();
  var count = progress.completedStations.length;
  if (!progress.expeditionStarted) return 'sofa';
  if (count >= TOTAL_STATIONS) return 'celebrate';
  return 'explorer';
}

function getAvatarImage() {
  var progress = getProgress();
  var state = getAvatarState();
  if (state === 'sofa') return getMobileAssetPath('assets/avatar-sofa.png');
  if (state === 'celebrate') return getMobileAssetPath('assets/avatar-celebrate.png');
  var choice = progress.avatarChoice || 'explorer';
  var avatar = AVATAR_CHOICES[choice];
  return getMobileAssetPath(avatar ? avatar.image : 'assets/avatar-explorer.png');
}

function getAvatarSprite() {
  var choice = getProgress().avatarChoice || 'explorer';
  var avatar = AVATAR_CHOICES[choice];
  var sprite = avatar ? avatar.sprite : 'assets/sprites/sprite-explorer.png';
  return getMobileAssetPath(sprite);
}

function startExpedition() {
  var progress = getProgress();
  if (!progress.expeditionStarted) {
    progress.expeditionStarted = true;
    progress.onboardingSeen = true;
    saveProgress(progress);
  }
}

function isExpeditionStarted() {
  return getProgress().expeditionStarted || false;
}

function setAvatarChoice(choice) {
  var progress = getProgress();
  progress.avatarChoice = choice;
  saveProgress(progress);
}

function getAvatarChoice() {
  return getProgress().avatarChoice || null;
}

/* ========================================
   CURRENT WORLD (where the avatar is)
   ======================================== */

function getCurrentWorld() {
  for (var i = WORLD_ORDER.length - 1; i >= 0; i--) {
    var worldId = WORLD_ORDER[i];
    if (isWorldUnlocked(worldId)) return worldId;
  }
  return 'jungle';
}

/* ========================================
   CORE PROGRESS FUNCTIONS
   ======================================== */

function getProgress() {
  try {
    var data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    // localStorage nicht verfuegbar
  }
  return {
    completedStations: [],
    challengesCompleted: [],
    points: 0,
    lastVisited: null,
    badges: [],
    onboardingSeen: false,
    expeditionStarted: false,
    sessionStart: null,
    avatarChoice: null,
    playerName: '',
    lastAvatarPosition: 'sofa'
  };
}

function saveProgress(progress) {
  try {
    progress.lastVisited = new Date().toISOString().split('T')[0];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    // Graceful degradation
  }
}

function isStationComplete(stationId) {
  var progress = getProgress();
  return progress.completedStations.includes(stationId);
}

function markStationComplete(stationId) {
  var progress = getProgress();
  if (!progress.completedStations.includes(stationId)) {
    progress.completedStations.push(stationId);
    progress.points += POINTS_PER_STATION;
    saveProgress(progress);
  }
  return progress;
}

function isChallengeComplete(stationId) {
  var progress = getProgress();
  return progress.challengesCompleted.includes(stationId);
}

function deductPoints(amount) {
  var progress = getProgress();
  progress.points = Math.max(0, progress.points - amount);
  saveProgress(progress);
  return progress;
}

function markChallengeComplete(stationId) {
  var progress = getProgress();
  if (!progress.challengesCompleted.includes(stationId)) {
    progress.challengesCompleted.push(stationId);
    progress.points += POINTS_PER_CHALLENGE;
    saveProgress(progress);
  }
  return progress;
}

function saveChallengeResponse(stationId, text) {
  var progress = getProgress();
  if (!progress.challengeResponses) progress.challengeResponses = {};
  progress.challengeResponses[stationId] = text;
  saveProgress(progress);
}

function getChallengeResponse(stationId) {
  var progress = getProgress();
  return (progress.challengeResponses && progress.challengeResponses[stationId]) || '';
}

function getAllChallengeResponses() {
  return getProgress().challengeResponses || {};
}

function getCompletionCount() {
  return getProgress().completedStations.length;
}

function getTotalStations() {
  return TOTAL_STATIONS;
}

function getPoints() {
  return getProgress().points;
}

/* ========================================
   WORLD PROGRESS – Fork-Modell
   ======================================== */

function getWorldProgress(worldId) {
  var world = WORLDS[worldId];
  if (!world) return { completed: 0, total: 0 };
  var all = getAllStations(worldId);
  var progress = getProgress();
  var completed = all.filter(function (s) {
    return progress.completedStations.includes(s);
  }).length;
  return { completed: completed, total: all.length };
}

function isWorldComplete(worldId) {
  var wp = getWorldProgress(worldId);
  return wp.completed === wp.total;
}

function isWorldPassable(worldId) {
  var world = WORLDS[worldId];
  if (!world) return false;
  var progress = getProgress();
  var mandatoryDone = progress.completedStations.includes(world.mandatory);
  if (!mandatoryDone) return false;
  var forkDone = world.fork.filter(function (s) {
    return progress.completedStations.includes(s);
  }).length;
  return forkDone >= world.requiredForkCount;
}

function isWorldUnlocked(worldId) {
  var idx = WORLD_ORDER.indexOf(worldId);
  if (idx <= 0) return true;
  var prevWorld = WORLD_ORDER[idx - 1];
  return isWorldPassable(prevWorld);
}

function isForkUnlocked(worldId) {
  var world = WORLDS[worldId];
  if (!world) return false;
  return isStationComplete(world.mandatory);
}

function getWorldForStation(stationId) {
  for (var key in WORLDS) {
    if (getAllStations(key).includes(stationId)) return key;
  }
  return null;
}

function getWorldUnlockMessage(worldId) {
  var idx = WORLD_ORDER.indexOf(worldId);
  if (idx <= 0) return '';
  var prevWorld = WORLD_ORDER[idx - 1];
  var pw = WORLDS[prevWorld];
  var progress = getProgress();
  var mandatoryDone = progress.completedStations.includes(pw.mandatory);
  if (!mandatoryDone) {
    return 'Schliesse zuerst die Pflichtstation im ' + pw.name + ' ab.';
  }
  var forkDone = pw.fork.filter(function (s) {
    return progress.completedStations.includes(s);
  }).length;
  if (forkDone < pw.requiredForkCount) {
    return 'Schliesse mindestens 1 Weggabelungs-Station im ' + pw.name + ' ab.';
  }
  return '';
}

/* ========================================
   STATION ACCESSIBILITY
   ======================================== */

function isStationAccessible(stationId) {
  var worldId = getWorldForStation(stationId);
  if (!worldId) return false;
  if (!isWorldUnlocked(worldId)) return false;
  var world = WORLDS[worldId];
  if (stationId === world.mandatory) return true;
  return isForkUnlocked(worldId);
}

/* ========================================
   BADGE SYSTEM
   ======================================== */

function checkBadges() {
  var progress = getProgress();
  var newBadges = [];

  BADGES.forEach(function (badge) {
    if (progress.badges.includes(badge.id)) return;

    var earned = false;
    if (badge.condition === 'world') {
      earned = isWorldComplete(badge.world);
    } else if (badge.condition === 'all-challenges') {
      earned = progress.challengesCompleted.length >= TOTAL_STATIONS;
    } else if (badge.condition === 'all-stations') {
      earned = progress.completedStations.length >= TOTAL_STATIONS;
    } else if (badge.condition === 'speedrun') {
      if (progress.sessionStart && progress.completedStations.length >= TOTAL_STATIONS) {
        earned = true;
      }
    }

    if (earned) {
      progress.badges.push(badge.id);
      newBadges.push(badge);
    }
  });

  if (newBadges.length > 0) {
    saveProgress(progress);
  }
  return newBadges;
}

function getEarnedBadges() {
  var progress = getProgress();
  return BADGES.filter(function (b) {
    return progress.badges.includes(b.id);
  });
}

/* ========================================
   TOAST NOTIFICATION SYSTEM
   ======================================== */

var toastQueue = [];
var toastActive = false;

function showToast(message, type) {
  type = type || 'success';
  toastQueue.push({ message: message, type: type });
  if (!toastActive) processToastQueue();
}

function processToastQueue() {
  if (toastQueue.length === 0) {
    toastActive = false;
    return;
  }
  toastActive = true;
  var item = toastQueue.shift();

  var toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);
  }

  toast.textContent = item.message;
  toast.className = 'toast toast--' + item.type;

  void toast.offsetWidth;
  toast.classList.add('is-visible');

  setTimeout(function () {
    toast.classList.remove('is-visible');
    setTimeout(function () {
      processToastQueue();
    }, 400);
  }, 3000);
}

/* ========================================
   SESSION TRACKING (for speedrun badge)
   ======================================== */

function initSession() {
  var progress = getProgress();
  if (!progress.sessionStart) {
    progress.sessionStart = new Date().toISOString();
    saveProgress(progress);
  }
}

function resetProgress() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('highscore-submitted');
  } catch (e) {
    // Graceful degradation
  }
}

/* ========================================
   REFLECTIONS & NOTES
   ======================================== */

function saveReflection(stationId, text) {
  var progress = getProgress();
  if (!progress.reflections) progress.reflections = {};
  progress.reflections[stationId] = text;
  saveProgress(progress);
}

function getReflection(stationId) {
  var progress = getProgress();
  return (progress.reflections && progress.reflections[stationId]) || '';
}

function saveNote(stationId, text) {
  var progress = getProgress();
  if (!progress.notes) progress.notes = {};
  progress.notes[stationId] = text;
  saveProgress(progress);
}

function getNote(stationId) {
  var progress = getProgress();
  return (progress.notes && progress.notes[stationId]) || '';
}

function getAllReflections() {
  return getProgress().reflections || {};
}

function getAllNotes() {
  return getProgress().notes || {};
}

/* ========================================
   QUIZ SYSTEM
   ======================================== */

function isQuizPassed(stationId) {
  var progress = getProgress();
  return progress.quizPassed && progress.quizPassed.includes(stationId);
}

function markQuizPassed(stationId) {
  var progress = getProgress();
  if (!progress.quizPassed) progress.quizPassed = [];
  if (!progress.quizPassed.includes(stationId)) {
    progress.quizPassed.push(stationId);
    saveProgress(progress);
  }
}

/* ========================================
   I18N HELPER FUNCTIONS
   ======================================== */

function getWorldName(worldId) {
  var w = WORLDS[worldId];
  if (!w) return worldId;
  if (typeof I18N !== 'undefined') return I18N.t('world.' + worldId, w.name);
  return w.name;
}

function getAvatarName(choice) {
  var a = AVATAR_CHOICES[choice];
  if (!a) return choice;
  if (typeof I18N !== 'undefined') return I18N.t('avatar.' + choice, a.name);
  return a.name;
}

function getLevelName(levelObj) {
  if (typeof I18N !== 'undefined') return I18N.t('level.' + levelObj.level, levelObj.name);
  return levelObj.name;
}

function getBadgeName(badge) {
  if (typeof I18N !== 'undefined') return I18N.t('badge.' + badge.id, badge.name);
  return badge.name;
}

function getWorldUnlockMessageI18n(worldId) {
  var idx = WORLD_ORDER.indexOf(worldId);
  if (idx <= 0) return '';
  var prevWorld = WORLD_ORDER[idx - 1];
  var pw = WORLDS[prevWorld];
  var progress = getProgress();
  var mandatoryDone = progress.completedStations.includes(pw.mandatory);
  if (!mandatoryDone) {
    if (typeof I18N !== 'undefined') {
      return I18N.t('world.unlock.mandatory', 'Schliesse zuerst die Pflichtstation im ' + pw.name + ' ab.').replace('{world}', getWorldName(prevWorld));
    }
    return 'Schliesse zuerst die Pflichtstation im ' + pw.name + ' ab.';
  }
  var forkDone = pw.fork.filter(function (s) {
    return progress.completedStations.includes(s);
  }).length;
  if (forkDone < pw.requiredForkCount) {
    if (typeof I18N !== 'undefined') {
      return I18N.t('world.unlock.fork', 'Schliesse mindestens 1 Weggabelungs-Station im ' + pw.name + ' ab.').replace('{world}', getWorldName(prevWorld));
    }
    return 'Schliesse mindestens 1 Weggabelungs-Station im ' + pw.name + ' ab.';
  }
  return '';
}
