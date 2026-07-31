import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  async redirects() {
    return [
      // `/` never breaks: the only URL that exists in the wild before this
      // slice ships. See design.md D2.
      { source: "/", destination: "/es", permanent: false },
      // Known unprefixed paths a human might guess or have bookmarked. Their
      // destinations do not exist yet in this PR (precios ships PR 4,
      // gracias/proyectos ship PR 4/PR 5 respectively) — they will resolve
      // once those slices land, per `stacked-to-main`. See design.md D2.
      { source: "/precios", destination: "/es/precios", permanent: false },
      { source: "/gracias", destination: "/es/gracias", permanent: false },
      {
        source: "/proyectos/:slug",
        destination: "/es/proyectos/:slug",
        permanent: false,
      },
      // The URL that has been 404ing in production — may exist in a
      // browser history or a search index. Redirect it, do not leave it
      // dead. See design.md D2.
      { source: "/portfolio", destination: "/es#proyectos", permanent: false },
      // Bare `/es/proyectos` (no slug) redirects to the landing's portfolio
      // anchor instead of 404ing. See specs/site-shell/spec.md, "Bare
      // projects index redirects instead of 404s".
      {
        source: "/:locale(es)/proyectos",
        destination: "/:locale#proyectos",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
