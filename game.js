/* DSME Kids ABC Adventure — the full Recognize and Select game, in the browser. */
(function () {
  "use strict";

  const LETTERS = [
    ["A", "Apple", "letter_a_apple.webp"],
    ["B", "Ball", "letter_b_ball.webp"],
    ["C", "Cat", "letter_c_cat.webp"],
    ["D", "Dolphin", "letter_d_dolphin.webp"],
    ["E", "Elephant", "letter_e_elephant.webp"],
    ["F", "Fish", "letter_f_fish.webp"],
    ["G", "Grapes", "letter_g_grapes.webp"],
    ["H", "House", "letter_h_house.webp"],
    ["I", "Ice cream", "letter_i_ice_cream.webp"],
    ["J", "Juice", "letter_j_juice.webp"],
    ["K", "Kite", "letter_k_kite.webp"],
    ["L", "Lion", "letter_l_lion.webp"],
    ["M", "Moon", "letter_m_moon.webp"],
    ["N", "Nest", "letter_n_nest.webp"],
    ["O", "Orange", "letter_o_orange.webp"],
    ["P", "Penguin", "letter_p_penguin.webp"],
    ["Q", "Queen", "letter_q_queen.webp"],
    ["R", "Rainbow", "letter_r_rainbow.webp"],
    ["S", "Sun", "letter_s_sun.webp"],
    ["T", "Tiger", "letter_t_tiger.webp"],
    ["U", "Umbrella", "letter_u_umbrella.webp"],
    ["V", "Violin", "letter_v_violin.webp"],
    ["W", "Whale", "letter_w_whale.webp"],
    ["X", "Xylophone", "letter_x_xylophone.webp"],
    ["Y", "Yo-yo", "letter_y_yo_yo.webp"],
    ["Z", "Zebra", "letter_z_zebra.webp"],
  ].map(function (row) {
    return { upper: row[0], lower: row[0].toLowerCase(), word: row[1], file: row[2] };
  });

  const PRAISE = ["Great job!", "Amazing!", "Well done!", "Super!", "You found it!"];
  const STORE_KEY = "dsme-abc-progress-v1";
  const SOUND_KEY = "dsme-abc-sound";
  const MUSIC_KEY = "dsme-abc-music";
  const HINT_AFTER = 2;
  const ADVANCE_MS = 2500;

  const root = document.getElementById("game");
  let progress = loadProgress();
  let soundOn = localStorage.getItem(SOUND_KEY) !== "0";
  let musicOn = localStorage.getItem(MUSIC_KEY) !== "0";
  const MUSIC_RATE = 0.7;
  const MUSIC_VOL = 0.38;
  const song = new Audio("audio/abc_song_full.wav");
  song.loop = true;
  song.volume = MUSIC_VOL;
  song.playbackRate = MUSIC_RATE;
  song.preservesPitch = true;
  const sfxCorrect = new Audio("audio/sfx_correct.wav");
  const sfxWrong = new Audio("audio/sfx_try_again.wav");
  const sfxFanfare = new Audio("audio/sfx_fanfare.wav");
  sfxCorrect.volume = 0.22;
  sfxWrong.volume = 0.18;
  sfxFanfare.volume = 0.28;
  let speakToken = 0;
  let female = null;
  let screen = progress.letterIndex >= LETTERS.length ? "done" : "welcome";
  let question = null;
  let phase = "answering";
  let wrongTaps = 0;
  let tappedWrong = {};
  let feedback = null;
  let wiggle = -1;
  let advanceTimer = null;
  let finished = null;

  function emptyProgress() {
    return {
      letterIndex: 0,
      stars: 0,
      streak: 0,
      bestStreak: 0,
      results: LETTERS.map(function () { return "none"; }),
    };
  }

  function loadProgress() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
      if (!raw || !Array.isArray(raw.results) || raw.results.length !== 26) return emptyProgress();
      raw.letterIndex = clamp(raw.letterIndex | 0, 0, 26);
      raw.stars = clamp(raw.stars | 0, 0, 26);
      raw.streak = Math.max(0, raw.streak | 0);
      raw.bestStreak = Math.max(0, raw.bestStreak | 0);
      return raw;
    } catch (e) {
      return emptyProgress();
    }
  }

  function saveProgress() {
    localStorage.setItem(STORE_KEY, JSON.stringify(progress));
  }

  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }

  function img(letter) {
    return "img/letters/" + letter.file;
  }

  function buildQuestion(correctIndex) {
    const others = [];
    for (let i = 0; i < LETTERS.length; i++) if (i !== correctIndex) others.push(i);
    for (let i = others.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = others[i]; others[i] = others[j]; others[j] = tmp;
    }
    const position = Math.floor(Math.random() * 3);
    const choices = [];
    let w = 0;
    for (let i = 0; i < 3; i++) choices.push(i === position ? correctIndex : others[w++]);
    return { choices: choices, correctPosition: position };
  }

  function playClip(clip) {
    if (!soundOn) return;
    clip.currentTime = 0;
    clip.play().catch(function () {});
  }

  function playCorrect() { playClip(sfxCorrect); }
  function playWrong() { playClip(sfxWrong); }

  function phrase(letter) {
    return letter.upper + ". " + letter.upper + " for " + letter.word + ".";
  }

  function tuneMusic() {
    song.playbackRate = MUSIC_RATE;
    song.preservesPitch = true;
    song.volume = MUSIC_VOL;
  }

  function resumeMusic() {
    if (!musicOn) return;
    tuneMusic();
    song.play().catch(function () {});
  }

  function pauseMusic() { song.pause(); }

  function femaleVoice() {
    if (!window.speechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return female;
    const english = voices.filter(function (v) { return /^en/i.test(v.lang); });
    const pool = english.length ? english : voices;
    const prefer = /zira|samantha|victoria|karen|moira|fiona|hazel|susan|aria|jenny|libby|sonia|natasha|female/i;
    const male = /male|david|mark|guy|daniel|ravi|george|alex/i;
    female = pool.find(function (v) { return prefer.test(v.name) && !male.test(v.name); })
      || pool.find(function (v) { return !male.test(v.name); })
      || null;
    return female;
  }

  if (window.speechSynthesis) {
    window.speechSynthesis.addEventListener("voiceschanged", function () { femaleVoice(); });
    femaleVoice();
  }

  /** Letter voice sits inside the slow music. The song keeps playing. */
  function speak(text) {
    if (!soundOn || !window.speechSynthesis) return;
    const token = ++speakToken;
    const ducked = musicOn && !song.paused;
    if (ducked) song.volume = 0.16;
    window.speechSynthesis.cancel();
    window.setTimeout(function () {
      if (token !== speakToken) return;
      const utter = new SpeechSynthesisUtterance(text);
      const voice = femaleVoice();
      if (voice) utter.voice = voice;
      utter.lang = "en-US";
      utter.rate = 0.9;
      utter.pitch = 1.18;
      function restore() {
        if (token !== speakToken) return;
        if (musicOn && !song.paused) song.volume = MUSIC_VOL;
      }
      utter.onend = restore;
      utter.onerror = restore;
      window.speechSynthesis.speak(utter);
    }, 60);
  }

  function badgeName(stars) {
    if (!stars) return "";
    return stars + " Star Badge";
  }

  function stopSpeech() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  }

  function lettersDone() {
    return progress.results.filter(function (r) { return r !== "none"; }).length;
  }

  function openLetter() {
    clearTimeout(advanceTimer);
    if (progress.letterIndex >= LETTERS.length) {
      finished = { stars: progress.stars, bestStreak: progress.bestStreak };
      screen = "done";
      question = null;
      feedback = null;
      localStorage.removeItem(STORE_KEY);
      progress = emptyProgress();
      render();
      playClip(sfxFanfare);
      if (finished.stars > 0) speak("You earned the " + badgeName(finished.stars) + "!");
      return;
    }
    screen = "play";
    question = buildQuestion(progress.letterIndex);
    phase = "answering";
    wrongTaps = 0;
    tappedWrong = {};
    feedback = null;
    wiggle = -1;
    render();
    speak(phrase(LETTERS[progress.letterIndex]));
  }

  function onCorrect() {
    const index = progress.letterIndex;
    const starAwarded = progress.results[index] !== "star";
    const results = progress.results.slice();
    results[index] = "star";
    const streak = progress.streak + 1;
    progress = {
      letterIndex: index,
      stars: starAwarded ? Math.min(26, progress.stars + 1) : progress.stars,
      streak: streak,
      bestStreak: Math.max(progress.bestStreak, streak),
      results: results,
    };
    const saved = Object.assign({}, progress, { letterIndex: index + 1 });
    localStorage.setItem(STORE_KEY, JSON.stringify(saved));
    phase = "correct";
    const badge = badgeName(progress.stars);
    feedback = {
      kind: "praise",
      text: PRAISE[Math.floor(Math.random() * PRAISE.length)],
      star: starAwarded,
      badge: starAwarded ? badge : "",
    };
    wiggle = -1;
    playCorrect();
    if (starAwarded) speak("Great job! " + badge + ".");
    render();
    advanceTimer = setTimeout(function () {
      progress = Object.assign({}, progress, { letterIndex: index + 1 });
      openLetter();
    }, ADVANCE_MS);
  }

  function onWrong(position) {
    progress = {
      letterIndex: progress.letterIndex,
      stars: progress.stars,
      streak: 0,
      bestStreak: progress.bestStreak,
      results: progress.results.slice(),
    };
    saveProgress();
    tappedWrong[position] = true;
    wrongTaps += 1;
    wiggle = position;
    feedback = { kind: "again" };
    playWrong();
    render();
    setTimeout(function () {
      if (wiggle === position) { wiggle = -1; render(); }
    }, 450);
  }

  function onSkip() {
    if (phase !== "answering") return;
    clearTimeout(advanceTimer);
    stopSpeech();
    const results = progress.results.slice();
    if (results[progress.letterIndex] !== "star") results[progress.letterIndex] = "skip";
    progress = {
      letterIndex: progress.letterIndex + 1,
      stars: progress.stars,
      streak: 0,
      bestStreak: progress.bestStreak,
      results: results,
    };
    saveProgress();
    openLetter();
  }

  function startNew() {
    clearTimeout(advanceTimer);
    stopSpeech();
    progress = emptyProgress();
    saveProgress();
    resumeMusic();
    openLetter();
  }

  function goHome() {
    clearTimeout(advanceTimer);
    stopSpeech();
    screen = progress.letterIndex >= LETTERS.length ? "done" : "welcome";
    render();
  }

  function toggleSound() {
    soundOn = !soundOn;
    localStorage.setItem(SOUND_KEY, soundOn ? "1" : "0");
    if (!soundOn) stopSpeech();
    render();
  }

  function toggleMusic() {
    musicOn = !musicOn;
    localStorage.setItem(MUSIC_KEY, musicOn ? "1" : "0");
    if (musicOn) resumeMusic();
    else pauseMusic();
    render();
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function picture(letter, alt) {
    return '<img src="' + img(letter) + '" alt="' + esc(alt || letter.word) + '" width="160" height="160">';
  }

  function renderWelcome() {
    const mid = progress.letterIndex > 0 && progress.letterIndex < LETTERS.length;
    const letter = mid ? LETTERS[progress.letterIndex] : null;
    return (
      '<section class="play-welcome">' +
        '<img class="play-logo" src="img/dsme_logo.webp" alt="Dawn School of Modern Education logo" width="120" height="98">' +
        '<p class="eyebrow school-name">Dawn School of Modern Education</p>' +
        '<h1>DSME Kids ABC Adventure</h1>' +
        '<p class="lead">Find the same picture for every letter, A to Z. Earn a star each time.</p>' +
        '<div class="play-actions">' +
          (mid
            ? '<button type="button" class="btn btn-primary" data-act="continue">Continue (Letter ' + letter.upper + ')</button>' +
              '<button type="button" class="btn btn-ghost" data-act="new">New game</button>'
            : '<button type="button" class="btn btn-primary" data-act="new">Start adventure</button>') +
          '<button type="button" class="btn btn-ghost" data-act="music">' + (musicOn ? "Music on" : "Music off") + '</button>' +
          '<button type="button" class="btn btn-ghost" data-act="sound">' + (soundOn ? "Sound on" : "Sound off") + '</button>' +
        '</div>' +
      '</section>'
    );
  }

  function renderPlay() {
    const letter = LETTERS[progress.letterIndex];
    const hint = wrongTaps >= HINT_AFTER && phase === "answering";
    const cards = question.choices.map(function (letterIndex, position) {
      const choice = LETTERS[letterIndex];
      let state = "normal";
      if (phase === "correct" && position === question.correctPosition) state = "correct";
      else if (tappedWrong[position]) state = "wrong";
      else if (hint && position === question.correctPosition) state = "hint";
      const wiggleClass = wiggle === position ? " wiggle" : "";
      const locked = phase !== "answering" ? " disabled" : "";
      return (
        '<button type="button" class="choice ' + state + wiggleClass + '" data-act="choice" data-pos="' + position + '" aria-label="' + esc(choice.word) + '"' + locked + '>' +
          picture(choice, choice.word + " picture") +
        '</button>'
      );
    }).join("");

    let message = "";
    if (feedback && feedback.kind === "praise") {
      message = '<p class="msg msg-good">' + esc(feedback.text) +
        (feedback.star ? " +1 star" : "") +
        (feedback.badge ? " · " + esc(feedback.badge) : "") + '</p>';
    } else if (feedback && feedback.kind === "again") {
      message = '<p class="msg msg-again">Try again!</p>';
    }

    const done = lettersDone();
    const pct = Math.round((done / 26) * 100);

    return (
      '<section class="play-board">' +
        '<div class="play-top">' +
          '<button type="button" class="icon-btn" data-act="home" aria-label="Home">Home</button>' +
          '<div class="play-stats"><span>★ ' + progress.stars + '</span>' +
            (progress.stars ? '<span class="badge-chip">' + esc(badgeName(progress.stars)) + '</span>' : '') +
            '<span>Streak ' + progress.streak + '</span></div>' +
          '<button type="button" class="icon-btn" data-act="music">' + (musicOn ? "Music on" : "Music off") + '</button>' +
          '<button type="button" class="icon-btn" data-act="sound">' + (soundOn ? "Phonics on" : "Phonics off") + '</button>' +
        '</div>' +
        '<div class="track" aria-hidden="true"><span style="width:' + pct + '%"></span></div>' +
        '<p class="fine">Letter ' + (progress.letterIndex + 1) + ' of 26</p>' +
        '<article class="learn-card">' +
          '<div class="learn-row">' +
            '<p class="big-letter"><b>' + letter.upper + '</b><em>' + letter.lower + '</em></p>' +
            picture(letter, letter.word + " picture") +
          '</div>' +
          '<h2 class="word">' + esc(letter.word) + '</h2>' +
          '<p class="phonic">' + letter.upper + '. ' + letter.upper + ' for ' + esc(letter.word) + '.</p>' +
          '<button type="button" class="btn btn-ghost" data-act="hear">Hear phonics</button>' +
        '</article>' +
        '<p class="prompt">Find the same picture!</p>' +
        '<div class="choices">' + cards + '</div>' +
        message +
        '<div class="skip-row"><button type="button" class="skip" data-act="skip"' + (phase !== "answering" ? " disabled" : "") + '>Skip →</button></div>' +
      '</section>'
    );
  }

  function renderDone() {
    const stars = finished ? finished.stars : 0;
    const badge = badgeName(stars);
    const full = stars === 26;
    return (
      '<section class="play-welcome">' +
        (badge
          ? '<div class="badge-award' + (full ? " badge-full" : "") + '">' +
              '<span class="badge-count">★ ' + stars + '</span>' +
              '<strong>' + esc(badge) + '</strong>' +
              '<p>' + (full ? "Every letter was correct." : stars + " of 26 stars") + '</p>' +
            '</div>'
          : '<p class="trophy" aria-hidden="true">★</p><p class="lead">No badge yet. Each right answer earns one star.</p>') +
        '<h1>' + (full ? "You are an ABC Superstar!" : "A to Z complete") + '</h1>' +
        '<p class="lead">Best streak ' + (finished ? finished.bestStreak : 0) + '</p>' +
        '<div class="play-actions">' +
          '<button type="button" class="btn btn-primary" data-act="new">Play again</button>' +
          '<button type="button" class="btn btn-ghost" data-act="home">Home</button>' +
        '</div>' +
      '</section>'
    );
  }

  function render() {
    if (screen === "play" && question) root.innerHTML = renderPlay();
    else if (screen === "done") root.innerHTML = renderDone();
    else root.innerHTML = renderWelcome();
  }

  root.addEventListener("click", function (event) {
    const target = event.target.closest("[data-act]");
    if (!target || target.disabled) return;
    const act = target.getAttribute("data-act");
    if (act === "new") startNew();
    else if (act === "continue") { resumeMusic(); openLetter(); }
    else if (act === "home") {
      screen = "welcome";
      goHome();
    }     else if (act === "sound") toggleSound();
    else if (act === "music") toggleMusic();
    else if (act === "hear") {
      const letter = LETTERS[progress.letterIndex];
      if (letter) speak(phrase(letter));
    } else if (act === "skip") onSkip();
    else if (act === "choice") {
      if (phase !== "answering" || !question) return;
      const pos = Number(target.getAttribute("data-pos"));
      if (pos === question.correctPosition) onCorrect();
      else onWrong(pos);
    }
  });

  render();
})();
