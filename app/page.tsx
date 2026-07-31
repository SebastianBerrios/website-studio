import { HeroParallax } from "@/components/ui/hero-parallax";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export default function Home() {
  const products = [
    {
      title: "Luang Asociados SAC",
      link: "https://luang.com.pe/",
      thumbnail: "/projects/luang.png",
    },
    {
      title: "Atemporal Studio",
      link: "https://www.atemporalarq.com/",
      thumbnail: "/projects/atemporal.png",
    },
    {
      title: "Blu Café",
      link: "https://blucafe.vercel.app/",
      thumbnail: "/projects/blucafe.png",
    },
    {
      title: "Blu Finances",
      // Temporary internal anchor: no case-study route exists yet.
      // Replace with `/es/proyectos/blu` once PR 5 ships the case study.
      link: "/#proyectos",
      thumbnail: "/projects/blucafefinance.png",
    },
  ];

  return (
    <>
      <SiteHeader />
      <div id="proyectos">
        <HeroParallax products={products} />
      </div>
      <SiteFooter />
    </>
  );
}
