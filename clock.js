import { Metronome } from "./metronome.js"; // Assuming metronome.js is in the same directory

class ClockHand {
  constructor(element) {
    this.element = element;
    this.rotation = 0;
  }

  update(angle) {
    this.rotation = angle;
    this.element.style.transform = `translate(-50%, -100%) rotate(${this.rotation}deg)`;
  }
}

class BeatGrid {
  constructor(gridElement, beatPattern) {
    this.gridElement = gridElement;
    this.beatPattern = beatPattern;
    this.createGrid();
  }
  createGrid() {
    this.gridElement.innerHTML = "";

    // Create table element
    const table = document.createElement("table");
    table.classList.add("table");

    // Create table header
    const header = document.createElement("thead");
    const headerRow = header.insertRow();
    const emptyHeaderCell = headerRow.insertCell();
    emptyHeaderCell.textContent = "";
    ["Kick", "Snare", "Hi-hat"].forEach((type) => {
      const headerCell = headerRow.insertCell();
      headerCell.textContent = type;
    });
    table.appendChild(header);

    // Create table body
    const body = document.createElement("tbody");
    for (let i = 0; i < 32; i++) {
      const row = body.insertRow();
      const subdivisionCell = row.insertCell();
      subdivisionCell.textContent = this.getSubdivisionLabel(i); // Call getSubdivisionLabel
      subdivisionCell.style.textAlign = "right"; // Right align text
      subdivisionCell.style.fontWeight = "bold"; // Bold text
      ["kick", "snare", "hiHat"].forEach((type) => {
        const cell = row.insertCell();
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.style.width = "20px"; // Set width
        checkbox.style.height = "20px"; // Set height
        checkbox.checked = this.beatPattern[type][i] === 1;
        checkbox.addEventListener("change", () => {
          this.beatPattern[type][i] = checkbox.checked ? 1 : 0;
          this.updateClockBeats();
        });
        cell.appendChild(checkbox);
      });
    }
    table.appendChild(body);

    this.gridElement.appendChild(table);
  }

  getSubdivisionLabel(i) {
    if (i % 8 === 0) {
      return i / 8 + 1; // 1, 2, 3, 4
    } else if (i % 4 === 0) {
      return "and"; // and
    } else {
      return "-"; // -
    }
  }

  updateClockBeats() {
    document
      .querySelectorAll(".beat-dot")
      .forEach((dot) => (dot.style.display = "none"));
    ["kick", "snare", "hiHat"].forEach((type, ring) => {
      this.beatPattern[type].forEach((on, i) => {
        let dot = document.querySelector(`.${type}[data-index="${i}"]`);
        if (dot) dot.style.display = on ? "block" : "none";
      });
    });
  }
}

class Clock {
  constructor(tempo = 120) {
    this.metronome = new Metronome(tempo); // The Clock *has a* Metronome
    this.hand = new ClockHand(document.getElementById("arm"), this.metronome);
    this.beatGrid = new BeatGrid(document.getElementById("beat-grid"), {
      kick: [
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
      ],
      snare: [
        0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        1, 0, 0, 0, 0, 0, 0, 0,
      ],
      hiHat: [
        1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0,
        1, 0, 0, 0, 1, 0, 0, 0,
      ],
    });
    this.stepIndex = 0;
    this.isPlaying = false;
    this.lastStepTime = 0;
    this.tickTimeout = null;
    this.bpmInput = document.getElementById("tempo");

    this.bpmInput.addEventListener("input", () => {
      this.metronome.tempo = parseInt(this.bpmInput.value);
      console.log("BPM changed to:", this.metronome.tempo);
    });
  }

  start() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.metronome.start();

    const tick = () => {
      if (!this.isPlaying) return;

      let angle =
        (this.metronome.counter /
          (this.metronome.subdivision * this.metronome.beatsPerBar)) *
        360;
      this.hand.update(angle);

      this.tickTimeout = setTimeout(
        tick,
        60000 / this.metronome.tempo / this.metronome.subdivision
      );
    };

    tick();
  }

  stop() {
    this.isPlaying = false;
    clearTimeout(this.tickTimeout);
    this.hand.update(0); // Reset the hand position
    this.stepIndex = 0; // Reset the step index
    this.metronome.stop(); // Stop the metronome
    this.beatGrid.updateClockBeats(); // Reset beat grid
  }
}

export { Clock }; // Make sure to export the Clock class
