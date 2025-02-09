let isPlaying = false;
let beatIndex = 0;
let bpm = 100;
let arm = document.getElementById("arm");

let beatPattern = {
  kick: [
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0,
  ],
  snare: [
    0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    0, 0, 0, 0, 0, 0, 0,
  ],
  hiHat: [
    1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1,
    0, 0, 0, 1, 0, 0, 0,
  ],
};

function startMetronome() {
  if (isPlaying) return;
  isPlaying = true;
  bpm = parseInt(document.getElementById("bpm").value);
  let interval = ((60 / bpm) * 1000) / 128; // Time per 1/128th step
  let lastStepTime = performance.now();
  let stepIndex = 0;

  function tick() {
    if (!isPlaying) return;

    let now = performance.now();
    let elapsed = now - lastStepTime;

    // Advance step when the interval time has passed
    if (elapsed >= interval) {
      lastStepTime = now - (elapsed % interval); // Adjust for drift
      stepIndex = (stepIndex + 1) % 128; // Loop back after 128 steps
    }

    let angle = (stepIndex / 128) * 360;
    arm.style.transform = `translate(-50%, -100%) rotate(${angle}deg)`;

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

function stopMetronome() {
  isPlaying = false;
}

// Create the checkbox grid
function createBeatGrid() {
  let grid = document.getElementById("beat-grid");
  grid.innerHTML = "";

  for (let i = 0; i < 32; i++) {
    ["kick", "snare", "hiHat"].forEach((type) => {
      let checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = beatPattern[type][i] === 1;
      checkbox.addEventListener("change", () => {
        beatPattern[type][i] = checkbox.checked ? 1 : 0;
        updateClockBeats();
      });
      grid.appendChild(checkbox);
    });
  }
}

// Update clock beats based on JSON
function updateClockBeats() {
  document
    .querySelectorAll(".beat-dot")
    .forEach((dot) => (dot.style.display = "none"));
  ["kick", "snare", "hiHat"].forEach((type, ring) => {
    beatPattern[type].forEach((on, i) => {
      let dot = document.querySelector(`.${type}[data-index="${i}"]`);
      if (dot) dot.style.display = on ? "block" : "none";
    });
  });
}

// Initialize the editor and clock
createBeatGrid();

function positionDots() {
  document.querySelectorAll(".beat-dot").forEach((dot) => {
    let i = parseInt(dot.dataset.index);
    let ring = ["kick", "snare", "hiHat"].indexOf(dot.classList[1]);
    let angle = (i / 32) * 360 - 90; // Start at 12 o'clock

    dot.style.left = `${
      50 + (10 + ring * 2 + 35) * Math.cos((angle * Math.PI) / 180)
    }%`;
    dot.style.top = `${
      50 + (10 + ring * 2 + 35) * Math.sin((angle * Math.PI) / 180)
    }%`;
  });
}

window.onload = () => {
  positionDots();
  updateClockBeats();
};
