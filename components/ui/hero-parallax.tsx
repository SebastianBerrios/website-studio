"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
  MotionValue,
} from "motion/react";
import { isExternalHref } from "@/lib/links";

// A row only reads as parallax motion if it overflows the viewport; otherwise
// the preserved 1000px slide drags a short row through empty space (design.md
// D4). Each card is `w-120` (480px) separated by `space-x-20` (80px), so a row
// of n spans `560n - 80` px:
//
//   2 cards = 1040px   overflows nothing
//   3 cards = 1600px   overflows 1440px, not 1920px
//   4 cards = 2160px   overflows both
//
// So splitting into two rows is only correct when BOTH rows would hold at
// least MIN_ROW_CARDS — that is, from 8 products up. Between 5 and 7 a single
// long row is the right answer.
//
// D4 illustrates this rule with "6 -> 3+3", which predates the arithmetic
// above and contradicts D4's own stated criterion: at 6 products a 3+3 split
// yields two rows that overflow neither 1920px viewport. The measured rule
// wins over the illustrative example. Without this guard, counts of 5 and 7
// produce a stranded second row — and those counts are not hypothetical,
// because case studies land one at a time (tasks.md task 5.5).
const MIN_ROW_CARDS = 4;

export const HeroParallax = ({
  products,
  header,
  productsId,
}: {
  products: readonly {
    title: string;
    link: string;
    thumbnail: string;
  }[];
  /**
   * Server-rendered title/subtitle/CTA slot (design.md D5). Copy moved to
   * `lib/dictionaries/es.ts`; render it via `components/sections/
   * hero-header.tsx`. Optional so this component has no hardcoded-copy
   * fallback of its own.
   */
  header?: React.ReactNode;
  /**
   * `id` applied to the products-track wrapper only — never to this
   * component's outer element, which also contains `header`.
   *
   * Fixes verify-report.md finding W2: the previous caller wrapped the
   * ENTIRE `<HeroParallax>` (header included) in `<div id="proyectos">`, so
   * the header's own "Explora nuestros proyectos" CTA — which links to
   * `#proyectos` — scrolled to the top of the section the visitor was
   * already reading. `header` renders before this prop is applied, so the
   * anchor target is always below the CTA in document order.
   */
  productsId?: string;
}) => {
  const splitAt =
    products.length >= MIN_ROW_CARDS * 2
      ? Math.ceil(products.length / 2)
      : products.length;
  const firstRow = products.slice(0, splitAt);
  const secondRow = products.slice(splitAt);
  const ref = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  // Hard constraint (feat/editorial-design): every animation must be
  // disabled or reduced under `prefers-reduced-motion`. This scroll-linked
  // parallax is exactly that class of motion, and a `MotionValue` driven by
  // `useScroll`/`useSpring` is not reachable by the global CSS media-query
  // override in `app/globals.css` (it sets inline transforms via rAF, not a
  // CSS animation/transition).
  //
  // This is the ONLY change made to this component's motion behaviour. Per
  // design.md D4 and this slice's hard constraint 10, the row-derivation
  // logic above and every `useScroll`/`useTransform`/`useSpring` call below
  // are UNCHANGED — same hooks, same ranges, same spring config. What
  // changes is only whether their computed output is ever applied to
  // `style`: see the `shouldReduceMotion` ternaries below, which swap the
  // live `MotionValue`s for the resting values the entrance animation
  // settles on, so a reduced-motion visitor sees the finished layout
  // immediately instead of the scroll-driven journey to it.
  const shouldReduceMotion = useReducedMotion();

  const springConfig = { stiffness: 300, damping: 30, bounce: 100 };

  const translateX = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, 1000]),
    springConfig,
  );
  const translateXReverse = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, -1000]),
    springConfig,
  );
  const rotateX = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [15, 0]),
    springConfig,
  );
  const opacity = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [0.2, 1]),
    springConfig,
  );
  const rotateZ = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [20, 0]),
    springConfig,
  );
  const translateY = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [-700, 50]),
    springConfig,
  );
  return (
    <div
      ref={ref}
      className="py-20 overflow-hidden antialiased relative flex flex-col self-auto perspective-[1000px] transform-3d"
    >
      {header}
      <motion.div
        id={productsId}
        style={
          // Resting values match this spring set's own settled endpoints
          // (scrollYProgress = 1: rotateX 0, rotateZ 0, opacity 1,
          // translateY 50) — the layout the entrance animates TOWARD, shown
          // immediately instead of animated into. See the top-of-component
          // comment: no range or spring config changes, only whether the
          // computed values are applied.
          shouldReduceMotion
            ? { rotateX: 0, rotateZ: 0, translateY: 50, opacity: 1 }
            : { rotateX, rotateZ, translateY, opacity }
        }
      >
        <motion.div className="flex flex-row-reverse space-x-reverse space-x-20 mb-10">
          {firstRow.map((product) => (
            <ProductCard
              product={product}
              translate={translateX}
              shouldReduceMotion={shouldReduceMotion}
              key={product.title}
            />
          ))}
        </motion.div>
        {secondRow.length > 0 && (
          <motion.div className="flex flex-row mb-10 space-x-20 ">
            {secondRow.map((product) => (
              <ProductCard
                product={product}
                translate={translateXReverse}
                shouldReduceMotion={shouldReduceMotion}
                key={product.title}
              />
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export const ProductCard = ({
  product,
  translate,
  shouldReduceMotion,
}: {
  product: {
    title: string;
    link: string;
    thumbnail: string;
  };
  translate: MotionValue<number>;
  /**
   * See `HeroParallax`'s top comment: additive-only reduced-motion gate.
   * `boolean | null` because `motion/react`'s `useReducedMotion()` returns
   * `null` before the browser's media-query preference is known (e.g.
   * during server rendering) — treated as "motion allowed" until resolved,
   * same as the library's own default.
   */
  shouldReduceMotion?: boolean | null;
}) => {
  const cardBody = (
    /*
     * Card title, corrected 2026-08-01 (remediation of
     * `verify-report-final.md` findings W9 and W11).
     *
     * W11: the title used to be `opacity-0 group-hover/product:opacity-100`
     * — invisible until a `:hover` that touch devices never fire, so a
     * mobile visitor saw four unlabelled images (the label existed in `alt`
     * for assistive tech, but not for sighted touch users). The gradient
     * scrim is now permanent instead of hover-only, and the `<h2>` is always
     * rendered at full opacity — a sighted visitor on any input device now
     * sees every card's title without needing to hover at all. `whileHover`'s
     * card lift (below) remains the desktop-only flourish.
     *
     * W9: this was an `<h3>` immediately after the page's one `<h1>` (the
     * hero heading, `hero-header.tsx`), with no `<h2>` in between —
     * `components/sections/services.tsx`'s `<h2>` is the next heading in
     * document order, rendered by a sibling component further down the page.
     * Raised to `<h2>` so the outline reads h1 -> h2 (these cards) -> h2
     * (Servicios) -> h3 (its own cards), never skipping a level. Tailwind's
     * preflight resets heading font-size/weight to `inherit`, so this is a
     * pure semantic change — the rendered size is unchanged.
     */
    <div className="relative overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <Image
        src={product.thumbnail}
        height={600}
        width={600}
        className="object-contain max-h-96 max-w-120"
        alt={product.title}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/20 to-transparent pointer-events-none"></div>
      <h2 className="absolute bottom-4 left-4 font-display text-lg font-medium text-background z-10">
        {product.title}
      </h2>
    </div>
  );

  return (
    <motion.div
      style={{
        x: shouldReduceMotion ? 0 : translate,
      }}
      whileHover={shouldReduceMotion ? undefined : { y: -20 }}
      key={product.title}
      className="group/product h-96 w-120 relative shrink-0 flex items-center justify-center"
    >
      {isExternalHref(product.link) ? (
        <a
          href={product.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block group-hover/product:shadow-2xl relative max-h-full max-w-full"
        >
          {cardBody}
        </a>
      ) : (
        <Link
          // `product.link` is `string` by the preserved `{ title, link,
          // thumbnail }` prop contract, because it holds either an external
          // URL or an internal route and no single `Route` type covers both.
          // So `typedRoutes` cannot verify it structurally here, and this cast
          // genuinely waives that protection for internal hero links.
          //
          // What replaces it is `lib/content/invariants.ts`'s
          // `checkInternalLinksResolve`, which fails the production build when
          // an internal hero link is not a live target. NOT
          // `checkNoSelfReferentialLinks` — that one only catches a link equal
          // to `/` or `/{locale}`, which is a different property entirely.
          href={product.link as Route}
          className="inline-block group-hover/product:shadow-2xl relative max-h-full max-w-full"
        >
          {cardBody}
        </Link>
      )}
    </motion.div>
  );
};
