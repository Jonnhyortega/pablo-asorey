import HistoriaTimeline from "@/components/HistoriaTimeline";

export const metadata = {
  title: "Mi Historia | Pablo Asorey",
  description: "Conocé la historia de Pablo Asorey, desde sus inicios hasta el presente.",
};

export default function MiHistoriaPage() {
  return (
    <div className="pt-24 min-h-screen bg-white">
      <HistoriaTimeline />
    </div>
  );
}
