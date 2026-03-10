import type { Metadata } from "next";
import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `${siteConfig.name} | ${siteConfig.subtitle}`,
  description: siteConfig.tagline || siteConfig.description,
  keywords: ["entrenamiento online", "fitness", "salud", "personal trainer", "rutinas", "Pablo Asorey", "crossfit", "gym"],
  openGraph: {
    title: `${siteConfig.name} - ${siteConfig.subtitle}`,
    description: siteConfig.tagline || siteConfig.description,
    url: "https://pabloasorey.com", // Puedes reemplazar luego con tu dominio real
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.logo, // Usando el logo u otra imagen destacada como OG image
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} - ${siteConfig.subtitle}`,
    description: siteConfig.tagline || siteConfig.description,
    images: [siteConfig.logo],
  },
  icons: {
    icon: "/icon.jpeg", // El favicon principal (el logo cuadrado que acabas de subir)
    apple: "/icon.jpeg", // Para dispositivos Apple
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="flex flex-col min-h-screen">
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}
