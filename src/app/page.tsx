import Hero from "@/components/Hero";
import VideoSection from "@/components/VideoSection";
import EntrenaSection from "@/components/EntrenaSection";
import FeaturesSection from "@/components/FeaturesSection";
import PlanesSection from "@/components/PlanesSection";
import ValoresSection from "@/components/ValoresSection";
import AntesDespuesSection from "@/components/AntesDespuesSection";
import UniteAhoraSection from "@/components/UniteAhoraSection";
import CasoExitoSection from "@/components/CasoExitoSection";
import ContactSection from "@/components/ContactSection";

export default function Home() {
  return (
    <main>
      <Hero />
      <VideoSection />
      <EntrenaSection />
      <FeaturesSection />
      <PlanesSection />
      <ValoresSection />
      <AntesDespuesSection />
      <ContactSection />
      <UniteAhoraSection />
      {/* <CasoExitoSection /> */}
    </main>
  );
}
