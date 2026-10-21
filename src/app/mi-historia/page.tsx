import HistoriaTimeline from "@/components/HistoriaTimeline";

export const metadata = {
  title: "Mi Historia | Pablo Asorey",
  description: "Conocé la historia de Pablo Asorey, desde sus inicios hasta el presente.",
};

export default function MiHistoriaPage() {
  return (
    <div className="min-h-screen bg-bg pt-16 md:pt-20">
      <HistoriaTimeline />
    </div>
  );
}
