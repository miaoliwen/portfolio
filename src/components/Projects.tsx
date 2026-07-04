import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useLanguage } from "@/src/lib/LanguageContext";

// 本地图片资源
const galleryImages = [
  { src: "/images/IMG_20250420_132452.jpg", title: "摄影作品 1" },
  { src: "/images/mmexport1776082392442.jpg", title: "摄影作品 2" },
  { src: "/images/mmexport1776082426637.jpg", title: "摄影作品 3" },
  { src: "/images/mmexport1776082428749.jpg", title: "摄影作品 4" },
  { src: "/images/Image_1776083546871_800.jpg", title: "摄影作品 5" },
  { src: "/images/Image_1776083562632_262.jpg", title: "摄影作品 6" },
  { src: "/images/Image_1728818111207.jpg", title: "摄影作品 7" },
  { src: "/images/Image_1776083567244_724.jpg", title: "摄影作品 8" },
];

interface ImageItem {
  src: string;
  title: string;
}

// 图片加载状态组件
function ImageLoader() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-warm-100/60 dark:bg-warm-800/50">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}

// 图片卡片组件
function GalleryCard({
  image,
  index,
  onClick,
}: {
  image: ImageItem;
  index: number;
  onClick: () => void;
}) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bento-tile group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-[20px] bg-warm-100/60 dark:bg-warm-800/50"
      onClick={onClick}
    >
      {isLoading && <ImageLoader />}
      <img
        src={image.src}
        alt={image.title}
        className={`object-cover w-full h-full transition-all duration-700 group-hover:scale-110 ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
        onLoad={() => setIsLoading(false)}
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-warm-950/65 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
        <p className="text-warm-50 font-medium text-sm">{image.title}</p>
      </div>
    </motion.div>
  );
}

// 灯箱组件
function Lightbox({
  images,
  currentIndex,
  isOpen,
  onClose,
  onNext,
  onPrev,
}: {
  images: ImageItem[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const currentImage = images[currentIndex];

  // 键盘导航
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft") onPrev();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, onNext, onPrev]);

  // 禁止背景滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // 重置加载状态当图片切换时
  useEffect(() => {
    setIsLoading(true);
  }, [currentIndex]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-warm-950/95"
          onClick={onClose}
        >
          {/* 关闭按钮 */}
          <button
            className="absolute top-4 right-4 z-10 p-2 text-warm-50/80 hover:text-warm-50 transition-colors rounded-full bg-warm-25/10 hover:bg-warm-25/20"
            aria-label="Close gallery"
            onClick={onClose}
          >
            <X className="w-6 h-6" />
          </button>

          {/* 图片计数器 */}
          <div className="absolute top-4 left-4 z-10 px-3 py-1 text-sm text-warm-50/80 bg-warm-25/10 rounded-full">
            {currentIndex + 1} / {images.length}
          </div>

          {/* 上一张按钮 */}
          <button
            className="absolute left-4 z-10 p-3 text-warm-50/80 hover:text-warm-50 transition-colors rounded-full bg-warm-25/10 hover:bg-warm-25/20 disabled:opacity-30"
            aria-label="Previous image"
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* 图片容器 */}
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="relative max-w-[90vw] max-h-[85vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-warm-50/50" />
              </div>
            )}
            <img
              src={currentImage.src}
              alt={currentImage.title}
              className={`max-w-full max-h-[85vh] object-contain rounded-lg ${
                isLoading ? "opacity-0" : "opacity-100"
              }`}
              onLoad={() => setIsLoading(false)}
              referrerPolicy="no-referrer"
            />
          </motion.div>

          {/* 下一张按钮 */}
          <button
            className="absolute right-4 z-10 p-3 text-warm-50/80 hover:text-warm-50 transition-colors rounded-full bg-warm-25/10 hover:bg-warm-25/20 disabled:opacity-30"
            aria-label="Next image"
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            disabled={currentIndex === images.length - 1}
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* 图片标题 */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 px-4 py-2 text-warm-50 text-center bg-warm-25/10 rounded-lg backdrop-blur-sm">
            <p className="font-medium">{currentImage.title}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Projects() {
  const { t } = useLanguage();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const openLightbox = useCallback((index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  const goToNext = useCallback(() => {
    setCurrentImageIndex((prev) =>
      prev < galleryImages.length - 1 ? prev + 1 : prev
    );
  }, []);

  const goToPrev = useCallback(() => {
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  return (
    <section
      id="projects"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden py-16 md:py-24"
    >
      {/* Background Gradient Orbs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="aurora-blob -left-1/4 top-1/4 h-[40%] w-[40%] bg-coral-500/10 dark:bg-coral-400/15" />
        <div className="aurora-blob -right-1/4 bottom-1/4 h-[40%] w-[40%] bg-teal-500/10 dark:bg-teal-500/10" />
      </div>

      <div className="container relative z-10 px-4 mx-auto">
        <motion.div
          className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div>
            <h2 className="text-4xl font-normal tracking-[-0.96px] text-warm-800 md:text-6xl dark:text-warm-50">{t.projects.title}</h2>
          </div>
        </motion.div>

        {/* 图片网格 */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6">
          {galleryImages.map((image, index) => (
            <GalleryCard
              key={index}
              image={image}
              index={index}
              onClick={() => openLightbox(index)}
            />
          ))}
        </div>
      </div>

      {/* 灯箱 */}
      <Lightbox
        images={galleryImages}
        currentIndex={currentImageIndex}
        isOpen={lightboxOpen}
        onClose={closeLightbox}
        onNext={goToNext}
        onPrev={goToPrev}
      />
    </section>
  );
}
