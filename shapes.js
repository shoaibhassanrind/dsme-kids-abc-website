(function () {
  "use strict";
  var shapes = [
    ["Circle", "#3DA5F5", '<circle cx="60" cy="60" r="36"/>'],
    ["Square", "#F07D1A", '<rect x="24" y="24" width="72" height="72" rx="8"/>'],
    ["Triangle", "#2FB67C", '<polygon points="60,18 104,102 16,102"/>'],
    ["Star", "#E2A400", '<polygon points="60,14 72,46 106,46 78,66 90,100 60,78 30,100 42,66 14,46 48,46"/>'],
    ["Heart", "#E24B6A", '<path d="M60 98 C20 66 18 36 40 32 C50 30 58 40 60 48 C62 40 70 30 80 32 C102 36 100 66 60 98Z"/>'],
    ["Diamond", "#8B6CF0", '<polygon points="60,16 104,60 60,104 16,60"/>'],
    ["Oval", "#1F7AE0", '<ellipse cx="60" cy="60" rx="40" ry="26"/>'],
    ["Rectangle", "#C9843A", '<rect x="16" y="34" width="88" height="52" rx="8"/>']
  ];
  var board = document.getElementById("board");
  var starsEl = document.getElementById("stars");
  var round = 0;
  var stars = 0;
  var wrong = 0;
  var locked = false;
  var correctAt = 0;

  function icon(shape) {
    return '<svg class="shape-svg" viewBox="0 0 120 120" aria-label="' + shape[0] + '"><g fill="' + shape[1] + '">' + shape[2] + '</g></svg>';
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
