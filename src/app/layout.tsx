import type { Metadata, Viewport } from "next";
import { Caveat, Manrope, Playfair_Display } from "next/font/google";
import { SerProvider } from "@/lib/store";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  style: ["normal", "italic"],
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ser — Study with real people",
  description:
    "Study with real people, not just a timer. Match with study partners, meet offline groups, or focus with an AI guardian.",
};

export const viewport: Viewport = {
  themeColor: "#f4f9f8",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${playfair.variable} ${caveat.variable}`}
    >
      <body className="font-sans antialiased">
        <SerProvider>{children}</SerProvider>
      </body>
    </html>
  );
}
