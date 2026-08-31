"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { slideUp, staggerContainer, staggerChild, viewportOnce } from "@/lib/motion";

export function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewportOnce}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerGroup({ children }: { children: React.ReactNode }) {
  return (
    <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={viewportOnce}>
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children }: { children: React.ReactNode }) {
  return <motion.div variants={staggerChild}>{children}</motion.div>;
}

export function AnimatedCounter({
  value,
  suffix = "",
  duration = 1.2,
}: {
  value: number;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);
  const inView = useInView(ref);

  useEffect(() => {
    if (!inView) return;
    let start: number | null = null;
    let raf = 0;
    const step = (ts: number) => {
      if (start === null) start = ts;
      const progress = Math.min((ts - start) / (duration * 1000), 1);
      setDisplay(Math.round(progress * value));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration]);

  return (
    <span ref={ref}>
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}

function useInView(ref: React.RefObject<HTMLElement | null>) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref]);
  return inView;
}

export { slideUp };
