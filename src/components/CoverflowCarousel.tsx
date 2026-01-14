import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CarouselItem {
  id: number;
  image: string;
  title: string;
  subtitle: string;
}

interface CoverflowCarouselProps {
  items: CarouselItem[];
}

const CoverflowCarousel = ({ items }: CoverflowCarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(Math.floor(items.length / 2));

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  }, [items.length]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
  }, [items.length]);

  const getItemStyle = (index: number) => {
    const diff = index - activeIndex;
    const absDiff = Math.abs(diff);
    
    // Only show 5 items (2 on each side + center)
    if (absDiff > 2) {
      return {
        opacity: 0,
        x: diff > 0 ? 500 : -500,
        z: -500,
        rotateY: 0,
        scale: 0.5,
        zIndex: 0,
      };
    }

    const isCenter = diff === 0;
    const isLeft = diff < 0;

    return {
      opacity: isCenter ? 1 : 0.7 - absDiff * 0.15,
      x: diff * 220,
      z: isCenter ? 0 : -180 * absDiff,
      rotateY: isCenter ? 0 : isLeft ? 45 : -45,
      scale: isCenter ? 1 : 0.75 - absDiff * 0.05,
      zIndex: 10 - absDiff,
    };
  };

  return (
    <div className="relative w-full h-[600px] flex flex-col items-center justify-center">
      {/* Ambient glow background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/2 left-1/2 w-[600px] h-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px] opacity-20"
          style={{
            background: `radial-gradient(ellipse, hsl(var(--primary)), transparent 70%)`,
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Carousel container */}
      <div className="coverflow-container relative w-full h-[450px] flex items-center justify-center">
        <AnimatePresence mode="popLayout">
          {items.map((item, index) => {
            const style = getItemStyle(index);
            const isActive = index === activeIndex;

            return (
              <motion.div
                key={item.id}
                className="coverflow-item absolute cursor-pointer"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: style.opacity,
                  x: style.x,
                  z: style.z,
                  rotateY: style.rotateY,
                  scale: style.scale,
                  zIndex: style.zIndex,
                }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
                onClick={() => setActiveIndex(index)}
                whileHover={!isActive ? { scale: style.scale * 1.05 } : {}}
              >
                <div
                  className={`coverflow-card w-[320px] h-[400px] ${
                    isActive ? "coverflow-card-active" : ""
                  }`}
                >
                  <div className="relative w-full h-full">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    
                    {/* Content */}
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 p-6"
                      animate={{
                        opacity: isActive ? 1 : 0.5,
                        y: isActive ? 0 : 10,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-xl font-semibold text-white mb-1">
                        {item.title}
                      </h3>
                      <p className="text-sm text-white/60">{item.subtitle}</p>
                    </motion.div>

                    {/* Active glow border */}
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 rounded-2xl pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{
                          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.15)",
                        }}
                      />
                    )}
                  </div>
                </div>

                {/* Reflection */}
                {isActive && (
                  <div className="coverflow-reflection">
                    <img
                      src={item.image}
                      alt=""
                      className="w-[320px] h-[400px] object-cover rounded-2xl blur-sm"
                    />
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-8 mt-8">
        <button
          onClick={handlePrev}
          className="nav-button"
          aria-label="Previous item"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Indicators */}
        <div className="flex items-center gap-2">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`indicator-dot ${
                index === activeIndex ? "indicator-dot-active" : ""
              }`}
              aria-label={`Go to item ${index + 1}`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="nav-button"
          aria-label="Next item"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Item counter */}
      <motion.div
        className="mt-6 text-muted-foreground text-sm font-medium tracking-wider"
        key={activeIndex}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {String(activeIndex + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
      </motion.div>
    </div>
  );
};

export default CoverflowCarousel;
