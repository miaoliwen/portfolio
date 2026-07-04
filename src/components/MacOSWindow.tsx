import { useState, useRef, useCallback } from "react";
import { motion } from "motion/react";

interface MacOSWindowProps {
  title: string;
  children: React.ReactNode;
  defaultPosition?: { x: number; y: number };
  className?: string;
}

export function MacOSWindow({
  title,
  children,
  defaultPosition = { x: 0, y: 0 },
  className = "",
}: MacOSWindowProps) {
  const [position, setPosition] = useState(defaultPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [prevPosition, setPrevPosition] = useState(defaultPosition);
  const dragStart = useRef({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("[data-titlebar]")) {
      setIsDragging(true);
      dragStart.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      };
    }
  }, [position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && !isMaximized) {
      setPosition({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y,
      });
    }
  }, [isDragging, isMaximized]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleClose = useCallback(() => {
    if (windowRef.current) {
      windowRef.current.style.opacity = "0";
      windowRef.current.style.transform = "scale(0.9)";
    }
    setTimeout(() => {
      setIsMinimized(true);
    }, 200);
  }, []);

  const handleMinimize = useCallback(() => {
    setIsMinimized(!isMinimized);
  }, [isMinimized]);

  const handleMaximize = useCallback(() => {
    if (isMaximized) {
      setPosition(prevPosition);
      setIsMaximized(false);
    } else {
      setPrevPosition(position);
      setPosition({ x: 0, y: 0 });
      setIsMaximized(true);
    }
  }, [isMaximized, position, prevPosition]);

  if (isMinimized) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="fixed bottom-4 left-4 z-50"
      >
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 px-4 py-2 border border-warm-300/40 bg-warm-25 dark:bg-warm-900 rounded-xl shadow-warm-lg hover:shadow-warm-xl transition-shadow"
        >
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-coral-500" />
            <div className="w-3 h-3 rounded-full bg-coral-300" />
            <div className="w-3 h-3 rounded-full bg-warm-300" />
          </div>
          <span className="text-sm font-medium text-warm-700 dark:text-warm-300">{title}</span>
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={windowRef}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{
        scale: 1,
        opacity: 1,
        x: isMaximized ? 0 : position.x,
        y: isMaximized ? 0 : position.y,
      }}
      transition={{ duration: 0.2 }}
      className={`
        relative flex flex-col
        ${isMaximized ? "fixed inset-4 z-50 w-auto h-auto" : "w-full h-full"}
        bg-warm-25 dark:bg-warm-900
        rounded-[20px]
        shadow-warm-xl
        overflow-hidden
        select-none
        ${className}
      `}
      style={{
        boxShadow: "0 25px 50px -12px rgba(42, 36, 28, 0.12), 0 0 0 1px rgba(218, 203, 175, 0.35)",
        cursor: isDragging ? "grabbing" : "default",
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* 标题栏 */}
      <div
        data-titlebar
        className="
          flex items-center justify-between
          px-4 py-3
          bg-gradient-to-b from-warm-25 to-warm-75
          dark:from-warm-900 dark:to-warm-800
          border-b border-warm-300/40 dark:border-warm-700/60
          cursor-grab
          active:cursor-grabbing
        "
      >
        {/* 窗口控制按钮 */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleClose}
            className="
              w-3 h-3
              rounded-full
              bg-coral-500
              border border-coral-600/60
              hover:bg-coral-500/80
              transition-colors
              flex items-center justify-center
              group
            "
            title="Close"
            aria-label="Close window"
          >
            <svg
              className="w-2 h-2 text-warm-900 opacity-0 group-hover:opacity-100 transition-opacity"
              fill="currentColor"
              viewBox="0 0 8 8"
            >
              <path d="M1.5 1.5l5 5M6.5 1.5l-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          <button
            onClick={handleMinimize}
            className="
              w-3 h-3
              rounded-full
              bg-coral-300
              border border-coral-400/70
              hover:bg-coral-300/80
              transition-colors
              flex items-center justify-center
              group
            "
            title="Minimize"
            aria-label="Minimize window"
          >
            <svg
              className="w-2 h-2 text-warm-900 opacity-0 group-hover:opacity-100 transition-opacity"
              fill="currentColor"
              viewBox="0 0 8 8"
            >
              <rect x="1" y="3.5" width="6" height="1" />
            </svg>
          </button>
          <button
            onClick={handleMaximize}
            className="
              w-3 h-3
              rounded-full
              bg-warm-300
              border border-warm-400/70
              hover:bg-warm-300/80
              transition-colors
              flex items-center justify-center
              group
            "
            title="Maximize"
            aria-label="Maximize window"
          >
            <svg
              className="w-2 h-2 text-warm-800 opacity-0 group-hover:opacity-100 transition-opacity"
              fill="currentColor"
              viewBox="0 0 8 8"
            >
              <path d="M1.5 1.5h5v5h-5z" fill="none" stroke="currentColor" strokeWidth="1" />
            </svg>
          </button>
        </div>

        {/* 窗口标题 */}
        <span className="absolute left-1/2 -translate-x-1/2 text-sm font-medium text-warm-600 dark:text-warm-300">
          {title}
        </span>

        {/* 右侧占位 */}
        <div className="w-16" />
      </div>

      {/* 窗口内容 */}
      <div 
        className="flex-1 overflow-auto bg-warm-25 p-4 scrollbar-thin dark:bg-warm-900" 
        style={{ 
          maxHeight: isMaximized ? "calc(100vh - 100px)" : "240px",
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(154, 135, 108, 0.45) transparent"
        }}
      >
        <style>{`
          .scrollbar-thin::-webkit-scrollbar {
            width: 4px;
            height: 4px;
          }
          .scrollbar-thin::-webkit-scrollbar-track {
            background: transparent;
          }
          .scrollbar-thin::-webkit-scrollbar-thumb {
            background-color: rgba(154, 135, 108, 0.45);
            border-radius: 20px;
          }
          .scrollbar-thin::-webkit-scrollbar-thumb:hover {
            background-color: rgba(122, 106, 84, 0.65);
          }
          .dark .scrollbar-thin::-webkit-scrollbar-thumb {
            background-color: rgba(184, 165, 138, 0.35);
          }
          .dark .scrollbar-thin::-webkit-scrollbar-thumb:hover {
            background-color: rgba(184, 165, 138, 0.55);
          }
        `}</style>
        {children}
      </div>
    </motion.div>
  );
}
