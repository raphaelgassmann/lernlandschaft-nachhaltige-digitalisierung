/* ========================================
   LANDSCAPE.JS – Multi-World Interaktivität
   ======================================== */

document.addEventListener('DOMContentLoaded', function () {
  updateProgressDisplay();
  updateWorldProgress();
  updateStationMarkers();
  updateMobileCards();
});

function updateProgressDisplay() {
  var count = getCompletionCount();
  var total = getTotalStations();
  var points = getPoints();
  var percentage = Math.round((count / total) * 100);

  var fill = document.getElementById('progress-fill');
  var text = document.getElementById('progress-text');
  var pointsEl = document.getElementById('progress-points');

  if (fill) fill.style.width = percentage + '%';
  if (text) text.textContent = count + ' / ' + total + ' Stationen entdeckt';
  if (pointsEl) pointsEl.textContent = points + ' Punkte';
}

function updateWorldProgress() {
  var worldSections = document.querySelectorAll('.world[data-world]');
  worldSections.forEach(function (section) {
    var worldId = section.dataset.world;
    var wp = getWorldProgress(worldId);
    var percentage = Math.round((wp.completed / wp.total) * 100);

    var fill = section.querySelector('.world-progress__fill');
    var text = section.querySelector('.world-progress__text');

    if (fill) fill.style.width = percentage + '%';
    if (text) text.textContent = wp.completed + ' / ' + wp.total;
  });
}

function updateStationMarkers() {
  var markers = document.querySelectorAll('.station-marker');
  markers.forEach(function (marker) {
    var stationId = marker.dataset.station;
    if (stationId && isStationComplete(stationId)) {
      marker.classList.add('is-completed');
      var check = marker.querySelector('.station-marker__check');
      if (check) check.style.display = 'block';
    }
  });

  // Pfade aktivieren
  var paths = document.querySelectorAll('.world-path');
  var progress = getProgress();
  paths.forEach(function (path) {
    var from = path.dataset.from;
    if (from && progress.completedStations.includes(from)) {
      path.classList.add('is-active');
    }
  });
}

function updateMobileCards() {
  var cards = document.querySelectorAll('.mobile-station-card');
  cards.forEach(function (card) {
    var stationId = card.dataset.station;
    if (stationId && isStationComplete(stationId)) {
      card.classList.add('is-completed');
      var status = card.querySelector('.mobile-station-card__status');
      if (status) status.textContent = '\u2714';
    }
  });
}
