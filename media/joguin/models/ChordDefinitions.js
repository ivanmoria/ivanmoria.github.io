const CHORD_LIBRARY = {
  // C root
  'C Major': ['C', 'E', 'G'],
  'C Minor': ['C', 'Eb', 'G'],
  'C Dim': ['C', 'Eb', 'Gb'],
  'C Aug': ['C', 'E', 'G#'],

  // C# / Db root
  'C# Major': ['C#', 'F', 'G#'],
  'Db Major': ['Db', 'F', 'Ab'],
  'C# Minor': ['C#', 'E', 'G#'],
  'Db Minor': ['Db', 'E', 'Ab'],

  // D root
  'D Major': ['D', 'F#', 'A'],
  'D Minor': ['D', 'F', 'A'],
  'D Dim': ['D', 'F', 'Ab'],
  'D Aug': ['D', 'F#', 'A#'],

  // D# / Eb root
  'D# Major': ['D#', 'G', 'A#'],
  'Eb Major': ['Eb', 'G', 'Bb'],
  'D# Minor': ['D#', 'F#', 'A#'],
  'Eb Minor': ['Eb', 'Gb', 'Bb'],

  // E root
  'E Major': ['E', 'G#', 'B'],
  'E Minor': ['E', 'G', 'B'],
  'E Dim': ['E', 'G', 'Bb'],
  'E Aug': ['E', 'G#', 'B#'],

  // F root
  'F Major': ['F', 'A', 'C'],
  'F Minor': ['F', 'Ab', 'C'],
  'F Dim': ['F', 'Ab', 'Cb'],
  'F Aug': ['F', 'A', 'C#'],

  // F# / Gb root
  'F# Major': ['F#', 'A#', 'C#'],
  'Gb Major': ['Gb', 'Bb', 'Db'],
  'F# Minor': ['F#', 'A', 'C#'],
  'Gb Minor': ['Gb', 'A', 'Db'],

  // G root
  'G Major': ['G', 'B', 'D'],
  'G Minor': ['G', 'Bb', 'D'],
  'G Dim': ['G', 'Bb', 'Db'],
  'G Aug': ['G', 'B', 'D#'],

  // G# / Ab root
  'G# Major': ['G#', 'C', 'D#'],
  'Ab Major': ['Ab', 'C', 'Eb'],
  'G# Minor': ['G#', 'B', 'D#'],
  'Ab Minor': ['Ab', 'B', 'Eb'],

  // A root
  'A Major': ['A', 'C#', 'E'],
  'A Minor': ['A', 'C', 'E'],
  'A Dim': ['A', 'C', 'Eb'],
  'A Aug': ['A', 'C#', 'E#'],

  // A# / Bb root
  'A# Major': ['A#', 'D', 'F'],
  'Bb Major': ['Bb', 'D', 'F'],
  'A# Minor': ['A#', 'C#', 'F'],
  'Bb Minor': ['Bb', 'Db', 'F'],

  // B root
  'B Major': ['B', 'D#', 'F#'],
  'B Minor': ['B', 'D', 'F#'],
  'B Dim': ['B', 'D', 'F'],
  'B Aug': ['B', 'D#', 'F#'],
};

class ChordManager {
  constructor(noteMapping) {
    this.chordLibrary = CHORD_LIBRARY;
    this.currentChord = 'C Major';
    this.chordTimeline = [];
    this.noteMapping = noteMapping;
    this.currentTime = 0;
  }

  setChordTimeline(timeline) {
    this.chordTimeline = timeline;
  }

  updateTime(timeInSeconds) {
    this.currentTime = timeInSeconds;
    this.updateCurrentChord();
  }

  updateCurrentChord() {
    for (let i = this.chordTimeline.length - 1; i >= 0; i--) {
      if (this.chordTimeline[i].time <= this.currentTime) {
        this.currentChord = this.chordTimeline[i].chord || 'C Major';
        break;
      }
    }
  }

  getCurrentChord() {
    return this.currentChord;
  }

  getCurrentChordNotes() {
    return this.chordLibrary[this.currentChord] || this.chordLibrary['C Major'];
  }

  getValidPositionsForChord(chord) {
    const notes = this.chordLibrary[chord] || this.chordLibrary['C Major'];
    const positions = [];

    for (let r = 0; r < this.noteMapping.gridSize; r++) {
      for (let c = 0; c < this.noteMapping.gridSize; c++) {
        const posNotes = this.noteMapping.getPositionNotes(r, c);

        // Check if col note matches any chord note (with enharmonic equivalents)
        let colMatch = false;
        for (const chordNote of notes) {
          const enharmonic = this.noteMapping.getEnharmonicEquivalents(chordNote);
          if (enharmonic.includes(posNotes.colNote)) {
            colMatch = true;
            break;
          }
        }

        // Check if row note matches any chord note
        let rowMatch = false;
        for (const chordNote of notes) {
          const enharmonic = this.noteMapping.getEnharmonicEquivalents(chordNote);
          if (enharmonic.includes(posNotes.rowNote)) {
            rowMatch = true;
            break;
          }
        }

        if (colMatch || rowMatch) {
          positions.push({ row: r, col: c });
        }
      }
    }

    return positions;
  }

  getValidPositionsForCurrentChord() {
    return this.getValidPositionsForChord(this.currentChord);
  }

  isPositionInChord(row, col, chord) {
    const positions = this.getValidPositionsForChord(chord);
    return positions.some(p => p.row === row && p.col === col);
  }

  isPositionInCurrentChord(row, col) {
    return this.isPositionInChord(row, col, this.currentChord);
  }
}
