import { motion } from "motion/react";
import { Code2, Globe } from "lucide-react";
import { useLanguage } from "@/src/lib/LanguageContext";

const CustomPaletteIcon = ({ className }: { className?: string }) => (
  <svg
    t="1776074346720"
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
    t="1776079736596"
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

  const skills = [
    { icon: Code2, title: t.about.skills.dev.title, desc: t.about.skills.dev.desc },
    { icon: CustomPaletteIcon, title: t.about.skills.design.title, desc: t.about.skills.design.desc },
    { icon: CustomZapIcon, title: t.about.skills.perf.title, desc: t.about.skills.perf.desc },
    { icon: Globe, title: t.about.skills.strategy.title, desc: t.about.skills.strategy.title },
  ];

  return (
    <section id="about" className="relative min-h-screen flex flex-col items-center justify-center py-16 md:py-24 overflow-hidden">
      {/* Background Gradient Orbs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 -right-1/4 w-[40%] h-[40%] bg-primary/15 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/3 -left-1/4 w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px] animate-pulse delay-700" />
      </div>

      <div className="container relative z-10 px-4 mx-auto">
        <motion.h2 
          className="text-3xl sm:text-4xl md:text-5xl font-bold mb-10 sm:mb-12 md:mb-16 text-center"
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
                    className="flex items-start gap-3 sm:gap-4 w-full"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                  >
                    <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <skill.icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <h3 className="font-semibold mb-1 sm:mb-2 text-base sm:text-lg md:text-xl">{skill.title}</h3>
                      <p className="text-sm sm:text-base md:text-lg text-muted-foreground">{skill.desc}</p>
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
                <div className="aspect-square rounded-2xl overflow-hidden bg-transparent">
                  <img
                    src="/touxiang/IMG_20260413_205433.png"
                    alt="Avatar"
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                {/* 装饰性元素 */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />
                {/* 文字说明 */}
                <p className="mt-4 text-center text-sm sm:text-base text-muted-foreground font-sans">
                  一名来自江苏的计算机系学生
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
