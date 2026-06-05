class DifficultyManager {
  constructor() {
    this.baseSettings = {
      normal: {
        enemyCount: 6,
        spawnRate: 1.0,
        speed: 1.0,
        damageCooldown: 800
      },
      hardcore: {
        enemyCount: 10,
        spawnRate: 1.3,
        speed: 1.2,
        damageCooldown: 500
      }
    };
  }

  getEnemyCount(mode, score) {
    const base = this.baseSettings[mode].enemyCount;
    const multiplier = 1 + Math.floor(score / 100) * 0.15;
    return Math.min(Math.floor(base * multiplier), 15);
  }

  getSpawnRate(mode, score) {
    const base = this.baseSettings[mode].spawnRate;
    const multiplier = 1 + Math.floor(score / 150) * 0.1;
    return Math.min(base * multiplier, 2.0);
  }

  getSpeed(mode, score) {
    const base = this.baseSettings[mode].speed;
    const multiplier = 1 + Math.floor(score / 200) * 0.08;
    return Math.min(base * multiplier, 2.0);
  }

  getDamageCooldown(mode, score) {
    const base = this.baseSettings[mode].damageCooldown;
    const reduction = Math.floor(score / 250) * 50;
    return Math.max(base - reduction, 200);
  }

  getDifficultyMultiplier(score) {
    return 1 + Math.floor(score / 300) * 0.1;
  }
}
