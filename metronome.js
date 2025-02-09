class Metronome {
  constructor(tempo = 120) {
    this.audioContext = null;
    this.notesInQueue = [];
    this.currentBeatInBar = 0;
    this.beatsPerBar = 4;
    this.tempo = tempo;
    this.lookahead = 25;
    this.scheduleAheadTime = 0.1;
    this.nextNoteTime = 0.0;
    this.isRunning = false;
    this.intervalID = null;
    this.counter = 0;
    this.subdivision = 64;
  }

  nextNote() {
    var secondsPerBeat = 60.0 / this.tempo;
    var secondsPerSubdivision = secondsPerBeat / this.subdivision;
    this.nextNoteTime += secondsPerSubdivision; // Increment by subdivision time

    this.counter++;
    if (this.counter > this.beatsPerBar * this.subdivision) {
      this.counter = 1;
    }
  }

  scheduleNote(time) {
    // Removed beatNumber parameter
    this.notesInQueue.push({ note: this.counter, time: time }); // Store counter value

    if (this.counter % this.subdivision === 0) {
      // Play sound only on crotchets
      const osc = this.audioContext.createOscillator();
      const envelope = this.audioContext.createGain();

      osc.frequency.value =
        this.counter % (this.subdivision * this.beatsPerBar) === 0 ? 1000 : 800; // Distinguish first beat
      envelope.gain.value = 1;
      envelope.gain.exponentialRampToValueAtTime(1, time + 0.001);
      envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.02);

      osc.connect(envelope);
      envelope.connect(this.audioContext.destination);

      osc.start(time);
      osc.stop(time + 0.03);
    }
  }

  scheduler() {
    while (
      this.nextNoteTime <
      this.audioContext.currentTime + this.scheduleAheadTime
    ) {
      this.scheduleNote(this.nextNoteTime); // Pass only the time
      this.nextNote();
      const index = (this.counter + 1) / 8 - 1;
      this.applyGrowEffect(index);
    }
  }

  start() {
    if (this.isRunning) return;

    if (this.audioContext == null) {
      this.audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
    }

    this.isRunning = true;

    this.currentBeatInBar = 0;
    this.nextNoteTime = this.audioContext.currentTime + 0.05;

    this.intervalID = setInterval(() => this.scheduler(), this.lookahead);
  }

  stop() {
    this.isRunning = false;
    clearInterval(this.intervalID);
    this.counter = 0; // Reset the counter
    this.currentBeatInBar = 0; // Reset the beat in bar
    this.notesInQueue = []; // Clear the notes queue
    this.nextNoteTime = 0.0; // Reset the next note time
    this.audioContext = null; // Reset the audio context
  }

  startStop() {
    if (this.isRunning) {
      this.stop();
    } else {
      this.start();
    }
  }

  applyGrowEffect(currentBeat) {
    if (currentBeat >= 0) {
      // Check for valid beat index
      const beatDots = document.querySelectorAll(
        `.beat-dot[data-index="${currentBeat}"]`
      );
      beatDots.forEach((dot) => {
        if (dot && dot.style.display === "block") {
          // Check if element exists and is visible
          dot.classList.add("grow");
          setTimeout(() => {
            dot.classList.remove("grow");
          }, 150);
        }
      });
    }
  }
}

export { Metronome };
