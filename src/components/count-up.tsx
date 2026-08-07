"use client";

import { useEffect, useRef, useState } from "react";

export function CountUp({
  end,
  duration = 1200,
  prefix = "",
  suffix = "",
  className,
}: {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [started, setStarted] = useState(false);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;

    let raf = 0;
    const start = performance.now();

    function tick(now: number) {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(end * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, end, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {value.toLocaleString("en-US")}
      {suffix}
    </span>
  );
}
