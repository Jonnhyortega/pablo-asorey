"use client";

import { usePathname } from "next/navigation";
import { Toaster } from "react-hot-toast";

// En los paneles los toasts siguen el tema elegido; en la landing quedan oscuros
export default function ToasterHost() {
  const pathname = usePathname() ?? "";
  const inPanel = pathname.startsWith("/admin") || pathname.startsWith("/student") || pathname.startsWith("/login");

  return (
    <Toaster
      position="top-center"
      containerClassName={inPanel ? "toaster-panel" : undefined}
      toastOptions={{
        style: {
          background: "var(--surface)",
          color: "var(--text)",
          border: "1px solid var(--line)",
          borderRadius: 6,
          fontSize: 14,
        },
        iconTheme: { primary: "var(--gold)", secondary: "var(--bg)" },
      }}
    />
  );
}
