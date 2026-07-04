import { motion, AnimatePresence } from "motion/react";
import { Terminal } from "lucide-react";
import { useLanguage } from "@/src/lib/LanguageContext";

// Language Switcher Component
function LanguageSwitcher() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <BounceButton
      onClick={toggleLanguage}
      className="relative flex h-7 items-center gap-0.5 rounded-full border border-warm-300/50 bg-warm-25/100 px-0.5 transition-colors hover:bg-warm-75 before:absolute before:-inset-2 before:content-[''] dark:border-warm-700/60 dark:bg-warm-900/100 dark:hover:bg-warm-800"
      aria-label="Toggle language"
    >
      <span
        className={`relative z-10 flex items-center justify-center w-7 h-5 rounded-full text-xs font-bold tracking-wider transition-colors duration-200 ${
          language === "en" ? "text-primary-foreground" : "text-muted-foreground"
        }`}
      >
        EN
      </span>
      <span
        className={`relative z-10 flex items-center justify-center w-7 h-5 rounded-full text-xs font-bold tracking-wider transition-colors duration-200 ${
          language === "zh" ? "text-primary-foreground" : "text-muted-foreground"
        }`}
      >
        中
      </span>
      {/* Sliding indicator */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={language}
          className="absolute top-0.5 h-5 w-7 rounded-full bg-gradient-to-br from-coral-500 to-coral-600 shadow-warm-sm"
          initial={false}
          animate={{
            x: language === "en" ? 2 : 30,
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
  const currentPath = typeof window === "undefined" ? "/" : window.location.pathname.replace(/\/+$/, "") || "/";

  const navLinks = [
    { name: t.nav.about, href: "/about" },
    { name: t.nav.projects, href: "/projects" },
    { name: t.nav.experience, href: "/experience" },
    { name: t.nav.leaveNote, href: "/leave-note" },
    { name: t.nav.games, href: "/games" },
    { name: t.nav.music, href: "/player" },
  ];

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed left-0 right-0 top-0 z-50 flex justify-center p-4 sm:p-6 pointer-events-none"
    >
      <LiquidGlass
        className="pointer-events-auto rounded-full"
        contentClassName="flex items-center gap-3 px-4 py-2.5 md:gap-8 md:px-6 md:py-3"
      >
        <a href="/" className="group -ml-2 flex items-center justify-center gap-2 rounded-full p-2 transition-all duration-300 hover:bg-coral-500/10">
          <div className="rounded-xl bg-coral-500/10 p-1.5 transition-colors group-hover:bg-coral-500/15">
            <Terminal className="w-5 h-5 text-primary" />
          </div>
          <Typewriter text={t.siteTitle} className="font-medium tracking-[-0.14px] text-warm-900 dark:text-warm-50 trae-browser-inspect-draggable" />
        </a>

        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = currentPath === link.href;

            return (
              <a
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={`rounded-full px-3 py-2 text-sm font-medium transition-all duration-300 hover:-translate-y-px hover:bg-coral-500/10 hover:text-warm-900 dark:hover:text-warm-50 ${
                  isActive
                    ? "bg-coral-500/10 text-warm-900 shadow-warm-sm dark:text-warm-50"
                    : "text-warm-600 dark:text-warm-400"
                }`}
              >
                {link.name}
              </a>
            );
          })}
        </div>

        <div className="hidden h-4 w-px bg-warm-300/50 dark:bg-warm-700/60 md:block" />

        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex items-center justify-center w-11 h-11">
            <LanguageSwitcher />
          </div>

        </div>
      </LiquidGlass>
    </motion.nav>
  );
}
