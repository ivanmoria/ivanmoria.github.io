class SoundEffects {
  constructor() {
    this.enabled = true;
    this.sounds = {
      chordChange: this.createAudioBuffer('data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA=='),
      enemySpawn: this.createAudioBuffer('data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA=='),
      collect: this.createAudioBuffer('data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA=='),
      gift: this.createAudioBuffer('data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA=='),
      damage: this.createAudioBuffer('data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA=='),
      gameOver: this.createAudioBuffer('data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==')
    };

    this.audioContext = null;
    this.initAudioContext();
  }

  initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('AudioContext not available:', e);
      this.enabled = false;
    }
  }

  createAudioBuffer(base64Data) {
    return base64Data;
  }

  play(soundKey, volume = 0.3) {
    if (!this.enabled || !this.audioContext) return;

    try {
      this.playTone(this.getFrequencyForSound(soundKey), 0.1, volume);
    } catch (e) {
      console.warn('Sound play error:', e);
    }
  }

  getFrequencyForSound(soundKey) {
    const frequencies = {
      chordChange: 440,
      enemySpawn: 220,
      collect: 880,
      gift: 1047,
      damage: 110,
      gameOver: 164
    };
    return frequencies[soundKey] || 440;
  }

  playTone(frequency, duration, volume = 0.3) {
    if (!this.audioContext) return;

    const now = this.audioContext.currentTime;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.frequency.value = frequency;
    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    osc.start(now);
    osc.stop(now + duration);
  }

  playChordChange(chord) {
    if (!this.enabled) return;
    this.play('chordChange', 0.2);
  }

  playEnemySpawn() {
    if (!this.enabled) return;
    this.play('enemySpawn', 0.15);
  }

  playCollect() {
    if (!this.enabled) return;
    this.play('collect', 0.3);
  }

  playGift() {
    if (!this.enabled) return;
    this.play('gift', 0.3);
  }

  playDamage() {
    if (!this.enabled) return;
    this.play('damage', 0.25);
  }

  playGameOver() {
    if (!this.enabled) return;
    this.play('gameOver', 0.3);
  }

  toggle() {
    this.enabled = !this.enabled;
  }
}
