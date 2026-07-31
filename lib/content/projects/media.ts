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
 * `blu`'s back-office capture (`blucafefinance.png`) was removed by the
 * `fix/content-honesty` remediation slice pending consent, and restored by
 * the `fix/restore-consented-content` slice once the client authorized its
 * use (session-dated user-stated consent, not a signed agreement — see
 * `lib/content/projects/index.ts`). It is the AUTHENTICATED `blu` back-office
 * dashboard (sidebar logo, "Bienvenido a Blu Café" heading, full nav tree),
 * never a login screen — `alt` below describes it accurately.
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
  blu: {
    asset: blucafefinance,
    alt: {
      es: "Captura de pantalla del panel administrativo autenticado de Blu Café: pantalla de bienvenida con el logo del cliente y el menú lateral de Categorías, Productos, Ingredientes, Recetas y Ventas — mostrada con autorización del cliente",
    },
  },
} as const satisfies Record<string, MediaAsset>;

export type MediaId = keyof typeof MEDIA;
