class Metronome {
  constructor(tempo = 100) {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.error('Web Audio API is not supported in this browser', e);
      alert('Web Audio API is not supported in this browser');
      return;
    }
    this.isPlaying = false;
    this.startTime; 
    this.currentNote; 
    this.tempo = tempo; 
    this.lookahead = 25.0; // How frequently to call scheduling function (in milliseconds)
    this.scheduleAheadTime = 0.1; // How far ahead to schedule audio (sec)
    this.nextNoteTime = 0.0; // when the next note is due.
    this.noteResolution = 0; // 0 == 16th, 1 == 8th, 2 == quarter note
    this.noteLength = 0.05; // length of "beep" (in seconds)
    this.notesInQueue = []; // the notes that have been put into the web audio and may or may not have played yet. {note, time}
    this.currentBeatInBar = 0;
    this.beatsPerBar = 4;
    this.counter = 0;
    this.subdivision = 64;
    this.animationFrameID = null; // requestAnimationFrame identifier.
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
    this.animationFrameID = requestAnimationFrame(this.scheduler.bind(this));
  }

  start() {
    if (this.isPlaying) return;

    if (this.audioContext == null) {
      this.audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
    }

    this.isPlaying = true;

    this.currentBeatInBar = 0;
    this.nextNoteTime = this.audioContext.currentTime + 0.05;

    this.scheduler(); // kick off scheduling
  }

  stop() {
    this.isPlaying = false;
    cancelAnimationFrame(this.animationFrameID);
    this.counter = 0; // Reset the counter
    this.currentBeatInBar = 0; // Reset the beat in bar
    this.notesInQueue = []; // Clear the notes queue
    this.nextNoteTime = 0.0; // Reset the next note time
    this.audioContext = null; // Reset the audio context
  }

  startStop() {
    if (this.isPlaying) {
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
          }, 100);
        }
      });
    }
  }
}

export { Metronome };
