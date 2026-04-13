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
          className="flex items-center gap-2 px-4 py-2 bg-[#f5f5f7] dark:bg-[#1c1c1e] rounded-lg shadow-lg hover:shadow-xl transition-shadow"
        >
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</span>
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
        bg-[#f5f5f7] dark:bg-[#1c1c1e]
        rounded-xl
        shadow-2xl
        overflow-hidden
        select-none
        ${className}
      `}
      style={{
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.1)",
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
          bg-gradient-to-b from-[#f5f5f7] to-[#e8e8ed]
          dark:from-[#2c2c2e] dark:to-[#1c1c1e]
          border-b border-gray-200/50 dark:border-gray-700/50
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
              bg-[#ff5f57]
              border border-[#e0443e]
              hover:bg-[#ff5f57]/80
              transition-colors
              flex items-center justify-center
              group
            "
            title="Close"
          >
            <svg
              className="w-2 h-2 text-[#4d0000] opacity-0 group-hover:opacity-100 transition-opacity"
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
              bg-[#febc2e]
              border border-[#d89e24]
              hover:bg-[#febc2e]/80
              transition-colors
              flex items-center justify-center
              group
            "
            title="Minimize"
          >
            <svg
              className="w-2 h-2 text-[#995700] opacity-0 group-hover:opacity-100 transition-opacity"
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
              bg-[#28c840]
              border border-[#1bac2c]
              hover:bg-[#28c840]/80
              transition-colors
              flex items-center justify-center
              group
            "
            title="Maximize"
          >
            <svg
              className="w-2 h-2 text-[#006500] opacity-0 group-hover:opacity-100 transition-opacity"
              fill="currentColor"
              viewBox="0 0 8 8"
            >
              <path d="M1.5 1.5h5v5h-5z" fill="none" stroke="currentColor" strokeWidth="1" />
            </svg>
          </button>
        </div>

        {/* 窗口标题 */}
        <span className="absolute left-1/2 -translate-x-1/2 text-sm font-medium text-gray-600 dark:text-gray-300">
          {title}
        </span>

        {/* 右侧占位 */}
        <div className="w-16" />
      </div>

      {/* 窗口内容 */}
      <div 
        className="p-4 overflow-auto dark:bg-[#1c1c1e] scrollbar-thin flex-1" 
        style={{ 
          maxHeight: isMaximized ? "calc(100vh - 100px)" : "240px",
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(156, 163, 175, 0.5) transparent"
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
            background-color: rgba(156, 163, 175, 0.5);
            border-radius: 20px;
          }
          .scrollbar-thin::-webkit-scrollbar-thumb:hover {
            background-color: rgba(156, 163, 175, 0.8);
          }
          .dark .scrollbar-thin::-webkit-scrollbar-thumb {
            background-color: rgba(75, 85, 99, 0.5);
          }
          .dark .scrollbar-thin::-webkit-scrollbar-thumb:hover {
            background-color: rgba(75, 85, 99, 0.8);
          }
        `}</style>
        {children}
      </div>
    </motion.div>
  );
}
