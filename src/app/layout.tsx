import type { Metadata, Viewport } from "next";
import { Big_Shoulders, Barlow, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { GSAPProvider } from "@/providers/gsap-provider";
import { LenisProvider } from "@/providers/lenis-provider";
import { SpeedInsights } from "@vercel/speed-insights/next";

const bigShoulders = Big_Shoulders({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  preload: true,
});

const barlow = Barlow({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
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
  themeColor: "#08080A",
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
        className={`${barlow.variable} ${bigShoulders.variable} ${jetbrains.variable} font-sans antialiased text-foreground bg-background selection:bg-primary/20 selection:text-primary max-w-full overflow-x-hidden relative`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark">
          <GSAPProvider>
            <LenisProvider>
              <div className="fixed inset-0 z-[-1] bg-noise mix-blend-multiply opacity-50" aria-hidden="true" />
              {children}
              <SpeedInsights />
            </LenisProvider>
          </GSAPProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
