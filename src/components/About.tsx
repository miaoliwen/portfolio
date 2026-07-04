import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Code2, Globe } from "lucide-react";
import { useLanguage } from "@/src/lib/LanguageContext";

const CustomPaletteIcon = ({ className }: { className?: string }) => (
  <svg
    className={`icon ${className || ""}`}
    viewBox="0 0 1024 1024"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    p-id="5947"
    fill="currentColor"
  >
    <path
      d="M677.888 494.592q0 28.672-10.752 53.76t-29.184 43.52-43.008 29.184-53.248 10.752-53.248-10.752-43.008-29.184-29.184-43.52-10.752-53.76q0-27.648 10.752-52.736t29.184-43.52 43.008-29.184 53.248-10.752 53.248 10.752 43.008 29.184 29.184 43.52 10.752 52.736zM171.008 766.976q-28.672 0-51.2-5.12t-37.888-17.408-23.552-33.28-8.192-52.736l0-346.112q0-57.344 27.136-79.872t85.504-22.528l172.032 0q16.384 0 27.136-6.144t17.408-16.384 11.776-24.064 11.264-28.16q10.24-26.624 35.84-46.08t58.368-19.456l95.232 0q37.888 0 61.952 20.992t32.256 44.544q11.264 30.72 29.696 52.736t38.912 22.016l130.048 0q45.056-1.024 71.68 24.576t26.624 74.752l0 351.232q0 52.224-27.648 79.36t-73.728 27.136l-710.656 0zM539.648 280.576q-45.056 0-83.968 16.896t-67.584 46.08-45.568 68.096-16.896 82.944q0 45.056 16.896 83.968t45.568 67.584 67.584 45.568 83.968 16.896q44.032 0 82.944-16.896t67.584-45.568 45.568-67.584 16.896-83.968q0-44.032-16.896-82.944t-45.568-68.096-67.584-46.08-82.944-16.896zM611.328 169.984q0-16.384-1.536-25.6t-20.992-9.216l-84.992 0q-19.456-1.024-20.992 8.192t-1.536 26.624q-1.024 19.456 2.048 27.648t20.48 8.192l84.992 0q19.456 0 20.992-9.216t1.536-26.624z"
      p-id="5948"
    ></path>
  </svg>
);

const CustomZapIcon = ({ className }: { className?: string }) => (
  <svg
    className={`icon ${className || ""}`}
    viewBox="0 0 1024 1024"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    p-id="5882"
    fill="currentColor"
  >
    <path
      d="M576 85.333333c0 18.944-8.234667 35.968-21.333333 47.701334V213.333333h213.333333a128 128 0 0 1 128 128v426.666667a128 128 0 0 1-128 128H256a128 128 0 0 1-128-128V341.333333a128 128 0 0 1 128-128h213.333333V133.034667A64 64 0 1 1 576 85.333333zM0 426.666667h85.333333v256H0v-256z m1024 0h-85.333333v256h85.333333v-256zM384 618.666667a64 64 0 1 0 0-128 64 64 0 0 0 0 128z m320-64a64 64 0 1 0-128 0 64 64 0 0 0 128 0z"
      p-id="5883"
    ></path>
  </svg>
);

export default function About() {
  const { t } = useLanguage();
  const avatarImages = ["/touxiang/IMG_20260413_205433.png", "/touxiang/IMG_20260418_165544.png"];
  const [avatarIndex, setAvatarIndex] = useState(0);

  const skills = [
    { icon: Code2, title: t.about.skills.dev.title, desc: t.about.skills.dev.desc },
    { icon: CustomPaletteIcon, title: t.about.skills.design.title, desc: t.about.skills.design.desc },
    { icon: CustomZapIcon, title: t.about.skills.perf.title, desc: t.about.skills.perf.desc },
    { icon: Globe, title: t.about.skills.strategy.title, desc: t.about.skills.strategy.desc },
  ];

  return (
    <section id="about" className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden py-16 md:py-24">
      {/* Background Gradient Orbs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="aurora-blob -right-1/4 top-1/3 h-[40%] w-[40%] bg-coral-500/10 dark:bg-coral-400/15" />
        <div className="aurora-blob -left-1/4 bottom-1/3 h-[40%] w-[40%] bg-teal-500/10 dark:bg-teal-500/10" />
      </div>

      <div className="container relative z-10 px-4 mx-auto">
        <motion.h2 
          className="mb-10 text-center text-4xl font-normal tracking-[-0.96px] text-warm-800 sm:mb-12 sm:text-5xl md:mb-16 md:text-6xl dark:text-warm-50"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {t.about.title}
        </motion.h2>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* 左侧：技能列表 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="order-2 lg:order-1"
            >
              <div className="flex flex-col gap-4 sm:gap-5 md:gap-6 items-start w-full">
                {skills.map((skill, i) => (
                  <motion.div
                    key={i}
                    className="bento-tile flex w-full items-start gap-3 p-4 sm:gap-4 sm:p-5"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-coral-500/10 sm:h-11 sm:w-11 md:h-12 md:w-12">
                      <skill.icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <h3 className="mb-1 text-base font-medium text-warm-900 sm:mb-2 sm:text-lg md:text-xl dark:text-warm-50">{skill.title}</h3>
                      <p className="text-sm leading-relaxed text-warm-600 sm:text-base md:text-lg dark:text-warm-400">{skill.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* 右侧：图片 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              className="order-1 lg:order-2 flex justify-center lg:justify-end"
            >
              <div className="relative w-full max-w-[300px] sm:max-w-[350px] md:max-w-[400px]">
                <div className="surface-panel relative aspect-square overflow-hidden rounded-[20px] bg-warm-25 p-3 dark:bg-warm-900">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={avatarImages[avatarIndex]}
                      src={avatarImages[avatarIndex]}
                      alt="Avatar"
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                    />
                  </AnimatePresence>
                  <button
                    type="button"
                    onClick={() => setAvatarIndex((prev) => (prev - 1 + avatarImages.length) % avatarImages.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-warm-900/55 p-1.5 text-warm-50 transition-colors hover:bg-warm-900/70"
                    aria-label="上一张头像"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setAvatarIndex((prev) => (prev + 1) % avatarImages.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-warm-900/55 p-1.5 text-warm-50 transition-colors hover:bg-warm-900/70"
                    aria-label="下一张头像"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-3 flex items-center justify-center gap-2">
                  {avatarImages.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setAvatarIndex(index)}
                      className={`h-2 w-2 rounded-full transition-all ${
                        avatarIndex === index ? "w-5 bg-coral-500" : "bg-warm-300 hover:bg-warm-400 dark:bg-warm-700 dark:hover:bg-warm-600"
                      }`}
                      aria-label={`切换到第 ${index + 1} 张头像`}
                    />
                  ))}
                </div>
                {/* 装饰性元素 */}
                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-coral-500/10 blur-2xl" />
                <div className="absolute -bottom-4 -left-4 h-32 w-32 rounded-full bg-teal-500/10 blur-2xl" />
                {/* 文字说明 */}
                <p className="mt-4 text-center font-sans text-sm text-warm-600 sm:text-base dark:text-warm-400">
                  {t.about.subtitle}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
