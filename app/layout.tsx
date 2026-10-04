import { RootProvider } from "fumadocs-ui/provider/next";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./global.css";

const inter = localFont({
  src: "../public/fonts/inter-variable.ttf",
  display: "swap",
  weight: "100 900",
  variable: "--font-landing",
});

export const metadata: Metadata = {
  title: { default: "Airreload Docs", template: "%s | Airreload Docs" },
  description:
    "Build, install, and hot reload your Flutter Android app over your local network. Get started with Airreload CLI and Airreload Go.",
};

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider theme={{ defaultTheme: "dark" }}>{children}</RootProvider>
      </body>
    </html>
  );
}
