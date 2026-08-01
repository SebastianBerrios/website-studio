/**
 * Real case-study prose for `blu` (Blu Café's internal management system),
 * PR 5's second published write-up. Built strictly from the user's own
 * words — "Igual lo hicimos desde cero, antes registraban todo en un Excel y
 * le hicimos una app que reemplace el Excel y haga más cosas." — plus VERIFIED
 * facts read directly from the `blu` repository's own manifest and module
 * tree this session.
 *
 * No headcount, error count, or time-saved figure is stated because none was
 * supplied or measured. The reasoning below is about the SHAPE of the
 * problem a spreadsheet-to-application migration creates (data integrity,
 * concurrent access, auditability) — not about a specific, unmeasured
 * outcome. See `specs/case-study/spec.md`, "No Invented Metric".
 */
import type { ApproachContent } from "./loader";

export const approach: ApproachContent["approach"] = {
  es: "Reemplazar una hoja de cálculo por una aplicación de gestión no es solo \"lo mismo pero con botones\": cambia el tipo de problema que hay que resolver. Un Excel compartido no impone ninguna estructura — cualquiera puede escribir cualquier cosa en cualquier celda, no queda registro de quién cambió qué ni cuándo, y dos personas editando el mismo archivo a la vez terminan sobrescribiéndose sin darse cuenta. El enfoque partió de tratar esos tres problemas como el núcleo del encargo, no como detalles técnicos secundarios. Integridad de los datos: cada área del negocio (categorías, productos, ingredientes, recetas, ventas, inventario, compras, finanzas) pasó a ser un módulo propio del sistema, en vez de columnas sueltas de una misma hoja. Esa separación es la que permite que cada área tenga sus propias reglas, en lugar de depender de que quien escriba en la celda recuerde cuáles son. Acceso concurrente: al ser una aplicación con backend en vez de un archivo local, varias personas pueden operar el sistema a la vez sin pisarse el trabajo, algo que un archivo Excel compartido no puede garantizar por diseño. Auditoría: se incluyó un módulo de auditoría y registro de actividades explícitamente porque un Excel no deja rastro de quién cambió un precio o borró una fila; un sistema que reemplaza esa hoja tiene que poder responder esa pregunta, o no resuelve el problema real que tenía el cliente. El resto de módulos — usuarios y permisos, horarios, estadísticas — sigue la misma lógica: cada uno existe porque una hoja de cálculo obliga a resolverlo a mano, y una aplicación puede resolverlo como parte de la estructura del sistema en lugar de como un proceso manual paralelo.",
};
