import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/content/locales";

/**
 * Server Component: the pricing page's FAQ block, native `<details>/
 * <summary>`. Task 4.5. **Rejected: Radix/shadcn accordion** per design.md
 * D10 — costs a client boundary + a dependency for something the platform
 * already gives for free, keyboard-operable, no JS required.
 *
 * `specs/pricing/spec.md`'s "FAQ Objection Coverage" names four mandatory
 * objections. Three are answered from settled facts (launch pricing,
 * revision rounds + retainer, retainer cancellation terms — all sourced
 * from `lib/dictionaries/es.ts`'s `pricing.faq`, itself derived from
 * `lib/content/pricing.ts`/`lib/content/retainer.ts`'s real data, never a
 * new invented claim). The fourth, code ownership, has not been supplied
 * this batch — rendered honestly as pending rather than a fabricated policy.
 * See apply-progress.md's open items.
 */
export function Faq({ locale }: { locale: Locale }) {
  const { faq } = getDictionary(locale).pricing;

  const entries: readonly [string, string][] = [
    [faq.priceReasonQuestion, faq.priceReasonAnswer],
    [faq.laterChangesQuestion, faq.laterChangesAnswer],
    [faq.codeOwnershipQuestion, faq.codeOwnershipPendingAnswer],
    [faq.howToLeaveQuestion, faq.howToLeaveAnswer],
  ];

  return (
    <div>
      <h3 className="text-xl font-semibold text-card-foreground">
        {faq.heading}
      </h3>
      <div className="mt-4 divide-y divide-border rounded-xl border border-border bg-card">
        {entries.map(([question, answer]) => (
          <details key={question} className="group p-4">
            <summary className="cursor-pointer list-none text-sm font-medium text-card-foreground">
              {question}
            </summary>
            <p className="mt-2 text-sm text-muted-foreground">{answer}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
