(function () {
  "use strict";
  var items = [
    ["Apple", "apple.svg"], ["Ball", "ball.svg"], ["Cat", "cat.svg"], ["Dolphin", "dolphin.svg"],
    ["Elephant", "elephant.svg"], ["Fish", "fish.svg"], ["Grapes", "grapes.svg"], ["House", "house.svg"],
    ["Ice cream", "ice-cream.svg"], ["Juice", "juice.svg"], ["Kite", "kite.svg"], ["Lion", "lion.svg"],
    ["Moon", "moon.svg"], ["Nest", "nest.svg"], ["Orange", "orange.svg"], ["Penguin", "penguin.svg"],
    ["Queen", "queen.svg"], ["Rainbow", "rainbow.svg"], ["Sun", "sun.svg"], ["Tiger", "tiger.svg"],
    ["Umbrella", "umbrella.svg"], ["Violin", "violin.svg"], ["Whale", "whale.svg"],
    ["Xylophone", "xylophone.svg"], ["Yo-yo", "yo-yo.svg"], ["Zebra", "zebra.svg"]
  ];
  var board = document.getElementById("board");
  var starsEl = document.getElementById("stars");
  var song = new Audio("audio/abc_song_full.wav");
  song.loop = true;
  song.volume = 0.38;
  song.playbackRate = 0.7;
  song.preservesPitch = true;
  function startMusic() {
    song.playbackRate = 0.7;
    song.play().catch(function () {});
  }
  document.addEventListener("pointerdown", startMusic);
  startMusic();
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
