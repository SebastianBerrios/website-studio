/**
 * ElectroCode Academy authority block.
 *
 * See `openspec/changes/dev-services-website/specs/trust-signals/spec.md`
 * ("Academy No-Link State While Undeployed", "Academy No-Scale-Claim
 * Constraint", "Academy Upgrade Condition") and design.md §5.
 *
 * The `url` field exists ONLY on the `linked` variant, so a clickable
 * anchor is structurally impossible while `state` is `no-link` — the
 * component can only render a link by narrowing into a branch that does not
 * exist yet. There is deliberately no field anywhere on this type for a
 * student count, course count, or review figure: the academy block cannot
 * claim scale because the type gives it nothing to claim it with.
 *
 * Set to `no-link`: the academy's repository is private and its deployment
 * returns 404 (VERIFIED — see exploration.md §4.2/§4.4). There is no live
 * URL to publish. `media` stays empty because no local capture of the
 * academy exists in this repo's `public/` yet (blocked on task 3.H1);
 * inventing a static import path for a file that does not exist would be a
 * build error, not an honest placeholder.
 */

import type { Localized, MediaAsset } from "./types";

export type Authority =
  | {
      readonly state: "no-link";
      readonly name: string;
      readonly description: Localized<string>;
      readonly media: readonly MediaAsset[];
    }
  | {
      readonly state: "linked";
      readonly name: string;
      readonly description: Localized<string>;
      readonly media: readonly MediaAsset[];
      readonly url: string;
    };

export const ACADEMY: Authority = {
  state: "no-link",
  name: "ElectroCode Academy",
  description: {
    es: "Plataforma propia de cursos de programación y electrónica. El repositorio es privado y su despliegue no está disponible públicamente en este momento.",
  },
  media: [],
};
