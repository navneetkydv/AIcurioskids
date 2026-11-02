import { Fraunces, DM_Sans, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import CookieConsent from "@/components/CookieConsent";
import { UTMCapture } from "@/components/UTMCapture";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  weight: ["500", "600", "700"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  variable: "--font-noto-devanagari",
  display: "swap",
  weight: ["400", "500", "600"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "[Brand Name] | Think. Create. Build with AI.",
    template: "%s | [Brand Name]",
  },
  description:
    "A 4-week live online AI course for Class 5-8 students. Learn how AI works, ask better questions, and use it safely. Complete workbook included free.",
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "[Brand Name]",
    title: "[Brand Name] | Think. Create. Build with AI.",
    description:
      "A 4-week live online AI course for Class 5-8 students. Complete workbook included free.",
  },
  twitter: {
    card: "summary_large_image",
    title: "[Brand Name] | Think. Create. Build with AI.",
    description:
      "A 4-week live online AI course for Class 5-8 students. Complete workbook included free.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  themeColor: "#1F2A5C",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${dmSans.variable} ${notoDevanagari.variable}`}
    >
      <body className="min-h-screen flex flex-col antialiased">
        <UTMCapture />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppFloat />
        {/* <CookieConsent /> */}
      </body>
    </html>
  );
}
