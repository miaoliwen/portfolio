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
    <section id="experience" className="relative flex flex-col items-center justify-start py-16 md:py-24 overflow-hidden min-h-screen">
      {/* Background Gradient Orbs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-[40%] h-[40%] bg-primary/15 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute top-1/2 -right-1/4 w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px] animate-pulse delay-700" />
        <div className="absolute bottom-1/4 -left-1/4 w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[100px] animate-pulse delay-1000" />
      </div>

      <div className="container relative z-10 px-4 mx-auto w-full max-w-7xl flex-1 flex flex-col">
        <motion.h2 
          className="text-3xl md:text-4xl font-bold mb-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {t.experience.title}
        </motion.h2>

        <motion.p
          className="text-center text-muted-foreground mb-16 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          我日常使用的各类软件工具，涵盖开发、设计、效率等多个领域
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
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                        {item.icon}
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate flex-1">
                        {item.name}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
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
          <p className="text-sm text-muted-foreground">
            以上是我推荐的一些优秀软件，它们极大地提升了我的工作效率
          </p>
        </motion.div>
      </div>
    </section>
  );
}
