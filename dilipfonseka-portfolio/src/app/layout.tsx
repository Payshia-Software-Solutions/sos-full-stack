import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const inter = Inter({ variable: "--font-sans", subsets: ["latin"] });
const outfit = Outfit({ variable: "--font-heading", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dilip Fonseka | Pharmaceutical Educator & Institution Builder",
  description: "Official portfolio of H M Dilip Kumara Fonseka — Founder & Managing Director of Ceylon Pharma College, author of 'Rising Above Challenges for Success', and award-winning pioneer in pharmaceutical education in Sri Lanka.",
  keywords: ["Dilip Fonseka", "Ceylon Pharma College", "Pharmacist Sri Lanka", "Pharmaceutical Educator", "Rising Above Challenges for Success", "Asia Awards 2024"],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} h-full antialiased scroll-smooth`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans transition-colors duration-300">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
