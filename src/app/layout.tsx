import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Sans } from "next/font/google";
import { AppNav } from "@/components/app-nav";
import { PwaRegistration } from "@/components/pwa-registration";
import "./globals.css";

const headingFont = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
});

const bodyFont = IBM_Plex_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://domestiq.soulvest.ai"),
  title: "DomestiQ AI",
  description: "AI-powered home cleaning orchestration for smarter routines, reminders, and family coordination.",
  manifest: "/manifest.webmanifest",
  applicationName: "DomestiQ AI",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "DomestiQ AI",
    description: "AI-powered home cleaning orchestration for smarter routines, reminders, and family coordination.",
    url: "https://domestiq.soulvest.ai",
    siteName: "DomestiQ AI",
    type: "website",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DomestiQ AI",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.svg", type: "image/svg+xml" },
      { url: "/icons/icon-512.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.svg", type: "image/svg+xml" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${headingFont.variable} ${bodyFont.variable}`}>
        <PwaRegistration />
        <div className="app-shell">
          {children}
          <AppNav />
        </div>
      </body>
    </html>
  );
}