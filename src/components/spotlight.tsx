"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function Spotlight({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [active, setActive] = useState(false);

  function handleMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    });
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      className={cn("relative isolate overflow-hidden", className)}
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10 transition-opacity duration-300"
        style={{
          opacity: active ? 1 : 0,
          background: `radial-gradient(260px circle at ${pos.x}% ${pos.y}%, rgba(124,58,237,0.14), transparent 70%)`,
        }}
      />
      {children}
    </div>
  );
}
