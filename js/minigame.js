/* ========================================
   MINIGAME.JS – Runner between worlds
   Canvas-based side-scroller mini-game
   ======================================== */

var MiniGame = (function () {

  var canvas, ctx;
  var state = 'idle'; // idle, countdown, running, done
  var animFrame = null;
  var lastTime = 0;

  // Game config
  var DURATION = 15000; // 15 seconds
  var GRAVITY = 1800;
  var JUMP_VELOCITY = -600;
  var SCROLL_SPEED = 280;
  var GROUND_Y = 0.78; // 78% of canvas height
  var COIN_COUNT = 5;

  // Game objects
  var player = { x: 0, y: 0, vy: 0, w: 36, h: 48, grounded: true };
  var obstacles = [];
  var coins = [];
  var collected = 0;
  var elapsed = 0;
  var scrollX = 0;
  var theme = null;
  var onFinish = null;
  var countdownValue = 3;
  var countdownStart = 0;

  // Sprite (avatar image)
  var avatarImg = null;

  // Input
  var jumpPressed = false;

  /* ========================================
     THEMES
     ======================================== */

  var THEMES = {
    'jungle-to-ocean': {
      name: 'Vom Dschungel zum Ozean',
      groundColor: ['#2d5a27', '#1a6b7a'],
      bgColor: ['#0d3b1e', '#0a3d5c'],
      skyGradient: [['#1a4a2e', '#0d3b1e'], ['#0a3d5c', '#0f5577']],
      obstacleColor: ['#3e7a35', '#2980b9'],
      coinColor: '#f1c40f',
      particleColor: ['#27ae60', '#3498db']
    },
    'ocean-to-cosmos': {
      name: 'Vom Ozean zum Kosmos',
      groundColor: ['#1a6b7a', '#2c1654'],
      bgColor: ['#0a3d5c', '#0d0d2b'],
      skyGradient: [['#0f5577', '#0a3d5c'], ['#0d0d2b', '#1a1a4e']],
      obstacleColor: ['#2980b9', '#8e44ad'],
      coinColor: '#f1c40f',
      particleColor: ['#3498db', '#9b59b6']
    },
    'cosmos-to-metro': {
      name: 'Vom Kosmos zur Metropole',
      groundColor: ['#2c1654', '#3a3a4a'],
      bgColor: ['#0d0d2b', '#1a1a2e'],
      skyGradient: [['#1a1a4e', '#0d0d2b'], ['#1a1a2e', '#2c3e50']],
      obstacleColor: ['#8e44ad', '#7f8c8d'],
      coinColor: '#f1c40f',
      particleColor: ['#9b59b6', '#bdc3c7']
    },
    'metro-to-finale': {
      name: 'Von der Metropole zur Feier',
      groundColor: ['#3a3a4a', '#4a3520'],
      bgColor: ['#1a1a2e', '#2c1a0e'],
      skyGradient: [['#2c3e50', '#1a1a2e'], ['#2c1a0e', '#4a2810']],
      obstacleColor: ['#7f8c8d', '#c8a84e'],
      coinColor: '#f1c40f',
      particleColor: ['#bdc3c7', '#f1c40f']
    }
  };

  /* ========================================
     INIT & START
     ======================================== */

  function init(canvasId, themeId, avatarSrc, callback) {
    canvas = document.getElementById(canvasId);
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    theme = THEMES[themeId] || THEMES['jungle-to-ocean'];
    onFinish = callback || null;

    // Load avatar image
    avatarImg = new Image();
    avatarImg.src = avatarSrc || 'assets/avatar-explorer.png';

    // Reset state
    state = 'idle';
    collected = 0;
    elapsed = 0;
    scrollX = 0;
    obstacles = [];
    coins = [];
    jumpPressed = false;

    var groundPx = canvas.height * GROUND_Y;
    player.x = 80;
    player.y = groundPx - player.h;
    player.vy = 0;
    player.grounded = true;

    _generateLevel();
    _bindInput();
    _render(); // Draw initial frame
  }

  function start() {
    state = 'countdown';
    countdownValue = 3;
    countdownStart = performance.now();
    lastTime = performance.now();
    _loop(lastTime);
  }

  function cleanup() {
    state = 'idle';
    if (animFrame) {
      cancelAnimationFrame(animFrame);
      animFrame = null;
    }
    _unbindInput();
  }

  /* ========================================
     LEVEL GENERATION
     ======================================== */

  function _generateLevel() {
    obstacles = [];
    coins = [];
    var groundPx = canvas.height * GROUND_Y;
    var totalDist = SCROLL_SPEED * (DURATION / 1000);

    // Distribute obstacles evenly across the level
    var obstacleCount = 8;
    for (var i = 0; i < obstacleCount; i++) {
      var xPos = 300 + (totalDist / obstacleCount) * i + Math.random() * 80;
      var h = 30 + Math.random() * 30;
      obstacles.push({ x: xPos, y: groundPx - h, w: 28 + Math.random() * 16, h: h });
    }

    // Distribute coins – some in the air, some on ground level
    for (var j = 0; j < COIN_COUNT; j++) {
      var cx = 250 + (totalDist / COIN_COUNT) * j + Math.random() * 100;
      var cy = groundPx - 60 - Math.random() * 70;
      coins.push({ x: cx, y: cy, r: 10, collected: false });
    }
  }

  /* ========================================
     INPUT
     ======================================== */

  function _onKeyDown(e) {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
      e.preventDefault();
      jumpPressed = true;
    }
  }

  function _onTouch(e) {
    // Don't intercept button clicks
    if (e.target.tagName === 'BUTTON') return;
    e.preventDefault();
    jumpPressed = true;
  }

  function _onClick(e) {
    if (e.target.tagName === 'BUTTON') return;
    jumpPressed = true;
  }

  var _boundKeyDown = null;
  var _boundTouch = null;
  var _boundClick = null;

  function _bindInput() {
    _boundKeyDown = _onKeyDown;
    _boundTouch = _onTouch;
    _boundClick = _onClick;
    document.addEventListener('keydown', _boundKeyDown);
    canvas.addEventListener('touchstart', _boundTouch, { passive: false });
    canvas.addEventListener('click', _boundClick);
  }

  function _unbindInput() {
    if (_boundKeyDown) document.removeEventListener('keydown', _boundKeyDown);
    if (_boundTouch) canvas.removeEventListener('touchstart', _boundTouch);
    if (_boundClick) canvas.removeEventListener('click', _boundClick);
  }

  /* ========================================
     GAME LOOP
     ======================================== */

  function _loop(now) {
    if (state === 'idle') return;
    var dt = Math.min((now - lastTime) / 1000, 0.05); // cap at 50ms
    lastTime = now;

    if (state === 'countdown') {
      var countdownElapsed = now - countdownStart;
      countdownValue = 3 - Math.floor(countdownElapsed / 800);
      if (countdownValue <= 0) {
        state = 'running';
        elapsed = 0;
      }
      _render();
      animFrame = requestAnimationFrame(_loop);
      return;
    }

    if (state === 'running') {
      elapsed += dt * 1000;
      if (elapsed >= DURATION) {
        state = 'done';
        _render();
        if (onFinish) onFinish(collected);
        return;
      }
      _update(dt);
    }

    _render();
    animFrame = requestAnimationFrame(_loop);
  }

  /* ========================================
     UPDATE
     ======================================== */

  function _update(dt) {
    var groundPx = canvas.height * GROUND_Y;

    // Scroll
    scrollX += SCROLL_SPEED * dt;

    // Jump
    if (jumpPressed && player.grounded) {
      player.vy = JUMP_VELOCITY;
      player.grounded = false;
    }
    jumpPressed = false;

    // Gravity
    if (!player.grounded) {
      player.vy += GRAVITY * dt;
      player.y += player.vy * dt;

      if (player.y >= groundPx - player.h) {
        player.y = groundPx - player.h;
        player.vy = 0;
        player.grounded = true;
      }
    }

    // Collision with obstacles
    for (var i = 0; i < obstacles.length; i++) {
      var ob = obstacles[i];
      var ox = ob.x - scrollX;
      if (_aabb(player.x, player.y, player.w, player.h, ox, ob.y, ob.w, ob.h)) {
        // Push player back slightly (slow down effect)
        scrollX -= SCROLL_SPEED * dt * 0.3;
      }
    }

    // Coin collection
    for (var j = 0; j < coins.length; j++) {
      var c = coins[j];
      if (c.collected) continue;
      var cx = c.x - scrollX;
      var playerCX = player.x + player.w / 2;
      var playerCY = player.y + player.h / 2;
      var dist = Math.sqrt((playerCX - cx) * (playerCX - cx) + (playerCY - c.y) * (playerCY - c.y));
      if (dist < c.r + 20) {
        c.collected = true;
        collected++;
        _updateHUD();
      }
    }
  }

  function _aabb(x1, y1, w1, h1, x2, y2, w2, h2) {
    return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
  }

  /* ========================================
     RENDER
     ======================================== */

  function _render() {
    if (!ctx) return;
    var w = canvas.width;
    var h = canvas.height;
    var groundPx = h * GROUND_Y;
    var progress = Math.min(1, elapsed / DURATION);

    // Sky gradient (transitions between two theme colors)
    var skyFrom = _lerpColor(theme.skyGradient[0][0], theme.skyGradient[1][0], progress);
    var skyTo = _lerpColor(theme.skyGradient[0][1], theme.skyGradient[1][1], progress);
    var skyGrad = ctx.createLinearGradient(0, 0, 0, groundPx);
    skyGrad.addColorStop(0, skyFrom);
    skyGrad.addColorStop(1, skyTo);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, groundPx);

    // Stars (for cosmos theme or as progress increases)
    if (progress > 0.3) {
      ctx.fillStyle = 'rgba(255,255,255,' + (progress - 0.3) * 0.5 + ')';
      for (var s = 0; s < 20; s++) {
        var sx = (s * 137 + scrollX * 0.1) % w;
        var sy = (s * 97) % (groundPx - 20) + 10;
        ctx.fillRect(sx, sy, 2, 2);
      }
    }

    // Ground
    var groundColor = _lerpColor(theme.groundColor[0], theme.groundColor[1], progress);
    ctx.fillStyle = groundColor;
    ctx.fillRect(0, groundPx, w, h - groundPx);

    // Ground line
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundPx);
    ctx.lineTo(w, groundPx);
    ctx.stroke();

    // Obstacles
    for (var i = 0; i < obstacles.length; i++) {
      var ob = obstacles[i];
      var ox = ob.x - scrollX;
      if (ox > -50 && ox < w + 50) {
        var obColor = _lerpColor(theme.obstacleColor[0], theme.obstacleColor[1], progress);
        ctx.fillStyle = obColor;
        ctx.beginPath();
        // Draw as a trapezoid / triangle-ish rock
        ctx.moveTo(ox, ob.y + ob.h);
        ctx.lineTo(ox + ob.w * 0.2, ob.y);
        ctx.lineTo(ox + ob.w * 0.8, ob.y);
        ctx.lineTo(ox + ob.w, ob.y + ob.h);
        ctx.closePath();
        ctx.fill();
        // Highlight
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.beginPath();
        ctx.moveTo(ox + ob.w * 0.2, ob.y);
        ctx.lineTo(ox + ob.w * 0.5, ob.y);
        ctx.lineTo(ox + ob.w * 0.4, ob.y + ob.h * 0.6);
        ctx.lineTo(ox + ob.w * 0.1, ob.y + ob.h * 0.3);
        ctx.closePath();
        ctx.fill();
      }
    }

    // Coins
    for (var j = 0; j < coins.length; j++) {
      var c = coins[j];
      if (c.collected) continue;
      var cx = c.x - scrollX;
      if (cx > -20 && cx < w + 20) {
        // Glow
        ctx.beginPath();
        ctx.arc(cx, c.y, c.r + 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(241, 196, 15, 0.25)';
        ctx.fill();
        // Coin
        ctx.beginPath();
        ctx.arc(cx, c.y, c.r, 0, Math.PI * 2);
        ctx.fillStyle = theme.coinColor;
        ctx.fill();
        ctx.strokeStyle = '#d4a00a';
        ctx.lineWidth = 2;
        ctx.stroke();
        // XP label
        ctx.fillStyle = '#7d6600';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('XP', cx, c.y);
      }
    }

    // Player
    if (avatarImg && avatarImg.complete && avatarImg.naturalWidth > 0) {
      ctx.drawImage(avatarImg, player.x, player.y, player.w, player.h);
    } else {
      // Fallback rectangle
      ctx.fillStyle = '#e67e22';
      ctx.fillRect(player.x, player.y, player.w, player.h);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('?', player.x + player.w / 2, player.y + player.h / 2 + 4);
    }

    // Countdown overlay
    if (state === 'countdown') {
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 64px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(countdownValue > 0 ? countdownValue : 'Los!', w / 2, h / 2);
    }

    // Progress bar at top
    if (state === 'running') {
      var barW = w - 20;
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(10, 8, barW, 6);
      ctx.fillStyle = 'rgba(241, 196, 15, 0.8)';
      ctx.fillRect(10, 8, barW * progress, 6);
    }
  }

  /* ========================================
     COLOR HELPERS
     ======================================== */

  function _hexToRgb(hex) {
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
  }

  function _rgbToHex(r, g, b) {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  function _lerpColor(c1, c2, t) {
    var a = _hexToRgb(c1);
    var b = _hexToRgb(c2);
    return _rgbToHex(
      Math.round(a[0] + (b[0] - a[0]) * t),
      Math.round(a[1] + (b[1] - a[1]) * t),
      Math.round(a[2] + (b[2] - a[2]) * t)
    );
  }

  /* ========================================
     HUD UPDATE
     ======================================== */

  function _updateHUD() {
    var coinsEl = document.getElementById('minigame-coins');
    if (coinsEl) coinsEl.textContent = collected + '/' + COIN_COUNT + ' XP';
    var timerEl = document.getElementById('minigame-timer');
    if (timerEl) {
      var remaining = Math.max(0, Math.ceil((DURATION - elapsed) / 1000));
      timerEl.textContent = remaining + 's';
    }
  }

  /* ========================================
     TIMER UPDATE (called from game loop)
     ======================================== */

  // Override _update to also refresh HUD timer
  var _originalUpdate = _update;
  _update = function (dt) {
    _originalUpdate(dt);
    _updateHUD();
  };

  /* ========================================
     PUBLIC API
     ======================================== */

  return {
    init: init,
    start: start,
    cleanup: cleanup,
    getCollected: function () { return collected; },
    THEMES: THEMES
  };

})();
