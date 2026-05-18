
import { motion } from 'motion/react';
import { DiaryEntry } from '../types';
import { cn } from '../lib/utils';

interface ParchmentCardProps {
  entry: DiaryEntry;
  onDelete?: (id: string) => void;
}

export function ParchmentCard({ entry, onDelete }: ParchmentCardProps) {
  const fontClass = {
    shoujin: 'font-shoujin',
    round: 'font-round',
    cursive: 'font-handwriting',
  }[entry.style];

  // Pick a clip path based on the entry ID to keep it consistent
  const clipPathIndex = (parseInt(entry.id.slice(0, 8), 16) % 4) + 1;
  const clipPathClass = `clip-path-${clipPathIndex}`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9, rotate: entry.rotate - 3 }}
      animate={{ opacity: 1, scale: 1, rotate: entry.rotate }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="relative mb-10 break-inside-avoid"
    >
      {/* Paper layer */}
      <div className={cn(
        "card-paper p-8 pb-12",
        clipPathClass
      )}>
        {/* Date Meta */}
        <div className="flex justify-between items-center mb-6 text-[11px] uppercase tracking-widest font-serif opacity-50 border-b border-[#3d3a331a] pb-2">
          <span>#{entry.id.slice(0, 4)}</span>
          <span className="italic">{entry.date}</span>
        </div>

        {/* Content */}
        <div className={cn(
          "text-[18px] leading-[1.6] text-[#4a453c] handwriting-transition",
          fontClass || "font-cursive"
        )}>
          {entry.content.split('\n').map((line, i) => (
            <p key={i} className="mb-2">{line}</p>
          ))}
        </div>

        {/* Tag line simulation as per Artistic Flair */}
        <div className="mt-8 text-[11px] italic opacity-40 font-serif border-t border-[#3d3a331a] pt-4">
          — 记于此间
        </div>

        {/* Delete action hidden by default, visible on hover */}
        <button
          onClick={() => onDelete?.(entry.id)}
          className="absolute bottom-4 right-8 text-[9px] uppercase tracking-[0.2em] opacity-0 hover:opacity-80 transition-opacity duration-300 cursor-pointer text-[#8b4513] font-serif"
        >
          [ 焚毁 ]
        </button>
      </div>
    </motion.div>
  );
}
