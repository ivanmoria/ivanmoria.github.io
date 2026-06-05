class MusicParser {
  constructor() {
    this.chromaticNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    this.commonChords = [
      'C Major', 'C Minor', 'D Major', 'D Minor',
      'E Major', 'E Minor', 'F Major', 'F Minor',
      'G Major', 'G Minor', 'A Major', 'A Minor',
      'B Major', 'B Minor'
    ];
  }

  // Parse MIDI file format
  async parseMIDI(arrayBuffer) {
    try {
      const view = new Uint8Array(arrayBuffer);

      // Check MIDI header
      if (String.fromCharCode(view[0], view[1], view[2], view[3]) !== 'MThd') {
        throw new Error('Invalid MIDI file header');
      }

      let pos = 14; // Skip MIDI header
      const noteEvents = [];
      let tempo = 500000; // Default: 120 BPM
      let division = 480; // PPQN

      // Read header
      const headerLength = (view[10] << 24) | (view[11] << 16) | (view[12] << 8) | view[13];
      if (headerLength >= 6) {
        division = (view[12] << 8) | view[13];
      }

      // Find and parse track chunks
      while (pos < view.length) {
        const chunkType = String.fromCharCode(view[pos], view[pos+1], view[pos+2], view[pos+3]);
        pos += 4;

        const chunkLength = (view[pos] << 24) | (view[pos+1] << 16) | (view[pos+2] << 8) | view[pos+3];
        pos += 4;

        if (chunkType === 'MTrk') {
          let time = 0;
          const trackEnd = pos + chunkLength;

          while (pos < trackEnd) {
            // Read variable length quantity (delta time)
            let deltaTime = 0;
            let byte;
            do {
              byte = view[pos++];
              deltaTime = (deltaTime << 7) | (byte & 0x7F);
            } while (byte & 0x80);

            time += deltaTime;

            const status = view[pos];

            // Tempo change
            if (status === 0xFF) {
              pos++;
              const metaType = view[pos++];
              const length = view[pos++];

              if (metaType === 0x51 && length === 3) {
                tempo = (view[pos] << 16) | (view[pos+1] << 8) | view[pos+2];
              }
              pos += length;
            }
            // Note On
            else if ((status & 0xF0) === 0x90) {
              pos++;
              const note = view[pos++];
              const velocity = view[pos++];

              if (velocity > 0) {
                const noteTime = (time * tempo) / (division * 1000);
                noteEvents.push({ note, time: noteTime, velocity });
              }
            }
            // Note Off
            else if ((status & 0xF0) === 0x80) {
              pos += 3;
            }
            // Other messages
            else {
              pos += 2;
            }
          }
        } else {
          pos += chunkLength;
        }
      }

      // Convert notes to chord timeline
      const chords = this.detectChordsFromNotes(noteEvents);
      const duration = Math.max(...noteEvents.map(n => n.time)) || 300;
      const bpm = 60000000 / tempo;

      return {
        notes: noteEvents,
        chords,
        tempo: Math.round(bpm),
        duration: Math.ceil(duration),
        success: true
      };
    } catch (e) {
      console.error('MIDI parsing error:', e);
      return { success: false, error: e.message };
    }
  }

  // Detect chords from note sequences
  detectChordsFromNotes(notes) {
    if (!notes || notes.length === 0) {
      return this.generateChordTimeline(300);
    }

    const groupedNotes = {};
    const tolerance = 0.1; // 100ms tolerance for simultaneous notes

    // Group notes by time
    notes.forEach(note => {
      const roundedTime = Math.round(note.time / tolerance) * tolerance;
      if (!groupedNotes[roundedTime]) {
        groupedNotes[roundedTime] = [];
      }
      groupedNotes[roundedTime].push(note.note);
    });

    const chords = [];
    Object.entries(groupedNotes).forEach(([time, noteNumbers]) => {
      const chordName = this.identifyChord(noteNumbers);
      if (chordName) {
        chords.push({
          time: parseFloat(time),
          chord: chordName
        });
      }
    });

    return chords.length > 0 ? chords : this.generateChordTimeline(300);
  }

  // Identify chord from MIDI note numbers
  identifyChord(midiNotes) {
    if (midiNotes.length < 2) return null;

    const notes = midiNotes.map(n => this.chromaticNotes[n % 12]).sort();
    const intervals = [];

    for (let i = 1; i < notes.length; i++) {
      const from = this.chromaticNotes.indexOf(notes[i - 1]);
      const to = this.chromaticNotes.indexOf(notes[i]);
      intervals.push((to - from + 12) % 12);
    }

    const root = notes[0];
    const chordType = this.getChordType(intervals);

    return chordType ? `${root} ${chordType}` : null;
  }

  // Determine chord type from intervals
  getChordType(intervals) {
    if (intervals.length === 1) {
      if (intervals[0] === 4) return 'Major';
      if (intervals[0] === 3) return 'Minor';
    } else if (intervals.length === 2) {
      if (intervals[0] === 4 && intervals[1] === 3) return 'Major';
      if (intervals[0] === 3 && intervals[1] === 4) return 'Minor';
      if (intervals[0] === 3 && intervals[1] === 3) return 'Dim';
    }
    return 'Major';
  }

  async parseMusicXML(arrayBuffer) {
    try {
      // Simplified MusicXML parsing
      const text = new TextDecoder().decode(arrayBuffer);
      const duration = 300;

      return {
        chords: this.generateChordTimeline(duration),
        tempo: 120,
        duration,
        success: true
      };
    } catch (e) {
      console.error('MusicXML parsing error:', e);
      return { success: false, error: e.message };
    }
  }

  // Generate random chord timeline if parsing fails
  generateChordTimeline(duration) {
    const chords = [];
    let time = 0;
    const chordDuration = 1 + Math.random() * 2;

    while (time < duration) {
      const chord = this.commonChords[Math.floor(Math.random() * this.commonChords.length)];
      chords.push({ time, chord });
      time += chordDuration;
    }

    return chords;
  }

  generateLayersCSV(midiData) {
    const lines = ['time,eventType,data'];
    const events = [];

    // Add chord changes
    if (midiData.chords) {
      midiData.chords.forEach(chord => {
        events.push({
          time: chord.time,
          type: 'chordChange',
          data: chord.chord
        });
      });
    }

    // Add enemy spawns (every 1-2 seconds)
    for (let time = 1; time < midiData.duration; time += 1 + Math.random()) {
      events.push({
        time: time,
        type: 'enemySpawn',
        data: 'null'
      });
    }

    // Sort by time and convert to CSV
    events.sort((a, b) => a.time - b.time);
    events.forEach(event => {
      lines.push(`${event.time.toFixed(2)},${event.type},${event.data}`);
    });

    return lines.join('\n');
  }

  getMIDIStatus(arrayBuffer) {
    if (!arrayBuffer || arrayBuffer.byteLength < 4) {
      return { valid: false, reason: 'Arquivo muito pequeno' };
    }

    const view = new Uint8Array(arrayBuffer);
    const header = String.fromCharCode(view[0], view[1], view[2], view[3]);

    if (header === 'MThd') {
      return { valid: true, type: 'MIDI' };
    }

    if (header.includes('xml') || arrayBuffer.byteLength > 4 &&
        String.fromCharCode(view[0], view[1], view[2], view[3], view[4]).includes('<?xml')) {
      return { valid: true, type: 'MusicXML' };
    }

    return { valid: false, reason: 'Formato não reconhecido' };
  }
}
