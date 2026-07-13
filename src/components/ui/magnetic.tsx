"use client";

import { motion } from "motion/react";
import { useCallback, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

interface MagneticProps {
  children: ReactNode;
  className?: string;
  strength?: number;
  maxDistance?: number;
}

export function Magnetic({
  children,
  className,
  strength = 0.8,
  maxDistance = 28,
}: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!ref.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      const { width, height, left, top } = ref.current.getBoundingClientRect();
      const { clientX, clientY } = event;

      let x = (clientX - (left + width / 2)) * strength;
      let y = (clientY - (top + height / 2)) * strength;

      const distance = Math.hypot(x, y);
      if (distance > maxDistance) {
        const scale = maxDistance / distance;
        x *= scale;
        y *= scale;
      }

      setPosition({ x, y });
    },
    [maxDistance, strength],
  );

  const handleMouseLeave = useCallback(() => {
    setPosition({ x: 0, y: 0 });
  }, []);

  return (
    <div
      className="relative size-full"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        ref={ref}
        className={cn("size-full", className)}
        animate={{ x: position.x, y: position.y }}
        transition={{ type: "spring", stiffness: 150, damping: 25, mass: 0.1 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
