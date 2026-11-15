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
  var song = new Audio("audio/abc_song_full.wav");
  song.loop = true;
  song.volume = 0.55;
  song.playbackRate = 0.7;
  song.preservesPitch = true;
  var currentName = "";
  var voiceReady = false;
  function femaleVoice() {
    if (!window.speechSynthesis) return null;
    var voices = window.speechSynthesis.getVoices();
    var english = voices.filter(function (v) { return /^en/i.test(v.lang); });
    var pool = english.length ? english : voices;
    var prefer = /zira|samantha|victoria|karen|moira|fiona|hazel|susan|aria|jenny|libby|sonia|natasha|female/i;
    var male = /male|david|mark|guy|daniel|ravi|george/i;
    return pool.filter(function (v) { return prefer.test(v.name) && !male.test(v.name); })[0]
      || pool.filter(function (v) { return !male.test(v.name); })[0]
      || null;
  }
  if (window.speechSynthesis) window.speechSynthesis.addEventListener("voiceschanged", femaleVoice);
  function speak(text) {
    if (!text || !window.speechSynthesis) return;
    if (!song.paused) song.volume = 0.16;
    window.speechSynthesis.cancel();
    var utter = new SpeechSynthesisUtterance(text);
    var voice = femaleVoice();
    if (voice) utter.voice = voice;
    utter.lang = "en-US";
    utter.rate = 0.9;
    utter.pitch = 1.15;
    function restore() { if (!song.paused) song.volume = 0.55; }
    utter.onend = restore;
    utter.onerror = restore;
    window.speechSynthesis.speak(utter);
  }
  function startMusic() {
    song.volume = 0.55;
    song.playbackRate = 0.7;
    song.play().catch(function () {});
  }
  document.addEventListener("pointerdown", function () {
    startMusic();
    if (!voiceReady) {
      voiceReady = true;
      speak(currentName);
    }
  });
  var round = 0;
  var stars = 0;
  var wrong = 0;
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

  function pic(file, label) {
    return '<figure class="named"><img class="target-pic" src="img/words/' + file + '" alt="' + label + '"><figcaption>' + label + '</figcaption></figure>';
  }

  function showDone() {
    board.innerHTML = '<h1>You found them!</h1><p class="lead">' + stars + ' of 26 stars</p>' +
      '<p><a class="btn btn-play" href="picture.html">Play again</a></p>';
  }

  function render() {
    if (round >= items.length) { showDone(); return; }
    var target = items[round];
    currentName = target[0];
    var others = shuffle(items.filter(function (it) { return it !== target; })).slice(0, 2);
    var choices = shuffle([target].concat(others));
    correctAt = choices.indexOf(target);
    wrong = 0;
    locked = false;
    starsEl.textContent = "★ " + stars;
    board.innerHTML =
      '<p class="fine">Picture ' + (round + 1) + ' of 26</p>' +
      pic(target[1], target[0]) +
      '<h1>Find the same picture!</h1>' +
      '<div class="choice-row">' + choices.map(function (it, i) {
        return '<button type="button" data-i="' + i + '">' + pic(it[1], it[0]) + '</button>';
      }).join("") + '</div><p id="msg"></p>';
    if (voiceReady) speak(currentName);
  }

  board.addEventListener("click", function (event) {
    var button = event.target.closest("button[data-i]");
    if (!button || locked) return;
    var i = Number(button.getAttribute("data-i"));
    var msg = document.getElementById("msg");
    if (i === correctAt) {
      locked = true;
      stars += 1;
      starsEl.textContent = "★ " + stars;
      button.classList.add("ok");
      msg.className = "play-msg good";
      msg.textContent = "Great job! +1 star";
      setTimeout(function () { round += 1; render(); }, 900);
    } else {
      wrong += 1;
      button.classList.add("bad");
      msg.className = "play-msg again";
      msg.textContent = "Try again!";
      if (wrong >= 2) {
        board.querySelector('button[data-i="' + correctAt + '"]').classList.add("hint");
      }
    }
  });

  render();
})();
