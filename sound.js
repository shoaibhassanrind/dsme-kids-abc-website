/* Music and voice for the letter, picture, and shape games.
   The browser only allows sound inside a real tap, so play() and speak()
   run in that tap. They are not delayed and not cancelled first. */
(function () {
  "use strict";
  var song = document.getElementById("dsme-song");
  if (!song) {
    song = document.createElement("audio");
    song.id = "dsme-song";
    song.src = "audio/abc_song_full.wav";
    song.loop = true;
    song.preload = "auto";
    song.setAttribute("playsinline", "");
    document.body.appendChild(song);
  }
  song.volume = 0.9;
  var voiceOn = true;
  var musicOn = true;
  var line = "";
  var heard = false;

  function female() {
    if (!window.speechSynthesis) return null;
    var voices = window.speechSynthesis.getVoices();
    var english = voices.filter(function (v) { return /^en/i.test(v.lang); });
    var pool = english.length ? english : voices;
    var prefer = /zira|samantha|victoria|karen|moira|fiona|hazel|susan|aria|jenny|libby|sonia|natasha|female/i;
    var male = /david|mark|guy|daniel|ravi|george|alex|male/i;
    return pool.filter(function (v) { return prefer.test(v.name) && !male.test(v.name); })[0]
      || pool.filter(function (v) { return !male.test(v.name); })[0]
      || pool[0]
      || null;
  }

  function playSong() {
    if (!musicOn) return;
    song.volume = 0.9;
    var started = song.play();
    if (started && started.then) {
      started.then(function () {
        try { song.playbackRate = 0.85; song.preservesPitch = true; } catch (e) {}
      }).catch(function () {});
    }
  }

  function androidVoice() {
    return window.DsmeAndroid && typeof DsmeAndroid.speak === "function";
  }

  function speakNow(text) {
    if (!voiceOn || !text) return;
    if (androidVoice()) {
      heard = true;
      DsmeAndroid.speak(text);
      return;
    }
    if (!window.speechSynthesis) return;
    var active = !navigator.userActivation || navigator.userActivation.isActive || heard;
    if (!active) return;
    var synth = window.speechSynthesis;
    var utter = new SpeechSynthesisUtterance(text);
    var picked = female();
    if (picked) utter.voice = picked;
    utter.lang = "en-US";
    utter.rate = 0.9;
    utter.pitch = 1.08;
    utter.volume = 1;
    synth.resume();
    if (!heard) {
      heard = true;
      synth.speak(utter);
      return;
    }
    synth.cancel();
    window.setTimeout(function () {
      synth.resume();
      synth.speak(utter);
    }, 70);
  }

  document.addEventListener("pointerdown", function () {
    playSong();
    if (line) speakNow(line);
  }, true);

  if (window.speechSynthesis) {
    window.speechSynthesis.addEventListener("voiceschanged", female);
  }

  window.DsmeSound = {
    say: function (text) { line = text || ""; speakNow(line); },
    music: function () { musicOn = true; playSong(); },
    stopMusic: function () { musicOn = false; song.pause(); },
    toggleMusic: function () {
      musicOn = !musicOn;
      if (musicOn) playSong();
      else song.pause();
      return musicOn;
    },
    toggleVoice: function () {
      voiceOn = !voiceOn;
      if (!voiceOn) {
        if (androidVoice()) DsmeAndroid.stop();
        else if (window.speechSynthesis) window.speechSynthesis.cancel();
      }
      return voiceOn;
    },
    musicOn: function () { return musicOn; },
    voiceOn: function () { return voiceOn; },
    hush: function () {
      line = "";
      if (androidVoice()) DsmeAndroid.stop();
      else if (window.speechSynthesis) window.speechSynthesis.cancel();
    },
    playing: function () { return !song.paused; }
  };
})();
