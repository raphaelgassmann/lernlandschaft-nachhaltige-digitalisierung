/* ========================================
   PROGRESS.JS – Expeditions-Fortschritt
   localStorage-basierte Persistenz
   ======================================== */

const STORAGE_KEY = 'lernlandschaft-progress';
const POINTS_PER_STATION = 10;
const POINTS_PER_CHALLENGE = 5;

const WORLDS = {
  jungle: {
    name: 'Daten-Dschungel',
    stations: ['geraete-lichtung', 'cloud-quelle', 'code-camp']
  },
  ocean: {
    name: 'Daten-Ozean',
    stations: ['server-riff', 'streaming-strom', 'backup-bucht']
  },
  cosmos: {
    name: 'Code-Kosmos',
    stations: ['ide-asteroid', 'deploy-stern', 'workflow-nebel']
  },
  metro: {
    name: 'Zukunfts-Metropole',
    stations: ['ki-kraftwerk', 'open-source-platz', 'digital-ethics-turm']
  }
};

const TOTAL_STATIONS = Object.values(WORLDS).reduce(function (sum, w) {
  return sum + w.stations.length;
}, 0);

function getProgress() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    // localStorage nicht verfügbar
  }
  return {
    completedStations: [],
    challengesCompleted: [],
    points: 0,
    lastVisited: null
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
  const progress = getProgress();
  return progress.completedStations.includes(stationId);
}

function markStationComplete(stationId) {
  const progress = getProgress();
  if (!progress.completedStations.includes(stationId)) {
    progress.completedStations.push(stationId);
    progress.points += POINTS_PER_STATION;
    saveProgress(progress);
  }
  return progress;
}

function isChallengeComplete(stationId) {
  const progress = getProgress();
  return progress.challengesCompleted.includes(stationId);
}

function markChallengeComplete(stationId) {
  const progress = getProgress();
  if (!progress.challengesCompleted.includes(stationId)) {
    progress.challengesCompleted.push(stationId);
    progress.points += POINTS_PER_CHALLENGE;
    saveProgress(progress);
  }
  return progress;
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

function getWorldProgress(worldId) {
  var world = WORLDS[worldId];
  if (!world) return { completed: 0, total: 0 };
  var progress = getProgress();
  var completed = world.stations.filter(function (s) {
    return progress.completedStations.includes(s);
  }).length;
  return { completed: completed, total: world.stations.length };
}

function isWorldComplete(worldId) {
  var wp = getWorldProgress(worldId);
  return wp.completed === wp.total;
}

function getWorldForStation(stationId) {
  for (var key in WORLDS) {
    if (WORLDS[key].stations.includes(stationId)) return key;
  }
  return null;
}

function resetProgress() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    // Graceful degradation
  }
}
