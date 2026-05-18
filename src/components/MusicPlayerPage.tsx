import { useEffect, useMemo, useRef, useState, type PointerEventHandler } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Pause, Play, Send, Shield, SkipBack, SkipForward, Trash2, Type, X } from "lucide-react";

type LyricLine = { time: number; text: string };
type HandwritingStyle = "shoujin" | "round" | "cursive";
type DiaryEntry = {
  id: string;
  content: string;
  date: string;
  style: HandwritingStyle;
  rotate: number;
};

type Track = {
  title: string;
  artist: string;
  cover: string;
  localSrc: string;
  remoteSrc?: string;
  lyrics: LyricLine[];
};

const tracks: Track[] = [
  {
    title: "Augest",
    artist: "Ólafur Arnalds",
    cover: "/images/Image_1776083567244_724.jpg",
    localSrc: "/audio/augest.mp3",
    remoteSrc: "https://cdn.pixabay.com/audio/2022/11/22/audio_a0f7c1f0c2.mp3",
    lyrics: [
      { time: 0, text: "The city glows in silver lines" },
      { time: 10, text: "Soft pulse moving through the sky" },
      { time: 20, text: "Falling into midnight tides" },
      { time: 30, text: "Your voice drifts with neon light" },
      { time: 42, text: "Every beat bends into time" },
    ],
  },
  {
    title: "Augest",
    artist: "Ólafur Arnalds",
    cover: "/images/mmexport1776082392442.jpg",
    localSrc: "/audio/augest.mp3",
    remoteSrc: "https://cdn.pixabay.com/audio/2023/06/06/audio_248f5f4198.mp3",
    lyrics: [
      { time: 0, text: "Clouds melt into mirrored seas" },
      { time: 11, text: "We float above electric breeze" },
      { time: 24, text: "Breathing in the morning glow" },
      { time: 35, text: "Slowly letting all things flow" },
      { time: 46, text: "Stay until the colors sleep" },
    ],
  },
];

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds)) return "0:00";
  const whole = Math.max(0, Math.floor(seconds));
  const m = Math.floor(whole / 60);
  const s = String(whole % 60).padStart(2, "0");
  return `${m}:${s}`;
};

export default function MusicPlayerPage() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [content, setContent] = useState("");
  const [style, setStyle] = useState<HandwritingStyle>("shoujin");
  const [isEditorFocused, setIsEditorFocused] = useState(false);

  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubTarget, setScrubTarget] = useState(0);
  const [visualProgress, setVisualProgress] = useState(0);
  const [trackError, setTrackError] = useState<string>("");

  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const localTriedRef = useRef(false);

  const track = tracks[trackIndex];
  const playbackTime = isScrubbing ? visualProgress : currentTime;
  const styleClass = {
    shoujin: "font-serif tracking-wide",
    round: "italic",
    cursive: "font-serif italic",
  };
  const styleOptions: { id: HandwritingStyle; label: string }[] = [
    { id: "shoujin", label: "瘦金体" },
    { id: "round", label: "圆体" },
    { id: "cursive", label: "行书" },
  ];

  const activeLyric = useMemo(() => {
    const lines = track.lyrics;
    if (!lines.length) return "";
    let current = lines[0].text;
    for (const line of lines) {
      if (playbackTime >= line.time) current = line.text;
    }
    return current;
  }, [playbackTime, track.lyrics]);

  useEffect(() => {
    try {
      localStorage.removeItem("parchment_diary_entries");
      sessionStorage.removeItem("parchment_diary_entries");
    } catch {
      // Ignore storage cleanup issues in locked-down browsers.
    }
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      if (!isScrubbing) {
        setCurrentTime(audio.currentTime);
        setVisualProgress(audio.currentTime);
      }
    };
    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    const onEnded = () => handleNext();

    const onError = () => {
      if (!localTriedRef.current && track.remoteSrc) {
        localTriedRef.current = true;
        audio.src = track.remoteSrc;
        audio.load();
        void audio.play().catch(() => setIsPlaying(false));
        return;
      }
      setTrackError("本地与远程音源都不可用，请替换为有效音频地址。");
      setIsPlaying(false);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
  }, [isScrubbing, track.remoteSrc]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    localTriedRef.current = false;
    setTrackError("");
    setCurrentTime(0);
    setVisualProgress(0);
    setScrubTarget(0);
    audio.src = track.localSrc;
    audio.load();
    if (isPlaying) {
      void audio.play().catch(() => setIsPlaying(false));
    }
  }, [trackIndex, track.localSrc, isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      void audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    const animate = () => {
      setVisualProgress((prev) => {
        if (!isScrubbing) return prev;
        const diff = scrubTarget - prev;
        if (Math.abs(diff) < 0.02) return scrubTarget;
        return prev + diff * 0.2;
      });
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isScrubbing, scrubTarget]);

  const handleToggle = () => setIsPlaying((prev) => !prev);

  const handleNext = () => setTrackIndex((prev) => (prev + 1) % tracks.length);
  const handlePrev = () => setTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
  const handleSave = () => {
    if (!content.trim()) return;
    const newEntry: DiaryEntry = {
      id: crypto.randomUUID(),
      content,
      style,
      date: new Intl.DateTimeFormat("zh-CN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
      }).format(new Date()),
      rotate: (Math.random() - 0.5) * 4,
    };
    setEntries((prev) => [newEntry, ...prev]);
    setContent("");
  };

  const deleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  };

  const percent = duration ? (playbackTime / duration) * 100 : 0;

  const positionToTime = (x: number) => {
    const bar = progressRef.current;
    if (!bar || duration <= 0) return 0;
    const rect = bar.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (x - rect.left) / rect.width));
    return p * duration;
  };

  const onPointerDown: PointerEventHandler<HTMLDivElement> = (e) => {
    if (!audioRef.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const t = positionToTime(e.clientX);
    setIsScrubbing(true);
    setScrubTarget(t);
    setVisualProgress(t);
    audioRef.current.currentTime = t;
  };

  const onPointerMove: PointerEventHandler<HTMLDivElement> = (e) => {
    if (!isScrubbing || !audioRef.current) return;
    const t = positionToTime(e.clientX);
    setScrubTarget(t);
    audioRef.current.currentTime = t;
  };

  const onPointerUp: PointerEventHandler<HTMLDivElement> = (e) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    setIsScrubbing(false);
  };

  const panelTransition = {
    type: "spring" as const,
    duration: 0.4,
    bounce: 0.26,
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#e8e2d2] px-3 py-10 text-[#3d3a33] sm:px-4 sm:py-12 md:px-12 md:py-16 lg:px-24">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 50%, transparent 80%, rgba(0,0,0,0.03) 100%), repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.01) 2px, rgba(0,0,0,0.01) 4px)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-[1400px] pb-56 sm:pb-60 md:pb-44">
        <header className="mb-10 text-center sm:mb-12 md:mb-16">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="logo-underline">
            <span className="text-lg font-light tracking-[3px] uppercase font-serif sm:text-xl md:text-2xl md:tracking-[4px]">碎碎念 / PARCHMENT DIARY</span>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-3 text-[11px] italic opacity-60 font-serif sm:mt-4 sm:text-[12px]"
          >
            二零二六年 · 写给此刻
          </motion.p>
        </header>

        <section className="mb-10 mx-auto max-w-2xl relative sm:mb-12 md:mb-14">
          <div className={`relative p-4 sm:p-5 md:p-6 card-paper transition-all duration-500 ${isEditorFocused ? "shadow-xl scale-[1.01]" : "opacity-95"}`}>
            <div className="mb-4 flex items-start gap-2 rounded-2xl border border-[#bfa88855] bg-[#f8f1e3] px-3 py-3 text-[12px] leading-5 text-[#5a4a34]">
              <Shield className="mt-0.5 h-4 w-4 shrink-0 text-[#8b5f2c]" />
              <p>Privacy mode is on. Notes remain only in this session and are removed when you refresh or close the page.</p>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setIsEditorFocused(true)}
              onBlur={() => setIsEditorFocused(false)}
              placeholder="此时此地，书写心绪..."
              className={`w-full min-h-[180px] text-[15px] leading-7 sm:min-h-[190px] sm:text-base resize-none bg-transparent border-none outline-none placeholder:italic placeholder:opacity-40 ${
                !isEditorFocused && content ? styleClass[style] : "font-serif"
              }`}
            />
            <div className="mt-4 flex flex-col gap-3 border-t border-[#3d3a331f] pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {styleOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setStyle(option.id)}
                    className={`flex min-h-9 items-center gap-1 rounded-full px-3 text-[11px] uppercase tracking-widest transition-all sm:min-h-8 sm:px-2 sm:text-[10px] ${
                      style === option.id ? "text-[#8b5f2c] font-bold" : "opacity-40 hover:opacity-100"
                    }`}
                  >
                    <Type size={12} />
                    {option.label}
                  </button>
                ))}
              </div>
              <button
                onClick={handleSave}
                disabled={!content.trim()}
                className="group flex min-h-10 w-full items-center justify-center gap-2 rounded-full bg-[#3d3a33] px-6 py-2 text-[11px] uppercase tracking-[0.2em] text-[#fdfaf0] transition-colors hover:bg-[#4a3f35] disabled:opacity-30 sm:min-h-0 sm:w-auto sm:text-[10px]"
              >
                <span>封存入档</span>
                <Send size={12} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            </div>
          </div>
        </section>

        <section className="columns-1 gap-7 space-y-7 sm:gap-8 sm:space-y-8 md:gap-10 md:space-y-10 md:columns-2 lg:columns-3">
          <AnimatePresence mode="popLayout">
            {entries.map((entry) => {
              const clipPathIndex = (parseInt(entry.id.slice(0, 8), 16) % 4) + 1;
              return (
                <motion.article
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9, rotate: entry.rotate - 2 }}
                  animate={{ opacity: 1, scale: 1, rotate: entry.rotate }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  whileHover={{ y: -3 }}
                  className={`group relative mb-7 break-inside-avoid card-paper p-5 pb-10 sm:mb-8 sm:p-6 md:mb-10 md:p-8 md:pb-12 clip-path-${clipPathIndex}`}
                >
                  <div className="mb-5 flex items-center justify-between border-b border-[#3d3a331a] pb-2 text-[11px] uppercase tracking-widest opacity-55 font-serif">
                    <span>#{entry.id.slice(0, 4)}</span>
                    <span className="italic">{entry.date}</span>
                  </div>
                  <div className={`text-[16px] leading-[1.75] sm:text-[17px] md:text-[18px] md:leading-[1.65] text-[#4a453c] ${styleClass[entry.style]} handwriting-transition`}>
                    {entry.content.split("\n").map((line, index) => (
                      <p key={`${entry.id}-${index}`} className="mb-2">
                        {line}
                      </p>
                    ))}
                  </div>
                  <div className="mt-6 border-t border-[#3d3a331a] pt-3 text-[11px] italic opacity-40 font-serif sm:mt-8 sm:pt-4">- 记于此间</div>
                  <button
                    onClick={() => {
                      const shouldDelete = window.confirm("确认焚毁这条碎碎念吗？");
                      if (shouldDelete) {
                        deleteEntry(entry.id);
                      }
                    }}
                    className="absolute bottom-4 right-4 inline-flex min-h-8 items-center gap-1 rounded-full border border-[#3d3a332a] bg-[#f7efe0] px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-[#5a4a34] opacity-90 transition-all duration-300 hover:bg-[#ebdfc6] sm:right-6 md:opacity-0 md:group-hover:opacity-100"
                    aria-label="删除这条碎碎念"
                  >
                    <Trash2 className="h-3 w-3" />
                    [ 焚毁 ]
                  </button>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </section>

        {entries.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-28 text-center opacity-30">
            <p className="font-serif italic text-lg">这里的草稿已经随风而逝...</p>
            <p className="mt-2 text-[10px] uppercase tracking-widest">The pages are waiting to be filled</p>
          </motion.div>
        )}
      </div>

      <motion.section
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={
          isMinimized
            ? {
                opacity: 1,
                width: 56,
                height: 56,
                borderRadius: "9999px",
              }
            : {
                opacity: 1,
                width: "min(360px, calc(100vw - 1.5rem))",
                height: 210,
                borderRadius: "14px",
              }
        }
        transition={panelTransition}
        className="fixed bottom-3 right-3 z-40 overflow-hidden border border-[#bfa88880] bg-[#fdfaf0] shadow-[2px_12px_32px_rgba(0,0,0,0.16)] sm:bottom-4 sm:right-4 md:bottom-5 md:right-5"
        style={{ transformOrigin: "bottom right" }}
        onClick={() => {
          if (isMinimized) setIsMinimized(false);
        }}
      >
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(180deg,rgba(255,255,255,0.4),rgba(245,235,210,0.2))]" />
        {!isMinimized ? (
          <div className="relative flex h-full flex-col p-4 text-[#3d3a33]">
            <button
              onClick={() => setIsMinimized(true)}
              className="absolute right-3 top-3 rounded-full border border-[#3d3a3333] bg-[#f6f0e2] p-1.5 text-[#3d3a33] transition-colors hover:bg-[#ece2cc]"
              aria-label="最小化播放器"
            >
              <X className="h-3.5 w-3.5" />
            </button>

            <div className="mb-3 flex items-center gap-3 pr-8">
              <img src={track.cover} alt={track.title} className="h-12 w-12 rounded-lg object-cover shadow-sm" />
              <div className="min-w-0">
                <h2 className="truncate text-sm font-semibold">{track.title}</h2>
                <p className="truncate text-xs opacity-70">{track.artist}</p>
              </div>
            </div>

            <p className="mb-2 min-h-5 truncate text-xs italic opacity-80">{activeLyric}</p>

            <div className="space-y-1">
              <div
                ref={progressRef}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                className="group relative h-5 cursor-pointer touch-none"
              >
                <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[#d8ccb4] transition-all group-hover:h-2">
                  <div className="h-full rounded-full bg-[#8b5f2c]" style={{ width: `${percent}%` }} />
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] opacity-70">
                <span>{formatTime(playbackTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div className="mt-auto flex items-center justify-center gap-3">
              <button
                onClick={handlePrev}
                className="rounded-full border border-[#3d3a332e] bg-[#f7efe0] p-2.5 transition-all hover:bg-[#efe4cf] active:scale-95"
                aria-label="上一首"
              >
                <SkipBack className="h-4 w-4" />
              </button>
              <button
                onClick={handleToggle}
                className="rounded-full border border-[#3d3a3340] bg-[#8b5f2c] p-3 text-[#fdfaf0] transition-all hover:bg-[#755126] active:scale-95"
                aria-label={isPlaying ? "暂停" : "播放"}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </button>
              <button
                onClick={handleNext}
                className="rounded-full border border-[#3d3a332e] bg-[#f7efe0] p-2.5 transition-all hover:bg-[#efe4cf] active:scale-95"
                aria-label="下一首"
              >
                <SkipForward className="h-4 w-4" />
              </button>
            </div>

            {trackError && <p className="mt-2 text-[11px] text-[#8b2a2a]">{trackError}</p>}
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggle();
              }}
              className="rounded-full border border-[#3d3a333a] bg-[#8b5f2c] p-3 text-[#fdfaf0] transition-all hover:bg-[#755126] active:scale-95"
              aria-label={isPlaying ? "暂停" : "播放"}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
          </div>
        )}
      </motion.section>

      <audio ref={audioRef} preload="metadata" />
    </div>
  );
}
