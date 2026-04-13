import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { Terminal } from "lucide-react";
import { useLanguage } from "@/src/lib/LanguageContext";

const words = ["python", "java", "react"];

export default function Footer() {
  const { t } = useLanguage();
  const [displayText, setDisplayText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const typeNextChar = useCallback(() => {
    const currentWord = words[wordIndex];

    if (!isDeleting) {
      // Typing phase
      if (displayText.length < currentWord.length) {
        setDisplayText(currentWord.slice(0, displayText.length + 1));
      } else {
        // Word complete, pause before deleting
        setTimeout(() => {
          setIsDeleting(true);
        }, 1500);
      }
    } else {
      // Deleting phase
      if (displayText.length > 0) {
        setDisplayText(displayText.slice(0, -1));
      } else {
        // Word deleted, move to next word
        setIsDeleting(false);
        setWordIndex((prev) => (prev + 1) % words.length);
      }
    }
  }, [displayText, isDeleting, wordIndex]);

  useEffect(() => {
    const currentWord = words[wordIndex];

    if (!isDeleting && displayText.length === currentWord.length) {
      // Word is complete, wait before deleting
      const timeout = setTimeout(() => {
        setIsDeleting(true);
      }, 1500);
      return () => clearTimeout(timeout);
    }

    if (isDeleting && displayText.length === 0) {
      // Word is deleted, wait before next word
      const timeout = setTimeout(() => {
        setIsDeleting(false);
        setWordIndex((prev) => (prev + 1) % words.length);
      }, 500);
      return () => clearTimeout(timeout);
    }

    // Type or delete next character
    const delay = isDeleting
      ? Math.random() * 30 + 30  // 30-60ms for deleting
      : Math.random() * 50 + 50; // 50-100ms for typing

    const timeout = setTimeout(typeNextChar, delay);
    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, wordIndex, typeNextChar]);

  return (
    <footer className="relative py-12 overflow-hidden">
      {/* Background Gradient Orbs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[30%] h-[50%] bg-primary/10 rounded-full blur-[80px] animate-pulse" />
      </div>

      <div className="container relative z-10 px-4 mx-auto">
        <motion.div
          className="flex flex-col md:flex-row justify-between items-center gap-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-primary" />
            <span className="font-bold tracking-tight text-sm md:text-base lg:text-lg min-w-[80px]">
              {displayText}
              <span className="animate-pulse">|</span>
            </span>
          </div>

          <p className="text-sm text-muted-foreground">
            @2026 Amao
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
