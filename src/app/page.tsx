import { Hero } from "@/components/sections/hero";
import { TechniqueMarquee } from "@/components/sections/marquee";
import { Services } from "@/components/sections/services";
import { Techniques } from "@/components/sections/techniques";
import { Works } from "@/components/sections/works";
import { Statement } from "@/components/sections/statement";
import { ClubPortal } from "@/components/sections/club-portal";
import { News } from "@/components/sections/news";
import { ShopPreview } from "@/components/sections/shop-preview";
import { Branches } from "@/components/sections/branches";
import { getContent } from "@/lib/content";

export default async function Home() {
  const { services, news, products } = await getContent();
  return (
    <>
      <Hero />
      <TechniqueMarquee />
      <Services services={services} />
      <Techniques />
      <Works />
      <Statement />
      <ClubPortal />
      <News news={news} />
      <ShopPreview products={products} />
      <Branches />
    </>
  );
}
