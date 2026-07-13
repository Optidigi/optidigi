"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

interface FlickeringGridProps extends React.HTMLAttributes<HTMLDivElement> {
  squareSize?: number;
  gridGap?: number;
  flickerChance?: number;
  color?: string;
  maxOpacity?: number;
  maskImageSrc?: string;
  maskMaxOpacity?: number;
}

/** Adapted from Magic UI's open-source Flickering Grid component. */
export function FlickeringGrid({
  squareSize = 4,
  gridGap = 7,
  flickerChance = 0.08,
  color = "rgb(5, 170, 116)",
  maxOpacity = 0.1,
  maskImageSrc,
  maskMaxOpacity = 0.42,
  className,
  ...props
}: FlickeringGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  const rgbaPrefix = useMemo(() => {
    if (typeof window === "undefined") return "rgba(5, 170, 116,";
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const context = canvas.getContext("2d");
    if (!context) return "rgba(5, 170, 116,";
    context.fillStyle = color;
    context.fillRect(0, 0, 1, 1);
    const [red, green, blue] = context.getImageData(0, 0, 1, 1).data;
    return `rgba(${red}, ${green}, ${blue},`;
  }, [color]);

  const setupCanvas = useCallback((maskImage?: HTMLImageElement) => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return null;

    const width = container.clientWidth;
    const height = container.clientHeight;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const columns = Math.ceil(width / (squareSize + gridGap));
    const rows = Math.ceil(height / (squareSize + gridGap));
    const squares = new Float32Array(columns * rows);
    const mask = new Uint8Array(columns * rows);

    let maskData: Uint8ClampedArray | undefined;
    if (maskImage) {
      const maskCanvas = document.createElement("canvas");
      maskCanvas.width = width;
      maskCanvas.height = height;
      const maskContext = maskCanvas.getContext("2d");
      if (maskContext) {
        const logoWidth = Math.min(width * 0.88, 1095);
        const logoHeight = logoWidth * (272 / 1095);
        const logoX = (width - logoWidth) / 2;
        const logoY = height - logoHeight - Math.max(12, height * 0.05);
        maskContext.drawImage(maskImage, logoX, logoY, logoWidth, logoHeight);
        maskData = maskContext.getImageData(0, 0, width, height).data;
      }
    }

    for (let index = 0; index < squares.length; index += 1) {
      const column = Math.floor(index / rows);
      const row = index % rows;
      const sampleX = Math.min(width - 1, Math.floor(column * (squareSize + gridGap)));
      const sampleY = Math.min(height - 1, Math.floor(row * (squareSize + gridGap)));
      const isMasked = Boolean(maskData && maskData[(sampleY * width + sampleX) * 4 + 3] > 32);
      mask[index] = isMasked ? 1 : 0;
      const ceiling = isMasked ? maskMaxOpacity : maxOpacity;
      const floor = isMasked ? ceiling * 0.22 : 0;
      squares[index] = floor + Math.random() * (ceiling - floor);
    }
    return { width, height, dpr, columns, rows, squares, mask };
  }, [gridGap, maskMaxOpacity, maxOpacity, squareSize]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !container || !context) return;

    let maskImage: HTMLImageElement | undefined;
    let grid: ReturnType<typeof setupCanvas> = null;
    let frame = 0;
    let previousTime = 0;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const draw = () => {
      if (!grid) return;
      context.clearRect(0, 0, canvas.width, canvas.height);
      for (let column = 0; column < grid.columns; column += 1) {
        for (let row = 0; row < grid.rows; row += 1) {
          const opacity = grid.squares[column * grid.rows + row];
          context.fillStyle = `${rgbaPrefix}${opacity})`;
          context.fillRect(
            column * (squareSize + gridGap) * grid.dpr,
            row * (squareSize + gridGap) * grid.dpr,
            squareSize * grid.dpr,
            squareSize * grid.dpr,
          );
        }
      }
    };

    const animate = (time: number) => {
      if (!grid || !isInView) return;
      const deltaTime = (time - previousTime) / 1000;
      previousTime = time;
      if (!reducedMotion) {
        for (let index = 0; index < grid.squares.length; index += 1) {
          const isMasked = grid.mask[index] === 1;
          const chance = flickerChance * (isMasked ? 1.8 : 0.65);
          if (Math.random() < chance * deltaTime) {
            const ceiling = isMasked ? maskMaxOpacity : maxOpacity;
            const floor = isMasked ? ceiling * 0.18 : 0;
            grid.squares[index] = floor + Math.random() * (ceiling - floor);
          }
        }
      }
      draw();
      if (!reducedMotion) frame = requestAnimationFrame(animate);
    };

    const resizeObserver = new ResizeObserver(() => {
      grid = setupCanvas(maskImage);
      draw();
    });
    resizeObserver.observe(container);

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting);
    });
    intersectionObserver.observe(canvas);

    const start = () => {
      grid = setupCanvas(maskImage);
      draw();
      if (isInView && !reducedMotion) frame = requestAnimationFrame(animate);
    };

    if (maskImageSrc) {
      maskImage = new Image();
      maskImage.onload = start;
      maskImage.src = maskImageSrc;
    } else {
      start();
    }

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
    };
  }, [flickerChance, isInView, maskImageSrc, maskMaxOpacity, maxOpacity, rgbaPrefix, setupCanvas, squareSize, gridGap]);

  return (
    <div ref={containerRef} className={cn("h-full w-full", className)} {...props}>
      <canvas ref={canvasRef} className="pointer-events-none block" />
    </div>
  );
}
