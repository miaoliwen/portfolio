
import { useState } from 'react';
import { HandwritingStyle } from '../types';
import { cn } from '../lib/utils';
import { Send, Type } from 'lucide-react';

interface DiaryEntryEditorProps {
  onSave: (content: string, style: HandwritingStyle) => void;
}

export function DiaryEntryEditor({ onSave }: DiaryEntryEditorProps) {
  const [content, setContent] = useState('');
  const [style, setStyle] = useState<HandwritingStyle>('shoujin');
  const [isFocused, setIsFocused] = useState(false);

  const styles: { id: HandwritingStyle; label: string; font: string }[] = [
    { id: 'shoujin', label: '瘦金体', font: 'font-shoujin' },
    { id: 'round', label: '圆体', font: 'font-round' },
    { id: 'cursive', label: '行书', font: 'font-cursive' },
  ];

  const handleSave = () => {
    if (!content.trim()) return;
    onSave(content, style);
    setContent('');
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-16 relative">
      <div className={cn(
        "relative transition-all duration-500 p-6 card-paper",
        isFocused ? "shadow-xl scale-[1.01]" : "shadow-sm opacity-90"
      )}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="此时此地，书写心绪..."
          className={cn(
            "w-full min-h-[160px] bg-transparent border-none focus:ring-0 resize-none transition-all duration-700",
            !isFocused && content ? styles.find(s => s.id === style)?.font : "font-serif",
            !isFocused && content ? "text-[18px] leading-[1.6]" : "text-base leading-7",
            "placeholder:italic placeholder:opacity-30 text-[#4a453c]"
          )}
        />

        <div className="flex items-center justify-between mt-4 border-t border-[#3d3a331a] pt-4">
          <div className="flex gap-4">
            {styles.map((s) => (
              <button
                key={s.id}
                onClick={() => setStyle(s.id)}
                className={cn(
                  "flex items-center gap-1 text-[10px] uppercase tracking-widest transition-all",
                  style === s.id ? "text-[var(--color-burnt)] font-bold" : "text-[var(--color-ink)] opacity-40 hover:opacity-100"
                )}
              >
                <Type size={12} />
                {s.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleSave}
            disabled={!content.trim()}
            className="group flex items-center gap-2 px-6 py-2 bg-[var(--color-ink)] text-[var(--color-paper)] rounded-full text-[10px] uppercase tracking-[0.2em] hover:bg-[#4a3f35] transition-colors disabled:opacity-20"
          >
            <span>封存入档</span>
            <Send size={12} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </button>
        </div>
      </div>
      
      {/* Visual flair for the editor */}
      <div className="absolute -left-12 top-1/2 -translate-y-1/2 rotate-[-90deg] opacity-20 pointer-events-none whitespace-nowrap hidden lg:block">
        <span className="text-[10px] uppercase tracking-[0.4em] font-serif">A Moment in Silence • {new Date().toLocaleDateString('zh-CN')}</span>
      </div>
    </div>
  );
}
