import type { Metadata, Viewport } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";

import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { ListingsProvider } from "@/components/providers/listings-provider";
import { UserStoreProvider } from "@/components/providers/user-store-provider";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} — Manchester cinema screenings`,
    template: `%s · ${APP_NAME}`,
  },
  description: APP_TAGLINE,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1c1917",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full overflow-x-hidden antialiased`}
    >
      <body className="flex min-h-full flex-col overflow-x-hidden">
        <UserStoreProvider>
          <ListingsProvider>
            <Header />
            <main className="mx-auto w-full min-w-0 max-w-6xl flex-1 px-3 pt-5 sm:px-4 sm:pt-6 md:px-6">
              {children}
            </main>
            <SiteFooter />
            <MobileNav />
          </ListingsProvider>
        </UserStoreProvider>
      </body>
    </html>
  );
}
