"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";

export interface CoverflowCarouselProps<T> {
  items: T[];
  keyExtractor: (item: T) => string;
  renderItem: (item: T, state: { isActive: boolean; index: number }) => React.ReactNode;
  onActiveIndexChange?: (index: number) => void;
  ariaLabel?: string;
}

interface Size {
  cardWidth: number;
  cardHeight: number;
  spacing: number;
}

function computeSize(viewportWidth: number, viewportHeight: number): Size {
  const isMobile = viewportWidth < 640;
  const cardWidth = isMobile ? Math.min(270, viewportWidth - 100) : 300;
  // Cards need to be tall enough to fit a full title + description without
  // clipping, but not taller than the screen has room for.
  const cardHeight = isMobile
    ? Math.min(460, Math.max(360, viewportHeight - 380))
    : 400;
  const spacing = cardWidth * 0.62;
  return { cardWidth, cardHeight, spacing };
}

// Shortest signed distance between an item's index and the (possibly
// fractional) active position, wrapping around for infinite looping.
function wrappedDelta(index: number, position: number, count: number) {
  let delta = index - position;
  delta = ((delta % count) + count) % count;
  if (delta > count / 2) delta -= count;
  return delta;
}

const SNAP_EASE = "power3.out";
const SNAP_DURATION = 0.65;
const DRAG_SENSITIVITY = 1;
const MOMENTUM_MULTIPLIER = 6;
const WHEEL_LOCK_MS = 320;
const MAX_ROTATION = 32;
const VISIBLE_RANGE = 3;

export function CoverflowCarousel<T>({
  items,
  keyExtractor,
  renderItem,
  onActiveIndexChange,
  ariaLabel,
}: CoverflowCarouselProps<T>) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const positionProxy = useRef({ pos: 0 });
  const currentIndexRef = useRef(0);
  const draggingRef = useRef(false);
  const dragStartX = useRef(0);
  const dragStartY = useRef(0);
  const dragStartPos = useRef(0);
  const dragIntentRef = useRef<"unknown" | "horizontal" | "vertical">("unknown");
  const lastMoveRef = useRef<{ x: number; t: number } | null>(null);
  const velocityRef = useRef(0);
  const wheelLockRef = useRef(0);

  const [activeIndex, setActiveIndex] = useState(0);
  const [size, setSize] = useState<Size>(() => computeSize(1024, 800));

  const count = items.length;

  useEffect(() => {
    function handleResize() {
      const w = viewportRef.current?.clientWidth ?? window.innerWidth;
      setSize(computeSize(w, window.innerHeight));
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const applyTransforms = useCallback(
    (position: number) => {
      let closestIndex = 0;
      let closestDelta = Infinity;

      items.forEach((item, i) => {
        const el = cardRefs.current.get(keyExtractor(item));
        if (!el) return;

        const delta = wrappedDelta(i, position, count);
        const absDelta = Math.abs(delta);

        if (absDelta < closestDelta) {
          closestDelta = absDelta;
          closestIndex = i;
        }

        if (absDelta > VISIBLE_RANGE) {
          el.style.opacity = "0";
          el.style.pointerEvents = "none";
          el.style.zIndex = "0";
          return;
        }

        const x = delta * size.spacing;
        const z = -absDelta * 90;
        const rotation = Math.max(-MAX_ROTATION, Math.min(MAX_ROTATION, delta * -22));
        const scale = Math.max(0.5, 1 - absDelta * 0.22);
        const opacity = Math.max(0, 1 - absDelta * 0.4);

        el.style.transform = `translate(-50%, -50%) translateX(${x}px) translateZ(${z}px) rotateY(${rotation}deg) scale(${scale})`;
        el.style.opacity = String(opacity);
        el.style.zIndex = String(Math.round(1000 - absDelta * 10));
        el.style.pointerEvents = absDelta < 0.5 ? "auto" : "none";
      });

      return closestIndex;
    },
    [items, keyExtractor, count, size.spacing]
  );

  useEffect(() => {
    applyTransforms(positionProxy.current.pos);
  }, [applyTransforms]);

  const goToIndex = useCallback(
    (index: number, opts?: { immediate?: boolean }) => {
      currentIndexRef.current = index;
      const mod = ((index % count) + count) % count;
      setActiveIndex(mod);
      onActiveIndexChange?.(mod);

      gsap.killTweensOf(positionProxy.current);

      if (opts?.immediate) {
        positionProxy.current.pos = index;
        applyTransforms(index);
        return;
      }

      gsap.to(positionProxy.current, {
        pos: index,
        duration: SNAP_DURATION,
        ease: SNAP_EASE,
        onUpdate: () => applyTransforms(positionProxy.current.pos),
      });
    },
    [count, applyTransforms, onActiveIndexChange]
  );

  const next = useCallback(() => goToIndex(currentIndexRef.current + 1), [goToIndex]);
  const prev = useCallback(() => goToIndex(currentIndexRef.current - 1), [goToIndex]);

  function onPointerDown(e: React.PointerEvent) {
    if (count < 2) return;
    // Don't start dragging or capture the pointer yet — a touch that turns
    // out to be a vertical scroll (e.g. reading a long description) needs
    // to reach the card's own scroll container untouched.
    dragIntentRef.current = "unknown";
    dragStartX.current = e.clientX;
    dragStartY.current = e.clientY;
    dragStartPos.current = positionProxy.current.pos;
    lastMoveRef.current = { x: e.clientX, t: performance.now() };
    velocityRef.current = 0;
  }

  function onPointerMove(e: React.PointerEvent) {
    if (dragIntentRef.current === "vertical") return;

    const deltaX = e.clientX - dragStartX.current;
    const deltaY = e.clientY - dragStartY.current;

    if (dragIntentRef.current === "unknown") {
      if (Math.abs(deltaX) < 6 && Math.abs(deltaY) < 6) return;
      if (Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
        dragIntentRef.current = "horizontal";
        draggingRef.current = true;
        gsap.killTweensOf(positionProxy.current);
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
      } else {
        dragIntentRef.current = "vertical";
        return;
      }
    }

    const newPos = dragStartPos.current - (deltaX / size.spacing) * DRAG_SENSITIVITY;
    positionProxy.current.pos = newPos;
    applyTransforms(newPos);

    const now = performance.now();
    const last = lastMoveRef.current;
    if (last) {
      const dt = now - last.t;
      if (dt > 0) {
        velocityRef.current = -(e.clientX - last.x) / size.spacing / dt;
      }
    }
    lastMoveRef.current = { x: e.clientX, t: now };
  }

  function onPointerUp() {
    const wasDragging = draggingRef.current;
    draggingRef.current = false;
    dragIntentRef.current = "unknown";
    if (!wasDragging) return;
    const momentum = velocityRef.current * MOMENTUM_MULTIPLIER * 16;
    const projected = positionProxy.current.pos + momentum;
    goToIndex(Math.round(projected));
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
        className="relative isolate mx-auto cursor-grab touch-pan-y overflow-visible outline-none active:cursor-grabbing"
        style={{
          height: size.cardHeight + 80,
          perspective: "1800px",
          perspectiveOrigin: "50% 50%",
        }}
      >
        <div
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
              className="absolute left-2 top-1/2 z-40 -translate-y-1/2 rounded-full bg-white/90 p-2 text-cap-dark-blue shadow-md transition hover:scale-105 hover:bg-white"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Next"
              onClick={next}
              className="absolute right-2 top-1/2 z-40 -translate-y-1/2 rounded-full bg-white/90 p-2 text-cap-dark-blue shadow-md transition hover:scale-105 hover:bg-white"
            >
              ›
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="mt-3 flex justify-center gap-1.5">
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
