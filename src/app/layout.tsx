import type { Metadata } from "next";
import { Inter, Anton } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";
import { siteConfig } from "@/config/site";
import { getSiteContent } from "@/lib/content";
import { SiteContentProvider } from "@/components/SiteContentProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--font-anton" });

export async function generateMetadata(): Promise<Metadata> {
  const { tagline } = await getSiteContent();
  return {
    title: `${siteConfig.name} | ${siteConfig.subtitle}`,
    description: tagline || siteConfig.description,
    keywords: ["entrenamiento online", "fitness", "salud", "personal trainer", "rutinas", "Pablo Asorey", "crossfit", "gym"],
    openGraph: {
      title: `${siteConfig.name} - ${siteConfig.subtitle}`,
      description: tagline || siteConfig.description,
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
      description: tagline || siteConfig.description,
      images: [siteConfig.logo],
    },
    icons: {
      icon: "/icon.jpeg", // El favicon principal (el logo cuadrado que acabas de subir)
      apple: "/icon.jpeg", // Para dispositivos Apple
    },
  };
}

import { ThemeProvider } from "@/components/ThemeProvider";
import ToasterHost from "@/components/ToasterHost";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = await getSiteContent();

  return (
    <html lang="es" suppressHydrationWarning className={`${inter.variable} ${anton.variable}`}>
      <body className="flex flex-col min-h-screen font-sans">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} enableColorScheme={false}>
          <ToasterHost />
          <SiteContentProvider content={content}>
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
          </SiteContentProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
