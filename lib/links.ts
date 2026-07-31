/**
 * Pure link-classification helpers.
 *
 * See `openspec/changes/dev-services-website/design.md` decision D6.
 */

/**
 * Returns `true` when `href` points at an external destination — a URL with
 * an explicit protocol (`https://`, `//`, etc.) or a `mailto:`/`tel:` scheme —
 * and `false` for internal same-origin paths and anchors.
 */
export function isExternalHref(href: string): boolean {
  return (
    /^(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(href) ||
    /^(?:mailto|tel):/i.test(href)
  );
}
