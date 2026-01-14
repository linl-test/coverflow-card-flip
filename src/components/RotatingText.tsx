import { motion, Transition, Variant } from "motion/react";
import { useEffect, useState } from "react";

interface RotatingTextProps {
  texts: string[];
  mainClassName?: string;
  style?: React.CSSProperties;
  staggerFrom?: "first" | "last" | "center";
  initial?: Variant;
  animate?: Variant;
  exit?: Variant;
  staggerDuration?: number;
  splitLevelClassName?: string;
  transition?: Transition;
  rotationInterval?: number;
}

const RotatingText = ({
  texts,
  mainClassName = "",
  style,
  staggerFrom = "first",
  initial = { y: "100%" },
  animate = { y: 0 },
  exit = { y: "-120%" },
  staggerDuration = 0.015,
  splitLevelClassName = "",
  transition = { type: "spring", damping: 30, stiffness: 400 },
  rotationInterval = 2000,
}: RotatingTextProps) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % texts.length);
    }, rotationInterval);
    return () => clearInterval(interval);
  }, [texts.length, rotationInterval]);

  const currentText = texts[index];
  const letters = currentText.split("");

  const getStaggerDelay = (i: number) => {
    if (staggerFrom === "first") return i * staggerDuration;
    if (staggerFrom === "last") return (letters.length - 1 - i) * staggerDuration;
    if (staggerFrom === "center") {
      const center = Math.floor(letters.length / 2);
      return Math.abs(center - i) * staggerDuration;
    }
    return 0;
  };

  return (
    <div className={mainClassName} style={style}>
      <motion.div
        key={index}
        className="flex"
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {letters.map((letter, i) => (
          <div key={`${index}-${i}`} className={splitLevelClassName}>
            <motion.span
              custom={i}
              variants={{
                initial,
                animate,
                exit,
              }}
              transition={{
                ...transition,
                delay: getStaggerDelay(i),
              }}
              className="inline-block"
            >
              {letter === " " ? "\u00A0" : letter}
            </motion.span>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default RotatingText;
