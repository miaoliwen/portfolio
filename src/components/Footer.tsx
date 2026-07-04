import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { Terminal, Github, Mail, Check } from "lucide-react";
import { useLanguage } from "@/src/lib/LanguageContext";

const words = ["python", "java", "react"];

// TikTok Custom Icon
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg
    className={`icon ${className || ""}`}
    viewBox="0 0 1024 1024"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    p-id="4813"
  >
    <path
      d="M899.871 313.624c-0.27-11.331-0.058-22.662-0.12-34-14.86-0.386-29.738-1.576-44.28-4.799-24.784-5.188-48.432-15.194-69.881-28.589-1.403-1.55-2.743-3.2-4.523-4.315-29.232-17.692-52.11-44.711-67.773-74.863-9.959-19.52-17.887-40.26-22.055-61.83-0.202-0.013-0.626-0.023-0.822-0.034-2.133-12.861-3.724-25.87-3.38-38.932-51.09-0.035-102.175 0.045-153.26-0.047-0.236 74.152 0.293 148.331-0.344 222.469 0.01 129.442-0.013 258.894 0.021 388.336-0.057 42.996-23.76 84.793-60.226 107.4-37.604 24.117-88.464 26.467-127.523 4.512-14.324-8.725-27.779-19.09-38.66-31.928-16.137-18.436-26.41-41.828-29.21-66.153-2.482-25.018 1.45-50.97 13.118-73.39 6.747-13.263 16.269-25.055 27.658-34.61 18.583-15.7 41.413-25.793 64.998-31.267 19.75-4.757 41.075-4.907 60.371 1.88 0.051-25.515 0.016-51.017 0.027-76.529-0.234-14.937 0.467-29.904-0.367-44.815-0.495-11.965-0.08-23.957-0.2-35.939-63.866-9.252-130.688 4.92-185.48 38.944-37.885 23.278-70.06 55.71-93.207 93.663-25.388 41.483-39.707 89.673-40.97 138.303-1.73 52.86 11.911 106.164 38.953 151.634 20.164 33.945 47.298 63.94 79.696 86.557 0.523 0.438 1.547 1.321 2.063 1.77 30.365 21.45 65.124 36.408 101.469 44.133 25.762 5.596 52.287 7.167 78.588 6.337 51.923-1.35 103.387-18.577 145.208-49.47 32.364-23.579 59.154-54.456 79.254-89.016 23.11-39.995 37.835-85.092 40.976-131.26 0.92-12.577 0.34-25.184 0.316-37.774-0.775-94.574-0.94-189.153-0.918-283.737 60.974 43.356 135.797 67.105 210.62 66.433-0.057-39.694 0.237-79.39-0.137-119.074z"
      fill="currentColor"
      p-id="4814"
    ></path>
  </svg>
);

export default function Footer() {
  const { t } = useLanguage();
  const [displayText, setDisplayText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  const email = "3226801351@qq.com";

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback: Create temporary textarea to copy text
      const textarea = document.createElement('textarea');
      textarea.value = email;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (e) {
        console.error('Copy failed:', e);
      }
      document.body.removeChild(textarea);
    }
  };

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
    <footer className="relative overflow-hidden py-12">
      {/* Background Gradient Orbs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="aurora-blob left-1/2 top-0 h-[50%] w-[30%] -translate-x-1/2 bg-coral-500/10 dark:bg-coral-400/15" />
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
            <span className="min-w-[80px] text-sm font-medium tracking-[-0.14px] text-warm-900 md:text-base lg:text-lg dark:text-warm-50">
              {displayText}
              <span className="animate-pulse">|</span>
            </span>
          </div>

          <div className="flex items-center gap-1 md:gap-2">
            <a href="https://github.com/miaoliwen" target="_blank" rel="noreferrer" className="flex h-11 w-11 items-center justify-center rounded-full text-warm-600 transition-all duration-300 hover:-translate-y-px hover:bg-coral-500/10 hover:text-warm-900 dark:text-warm-400 dark:hover:text-warm-50">
              <Github className="w-5 h-5 md:w-4 md:h-4" />
            </a>
            <a href="https://v.douyin.com/ecDXz9yqG6Q/" target="_blank" rel="noreferrer" className="flex h-11 w-11 items-center justify-center rounded-full text-warm-600 transition-all duration-300 hover:-translate-y-px hover:bg-coral-500/10 hover:text-warm-900 dark:text-warm-400 dark:hover:text-warm-50">
              <TikTokIcon className="w-5 h-5 md:w-4 md:h-4" />
            </a>
            <button
              onClick={handleCopy}
              className={`flex h-11 w-11 items-center justify-center rounded-full text-warm-600 transition-all duration-300 hover:-translate-y-px hover:bg-coral-500/10 hover:text-warm-900 dark:text-warm-400 dark:hover:text-warm-50 ${copied ? 'bg-coral-500/10 text-coral-600 dark:text-coral-400' : ''}`}
              title="Copy email"
            >
              {copied ? <Check className="w-5 h-5 md:w-4 md:h-4" /> : <Mail className="w-5 h-5 md:w-4 md:h-4" />}
            </button>
          </div>

          <p className="text-sm text-warm-600 dark:text-warm-400">
            @2026 Amao
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
