import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Terminal, Github, Mail, Check } from "lucide-react";
import { useLanguage } from "@/src/lib/LanguageContext";

// TikTok Custom Icon
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg
    t="1776070194945"
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

// Language Switcher Component
function LanguageSwitcher() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <BounceButton
      onClick={toggleLanguage}
      className="relative flex items-center h-9 rounded-full bg-muted/80 border border-border/50 px-1 gap-1 hover:bg-muted transition-colors before:absolute before:-inset-2 before:content-['']"
      aria-label="Toggle language"
    >
      <span
        className={`relative z-10 flex items-center justify-center w-9 h-7 rounded-full text-sm font-bold tracking-wider transition-colors duration-200 ${
          language === "en" ? "text-primary-foreground" : "text-muted-foreground"
        }`}
      >
        EN
      </span>
      <span
        className={`relative z-10 flex items-center justify-center w-9 h-7 rounded-full text-sm font-bold tracking-wider transition-colors duration-200 ${
          language === "zh" ? "text-primary-foreground" : "text-muted-foreground"
        }`}
      >
        中
      </span>
      {/* Sliding indicator */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={language}
          className="absolute top-1 h-7 w-9 rounded-full bg-primary"
          initial={false}
          animate={{
            x: language === "en" ? 4 : 44,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />
      </AnimatePresence>
    </BounceButton>
  );
}

import { Typewriter } from "./Typewriter";
import { BounceButton } from "./BounceButton";
import { LiquidGlass } from "./LiquidGlass";

export default function Navbar() {
  const { t } = useLanguage();
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

  const navLinks = [
    { name: t.nav.about, href: "#about" },
    { name: t.nav.projects, href: "#projects" },
    { name: t.nav.experience, href: "#experience" },
  ];

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 flex justify-center p-6 pointer-events-none"
    >
      <LiquidGlass
        className="pointer-events-auto rounded-full"
        contentClassName="flex items-center gap-4 md:gap-8 px-4 md:px-6 py-2 md:py-3"
      >
        <a href="#" className="flex items-center justify-center gap-2 group p-2 -ml-2">
          <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <Terminal className="w-5 h-5 text-primary" />
          </div>
          <Typewriter text="amao" className="font-medium tracking-tight trae-browser-inspect-draggable" />
        </a>

        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors p-2"
            >
              {link.name}
            </a>
          ))}
        </div>

        <div className="h-4 w-px bg-border/50 hidden md:block" />

        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex items-center justify-center w-11 h-11">
            <LanguageSwitcher />
          </div>

          <div className="h-4 w-px bg-border/50" />

          <div className="flex items-center gap-1 md:gap-2">
            <a href="https://github.com/miaoliwen" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground transition-colors w-11 h-11 flex items-center justify-center">
              <Github className="w-5 h-5 md:w-4 md:h-4" />
            </a>
            <a href="https://www.tiktok.com" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground transition-colors w-11 h-11 flex items-center justify-center">
              <TikTokIcon className="w-5 h-5 md:w-4 md:h-4" />
            </a>
            <button
              onClick={handleCopy}
              className={`text-muted-foreground hover:text-foreground transition-colors w-11 h-11 flex items-center justify-center rounded-lg ${copied ? 'text-green-500 bg-green-500/10' : ''}`}
              title="Copy email"
            >
              {copied ? <Check className="w-5 h-5 md:w-4 md:h-4" /> : <Mail className="w-5 h-5 md:w-4 md:h-4" />}
            </button>
          </div>
        </div>
      </LiquidGlass>
    </motion.nav>
  );
}
