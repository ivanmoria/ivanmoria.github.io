class NoteMapping {
  constructor() {
    // 12 chromatic notes: C C# D D# E F F# G G# A A# B
    this.chromaticNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    this.noteNames = ['C', 'D', 'E', 'F', 'G', 'A', 'B']; // Natural notes only
    this.gridSize = 8;

    // Chromatic frequencies (A4 = 440 Hz)
    this.noteFrequencies = {
      'C': 261.63, 'C#': 277.18, 'Db': 277.18,
      'D': 293.66, 'D#': 311.13, 'Eb': 311.13,
      'E': 329.63,
      'F': 349.23, 'F#': 369.99, 'Gb': 369.99,
      'G': 392.00, 'G#': 415.30, 'Ab': 415.30,
      'A': 440.00, 'A#': 466.16, 'Bb': 466.16,
      'B': 493.88
    };
  }

  // Map MIDI note number (0-127) to note name
  midiToNote(midiNumber) {
    const noteIndex = midiNumber % 12;
    const octave = Math.floor(midiNumber / 12) - 1;
    return {
      note: this.chromaticNotes[noteIndex],
      octave: octave,
      natural: this.noteNames.includes(this.chromaticNotes[noteIndex])
    };
  }

  // Get note for grid column (cycles through chromatic notes)
  getColNote(col) {
    return col < this.gridSize ? this.chromaticNotes[col % 12] : null;
  }

  // Get note for grid row (cycles through natural notes)
  getRowNote(row) {
    return row < this.gridSize ? this.noteNames[row % 7] : null;
  }

  getPositionNotes(row, col) {
    return {
      rowNote: this.getRowNote(row),
      colNote: this.getColNote(col),
      rowOctave: Math.floor(row / 7),
      colOctave: Math.floor(col / 12)
    };
  }

  // Get all positions that match a note (handles enharmonic equivalents)
  getPositionsForNote(note) {
    const positions = [];
    const enharmonic = this.getEnharmonicEquivalents(note);

    for (let r = 0; r < this.gridSize; r++) {
      for (let c = 0; c < this.gridSize; c++) {
        const posNotes = this.getPositionNotes(r, c);
        if (enharmonic.includes(posNotes.colNote) || enharmonic.includes(posNotes.rowNote)) {
          positions.push({ row: r, col: c });
        }
      }
    }
    return positions;
  }

  // Get enharmonic equivalents (C# = Db, etc)
  getEnharmonicEquivalents(note) {
    const equivalents = {
      'C': ['C'], 'C#': ['C#', 'Db'], 'Db': ['C#', 'Db'],
      'D': ['D'], 'D#': ['D#', 'Eb'], 'Eb': ['D#', 'Eb'],
      'E': ['E'],
      'F': ['F'], 'F#': ['F#', 'Gb'], 'Gb': ['F#', 'Gb'],
      'G': ['G'], 'G#': ['G#', 'Ab'], 'Ab': ['G#', 'Ab'],
      'A': ['A'], 'A#': ['A#', 'Bb'], 'Bb': ['A#', 'Bb'],
      'B': ['B']
    };
    return equivalents[note] || [note];
  }

  getNoteFrequency(note) {
    return this.noteFrequencies[note] || 440;
  }

  // Normalize note name (returns standard form)
  normalizeNote(note) {
    if (!note) return null;
    const normalized = note.toUpperCase();
    if (this.noteFrequencies[normalized]) return normalized;
    return null;
  }
}
