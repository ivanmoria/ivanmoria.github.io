class Animation {
  constructor(type, target, duration, properties) {
    this.type = type;
    this.target = target;
    this.duration = duration;
    this.properties = properties;
    this.elapsed = 0;
    this.startTime = performance.now();
  }

  update(deltaTime) {
    this.elapsed += deltaTime;
    return this.elapsed >= this.duration;
  }

  getProgress() {
    return Math.min(this.elapsed / this.duration, 1);
  }

  easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  apply(progress) {
    const easeProgress = this.easeInOutQuad(progress);

    switch (this.type) {
      case 'scale':
        if (this.properties.from !== undefined && this.properties.to !== undefined) {
          return this.properties.from + (this.properties.to - this.properties.from) * easeProgress;
        }
        break;

      case 'opacity':
        if (this.properties.from !== undefined && this.properties.to !== undefined) {
          return this.properties.from + (this.properties.to - this.properties.from) * easeProgress;
        }
        break;

      case 'color':
        return {
          from: this.properties.from,
          to: this.properties.to,
          progress: easeProgress
        };

      case 'position':
        return {
          startX: this.properties.startX || 0,
          startY: this.properties.startY || 0,
          endX: this.properties.endX || 0,
          endY: this.properties.endY || 0,
          progress: easeProgress
        };
    }
  }
}

class AnimationSystem {
  constructor() {
    this.animations = [];
    this.screenFlashes = [];
  }

  add(type, target, duration, properties) {
    this.animations.push(new Animation(type, target, duration, properties));
  }

  addFlash(color, duration) {
    this.screenFlashes.push({
      color,
      duration,
      startTime: performance.now(),
      elapsed: 0
    });
  }

  update(deltaTime) {
    this.animations = this.animations.filter(anim => !anim.update(deltaTime));

    this.screenFlashes.forEach(flash => {
      flash.elapsed += deltaTime;
    });

    this.screenFlashes = this.screenFlashes.filter(flash => flash.elapsed < flash.duration);
  }

  getPlayerAnimations() {
    return this.animations.filter(a => a.type === 'position' && a.target === 'player');
  }

  getScreenFlashes() {
    return this.screenFlashes;
  }

  clear() {
    this.animations = [];
    this.screenFlashes = [];
  }
}
