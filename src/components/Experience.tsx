import { motion } from "motion/react";
import { useLanguage } from "@/src/lib/LanguageContext";
import { MacOSWindow } from "./MacOSWindow";
import { ExternalLink } from "lucide-react";

interface SoftwareItem {
  name: string;
  url: string;
  icon: string;
}

interface SoftwareCategory {
  name: string;
  items: SoftwareItem[];
}

export default function Experience() {
  const { t } = useLanguage();

  const softwareCategories: SoftwareCategory[] = [
    {
      name: "网络工具",
      items: [
        { name: "Clash Verge", url: "https://github.com/clash-verge-rev/clash-verge", icon: "C" },
        { name: "V2Ray", url: "https://github.com/2dust/v2rayN/releases", icon: "V" },
        { name: "Clash for Windows", url: "https://clashfor.org/", icon: "C" },
      ],
    },
    { name: "播放器", items: [
      { name: "IINA", url: "#", icon: "I" },
      { name: "PotPlayer", url: "#", icon: "P" },
      { name: "VLC", url: "#", icon: "V" },
      { name: "MPV", url: "#", icon: "M" },
      { name: "Infuse", url: "#", icon: "I" },
      { name: "nPlayer", url: "#", icon: "N" },
    ]},
    { name: "Adobe软件", items: [
      { name: "Photoshop", url: "#", icon: "P" },
      { name: "Illustrator", url: "#", icon: "I" },
      { name: "Premiere Pro", url: "#", icon: "P" },
      { name: "After Effects", url: "#", icon: "A" },
      { name: "Lightroom", url: "#", icon: "L" },
      { name: "Audition", url: "#", icon: "A" },
      { name: "Media Encoder", url: "#", icon: "M" },
    ]},
    { name: "截图软件", items: [
      { name: "Snipaste", url: "#", icon: "S" },
      { name: "PixPin", url: "#", icon: "P" },
      { name: "ShareX", url: "#", icon: "S" },
      { name: "CleanShot X", url: "#", icon: "C" },
      { name: "Shottr", url: "#", icon: "S" },
      { name: "Xnip", url: "#", icon: "X" },
    ]},
    { name: "开发工具", items: [
      { name: "VS Code", url: "#", icon: "V" },
      { name: "Cursor", url: "#", icon: "C" },
      { name: "WebStorm", url: "#", icon: "W" },
      { name: "Sublime Text", url: "#", icon: "S" },
      { name: "Zed", url: "#", icon: "Z" },
      { name: "Trae", url: "#", icon: "T" },
    ]},
    { name: "效率工具", items: [
      { name: "Alfred", url: "#", icon: "A" },
      { name: "Raycast", url: "#", icon: "R" },
      { name: "BetterTouchTool", url: "#", icon: "B" },
      { name: "Keyboard Maestro", url: "#", icon: "K" },
      { name: "Hammerspoon", url: "#", icon: "H" },
      { name: "Karabiner-Elements", url: "#", icon: "K" },
    ]},
    { name: "系统工具", items: [
      { name: "CleanMyMac X", url: "#", icon: "C" },
      { name: "DaisyDisk", url: "#", icon: "D" },
      { name: "iStat Menus", url: "#", icon: "I" },
      { name: "Bartender", url: "#", icon: "B" },
      { name: "Amphetamine", url: "#", icon: "A" },
      { name: "KeepingYouAwake", url: "#", icon: "K" },
    ]},
    { name: "文件管理", items: [
      { name: "Path Finder", url: "#", icon: "P" },
      { name: "ForkLift", url: "#", icon: "F" },
      { name: "Transmit", url: "#", icon: "T" },
      { name: "Cyberduck", url: "#", icon: "C" },
      { name: "QSpace", url: "#", icon: "Q" },
      { name: "TotalFinder", url: "#", icon: "T" },
    ]},
  ];

  return (
    <section id="experience" className="relative flex min-h-screen flex-col items-center justify-start overflow-hidden py-16 md:py-24">
      {/* Background Gradient Orbs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="aurora-blob -left-1/4 top-1/4 h-[40%] w-[40%] bg-coral-500/10 dark:bg-coral-400/15" />
        <div className="aurora-blob -right-1/4 top-1/2 h-[40%] w-[40%] bg-teal-500/10 dark:bg-teal-500/10" />
        <div className="aurora-blob -left-1/4 bottom-1/4 h-[40%] w-[40%] bg-coral-400/10 dark:bg-coral-400/10" />
      </div>

      <div className="container relative z-10 px-4 mx-auto w-full max-w-7xl flex-1 flex flex-col">
        <motion.h2 
          className="mb-6 text-center text-4xl font-normal tracking-[-0.96px] text-warm-800 md:text-6xl dark:text-warm-50"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {t.experience.title}
        </motion.h2>

        <motion.p
          className="mx-auto mb-16 max-w-2xl text-center leading-relaxed text-warm-600 dark:text-warm-400"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          {t.experience.desc}
        </motion.p>

        {/* macOS Windows Grid - 固定布局 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8 w-full flex-1">
          {softwareCategories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="relative h-[320px]"
            >
              <MacOSWindow title={category.name}>
                <div className="space-y-1">
                  {category.items.map((item) => (
                    <a
                      key={item.name}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex cursor-pointer items-center gap-3 rounded-xl p-2 transition-colors hover:bg-coral-500/10"
                    >
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-coral-500/15 to-coral-400/10 text-sm font-bold text-coral-600 dark:text-coral-400">
                        {item.icon}
                      </div>
                      <span className="flex-1 truncate text-sm font-medium text-warm-700 dark:text-warm-300">
                        {item.name}
                      </span>
                      <ExternalLink className="h-3.5 w-3.5 text-warm-400 opacity-0 transition-opacity group-hover:opacity-100 dark:text-warm-500" />
                    </a>
                  ))}
                </div>
              </MacOSWindow>
            </motion.div>
          ))}
        </div>

        {/* 底部说明 - 固定在页面底部 */}
        <motion.div
          className="mt-auto pt-16 pb-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <p className="text-sm text-warm-600 dark:text-warm-400">
            {t.experience.subtitle}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
