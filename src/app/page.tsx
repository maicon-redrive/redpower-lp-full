import { Hero } from "@/components/sections/Hero";
import { LavaBackground } from "@/components/sections/LavaBackground";
import { PainIntro } from "@/components/sections/PainIntro";
import { MotiveCards } from "@/components/sections/MotiveCards";
import { WhatIsRedPower } from "@/components/sections/WhatIsRedPower";
import { RedPowerDivider } from "@/components/sections/RedPowerDivider";
import { Journeys } from "@/components/sections/Journeys";
import { Method } from "@/components/sections/Method";
import { Books } from "@/components/sections/Books";
import { AboutDaniel } from "@/components/sections/AboutDaniel";
import { Implementation } from "@/components/sections/Implementation";
import { Pricing } from "@/components/sections/Pricing";
import { Comparison } from "@/components/sections/Comparison";
import { Faq } from "@/components/sections/Faq";
import { Footer } from "@/components/sections/Footer";

export default function Home() {
  return (
    <main className="flex flex-col">
      <div className="relative overflow-hidden bg-[#080808]">
        <LavaBackground />
        <Hero />
        <PainIntro />
      </div>
      <MotiveCards />
      <WhatIsRedPower />
      <RedPowerDivider />
      <Journeys />
      <Method />
      <Books />
      <AboutDaniel />
      <Implementation />
      <Pricing />
      <Comparison />
      <Faq />
      <Footer />
    </main>
  );
}
