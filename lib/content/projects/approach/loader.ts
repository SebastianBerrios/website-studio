/**
 * The long-prose ("approach") loader — the MDX seam.
 *
 * See `openspec/changes/dev-services-website/design.md` D9, "Prose
 * isolation — the MDX seam", and task 2.10. `Project` (PR 2a's
 * `lib/content/types.ts`) deliberately holds no long prose field; it is
 * resolved separately here so that swapping the storage mechanism (e.g. for
 * MDX/`velite`) later changes only this file's body, never any call site.
 *
 * The signature is `async` TODAY even though today's implementation is a
 * static module map — an MDX implementation would also be async, so making
 * this synchronous now would leak the current storage choice into every
 * consumer.
 */

import "server-only";
import type { Localized } from "@/lib/content/types";
import type { ProjectSlug } from "../index";

export type ApproachContent = {
  /** Long-form "how we built it" narrative. Short fields (`summary`,
   * `problem`, `role`, `outcome`) stay on `Project` itself — see design.md
   * §5. */
  readonly approach: Localized<string>;
};

/**
 * Resolves a project's long-form approach narrative by slug.
 *
 * Every module behind this loader is honestly a `[PENDIENTE]` placeholder
 * today (task 2.10) — no real case-study narrative has been supplied by the
 * user yet, not even for Luang or Blu Café (PR 5's first two write-ups).
 */
export async function getProjectApproach(
  slug: ProjectSlug,
): Promise<ApproachContent> {
  switch (slug) {
    case "luang":
      return import("./luang");
    case "atemporal":
      return import("./atemporal");
    case "blucafe":
      return import("./blucafe");
    case "blu":
      return import("./blu");
    case "fast-route":
      return import("./fast-route");
    case "blu-biolink":
      return import("./blu-biolink");
    case "wedding-invitation-piero":
      return import("./wedding-invitation-piero");
    default: {
      const exhaustiveCheck: never = slug;
      throw new Error(`No approach module for slug: ${String(exhaustiveCheck)}`);
    }
  }
}
