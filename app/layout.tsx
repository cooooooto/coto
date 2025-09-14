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
  title: "Dev Project Tracker",
  description: "Track your full-stack development projects with ease",
  manifest: "/manifest.json",
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
    title: "Dev Project Tracker",
    description: "Track your full-stack development projects with ease",
  },
  twitter: {
    card: "summary",
    title: "Dev Project Tracker", 
    description: "Track your full-stack development projects with ease",
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
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
        <meta name="theme-color" id="theme-color-meta" content="#030712" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="robots" content="noindex, nofollow" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                // Force dark theme only
                document.documentElement.classList.add('dark');
              } catch (e) {
                console.warn('Error initializing theme:', e);
              }
            `,
          }}
        />
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
