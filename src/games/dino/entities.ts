/**
 * 像素小恐龙游戏 - 游戏实体类
 */

import { PX, GROUND_Y, STATE, type Rect, type GameState } from "./constants";
import { sfxJump } from "./audio";

export class Dino {
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

  reset(doubleJumpUsed: { value: boolean }, canDoubleJump: { value: boolean }) {
    this.y = GROUND_Y;
    this.vy = 0;
    this.h = 50;
    this.jumping = false;
    this.ducking = false;
    this.legF = 0;
    this.legT = 0;
    this.blink = false;
    this.blinkT = 1.0;
    doubleJumpUsed.value = false;
    canDoubleJump.value = false;
  }

  jump(
    state: GameState,
    startGame: () => void,
    doubleJumpUsed: { value: boolean },
    canDoubleJump: { value: boolean },
    JUMP_V: number,
    DBL_JUMP_V: number
  ) {
    if (state === STATE.IDLE) {
      startGame();
      this._doJump(JUMP_V);
      canDoubleJump.value = true;
      return;
    }

    if (state !== STATE.PLAYING) return;

    if (this.ducking) {
      this.ducking = false;
      this.h = 50;
    }

    if (!this.jumping) {
      this._doJump(JUMP_V);
      canDoubleJump.value = true;
      doubleJumpUsed.value = false;
    } else if (canDoubleJump.value && !doubleJumpUsed.value) {
      this._doJump(DBL_JUMP_V);
      doubleJumpUsed.value = true;
      canDoubleJump.value = false;
    }
  }

  _doJump(v: number) {
    this.vy = v;
    this.jumping = true;
    sfxJump();
  }

  duck(on: boolean, state: GameState, startGame: () => void) {
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

  update(dt: number, speed: number, doubleJumpUsed: { value: boolean }, canDoubleJump: { value: boolean }, GRAVITY: number) {
    if (this.jumping) {
      this.vy += GRAVITY * dt;
      this.y += this.vy * dt;
      if (this.y >= GROUND_Y) {
        this.y = GROUND_Y;
        this.vy = 0;
        this.jumping = false;
        doubleJumpUsed.value = false;
        canDoubleJump.value = false;
      }
    }

    if (this.jumping && this.ducking) {
      this.ducking = false;
      this.h = 50;
    }

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

export class Obstacle {
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

  update(dt: number, speed: number) {
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

export class Item {
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

  update(dt: number, speed: number) {
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
