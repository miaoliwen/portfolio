import { motion } from "motion/react";
import { Sparkles } from "lucide-react";
import { useLanguage } from "@/src/lib/LanguageContext";

export default function Hero() {
  const { t } = useLanguage();

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pt-24">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="aurora-blob left-[-18%] top-[18%] h-[34rem] w-[34rem] bg-coral-500/10 dark:bg-coral-400/15" style={{ animation: "aurora-drift-a 22s cubic-bezier(0.16, 1, 0.3, 1) infinite" }} />
        <div className="aurora-blob right-[-16%] top-[24%] h-[30rem] w-[30rem] bg-teal-500/10 dark:bg-teal-500/10" style={{ animation: "aurora-drift-b 26s cubic-bezier(0.16, 1, 0.3, 1) infinite" }} />
        <div className="aurora-blob bottom-[8%] left-[30%] h-[22rem] w-[22rem] bg-coral-400/10 dark:bg-coral-400/10" style={{ animation: "aurora-drift-a 18s cubic-bezier(0.16, 1, 0.3, 1) infinite reverse" }} />
      </div>

      <div className="container relative z-10 mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-coral-500/20 bg-coral-500/10 px-4 py-2 text-sm font-medium text-coral-700 shadow-warm-sm dark:text-coral-400"
        >
          <Sparkles className="h-4 w-4" />
          <span>{t.hero.badge}</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0.2, scale: 0.88, filter: "blur(8px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="gradient-text-wpds cursor-default text-6xl font-normal leading-none tracking-[-1.72px] md:text-8xl lg:text-[7rem]"
        >
          阿毛Studio
        </motion.h1>
      </div>
    </section>
  );
}
