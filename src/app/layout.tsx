import type { Metadata, Viewport } from "next";
import { Instrument_Sans } from "next/font/google";
import { SITE } from "@/lib/catalog";
import { siteUrl } from "@/lib/utils";
import "./globals.css";

// One clean, modern sans-serif for headings and body text.
const instrument = Instrument_Sans({ subsets: ["latin"], variable: "--font-instrument", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: `${SITE.name} | Digital Skills, Tech Education and Mentorship in Ghana`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    "digital skills training in Ghana",
    "girls in technology Ghana",
    "women in technology Africa",
    "Microsoft Office training Ghana",
    "Excel training Accra",
    "job readiness training Ghana",
    "artificial intelligence training",
    "AI tools training",
    "career talks for young people",
    "digital literacy programs",
    "technology mentorship",
    "youth digital empowerment",
  ],
  openGraph: {
    type: "website",
    siteName: SITE.name,
    locale: SITE.locale,
    title: `${SITE.name}: ${SITE.tagline}`,
    description: SITE.description,
  },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.BING_SITE_VERIFICATION ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION } : undefined,
  },
};

export const viewport: Viewport = {
  themeColor: "#4338CA",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GH" className={instrument.variable}>
      <body>{children}</body>
    </html>
  );
}
