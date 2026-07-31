"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  MotionValue,
} from "motion/react";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { isExternalHref } from "@/lib/links";

// A row of 5+ cards overflows every viewport, which is what makes the
// parallax slide read as motion instead of dragging a short row through
// empty space (see design.md D4). Below this count a single row is used.
const SINGLE_ROW_MAX = 4;

export const HeroParallax = ({
  products,
}: {
  products: {
    title: string;
    link: string;
    thumbnail: string;
  }[];
}) => {
  const splitAt =
    products.length <= SINGLE_ROW_MAX
      ? products.length
      : Math.ceil(products.length / 2);
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
      <Header />
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

export const Header = () => {
  return (
    <div className="max-w-7xl relative mx-auto py-20 md:py-40 px-4 w-full  left-0 top-0">
      <h1 className="text-2xl md:text-7xl font-bold dark:text-white">
        Tu proyecto es único, <br /> tu web también
      </h1>
      <p className="max-w-2xl text-base md:text-xl mt-8 dark:text-neutral-200">
        Tu negocio merece más que una plantilla aburrida. Diseñamos webs únicas,
        flexibles y listas para atraer clientes. Tú pones la idea, nosotros la
        magia.
      </p>
      <div className="mt-4">
        <HoverBorderGradient
          containerClassName="rounded-full"
          as="button"
          href="/#proyectos"
          className=" dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2"
        >
          <span>Explora nuestros proyectos</span>
        </HoverBorderGradient>
      </div>
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
          href={product.link}
          className="inline-block group-hover/product:shadow-2xl relative max-h-full max-w-full"
        >
          {cardBody}
        </Link>
      )}
    </motion.div>
  );
};
