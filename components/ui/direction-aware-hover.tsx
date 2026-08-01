"use client";

import { useRef, useState } from "react";
import Image, { type StaticImageData } from "next/image";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { cn } from "@/lib/utils";

type Direction = "top" | "bottom" | "left" | "right";

/**
 * Determines which edge the cursor entered from, by the angle between the
 * pointer and the element's centre. Verbatim mechanism from Aceternity UI's
 * Direction Aware Hover (`Math.atan2` over the pointer offset from centre,
 * normalised to a 0-3 quadrant index) — this part has no editorial-specific
 * reason to change.
 */
function getEnterDirection(
  event: React.MouseEvent<HTMLDivElement>,
  element: HTMLDivElement,
): Direction {
  const { width, height, left, top } = element.getBoundingClientRect();
  const x = event.clientX - left - (width / 2) * (width > height ? height / width : 1);
  const y = event.clientY - top - (height / 2) * (height > width ? width / height : 1);
  const angle = Math.round((Math.atan2(y, x) / 1.57079633 + 5) % 4);
  switch (angle) {
    case 0:
      return "top";
    case 1:
      return "right";
    case 2:
      return "bottom";
    default:
      return "left";
  }
}

const imageOffset: Variants = {
  initial: { x: 0, y: 0 },
  top: { y: 10 },
  bottom: { y: -10 },
  left: { x: 10 },
  right: { x: -10 },
};

/**
 * Adapted from Aceternity UI's Direction Aware Hover — subtle, "expensive to
 * perceive, cheap to run" motion for the Proyectos grid (design brief for
 * feat/editorial-design). Adapted rather than copied verbatim in two ways:
 *
 * 1. The original takes a plain `imageUrl: string` and renders a fixed
 *    `h-96 w-96` box. This project's content model deliberately stores media
 *    as `StaticImageData` (design.md D9/§8 — a missing file becomes a build
 *    error, not a silent runtime 404), so this version takes `image:
 *    StaticImageData` and renders `<Image fill>` inside a caller-sized,
 *    caller-`sizes` container instead, preserving that guarantee.
 * 2. `children` is optional. The original always overlays a caption; this
 *    site's portfolio cards keep their title/summary as plain text BELOW
 *    the image (never overlaid), so most callers pass no children — this
 *    component then does exactly one thing: a direction-aware image pan on
 *    hover, nothing else.
 *
 * Used ONLY where a project's evidence state actually has an image
 * (`components/portfolio/evidence.tsx`'s `live`/`gated`/`not-deployed`
 * branches). The `no-visual` state renders no `<Image>` at all (design.md
 * §8) and therefore never reaches this component — an honest empty state
 * has no image surface for "direction aware hover" to mean anything on.
 *
 * **`prefers-reduced-motion`**: the pan offset itself is skipped entirely
 * when `useReducedMotion()` is true (the `whileHover` variant becomes a
 * no-op object), since a `MotionValue`-driven transform on hover is not
 * reachable by the global CSS media-query override. The darkening overlay
 * and image scale below use plain Tailwind transition classes, which the
 * global override in `app/globals.css` already neutralizes.
 */
export function DirectionAwareHover({
  image,
  imageAlt,
  sizes,
  className,
  imageClassName,
  priority,
  children,
}: {
  image: StaticImageData;
  imageAlt: string;
  sizes: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  children?: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [direction, setDirection] = useState<Direction>("left");
  const shouldReduceMotion = useReducedMotion();

  function handleMouseEnter(event: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;
    setDirection(getEnterDirection(event, ref.current));
  }

  return (
    <div
      ref={ref}
      onMouseEnter={handleMouseEnter}
      className={cn(
        "group/hover relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-muted",
        className,
      )}
    >
      <div className="absolute inset-0 z-10 bg-foreground/0 transition-colors duration-500 group-hover/hover:bg-foreground/20" />
      <motion.div
        variants={shouldReduceMotion ? undefined : imageOffset}
        initial="initial"
        whileHover={shouldReduceMotion ? undefined : direction}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="h-full w-full scale-105"
      >
        <Image
          src={image}
          alt={imageAlt}
          fill
          sizes={sizes}
          priority={priority}
          className={cn("object-cover", imageClassName)}
        />
      </motion.div>
      {children ? (
        <div className="absolute bottom-3 left-3 z-20 text-background">{children}</div>
      ) : null}
    </div>
  );
}
