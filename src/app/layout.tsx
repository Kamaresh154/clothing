import type { Metadata } from "next";
import { Geist, Geist_Mono, Cormorant_Garamond, Instrument_Serif } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300","400","500","600","700"],
  display: "swap",
});

const displayAlt = Instrument_Serif({
  variable: "--font-display-alt",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ATELIER NOIR — The New Standard | Men's Luxury Fashion",
  description: "A cinematic men's fashion house. Scroll-controlled runway, Italian fabrics, architectural silhouettes. Obsidian luxury.",
  keywords: ["men's fashion", "luxury menswear", "atelier noir", "editorial fashion", "3D fashion"],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${display.variable} ${displayAlt.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#08080a] text-[#f5f1e8] selection:bg-[#c9b99a] selection:text-[#08080a]">{children}</body>
    </html>
  );
}
