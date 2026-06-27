/**
 * 像素小恐龙游戏 - 游戏引擎
 */

import {
  PX,
  MAX_W,
  H,
  GROUND_Y,
  BASE_SPEED,
  MAX_SPEED,
  SPEED_INC,
  GRAVITY,
  JUMP_V,
  DBL_JUMP_V,
  DOUBLE_DURATION,
  STATE,
  type GameState,
  type Rect,
  type Cloud,
  type Particle,
} from "./constants";
import { initAudio, sfxCoin, sfxPowerup, sfxHit, sfxScore } from "./audio";
import { Dino, Obstacle, Item } from "./entities";

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private scoreValue: HTMLDivElement;
  private highScoreValue: HTMLDivElement;
  private speedValue: HTMLDivElement;
  private hintText: HTMLParagraphElement;
  private shieldStatus: HTMLDivElement;
  private doubleStatus: HTMLDivElement;
  private isTouchDevice: boolean;
  private controlsText: string;

  private state: GameState = STATE.IDLE;
  private score = 0;
  private highScore = 0;
  private speed = BASE_SPEED;
  private elapsedTime = 0;
  private distance = 0;
  private shakeTimer = 0;
  private shakeInt = 0;
  private flash = 0;
  private doubleJumpUsed = { value: false };
  private canDoubleJump = { value: false };
  private hasShield = false;
  private doubleTimer = 0;
  private lastTime = 0;
  private animationFrame = 0;
  private groundOff = 0;
  private obsTimer = 0;
  private nextObsDelay = 0.8;
  private scoreCheck = 0;
  private pteraOn = false;
  private itemTimer = 0;
  private nextItemDelay = 2.5;
  private activeTouchPointerId: number | null = null;

  private dino: Dino;
  private obstacles: Obstacle[] = [];
  private items: Item[] = [];
  private clouds: Cloud[] = [];
  private particles: Particle[] = [];

  constructor(
    canvas: HTMLCanvasElement,
    scoreValue: HTMLDivElement,
    highScoreValue: HTMLDivElement,
    speedValue: HTMLDivElement,
    hintText: HTMLParagraphElement,
    shieldStatus: HTMLDivElement,
    doubleStatus: HTMLDivElement
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.scoreValue = scoreValue;
    this.highScoreValue = highScoreValue;
    this.speedValue = speedValue;
    this.hintText = hintText;
    this.shieldStatus = shieldStatus;
    this.doubleStatus = doubleStatus;
    this.dino = new Dino();

    this.isTouchDevice =
      /Android|iPhone|iPad|iPod|webOS/i.test(navigator.userAgent) ||
      window.innerWidth < 768 ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia("(pointer: coarse)").matches;
    this.controlsText = this.isTouchDevice ? "上半屏跳跃 | 按住下半屏蹲下" : "空格/↑/点击跳跃 | ↓蹲下";
  }

  private setHint(text: string, opacity = 1) {
    this.hintText.textContent = text;
    this.hintText.style.opacity = String(opacity);
  }

  private setVisible(element: HTMLDivElement, visible: boolean) {
    element.style.display = visible ? "flex" : "none";
  }

  private syncScore() {
    this.scoreValue.textContent = String(this.score);
  }

  private syncHighScore() {
    this.highScoreValue.textContent = String(this.highScore);
  }

  private syncSpeed() {
    this.speedValue.textContent = `${(Math.round((this.speed / BASE_SPEED) * 10) / 10).toFixed(1).replace(/\.0$/, "")}x`;
  }

  private addScore(points: number) {
    this.score += this.doubleTimer > 0 ? points * 2 : points;
    this.syncScore();
  }

  private collides(a: Rect, b: Rect) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  private spawnObstacle() {
    const roll = Math.random();
    let type: string;
    if (!this.pteraOn || roll < 0.6) {
      const cactusRoll = Math.random();
      type = cactusRoll < 0.4 ? "cactus_s" : cactusRoll < 0.75 ? "cactus_l" : "cactus_g";
    } else {
      type = Math.random() < 0.5 ? "ptera_l" : "ptera_h";
    }
    this.obstacles.push(new Obstacle(type, MAX_W + 20 + Math.random() * 60));
  }

  private spawnItem() {
    const roll = Math.random();
    let type: string;
    if (roll < 0.7) type = "coin";
    else if (roll < 0.85) type = "shield";
    else type = "double";

    const yPos = type === "coin" ? GROUND_Y - 35 - Math.random() * 30 : GROUND_Y - 45;
    this.items.push(new Item(type, MAX_W + 50 + Math.random() * 80, yPos));
  }

  private resetAll() {
    this.dino = new Dino();
    this.obstacles = [];
    this.items = [];
    this.clouds = [];
    this.particles = [];
    this.groundOff = 0;
    this.obsTimer = 0;
    this.nextObsDelay = 0.8;
    this.score = 0;
    this.speed = BASE_SPEED;
    this.elapsedTime = 0;
    this.distance = 0;
    this.scoreCheck = 0;
    this.pteraOn = false;
    this.doubleJumpUsed.value = false;
    this.canDoubleJump.value = false;
    this.shakeTimer = 0;
    this.shakeInt = 0;
    this.flash = 0;
    this.hasShield = false;
    this.doubleTimer = 0;
    this.itemTimer = 0;
    this.nextItemDelay = 2.5;
    this.syncScore();
    this.syncSpeed();
    this.setVisible(this.shieldStatus, false);
    this.setVisible(this.doubleStatus, false);
    this.setHint(this.controlsText, 1);

    for (let index = 0; index < 5; index += 1) {
      this.clouds.push({
        x: Math.random() * MAX_W,
        y: 25 + Math.random() * 80,
        w: 50 + Math.random() * 80,
        sp: 40 + Math.random() * 70,
      });
    }

    this.canvas.focus();
  }

  private startGame() {
    if (this.state === STATE.PLAYING) return;
    initAudio();
    this.state = STATE.PLAYING;
    if (this.score === 0 && this.obstacles.length === 0) {
      this.resetAll();
    } else {
      this.dino.reset(this.doubleJumpUsed, this.canDoubleJump);
    }
    this.setHint(this.controlsText, 0.4);
  }

  private endGame() {
    if (this.state === STATE.DEAD) return;
    this.state = STATE.DEAD;
    sfxHit();
    this.shakeTimer = 0.35;
    this.shakeInt = 8;
    this.flash = 0.5;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      try {
        localStorage.setItem("pixelDinoHighMobile", String(this.highScore));
      } catch {
        // Ignore storage errors.
      }
      this.syncHighScore();
    }
    this.setHint("💀 游戏结束 | 点击屏幕重新开始", 1);
  }

  restart() {
    if (this.state === STATE.DEAD) {
      this.resetAll();
      this.state = STATE.PLAYING;
      this.setHint(this.controlsText, 0.5);
    } else if (this.state === STATE.IDLE) {
      this.startGame();
    }
  }

  private update(dt: number) {
    if (dt > 0.1) dt = 0.1;

    if (this.state === STATE.PLAYING) {
      this.speed = Math.min(MAX_SPEED, BASE_SPEED + this.elapsedTime * SPEED_INC);
      this.distance += this.speed * dt;
      this.elapsedTime += dt;

      if (this.distance - this.scoreCheck >= 80) {
        this.scoreCheck += 80;
        this.addScore(1);
        if (this.score % 10 === 0) sfxScore();
        if (this.score >= 300) this.pteraOn = true;
      }
      this.syncSpeed();

      if (this.doubleTimer > 0) {
        this.doubleTimer -= dt;
        this.setVisible(this.doubleStatus, this.doubleTimer > 0);
      } else {
        this.setVisible(this.doubleStatus, false);
      }

      this.setVisible(this.shieldStatus, this.hasShield);
      this.dino.update(dt, this.speed, this.doubleJumpUsed, this.canDoubleJump, GRAVITY);

      for (const obstacle of this.obstacles) obstacle.update(dt, this.speed);
      this.obstacles = this.obstacles.filter((obstacle) => !obstacle.off());

      this.obsTimer += dt;
      if (this.obsTimer >= this.nextObsDelay) {
        this.obsTimer = 0;
        this.nextObsDelay = Math.max(0.55, 1.3 - this.speed * 0.001) + Math.random() * Math.max(0.9, 2.2 - this.speed * 0.0015);
        if (this.obstacles.length < 3) this.spawnObstacle();
      }

      for (const item of this.items) item.update(dt, this.speed);
      this.items = this.items.filter((item) => !item.off());

      this.itemTimer += dt;
      if (this.itemTimer >= this.nextItemDelay) {
        this.itemTimer = 0;
        this.nextItemDelay = 2.0 + Math.random() * 4.0;
        if (this.items.length < 5) this.spawnItem();
      }

      const dBox = this.dino.box();
      for (let index = this.obstacles.length - 1; index >= 0; index -= 1) {
        const obstacle = this.obstacles[index];
        if (this.collides(dBox, obstacle.box())) {
          if (this.hasShield) {
            this.hasShield = false;
            sfxPowerup();
            this.setVisible(this.shieldStatus, false);
            this.obstacles.splice(index, 1);
            continue;
          }
          this.endGame();
          return;
        }
      }

      for (let index = this.items.length - 1; index >= 0; index -= 1) {
        const item = this.items[index];
        if (this.collides(dBox, item.box())) {
          if (item.type === "coin") {
            this.addScore(10);
            sfxCoin();
          } else if (item.type === "shield") {
            this.hasShield = true;
            sfxPowerup();
            this.setVisible(this.shieldStatus, true);
          } else if (item.type === "double") {
            this.doubleTimer = DOUBLE_DURATION;
            sfxPowerup();
            this.setVisible(this.doubleStatus, true);
          }
          this.items.splice(index, 1);
        }
      }

      this.groundOff = (this.groundOff + this.speed * dt) % (PX * 16);
    } else if (this.state === STATE.DEAD) {
      this.speed *= Math.pow(0.08, dt);
      if (this.speed < 0.5) this.speed = 0;
      this.syncSpeed();

      for (const obstacle of this.obstacles) obstacle.update(dt, this.speed);
      this.obstacles = this.obstacles.filter((obstacle) => !obstacle.off());

      for (const item of this.items) item.update(dt, this.speed);
      this.items = this.items.filter((item) => !item.off());

      this.dino.update(dt, this.speed, this.doubleJumpUsed, this.canDoubleJump, GRAVITY);
      this.groundOff = (this.groundOff + this.speed * dt) % (PX * 16);

      if (this.shakeTimer > 0) {
        this.shakeTimer -= dt;
        this.shakeInt *= Math.pow(0.15, dt);
      }

      if (this.flash > 0) {
        this.flash -= 1.5 * dt;
        if (this.flash < 0) this.flash = 0;
      }
    } else if (this.state === STATE.IDLE) {
      this.dino.legT += dt;
      if (this.dino.legT > 0.4) {
        this.dino.legT = 0;
        this.dino.legF = 1 - this.dino.legF;
      }

      this.dino.blinkT -= dt;
      if (this.dino.blinkT <= 0) {
        this.dino.blink = true;
        this.dino.blinkT = 0.07;
      } else if (this.dino.blink && this.dino.blinkT <= 0.04) {
        this.dino.blink = false;
        this.dino.blinkT = 2.5 + Math.random() * 3;
      }
    }

    for (const cloud of this.clouds) {
      cloud.x -= cloud.sp * dt;
      if (cloud.x + cloud.w < -20) {
        cloud.x = MAX_W + 150;
        cloud.y = 25 + Math.random() * 80;
      }
    }

    for (const particle of this.particles) {
      particle.x += particle.vx * dt * 60;
      particle.y += particle.vy * dt * 60;
      particle.vy += 18 * dt;
      particle.life -= dt;
    }
    this.particles = this.particles.filter((particle) => particle.life > 0);
  }

  private draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, MAX_W, H);

    let sx = 0;
    let sy = 0;
    if (this.shakeTimer > 0 && this.shakeInt > 0.3) {
      sx = (Math.random() - 0.5) * this.shakeInt * 2;
      sy = (Math.random() - 0.5) * this.shakeInt * 2;
    }

    ctx.save();
    ctx.translate(sx, sy);
    ctx.fillStyle = "#fafaf8";
    ctx.fillRect(-10, -10, MAX_W + 20, H + 20);

    for (const cloud of this.clouds) {
      ctx.fillStyle = "rgba(180,180,185,0.4)";
      ctx.fillRect(cloud.x, cloud.y, cloud.w, 8);
    }

    ctx.strokeStyle = "#535353";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(MAX_W, GROUND_Y);
    ctx.stroke();

    ctx.fillStyle = "#7a7a7a";
    for (let x = -this.groundOff; x < MAX_W + PX * 16; x += PX * 16) {
      if (x % (PX * 16) < PX * 3) ctx.fillRect(x, GROUND_Y + 3, PX * 2, PX);
    }

    ctx.fillStyle = "#e8e6e0";
    ctx.fillRect(0, GROUND_Y + 1, MAX_W, H - GROUND_Y);

    for (const particle of this.particles) {
      ctx.fillStyle = "#aaa";
      ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
    }

    for (const obstacle of this.obstacles) obstacle.draw(ctx);
    for (const item of this.items) item.draw(ctx);
    this.dino.draw(ctx);

    if (this.state === STATE.DEAD) {
      ctx.fillStyle = `rgba(255,255,255,${0.25 + this.flash})`;
      ctx.fillRect(0, 0, MAX_W, H);
      ctx.fillStyle = "#333";
      ctx.font = 'bold 28px "Courier New"';
      ctx.textAlign = "center";
      ctx.fillText("游戏结束", MAX_W / 2, H / 2 - 20);
      ctx.font = '16px "Courier New"';
      ctx.fillText(`得分: ${this.score}`, MAX_W / 2, H / 2 + 20);
      if (this.score >= this.highScore && this.score > 0) {
        ctx.fillStyle = "#c9a145";
        ctx.fillText("🏆 新纪录！", MAX_W / 2, H / 2 + 50);
      }
      ctx.textAlign = "start";
    }

    ctx.restore();

    ctx.fillStyle = "#333";
    ctx.font = 'bold 18px "Courier New"';
    ctx.textAlign = "right";
    ctx.fillText(String(this.score).padStart(5, "0"), MAX_W - 20, 35);
    if (this.highScore > 0) {
      ctx.fillStyle = "#c9a145";
      ctx.font = '10px "Courier New"';
      ctx.fillText(`HI ${String(this.highScore).padStart(5, "0")}`, MAX_W - 20, 50);
    }
    ctx.textAlign = "start";
  }

  private loop = (timestamp: number) => {
    if (!this.lastTime) this.lastTime = timestamp;
    const dt = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;
    if (dt > 0 && dt < 0.5) this.update(dt);
    this.draw();
    this.animationFrame = window.requestAnimationFrame(this.loop);
  };

  private isJumpKey(event: KeyboardEvent) {
    return event.key === " " || event.code === "Space" || event.key === "ArrowUp" || event.code === "ArrowUp" || event.code === "KeyW";
  }

  private isDuckKey(event: KeyboardEvent) {
    return event.key === "ArrowDown" || event.code === "ArrowDown" || event.code === "KeyS";
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    if (this.isJumpKey(event)) {
      event.preventDefault();
      initAudio();
      this.canvas.focus();
      if (this.state === STATE.DEAD) {
        this.restart();
        this.dino.jump(this.state, () => this.startGame(), this.doubleJumpUsed, this.canDoubleJump, JUMP_V, DBL_JUMP_V);
        return;
      }
      if (this.state === STATE.IDLE) this.startGame();
      this.dino.jump(this.state, () => this.startGame(), this.doubleJumpUsed, this.canDoubleJump, JUMP_V, DBL_JUMP_V);
    } else if (this.isDuckKey(event)) {
      event.preventDefault();
      initAudio();
      this.canvas.focus();
      if (this.state === STATE.DEAD) return;
      if (this.state === STATE.IDLE) this.startGame();
      this.dino.duck(true, this.state, () => this.startGame());
    }
  };

  private handleKeyUp = (event: KeyboardEvent) => {
    if (this.isDuckKey(event)) {
      event.preventDefault();
      this.dino.duck(false, this.state, () => this.startGame());
    }
  };

  private handlePointerDown = (event: PointerEvent) => {
    event.preventDefault();
    this.canvas.focus();
    initAudio();

    if (this.state === STATE.DEAD) {
      this.restart();
      this.dino.jump(this.state, () => this.startGame(), this.doubleJumpUsed, this.canDoubleJump, JUMP_V, DBL_JUMP_V);
      return;
    }

    if (event.pointerType === "touch") {
      const rect = this.canvas.getBoundingClientRect();
      const scaleY = H / rect.height;
      const gy = (event.clientY - rect.top) * scaleY;
      this.activeTouchPointerId = event.pointerId;
      this.canvas.setPointerCapture(event.pointerId);

      if (gy > GROUND_Y - 20) {
        if (this.state === STATE.IDLE) this.startGame();
        this.dino.duck(true, this.state, () => this.startGame());
      } else {
        if (this.state === STATE.IDLE) this.startGame();
        this.dino.jump(this.state, () => this.startGame(), this.doubleJumpUsed, this.canDoubleJump, JUMP_V, DBL_JUMP_V);
      }
      return;
    }

    if (this.state === STATE.IDLE) this.startGame();
    this.dino.jump(this.state, () => this.startGame(), this.doubleJumpUsed, this.canDoubleJump, JUMP_V, DBL_JUMP_V);
  };

  private handlePointerUp = (event: PointerEvent) => {
    if (event.pointerType !== "touch") return;
    if (this.activeTouchPointerId !== event.pointerId) return;

    this.activeTouchPointerId = null;
    this.dino.duck(false, this.state, () => this.startGame());

    if (this.canvas.hasPointerCapture(event.pointerId)) {
      this.canvas.releasePointerCapture(event.pointerId);
    }
  };

  private handlePointerCancel = (event: PointerEvent) => {
    if (event.pointerType !== "touch") return;
    if (this.activeTouchPointerId !== event.pointerId) return;

    this.activeTouchPointerId = null;
    this.dino.duck(false, this.state, () => this.startGame());

    if (this.canvas.hasPointerCapture(event.pointerId)) {
      this.canvas.releasePointerCapture(event.pointerId);
    }
  };

  private resize = () => {
    const maxWidth = this.isTouchDevice ? Math.min(window.innerWidth - 10, MAX_W) : Math.min(window.innerWidth - 24, MAX_W);
    const scale = maxWidth / MAX_W;
    this.canvas.style.width = `${maxWidth}px`;
    this.canvas.style.height = `${H * scale}px`;
    this.canvas.width = MAX_W;
    this.canvas.height = H;
  };

  start() {
    try {
      const saved = localStorage.getItem("pixelDinoHighMobile");
      if (saved) this.highScore = Number(saved) || 0;
    } catch {
      // Ignore storage errors.
    }

    this.syncHighScore();
    this.resize();
    this.setVisible(this.shieldStatus, false);
    this.setVisible(this.doubleStatus, false);
    this.setHint(this.controlsText, 1);
    this.resetAll();
    this.state = STATE.IDLE;

    window.addEventListener("resize", this.resize);
    window.addEventListener("orientationchange", this.resize);
    document.addEventListener("keydown", this.handleKeyDown);
    document.addEventListener("keyup", this.handleKeyUp);
    this.canvas.addEventListener("pointerdown", this.handlePointerDown);
    this.canvas.addEventListener("pointerup", this.handlePointerUp);
    this.canvas.addEventListener("pointercancel", this.handlePointerCancel);
    this.animationFrame = window.requestAnimationFrame(this.loop);
  }

  stop() {
    window.cancelAnimationFrame(this.animationFrame);
    window.removeEventListener("resize", this.resize);
    window.removeEventListener("orientationchange", this.resize);
    document.removeEventListener("keydown", this.handleKeyDown);
    document.removeEventListener("keyup", this.handleKeyUp);
    this.canvas.removeEventListener("pointerdown", this.handlePointerDown);
    this.canvas.removeEventListener("pointerup", this.handlePointerUp);
    this.canvas.removeEventListener("pointercancel", this.handlePointerCancel);
  }
}
