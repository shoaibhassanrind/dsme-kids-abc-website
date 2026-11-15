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

  function showDone() {
    board.innerHTML = '<h1>You found the shapes!</h1><p class="lead">' + stars + ' of ' + shapes.length + ' stars</p>' +
      '<p><a class="btn btn-shape" href="shapes.html">Play again</a></p>';
  }

  function render() {
    if (round >= shapes.length) { showDone(); return; }
    var target = shapes[round];
    var others = shuffle(shapes.filter(function (it) { return it !== target; })).slice(0, 2);
    var choices = shuffle([target].concat(others));
    correctAt = choices.indexOf(target);
    wrong = 0;
    locked = false;
    starsEl.textContent = "★ " + stars;
    board.innerHTML =
      '<p class="fine">Shape ' + (round + 1) + ' of ' + shapes.length + '</p>' +
      icon(target) +
      '<h1>Find the same shape!</h1>' +
      '<div class="choice-row">' + choices.map(function (it, i) {
        return '<button type="button" data-i="' + i + '" aria-label="' + it[0] + '">' + icon(it) + '</button>';
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
      if (wrong >= 2) board.querySelector('button[data-i="' + correctAt + '"]').classList.add("hint");
    }
  });

  render();
})();
