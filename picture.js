(function () {
  "use strict";
  var items = [
    ["Apple", "apple-3d.jpg"], ["Ball", "ball-3d.jpg"], ["Cat", "cat-3d.jpg"], ["Dolphin", "dolphin-3d.jpg"],
    ["Elephant", "elephant-3d.jpg"], ["Fish", "fish-3d.jpg"], ["Grapes", "grapes-3d.jpg"], ["House", "house-3d.jpg"],
    ["Ice cream", "ice-cream-3d.jpg"], ["Juice", "juice-3d.jpg"], ["Kite", "kite-3d.jpg"], ["Lion", "lion-3d.jpg"],
    ["Moon", "moon-3d.jpg"], ["Nest", "nest-3d.jpg"], ["Orange", "orange-3d.jpg"], ["Penguin", "penguin-3d.jpg"],
    ["Queen", "queen-3d.jpg"], ["Rainbow", "rainbow-3d.jpg"], ["Sun", "sun-3d.jpg"], ["Tiger", "tiger-3d.jpg"],
    ["Umbrella", "umbrella-3d.jpg"], ["Violin", "violin-3d.jpg"], ["Whale", "whale-3d.jpg"],
    ["Xylophone", "xylophone-3d.jpg"], ["Yo-yo", "yo-yo-3d.jpg"], ["Zebra", "zebra-3d.jpg"]
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

  function shuffle(list) {
    var a = list.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

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

  function pic(file, label) {
    return '<figure class="named"><img class="target-pic" src="img/words/' + file + '" alt="' + label + '"><figcaption>' + label + '</figcaption></figure>';
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
      '<h1>You found every picture!</h1><p class="lead">' + review + '</p>' +
      '<p><a class="btn btn-play" href="picture.html">Play again</a></p></div>';
  }

  function render() {
    if (round >= items.length) { showDone(); return; }
    var target = items[round];
    currentName = target[0];
    var others = shuffle(items.filter(function (it) { return it !== target; })).slice(0, 2);
    var choices = shuffle([target].concat(others));
    correctAt = choices.indexOf(target);
    locked = false;
    paintStatus(items.length);
    board.innerHTML =
      '<p class="fine">Picture ' + (round + 1) + ' of 26</p>' +
      pic(target[1], target[0]) +
      '<h1>Find the same picture!</h1>' +
      '<div class="choice-row">' + choices.map(function (it, i) {
        return '<button type="button" data-i="' + i + '">' + pic(it[1], it[0]) + '</button>';
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
      paintStatus(items.length);
      button.classList.add("ok");
      msg.className = "play-msg good";
      msg.textContent = "Great job! +1 star";
      setTimeout(function () { round += 1; render(); }, 900);
    } else {
      locked = true;
      missed += 1;
      stars = Math.max(0, stars - 1);
      streak = 0;
      paintStatus(items.length);
      button.classList.add("bad");
      msg.className = "play-msg again";
      msg.textContent = "−1 mark";
      if (window.DsmeSound) DsmeSound.say("Wrong. Minus one mark.");
      setTimeout(function () { round += 1; render(); }, 800);
    }
  });

  document.getElementById("music-btn").addEventListener("click", function () {
    if (window.DsmeSound) DsmeSound.toggleMusic();
    paintStatus(items.length);
  });
  document.getElementById("voice-btn").addEventListener("click", function () {
    if (window.DsmeSound) DsmeSound.toggleVoice();
    paintStatus(items.length);
  });
  render();
})();
