"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const path = pathname?.toLowerCase() || "";
  const isAdminPath = path.startsWith("/admin");
  const isStudentPath = path.startsWith("/student");
  const isLoginPath = path.startsWith("/login");
  const isAplicarPath = path.startsWith("/aplicar");

  if (isAdminPath) {
    return <>{children}</>;
  }

  const hideUiElements = isStudentPath || isLoginPath || isAplicarPath;

  return (
    <>
      {!hideUiElements && <Navbar />}
      <main className="flex-grow">
        {children}
      </main>
      {!hideUiElements && <Footer />}
      {!hideUiElements && <FloatingWhatsApp />}
    </>
  );
}
