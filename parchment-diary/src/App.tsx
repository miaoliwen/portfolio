/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ParchmentCard } from './components/ParchmentCard';
import { DiaryEntryEditor } from './components/DiaryEntryEditor';
import { DiaryEntry, HandwritingStyle } from './types';
import { Shield, Wind } from 'lucide-react';

export default function App() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);

  useEffect(() => {
    try {
      localStorage.removeItem('parchment_diary_entries');
      sessionStorage.removeItem('parchment_diary_entries');
    } catch {
      // Ignore storage cleanup issues in locked-down browsers.
    }
  }, []);

  const addEntry = (content: string, style: HandwritingStyle) => {
    const newEntry: DiaryEntry = {
      id: crypto.randomUUID(),
      content,
      style,
      date: new Intl.DateTimeFormat('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      }).format(new Date()),
      rotate: (Math.random() - 0.5) * 4, // -2 to 2 degrees
    };
    setEntries([newEntry, ...entries]);
  };

  const deleteEntry = (id: string) => {
    setEntries(entries.filter((e) => e.id !== id));
  };

  return (
    <div className="min-h-screen px-4 py-16 md:px-12 lg:px-24 max-w-[1400px] mx-auto relative z-10 selection:bg-[#bfa88833]">
      {/* Header */}
      <header className="mb-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="logo-underline"
        >
          <span className="text-2xl font-light tracking-[4px] uppercase opacity-80 font-serif">
            拾光日记 / MEMOIR
          </span>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-4 text-[12px] italic opacity-60 font-serif"
        >
          二零二四年 · 仲夏夜 · 晴
        </motion.div>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-10 mx-auto max-w-2xl rounded-2xl border border-[#bfa88855] bg-[#fdfaf0cc] px-5 py-4 text-sm leading-6 text-[#4a453c] shadow-sm backdrop-blur"
      >
        <div className="flex items-start gap-3">
          <Shield className="mt-0.5 h-4 w-4 shrink-0 text-[#8b5f2c]" />
          <p>
            Privacy mode is on. Diary entries stay only in the current page session and are cleared on refresh or close.
          </p>
        </div>
      </motion.div>

      {/* Entry Editor */}
      <DiaryEntryEditor onSave={addEntry} />

      {/* Grid Layout (Theme uses repeat(3, 1fr), adapting columns to match) */}
      <div className="columns-1 md:columns-2 lg:columns-3 gap-10 space-y-10">
        <AnimatePresence mode="popLayout">
          {entries.map((entry) => (
            <ParchmentCard
              key={entry.id}
              entry={entry}
              onDelete={deleteEntry}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {entries.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-32 text-center opacity-20 pointer-events-none"
        >
          <Wind size={48} className="mb-6 animate-pulse" />
          <p className="font-serif italic text-lg">这里的草稿已经随风而逝...</p>
          <p className="text-[10px] uppercase tracking-widest mt-2">The pages are waiting to be filled</p>
        </motion.div>
      )}

      {/* Footer Decoration */}
      <footer className="mt-32 pb-12 text-center border-t border-[#2c241e12] pt-12">
        <p className="text-[10px] uppercase tracking-[0.3em] opacity-20 font-serif">
          Time is the canvas • Silence is the ink
        </p>
      </footer>
    </div>
  );
}
