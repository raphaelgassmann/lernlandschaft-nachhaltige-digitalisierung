/* ========================================
   STATION.JS – Stations-Interaktivität
   ======================================== */

document.addEventListener('DOMContentLoaded', function () {
  initCompleteButton();
  initRevealButtons();
  initChallengeButton();
});

function initCompleteButton() {
  var btn = document.getElementById('complete-btn');
  if (!btn) return;

  var stationId = btn.dataset.station;

  // Status beim Laden prüfen
  if (isStationComplete(stationId)) {
    btn.classList.add('is-completed');
    btn.textContent = 'Station abgeschlossen \u2714';
  }

  btn.addEventListener('click', function () {
    if (isStationComplete(stationId)) return;

    markStationComplete(stationId);
    btn.classList.add('is-completed');
    btn.textContent = 'Station abgeschlossen \u2714';

    // Kurze Erfolgsanimation
    btn.style.transform = 'scale(1.05)';
    setTimeout(function () {
      btn.style.transform = '';
    }, 300);
  });
}

function initRevealButtons() {
  var buttons = document.querySelectorAll('.reveal-btn');
  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var targetId = btn.dataset.target;
      var content = document.getElementById(targetId);
      if (!content) return;

      var isHidden = content.hidden;
      content.hidden = !isHidden;
      btn.textContent = isHidden ? 'Denkanstoss ausblenden' : 'Denkanstoss anzeigen';
    });
  });
}

function initChallengeButton() {
  var btn = document.querySelector('.challenge-btn');
  if (!btn) return;

  var stationId = btn.dataset.station;

  // Status beim Laden prüfen
  if (isChallengeComplete(stationId)) {
    btn.classList.add('is-accepted');
    btn.textContent = 'Challenge angenommen \u2714';
  }

  btn.addEventListener('click', function () {
    if (isChallengeComplete(stationId)) return;

    markChallengeComplete(stationId);
    btn.classList.add('is-accepted');
    btn.textContent = 'Challenge angenommen \u2714';
  });
}
