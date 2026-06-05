class UploadProcessor {
  constructor() {
    this.musicParser = new MusicParser();
    this.customMusics = [];
    this.initDB();
  }

  async initDB() {
    return new Promise((resolve) => {
      const request = indexedDB.open('JoguinDB', 1);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('customMusic')) {
          db.createObjectStore('customMusic', { keyPath: 'id', autoIncrement: true });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('IndexedDB error:', request.error);
        resolve(null);
      };
    });
  }

  async processUpload(file) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const status = this.musicParser.getMIDIStatus(arrayBuffer);

      if (!status.valid) {
        return {
          success: false,
          error: `❌ Formato inválido: ${status.reason}\n\nFormatos aceitos:\n• MIDI (.mid)\n• MusicXML (.xml, .musicxml)`
        };
      }

      let musicData;
      if (status.type === 'MIDI') {
        musicData = await this.musicParser.parseMIDI(arrayBuffer);
      } else if (status.type === 'MusicXML') {
        musicData = await this.musicParser.parseMusicXML(arrayBuffer);
      }

      if (!musicData.success) {
        return { success: false, error: `❌ Erro ao processar: ${musicData.error}` };
      }

      const csvLayers = this.musicParser.generateLayersCSV(musicData);

      const customTrack = {
        name: file.name,
        fileName: file.name.replace(/\.[^/.]+$/, ''),
        csv: csvLayers,
        uploadDate: new Date().toISOString(),
        type: status.type,
        duration: musicData.duration,
        tempo: musicData.tempo,
        chords: musicData.chords ? musicData.chords.length : 0
      };

      await this.saveCustomMusic(customTrack);

      return { success: true, data: customTrack };
    } catch (error) {
      console.error('Upload processing error:', error);
      return {
        success: false,
        error: `❌ Erro ao processar arquivo: ${error.message}`
      };
    }
  }

  async saveCustomMusic(musicData) {
    const db = await this.initDB();
    if (!db) {
      console.error('Could not save to IndexedDB');
      this.customMusics.push(musicData);
      return;
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction('customMusic', 'readwrite');
      const objectStore = transaction.objectStore('customMusic');
      const request = objectStore.add(musicData);

      request.onsuccess = () => {
        musicData.id = request.result;
        this.customMusics.push(musicData);
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async getCustomMusics() {
    const db = await this.initDB();
    if (!db) {
      return this.customMusics;
    }

    return new Promise((resolve) => {
      const transaction = db.transaction('customMusic', 'readonly');
      const objectStore = transaction.objectStore('customMusic');
      const request = objectStore.getAll();

      request.onsuccess = () => {
        this.customMusics = request.result;
        resolve(request.result);
      };

      request.onerror = () => {
        resolve(this.customMusics);
      };
    });
  }

  async deleteCustomMusic(id) {
    const db = await this.initDB();
    if (!db) {
      this.customMusics = this.customMusics.filter(m => m.id !== id);
      return;
    }

    return new Promise((resolve) => {
      const transaction = db.transaction('customMusic', 'readwrite');
      const objectStore = transaction.objectStore('customMusic');
      const request = objectStore.delete(id);

      request.onsuccess = () => {
        this.customMusics = this.customMusics.filter(m => m.id !== id);
        resolve();
      };

      request.onerror = () => {
        console.error('Delete error:', request.error);
        resolve();
      };
    });
  }
}
