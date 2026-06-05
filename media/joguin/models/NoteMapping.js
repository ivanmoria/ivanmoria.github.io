class NoteMapping {
  constructor() {
    this.notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C'];
    this.gridSize = 8;
    this.noteFrequencies = {
      'C': 262, 'D': 294, 'E': 330, 'F': 349, 'G': 392, 'A': 440, 'B': 494
    };
  }

  getColNote(col) {
    return col < this.gridSize ? this.notes[col] : null;
  }

  getRowNote(row) {
    return row < this.gridSize ? this.notes[row] : null;
  }

  getPositionNotes(row, col) {
    return {
      rowNote: this.getRowNote(row),
      colNote: this.getColNote(col),
      rowOctave: Math.floor(row / 8),
      colOctave: Math.floor(col / 8)
    };
  }

  getPositionsForNote(note) {
    const positions = [];
    for (let r = 0; r < this.gridSize; r++) {
      for (let c = 0; c < this.gridSize; c++) {
        const posNotes = this.getPositionNotes(r, c);
        if (posNotes.colNote === note || posNotes.rowNote === note) {
          positions.push({ row: r, col: c });
        }
      }
    }
    return positions;
  }

  getNoteFrequency(note) {
    return this.noteFrequencies[note] || 440;
  }
}
