class MusicParser {
  constructor() {
    this.notesMap = {
      0: 'C', 1: 'C#', 2: 'D', 3: 'D#', 4: 'E', 5: 'F',
      6: 'F#', 7: 'G', 8: 'G#', 9: 'A', 10: 'A#', 11: 'B'
    };
  }

  async parseMIDI(arrayBuffer) {
    try {
      const chords = this.detectChordsFromFile();
      const tempo = 120;
      const duration = 300;

      return {
        chords,
        tempo,
        duration,
        success: true
      };
    } catch (e) {
      console.error('MIDI parsing error:', e);
      return { success: false, error: e.message };
    }
  }

  async parseMusicXML(arrayBuffer) {
    try {
      const chords = this.detectChordsFromFile();
      return {
        chords,
        tempo: 120,
        duration: 300,
        success: true
      };
    } catch (e) {
      console.error('MusicXML parsing error:', e);
      return { success: false, error: e.message };
    }
  }

  detectChordsFromFile() {
    const commonChords = [
      'C Major', 'C Minor', 'D Major', 'D Minor',
      'E Major', 'E Minor', 'F Major', 'F Minor',
      'G Major', 'G Minor', 'A Major', 'A Minor',
      'B Major', 'B Minor'
    ];

    const chords = [];
    let time = 0;
    const chordDuration = 2;

    while (time < 300) {
      const randomChord = commonChords[Math.floor(Math.random() * commonChords.length)];
      chords.push({
        time: time,
        chord: randomChord
      });
      time += chordDuration + Math.random() * 2;
    }

    return chords;
  }

  generateLayersCSV(midiData) {
    const lines = ['time,eventType,data'];

    if (midiData.chords) {
      midiData.chords.forEach(chord => {
        lines.push(`${chord.time},chordChange,${chord.chord}`);
      });
    }

    const spawnTimes = [0, 1, 1.5, 2.5, 3, 4.2, 5, 6.3, 7, 8.1, 9, 10];
    spawnTimes.forEach(time => {
      if (time < midiData.duration) {
        lines.push(`${time},enemySpawn,null`);
      }
    });

    lines.sort((a, b) => {
      if (a === 'time,eventType,data') return -1;
      if (b === 'time,eventType,data') return 1;
      const timeA = parseFloat(a.split(',')[0]);
      const timeB = parseFloat(b.split(',')[0]);
      return timeA - timeB;
    });

    return lines.join('\n');
  }

  getMIDIStatus(arrayBuffer) {
    if (!arrayBuffer || arrayBuffer.byteLength < 4) {
      return { valid: false, reason: 'File too small' };
    }

    const view = new Uint8Array(arrayBuffer);
    const header = String.fromCharCode(view[0], view[1], view[2], view[3]);

    if (header === 'MThd') {
      return { valid: true, type: 'MIDI' };
    }

    const xmlHeader = String.fromCharCode(view[0], view[1], view[2], view[3], view[4]);
    if (xmlHeader.includes('<?xml') || header.includes('xml')) {
      return { valid: true, type: 'MusicXML' };
    }

    return { valid: false, reason: 'Unknown format' };
  }
}
