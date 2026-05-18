import { useEffect, useRef } from "react";
import { ArrowLeft, Gamepad2, RotateCcw, Shield, Sparkles } from "lucide-react";

const STORAGE_KEY = "pixelDinoHighMobile";
const PX = 4;
const MAX_W = 800;
const H = 260;
const GROUND_Y = Math.floor(H * 0.78);
const BASE_SPEED = 330;
const MAX_SPEED = 900;
const SPEED_INC = 0.09;
const GRAVITY = 2520;
const JUMP_V = -750;
const DBL_JUMP_V = -570;
const DOUBLE_DURATION = 5.0;
const STATE = {
  IDLE: "idle",
  PLAYING: "playing",
  DEAD: "dead",
} as const;

type GameState = (typeof STATE)[keyof typeof STATE];
type Rect = { x: number; y: number; w: number; h: number };
type Cloud = { x: number; y: number; w: number; sp: number };
type Particle = { x: number; y: number; vx: number; vy: number; life: number; size: number };

export default function GamesPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scoreValueRef = useRef<HTMLDivElement>(null);
  const highScoreValueRef = useRef<HTMLDivElement>(null);
  const speedValueRef = useRef<HTMLDivElement>(null);
  const hintTextRef = useRef<HTMLParagraphElement>(null);
  const shieldStatusRef = useRef<HTMLDivElement>(null);
  const doubleStatusRef = useRef<HTMLDivElement>(null);
  const restartRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const scoreValue = scoreValueRef.current;
    const highScoreValue = highScoreValueRef.current;
    const speedValue = speedValueRef.current;
    const hintText = hintTextRef.current;
    const shieldStatus = shieldStatusRef.current;
    const doubleStatus = doubleStatusRef.current;

    if (!canvas || !scoreValue || !highScoreValue || !speedValue || !hintText || !shieldStatus || !doubleStatus) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isTouchDevice =
      /Android|iPhone|iPad|iPod|webOS/i.test(navigator.userAgent) ||
      window.innerWidth < 768 ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia("(pointer: coarse)").matches;
    const controlsText = isTouchDevice ? "上半屏跳跃 | 按住下半屏蹲下" : "空格/↑/点击跳跃 | ↓蹲下";

    let audioCtx: AudioContext | null = null;
    let state: GameState = STATE.IDLE;
    let score = 0;
    let highScore = 0;
    let speed = BASE_SPEED;
    let elapsedTime = 0;
    let distance = 0;
    let shakeTimer = 0;
    let shakeInt = 0;
    let flash = 0;
    let doubleJumpUsed = false;
    let canDoubleJump = false;
    let hasShield = false;
    let doubleTimer = 0;
    let lastTime = 0;
    let animationFrame = 0;
    let groundOff = 0;
    let obsTimer = 0;
    let nextObsDelay = 0.8;
    let scoreCheck = 0;
    let pteraOn = false;
    let itemTimer = 0;
    let nextItemDelay = 2.5;
    let activeTouchPointerId: number | null = null;

    class Dino {
      x: number;
      y: number;
      w: number;
      h: number;
      vy: number;
      jumping: boolean;
      ducking: boolean;
      duckH: number;
      legF: number;
      legT: number;
      blink: boolean;
      blinkT: number;
      insetX: number;
      insetY: number;

      constructor() {
        this.x = 90;
        this.y = GROUND_Y;
        this.w = 44;
        this.h = 50;
        this.vy = 0;
        this.jumping = false;
        this.ducking = false;
        this.duckH = 28;
        this.legF = 0;
        this.legT = 0;
        this.blink = false;
        this.blinkT = 1.0;
        this.insetX = 6;
        this.insetY = 4;
      }

      reset() {
        this.y = GROUND_Y;
        this.vy = 0;
        this.h = 50;
        this.jumping = false;
        this.ducking = false;
        this.legF = 0;
        this.legT = 0;
        this.blink = false;
        this.blinkT = 1.0;
        doubleJumpUsed = false;
        canDoubleJump = false;
      }

      jump() {
        if (state === STATE.IDLE) {
          startGame();
          this._doJump(JUMP_V);
          canDoubleJump = true;
          return;
        }

        if (state !== STATE.PLAYING) return;

        if (this.ducking) {
          this.ducking = false;
          this.h = 50;
        }

        if (!this.jumping) {
          this._doJump(JUMP_V);
          canDoubleJump = true;
          doubleJumpUsed = false;
        } else if (canDoubleJump && !doubleJumpUsed) {
          this._doJump(DBL_JUMP_V);
          doubleJumpUsed = true;
          canDoubleJump = false;
        }
      }

      _doJump(v: number) {
        this.vy = v;
        this.jumping = true;
        sfxJump();
      }

      duck(on: boolean) {
        if (state !== STATE.PLAYING && state !== STATE.IDLE) return;

        if (on && !this.jumping) {
          this.ducking = true;
          this.h = this.duckH;
        } else if (!on) {
          this.ducking = false;
          this.h = 50;
        }

        if (on && state === STATE.IDLE) startGame();
      }

      update(dt: number) {
        if (this.jumping) {
          this.vy += GRAVITY * dt;
          this.y += this.vy * dt;
          if (this.y >= GROUND_Y) {
            this.y = GROUND_Y;
            this.vy = 0;
            this.jumping = false;
            doubleJumpUsed = false;
            canDoubleJump = false;
          }
        }

        if (this.jumping && this.ducking) {
          this.ducking = false;
          this.h = 50;
        }

        if (state === STATE.PLAYING || state === STATE.IDLE) {
          if (!this.jumping && !this.ducking) {
            this.legT += dt;
            const legInterval = Math.max(0.05, 0.16 - speed * 0.00013);
            if (this.legT > legInterval) {
              this.legT = 0;
              this.legF = 1 - this.legF;
            }
          } else {
            this.legF = 0;
            this.legT = 0;
          }
        }

        this.blinkT -= dt;
        if (this.blinkT <= 0) {
          this.blink = true;
          this.blinkT = 0.07;
        } else if (this.blink && this.blinkT <= 0.04) {
          this.blink = false;
          this.blinkT = 1.8 + Math.random() * 3.5;
        }
      }

      box(): Rect {
        return {
          x: this.x + this.insetX,
          y: this.y - this.h + this.insetY,
          w: this.w - this.insetX * 2,
          h: this.h - this.insetY * 2,
        };
      }

      draw(renderCtx: CanvasRenderingContext2D) {
        const px = PX;
        const top = this.y - this.h;
        const isDucking = this.ducking;
        let drawY = top;
        if (isDucking) drawY = this.y - this.duckH;

        const x = this.x;
        const y = drawY;
        const set = (c: number, r: number, w = 1, h = 1) => renderCtx.fillRect(x + c * px, y + r * px, w * px, h * px);

        renderCtx.fillStyle = "#2b2b2b";
        if (isDucking) {
          set(0, 3, 2);
          set(2, 2, 5, 2);
          set(7, 3, 4);
          set(1, 4, 4);
          set(5, 3, 1, 2);
          set(6, 5, 3);
          set(9, 4);
          set(1, 1, 3);
          set(2, 0, 2);
          if (!this.blink) {
            renderCtx.fillStyle = "#fff";
            set(3, 1);
            renderCtx.fillStyle = "#2b2b2b";
          }
          set(10, 5, 2);
          set(11, 4);
        } else {
          set(2, 3, 3, 2);
          set(1, 5, 5, 2);
          set(0, 7, 3);
          set(3, 7, 4, 2);
          set(7, 8, 2);
          set(2, 1, 2, 2);
          set(1, 2);
          set(4, 0);
          set(3, 0);
          if (!this.blink) {
            renderCtx.fillStyle = "#fff";
            set(3, 1);
            renderCtx.fillStyle = "#2b2b2b";
          } else {
            set(3, 1);
          }
          set(8, 7, 2);
          set(9, 6);
          set(10, 7);
          set(0, 6);
          set(4, 5);
          if (this.jumping) {
            set(1, 10, 2);
            set(5, 10, 2);
            set(0, 11);
            set(6, 11);
          } else if (this.legF === 0) {
            set(1, 10, 2, 2);
            set(5, 10, 2, 2);
            set(0, 12);
            set(6, 12);
            set(3, 10);
          } else {
            set(1, 10, 2, 2);
            set(5, 10, 2, 2);
            set(2, 12);
            set(5, 12);
            set(1, 12);
          }
        }
      }
    }

    class Obstacle {
      x: number;
      type: string;
      w: number;
      h: number;
      y: number;
      wingF: number;
      wingT: number;

      constructor(type: string, x: number) {
        this.x = x;
        this.type = type;
        this.w = 0;
        this.h = 0;
        this.y = GROUND_Y;
        this.wingF = 0;
        this.wingT = 0;

        switch (type) {
          case "cactus_s":
            this.w = 18;
            this.h = 36;
            break;
          case "cactus_l":
            this.w = 22;
            this.h = 50;
            break;
          case "cactus_g":
            this.w = 38;
            this.h = 44;
            break;
          case "ptera_l":
            this.w = 40;
            this.h = 28;
            this.y = GROUND_Y - 55;
            break;
          case "ptera_h":
            this.w = 40;
            this.h = 28;
            this.y = GROUND_Y - 100;
            break;
        }
      }

      update(dt: number) {
        this.x -= speed * dt;
        if (this.type.startsWith("p")) {
          this.wingT += dt;
          if (this.wingT > 0.12) {
            this.wingT = 0;
            this.wingF = 1 - this.wingF;
          }
        }
      }

      off() {
        return this.x + this.w < -20;
      }

      box(): Rect {
        const ix = this.type.startsWith("p") ? 8 : 4;
        const iy = this.type.startsWith("p") ? 6 : 3;
        return {
          x: this.x + ix,
          y: this.y - this.h + iy,
          w: this.w - ix * 2,
          h: this.h - iy * 2,
        };
      }

      draw(renderCtx: CanvasRenderingContext2D) {
        const px = PX;
        const x = this.x;
        const ty = this.y - this.h;
        renderCtx.fillStyle = "#3a3a3a";

        if (this.type === "cactus_s") {
          const cx = x + 4;
          renderCtx.fillRect(cx, ty + 4, px * 3, px * 5);
          renderCtx.fillRect(cx + px, ty, px, px * 4);
          renderCtx.fillRect(cx - px, ty + px * 4, px, px * 3);
          renderCtx.fillRect(cx + px * 3, ty + px * 3, px, px * 3);
          renderCtx.fillRect(cx - px, this.y - px * 3, px * 5, px * 3);
        } else if (this.type === "cactus_l") {
          const cx = x + 5;
          renderCtx.fillRect(cx, ty + 3, px * 3, px * 7);
          renderCtx.fillRect(cx + px, ty, px, px * 3);
          renderCtx.fillRect(cx - px, ty + px * 5, px, px * 3);
          renderCtx.fillRect(cx + px * 3, ty + px * 4, px, px * 4);
          renderCtx.fillRect(cx - px, this.y - px * 4, px * 5, px * 4);
        } else if (this.type === "cactus_g") {
          const cx = x + 3;
          renderCtx.fillRect(cx, ty + 5, px * 2, px * 4);
          renderCtx.fillRect(cx + px * 4, ty + 3, px * 3, px * 6);
          renderCtx.fillRect(cx + px * 2, ty + px * 2, px, px * 2);
          renderCtx.fillRect(cx + px * 5, ty, px, px * 3);
          renderCtx.fillRect(cx - px, ty + px * 4, px * 8, px * 4);
          renderCtx.fillRect(cx - px, this.y - px * 2, px * 8, px * 2);
        } else if (this.type.startsWith("p")) {
          const py = ty;
          const up = this.wingF === 0;
          renderCtx.fillRect(x + px * 3, py + px * 2, px * 4, px * 2);
          renderCtx.fillRect(x + px * 7, py + px, px * 2, px * 2);
          renderCtx.fillRect(x + px * 9, py + px, px, px);
          renderCtx.fillRect(x + px * 9, py + px * 2, px * 1.5, px);
          if (up) {
            renderCtx.fillRect(x + px * 2, py - px * 2, px * 2, px * 4);
            renderCtx.fillRect(x + px * 4, py - px, px * 3, px * 3);
            renderCtx.fillRect(x + px, py, px, px * 2);
          } else {
            renderCtx.fillRect(x + px * 3, py + px * 3, px * 2, px * 3);
            renderCtx.fillRect(x + px * 5, py + px, px * 3, px * 2);
            renderCtx.fillRect(x + px * 2, py + px * 4, px, px * 2);
          }
          renderCtx.fillRect(x, py + px * 3, px * 3, px);
          renderCtx.fillRect(x - px, py + px * 2, px, px);
        }
      }
    }

    class Item {
      type: string;
      x: number;
      y: number;
      w: number;
      h: number;
      floatOffset: number;
      floatDir: number;

      constructor(type: string, x: number, y: number) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.w = 16;
        this.h = 16;
        this.floatOffset = 0;
        this.floatDir = 1;
        if (type === "shield" || type === "double") {
          this.w = 18;
          this.h = 18;
        }
      }

      update(dt: number) {
        this.x -= speed * dt;
        if (this.type === "coin") {
          this.floatOffset += 9 * dt * this.floatDir;
          if (Math.abs(this.floatOffset) > 4) this.floatDir *= -1;
        }
      }

      off() {
        return this.x + this.w < -20;
      }

      box(): Rect {
        return { x: this.x + 2, y: this.y - this.h + 2, w: this.w - 4, h: this.h - 4 };
      }

      draw(renderCtx: CanvasRenderingContext2D) {
        const x = this.x;
        const y = this.y - this.h + (this.type === "coin" ? this.floatOffset : 0);
        if (this.type === "coin") {
          renderCtx.fillStyle = "#f5b642";
          renderCtx.fillRect(x + 6, y + 2, 4, 12);
          renderCtx.fillRect(x + 2, y + 4, 4, 8);
          renderCtx.fillRect(x + 10, y + 4, 4, 8);
          renderCtx.fillStyle = "#fff";
          renderCtx.fillRect(x + 6, y + 4, 2, 2);
        } else if (this.type === "shield") {
          renderCtx.fillStyle = "#4a90e2";
          renderCtx.fillRect(x + 4, y + 1, 10, 14);
          renderCtx.fillRect(x + 2, y + 3, 2, 10);
          renderCtx.fillRect(x + 14, y + 3, 2, 10);
          renderCtx.fillRect(x + 6, y - 1, 6, 4);
          renderCtx.fillStyle = "#fff";
          renderCtx.fillRect(x + 7, y + 2, 4, 4);
        } else if (this.type === "double") {
          renderCtx.fillStyle = "#e2950f";
          renderCtx.fillRect(x + 2, y + 4, 12, 8);
          renderCtx.fillRect(x + 4, y + 2, 2, 12);
          renderCtx.fillRect(x + 10, y + 2, 2, 12);
          renderCtx.fillStyle = "#fff";
          renderCtx.fillRect(x + 6, y + 5, 4, 6);
          renderCtx.fillStyle = "#e2950f";
          renderCtx.fillRect(x + 8, y + 3, 2, 2);
          renderCtx.fillRect(x + 5, y + 8, 2, 2);
          renderCtx.fillRect(x + 9, y + 10, 2, 2);
        }
      }
    }

    let dino = new Dino();
    let obstacles: Obstacle[] = [];
    let items: Item[] = [];
    let clouds: Cloud[] = [];
    let particles: Particle[] = [];

    const setHint = (text: string, opacity = 1) => {
      hintText.textContent = text;
      hintText.style.opacity = String(opacity);
    };

    const setVisible = (element: HTMLDivElement, visible: boolean) => {
      element.style.display = visible ? "flex" : "none";
    };

    const syncScore = () => {
      scoreValue.textContent = String(score);
    };

    const syncHighScore = () => {
      highScoreValue.textContent = String(highScore);
    };

    const syncSpeed = () => {
      speedValue.textContent = `${(Math.round((speed / BASE_SPEED) * 10) / 10).toFixed(1).replace(/\.0$/, "")}x`;
    };

    const addScore = (points: number) => {
      score += doubleTimer > 0 ? points * 2 : points;
      syncScore();
    };

    const initAudio = () => {
      if (!audioCtx) {
        const AudioContextCtor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (AudioContextCtor) {
          audioCtx = new AudioContextCtor();
        }
      }

      if (audioCtx?.state === "suspended") {
        void audioCtx.resume();
      }
    };

    const beep = (frequency: number, duration: number, type: OscillatorType = "square", volume = 0.05) => {
      if (!audioCtx) return;

      try {
        const oscillator = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.3, audioCtx.currentTime + duration);
        gain.gain.setValueAtTime(volume, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
        oscillator.connect(gain);
        gain.connect(audioCtx.destination);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + duration);
      } catch {
        // Ignore audio failures in restricted browsers.
      }
    };

    const sfxJump = () => {
      beep(620, 0.1);
      beep(880, 0.06);
    };

    const sfxCoin = () => {
      beep(1200, 0.08, "square", 0.07);
      beep(1500, 0.06, "square", 0.05);
    };

    const sfxPowerup = () => {
      beep(800, 0.1, "triangle", 0.08);
      beep(1100, 0.08, "triangle", 0.06);
    };

    const sfxHit = () => {
      beep(80, 0.3, "triangle", 0.1);
      beep(50, 0.2, "sawtooth", 0.07);
    };

    const sfxScore = () => {
      beep(1050, 0.06);
    };

    const resetAll = () => {
      dino = new Dino();
      obstacles = [];
      items = [];
      clouds = [];
      particles = [];
      groundOff = 0;
      obsTimer = 0;
      nextObsDelay = 0.8;
      score = 0;
      speed = BASE_SPEED;
      elapsedTime = 0;
      distance = 0;
      scoreCheck = 0;
      pteraOn = false;
      doubleJumpUsed = false;
      canDoubleJump = false;
      shakeTimer = 0;
      shakeInt = 0;
      flash = 0;
      hasShield = false;
      doubleTimer = 0;
      itemTimer = 0;
      nextItemDelay = 2.5;
      syncScore();
      syncSpeed();
      setVisible(shieldStatus, false);
      setVisible(doubleStatus, false);
      setHint(controlsText, 1);

      for (let index = 0; index < 5; index += 1) {
        clouds.push({
          x: Math.random() * MAX_W,
          y: 25 + Math.random() * 80,
          w: 50 + Math.random() * 80,
          sp: 40 + Math.random() * 70,
        });
      }

      canvas.focus();
    };

    const startGame = () => {
      if (state === STATE.PLAYING) return;
      initAudio();
      state = STATE.PLAYING;
      if (score === 0 && obstacles.length === 0) {
        resetAll();
      } else {
        dino.reset();
      }
      setHint(controlsText, 0.4);
    };

    const endGame = () => {
      if (state === STATE.DEAD) return;
      state = STATE.DEAD;
      sfxHit();
      shakeTimer = 0.35;
      shakeInt = 8;
      flash = 0.5;
      if (score > highScore) {
        highScore = score;
        try {
          localStorage.setItem(STORAGE_KEY, String(highScore));
        } catch {
          // Ignore storage errors.
        }
        syncHighScore();
      }
      setHint("💀 游戏结束 | 点击屏幕重新开始", 1);
    };

    const restart = () => {
      if (state === STATE.DEAD) {
        resetAll();
        state = STATE.PLAYING;
        setHint(controlsText, 0.5);
      } else if (state === STATE.IDLE) {
        startGame();
      }
    };

    restartRef.current = restart;

    const collides = (a: Rect, b: Rect) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

    const spawnObstacle = () => {
      const roll = Math.random();
      let type: string;
      if (!pteraOn || roll < 0.6) {
        const cactusRoll = Math.random();
        type = cactusRoll < 0.4 ? "cactus_s" : cactusRoll < 0.75 ? "cactus_l" : "cactus_g";
      } else {
        type = Math.random() < 0.5 ? "ptera_l" : "ptera_h";
      }
      obstacles.push(new Obstacle(type, MAX_W + 20 + Math.random() * 60));
    };

    const spawnItem = () => {
      const roll = Math.random();
      let type: string;
      if (roll < 0.7) type = "coin";
      else if (roll < 0.85) type = "shield";
      else type = "double";

      const yPos = type === "coin" ? GROUND_Y - 35 - Math.random() * 30 : GROUND_Y - 45;
      items.push(new Item(type, MAX_W + 50 + Math.random() * 80, yPos));
    };

    const update = (dt: number) => {
      if (dt > 0.1) dt = 0.1;

      if (state === STATE.PLAYING) {
        speed = Math.min(MAX_SPEED, BASE_SPEED + elapsedTime * SPEED_INC);
        distance += speed * dt;
        elapsedTime += dt;

        if (distance - scoreCheck >= 80) {
          scoreCheck += 80;
          addScore(1);
          if (score % 10 === 0) sfxScore();
          if (score >= 300) pteraOn = true;
        }
        syncSpeed();

        if (doubleTimer > 0) {
          doubleTimer -= dt;
          setVisible(doubleStatus, doubleTimer > 0);
        } else {
          setVisible(doubleStatus, false);
        }

        setVisible(shieldStatus, hasShield);
        dino.update(dt);

        for (const obstacle of obstacles) obstacle.update(dt);
        obstacles = obstacles.filter((obstacle) => !obstacle.off());

        obsTimer += dt;
        if (obsTimer >= nextObsDelay) {
          obsTimer = 0;
          nextObsDelay = Math.max(0.55, 1.3 - speed * 0.001) + Math.random() * Math.max(0.9, 2.2 - speed * 0.0015);
          if (obstacles.length < 3) spawnObstacle();
        }

        for (const item of items) item.update(dt);
        items = items.filter((item) => !item.off());

        itemTimer += dt;
        if (itemTimer >= nextItemDelay) {
          itemTimer = 0;
          nextItemDelay = 2.0 + Math.random() * 4.0;
          if (items.length < 5) spawnItem();
        }

        const dBox = dino.box();
        for (let index = obstacles.length - 1; index >= 0; index -= 1) {
          const obstacle = obstacles[index];
          if (collides(dBox, obstacle.box())) {
            if (hasShield) {
              hasShield = false;
              sfxPowerup();
              setVisible(shieldStatus, false);
              obstacles.splice(index, 1);
              continue;
            }
            endGame();
            return;
          }
        }

        for (let index = items.length - 1; index >= 0; index -= 1) {
          const item = items[index];
          if (collides(dBox, item.box())) {
            if (item.type === "coin") {
              addScore(10);
              sfxCoin();
            } else if (item.type === "shield") {
              hasShield = true;
              sfxPowerup();
              setVisible(shieldStatus, true);
            } else if (item.type === "double") {
              doubleTimer = DOUBLE_DURATION;
              sfxPowerup();
              setVisible(doubleStatus, true);
            }
            items.splice(index, 1);
          }
        }

        groundOff = (groundOff + speed * dt) % (PX * 16);
      } else if (state === STATE.DEAD) {
        speed *= Math.pow(0.08, dt);
        if (speed < 0.5) speed = 0;
        syncSpeed();

        for (const obstacle of obstacles) obstacle.update(dt);
        obstacles = obstacles.filter((obstacle) => !obstacle.off());

        for (const item of items) item.update(dt);
        items = items.filter((item) => !item.off());

        dino.update(dt);
        groundOff = (groundOff + speed * dt) % (PX * 16);

        if (shakeTimer > 0) {
          shakeTimer -= dt;
          shakeInt *= Math.pow(0.15, dt);
        }

        if (flash > 0) {
          flash -= 1.5 * dt;
          if (flash < 0) flash = 0;
        }
      } else if (state === STATE.IDLE) {
        dino.legT += dt;
        if (dino.legT > 0.4) {
          dino.legT = 0;
          dino.legF = 1 - dino.legF;
        }

        dino.blinkT -= dt;
        if (dino.blinkT <= 0) {
          dino.blink = true;
          dino.blinkT = 0.07;
        } else if (dino.blink && dino.blinkT <= 0.04) {
          dino.blink = false;
          dino.blinkT = 2.5 + Math.random() * 3;
        }
      }

      for (const cloud of clouds) {
        cloud.x -= cloud.sp * dt;
        if (cloud.x + cloud.w < -20) {
          cloud.x = MAX_W + 150;
          cloud.y = 25 + Math.random() * 80;
        }
      }

      for (const particle of particles) {
        particle.x += particle.vx * dt * 60;
        particle.y += particle.vy * dt * 60;
        particle.vy += 18 * dt;
        particle.life -= dt;
      }
      particles = particles.filter((particle) => particle.life > 0);
    };

    const resize = () => {
      const maxWidth = isTouchDevice ? Math.min(window.innerWidth - 10, MAX_W) : Math.min(window.innerWidth - 24, MAX_W);
      const scale = maxWidth / MAX_W;
      canvas.style.width = `${maxWidth}px`;
      canvas.style.height = `${H * scale}px`;
      canvas.width = MAX_W;
      canvas.height = H;
    };

    const draw = () => {
      ctx.clearRect(0, 0, MAX_W, H);

      let sx = 0;
      let sy = 0;
      if (shakeTimer > 0 && shakeInt > 0.3) {
        sx = (Math.random() - 0.5) * shakeInt * 2;
        sy = (Math.random() - 0.5) * shakeInt * 2;
      }

      ctx.save();
      ctx.translate(sx, sy);
      ctx.fillStyle = "#fafaf8";
      ctx.fillRect(-10, -10, MAX_W + 20, H + 20);

      for (const cloud of clouds) {
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
      for (let x = -groundOff; x < MAX_W + PX * 16; x += PX * 16) {
        if (x % (PX * 16) < PX * 3) ctx.fillRect(x, GROUND_Y + 3, PX * 2, PX);
      }

      ctx.fillStyle = "#e8e6e0";
      ctx.fillRect(0, GROUND_Y + 1, MAX_W, H - GROUND_Y);

      for (const particle of particles) {
        ctx.fillStyle = "#aaa";
        ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
      }

      for (const obstacle of obstacles) obstacle.draw(ctx);
      for (const item of items) item.draw(ctx);
      dino.draw(ctx);

      if (state === STATE.DEAD) {
        ctx.fillStyle = `rgba(255,255,255,${0.25 + flash})`;
        ctx.fillRect(0, 0, MAX_W, H);
        ctx.fillStyle = "#333";
        ctx.font = 'bold 28px "Courier New"';
        ctx.textAlign = "center";
        ctx.fillText("游戏结束", MAX_W / 2, H / 2 - 20);
        ctx.font = '16px "Courier New"';
        ctx.fillText(`得分: ${score}`, MAX_W / 2, H / 2 + 20);
        if (score >= highScore && score > 0) {
          ctx.fillStyle = "#c9a145";
          ctx.fillText("🏆 新纪录！", MAX_W / 2, H / 2 + 50);
        }
        ctx.textAlign = "start";
      }

      ctx.restore();

      ctx.fillStyle = "#333";
      ctx.font = 'bold 18px "Courier New"';
      ctx.textAlign = "right";
      ctx.fillText(String(score).padStart(5, "0"), MAX_W - 20, 35);
      if (highScore > 0) {
        ctx.fillStyle = "#c9a145";
        ctx.font = '10px "Courier New"';
        ctx.fillText(`HI ${String(highScore).padStart(5, "0")}`, MAX_W - 20, 50);
      }
      ctx.textAlign = "start";
    };

    const loop = (timestamp: number) => {
      if (!lastTime) lastTime = timestamp;
      const dt = (timestamp - lastTime) / 1000;
      lastTime = timestamp;
      if (dt > 0 && dt < 0.5) update(dt);
      draw();
      animationFrame = window.requestAnimationFrame(loop);
    };

    const isJumpKey = (event: KeyboardEvent) =>
      event.key === " " || event.code === "Space" || event.key === "ArrowUp" || event.code === "ArrowUp" || event.code === "KeyW";
    const isDuckKey = (event: KeyboardEvent) => event.key === "ArrowDown" || event.code === "ArrowDown" || event.code === "KeyS";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isJumpKey(event)) {
        event.preventDefault();
        initAudio();
        canvas.focus();
        if (state === STATE.DEAD) {
          restart();
          dino.jump();
          return;
        }
        if (state === STATE.IDLE) startGame();
        dino.jump();
      } else if (isDuckKey(event)) {
        event.preventDefault();
        initAudio();
        canvas.focus();
        if (state === STATE.DEAD) return;
        if (state === STATE.IDLE) startGame();
        dino.duck(true);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (isDuckKey(event)) {
        event.preventDefault();
        dino.duck(false);
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      event.preventDefault();
      canvas.focus();
      initAudio();

      if (state === STATE.DEAD) {
        restart();
        dino.jump();
        return;
      }

      if (event.pointerType === "touch") {
        const rect = canvas.getBoundingClientRect();
        const scaleY = H / rect.height;
        const gy = (event.clientY - rect.top) * scaleY;
        activeTouchPointerId = event.pointerId;
        canvas.setPointerCapture(event.pointerId);

        if (gy > GROUND_Y - 20) {
          if (state === STATE.IDLE) startGame();
          dino.duck(true);
        } else {
          if (state === STATE.IDLE) startGame();
          dino.jump();
        }
        return;
      }

      if (state === STATE.IDLE) startGame();
      dino.jump();
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (event.pointerType !== "touch") return;
      if (activeTouchPointerId !== event.pointerId) return;

      activeTouchPointerId = null;
      dino.duck(false);

      if (canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
      }
    };

    const handlePointerCancel = (event: PointerEvent) => {
      if (event.pointerType !== "touch") return;
      if (activeTouchPointerId !== event.pointerId) return;

      activeTouchPointerId = null;
      dino.duck(false);

      if (canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
      }
    };

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) highScore = Number(saved) || 0;
    } catch {
      // Ignore storage errors.
    }

    syncHighScore();
    resize();
    setVisible(shieldStatus, false);
    setVisible(doubleStatus, false);
    setHint(controlsText, 1);
    resetAll();
    state = STATE.IDLE;

    window.addEventListener("resize", resize);
    window.addEventListener("orientationchange", resize);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("pointercancel", handlePointerCancel);
    animationFrame = window.requestAnimationFrame(loop);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("orientationchange", resize);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("pointercancel", handlePointerCancel);
      restartRef.current = null;
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#e8e2d2] px-3 py-4 text-[#3d3a33] sm:px-4 sm:py-6 md:px-8 lg:px-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[-10%] h-72 w-72 rounded-full bg-[#f7d9a4]/50 blur-3xl" />
        <div className="absolute right-[-8%] top-[18%] h-80 w-80 rounded-full bg-[#d8c4a8]/50 blur-3xl" />
        <div className="absolute bottom-[-12%] left-[18%] h-96 w-96 rounded-full bg-[#fff6e8]/80 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(90,70,40,0.08)_1px,transparent_0)] bg-[length:24px_24px] opacity-35" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-2rem)] max-w-6xl flex-col">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 pt-1 sm:pb-5">
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-[#cdbca5] bg-white/75 px-4 py-2 text-sm font-medium text-[#3d3a33] shadow-[0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur-sm transition-transform hover:-translate-y-0.5"
          >
            <ArrowLeft className="h-4 w-4" />
            返回主页
          </a>

          <div className="inline-flex items-center gap-2 rounded-full border border-[#cdbca5] bg-[#fffaf0]/80 px-4 py-2 text-sm font-semibold text-[#5d4d36] shadow-[0_8px_30px_rgba(0,0,0,0.05)] backdrop-blur-sm">
            <Gamepad2 className="h-4 w-4" />
            像素小恐龙跳跳跳
          </div>

          <button
            type="button"
            onClick={() => restartRef.current?.()}
            className="inline-flex items-center gap-2 rounded-full border border-[#cdbca5] bg-[#3d3a33] px-4 py-2 text-sm font-medium text-white shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-transform hover:-translate-y-0.5"
          >
            <RotateCcw className="h-4 w-4" />
            重新开始
          </button>
        </div>

        <div className="flex flex-1 items-center justify-center pb-2">
          <div className="w-full rounded-[28px] border border-[#d7c8b4] bg-white/82 p-3 shadow-[0_20px_80px_rgba(54,42,21,0.12)] backdrop-blur-xl sm:p-4 md:p-5 lg:p-6">
            <canvas
              ref={canvasRef}
              tabIndex={0}
              aria-label="像素小恐龙游戏画布"
              className="block w-full rounded-[20px] border border-[#e1d5c6] bg-[#fafaf8] outline-none"
              style={{ touchAction: "none" }}
            />

            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-[#d8c8b6] bg-[#fffdf8] px-3 py-2 shadow-sm">
                <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9c907d]">🏆 分数</div>
                <div ref={scoreValueRef} className="mt-1 text-lg font-bold text-[#3d3a33]">
                  0
                </div>
              </div>

              <div className="rounded-2xl border border-[#d8c8b6] bg-[#fffdf8] px-3 py-2 shadow-sm">
                <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9c907d]">👑 最高</div>
                <div ref={highScoreValueRef} className="mt-1 text-lg font-bold text-[#c9a145]">
                  0
                </div>
              </div>

              <div className="rounded-2xl border border-[#d8c8b6] bg-[#fffdf8] px-3 py-2 shadow-sm">
                <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9c907d]">⚡ 速度</div>
                <div ref={speedValueRef} className="mt-1 text-lg font-bold text-[#3d3a33]">
                  1x
                </div>
              </div>

              <div className="flex gap-2 sm:col-span-2 lg:col-span-1 lg:flex-col">
                <div ref={shieldStatusRef} className="hidden flex-1 items-center justify-center rounded-2xl border border-[#bbd5ff] bg-[#eef5ff] px-3 py-2 shadow-sm">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#2f6fb8]">
                    <Shield className="h-4 w-4" />
                    护盾
                  </div>
                </div>
                <div ref={doubleStatusRef} className="hidden flex-1 items-center justify-center rounded-2xl border border-[#ffd58c] bg-[#fff9ed] px-3 py-2 shadow-sm">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#be7a05]">
                    <Sparkles className="h-4 w-4" />
                    2x
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 grid gap-2 sm:hidden">
              <div className="rounded-2xl border border-dashed border-[#d9c8b4] bg-[#f7f2e8] px-3 py-2 text-center text-xs font-medium text-[#8b7b68]">
                👆 点击上半屏跳跃
              </div>
              <div className="rounded-2xl border border-dashed border-[#d9c8b4] bg-[#f7f2e8] px-3 py-2 text-center text-xs font-medium text-[#8b7b68]">
                👇 按住下半屏蹲下
              </div>
            </div>

            <p ref={hintTextRef} className="mt-3 text-center text-xs leading-6 tracking-[0.08em] text-[#8b7b68] sm:text-sm">
              空格/↑/点击跳跃 | ↓蹲下 | 手机上半屏跳跃 / 下半屏按住蹲下
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}