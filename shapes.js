(function () {
  "use strict";
  var shapes = [
    ["Circle", "circle.jpg"],
    ["Square", "square.jpg"],
    ["Triangle", "triangle.jpg"],
    ["Star", "star.jpg"],
    ["Heart", "heart.jpg"],
    ["Diamond", "diamond.jpg"],
    ["Oval", "oval.jpg"],
    ["Rectangle", "rectangle.jpg"]
  ];
  var board = document.getElementById("board");
  var starsEl = document.getElementById("stars");
  var currentName = "";
  var round = 0;
  var stars = 0;
  var streak = 0;
  var right = 0;
  var missed = 0;
  var locked = false;
  var correctAt = 0;

  function paintStatus(total) {
    starsEl.textContent = "★ " + stars;
    var badge = document.getElementById("badge");
    if (badge) {
      badge.hidden = stars < 1;
      badge.textContent = stars + " Star Badge";
    }
    var streakEl = document.getElementById("streak");
    if (streakEl) streakEl.textContent = "Streak " + streak;
    var track = document.getElementById("track");
    if (track) track.style.width = Math.round((round / total) * 100) + "%";
    var musicBtn = document.getElementById("music-btn");
    var voiceBtn = document.getElementById("voice-btn");
    if (musicBtn && window.DsmeSound) musicBtn.textContent = DsmeSound.musicOn() ? "Music on" : "Music off";
    if (voiceBtn && window.DsmeSound) voiceBtn.textContent = DsmeSound.voiceOn() ? "Phonics on" : "Phonics off";
  }

  function icon(shape) {
    return '<figure class="named"><img class="target-pic" src="img/shapes/' + shape[1] + '" alt="' + shape[0] + '"><figcaption>' + shape[0] + '</figcaption></figure>';
  }

  function shuffle(list) {
    var a = list.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function reviewLine(rightCount, missedCount) {
    if (!missedCount) return "Excellent. Every answer was right.";
    if (rightCount > missedCount) return "Good work. " + rightCount + " right and " + missedCount + " wrong.";
    if (rightCount === missedCount) return rightCount + " right and " + missedCount + " wrong. Look a little closer next time.";
    return "Keep practising. " + rightCount + " right and " + missedCount + " wrong.";
  }

  function showDone() {
    var badge = stars + " Star Badge";
    var review = reviewLine(right, missed);
    if (window.DsmeSound) DsmeSound.say(review + " " + badge + ".");
    board.innerHTML = '<div class="finish"><p class="congrats">' + (right > missed ? "Congratulations!" : "Game finished") + '</p>' +
      '<div class="badge-award"><span class="badge-count">★ ' + stars + '</span><strong>' + badge + '</strong>' +
      '<p>' + right + ' right · ' + missed + ' wrong</p></div>' +
      '<h1>You found the shapes!</h1><p class="lead">' + review + '</p>' +
      '<p><a class="btn btn-shape" href="shapes.html">Play again</a></p></div>';
  }

  function render() {
    if (round >= shapes.length) { showDone(); return; }
    var target = shapes[round];
    currentName = target[0];
    var others = shuffle(shapes.filter(function (it) { return it !== target; })).slice(0, 2);
    var choices = shuffle([target].concat(others));
    correctAt = choices.indexOf(target);
    locked = false;
    paintStatus(shapes.length);
    board.innerHTML =
      '<p class="fine">Shape ' + (round + 1) + ' of ' + shapes.length + '</p>' +
      icon(target) +
      '<h1>Find the same shape!</h1>' +
      '<div class="choice-row">' + choices.map(function (it, i) {
        return '<button type="button" data-i="' + i + '" aria-label="' + it[0] + '">' + icon(it) + '</button>';
      }).join("") + '</div><p id="msg"></p>';
    if (window.DsmeSound) DsmeSound.say(currentName);
  }

  board.addEventListener("click", function (event) {
    var button = event.target.closest("button[data-i]");
    if (!button || locked) return;
    var i = Number(button.getAttribute("data-i"));
    var msg = document.getElementById("msg");
    if (i === correctAt) {
      locked = true;
      right += 1;
      stars += 1;
      streak += 1;
      paintStatus(shapes.length);
      button.classList.add("ok");
      msg.className = "play-msg good";
      msg.textContent = "Great job! +1 star";
      setTimeout(function () { round += 1; render(); }, 900);
    } else {
      locked = true;
      missed += 1;
      stars = Math.max(0, stars - 1);
      streak = 0;
      paintStatus(shapes.length);
      button.classList.add("bad");
      msg.className = "play-msg again";
      msg.textContent = "−1 mark";
      if (window.DsmeSound) DsmeSound.say("Wrong. Minus one mark.");
      setTimeout(function () { round += 1; render(); }, 800);
    }
  });

  document.getElementById("music-btn").addEventListener("click", function () {
    if (window.DsmeSound) DsmeSound.toggleMusic();
    paintStatus(shapes.length);
  });
  document.getElementById("voice-btn").addEventListener("click", function () {
    if (window.DsmeSound) DsmeSound.toggleVoice();
    paintStatus(shapes.length);
  });
  render();
})();
