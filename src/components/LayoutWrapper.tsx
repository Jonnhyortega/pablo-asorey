"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPath = pathname?.startsWith("/admin");
  const isStudentPath = pathname?.startsWith("/student");

  if (isAdminPath) {
    return <>{children}</>;
  }

  return (
    <>
      {!isStudentPath && <Navbar />}
      <main className="flex-grow">
        {children}
      </main>
      {!isStudentPath && <Footer />}
      {!isStudentPath && <FloatingWhatsApp />}
    </>
  );
}
