import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NotificationPermissionHandler from "@/components/NotificationPermissionHandler";
import ErrorBoundary from "@/components/ErrorBoundary";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dev Project Tracker - Gestor de Proyectos Full-Stack",
  description: "Tracker intuitivo y moderno para gestionar proyectos de desarrollo full-stack con fases, tareas y deadlines. Construido con Next.js 15.",
  keywords: ["project tracker", "desarrollo full-stack", "gestión proyectos", "Next.js", "TypeScript"],
  authors: [{ name: "Dev Project Tracker" }],
  creator: "Dev Project Tracker",
  publisher: "Dev Project Tracker",
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Dev Project Tracker",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Dev Project Tracker",
    title: "Dev Project Tracker - Gestor de Proyectos Full-Stack",
    description: "Tracker intuitivo y moderno para gestionar proyectos de desarrollo full-stack con fases, tareas y deadlines.",
    locale: "es_ES",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dev Project Tracker",
    description: "Tracker intuitivo y moderno para gestionar proyectos de desarrollo full-stack.",
    creator: "@devprojecttracker",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#030712" />
        <meta name="color-scheme" content="dark" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Dev Project Tracker" />
        <meta name="application-name" content="Dev Project Tracker" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased min-h-screen transition-colors duration-300`}
      >
        <ErrorBoundary>
          <NotificationPermissionHandler />
          <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8 max-w-7xl">
            {children}
          </main>
        </ErrorBoundary>
      </body>
    </html>
  );
}
