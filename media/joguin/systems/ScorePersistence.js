class ScorePersistence {
  constructor() {
    this.storageKey = 'joguin_highscores_v2';
    this.maxScores = 10;
  }

  getHighScores() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn('Error reading high scores:', e);
      return [];
    }
  }

  addScore(score, mode, musicTrack) {
    try {
      const scores = this.getHighScores();

      scores.push({
        score,
        mode,
        musicTrack,
        timestamp: Date.now(),
        date: new Date().toISOString()
      });

      scores.sort((a, b) => b.score - a.score);
      const trimmed = scores.slice(0, this.maxScores);

      localStorage.setItem(this.storageKey, JSON.stringify(trimmed));
      return trimmed;
    } catch (e) {
      console.warn('Error saving score:', e);
      return [];
    }
  }

  getHighScore() {
    const scores = this.getHighScores();
    return scores.length > 0 ? scores[0].score : 0;
  }

  isHighScore(score) {
    const scores = this.getHighScores();
    return scores.length < this.maxScores || score > scores[scores.length - 1].score;
  }

  clearScores() {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (e) {
      console.warn('Error clearing scores:', e);
    }
  }

  formatScoresList() {
    const scores = this.getHighScores();
    return scores
      .map((s, i) => {
        const date = new Date(s.timestamp).toLocaleDateString();
        return `${i + 1}. ${s.score} pts (${s.mode}) - ${date}`;
      })
      .join('\n');
  }
}
