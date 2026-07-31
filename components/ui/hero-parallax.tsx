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
        style={{
          rotateX,
          rotateZ,
          translateY,
          opacity,
        }}
      >
        <motion.div className="flex flex-row-reverse space-x-reverse space-x-20 mb-10">
          {firstRow.map((product) => (
            <ProductCard
              product={product}
              translate={translateX}
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
}: {
  product: {
    title: string;
    link: string;
    thumbnail: string;
  };
  translate: MotionValue<number>;
}) => {
  const cardBody = (
    <div className="relative">
      <Image
        src={product.thumbnail}
        height={600}
        width={600}
        className="object-contain max-h-96 max-w-120"
        alt={product.title}
      />
      <div className="absolute inset-0 opacity-0 group-hover/product:opacity-80 bg-black pointer-events-none"></div>
      <h3 className="absolute bottom-4 left-4 opacity-0 group-hover/product:opacity-100 text-white z-10">
        {product.title}
      </h3>
    </div>
  );

  return (
    <motion.div
      style={{
        x: translate,
      }}
      whileHover={{
        y: -20,
      }}
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
