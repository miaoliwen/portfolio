import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Terminal } from "lucide-react";
import { useLanguage } from "@/src/lib/LanguageContext";

// Language Switcher Component
function LanguageSwitcher() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <BounceButton
      onClick={toggleLanguage}
      className="relative flex items-center h-7 rounded-full bg-muted/80 border border-border/50 px-0.5 gap-0.5 hover:bg-muted transition-colors before:absolute before:-inset-2 before:content-['']"
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
          className="absolute top-0.5 h-5 w-7 rounded-full bg-primary"
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

  const navLinks = [
    { name: t.nav.about, href: "#about" },
    { name: t.nav.projects, href: "#projects" },
    { name: t.nav.experience, href: "#experience" },
    { name: t.nav.leaveNote, href: "#leave-note" },
    { name: t.nav.games, href: "/games" },
    { name: t.nav.music, href: "/player" },
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
          <Typewriter text={t.siteTitle} className="font-medium tracking-tight trae-browser-inspect-draggable" />
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

        </div>
      </LiquidGlass>
    </motion.nav>
  );
}
