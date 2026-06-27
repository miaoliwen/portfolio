import { useEffect, useRef } from "react";
import { ArrowLeft, Gamepad2, RotateCcw, Shield, Sparkles } from "lucide-react";
import { GameEngine } from "@/src/games/dino";

export default function GamesPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scoreValueRef = useRef<HTMLDivElement>(null);
  const highScoreValueRef = useRef<HTMLDivElement>(null);
  const speedValueRef = useRef<HTMLDivElement>(null);
  const hintTextRef = useRef<HTMLParagraphElement>(null);
  const shieldStatusRef = useRef<HTMLDivElement>(null);
  const doubleStatusRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

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

    const engine = new GameEngine(canvas, scoreValue, highScoreValue, speedValue, hintText, shieldStatus, doubleStatus);
    engineRef.current = engine;
    engine.start();

    return () => {
      engine.stop();
      engineRef.current = null;
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
            onClick={() => engineRef.current?.restart()}
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
