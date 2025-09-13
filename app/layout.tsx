import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import NotificationPermissionHandler from "@/components/NotificationPermissionHandler";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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
    <html lang="es" className="dark" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" id="theme-color-meta" content="#030712" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen touch-manipulation transition-colors duration-300`}
      >
        <NotificationPermissionHandler />
        <Navigation />
        <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8 max-w-7xl">
          {children}
        </main>
      </body>
    </html>
  );
}
