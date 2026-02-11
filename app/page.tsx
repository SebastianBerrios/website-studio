import { HeroParallax } from "@/components/ui/hero-parallax";

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
      link: "/",
      thumbnail: "/projects/blucafefinance.png",
    },
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
      link: "/",
      thumbnail: "/projects/blucafefinance.png",
    },
    {
      title: "Luang Asociados SAC",
      link: "https://luang.com.pe/",
      thumbnail: "/projects/luang.png",
    },
  ];

  return (
    <>
      <HeroParallax products={products} />
    </>
  );
}
