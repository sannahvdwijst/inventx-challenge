"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import gsap from "gsap";

export interface Carousel3DProps<T> {
  items: T[];
  keyExtractor: (item: T) => string;
  renderItem: (item: T, state: { isActive: boolean; index: number }) => React.ReactNode;
  onActiveIndexChange?: (index: number) => void;
  ariaLabel?: string;
}

interface Size {
  cardWidth: number;
  cardHeight: number;
  radius: number;
}

function computeSize(viewportWidth: number, itemCount: number): Size {
  const isMobile = viewportWidth < 640;
  const cardWidth = isMobile ? Math.min(240, viewportWidth - 96) : 288;
  const cardHeight = isMobile ? 300 : 340;
  // Enough radius that neighbouring cards don't intersect the active one.
  const raw = cardWidth / 2 / Math.tan(Math.PI / Math.max(itemCount, 3));
  const radius = Math.max(raw * 1.35, cardWidth * 0.9);
  return { cardWidth, cardHeight, radius };
}

const SNAP_EASE = "power3.out";
const SNAP_DURATION = 0.7;
const DRAG_SENSITIVITY = 0.28;
const MOMENTUM_MULTIPLIER = 140;
const WHEEL_LOCK_MS = 320;

export function Carousel3D<T>({
  items,
  keyExtractor,
  renderItem,
  onActiveIndexChange,
  ariaLabel,
}: Carousel3DProps<T>) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const angleProxy = useRef({ angle: 0 });
  const currentIndexRef = useRef(0);
  const draggingRef = useRef(false);
  const dragStartX = useRef(0);
  const dragStartAngle = useRef(0);
  const lastMoveRef = useRef<{ x: number; t: number } | null>(null);
  const velocityRef = useRef(0);
  const wheelLockRef = useRef(0);

  const [activeIndex, setActiveIndex] = useState(0);
  const [size, setSize] = useState<Size>(() => computeSize(1024, items.length));

  const count = items.length;
  const anglePerItem = useMemo(() => 360 / Math.max(count, 1), [count]);

  useEffect(() => {
    function handleResize() {
      const w = viewportRef.current?.clientWidth ?? window.innerWidth;
      setSize(computeSize(w, count));
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [count]);

  const applyTransforms = useCallback(
    (angleDeg: number) => {
      let closestIndex = 0;
      let closestDelta = Infinity;

      items.forEach((item, i) => {
        const el = cardRefs.current.get(keyExtractor(item));
        if (!el) return;

        const itemAngle = i * anglePerItem;
        const effective = itemAngle + angleDeg;
        const normalized = ((effective % 360) + 540) % 360 - 180;
        const rad = (normalized * Math.PI) / 180;
        const factor = Math.cos(rad);
        const depth = (factor + 1) / 2;

        if (Math.abs(normalized) < closestDelta) {
          closestDelta = Math.abs(normalized);
          closestIndex = i;
        }

        const scale = 0.58 + 0.42 * Math.pow(depth, 1.4);
        const opacity = 0.2 + 0.8 * depth;
        const blur = (1 - depth) * 5;

        el.style.transform = `translate(-50%, -50%) rotateY(${itemAngle}deg) translateZ(${size.radius}px) scale(${scale})`;
        el.style.opacity = String(opacity);
        el.style.filter = blur > 0.3 ? `blur(${blur.toFixed(1)}px)` : "none";
        el.style.zIndex = String(Math.round(factor * 1000));
        el.style.pointerEvents = depth > 0.75 ? "auto" : "none";
      });

      return closestIndex;
    },
    [items, keyExtractor, anglePerItem, size.radius]
  );

  useEffect(() => {
    applyTransforms(angleProxy.current.angle);
  }, [applyTransforms]);

  const goToIndex = useCallback(
    (index: number, opts?: { immediate?: boolean }) => {
      currentIndexRef.current = index;
      const mod = ((index % count) + count) % count;
      setActiveIndex(mod);
      onActiveIndexChange?.(mod);

      const target = -index * anglePerItem;
      gsap.killTweensOf(angleProxy.current);

      if (opts?.immediate) {
        angleProxy.current.angle = target;
        applyTransforms(target);
        return;
      }

      gsap.to(angleProxy.current, {
        angle: target,
        duration: SNAP_DURATION,
        ease: SNAP_EASE,
        onUpdate: () => applyTransforms(angleProxy.current.angle),
      });
    },
    [count, anglePerItem, applyTransforms, onActiveIndexChange]
  );

  const next = useCallback(() => goToIndex(currentIndexRef.current + 1), [goToIndex]);
  const prev = useCallback(() => goToIndex(currentIndexRef.current - 1), [goToIndex]);

  function onPointerDown(e: React.PointerEvent) {
    if (count < 2) return;
    draggingRef.current = true;
    dragStartX.current = e.clientX;
    dragStartAngle.current = angleProxy.current.angle;
    lastMoveRef.current = { x: e.clientX, t: performance.now() };
    velocityRef.current = 0;
    gsap.killTweensOf(angleProxy.current);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!draggingRef.current) return;
    const deltaX = e.clientX - dragStartX.current;
    const newAngle = dragStartAngle.current + deltaX * DRAG_SENSITIVITY;
    angleProxy.current.angle = newAngle;
    applyTransforms(newAngle);

    const now = performance.now();
    const last = lastMoveRef.current;
    if (last) {
      const dt = now - last.t;
      if (dt > 0) {
        velocityRef.current = ((e.clientX - last.x) * DRAG_SENSITIVITY) / dt;
      }
    }
    lastMoveRef.current = { x: e.clientX, t: now };
  }

  function onPointerUp() {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    const momentum = velocityRef.current * MOMENTUM_MULTIPLIER;
    const projected = angleProxy.current.angle + momentum;
    const targetIndex = Math.round(-projected / anglePerItem);
    goToIndex(targetIndex);
  }

  function onWheel(e: React.WheelEvent) {
    if (count < 2) return;
    e.preventDefault();
    const now = performance.now();
    if (now - wheelLockRef.current < WHEEL_LOCK_MS) return;
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(delta) < 8) return;
    wheelLockRef.current = now;
    if (delta > 0) next();
    else prev();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev();
    } else if (e.key === "Home") {
      e.preventDefault();
      goToIndex(0);
    } else if (e.key === "End") {
      e.preventDefault();
      goToIndex(count - 1);
    }
  }

  return (
    <div className="w-full select-none">
      <div
        ref={viewportRef}
        role="region"
        aria-label={ariaLabel ?? "Carousel"}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
        onKeyDown={onKeyDown}
        className="relative mx-auto cursor-grab touch-pan-y outline-none active:cursor-grabbing"
        style={{
          height: size.cardHeight + 140,
          perspective: "1600px",
          perspectiveOrigin: "50% 50%",
        }}
      >
        <div
          ref={ringRef}
          className="absolute left-1/2 top-1/2"
          style={{ transformStyle: "preserve-3d" }}
        >
          {items.map((item, i) => (
            <div
              key={keyExtractor(item)}
              ref={(el) => {
                if (el) cardRefs.current.set(keyExtractor(item), el);
                else cardRefs.current.delete(keyExtractor(item));
              }}
              className="absolute left-0 top-0 will-change-transform"
              style={{
                width: size.cardWidth,
                height: size.cardHeight,
                transformStyle: "preserve-3d",
              }}
            >
              <div className="carousel-3d-shadow h-full w-full rounded-2xl">
                {renderItem(item, { isActive: i === activeIndex, index: i })}
              </div>
            </div>
          ))}
        </div>

        {count > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous"
              onClick={prev}
              className="absolute left-0 top-1/2 z-40 -translate-y-1/2 rounded-full bg-white/90 p-2 text-cap-dark-blue shadow-md transition hover:scale-105 hover:bg-white"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Next"
              onClick={next}
              className="absolute right-0 top-1/2 z-40 -translate-y-1/2 rounded-full bg-white/90 p-2 text-cap-dark-blue shadow-md transition hover:scale-105 hover:bg-white"
            >
              ›
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="mt-2 flex justify-center gap-1.5">
          {items.map((item, i) => (
            <button
              key={keyExtractor(item)}
              type="button"
              aria-label={`Go to item ${i + 1}`}
              onClick={() => goToIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === activeIndex ? "w-5 bg-cap-dark-blue" : "w-1.5 bg-cap-dark-blue/25"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
