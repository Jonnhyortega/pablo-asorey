import Hero from "@/components/Hero";
import AsesoriaSection from "@/components/AsesoriaSection";
import FeaturesSection from "@/components/FeaturesSection";
import AntesDespuesSection from "@/components/AntesDespuesSection";
import PlanesSection from "@/components/PlanesSection";
import ValoresSection from "@/components/ValoresSection";
import ContactSection from "@/components/ContactSection";
import UniteAhoraSection from "@/components/UniteAhoraSection";

export default function Home() {
  return (
    <main>
      <Hero />
      <AsesoriaSection />
      <FeaturesSection />
      <AntesDespuesSection />
      <PlanesSection />
      <ValoresSection />
      <ContactSection />
      <UniteAhoraSection />
      {/* <CasoExitoSection /> */}
    </main>
  );
}
