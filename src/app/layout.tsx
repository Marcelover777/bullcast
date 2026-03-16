import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { GSAPProvider } from "@/providers/gsap-provider";
import { LenisProvider } from "@/providers/lenis-provider";
import { SpeedInsights } from "@vercel/speed-insights/next";

// Fonts loaded via <link> at runtime (avoids build-time Google Fonts fetch)
const FONT_URLS = [
  "https://fonts.googleapis.com/css2?family=Big+Shoulders:wght@400;500;600;700;800&display=swap",
  "https://fonts.googleapis.com/css2?family=Barlow:wght@300;400;500;600;700&display=swap",
  "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap",
];

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
  icons: {
    apple: "/apple-touch-icon.png",
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {FONT_URLS.map((url) => (
          <link key={url} rel="stylesheet" href={url} />
        ))}
      </head>
      <body
        className="font-sans antialiased text-foreground bg-background selection:bg-primary/20 selection:text-primary max-w-full overflow-x-hidden relative"
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
