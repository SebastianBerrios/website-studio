/**
 * Local project media, keyed by asset id.
 *
 * See `openspec/changes/dev-services-website/design.md` D9/§8 and task 2.9.
 * Every asset is a static `import`, never a string path — a missing file is
 * a **build error** instead of a silent runtime 404 (the same class of bug
 * as the `/portfolio` defect fixed in PR 1, applied to images).
 *
 * Exactly the four files that exist today under `public/projects/` are
 * imported here. No entry is added for a project without a captured asset —
 * see `lib/content/projects/index.ts` for how those honestly render as
 * `evidence.state: "no-visual"` instead.
 */

import type { MediaAsset } from "@/lib/content/types";
import luang from "@/public/projects/luang.png";
import atemporal from "@/public/projects/atemporal.png";
import blucafe from "@/public/projects/blucafe.png";
import blucafefinance from "@/public/projects/blucafefinance.png";

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
  blucafefinance: {
    asset: blucafefinance,
    alt: {
      es: "Captura de la pantalla de inicio de sesión del sistema de back-office protegido",
    },
  },
} as const satisfies Record<string, MediaAsset>;

export type MediaId = keyof typeof MEDIA;
