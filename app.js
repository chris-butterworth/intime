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

for (let i = 0; i < tempoChangeButtons.length; i++) {
  tempoChangeButtons[i].addEventListener("click", function () {
    clock.metronome.tempo += parseInt(this.dataset.change);
    tempo.textContent = clock.metronome.tempo;
  });
}

function positionDots() {
  const beatDots = document.querySelectorAll(".beat-dot");
  const numRings = 4; // Number of rings
  const clockRadius = 45; // Radius of the clock face

  const ringSpacing = clockRadius / numRings; // Calculate the spacing between rings

  const ringRadii = [];
  for (let i = 0; i < numRings; i++) {
    ringRadii.push(clockRadius - i * ringSpacing); // Calculate the radius of each ring
  }

  beatDots.forEach((dot) => {
    const ring = parseInt(dot.dataset.ring); // Get the ring index from the data attribute
    const radius = ringRadii[ring]; // Get the radius of the ring

    const angle = (parseInt(dot.dataset.index) / 32) * 360 - 90; // Calculate the angle for the dot

    const left =
      48 + radius * Math.cos((angle * Math.PI) / 180) - dot.offsetWidth / 2;
    const top =
      48 + radius * Math.sin((angle * Math.PI) / 180) - dot.offsetHeight / 2;

    dot.style.left = `${left}%`;
    dot.style.top = `${top}%`;
  });
}


window.onload = () => {
  positionDots(); // Call after the dots are in the DOM
  clock.beatGrid.updateClockBeats();
};
