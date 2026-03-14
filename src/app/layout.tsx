import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { GSAPProvider } from "@/providers/gsap-provider";
import { LenisProvider } from "@/providers/lenis-provider";

const playfair = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: true,
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
  preload: true,
});

const jetbrains = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  preload: false,
});

export const viewport: Viewport = {
  themeColor: "#F4F3ED",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "BullCast | Inteligência Pecuária",
  description: "Inteligência preditiva para pecuaristas brasileiros.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BullCast",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>)
{
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${playfair.variable} ${jetbrains.variable} font-sans antialiased text-foreground bg-background selection:bg-primary/20 selection:text-primary max-w-full overflow-x-hidden relative`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <GSAPProvider>
            <LenisProvider>
              <div className="fixed inset-0 z-[-1] bg-noise mix-blend-multiply opacity-50" aria-hidden="true" />
              {children}
            </LenisProvider>
          </GSAPProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
