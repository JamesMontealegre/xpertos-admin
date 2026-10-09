import type { Metadata } from "next";
import { Geist_Mono, Mulish } from "next/font/google";
import { Suspense } from "react";
import { NavigationLoader } from "@/components/navigation-loader";
import { VersionWatcher } from "@/components/version-watcher";
import "./globals.css";

// Mulish como fuente variable (pesos 400–900 en un solo archivo).
const mulish = Mulish({
  variable: "--font-mulish",
  subsets: ["latin"],
  weight: "variable",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Xpertos · Panel de operación",
    template: "%s · Xpertos",
  },
  description: "Panel del operador de Xpertos: postulaciones, servicios, pagos y contratos.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-CO" className={`${mulish.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">
        {children}
        {/* Loader entre páginas: la X de Xpertos mientras carga la siguiente vista. */}
        <Suspense fallback={null}>
          <NavigationLoader />
        </Suspense>
        {/* Recarga sola cuando se publica una versión nueva (sin perder lo que se esté escribiendo). */}
        <Suspense fallback={null}>
          <VersionWatcher />
        </Suspense>
      </body>
    </html>
  );
}
