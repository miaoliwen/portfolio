/**
 * 像素小恐龙游戏 - 常量和类型定义
 */

export const STORAGE_KEY = "pixelDinoHighMobile";
export const PX = 4;
export const MAX_W = 800;
export const H = 260;
export const GROUND_Y = Math.floor(H * 0.78);
export const BASE_SPEED = 330;
export const MAX_SPEED = 900;
export const SPEED_INC = 0.09;
export const GRAVITY = 2520;
export const JUMP_V = -750;
export const DBL_JUMP_V = -570;
export const DOUBLE_DURATION = 5.0;

export const STATE = {
  IDLE: "idle",
  PLAYING: "playing",
  DEAD: "dead",
} as const;

export type GameState = (typeof STATE)[keyof typeof STATE];
export type Rect = { x: number; y: number; w: number; h: number };
export type Cloud = { x: number; y: number; w: number; sp: number };
export type Particle = { x: number; y: number; vx: number; vy: number; life: number; size: number };
