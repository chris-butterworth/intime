import { Clock } from "./clock.js";

const clock = new Clock(); // Create the Clock instance

// Play/pause button
const playButton = document.getElementById("play-button");
const playPauseIcon = document.getElementById("play-pause-icon");

playButton.addEventListener("click", () => {
  if (clock.isPlaying) {
    clock.stop();
    playPauseIcon.className = "play";
  } else {
    clock.start();
    playPauseIcon.className = "pause";
  }
});

// Tempo change buttons
const tempoChangeButtons = document.getElementsByClassName("tempo-change");
const tempo = document.getElementById("tempo");
const tempoSlider = document.getElementById("tempo-slider");

for (let i = 0; i < tempoChangeButtons.length; i++) {
  tempoChangeButtons[i].addEventListener("click", function () {
    clock.metronome.tempo += parseInt(this.dataset.change);
    tempo.textContent = clock.metronome.tempo;
    tempoSlider.value = clock.metronome.tempo;
  });
}

// Tempo slider
tempoSlider.addEventListener("input", function () {
  clock.metronome.tempo = parseInt(this.value);
  tempo.textContent = this.value;
});

function generateAndPositionBeatDots() {
  const beatsContainer = document.getElementById('beats');
  const numRings = 4; // Number of rings
  const clockRadius = 45; // Radius of the clock face
  const ringSpacing = clockRadius / numRings; // Calculate the spacing between rings

  const ringRadii = [];
  for (let i = 0; i < numRings; i++) {
    ringRadii.push(clockRadius - i * ringSpacing); // Calculate the radius of each ring
  }

  ["hiHat", "snare", "kick"].forEach((type, ring) => {
    for (let i = 0; i < 32; i++) {
      const beatDot = document.createElement('div');
      beatDot.className = `beat-dot ${type}`;
      beatDot.dataset.index = i;
      beatDot.dataset.ring = ring;

      const angle = (i / 32) * 360 - 90; // Calculate the angle for the dot
      const radius = ringRadii[ring]; // Get the radius of the ring

      const left = 48 + radius * Math.cos((angle * Math.PI) / 180) - beatDot.offsetWidth / 2;
      const top = 48 + radius * Math.sin((angle * Math.PI) / 180) - beatDot.offsetHeight / 2;

      beatDot.style.left = `${left}%`;
      beatDot.style.top = `${top}%`;

      beatsContainer.appendChild(beatDot);
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  generateAndPositionBeatDots();
  clock.beatGrid.updateClockBeats();
});
