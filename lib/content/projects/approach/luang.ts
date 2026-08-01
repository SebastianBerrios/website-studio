/**
 * Real case-study prose for Luang Asociados SAC, PR 5's first published
 * write-up.
 *
 * Sources, and nothing else:
 * 1. The user's own words — "No tenía una web, se la hicimos desde cero, lo
 *    querían para mostrar sus proyectos y darse a conocer."
 * 2. `evidence.externalUrl` being a VERIFIED live site.
 * 3. The client's own description of their sector, read from luang.com.pe on
 *    2026-07-31: "Ofrecemos ingeniería básica y de detalle, gestión de
 *    proyectos y construcción en el sector minero."
 *
 * CORRECTION, 2026-07-31. An earlier version of this file described Luang as
 * "un estudio de arquitectura" and claimed in this very comment that it was
 * "built strictly from the user's own words". Both were false. The word
 * "arquitectura" entered through the orchestrator's own launch prompt, which
 * had confused Luang with Atemporal Studio (atemporalarq.com) — that one IS an
 * architecture practice. Luang is a mining-sector engineering and construction
 * firm, and the screenshot this very case study publishes shows earth-moving
 * equipment on a mine site. The error was visible in the page's own image and
 * survived to a published write-up about a named client.
 *
 * The lesson worth keeping: a claim inherited from an instruction feels as
 * settled as one that was checked. It is not. Anything about a real client
 * gets read off their site before it is written here.
 *
 * No prior client history is stated (how they found clients before, how they
 * felt about it) because none was supplied. No metric, percentage, or
 * duration is stated because none exists or was measured — see
 * `specs/case-study/spec.md`, "No Invented Metric".
 */
import type { ApproachContent } from "./loader";

export const approach: ApproachContent["approach"] = {
  es: "Construir un sitio para una firma de ingeniería y construcción que no tenía ninguna presencia web previa es, ante todo, un problema de qué mostrar primero y en qué orden — no hay un sitio anterior del que partir, ni un patrón de uso existente que oriente la decisión. El objetivo que planteó el cliente fue concreto: mostrar sus proyectos y darse a conocer. La estructura del sitio se organizó alrededor de esa prioridad, no de una lista genérica de secciones tomada de cualquier plantilla. El proyecto se construyó de cero — diseño visual, estructura de navegación y desarrollo completo — sin heredar ni adaptar ninguna plataforma previa del cliente, porque no existía ninguna. El resultado es un sitio en producción, accesible públicamente en luang.com.pe, que le da a Luang Asociados SAC el canal de presencia digital que antes no tenía.",
};
