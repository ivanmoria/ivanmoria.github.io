const CHORD_LIBRARY = {
  'C Major': ['C', 'E', 'G'],
  'C Minor': ['C', 'Eb', 'G'],
  'C Dim': ['C', 'Eb', 'Gb'],
  'C Aug': ['C', 'E', 'G#'],

  'D Major': ['D', 'F#', 'A'],
  'D Minor': ['D', 'F', 'A'],
  'D Dim': ['D', 'F', 'Ab'],
  'D Aug': ['D', 'F#', 'A#'],

  'E Major': ['E', 'G#', 'B'],
  'E Minor': ['E', 'G', 'B'],
  'E Dim': ['E', 'G', 'Bb'],
  'E Aug': ['E', 'G#', 'B#'],

  'F Major': ['F', 'A', 'C'],
  'F Minor': ['F', 'Ab', 'C'],
  'F Dim': ['F', 'Ab', 'Cb'],
  'F Aug': ['F', 'A', 'C#'],

  'G Major': ['G', 'B', 'D'],
  'G Minor': ['G', 'Bb', 'D'],
  'G Dim': ['G', 'Bb', 'Db'],
  'G Aug': ['G', 'B', 'D#'],

  'A Major': ['A', 'C#', 'E'],
  'A Minor': ['A', 'C', 'E'],
  'A Dim': ['A', 'C', 'Eb'],
  'A Aug': ['A', 'C#', 'E#'],

  'B Major': ['B', 'D#', 'F#'],
  'B Minor': ['B', 'D', 'F#'],
  'B Dim': ['B', 'D', 'F'],
  'B Aug': ['B', 'D#', 'F##'],
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

        if (
          notes.includes(posNotes.colNote) ||
          notes.includes(posNotes.rowNote)
        ) {
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
