import Link from "next/link";
import { WHATSAPP } from "@/lib/content/contact";
import { getDictionary } from "@/lib/dictionaries";
import { assertLocale } from "@/lib/content/locales";
import { canonicalFor } from "@/lib/seo";
import type { Metadata } from "next";

/**
 * The brief form's confirmation route. Task 6.8.
 *
 * Static, reads no `searchParams`, and NEVER echoes submitted input
 * (design.md §9's "the honest cost of choosing email" / §2 layer 4's
 * reflected-input hardening) — this page receives only `params` (the
 * locale). There is no code path by which any submitted `Brief` field could
 * reach this component, by construction, not merely by discipline.
 *
 * Reachable directly without having submitted anything (design.md §9), so
 * `gracias.body` reads sensibly standalone and does NOT claim a submission
 * was just received.
 *
 * **Documented deviation from design.md §9's literal text** ("restates the
 * response-time commitment"): no response-time commitment has been settled
 * for lead intake. `RETAINER_COMMITMENTS.responseWindow` (`lib/content/
 * retainer.ts`) is a different commitment for a different phase of the
 * relationship — post-launch maintenance response times, not how fast the
 * studio replies to a new brief — and does not belong here. This batch's
 * hard constraints forbid inventing a reply-speed claim, so this page states
 * only that the brief will be reviewed, with WhatsApp offered as the
 * immediate-conversion path for anyone who wants to skip the wait.
 *
 * `robots: { index: false, follow: false }` and excluded from `app/
 * sitemap.ts` (task 6.9, confirmed — that file's cross-product never emits
 * a `gracias` entry) — a confirmation page has nothing for a search engine
 * to rank.
 */
export const dynamic = "force-static";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    alternates: { canonical: canonicalFor(assertLocale(locale), "gracias") },
    robots: { index: false, follow: false },
  };
}

export default async function GraciasPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const validLocale = assertLocale(locale);
  const { gracias } = getDictionary(validLocale);

  return (
    <main className="py-24 md:py-32">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <h1 className="text-3xl font-medium tracking-tight md:text-5xl">
          {gracias.heading}
        </h1>
        <p className="mt-4 text-base text-muted-foreground">{gracias.body}</p>
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          {WHATSAPP.status === "set" ? (
            <a
              href={WHATSAPP.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-full border border-border px-6 py-3 text-sm font-medium"
            >
              {gracias.whatsappCtaLabel}
            </a>
          ) : null}
          <Link
            href={`/${validLocale}`}
            className="inline-flex items-center rounded-full border border-border px-6 py-3 text-sm font-medium"
          >
            {gracias.backToHomeLabel}
          </Link>
        </div>
      </div>
    </main>
  );
}
