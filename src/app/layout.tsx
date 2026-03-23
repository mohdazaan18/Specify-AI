import type { Metadata } from "next";
import { Inter, Space_Grotesk, Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/providers/AuthProvider";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});


// Display & Body Font
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Technical & Data Font
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Intelligent Workspace",
  description: "High-cognitive load workspace for technical precision.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      /* We apply the CSS variables here so the @theme can find them */
      className={cn("h-full", "antialiased", inter.variable, spaceGrotesk.variable, "font-sans", geist.variable)}
    >
      {/* Using bg-surface (Foundation) instead of pure black.
          text-content ensures it's readable but not blinding.
      */}
      <body className="min-h-full flex flex-col bg-surface text-content">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}