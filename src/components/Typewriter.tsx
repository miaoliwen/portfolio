import React, { useState, useEffect, useRef } from 'react';

interface TypewriterProps {
  text: string;
  className?: string;
  typingSpeedMin?: number;
  typingSpeedMax?: number;
  deletingSpeed?: number;
  pauseAfterType?: number;
  pauseAfterDelete?: number;
}

export function Typewriter({
  text,
  className = '',
  typingSpeedMin = 50,
  typingSpeedMax = 150,
  deletingSpeed = 30,
  pauseAfterType = 2000,
  pauseAfterDelete = 1000,
}: TypewriterProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [phase, setPhase] = useState<'typing' | 'pausing' | 'deleting' | 'waiting'>('typing');
  const [isPaused, setIsPaused] = useState(false);

  // Use a ref to keep track of the text, so we don't reset the animation on every render
  const textRef = useRef(text);
  useEffect(() => {
    textRef.current = text;
  }, [text]);

  useEffect(() => {
    if (isPaused) return;

    let timeout: NodeJS.Timeout;

    const currentText = textRef.current;

    switch (phase) {
      case 'typing':
        if (displayedText.length < currentText.length) {
          const delay = Math.random() * (typingSpeedMax - typingSpeedMin) + typingSpeedMin;
          timeout = setTimeout(() => {
            setDisplayedText(currentText.slice(0, displayedText.length + 1));
          }, delay);
        } else {
          timeout = setTimeout(() => setPhase('pausing'), 0);
        }
        break;
      case 'pausing':
        timeout = setTimeout(() => setPhase('deleting'), pauseAfterType);
        break;
      case 'deleting':
        if (displayedText.length > 0) {
          timeout = setTimeout(() => {
            setDisplayedText(currentText.slice(0, displayedText.length - 1));
          }, deletingSpeed);
        } else {
          timeout = setTimeout(() => setPhase('waiting'), 0);
        }
        break;
      case 'waiting':
        timeout = setTimeout(() => setPhase('typing'), pauseAfterDelete);
        break;
    }

    return () => clearTimeout(timeout);
  }, [displayedText, phase, isPaused, typingSpeedMax, typingSpeedMin, deletingSpeed, pauseAfterType, pauseAfterDelete]);

  // Pause/Resume interactions
  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);
  const togglePause = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    setIsPaused((prev) => !prev);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      togglePause(e);
    }
  };

  return (
    <span
      className={`inline-flex items-center cursor-pointer ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={togglePause}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Typewriter animation: ${text}. Currently ${isPaused ? 'paused' : 'playing'}.`}
      title={isPaused ? "Click to resume" : "Click or hover to pause"}
    >
      <span aria-hidden="true" className="relative inline-flex items-center">
        {displayedText}
        <span
          className={`inline-block w-[2px] h-[1em] bg-current align-middle ml-[1px] transition-opacity duration-100 ${
            phase === 'pausing' || phase === 'waiting' || isPaused ? 'opacity-100 animate-pulse' : 'opacity-70'
          }`}
        />
      </span>
      {/* Screen reader only live region */}
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {displayedText}
      </span>
    </span>
  );
}
