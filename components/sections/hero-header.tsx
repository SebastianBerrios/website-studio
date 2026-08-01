import type { Route } from "next";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { getDictionary } from "@/lib/dictionaries";
import { landingAnchor } from "@/lib/links";
import type { Locale } from "@/lib/content/locales";

/**
 * Server Component: renders the hero's title/subtitle/CTA from the active
 * locale's dictionary, passed into `HeroParallax`'s `header` slot
 * (design.md D5, task 2.15). Keeps Spanish copy on the server and out of
 * the client bundle — `HeroParallax` itself stays ignorant of copy shape.
 *
 * **Editorial restyle (feat/editorial-design)**: the heading now renders
 * through `TextGenerateEffect` (`components/ui/text-generate-effect.tsx`,
 * new client component #2 of 3 this slice adds) — the hero's one
 * orchestrated entrance, a staggered word-by-word reveal, per this slice's
 * "high impact in few places" motion budget. This component itself STAYS a
 * Server Component: it renders `<TextGenerateEffect>` (a small, leaf client
 * component) the same way it already renders `<HoverBorderGradient>` — the
 * dictionary read and layout stay on the server, only the reveal mechanism
 * is client-side. Two `<TextGenerateEffect>` instances (one per heading
 * line, matching `HeroDictionary.heading`'s existing two-line tuple) rather
 * than one joined string, so the `<br />` line break survives without
 * teaching the component a line-break syntax it doesn't otherwise need.
 *
 * Typography scale is now deliberately dramatic (`text-6xl`…`text-8xl`
 * Fraunces) with an asymmetric, left-weighted composition (`max-w-3xl` on
 * the subtitle keeps prose narrow while the heading itself is unconstrained)
 * — "editorial claro" reads through scale contrast and restraint, not
 * through decoration.
 */
export function HeroHeader({ locale }: { locale: Locale }) {
  const { hero } = getDictionary(locale);

  return (
    <div className="max-w-7xl relative mx-auto py-20 md:py-36 px-4 w-full left-0 top-0">
      <h1 className="font-display text-5xl font-medium leading-[1.05] tracking-tight text-foreground md:text-7xl lg:text-8xl">
        <TextGenerateEffect words={hero.heading[0]} duration={0.6} />
        <TextGenerateEffect words={hero.heading[1]} duration={0.6} />
      </h1>
      <p className="mt-8 max-w-xl text-base text-muted-foreground md:text-xl">
        {hero.subtitle}
      </p>
      <div className="mt-8">
        <HoverBorderGradient
          containerClassName="rounded-full"
          as="button"
          // `landingAnchor()` returns a plain `string` by contract
          // (lib/links.ts), so `typedRoutes` cannot verify it structurally,
          // and this cast waives that check for the hero CTA's href.
          //
          // Unlike `product.link as Route` in `hero-parallax.tsx`, this cast
          // has NO compensating build-time control. `lib/content/
          // invariants.ts`'s `checkNoSelfReferentialLinks` does NOT cover
          // it: that function only inspects `toHeroProducts()` output, and
          // only tests equality with `/` or `/{locale}` — a different
          // property than "does this anchor target actually exist".
          // `checkInternalLinksResolve` has the same blind spot; neither
          // ever sees this component's href. The target is safe TODAY only
          // because `/es#proyectos` is a real anchor —
          // `components/sections/portfolio.tsx` (PR 3a, task 3.4) carries
          // `id="proyectos"` on its section element — verified by reading
          // the two files side by side, not by any gate. (Until PR 3a
          // shipped, this same anchor targeted `HeroParallax`'s products
          // track via its `productsId` prop, the `fix/restore-consented-
          // content` remediation's W2 fix; the anchor moved to the real
          // Proyectos section once it existed, and `HeroParallax` no longer
          // receives `productsId` from `app/[locale]/page.tsx`.) See
          // `sdd/dev-services-website/verify-report.md` finding W1.
          href={landingAnchor(locale, "proyectos") as Route}
          className="flex items-center space-x-2 bg-accent-signal text-accent-signal-foreground"
        >
          <span>{hero.cta}</span>
        </HoverBorderGradient>
      </div>
    </div>
  );
}
