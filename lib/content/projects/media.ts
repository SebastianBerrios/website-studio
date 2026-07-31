/**
 * Local project media, keyed by asset id.
 *
 * See `openspec/changes/dev-services-website/design.md` D9/§8 and task 2.9.
 * Every asset is a static `import`, never a string path — a missing file is
 * a **build error** instead of a silent runtime 404 (the same class of bug
 * as the `/portfolio` defect fixed in PR 1, applied to images).
 *
 * Only assets that exist under `public/projects/` AND are cleared for
 * publication are imported here. No entry is added for a project without a
 * captured, consented asset — see `lib/content/projects/index.ts` for how
 * those honestly render as `evidence.state: "no-visual"` instead.
 *
 * `blucafefinance.png` was removed from this map — and from disk — by the
 * `fix/content-honesty` remediation slice. It was never a login screen: it
 * is the authenticated `blu` back-office dashboard, naming the client
 * repeatedly (sidebar logo, "Bienvenido a Blu Café" heading, full nav
 * tree). Consent to publish any capture of that back-office is still open
 * (task 3.H2). See `sdd/dev-services-website/verify-report.md` finding C1.
 */

import type { MediaAsset } from "@/lib/content/types";
import luang from "@/public/projects/luang.png";
import atemporal from "@/public/projects/atemporal.png";
import blucafe from "@/public/projects/blucafe.png";

export const MEDIA = {
  luang: {
    asset: luang,
    alt: {
      es: "Captura de pantalla de la página de inicio del sitio de Luang Asociados SAC",
    },
  },
  atemporal: {
    asset: atemporal,
    alt: {
      es: "Captura de pantalla de la página de inicio del sitio de Atemporal Studio",
    },
  },
  blucafe: {
    asset: blucafe,
    alt: {
      es: "Captura de pantalla de la página de inicio del sitio público de Blu Café",
    },
  },
} as const satisfies Record<string, MediaAsset>;

export type MediaId = keyof typeof MEDIA;
